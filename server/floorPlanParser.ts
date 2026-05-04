import type { CoreElement, EntryPoint, LineSegment, ParsedFloorPlanGeometry, Rect } from "./layout/types";

export type FloorplateShape = "rectangle" | "L-shape" | "U-shape" | "irregular";
export type ConfidenceLabel = "high" | "medium" | "low";
export type Wall = "north" | "south" | "east" | "west";
export type GeometrySource = "parsed" | "fallback";
export type ExtractedWallType = "perimeter" | "core" | "interior";
export type EstimatedWallThickness = "structural" | "partition";

export interface ExtractedWall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: ExtractedWallType;
  isProtected: boolean;
  estimatedThickness: EstimatedWallThickness;
  linearFeet: number;
}

export interface ExistingRoom {
  id: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedSqFt: number;
  label: string | null;
  wallIds: string[];
}

export interface FloorplateGeometry {
  width: number;
  depth: number;
  totalSqFt: number;
  shape: FloorplateShape;
  aspectRatio: number;
  core: { x: number; y: number; width: number; height: number; type: "center" | "side" | "end" | "none" };
  entry: { x: number; y: number; wall: Wall };
  windows: Array<{ wall: Wall; startPct: number; endPct: number }>;
  walls: ExtractedWall[];
  existingRooms: ExistingRoom[];
  confidence: ConfidenceLabel;
  source: GeometrySource;
  parseWarnings: string[];
}

export interface ParseFloorPlanInput {
  totalSqFt: number;
  floorPlanUrl?: string;
  floorPlanBase64?: string;
  floorPlanMimeType?: string;
}

type VisionShape = "rectangle" | "L-shape" | "U-shape" | "irregular" | "l_shape" | "u_shape" | "unknown";

interface VisionWall {
  id?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  type?: ExtractedWallType | string;
  isProtected?: boolean;
  estimatedThickness?: EstimatedWallThickness | string;
}

interface VisionRoom {
  id?: string;
  boundingBox?: Partial<ExistingRoom["boundingBox"]>;
  estimatedSqFt?: number;
  label?: string | null;
  wallIds?: string[];
}

interface VisionFloorplateGeometry {
  width?: number;
  depth?: number;
  shape?: VisionShape;
  core?: Partial<FloorplateGeometry["core"]>;
  entry?: Partial<FloorplateGeometry["entry"]>;
  windows?: Array<Partial<FloorplateGeometry["windows"][number]>>;
  walls?: VisionWall[];
  existingRooms?: VisionRoom[];
  confidence?: ConfidenceLabel | string;
  parseWarnings?: string[];
}

const VISION_PROMPT = `You are an expert architectural space planner analyzing a commercial office floor plan image.
Extract ALL of the following and return ONLY valid JSON matching this exact schema:

{
  "width": <building width in feet — estimate from proportions if unlabeled>,
  "depth": <building depth in feet — estimate from proportions if unlabeled>,
  "shape": <"rectangle" | "L-shape" | "U-shape" | "irregular">,
  "core": {
    "x": <0-1 normalized from left>,
    "y": <0-1 normalized from top>,
    "width": <0-1>,
    "height": <0-1>,
    "type": <"center" | "side" | "end" | "none">
  },
  "entry": {
    "x": <0-1>,
    "y": <0-1>,
    "wall": <"north" | "south" | "east" | "west">
  },
  "windows": [
    { "wall": <"north"|"south"|"east"|"west">, "startPct": <0-1>, "endPct": <0-1> }
  ],
  "walls": [
    {
      "x1": <0-1>, "y1": <0-1>, "x2": <0-1>, "y2": <0-1>,
      "type": <"perimeter"|"core"|"interior">,
      "isProtected": <true for perimeter/core, false for interior partitions>,
      "estimatedThickness": <"structural" for thick/bearing walls, "partition" for thin partitions>
    }
  ],
  "existingRooms": [
    {
      "id": <"room_1", "room_2" etc>,
      "boundingBox": { "x": <0-1>, "y": <0-1>, "width": <0-1>, "height": <0-1> },
      "estimatedSqFt": <number>,
      "label": <room label text visible in plan, or null>
    }
  ],
  "confidence": <"high" | "medium" | "low">,
  "parseWarnings": [<list any assumptions or extraction issues>]
}

Rules:
- All coordinates are normalized 0-1 where 0,0 = top-left corner. North = top of image.
- Extract EVERY visible wall segment as a separate entry in the walls array.
- Mark perimeter and core walls as isProtected: true. Interior partitions as isProtected: false.
- For existingRooms, estimate sqFt by scaling boundingBox dimensions against building totalSqFt.
- If wall or room extraction is unclear, return empty arrays and set confidence to "low".`;

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function positive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: unknown, fallback: number): number {
  return round(clamp(positive(value) || value === 0 ? Number(value) : fallback, 0, 1), 4);
}

function normalizeWall(value: unknown, fallback: Wall): Wall {
  return value === "north" || value === "south" || value === "east" || value === "west" ? value : fallback;
}

function normalizeShape(value: unknown): FloorplateShape {
  if (value === "L-shape" || value === "l_shape") return "L-shape";
  if (value === "U-shape" || value === "u_shape") return "U-shape";
  if (value === "irregular") return "irregular";
  return "rectangle";
}

function normalizeConfidence(value: unknown): ConfidenceLabel {
  return value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function normalizeWallType(value: unknown): ExtractedWallType {
  if (value === "perimeter" || value === "core" || value === "interior") return value;
  return "interior";
}

function normalizeThickness(value: unknown, wallType: ExtractedWallType): EstimatedWallThickness {
  if (value === "structural" || value === "partition") return value;
  return wallType === "interior" ? "partition" : "structural";
}

function scaleDimensionsToAuthoritativeArea(width: number, depth: number, totalSqFt: number): { width: number; depth: number } {
  const safeArea = Math.max(500, totalSqFt || 5000);
  const fallback = fallbackDimensions(safeArea);
  const safeWidth = positive(width) ? width : fallback.width;
  const safeDepth = positive(depth) ? depth : fallback.depth;
  const parsedArea = safeWidth * safeDepth;
  if (!Number.isFinite(parsedArea) || parsedArea <= 0) return fallback;
  const scale = Math.sqrt(safeArea / parsedArea);
  return {
    width: round(Math.max(20, safeWidth * scale)),
    depth: round(Math.max(20, safeDepth * scale)),
  };
}

function fallbackDimensions(totalSqFt: number): { width: number; depth: number } {
  const safeArea = Math.max(500, totalSqFt || 5000);
  return {
    width: round(Math.sqrt(safeArea * 1.5)),
    depth: round(Math.sqrt(safeArea / 1.5)),
  };
}

export function fallbackFloorplateGeometry(totalSqFt: number, warning?: string): FloorplateGeometry {
  const safeArea = Math.max(500, Math.round(totalSqFt || 5000));
  const { width, depth } = fallbackDimensions(safeArea);
  return attachCompatibilityAliases({
    width,
    depth,
    totalSqFt: safeArea,
    shape: "rectangle",
    aspectRatio: round(width / depth, 3),
    core: { x: 0.35, y: 0.3, width: 0.3, height: 0.4, type: "center" },
    entry: { x: 0.5, y: 1, wall: "south" },
    windows: [
      { wall: "north", startPct: 0, endPct: 1 },
      { wall: "south", startPct: 0, endPct: 1 },
      { wall: "east", startPct: 0, endPct: 1 },
      { wall: "west", startPct: 0, endPct: 1 },
    ],
    walls: [],
    existingRooms: [],
    confidence: "low",
    source: "fallback",
    parseWarnings: [warning ?? "No confidently parseable uploaded floor plan was available; using safe rectangular fallback geometry anchored to user-provided total square footage."],
  });
}

function wallLengthFeet(wall: Pick<ExtractedWall, "x1" | "y1" | "x2" | "y2">, width: number, depth: number): number {
  const dx = (wall.x2 - wall.x1) * width;
  const dy = (wall.y2 - wall.y1) * depth;
  return round(Math.hypot(dx, dy));
}

function normalizeVisionWalls(visionWalls: VisionWall[] | undefined, width: number, depth: number): ExtractedWall[] {
  return (visionWalls ?? [])
    .map((wall, index) => {
      const type = normalizeWallType(wall.type);
      const normalized: ExtractedWall = {
        id: typeof wall.id === "string" && wall.id.trim() ? wall.id.trim() : `wall_${index + 1}`,
        x1: clamp01(wall.x1, 0),
        y1: clamp01(wall.y1, 0),
        x2: clamp01(wall.x2, 0),
        y2: clamp01(wall.y2, 0),
        type,
        isProtected: type === "perimeter" || type === "core" ? true : wall.isProtected === true,
        estimatedThickness: normalizeThickness(wall.estimatedThickness, type),
        linearFeet: 0,
      };
      normalized.linearFeet = wallLengthFeet(normalized, width, depth);
      return normalized;
    })
    .filter(wall => wall.linearFeet >= 1);
}

function normalizeExistingRooms(rooms: VisionRoom[] | undefined, totalSqFt: number): ExistingRoom[] {
  return (rooms ?? [])
    .map((room, index) => {
      const box = room.boundingBox ?? {};
      const width = clamp01(box.width, 0);
      const height = clamp01(box.height, 0);
      const x = clamp(Math.min(clamp01(box.x, 0), 1 - width), 0, 1);
      const y = clamp(Math.min(clamp01(box.y, 0), 1 - height), 0, 1);
      const estimatedSqFt = positive(room.estimatedSqFt) ? Math.round(room.estimatedSqFt) : Math.round(width * height * totalSqFt);
      return {
        id: typeof room.id === "string" && room.id.trim() ? room.id.trim() : `room_${index + 1}`,
        boundingBox: { x: round(x, 4), y: round(y, 4), width, height },
        estimatedSqFt,
        label: typeof room.label === "string" && room.label.trim() ? room.label.trim() : null,
        wallIds: Array.isArray(room.wallIds) ? room.wallIds.filter(Boolean).map(String) : [],
      };
    })
    .filter(room => room.boundingBox.width > 0.01 && room.boundingBox.height > 0.01 && room.estimatedSqFt >= 20);
}

function normalizeVisionGeometry(input: ParseFloorPlanInput, vision: VisionFloorplateGeometry): FloorplateGeometry {
  const totalSqFt = Math.max(500, Math.round(input.totalSqFt || 5000));
  const confidence = normalizeConfidence(vision.confidence);
  if (confidence === "low") {
    return fallbackFloorplateGeometry(totalSqFt, "Claude Vision returned low confidence; using safe fallback geometry as required by parser rules.");
  }

  const scaled = scaleDimensionsToAuthoritativeArea(Number(vision.width), Number(vision.depth), totalSqFt);
  const walls = normalizeVisionWalls(vision.walls, scaled.width, scaled.depth);
  if (walls.length === 0) {
    return fallbackFloorplateGeometry(totalSqFt, "Claude Vision did not return usable wall segments; using safe fallback geometry because wall extraction is required for the rebuild engine.");
  }

  const coreType = vision.core?.type === "side" || vision.core?.type === "end" || vision.core?.type === "none" || vision.core?.type === "center" ? vision.core.type : "center";
  const windows = (vision.windows ?? [])
    .map(window => {
      const startPct = clamp01(window.startPct, 0.05);
      const endPct = clamp01(window.endPct, 0.95);
      return {
        wall: normalizeWall(window.wall, "north"),
        startPct: Math.min(startPct, endPct),
        endPct: Math.max(startPct, endPct),
      };
    })
    .filter(window => window.endPct - window.startPct >= 0.05)
    .slice(0, 12);

  const warnings = Array.isArray(vision.parseWarnings) ? vision.parseWarnings.filter(Boolean).map(String) : [];
  if (Math.abs(scaled.width * scaled.depth - totalSqFt) / totalSqFt > 0.04) {
    warnings.push("Parsed dimensions were proportionally scaled so width × depth remains anchored to the user-provided total square footage.");
  }

  const existingRooms = normalizeExistingRooms(vision.existingRooms, totalSqFt);
  if (existingRooms.length === 0) {
    warnings.push("No existing room polygons were confidently extracted; layout engine will generate fresh room program while preserving extracted walls.");
  }

  return attachCompatibilityAliases({
    width: scaled.width,
    depth: scaled.depth,
    totalSqFt,
    shape: normalizeShape(vision.shape),
    aspectRatio: round(scaled.width / scaled.depth, 3),
    core: {
      x: clamp01(vision.core?.x, 0.35),
      y: clamp01(vision.core?.y, 0.3),
      width: clamp01(vision.core?.width, 0.3),
      height: clamp01(vision.core?.height, 0.4),
      type: coreType,
    },
    entry: {
      x: clamp01(vision.entry?.x, 0.5),
      y: clamp01(vision.entry?.y, 1),
      wall: normalizeWall(vision.entry?.wall, "south"),
    },
    windows: windows.length > 0 ? windows : fallbackFloorplateGeometry(totalSqFt).windows,
    walls,
    existingRooms,
    confidence,
    source: "parsed",
    parseWarnings: warnings,
  });
}

function inferMimeType(url: string | undefined, provided?: string): string {
  if (provided) return provided;
  const lower = url?.toLowerCase() ?? "";
  if (lower.includes(".pdf")) return "application/pdf";
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".gif")) return "image/gif";
  return "image/jpeg";
}

async function fetchFloorPlanAsBase64(input: ParseFloorPlanInput): Promise<{ base64: string; mimeType: string } | undefined> {
  if (input.floorPlanBase64) {
    return { base64: input.floorPlanBase64, mimeType: inferMimeType(input.floorPlanUrl, input.floorPlanMimeType) };
  }
  if (!input.floorPlanUrl) return undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(input.floorPlanUrl, { signal: controller.signal });
    if (!response.ok) throw new Error(`Failed to fetch uploaded plan: ${response.status}`);
    const mimeType = response.headers.get("content-type")?.split(";")[0] ?? inferMimeType(input.floorPlanUrl, input.floorPlanMimeType);
    const arrayBuffer = await response.arrayBuffer();
    return { base64: Buffer.from(arrayBuffer).toString("base64"), mimeType };
  } finally {
    clearTimeout(timeout);
  }
}

function extractJson(text: string): VisionFloorplateGeometry {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Claude Vision response did not include a JSON object");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function callClaudeVision(input: ParseFloorPlanInput): Promise<VisionFloorplateGeometry | undefined> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return undefined;

  const plan = await fetchFloorPlanAsBase64(input);
  if (!plan) return undefined;

  const isPdf = plan.mimeType === "application/pdf";
  const mediaBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: plan.mimeType, data: plan.base64 } }
    : { type: "image", source: { type: "base64", media_type: plan.mimeType, data: plan.base64 } };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_VISION_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 3200,
      temperature: 0,
      system: VISION_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            mediaBlock,
            {
              type: "text",
              text: `Analyze this uploaded office floor plan. Authoritative total square feet: ${Math.round(input.totalSqFt || 0)}. Return JSON only with walls[] and existingRooms[].`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude Vision request failed: ${response.status} ${body.slice(0, 240)}`);
  }

  const json = await response.json() as { content?: Array<{ type: string; text?: string }> };
  const text = json.content?.find(part => part.type === "text")?.text;
  if (!text) throw new Error("Claude Vision response did not include text content");
  return extractJson(text);
}

export async function parseFloorPlanGeometry(input: ParseFloorPlanInput): Promise<FloorplateGeometry> {
  if (!input.floorPlanUrl && !input.floorPlanBase64) {
    return fallbackFloorplateGeometry(input.totalSqFt, "No uploaded plan was provided; using safe rectangular fallback geometry anchored to user-provided square footage.");
  }

  try {
    const vision = await callClaudeVision(input);
    if (!vision) {
      return fallbackFloorplateGeometry(input.totalSqFt, "Claude Vision was not configured or no plan media was available; using safe fallback geometry.");
    }
    return normalizeVisionGeometry(input, vision);
  } catch (error) {
    console.error("[FloorPlanParser] Claude Vision parsing failed, using fallback geometry:", error);
    return fallbackFloorplateGeometry(input.totalSqFt, "Claude Vision parsing failed; using safe fallback geometry anchored to user-provided square footage.");
  }
}

function toFeetX(geometry: FloorplateGeometry, normalized: number): number {
  return round(clamp(normalized, 0, 1) * geometry.width);
}

function toFeetY(geometry: FloorplateGeometry, normalized: number): number {
  return round(clamp(normalized, 0, 1) * geometry.depth);
}

function confidenceNumber(confidence: ConfidenceLabel): number {
  return confidence === "high" ? 0.86 : confidence === "medium" ? 0.72 : 0.58;
}

export function floorplateToRect(geometry: FloorplateGeometry): Rect {
  return { x: 0, y: 0, width: geometry.width, height: geometry.depth };
}

export function coreToFeet(geometry: FloorplateGeometry): CoreElement {
  const width = round(Math.max(0, Math.min(geometry.width, geometry.core.width * geometry.width)));
  const height = round(Math.max(0, Math.min(geometry.depth, geometry.core.height * geometry.depth)));
  const x = round(Math.max(0, Math.min(geometry.width - width, geometry.core.x * geometry.width)));
  const y = round(Math.max(0, Math.min(geometry.depth - height, geometry.core.y * geometry.depth)));
  return {
    id: "core-1",
    type: "core",
    label: geometry.core.type === "none" ? "No Visible Core" : "Fixed Core / Restrooms",
    x,
    y,
    width,
    height,
    fixed: true,
    confidence: confidenceNumber(geometry.confidence),
  };
}

export function entryToFeet(geometry: FloorplateGeometry): EntryPoint {
  return {
    id: "entry-primary",
    type: "primary",
    label: "Primary Suite Entry",
    x: toFeetX(geometry, geometry.entry.x),
    y: toFeetY(geometry, geometry.entry.y),
    confidence: confidenceNumber(geometry.confidence),
  };
}

export function windowsToSegments(geometry: FloorplateGeometry): LineSegment[] {
  return geometry.windows.map(window => {
    if (window.wall === "north") return { x1: round(window.startPct * geometry.width), y1: 0, x2: round(window.endPct * geometry.width), y2: 0, confidence: confidenceNumber(geometry.confidence) };
    if (window.wall === "south") return { x1: round(window.startPct * geometry.width), y1: geometry.depth, x2: round(window.endPct * geometry.width), y2: geometry.depth, confidence: confidenceNumber(geometry.confidence) };
    if (window.wall === "east") return { x1: geometry.width, y1: round(window.startPct * geometry.depth), x2: geometry.width, y2: round(window.endPct * geometry.depth), confidence: confidenceNumber(geometry.confidence) };
    return { x1: 0, y1: round(window.startPct * geometry.depth), x2: 0, y2: round(window.endPct * geometry.depth), confidence: confidenceNumber(geometry.confidence) };
  });
}

function wallsToSegments(geometry: FloorplateGeometry): LineSegment[] {
  return geometry.walls
    .filter(wall => wall.type === "interior")
    .map(wall => ({
      x1: toFeetX(geometry, wall.x1),
      y1: toFeetY(geometry, wall.y1),
      x2: toFeetX(geometry, wall.x2),
      y2: toFeetY(geometry, wall.y2),
      confidence: confidenceNumber(geometry.confidence),
    }));
}

function requiresGeometryReview(geometry: FloorplateGeometry): boolean {
  const syntheticNoUpload = geometry.source === "fallback" && geometry.parseWarnings.some(reason => reason.startsWith("No uploaded plan was provided"));
  if (syntheticNoUpload) return false;
  return geometry.source === "fallback" || geometry.confidence !== "high" || geometry.parseWarnings.length > 0;
}

function attachCompatibilityAliases<T extends FloorplateGeometry>(geometry: T): T {
  const coreElements = geometry.core.type === "none" ? [] : [coreToFeet(geometry)];
  const legacy = {
    floorplate: floorplateToRect(geometry),
    coreElements,
    entryPoints: [entryToFeet(geometry)],
    existingInteriorWalls: wallsToSegments(geometry),
    reviewRequired: requiresGeometryReview(geometry),
    reviewReasons: requiresGeometryReview(geometry) ? geometry.parseWarnings : [],
  };
  return Object.assign(geometry, legacy);
}

export function toParsedFloorPlanGeometry(geometry: FloorplateGeometry): ParsedFloorPlanGeometry {
  const coreElements = geometry.core.type === "none" ? [] : [coreToFeet(geometry)];
  return {
    floorplate: floorplateToRect(geometry),
    totalSqFt: geometry.totalSqFt,
    coreElements,
    entryPoints: [entryToFeet(geometry)],
    windows: windowsToSegments(geometry),
    existingInteriorWalls: wallsToSegments(geometry),
    confidence: confidenceNumber(geometry.confidence),
    source: geometry.source === "parsed" ? "uploaded_plan" : "synthetic_rectangular_model",
    reviewRequired: requiresGeometryReview(geometry),
    reviewReasons: requiresGeometryReview(geometry) ? geometry.parseWarnings : [],
  };
}
