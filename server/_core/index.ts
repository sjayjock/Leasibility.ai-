import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripeWebhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Stripe webhook MUST use raw body — register BEFORE json middleware
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // GHL Lead Intake — push survey data to GoHighLevel
  app.post("/api/ghl/lead", async (req, res) => {
    const GHL_WEBHOOK = "https://services.leadconnectorhq.com/hooks/sQg9E2lBwpVttgGHw6zq/webhook-trigger/e0df065b-1cf7-41b9-b8ca-8aa973d7dec1";
    try {
      const payload = req.body;
      // Map to GHL contact format
      const ghlPayload = {
        firstName: payload.firstName ?? "",
        email: payload.email ?? "",
        customField: {
          role: payload.role ?? "",
          tour_volume: payload.tourVolume ?? "",
          market: payload.market ?? "",
          challenge: payload.challenge ?? "",
          source: payload.source ?? "onboarding-survey",
          tag: payload.tag ?? "trial-started",
          plan_selected: payload.planSelected ?? "",
          onboarding_role: payload.onboardingRole ?? payload.role ?? "",
          onboarding_deal_volume: payload.onboardingDealVolume ?? payload.tourVolume ?? "",
          onboarding_market: payload.onboardingMarket ?? payload.market ?? "",
          onboarding_pain_points: payload.onboardingPainPoints ?? payload.challenge ?? "",
        },
        tags: [payload.tag ?? "trial-started", "leasibility-ai"],
      };
      const response = await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ghlPayload),
      });
      const ok = response.ok;
      console.log(`[GHL] Lead pushed: ${payload.email} — status ${response.status}`);
      res.json({ success: ok });
    } catch (err) {
      console.error("[GHL] Webhook push failed:", err);
      res.json({ success: false }); // Non-blocking
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
