import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { changelogSeen } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Changelog entries — add new versions here as the product evolves
export const CHANGELOG: Array<{
  version: string;
  date: string;
  title: string;
  items: Array<{ type: "new" | "improved" | "fixed"; text: string }>;
}> = [
  {
    version: "1.3.0",
    date: "March 2026",
    title: "Scenario Naming & Checkout Improvements",
    items: [
      { type: "new", text: "Scenarios renamed to Light Refresh, Moderate Build-Out, and Full Transformation for clearer client communication." },
      { type: "new", text: "Stripe checkout now works end-to-end — select any plan and pay with a test card." },
      { type: "new", text: "Referral program launched — earn one free month for every broker you bring on board." },
      { type: "improved", text: "Landing page hero updated with sharper positioning: 'Know If a Space Works — Before Your Client Asks.'" },
      { type: "improved", text: "All CTA buttons now route directly to the correct plan on the billing page." },
      { type: "fixed", text: "Fixed 'No such price' error caused by Stripe account mismatch." },
    ],
  },
  {
    version: "1.2.0",
    date: "February 2026",
    title: "PDF Reports & Branded Exports",
    items: [
      { type: "new", text: "Export a full branded PDF report with your name, photo, and contact details." },
      { type: "new", text: "Shareable report links with read receipts — know the moment your client opens it." },
      { type: "new", text: "Compare up to 3 properties side-by-side in the Compare view." },
      { type: "improved", text: "Budget estimates now show low/mid/high ranges with city-specific benchmarks." },
    ],
  },
  {
    version: "1.1.0",
    date: "January 2026",
    title: "AI Test-Fit Engine Launch",
    items: [
      { type: "new", text: "AI generates three scenario layouts from any uploaded floor plan in under 60 seconds." },
      { type: "new", text: "Space efficiency scoring for every layout — instantly compare usable vs. total sq ft." },
      { type: "new", text: "Project timeline estimates from lease execution to occupancy for each scenario." },
      { type: "improved", text: "Floor plan upload supports PDF, JPG, and PNG formats up to 10MB." },
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0].version;

export const changelogRouter = router({
  // Get changelog entries the user hasn't seen yet
  getUnseen: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { entries: [], latestVersion: LATEST_VERSION };

    const seen = await db
      .select({ version: changelogSeen.version })
      .from(changelogSeen)
      .where(eq(changelogSeen.userId, ctx.user.id));

    const seenVersions = new Set(seen.map(s => s.version));
    const unseen = CHANGELOG.filter(entry => !seenVersions.has(entry.version));

    return {
      entries: unseen,
      latestVersion: LATEST_VERSION,
    };
  }),

  // Mark a specific version as seen
  markSeen: protectedProcedure
    .input(z.object({ version: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Check if already marked
      const existing = await db
        .select()
        .from(changelogSeen)
        .where(and(eq(changelogSeen.userId, ctx.user.id), eq(changelogSeen.version, input.version)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(changelogSeen).values({
          userId: ctx.user.id,
          version: input.version,
        });
      }

      return { success: true };
    }),

  // Mark all current changelog versions as seen (bulk dismiss)
  markAllSeen: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false };

    const seen = await db
      .select({ version: changelogSeen.version })
      .from(changelogSeen)
      .where(eq(changelogSeen.userId, ctx.user.id));

    const seenVersions = new Set(seen.map(s => s.version));

    for (const entry of CHANGELOG) {
      if (!seenVersions.has(entry.version)) {
        await db.insert(changelogSeen).values({
          userId: ctx.user.id,
          version: entry.version,
        });
      }
    }

    return { success: true };
  }),
});
