import type { ExtractedWall, FloorplateGeometry } from "./floorPlanParser";
import type { LayoutResult, PlacedRoom, WallSegment } from "./layoutEngine";

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

function normalizedWallToFeet(wall: ExtractedWall) {
  return {
    x1: wall.x1,
    y1: wall.y1,
    x2: wall.x2,
    y2: wall.y2,
  };
}

function renderWallLine(wall: { x1: number; y1: number; x2: number; y2: number }, scale: number, options: { stroke: string; width: number; dash?: string; opacity?: number; label?: string }): string {
  return `<line x1="${wall.x1 * scale}" y1="${wall.y1 * scale}" x2="${wall.x2 * scale}" y2="${wall.y2 * scale}" stroke="${options.stroke}" stroke-width="${options.width}" stroke-linecap="square"${options.dash ? ` stroke-dasharray="${options.dash}"` : ""}${options.opacity ? ` opacity="${options.opacity}"` : ""}${options.label ? ` aria-label="${escapeXml(options.label)}"` : ""} />`;
}

function renderExtractedWall(wall: ExtractedWall, geometry: FloorplateGeometry, scale: number, options: { stroke: string; width: number; dash?: string; opacity?: number; label?: string }): string {
  const line = normalizedWallToFeet({ ...wall, x1: wall.x1 * geometry.width, x2: wall.x2 * geometry.width, y1: wall.y1 * geometry.depth, y2: wall.y2 * geometry.depth });
  return renderWallLine(line, scale, options);
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
      <rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${colorForRoom(room.type)}" fill-opacity="0.72" stroke="#475569" stroke-width="0.55" />
      <text x="${x + width / 2}" y="${y + height / 2 - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fs}" font-weight="700" fill="#0f172a">${label}</text>
      ${height > 34 && width > 42 ? `<text x="${x + width / 2}" y="${y + height / 2 + fs + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(7, fs - 1)}" fill="#475569">${area}</text>` : ""}
    </g>`;
}

function renderNewWall(wall: WallSegment, scale: number): string {
  return renderWallLine(wall, scale, { stroke: "#2563eb", width: 1.7, label: "New Wall" });
}

function renderWallLayers(geometry: FloorplateGeometry, layout: LayoutResult, scale: number): string {
  const keptIds = new Set(layout.keptWalls.map(wall => wall.id));
  const demoIds = new Set(layout.demolishedWalls.map(wall => wall.id));
  const protectedWalls = geometry.walls.filter(wall => wall.isProtected || wall.type === "perimeter" || wall.type === "core");
  const retainedInterior = layout.keptWalls.filter(wall => !wall.isProtected && wall.type === "interior");
  const implicitRetained = geometry.walls.filter(wall => !keptIds.has(wall.id) && !demoIds.has(wall.id) && !wall.isProtected && wall.type === "interior");

  const protectedMarkup = protectedWalls.map(wall => renderExtractedWall(wall, geometry, scale, { stroke: "#111827", width: wall.estimatedThickness === "structural" ? 3.2 : 2.4, label: "Protected wall" })).join("\n");
  const retainedMarkup = [...retainedInterior, ...implicitRetained].map(wall => renderExtractedWall(wall, geometry, scale, { stroke: "#64748b", width: 1.6, opacity: 0.78, label: "Retained interior wall" })).join("\n");
  const demoMarkup = layout.demolishedWalls.map(wall => renderExtractedWall(wall, geometry, scale, { stroke: "#dc2626", width: 2.2, dash: "7 5", opacity: 0.8, label: "Wall to demolish" })).join("\n");
  const newMarkup = layout.newWalls.map(wall => renderNewWall(wall, scale)).join("\n");

  return `
    <g id="protected-walls">${protectedMarkup}</g>
    <g id="retained-walls">${retainedMarkup}</g>
    <g id="demolished-walls">${demoMarkup}</g>
    <g id="new-walls">${newMarkup}</g>`;
}

function renderExistingRooms(geometry: FloorplateGeometry, scale: number): string {
  return geometry.existingRooms.map(room => {
    const x = room.boundingBox.x * geometry.width * scale;
    const y = room.boundingBox.y * geometry.depth * scale;
    const width = room.boundingBox.width * geometry.width * scale;
    const height = room.boundingBox.height * geometry.depth * scale;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="#cbd5e1" stroke-width="0.7" stroke-dasharray="3 3" />`;
  }).join("\n");
}

function renderLegend(x: number, y: number): string {
  const rows = [
    ["#111827", "Protected shell/core", ""],
    ["#64748b", "Retained existing wall", ""],
    ["#dc2626", "Demolition", "7 5"],
    ["#2563eb", "New wall", ""],
    ["#38bdf8", "Window line", ""],
  ];
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="196" height="${rows.length * 19 + 14}" rx="8" fill="#ffffff" fill-opacity="0.9" stroke="#cbd5e1" />
    ${rows.map((row, index) => `<line x1="12" y1="${17 + index * 19}" x2="44" y2="${17 + index * 19}" stroke="${row[0]}" stroke-width="3"${row[2] ? ` stroke-dasharray="${row[2]}"` : ""} /><text x="54" y="${21 + index * 19}" font-family="Arial, sans-serif" font-size="10" fill="#334155">${escapeXml(row[1])}</text>`).join("\n")}
  </g>`;
}

function renderScopeBadge(layout: LayoutResult, planWidth: number): string {
  const demolition = Math.round(layout.demolitionPct * 100);
  return `<g transform="translate(${Math.max(0, planWidth - 238)} 10)">
    <rect x="0" y="0" width="228" height="47" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#0f172a">Wall Scope</text>
    <text x="12" y="34" font-family="Arial, sans-serif" font-size="10" fill="#475569">Demo ${demolition}% • Kept ${layout.keptWalls.length} • New ${layout.newWalls.length}</text>
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
  const headerHeight = 92;
  const footerHeight = 92;
  const reviewHeight = reviewMessage ? 34 : 0;
  const totalHeight = Math.round(planHeight + headerHeight + footerHeight + reviewHeight);
  const title = escapeXml(`${scenarioName} — ${impactLevel.toUpperCase()} IMPACT`);
  const review = reviewMessage ? escapeXml(reviewMessage) : "";
  const core = coreRect(geometry);

  const corridorMarkup = layout.placedCorridors.map(corridor => `
    <rect x="${corridor.x * scale}" y="${corridor.y * scale}" width="${corridor.width * scale}" height="${corridor.height * scale}" fill="#e2e8f0" fill-opacity="0.72" stroke="#94a3b8" stroke-width="0.5" stroke-dasharray="4 3" />`).join("\n");

  const roomMarkup = layout.placedRooms.map(room => renderRoom(room, scale)).join("\n");

  const coreMarkup = core ? `
    <rect x="${core.x * scale}" y="${core.y * scale}" width="${core.width * scale}" height="${core.height * scale}" fill="#cbd5e1" fill-opacity="0.82" stroke="#111827" stroke-width="2.5" />
    <text x="${(core.x + core.width / 2) * scale}" y="${(core.y + core.height / 2) * scale}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#334155">Fixed Core / Restrooms</text>` : "";

  const reviewMarkup = reviewMessage ? `
    <g transform="translate(${margin} ${headerHeight - 23})">
      <rect x="0" y="0" width="${planWidth}" height="26" rx="5" fill="#fef3c7" stroke="#f59e0b" />
      <text x="10" y="17" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#92400e">Needs Review: ${review}</text>
    </g>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-label="${title}">
  <rect width="100%" height="100%" fill="#ffffff" />
  <text x="${margin}" y="28" font-family="Arial, sans-serif" font-size="19" font-weight="800" fill="#0f172a">${title}</text>
  <text x="${margin}" y="50" font-family="Arial, sans-serif" font-size="12" fill="#475569">Efficiency ${layout.efficiencyScore}% • Program Fit ${layout.programFitPct}% • Demo ${Math.round(layout.demolitionPct * 100)}% • Usable ${layout.usableSqFt.toLocaleString()} SF</text>
  <text x="${margin}" y="68" font-family="Arial, sans-serif" font-size="10" fill="#64748b">${escapeXml(layout.scenarioNarrative)}</text>
  ${reviewMarkup}
  <g transform="translate(${margin} ${headerHeight + reviewHeight})">
    <rect x="0" y="0" width="${planWidth}" height="${planHeight}" fill="#fafafa" stroke="#111827" stroke-width="2.4" />
    <g id="existing-room-reference">${renderExistingRooms(geometry, scale)}</g>
    ${renderWindows(geometry, scale)}
    ${corridorMarkup}
    ${roomMarkup}
    ${coreMarkup}
    ${renderWallLayers(geometry, layout, scale)}
    ${renderEntry(geometry, scale)}
    ${renderNorthArrow(planWidth - 30, 32)}
    ${renderScopeBadge(layout, planWidth)}
    ${renderLegend(12, Math.max(70, planHeight - 116))}
    ${renderScaleBar(scale, planHeight)}
  </g>
  <text x="${margin}" y="${totalHeight - 36}" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Wall-first SVG rendering: protected shell/core, retained partitions, demolition scope, and new construction are shown as separate explicit layers.</text>
  <text x="${margin}" y="${totalHeight - 18}" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Source ${escapeXml(geometry.source)} • Confidence ${escapeXml(geometry.confidence)} • Extracted walls ${geometry.walls.length} • Existing rooms ${geometry.existingRooms.length}</text>
</svg>`;
}
