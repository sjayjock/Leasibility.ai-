/**
 * layoutEngine.ts
 * Core room placement engine for Leasibility AI.
 *
 * CURRENT APPROACH (v1 — row-based packing):
 *   1. Sort rooms by placementOrder (anchors first).
 *   2. For each room, attempt to place it in the first available
 *      grid cell that does not overlap any placed room or corridor.
 *   3. Rooms are packed left-to-right, top-to-bottom in rows.
 *
 * KNOWN LIMITATIONS (see README § "What Needs to Be Improved"):
 *   - No adjacency scoring — rooms are placed by availability, not proximity.
 *   - No perimeter vs interior zone enforcement.
 *   - Corridor space is not reserved before room placement begins.
 *   - Leftover space at row ends is wasted (no backfill logic).
 *   - No overlap resolution pass after initial placement.
 */

import {
  type Rect,
  type Corridor,
  overlaps,
  contains,
  dimensionsFromArea,
  zoneOf,
  sharedEdgeLength,
  snap,
} from "./geometry";
import { getRules } from "./placementRules";
import { generateCorridors } from "./corridorGenerator";

// ─── Public types ─────────────────────────────────────────────

export interface RoomSpec {
  type: string;
  count: number;
  sqFt: number;   // sq ft per unit
}

export interface PlacedRoom {
  id: string;
  type: string;
  rect: Rect;
  area: number;   // sq ft (actual placed area)
  zone: "perimeter" | "interior";
}

export interface LayoutInput {
  /** Usable rectangular boundary of the floor (in feet). */
  floorplate: Rect;
  /**
   * Entry door location (feet from floorplate origin).
   * Used to anchor Reception and the primary corridor spine.
   */
  entryLocation: { x: number; y: number };
  /** Room program — list of room types with counts and areas. */
  program: RoomSpec[];
  /** Fixed shell/core/restroom/stair/elevator zones that rooms must not overlap. */
  fixedElements?: Rect[];
  /**
   * Design scenario — controls zoning strategy and density.
   * "collaborative-hub"  → open plan, interior focus
   * "balanced-standard"  → mixed perimeter + interior
   * "privacy-first"      → perimeter private offices, interior open
   */
  scenario: "collaborative-hub" | "balanced-standard" | "privacy-first";
}

export interface LayoutOutput {
  /** All successfully placed rooms. */
  rooms: PlacedRoom[];
  /** Generated circulation corridors. */
  corridors: Corridor[];
  /** Rooms that could not be placed due to space constraints. */
  unplacedRooms: Array<{ type: string; count: number; reason: string }>;
  /** Efficiency score: placed area / total floorplate area (0–1). */
  efficiencyScore: number;
  /** Total placed room area in sq ft. */
  placedSqFt: number;
  /** Total corridor area in sq ft. */
  corridorSqFt: number;
  /** Leftover / unassigned area in sq ft. */
  residualSqFt: number;
}

// ─── Scenario density modifiers ──────────────────────────────

const SCENARIO_MODIFIERS: Record<
  LayoutInput["scenario"],
  { perimeterBias: number; openWorkspaceFactor: number }
> = {
  "collaborative-hub":  { perimeterBias: 0.3, openWorkspaceFactor: 1.2 },
  "balanced-standard":  { perimeterBias: 0.5, openWorkspaceFactor: 1.0 },
  "privacy-first":      { perimeterBias: 0.8, openWorkspaceFactor: 0.7 },
};

// ─── Main entry point ─────────────────────────────────────────

/**
 * Generate a room layout for the given floorplate and program.
 *
 * Returns placed rooms, corridors, and placement statistics.
 * Does NOT generate SVG — see svgRenderer.ts for that.
 */
export function generateLayout(input: LayoutInput): LayoutOutput {
  const { floorplate, entryLocation, program, scenario } = input;
  const _modifiers = SCENARIO_MODIFIERS[scenario];

  // Step 1 — Generate corridors first so rooms can avoid them
  const corridors = generateCorridors(floorplate, {
    corridorWidth: 5,
    entryLocation,
  });

  // Step 2 — Build a flat list of individual room instances,
  //           sorted by placementOrder (anchors first)
  const instances: Array<{ type: string; sqFt: number }> = [];
  for (const spec of program) {
    const rules = getRules(spec.type);
    // Insert `count` copies, sorted by placement priority
    for (let i = 0; i < spec.count; i++) {
      instances.push({ type: spec.type, sqFt: spec.sqFt });
    }
  }
  instances.sort((a, b) => getRules(a.type).placementOrder - getRules(b.type).placementOrder);

  // Step 3 — Place rooms using a simple row-based packer
  const placed: PlacedRoom[] = [];
  const unplaced: LayoutOutput["unplacedRooms"] = [];

  // Reserve corridor rects and fixed building elements for collision testing.
  // Good Layout hard rules require core/restrooms/stairs/elevators to remain locked
  // and never be occupied by generated rooms.
  const blockedRects: Rect[] = [
    ...corridors.map(c => c.rect),
    ...(input.fixedElements ?? []),
  ];

  // Grid step for candidate positions (1 ft)
  const GRID = 2;
  const PADDING = 1; // 1 ft gap between rooms

  for (const inst of instances) {
    const rules = getRules(inst.type);
    const { width, height } = dimensionsFromArea(
      inst.sqFt,
      rules.preferredAspect,
      Math.sqrt(rules.minSqFt),
      Math.sqrt(rules.maxSqFt)
    );

    let bestRect: Rect | null = null;
    let bestScore = -Infinity;

    // Scan candidate positions across the floorplate
    for (let cy = floorplate.y; cy + height <= floorplate.y + floorplate.height; cy += GRID) {
      for (let cx = floorplate.x; cx + width <= floorplate.x + floorplate.width; cx += GRID) {
        const candidate: Rect = {
          x: snap(cx, GRID),
          y: snap(cy, GRID),
          width,
          height,
        };

        // Must fit inside floorplate
        if (!contains(floorplate, candidate)) continue;

        // Must not overlap any corridor or already-placed room
        const allBlocked = [...blockedRects, ...placed.map(p => p.rect)];
        if (allBlocked.some(b => overlaps(candidate, b))) continue;

        // Score this position
        const score = scorePosition(candidate, floorplate, placed, rules);
        if (score > bestScore) {
          bestScore = score;
          bestRect = candidate;
        }
      }
    }

    if (bestRect) {
      const id = `${inst.type.toLowerCase().replace(/\s+/g, "-")}-${placed.filter(p => p.type === inst.type).length + 1}`;
      placed.push({
        id,
        type: inst.type,
        rect: bestRect,
        area: bestRect.width * bestRect.height,
        zone: zoneOf(bestRect, floorplate),
      });
    } else {
      unplaced.push({
        type: inst.type,
        count: 1,
        reason: "No valid position found — floorplate may be too small or fully packed",
      });
    }
  }

  // Step 4 — Compute statistics
  const placedSqFt = placed.reduce((s, r) => s + r.area, 0);
  const corridorSqFt = corridors.reduce((s, c) => s + c.rect.width * c.rect.height, 0);
  const totalSqFt = floorplate.width * floorplate.height;
  const residualSqFt = Math.max(0, totalSqFt - placedSqFt - corridorSqFt);
  const efficiencyScore = totalSqFt > 0 ? placedSqFt / totalSqFt : 0;

  return {
    rooms: placed,
    corridors,
    unplacedRooms: unplaced,
    efficiencyScore,
    placedSqFt,
    corridorSqFt,
    residualSqFt,
  };
}

// ─── Position scoring ─────────────────────────────────────────

/**
 * Score a candidate room position.
 * Higher = better. Factors:
 *   +20  correct zone (perimeter vs interior)
 *   +10  per ft of shared wall with a preferred adjacent room type
 *   -5   per ft of shared wall with a non-preferred room type
 *   +5   proximity to entry (for Reception only)
 *
 * IMPROVEMENT OPPORTUNITY:
 *   This scoring function is the primary place to implement
 *   anchor-based placement, perimeter zoning, and adjacency graphs.
 */
function scorePosition(
  candidate: Rect,
  floorplate: Rect,
  placed: PlacedRoom[],
  rules: ReturnType<typeof getRules>
): number {
  let score = 0;

  // Zone preference
  const zone = zoneOf(candidate, floorplate);
  if (rules.preferredZone === "any" || rules.preferredZone === zone) score += 20;
  else score -= 10;

  // Adjacency scoring
  for (const other of placed) {
    const shared = sharedEdgeLength(candidate, other.rect);
    if (shared > 0) {
      if (rules.adjacentTo.includes(other.type as any)) {
        score += shared * 2;   // reward adjacency to preferred neighbours
      } else {
        score -= shared * 0.5; // mild penalty for non-preferred adjacency
      }
    }
  }

  // Prefer positions closer to the top of the floorplate (natural light side)
  if (rules.naturalLight !== "none") {
    const distFromTop = (floorplate.y + floorplate.height) - (candidate.y + candidate.height);
    score += Math.max(0, 10 - distFromTop * 0.2);
  }

  return score;
}
