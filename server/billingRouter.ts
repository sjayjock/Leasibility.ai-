import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { STRIPE_PRODUCTS, TRIAL_DAYS, type PlanKey } from "./stripeProducts";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });

export const billingRouter = router({
  // Get current subscription status
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const result = await db.select({
      stripeCustomerId: users.stripeCustomerId,
      stripeSubscriptionId: users.stripeSubscriptionId,
      stripePlan: users.stripePlan,
      stripeStatus: users.stripeStatus,
      trialEndsAt: users.trialEndsAt,
      subscriptionEndsAt: users.subscriptionEndsAt,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);

    const sub = result[0];
    if (!sub) return { hasSubscription: false, plan: null, status: null, trialEndsAt: null, subscriptionEndsAt: null };

    // Determine if trial is still active
    const now = new Date();
    const trialActive = sub.trialEndsAt ? sub.trialEndsAt > now : false;
    const isActive = sub.stripeStatus === "active" || sub.stripeStatus === "trialing" || trialActive;

    return {
      hasSubscription: !!sub.stripeSubscriptionId,
      plan: sub.stripePlan,
      status: sub.stripeStatus,
      trialEndsAt: sub.trialEndsAt,
      subscriptionEndsAt: sub.subscriptionEndsAt,
      isActive,
      trialActive,
    };
  }),

  // Create a Stripe checkout session for a plan
  createCheckoutSession: protectedProcedure
    .input(z.object({
      plan: z.enum(["starter", "professional", "team"]),
      interval: z.enum(["month", "year"]),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const product = STRIPE_PRODUCTS[input.plan as PlanKey];
      const priceId = input.interval === "month" ? product.monthly.priceId : product.annual.priceId;

      // Get or create Stripe customer
      const userRecord = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      let customerId = userRecord[0]?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email ?? undefined,
          name: ctx.user.name ?? undefined,
          metadata: { user_id: ctx.user.id.toString() },
        });
        customerId = customer.id;
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, ctx.user.id));
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        subscription_data: {
          trial_period_days: TRIAL_DAYS,
          metadata: { user_id: ctx.user.id.toString() },
        },
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
          plan: input.plan,
        },
        success_url: `${input.origin}/dashboard?billing=success`,
        cancel_url: `${input.origin}/billing?billing=canceled`,
      });

      return { url: session.url };
    }),

  // Create a Stripe billing portal session for plan management
  createPortalSession: protectedProcedure
    .input(z.object({ origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const userRecord = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const customerId = userRecord[0]?.stripeCustomerId;

      if (!customerId) throw new Error("No Stripe customer found");

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${input.origin}/billing`,
      });

      return { url: session.url };
    }),

  // Get available plans for display
  getPlans: protectedProcedure.query(() => {
    return Object.entries(STRIPE_PRODUCTS).map(([key, plan]) => ({
      key,
      name: plan.name,
      monthlyPrice: plan.monthly.amount,
      annualPrice: plan.annual.amount,
      monthlyPriceId: plan.monthly.priceId,
      annualPriceId: plan.annual.priceId,
      features: plan.features,
      testFitLimit: plan.testFitLimit,
    }));
  }),
});
