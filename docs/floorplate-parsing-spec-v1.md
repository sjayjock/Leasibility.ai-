# Final Leasibility.AI Floorplate Parsing Spec (V1)

**Status:** Final geometry-input source-of-truth for V1.

# Leasibility.AI Floorplate Parsing Spec (V1)

## A. Purpose

The purpose of this specification is to define how uploaded floor plan inputs are converted into usable, structured geometry for the deterministic planning engine in V1 of Leasibility.AI. This document establishes the boundaries, requirements, and fallback mechanisms for parsing floor plans, ensuring a practical and reliable implementation that aligns with the approved hybrid layout strategy. With the owner decisions incorporated below, this document is now the final geometry-input source-of-truth for V1.

## B. Document Ownership and Boundaries

This document strictly governs geometry input rules and parsing logic.

It explicitly defers to the Final Revised Spatial Rules Hierarchy (Master Source-of-Truth) for:

Planning logic and room placement sequencing.

Canonical room types and room sizes.

Scenario demolition logic (Light Refresh, Moderate Build-Out, Full Transformation).

Zoning and adjacency logic.

The definition of what constitutes a "Protected Element" versus a "Flexible Element."

It explicitly defers to the Good Layout Test Criteria for:

QA thresholds and pass/fail conditions for the generated layouts.

## C. V1 Supported Input Formats

To support practical broker workflows, V1 will accept the following input formats for floor plan parsing:

- PDF:  Standard architectural or marketing floor plans (single page or user-selected page).
- Images:  JPG, PNG, GIF, WEBP.
- Real-world captures: screenshots and phone photos of 2D floor plans only, provided the floor plan itself is legible and fully visible. Photos of physical spaces are out of scope for V1.
Operational Definition: "Supported" means the system will attempt to extract geometric data from these files. If the file is legible and contains a recognizable floor plan, the system will process it.

## D. Out-of-Scope Formats for V1

The following formats are explicitly out of scope for V1 parsing:

- CAD/BIM files:  DWG, DXF, RVT, IFC.
- 3D models:  OBJ, STL, GLTF.
- Raw point cloud data:  LAS, E57.

## E. Minimum Legibility / Quality Requirements for Plan Inputs

For the parsing engine to successfully extract geometry, the input must meet the following minimum quality thresholds:

- Clarity:  The perimeter walls and core elements must be visually distinguishable from the background and other annotations.
- Completeness:  The entire floorplate (or the relevant tenant space) must be visible within the image or document bounds.
- Orientation:  The plan should ideally be oriented orthogonally (North up or aligned to the page edges), though minor skew can be tolerated.
- Contrast:  Sufficient contrast between walls (typically dark lines) and empty space (typically white/light background).
Proposed Default: If an input fails to meet these legibility requirements, the system will reject the parsing attempt and fall back to a simplified geometric model (see Section J).

## F. Required Geometry Outputs for the Deterministic Planning Engine

The parsing engine must output structured geometric data that the deterministic planning engine can consume. The deterministic structured geometry is the authoritative source of truth; AI-generated image output is for presentation only and must follow this structured geometry.

The required outputs are:

- Floorplate Boundary:  A defined set of orthogonal rectangles representing the usable tenant space.
- Core Elements:  Bounding boxes representing non-usable areas (e.g., stairs, elevators, restrooms, shafts) that must be preserved.
- Entry Points: Coordinates indicating the primary suite entrance and secondary egress doors. These required entry/egress outputs represent the door locations that anchor access and life-safety routing. Existing interior doors are not required as a V1 geometry output; where existing interior door locations are not detected, the planning engine may insert new doors where needed for rooms, corridors, and circulation.
- Windows:  Line segments indicating the location of exterior glazing.
- Existing Interior Walls: The parsing engine will attempt to identify existing interior walls and extract them as line segments. The planning engine will then apply the scenario demolition rules (defined in the Final Revised Spatial Rules Hierarchy) to these walls. If existing interior walls cannot be extracted with sufficient confidence, the engine may still proceed using perimeter, core, entry, and window geometry; however, the Light Refresh scenario must be flagged as lower-confidence because true existing-wall reuse cannot be verified.

## G. How Scale is Established

Establishing accurate scale is critical for generating valid room areas and budgets. V1 will establish scale using the following hierarchy:

User-Provided Total Square Footage: The primary source of truth for scale is the totalSqFt value provided by the user during project intake. The parsed geometry will be uniformly scaled so that its calculated area matches this user-provided value.

Detected Scale Bars/Dimensions: If the system can reliably detect and read a scale bar or dimension lines on the plan, it may use this to verify or adjust the scale, but the user-provided totalSqFt remains authoritative.

Proposed Default: The system will always scale the parsed geometry to match the user-provided totalSqFt.

## H. Chosen V1 Geometry Model

Given the current state of the layout engine, V1 will use a Rectangular Approximation model for the floorplate.

The parsed floorplate will be represented as a single bounding rectangle or a union of orthogonal rectangles (e.g., L-shape, T-shape, U-shape).

Complex curves or angled walls will be simplified to the nearest orthogonal bounding box.

The parsing engine must output orthogonal rectangles (or unions of orthogonal rectangles) for V1, as the current layout engine cannot handle arbitrary polygons.

## I. Treatment of Specific Architectural Elements

The parsing engine must identify and extract specific elements to support the rules defined in the Spatial Rules Hierarchy:

- Perimeter:  Must be identified and extracted as the outer boundary of the usable space.
Core Elements (Stairs, Elevators, Restrooms): Must be identified and extracted as "keep-out" zones. If the AI cannot detect the building core with sufficient confidence, the system must prompt the user through the fallback UI rather than silently assuming a center-core or side-core condition.

Entry/Egress: Must be identified to ensure the generated layout connects to the building egress.

- Windows:  Window locations must be identified to allow the planning engine to prioritize perimeter placement.
- Mullions:  Mullion detection is out of scope for V1; window segments will be treated as continuous.
- Existing Interior Walls: The parsing engine will attempt to identify existing interior walls and extract them as line segments. The planning engine will then apply the scenario demolition rules (defined in the Spatial Rules Hierarchy) to these walls. If existing interior walls cannot be extracted with sufficient confidence, the engine should still proceed using the perimeter, core, entry, and window geometry, but the Light Refresh scenario must be flagged as lower-confidence and may rely on the generic/fallback model rather than true existing-wall reuse.

## J. Parsing Confidence / Failure Handling

The parsing engine will calculate a confidence score based on the clarity of the input and the success of element detection.

- High Confidence:  The floorplate, core, and entry points are clearly identified. The planning engine proceeds with the parsed geometry.
- Low Confidence / Failure:  If the parsing engine cannot reliably extract the required geometry, it will trigger a failure state.
Primary V1 Fallback (Simple Owner-Approved Fallback UI):
In the event of low parsing confidence, parsing failure, or insufficient confidence in core detection, the system must present a simple fallback UI rather than silently assuming geometry. The fallback UI must allow the user to select a generic floorplate shape (Rectangle, L-Shape, or U-Shape), select a core condition (Center Core, Side Core, or No Detectable Core / Minimal Core), and optionally draw or confirm a bounding box around the relevant tenant area. If the user confirms fallback geometry, the uploaded floor plan may still be used as a visual underlay for final AI image generation, but the deterministic planning engine must rely on the user-confirmed fallback geometry rather than untrusted automatic parsing.

## K. Manual Override Requirements

V1 will not include a complex, interactive floor plan editor for manual overrides. However, the user must have the ability to:

- Verify Scale:  Confirm or adjust the totalSqFt value if the generated layout appears incorrectly scaled.
- Reject Parsed Geometry: If the parsed geometry is inaccurate, the user can discard it and force the system to use the primary V1 fallback UI, including generic shape selection, core selection, and optional tenant-area bounding-box selection.

## L. Dependencies on User-Provided Assumptions or Dimensions

The parsing engine relies heavily on the following user-provided data:

- Total Square Footage (totalSqFt):  Absolutely required to establish scale.
- Property Type/Class:  May be used as a hint for typical core sizes or window spacing if detection is ambiguous.

## M. Known V1 Simplifications and Risks

- Scale Inaccuracy:  Relying solely on totalSqFt to scale the geometry assumes the parsed boundary perfectly matches the rentable area, which may not account for common area factors or loss factors.
- Orthogonal Simplification:  Forcing all floorplates into rectangular approximations will result in inaccurate layouts for buildings with curved or angled facades.
- False Positives in Core Detection:  The system may incorrectly identify a large conference room as a building core, preventing the planning engine from utilizing that space.

## N. Final Owner Decisions Incorporated

- Owner Decision: V1 includes a simple fallback UI. The fallback UI supports generic floorplate shape selection, core selection, and optional bounding-box selection around the relevant tenant area.
- Owner Decision: If AI cannot detect the building core with sufficient confidence, the system must prompt the user. It must not silently assume a side-core, center-core, or minimal-core condition.

# Summary of Changes

## 1. Summary of What Changed in This Final Revision

- Final Source-of-Truth Status: Added an explicit note that this document is now the final geometry-input source-of-truth for V1, while still deferring planning logic and scenario rules to the Final Revised Spatial Rules Hierarchy.
- Fallback UI Finalized: Confirmed that V1 includes a simple fallback UI when parsing confidence is low or parsing fails. The UI supports Rectangle, L-Shape, and U-Shape floorplate selection; Center Core, Side Core, and No Detectable Core / Minimal Core selection; and optional tenant-area bounding-box selection.
- Core Detection Rule Resolved: Clarified that if AI cannot detect the building core with sufficient confidence, the system must prompt the user and must not silently assume a core condition.
- Real-World Capture Scope Clarified: Confirmed that screenshots and phone photos are supported only when they are captures of legible, fully visible 2D floor plans. Photos of physical spaces are out of scope for V1.
- Interior-Wall Confidence Rule Clarified: Confirmed that the engine may proceed without confident existing interior-wall extraction by using perimeter, core, entry, and window geometry, but Light Refresh must be flagged as lower-confidence.
- Existing Door Requirement Resolved: Clarified that primary suite entrance and secondary egress doors remain required as Entry Points, but existing interior doors are not required V1 geometry outputs. The planning engine may insert new doors where needed.

## 2. Final Geometry-Input Source-of-Truth Note

This Final Floorplate Parsing Spec (V1) is now the final geometry-input source-of-truth for Leasibility.AI V1. It governs supported plan inputs, parsing confidence handling, fallback geometry capture, and the structured geometry passed into the deterministic planning engine. The Final Revised Spatial Rules Hierarchy remains the master source-of-truth for planning logic, protected-versus-flexible elements, room types, scenario demolition logic, and layout evaluation rules.

