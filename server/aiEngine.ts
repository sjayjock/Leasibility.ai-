import { invokeLLM } from "./_core/llm";
import { parseFloorPlanGeometry } from "./floorPlanParser";
import { generateTestFit, type TestFitInput } from "./layout";
import { buildProgramFitSummary, buildRenderingStatus, buildScopeSummary, deriveExistingConditionsInventory } from "./programFit";
import type { ExistingConditionsInventory, ProgramFitSummary, RenderingStatus, ScopeSummary } from "./layout/types";

// ─── Market cost benchmarks ($/sqft) ─────────────────────────
// Light Refresh = reuse existing, cosmetic only
// Moderate Build-Out = partial demo, standard build-back
// Full Transformation = complete rebuild from base building
const MARKET_BENCHMARKS: Record<string, {
  low: { low: number; mid: number; high: number };
  medium: { low: number; mid: number; high: number };
  high: { low: number; mid: number; high: number };
}> = {
  "New York":       { low: { low: 55, mid: 80, high: 110 },   medium: { low: 110, mid: 155, high: 210 },  high: { low: 175, mid: 230, high: 310 } },
  "San Francisco":  { low: { low: 50, mid: 75, high: 105 },   medium: { low: 100, mid: 145, high: 195 },  high: { low: 160, mid: 215, high: 290 } },
  "Los Angeles":    { low: { low: 45, mid: 68, high: 95 },    medium: { low: 90,  mid: 130, high: 175 },  high: { low: 145, mid: 195, high: 260 } },
  "Chicago":        { low: { low: 40, mid: 60, high: 85 },    medium: { low: 80,  mid: 115, high: 155 },  high: { low: 125, mid: 170, high: 225 } },
  "Boston":         { low: { low: 45, mid: 68, high: 95 },    medium: { low: 90,  mid: 130, high: 175 },  high: { low: 145, mid: 195, high: 260 } },
  "Washington DC":  { low: { low: 42, mid: 63, high: 88 },    medium: { low: 85,  mid: 122, high: 165 },  high: { low: 135, mid: 182, high: 242 } },
  "Seattle":        { low: { low: 47, mid: 70, high: 98 },    medium: { low: 94,  mid: 135, high: 182 },  high: { low: 150, mid: 200, high: 268 } },
  "Miami":          { low: { low: 38, mid: 57, high: 80 },    medium: { low: 76,  mid: 110, high: 148 },  high: { low: 120, mid: 162, high: 215 } },
  "Dallas":         { low: { low: 32, mid: 48, high: 68 },    medium: { low: 65,  mid: 94,  high: 127 },  high: { low: 102, mid: 138, high: 184 } },
  "Houston":        { low: { low: 30, mid: 45, high: 64 },    medium: { low: 60,  mid: 88,  high: 118 },  high: { low: 95,  mid: 128, high: 170 } },
  "Atlanta":        { low: { low: 32, mid: 48, high: 68 },    medium: { low: 65,  mid: 94,  high: 127 },  high: { low: 102, mid: 138, high: 184 } },
  "Denver":         { low: { low: 34, mid: 52, high: 73 },    medium: { low: 68,  mid: 99,  high: 133 },  high: { low: 108, mid: 146, high: 194 } },
  "Phoenix":        { low: { low: 29, mid: 44, high: 62 },    medium: { low: 58,  mid: 84,  high: 113 },  high: { low: 92,  mid: 124, high: 165 } },
  "Austin":          { low: { low: 33, mid: 50, high: 70 },    medium: { low: 66,  mid: 96,  high: 130 },  high: { low: 105, mid: 142, high: 188 } },
  "Nashville":       { low: { low: 32, mid: 48, high: 68 },    medium: { low: 64,  mid: 93,  high: 125 },  high: { low: 100, mid: 135, high: 180 } },
  "Charlotte":       { low: { low: 30, mid: 46, high: 65 },    medium: { low: 62,  mid: 90,  high: 121 },  high: { low: 98,  mid: 132, high: 175 } },
  "Minneapolis":     { low: { low: 35, mid: 53, high: 75 },    medium: { low: 70,  mid: 102, high: 137 },  high: { low: 112, mid: 151, high: 200 } },
  "Philadelphia":    { low: { low: 38, mid: 57, high: 80 },    medium: { low: 76,  mid: 110, high: 148 },  high: { low: 120, mid: 162, high: 215 } },
  "San Diego":       { low: { low: 44, mid: 66, high: 93 },    medium: { low: 88,  mid: 127, high: 171 },  high: { low: 140, mid: 190, high: 253 } },
  "Portland":        { low: { low: 40, mid: 60, high: 84 },    medium: { low: 80,  mid: 116, high: 156 },  high: { low: 128, mid: 172, high: 229 } },
  "Detroit":         { low: { low: 27, mid: 41, high: 58 },    medium: { low: 54,  mid: 78,  high: 105 },  high: { low: 86,  mid: 116, high: 154 } },
  "Columbus":        { low: { low: 28, mid: 42, high: 60 },    medium: { low: 56,  mid: 81,  high: 109 },  high: { low: 89,  mid: 120, high: 160 } },
  "Indianapolis":    { low: { low: 27, mid: 40, high: 57 },    medium: { low: 54,  mid: 78,  high: 105 },  high: { low: 85,  mid: 115, high: 152 } },
  "Tampa":           { low: { low: 30, mid: 45, high: 64 },    medium: { low: 60,  mid: 87,  high: 117 },  high: { low: 95,  mid: 128, high: 170 } },
  "default":         { low: { low: 35, mid: 52, high: 74 },    medium: { low: 70,  mid: 102, high: 138 },  high: { low: 112, mid: 150, high: 200 } },
};

// ─── Schedule benchmarks (weeks) ─────────────────────────────
const SCHEDULE_BENCHMARKS = {
  low:    { low: 8,  mid: 12, high: 16 },  // Light Refresh: minimal demo, cosmetic
  medium: { low: 14, mid: 20, high: 26 },  // Moderate Build-Out: partial demo, standard build-back
  high:   { low: 22, mid: 30, high: 40 },  // Full Transformation: complete rebuild, heavy MEP
};

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
  impactLevel: "low" | "medium" | "high";
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

function getMarketBenchmarks(market: string) {
  const key = Object.keys(MARKET_BENCHMARKS).find(k =>
    market?.toLowerCase().includes(k.toLowerCase())
  );
  return MARKET_BENCHMARKS[key ?? "default"];
}

function generateSVGLayout(
  sqFt: number,
  rooms: Array<{ type: string; count: number; sqFt: number }>,
  impactLevel: "low" | "medium" | "high"
): string {
  const W = 800, H = 480;

  // Color palette per impact level
  const palettes = {
    low:    { bg: "#0A1628", room: "#1a3a2a", accent: "#2d6a4a", border: "#4CAF50" },
    medium: { bg: "#0A1628", room: "#1a2d4a", accent: "#2d4a6a", border: "#D4AF37" },
    high:   { bg: "#0A1628", room: "#3a1a1a", accent: "#5a2a2a", border: "#E57373" },
  };
  const pal = palettes[impactLevel];

  const roomColors: Record<string, string> = {
    "Private Office": "#1e3a5f",
    "Conference Room": "#2d5016",
    "Open Workspace": "#1a3a4a",
    "Reception": "#4a2d00",
    "Break Room": "#3a1a4a",
    "Phone Booth": "#1a4a3a",
    "Storage": "#3a3a1a",
    "Collaboration Zone": "#1a2d4a",
    "Huddle Room": "#2d3a1a",
    "Server Room": "#2a1a3a",
    "Focus Room": "#1a3a3a",
    "Lounge": "#3a2a1a",
  };

  let rects = "";
  let x = 20, y = 40;
  const padding = 10;
  const maxRowWidth = W - 40;
  let rowH = 0;

  for (const room of rooms) {
    const area = room.sqFt * room.count;
    const ratio = area / sqFt;
    const w = Math.max(90, Math.min(280, Math.round(ratio * W * 2.4)));
    const h = Math.max(65, Math.min(170, Math.round(w * 0.62)));
    const perCount = Math.min(room.count, 4);
    const itemW = Math.round((w - (perCount - 1) * 3) / perCount);

    if (x + w > maxRowWidth) { x = 20; y += rowH + padding; rowH = 0; }
    rowH = Math.max(rowH, h);

    const fill = roomColors[room.type] ?? pal.room;
    for (let i = 0; i < perCount; i++) {
      const cx = x + i * (itemW + 3);
      rects += `<rect x="${cx}" y="${y}" width="${itemW}" height="${h}" rx="5" fill="${fill}" stroke="${pal.border}" stroke-width="0.8" opacity="0.92"/>`;
      if (i === 0) {
        rects += `<text x="${cx + 7}" y="${y + 17}" font-size="9" fill="${pal.border}" font-family="Inter,sans-serif" font-weight="600">${room.type}</text>`;
        if (room.count > 1) {
          rects += `<text x="${cx + 7}" y="${y + 30}" font-size="8" fill="#ffffff70" font-family="Inter,sans-serif">×${room.count}</text>`;
        }
        rects += `<text x="${cx + 7}" y="${y + h - 10}" font-size="8" fill="#ffffff40" font-family="Inter,sans-serif">${room.sqFt.toLocaleString()} sf</text>`;
      }
    }
    x += w + padding;
  }

  const impactLabels = { low: "LIGHT REFRESH", medium: "MODERATE BUILD-OUT", high: "FULL TRANSFORMATION" };

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="background:${pal.bg};border-radius:12px;width:100%">
  <rect width="${W}" height="${H}" fill="${pal.bg}" rx="12"/>
  <rect x="10" y="10" width="${W-20}" height="${H-20}" fill="none" stroke="${pal.border}" stroke-width="1" stroke-dasharray="5,5" rx="8" opacity="0.25"/>
  <text x="20" y="28" font-size="10" fill="${pal.border}" font-family="Montserrat,sans-serif" font-weight="700" opacity="0.7">${impactLabels[impactLevel]}</text>
  ${rects}
  <text x="${W/2}" y="${H-10}" font-size="9" fill="#D4AF3750" font-family="Montserrat,sans-serif" text-anchor="middle" font-weight="700">LEASIBILITY AI — CONCEPTUAL SPACE PLAN</text>
</svg>`;
}

function buildSchedulePhases(impactLevel: "low" | "medium" | "high", sched: { low: number; mid: number; high: number }) {
  const phases = {
    low: [
      { phase: "Design & Space Planning", weeks: "2–3", description: "Updated furniture layout, finish selections, and minor partition modifications. Minimal permit requirements." },
      { phase: "Cosmetic Demolition", weeks: "1–2", description: "Remove existing finishes, flooring, and fixtures only. No structural or MEP demolition required." },
      { phase: "Finishes & Refresh", weeks: `${Math.round(sched.low * 0.45)}–${Math.round(sched.mid * 0.45)}`, description: "New flooring, paint, lighting upgrades, and minor millwork. Reuse all existing walls and infrastructure." },
      { phase: "FF&E & Technology", weeks: "2–3", description: "Furniture installation, minor IT/AV updates, and signage." },
      { phase: "Punch List & Move-In", weeks: "1", description: "Final walk-through, punch list items, and occupancy." },
    ],
    medium: [
      { phase: "Design & Permitting", weeks: "3–5", description: "Full space planning, construction documents, and permit submission. Some structural review may be required." },
      { phase: "Selective Demolition", weeks: "2–3", description: "Demolish targeted walls and reconfigure layout. Reuse existing MEP infrastructure where possible to reduce cost and time." },
      { phase: "Construction", weeks: `${Math.round(sched.low * 0.45)}–${Math.round(sched.mid * 0.45)}`, description: "New framing, drywall, MEP modifications, flooring, ceilings, and finishes throughout." },
      { phase: "FF&E & IT/AV", weeks: "2–3", description: "Full furniture package, technology infrastructure, and audio-visual systems." },
      { phase: "Punch List & Move-In", weeks: "1–2", description: "Final inspections, certificate of occupancy, and move-in coordination." },
    ],
    high: [
      { phase: "Design & Permitting", weeks: "4–7", description: "Complete architectural and engineering drawings, MEP design, structural review, and full permit package. Landlord approval required." },
      { phase: "Full Demolition", weeks: "3–5", description: "Complete gut demolition — all walls, ceilings, flooring, and MEP systems removed to base building condition." },
      { phase: "MEP Rough-In", weeks: `${Math.round(sched.low * 0.2)}–${Math.round(sched.mid * 0.2)}`, description: "New mechanical, electrical, and plumbing systems installed from scratch. Includes HVAC, sprinkler, and data infrastructure." },
      { phase: "Construction & Finishes", weeks: `${Math.round(sched.low * 0.35)}–${Math.round(sched.mid * 0.35)}`, description: "Framing, drywall, specialty finishes, custom millwork, and all architectural elements." },
      { phase: "FF&E & IT/AV", weeks: "3–4", description: "Full furniture package, comprehensive technology infrastructure, audio-visual systems, and signage program." },
      { phase: "Punch List & Move-In", weeks: "2–3", description: "Final inspections, commissioning, certificate of occupancy, and phased move-in." },
    ],
  };
  return phases[impactLevel];
}

export async function generateScenarios(input: ScenarioInput): Promise<GeneratedScenario[]> {
  const allBenchmarks = getMarketBenchmarks(input.market);
  const sqFt = input.totalSqFt;
  const geometry = await parseFloorPlanGeometry({ totalSqFt: sqFt, floorPlanUrl: input.floorPlanUrl });
  const sqFtPerPerson = sqFt / input.headcount;

  const systemPrompt = `You are a commercial real estate space planning expert and construction cost estimator.
You generate precise, realistic space plans for tenant rep brokers evaluating office spaces.
Always respond with valid JSON only. No markdown, no explanation outside JSON.`;

  const userPrompt = `Generate 3 distinct space planning scenarios for a ${sqFt.toLocaleString()} sq ft office space.

Property: ${input.propertyName}
Market: ${input.market}
Tenant Headcount: ${input.headcount} people
Industry: ${input.industry}
Sq Ft Per Person: ${Math.round(sqFtPerPerson)}
Parsed Floorplate: ${Math.round(geometry.floorplate.width)} ft wide × ${Math.round(geometry.floorplate.height)} ft deep
Geometry Source: ${geometry.source}${geometry.reviewRequired ? " (needs review)" : ""}
${input.programNotes ? `Additional Notes: ${input.programNotes}` : ""}

SCENARIO DEFINITIONS — follow these exactly:

Scenario 1 — LIGHT REFRESH:
- Maximize reuse of existing walls, partitions, and infrastructure
- Meet the program with minimal deviation — work with what is there
- Cosmetic improvements only: new finishes, flooring, paint, furniture
- Label: "Light Refresh"

Scenario 2 — MODERATE BUILD-OUT:
- Fully match the tenant's program requirements
- Reuse some existing walls and MEP infrastructure where logical
- Reconfigure the core layout to optimize for the program
- Standard build-back with selective demolition
- Label: "Moderate Build-Out"

Scenario 3 — FULL TRANSFORMATION:
- Complete demolition and rebuild from base building condition
- No constraints from existing conditions — fully optimized for the tenant
- Best long-term outcome, highest cost, longest timeline
- Label: "Full Transformation"

For each scenario return:
- label: exactly as specified above
- efficiencyScore: 0-100 (usable vs total sqft ratio; Low=72-80, Medium=80-87, High=85-93)
- roomBreakdown: array of {type, count, sqFt} — realistic rooms for ${input.industry} industry
- layoutDescription: 2-3 sentences describing the space feel and key design decisions for this impact level
- aiSummary: 3-4 sentences covering why this scenario fits the tenant, key trade-offs, cost/time implications, and broker talking points

Return JSON: { "scenarios": [ {...}, {...}, {...} ] }`;

  let aiResult: {
    scenarios: Array<{
      label: string;
      efficiencyScore: number;
      roomBreakdown: Array<{ type: string; count: number; sqFt: number }>;
      layoutDescription: string;
      aiSummary: string;
    }>
  };

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "scenarios",
          strict: true,
          schema: {
            type: "object",
            properties: {
              scenarios: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    efficiencyScore: { type: "number" },
                    roomBreakdown: {
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
                      }
                    },
                    layoutDescription: { type: "string" },
                    aiSummary: { type: "string" },
                  },
                  required: ["label", "efficiencyScore", "roomBreakdown", "layoutDescription", "aiSummary"],
                  additionalProperties: false,
                }
              }
            },
            required: ["scenarios"],
            additionalProperties: false,
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    aiResult = typeof content === "string" ? JSON.parse(content) : content;
  } catch (err) {
    console.error("[AI Engine] LLM call failed, using fallback:", err);
    // Fallback: deterministic 3-scenario generation
    const confRooms = Math.max(1, Math.round(input.headcount / 12));
    const privateOffices = Math.max(1, Math.round(input.headcount * 0.1));
    aiResult = {
      scenarios: [
        {
          label: "Light Refresh",
          efficiencyScore: 76,
          roomBreakdown: [
            { type: "Open Workspace", count: 1, sqFt: Math.round(sqFt * 0.50) },
            { type: "Conference Room", count: confRooms, sqFt: 280 },
            { type: "Private Office", count: privateOffices, sqFt: 140 },
            { type: "Break Room", count: 1, sqFt: Math.round(sqFt * 0.07) },
            { type: "Reception", count: 1, sqFt: Math.round(sqFt * 0.04) },
            { type: "Phone Booth", count: Math.max(2, Math.round(input.headcount / 10)), sqFt: 36 },
          ],
          layoutDescription: "Existing walls and infrastructure are preserved. The layout is refreshed with new finishes, furniture, and minor partition adjustments to meet the program with minimal disruption.",
          aiSummary: `This Light Refresh scenario maximizes the existing conditions of the ${sqFt.toLocaleString()} sq ft space. By reusing existing walls and MEP infrastructure, the tenant can occupy faster and at the lowest cost. Ideal for tenants with flexible program requirements or tight timelines. The trade-off is some deviation from the ideal layout.`,
        },
        {
          label: "Moderate Build-Out",
          efficiencyScore: 84,
          roomBreakdown: [
            { type: "Open Workspace", count: 1, sqFt: Math.round(sqFt * 0.42) },
            { type: "Conference Room", count: confRooms + 1, sqFt: 300 },
            { type: "Private Office", count: Math.max(2, Math.round(input.headcount * 0.15)), sqFt: 150 },
            { type: "Collaboration Zone", count: 2, sqFt: Math.round(sqFt * 0.07) },
            { type: "Break Room", count: 1, sqFt: Math.round(sqFt * 0.08) },
            { type: "Reception", count: 1, sqFt: Math.round(sqFt * 0.05) },
            { type: "Phone Booth", count: Math.max(2, Math.round(input.headcount / 8)), sqFt: 36 },
          ],
          layoutDescription: "The layout is reconfigured to fully match the tenant's program. Existing MEP infrastructure is reused where possible, with selective demolition of walls that conflict with the optimized plan.",
          aiSummary: `This Moderate Build-Out scenario fully delivers the tenant's program for ${input.headcount} people in ${input.industry}. Selective demolition and reuse of existing infrastructure balances cost and outcome. This is the most common scenario — it gives the tenant what they need without the time and expense of a complete rebuild. The broker can present this as the smart, balanced choice.`,
        },
        {
          label: "Full Transformation",
          efficiencyScore: 90,
          roomBreakdown: [
            { type: "Open Workspace", count: 1, sqFt: Math.round(sqFt * 0.38) },
            { type: "Conference Room", count: confRooms + 2, sqFt: 320 },
            { type: "Private Office", count: Math.max(3, Math.round(input.headcount * 0.2)), sqFt: 160 },
            { type: "Collaboration Zone", count: 3, sqFt: Math.round(sqFt * 0.07) },
            { type: "Break Room", count: 1, sqFt: Math.round(sqFt * 0.09) },
            { type: "Reception", count: 1, sqFt: Math.round(sqFt * 0.06) },
            { type: "Phone Booth", count: Math.max(4, Math.round(input.headcount / 6)), sqFt: 36 },
            { type: "Lounge", count: 1, sqFt: Math.round(sqFt * 0.05) },
          ],
          layoutDescription: "A complete gut and rebuild delivers a fully optimized environment with no constraints from existing conditions. Every square foot is purposefully designed for the tenant's program and culture.",
          aiSummary: `This Full Transformation scenario delivers the best possible long-term outcome for ${input.headcount} people in ${input.industry}. Starting from base building condition allows complete optimization of layout, MEP systems, and finishes. The highest cost and longest timeline are offset by a space built exactly to the tenant's needs — a strong negotiating point for a longer lease term and maximum TI allowance.`,
        },
      ]
    };
  }

  // ─── Build full scenario objects with deterministic geometry, program-fit, and architectural SVG rendering ─────────────────────────
  const impactLevels: Array<"low" | "medium" | "high"> = ["low", "medium", "high"];
  const impactTags = ["Light Refresh", "Moderate Build-Out", "Full Transformation"];
  const requestedProgram = aiResult.scenarios[Math.min(2, aiResult.scenarios.length - 1)]?.roomBreakdown ?? aiResult.scenarios[0]?.roomBreakdown ?? [];
  const existingConditionsInventory = deriveExistingConditionsInventory(geometry, requestedProgram, input.headcount);

  const finalScenarios: GeneratedScenario[] = [];

  for (let idx = 0; idx < Math.min(aiResult.scenarios.length, 3); idx++) {
    const s = aiResult.scenarios[idx];
    const impactLevel = impactLevels[idx];
    const benchmark = allBenchmarks[impactLevel];
    const sched = SCHEDULE_BENCHMARKS[impactLevel];
    // Budget percentages
    const constructionPct = 0.60;
    const ffePct = 0.18;
    const itAvPct = 0.10;
    const softCostsPct = 0.08;
    const tiAllowancePct = 0.04;

    const totalLow  = benchmark.low  * sqFt;
    const totalMid  = benchmark.mid  * sqFt;
    const totalHigh = benchmark.high * sqFt;

    const breakdown = (total: number) => ({
      construction: Math.round(total * constructionPct),
      ffe:          Math.round(total * ffePct),
      itAv:         Math.round(total * itAvPct),
      softCosts:    Math.round(total * softCostsPct),
      tiAllowance:  Math.round(total * tiAllowancePct),
    });

    const rendererScenario: TestFitInput["scenario"] = impactLevel === "low" ? "collaborative-hub" : impactLevel === "medium" ? "balanced-standard" : "privacy-first";
    const testFit = generateTestFit({
      floorplate: geometry.floorplate,
      entryLocation: geometry.entryPoints[0] ?? { x: 0, y: 0 },
      program: s.roomBreakdown,
      scenario: rendererScenario,
      label: `${impactTags[idx]} — ${s.label}`,
      context: {
        impactLevel,
        coreElements: geometry.coreElements,
        entryPoints: geometry.entryPoints,
        windows: geometry.windows,
        existingInteriorWalls: geometry.existingInteriorWalls,
        renderingStatus: buildRenderingStatus(geometry, true),
      },
    });
    const placedRoomArea = testFit.rooms.reduce((sum, room) => sum + room.area, 0);
    const totalAreaForEfficiency = Math.max(1, geometry.totalSqFt || sqFt);
    const computedEfficiencyScore = Math.round((placedRoomArea / totalAreaForEfficiency) * 100);
    const usableSqFt = Math.round(placedRoomArea);
    const programFit = buildProgramFitSummary(s.label, impactLevel, requestedProgram, s.roomBreakdown, input.headcount, existingConditionsInventory);
    const scopeSummary = buildScopeSummary(s.label, impactLevel, existingConditionsInventory, programFit);
    const renderingStatus = buildRenderingStatus(geometry, testFit.svg.length > 0);

    finalScenarios.push({
      scenarioNumber: idx + 1,
      label: s.label,
      impactLevel,
      impactTag: impactTags[idx],
      efficiencyScore: computedEfficiencyScore,
      usableSqFt,
      totalSqFt: totalAreaForEfficiency,
      roomBreakdown: s.roomBreakdown,
      layoutDescription: `${s.layoutDescription} ${scopeSummary.budgetScheduleRationale}`,
      layoutSvg: testFit.svg,
      budgetLow:  totalLow,
      budgetMid:  totalMid,
      budgetHigh: totalHigh,
      costPerSqFtLow:  benchmark.low,
      costPerSqFtMid:  benchmark.mid,
      costPerSqFtHigh: benchmark.high,
      budgetBreakdown: {
        construction: { low: breakdown(totalLow).construction, mid: breakdown(totalMid).construction, high: breakdown(totalHigh).construction },
        ffe:          { low: breakdown(totalLow).ffe,          mid: breakdown(totalMid).ffe,          high: breakdown(totalHigh).ffe },
        itAv:         { low: breakdown(totalLow).itAv,         mid: breakdown(totalMid).itAv,         high: breakdown(totalHigh).itAv },
        softCosts:    { low: breakdown(totalLow).softCosts,    mid: breakdown(totalMid).softCosts,    high: breakdown(totalHigh).softCosts },
        tiAllowance:  { low: breakdown(totalLow).tiAllowance,  mid: breakdown(totalMid).tiAllowance,  high: breakdown(totalHigh).tiAllowance },
      },
      scheduleWeeksLow:  sched.low,
      scheduleWeeksMid:  sched.mid,
      scheduleWeeksHigh: sched.high,
      schedulePhases: buildSchedulePhases(impactLevel, sched),
      aiSummary: `${s.aiSummary} ${programFit.interpretation}`,
      existingConditionsInventory,
      programFit,
      scopeSummary,
      renderingStatus,
    });
  }

  return finalScenarios;
}
