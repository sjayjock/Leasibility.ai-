LEASIBILITY.AI
Spatial Rules Hierarchy
Master Source-of-Truth — V1.1 Enhanced
Revised May 2026 | Engineered for $50M PropTech Scale

# A. Purpose and Competitive Context
This document establishes the foundational spatial logic for the Leasibility.AI space-planning engine. It defines the hierarchy of architectural constraints ensuring generated test fits are realistic, navigable, and respectful of existing building conditions. It is the master source-of-truth for all planning rules, room sizes, and scenario definitions.

Competitive context: The leading PropTech AI space planning platforms (qbiq, Archilogic, Autodesk Forma) have demonstrated that brokers pay premium prices for tools that produce architecturally believable layouts instantly. Leasibility.AI's defensible differentiation is encoding 20+ years of tenant rep expertise as deterministic rules — something that cannot be replicated by general-purpose AI tools.
★ NEW: V1.1 adds 8 items identified as gaps against $50M PropTech scale standards: budget parametrics, sustainability scoring, brand guidelines, lease negotiation triggers, market benchmarks, multi-floor logic, accessibility compliance, and data telemetry hooks.

# B. Protected vs. Flexible Elements
To generate credible commercial office layouts, the engine must distinguish between elements that cannot be altered and those that can be modified based on the selected intervention scenario.

Protected Elements (Non-Negotiable)
- Building Perimeter: The exterior boundary of the suite or floor plate. Must be preserved exactly as parsed or confirmed via fallback UI.
- Core Elements: Existing stairs, elevators, mechanical shafts, and base-building restrooms. Coordinates locked from parsed geometry.
- Windows and Mullions: Location of exterior glazing, dictating where perimeter walls can intersect the facade.
- Entry and Egress: Primary suite entrances and secondary fire egress doors. ADA-accessible path from entry must be maintained.
- ADA Circulation Path: Minimum 44" clear accessible path from building entry through suite entry to all primary program spaces. Hard constraint.
★ NEW: ADA compliance added as a Protected Element. Per ADA Standards for Accessible Design, accessible routes must connect all primary function areas. This is a legal requirement and a due-diligence item for enterprise clients.

Flexible Elements (Scenario-Dependent)
- Interior Partitions: Existing non-structural walls, retained/partially demolished/fully removed per scenario.
- Internal Circulation: Corridors generated to connect program if existing circulation is removed.
- Room Placements: Specific locations of offices, workstations, and support spaces within available flexible area.

# C. Hard Rules vs. Soft Rules
Hard Rules (Must Be Obeyed — Engine Cannot Proceed if Violated)
- The engine must not introduce new building cores if not present in provided drawings.
- Rooms must not overlap with protected elements or each other.
- All placed rooms must be accessible via the internal circulation network.
- Primary Corridor: Main circulation spine connecting primary entry to core and/or major program zones. Minimum clear width 5'-0". ADA-compliant width 5'-0".
- Secondary Corridor: Any branch path connecting individual rooms or small room clusters to primary corridor. Minimum clear width 3'-6". Where ADA-accessible path required, minimum 3'-6" with 5'-0" passing spaces every 200' max.
- Total placed square footage plus circulation cannot exceed usable square footage of suite.
- ADA Turning Radius: Minimum 60" diameter clear floor space at corridor intersections and primary room entries for wheelchair turning radius.
- Door Clear Width: All accessible rooms must have minimum 32" clear door opening (36" preferred). Conference rooms, break rooms, and reception must meet ADA entry width.
★ NEW: ADA dimensional requirements added to Hard Rules. These are legally non-negotiable for commercial office space in the US and represent a key enterprise client requirement.

Soft Rules (Should Be Optimized)
- Efficiency Score: 72–79 for Light Refresh, 80–86 for Moderate Build-Out, 87–93 for Full Transformation. Computed from geometry, never declared.
- Aspect Ratios: Rooms should maintain reasonable architectural proportions (3:2 or 4:3 preferred, never exceed 4:1).
- Natural Light: Private Offices and Workstations prioritized for perimeter placement.
- Acoustic Zoning: Quiet zones (private offices, phone booths) separated from loud zones (collaboration, break room) by at least one room depth or intervening corridor.
- Sustainability Density: Target 150–200 RSF/person for standard layouts as a soft benchmark against LEED/WELL space efficiency standards.
★ NEW: Acoustic zoning and sustainability density added as soft rules. Acoustic separation is a top tenant complaint driver in post-occupancy surveys. RSF/person benchmarking aligns with WELL Building Standard v2 and is increasingly required by enterprise tenants.

# D. Canonical Room Sizes and Types (V1 Scope)
The space-planning engine must recognize a standardized set of room types to ensure consistency across scenarios and accurate reporting. 'Workstation' is the canonical term for the individual seating unit. 'Open Workspace' is removed to prevent confusion.

★ NEW: Wellness/Mother's Room and IT/Server Closet added. Both are standard requirements under PUMP Act (2022) for US commercial tenants, WELL Building Standard v2, and are standard asks in enterprise RFPs. Omitting them from layouts causes deal friction.

# E. Scenario Demolition Rules
The engine generates exactly three scenarios. All three must target the same tenant program. Scenarios differ in intervention level, cost, and timeline — NOT in representing different tenant needs.

★ NEW: Construction cost multipliers and typical timelines added to scenario definitions. This is the data brokers need to frame tenant conversations about budget and schedule. These figures are derived from CBRE and JLL construction cost benchmarks for US Class A/B office space as of 2025.

# F. Zoning Priorities and Workplace Strategies
Functional Zones
- Welcome Zone: Within 15 feet of primary suite entrance. Must contain Reception and client-facing spaces. No workstations or support rooms.
- Perimeter Zone: Outer edges of space along windows. Priority zone for Private Offices and Workstations requiring natural light.
- Core-Adjacent Zone: Interior area within 15 feet of building core. Ideal for Storage, Print/Copy, IT closet, and Phone Booths.
- Interior Zone: Remaining central space. Circulation, Phone Booths, Collaboration Zones without daylight requirement.
- Acoustic Buffer Zone: Minimum one-room-depth separation between loud zones (Break Room, Collaboration) and quiet zones (Private Offices, Huddle Rooms).
★ NEW: Acoustic Buffer Zone added as a named zone. Post-occupancy research consistently identifies noise as the #1 workplace complaint. Encoding acoustic separation as a named zone makes it systematically applied rather than incidentally considered.

Workplace Strategies
★ NEW: Hybrid Flex strategy added. As of 2025, 67% of US office leases are being signed by companies with hybrid work policies (JLL 2024 Global Real Estate Outlook). Brokers need a layout strategy that accommodates non-assigned seating and activity-based working.

# G. Adjacency Priorities

# H. Room Placement Sequencing
The engine must place rooms in this exact order. Earlier items are more constrained and harder to fit later. Deviation from this sequence is a critical engine failure.

- LOCK PROTECTED ELEMENTS — Perimeter, core, windows, entry/egress, ADA path. These are non-negotiable boundaries.
- RESERVE LARGE ANCHOR ZONES — Declare zone claims for Open Workspace (largest room), Large Conference, Break Room BEFORE any scanning begins. Large rooms must never be placed last.
- GENERATE CIRCULATION SPINE — Route primary corridor from entry toward core and major program zones. Reserve ~18% of floor area for circulation in Full Transformation. Corridor is generated BEFORE rooms are placed. Never after.
- PLACE RECEPTION — At primary entrance, within Welcome Zone (15' of entry). First room placed.
- PLACE LARGE CONFERENCE — Adjacent to Reception, with direct corridor access. Client-facing.
- PLACE BREAK ROOM — Near plumbing core. Generate secondary corridor branch to it.
- PLACE PRIVATE OFFICES — Along perimeter band (window-adjacent). Respect workplace strategy ratio.
- FILL OPEN WORKSPACE — In reserved interior zone. Group Workstations in clusters of 4-8 with Huddle Rooms and Phone Booths distributed throughout.
- PLACE SUPPORT SPACES — Print/Copy, Storage, IT Closet, Wellness Room in core-adjacent interior zones.
- INFILL — Distribute remaining Collaboration Zones, extra Huddle Rooms, Phone Booths in leftover flexible areas.
- RUN COMPACTION PASS — Check for gaps larger than smallest canonical room size. Attempt to fill with flexible-size rooms.
- CONNECTIVITY CHECK — Confirm all placed rooms have accessible corridor connection. No dead ends.
- COMPUTE EFFICIENCY SCORE — Sum placed room areas / total floorplate area × 100. Store as integer.

★ NEW: Steps 11-13 (compaction pass, connectivity check, efficiency computation) added as explicit sequencing steps. These were identified in the Claude audit as missing from the original implementation.

# I. Budget Parametrics (NEW — V1.1)
The engine must generate three-tier budget estimates (Low / Mid / High) based on scenario type, market, and program. These are the numbers brokers use in RFP responses and LOI negotiations.

⚠ Budget ranges are based on 2025 CBRE Construction Cost Index, JLL Office Fit-Out Guide, and Cushman & Wakefield Tenant Improvement benchmarks for US Class A/B office space. Market adjustments apply: NYC/SF/Boston = +25-40%, Sun Belt = -10-15%.
★ NEW: Budget parametrics added as a new section. This directly addresses broker need #1: giving tenants a budget range before engaging an architect. This is the core value proposition that justifies $299+/month subscription pricing.

# J. Exceptions / Edge-Case Logic
Program Overflow — Unplaced Room Drop Order
If required program exceeds usable square footage, the engine places what it can, stops when space is full (respecting minimums and corridor rules), and logs unplaced rooms. Drop order:
- Extra Collaboration Zones beyond first one
- Extra Storage beyond first unit
- Extra Print/Copy beyond first unit
- Optional Phone Booths (above minimum 1-per-8-WS ratio)
- Extra Huddle Rooms (above minimum 1-per-10-staff ratio)
- Secondary Break Room area (keeping minimum break room)
- Workstation count (only after all ancillary reductions exhausted)
- Core required rooms last — Reception, primary corridor, first conference, first break room

Irregular Floor Plates
- For highly irregular or narrow floor plates, engine may relax aspect ratio rules or increase circulation % to ensure all spaces remain accessible.
- L-shapes: treat as two rectangular zones with a connecting corridor at the bend. Place large anchors in the larger wing.
- U-shapes: treat as three rectangular zones. Central connecting space becomes primary circulation.
- Narrow floor plates (<60' width): prioritize single-loaded corridor with rooms on one side only.

Existing Wall Conflicts
- In Light Refresh, if existing room is slightly smaller than target (within 15% of minimum), accept existing room rather than demolishing for minor correction.
- In Moderate Build-Out, walls may be removed if doing so improves program fit by more than 20 SF net gain.

# K. Market Benchmark Data (NEW — V1.1)
The engine should store and expose market benchmark data to contextualize efficiency scores and density metrics for brokers and tenants.

★ NEW: Market benchmark section added. This data enables the 'benchmark your results' feature discussed for competitive positioning. Storing this alongside user project data builds Leasibility.AI's proprietary benchmark dataset over time.

# L. Sustainability and ESG Scoring (NEW — V1.1)
Enterprise tenants increasingly require ESG reporting on space decisions. The engine should compute and expose basic sustainability metrics.

- Density Score: RSF/person computed from total SF / headcount. Flag if >200 RSF/person (inefficient) or <100 RSF/person (dense).
- Natural Light Access: % of workstations within 30' of window line. LEED target: 75%+ of regularly occupied spaces.
- Active Design Score: Boolean flag if stairs are accessible and circulation encourages movement vs. elevator-only.
- Material Impact Flag: Full Transformation scenario generates higher material waste — flag estimated demolition waste tonnage based on SF demolished.
- WELL Alignment: Check if layout includes: natural light access, acoustic separation, wellness room, kitchenette. Report % of WELL v2 Space Concepts addressed.
★ NEW: ESG scoring added. Per JLL 2024 Future of Work Survey, 78% of enterprise tenants require ESG reporting from their CRE partners. This feature differentiates Leasibility.AI from basic test-fit tools and supports enterprise sales.

# Final Source-of-Truth Declaration