import Stripe from "stripe";
import { Request, Response } from "express";
import { getDb } from "./db";
import { users, referrals } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("Stripe webhooks are not configured. Set STRIPE_SECRET_KEY before processing Stripe events.");
  }
  return new Stripe(apiKey, { apiVersion: "2026-02-25.clover" });
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(503).json({ error: "Stripe webhook is not configured" });
  }
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Webhook] Signature verification failed:", message);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return res.status(500).json({ error: "Database unavailable" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          await db.update(users)
            .set({
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripeStatus: "trialing",
            })
            .where(eq(users.id, parseInt(userId)));
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Determine plan from price ID
        const priceId = sub.items.data[0]?.price.id;
        let plan: "starter" | "professional" | "team" | null = null;

        const { STRIPE_PRODUCTS } = await import("./stripeProducts");
        for (const [key, product] of Object.entries(STRIPE_PRODUCTS)) {
          if (priceId === product.monthly.priceId || priceId === product.annual.priceId) {
            plan = key as "starter" | "professional" | "team";
            break;
          }
        }

        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
        // @ts-ignore — field name varies by Stripe SDK version
        const rawPeriodEnd = (sub as unknown as Record<string, unknown>).current_period_end ?? null;
        const periodEnd = rawPeriodEnd ? new Date((rawPeriodEnd as number) * 1000) : null;

        await db.update(users)
          .set({
            stripeSubscriptionId: sub.id,
            stripeStatus: sub.status,
            stripePlan: plan ?? undefined,
            trialEndsAt: trialEnd ?? undefined,
            subscriptionEndsAt: periodEnd ?? undefined,
          })
          .where(eq(users.stripeCustomerId, customerId));

        // ─── Referral credit automation ──────────────────────────────
        // When a subscription becomes active (trial converts), credit the referrer
        if (sub.status === "active") {
          // Look up the user who just subscribed
          const subscribedUser = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.stripeCustomerId, customerId))
            .limit(1);

          if (subscribedUser[0]) {
            const newSubscriberId = subscribedUser[0].id;

            // Find any uncredited referral where this user is the referred party
            const referralRow = await db
              .select()
              .from(referrals)
              .where(
                and(
                  eq(referrals.referredUserId, newSubscriberId),
                  eq(referrals.creditApplied, false)
                )
              )
              .limit(1);

            if (referralRow[0]) {
              const ref = referralRow[0];

              // Mark referral as subscribed + credited
              await db.update(referrals)
                .set({
                  status: "credited",
                  creditApplied: true,
                  creditMonths: 1,
                  subscribedAt: new Date(),
                })
                .where(eq(referrals.id, ref.id));

              // Apply a 1-month free coupon to the referrer's subscription
              try {
                const referrerUser = await db
                  .select({ stripeSubscriptionId: users.stripeSubscriptionId, stripeCustomerId: users.stripeCustomerId })
                  .from(users)
                  .where(eq(users.id, ref.referrerId))
                  .limit(1);

                if (referrerUser[0]?.stripeSubscriptionId) {
                  // Create a one-time 100% off coupon for one month
                  const coupon = await stripe.coupons.create({
                    percent_off: 100,
                    duration: "once",
                    name: `Referral Credit — 1 Free Month`,
                    metadata: {
                      referral_id: ref.id.toString(),
                      referred_user_id: newSubscriberId.toString(),
                    },
                  });

                  // Apply coupon to the referrer's subscription via a promotion code
                  // The Stripe SDK v18+ uses discounts[] instead of the deprecated coupon field
                  await (stripe.subscriptions.update as Function)(referrerUser[0].stripeSubscriptionId, {
                    discounts: [{ coupon: coupon.id }],
                  });

                  console.log(`[Referral] Credited referrer userId=${ref.referrerId} with 1 free month (coupon ${coupon.id})`);

                  // Notify the app owner that a referral credit was earned
                  const referrerName = referrerUser[0] ? await db
                    .select({ name: users.name, email: users.email })
                    .from(users)
                    .where(eq(users.id, ref.referrerId))
                    .limit(1)
                    .then(r => r[0]) : null;

                  const referredName = await db
                    .select({ name: users.name, email: users.email })
                    .from(users)
                    .where(eq(users.id, newSubscriberId))
                    .limit(1)
                    .then(r => r[0]);

                  await notifyOwner({
                    title: "🎉 Referral Credit Earned",
                    content: [
                      `A referral credit has been automatically applied.`,
                      ``,
                      `Referrer: ${referrerName?.name || "Unknown"} (${referrerName?.email || "no email"})`,
                      `Referred: ${referredName?.name || "Unknown"} (${referredName?.email || "no email"})`,
                      `Credit: 1 free month applied to next billing cycle`,
                      `Coupon ID: ${coupon.id}`,
                      `Referral ID: ${ref.id}`,
                    ].join("\n"),
                  }).catch(err => console.warn("[Referral] notifyOwner failed:", err));
                }
              } catch (creditErr) {
                console.error("[Referral] Failed to apply coupon to referrer:", creditErr);
                // Non-fatal: referral is still marked credited in DB
              }
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await db.update(users)
          .set({
            stripeStatus: "canceled",
            stripeSubscriptionId: null,
            stripePlan: null,
          })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await db.update(users)
          .set({ stripeStatus: "past_due" })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[Webhook] Processing error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  return res.json({ received: true });
}
