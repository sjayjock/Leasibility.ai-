/**
 * Refined architectural SVG renderer for broker-facing Leasibility test-fit reports.
 */
import type { LayoutOutput } from "./layoutEngine";
import type { Rect } from "./geometry";
import type { CoreElement, EntryPoint, LineSegment, RenderingStatus, ScenarioImpactLevel } from "./types";

const SCALE = 8;
const WALL = 3;
const ROOM_COLORS: Record<string, string> = {
  Reception: "#D4AF37",
  "Open Workspace": "#2563EB",
  "Private Office": "#1E3A5F",
  "Conference Room": "#166534",
  "Huddle Room": "#14532D",
  "Break Room": "#78350F",
  "Collaboration Zone": "#0F766E",
  "Phone Booth": "#475569",
  Lounge: "#7C3AED",
  Storage: "#374151",
  "Server Room": "#1F2937",
  "Focus Room": "#065F46",
  "Print Area": "#4B5563",
  "IT Room": "#1E3A5F",
};

export interface SvgRenderContext {
  impactLevel?: ScenarioImpactLevel;
  coreElements?: CoreElement[];
  entryPoints?: EntryPoint[];
  windows?: LineSegment[];
  existingInteriorWalls?: LineSegment[];
  renderingStatus?: RenderingStatus;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function toSvgCoords(r: Rect, floorplate: Rect): { x: number; y: number; w: number; h: number } {
  const svgX = (r.x - floorplate.x) * SCALE;
  const svgY = (floorplate.y + floorplate.height - r.y - r.height) * SCALE;
  return { x: svgX, y: svgY, w: r.width * SCALE, h: r.height * SCALE };
}

function pointToSvg(p: { x: number; y: number }, floorplate: Rect): { x: number; y: number } {
  return { x: (p.x - floorplate.x) * SCALE, y: (floorplate.y + floorplate.height - p.y) * SCALE };
}

function lineToSvg(line: LineSegment, floorplate: Rect): { x1: number; y1: number; x2: number; y2: number } {
  const start = pointToSvg({ x: line.x1, y: line.y1 }, floorplate);
  const end = pointToSvg({ x: line.x2, y: line.y2 }, floorplate);
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y };
}

function renderTextLines(text: string, x: number, y: number, maxChars: number, fontSize = 9): string {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  const startY = y - ((lines.length - 1) * (fontSize + 2)) / 2;
  return lines.slice(0, 3).map((line, index) => `<text x="${x}" y="${startY + index * (fontSize + 2)}" font-size="${fontSize}" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" text-anchor="middle" font-weight="700">${escapeXml(line)}</text>`).join("");
}

function renderFurniture(type: string, x: number, y: number, w: number, h: number): string {
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  if (type.includes("Conference") || type.includes("Huddle")) {
    const tableW = Math.max(18, w * 0.38);
    const tableH = Math.max(10, h * 0.22);
    return `<rect x="${centerX - tableW / 2}" y="${centerY - tableH / 2}" width="${tableW}" height="${tableH}" rx="5" fill="#FFFFFF" fill-opacity="0.18" stroke="#FFFFFF80" stroke-width="0.8"/><circle cx="${centerX - tableW / 2 - 6}" cy="${centerY}" r="3" fill="#FFFFFF60"/><circle cx="${centerX + tableW / 2 + 6}" cy="${centerY}" r="3" fill="#FFFFFF60"/>`;
  }
  if (type.includes("Office")) {
    return `<rect x="${x + w * 0.15}" y="${y + h * 0.18}" width="${w * 0.34}" height="${h * 0.18}" rx="2" fill="#FFFFFF" fill-opacity="0.16"/><circle cx="${x + w * 0.58}" cy="${y + h * 0.30}" r="4" fill="#FFFFFF60"/>`;
  }
  if (type.includes("Workspace")) {
    const desks: string[] = [];
    const cols = Math.max(2, Math.min(5, Math.floor(w / 28)));
    const rows = Math.max(1, Math.min(3, Math.floor(h / 26)));
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) desks.push(`<rect x="${x + 10 + col * 22}" y="${y + 12 + row * 18}" width="13" height="8" rx="1" fill="#FFFFFF" fill-opacity="0.18"/>`);
    return desks.join("");
  }
  if (type.includes("Break")) {
    return `<rect x="${x + 8}" y="${y + 8}" width="${Math.max(20, w * 0.5)}" height="7" fill="#FFFFFF" fill-opacity="0.22"/><circle cx="${centerX}" cy="${centerY + 5}" r="8" fill="#FFFFFF" fill-opacity="0.14"/>`;
  }
  return "";
}

export function renderToSVG(output: LayoutOutput, floorplate: Rect, label = "LEASIBILITY AI — LAYOUT PREVIEW", context: SvgRenderContext = {}): string {
  const svgW = Math.max(420, floorplate.width * SCALE);
  const svgH = Math.max(280, floorplate.height * SCALE);
  const status = context.renderingStatus;
  const noticeH = status?.status === "needs_review" ? 42 : 0;
  const viewH = svgH + 58 + noticeH;
  let elements = "";

  elements += `<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" stroke-opacity="0.035" stroke-width="1"/></pattern><filter id="shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.25"/></filter></defs>`;
  elements += `<rect x="0" y="0" width="${svgW}" height="${viewH}" fill="#0A1628"/>`;
  elements += `<g transform="translate(0 ${noticeH})">`;
  elements += `<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#0F1F3D" stroke="#FFFFFF" stroke-width="${WALL}" rx="6" filter="url(#shadow)"/>`;
  elements += `<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="url(#grid)"/>`;

  for (const line of context.existingInteriorWalls ?? []) {
    const l = lineToSvg(line, floorplate);
    const style = context.impactLevel === "high" ? "stroke-dasharray=\"7,5\" stroke=\"#EF4444\" stroke-opacity=\"0.42\"" : "stroke=\"#FFFFFF\" stroke-opacity=\"0.18\"";
    elements += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" ${style} stroke-width="1.5"/>`;
  }

  for (const windowLine of context.windows ?? []) {
    const l = lineToSvg(windowLine, floorplate);
    elements += `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#7DD3FC" stroke-width="5" stroke-linecap="round" stroke-opacity="0.92"/>`;
  }

  for (const corridor of output.corridors) {
    const c = toSvgCoords(corridor.rect, floorplate);
    elements += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="#FFFFFF" fill-opacity="0.10" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="0.8" stroke-dasharray="4,3"/>`;
    elements += `<text x="${c.x + c.w / 2}" y="${c.y + c.h / 2 + 4}" font-size="8" fill="#FFFFFF70" font-family="Inter, Arial, sans-serif" text-anchor="middle" font-weight="700">CIRCULATION</text>`;
  }

  for (const core of context.coreElements ?? []) {
    const c = toSvgCoords(core, floorplate);
    elements += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="#111827" fill-opacity="0.92" stroke="#FFFFFF" stroke-width="1.4" stroke-dasharray="3,2" rx="3"/>`;
    elements += renderTextLines(core.label, c.x + c.w / 2, c.y + c.h / 2, 18, 8);
  }

  for (const room of output.rooms) {
    const r = toSvgCoords(room.rect, floorplate);
    if (r.w < 6 || r.h < 6) continue;
    const fill = ROOM_COLORS[room.type] ?? "#334155";
    elements += `<rect x="${r.x + 1}" y="${r.y + 1}" width="${Math.max(1, r.w - 2)}" height="${Math.max(1, r.h - 2)}" fill="${fill}" fill-opacity="0.86" stroke="#FFFFFF" stroke-width="1" rx="2"/>`;
    elements += renderFurniture(room.type, r.x, r.y, r.w, r.h);
    elements += renderTextLines(room.type, r.x + r.w / 2, r.y + r.h / 2 - 4, Math.max(8, Math.floor(r.w / 6)), r.w < 70 ? 7 : 9);
    elements += `<text x="${r.x + r.w / 2}" y="${r.y + r.h - 7}" font-size="7" fill="#FFFFFFA0" font-family="Inter, Arial, sans-serif" text-anchor="middle">${Math.round(room.area).toLocaleString()} sf</text>`;
    const doorR = Math.min(13, r.w * 0.22, r.h * 0.22);
    elements += `<path d="M ${r.x + 2} ${r.y + r.h - 2} A ${doorR} ${doorR} 0 0 1 ${r.x + 2 + doorR} ${r.y + r.h - 2 - doorR}" fill="none" stroke="#FFFFFF90" stroke-width="0.9"/>`;
    elements += `<line x1="${r.x + 2}" y1="${r.y + r.h - 2}" x2="${r.x + 2 + doorR}" y2="${r.y + r.h - 2}" stroke="#FFFFFF90" stroke-width="0.9"/>`;
  }

  for (const entry of context.entryPoints ?? []) {
    const p = pointToSvg(entry, floorplate);
    elements += `<circle cx="${p.x}" cy="${p.y}" r="7" fill="#D4AF37" stroke="#FFFFFF" stroke-width="1.2"/>`;
    elements += `<text x="${p.x + 10}" y="${p.y - 8}" font-size="8" fill="#D4AF37" font-family="Inter, Arial, sans-serif" font-weight="700">${escapeXml(entry.label)}</text>`;
  }

  const eff = Math.round(output.efficiencyScore * 100);
  elements += `<circle cx="${svgW - 34}" cy="34" r="25" fill="#D4AF37" fill-opacity="0.16" stroke="#D4AF37" stroke-width="1.6"/>`;
  elements += `<text x="${svgW - 34}" y="31" font-size="12" fill="#D4AF37" font-family="Inter, Arial, sans-serif" text-anchor="middle" font-weight="800">${eff}%</text>`;
  elements += `<text x="${svgW - 34}" y="44" font-size="6" fill="#D4AF37AA" font-family="Inter, Arial, sans-serif" text-anchor="middle">EFF</text>`;
  elements += `</g>`;

  if (status?.status === "needs_review") {
    elements += `<rect x="0" y="0" width="${svgW}" height="${noticeH}" fill="#3B2500"/><text x="16" y="18" font-size="12" fill="#FBBF24" font-family="Inter, Arial, sans-serif" font-weight="800">PLANNING CONFIDENCE NOTE</text><text x="16" y="33" font-size="10" fill="#FDE68A" font-family="Inter, Arial, sans-serif">${escapeXml(status.message)}</text>`;
  }

  const footerY = svgH + noticeH + 22;
  elements += `<text x="${svgW / 2}" y="${footerY}" font-size="10" fill="#D4AF37" fill-opacity="0.82" font-family="Montserrat, Inter, Arial, sans-serif" text-anchor="middle" font-weight="800">${escapeXml(label)}</text>`;
  elements += `<line x1="18" y1="${footerY + 18}" x2="${18 + 40 * SCALE / 5}" y2="${footerY + 18}" stroke="#FFFFFF" stroke-width="2"/><text x="18" y="${footerY + 32}" font-size="8" fill="#FFFFFF70" font-family="Inter, Arial, sans-serif">40 ft scale bar</text>`;
  elements += `<path d="M ${svgW - 42} ${footerY + 30} L ${svgW - 32} ${footerY + 8} L ${svgW - 22} ${footerY + 30} Z" fill="#FFFFFF80"/><text x="${svgW - 32}" y="${footerY + 42}" font-size="8" fill="#FFFFFF80" text-anchor="middle" font-family="Inter, Arial, sans-serif">N</text>`;

  return `<svg viewBox="0 0 ${svgW} ${viewH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(label)}" style="background:#0A1628;border-radius:12px;width:100%;max-width:${svgW}px">${elements}</svg>`;
}
