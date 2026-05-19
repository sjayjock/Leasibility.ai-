import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createHash } from "crypto";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { shareTokens, reportViews, projects, scenarios, brokerProfiles, users } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { nanoid } from "nanoid";

// ─── Share Router ─────────────────────────────────────────────────────────────
export const shareRouter = router({

  // Create or retrieve a share token for a project
  create: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify project belongs to this broker
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);

      if (!project) throw new Error("Project not found");
      if (project.status !== "complete") throw new Error("Project must be analyzed before sharing");

      // Check for existing active token
      const [existing] = await db
        .select()
        .from(shareTokens)
        .where(and(eq(shareTokens.projectId, input.projectId), eq(shareTokens.isActive, true)))
        .limit(1);

      if (existing) {
        return { token: existing.token, isNew: false };
      }

      // Create new token
      const token = nanoid(32);
      await db.insert(shareTokens).values({
        token,
        projectId: input.projectId,
        userId: ctx.user.id,
        viewCount: 0,
        isActive: true,
      });

      return { token, isNew: true };
    }),

  // Public: fetch report data by token (no auth required) + record view
  getReport: publicProcedure
    .input(z.object({
      token: z.string(),
      userAgent: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Find token
      const [shareToken] = await db
        .select()
        .from(shareTokens)
        .where(and(eq(shareTokens.token, input.token), eq(shareTokens.isActive, true)))
        .limit(1);

      if (!shareToken) throw new Error("Report not found or link has expired");

      // Fetch project
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, shareToken.projectId))
        .limit(1);

      if (!project || project.status !== "complete") throw new Error("Report not available");

      // Fetch scenarios
      const scenarioList = await db
        .select()
        .from(scenarios)
        .where(eq(scenarios.projectId, project.id));

      // Fetch broker profile
      const [broker] = await db
        .select()
        .from(brokerProfiles)
        .where(eq(brokerProfiles.userId, shareToken.userId))
        .limit(1);

      // Fetch broker user info (for name/email fallback)
      const [brokerUser] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, shareToken.userId))
        .limit(1);

      // Record view event
      const ipRaw = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        ?? ctx.req.socket?.remoteAddress
        ?? "unknown";
      const ipHash = createHash("sha256").update(ipRaw).digest("hex").slice(0, 16);

      await db.insert(reportViews).values({
        tokenId: shareToken.id,
        projectId: project.id,
        ipHash,
        userAgent: input.userAgent?.slice(0, 500) ?? null,
      });

      // Increment view count + update lastViewedAt
      const newCount = (shareToken.viewCount ?? 0) + 1;
      await db
        .update(shareTokens)
        .set({ viewCount: newCount, lastViewedAt: new Date() })
        .where(eq(shareTokens.id, shareToken.id));

      // Notify the broker (owner notification on every view)
      const brokerName = broker?.brokerName ?? brokerUser?.name ?? "Your broker";
      const projectName = project.propertyName;
      try {
        await notifyOwner({
          title: `📬 Report Opened — ${projectName}`,
          content: `A client just opened the shared report for **${projectName}**.\n\nView #${newCount} — ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET`,
        });
      } catch {
        // Non-fatal — don't block the client from viewing the report
      }

      return {
        project,
        scenarios: scenarioList,
        broker: broker ?? null,
        brokerUser: brokerUser ?? null,
        viewCount: newCount,
        sharedAt: shareToken.createdAt,
      };
    }),

  // Protected: get view history for a project
  getViews: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ownership
      const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, ctx.user.id)))
        .limit(1);

      if (!project) throw new Error("Project not found");

      // Get share token
      const [shareToken] = await db
        .select()
        .from(shareTokens)
        .where(and(eq(shareTokens.projectId, input.projectId), eq(shareTokens.isActive, true)))
        .limit(1);

      if (!shareToken) return { views: [], viewCount: 0, hasLink: false };

      // Get recent views
      const views = await db
        .select()
        .from(reportViews)
        .where(eq(reportViews.tokenId, shareToken.id))
        .orderBy(desc(reportViews.viewedAt))
        .limit(50);

      return {
        views,
        viewCount: shareToken.viewCount,
        hasLink: true,
        token: shareToken.token,
        lastViewedAt: shareToken.lastViewedAt,
      };
    }),

  // Revoke a share link
  revoke: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db
        .update(shareTokens)
        .set({ isActive: false })
        .where(and(
          eq(shareTokens.projectId, input.projectId),
          eq(shareTokens.userId, ctx.user.id),
        ));

      return { success: true };
    }),
});
