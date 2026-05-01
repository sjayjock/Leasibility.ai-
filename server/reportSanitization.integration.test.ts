import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildReportHtml } from "./pdfRouter";

const diagnosticSummary = "PARSER REVIEW REQUIRED: Needs Review. This indicates input ambiguity, not a software failure.";
const diagnosticSvg = `<svg><text>PARSER REVIEW REQUIRED</text><text>NEEDS REVIEW</text><text>not a software failure</text></svg>`;

describe("client-facing report sanitization integration", () => {
  it("sanitizes legacy diagnostic phrases in generated PDF/report HTML, including stored SVG markup", () => {
    const html = buildReportHtml(
      {
        id: 999,
        userId: 1,
        propertyName: "Regression Test Tower",
        propertyAddress: "100 Market Street",
        totalSqFt: 12000,
        headcount: 80,
        industry: "Technology",
        market: "San Francisco",
        floorPlanUrl: null,
        originalFileName: "plan.png",
        status: "completed",
        analysisType: "auto",
        programmingStyle: "open",
        customNotes: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      [
        {
          id: 1001,
          projectId: 999,
          name: "Light Refresh",
          description: "Regression scenario",
          impactLevel: "low",
          estimatedCostLow: 100000,
          estimatedCostHigh: 150000,
          estimatedTimelineWeeks: 8,
          spaceEfficiency: 87,
          disruptionLevel: "Low",
          aiSummary: diagnosticSummary,
          layoutDescription: "Diagnostic layout",
          layoutSvg: diagnosticSvg,
          roomBreakdown: [],
          budgetBreakdown: null,
          schedulePhases: [],
          existingConditionsInventory: null,
          programFit: { rows: [], gaps: [], achievedPercent: 80, interpretation: diagnosticSummary },
          scopeSummary: null,
          renderingStatus: { status: "needs_review", message: diagnosticSummary, reasons: [], confidence: 0.7 },
          createdAt: new Date(),
        } as any,
      ],
      null
    );

    expect(html).toContain("Planning confidence note");
    expect(html).toContain("Planning Review");
    expect(html).toContain("confirm field conditions");
    expect(html).not.toMatch(/PARSER REVIEW REQUIRED/i);
    expect(html).not.toMatch(/\bNeeds Review\b/i);
    expect(html).not.toMatch(/software failure/i);
  });

  it("keeps authenticated and public report renderers wired to the shared sanitizer", () => {
    const projectDetail = readFileSync("client/src/pages/ProjectDetail.tsx", "utf8");
    const sharedReport = readFileSync("client/src/pages/SharedReport.tsx", "utf8");

    expect(projectDetail).toContain("polishClientFacingText(scenario.aiSummary)");
    expect(projectDetail).toContain("polishClientFacingText(scenario.layoutSvg)");
    expect(projectDetail).toContain("polishClientFacingText(renderingStatus.message)");
    expect(projectDetail).toContain("polishClientFacingText(programFit.interpretation)");

    expect(sharedReport).toContain("polishClientFacingText(scenario.layoutSvg)");
    expect(sharedReport).toContain("polishClientFacingText(renderingStatus.message)");
    expect(sharedReport).toContain("polishClientFacingText(programFit.interpretation)");
  });
});
