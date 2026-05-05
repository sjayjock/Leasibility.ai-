LEASIBILITY.AI
Good Layout Test Criteria
V1.1 — QA and Acceptance Criteria for the Layout Engine
May 2026 | Final QA Source-of-Truth

# A. Purpose
This document establishes the definitive QA and acceptance criteria for the Leasibility.AI space-planning subsystem. It translates product expectations, architectural rules, and spatial requirements into objective, testable pass/fail conditions.
A layout passes QA only when ALL criteria in this document pass. There are no optional criteria. Deterministic structured geometry is authoritative over AI-generated images in all conflict cases.

# B. Pass/Fail Criteria — Full List
## 1. Room Placement
- PASS: All placed rooms are located entirely within the defined suite perimeter. Rooms do not overlap with each other, protected elements, primary corridors, or secondary corridors.
- FAIL: Rooms extend beyond exterior walls, overlap with core, intersect other rooms, intrude into corridor zones, or depend on AI visual correction absent from structured geometry.

## 2. Corridor Connectivity
- PASS: Continuous unobstructed circulation connects primary entry to all placed rooms and secondary egress. Primary corridor minimum 5'-0" clear. Secondary corridors minimum 3'-6" clear. No dead ends.
- FAIL: Dead-end corridors, corridors below minimum width, rooms placed inside designated corridor zones, or rooms unreachable from entry via corridor graph.

## 3. ADA Compliance (NEW V1.1)
- PASS: Minimum 44" accessible route from building entry through suite entry to all primary function spaces. Minimum 60" turning radius at corridor intersections. All conference rooms, break rooms, reception have minimum 32" clear door opening.
- FAIL: Accessible path blocked by room placement, corridor width below 44" on primary accessible route, turning radius space not provided at intersections, required accessible rooms have doors below 32" clear.
V1.1 UPDATE: ADA compliance added as a required pass/fail criterion. This is a legal requirement (ADA Standards for Accessible Design) and a due-diligence item for enterprise B2B clients.

## 4. Adjacency Compliance
- PASS: Reception anchored immediately adjacent to primary suite entry. Support spaces (break rooms, print/copy) centrally located. Adjacency validated against deterministic room coordinates and Spatial Rules Hierarchy adjacency table.
- FAIL: Reception placed deep in suite away from entrance, collaborative spaces isolated and hard to reach, support spaces blocking corridor access or protected elements.

## 5. Zoning Compliance
- PASS: Layout respects perimeter vs. interior zone distinction. Light-dependent rooms (offices, workstations) placed along perimeter. Light-independent rooms (storage, phone booths, IT) placed in interior/core-adjacent zones.
- FAIL: Windowless interior rooms designated as premium offices while perimeter used for storage, or layout contradicts zoning logic in Spatial Rules Hierarchy.

## 6. Acoustic Buffer Zone Compliance (NEW V1.1)
- PASS: Loud zones (Break Room, Collaboration Zone) separated from quiet zones (Private Offices, Huddle Rooms, Phone Booths) by at least one room depth or an intervening corridor.
- FAIL: Break Room or Collaboration Zone placed directly adjacent to Private Offices or Huddle Rooms with shared wall and no acoustic separation.
V1.1 UPDATE: Acoustic Buffer Zone criterion added. This aligns with the new Acoustic Buffer Zone defined in Spatial Rules Hierarchy V1.1. Noise is the #1 post-occupancy complaint in commercial office spaces.

## 7. Program-Fit Honesty and Overflow
- PASS: If requested program exceeds available SF, engine places what it can and stops. Unaccommodated rooms listed in unplacedRooms array with reason. Drop order follows Spatial Rules Hierarchy Section I exactly.
- FAIL: Rooms shrunk below minimum acceptable size, required rooms dropped silently, high-priority rooms dropped before lower-priority rooms, AI image shows rooms absent from structured data.

## 8. Scenario Differentiation
- PASS: Engine produces exactly 3 scenarios. All 3 target IDENTICAL room program (same types and counts). Scenarios differ only in wall demolition level, efficiency score, budget, and schedule.
- FAIL: Three scenarios are spatially identical, Light Refresh ignores existing walls, Full Transformation fails to produce meaningfully more efficient layout, or scenarios have different room programs.

## 9. Efficiency Score Integrity
- PASS: Efficiency score = Math.round(sum of placed room areas / totalSqFt × 100). Computed from geometry. Falls within canonical range: Light Refresh 72-79%, Moderate Build-Out 80-86%, Full Transformation 87-93%.
- FAIL: Efficiency score is LLM-declared (not computed), outside canonical range without logged explanation, or inconsistent with the placed room areas in structured data.

## 10. SVG Visual-to-Data Alignment
- PASS: SVG output renders rooms at coordinates matching PlacedRoom[] data. Scale bar accurately represents building dimensions. Room labels match room types in structured data. Corridor paths match PlacedCorridor[] data.
- FAIL: SVG shows rooms at different positions than structured data, AI image hallucinates different floorplate shape/core/stair locations, or visual output contradicts deterministic geometry.

## 11. Budget Parametric Accuracy (NEW V1.1)
- PASS: Three-tier budget (low/mid/high) computed from budget engine using scenario type, totalSqFt, and market. Values fall within ranges defined in Spatial Rules Hierarchy Section I. Market adjustment factor applied correctly.
- FAIL: Budget numbers are LLM-declared, outside canonical ranges without logged explanation, or do not vary appropriately between scenarios.
V1.1 UPDATE: Budget parametric QA criterion added to align with new budget engine specified in Manus rebuild instruction and Spatial Rules Hierarchy V1.1 Section I.

# C. Minimum Acceptable Thresholds

# D. Canonical Room Names — V1.1
All QA checks must use these canonical room names. Any prior draft using different names is superseded.

# E. Test Case Structure

# F. Must-Not-Happen List
The following behaviors constitute immediate QA failure regardless of other results:
- Efficiency score declared by LLM rather than computed from placed room areas
- Three scenarios with different room programs (different room types or counts)
- Light Refresh scenario ignores existing wall geometry and generates fully new layout
- Rooms placed outside building perimeter
- Rooms overlapping each other or building core
- Any placed room unreachable from entry via corridor
- Primary corridor below 5'-0" clear width
- ADA accessible route blocked or below 44" clear
- Budget numbers declared by LLM rather than computed from budget engine
- SVG shows rooms at different positions than PlacedRoom[] structured data
- UnplacedRooms not logged when program overflow occurs
- Rooms shrunk below their minimum size to force a program fit

# G. Top-Level Approval Checklist
A layout is approvable only if ALL of the following are confirmed:
- All 11 pass/fail criteria pass
- No items on the Must-Not-Happen list triggered
- pnpm test passes all automated tests
- Manual QA review using TC-01 through TC-08 test cases
- Efficiency scores fall within canonical ranges for all 3 scenarios
- Budget numbers computed from budget engine (not LLM)
- SVG output visually matches structured PlacedRoom[] data
- ADA path confirmed accessible from entry to all primary program spaces
