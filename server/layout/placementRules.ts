/**
 * placementRules.ts
 * Defines per-room-type placement preferences:
 *   - preferred zone (perimeter vs interior)
 *   - adjacency requirements (must be next to which other types)
 *   - natural light requirement
 *   - preferred aspect ratio
 *   - minimum / maximum area per unit (sq ft)
 *
 * These rules are consumed by the layout engine to score candidate positions.
 * Improving these rules is the primary lever for better placement quality.
 */

export type RoomType =
  | "Reception"
  | "Open Workspace"
  | "Private Office"
  | "Conference Room"
  | "Huddle Room"
  | "Break Room"
  | "Phone Booth"
  | "Collaboration Zone"
  | "Lounge"
  | "Storage"
  | "Server Room"
  | "Focus Room"
  | "Print Area"
  | "IT Room";

export interface PlacementRule {
  /** Preferred zone of the floorplate */
  preferredZone: "perimeter" | "interior" | "any";
  /** Room types this space should be adjacent to (by shared wall) */
  adjacentTo: RoomType[];
  /** Whether the room benefits from exterior windows */
  naturalLight: "required" | "preferred" | "none";
  /** Preferred width-to-depth ratio */
  preferredAspect: number;
  /** Minimum area per single unit (sq ft) */
  minSqFt: number;
  /** Maximum area per single unit (sq ft) */
  maxSqFt: number;
  /**
   * Priority order for placement (lower = placed first).
   * Anchor rooms (Reception, Conference) should be placed first
   * to establish the primary circulation spine.
   */
  placementOrder: number;
}

export const PLACEMENT_RULES: Record<RoomType, PlacementRule> = {
  // ── Anchor rooms — placed first, establish circulation ──────
  Reception: {
    preferredZone: "perimeter",
    adjacentTo: [],
    naturalLight: "preferred",
    preferredAspect: 1.6,
    minSqFt: 120,
    maxSqFt: 400,
    placementOrder: 1,
  },
  "Conference Room": {
    preferredZone: "perimeter",
    adjacentTo: ["Reception"],
    naturalLight: "preferred",
    preferredAspect: 1.5,
    minSqFt: 200,
    maxSqFt: 600,
    placementOrder: 2,
  },
  "Huddle Room": {
    preferredZone: "interior",
    adjacentTo: ["Open Workspace", "Conference Room"],
    naturalLight: "none",
    preferredAspect: 1.2,
    minSqFt: 80,
    maxSqFt: 150,
    placementOrder: 3,
  },

  // ── Primary work zones ───────────────────────────────────────
  "Private Office": {
    preferredZone: "perimeter",
    adjacentTo: [],
    naturalLight: "preferred",
    preferredAspect: 1.2,
    minSqFt: 100,
    maxSqFt: 200,
    placementOrder: 4,
  },
  "Open Workspace": {
    preferredZone: "interior",
    adjacentTo: ["Break Room", "Collaboration Zone"],
    naturalLight: "preferred",
    preferredAspect: 2.0,
    minSqFt: 400,
    maxSqFt: 8000,
    placementOrder: 5,
  },
  "Focus Room": {
    preferredZone: "interior",
    adjacentTo: ["Open Workspace"],
    naturalLight: "none",
    preferredAspect: 1.1,
    minSqFt: 60,
    maxSqFt: 120,
    placementOrder: 6,
  },
  "Phone Booth": {
    preferredZone: "interior",
    adjacentTo: ["Open Workspace"],
    naturalLight: "none",
    preferredAspect: 1.0,
    minSqFt: 25,
    maxSqFt: 50,
    placementOrder: 7,
  },

  // ── Support / amenity ────────────────────────────────────────
  "Break Room": {
    preferredZone: "interior",
    adjacentTo: ["Open Workspace", "Lounge"],
    naturalLight: "preferred",
    preferredAspect: 1.4,
    minSqFt: 150,
    maxSqFt: 500,
    placementOrder: 8,
  },
  "Collaboration Zone": {
    preferredZone: "interior",
    adjacentTo: ["Open Workspace"],
    naturalLight: "none",
    preferredAspect: 1.5,
    minSqFt: 200,
    maxSqFt: 800,
    placementOrder: 9,
  },
  Lounge: {
    preferredZone: "perimeter",
    adjacentTo: ["Break Room", "Reception"],
    naturalLight: "preferred",
    preferredAspect: 1.6,
    minSqFt: 200,
    maxSqFt: 600,
    placementOrder: 10,
  },

  // ── Back-of-house ────────────────────────────────────────────
  Storage: {
    preferredZone: "interior",
    adjacentTo: [],
    naturalLight: "none",
    preferredAspect: 1.3,
    minSqFt: 60,
    maxSqFt: 200,
    placementOrder: 11,
  },
  "Server Room": {
    preferredZone: "interior",
    adjacentTo: [],
    naturalLight: "none",
    preferredAspect: 1.2,
    minSqFt: 80,
    maxSqFt: 200,
    placementOrder: 12,
  },
  "Print Area": {
    preferredZone: "interior",
    adjacentTo: ["Open Workspace"],
    naturalLight: "none",
    preferredAspect: 1.2,
    minSqFt: 40,
    maxSqFt: 100,
    placementOrder: 13,
  },
  "IT Room": {
    preferredZone: "interior",
    adjacentTo: ["Server Room"],
    naturalLight: "none",
    preferredAspect: 1.2,
    minSqFt: 60,
    maxSqFt: 150,
    placementOrder: 14,
  },
};

/** Return rules for a room type, falling back to a generic default */
export function getRules(roomType: string): PlacementRule {
  return (
    PLACEMENT_RULES[roomType as RoomType] ?? {
      preferredZone: "any",
      adjacentTo: [],
      naturalLight: "none",
      preferredAspect: 1.4,
      minSqFt: 80,
      maxSqFt: 400,
      placementOrder: 99,
    }
  );
}
