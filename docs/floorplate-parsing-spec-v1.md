# Leasibility.AI Floorplate Parsing Spec (V1)

## A. Purpose
The purpose of this specification is to define how uploaded floor plan inputs are converted into usable, structured geometry for the deterministic planning engine in V1 of Leasibility.AI. The Claude audit concluded that the future layout engine requires real floorplate geometry, not just total square footage, to generate accurate and reliable test-fit layouts. This document establishes the boundaries, requirements, and fallback mechanisms for parsing floor plans in the V1 release, ensuring a practical and reliable implementation that aligns with the approved hybrid layout strategy.

## B. V1 Supported Input Formats
To support practical broker workflows, V1 will accept the following input formats for floor plan parsing:
- **PDF**: Standard architectural or marketing floor plans.
- **Images**: JPG, PNG, GIF, WEBP.
- **Real-world captures**: Screenshots and phone photos of floor plans.

*Operational Definition*: "Supported" means the system will attempt to extract geometric data from these files. If the file is legible and contains a recognizable floor plan, the system will process it.

## C. Out-of-Scope Formats for V1
The following formats are explicitly out of scope for V1 parsing:
- **CAD/BIM files**: DWG, DXF, RVT, RVT, IFC.
- **3D models**: OBJ, STL, GLTF.
- **Raw point cloud data**: LAS, E57.
- **Multi-page documents**: Only the first page or a user-selected page of a multi-page PDF will be processed.

## D. Minimum Legibility / Quality Requirements for Plan Inputs
For the parsing engine to successfully extract geometry, the input must meet the following minimum quality thresholds:
- **Clarity**: The perimeter walls and core elements must be visually distinguishable from the background and other annotations.
- **Completeness**: The entire floorplate (or the relevant tenant space) must be visible within the image or document bounds.
- **Orientation**: The plan should ideally be oriented orthogonally (North up or aligned to the page edges), though minor skew can be tolerated.
- **Contrast**: Sufficient contrast between walls (typically dark lines) and empty space (typically white/light background).

*Proposed Default*: If an input fails to meet these legibility requirements, the system will reject the parsing attempt and fall back to a simplified geometric model (see Section I).

## E. Required Geometry Outputs for the Planning Engine
The parsing engine must output structured geometric data that the deterministic planning engine can consume. Based on the current `sample-output.json` contract, the required outputs are:
- **Floorplate Boundary**: A defined polygon or set of rectangles representing the usable tenant space.
- **Core Elements**: Bounding boxes or polygons representing non-usable areas (e.g., stairs, elevators, restrooms, shafts) that must be preserved.
- **Entry Points**: Coordinates or line segments indicating primary and secondary egress doors.
- **Window Locations**: Line segments along the perimeter indicating where windows are located (crucial for private office placement).

*Decision Needed*: Should the output be strictly axis-aligned rectangles (as currently used for rooms), or can the planning engine handle arbitrary polygons for the floorplate boundary?

## F. How Floorplate Scale is Established
Establishing accurate scale is critical for generating valid room areas and budgets. V1 will establish scale using the following hierarchy:
1. **User-Provided Total Square Footage**: The primary source of truth for scale is the `totalSqFt` value provided by the user during project intake. The parsed geometry will be uniformly scaled so that its calculated area matches this user-provided value.
2. **Detected Scale Bars/Dimensions**: If the system can reliably detect and read a scale bar or dimension lines on the plan, it may use this to verify or adjust the scale, but the user-provided `totalSqFt` remains authoritative.

*Proposed Default*: The system will always scale the parsed geometry to match the user-provided `totalSqFt`.

## G. Rectangular Approximation vs. Polygon Parsing
Given the current state of the layout engine (which uses axis-aligned rectangles for rooms and corridors), V1 will use a **Rectangular Approximation** model for the floorplate.
- The parsed floorplate will be represented as a single bounding rectangle or a union of orthogonal rectangles (e.g., L-shape, T-shape, U-shape).
- Complex curves or angled walls will be simplified to the nearest orthogonal bounding box.

*Future-State Enhancement*: True arbitrary polygon parsing and non-orthogonal room placement.

## H. Treatment of Specific Architectural Elements
The parsing engine must identify and classify specific elements to enforce the fidelity rules defined in the product spec:
- **Perimeter**: Must be identified and preserved as the outer boundary of the usable space.
- **Core Elements (Stairs, Elevators, Restrooms)**: Must be identified as "keep-out" zones. The planning engine cannot place rooms or corridors within these zones.
- **Entry Points**: Must be identified to ensure the generated layout connects to the building egress.
- **Windows and Mullions**: Window locations must be identified to prioritize perimeter offices and open workspaces. Mullion detection is *out of scope* for V1; window segments will be treated as continuous.
- **Existing Interior Walls**: The parsing engine will attempt to identify existing interior walls. The planning engine will use these as a baseline, preserving them in the "Light Refresh" scenario and selectively removing them in higher-impact scenarios.

## I. Parsing Confidence / Failure Handling
The parsing engine will calculate a confidence score based on the clarity of the input and the success of element detection.
- **High Confidence**: The floorplate, core, and entry points are clearly identified. The planning engine proceeds with the parsed geometry.
- **Low Confidence / Failure**: If the parsing engine cannot reliably extract the required geometry (e.g., due to a blurry photo or a highly complex, illegible plan), it will trigger a failure state.

*Fallback Behavior*: In the event of a parsing failure, the system will fall back to generating a **generic rectangular floorplate** based solely on the user-provided `totalSqFt` and an assumed aspect ratio (e.g., 1.5:1). The user will be notified that the layout is a generic approximation.

## J. Manual Override Requirements
V1 will not include a complex, interactive floor plan editor for manual overrides. However, the user must have the ability to:
- **Verify Scale**: Confirm or adjust the `totalSqFt` value if the generated layout appears incorrectly scaled.
- **Reject Parsed Geometry**: If the parsed geometry is wildly inaccurate, the user can choose to discard it and force the system to use the generic rectangular fallback.

*Decision Needed*: Should V1 include a simple UI to let the user manually define the bounding box of the tenant space on the uploaded image before parsing?

## K. Dependencies on User-Provided Dimensions or Assumptions
The parsing engine relies heavily on the following user-provided data:
- **Total Square Footage (`totalSqFt`)**: Absolutely required to establish scale.
- **Property Type/Class**: May be used as a hint for typical core sizes or window spacing if detection is ambiguous.

## L. Known Risks and Simplifications for V1
- **Scale Inaccuracy**: Relying solely on `totalSqFt` to scale the geometry assumes the parsed boundary perfectly matches the rentable area, which may not account for common area factors or loss factors.
- **Orthogonal Simplification**: Forcing all floorplates into rectangular approximations will result in inaccurate layouts for buildings with curved or angled facades.
- **False Positives in Core Detection**: The system may incorrectly identify a large conference room as a building core, preventing the planning engine from utilizing that space.

## M. Open Decisions Requiring Owner Input
1. **Geometry Format**: Can the deterministic planning engine handle arbitrary polygons for the floorplate boundary, or must the parsing engine strictly output orthogonal rectangles?
2. **Manual Bounding Box**: Should we implement a simple UI step allowing the user to draw a bounding box around the relevant tenant space before the AI attempts to parse the image?
3. **Core Identification**: If the AI cannot detect the building core, should we assume a side-core layout, a center-core layout, or prompt the user?

---

## Conclusion and Recommendations

### 1. Recommended V1 Approach
Implement an AI-assisted parsing pipeline that extracts a **rectangular approximation** of the floorplate, core elements, and entry points from supported image/PDF formats. Scale the resulting geometry strictly using the user-provided `totalSqFt`. Pass this structured geometry to the deterministic planning engine to constrain room placement.

### 2. Stricter Fallback Approach
If the AI parsing proves too unreliable or slow during implementation, the fallback approach is to abandon automatic geometry extraction for V1. Instead, present the user with a simple UI to select a generic floorplate shape (Rectangle, L-Shape, U-Shape) and specify the core location (Center, Side). The uploaded floor plan will only be used as a visual underlay for the final AI image generation, not for deterministic geometric planning.

### 3. Implementation Prerequisites
Before implementation of the parsing engine can begin, the following must be true:
- The deterministic planning engine must be updated to accept and respect external geometric constraints (floorplate boundary, keep-out zones), rather than assuming an infinite or generic canvas.
- The exact JSON schema for passing parsed geometry from the parsing module to the planning engine must be defined and agreed upon.
- A decision must be made on whether the planning engine can handle polygons or only orthogonal rectangles.
