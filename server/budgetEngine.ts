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

type CostRange = { low: number; mid: number; high: number };

const RATES: Record<ImpactLevel, {
  construction: CostRange;
  ffe: CostRange;
  itav: CostRange;
  softCosts: CostRange;
  contingency: number;
  scheduleWeeks: { min: number; max: number };
  demolitionLevel: BudgetEstimate["scopeSummary"]["demolitionLevel"];
}> = {
  low: {
    construction: { low: 15, mid: 22, high: 30 },
    ffe: { low: 10, mid: 15, high: 22 },
    itav: { low: 5, mid: 8, high: 12 },
    softCosts: { low: 4, mid: 6, high: 9 },
    contingency: 0.10,
    scheduleWeeks: { min: 8, max: 14 },
    demolitionLevel: "minimal",
  },
  medium: {
    construction: { low: 55, mid: 80, high: 110 },
    ffe: { low: 25, mid: 38, high: 55 },
    itav: { low: 15, mid: 22, high: 35 },
    softCosts: { low: 12, mid: 18, high: 28 },
    contingency: 0.12,
    scheduleWeeks: { min: 14, max: 22 },
    demolitionLevel: "selective",
  },
  high: {
    construction: { low: 90, mid: 130, high: 180 },
    ffe: { low: 45, mid: 65, high: 95 },
    itav: { low: 25, mid: 38, high: 60 },
    softCosts: { low: 20, mid: 30, high: 45 },
    contingency: 0.15,
    scheduleWeeks: { min: 20, max: 32 },
    demolitionLevel: "substantial",
  },
};

const MARKET_FACTORS: Record<string, number> = {
  "new york": 1.35,
  nyc: 1.35,
  "san francisco": 1.30,
  sf: 1.30,
  boston: 1.25,
  seattle: 1.20,
  "los angeles": 1.18,
  la: 1.18,
  "washington dc": 1.15,
  dc: 1.15,
  chicago: 1.05,
  miami: 1.02,
  austin: 0.98,
  dallas: 0.92,
  atlanta: 0.90,
  phoenix: 0.88,
  "san diego": 0.95,
  denver: 0.95,
  default: 1.00,
};

function marketFactor(market: string | undefined): number {
  const normalized = (market ?? "default").trim().toLowerCase();
  if (MARKET_FACTORS[normalized]) return MARKET_FACTORS[normalized];
  const matched = Object.entries(MARKET_FACTORS).find(([key]) => key !== "default" && normalized.includes(key));
  return matched?.[1] ?? MARKET_FACTORS.default;
}

function roundToNearest(value: number, nearest = 1000): number {
  return Math.round(value / nearest) * nearest;
}

function range(low: number, mid: number, high: number): CostRange {
  return { low, mid, high };
}

function applyMarket(rangeValue: CostRange, factor: number): CostRange {
  return {
    low: Math.round(rangeValue.low * factor),
    mid: Math.round(rangeValue.mid * factor),
    high: Math.round(rangeValue.high * factor),
  };
}

function categoryBudget(costBase: number, rates: CostRange): CostRange {
  return {
    low: roundToNearest(costBase * rates.low),
    mid: roundToNearest(costBase * rates.mid),
    high: roundToNearest(costBase * rates.high),
  };
}

function totalCostPerSqFt(rates: { construction: CostRange; ffe: CostRange; itav: CostRange; softCosts: CostRange; contingency: number }, key: keyof CostRange): number {
  const subtotal = rates.construction[key] + rates.ffe[key] + rates.itav[key] + rates.softCosts[key];
  return Math.round(subtotal * (1 + rates.contingency));
}

function schedulePhases(impactLevel: ImpactLevel): BudgetEstimate["schedulePhases"] {
  if (impactLevel === "low") {
    return [
      { phase: "Field Verification", weeks: "1–2", description: "Confirm existing partitions, protected walls, retained rooms, furniture reuse, and finish scope before pricing." },
      { phase: "Light Refresh", weeks: "5–9", description: "Cosmetic construction, furniture planning, limited data/power adjustments, and targeted make-ready work." },
      { phase: "Move-In Readiness", weeks: "2–3", description: "Furniture, signage, IT/AV, punch work, and final broker/tenant walk-through." },
    ];
  }

  if (impactLevel === "medium") {
    return [
      { phase: "Schematic Test Fit + Pricing", weeks: "2–3", description: "Validate selective demolition, wall-retention logic, adjacency strategy, and contractor budget range." },
      { phase: "Permits + Construction Documents", weeks: "4–6", description: "Document modified rooms, code items, ADA clearances, MEP coordination, and finish package." },
      { phase: "Selective Build-Out", weeks: "8–13", description: "Selective demolition, new partitions, doors, finishes, lighting/data coordination, inspections, and closeout." },
    ];
  }

  return [
    { phase: "Design + Permit Strategy", weeks: "5–7", description: "Full redesign, stakeholder review, permit drawings, engineering coordination, and value engineering." },
    { phase: "Demolition + Rough-In", weeks: "6–10", description: "Substantial interior demolition, MEP rough-in, framing, inspections, and fixed-core coordination." },
    { phase: "Full Build-Out + Commissioning", weeks: "9–15", description: "New partitions, finishes, millwork, furniture, IT/AV, life-safety inspections, and tenant turnover." },
  ];
}

function scopeItems(impactLevel: ImpactLevel, layout: LayoutResult): string[] {
  if (impactLevel === "low") {
    return [
      "Furniture reconfiguration",
      "cosmetic finish refresh",
      `${layout.demolishedWalls.length} targeted interior partition removals`,
      "limited data/power adjustments",
    ];
  }

  if (impactLevel === "medium") {
    return [
      "Selective new partitions",
      `${layout.demolishedWalls.length} prioritized partition removals`,
      `${layout.newWalls.length} new wall segments for conference/support rooms`,
      "workstation neighborhoods",
      "targeted finish and MEP adjustments",
    ];
  }

  return [
    "Comprehensive partition layout",
    "full workplace neighborhood strategy",
    `${layout.demolishedWalls.length} demolished interior wall segments`,
    `${layout.newWalls.length} new wall segments`,
    "complete finish and MEP coordination",
  ];
}

function riskFlags(layout: LayoutResult, impactLevel: ImpactLevel): string[] {
  const flags: string[] = [];
  if (layout.unplacedRooms.length > 0) flags.push("Some requested program items could not be placed within hard spatial constraints.");
  if (layout.efficiencyScore < 72) flags.push("Efficiency is below the target broker benchmark and should be reviewed with an architect.");
  if (layout.programFitPct < 95) flags.push("Program fit is below the preferred 95% threshold; review achieved-vs-requested variance before quoting.");
  if (layout.residualSqFt < 0.05 * (layout.usableSqFt + layout.circulationSqFt)) flags.push("Very low residual area may limit future growth or furniture flexibility.");
  if (impactLevel === "low" && layout.demolitionPct > 0.2) flags.push("Light Refresh demolition exceeds the V1.2 20% ceiling.");
  if (impactLevel === "medium" && (layout.demolitionPct < 0.3 || layout.demolitionPct > 0.6)) flags.push("Moderate Build-Out demolition is outside the V1.2 30–60% target band.");
  if (impactLevel === "high" && layout.demolitionPct > 0 && layout.demolitionPct < 0.7) flags.push("Full Transformation demolition is below the V1.2 70% target band for parsed interior walls.");
  return flags;
}

export function estimateBudget(layout: LayoutResult, impactLevel: ImpactLevel, market?: string): BudgetEstimate {
  const baseRates = RATES[impactLevel];
  const factor = marketFactor(market);
  const rates = {
    construction: applyMarket(baseRates.construction, factor),
    ffe: applyMarket(baseRates.ffe, factor),
    itav: applyMarket(baseRates.itav, factor),
    softCosts: applyMarket(baseRates.softCosts, factor),
    contingency: baseRates.contingency,
  };
  const costBase = Math.max(layout.usableSqFt + layout.circulationSqFt, 1);

  const construction = categoryBudget(costBase, rates.construction);
  const ffe = categoryBudget(costBase, rates.ffe);
  const itAv = categoryBudget(costBase, rates.itav);
  const softCosts = categoryBudget(costBase, rates.softCosts);
  const subtotal = {
    low: construction.low + ffe.low + itAv.low + softCosts.low,
    mid: construction.mid + ffe.mid + itAv.mid + softCosts.mid,
    high: construction.high + ffe.high + itAv.high + softCosts.high,
  };
  const contingency = {
    low: roundToNearest(subtotal.low * baseRates.contingency),
    mid: roundToNearest(subtotal.mid * baseRates.contingency),
    high: roundToNearest(subtotal.high * baseRates.contingency),
  };

  const budgetLow = roundToNearest(subtotal.low + contingency.low);
  const budgetMid = roundToNearest(subtotal.mid + contingency.mid);
  const budgetHigh = roundToNearest(subtotal.high + contingency.high);
  const scheduleLow = baseRates.scheduleWeeks.min;
  const scheduleHigh = baseRates.scheduleWeeks.max;

  return {
    budgetLow,
    budgetMid,
    budgetHigh,
    costPerSqFtLow: totalCostPerSqFt(rates, "low"),
    costPerSqFtMid: totalCostPerSqFt(rates, "mid"),
    costPerSqFtHigh: totalCostPerSqFt(rates, "high"),
    budgetBreakdown: {
      construction,
      ffe,
      itAv,
      softCosts,
      tiAllowance: contingency,
    },
    scheduleWeeksLow: scheduleLow,
    scheduleWeeksMid: Math.round((scheduleLow + scheduleHigh) / 2),
    scheduleWeeksHigh: scheduleHigh,
    schedulePhases: schedulePhases(impactLevel),
    scopeSummary: {
      retainedElements: ["Building perimeter", "primary suite entry", "window line", "fixed core/restrooms", `${layout.keptWalls.length} retained/protected wall segments`, "ADA circulation intent"],
      newConstruction: scopeItems(impactLevel, layout),
      demolitionLevel: baseRates.demolitionLevel,
      riskFlags: riskFlags(layout, impactLevel),
    },
  };
}
