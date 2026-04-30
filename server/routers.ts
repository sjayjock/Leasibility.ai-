import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getProjectsByUser, getProjectById, createProject, updateProject, deleteProject,
  getScenariosByProject, createScenario, deleteScenariosByProject,
  getBrokerProfile, upsertBrokerProfile, getUserById,
  incrementAnalysisCount, getMonthlyAnalysisCount,
} from "./db";
import { generateScenarios } from "./aiEngine";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { billingRouter } from "./billingRouter";
import { pdfRouter } from "./pdfRouter";
import { shareRouter } from "./shareRouter";
import { referralRouter } from "./referralRouter";

export const appRouter = router({
  system: systemRouter,
  billing: billingRouter,
  pdf: pdfRouter,
  share: shareRouter,
  referral: referralRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Broker Profile ──────────────────────────────────────────
  broker: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return getBrokerProfile(ctx.user.id);
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        brokerName: z.string().optional(),
        brokerTitle: z.string().optional(),
        brokerPhone: z.string().optional(),
        brokerCompany: z.string().optional(),
        brokerLogoUrl: z.string().optional(),
        brokerPhotoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertBrokerProfile({ userId: ctx.user.id, ...input });
        return { success: true };
      }),
    uploadPhoto: protectedProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `broker-photos/${ctx.user.id}-${nanoid(8)}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertBrokerProfile({ userId: ctx.user.id, brokerPhotoUrl: url });
        return { url };
      }),
    uploadLogo: protectedProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `broker-logos/${ctx.user.id}-${nanoid(8)}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertBrokerProfile({ userId: ctx.user.id, brokerLogoUrl: url });
        return { url };
      }),
    saveProfile: protectedProcedure
      .input(z.object({
        brokerName: z.string().optional(),
        title: z.string().optional(),
        onboardingCompleted: z.boolean().optional(),
        onboardingRole: z.string().optional(),
        onboardingDealVolume: z.string().optional(),
        onboardingMarket: z.string().optional(),
        onboardingPainPoints: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertBrokerProfile({
          userId: ctx.user.id,
          brokerName: input.brokerName,
          brokerTitle: input.title,
          onboardingCompleted: input.onboardingCompleted,
          onboardingRole: input.onboardingRole,
          onboardingDealVolume: input.onboardingDealVolume,
          onboardingMarket: input.onboardingMarket,
          onboardingPainPoints: input.onboardingPainPoints,
        });
        return { success: true };
      }),
  }),

  // ─── Projects ─────────────────────────────────────────────────
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjectsByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.id, ctx.user.id);
        if (!project) throw new Error("Project not found");
        const projectScenarios = await getScenariosByProject(input.id);
        return { project, scenarios: projectScenarios };
      }),

    create: protectedProcedure
      .input(z.object({
        propertyName: z.string().min(1),
        propertyAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        market: z.string().optional(),
        totalSqFt: z.number().min(500).max(100000),
        floorNumber: z.string().optional(),
        inputMethod: z.enum(["upload", "scan"]).default("upload"),
        tenantName: z.string().optional(),
        headcount: z.number().min(0).max(5000).optional(),
        industry: z.string(),
        programNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createProject({
          userId: ctx.user.id,
          propertyName: input.propertyName,
          propertyAddress: input.propertyAddress,
          city: input.city,
          state: input.state,
          market: input.market ?? input.city ?? "default",
          totalSqFt: input.totalSqFt,
          floorNumber: input.floorNumber,
          inputMethod: input.inputMethod,
          tenantName: input.tenantName,
          headcount: input.headcount,
          industry: input.industry,
          programNotes: input.programNotes,
          status: "draft",
        });
        return { id };
      }),

    uploadFloorPlan: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        base64: z.string(),
        mimeType: z.string(),
        filename: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        const buffer = Buffer.from(input.base64, "base64");
        const key = `floor-plans/${ctx.user.id}/${input.projectId}-${nanoid(8)}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await updateProject(input.projectId, ctx.user.id, { floorPlanUrl: url, floorPlanKey: key });
        return { url };
      }),

    analyze: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) throw new Error("Project not found");
        if (!project.industry) throw new Error("Industry is required before analysis");
        if (!project.headcount && project.headcount !== 0) throw new Error("Headcount is required before analysis");

        // ─── Subscription Gate ────────────────────────────────────
        const user = await getUserById(ctx.user.id);
        if (user) {
          const status = user.stripeStatus;
          const plan = user.stripePlan;
          const trialEndsAt = user.trialEndsAt;
          const now = new Date();

          // Check if trial is active
          const trialActive = status === "trialing" && trialEndsAt && trialEndsAt > now;
          // Check if paid subscription is active
          const paidActive = status === "active";

          if (!trialActive && !paidActive) {
            throw new Error("Your subscription has expired. Please upgrade to continue running analyses.");
          }

          // Enforce Starter plan limit: 10 analyses per month
          if (plan === "starter" && paidActive) {
            const monthlyCount = await getMonthlyAnalysisCount(ctx.user.id);
            if (monthlyCount >= 10) {
              throw new Error("You've reached your 10 analyses/month limit on the Starter plan. Upgrade to Professional for unlimited analyses.");
            }
          }
        }

        // Increment usage counter
        await incrementAnalysisCount(ctx.user.id);

        await updateProject(input.projectId, ctx.user.id, { status: "analyzing" });

        try {
          const generatedScenarios = await generateScenarios({
            propertyName: project.propertyName,
            totalSqFt: project.totalSqFt ?? 5000,
            headcount: project.headcount,
            industry: project.industry,
            market: project.market ?? project.city ?? "default",
            floorPlanUrl: project.floorPlanUrl ?? undefined,
            programNotes: project.programNotes ?? undefined,
          });

          await deleteScenariosByProject(input.projectId);
          for (const s of generatedScenarios) {
            await createScenario({
              projectId: input.projectId,
              scenarioNumber: s.scenarioNumber,
              impactLevel: s.impactLevel as "low" | "medium" | "high",
              label: s.label,
              efficiencyScore: s.efficiencyScore,
              usableSqFt: s.usableSqFt,
              totalSqFt: s.totalSqFt,
              roomBreakdown: s.roomBreakdown,
              layoutDescription: s.layoutDescription,
              layoutSvg: s.layoutSvg,
              layoutImageUrl: s.layoutImageUrl,
              budgetLow: s.budgetLow,
              budgetMid: s.budgetMid,
              budgetHigh: s.budgetHigh,
              costPerSqFtLow: s.costPerSqFtLow,
              costPerSqFtMid: s.costPerSqFtMid,
              costPerSqFtHigh: s.costPerSqFtHigh,
              budgetBreakdown: s.budgetBreakdown,
              scheduleWeeksLow: s.scheduleWeeksLow,
              scheduleWeeksMid: s.scheduleWeeksMid,
              scheduleWeeksHigh: s.scheduleWeeksHigh,
              schedulePhases: s.schedulePhases,
              aiSummary: s.aiSummary,
              existingConditionsInventory: s.existingConditionsInventory,
              programFit: s.programFit,
              scopeSummary: s.scopeSummary,
              renderingStatus: s.renderingStatus,
            });
          }

          await updateProject(input.projectId, ctx.user.id, { status: "complete" });
          return { success: true, scenarioCount: generatedScenarios.length };
        } catch (err) {
          await updateProject(input.projectId, ctx.user.id, { status: "error" });
          throw err;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteProject(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
