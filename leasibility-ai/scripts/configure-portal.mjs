import Stripe from "stripe";
import { config } from "dotenv";

config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" });

async function configurePortal() {
  console.log("Configuring Stripe Customer Portal...");

  // Fetch all active prices to build the allowed updates list
  const prices = await stripe.prices.list({ active: true, limit: 20 });
  console.log("Active prices found:", prices.data.length);

  // Group prices by product to avoid duplicates
  const productPriceMap = {};
  for (const price of prices.data) {
    const productId = price.product;
    if (!productPriceMap[productId]) {
      productPriceMap[productId] = [];
    }
    productPriceMap[productId].push(price.id);
  }

  const productEntries = Object.entries(productPriceMap).map(([product, priceIds]) => ({
    product,
    prices: priceIds,
  }));

  console.log("Products for portal:", productEntries.map(p => p.product));

  const portalConfig = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your Leasibility AI subscription",
      privacy_policy_url: "https://leasibility-7jszlgf4.manus.space",
      terms_of_service_url: "https://leasibility-7jszlgf4.manus.space",
    },
    features: {
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price", "promotion_code"],
        proration_behavior: "create_prorations",
        products: productEntries,
      },
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
    },
  });

  console.log("✅ Portal configuration created:", portalConfig.id);
  console.log("Is default:", portalConfig.is_default);

  // If not default, update it to be the default
  if (!portalConfig.is_default) {
    await stripe.billingPortal.configurations.update(portalConfig.id, {
      default_return_url: "https://leasibility-7jszlgf4.manus.space/billing",
    });
    console.log("✅ Set as default portal configuration");
  }
}

configurePortal().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
