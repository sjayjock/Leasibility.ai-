/**
 * geometry.ts
 * Low-level 2-D geometry primitives used by the layout engine.
 * All coordinates are in feet (ft). Origin (0,0) = bottom-left of floorplate.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;      // left edge (ft)
  y: number;      // bottom edge (ft)
  width: number;  // ft
  height: number; // ft
}

export interface Corridor {
  id: string;
  axis: "horizontal" | "vertical";
  rect: Rect;
}

// ─── Basic helpers ────────────────────────────────────────────

/** Area of a rectangle in sq ft */
export function area(r: Rect): number {
  return r.width * r.height;
}

/** True if two rectangles overlap (touching edges do NOT count as overlap) */
export function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** True if rect `inner` is fully contained within rect `outer` */
export function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width  <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** Clamp a value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Snap a value to the nearest grid increment (default 1 ft).
 * Used to keep all room dimensions on a clean grid.
 */
export function snap(val: number, grid = 1): number {
  return Math.round(val / grid) * grid;
}

/**
 * Given a target area (sq ft) and a preferred aspect ratio,
 * return the closest integer width × height that fits on a 1-ft grid.
 */
export function dimensionsFromArea(
  targetSqFt: number,
  preferredAspect = 1.5,   // width / height
  minDim = 8,              // minimum side in ft
  maxDim = 60              // maximum side in ft
): { width: number; height: number } {
  const h = clamp(snap(Math.sqrt(targetSqFt / preferredAspect)), minDim, maxDim);
  const w = clamp(snap(targetSqFt / h), minDim, maxDim);
  return { width: w, height: h };
}

/**
 * Return the four edges of a rectangle as line segments
 * (useful for wall-adjacency checks).
 */
export function edges(r: Rect): Array<[Point, Point]> {
  const { x, y, width: w, height: h } = r;
  return [
    [{ x, y }, { x: x + w, y }],              // bottom
    [{ x: x + w, y }, { x: x + w, y: y + h }], // right
    [{ x: x + w, y: y + h }, { x, y: y + h }], // top
    [{ x, y: y + h }, { x, y }],               // left
  ];
}

/**
 * Compute the shared edge length between two rectangles.
 * Returns 0 if they are not adjacent.
 */
export function sharedEdgeLength(a: Rect, b: Rect): number {
  // Horizontal adjacency (share a vertical wall)
  if (Math.abs((a.x + a.width) - b.x) < 0.01 || Math.abs((b.x + b.width) - a.x) < 0.01) {
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    return Math.max(0, overlapY);
  }
  // Vertical adjacency (share a horizontal wall)
  if (Math.abs((a.y + a.height) - b.y) < 0.01 || Math.abs((b.y + b.height) - a.y) < 0.01) {
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    return Math.max(0, overlapX);
  }
  return 0;
}

/**
 * Determine which zone of the floorplate a room falls in.
 * "perimeter" = within `perimeterDepth` ft of any edge.
 * "interior"  = everything else.
 */
export function zoneOf(
  room: Rect,
  floorplate: Rect,
  perimeterDepth = 15
): "perimeter" | "interior" {
  const cx = room.x + room.width / 2;
  const cy = room.y + room.height / 2;
  const nearLeft   = cx - floorplate.x < perimeterDepth;
  const nearRight  = (floorplate.x + floorplate.width)  - cx < perimeterDepth;
  const nearBottom = cy - floorplate.y < perimeterDepth;
  const nearTop    = (floorplate.y + floorplate.height) - cy < perimeterDepth;
  return (nearLeft || nearRight || nearBottom || nearTop) ? "perimeter" : "interior";
}
