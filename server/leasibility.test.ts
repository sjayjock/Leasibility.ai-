import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { buildSubscriptionLineItem } from "./billingRouter";
import { STRIPE_PRODUCTS } from "./stripeProducts";
import { buildProgramFitSummary, buildRenderingStatus, buildScopeSummary, deriveExistingConditionsInventory, buildRequestedProgramFromInputs } from "./programFit";
import { parseFloorPlanGeometry } from "./floorPlanParser";
import { generateTestFit } from "./layout";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ─────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({}),
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
      existingConditionsInventory: {
        summary: "Reusable rooms and fixed core identified.", reusableZones: [], repurposableZones: [], fixedElements: [], ambiguousAreas: [], reconfigurationZones: [], existingInteriorWallCount: 0, reviewRequired: false, reviewReasons: [], source: "synthetic_rectangular_model", confidence: 0.8,
      },
      programFit: { scenarioLabel: "Collaborative Open", achievedPercent: 95, rows: [], gaps: [], interpretation: "Program mostly fits." },
      scopeSummary: { scenarioLabel: "Collaborative Open", reuseStrategy: "Reuse existing rooms.", retainedElements: [], repurposedElements: [], reconfigurationScope: [], programGaps: [], budgetScheduleRationale: "Selective reuse reduces cost." },
      renderingStatus: { status: "ready", confidence: 0.8, reasons: [], message: "Ready for review." },
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

describe("billing checkout configuration", () => {
  it("builds portable Stripe price_data instead of account-specific price IDs", () => {
    const lineItem = buildSubscriptionLineItem(STRIPE_PRODUCTS.starter, "month");
    expect(lineItem).toEqual(expect.objectContaining({
      quantity: 1,
      price_data: expect.objectContaining({
        currency: "usd",
        unit_amount: STRIPE_PRODUCTS.starter.monthly.amount,
        recurring: { interval: "month" },
        product_data: expect.objectContaining({ name: "Leasibility AI Starter" }),
      }),
    }));
    expect(lineItem).not.toHaveProperty("price");
  });
});

describe("billing without configured Stripe credentials", () => {
  it("can read plan metadata without a Stripe secret", async () => {
    const previousSecret = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    try {
      const ctx = makeCtx();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.billing.getPlans();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual(expect.objectContaining({ key: expect.any(String), name: expect.any(String) }));
    } finally {
      if (previousSecret === undefined) {
        delete process.env.STRIPE_SECRET_KEY;
      } else {
        process.env.STRIPE_SECRET_KEY = previousSecret;
      }
    }
  });

  it("fails checkout with a clear configuration error when Stripe is missing", async () => {
    const previousSecret = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    try {
      const ctx = makeCtx();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.billing.createCheckoutSession({
        plan: "starter",
        interval: "month",
        origin: "https://example.com",
      })).rejects.toThrow("Stripe billing is not configured");
    } finally {
      if (previousSecret === undefined) {
        delete process.env.STRIPE_SECRET_KEY;
      } else {
        process.env.STRIPE_SECRET_KEY = previousSecret;
      }
    }
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
  it("runs analysis, persists reporting metadata, and returns scenario count", async () => {
    const db = await import("./db");
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.projects.analyze({ projectId: 1 });
    expect(result.success).toBe(true);
    expect(result.scenarioCount).toBe(1);
    expect(db.createScenario).toHaveBeenCalledWith(expect.objectContaining({
      existingConditionsInventory: expect.objectContaining({ summary: expect.any(String) }),
      programFit: expect.objectContaining({ achievedPercent: 95 }),
      scopeSummary: expect.objectContaining({ reuseStrategy: expect.any(String) }),
      renderingStatus: expect.objectContaining({ status: "ready" }),
    }));
  });
});

describe("program-fit reporting and deterministic renderer", () => {
  it("derives inventory, fit rows, scope summary, and ready render status from synthetic geometry", () => {
    const geometry = parseFloorPlanGeometry({ totalSqFt: 12000 });
    const requested = [
      { type: "Open Workspace", count: 1, sqFt: 5200 },
      { type: "Conference Room", count: 4, sqFt: 300 },
      { type: "Phone Booth", count: 4, sqFt: 45 },
      { type: "Break Room", count: 1, sqFt: 650 },
    ];
    const achieved = [
      { type: "Open Workspace", count: 1, sqFt: 5000 },
      { type: "Conference Room", count: 4, sqFt: 280 },
      { type: "Phone Booth", count: 3, sqFt: 45 },
      { type: "Break Room", count: 1, sqFt: 650 },
    ];

    const inventory = deriveExistingConditionsInventory(geometry, requested, 60);
    const fit = buildProgramFitSummary("Moderate Build-Out", "medium", requested, achieved, 60, inventory);
    const scope = buildScopeSummary("Moderate Build-Out", "medium", inventory, fit);
    const status = buildRenderingStatus(geometry, true);

    expect(inventory.summary).toContain("Existing conditions");
    expect(fit.achievedPercent).toBeGreaterThan(80);
    expect(fit.rows.some(row => row.programItem === "Workstations")).toBe(true);
    expect(scope.budgetScheduleRationale).toContain("selective demolition");
    expect(status.status).toBe("ready");
  });

  it("uses the 50 SF workstation standard and planning style rather than industry alone for requested program math", () => {
    const openProgram = buildRequestedProgramFromInputs(40, "Open / Collaborative", "");
    const privateProgram = buildRequestedProgramFromInputs(40, "Private / Enclosed", "");
    const openWorkspace = openProgram.find(row => row.type === "Open Workspace");
    const privateOffices = privateProgram.find(row => row.type === "Private Office");

    expect(openWorkspace).toEqual(expect.objectContaining({ count: 1, sqFt: 1900 }));
    expect(privateOffices?.count).toBeGreaterThan(openProgram.find(row => row.type === "Private Office")?.count ?? 0);
  });

  it("marks uploaded-plan placeholder geometry as needs-review and uses source-of-truth demolition ranges by scenario", () => {
    const geometry = parseFloorPlanGeometry({ totalSqFt: 10000, floorPlanUrl: "https://example.com/real-office-plan.pdf" });
    const requested = buildRequestedProgramFromInputs(50, "Balanced Standard", "");
    const inventory = deriveExistingConditionsInventory(geometry, requested, 50);
    const lightFit = buildProgramFitSummary("Light Refresh", "low", requested, requested, 50, inventory);
    const moderateFit = buildProgramFitSummary("Moderate Build-Out", "medium", requested, requested, 50, inventory);
    const fullFit = buildProgramFitSummary("Full Transformation", "high", requested, requested, 50, inventory);

    expect(geometry.reviewRequired).toBe(true);
    expect(geometry.confidence).toBeLessThan(0.5);
    expect(buildRenderingStatus(geometry, true)).toEqual(expect.objectContaining({ status: "needs_review" }));
    expect(buildScopeSummary("Light Refresh", "low", inventory, lightFit).reconfigurationScope).toContain("0% interior wall demolition");
    expect(buildScopeSummary("Moderate Build-Out", "medium", inventory, moderateFit).reconfigurationScope[0]).toContain("10–30%");
    expect(buildScopeSummary("Full Transformation", "high", inventory, fullFit).reconfigurationScope[0]).toContain("80–100%");
  });

  it("passes fixed core elements into deterministic layout blocking so generated rooms avoid the building core", () => {
    const geometry = parseFloorPlanGeometry({ totalSqFt: 10000 });
    const core = geometry.coreElements[0];
    const output = generateTestFit({
      floorplate: geometry.floorplate,
      entryLocation: geometry.entryPoints[0],
      scenario: "balanced-standard",
      label: "Fixed Core Blocking Test",
      program: [
        { type: "Conference Room", count: 2, sqFt: 300 },
        { type: "Private Office", count: 4, sqFt: 120 },
      ],
      context: { coreElements: geometry.coreElements, entryPoints: geometry.entryPoints, windows: geometry.windows, existingInteriorWalls: geometry.existingInteriorWalls },
    });
    const overlapsCore = output.rooms.some(room => !(
      room.position.x + room.width <= core.x || core.x + core.width <= room.position.x || room.position.y + room.height <= core.y || core.y + core.height <= room.position.y
    ));

    expect(output.rooms.length).toBeGreaterThan(0);
    expect(overlapsCore).toBe(false);
  });

  it("renders architectural SVG with shell, core, entries, windows, rooms, and review banner when uploaded geometry needs review", () => {
    const geometry = parseFloorPlanGeometry({ totalSqFt: 10000, floorPlanUrl: "https://example.com/floorplan.pdf" });
    const renderStatus = buildRenderingStatus(geometry, true);
    const output = generateTestFit({
      floorplate: geometry.floorplate,
      entryLocation: geometry.entryPoints[0],
      scenario: "balanced-standard",
      label: "Moderate Build-Out — Acceptance Test",
      program: [
        { type: "Open Workspace", count: 1, sqFt: 4200 },
        { type: "Conference Room", count: 3, sqFt: 300 },
        { type: "Private Office", count: 5, sqFt: 130 },
      ],
      context: {
        impactLevel: "medium",
        coreElements: geometry.coreElements,
        entryPoints: geometry.entryPoints,
        windows: geometry.windows,
        existingInteriorWalls: geometry.existingInteriorWalls,
        renderingStatus: renderStatus,
      },
    });

    expect(output.svg).toContain("<svg");
    expect(output.svg).toContain("PLANNING CONFIDENCE NOTE");
    expect(output.svg).toContain("Primary Suite Entry");
    expect(output.svg).toContain("Restrooms");
    expect(output.svg).toContain("MODERATE BUILD-OUT");
    expect(output.rooms.length).toBeGreaterThan(0);
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
