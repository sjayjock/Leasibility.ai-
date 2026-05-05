import type { FloorplateGeometry } from "./floorPlanParser";
import type { LayoutResult, PlacedRoom, WallSegment } from "./layoutEngine";

type ImpactLevel = "low" | "medium" | "high";
type StructuralColumn = { x: number; y: number; radius?: number; width?: number; height?: number; label?: string };
type RenderableGeometry = FloorplateGeometry & { columns?: StructuralColumn[] };

export interface RenderSvgOptions {
  geometry: FloorplateGeometry;
  layout: LayoutResult;
  scenarioName: string;
  propertyName?: string;
  impactLevel: ImpactLevel;
  reviewMessage?: string;
}

const ROOM_COLORS: Record<string, string> = {
  Reception: "#F6E7C8",
  "Large Conference": "#D8E8F7",
  "Conference Room": "#D8E8F7",
  "Huddle Room": "#E6DCF4",
  "Phone Booth": "#ECECEC",
  "Private Office": "#DDF0DF",
  Workstation: "#E7F0FA",
  "Open Workspace": "#E7F0FA",
  "Collaboration Zone": "#F7DCE5",
  "Flexible Collaboration": "#F7DCE5",
  "Break Room": "#F9E4D4",
  "Print/Copy": "#EAE5DA",
  Storage: "#EAE5DA",
  "IT Closet": "#EAE5DA",
  "Wellness Room": "#DDEFEA",
  Corridor: "#FFFFFF",
  default: "#EEF1F4",
};

const SVG_WIDTH = 960;
const SVG_HEIGHT = 620;
const BANNER_H = 30;
const TITLE_H = 64;
const LEGEND_W = 156;
const MARGIN_X = 42;
const MARGIN_TOP = BANNER_H + 42;
const MARGIN_BOTTOM = TITLE_H + 34;
const PERIM_THICK = 10;
const INTERIOR_THICK = 2.2;

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roomColor(type: string): string {
  return ROOM_COLORS[type] ?? ROOM_COLORS[type.replace(/s$/, "")] ?? ROOM_COLORS.default;
}

function roomLabel(type: string): string {
  if (/workstation|open workspace/i.test(type)) return "WORKSTATIONS";
  return type.toUpperCase();
}

function compactType(type: string): string {
  return type.length > 19 ? `${type.slice(0, 18)}.` : type;
}

function isOpenPlan(type: string): boolean {
  return /workstation|open workspace|collaboration|flex/i.test(type);
}

function isConference(type: string): boolean {
  return /conference|huddle|board/i.test(type);
}

function isPrivateOffice(type: string): boolean {
  return /private office|office/i.test(type) && !/open/i.test(type);
}

function isBreakRoom(type: string): boolean {
  return /break|pantry|kitchen/i.test(type);
}

function isReception(type: string): boolean {
  return /reception|welcome/i.test(type);
}

function isPhoneBooth(type: string): boolean {
  return /phone booth|booth/i.test(type);
}

function isSupport(type: string): boolean {
  return /print|copy|storage|it closet|server|closet|wellness/i.test(type);
}

function normalizeColumn(column: StructuralColumn): StructuralColumn | undefined {
  const x = num(column.x, NaN);
  const y = num(column.y, NaN);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  return {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
    radius: column.radius ? clamp(num(column.radius), 0.004, 0.03) : undefined,
    width: column.width ? clamp(num(column.width), 0.006, 0.05) : undefined,
    height: column.height ? clamp(num(column.height), 0.006, 0.05) : undefined,
    label: column.label,
  };
}

function wallLengthPx(wall: Pick<WallSegment, "x1" | "y1" | "x2" | "y2">, px: (feet: number) => number, geometry: FloorplateGeometry): number {
  const normalized = Math.max(Math.abs(wall.x1), Math.abs(wall.y1), Math.abs(wall.x2), Math.abs(wall.y2)) <= 1.2;
  const dx = normalized ? (wall.x2 - wall.x1) * geometry.width : wall.x2 - wall.x1;
  const dy = normalized ? (wall.y2 - wall.y1) * geometry.depth : wall.y2 - wall.y1;
  return Math.hypot(px(dx), px(dy));
}

export function renderToSVG(
  layoutResult: LayoutResult,
  geometryInput: FloorplateGeometry,
  scenarioName: string,
  propertyName = "Leasibility AI",
  impactLevel: ImpactLevel = "medium",
  reviewMessage?: string,
): string {
  const geometry = geometryInput as RenderableGeometry;
  const safeWidth = Math.max(20, num(geometry.width, 80));
  const safeDepth = Math.max(20, num(geometry.depth, 60));
  const maxBuildingW = SVG_WIDTH - MARGIN_X * 2 - LEGEND_W - 18;
  const maxBuildingH = SVG_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  const scale = Math.min(maxBuildingW / safeWidth, maxBuildingH / safeDepth);
  const buildingPixelW = safeWidth * scale;
  const buildingPixelH = safeDepth * scale;
  const BLDG_X = MARGIN_X;
  const BLDG_Y = MARGIN_TOP;

  const px = (feet: number) => Math.round(feet * scale * 100) / 100;
  const rx = (feet: number) => Math.round((BLDG_X + feet * scale) * 100) / 100;
  const ry = (feet: number) => Math.round((BLDG_Y + feet * scale) * 100) / 100;
  const bx = (normalizedX: number) => Math.round((BLDG_X + clamp(normalizedX, 0, 1) * buildingPixelW) * 100) / 100;
  const by = (normalizedY: number) => Math.round((BLDG_Y + clamp(normalizedY, 0, 1) * buildingPixelH) * 100) / 100;
  const wallX = (value: number) => Math.abs(value) <= 1.2 ? bx(value) : rx(value);
  const wallY = (value: number) => Math.abs(value) <= 1.2 ? by(value) : ry(value);

  const svg: string[] = [];
  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img" aria-label="${esc(scenarioName)} architectural test fit">`);
  svg.push(`<rect id="white-paper-background" x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#FFFFFF"/>`);
  svg.push(`<defs>`);
  svg.push(`  <pattern id="core-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect width="7" height="7" fill="#D7D7D7"/><line x1="0" y1="0" x2="0" y2="7" stroke="#9A9A9A" stroke-width="1"/></pattern>`);
  svg.push(`  <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.18"/></filter>`);
  svg.push(`</defs>`);

  svg.push(`<g id="floorplate-paper">`);
  svg.push(`  <rect id="floor-fill" x="${BLDG_X}" y="${BLDG_Y}" width="${buildingPixelW}" height="${buildingPixelH}" fill="#FFFFFF" stroke="none"/>`);
  svg.push(`</g>`);

  svg.push(`<g id="rooms">`);
  svg.push(`<g id="room-color-fills">`);
  for (const room of layoutResult.placedRooms) {
    const x = rx(room.x);
    const y = ry(room.y);
    const w = Math.max(0, px(room.width));
    const h = Math.max(0, px(room.height));
    if (w < 3 || h < 3) continue;
    const stroke = isOpenPlan(room.type) ? "#7C93AA" : "#6A6A6A";
    const dash = isOpenPlan(room.type) ? ` stroke-dasharray="3,3"` : "";
    svg.push(`  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${roomColor(room.type)}" fill-opacity="0.86" stroke="${stroke}" stroke-width="0.9"${dash} rx="1.5"/>`);
  }
  svg.push(`</g>`);
  svg.push(`</g>`);

  svg.push(`<g id="corridors" fill="#FFFFFF" stroke="#D9D9D9" stroke-width="0.65" stroke-dasharray="4,4">`);
  for (const corridor of layoutResult.placedCorridors) {
    svg.push(`  <rect x="${rx(corridor.x)}" y="${ry(corridor.y)}" width="${px(corridor.width)}" height="${px(corridor.height)}"/>`);
  }
  svg.push(`</g>`);

  const core = geometry.core;
  if (core && core.type !== "none" && core.width > 0.01 && core.height > 0.01) {
    svg.push(`<g id="core-zone">`);
    svg.push(`  <rect x="${bx(core.x)}" y="${by(core.y)}" width="${px(core.width * safeWidth)}" height="${px(core.height * safeDepth)}" fill="url(#core-hatch)" stroke="#4A4A4A" stroke-width="2"/>`);
    svg.push(`  <text x="${bx(core.x + core.width / 2)}" y="${by(core.y + core.height / 2)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="bold" fill="#333">CORE</text>`);
    svg.push(`</g>`);
  }

  const columns = (geometry.columns ?? []).map(normalizeColumn).filter(Boolean) as StructuralColumn[];
  if (columns.length > 0) {
    svg.push(`<g id="structural-columns" fill="#1F1F1F" stroke="#FFFFFF" stroke-width="1">`);
    columns.forEach((column, index) => {
      const cx = bx(column.x);
      const cy = by(column.y);
      if (column.width && column.height) {
        svg.push(`  <rect x="${bx(column.x - column.width / 2)}" y="${by(column.y - column.height / 2)}" width="${px(column.width * safeWidth)}" height="${px(column.height * safeDepth)}"/>`);
      } else {
        svg.push(`  <circle cx="${cx}" cy="${cy}" r="${Math.max(3, px((column.radius ?? 0.01) * Math.min(safeWidth, safeDepth)))}"/>`);
      }
      svg.push(`  <text x="${cx + 5}" y="${cy - 5}" font-family="Arial,sans-serif" font-size="5.5" fill="#333">${esc(column.label ?? `C${index + 1}`)}</text>`);
    });
    svg.push(`</g>`);
  }

  svg.push(`<g id="window-lines" stroke="#69A7D8" stroke-width="3" stroke-linecap="round" opacity="0.9">`);
  for (const win of geometry.windows ?? []) {
    const start = clamp(num(win.startPct, 0), 0, 1);
    const end = clamp(num(win.endPct, 1), 0, 1);
    if (end <= start) continue;
    if (win.wall === "north") svg.push(`  <line x1="${bx(start)}" y1="${BLDG_Y - 3}" x2="${bx(end)}" y2="${BLDG_Y - 3}"/>`);
    if (win.wall === "south") svg.push(`  <line x1="${bx(start)}" y1="${BLDG_Y + buildingPixelH + 3}" x2="${bx(end)}" y2="${BLDG_Y + buildingPixelH + 3}"/>`);
    if (win.wall === "west") svg.push(`  <line x1="${BLDG_X - 3}" y1="${by(start)}" x2="${BLDG_X - 3}" y2="${by(end)}"/>`);
    if (win.wall === "east") svg.push(`  <line x1="${BLDG_X + buildingPixelW + 3}" y1="${by(start)}" x2="${BLDG_X + buildingPixelW + 3}" y2="${by(end)}"/>`);
  }
  svg.push(`</g>`);

  const protectedWalls = layoutResult.keptWalls.filter(wall => wall.isProtected || wall.type === "perimeter" || wall.type === "core");
  const retainedInteriorWalls = layoutResult.keptWalls.filter(wall => !wall.isProtected && wall.type !== "perimeter" && wall.type !== "core");
  svg.push(`<g id="perimeter" stroke="#111111" stroke-linecap="square" fill="none">`);
  svg.push(`</g>`);
  svg.push(`<g id="protected-walls" stroke="#111111" stroke-linecap="square" fill="none">`);
  for (const wall of protectedWalls) {
    const thickness = wall.type === "perimeter" ? PERIM_THICK : 5;
    svg.push(`  <line x1="${wallX(wall.x1)}" y1="${wallY(wall.y1)}" x2="${wallX(wall.x2)}" y2="${wallY(wall.y2)}" stroke-width="${thickness}"/>`);
  }
  svg.push(`</g>`);

  svg.push(`<g id="retained-walls" stroke="#3C3C3C" stroke-width="${INTERIOR_THICK}" stroke-linecap="square" fill="none">`);
  for (const wall of retainedInteriorWalls) {
    if (wallLengthPx(wall, px, geometry) < 2) continue;
    svg.push(`  <line x1="${wallX(wall.x1)}" y1="${wallY(wall.y1)}" x2="${wallX(wall.x2)}" y2="${wallY(wall.y2)}"/>`);
  }
  svg.push(`</g>`);

  svg.push(`<g id="demolished-walls" stroke="#C7472F" stroke-width="1.8" stroke-dasharray="6,4" stroke-linecap="round" fill="none" opacity="0.85">`);
  for (const wall of layoutResult.demolishedWalls) {
    if (wall.isProtected || wall.type === "perimeter" || wall.type === "core") continue;
    if (wallLengthPx(wall, px, geometry) < 2) continue;
    svg.push(`  <line x1="${wallX(wall.x1)}" y1="${wallY(wall.y1)}" x2="${wallX(wall.x2)}" y2="${wallY(wall.y2)}"/>`);
  }
  svg.push(`</g>`);

  svg.push(`<g id="new-walls" stroke="#1A1A1A" stroke-width="${INTERIOR_THICK}" stroke-linecap="square" fill="none">`);
  for (const wall of layoutResult.newWalls) {
    if (wallLengthPx(wall, px, geometry) < 2) continue;
    svg.push(`  <line x1="${wallX(wall.x1)}" y1="${wallY(wall.y1)}" x2="${wallX(wall.x2)}" y2="${wallY(wall.y2)}"/>`);
  }
  svg.push(`</g>`);

  svg.push(`<g id="furniture-symbols" stroke="#444" stroke-width="0.8" fill="none" opacity="0.9">`);
  for (const room of layoutResult.placedRooms) drawFurniture(svg, room, rx, ry, px);
  svg.push(`</g>`);

  svg.push(`<g id="door-swings" stroke="#555" stroke-width="0.75" fill="none" opacity="0.75">`);
  for (const room of layoutResult.placedRooms) {
    if (isOpenPlan(room.type) || room.type === "Corridor") continue;
    const roomPxW = px(room.width);
    const roomPxH = px(room.height);
    if (roomPxW < 20 || roomPxH < 15) continue;
    const doorLen = Math.min(px(3), roomPxW * 0.35, 28);
    const doorX = rx(room.x) + PERIM_THICK;
    const doorY = ry(room.y + room.height) - INTERIOR_THICK;
    svg.push(`  <line x1="${doorX}" y1="${doorY}" x2="${doorX + doorLen}" y2="${doorY}"/>`);
    svg.push(`  <path d="M ${doorX} ${doorY} A ${doorLen} ${doorLen} 0 0 0 ${doorX + doorLen} ${doorY - doorLen}" stroke-dasharray="2,2" opacity="0.55"/>`);
  }
  svg.push(`</g>`);

  svg.push(`<g id="room-labels">`);
  for (const room of layoutResult.placedRooms) {
    const roomPxW = px(room.width);
    const roomPxH = px(room.height);
    if (roomPxW < 22 || roomPxH < 16) continue;
    const labelX = rx(room.x + room.width / 2);
    const labelY = ry(room.y + room.height / 2);
    const fontSize = roomPxW < 50 ? 6 : roomPxW < 80 ? 7 : 8;
    const sfFontSize = Math.max(5, fontSize - 1);
    svg.push(`  <text x="${labelX}" y="${labelY - sfFontSize / 2 - 1}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="bold" fill="#1A1A1A">${esc(roomLabel(room.type))}</text>`);
    if (roomPxH > 24) svg.push(`  <text x="${labelX}" y="${labelY + fontSize / 2 + 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,Helvetica,sans-serif" font-size="${sfFontSize}" fill="#555">${Math.round(room.sqFt).toLocaleString()} SF</text>`);
  }
  svg.push(`</g>`);

  if (geometry.entry) {
    const entX = bx(geometry.entry.x);
    const entY = by(geometry.entry.y);
    svg.push(`<g id="entry-marker">`);
    svg.push(`  <circle cx="${entX}" cy="${entY}" r="5" fill="#C9A84C" stroke="white" stroke-width="1.5" opacity="0.95"/>`);
    svg.push(`  <text x="${entX + 8}" y="${entY + 4}" font-family="Arial,sans-serif" font-size="6.5" fill="#8B6914" font-weight="bold">Primary Suite Entry</text>`);
    svg.push(`</g>`);
  }

  const dimY = BLDG_Y - 18;
  const dimX2 = BLDG_X + buildingPixelW + 16;
  svg.push(`<g id="dimension-lines" stroke="#444" stroke-width="0.7" fill="none">`);
  svg.push(`  <line x1="${BLDG_X}" y1="${dimY}" x2="${BLDG_X + buildingPixelW}" y2="${dimY}"/>`);
  svg.push(`  <line x1="${BLDG_X}" y1="${dimY - 4}" x2="${BLDG_X}" y2="${dimY + 4}"/>`);
  svg.push(`  <line x1="${BLDG_X + buildingPixelW}" y1="${dimY - 4}" x2="${BLDG_X + buildingPixelW}" y2="${dimY + 4}"/>`);
  svg.push(`  <line x1="${dimX2}" y1="${BLDG_Y}" x2="${dimX2}" y2="${BLDG_Y + buildingPixelH}"/>`);
  svg.push(`  <line x1="${dimX2 - 4}" y1="${BLDG_Y}" x2="${dimX2 + 4}" y2="${BLDG_Y}"/>`);
  svg.push(`  <line x1="${dimX2 - 4}" y1="${BLDG_Y + buildingPixelH}" x2="${dimX2 + 4}" y2="${BLDG_Y + buildingPixelH}"/>`);
  svg.push(`</g>`);
  svg.push(`<text x="${BLDG_X + buildingPixelW / 2}" y="${dimY - 5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="#333">${Math.round(safeWidth)}'-0&quot;</text>`);
  svg.push(`<text x="${dimX2 + 6}" y="${BLDG_Y + buildingPixelH / 2 + 3}" font-family="Arial,sans-serif" font-size="8" fill="#333">${Math.round(safeDepth)}'-0&quot;</text>`);

  const bannerColors: Record<ImpactLevel, string> = { low: "#2D6A2D", medium: "#8B6914", high: "#8B3A1A" };
  const bannerLabels: Record<ImpactLevel, string> = {
    low: "LIGHT REFRESH  —  EXISTING WALLS RETAINED  —  0–20% DEMOLITION",
    medium: `MODERATE BUILD-OUT  —  SELECTIVE DEMOLITION  —  ${Math.round((layoutResult.demolitionPct ?? 0.35) * 100)}% DEMOLITION`,
    high: "FULL TRANSFORMATION  —  COMPLETE INTERIOR REDESIGN  —  70–100% DEMOLITION",
  };
  svg.push(`<g id="scenario-banner">`);
  svg.push(`  <rect x="0" y="0" width="${SVG_WIDTH}" height="${BANNER_H}" fill="${bannerColors[impactLevel]}"/>`);
  svg.push(`  <text x="${SVG_WIDTH / 2}" y="${BANNER_H * 0.68}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="bold" fill="white" letter-spacing="0.5">${esc(bannerLabels[impactLevel])}</text>`);
  svg.push(`</g>`);

  if (geometry.source === "fallback" || reviewMessage) {
    const noteY = BLDG_Y + 4;
    const advisory = reviewMessage || "Planning note: layout uses estimated geometry. Upload a legible floor plan for precise wall-based results.";
    svg.push(`<g id="planning-confidence-note">`);
    svg.push(`  <rect x="${BLDG_X + 2}" y="${noteY}" width="${Math.max(80, buildingPixelW - 4)}" height="14" fill="#FFFBE6" opacity="0.92" rx="2"/>`);
    svg.push(`  <text x="${BLDG_X + 8}" y="${noteY + 10}" font-family="Arial,sans-serif" font-size="6.5" fill="#7A6000" font-style="italic">${esc(advisory).slice(0, 155)}</text>`);
    svg.push(`</g>`);
  }

  const legendX = SVG_WIDTH - LEGEND_W + 4;
  const legendY = BANNER_H + 8;
  const presentTypes = Array.from(new Set(layoutResult.placedRooms.map(room => room.type))).filter(type => type !== "Corridor");
  const legendHeight = Math.min(250, presentTypes.length * 13 + 24);
  svg.push(`<g id="legend-panel" filter="url(#soft-shadow)">`);
  svg.push(`  <rect x="${legendX - 4}" y="${legendY}" width="${LEGEND_W}" height="${legendHeight}" fill="white" stroke="#CCCCCC" stroke-width="0.8" rx="2"/>`);
  svg.push(`  <text x="${legendX + 2}" y="${legendY + 12}" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="bold" fill="#333333" letter-spacing="1">LEGEND</text>`);
  svg.push(`  <line x1="${legendX - 4}" y1="${legendY + 16}" x2="${legendX + LEGEND_W - 4}" y2="${legendY + 16}" stroke="#DDD" stroke-width="0.5"/>`);
  presentTypes.slice(0, 16).forEach((type, i) => {
    const ly = legendY + 22 + i * 13;
    svg.push(`  <rect x="${legendX + 2}" y="${ly}" width="11" height="11" fill="${roomColor(type)}" fill-opacity="0.85" stroke="#777" stroke-width="0.4" rx="1"/>`);
    svg.push(`  <text x="${legendX + 17}" y="${ly + 8.5}" font-family="Arial,Helvetica,sans-serif" font-size="7.5" fill="#333">${esc(compactType(type))}</text>`);
  });
  svg.push(`</g>`);

  const tbY = SVG_HEIGHT - TITLE_H;
  const efficiency = Math.round(num(layoutResult.efficiencyScore, 0));
  const badgeColor = efficiency >= 87 ? "#28A745" : efficiency >= 80 ? "#C9A84C" : "#D46B1A";
  const badgeX = SVG_WIDTH - 68;
  const badgeY = tbY + TITLE_H / 2;
  const sbX = 16;
  const sbY = tbY + 18;
  const sb20 = px(20);
  const sb40 = px(40);
  const naX = SVG_WIDTH - 140;
  const naY = tbY + 16;
  svg.push(`<g id="title-block">`);
  svg.push(`  <rect x="0" y="${tbY}" width="${SVG_WIDTH}" height="${TITLE_H}" fill="#1B3A5C"/>`);
  svg.push(`  <text x="16" y="${tbY + 19}" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="bold" fill="#C9A84C" letter-spacing="1">LEASIBILITY AI</text>`);
  svg.push(`  <text x="16" y="${tbY + 33}" font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#FFFFFF">${esc(scenarioName.toUpperCase())}  ·  ${esc(propertyName)}</text>`);
  svg.push(`  <text x="16" y="${tbY + 45}" font-family="Arial,Helvetica,sans-serif" font-size="7.5" fill="#AAAAAA">${Math.round(geometry.totalSqFt).toLocaleString()} RSF  ·  Deterministic Architectural Renderer  ·  Leasibility.AI</text>`);
  svg.push(`  <circle cx="${badgeX}" cy="${badgeY}" r="22" fill="${badgeColor}" stroke="white" stroke-width="2"/>`);
  svg.push(`  <text x="${badgeX}" y="${badgeY + 5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="white">${efficiency}%</text>`);
  svg.push(`  <text x="${badgeX}" y="${badgeY + 17}" text-anchor="middle" font-family="Arial,sans-serif" font-size="6.5" fill="white" opacity="0.85">EFFICIENCY</text>`);
  svg.push(`  <rect x="${sbX}" y="${sbY}" width="${sb20}" height="5" fill="white"/>`);
  svg.push(`  <rect x="${sbX + sb20}" y="${sbY}" width="${sb20}" height="5" fill="#555"/>`);
  svg.push(`  <text x="${sbX}" y="${sbY + 13}" font-family="Arial,sans-serif" font-size="6.5" fill="#AAA">0</text>`);
  svg.push(`  <text x="${sbX + sb20 - 3}" y="${sbY + 13}" font-family="Arial,sans-serif" font-size="6.5" fill="#AAA">20'</text>`);
  svg.push(`  <text x="${sbX + sb40 - 3}" y="${sbY + 13}" font-family="Arial,sans-serif" font-size="6.5" fill="#AAA">40' ft</text>`);
  svg.push(`  <text x="${naX}" y="${naY}" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="white">N</text>`);
  svg.push(`  <line x1="${naX + 5}" y1="${naY + 2}" x2="${naX + 5}" y2="${naY + 16}" stroke="white" stroke-width="1.5"/>`);
  svg.push(`  <polygon points="${naX + 5},${naY + 2} ${naX + 2},${naY + 10} ${naX + 8},${naY + 10}" fill="white"/>`);
  svg.push(`</g>`);

  svg.push(`</svg>`);
  return svg.join("\n");
}

function drawFurniture(svg: string[], room: PlacedRoom, rx: (feet: number) => number, ry: (feet: number) => number, px: (feet: number) => number): void {
  const x = rx(room.x);
  const y = ry(room.y);
  const w = px(room.width);
  const h = px(room.height);
  if (w < 18 || h < 14) return;
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (isConference(room.type)) {
    const tableW = Math.min(w * 0.54, 58);
    const tableH = Math.min(h * 0.38, 25);
    svg.push(`  <rect x="${cx - tableW / 2}" y="${cy - tableH / 2}" width="${tableW}" height="${tableH}" rx="6" fill="#FFFFFF" fill-opacity="0.45"/>`);
    const chairCount = Math.max(4, Math.min(10, Math.floor(tableW / 9) * 2));
    for (let i = 0; i < chairCount / 2; i += 1) {
      const chairX = cx - tableW / 2 + 6 + i * Math.max(8, (tableW - 12) / Math.max(1, chairCount / 2 - 1));
      svg.push(`  <circle cx="${chairX}" cy="${cy - tableH / 2 - 5}" r="2.5" fill="#FFFFFF" fill-opacity="0.65"/>`);
      svg.push(`  <circle cx="${chairX}" cy="${cy + tableH / 2 + 5}" r="2.5" fill="#FFFFFF" fill-opacity="0.65"/>`);
    }
    return;
  }

  if (isOpenPlan(room.type)) {
    const deskW = Math.min(13, Math.max(8, w / 5));
    const deskH = Math.min(8, Math.max(5, h / 6));
    const cols = Math.max(1, Math.floor(w / (deskW + 8)));
    const rows = Math.max(1, Math.floor(h / (deskH + 8)));
    const startX = x + Math.max(6, (w - cols * (deskW + 5)) / 2);
    const startY = y + Math.max(6, (h - rows * (deskH + 5)) / 2);
    for (let r = 0; r < Math.min(rows, 5); r += 1) {
      for (let c = 0; c < Math.min(cols, 8); c += 1) {
        const dx = startX + c * (deskW + 5);
        const dy = startY + r * (deskH + 5);
        svg.push(`  <rect x="${dx}" y="${dy}" width="${deskW}" height="${deskH}" rx="1" fill="#FFFFFF" fill-opacity="0.52"/>`);
        svg.push(`  <circle cx="${dx + deskW / 2}" cy="${dy + deskH + 3}" r="2" fill="#FFFFFF" fill-opacity="0.62"/>`);
      }
    }
    return;
  }

  if (isReception(room.type)) {
    svg.push(`  <path d="M ${x + w * 0.18} ${cy + h * 0.08} Q ${cx} ${cy - h * 0.22} ${x + w * 0.82} ${cy + h * 0.08}" fill="none" stroke="#444" stroke-width="1.1"/>`);
    svg.push(`  <rect x="${cx - w * 0.18}" y="${cy + h * 0.08}" width="${w * 0.36}" height="${Math.max(5, h * 0.08)}" rx="2" fill="#FFFFFF" fill-opacity="0.5"/>`);
    return;
  }

  if (isPrivateOffice(room.type)) {
    const deskW = Math.min(w * 0.38, 28);
    const deskH = Math.min(h * 0.22, 14);
    svg.push(`  <rect x="${x + w * 0.12}" y="${y + h * 0.16}" width="${deskW}" height="${deskH}" rx="1" fill="#FFFFFF" fill-opacity="0.55"/>`);
    svg.push(`  <circle cx="${x + w * 0.12 + deskW / 2}" cy="${y + h * 0.16 + deskH + 5}" r="3" fill="#FFFFFF" fill-opacity="0.65"/>`);
    svg.push(`  <rect x="${x + w * 0.62}" y="${y + h * 0.22}" width="${Math.min(15, w * 0.2)}" height="${Math.min(9, h * 0.18)}" rx="2" fill="#FFFFFF" fill-opacity="0.45"/>`);
    return;
  }

  if (isBreakRoom(room.type)) {
    svg.push(`  <rect x="${x + w * 0.12}" y="${y + h * 0.16}" width="${w * 0.76}" height="${Math.max(5, h * 0.12)}" rx="1" fill="#FFFFFF" fill-opacity="0.52"/>`);
    svg.push(`  <circle cx="${x + w * 0.25}" cy="${y + h * 0.5}" r="${Math.min(8, w * 0.08)}" fill="#FFFFFF" fill-opacity="0.48"/>`);
    svg.push(`  <circle cx="${x + w * 0.58}" cy="${y + h * 0.56}" r="${Math.min(7, w * 0.07)}" fill="#FFFFFF" fill-opacity="0.48"/>`);
    return;
  }

  if (isPhoneBooth(room.type)) {
    svg.push(`  <rect x="${cx - w * 0.18}" y="${cy - h * 0.2}" width="${w * 0.36}" height="${h * 0.4}" rx="2" fill="#FFFFFF" fill-opacity="0.45"/>`);
    svg.push(`  <circle cx="${cx}" cy="${cy}" r="2" fill="#FFFFFF" fill-opacity="0.75"/>`);
    return;
  }

  if (isSupport(room.type)) {
    svg.push(`  <rect x="${x + w * 0.16}" y="${y + h * 0.18}" width="${w * 0.68}" height="${Math.max(5, h * 0.18)}" rx="1" fill="#FFFFFF" fill-opacity="0.45"/>`);
    svg.push(`  <line x1="${x + w * 0.2}" y1="${y + h * 0.55}" x2="${x + w * 0.8}" y2="${y + h * 0.55}"/>`);
    return;
  }

  svg.push(`  <rect x="${cx - w * 0.18}" y="${cy - h * 0.14}" width="${w * 0.36}" height="${h * 0.28}" rx="2" fill="#FFFFFF" fill-opacity="0.42"/>`);
}

export function renderLayoutSvg(input: RenderSvgOptions): string {
  return renderToSVG(input.layout, input.geometry, input.scenarioName, input.propertyName ?? "Leasibility AI", input.impactLevel, input.reviewMessage);
}

export function renderScenarioSvg(input: RenderSvgOptions): string {
  return renderLayoutSvg(input);
}
