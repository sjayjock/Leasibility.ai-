/**
 * Leasibility AI — Stripe Products & Prices
 * Account: acct_1TCP2eDfIt3QJILa (admin@creelsolutions.com)
 * Recreated 2026-03-18 — previous IDs were from a different account
 */

export const STRIPE_PRODUCTS = {
  starter: {
    productId: "prod_UAmjmkgATWBaWt",
    name: "Starter",
    monthly: {
      priceId: "price_1TCR9hDfIt3QJILaPlpVhMbw",
      amount: 9900,
      interval: "month" as const,
    },
    annual: {
      priceId: "price_1TCR9iDfIt3QJILaRKuDraOX",
      amount: 99600,
      interval: "year" as const,
    },
    features: [
      "10 test-fits per month",
      "PDF + shareable link export",
      "Broker-branded reports",
      "Budget estimator",
      "Space efficiency scoring",
      "Email support",
    ],
    testFitLimit: 10,
  },
  professional: {
    productId: "prod_UAmjKSIKnmqsFA",
    name: "Professional",
    monthly: {
      priceId: "price_1TCR9jDfIt3QJILafumJ1jww",
      amount: 19900,
      interval: "month" as const,
    },
    annual: {
      priceId: "price_1TCR9kDfIt3QJILalL1nUbOH",
      amount: 199200,
      interval: "year" as const,
    },
    features: [
      "Unlimited test-fits",
      "White-label reports (your logo)",
      "Property comparison view",
      "Read receipts on shared reports",
      "Program templates library",
      "Priority support",
    ],
    testFitLimit: -1, // unlimited
  },
  team: {
    productId: "prod_UAmj5UbrRJHJSZ",
    name: "Team",
    monthly: {
      priceId: "price_1TCR9lDfIt3QJILa9UQRuPTX",
      amount: 14900,
      interval: "month" as const,
    },
    annual: {
      priceId: "price_1TCR9mDfIt3QJILavRti5ZYC",
      amount: 149200,
      interval: "year" as const,
    },
    features: [
      "Everything in Professional",
      "Team project visibility",
      "Co-broker sharing",
      "Referral program access",
      "Dedicated onboarding",
    ],
    testFitLimit: -1, // unlimited
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PRODUCTS;

export const TRIAL_DAYS = 7;
