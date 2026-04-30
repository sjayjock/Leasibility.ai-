import type { CoreElement, EntryPoint, LineSegment, ParsedFloorPlanGeometry, Rect } from "./layout/types";

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export interface ParseFloorPlanInput {
  totalSqFt: number;
  floorPlanUrl?: string;
}

export function buildRectangularFloorplate(totalSqFt: number): Rect {
  const safeArea = Math.max(500, totalSqFt || 5000);
  const aspectRatio = safeArea > 18000 ? 2.05 : safeArea > 9000 ? 1.75 : 1.55;
  const width = Math.sqrt(safeArea * aspectRatio);
  const height = safeArea / width;
  return {
    x: 0,
    y: 0,
    width: round(width),
    height: round(height),
  };
}

function buildDefaultCore(floorplate: Rect): CoreElement[] {
  const coreWidth = Math.max(18, floorplate.width * 0.15);
  const coreHeight = Math.max(20, floorplate.height * 0.24);
  const coreX = floorplate.x + floorplate.width * 0.48 - coreWidth / 2;
  const coreY = floorplate.y + floorplate.height * 0.52 - coreHeight / 2;
  return [
    {
      id: "core-1",
      type: "core",
      label: "Fixed Core / Restrooms",
      x: round(coreX),
      y: round(coreY),
      width: round(coreWidth),
      height: round(coreHeight),
      fixed: true,
      confidence: 0.72,
    },
  ];
}

function buildDefaultEntries(floorplate: Rect): EntryPoint[] {
  return [
    {
      id: "entry-primary",
      type: "primary",
      label: "Primary Suite Entry",
      x: round(floorplate.x + floorplate.width * 0.08),
      y: floorplate.y,
      confidence: 0.7,
    },
    {
      id: "entry-egress",
      type: "egress",
      label: "Secondary Egress",
      x: round(floorplate.x + floorplate.width * 0.92),
      y: round(floorplate.y + floorplate.height),
      confidence: 0.66,
    },
  ];
}

function buildDefaultWindows(floorplate: Rect): LineSegment[] {
  return [
    { x1: floorplate.x + 8, y1: floorplate.y + floorplate.height, x2: floorplate.x + floorplate.width * 0.45, y2: floorplate.y + floorplate.height, confidence: 0.64 },
    { x1: floorplate.x + floorplate.width * 0.55, y1: floorplate.y + floorplate.height, x2: floorplate.x + floorplate.width - 8, y2: floorplate.y + floorplate.height, confidence: 0.64 },
    { x1: floorplate.x + floorplate.width, y1: floorplate.y + floorplate.height * 0.18, x2: floorplate.x + floorplate.width, y2: floorplate.y + floorplate.height * 0.82, confidence: 0.58 },
  ];
}

function buildDefaultInteriorWalls(floorplate: Rect): LineSegment[] {
  const yA = floorplate.y + floorplate.height * 0.32;
  const yB = floorplate.y + floorplate.height * 0.68;
  const xA = floorplate.x + floorplate.width * 0.26;
  const xB = floorplate.x + floorplate.width * 0.72;
  return [
    { x1: xA, y1: floorplate.y + 6, x2: xA, y2: yB, confidence: 0.55 },
    { x1: xB, y1: yA, x2: xB, y2: floorplate.y + floorplate.height - 6, confidence: 0.55 },
    { x1: floorplate.x + 6, y1: yA, x2: floorplate.x + floorplate.width - 6, y2: yA, confidence: 0.5 },
    { x1: floorplate.x + 6, y1: yB, x2: floorplate.x + floorplate.width - 6, y2: yB, confidence: 0.5 },
  ].map(w => ({ x1: round(w.x1), y1: round(w.y1), x2: round(w.x2), y2: round(w.y2), confidence: w.confidence }));
}

export function parseFloorPlanGeometry(input: ParseFloorPlanInput): ParsedFloorPlanGeometry {
  const floorplate = buildRectangularFloorplate(input.totalSqFt);
  const hasUploadedPlan = Boolean(input.floorPlanUrl);
  const reviewReasons = hasUploadedPlan
    ? ["Uploaded plan parsing is represented by V1 rectangular geometry until shell/core confirmation is completed."]
    : ["No uploaded plan was provided; using owner-confirmable rectangular baseline geometry."];

  return {
    floorplate,
    totalSqFt: Math.round(input.totalSqFt || floorplate.width * floorplate.height),
    coreElements: buildDefaultCore(floorplate),
    entryPoints: buildDefaultEntries(floorplate),
    windows: buildDefaultWindows(floorplate),
    existingInteriorWalls: buildDefaultInteriorWalls(floorplate),
    confidence: hasUploadedPlan ? 0.62 : 0.78,
    source: hasUploadedPlan ? "synthetic_rectangular_model" : "synthetic_rectangular_model",
    reviewRequired: hasUploadedPlan,
    reviewReasons,
  };
}
