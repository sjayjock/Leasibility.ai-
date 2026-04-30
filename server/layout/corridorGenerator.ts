/**
 * corridorGenerator.ts
 * Generates the primary circulation spine and secondary branch corridors
 * for a rectangular office floorplate.
 *
 * CURRENT BEHAVIOUR (v1 — simple spine):
 *   - Places a single central horizontal corridor at mid-height.
 *   - Adds a vertical cross-corridor if the floorplate is wide enough.
 *   - Corridor width defaults to 5 ft (ADA minimum for office corridors).
 *
 * KNOWN LIMITATIONS (see README § "What Needs to Be Improved"):
 *   - Corridor does not respond to entry location — it always centres itself.
 *   - No branch corridors are generated for rooms off the main spine.
 *   - Corridor does not avoid reserved core zones (stairs, elevators, restrooms).
 *   - No dead-end detection or loop-back logic.
 */

import type { Rect, Corridor } from "./geometry";

export interface CorridorOptions {
  /** Width of all circulation paths in feet (default 5 ft) */
  corridorWidth?: number;
  /** Minimum floorplate width before a cross-corridor is added (default 80 ft) */
  crossCorridorThreshold?: number;
  /**
   * Entry location hint — future versions should use this to anchor
   * the primary corridor spine toward the entry point.
   */
  entryLocation?: { x: number; y: number };
}

/**
 * Generate corridors for a given floorplate boundary.
 *
 * @param floorplate  The usable rectangular boundary (in feet).
 * @param options     Tuning parameters.
 * @returns           Array of corridor rectangles with metadata.
 */
export function generateCorridors(
  floorplate: Rect,
  options: CorridorOptions = {}
): Corridor[] {
  const corridorWidth = options.corridorWidth ?? 5;
  const crossThreshold = options.crossCorridorThreshold ?? 80;
  const corridors: Corridor[] = [];

  // ── Primary spine: horizontal corridor at vertical midpoint ──
  const spineY = floorplate.y + floorplate.height / 2 - corridorWidth / 2;
  corridors.push({
    id: "primary-spine",
    axis: "horizontal",
    rect: {
      x: floorplate.x,
      y: spineY,
      width: floorplate.width,
      height: corridorWidth,
    },
  });

  // ── Cross-corridor: vertical corridor at horizontal midpoint ──
  // Only added when the floor is wide enough to warrant it.
  if (floorplate.width >= crossThreshold) {
    const crossX = floorplate.x + floorplate.width / 2 - corridorWidth / 2;
    corridors.push({
      id: "cross-corridor",
      axis: "vertical",
      rect: {
        x: crossX,
        y: floorplate.y,
        width: corridorWidth,
        height: floorplate.height,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // TODO — Improvements needed:
  //
  // 1. ENTRY-ANCHORED SPINE
  //    When `options.entryLocation` is provided, the primary spine
  //    should originate at the entry and extend toward the building
  //    core, not simply split the floor in half.
  //
  // 2. BRANCH CORRIDORS
  //    For rooms that cannot directly access the primary spine,
  //    generate short branch corridors (min 5 ft wide) that connect
  //    room clusters to the main circulation path.
  //
  // 3. CORE AVOIDANCE
  //    If the floorplate includes reserved zones (stairs, elevators,
  //    restrooms), corridors should route around them rather than
  //    overlapping.
  //
  // 4. LOOP-BACK / EGRESS
  //    For life-safety compliance, the corridor network should form
  //    a loop or have two distinct egress paths when the floor area
  //    exceeds 5,000 sq ft.
  // ─────────────────────────────────────────────────────────────

  return corridors;
}

/**
 * Return the total corridor area in sq ft.
 */
export function totalCorridorArea(corridors: Corridor[]): number {
  return corridors.reduce((sum, c) => sum + c.rect.width * c.rect.height, 0);
}
