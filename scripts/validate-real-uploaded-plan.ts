import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateScenarios } from "../server/aiEngine";
import { parseFloorPlanGeometry } from "../server/floorPlanParser";
import { buildRequestedProgramFromInputs, deriveExistingConditionsInventory } from "../server/programFit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const uploadedPlanPath = "/home/ubuntu/upload/plan.jpg";
const artifactDir = path.join(repoRoot, "docs", "validation", "real-plan-2026-05-01");
fs.mkdirSync(artifactDir, { recursive: true });

const copiedPlanPath = path.join(artifactDir, "uploaded-real-office-plan.jpg");
fs.copyFileSync(uploadedPlanPath, copiedPlanPath);

const input = {
  propertyName: "Real Uploaded Office Plan Validation",
  totalSqFt: 11800,
  headcount: 92,
  industry: "Technology / Professional Services",
  market: "New York",
  floorPlanUrl: copiedPlanPath,
  programNotes: "Programming Mode: Auto\nPlanning Style: Collaborative Mix\nValidation Source: user-uploaded office plan image plan.jpg. The image visibly includes meeting rooms, reception, staff canteen, open office areas, computer facilities, storage, manager offices, restrooms/core/service rooms, perimeter glazing, entries/doors, and interior partitions.",
};

const geometry = parseFloorPlanGeometry({ totalSqFt: input.totalSqFt, floorPlanUrl: input.floorPlanUrl });
const requestedProgram = buildRequestedProgramFromInputs(input.headcount, "Collaborative Mix", input.programNotes);
const existingInventory = deriveExistingConditionsInventory(geometry, requestedProgram, input.headcount);
const scenarios = await generateScenarios(input);

for (const scenario of scenarios) {
  const safeLabel = scenario.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  fs.writeFileSync(path.join(artifactDir, `scenario-${scenario.scenarioNumber}-${safeLabel}.svg`), scenario.layoutSvg);
}

const rows = scenarios.flatMap((scenario) => scenario.programFit.rows.map((row) => ({ scenario: scenario.label, ...row })));
const report = `# Real Uploaded Office Plan Validation — 2026-05-01

This validation artifact uses the uploaded office floor-plan image at \`/home/ubuntu/upload/plan.jpg\`, copied into this repository as \`docs/validation/real-plan-2026-05-01/uploaded-real-office-plan.jpg\`. The validation executes the current Leasibility code path for parser fallback/confidence, requested-program generation, existing-conditions inventory, Light/Moderate/Full scenario generation, deterministic test-fit rendering, achieved-vs-requested reporting, and cost/schedule reporting.

> **Acceptance caveat:** The current parser still uses a deterministic uploaded-plan fallback rather than computer-vision extraction from the actual pixels. The uploaded image is real, and the output is generated from the app code path using that uploaded-plan flag, but category-level extraction from the drawing content remains a next repair priority.

## Input

| Field | Value |
|---|---:|
| Property | ${input.propertyName} |
| Market | ${input.market} |
| Total area | ${input.totalSqFt.toLocaleString()} SF |
| Headcount | ${input.headcount} |
| Planning mode | Auto |
| Planning style | Collaborative Mix |
| Uploaded plan | ${path.relative(repoRoot, copiedPlanPath)} |

## Parser Result And Confidence Summary

| Parser Field | Result |
|---|---|
| Source | ${geometry.source} |
| Floorplate | x=${geometry.floorplate.x}, y=${geometry.floorplate.y}, w=${geometry.floorplate.width}, h=${geometry.floorplate.height} |
| Core/restroom/stair/elevator elements | ${geometry.coreElements.length} detected / protected |
| Entries / egress points | ${geometry.entryPoints.length} detected |
| Window / glazing segments | ${geometry.windows.length} detected |
| Existing interior walls | ${geometry.existingInteriorWalls.length} detected |
| Overall confidence | ${(geometry.confidence * 100).toFixed(0)}% |
| Review required | ${geometry.reviewRequired ? "Yes" : "No"} |
| Review reasons | ${geometry.reviewReasons.join("; ") || "None"} |

## Existing Conditions Inventory

| Category | Count | Est. SF | Location | Reuse Potential | Confidence | Notes |
|---|---:|---:|---|---|---:|---|
${[...existingInventory.fixedElements, ...existingInventory.reusableZones, ...existingInventory.repurposableZones, ...existingInventory.ambiguousAreas, ...existingInventory.reconfigurationZones].map(item => `| ${item.category} | ${item.count} | ${item.estimatedSqFt} | ${item.approximateLocation} | ${item.reusePotential} | ${(item.confidence * 100).toFixed(0)}% | ${item.notes} |`).join("\n")}

## Requested Program

| Room / Program Item | Quantity | SF Each |
|---|---:|---:|
${requestedProgram.map(row => `| ${row.type} | ${row.count} | ${row.sqFt} |`).join("\n")}

## Light / Moderate / Full Scenarios

| Scenario | Impact | Efficiency | Usable SF | Budget Low | Budget Mid | Budget High | Schedule Low | Schedule Mid | Schedule High | Rendering Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
${scenarios.map(s => `| ${s.label} | ${s.impactLevel} | ${s.efficiencyScore}% | ${s.usableSqFt.toLocaleString()} | $${s.budgetLow.toLocaleString()} | $${s.budgetMid.toLocaleString()} | $${s.budgetHigh.toLocaleString()} | ${s.scheduleWeeksLow} wks | ${s.scheduleWeeksMid} wks | ${s.scheduleWeeksHigh} wks | ${s.renderingStatus.status}: ${s.renderingStatus.message} |`).join("\n")}

## Achieved vs Requested Program Comparison

| Scenario | Program Item | Requested | Achieved | Variance | Status | Notes |
|---|---|---:|---:|---:|---|---|
${rows.map(row => `| ${row.scenario} | ${row.programItem} | ${row.requested} | ${row.achieved} | ${row.variance} | ${row.fitStatus} | ${row.notes} |`).join("\n")}

## Scenario Scope And Strategy

${scenarios.map(s => `### ${s.label}\n\n${s.aiSummary}\n\n| Scope Field | Value |\n|---|---|\n| Reuse strategy | ${s.scopeSummary.reuseStrategy} |\n| Retained elements | ${s.scopeSummary.retainedElements.join(", ") || "None listed"} |\n| Repurposed elements | ${s.scopeSummary.repurposedElements.join(", ") || "None listed"} |\n| Reconfiguration scope | ${s.scopeSummary.reconfigurationScope.join("; ")} |\n| Program gaps | ${s.scopeSummary.programGaps.join("; ") || "No major gaps"} |\n| Budget/schedule rationale | ${s.scopeSummary.budgetScheduleRationale} |\n| Plan visual | docs/validation/real-plan-2026-05-01/scenario-${s.scenarioNumber}-${s.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.svg |`).join("\n\n")}

## Project Detail, Shared Report, And Report Artifact Review Notes

The current generated scenario payload includes the fields consumed by the Project Detail and Shared Report views: parser inventory, program-fit summary, scope summary, rendering status, room breakdown, SVG plan visual, budget range, budget breakdown, and schedule phases. The generated Markdown report in this folder is the reviewable report artifact for this validation run; it should be compared in the browser against the Project Detail and Shared Report pages after a staging database record is created from the same uploaded plan.

## Remaining Limitations And Next Repair Priorities

| Priority | Limitation | Next Repair |
|---:|---|---|
| 1 | Uploaded-plan parser uses deterministic fallback geometry and visible-plan notes instead of extracting pixel-level rooms/walls/text from the uploaded image. | Add OCR/CV extraction or an LLM vision parser that returns category-level confidence for floorplate, core, entries, windows, interior walls, and existing program labels. |
| 2 | Real staging acceptance still requires a deployed environment, configured database, and authenticated browser run that creates a Project Detail/Shared Report/PDF from this same uploaded plan. | Deploy the latest branch, apply migrations, upload this plan through the UI, and capture Project Detail, Shared Report, and PDF screenshots/artifacts. |
| 3 | Cost/schedule assumptions are centralized but not yet fully editable in an admin configuration UI. | Add a protected assumptions editor and persist market/scenario assumptions in the database. |
| 4 | Visual refinement has not re-opened the restricted WebP references; current plan visuals remain deterministic architectural SVGs. | After authorization, compare against visual references and tune line weights, legends, labels, and architectural styling without changing deterministic geometry. |
`;

const reportPath = path.join(artifactDir, "real-uploaded-plan-validation-report.md");
fs.writeFileSync(reportPath, report);
fs.writeFileSync(path.join(artifactDir, "real-uploaded-plan-validation-data.json"), JSON.stringify({ input, geometry, requestedProgram, existingInventory, scenarios }, null, 2));

console.log(JSON.stringify({ artifactDir, reportPath, scenarioCount: scenarios.length, confidence: geometry.confidence, reviewRequired: geometry.reviewRequired }, null, 2));
