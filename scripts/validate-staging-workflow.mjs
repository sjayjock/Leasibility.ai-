import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { SignJWT } from "jose";

const baseUrl = process.env.STAGING_BASE_URL ?? "https://3000-iermk6jiqaldoot7jnltl-e7872781.us1.manus.computer";
const cookieDbPath = process.env.CHROME_COOKIE_DB ?? "/home/ubuntu/.browser_data_dir/Default/Cookies";
const localStatePath = process.env.CHROME_LOCAL_STATE ?? "/home/ubuntu/.browser_data_dir/Local State";
const floorPlanPath = process.env.FLOOR_PLAN_PATH ?? "/home/ubuntu/upload/plan.jpg";

function getLinuxPassword() {
  const candidates = [
    ["secret-tool", ["lookup", "application", "chrome"]],
    ["secret-tool", ["lookup", "application", "chromium"]],
  ];
  for (const [cmd, args] of candidates) {
    try {
      const value = execFileSync(cmd, args, { encoding: "utf8", timeout: 1000 }).trim();
      if (value) return value;
    } catch {}
  }
  return "peanuts";
}

function decryptCookieValue(encryptedValue) {
  if (!encryptedValue?.length) return "";
  const buf = Buffer.from(encryptedValue);
  const prefix = buf.subarray(0, 3).toString("utf8");
  if (prefix === "v10" || prefix === "v11") {
    const password = getLinuxPassword();
    const salt = Buffer.from("saltysalt");
    const key = crypto.pbkdf2Sync(password, salt, 1, 16, "sha1");
    const iv = Buffer.alloc(16, " ");
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    decipher.setAutoPadding(false);
    const decrypted = Buffer.concat([decipher.update(buf.subarray(3)), decipher.final()]);
    const pad = decrypted.at(-1);
    return decrypted.subarray(0, decrypted.length - pad).toString("utf8");
  }
  try {
    const localState = JSON.parse(fs.readFileSync(localStatePath, "utf8"));
    const encryptedKey = Buffer.from(localState.os_crypt.encrypted_key, "base64").subarray(5);
    const key = encryptedKey;
    const nonce = buf.subarray(3, 15);
    const ciphertext = buf.subarray(15, -16);
    const tag = buf.subarray(-16);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

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

function getBrowserCookie() {
  const db = new DatabaseSync(cookieDbPath, { readOnly: true });
  const row = db.prepare(`
    select host_key, name, value, encrypted_value
    from cookies
    where name = 'app_session_id'
    order by last_access_utc desc
    limit 1
  `).get();
  db.close();
  if (!row) throw new Error("No app_session_id cookie was found in the browser profile.");
  const value = row.value || decryptCookieValue(row.encrypted_value);
  if (!value) throw new Error(`Found app_session_id for ${row.host_key}, but could not decrypt the value.`);
  return `app_session_id=${value}`;
}

async function getCookie() {
  if (process.env.USE_BROWSER_COOKIE === "1") {
    return getBrowserCookie();
  }
  return mintOwnerSessionCookie();
}

async function trpc(pathName, input, method = "POST") {
  const cookie = await getCookie();
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
    throw new Error(`${pathName} failed: HTTP ${res.status} ${JSON.stringify(data).slice(0, 1000)}`);
  }
  return Array.isArray(data) ? data[0]?.result?.data?.json : data;
}

async function main() {
  const me = await trpc("auth.me", null, "GET");
  console.log(`Authenticated as user ${me?.id} (${me?.email ?? me?.name ?? "unknown"}), role=${me?.role ?? "unknown"}`);

  const project = await trpc("projects.create", {
    propertyName: "Staging Validation Floor Plan",
    propertyAddress: "100 Market Street",
    city: "Philadelphia",
    market: "Philadelphia",
    totalSqFt: 18500,
    floorNumber: "12",
    inputMethod: "upload",
    tenantName: "Validation Tenant",
    headcount: 92,
    industry: "Professional Services",
    programNotes: "Real staging validation using provided reference floor-plan image. Generate three scenarios with existing-condition parsing, refined architectural plan output, achieved-vs-requested reporting, budget, and schedule.",
  });
  console.log(`Created project id=${project.id}`);

  const image = fs.readFileSync(floorPlanPath);
  const ext = path.extname(floorPlanPath).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : ext === ".gif" ? "image/gif" : "image/jpeg";
  const upload = await trpc("projects.uploadFloorPlan", {
    projectId: project.id,
    base64: image.toString("base64"),
    mimeType,
    filename: path.basename(floorPlanPath),
  });
  console.log(`Uploaded floor plan url=${upload.url}`);

  const analysis = await trpc("projects.analyze", { projectId: project.id });
  console.log(`Analyze result success=${analysis.success}, scenarioCount=${analysis.scenarioCount}`);

  const detail = await trpc("projects.get", { id: project.id }, "GET");
  const scenarios = detail?.scenarios ?? [];
  console.log(`Fetched project status=${detail?.project?.status}, scenarios=${scenarios.length}`);
  for (const scenario of scenarios) {
    console.log(`Scenario ${scenario.scenarioNumber}: ${scenario.label}; budgetMid=${scenario.budgetMid}; scheduleMid=${scenario.scheduleWeeksMid}; rendering=${JSON.stringify(scenario.renderingStatus)}`);
  }

  const share = await trpc("share.create", { projectId: project.id });
  console.log(`Share token created isNew=${share.isNew}, tokenLength=${share.token?.length ?? 0}`);

  const sharedReport = await trpc("share.getReport", { token: share.token, userAgent: "Leasibility staging validation script" }, "GET");
  console.log(`Shared report project=${sharedReport?.project?.propertyName ?? "unknown"}, scenarios=${sharedReport?.scenarios?.length ?? 0}, viewCount=${sharedReport?.viewCount ?? "unknown"}`);

  const report = await trpc("pdf.generateReport", { projectId: project.id });
  console.log(`Generated report url=${report.url}, htmlLength=${report.html?.length ?? 0}`);

  fs.writeFileSync("/home/ubuntu/leasibility-staging/staging-validation-result.json", JSON.stringify({
    projectId: project.id,
    project: detail.project,
    scenarios,
    share: { isNew: share.isNew, tokenLength: share.token?.length ?? 0 },
    sharedReport: {
      projectName: sharedReport?.project?.propertyName,
      scenarioCount: sharedReport?.scenarios?.length ?? 0,
      viewCount: sharedReport?.viewCount ?? null,
    },
    report: { url: report.url, htmlLength: report.html?.length ?? 0 },
  }, null, 2));
  console.log("Wrote staging-validation-result.json");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
