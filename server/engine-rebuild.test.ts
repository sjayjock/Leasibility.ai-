import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            rooms: [
              { type: "Reception", count: 1 },
              { type: "Large Conference", count: 1 },
              { type: "Conference Room", count: 3 },
              { type: "Break Room", count: 1 },
              { type: "Private Office", count: 6 },
              { type: "Workstation", count: 44 },
              { type: "Phone Booth", count: 6 },
              { type: "Huddle Room", count: 4 },
              { type: "Print/Copy", count: 1 },
              { type: "Storage", count: 1 },
              { type: "IT Closet", count: 1 },
              { type: "Wellness Room", count: 1 },
              { type: "Flexible Collaboration", count: 1 }
            ],
            notes: "Mocked canonical tenant program for rebuild acceptance tests."
          }),
        },
      },
    ],
  }),
}));

vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/generated-test-fit.png" }),
}));

import { estimateBudget } from "./budgetEngine";
import { parseFloorPlanGeometry } from "./floorPlanParser";
import { generateScenarios, getDeskRatio } from "./aiEngine";
import { generateLayout, getCanonicalRoomSpec, type ImpactLevel, type LayoutResult, type RoomSpec } from "./layoutEngine";
import { renderLayoutSvg } from "./svgRenderer";

const TEST_PROGRAM: RoomSpec[] = [
  { ...getCanonicalRoomSpec("Reception", 1), count: 1 },
  { ...getCanonicalRoomSpec("Large Conference", 1), count: 1 },
  { ...getCanonicalRoomSpec("Conference Room", 2), count: 2 },
  { ...getCanonicalRoomSpec("Break Room", 1), count: 1 },
  { ...getCanonicalRoomSpec("Private Office", 4), count: 4 },
  { ...getCanonicalRoomSpec("Workstation", 30), count: 30 },
  { ...getCanonicalRoomSpec("Phone Booth", 4), count: 4 },
  { ...getCanonicalRoomSpec("Huddle Room", 2), count: 2 },
  { ...getCanonicalRoomSpec("Print/Copy", 1), count: 1 },
  { ...getCanonicalRoomSpec("Storage", 1), count: 1 },
  { ...getCanonicalRoomSpec("IT Closet", 1), count: 1 },
  { ...getCanonicalRoomSpec("Wellness Room", 1), count: 1 },
];

async function buildLayoutSet(): Promise<Record<ImpactLevel, LayoutResult>> {
  const geometry = await parseFloorPlanGeometry({ totalSqFt: 10000 });
  return {
    low: generateLayout(geometry, TEST_PROGRAM, "low"),
    medium: generateLayout(geometry, TEST_PROGRAM, "medium"),
    high: generateLayout(geometry, TEST_PROGRAM, "high"),
  };
}

describe("layout engine rebuild acceptance", () => {
  it("computes efficiency scores from deterministic layout coordinates rather than LLM-declared ranges", async () => {
    const scenarios = await generateScenarios({
      propertyName: "Acceptance Test Tower",
      totalSqFt: 10000,
      headcount: 50,
      industry: "Technology",
      market: "Dallas",
    });

    expect(scenarios).toHaveLength(3);
    for (const scenario of scenarios) {
      expect(typeof scenario.efficiencyScore).toBe("number");
      expect(scenario.efficiencyScore).toBe(Math.round((scenario.usableSqFt / scenario.totalSqFt) * 100));
      expect(scenario.layoutSvg).toContain("<svg");
      expect(scenario.layoutSvg).toContain("Primary Suite Entry");
    }
  });

  it("keeps the same requested room program across all three scenarios", async () => {
    const scenarios = await generateScenarios({
      propertyName: "Shared Program Plaza",
      totalSqFt: 10000,
      headcount: 50,
      industry: "Professional Services",
      market: "Chicago",
    });

    const programSignatures = scenarios.map(scenario =>
      scenario.roomBreakdown.map(item => `${item.type}:${item.count}`).sort().join("|")
    );
    expect(new Set(programSignatures).size).toBe(1);
  });

  it("uses the Balanced desk ratio rather than trusting raw LLM workstation counts", async () => {
    const headcount = 50;
    const scenarios = await generateScenarios({
      propertyName: "Workstation Coverage Center",
      totalSqFt: 10000,
      headcount,
      industry: "Technology",
      market: "New York",
      workplaceStrategy: "Balanced",
    });

    const workstationCount = scenarios[0].roomBreakdown
      .filter(item => item.type === "Workstation")
      .reduce((sum, item) => sum + item.count, 0);

    expect(workstationCount).toBe(Math.round(headcount * getDeskRatio("Balanced")));
    expect(getDeskRatio("Collaborative")).toBe(0.7);
    expect(Math.round(45 * getDeskRatio("Collaborative"))).toBe(31);
  });

  it("keeps Light Refresh demolitionPct within the V1.2 0-0.20 range", async () => {
    const { low } = await buildLayoutSet();
    expect(low.demolitionPct).toBeGreaterThanOrEqual(0);
    expect(low.demolitionPct).toBeLessThanOrEqual(0.20);
  });

  it("keeps Moderate Build-Out demolitionPct within the V1.2 0.30-0.60 range", async () => {
    const { medium } = await buildLayoutSet();
    expect(medium.demolitionPct).toBeGreaterThanOrEqual(0.30);
    expect(medium.demolitionPct).toBeLessThanOrEqual(0.60);
  });

  it("keeps Full Transformation demolitionPct within the V1.2 0.70-1.00 range", async () => {
    const { high } = await buildLayoutSet();
    expect(high.demolitionPct).toBeGreaterThanOrEqual(0.70);
    expect(high.demolitionPct).toBeLessThanOrEqual(1.00);
  });

  it("never removes protected walls", async () => {
    const results = Object.values(await buildLayoutSet());
    results.forEach(result => {
      const removedProtected = result.demolishedWalls.filter(wall => wall.isProtected);
      expect(removedProtected).toHaveLength(0);
    });
  });

  it("uses minimum intervention for Light Refresh", async () => {
    const { low } = await buildLayoutSet();
    expect(low.demolitionPct).toBeLessThanOrEqual(0.20);
    expect(low.scenarioMode).toBe("minimum-intervention");
  });

  it("places an identical room-type program across all three generated layout modes", async () => {
    const { low, medium, high } = await buildLayoutSet();
    const signature = (result: LayoutResult) => result.placedRooms.map(room => room.type).sort();
    expect(signature(low)).toEqual(signature(medium));
    expect(signature(medium)).toEqual(signature(high));
  });

  it("renders SVG output with required wall-first layers", async () => {
    const geometry = await parseFloorPlanGeometry({ totalSqFt: 10000 });
    const layout = generateLayout(geometry, TEST_PROGRAM, "low");
    const svg = renderLayoutSvg({ geometry, layout, scenarioName: "Light Refresh", impactLevel: "low" });
    expect(svg).toContain('id="perimeter"');
    expect(svg).toContain('id="floor-fill"');
    expect(svg).toContain('id="rooms"');
    expect(svg).toContain('id="title-block"');
    expect(svg).toContain('id="protected-walls"');
    expect(svg).toContain('id="demolished-walls"');
    expect(svg).toContain('id="new-walls"');
  });

  it("computes efficiency score directly from placed room area", async () => {
    const { low } = await buildLayoutSet();
    const computedScore = Math.round(
      low.placedRooms.reduce((sum, room) => sum + room.sqFt, 0) / 10000 * 100
    );
    expect(low.efficiencyScore).toBe(computedScore);
  });

  it("keeps Light Refresh schedule within the calibrated 8-14 week range", async () => {
    const { low } = await buildLayoutSet();
    const lightBudget = estimateBudget(low, "low", "Dallas");
    expect(lightBudget.scheduleWeeksLow).toBeGreaterThanOrEqual(8);
    expect(lightBudget.scheduleWeeksHigh).toBeLessThanOrEqual(14);
  });
});
