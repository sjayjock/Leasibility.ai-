import { SignJWT } from "jose";

const baseUrl = process.env.STAGING_BASE_URL ?? "https://3000-iermk6jiqaldoot7jnltl-e7872781.us1.manus.computer";

async function mintOwnerSessionCookie() {
  const openId = process.env.STAGING_OPEN_ID ?? process.env.OWNER_OPEN_ID;
  const name = process.env.STAGING_USER_NAME ?? process.env.OWNER_NAME ?? "Staging Validator";
  const appId = process.env.VITE_APP_ID;
  const secret = process.env.JWT_SECRET;
  if (!openId || !appId || !secret) {
    throw new Error("Cannot mint staging session: OWNER_OPEN_ID/STAGING_OPEN_ID, VITE_APP_ID, or JWT_SECRET is missing.");
  }
  const token = await new SignJWT({ openId, appId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000))
    .sign(new TextEncoder().encode(secret));
  return `app_session_id=${token}`;
}

async function trpc(pathName, input, method = "POST") {
  const cookie = await mintOwnerSessionCookie();
  const encodedInput = encodeURIComponent(JSON.stringify({ 0: { json: input ?? null } }));
  const url = method === "GET"
    ? `${baseUrl}/api/trpc/${pathName}?batch=1&input=${encodedInput}`
    : `${baseUrl}/api/trpc/${pathName}?batch=1`;
  const init = {
    method,
    headers: {
      "content-type": "application/json",
      "cookie": cookie,
    },
  };
  if (method !== "GET") init.body = JSON.stringify({ 0: { json: input ?? null } });
  const res = await fetch(url, init);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok || (Array.isArray(data) && data[0]?.error)) {
    throw new Error(`${pathName} failed: HTTP ${res.status} ${JSON.stringify(data)}`);
  }
  return Array.isArray(data) ? data[0]?.result?.data?.json : data;
}

async function main() {
  const requiredEnv = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "VITE_STRIPE_PUBLISHABLE_KEY"];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing Stripe envs: ${missing.join(", ")}`);

  const plans = await trpc("billing.getPlans", null, "GET");
  if (!Array.isArray(plans) || plans.length < 3) {
    throw new Error(`Expected at least 3 billing plans, received ${Array.isArray(plans) ? plans.length : typeof plans}`);
  }

  const session = await trpc("billing.createCheckoutSession", {
    plan: "starter",
    interval: "month",
    origin: baseUrl,
  });

  if (!session?.url || typeof session.url !== "string" || !session.url.startsWith("https://checkout.stripe.com/")) {
    throw new Error(`Checkout session did not return a Stripe Checkout URL: ${JSON.stringify(session)}`);
  }

  const redactedSessionUrl = new URL(session.url);
  console.log(JSON.stringify({
    ok: true,
    checkedAt: new Date().toISOString(),
    baseUrl,
    planCount: plans.length,
    checkoutHost: redactedSessionUrl.host,
    checkoutPathPrefix: redactedSessionUrl.pathname.split("/").slice(0, 3).join("/"),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
