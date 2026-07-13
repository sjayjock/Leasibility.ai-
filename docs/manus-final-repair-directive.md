# Manus Agent — Final Repair Directive: Real Floor-Plan Reading + 3′ Door-Scale Calibration

**Target repo:** `github.com/sjayjock/leasibility-ai` (lowercase, no trailing hyphen) — branch `main`, worked in your staging area.
**Author of directive:** Claude Code audit session (2026-07-13), based on direct inspection of the committed `main` code.
**Do not** rebuild the app. Preserve the existing UI, dashboard, report layout, and PDF pipeline. These repairs are surgical and confined to the server-side floor-plan → geometry → scenario → report data path.

---

## 0. Confirmed current state (read this before touching anything)

I inspected the actual `main` branch. Here is what is true today — verify each with the grep commands before you start, because if any has changed you must adapt:

| # | Fact | How to confirm |
|---|------|----------------|
| 1 | `server/floorPlanAnalyzer.ts` exists and has a vision function `analyzeFloorPlan()`, **but it is dead code** — it is never called at runtime, only imported as a *type* by `testFitEngine.ts` and the tests. | `grep -rn "analyzeFloorPlan(" server` → only the definition line appears. |
| 2 | The runtime path is `routers.ts` (`generate` mutation, ~line 233) → `generateScenarios()` in `aiEngine.ts` (line 197). `floorPlanUrl` **is** passed into `generateScenarios`, but the function **ignores it** and derives every square-footage number from the user-declared `totalSqFt` and `headcount` ratios (e.g. `sqFt * 0.50`). | `grep -n "floorPlanUrl\|analyzeFloorPlan" server/aiEngine.ts` → `floorPlanUrl` appears only in the input type, never used. |
| 3 | `invokeLLM()` in `server/_core/llm.ts` calls `https://forge.manus.im/v1/chat/completions` with `model: "gemini-2.5-flash"`, authorized by `BUILT_IN_FORGE_API_KEY`. It is **not** Claude. | `grep -n "forge\|gemini\|model:" server/_core/llm.ts` |
| 4 | There is **no `ANTHROPIC_API_KEY`** referenced anywhere. `server/_core/env.ts` only defines `forgeApiUrl` and `forgeApiKey`. Any Claude key you were asked to configure is currently unused by the code. | `grep -rn "ANTHROPIC" server` → no results. |
| 5 | The `DoorOpening` type is a **point** (`x, y, wallSide, isMain`) with **no width**. `scalePixelsPerFoot` is whatever the model self-reports. There is **no code that measures a door and derives scale.** | Read `server/floorPlanAnalyzer.ts` lines 27–31 and 189. |

**Net effect for the user:** an uploaded floor plan is stored (`uploadFloorPlan` saves `floorPlanUrl`) but never analyzed. The report's square footage, dimensions, and room mix come entirely from the number the user typed, not from the drawing. The 36″-door reference is mentioned in a prompt that never runs.

This directive fixes all five.

---

## 1. Definition of Done (acceptance criteria)

A repair is complete only when **all** of these are true, demonstrated on the staging deployment with a **real uploaded plan** (not the fallback):

1. Uploading an existing-conditions plan causes a **Claude Vision** call (authorized by `ANTHROPIC_API_KEY`) that returns extracted perimeter, interior walls, door openings (as measurable segments), and existing rooms.
2. The suite's **actual dimensions and square footage are calculated from the drawing** using a detected standard single-leaf interior door = **3.0 ft (36 in)** as the scale anchor — not from the typed number.
3. The system **reconciles** drawing-measured SF against the user-declared SF and reports both, flagging any material discrepancy (see §5.4, including the RSF-vs-USF nuance).
4. Generated scenarios, existing-conditions inventory, budgets, and schedules are driven by the **measured** floorplate and **respect the existing suite perimeter and walls** — no generic rectangle when a plan was read successfully.
5. When Vision is unavailable or low-confidence, the app **falls back gracefully** to the declared-SF rectangle, clearly labels the output as un-calibrated, and never silently presents fallback geometry as measured truth.
6. The UI, dashboard, report layout, and PDF export continue to work unchanged in structure. `pnpm test` and `pnpm tsc --noEmit` (or the repo's equivalents) pass with **0 errors**.

---

## 2. Environment setup (do this first)

1. In the Manus environment / deployment secrets, add:
   - `ANTHROPIC_API_KEY` = the user's Claude API key.
   - (optional) `ANTHROPIC_VISION_MODEL` — default to `claude-sonnet-4-6` if unset.
2. Extend `server/_core/env.ts` so these are read:

```ts
// server/_core/env.ts — add to the ENV object
export const ENV = {
  // ...existing fields...
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicVisionModel: process.env.ANTHROPIC_VISION_MODEL ?? "claude-sonnet-4-6",
};
```

3. Add one dependency for reading real image pixel dimensions (needed for calibration — see §4):
   ```bash
   pnpm add image-size
   ```
   `axios` (already present) is used to fetch the plan bytes. Do **not** add heavy native deps (no `sharp`); `image-size` is pure-JS and reads dimensions from the header.

> **Why a direct Claude call and not `invokeLLM`?** `invokeLLM` is hard-wired to the Manus forge/Gemini gateway. The user explicitly wants Claude Vision and has a Claude key. We add a dedicated Anthropic call so the credential the user configured is actually used, and keep the forge/Gemini path available only as a secondary fallback (§5.3).

---

## 3. Task 1 — Upgrade the analyzer to real Claude Vision (`server/floorPlanAnalyzer.ts`)

### 3.1 Change the `DoorOpening` type to a measurable segment

The door must have a width to be usable as scale. Replace the point type:

```ts
/**
 * A detected door OPENING, represented as the line segment across the opening
 * in normalized 0–1 image coordinates. A standard single-leaf interior office
 * door leaf = 36 in (3.0 ft) and is the scale anchor (see doorScale.ts).
 */
export interface DoorOpening {
  x1: number; y1: number;   // one jamb of the opening (normalized)
  x2: number; y2: number;   // other jamb of the opening (normalized)
  wallSide: "north" | "south" | "east" | "west" | "interior";
  leaf: "single" | "double" | "unknown"; // single ≈ 36in, double ≈ 72in
  isMain: boolean;          // true = main suite entry
  confidence: number;       // 0–1, model's confidence this is a standard door
}
```

Add pixel dimensions to the analysis so normalized coords can be converted deterministically (we fill this in code from the actual image file, not from the model):

```ts
export interface FloorPlanAnalysis {
  // ...existing fields...
  /** Actual pixel dimensions of the analyzed image, filled in by code (not the model). */
  imagePx: { width: number; height: number };
  /** Filled in by the calibration step (doorScale.ts). See §4. */
  scale?: ScaleResult;
}
```

### 3.2 Replace `analyzeFloorPlan` with a Claude Vision implementation

Keep the same exported name and return type so downstream imports keep working. Swap the `invokeLLM`/forge body for a direct Anthropic Messages call. Fetch the image bytes with `axios`, read pixel dims with `image-size`, and pass the image (or PDF as a `document` block) to Claude.

```ts
import axios from "axios";
import sizeOf from "image-size";
import { ENV } from "./_core/env";
import { calibrateFromDoors, type ScaleResult } from "./doorScale";

const VISION_SYSTEM = `You are an expert architectural space planner analyzing a commercial office floor plan.
Return ONLY valid JSON (no markdown). Use normalized coordinates: 0.0 = left/top, 1.0 = right/bottom,
measured against the full image. Extract every visible wall segment and door opening. Represent each door
as the segment across its OPENING (jamb to jamb). Identify each door's leaf type: a single-leaf interior
office door is ~36 inches; a double door is ~72 inches. Mark the suite PERIMETER separately from interior
partitions. Do not invent geometry that is not visible; if unsure, lower the confidence and say so in constraints.`;

export async function analyzeFloorPlan(
  imageUrl: string,
  declaredSqFt: number
): Promise<FloorPlanAnalysis> {
  if (!ENV.anthropicApiKey || !imageUrl) {
    return buildFallbackAnalysis(declaredSqFt); // §3.3 keeps existing fallback
  }
  try {
    // 1) Fetch the plan bytes and read true pixel dimensions
    const bytes = await axios.get<ArrayBuffer>(imageUrl, { responseType: "arraybuffer", timeout: 30_000 });
    const buf = Buffer.from(bytes.data);
    const mime = detectMime(imageUrl, bytes.headers["content-type"]);
    const isPdf = mime === "application/pdf";
    const dims = isPdf ? { width: 1000, height: 1000 } : safeImageSize(buf); // PDFs: use 1000×1000 virtual grid
    const base64 = buf.toString("base64");

    // 2) Claude Vision call
    const mediaBlock = isPdf
      ? { type: "document", source: { type: "base64", media_type: mime, data: base64 } }
      : { type: "image",    source: { type: "base64", media_type: mime, data: base64 } };

    const resp = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: ENV.anthropicVisionModel,
        max_tokens: 4000,
        temperature: 0,
        system: VISION_SYSTEM,
        messages: [{
          role: "user",
          content: [
            mediaBlock,
            { type: "text", text: buildUserPrompt(declaredSqFt) }, // reuse/adapt existing schema prompt
          ],
        }],
      },
      { headers: {
          "content-type": "application/json",
          "x-api-key": ENV.anthropicApiKey,
          "anthropic-version": "2023-06-01",
        }, timeout: 60_000 }
    );

    const text: string = resp.data?.content?.find((p: any) => p.type === "text")?.text ?? "";
    const parsed = extractJson(text) as FloorPlanAnalysis; // tolerant JSON extractor (strip prose/fences)
    parsed.imagePx = dims;

    // 3) Calibrate scale from the detected door(s) — the core repair (§4)
    parsed.scale = calibrateFromDoors(parsed, declaredSqFt);

    // 4) Anchor all square footage to the calibrated measurement (§5)
    return applyMeasuredSquareFootage(parsed, declaredSqFt);
  } catch (err) {
    console.error("[FloorPlanAnalyzer] Claude Vision failed, using fallback:", err);
    return buildFallbackAnalysis(declaredSqFt);
  }
}
```

Helper stubs to implement in the same file (small, self-contained):
- `detectMime(url, header)` → `"application/pdf" | "image/png" | "image/jpeg" | "image/webp"` (from extension, fall back to header).
- `safeImageSize(buf)` → `{ width, height }` via `sizeOf(buf)`, guarded with a try/catch returning `{width:1000,height:1000}`.
- `extractJson(text)` → find the first `{`…last `}`, strip ```` ```json ```` fences, `JSON.parse`. Throw on failure so the outer catch runs the fallback.
- `buildUserPrompt(declaredSqFt)` → keep the existing schema prompt from the current file, but (a) update the `doorOpenings` schema to the new **segment** shape (`x1,y1,x2,y2,leaf,confidence,wallSide,isMain`), and (b) add: *"Return the suite perimeter as a closed set of `perimeterWalls`. Mark interior partitions separately. Represent each door as the segment across its opening."*

### 3.3 Keep the existing fallback, but stamp it as un-calibrated

Leave `buildFallbackAnalysis` in place. Add `imagePx: {width:1000,height:1000}`, `scale: { source: "declared_fallback", calibrated: false, pixelsPerFoot: null, measuredSqFt: null, authoritativeSqFt: totalSqFt, note: "No calibrated scale — geometry is a rectangle sized from the declared square footage." }`, and keep `confidence: 30`.

---

## 4. Task 2 — The 3′ door-scale calibration module (NEW: `server/doorScale.ts`)

This is the heart of the request. Create a new file. It converts the drawing to real feet using a detected 36″ door, computes measured dimensions and SF, and reconciles with the declared number.

```ts
import type { FloorPlanAnalysis, DoorOpening } from "./floorPlanAnalyzer";

export interface ScaleResult {
  source: "door_calibrated" | "declared_fallback";
  calibrated: boolean;
  pixelsPerFoot: number | null;
  /** Suite bounding dimensions derived from the drawing, in feet. */
  measuredWidthFt: number | null;
  measuredDepthFt: number | null;
  /** Square footage measured from the perimeter polygon, in ft². */
  measuredSqFt: number | null;
  /** The SF the rest of the app should treat as authoritative (see §5.4). */
  authoritativeSqFt: number;
  /** Which number we trusted and why. */
  reconciliation: "agree" | "declared_used" | "measured_used" | "uncalibrated";
  discrepancyPct: number | null; // |measured - declared| / declared
  doorLeafFeet: number;          // 3.0 for single, 6.0 for double
  confidence: number;            // 0–1
  note: string;
}

const SINGLE_LEAF_FT = 3.0;  // 36 in — the scale anchor
const DOUBLE_LEAF_FT = 6.0;  // 72 in
const AGREE_TOLERANCE = 0.15; // ±15% ⇒ drawing and declared "agree"

/** Length of a normalized segment converted to pixels, using true image dims. */
function segPixels(x1: number, y1: number, x2: number, y2: number, px: { width: number; height: number }) {
  const dx = (x2 - x1) * px.width;
  const dy = (y2 - y1) * px.height;
  return Math.hypot(dx, dy);
}

/** Shoelace area (in px²) of the perimeter, from wall endpoints ordered around the boundary. */
function perimeterAreaPx(a: FloorPlanAnalysis): number {
  const pts = a.perimeterWalls.map(w => ({ x: w.x1 * a.imagePx.width, y: w.y1 * a.imagePx.height }));
  if (pts.length < 3) {
    // Fall back to the bounding box if the perimeter isn't a clean polygon.
    return (a.bounds.width * a.imagePx.width) * (a.bounds.height * a.imagePx.height);
  }
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    s += p.x * q.y - q.x * p.y;
  }
  return Math.abs(s) / 2;
}

/** Pick the most reliable door as the scale reference. */
function chooseReferenceDoor(doors: DoorOpening[]): { door: DoorOpening; leafFt: number } | null {
  const usable = doors
    .filter(d => (d.confidence ?? 0) >= 0.5 && d.leaf !== "double") // prefer single-leaf interior doors
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  const pool = usable.length ? usable : doors.filter(d => (d.confidence ?? 0) >= 0.5);
  if (!pool.length) return null;
  const door = pool[0];
  const leafFt = door.leaf === "double" ? DOUBLE_LEAF_FT : SINGLE_LEAF_FT;
  return { door, leafFt };
}

/**
 * Calibrate the drawing to feet using a detected standard door.
 * If multiple single-leaf doors exist, use the MEDIAN door pixel-width for robustness.
 */
export function calibrateFromDoors(a: FloorPlanAnalysis, declaredSqFt: number): ScaleResult {
  const ref = chooseReferenceDoor(a.doorOpenings ?? []);
  if (!ref) {
    return {
      source: "declared_fallback", calibrated: false, pixelsPerFoot: null,
      measuredWidthFt: null, measuredDepthFt: null, measuredSqFt: null,
      authoritativeSqFt: declaredSqFt, reconciliation: "uncalibrated",
      discrepancyPct: null, doorLeafFeet: SINGLE_LEAF_FT, confidence: 0.3,
      note: "No standard door detected with sufficient confidence; scale not calibrated. Dimensions fall back to declared square footage.",
    };
  }

  // Robust door pixel width: median across all single-leaf doors, else the chosen one.
  const singles = (a.doorOpenings ?? []).filter(d => d.leaf !== "double" && (d.confidence ?? 0) >= 0.5);
  const widths = (singles.length ? singles : [ref.door])
    .map(d => segPixels(d.x1, d.y1, d.x2, d.y2, a.imagePx))
    .filter(w => w > 0)
    .sort((m, n) => m - n);
  const doorPx = widths.length ? widths[Math.floor(widths.length / 2)] : segPixels(ref.door.x1, ref.door.y1, ref.door.x2, ref.door.y2, a.imagePx);

  const leafFt = ref.leafFt;
  const pixelsPerFoot = doorPx / leafFt;
  if (!isFinite(pixelsPerFoot) || pixelsPerFoot <= 0) {
    return { source: "declared_fallback", calibrated: false, pixelsPerFoot: null,
      measuredWidthFt: null, measuredDepthFt: null, measuredSqFt: null,
      authoritativeSqFt: declaredSqFt, reconciliation: "uncalibrated", discrepancyPct: null,
      doorLeafFeet: leafFt, confidence: 0.3, note: "Door detected but its width was unmeasurable; scale not calibrated." };
  }

  const measuredWidthFt = (a.bounds.width * a.imagePx.width) / pixelsPerFoot;
  const measuredDepthFt = (a.bounds.height * a.imagePx.height) / pixelsPerFoot;
  const measuredSqFt = Math.round(perimeterAreaPx(a) / (pixelsPerFoot * pixelsPerFoot));

  const discrepancyPct = declaredSqFt > 0 ? Math.abs(measuredSqFt - declaredSqFt) / declaredSqFt : null;

  // Reconciliation policy — §5.4
  let reconciliation: ScaleResult["reconciliation"];
  let authoritativeSqFt: number;
  let note: string;
  if (discrepancyPct !== null && discrepancyPct <= AGREE_TOLERANCE) {
    reconciliation = "agree";
    authoritativeSqFt = measuredSqFt; // drawing wins, but they agree
    note = `Drawing-measured area (${measuredSqFt.toLocaleString()} sf) agrees with declared (${declaredSqFt.toLocaleString()} sf) within ${Math.round((discrepancyPct) * 100)}%. Using measured dimensions.`;
  } else {
    reconciliation = "measured_used";
    authoritativeSqFt = measuredSqFt;
    note = `Drawing-measured area (${measuredSqFt.toLocaleString()} sf) differs from declared (${declaredSqFt.toLocaleString()} sf) by ${discrepancyPct !== null ? Math.round(discrepancyPct * 100) : "?"}%. This can happen when the declared figure is RENTABLE (RSF, incl. load factor) while the drawing shows USABLE (USF) area. Using measured area for layout; both are shown for confirmation.`;
  }

  const confidence = Math.min(0.95, 0.55 + (ref.door.confidence ?? 0.5) * 0.4);
  return {
    source: "door_calibrated", calibrated: true, pixelsPerFoot,
    measuredWidthFt: Math.round(measuredWidthFt * 10) / 10,
    measuredDepthFt: Math.round(measuredDepthFt * 10) / 10,
    measuredSqFt, authoritativeSqFt, reconciliation, discrepancyPct,
    doorLeafFeet: leafFt, confidence, note,
  };
}
```

**Why pixels-per-foot from the door works:** the door leaf's real-world width is a known constant (36″). Measuring how many image pixels that opening spans gives `pixelsPerFoot`. Every other pixel length in the drawing divided by `pixelsPerFoot` is real feet — so the suite's width, depth, wall lengths, and polygon area all become real measurements, independent of whatever number the user typed. Reading the image's true pixel dimensions in code (via `image-size`) rather than trusting the model to report them removes the biggest source of error.

---

## 5. Task 3 — Wire the analyzer into the runtime and anchor SF (`server/aiEngine.ts`)

### 5.1 Call the analyzer at the top of `generateScenarios`

Right now `generateScenarios` never touches `floorPlanUrl`. Change the top of the function (aiEngine.ts:197) so that when a plan URL is present it is analyzed, and the **authoritative** SF replaces the declared one everywhere downstream:

```ts
import { analyzeFloorPlan, type FloorPlanAnalysis } from "./floorPlanAnalyzer";

export async function generateScenarios(input: ScenarioInput): Promise<GeneratedScenario[]> {
  let analysis: FloorPlanAnalysis | null = null;
  let sqFt = input.totalSqFt;                 // declared, the current behavior
  if (input.floorPlanUrl) {
    analysis = await analyzeFloorPlan(input.floorPlanUrl, input.totalSqFt);
    if (analysis.scale?.calibrated) {
      sqFt = analysis.scale.authoritativeSqFt; // ← measured from the drawing
    }
  }
  // ...use `sqFt` (not input.totalSqFt) for every downstream ratio and cost calc...
}
```

Then replace remaining uses of `input.totalSqFt` inside the function with the local `sqFt`, and pass `analysis` into the geometry/SVG and existing-conditions logic (§5.2).

### 5.2 Respect the existing perimeter and walls (don't draw a generic box)

The inline SVG builder currently lays rooms into an abstract rectangle. When `analysis` is present and calibrated:
- Use `analysis.perimeterWalls` / `analysis.bounds` (converted to feet via `analysis.scale.pixelsPerFoot`) as the drawing envelope, so the plotted plan matches the real suite outline and aspect ratio.
- Treat `analysis.perimeterWalls` and any wall the model marked as core/structural as **protected**: do not place new rooms across them.
- Seed the "Light Refresh" scenario from `analysis.existingRooms` (reuse what exists); only "Full Transformation" may disregard interior partitions.
- If `analysis` is null or `!calibrated`, keep today's rectangle behavior unchanged.

> If you have `testFitEngine.ts` available (it already types `FloorPlanAnalysis`), prefer routing the placement through it now that a **real** analysis exists, instead of the inline SVG string. This is optional for V1 but is the clean home for perimeter-aware placement.

### 5.3 Optional secondary fallback (Gemini via forge)

If `ANTHROPIC_API_KEY` is missing but `BUILT_IN_FORGE_API_KEY` is present, you *may* keep a secondary path that calls the existing `invokeLLM` (Gemini) with the same schema. If you do, run the identical `calibrateFromDoors` step on its output. If neither is configured, use `buildFallbackAnalysis`. Never fail the report generation because vision failed — always degrade to the labeled fallback.

### 5.4 Reconciliation surfaced to the user (RSF vs USF)

Carry `analysis.scale` into each `GeneratedScenario` (add fields; do not remove existing ones) so the report can show:
- **Measured area** (from the drawing) and **Declared area** (typed), side by side.
- The reconciliation note when they diverge > 15% — most often because declared = **Rentable SF** (includes the building load factor) while the drawing measures **Usable SF**. This is expected in CRE; the app should explain it, not hide it.
- A confidence indicator sourced from `analysis.scale.confidence` and `analysis.confidence`.

---

## 6. Task 4 — Report & PDF surfacing (`server/reportGenerator.ts`, `server/pdfRouter.ts`)

Do **not** restructure the report. Add, in the existing existing-conditions / summary block:
- A line: `Suite dimensions (measured): {measuredWidthFt}′ × {measuredDepthFt}′ · {measuredSqFt} usable sf`.
- `Scale basis: standard 36″ door` when `scale.source === "door_calibrated"`, else `Scale basis: declared square footage (not calibrated from drawing)`.
- When `reconciliation` is `measured_used`, show both figures and the one-line RSF/USF explanation.
- Keep all existing styling, colors, table structure, and the SVG plan container (`.floor-plan-svg`). These are load-bearing for the PDF export — do not change their class names or overall DOM shape.

Replace any remaining client-facing "PARSER REVIEW REQUIRED" / "Needs Review" / "not a software failure" language with the calibrated-confidence wording above. Keep an internal metadata flag if you need review-state for debugging, but do not print raw diagnostic phrases in the client report.

---

## 7. Guardrails — do NOT change

- The React client (dashboard, NewProject, ProjectDetail, SharedReport), routing, auth, Stripe/billing, referral, and share flows.
- The report HTML skeleton, CSS, and the `pdfRouter` generation contract (same inputs/outputs).
- The database schema, except adding **nullable** columns if you choose to persist `measuredSqFt` / `scaleSource` on a scenario (optional; not required for V1).
- Public tRPC procedure names and shapes consumed by the client. Extend types additively; never remove a field the client reads.

---

## 8. Test plan (must pass before publishing)

1. **Type + unit:** `pnpm tsc --noEmit` and `pnpm test` → 0 errors. Update `engines.test.ts`'s `makeMockFloorPlan` to the new `DoorOpening` segment shape and add `imagePx`.
2. **New unit tests for `doorScale.ts`** (add `server/doorScale.test.ts`):
   - A synthetic analysis where a 36″ door spans 20 px in a 1000×800 image and bounds cover the full image ⇒ assert `pixelsPerFoot ≈ 6.67`, and `measuredSqFt` matches the hand-computed area within 1%.
   - Double-leaf door uses 6.0 ft anchor.
   - No confident door ⇒ `calibrated:false`, `authoritativeSqFt === declaredSqFt`, `reconciliation:"uncalibrated"`.
   - Declared within 15% of measured ⇒ `reconciliation:"agree"`; far off ⇒ `"measured_used"` with the RSF/USF note.
3. **Real-plan integration:** run the `generate` flow against a project that has a genuine uploaded office-plan image. Assert the returned scenarios carry `scale.source === "door_calibrated"` and that `measuredSqFt` is within a sane band of the plan's true area. Capture the JSON as evidence (mirror the prior `docs/validation/real-plan-*` practice).
4. **Fallback path:** temporarily unset `ANTHROPIC_API_KEY`; confirm the app still generates a report, labeled "not calibrated," with no crash and no diagnostic phrases leaking to the client.
5. **Deployed check:** publish to the Manus staging domain, upload a real plan through the UI, and confirm the rendered Project Detail + Shared Report + exported PDF show measured dimensions and the 36″-door scale basis.

---

## 9. Rollout

1. Do all of the above in your **staging area**, not directly on the live checkpoint.
2. Run §8 tests 1–4 locally; fix until green.
3. Publish staging; run §8 test 5 with a real plan.
4. Save the real-plan evidence (JSON + screenshots) under `docs/validation/deployed-<date>/`.
5. Only after the deployed real-plan check passes, promote to the live checkpoint.

---

## 10. Out of scope for this pass (note, don't do)

- OCR of dimension strings / title-block scale bars (a later enhancement; the 36″ door anchor is the V1 method).
- Multi-floor plans, CAD/DWG ingestion, or PDF vector parsing beyond raster Vision.
- Re-theming or restructuring the report. Visual polish is a separate task.
- Switching the whole app's LLM provider. Only the floor-plan analyzer moves to Claude; leave the scenario-narrative `invokeLLM` calls as they are unless they regress.

---

## 11. One-paragraph summary for the Manus agent

The uploaded floor plan is currently stored but never read; all square footage comes from the typed number, and the vision analyzer (`floorPlanAnalyzer.ts`) is dead code pointed at Gemini with no scale math. Wire `analyzeFloorPlan` into `generateScenarios`, switch it to a real **Claude Vision** call using `ANTHROPIC_API_KEY`, make each door a measurable segment, and add `doorScale.ts` to convert the drawing to real feet using a detected **36″ single-leaf door** as the pixels-per-foot anchor. Compute the suite's true dimensions and area from the perimeter polygon, reconcile against the declared figure (explaining the RSF-vs-USF gap when they diverge), drive the scenarios/budgets/report off the **measured** area, respect the existing perimeter and walls, and fall back cleanly (clearly labeled) when Vision is unavailable. Preserve the UI, report layout, and PDF pipeline throughout.
