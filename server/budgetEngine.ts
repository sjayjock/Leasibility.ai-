import type { ImpactLevel, LayoutResult } from "./layoutEngine";

export interface BudgetEstimate {
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
  scopeSummary: {
    retainedElements: string[];
    newConstruction: string[];
    demolitionLevel: "minimal" | "selective" | "substantial";
    riskFlags: string[];
  };
}

const IMPACT_BASE_COST: Record<ImpactLevel, { low: number; mid: number; high: number; weeks: [number, number, number]; demolitionLevel: BudgetEstimate["scopeSummary"]["demolitionLevel"] }> = {
  low: { low: 65, mid: 85, high: 115, weeks: [6, 9, 12], demolitionLevel: "minimal" },
  medium: { low: 110, mid: 145, high: 195, weeks: [10, 14, 19], demolitionLevel: "selective" },
  high: { low: 170, mid: 225, high: 305, weeks: [16, 22, 30], demolitionLevel: "substantial" },
};

function marketFactor(market: string | undefined): number {
  const value = (market ?? "").toLowerCase();
  if (/new york|nyc|san francisco|sf|boston|seattle|los angeles|la\b/.test(value)) return 1.3;
  if (/austin|dallas|phoenix|atlanta|charlotte|nashville|tampa|orlando|miami/.test(value)) return 0.92;
  if (/chicago|denver|dc|washington|philadelphia/.test(value)) return 1.08;
  return 1;
}

function roundToNearest(value: number, nearest = 1000): number {
  return Math.round(value / nearest) * nearest;
}

function allocate(total: number, ratios: Record<string, number>) {
  return Object.fromEntries(Object.entries(ratios).map(([key, ratio]) => [key, Math.round(total * ratio)]));
}

function range(low: number, mid: number, high: number) {
  return { low, mid, high };
}

export function estimateBudget(layout: LayoutResult, impactLevel: ImpactLevel, market?: string): BudgetEstimate {
  const base = IMPACT_BASE_COST[impactLevel];
  const factor = marketFactor(market);
  const costPerSqFtLow = Math.round(base.low * factor);
  const costPerSqFtMid = Math.round(base.mid * factor);
  const costPerSqFtHigh = Math.round(base.high * factor);
  const costBase = Math.max(layout.usableSqFt + layout.circulationSqFt, 1);

  const budgetLow = roundToNearest(costBase * costPerSqFtLow);
  const budgetMid = roundToNearest(costBase * costPerSqFtMid);
  const budgetHigh = roundToNearest(costBase * costPerSqFtHigh);

  const ratios = { construction: 0.6, ffe: 0.18, itAv: 0.1, softCosts: 0.08, tiAllowance: 0.04 };
  const low = allocate(budgetLow, ratios);
  const mid = allocate(budgetMid, ratios);
  const high = allocate(budgetHigh, ratios);

  const schedulePhases = impactLevel === "low"
    ? [
        { phase: "Field Verification", weeks: "1", description: "Confirm existing conditions, retained walls, and finish scope before pricing." },
        { phase: "Light Refresh", weeks: "3–6", description: "Paint, finish updates, furniture planning, minor electrical/data adjustments, and reuse-focused punch work." },
        { phase: "Move-In Readiness", weeks: "1–2", description: "Install furniture, signage, IT/AV devices, and final broker/tenant walk-through." },
      ]
    : impactLevel === "medium"
      ? [
          { phase: "Schematic Test Fit + Pricing", weeks: "2–3", description: "Validate selective demolition, adjacency strategy, and contractor budget range." },
          { phase: "Permits + Construction Documents", weeks: "3–5", description: "Document modified rooms, egress, ADA clearances, MEP coordination, and finish package." },
          { phase: "Selective Build-Out", weeks: "6–10", description: "Selective demolition, new partitions, doors, finishes, lighting/data coordination, and inspection closeout." },
        ]
      : [
          { phase: "Design + Permit Strategy", weeks: "4–6", description: "Full redesign, stakeholder review, permit drawings, engineering coordination, and value engineering." },
          { phase: "Demolition + Rough-In", weeks: "5–8", description: "Substantial interior demolition, MEP rough-in, framing, inspections, and core coordination." },
          { phase: "Full Build-Out + Commissioning", weeks: "8–14", description: "New partitions, finishes, millwork, furniture, IT/AV, life-safety inspections, and tenant turnover." },
        ];

  const riskFlags: string[] = [];
  if (layout.unplacedRooms.length > 0) riskFlags.push("Some requested program items could not be placed within hard spatial constraints.");
  if (layout.efficiencyScore < 72) riskFlags.push("Efficiency is below the target broker benchmark and should be reviewed with an architect.");
  if (layout.residualSqFt < 0.05 * (layout.usableSqFt + layout.circulationSqFt)) riskFlags.push("Very low residual area may limit future growth or furniture flexibility.");

  return {
    budgetLow,
    budgetMid,
    budgetHigh,
    costPerSqFtLow,
    costPerSqFtMid,
    costPerSqFtHigh,
    budgetBreakdown: {
      construction: range(low.construction, mid.construction, high.construction),
      ffe: range(low.ffe, mid.ffe, high.ffe),
      itAv: range(low.itAv, mid.itAv, high.itAv),
      softCosts: range(low.softCosts, mid.softCosts, high.softCosts),
      tiAllowance: range(low.tiAllowance, mid.tiAllowance, high.tiAllowance),
    },
    scheduleWeeksLow: base.weeks[0],
    scheduleWeeksMid: base.weeks[1],
    scheduleWeeksHigh: base.weeks[2],
    schedulePhases,
    scopeSummary: {
      retainedElements: ["Building perimeter", "primary suite entry", "window line", "fixed core/restrooms", "ADA circulation intent"],
      newConstruction: impactLevel === "low"
        ? ["Furniture reconfiguration", "minor finish refresh", "limited data/power adjustments"]
        : impactLevel === "medium"
          ? ["Selective new partitions", "conference and support rooms", "workstation neighborhoods", "targeted finish and MEP adjustments"]
          : ["Comprehensive partition layout", "full workplace neighborhood strategy", "new collaboration/support suite", "complete finish and MEP coordination"],
      demolitionLevel: base.demolitionLevel,
      riskFlags,
    },
  };
}
