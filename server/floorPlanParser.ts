import type { CoreElement, EntryPoint, LineSegment, ParsedFloorPlanGeometry, Rect } from "./layout/types";

function round(value: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export interface ParseFloorPlanInput {
  totalSqFt: number;
  floorPlanUrl?: string;
  floorPlanBase64?: string;
  floorPlanMimeType?: string;
}

type ClaudeShape = "rectangle" | "l_shape" | "irregular" | "unknown";

interface ClaudeFloorPlanGeometry {
  widthFt?: number;
  depthFt?: number;
  totalSqFt?: number;
  shape?: ClaudeShape;
  coreElements?: Array<Partial<CoreElement> & { type?: CoreElement["type"] | string }>;
  entryPoints?: Array<Partial<EntryPoint> & { type?: EntryPoint["type"] | string }>;
  windows?: Array<Partial<LineSegment>>;
  existingInteriorWalls?: Array<Partial<LineSegment>>;
  confidence?: number;
  reviewReasons?: string[];
}

export function buildRectangularFloorplate(totalSqFt: number): Rect {
  const safeArea = Math.max(500, totalSqFt || 5000);
  const aspectRatio = safeArea > 18000 ? 2.05 : safeArea > 9000 ? 1.75 : 1.55;
  const width = Math.sqrt(safeArea * aspectRatio);
  const height = safeArea / width;
  return {
    x: 0,
    y: 0,
    width: round(width),
    height: round(height),
  };
}

function buildDefaultCore(floorplate: Rect): CoreElement[] {
  const coreWidth = Math.max(18, floorplate.width * 0.15);
  const coreHeight = Math.max(20, floorplate.height * 0.24);
  const coreX = floorplate.x + floorplate.width * 0.48 - coreWidth / 2;
  const coreY = floorplate.y + floorplate.height * 0.52 - coreHeight / 2;
  return [
    {
      id: "core-1",
      type: "core",
      label: "Fixed Core / Restrooms",
      x: round(coreX),
      y: round(coreY),
      width: round(coreWidth),
      height: round(coreHeight),
      fixed: true,
      confidence: 0.72,
    },
  ];
}

function buildDefaultEntries(floorplate: Rect): EntryPoint[] {
  return [
    {
      id: "entry-primary",
      type: "primary",
      label: "Primary Suite Entry",
      x: round(floorplate.x + floorplate.width * 0.08),
      y: floorplate.y,
      confidence: 0.7,
    },
    {
      id: "entry-egress",
      type: "egress",
      label: "Secondary Egress",
      x: round(floorplate.x + floorplate.width * 0.92),
      y: round(floorplate.y + floorplate.height),
      confidence: 0.66,
    },
  ];
}

function buildDefaultWindows(floorplate: Rect): LineSegment[] {
  return [
    { x1: floorplate.x + 8, y1: floorplate.y + floorplate.height, x2: floorplate.x + floorplate.width * 0.45, y2: floorplate.y + floorplate.height, confidence: 0.64 },
    { x1: floorplate.x + floorplate.width * 0.55, y1: floorplate.y + floorplate.height, x2: floorplate.x + floorplate.width - 8, y2: floorplate.y + floorplate.height, confidence: 0.64 },
    { x1: floorplate.x + floorplate.width, y1: floorplate.y + floorplate.height * 0.18, x2: floorplate.x + floorplate.width, y2: floorplate.y + floorplate.height * 0.82, confidence: 0.58 },
  ];
}

function buildDefaultInteriorWalls(floorplate: Rect): LineSegment[] {
  const yA = floorplate.y + floorplate.height * 0.32;
  const yB = floorplate.y + floorplate.height * 0.68;
  const xA = floorplate.x + floorplate.width * 0.26;
  const xB = floorplate.x + floorplate.width * 0.72;
  return [
    { x1: xA, y1: floorplate.y + 6, x2: xA, y2: yB, confidence: 0.55 },
    { x1: xB, y1: yA, x2: xB, y2: floorplate.y + floorplate.height - 6, confidence: 0.55 },
    { x1: floorplate.x + 6, y1: yA, x2: floorplate.x + floorplate.width - 6, y2: yA, confidence: 0.5 },
    { x1: floorplate.x + 6, y1: yB, x2: floorplate.x + floorplate.width - 6, y2: yB, confidence: 0.5 },
  ].map(w => ({ x1: round(w.x1), y1: round(w.y1), x2: round(w.x2), y2: round(w.y2), confidence: w.confidence }));
}

function fallbackGeometry(input: ParseFloorPlanInput, reason?: string): ParsedFloorPlanGeometry {
  const floorplate = buildRectangularFloorplate(input.totalSqFt);
  const hasUploadedPlan = Boolean(input.floorPlanUrl || input.floorPlanBase64);
  const reviewReasons = hasUploadedPlan
    ? [reason ?? "Uploaded plan could not be confidently parsed; using owner-confirmable rectangular baseline geometry anchored to the project square footage."]
    : ["No uploaded plan was provided; using owner-confirmable rectangular baseline geometry."];

  return {
    floorplate,
    totalSqFt: Math.round(input.totalSqFt || floorplate.width * floorplate.height),
    coreElements: buildDefaultCore(floorplate),
    entryPoints: buildDefaultEntries(floorplate),
    windows: buildDefaultWindows(floorplate),
    existingInteriorWalls: buildDefaultInteriorWalls(floorplate),
    confidence: hasUploadedPlan ? 0.58 : 0.78,
    source: "synthetic_rectangular_model",
    reviewRequired: hasUploadedPlan,
    reviewReasons,
  };
}

function clampToFloorplate(value: number | undefined, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return round(Math.max(0, Math.min(max, value ?? 0)));
}

function normalizeConfidence(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return round(Math.max(0.1, Math.min(0.98, value ?? fallback)), 2);
}

function normalizeCoreElements(items: ClaudeFloorPlanGeometry["coreElements"], floorplate: Rect): CoreElement[] {
  const allowedTypes = new Set(["restrooms", "stairs", "elevators", "shaft", "service", "core"]);
  const normalized = (items ?? [])
    .filter(item => Number.isFinite(item.x) && Number.isFinite(item.y) && Number.isFinite(item.width) && Number.isFinite(item.height))
    .slice(0, 12)
    .map((item, index): CoreElement => {
      const x = clampToFloorplate(item.x, floorplate.width);
      const y = clampToFloorplate(item.y, floorplate.height);
      const maxWidth = Math.max(4, floorplate.width - x);
      const maxHeight = Math.max(4, floorplate.height - y);
      const type = allowedTypes.has(String(item.type)) ? item.type as CoreElement["type"] : "core";
      return {
        id: item.id ?? `vision-core-${index + 1}`,
        type,
        label: item.label ?? (type === "core" ? "Fixed Core" : String(type)),
        x,
        y,
        width: round(Math.max(4, Math.min(maxWidth, item.width ?? 4))),
        height: round(Math.max(4, Math.min(maxHeight, item.height ?? 4))),
        fixed: true,
        confidence: normalizeConfidence(item.confidence, 0.68),
      };
    });

  return normalized.length > 0 ? normalized : buildDefaultCore(floorplate);
}

function normalizeEntryPoints(items: ClaudeFloorPlanGeometry["entryPoints"], floorplate: Rect): EntryPoint[] {
  const normalized = (items ?? [])
    .filter(item => Number.isFinite(item.x) && Number.isFinite(item.y))
    .slice(0, 6)
    .map((item, index): EntryPoint => ({
      id: item.id ?? `vision-entry-${index + 1}`,
      type: item.type === "egress" ? "egress" : "primary",
      label: item.label ?? (item.type === "egress" ? "Egress Door" : "Primary Entry"),
      x: clampToFloorplate(item.x, floorplate.width),
      y: clampToFloorplate(item.y, floorplate.height),
      confidence: normalizeConfidence(item.confidence, 0.66),
    }));

  return normalized.length > 0 ? normalized : buildDefaultEntries(floorplate);
}

function normalizeLineSegments(items: ClaudeFloorPlanGeometry["windows"] | ClaudeFloorPlanGeometry["existingInteriorWalls"], floorplate: Rect): LineSegment[] {
  return (items ?? [])
    .filter(item => Number.isFinite(item.x1) && Number.isFinite(item.y1) && Number.isFinite(item.x2) && Number.isFinite(item.y2))
    .slice(0, 40)
    .map(item => ({
      x1: clampToFloorplate(item.x1, floorplate.width),
      y1: clampToFloorplate(item.y1, floorplate.height),
      x2: clampToFloorplate(item.x2, floorplate.width),
      y2: clampToFloorplate(item.y2, floorplate.height),
      confidence: normalizeConfidence(item.confidence, 0.58),
    }));
}

function normalizeVisionGeometry(input: ParseFloorPlanInput, vision: ClaudeFloorPlanGeometry): ParsedFloorPlanGeometry {
  const fallback = fallbackGeometry(input);
  const width = Number.isFinite(vision.widthFt) && (vision.widthFt ?? 0) > 10 ? vision.widthFt as number : fallback.floorplate.width;
  const depth = Number.isFinite(vision.depthFt) && (vision.depthFt ?? 0) > 10 ? vision.depthFt as number : fallback.floorplate.height;
  const parsedArea = Math.round(width * depth);
  const anchoredSqFt = Math.round(input.totalSqFt || vision.totalSqFt || parsedArea || fallback.totalSqFt);
  const floorplate: Rect = { x: 0, y: 0, width: round(width), height: round(depth) };
  const confidence = normalizeConfidence(vision.confidence, 0.72);
  const reviewReasons = [
    ...(vision.reviewReasons ?? []),
    ...(vision.shape && vision.shape !== "rectangle" ? [`Claude Vision classified the floorplate shape as ${vision.shape}; V1 rendering uses its rectangular bounding box for placement.`] : []),
    ...(Math.abs(parsedArea - anchoredSqFt) / Math.max(anchoredSqFt, 1) > 0.18 ? ["Parsed dimensional area differs from project square footage, so the project square footage remains the area anchor."] : []),
  ];

  return {
    floorplate,
    totalSqFt: anchoredSqFt,
    coreElements: normalizeCoreElements(vision.coreElements, floorplate),
    entryPoints: normalizeEntryPoints(vision.entryPoints, floorplate),
    windows: normalizeLineSegments(vision.windows, floorplate),
    existingInteriorWalls: normalizeLineSegments(vision.existingInteriorWalls, floorplate),
    confidence,
    source: "uploaded_plan",
    reviewRequired: confidence < 0.76 || reviewReasons.length > 0,
    reviewReasons: reviewReasons.length > 0 ? reviewReasons : ["Claude Vision parsed the uploaded plan geometry; verify dimensions before issuing construction guidance."],
  };
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

function extractJson(text: string): ClaudeFloorPlanGeometry {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Claude Vision response did not include a JSON object");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function callClaudeVision(input: ParseFloorPlanInput): Promise<ClaudeFloorPlanGeometry | undefined> {
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
      max_tokens: 1800,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            mediaBlock,
            {
              type: "text",
              text: `You are parsing a commercial office floor plan for a PropTech test-fit application. Extract only objective plan geometry and return JSON only. Anchor scale to the user-provided total square feet when exact plan dimensions are unclear. Use feet as units. Keep coordinates in a simple top-left origin system bounded by widthFt and depthFt. Return this exact shape: {"widthFt": number, "depthFt": number, "totalSqFt": number, "shape": "rectangle" | "l_shape" | "irregular" | "unknown", "coreElements": [{"id": string, "type": "restrooms" | "stairs" | "elevators" | "shaft" | "service" | "core", "label": string, "x": number, "y": number, "width": number, "height": number, "confidence": number}], "entryPoints": [{"id": string, "type": "primary" | "egress", "label": string, "x": number, "y": number, "confidence": number}], "windows": [{"x1": number, "y1": number, "x2": number, "y2": number, "confidence": number}], "existingInteriorWalls": [{"x1": number, "y1": number, "x2": number, "y2": number, "confidence": number}], "confidence": number, "reviewReasons": string[]}. Project total square feet: ${Math.round(input.totalSqFt || 0)}. If the plan is too ambiguous, return best-effort bounding dimensions and explain uncertainty in reviewReasons rather than inventing certainty.`,
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

export async function parseFloorPlanGeometry(input: ParseFloorPlanInput): Promise<ParsedFloorPlanGeometry> {
  if (!input.floorPlanUrl && !input.floorPlanBase64) return fallbackGeometry(input);

  try {
    const vision = await callClaudeVision(input);
    if (!vision) return fallbackGeometry(input, "Claude Vision was not configured; using owner-confirmable rectangular baseline geometry anchored to project square footage.");
    return normalizeVisionGeometry(input, vision);
  } catch (error) {
    console.error("[FloorPlanParser] Claude Vision parsing failed, using fallback geometry:", error);
    return fallbackGeometry(input, "Claude Vision parsing failed; using owner-confirmable rectangular baseline geometry anchored to project square footage.");
  }
}
