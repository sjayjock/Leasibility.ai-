# Good Layout Test Criteria

## A. Purpose

This document establishes the definitive QA and acceptance criteria for the Leasibility.AI space-planning subsystem. It translates product expectations, architectural rules, and spatial requirements into objective, testable pass/fail conditions. This is not a marketing document; it is a practical validation checklist designed to evaluate the output of the layout engine (specifically the `generateScenarios` function and its SVG/image rendering pipeline) during the rebuild and testing phases.

## B. What a "Good Layout" Means in V1

In Version 1 of Leasibility.AI, a "good layout" is defined by the successful execution of the **hybrid layout strategy**. This means the layout must be structurally and spatially correct at the data layer, while presenting a visually polished floor plan to the user. 

A good layout must:
1. **Respect the Physical Reality:** It must accurately anchor to the uploaded floor plan, preserving non-negotiable building elements (perimeter, core, stairs, elevators, windows, and primary egress).
2. **Reflect the Program Honestly:** It must attempt to fit the requested tenant program (derived from headcount or custom input) and explicitly report any shortfalls if the space cannot accommodate the full requirement.
3. **Differentiate by Scenario:** It must generate exactly three distinct scenarios (Light Refresh, Moderate Build-Out, Full Transformation) that vary in their level of interior demolition and reconfiguration, while all aiming to satisfy the same core tenant program.
4. **Ensure Navigability:** It must provide functional circulation, ensuring no rooms are placed within corridors and no doors are blocked.

## C. Pass/Fail Criteria

The following criteria separate spatial correctness (the structured data) from visual quality (the rendered output).

### 1. Room Placement
*   **Pass:** All placed rooms are located entirely within the defined suite perimeter. Rooms do not overlap with each other or with fixed building elements (cores, stairs, elevators).
*   **Fail:** Rooms extend beyond the exterior walls, overlap with the building core, or intersect with other rooms.

### 2. Corridor Connectivity
*   **Pass:** A continuous, unobstructed circulation path connects the primary entry to all placed rooms and secondary egress points. Primary corridors maintain a minimum clear width of 5'-0", and secondary corridors maintain a minimum clear width of 3'-6". No rooms are placed inside designated corridor zones.
*   **Fail:** Corridors are dead-ended without access to rooms, width falls below the 3'-6" minimum, or rooms are placed such that they block circulation paths.

### 3. Adjacency Compliance
*   **Pass:** Reception areas are anchored immediately adjacent to the primary suite entry. Support spaces (e.g., break rooms, print areas) are centrally located or logically grouped rather than isolated in unusable corners.
*   **Fail:** Reception is placed deep within the suite away from the entrance, or highly collaborative spaces are placed in isolated, hard-to-reach areas. *(Note: Some adjacency logic is subjective; failure here requires a clear violation of basic office flow).*

### 4. Zoning Compliance
*   **Pass:** The layout respects the distinction between perimeter and interior zones. For example, in a "Privacy-First" program, private offices are prioritized along the perimeter (windows).
*   **Fail:** Windowless interior rooms are designated as premium private offices while perimeter window space is used for storage or windowless support rooms.

### 5. Use of Perimeter vs. Interior
*   **Pass:** The engine correctly identifies the perimeter boundary and window locations from the uploaded plan. It places light-dependent rooms (offices, open workstations) along the perimeter where possible, and places light-independent rooms (storage, phone booths) in the interior.
*   **Fail:** The layout ignores window locations, placing solid walls directly against continuous window bands, or places open workstations entirely in the dark interior while using window lines for storage.

### 6. Handling of Ancillary/Support Spaces
*   **Pass:** Required ancillary spaces (print/copy, break room, IT/storage) are included in the layout based on the program rules and are sized within their acceptable soft-rule tolerances.
*   **Fail:** The engine completely omits required support spaces to artificially inflate the efficiency score, or places them in a way that blocks primary circulation.

### 7. Scenario Differentiation
*   **Pass:** The engine produces exactly three scenarios. 
    *   **Light Refresh:** Reuses existing interior walls; renames/repurposes rooms to fit the program without moving partitions.
    *   **Moderate Build-Out:** Removes 10–30% of non-structural interior walls to reconfigure specific zones while reusing MEP/core where possible.
    *   **Full Transformation:** Removes 80–100% of removable interior walls, creating an optimized layout from scratch while preserving the shell/core.
*   **Fail:** The three scenarios are spatially identical, or the "Light Refresh" scenario ignores existing walls and generates a completely new floor plan.

### 8. Program-Fit Honesty
*   **Pass:** If the requested program exceeds the available square footage, the engine places what it can, stops when the space is full (respecting corridors), and explicitly lists the unaccommodated rooms in the `unplacedRooms` array.
*   **Fail:** The engine artificially shrinks rooms below their minimum acceptable size to force them to fit, or it silently drops required rooms without reporting them as unplaced.

### 9. Residual/Unusable Space
*   **Pass:** The layout minimizes trapped, unusable square footage. Any residual space is either absorbed into open collaboration zones or clearly marked. The `efficiencyScore` accurately reflects the ratio of usable room area to total floorplate area.
*   **Fail:** The layout leaves large, inaccessible voids between rooms that are not designated as corridors or usable space.

### 10. Visual Consistency
*   **Pass:** The generated SVG fallback and the AI-generated image (if present) visually match the structured JSON data. A room listed at coordinates (x,y) in the JSON appears at that relative location in the visual output.
*   **Fail:** The AI image generation hallucinates a completely different floor plate shape, adds building cores that do not exist in the source file, or ignores the structured room placement entirely. *(Note: Visual style is subjective, but structural alignment between data and image is objective).*

## D. Minimum Acceptable Thresholds

The layout engine must adhere to the following dimensional and programmatic thresholds.

### Hard Rules (Never Compromised)
*   **Primary Corridor Width:** 5'-0" minimum clear.
*   **Secondary Corridor Width:** 3'-6" minimum clear.
*   **Door Swing Clearance:** Full arc must remain unobstructed.
*   **Fixed Elements:** Perimeter, stairs, elevators, restrooms, and entry points must remain locked in their original locations.

### Soft Rules (Flexible Area Equivalency)
Rooms may flex within these tolerances to achieve a fit, provided hard rules are not violated.

| Space Type | Standard Target | Minimum Acceptable | Maximum Acceptable |
| :--- | :--- | :--- | :--- |
| Private Office | 100 SF (10' x 10') | 80 SF (8' x 10') | 168 SF (12' x 14') |
| Workstation | 36 SF (6' x 6') | 25 SF (5' x 5') | 64 SF (8' x 8') |
| Huddle Room | 100 SF (10' x 10') | 80 SF (8' x 10') | 144 SF (12' x 12') |
| Medium Conference | 252 SF (14' x 18') | 192 SF (12' x 16') | 352 SF (16' x 22') |
| Large Conference | 432 SF (18' x 24') | 320 SF (16' x 20') | 560 SF (20' x 28') |
| Reception | 120 SF (10' x 12') | 80 SF (8' x 10') | 224 SF (14' x 16') |
| Break Room | 120 SF (10' x 12') | 80 SF (8' x 10') | 224 SF (14' x 16') |
| Print/Copy | 48 SF (6' x 8') | 30 SF (5' x 6') | 80 SF (8' x 10') |

## E. Failure Examples

The following observed behaviors constitute an immediate failure of the layout engine:

1.  **The "Phantom Core" Failure:** The AI image generator inserts a central elevator/stair core into a small, single-tenant suite that did not have one in the uploaded plan.
2.  **The "Clown Car" Failure:** The engine attempts to fit a 50-person program into a 2,000 SF space by shrinking workstations to 10 SF each, rather than stopping at capacity and reporting the shortfall.
3.  **The "Trapped Room" Failure:** A conference room is placed entirely surrounded by other private offices, with no corridor access or door.
4.  **The "Blank Slate" Failure:** The "Light Refresh" scenario completely ignores the existing interior walls shown on the uploaded PDF and draws a brand new layout.
5.  **The "Missing Output" Failure:** The engine fails to return exactly three `GeneratedScenario` objects, breaking the downstream UI and PDF rendering.

## F. Review Checklist for Human QA

When reviewing a generated project, the QA tester must verify the following:

- [ ] Did the system generate exactly three scenarios?
- [ ] Does the suite perimeter match the uploaded floor plan?
- [ ] Are the building core, stairs, and elevators in their original locations?
- [ ] Is the reception area located near the main entrance?
- [ ] Are all corridors at least 3'-6" wide (visually estimated)?
- [ ] Can every room be accessed from a corridor?
- [ ] Does the Light Refresh scenario reuse existing walls?
- [ ] Does the Full Transformation scenario show a completely new interior layout?
- [ ] If the program is too large for the space, does the UI display an "Unplaced Rooms" or shortfall warning?
- [ ] Do the room counts in the data table roughly match the visual representation in the floor plan image/SVG?

## G. Suggested Test-Case Structure

To systematically validate the engine, use the following test cases:

1.  **The Perfect Fit:** Upload a 5,000 SF empty shell plan. Request a 25-person headcount. 
    *   *Expected:* All rooms placed, high efficiency score, clear corridor logic.
2.  **The Overstuffed Suite:** Upload a 3,000 SF plan. Request a 50-person headcount.
    *   *Expected:* Engine stops placing rooms when full, reports significant `unplacedRooms`, maintains minimum room sizes.
3.  **The Heavy Existing Build:** Upload a plan with many existing small offices. Request an open-plan tech layout.
    *   *Expected:* Light Refresh struggles (reports poor fit or reuses offices awkwardly). Full Transformation successfully clears the interior and places open workstations.
4.  **The Irregular Floorplate:** Upload an L-shaped or curved floor plan.
    *   *Expected:* The engine respects the irregular boundary and does not place rooms outside the lines.

## H. Open Decisions Requiring Owner Input

1.  **Visual Hallucination Tolerance:** If the structured JSON data is perfect, but the AI image generator adds slight aesthetic hallucinations (e.g., drawing a plant where none was specified), is this a pass or a fail?
2.  **Corridor Routing Logic:** Should the engine prioritize straight, highly efficient corridors, or is a more organic, meandering circulation path acceptable in "Collaborative Hub" programs?
3.  **Unplaced Room Priority:** When the program exceeds the space, which rooms should the engine drop first? (e.g., drop workstations first, or drop the large conference room first?)

---

## 1. Top-Level Approval Checklist

- [ ] The layout engine accepts `ScenarioInput` and returns exactly three `GeneratedScenario` objects.
- [ ] The engine successfully extracts the perimeter and fixed elements from the uploaded floor plan.
- [ ] The engine enforces the Hard Rules (corridors, fixed elements, egress).
- [ ] The engine utilizes the Soft Rules (flexible area equivalency) to optimize fit.
- [ ] The engine accurately reports program shortfalls rather than breaking spatial rules.

## 2. "Must Not Happen" List

- **MUST NOT** place rooms outside the building perimeter.
- **MUST NOT** move or delete stairs, elevators, or restrooms.
- **MUST NOT** create dead-end rooms without corridor access.
- **MUST NOT** shrink rooms below their defined Minimum Acceptable size.
- **MUST NOT** generate identical layouts for Light Refresh and Full Transformation.
- **MUST NOT** introduce building cores that do not exist in the source plan.

## 3. Top 10 Metrics/Indicators to Track During Validation

1.  **Scenario Generation Success Rate:** Percentage of requests that successfully return all three scenarios.
2.  **Perimeter Fidelity Score:** Frequency of rooms breaching the extracted exterior boundary.
3.  **Fixed Element Preservation Rate:** Frequency of cores/stairs/elevators remaining in their original locations.
4.  **Corridor Compliance Rate:** Percentage of layouts where all corridors meet the 3'-6" minimum width.
5.  **Room Accessibility Rate:** Percentage of placed rooms that have clear access to a circulation path.
6.  **Program Fit Accuracy:** The ratio of placed square footage to requested square footage.
7.  **Unplaced Room Reporting Accuracy:** Verification that the `unplacedRooms` array correctly lists items that could not fit.
8.  **Efficiency Score Variance:** The spread of `efficiencyScore` across the three scenarios (ensuring they are distinct).
9.  **Light Refresh Wall Reuse Rate:** The percentage of existing walls retained in Scenario 1.
10. **Data-to-Visual Alignment:** The frequency with which the AI-generated image structurally matches the underlying JSON room coordinates.
