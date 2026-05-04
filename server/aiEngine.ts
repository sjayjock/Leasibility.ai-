import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { parseFloorPlanGeometry, toParsedFloorPlanGeometry, type FloorplateGeometry } from "./floorPlanParser";
import { estimateBudget } from "./budgetEngine";
import { generateLayout, getCanonicalRoomSpec, type ImpactLevel, type LayoutResult, type RoomSpec } from "./layoutEngine";
import { renderLayoutSvg } from "./svgRenderer";
import { buildProgramFitSummary, buildRenderingStatus, buildScopeSummary, deriveExistingConditionsInventory } from "./programFit";
import type { ExistingConditionsInventory, ProgramFitSummary, RenderingStatus, ScopeSummary } from "./layout/types";

export interface ScenarioInput {
  propertyName: string;
  totalSqFt: number;
  headcount: number;
  industry: string;
  market: string;
  floorPlanUrl?: string;
  programNotes?: string;
}

export interface GeneratedScenario {
  scenarioNumber: number;
  label: string;
  impactLevel: ImpactLevel;
  impactTag: string;
  efficiencyScore: number;
  usableSqFt: number;
  totalSqFt: number;
  roomBreakdown: Array<{ type: string; count: number; sqFt: number }>;
  layoutDescription: string;
  layoutSvg: string;
  layoutImageUrl?: string;
  budgetLow: number;
  budgetMid: number;
  budgetHigh: number;
  costPerSqFtLow: number;
  costPerSqFtMid: number;
  costPerSqFtHigh: number;
  budgetBreakdown: {
    construction: { low: number; mid: number; high: number };
    ffe: { low: number; mid: number; high: number };
    itAv: { low: number; mid: number; high: number };
    softCosts: { low: number; mid: number; high: number };
    tiAllowance: { low: number; mid: number; high: number };
  };
  scheduleWeeksLow: number;
  scheduleWeeksMid: number;
  scheduleWeeksHigh: number;
  schedulePhases: Array<{ phase: string; weeks: string; description: string }>;
  aiSummary: string;
  existingConditionsInventory: ExistingConditionsInventory;
  programFit: ProgramFitSummary;
  scopeSummary: ScopeSummary;
  renderingStatus: RenderingStatus;
}

type ProgramItem = { type: string; count: number; sqFt?: number };

interface ProgramResponse {
  rooms: ProgramItem[];
  notes?: string;
}

const IMPACT_LEVELS: ImpactLevel[] = ["low", "medium", "high"];
const SCENARIO_LABELS = ["Light Refresh", "Moderate Build-Out", "Full Transformation"] as const;

function cleanCount(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.round(numeric));
}

function normalizeRoomType(type: string): string {
  return getCanonicalRoomSpec(type).type;
}

function combineProgram(items: ProgramItem[]): ProgramItem[] {
  const map = new Map<string, ProgramItem>();
  for (const item of items) {
    const type = normalizeRoomType(item.type);
    const count = cleanCount(item.count, 0);
    if (count <= 0) continue;
    const rule = getCanonicalRoomSpec(type, count);
    const sqFt = Math.max(rule.minSqFt, Math.min(rule.maxSqFt, Math.round(Number(item.sqFt) || rule.targetSqFt)));
    const existing = map.get(type);
    if (existing) {
      existing.count += count;
      existing.sqFt = Math.round(((existing.sqFt ?? sqFt) + sqFt) / 2);
    } else {
      map.set(type, { type, count, sqFt });
    }
  }
  return Array.from(map.values());
}

function deterministicProgram(input: ScenarioInput): ProgramItem[] {
  const headcount = Math.max(1, input.headcount);
  const conferenceRooms = Math.max(1, Math.ceil(headcount / 18));
  const privateOffices = Math.max(1, Math.round(headcount * 0.12));
  const phoneBooths = Math.max(1, Math.ceil(headcount / 8));
  const huddleRooms = Math.max(1, Math.ceil(headcount / 12));
  const collaborationZones = Math.max(1, Math.ceil(headcount / 35));
  const program: ProgramItem[] = [
    { type: "Reception", count: 1 },
    { type: "Large Conference", count: headcount >= 18 ? 1 : 0 },
    { type: "Conference Room", count: conferenceRooms },
    { type: "Break Room", count: 1, sqFt: Math.max(160, Math.min(420, Math.round(headcount * 8))) },
    { type: "Private Office", count: privateOffices },
    { type: "Workstation", count: Math.max(Math.ceil(headcount * 0.8), headcount - privateOffices) },
    { type: "Phone Booth", count: phoneBooths },
    { type: "Huddle Room", count: huddleRooms },
    { type: "Print/Copy", count: 1 },
    { type: "Storage", count: 1 },
    { type: "IT Closet", count: 1 },
    { type: "Wellness Room", count: 1 },
    { type: "Collaboration Zone", count: collaborationZones },
  ];

  return combineProgram(program);
}

function targetProgramArea(items: ProgramItem[]): number {
  return items.reduce((sum, item) => {
    const rule = getCanonicalRoomSpec(item.type);
    return sum + (item.sqFt ?? rule.targetSqFt) * item.count;
  }, 0);
}

function ensureProgramFillsSellableSuite(input: ScenarioInput, items: ProgramItem[]): ProgramItem[] {
  const current = targetProgramArea(items);
  const target = input.totalSqFt * 0.83;
  const remaining = Math.max(0, Math.round(target - current));
  if (remaining < 150) return combineProgram(items);
  return combineProgram([
    ...items,
    { type: "Flexible Collaboration", count: 1, sqFt: Math.min(Math.max(remaining, 300), Math.max(300, Math.round(input.totalSqFt * 0.28))) },
  ]);
}

function programItemsToSpecs(items: ProgramItem[]): RoomSpec[] {
  return combineProgram(items).map(item => {
    const base = getCanonicalRoomSpec(item.type, item.count);
    const sqFt = item.sqFt ? Math.round(item.sqFt) : base.targetSqFt;
    return {
      ...base,
      count: item.count,
      targetSqFt: Math.max(base.minSqFt, Math.min(Math.max(base.maxSqFt, sqFt), sqFt)),
      maxSqFt: Math.max(base.maxSqFt, sqFt),
    };
  });
}

function specsToRoomBreakdown(specs: RoomSpec[]): Array<{ type: string; count: number; sqFt: number }> {
  return specs.map(spec => ({ type: spec.type, count: spec.count, sqFt: Math.round(spec.targetSqFt) }));
}

async function generateTenantProgram(input: ScenarioInput, geometry: FloorplateGeometry): Promise<ProgramItem[]> {
  const fallback = ensureProgramFillsSellableSuite(input, deterministicProgram(input));
  try {
    const prompt = `Create one tenant program for all three Leasibility scenarios. Return only JSON {"rooms":[{"type":string,"count":number,"sqFt":number}],"notes":string}.
Use exactly these room type names when applicable: Reception, Large Conference, Conference Room, Break Room, Private Office, Workstation, Phone Booth, Huddle Room, Print/Copy, Storage, IT Closet, Wellness Room, Collaboration Zone, Flexible Collaboration.
Requirements: same tenant program for every scenario; Workstation count must support at least 80% of headcount after private offices; include Wellness Room and IT Closet; keep total target room area near 80-86% of suite area; use Workstation not Open Workspace.
Property: ${input.propertyName}; Market: ${input.market}; Industry: ${input.industry}; Headcount: ${input.headcount}; Total SF: ${input.totalSqFt}; Floorplate: ${Math.round(geometry.width)} ft × ${Math.round(geometry.depth)} ft; Shape: ${geometry.shape}; Parser confidence: ${geometry.confidence}. ${input.programNotes ? `User notes: ${input.programNotes}` : ""}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a commercial office programming expert. Return strict JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "tenant_program",
          strict: true,
          schema: {
            type: "object",
            properties: {
              rooms: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    count: { type: "number" },
                    sqFt: { type: "number" },
                  },
                  required: ["type", "count", "sqFt"],
                  additionalProperties: false,
                },
              },
              notes: { type: "string" },
            },
            required: ["rooms", "notes"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) as ProgramResponse : content as unknown as ProgramResponse;
    const rooms = ensureProgramFillsSellableSuite(input, combineProgram(parsed.rooms ?? []));
    if (rooms.length < 8) return fallback;
    return rooms;
  } catch (error) {
    console.error("[AI Engine] Tenant-program LLM failed; using deterministic canonical program:", error);
    return fallback;
  }
}

function summarizeLayout(layout: LayoutResult): string {
  const counts = new Map<string, number>();
  for (const room of layout.placedRooms) counts.set(room.type, (counts.get(room.type) ?? 0) + 1);
  return Array.from(counts.entries()).map(([type, count]) => `${count} ${type}${count === 1 ? "" : "s"}`).join(", ");
}

function achievedBreakdown(layout: LayoutResult): Array<{ type: string; count: number; sqFt: number }> {
  const map = new Map<string, { type: string; count: number; sqFt: number }>();
  for (const room of layout.placedRooms) {
    const existing = map.get(room.type) ?? { type: room.type, count: 0, sqFt: 0 };
    existing.count += 1;
    existing.sqFt += Math.round(room.sqFt);
    map.set(room.type, existing);
  }
  return Array.from(map.values()).map(item => ({ ...item, sqFt: Math.round(item.sqFt / Math.max(1, item.count)) }));
}

function scenarioDescription(label: string, input: ScenarioInput, layout: LayoutResult): string {
  if (label === "Light Refresh") {
    return `Light Refresh preserves the most existing conditions while organizing ${summarizeLayout(layout)} around the fixed core and entry. This is the fastest, lowest-disruption planning path and is best used when the broker needs a credible budget and move-in option without a full architectural engagement.`;
  }
  if (label === "Moderate Build-Out") {
    return `Moderate Build-Out uses selective demolition to improve adjacency, acoustic separation, and workstation support for the ${input.industry} team. It balances outcome, cost, and schedule by keeping protected shell/core elements fixed while rebuilding the most important tenant-facing rooms.`;
  }
  return `Full Transformation treats the interior as a complete rebuild while preserving only protected base-building conditions. The result prioritizes an optimized long-term workplace with the strongest program fit, highest efficiency target, and the clearest broker story for negotiating TI allowance and lease term.`;
}

function aiSummary(label: string, input: ScenarioInput, layout: LayoutResult, fit: ProgramFitSummary): string {
  const gaps = layout.unplacedRooms.length > 0
    ? `Known planning gaps include ${layout.unplacedRooms.map(item => `${item.count} ${item.type}`).join(", ")}.`
    : "The requested program is substantially represented in the generated room coordinates.";
  return `${label} for ${input.propertyName} produces a computed ${layout.efficiencyScore}% room efficiency across ${layout.usableSqFt.toLocaleString()} usable square feet for a ${input.headcount}-person ${input.industry} tenant. ${fit.interpretation} ${gaps} Broker talking point: this option can be compared directly against budget, schedule, and achieved-vs-requested program output instead of relying on a purely visual test fit.`;
}

function reviewMessage(geometry: FloorplateGeometry, renderingStatus: RenderingStatus): string | undefined {
  if (renderingStatus.status !== "needs_review") return undefined;
  return geometry.parseWarnings[0] ?? renderingStatus.message;
}

function buildImagePrompt(input: ScenarioInput, label: string, layout: LayoutResult, geometry: FloorplateGeometry): string {
  const rooms = layout.placedRooms.slice(0, 80).map(room => `${room.type}: x ${room.x}, y ${room.y}, w ${room.width}, d ${room.height}, ${room.sqFt} SF`).join("; ");
  const corridors = layout.placedCorridors.map(corridor => `${corridor.type}: x ${corridor.x}, y ${corridor.y}, w ${corridor.width}, d ${corridor.height}`).join("; ");
  return `Create a clean broker-facing architectural office test-fit rendering for ${input.propertyName}. Scenario: ${label}. Floorplate ${Math.round(geometry.width)} ft by ${Math.round(geometry.depth)} ft, ${geometry.shape}. Preserve the building perimeter, primary entry on ${geometry.entry.wall}, window lines, and fixed core. Draw rooms from these exact coordinates in feet: ${rooms}. Draw circulation from these exact coordinates: ${corridors}. Use a professional black-and-white architectural plan style with subtle color fills and readable labels.`;
}

async function tryGenerateLayoutImage(input: ScenarioInput, label: string, layout: LayoutResult, geometry: FloorplateGeometry): Promise<string | undefined> {
  if (!process.env.BUILT_IN_FORGE_API_URL || !process.env.BUILT_IN_FORGE_API_KEY) return undefined;
  try {
    const result = await generateImage({ prompt: buildImagePrompt(input, label, layout, geometry) });
    return result.url;
  } catch (error) {
    console.error(`[AI Engine] Image generation failed for ${label}; SVG fallback preserved:`, error);
    return undefined;
  }
}

export async function generateScenarios(input: ScenarioInput): Promise<GeneratedScenario[]> {
  const geometry = await parseFloorPlanGeometry({ totalSqFt: input.totalSqFt, floorPlanUrl: input.floorPlanUrl });
  const compatibilityGeometry = toParsedFloorPlanGeometry(geometry);
  const programItems = await generateTenantProgram(input, geometry);
  const programSpecs = programItemsToSpecs(programItems);
  const requestedProgram = specsToRoomBreakdown(programSpecs);
  const existingConditionsInventory = deriveExistingConditionsInventory(compatibilityGeometry, requestedProgram, input.headcount);

  const scenarios: GeneratedScenario[] = [];
  for (let index = 0; index < 3; index += 1) {
    const impactLevel = IMPACT_LEVELS[index];
    const label = SCENARIO_LABELS[index];
    const layout = generateLayout(geometry, programSpecs, impactLevel);
    const achievedProgram = achievedBreakdown(layout);
    const programFit = buildProgramFitSummary(label, impactLevel, requestedProgram, achievedProgram, input.headcount, existingConditionsInventory);
    const legacyScope = buildScopeSummary(label, impactLevel, existingConditionsInventory, programFit);
    const renderingStatus = buildRenderingStatus(compatibilityGeometry, layout.placedRooms.length > 0);
    const budget = estimateBudget(layout, impactLevel, input.market);
    const layoutSvg = renderLayoutSvg({
      geometry,
      layout,
      scenarioName: label,
      impactLevel,
      reviewMessage: reviewMessage(geometry, renderingStatus),
    });
    const layoutImageUrl = await tryGenerateLayoutImage(input, label, layout, geometry);
    const mergedScope: ScopeSummary = {
      ...legacyScope,
      retainedElements: Array.from(new Set([...legacyScope.retainedElements, ...budget.scopeSummary.retainedElements])),
      reconfigurationScope: [...legacyScope.reconfigurationScope, ...budget.scopeSummary.newConstruction, `Demolition level: ${budget.scopeSummary.demolitionLevel}`],
      programGaps: [...legacyScope.programGaps, ...budget.scopeSummary.riskFlags, ...layout.unplacedRooms.map(item => `${item.count} ${item.type}: ${item.reason}`)],
      budgetScheduleRationale: `${legacyScope.budgetScheduleRationale} Budget range is based on ${layout.usableSqFt.toLocaleString()} SF of placed rooms plus ${layout.circulationSqFt.toLocaleString()} SF of circulation and ${input.market || "default"} market cost factors.`,
    };

    scenarios.push({
      scenarioNumber: index + 1,
      label,
      impactLevel,
      impactTag: label,
      efficiencyScore: layout.efficiencyScore,
      usableSqFt: layout.usableSqFt,
      totalSqFt: geometry.totalSqFt,
      roomBreakdown: requestedProgram,
      layoutDescription: scenarioDescription(label, input, layout),
      layoutSvg,
      layoutImageUrl,
      budgetLow: budget.budgetLow,
      budgetMid: budget.budgetMid,
      budgetHigh: budget.budgetHigh,
      costPerSqFtLow: budget.costPerSqFtLow,
      costPerSqFtMid: budget.costPerSqFtMid,
      costPerSqFtHigh: budget.costPerSqFtHigh,
      budgetBreakdown: budget.budgetBreakdown,
      scheduleWeeksLow: budget.scheduleWeeksLow,
      scheduleWeeksMid: budget.scheduleWeeksMid,
      scheduleWeeksHigh: budget.scheduleWeeksHigh,
      schedulePhases: budget.schedulePhases,
      aiSummary: aiSummary(label, input, layout, programFit),
      existingConditionsInventory,
      programFit,
      scopeSummary: mergedScope,
      renderingStatus,
    });
  }

  return scenarios;
}
