import type { FloorplateGeometry } from "./floorPlanParser";
import type { LayoutResult, PlacedRoom } from "./layoutEngine";

export interface RenderSvgOptions {
  geometry: FloorplateGeometry;
  layout: LayoutResult;
  scenarioName: string;
  impactLevel: "low" | "medium" | "high";
  reviewMessage?: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function colorForRoom(type: string): string {
  if (/Reception/i.test(type)) return "#dbeafe";
  if (/Conference|Huddle/i.test(type)) return "#e0e7ff";
  if (/Workstation/i.test(type)) return "#dcfce7";
  if (/Private Office/i.test(type)) return "#fef3c7";
  if (/Break/i.test(type)) return "#ffedd5";
  if (/Phone/i.test(type)) return "#f3e8ff";
  if (/Print|Storage|IT|Wellness/i.test(type)) return "#f1f5f9";
  if (/Collaboration|Flexible/i.test(type)) return "#ccfbf1";
  return "#f8fafc";
}

function fontSizeFor(room: PlacedRoom, scale: number): number {
  const minDimPx = Math.min(room.width * scale, room.height * scale);
  if (minDimPx < 34) return 7;
  if (minDimPx < 54) return 8;
  return 10;
}

function coreRect(geometry: FloorplateGeometry) {
  if (geometry.core.type === "none") return undefined;
  const width = geometry.core.width * geometry.width;
  const height = geometry.core.height * geometry.depth;
  return {
    x: Math.max(0, Math.min(geometry.width - width, geometry.core.x * geometry.width)),
    y: Math.max(0, Math.min(geometry.depth - height, geometry.core.y * geometry.depth)),
    width,
    height,
  };
}

function entryPoint(geometry: FloorplateGeometry) {
  return {
    x: Math.max(0, Math.min(geometry.width, geometry.entry.x * geometry.width)),
    y: Math.max(0, Math.min(geometry.depth, geometry.entry.y * geometry.depth)),
    wall: geometry.entry.wall,
  };
}

function renderWindows(geometry: FloorplateGeometry, scale: number): string {
  return geometry.windows.map((window, index) => {
    if (window.wall === "north") {
      const x1 = window.startPct * geometry.width * scale;
      const x2 = window.endPct * geometry.width * scale;
      return `<line key="window-${index}" x1="${x1}" y1="0" x2="${x2}" y2="0" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />`;
    }
    if (window.wall === "south") {
      const x1 = window.startPct * geometry.width * scale;
      const x2 = window.endPct * geometry.width * scale;
      const y = geometry.depth * scale;
      return `<line key="window-${index}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />`;
    }
    if (window.wall === "east") {
      const y1 = window.startPct * geometry.depth * scale;
      const y2 = window.endPct * geometry.depth * scale;
      const x = geometry.width * scale;
      return `<line key="window-${index}" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />`;
    }
    const y1 = window.startPct * geometry.depth * scale;
    const y2 = window.endPct * geometry.depth * scale;
    return `<line key="window-${index}" x1="0" y1="${y1}" x2="0" y2="${y2}" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />`;
  }).join("\n");
}

function renderEntry(geometry: FloorplateGeometry, scale: number): string {
  const entry = entryPoint(geometry);
  const x = entry.x * scale;
  const y = entry.y * scale;
  const labelX = Math.max(38, Math.min(geometry.width * scale - 38, x));
  const labelY = Math.max(16, Math.min(geometry.depth * scale - 12, y + (entry.wall === "north" ? 18 : -10)));
  return `
    <circle cx="${x}" cy="${y}" r="5" fill="#16a34a" stroke="#ffffff" stroke-width="2" />
    <text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#166534">Primary Suite Entry</text>`;
}

function renderScaleBar(scale: number, drawingY: number): string {
  const feet = 20;
  const px = feet * scale;
  return `
    <g transform="translate(0 ${drawingY + 28})">
      <line x1="0" y1="0" x2="${px}" y2="0" stroke="#0f172a" stroke-width="2" />
      <line x1="0" y1="-4" x2="0" y2="4" stroke="#0f172a" stroke-width="2" />
      <line x1="${px}" y1="-4" x2="${px}" y2="4" stroke="#0f172a" stroke-width="2" />
      <text x="${px / 2}" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#334155">20 ft</text>
    </g>`;
}

function renderNorthArrow(x: number, y: number): string {
  return `
    <g transform="translate(${x} ${y})">
      <path d="M0,-18 L8,8 L0,3 L-8,8 Z" fill="#0f172a" />
      <text x="0" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#0f172a">N</text>
    </g>`;
}

function renderRoom(room: PlacedRoom, scale: number): string {
  const x = room.x * scale;
  const y = room.y * scale;
  const width = room.width * scale;
  const height = room.height * scale;
  const fs = fontSizeFor(room, scale);
  const label = escapeXml(room.type);
  const area = escapeXml(`${Math.round(room.sqFt).toLocaleString()} SF`);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${colorForRoom(room.type)}" stroke="#334155" stroke-width="0.85" />
      <text x="${x + width / 2}" y="${y + height / 2 - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fs}" font-weight="700" fill="#0f172a">${label}</text>
      ${height > 34 && width > 42 ? `<text x="${x + width / 2}" y="${y + height / 2 + fs + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(7, fs - 1)}" fill="#475569">${area}</text>` : ""}
    </g>`;
}

export function renderLayoutSvg(options: RenderSvgOptions): string {
  const { geometry, layout, scenarioName, impactLevel, reviewMessage } = options;
  const drawingWidth = 900;
  const drawingHeight = 580;
  const scale = Math.min(drawingWidth / geometry.width, drawingHeight / geometry.depth);
  const planWidth = geometry.width * scale;
  const planHeight = geometry.depth * scale;
  const margin = 42;
  const totalWidth = Math.round(planWidth + margin * 2);
  const headerHeight = 82;
  const footerHeight = 70;
  const reviewHeight = reviewMessage ? 34 : 0;
  const totalHeight = Math.round(planHeight + headerHeight + footerHeight + reviewHeight);
  const title = escapeXml(`${scenarioName} — ${impactLevel.toUpperCase()} IMPACT`);
  const review = reviewMessage ? escapeXml(reviewMessage) : "";
  const core = coreRect(geometry);

  const corridorMarkup = layout.placedCorridors.map(corridor => `
    <rect x="${corridor.x * scale}" y="${corridor.y * scale}" width="${corridor.width * scale}" height="${corridor.height * scale}" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5" stroke-dasharray="4 3" />`).join("\n");

  const roomMarkup = layout.placedRooms.map(room => renderRoom(room, scale)).join("\n");

  const coreMarkup = core ? `
    <rect x="${core.x * scale}" y="${core.y * scale}" width="${core.width * scale}" height="${core.height * scale}" fill="#cbd5e1" stroke="#475569" stroke-width="1.5" />
    <text x="${(core.x + core.width / 2) * scale}" y="${(core.y + core.height / 2) * scale}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#334155">Fixed Core / Restrooms</text>` : "";

  const reviewMarkup = reviewMessage ? `
    <g transform="translate(${margin} ${headerHeight - 18})">
      <rect x="0" y="0" width="${planWidth}" height="26" rx="5" fill="#fef3c7" stroke="#f59e0b" />
      <text x="10" y="17" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#92400e">Needs Review: ${review}</text>
    </g>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-label="${title}">
  <rect width="100%" height="100%" fill="#ffffff" />
  <text x="${margin}" y="28" font-family="Arial, sans-serif" font-size="19" font-weight="800" fill="#0f172a">${title}</text>
  <text x="${margin}" y="50" font-family="Arial, sans-serif" font-size="12" fill="#475569">Efficiency ${layout.efficiencyScore}% • Usable ${layout.usableSqFt.toLocaleString()} SF • Circulation ${layout.circulationSqFt.toLocaleString()} SF • Residual ${layout.residualSqFt.toLocaleString()} SF</text>
  ${reviewMarkup}
  <g transform="translate(${margin} ${headerHeight + reviewHeight})">
    <rect x="0" y="0" width="${planWidth}" height="${planHeight}" fill="#fafafa" stroke="#0f172a" stroke-width="2" />
    ${renderWindows(geometry, scale)}
    ${corridorMarkup}
    ${roomMarkup}
    ${coreMarkup}
    ${renderEntry(geometry, scale)}
    ${renderNorthArrow(planWidth - 30, 28)}
    ${renderScaleBar(scale, planHeight)}
  </g>
  <text x="${margin}" y="${totalHeight - 16}" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Generated from parsed floorplate geometry. Protected shell, entry, glazing, and core are shown for broker review.</text>
</svg>`;
}
