import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { brokerProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const brokerRouter = router({
  // Get broker profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const result = await db.select().from(brokerProfiles)
      .where(eq(brokerProfiles.userId, ctx.user.id)).limit(1);

    return result[0] ?? null;
  }),

  // Upsert broker profile (text fields only)
  updateProfile: protectedProcedure
    .input(z.object({
      brokerName: z.string().optional(),
      brokerTitle: z.string().optional(),
      brokerPhone: z.string().optional(),
      brokerEmail: z.string().email().optional(),
      brokerCompany: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db.select().from(brokerProfiles)
        .where(eq(brokerProfiles.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await db.update(brokerProfiles)
          .set({ ...input })
          .where(eq(brokerProfiles.userId, ctx.user.id));
      } else {
        await db.insert(brokerProfiles).values({
          userId: ctx.user.id,
          ...input,
        });
      }

      return { success: true };
    }),

  // Upload broker photo (base64 encoded)
  uploadPhoto: protectedProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `broker-photos/${ctx.user.id}-${nanoid(8)}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(key, buffer, input.mimeType);

      const existing = await db.select().from(brokerProfiles)
        .where(eq(brokerProfiles.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await db.update(brokerProfiles)
          .set({ brokerPhotoUrl: url, brokerPhotoKey: key })
          .where(eq(brokerProfiles.userId, ctx.user.id));
      } else {
        await db.insert(brokerProfiles).values({
          userId: ctx.user.id,
          brokerPhotoUrl: url,
          brokerPhotoKey: key,
        });
      }

      return { url };
    }),

  // Upload broker logo (base64 encoded)
  uploadLogo: protectedProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const ext = input.mimeType.split("/")[1] ?? "png";
      const key = `broker-logos/${ctx.user.id}-${nanoid(8)}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(key, buffer, input.mimeType);

      const existing = await db.select().from(brokerProfiles)
        .where(eq(brokerProfiles.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await db.update(brokerProfiles)
          .set({ brokerLogoUrl: url, brokerLogoKey: key })
          .where(eq(brokerProfiles.userId, ctx.user.id));
      } else {
        await db.insert(brokerProfiles).values({
          userId: ctx.user.id,
          brokerLogoUrl: url,
          brokerLogoKey: key,
        });
      }

      return { url };
    }),

  // Mark profile as complete
  markComplete: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db.update(brokerProfiles)
      .set({ profileComplete: true })
      .where(eq(brokerProfiles.userId, ctx.user.id));

    return { success: true };
  }),
});
