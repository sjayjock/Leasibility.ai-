import { invokeLLM, type MessageContent } from "./_core/llm";

export type ProgramKey =
  | "privateOffices"
  | "workstations"
  | "conferenceRooms"
  | "huddleRooms"
  | "phoneRooms"
  | "collaborationAreas"
  | "reception"
  | "pantryBreakAreas"
  | "supportSpaces";

export const PROGRAM_KEYS: ProgramKey[] = [
  "privateOffices",
  "workstations",
  "conferenceRooms",
  "huddleRooms",
  "phoneRooms",
  "collaborationAreas",
  "reception",
  "pantryBreakAreas",
  "supportSpaces",
];

export const PROGRAM_LABELS: Record<ProgramKey, string> = {
  privateOffices: "Private Offices",
  workstations: "Workstations",
  conferenceRooms: "Conference Rooms",
  huddleRooms: "Huddle Rooms",
  phoneRooms: "Phone / Focus Rooms",
  collaborationAreas: "Collaboration Areas",
  reception: "Reception",
  pantryBreakAreas: "Pantry / Break Areas",
  supportSpaces: "Support Spaces",
};

const ROOM_TO_PROGRAM: Array<{ matcher: RegExp; key: ProgramKey }> = [
  { matcher: /private|office/i, key: "privateOffices" },
  { matcher: /open|workstation|bench|desk|workspace/i, key: "workstations" },
  { matcher: /conference|board|meeting/i, key: "conferenceRooms" },
  { matcher: /huddle/i, key: "huddleRooms" },
  { matcher: /phone|focus|booth/i, key: "phoneRooms" },
  { matcher: /collaboration|lounge|collab|team/i, key: "collaborationAreas" },
  { matcher: /reception|lobby|welcome/i, key: "reception" },
  { matcher: /pantry|break|cafe|kitchen/i, key: "pantryBreakAreas" },
  { matcher: /storage|copy|print|mail|it|server|wellness|support/i, key: "supportSpaces" },
];

export type RequestedProgram = Record<ProgramKey, number> & {
  source: "headcount-derived" | "notes-adjusted";
  assumptions: string[];
};

export interface ExistingProgramItem {
  key: ProgramKey;
  label: string;
  count: number;
  approximateSqFt?: number;
  location?: string;
  reusePotential: "high" | "medium" | "low" | "unknown";
  confidence: number;
  evidence?: string;
}

export interface ExistingConditionsInventory {
  sourceType: "uploaded-plan" | "no-plan" | "heuristic";
  extractionStatus: "extracted" | "needs_review" | "not_available";
  confidence: number;
  items: ExistingProgramItem[];
  fixedConstraints: string[];
  reusableZones: string[];
  reconfigurationZones: string[];
  ambiguousAreas: string[];
  qaWarnings: string[];
  narrative: string;
}

export type AchievedProgram = Record<ProgramKey, number> & {
  fitScore: number;
  accommodatedItems: ProgramKey[];
  gapItems: ProgramKey[];
};

export type FitVarianceRow = {
  key: ProgramKey;
  label: string;
  requested: number;
  achieved: number;
  delta: number;
  status: "met" | "partial" | "gap";
};

export interface ScenarioPlanningMetadata {
  requestedProgram: RequestedProgram;
  existingConditions: ExistingConditionsInventory;
  achievedProgram: AchievedProgram;
  fitVariance: FitVarianceRow[];
  reuseStrategy: string;
  changeSummary: {
    retained: string[];
    repurposed: string[];
    newBuild: string[];
    demolition: string[];
  };
  qaWarnings: string[];
  validationStatus: "pass" | "needs_review";
}

export function deriveRequestedProgram(input: {
  headcount: number;
  totalSqFt: number;
  industry: string;
  programNotes?: string;
}): RequestedProgram {
  const density = input.totalSqFt / Math.max(input.headcount, 1);
  const industry = input.industry.toLowerCase();
  const isPrivateForward = /legal|finance|banking|real estate|professional|government|healthcare/.test(industry);
  const privateRatio = isPrivateForward ? 0.16 : density > 220 ? 0.1 : 0.06;

  const requested: RequestedProgram = {
    privateOffices: Math.max(1, Math.round(input.headcount * privateRatio)),
    workstations: input.headcount,
    conferenceRooms: Math.max(2, Math.ceil(input.headcount / 22)),
    huddleRooms: Math.max(1, Math.ceil(input.headcount / 35)),
    phoneRooms: Math.max(1, Math.ceil(input.headcount / 18)),
    collaborationAreas: Math.max(1, Math.ceil(input.headcount / 40)),
    reception: /legal|finance|real estate|professional|healthcare/.test(industry) ? 1 : 0,
    pantryBreakAreas: input.headcount > 80 ? 2 : 1,
    supportSpaces: Math.max(2, Math.ceil(input.headcount / 45)),
    source: input.programNotes ? "notes-adjusted" : "headcount-derived",
    assumptions: [
      `${input.headcount} seats interpreted as the baseline workstation requirement.`,
      `${Math.round(density)} rentable square feet per person used to calibrate density and private-office ratio.`,
      `${input.industry || "Office"} benchmark program applied before reading freeform notes.`,
    ],
  };

  applyProgramNotes(requested, input.programNotes);
  return requested;
}

function applyProgramNotes(requested: RequestedProgram, notes?: string) {
  if (!notes) return;
  const text = notes.toLowerCase();
  const patterns: Array<{ key: ProgramKey; regex: RegExp; label: string }> = [
    { key: "privateOffices", regex: /(\d+)\s+(?:private\s+)?offices?/, label: "private office count" },
    { key: "workstations", regex: /(\d+)\s+(?:workstations?|desks?|seats?)/, label: "workstation count" },
    { key: "conferenceRooms", regex: /(\d+)\s+(?:large\s+|small\s+)?(?:conference|meeting|board)\s+rooms?/, label: "conference room count" },
    { key: "huddleRooms", regex: /(\d+)\s+huddle\s+rooms?/, label: "huddle room count" },
    { key: "phoneRooms", regex: /(\d+)\s+(?:phone|focus)\s+(?:rooms?|booths?)/, label: "phone/focus room count" },
    { key: "collaborationAreas", regex: /(\d+)\s+(?:collaboration|collab|lounge)\s+(?:areas?|zones?|rooms?)/, label: "collaboration area count" },
    { key: "pantryBreakAreas", regex: /(\d+)\s+(?:pantry|break|cafe|kitchen)\s+(?:areas?|rooms?)/, label: "pantry/break area count" },
    { key: "supportSpaces", regex: /(\d+)\s+(?:storage|copy|print|mail|it|server|support)\s+(?:rooms?|spaces?)/, label: "support space count" },
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match?.[1]) {
      requested[pattern.key] = Number(match[1]);
      requested.assumptions.push(`Program notes override applied for ${pattern.label}: ${Number(match[1])}.`);
    }
  }

  if (/reception|lobby|waiting/.test(text)) requested.reception = Math.max(requested.reception, 1);
  if (/server room|it room/.test(text)) requested.supportSpaces = Math.max(requested.supportSpaces, 1);
}

export function mapRoomBreakdownToProgram(
  rooms: Array<{ type: string; count: number; sqFt: number }>,
  requested: RequestedProgram,
): AchievedProgram {
  const base = Object.fromEntries(PROGRAM_KEYS.map(key => [key, 0])) as Record<ProgramKey, number>;

  for (const room of rooms) {
    const mapped = ROOM_TO_PROGRAM.find(entry => entry.matcher.test(room.type));
    if (!mapped) continue;
    if (mapped.key === "workstations") {
      base.workstations += Math.max(0, Math.round(room.sqFt / 85));
    } else {
      base[mapped.key] += Math.max(0, room.count);
    }
  }

  for (const key of PROGRAM_KEYS) {
    base[key] = Math.min(base[key], Math.max(requested[key] + 2, requested[key]));
  }

  const fitVariance = buildFitVariance(requested, base as AchievedProgram);
  const totalRequested = PROGRAM_KEYS.reduce((sum, key) => sum + requested[key], 0);
  const totalAchievedCapped = PROGRAM_KEYS.reduce((sum, key) => sum + Math.min(base[key], requested[key]), 0);
  const fitScore = totalRequested > 0 ? Math.round((totalAchievedCapped / totalRequested) * 100) : 100;

  return {
    ...(base as Record<ProgramKey, number>),
    fitScore,
    accommodatedItems: fitVariance.filter(row => row.status === "met").map(row => row.key),
    gapItems: fitVariance.filter(row => row.status !== "met").map(row => row.key),
  };
}

export function buildFitVariance(requested: RequestedProgram, achieved: Record<ProgramKey, number>): FitVarianceRow[] {
  return PROGRAM_KEYS.map(key => {
    const delta = achieved[key] - requested[key];
    const status: FitVarianceRow["status"] = delta >= 0 ? "met" : achieved[key] > 0 ? "partial" : "gap";
    return { key, label: PROGRAM_LABELS[key], requested: requested[key], achieved: achieved[key], delta, status };
  });
}

export async function extractExistingConditions(input: {
  propertyName: string;
  totalSqFt: number;
  floorPlanUrl?: string;
  requestedProgram: RequestedProgram;
  programNotes?: string;
}): Promise<ExistingConditionsInventory> {
  if (!input.floorPlanUrl) {
    return buildHeuristicInventory(input, "No floor plan was uploaded; existing-condition extraction requires manual review.", "not_available");
  }

  const isPdf = /\.pdf(?:$|\?)/i.test(input.floorPlanUrl);
  const content: MessageContent[] = [
    {
      type: "text",
      text: `Extract a commercial office existing-conditions program inventory from this uploaded floor plan for ${input.propertyName}. Return only JSON. The inventory must identify existing private offices, workstations, conference rooms, huddle rooms, collaboration areas, reception, pantry/break, phone/focus rooms, support spaces, fixed core/restrooms/stairs/elevators, reusable zones, likely reconfiguration zones, ambiguous areas, and QA warnings. Use counts when visible; use conservative estimates when only partially visible. If the plan is unreadable, set extractionStatus to needs_review and explain why. Total rentable area: ${input.totalSqFt} sf. Requested program summary: ${PROGRAM_KEYS.map(key => `${PROGRAM_LABELS[key]} ${input.requestedProgram[key]}`).join(", ")}. Notes: ${input.programNotes || "none"}`,
    },
    isPdf
      ? { type: "file_url", file_url: { url: input.floorPlanUrl, mime_type: "application/pdf" } }
      : { type: "image_url", image_url: { url: input.floorPlanUrl, detail: "high" } },
  ];

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a senior commercial workplace planner. Return valid JSON only. Do not invent precision; explicitly flag uncertain items." },
        { role: "user", content },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "existing_conditions_inventory",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              extractionStatus: { type: "string", enum: ["extracted", "needs_review"] },
              confidence: { type: "number" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    label: { type: "string" },
                    count: { type: "number" },
                    approximateSqFt: { type: "number" },
                    location: { type: "string" },
                    reusePotential: { type: "string", enum: ["high", "medium", "low", "unknown"] },
                    confidence: { type: "number" },
                    evidence: { type: "string" },
                  },
                  required: ["label", "count", "approximateSqFt", "location", "reusePotential", "confidence", "evidence"],
                },
              },
              fixedConstraints: { type: "array", items: { type: "string" } },
              reusableZones: { type: "array", items: { type: "string" } },
              reconfigurationZones: { type: "array", items: { type: "string" } },
              ambiguousAreas: { type: "array", items: { type: "string" } },
              qaWarnings: { type: "array", items: { type: "string" } },
              narrative: { type: "string" },
            },
            required: ["extractionStatus", "confidence", "items", "fixedConstraints", "reusableZones", "reconfigurationZones", "ambiguousAreas", "qaWarnings", "narrative"],
          },
        },
      },
    });

    const parsed = JSON.parse(String(response.choices[0]?.message?.content || "{}")) as Omit<ExistingConditionsInventory, "sourceType" | "items"> & {
      items: Array<Omit<ExistingProgramItem, "key">>;
    };

    return normalizeInventory({
      sourceType: "uploaded-plan",
      extractionStatus: parsed.extractionStatus,
      confidence: clamp(parsed.confidence, 0, 1),
      items: parsed.items.map(item => ({ ...item, key: classifyProgramLabel(item.label), count: Math.max(0, Math.round(item.count || 0)), confidence: clamp(item.confidence, 0, 1) })),
      fixedConstraints: parsed.fixedConstraints || [],
      reusableZones: parsed.reusableZones || [],
      reconfigurationZones: parsed.reconfigurationZones || [],
      ambiguousAreas: parsed.ambiguousAreas || [],
      qaWarnings: parsed.qaWarnings || [],
      narrative: parsed.narrative || "Existing conditions were extracted from the uploaded plan and should be verified during review.",
    });
  } catch (error) {
    return buildHeuristicInventory(
      input,
      `Automated floor-plan extraction needs review before client use (${error instanceof Error ? error.message : "unknown error"}).`,
      "needs_review",
    );
  }
}

function normalizeInventory(inventory: ExistingConditionsInventory): ExistingConditionsInventory {
  const warnings = [...inventory.qaWarnings];
  if (inventory.confidence < 0.72) warnings.push("Existing-condition extraction confidence is below the MVP publication threshold; review against the source plan.");
  if (inventory.items.length === 0) warnings.push("No usable program items were confidently extracted from the uploaded plan.");
  return { ...inventory, qaWarnings: Array.from(new Set(warnings)), extractionStatus: inventory.confidence < 0.55 ? "needs_review" : inventory.extractionStatus };
}

function buildHeuristicInventory(
  input: { requestedProgram: RequestedProgram; totalSqFt: number },
  warning: string,
  status: ExistingConditionsInventory["extractionStatus"],
): ExistingConditionsInventory {
  return {
    sourceType: status === "not_available" ? "no-plan" : "heuristic",
    extractionStatus: status,
    confidence: status === "not_available" ? 0 : 0.35,
    items: PROGRAM_KEYS.map(key => ({
      key,
      label: PROGRAM_LABELS[key],
      count: key === "workstations" ? Math.round(input.requestedProgram[key] * 0.7) : Math.max(0, Math.floor(input.requestedProgram[key] * 0.65)),
      approximateSqFt: key === "workstations" ? Math.round(input.totalSqFt * 0.42) : undefined,
      location: "Requires confirmation from source plan",
      reusePotential: "unknown",
      confidence: 0.25,
      evidence: "Heuristic placeholder for needs-review workflow; not acceptance evidence.",
    })),
    fixedConstraints: ["Core, restrooms, stairs, elevators, and primary circulation must be preserved unless verified otherwise."],
    reusableZones: [],
    reconfigurationZones: ["Existing plan could not be reliably parsed; intervention zones require human confirmation."],
    ambiguousAreas: ["Uploaded plan geometry and room labels require review before customer publication."],
    qaWarnings: [warning],
    narrative: "The system could not confidently extract existing conditions. Scenarios are generated for diagnostic review and should not be treated as a final architectural test fit until the source plan is verified.",
  };
}

export function buildScenarioMetadata(input: {
  requestedProgram: RequestedProgram;
  existingConditions: ExistingConditionsInventory;
  impactLevel: "low" | "medium" | "high";
  roomBreakdown: Array<{ type: string; count: number; sqFt: number }>;
}): ScenarioPlanningMetadata {
  const achievedProgram = mapRoomBreakdownToProgram(input.roomBreakdown, input.requestedProgram);
  const fitVariance = buildFitVariance(input.requestedProgram, achievedProgram);
  const reuse = PROGRAM_KEYS.filter(key => {
    const existing = sumExisting(input.existingConditions, key);
    return existing > 0 && achievedProgram[key] > 0;
  }).map(key => PROGRAM_LABELS[key]);
  const gaps = fitVariance.filter(row => row.status !== "met").map(row => row.label);
  const fullNeedsReview = input.impactLevel === "high" && achievedProgram.fitScore < 92;
  const qaWarnings = [...input.existingConditions.qaWarnings];

  if (input.existingConditions.extractionStatus !== "extracted") qaWarnings.push("Existing conditions require confirmation before relying on scenario scope, budget, or schedule.");
  if (gaps.length > 0) qaWarnings.push(`Program gaps remain in this scenario: ${gaps.join(", ")}.`);
  if (fullNeedsReview) qaWarnings.push("Full Transformation does not fully achieve the requested program; the shell may be undersized or constrained.");

  const strategyByImpact = {
    low: "Preserve the highest-value existing rooms and repurpose adjacent zones with minimal demolition; remaining variance is presented as feasibility tradeoff, not a software failure.",
    medium: "Retain reusable offices, meeting rooms, pantry, and support areas while selectively demolishing targeted zones to close the highest-priority program gaps.",
    high: "Preserve shell and fixed core while rebuilding interior planning zones around the requested tenant program for best long-term fit.",
  };

  const retained = reuse.length > 0 ? reuse : ["Shell/core constraints and any verified code-required rooms"];
  const repurposed = input.impactLevel === "low"
    ? ["Existing offices/meeting rooms converted where fit variance is minor", "Open work areas re-seated with furniture-first changes"]
    : ["Existing rooms near target sizes reused for the closest requested function"];
  const newBuild = fitVariance.filter(row => row.delta < 0).map(row => row.label);
  const demolition = input.impactLevel === "low"
    ? ["Minimal non-structural finish and furniture changes only"]
    : input.impactLevel === "medium"
      ? ["Selective partition demolition in gap areas", "Targeted MEP modifications where new rooms are added"]
      : ["Full interior partition and finish demolition outside fixed shell/core"];

  return {
    requestedProgram: input.requestedProgram,
    existingConditions: input.existingConditions,
    achievedProgram,
    fitVariance,
    reuseStrategy: strategyByImpact[input.impactLevel],
    changeSummary: {
      retained,
      repurposed,
      newBuild: newBuild.length > 0 ? newBuild : ["Requested program substantially accommodated in this intervention level"],
      demolition,
    },
    qaWarnings: Array.from(new Set(qaWarnings)),
    validationStatus: qaWarnings.length > 0 ? "needs_review" : "pass",
  };
}

function sumExisting(inventory: ExistingConditionsInventory, key: ProgramKey) {
  return inventory.items.filter(item => item.key === key).reduce((sum, item) => sum + item.count, 0);
}

function classifyProgramLabel(label: string): ProgramKey {
  const match = ROOM_TO_PROGRAM.find(entry => entry.matcher.test(label));
  return match?.key || "supportSpaces";
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
