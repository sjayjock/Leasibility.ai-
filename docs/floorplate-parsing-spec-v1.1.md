LEASIBILITY.AI
Floorplate Parsing Spec
V1.1 — Aligned with Spatial Rules Hierarchy V1.1 and Layout Engine Interface
May 2026 | Final Geometry-Input Source-of-Truth

# A. Purpose
This specification defines how uploaded floor plan inputs are converted into structured FloorplateGeometry objects consumed by the deterministic layout engine. It is the authoritative source-of-truth for parsing behavior, confidence scoring, fallback logic, and geometry output format.
V1.1 UPDATE: V1.1 aligns this document with the FloorplateGeometry interface defined in the layout engine implementation. All geometry outputs must match this interface exactly.

# B. Document Ownership and Scope
This document strictly governs geometry input rules and parsing logic. It explicitly defers to:
- Spatial Rules Hierarchy V1.1: Planning logic, room placement sequencing, canonical room types and sizes, scenario demolition rules, zoning and adjacency logic, protected elements.
- Good Layout Test Criteria V1.1: QA thresholds and pass/fail conditions for generated layouts.

# C. Supported Input Formats (V1)

# D. Minimum Legibility Requirements
- Clarity: Perimeter walls and core elements must be visually distinguishable from background.
- Completeness: Entire floorplate or relevant tenant space must be visible within image bounds.
- Orientation: Orthogonal orientation preferred. Minor skew (< 15°) tolerated.
- Contrast: Sufficient contrast between walls (dark lines) and empty space (light background).
- Resolution: Minimum 800×600 pixels for reliable parsing. Lower resolution triggers low-confidence fallback.
V1.1 UPDATE: Minimum resolution threshold added. Below 800x600px, Claude Vision cannot reliably distinguish walls from annotations. This prevents silent failures.

# E. Required FloorplateGeometry Interface (V1.1)
The parser must output a FloorplateGeometry object matching this exact TypeScript interface. This is the contract between the parser and the layout engine:
interface FloorplateGeometry {
  width: number;          // feet — building width (scaled to match totalSqFt)
  depth: number;          // feet — building depth (scaled to match totalSqFt)
  totalSqFt: number;      // from user input — AUTHORITATIVE, never overridden
  shape: 'rectangle' | 'L-shape' | 'U-shape' | 'irregular';
  aspectRatio: number;    // width/depth ratio
  core: {
    x: number;            // normalized 0-1 from left
    y: number;            // normalized 0-1 from top
    width: number;        // normalized 0-1
    height: number;       // normalized 0-1
    type: 'center' | 'side' | 'end' | 'none';
  };
  entry: {
    x: number;            // normalized 0-1
    y: number;            // normalized 0-1
    wall: 'north' | 'south' | 'east' | 'west';
  };
  windows: Array<{
    wall: 'north' | 'south' | 'east' | 'west';
    startPct: number;     // 0-1 along that wall
    endPct: number;       // 0-1 along that wall
  }>;
  confidence: 'high' | 'medium' | 'low';
  source: 'parsed' | 'fallback';
  parseWarnings: string[]; // logged for QA, shown as planning note in UI
}
V1.1 UPDATE: FloorplateGeometry interface formalized in V1.1 to match the layout engine contract exactly. Previous versions described outputs in prose. This interface is the binding contract between the parser and the deterministic layout engine.

# F. Scale Establishment
- User-provided totalSqFt is the AUTHORITATIVE source of scale. Never override it.
- Parse raw dimensions (width, depth) from the plan if labeled. If not labeled, estimate from proportions.
- Scale parsed width and depth so that width × depth ≈ totalSqFt. Apply uniform scaling factor.
- If a scale bar is detected on the plan, use it to validate but NOT override the totalSqFt scaling.
- All normalized (0-1) coordinates in the FloorplateGeometry interface are applied AFTER scaling.

# G. V1 Geometry Model — Rectangular Approximation
V1 uses a Rectangular Approximation model. The parsed floorplate is represented as a single bounding rectangle or union of orthogonal rectangles.
- Rectangle: Single bounding box. Most common case.
- L-Shape: Two overlapping orthogonal rectangles. Defined by primary rectangle plus one offset rectangle.
- U-Shape: Three orthogonal rectangles (two wings + connector). Each wing treated as independent planning zone.
- Irregular: Simplified to bounding rectangle with parseWarning noting simplification. Complex curves not supported V1.

# H. Architectural Element Detection
V1.1 UPDATE: ADA path detection added as a detection item. While the parser cannot fully validate ADA compliance, it should flag if the detected entry appears blocked or if the floor plate is narrow enough to make ADA compliance difficult (< 8' clear width at entry zone).

# I. Confidence Scoring

# J. Fallback UI — V1 Primary Fallback
When confidence is Low or parsing fails entirely, the system presents a simple fallback UI rather than abandoning the user flow.

Fallback UI Must Allow:
- Select floorplate shape: Rectangle | L-Shape | U-Shape
- Select core condition: Center Core | Side Core | End Core | No Detectable Core / Minimal Core
- Optionally draw or confirm a bounding box around relevant tenant area

Safe Fallback Defaults (used if user skips fallback UI steps):
- Shape: Rectangle
- Dimensions: width = √(totalSqFt × 1.5), depth = √(totalSqFt / 1.5) — slightly wider than deep, typical office building proportion
- Core: Center core at 35-45% of area, positioned at normalized (0.35, 0.3, 0.3, 0.4)
- Entry: South wall center at (0.5, 1.0)
- Windows: All four walls assumed full glazing
- Confidence: low
- Source: fallback
V1.1 UPDATE: Exact fallback default values added in V1.1 to match the layout engine implementation. The layout engine requires these defaults to be precise and consistent — undefined behavior on fallback causes silent layout failures.

# K. Manual Override Requirements
- Verify Scale: User can confirm or adjust totalSqFt if generated layout appears incorrectly scaled.
- Reject Parsed Geometry: User can discard parsed geometry and force fallback UI at any time.
- Core Override: If detected core position appears wrong, user can select a different core condition from the fallback UI options.

# L. Known V1 Simplifications and Risks
