/**
 * index.ts — Leasibility AI Layout Generation Module
 * ====================================================
 * Single entry point. Import and call `generateTestFit()`.
 *
 * Usage (Node.js / TypeScript):
 *
 *   import { generateTestFit } from "./src/index";
 *   import input from "./sample-input.json";
 *
 *   const result = generateTestFit(input);
 *   console.log(result.rooms);
 *   // Write result.svg to a file for visual inspection
 *
 * No API keys, no database, no auth required.
 * All logic runs synchronously in-process.
 */

import { generateLayout, type LayoutInput, type LayoutOutput } from "./layoutEngine";
import { renderToSVG, type SvgRenderContext } from "./svgRenderer";

// ─── Public input / output types ─────────────────────────────

export interface TestFitInput {
  /**
   * Rectangular floorplate boundary in feet.
   * Origin (0,0) = bottom-left corner of the usable space.
   * Do NOT include core elements (stairs, elevators, restrooms) in this area.
   */
  floorplate: {
    x: number;
    y: number;
    width: number;   // ft
    height: number;  // ft
  };

  /**
   * Location of the primary entry door, in feet from floorplate origin.
   * Used to anchor Reception and the circulation spine.
   */
  entryLocation: {
    x: number;
    y: number;
  };

  /**
   * Room program — what spaces the tenant needs.
   * Each entry specifies a room type, how many, and the target area per unit.
   */
  program: Array<{
    type: string;   // e.g. "Private Office", "Conference Room"
    count: number;  // number of this room type
    sqFt: number;   // target sq ft per unit
  }>;

  /**
   * Design scenario — controls zoning strategy and density.
   *
   * "collaborative-hub"
   *   Adaptive layout. 50% focus / 50% collaboration. 0.7 desks/person.
   *   Open workspace dominates the interior; perimeter used for amenities.
   *
   * "balanced-standard"
   *   Core layout. 65% focus / 35% collaboration. 1 desk/person.
   *   Mix of perimeter private offices and interior open workspace.
   *
   * "privacy-first"
   *   Perimeter layout. 80% focus / 20% collaboration. High private office ratio.
   *   Private offices line the perimeter; open workspace in the interior core.
   */
  scenario: "collaborative-hub" | "balanced-standard" | "privacy-first";

  /** Optional label shown in the SVG footer */
  label?: string;

  /** Optional shell/core/review metadata for architectural report rendering */
  context?: SvgRenderContext;
}

export interface TestFitOutput {
  /**
   * All successfully placed rooms with their final positions and areas.
   */
  rooms: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };  // bottom-left corner in ft
    width: number;   // ft
    height: number;  // ft
    area: number;    // sq ft (actual placed)
    zone: "perimeter" | "interior";
  }>;

  /**
   * Circulation corridors generated for this layout.
   */
  corridors: Array<{
    id: string;
    axis: "horizontal" | "vertical";
    x: number;
    y: number;
    width: number;
    height: number;
  }>;

  /**
   * Rooms that could not be placed due to space constraints.
   */
  unplacedRooms: Array<{
    type: string;
    count: number;
    reason: string;
  }>;

  /** Statistics */
  stats: {
    efficiencyScore: number;    // 0–1 (placed area / total floorplate area)
    efficiencyPercent: number;  // 0–100
    placedSqFt: number;
    corridorSqFt: number;
    residualSqFt: number;
    totalFloorplateSqFt: number;
  };

  /**
   * SVG string — write to a .svg file or embed in HTML for visual inspection.
   * Renders all rooms, corridors, door arcs, labels, and an efficiency badge.
   */
  svg: string;
}

// ─── Main function ────────────────────────────────────────────

/**
 * Generate a test-fit layout for a given floorplate and room program.
 *
 * @param input  Floorplate, entry location, program, and scenario.
 * @returns      Placed rooms, corridors, stats, and SVG string.
 */
export function generateTestFit(input: TestFitInput): TestFitOutput {
  // Validate input
  if (!input.floorplate || input.floorplate.width <= 0 || input.floorplate.height <= 0) {
    throw new Error("Invalid floorplate: width and height must be positive numbers (in feet).");
  }
  if (!input.program || input.program.length === 0) {
    throw new Error("Program must contain at least one room specification.");
  }
  if (!["collaborative-hub", "balanced-standard", "privacy-first"].includes(input.scenario)) {
    throw new Error(`Unknown scenario "${input.scenario}". Must be one of: collaborative-hub, balanced-standard, privacy-first`);
  }

  // Build internal layout input
  const layoutInput: LayoutInput = {
    floorplate: input.floorplate,
    entryLocation: input.entryLocation,
    program: input.program,
    scenario: input.scenario,
  };

  // Run layout engine
  const layout: LayoutOutput = generateLayout(layoutInput);

  // Render SVG
  const svgLabel = input.label
    ? `LEASIBILITY AI — ${input.label.toUpperCase()}`
    : "LEASIBILITY AI — TEST FIT";
  const svg = renderToSVG(layout, input.floorplate, svgLabel, input.context);

  // Map to public output shape
  return {
    rooms: layout.rooms.map(r => ({
      id: r.id,
      type: r.type,
      position: { x: r.rect.x, y: r.rect.y },
      width: r.rect.width,
      height: r.rect.height,
      area: r.area,
      zone: r.zone,
    })),
    corridors: layout.corridors.map(c => ({
      id: c.id,
      axis: c.axis,
      x: c.rect.x,
      y: c.rect.y,
      width: c.rect.width,
      height: c.rect.height,
    })),
    unplacedRooms: layout.unplacedRooms,
    stats: {
      efficiencyScore:       layout.efficiencyScore,
      efficiencyPercent:     Math.round(layout.efficiencyScore * 100),
      placedSqFt:            layout.placedSqFt,
      corridorSqFt:          layout.corridorSqFt,
      residualSqFt:          layout.residualSqFt,
      totalFloorplateSqFt:   input.floorplate.width * input.floorplate.height,
    },
    svg,
  };
}
