import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ─────────────────────────────────────────
vi.mock("./db", () => ({
  getProjectsByUser: vi.fn().mockResolvedValue([]),
  getProjectById: vi.fn().mockResolvedValue({
    id: 1, userId: 1, propertyName: "200 Park Ave", totalSqFt: 5000,
    headcount: 25, industry: "Technology", market: "New York",
    status: "draft", floorPlanUrl: null, programNotes: null,
    city: "New York", state: "NY", propertyAddress: null,
    floorNumber: null, floorPlanKey: null, tenantName: "Acme Corp",
    inputMethod: "upload", createdAt: new Date(), updatedAt: new Date(),
  }),
  createProject: vi.fn().mockResolvedValue(42),
  updateProject: vi.fn().mockResolvedValue(undefined),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  getScenariosByProject: vi.fn().mockResolvedValue([]),
  createScenario: vi.fn().mockResolvedValue(1),
  deleteScenariosByProject: vi.fn().mockResolvedValue(undefined),
  getBrokerProfile: vi.fn().mockResolvedValue(null),
  upsertBrokerProfile: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn().mockResolvedValue({
    id: 1, stripeStatus: "active", stripePlan: "professional",
    trialEndsAt: null, subscriptionEndsAt: null,
  }),
  incrementAnalysisCount: vi.fn().mockResolvedValue(undefined),
  getMonthlyAnalysisCount: vi.fn().mockResolvedValue(0),
}));

vi.mock("./aiEngine", () => ({
  generateScenarios: vi.fn().mockResolvedValue([
    {
      scenarioNumber: 1, label: "Collaborative Open", efficiencyScore: 85,
      usableSqFt: 4250, totalSqFt: 5000,
      roomBreakdown: [{ type: "Open Workspace", count: 1, sqFt: 2500 }],
      layoutDescription: "Open collaborative layout.", layoutSvg: "<svg/>",
      budgetLow: 425000, budgetMid: 625000, budgetHigh: 900000,
      costPerSqFtLow: 85, costPerSqFtMid: 125, costPerSqFtHigh: 180,
      budgetBreakdown: {
        construction: { low: 255000, mid: 375000, high: 540000 },
        ffe: { low: 76500, mid: 112500, high: 162000 },
        itAv: { low: 42500, mid: 62500, high: 90000 },
        softCosts: { low: 34000, mid: 50000, high: 72000 },
        tiAllowance: { low: 17000, mid: 25000, high: 36000 },
      },
      scheduleWeeksLow: 14, scheduleWeeksMid: 20, scheduleWeeksHigh: 26,
      schedulePhases: [{ phase: "Design", weeks: "3–5", description: "Space planning and permits." }],
      aiSummary: "This layout works well for a tech team.",
    },
  ]),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

// ─── Auth context helpers ─────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1, openId: "test-user", email: "broker@test.com", name: "Test Broker",
      loginMethod: "manus", role: "user", createdAt: new Date(),
      updatedAt: new Date(), lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("projects.list", () => {
  it("returns empty array for new user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.projects.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("projects.create", () => {
  it("creates a project and returns an id", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.projects.create({
      propertyName: "200 Park Ave",
      totalSqFt: 5000,
      headcount: 25,
      industry: "Technology",
      market: "New York",
      inputMethod: "upload",
    });
    expect(result.id).toBe(42);
  });

  it("rejects invalid sqFt below minimum", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.projects.create({
      propertyName: "Tiny Space",
      totalSqFt: 100, // below 500 minimum
      headcount: 5,
      industry: "Other",
      inputMethod: "upload",
    })).rejects.toThrow();
  });
});

describe("projects.get", () => {
  it("returns project with scenarios", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.projects.get({ id: 1 });
    expect(result.project.propertyName).toBe("200 Park Ave");
    expect(Array.isArray(result.scenarios)).toBe(true);
  });
});

describe("projects.analyze", () => {
  it("runs analysis and returns scenario count", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.projects.analyze({ projectId: 1 });
    expect(result.success).toBe(true);
    expect(result.scenarioCount).toBe(1);
  });
});

describe("broker.getProfile", () => {
  it("returns null for new broker", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.broker.getProfile();
    expect(result).toBeNull();
  });
});
