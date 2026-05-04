import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            rooms: [
              { type: "Reception", count: 1, sqFt: 150 },
              { type: "Large Conference", count: 1, sqFt: 400 },
              { type: "Conference Room", count: 3, sqFt: 240 },
              { type: "Break Room", count: 1, sqFt: 260 },
              { type: "Private Office", count: 6, sqFt: 120 },
              { type: "Workstation", count: 44, sqFt: 50 },
              { type: "Phone Booth", count: 6, sqFt: 48 },
              { type: "Huddle Room", count: 4, sqFt: 100 },
              { type: "Print/Copy", count: 1, sqFt: 48 },
              { type: "Storage", count: 1, sqFt: 80 },
              { type: "IT Closet", count: 1, sqFt: 60 },
              { type: "Wellness Room", count: 1, sqFt: 80 },
              { type: "Flexible Collaboration", count: 1, sqFt: 1100 }
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

import { generateScenarios } from "./aiEngine";

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

  it("keeps the same room program across all three scenarios", async () => {
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

  it("preserves workstation capacity for at least 80 percent of headcount", async () => {
    const headcount = 50;
    const scenarios = await generateScenarios({
      propertyName: "Workstation Coverage Center",
      totalSqFt: 10000,
      headcount,
      industry: "Technology",
      market: "New York",
    });

    const workstationCount = scenarios[0].roomBreakdown
      .filter(item => item.type === "Workstation")
      .reduce((sum, item) => sum + item.count, 0);

    expect(workstationCount).toBeGreaterThanOrEqual(Math.ceil(headcount * 0.8));
  });
});
