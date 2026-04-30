export type ScenarioImpactLevel = "low" | "medium" | "high";
export type RenderingStatusState = "ready" | "needs_review";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence?: number;
}

export interface CoreElement extends Rect {
  id: string;
  type: "restrooms" | "stairs" | "elevators" | "shaft" | "service" | "core";
  label: string;
  fixed: true;
  confidence?: number;
}

export interface EntryPoint extends Point {
  id: string;
  type: "primary" | "egress";
  label: string;
  confidence?: number;
}

export interface ParsedFloorPlanGeometry {
  floorplate: Rect;
  totalSqFt: number;
  coreElements: CoreElement[];
  entryPoints: EntryPoint[];
  windows: LineSegment[];
  existingInteriorWalls: LineSegment[];
  confidence: number;
  source: "uploaded_plan" | "synthetic_rectangular_model" | "confirmed_fallback_geometry";
  reviewRequired: boolean;
  reviewReasons: string[];
}

export interface RenderRoom {
  id: string;
  type: string;
  rect: Rect;
  area: number;
  zone: "perimeter" | "interior";
  reused?: boolean;
  repurposedFrom?: string;
}

export interface RenderCorridor {
  id: string;
  axis: "horizontal" | "vertical";
  rect: Rect;
}

export interface RenderLayout {
  rooms: RenderRoom[];
  corridors: RenderCorridor[];
  unplacedRooms: Array<{ type: string; count: number; reason: string }>;
  stats: {
    efficiencyScore: number;
    efficiencyPercent: number;
    placedSqFt: number;
    corridorSqFt: number;
    residualSqFt: number;
    totalFloorplateSqFt: number;
  };
}

export interface RenderingStatus {
  status: RenderingStatusState;
  confidence: number;
  reasons: string[];
  message: string;
}

export interface InventoryItem {
  category: string;
  count: number;
  estimatedSqFt: number;
  approximateLocation: string;
  reusePotential: "high" | "medium" | "low" | "fixed" | "ambiguous";
  confidence: number;
  notes: string;
}

export interface ExistingConditionsInventory {
  source: ParsedFloorPlanGeometry["source"];
  confidence: number;
  summary: string;
  reusableZones: InventoryItem[];
  repurposableZones: InventoryItem[];
  fixedElements: InventoryItem[];
  ambiguousAreas: InventoryItem[];
  reconfigurationZones: InventoryItem[];
  existingInteriorWallCount: number;
  reviewRequired: boolean;
  reviewReasons: string[];
}

export interface ProgramFitRow {
  programItem: string;
  requested: number;
  achieved: number;
  variance: number;
  fitStatus: "met" | "partial" | "gap" | "surplus";
  notes: string;
}

export interface ProgramFitSummary {
  scenarioLabel: string;
  achievedPercent: number;
  rows: ProgramFitRow[];
  gaps: ProgramFitRow[];
  interpretation: string;
}

export interface ScopeSummary {
  scenarioLabel: string;
  reuseStrategy: string;
  retainedElements: string[];
  repurposedElements: string[];
  reconfigurationScope: string[];
  programGaps: string[];
  budgetScheduleRationale: string;
}
