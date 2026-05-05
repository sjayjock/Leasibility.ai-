LEASIBILITY.AI — COMPLETE ENGINE REBUILD INSTRUCTION
For Manus AI Agent — Read Fully Before Starting Any Code
Version 1.1 | May 2026

# Context and Background
You are rebuilding the core analysis engine of Leasibility.AI, a PropTech B2B SaaS application for commercial real estate tenant rep brokers. The app's auth, billing, PDF export, sharing, and UI are all working correctly and must NOT be touched.

The ONLY thing being rebuilt is the analysis engine inside server/aiEngine.ts and its supporting files. The interface contract (inputs and outputs) remains unchanged — nothing upstream (tRPC router) or downstream (UI, PDF, database schema) changes.

# Step 0 — Setup (DO THIS FIRST)
- git checkout staging-renderer-program-fit-rebuild
- git pull origin staging-renderer-program-fit-rebuild
- Confirm these files exist: server/aiEngine.ts, server/floorPlanParser.ts, server/leasibility.test.ts
- Confirm ANTHROPIC_API_KEY is set in the deployment environment (already configured in Manus Secrets)
- Confirm DATABASE_URL is available (Manus-managed, auto-injected)

# Step 1 — Rebuild floorPlanParser.ts
The floor plan parser must call Claude Vision to extract real building geometry from the uploaded image. This is the foundation everything else depends on.

Required Inputs
- floorPlanUrl: string — S3 URL of uploaded floor plan image (already stored on project row)
- totalSqFt: number — user-provided total square footage (authoritative scale source)

Required Outputs (FloorplateGeometry interface)
The parser must return this exact structure:
interface FloorplateGeometry {
  width: number;          // feet, parsed or estimated
  depth: number;          // feet, parsed or estimated  
  totalSqFt: number;      // from user input (authoritative)
  shape: 'rectangle' | 'L-shape' | 'U-shape' | 'irregular';
  aspectRatio: number;    // width/depth
  core: { x: number; y: number; width: number; height: number; type: 'center' | 'side' | 'end' | 'none' };
  entry: { x: number; y: number; wall: 'north' | 'south' | 'east' | 'west' };
  windows: Array<{ wall: 'north' | 'south' | 'east' | 'west'; startPct: number; endPct: number }>;
  confidence: 'high' | 'medium' | 'low';
  source: 'parsed' | 'fallback';
  parseWarnings: string[];
}

Claude Vision Implementation
- Use model: claude-sonnet-4-6
- Fetch the floor plan image from floorPlanUrl and convert to base64
- Send as image content block with media_type (image/jpeg, image/png, image/webp, or application/pdf)
- Use this exact system prompt for extraction:
You are an expert architectural space planner analyzing a commercial office floor plan.
Extract the following geometry data and return ONLY valid JSON matching this schema exactly:
{
  "width": <building width in feet, estimate if not labeled>,
  "depth": <building depth in feet, estimate if not labeled>,
  "shape": <"rectangle" | "L-shape" | "U-shape" | "irregular">,
  "core": { "x": <0-1 normalized>, "y": <0-1 normalized>, "width": <0-1>, "height": <0-1>, "type": <"center"|"side"|"end"|"none"> },
  "entry": { "x": <0-1 normalized>, "y": <0-1 normalized>, "wall": <"north"|"south"|"east"|"west"> },
  "windows": [{ "wall": <"north"|"south"|"east"|"west">, "startPct": <0-1>, "endPct": <0-1> }],
  "confidence": <"high"|"medium"|"low">,
  "parseWarnings": [<list any issues or assumptions made>]
}
Rules: Use normalized 0-1 coordinates where 0,0 is top-left. North = top of image.
If a dimension is labeled on the plan, use it. If not, estimate from proportions.
For totalSqFt scaling: the authoritative area is provided separately — do not override it.

- Scale width and depth so that width × depth ≈ totalSqFt (user-provided is authoritative)
- If confidence is 'low', set source to 'fallback' and use these safe defaults: width = sqrt(totalSqFt * 1.5), depth = sqrt(totalSqFt / 1.5), shape = 'rectangle', core at center 20% of area, entry at south wall center
- Always return a valid FloorplateGeometry — never throw on parse failure, always use fallback

# Step 2 — Create NEW server/layoutEngine.ts
This is the most critical file. It takes the FloorplateGeometry and a room program, and returns PlacedRoom[] with real x/y/width/height coordinates. This is the deterministic spatial brain of the entire application.

Core Interfaces
interface RoomSpec {
  type: string;           // canonical room type from Spatial Rules Hierarchy
  count: number;          // number of this room type
  targetSqFt: number;     // standard size
  minSqFt: number;        // minimum acceptable
  maxSqFt: number;        // maximum acceptable
  requiresWindow: boolean; // needs perimeter placement
  zone: 'welcome' | 'perimeter' | 'core-adjacent' | 'interior';
  priority: number;       // placement priority (lower = placed first)
}

interface PlacedRoom {
  id: string;
  type: string;
  x: number;      // feet from left edge of floorplate
  y: number;      // feet from top edge of floorplate
  width: number;  // feet
  height: number; // feet
  sqFt: number;   // actual placed area
  zone: string;
  hasWindowAccess: boolean;
  corridorAccess: boolean;
}

interface PlacedCorridor {
  id: string;
  x: number; y: number; width: number; height: number;
  type: 'primary' | 'secondary';
}

interface LayoutResult {
  placedRooms: PlacedRoom[];
  placedCorridors: PlacedCorridor[];
  unplacedRooms: Array<{ type: string; count: number; reason: string }>;
  efficiencyScore: number;    // computed: sum(placedRoom.sqFt) / totalSqFt * 100
  usableSqFt: number;         // sum of all placed room areas
  circulationSqFt: number;    // sum of all corridor areas
  residualSqFt: number;       // totalSqFt - usable - circulation
}

Placement Algorithm — EXACT SEQUENCE (Do Not Deviate)
Implement this algorithm as generateLayout(geometry: FloorplateGeometry, program: RoomSpec[], impactLevel: 'low' | 'medium' | 'high'): LayoutResult

- INITIALIZE grid: Create a 2D occupancy grid at 1-foot resolution (width × depth cells). Mark core cells as 'protected'. Mark perimeter border (6' band) as 'perimeter' zone. Mark cells within 15' of entry as 'welcome' zone. Mark cells within 15' of core as 'core-adjacent' zone.
- RESERVE LARGE ZONES: Before any placement, reserve the largest contiguous interior rectangle for Open Workspace / Workstation cluster (target 40-50% of usable area). Reserve a 400-600 SF zone adjacent to welcome area for Large Conference.
- GENERATE PRIMARY CORRIDOR: Draw a 5'-wide corridor spine from entry point toward the building core. Route straight unless geometry requires a turn. Mark all corridor cells as 'circulation'. Record corridor as PlacedCorridor.
- PLACE RECEPTION: Find largest available cell cluster in welcome zone (within 15' of entry). Place reception room adjacent to corridor. Size to 150 SF standard (80-224 SF range). Mark cells as occupied.
- PLACE LARGE CONFERENCE: Find available cell cluster adjacent to reception or directly off primary corridor in welcome zone. Place Large Conference (400 SF standard). Generate secondary corridor branch if needed (3.5' minimum).
- PLACE BREAK ROOM: Find available cell cluster near building core or plumbing wall. Place Break Room (200 SF standard). Generate secondary corridor branch if needed.
- PLACE PRIVATE OFFICES: Iterate along perimeter zone windows. For each window segment, place Private Offices in 120 SF units along perimeter band (15' deep). Count determined by workplace strategy ratio. Stop when perimeter band is full.
- FILL WORKSTATIONS: Place individual Workstation units (50 SF each) in reserved interior zone. Group in clusters of 4-8. Distribute Phone Booths (48 SF each, 1 per 8-10 WS) adjacent to WS clusters. Add Huddle Rooms (100 SF each, 1 per 10-12 staff) within 30' of WS clusters.
- PLACE SUPPORT SPACES: In core-adjacent zone, place Print/Copy (48 SF), Storage (80 SF), IT Closet (60 SF if requested), Wellness Room (80 SF if headcount > 50). Generate secondary corridor branches as needed.
- INFILL: Place remaining Collaboration Zones, extra conference rooms, extra huddle rooms in remaining flexible areas. Use flexible sizing to fill gaps.
- COMPACTION PASS: Identify gaps > 36 SF (smallest canonical room). Attempt to expand adjacent rooms within their max size. If gap > 100 SF and inaccessible, mark as residual space.
- CONNECTIVITY CHECK: Use BFS from entry point through corridor graph. Flag any placed room not reachable. Move flagged rooms to unplacedRooms array with reason 'no corridor access'. This must pass before returning.
- COMPUTE METRICS: efficiencyScore = Math.round(sum(placedRooms.sqFt) / geometry.totalSqFt * 100). Must fall within scenario range (72-79 Light, 80-86 Moderate, 87-93 Full). If outside range, log warning but do not fabricate.

# Step 3 — Create NEW server/svgRenderer.ts
The SVG renderer converts PlacedRoom[] coordinates into a professional architectural floor plan SVG. This is what brokers and tenants see — it must look like a real test fit, not colored boxes.

SVG Output Requirements
- ViewBox: 0 0 800 600 (standard landscape output)
- Scale: rooms are drawn at scale from PlacedRoom coordinates converted to SVG pixels
- Building perimeter: thick black stroke (3px), no fill
- Core: medium gray fill (#CCCCCC), hatching pattern, labeled 'CORE'
- Primary corridor: light gray fill (#E8E8E8), no stroke
- Secondary corridors: very light gray fill (#F0F0F0)
- Room fills by type:
Reception: #C9A84C (gold) | Conference: #2E75B6 (blue) | Private Office: #5B9BD5 (light blue)
Workstation: #70AD47 (green) | Break Room: #ED7D31 (orange) | Support: #A5A5A5 (gray)
Collaboration: #9DC3E6 (pale blue) | Phone Booth: #FFD966 (yellow) | Huddle: #70AD47 light
- Room labels: room type name (centered) + SF number below, white text on dark fills, dark text on light fills, font-size 9px minimum
- Scale bar: bottom left, 40' reference bar with tick marks
- North arrow: bottom right
- Title bar: bottom, dark navy background, 'LEASIBILITY AI — [SCENARIO NAME] — [PROPERTY NAME]'
- Legend: top right corner, color swatch + room type label for each type present
- Planning confidence note: top left, small italic text if fallback geometry was used
- Efficiency badge: top right of plan, circular badge showing efficiency % with scenario-appropriate color

# Step 4 — Create NEW server/budgetEngine.ts
The budget engine computes three-tier construction cost estimates based on scenario type, square footage, market, and demolition scope.

Budget Computation Logic
function computeBudget(
  totalSqFt: number,
  impactLevel: 'low' | 'medium' | 'high',
  market: string,
  demolishedSqFt: number
): { low: number; mid: number; high: number; scheduleWeeks: number } {

  // Base rates per SF (from Spatial Rules Hierarchy Section I)
  const baseRates = {
    low:    { low: 76, mid: 107, high: 137 },    // Light Refresh
    medium: { low: 168, mid: 224, high: 280 },   // Moderate Build-Out
    high:   { low: 300, mid: 395, high: 490 }    // Full Transformation
  };
  
  // Market adjustment factors
  const marketFactors: Record<string, number> = {
    'New York': 1.35, 'San Francisco': 1.30, 'Boston': 1.25,
    'Seattle': 1.20, 'Los Angeles': 1.18, 'Chicago': 1.05,
    'Dallas': 0.92, 'Atlanta': 0.90, 'Phoenix': 0.88,
    'default': 1.00
  };
  
  const factor = marketFactors[market] || marketFactors['default'];
  const rates = baseRates[impactLevel];
  
  return {
    low: Math.round(rates.low * factor * totalSqFt),
    mid: Math.round(rates.mid * factor * totalSqFt),
    high: Math.round(rates.high * factor * totalSqFt),
    scheduleWeeks: impactLevel === 'low' ? 10 : impactLevel === 'medium' ? 16 : 26
  };
}

# Step 5 — Rebuild server/aiEngine.ts — generateScenarios()
The orchestration layer. Wire all five steps together in the correct sequence. This replaces the current generateScenarios() function entirely.

- CALL floorPlanParser(floorPlanUrl, totalSqFt) → FloorplateGeometry
- CALL invokeLLM() with ONLY this request: room program (types + counts), layout description narrative, ai summary for broker. Do NOT ask LLM for efficiency score. Do NOT ask LLM for room sizes (use Spatial Rules Hierarchy canonical sizes).
- For EACH of 3 scenarios (low/medium/high impact): CALL layoutEngine.generateLayout(geometry, program, impactLevel) → LayoutResult
- For EACH scenario: CALL svgRenderer.renderToSVG(layoutResult, geometry, scenario) → SVG string
- For EACH scenario: CALL budgetEngine.computeBudget(totalSqFt, impactLevel, market, demolishedSqFt) → budget numbers
- For EACH scenario: CALL generateImage() with prompt that includes ACTUAL room coordinates from layoutResult. Example: 'Reception at position (0,0), 18x11ft, gold fill. Large Conference adjacent at (18,0), 28x14ft, blue fill. Primary corridor running south from entry...' This dramatically improves AI image accuracy.
- Store results: layoutSvg ← SVG renderer output. layoutImageUrl ← AI image URL. efficiencyScore ← layoutResult.efficiencyScore (computed number). roomBreakdown ← from LLM step 2.

# Step 6 — Update Tests
- Update server/leasibility.test.ts to await the now-async parser
- Add test: verify efficiencyScore is a computed number, not an LLM-declared range
- Add test: verify all 3 scenarios have same room program (same types and counts)
- Add test: verify at least 80% of headcount in workstations (program not truncated)
- Run: pnpm test — must pass all tests before committing

# Step 7 — MANDATORY COMMIT (DO NOT SKIP)

# Step 8 — Report Back
When complete, provide:
- Commit hash from successful git push
- pnpm test results (pass/fail for each test)
- Sample layout output: list of PlacedRoom[] for a 10,000 SF floor with 50 people
- Computed efficiency score for each of 3 scenarios
- Any unplaced rooms and reasons
- Screenshot or description of SVG output quality
- Any remaining environment or deployment issues