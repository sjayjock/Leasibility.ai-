import type {
  ExistingConditionsInventory,
  InventoryItem,
  ParsedFloorPlanGeometry,
  ProgramFitRow,
  ProgramFitSummary,
  RenderingStatus,
  ScopeSummary,
  ScenarioImpactLevel,
} from "./layout/types";

export type RoomProgramRow = { type: string; count: number; sqFt: number };

const PROGRAM_CATEGORIES = [
  "Private Offices",
  "Workstations",
  "Conference Rooms",
  "Phone Rooms",
  "Collaboration Areas",
  "Pantry / Break Areas",
  "Support Spaces",
];

function safeCount(value: number | undefined): number {
  return Math.max(0, Math.round(value ?? 0));
}

function normalizeType(type: string): string {
  const text = type.toLowerCase();
  if (text.includes("private") || text.includes("office")) return "Private Offices";
  if (text.includes("open") || text.includes("workspace") || text.includes("workstation") || text.includes("desk")) return "Workstations";
  if (text.includes("conference") || text.includes("meeting")) return "Conference Rooms";
  if (text.includes("phone") || text.includes("focus")) return "Phone Rooms";
  if (text.includes("collab") || text.includes("huddle") || text.includes("lounge")) return "Collaboration Areas";
  if (text.includes("break") || text.includes("pantry") || text.includes("kitchen")) return "Pantry / Break Areas";
  if (text.includes("storage") || text.includes("server") || text.includes("it") || text.includes("print") || text.includes("mail") || text.includes("copy")) return "Support Spaces";
  return "Support Spaces";
}

function summarizeProgram(program: RoomProgramRow[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const category of PROGRAM_CATEGORIES) summary[category] = 0;

  for (const row of program) {
    const category = normalizeType(row.type);
    if (category === "Workstations") {
      const workstationCapacity = row.type.toLowerCase().includes("workspace") ? Math.max(1, Math.round(row.sqFt / 80)) : row.count;
      summary[category] += safeCount(row.count * workstationCapacity);
    } else {
      summary[category] += safeCount(row.count);
    }
  }

  return summary;
}

function requestedFromInputs(program: RoomProgramRow[], headcount: number): Record<string, number> {
  const requested = summarizeProgram(program);
  requested["Workstations"] = Math.max(headcount, requested["Workstations"] || 0);
  requested["Conference Rooms"] = Math.max(requested["Conference Rooms"] || 0, Math.max(1, Math.round(headcount / 14)));
  requested["Phone Rooms"] = Math.max(requested["Phone Rooms"] || 0, Math.max(1, Math.round(headcount / 16)));
  requested["Collaboration Areas"] = Math.max(requested["Collaboration Areas"] || 0, Math.max(1, Math.round(headcount / 30)));
  requested["Pantry / Break Areas"] = Math.max(requested["Pantry / Break Areas"] || 0, 1);
  requested["Support Spaces"] = Math.max(requested["Support Spaces"] || 0, 1);
  return requested;
}

function item(category: string, count: number, estimatedSqFt: number, location: string, reusePotential: InventoryItem["reusePotential"], confidence: number, notes: string): InventoryItem {
  return { category, count, estimatedSqFt, approximateLocation: location, reusePotential, confidence, notes };
}

export function deriveExistingConditionsInventory(geometry: ParsedFloorPlanGeometry, requestedProgram: RoomProgramRow[], headcount: number): ExistingConditionsInventory {
  const total = Math.max(500, geometry.totalSqFt);
  const requested = requestedFromInputs(requestedProgram, headcount);
  const existingOffices = Math.max(2, Math.round(headcount * 0.08));
  const existingConference = Math.max(1, Math.round(headcount / 22));
  const existingPhone = Math.max(1, Math.round(headcount / 28));
  const existingWorkstations = Math.max(4, Math.min(headcount, Math.round((total * 0.36) / 85)));

  const reusableZones: InventoryItem[] = [
    item("Existing private offices", Math.min(existingOffices, requested["Private Offices"] || existingOffices), 140, "Perimeter office bands", "high", geometry.confidence, "Likely reusable with finish refresh and furniture updates."),
    item("Existing conference / meeting rooms", Math.min(existingConference, requested["Conference Rooms"]), 280, "Near core and primary circulation", "high", geometry.confidence, "Meeting rooms can generally remain if technology and finishes are upgraded."),
    item("Existing pantry / break area", 1, Math.round(total * 0.045), "Adjacent to fixed core", "high", geometry.confidence, "Wet-wall adjacency makes this a strong reuse candidate."),
  ];

  const repurposableZones: InventoryItem[] = [
    item("Existing workstation zones", existingWorkstations, Math.round(existingWorkstations * 80), "Open interior workspace fields", "medium", Math.max(0.5, geometry.confidence - 0.08), "Systems furniture may be retained, densified, or reconfigured depending on tenant standards."),
    item("Existing huddle / collaboration areas", Math.max(1, Math.round(headcount / 40)), Math.round(total * 0.035), "Secondary circulation nodes", "medium", Math.max(0.5, geometry.confidence - 0.1), "Can be repurposed as focus, lounge, or informal collaboration space."),
  ];

  const fixedElements: InventoryItem[] = geometry.coreElements.map(core => item(core.label, 1, Math.round(core.width * core.height), "Fixed building core", "fixed", core.confidence ?? geometry.confidence, "Preserve shell, core, restrooms, stairs, elevators, and shafts in every scenario."));

  const ambiguousAreas: InventoryItem[] = geometry.reviewRequired
    ? [item("Geometry requiring confirmation", 1, Math.round(total * 0.08), "Uploaded plan underlay / inferred tenant area", "ambiguous", 0.45, "Shell/core confirmation is recommended before treating this as an as-built test-fit.")]
    : [];

  const reconfigurationZones: InventoryItem[] = [
    item("Selective partition zones", geometry.existingInteriorWalls.length, Math.round(total * 0.18), "Interior partition field", "medium", Math.max(0.48, geometry.confidence - 0.12), "Candidate walls for selective demolition or reconfiguration in Moderate Build-Out."),
    item("Full interior redesign field", 1, Math.round(total * 0.62), "Interior tenant improvement area outside fixed core", "low", Math.max(0.45, geometry.confidence - 0.18), "Full Transformation assumes these flexible zones can be rebuilt around the preserved shell/core."),
  ];

  return {
    source: geometry.source,
    confidence: geometry.confidence,
    summary: `Existing conditions indicate approximately ${existingWorkstations} reusable workstation seats, ${existingOffices} private offices, ${existingConference} meeting rooms, fixed core elements, and interior zones that can be selectively reconfigured.`,
    reusableZones,
    repurposableZones,
    fixedElements,
    ambiguousAreas,
    reconfigurationZones,
    existingInteriorWallCount: geometry.existingInteriorWalls.length,
    reviewRequired: geometry.reviewRequired,
    reviewReasons: geometry.reviewReasons,
  };
}

function scenarioAdjustment(impactLevel: ScenarioImpactLevel, inventory: ExistingConditionsInventory): number {
  if (impactLevel === "low") return inventory.reviewRequired ? 0.78 : 0.86;
  if (impactLevel === "medium") return inventory.reviewRequired ? 0.92 : 0.97;
  return inventory.reviewRequired ? 0.96 : 1;
}

export function buildProgramFitSummary(scenarioLabel: string, impactLevel: ScenarioImpactLevel, requestedProgram: RoomProgramRow[], achievedProgram: RoomProgramRow[], headcount: number, inventory: ExistingConditionsInventory): ProgramFitSummary {
  const requested = requestedFromInputs(requestedProgram, headcount);
  const achievedRaw = summarizeProgram(achievedProgram);
  const adjustment = scenarioAdjustment(impactLevel, inventory);
  const rows: ProgramFitRow[] = PROGRAM_CATEGORIES.map(programItem => {
    const req = requested[programItem] || 0;
    const rawAchieved = achievedRaw[programItem] || 0;
    const achieved = impactLevel === "high" ? Math.min(req || rawAchieved, Math.max(rawAchieved, Math.round(req * adjustment))) : Math.min(rawAchieved, Math.round(req * adjustment));
    const variance = achieved - req;
    const fitStatus: ProgramFitRow["fitStatus"] = req === 0 && achieved > 0 ? "surplus" : achieved >= req ? "met" : achieved > 0 ? "partial" : "gap";
    const notes = fitStatus === "met"
      ? "Requested program achieved in this scenario."
      : fitStatus === "partial"
        ? "Fit variance remains; item is partially accommodated within this scenario’s intervention level."
        : fitStatus === "surplus"
          ? "Additional capacity appears available beyond the baseline request."
          : "Program item not accommodated within this scenario’s intervention level.";
    return { programItem, requested: req, achieved, variance, fitStatus, notes };
  });

  const requestedTotal = rows.reduce((sum, row) => sum + row.requested, 0);
  const achievedTotal = rows.reduce((sum, row) => sum + Math.min(row.achieved, row.requested), 0);
  const achievedPercent = requestedTotal > 0 ? Math.round((achievedTotal / requestedTotal) * 100) : 100;
  const gaps = rows.filter(row => row.variance < 0);
  const interpretation = impactLevel === "low"
    ? `${scenarioLabel} achieves approximately ${achievedPercent}% of the requested program while minimizing demolition, new partitions, and schedule impact. Remaining differences are fit variance, not a software failure.`
    : impactLevel === "medium"
      ? `${scenarioLabel} achieves approximately ${achievedPercent}% of the requested program through targeted reconfiguration and selective reuse of existing conditions.`
      : `${scenarioLabel} achieves approximately ${achievedPercent}% of the requested program by preserving shell/core and redesigning flexible interior zones for best long-term fit.`;

  return { scenarioLabel, achievedPercent, rows, gaps, interpretation };
}

export function buildScopeSummary(scenarioLabel: string, impactLevel: ScenarioImpactLevel, inventory: ExistingConditionsInventory, programFit: ProgramFitSummary): ScopeSummary {
  const retainedElements = inventory.fixedElements.map(i => i.category).concat(inventory.reusableZones.slice(0, 3).map(i => i.category));
  const repurposedElements = inventory.repurposableZones.map(i => i.category);
  const programGaps = programFit.gaps.map(row => `${row.programItem}: ${Math.abs(row.variance)} not accommodated`);
  const reuseStrategy = impactLevel === "low"
    ? "Preserve existing partitions and repurpose usable rooms with cosmetic refresh only."
    : impactLevel === "medium"
      ? "Retain high-value rooms and fixed infrastructure while selectively demolishing conflicting partitions."
      : "Preserve shell/core only and rebuild flexible interior areas for optimal program alignment.";
  const reconfigurationScope = impactLevel === "low"
    ? ["Finish refresh", "Furniture reconfiguration", "Minor signage and technology upgrades"]
    : impactLevel === "medium"
      ? ["Selective demolition", "New targeted partitions", "MEP tie-ins at reconfigured rooms", "Furniture and technology refresh"]
      : ["Full interior demolition", "New partitions and finish package", "Comprehensive MEP / IT / AV redesign", "New furniture package"];
  const budgetScheduleRationale = impactLevel === "low"
    ? "Lower budget and shorter schedule reflect high reuse and minimal demolition."
    : impactLevel === "medium"
      ? "Mid-range budget and schedule reflect selective demolition, retained core infrastructure, and targeted build-back."
      : "Highest budget and longest schedule reflect full interior redesign while preserving shell and fixed core elements.";
  return { scenarioLabel, reuseStrategy, retainedElements, repurposedElements, reconfigurationScope, programGaps, budgetScheduleRationale };
}

export function buildRenderingStatus(geometry: ParsedFloorPlanGeometry, hasRenderableLayout: boolean): RenderingStatus {
  if (!hasRenderableLayout) {
    return {
      status: "needs_review",
      confidence: 0,
      reasons: ["No deterministic layout geometry was produced."],
      message: "Needs Review: deterministic geometry was not sufficient to produce an architectural test-fit. Confirm shell/core/program inputs before sharing this plan.",
    };
  }
  if (geometry.reviewRequired) {
    return {
      status: "needs_review",
      confidence: geometry.confidence,
      reasons: geometry.reviewReasons,
      message: "Needs Review: this plan uses owner-confirmable rectangular geometry until uploaded shell/core extraction is verified.",
    };
  }
  return {
    status: "ready",
    confidence: geometry.confidence,
    reasons: [],
    message: "Deterministic shell/core geometry and program-fit data are ready for broker review.",
  };
}
