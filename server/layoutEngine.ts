import type { FloorplateGeometry, Wall } from "./floorPlanParser";

export type ImpactLevel = "low" | "medium" | "high";

export interface RoomSpec {
  type: string;
  count: number;
  targetSqFt: number;
  minSqFt: number;
  maxSqFt: number;
  requiresWindow: boolean;
  zone: "welcome" | "perimeter" | "core-adjacent" | "interior";
  priority: number;
}

export interface PlacedRoom {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sqFt: number;
  zone: string;
  hasWindowAccess: boolean;
  corridorAccess: boolean;
}

export interface PlacedCorridor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "primary" | "secondary";
}

export interface LayoutResult {
  placedRooms: PlacedRoom[];
  placedCorridors: PlacedCorridor[];
  unplacedRooms: Array<{ type: string; count: number; reason: string }>;
  efficiencyScore: number;
  usableSqFt: number;
  circulationSqFt: number;
  residualSqFt: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type OccupiedRect = Rect & { kind: "protected" | "circulation" | "room"; id: string };

const CANONICAL_RULES: Record<string, Omit<RoomSpec, "count">> = {
  Reception: { type: "Reception", targetSqFt: 150, minSqFt: 80, maxSqFt: 224, requiresWindow: false, zone: "welcome", priority: 10 },
  "Large Conference": { type: "Large Conference", targetSqFt: 400, minSqFt: 300, maxSqFt: 600, requiresWindow: false, zone: "welcome", priority: 20 },
  "Conference Room": { type: "Conference Room", targetSqFt: 240, minSqFt: 180, maxSqFt: 360, requiresWindow: false, zone: "welcome", priority: 25 },
  "Break Room": { type: "Break Room", targetSqFt: 200, minSqFt: 140, maxSqFt: 360, requiresWindow: false, zone: "core-adjacent", priority: 30 },
  "Private Office": { type: "Private Office", targetSqFt: 120, minSqFt: 100, maxSqFt: 150, requiresWindow: true, zone: "perimeter", priority: 40 },
  Workstation: { type: "Workstation", targetSqFt: 50, minSqFt: 42, maxSqFt: 72, requiresWindow: true, zone: "perimeter", priority: 50 },
  "Phone Booth": { type: "Phone Booth", targetSqFt: 48, minSqFt: 36, maxSqFt: 64, requiresWindow: false, zone: "core-adjacent", priority: 60 },
  "Huddle Room": { type: "Huddle Room", targetSqFt: 100, minSqFt: 80, maxSqFt: 140, requiresWindow: false, zone: "interior", priority: 65 },
  "Print/Copy": { type: "Print/Copy", targetSqFt: 48, minSqFt: 36, maxSqFt: 72, requiresWindow: false, zone: "core-adjacent", priority: 70 },
  Storage: { type: "Storage", targetSqFt: 80, minSqFt: 60, maxSqFt: 120, requiresWindow: false, zone: "core-adjacent", priority: 72 },
  "IT Closet": { type: "IT Closet", targetSqFt: 60, minSqFt: 48, maxSqFt: 90, requiresWindow: false, zone: "core-adjacent", priority: 74 },
  "Wellness Room": { type: "Wellness Room", targetSqFt: 80, minSqFt: 70, maxSqFt: 120, requiresWindow: false, zone: "interior", priority: 76 },
  "Collaboration Zone": { type: "Collaboration Zone", targetSqFt: 250, minSqFt: 120, maxSqFt: 900, requiresWindow: false, zone: "interior", priority: 90 },
  "Flexible Collaboration": { type: "Flexible Collaboration", targetSqFt: 500, minSqFt: 100, maxSqFt: 2500, requiresWindow: false, zone: "interior", priority: 95 },
};

const IMPACT_SIZE_FACTOR: Record<ImpactLevel, number> = {
  low: 0.9,
  medium: 1,
  high: 1.12,
};

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function normalizeType(type: string): string {
  const clean = type.trim();
  if (/open workspace/i.test(clean)) return "Workstation";
  if (/server|it/i.test(clean)) return "IT Closet";
  if (/print/i.test(clean)) return "Print/Copy";
  if (/large conference|board/i.test(clean)) return "Large Conference";
  if (/conference/i.test(clean)) return "Conference Room";
  if (/phone/i.test(clean)) return "Phone Booth";
  if (/huddle/i.test(clean)) return "Huddle Room";
  if (/private office|office/i.test(clean)) return "Private Office";
  if (/break|pantry|kitchen/i.test(clean)) return "Break Room";
  if (/reception|welcome/i.test(clean)) return "Reception";
  if (/storage/i.test(clean)) return "Storage";
  if (/wellness|mother/i.test(clean)) return "Wellness Room";
  if (/flex/i.test(clean)) return "Flexible Collaboration";
  if (/collab|lounge/i.test(clean)) return "Collaboration Zone";
  return clean;
}

export function getCanonicalRoomSpec(type: string, count = 1): RoomSpec {
  const canonicalType = normalizeType(type);
  const rule = CANONICAL_RULES[canonicalType] ?? {
    type: canonicalType,
    targetSqFt: 120,
    minSqFt: 80,
    maxSqFt: 240,
    requiresWindow: false,
    zone: "interior" as const,
    priority: 85,
  };
  return { ...rule, count, type: canonicalType };
}

function rectArea(rect: Rect): number {
  return rect.width * rect.height;
}

function overlaps(a: Rect, b: Rect, tolerance = 0): boolean {
  return !(
    a.x + a.width <= b.x + tolerance ||
    b.x + b.width <= a.x + tolerance ||
    a.y + a.height <= b.y + tolerance ||
    b.y + b.height <= a.y + tolerance
  );
}

function contains(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

function center(rect: Rect): { x: number; y: number } {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

function distanceToRect(point: { x: number; y: number }, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

function touches(a: Rect, b: Rect, tolerance = 0.75): boolean {
  const verticalTouch = Math.abs(a.x + a.width - b.x) <= tolerance || Math.abs(b.x + b.width - a.x) <= tolerance;
  const horizontalOverlap = a.y < b.y + b.height && b.y < a.y + a.height;
  const horizontalTouch = Math.abs(a.y + a.height - b.y) <= tolerance || Math.abs(b.y + b.height - a.y) <= tolerance;
  const verticalOverlap = a.x < b.x + b.width && b.x < a.x + a.width;
  return (verticalTouch && horizontalOverlap) || (horizontalTouch && verticalOverlap) || overlaps(a, b, -tolerance);
}

function coreRect(geometry: FloorplateGeometry): Rect | undefined {
  if (geometry.core.type === "none") return undefined;
  const width = Math.max(6, geometry.core.width * geometry.width);
  const height = Math.max(6, geometry.core.height * geometry.depth);
  return {
    x: round(Math.max(0, Math.min(geometry.width - width, geometry.core.x * geometry.width))),
    y: round(Math.max(0, Math.min(geometry.depth - height, geometry.core.y * geometry.depth))),
    width: round(width),
    height: round(height),
  };
}

function entryPoint(geometry: FloorplateGeometry): { x: number; y: number; wall: Wall } {
  return {
    x: round(Math.max(0, Math.min(geometry.width, geometry.entry.x * geometry.width))),
    y: round(Math.max(0, Math.min(geometry.depth, geometry.entry.y * geometry.depth))),
    wall: geometry.entry.wall,
  };
}

function buildPrimaryCorridors(geometry: FloorplateGeometry): PlacedCorridor[] {
  const entry = entryPoint(geometry);
  const core = coreRect(geometry);
  const coreCenter = core ? center(core) : { x: geometry.width / 2, y: geometry.depth / 2 };
  const width = 5;
  const corridors: PlacedCorridor[] = [];

  if (entry.wall === "north" || entry.wall === "south") {
    const x = round(Math.max(0, Math.min(geometry.width - width, entry.x - width / 2)));
    const y1 = Math.min(entry.y, coreCenter.y);
    const y2 = Math.max(entry.y, coreCenter.y);
    corridors.push({ id: "corridor-primary", x, y: round(y1), width, height: round(Math.max(5, y2 - y1)), type: "primary" });
    const hY = round(Math.max(0, Math.min(geometry.depth - width, coreCenter.y - width / 2)));
    corridors.push({ id: "corridor-secondary-cross", x: 0, y: hY, width: geometry.width, height: width, type: "secondary" });
  } else {
    const y = round(Math.max(0, Math.min(geometry.depth - width, entry.y - width / 2)));
    const x1 = Math.min(entry.x, coreCenter.x);
    const x2 = Math.max(entry.x, coreCenter.x);
    corridors.push({ id: "corridor-primary", x: round(x1), y, width: round(Math.max(5, x2 - x1)), height: width, type: "primary" });
    const vX = round(Math.max(0, Math.min(geometry.width - width, coreCenter.x - width / 2)));
    corridors.push({ id: "corridor-secondary-cross", x: vX, y: 0, width, height: geometry.depth, type: "secondary" });
  }

  return corridors;
}

function aspectFor(type: string): number {
  if (type === "Private Office") return 1.2;
  if (type === "Phone Booth" || type === "IT Closet") return 0.8;
  if (type === "Workstation") return 1.15;
  if (/Conference/.test(type)) return 1.6;
  if (type === "Flexible Collaboration" || type === "Collaboration Zone") return 1.8;
  return 1.35;
}

function dimensionsForArea(area: number, type: string): { width: number; height: number } {
  const aspect = aspectFor(type);
  const rawWidth = Math.sqrt(area * aspect);
  const rawHeight = area / rawWidth;
  const width = Math.max(6, Math.round(rawWidth));
  const height = Math.max(6, Math.round(area / width));
  return { width, height };
}

function targetArea(spec: RoomSpec, impactLevel: ImpactLevel): number {
  const factored = spec.targetSqFt * IMPACT_SIZE_FACTOR[impactLevel];
  return Math.round(Math.max(spec.minSqFt, Math.min(spec.maxSqFt, factored)));
}

function expandFlexibleAreas(program: RoomSpec[], geometry: FloorplateGeometry, impactLevel: ImpactLevel): RoomSpec[] {
  const targetEfficiency = impactLevel === "low" ? 76 : impactLevel === "medium" ? 83 : 89;
  const targetUsable = geometry.totalSqFt * (targetEfficiency / 100);
  const baseUsable = program.reduce((sum, spec) => sum + targetArea(spec, impactLevel) * spec.count, 0);
  const additional = Math.round(Math.max(0, targetUsable - baseUsable));
  if (additional <= 0) return program;

  const existingIndex = program.findIndex(spec => spec.type === "Flexible Collaboration" || spec.type === "Collaboration Zone");
  if (existingIndex >= 0) {
    return program.map((spec, index) => {
      if (index !== existingIndex) return spec;
      const totalFlexibleTarget = spec.targetSqFt * spec.count + additional;
      const flexibleCount = Math.max(spec.count, Math.ceil(totalFlexibleTarget / 650));
      const targetPerRoom = Math.round(totalFlexibleTarget / flexibleCount);
      return {
        ...spec,
        count: flexibleCount,
        targetSqFt: targetPerRoom,
        minSqFt: Math.min(spec.minSqFt, 100),
        maxSqFt: Math.max(spec.maxSqFt, Math.min(900, targetPerRoom + 220)),
      };
    });
  }
  const flexibleCount = Math.max(1, Math.ceil(additional / 650));
  const targetPerRoom = Math.round(additional / flexibleCount);
  return [
    ...program,
    {
      type: "Flexible Collaboration",
      count: flexibleCount,
      targetSqFt: targetPerRoom,
      minSqFt: Math.min(100, targetPerRoom),
      maxSqFt: Math.max(targetPerRoom, Math.min(900, targetPerRoom + 220)),
      requiresWindow: false,
      zone: "interior",
      priority: 95,
    },
  ];
}

function zoneBandRect(geometry: FloorplateGeometry, zone: RoomSpec["zone"]): Rect {
  const entry = entryPoint(geometry);
  const core = coreRect(geometry);
  const base = { x: 0, y: 0, width: geometry.width, height: geometry.depth };
  if (zone === "welcome") {
    const size = Math.min(34, Math.max(20, Math.min(geometry.width, geometry.depth) * 0.34));
    return {
      x: Math.max(0, Math.min(geometry.width - size, entry.x - size / 2)),
      y: Math.max(0, Math.min(geometry.depth - size, entry.y - size / 2)),
      width: size,
      height: size,
    };
  }
  if (zone === "core-adjacent" && core) {
    const padding = 20;
    return {
      x: Math.max(0, core.x - padding),
      y: Math.max(0, core.y - padding),
      width: Math.min(geometry.width - Math.max(0, core.x - padding), core.width + padding * 2),
      height: Math.min(geometry.depth - Math.max(0, core.y - padding), core.height + padding * 2),
    };
  }
  if (zone === "perimeter") return base;
  return {
    x: geometry.width * 0.14,
    y: geometry.depth * 0.14,
    width: geometry.width * 0.72,
    height: geometry.depth * 0.72,
  };
}

function hasWindowAccess(rect: Rect, geometry: FloorplateGeometry): boolean {
  const band = 16;
  return geometry.windows.some(window => {
    if (window.wall === "north") return rect.y <= band && rect.x < window.endPct * geometry.width && rect.x + rect.width > window.startPct * geometry.width;
    if (window.wall === "south") return rect.y + rect.height >= geometry.depth - band && rect.x < window.endPct * geometry.width && rect.x + rect.width > window.startPct * geometry.width;
    if (window.wall === "east") return rect.x + rect.width >= geometry.width - band && rect.y < window.endPct * geometry.depth && rect.y + rect.height > window.startPct * geometry.depth;
    return rect.x <= band && rect.y < window.endPct * geometry.depth && rect.y + rect.height > window.startPct * geometry.depth;
  });
}

function detectZone(rect: Rect, geometry: FloorplateGeometry): PlacedRoom["zone"] {
  const entry = entryPoint(geometry);
  const c = center(rect);
  if (Math.hypot(c.x - entry.x, c.y - entry.y) <= 20) return "welcome";
  const core = coreRect(geometry);
  if (core && distanceToRect(c, core) <= 18) return "core-adjacent";
  if (rect.x <= 8 || rect.y <= 8 || rect.x + rect.width >= geometry.width - 8 || rect.y + rect.height >= geometry.depth - 8) return "perimeter";
  return "interior";
}

function candidateScore(rect: Rect, spec: RoomSpec, geometry: FloorplateGeometry, corridors: PlacedCorridor[], preferred: Rect): number {
  const c = center(rect);
  const target = center(preferred);
  let score = -Math.hypot(c.x - target.x, c.y - target.y);
  const corridorDistance = Math.min(...corridors.map(corridor => distanceToRect(c, corridor)));
  score -= corridorDistance * 2.5;
  if (touchesAny(rect, corridors)) score += 120;
  if (spec.requiresWindow && hasWindowAccess(rect, geometry)) score += 100;
  if (spec.requiresWindow && !hasWindowAccess(rect, geometry)) score -= 160;
  const zone = detectZone(rect, geometry);
  if (zone === spec.zone) score += 60;
  if (spec.zone === "perimeter" && zone === "perimeter") score += 80;
  return score;
}

function touchesAny(rect: Rect, corridors: PlacedCorridor[]): boolean {
  return corridors.some(corridor => touches(rect, corridor, 1.25) || distanceToRect(center(rect), corridor) <= 7.5);
}

function findPlacement(spec: RoomSpec, area: number, geometry: FloorplateGeometry, occupied: OccupiedRect[], corridors: PlacedCorridor[]): Rect | undefined {
  const floorplate = { x: 0, y: 0, width: geometry.width, height: geometry.depth };
  const preferred = zoneBandRect(geometry, spec.zone);
  const baseDims = dimensionsForArea(area, spec.type);
  const variants = [baseDims, { width: baseDims.height, height: baseDims.width }];
  let best: { rect: Rect; score: number } | undefined;
  const step = 1;

  for (const dims of variants) {
    for (let y = 0; y + dims.height <= geometry.depth; y += step) {
      for (let x = 0; x + dims.width <= geometry.width; x += step) {
        const rect = { x, y, width: dims.width, height: dims.height };
        if (!contains(floorplate, rect)) continue;
        if (occupied.some(item => overlaps(rect, item))) continue;
        const score = candidateScore(rect, spec, geometry, corridors, preferred);
        if (!best || score > best.score) best = { rect, score };
      }
    }
  }

  if (best) return best.rect;

  const minimumArea = Math.max(36, Math.min(area, spec.minSqFt));
  const dims = dimensionsForArea(minimumArea, spec.type);
  for (let y = 0; y + dims.height <= geometry.depth; y += 1) {
    for (let x = 0; x + dims.width <= geometry.width; x += 1) {
      const rect = { x, y, width: dims.width, height: dims.height };
      if (occupied.some(item => overlaps(rect, item))) continue;
      if (spec.requiresWindow && !hasWindowAccess(rect, geometry)) continue;
      return rect;
    }
  }
  return undefined;
}

function mergeUnplaced(unplaced: LayoutResult["unplacedRooms"], type: string, reason: string): void {
  const existing = unplaced.find(item => item.type === type && item.reason === reason);
  if (existing) existing.count += 1;
  else unplaced.push({ type, count: 1, reason });
}

function maxRoomArea(type: string, expandedProgram: RoomSpec[]): number {
  const matching = expandedProgram.find(spec => spec.type === type);
  if (!matching) return 240;
  return matching.maxSqFt;
}

function rebuildOccupied(core: Rect | undefined, corridors: PlacedCorridor[], placedRooms: PlacedRoom[]): OccupiedRect[] {
  const occupied: OccupiedRect[] = [];
  if (core) occupied.push({ ...core, kind: "protected", id: "core" });
  corridors.forEach(corridor => occupied.push({ ...corridor, kind: "circulation", id: corridor.id }));
  placedRooms.forEach(room => occupied.push({ x: room.x, y: room.y, width: room.width, height: room.height, kind: "room", id: room.id }));
  return occupied;
}

function canGrow(room: PlacedRoom, candidate: Rect, core: Rect | undefined, corridors: PlacedCorridor[], placedRooms: PlacedRoom[], geometry: FloorplateGeometry): boolean {
  const floorplate = { x: 0, y: 0, width: geometry.width, height: geometry.depth };
  if (!contains(floorplate, candidate)) return false;
  const occupied = rebuildOccupied(core, corridors, placedRooms.filter(item => item.id !== room.id));
  return !occupied.some(item => overlaps(candidate, item));
}

function compactLayout(placedRooms: PlacedRoom[], corridors: PlacedCorridor[], core: Rect | undefined, geometry: FloorplateGeometry, expandedProgram: RoomSpec[], impactLevel: ImpactLevel): void {
  const targetEfficiency = impactLevel === "low" ? 76 : impactLevel === "medium" ? 83 : 89;
  const targetUsable = geometry.totalSqFt * (targetEfficiency / 100);
  const expandableTypes = ["Flexible Collaboration", "Collaboration Zone", "Workstation", "Conference Room", "Break Room"];
  let usableSqFt = placedRooms.reduce((sum, room) => sum + room.sqFt, 0);
  let iterations = 0;

  while (usableSqFt < targetUsable && iterations < 1400) {
    iterations += 1;
    let grew = false;
    const candidates = placedRooms
      .filter(room => expandableTypes.includes(room.type) && room.sqFt < maxRoomArea(room.type, expandedProgram))
      .sort((a, b) => expandableTypes.indexOf(a.type) - expandableTypes.indexOf(b.type));

    for (const room of candidates) {
      const maxArea = maxRoomArea(room.type, expandedProgram);
      const growthOptions: Array<{ width: number; height: number }> = [
        { width: room.width + 1, height: room.height },
        { width: room.width, height: room.height + 1 },
      ];
      for (const option of growthOptions) {
        const nextArea = Math.round(option.width * option.height);
        if (nextArea > maxArea || nextArea <= room.sqFt) continue;
        const candidate = { x: room.x, y: room.y, width: option.width, height: option.height };
        if (!canGrow(room, candidate, core, corridors, placedRooms, geometry)) continue;
        room.width = round(option.width);
        room.height = round(option.height);
        room.sqFt = nextArea;
        room.zone = detectZone(room, geometry);
        room.hasWindowAccess = hasWindowAccess(room, geometry);
        usableSqFt = placedRooms.reduce((sum, item) => sum + item.sqFt, 0);
        grew = true;
        break;
      }
      if (grew || usableSqFt >= targetUsable) break;
    }
    if (!grew) break;
  }
}

function addSecondaryCorridor(room: PlacedRoom, corridors: PlacedCorridor[], geometry: FloorplateGeometry): PlacedCorridor | undefined {
  const primary = corridors[0];
  if (!primary) return undefined;
  const roomCenter = center({ x: room.x, y: room.y, width: room.width, height: room.height });
  if (touchesAny({ x: room.x, y: room.y, width: room.width, height: room.height }, corridors)) return undefined;
  const width = 3.5;
  if (primary.height >= primary.width) {
    const y = Math.max(0, Math.min(geometry.depth - width, roomCenter.y - width / 2));
    const x1 = Math.min(roomCenter.x, primary.x + primary.width / 2);
    const x2 = Math.max(roomCenter.x, primary.x + primary.width / 2);
    return { id: `corridor-secondary-${corridors.length + 1}`, x: round(x1), y: round(y), width: round(Math.max(width, x2 - x1)), height: width, type: "secondary" };
  }
  const x = Math.max(0, Math.min(geometry.width - width, roomCenter.x - width / 2));
  const y1 = Math.min(roomCenter.y, primary.y + primary.height / 2);
  const y2 = Math.max(roomCenter.y, primary.y + primary.height / 2);
  return { id: `corridor-secondary-${corridors.length + 1}`, x: round(x), y: round(y1), width, height: round(Math.max(width, y2 - y1)), type: "secondary" };
}

function orderedProgram(program: RoomSpec[]): RoomSpec[] {
  return program
    .map(spec => ({ ...getCanonicalRoomSpec(spec.type, spec.count), ...spec, type: normalizeType(spec.type) }))
    .sort((a, b) => a.priority - b.priority || a.type.localeCompare(b.type));
}

export function generateLayout(geometry: FloorplateGeometry, program: RoomSpec[], impactLevel: ImpactLevel): LayoutResult {
  const corridors = buildPrimaryCorridors(geometry);
  const core = coreRect(geometry);
  const occupied: OccupiedRect[] = [];
  if (core) occupied.push({ ...core, kind: "protected", id: "core" });
  corridors.forEach(corridor => occupied.push({ ...corridor, kind: "circulation", id: corridor.id }));

  const placedRooms: PlacedRoom[] = [];
  const unplacedRooms: LayoutResult["unplacedRooms"] = [];
  const expandedProgram = expandFlexibleAreas(orderedProgram(program), geometry, impactLevel);

  for (const spec of expandedProgram) {
    for (let index = 0; index < spec.count; index += 1) {
      const area = targetArea(spec, impactLevel);
      const rect = findPlacement(spec, area, geometry, occupied, corridors);
      if (!rect) {
        mergeUnplaced(unplacedRooms, spec.type, "No valid non-overlapping cell cluster found within the required zoning rules.");
        continue;
      }
      const room: PlacedRoom = {
        id: `${spec.type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${placedRooms.filter(item => item.type === spec.type).length + 1}`,
        type: spec.type,
        x: round(rect.x),
        y: round(rect.y),
        width: round(rect.width),
        height: round(rect.height),
        sqFt: Math.round(rectArea(rect)),
        zone: detectZone(rect, geometry),
        hasWindowAccess: hasWindowAccess(rect, geometry),
        corridorAccess: touchesAny(rect, corridors),
      };
      const branch = room.corridorAccess ? undefined : addSecondaryCorridor(room, corridors, geometry);
      if (branch) {
        corridors.push(branch);
        occupied.push({ ...branch, kind: "circulation", id: branch.id });
        room.corridorAccess = true;
      }
      if (!room.corridorAccess) {
        mergeUnplaced(unplacedRooms, spec.type, "no corridor access");
        continue;
      }
      placedRooms.push(room);
      occupied.push({ ...rect, kind: "room", id: room.id });
    }
  }

  compactLayout(placedRooms, corridors, core, geometry, expandedProgram, impactLevel);

  const usableSqFt = Math.round(placedRooms.reduce((sum, room) => sum + room.sqFt, 0));
  const circulationSqFt = Math.round(corridors.reduce((sum, corridor) => sum + rectArea(corridor), 0));
  const residualSqFt = Math.max(0, Math.round(geometry.totalSqFt - usableSqFt - circulationSqFt));
  const efficiencyScore = Math.round((usableSqFt / Math.max(1, geometry.totalSqFt)) * 100);

  const expected = impactLevel === "low" ? [72, 79] : impactLevel === "medium" ? [80, 86] : [87, 93];
  if (efficiencyScore < expected[0] || efficiencyScore > expected[1]) {
    console.warn(`[LayoutEngine] ${impactLevel} efficiency ${efficiencyScore}% outside expected ${expected[0]}-${expected[1]}% range. Computed value was preserved.`);
  }

  return {
    placedRooms,
    placedCorridors: corridors,
    unplacedRooms,
    efficiencyScore,
    usableSqFt,
    circulationSqFt,
    residualSqFt,
  };
}
