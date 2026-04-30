import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { referrals, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Generate a unique referral code like "BROKER-A1B2C3"
function generateCode(userId: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const seed = userId * 31337 + Date.now();
  for (let i = 0; i < 6; i++) {
    suffix += chars[(seed * (i + 1) * 7919) % chars.length];
  }
  return `BROKER-${suffix}`;
}

export const referralRouter = router({
  // Get or create the user's referral code + stats
  getMyReferral: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Find existing referral code for this user (where they are the referrer and no referredUserId yet — the "master" row)
    const existing = await db
      .select()
      .from(referrals)
      .where(and(eq(referrals.referrerId, ctx.user.id), eq(referrals.referralCode, referrals.referralCode)))
      .limit(50);

    // The user's own referral code row has no referredUserId
    const myCodeRow = existing.find(r => r.referredUserId === null);

    let referralCode: string;

    if (!myCodeRow) {
      // Create a new referral code row for this user
      let code = generateCode(ctx.user.id);
      // Ensure uniqueness
      const conflict = await db.select().from(referrals).where(eq(referrals.referralCode, code)).limit(1);
      if (conflict.length > 0) {
        code = generateCode(ctx.user.id + Date.now());
      }
      await db.insert(referrals).values({
        referrerId: ctx.user.id,
        referralCode: code,
        status: "pending",
        creditApplied: false,
        creditMonths: 0,
      });
      referralCode = code;
    } else {
      referralCode = myCodeRow.referralCode;
    }

    // Count referrals by status
    const allReferrals = existing.filter(r => r.referredUserId !== null);
    const signedUp = allReferrals.filter(r => ["signed_up", "subscribed", "credited"].includes(r.status));
    const subscribed = allReferrals.filter(r => ["subscribed", "credited"].includes(r.status));
    const credited = allReferrals.filter(r => r.status === "credited");
    const totalCreditMonths = credited.reduce((sum, r) => sum + r.creditMonths, 0);

    // Get referred user names for the table
    const referralDetails = await Promise.all(
      allReferrals.map(async (r) => {
        if (!r.referredUserId) return null;
        const userRow = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, r.referredUserId)).limit(1);
        return {
          id: r.id,
          status: r.status,
          creditMonths: r.creditMonths,
          referredAt: r.referredAt,
          subscribedAt: r.subscribedAt,
          referredName: userRow[0]?.name ?? "Anonymous",
          referredEmail: userRow[0]?.email ?? "",
        };
      })
    );

    return {
      referralCode,
      stats: {
        signedUp: signedUp.length,
        subscribed: subscribed.length,
        credited: credited.length,
        totalCreditMonths,
      },
      referrals: referralDetails.filter(Boolean),
    };
  }),

  // Public: look up who owns a referral code (for the /join landing page)
  getReferrerByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db || !input.code) return null;

      // Find the master row (no referredUserId) for this code
      const codeRow = await db
        .select({ referrerId: referrals.referrerId })
        .from(referrals)
        .where(eq(referrals.referralCode, input.code))
        .limit(1);

      if (!codeRow[0]) return null;

      const userRow = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, codeRow[0].referrerId))
        .limit(1);

      return userRow[0] ? { name: userRow[0].name } : null;
    }),

  // Called when a new user signs up via a referral link — links them to the referrer
  claimReferral: protectedProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Find the referral code row (master row with no referredUserId)
      const codeRow = await db
        .select()
        .from(referrals)
        .where(and(eq(referrals.referralCode, input.referralCode)))
        .limit(1);

      if (!codeRow[0]) return { success: false, message: "Invalid referral code" };
      if (codeRow[0].referrerId === ctx.user.id) return { success: false, message: "Cannot refer yourself" };

      // Check if this user was already referred
      const alreadyReferred = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referredUserId, ctx.user.id))
        .limit(1);

      if (alreadyReferred.length > 0) return { success: false, message: "Already claimed a referral" };

      // Create a new referral tracking row
      await db.insert(referrals).values({
        referrerId: codeRow[0].referrerId,
        referredUserId: ctx.user.id,
        referralCode: input.referralCode,
        status: "signed_up",
        creditApplied: false,
        creditMonths: 0,
        referredAt: new Date(),
      });

      return { success: true, message: "Referral claimed successfully" };
    }),
});
