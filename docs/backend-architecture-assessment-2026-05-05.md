# Leasibility.ai Backend Architecture Assessment and MVP Engine Roadmap

**Author:** Manus AI  
**Date:** 2026-05-05  
**Branch:** `staging/backend-architecture-assessment-2026-05-05`

## Executive Summary

Leasibility.ai should be treated as a **built but not yet launch-aligned** application. The repository documentation is consistent on this point: the archived application code is the operational baseline, while the immediate sprint objective is to revise the space-planning logic, existing-conditions interpretation, architectural rendering, pricing alignment, and end-to-end testing before launch.[1] [2] [3]

The current backend already has meaningful product infrastructure. It supports authenticated project creation, floor-plan upload, scenario generation, broker profile branding, Stripe subscription logic, report generation, storage uploads, public share links, and report view tracking. However, the core feasibility engine does **not yet satisfy the approved MVP standard** because it generates requested-program scenarios without first persisting a structured existing-conditions inventory, does not compute Achieved-vs-Requested fit by scenario, still allows customer-facing SVG fallback plans, and does not expose a needs-review state when credible plan output fails.[3] [4]

The most important engineering conclusion is that the next implementation should **not restart discovery**. It should harden the app baseline, preferably using the type-checking fixed archive as the implementation base, then add a deterministic planning pipeline around structured program truth. A commercial real estate feasibility product must answer this practical question: **what exists today, what can be reused, what must change, how close can each intervention level get to the requested tenant program, and what cost and schedule tradeoff follows?**

| Area | Current finding | Launch implication |
|---|---|---|
| Source baseline | The repository is archive-style, and the docs define archived app code as canonical.[1] [3] | Use a clean extracted app snapshot as the working source; do not restart strategy. |
| Latest inspected archive | One latest-looking snapshot fails TypeScript due syntax corruption in `server/aiEngine.ts` and `server/pdfRouter.ts`. | Do not deploy that archive without repair. |
| Alternative fixed archive | `leasibility-ai-FIXED-2026-03-24, 2.zip` type-checks and builds. | This appears to be the safest code base for the next rebuild unless a newer clean app snapshot is confirmed. |
| Planning engine | Scenario generation is prompt- and room-breakdown-driven; existing conditions are not persisted as first-class data. | Core MVP gap remains open. |
| Reporting | Reports include scenarios, budgets, schedules, room lists, AI summary, and layout image/SVG, but not Achieved-vs-Requested or program gaps. | Report is not yet decision-ready under the approved MVP rules. |
| Billing | Code still hardcodes a 7-day trial and Professional at $199/mo in the inspected catalog. | Commercial model is misaligned with the approved 14-day trial and $149 Professional plan.[3] |
| Tests | Type-check and production build can pass on the fixed archive, but tests fail without `STRIPE_SECRET_KEY` because Stripe initializes at import time. | Test harness needs environment-safe Stripe mocking or lazy initialization. |

## Source-of-Truth Interpretation

The project documentation now establishes a clear hierarchy. The app is not pre-build; it is a built product undergoing a controlled revision week before launch. The source-of-truth docs explicitly state that the archived app code is the canonical baseline and that older planning documents should be treated as historical unless they conflict with the approved decisions.[1] [3]

> “The app’s single highest-risk area remains the **space-planning logic and plan-rendering layer**.” — `docs/current-state.md`[1]

The approved technical direction is a **hybrid layout strategy**. Structured scenario truth must be the source of record, the uploaded plan must first be interpreted as an existing-conditions inventory, architectural vector rendering must produce customer-facing test-fit plans, and AI image generation may only provide optional polish after the structured plan is valid.[3]

| Approved rule | Current backend evidence | Gap |
|---|---|---|
| Existing-conditions inventory is required before scenario generation.[3] | `projects` stores `floorPlanUrl` and requested-program data; `scenarios` stores generated output fields. | No database model exists for extracted existing spaces, fixed zones, reusable zones, ambiguous areas, or demolition candidates. |
| All scenarios use the same requested tenant program but differ by intervention level.[3] | `generateScenarios` produces Light Refresh, Moderate Build-Out, and Full Transformation variants. | Scenario differences are largely prompt/cost/schedule driven rather than computed from measured existing-program deltas. |
| Reports must show Achieved-vs-Requested by scenario.[3] | `pdfRouter` renders scenario metrics, room breakdown, budgets, and schedules. | No Achieved-vs-Requested matrix or program-gap interpretation exists in the report contract. |
| Fallback plans must not be shown as finished test-fit plans.[3] | The scenario output still includes `layoutSvg: generateSVGLayout(...)` plus optional `layoutImageUrl`. | SVG fallback can remain customer-facing even when real plan generation fails. |
| Accepted files include PDF, JPG, PNG, GIF, WEBP, screenshots, and phone photos.[3] | The inspected intake accepts PDF/JPG/JPEG/PNG for the primary upload. | GIF/WEBP support and structured multi-photo handling need verification and implementation. |

## Build and Test Findings

I inspected the archived application snapshots without running untrusted application code from the repository itself. Dependencies were installed with lifecycle scripts disabled, and validation commands were run against extracted inspection copies.

| Snapshot | Command | Result | Notes |
|---|---|---|---|
| Latest-looking extracted archive inspected first | `pnpm run check` | **Failed** | TypeScript reported 332 parse errors concentrated in `server/aiEngine.ts` and `server/pdfRouter.ts`, including unterminated template literals and invalid escaped template syntax. |
| `leasibility-ai-FIXED-2026-03-24, 2.zip` | `pnpm run check` | **Passed** | This archive had a clean `aiEngine.ts` section where the corrupted duplicated prompt block was absent. |
| `leasibility-ai-FIXED-2026-03-24, 2.zip` | `pnpm run build` | **Passed with warnings** | Vite/esbuild built successfully. Warnings referenced missing analytics env placeholders and a large JS chunk. |
| `leasibility-ai-FIXED-2026-03-24, 2.zip` | `pnpm run test` | **Failed before tests executed** | Stripe is instantiated at module import time and throws when `STRIPE_SECRET_KEY` is unset. |

The fixed archive is therefore the best immediate engineering base if the team needs a clean compile/build starting point. The build result does **not** mean the product is MVP-accepted. It means only that the inspected fixed code compiles and bundles. The approved acceptance standard requires a real staging deployment, configured database, API keys, real floor-plan upload, three scenarios, refined plan outputs, achieved-vs-requested report, budget, schedule, project detail, shared report, and PDF/report review.[4]

## Current Backend Architecture

The application is a TypeScript full-stack app using React, Vite, Express, tRPC, Drizzle ORM, MySQL, Stripe, and a storage proxy. The inspected package manifest defines scripts for local development, production build, TypeScript checking, Vitest tests, and Drizzle migration generation/migration, as recorded in the inspection evidence file.[5]

| Layer | Current implementation | Role |
|---|---|---|
| Client | React/Vite application | Project intake, program entry, upload, scenario display, reporting workflows. |
| API | Express plus tRPC routers | Auth, projects, broker profile, billing, PDF/report generation, sharing, referrals. |
| Data | Drizzle ORM with MySQL schema | Users, broker profiles, projects, scenarios, share tokens, report views, referrals, changelog. |
| Storage | Forge storage proxy helper | Stores uploaded floor plans, broker assets, generated images, and report HTML. |
| AI/planning | `server/aiEngine.ts` | Creates scenario room breakdowns, budgets, schedules, SVG fallback, and optional image-generation prompts. |
| Billing | Stripe router/webhook/catalog | Subscription checkout, customer portal, status persistence, plan limits. |
| Report output | HTML report uploaded to storage | Branded scenario package with layout image/SVG, summary, budget, and schedule. |

The present schema is too shallow for a commercial feasibility engine. It stores the uploaded plan URL and final scenario outputs, but it does not store the intermediate reasoning that a broker, tenant, landlord, or investor would trust: extracted existing spaces, confidence levels, fixed elements, reusable zones, repurposed zones, demolition assumptions, requested-program quantities, achieved quantities, program gaps, review state, or plan quality status.

## Recommended Backend Engine Design

The backend should be refactored into a **stage-gated planning pipeline** rather than a single generate-scenarios step. Each stage should produce structured data, persist that data, and fail safely into a review state if confidence is too low.

| Stage | Backend responsibility | Persisted artifact | Failure behavior |
|---|---|---|---|
| Intake normalization | Convert headcount/custom-program input into a canonical requested program. | `requested_program` JSON/table rows. | Ask user to confirm missing program quantities. |
| Plan ingestion | Convert PDF/image/photo into normalized page images and metadata. | `plan_assets`, page dimensions, source MIME, extracted image URLs. | Mark upload unsupported or needs manual review. |
| Existing-conditions extraction | Detect/interpret rooms, labels, cores, circulation, reusable areas, ambiguous zones. | `existing_conditions_inventory`, `plan_zones`, confidence scores. | Show needs-review state rather than invented plan. |
| Program comparison | Compare existing program against requested program. | `program_fit_baseline`, requested/available/delta. | Show fit variance and ask for confirmation if confidence is low. |
| Scenario planning | Generate Light, Moderate, Full using the same shell and program. | `scenario_program_results`, reuse/demo/new-build scope. | Produce partial scenario only if explicitly labeled needs review. |
| Vector rendering | Render credible architectural test-fit plans from structured geometry. | `scenario_plan_artifacts`, SVG/PDF/PNG vector outputs. | Do not show block fallback as finished plan. |
| Cost and schedule | Estimate budgets and durations from reuse/demo/new-build scope quantities. | `scenario_costs`, `scenario_schedule_phases`, assumptions. | Show confidence/assumptions and require review if scope unknown. |
| Report assembly | Generate Project Detail, shared report, and PDF/report output. | `report_artifacts`, share metadata, version. | Block final report if required evidence is missing. |

This design makes the feasibility output auditable. If a tenant asks why the Light Refresh option is cheaper, the backend can say it reuses twelve offices, repurposes two conference rooms, demolishes only one partition zone, and leaves four requested phone rooms as program gaps. That is the product value; not merely that an AI generated three drawings.

## Minimum Data Model Additions

The fastest path is to keep the existing `projects` and `scenarios` tables while adding structured planning tables or JSON columns. A relational model is preferable for analysis and reporting, while JSON remains useful for variable geometry payloads.

| Entity | Key fields | Why it matters |
|---|---|---|
| `project_plan_assets` | `projectId`, `assetType`, `sourceUrl`, `pageNumber`, `mimeType`, `width`, `height`, `status` | Supports PDF pages, screenshots, and multiple phone photos as first-class assets. |
| `project_requested_program` | `projectId`, `programMode`, `programItem`, `requestedCount`, `requestedArea`, `source` | Prevents custom program values from being hidden inside `programNotes`. |
| `existing_program_items` | `projectId`, `itemType`, `count`, `area`, `locationLabel`, `confidence`, `reusePotential`, `notes` | Stores the required existing-conditions inventory. |
| `plan_zones` | `projectId`, `zoneType`, `geometryJson`, `fixed`, `reuseClass`, `confidence`, `sourceAssetId` | Represents core, circulation, reusable, repurposable, demo, and ambiguous zones. |
| `scenario_fit_results` | `scenarioId`, `programItem`, `requested`, `achieved`, `delta`, `status`, `explanation` | Powers Achieved-vs-Requested reporting. |
| `scenario_scope_items` | `scenarioId`, `scopeType`, `quantity`, `unit`, `costDriver`, `scheduleDriver`, `confidence` | Links scenario logic to budget and schedule. |
| `scenario_artifacts` | `scenarioId`, `artifactType`, `url`, `status`, `rendererVersion`, `qualityFlags` | Separates structured vector output, optional AI image polish, and needs-review states. |

The immediate migration should not overbuild BIM-level geometry. For MVP, zone geometry can be stored as normalized SVG/path JSON, bounding boxes, or polygons. The business need is reliable feasibility reasoning, not perfect CAD reconstruction.

## FastAPI Reference Design for a Planning Microservice

The current app is TypeScript/tRPC, and it can continue to own authentication, project management, billing, and reporting. A Python/FastAPI microservice is a good fit for **document parsing, image processing, computer vision, geometric reasoning, cost rules, and schedule generation**. The TypeScript API would call it asynchronously and persist returned structured artifacts in MySQL.

```python
from enum import Enum
from typing import Any, Literal
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Leasibility Planning Engine", version="0.1.0")

class ProgramItem(BaseModel):
    item_type: str
    requested_count: int | None = None
    requested_area: float | None = None

class PlanAsset(BaseModel):
    url: str
    mime_type: str
    page_number: int | None = None

class ExistingProgramItem(BaseModel):
    item_type: str
    count: int | None = None
    area: float | None = None
    location_label: str | None = None
    reuse_potential: Literal["reuse", "repurpose", "fixed", "demo_candidate", "ambiguous"]
    confidence: float = Field(ge=0, le=1)
    notes: str | None = None

class ScenarioLevel(str, Enum):
    light = "light"
    moderate = "moderate"
    full = "full"

class ScenarioFitResult(BaseModel):
    scenario_level: ScenarioLevel
    program_item: str
    requested: int | float | None
    achieved: int | float | None
    delta: int | float | None
    status: Literal["achieved", "partial", "not_accommodated", "needs_review"]
    explanation: str

class AnalyzeRequest(BaseModel):
    project_id: int
    total_sq_ft: int
    market: str | None = None
    assets: list[PlanAsset]
    requested_program: list[ProgramItem]

class AnalyzeResponse(BaseModel):
    project_id: int
    status: Literal["complete", "needs_review"]
    existing_inventory: list[ExistingProgramItem]
    fit_results: list[ScenarioFitResult]
    scenario_scope: dict[str, Any]
    renderer_inputs: dict[str, Any]
    quality_flags: list[str] = []

@app.post("/v1/projects/analyze", response_model=AnalyzeResponse)
def analyze_project(req: AnalyzeRequest) -> AnalyzeResponse:
    if not req.assets:
        raise HTTPException(status_code=400, detail="At least one plan asset is required")

    # Stage 1: ingest and normalize drawings or photos.
    normalized_assets = normalize_assets(req.assets)

    # Stage 2: extract visible existing-conditions inventory.
    inventory = extract_existing_inventory(normalized_assets, req.total_sq_ft)

    if low_confidence_inventory(inventory):
        return AnalyzeResponse(
            project_id=req.project_id,
            status="needs_review",
            existing_inventory=inventory,
            fit_results=[],
            scenario_scope={},
            renderer_inputs={},
            quality_flags=["LOW_EXISTING_CONDITIONS_CONFIDENCE"],
        )

    # Stage 3: compare existing conditions with the requested program.
    baseline_fit = compare_existing_to_requested(inventory, req.requested_program)

    # Stage 4: generate scenario-specific reuse, repurpose, demo, and new-build scope.
    scenarios = generate_intervention_scenarios(baseline_fit, inventory, req.total_sq_ft)

    # Stage 5: prepare deterministic renderer inputs and report-ready fit results.
    renderer_inputs = build_renderer_inputs(scenarios)
    fit_results = build_achieved_vs_requested(scenarios, req.requested_program)

    return AnalyzeResponse(
        project_id=req.project_id,
        status="complete",
        existing_inventory=inventory,
        fit_results=fit_results,
        scenario_scope={s["level"]: s for s in scenarios},
        renderer_inputs=renderer_inputs,
    )
```

This service should not be a black-box drawing generator. It should return structured domain objects that the TypeScript app can validate, store, display, and report. The AI model can assist extraction and classification, but the final API contract should remain deterministic and testable.

## Cost and Schedule Logic

The current scenario budgets are useful as placeholders, but the MVP needs cost and schedule outputs tied directly to scope quantities. The engine should estimate by intervention type, market multiplier, reuse rate, demolition area, new partition linear feet, new/modified rooms, furniture scope, IT/AV scope, and soft costs.

| Cost driver | Light Refresh | Moderate Build-Out | Full Transformation |
|---|---:|---:|---:|
| Existing walls retained | Highest | Medium | Lowest, except shell/core |
| New partitions | Low | Medium | High |
| Demolition | Minimal | Selective | Major interior demolition |
| Furniture reuse | Highest | Medium | Lowest unless client requests reuse |
| MEP/IT/AV risk | Low | Medium | High |
| Schedule basis | Refresh tasks and minor trades | Selective demo plus phased new work | Full interior design and build-out |

The report should explain cost and schedule as feasibility assumptions, not as construction bids. For launch, budget ranges can remain benchmark-driven, but every scenario should show why its cost differs: reused rooms, repurposed spaces, demolition zones, new partitions, workstation/furniture assumptions, and excluded unknowns.

## CAD, BIM, PDF, and Photo Parsing Guidance

The MVP should prioritize **office floor-plan PDFs and common image uploads** over CAD/BIM ingestion. CAD/DWG parsing is valuable, but it increases implementation complexity and support burden. The launch sequence should therefore treat PDF/image extraction as first class, with CAD/BIM as a later pro or enterprise enhancement.

| Input type | MVP treatment | Later enhancement |
|---|---|---|
| PDF floor plans | Rasterize pages, extract text labels where possible, analyze linework and room labels. | Add vector PDF geometry extraction and sheet/title-block parsing. |
| JPG/PNG/WEBP/GIF/screenshots | Normalize orientation, scale, contrast, and resolution; run visual extraction. | Add user-assisted calibration and scale detection. |
| Phone photos | Deskew, crop, correct perspective, classify confidence lower than direct uploads. | Multi-photo stitching or field capture workflow. |
| CAD/DWG | Accept only if converted externally to PDF/image for MVP. | Add ODA/Forge/AutoCAD-cloud conversion pipeline. |
| BIM/IFC/Revit | Out of MVP unless an enterprise pilot demands it. | Add IFC parsing and room object import later. |

The key is to avoid overpromising CAD/BIM support before the core feasibility output is credible. The app can become a strong CRE product with PDF/image-based inventory extraction first.

## Deployment and Security Recommendations

The repo uses Drizzle with MySQL dependencies, so the required staging database type should be treated as **MySQL-compatible** unless a later code inspection replaces that configuration. The fastest staging database options are PlanetScale, TiDB Cloud, Railway MySQL, or a managed MySQL instance from Render/AWS/GCP. `DATABASE_URL` should be configured in the deployment environment, and migrations should be applied with the existing `pnpm run db:push` script after the database is connected.[5]

| Environment requirement | Current implication |
|---|---|
| `DATABASE_URL` | Required for Drizzle/MySQL runtime and migrations. |
| `STRIPE_SECRET_KEY` | Required for billing router import/runtime; tests should mock or lazily initialize Stripe. |
| Stripe webhook secret | Required for production webhook verification if present in environment wiring. |
| Storage API URL/key | Required for floor-plan uploads, broker branding, generated images, and report artifacts. |
| AI/image generation API credentials | Required for optional image polish; structured vector renderer must not depend solely on this. |
| Analytics env vars | Build warns about missing Vite analytics placeholders; either configure or remove placeholders. |

Security should remain straightforward for MVP. Uploaded floor plans and generated reports can contain confidential tenant and landlord information, so storage URLs should be scoped, expiring where possible, and protected by project ownership or share-token rules. Report view tracking should avoid retaining raw IP addresses; the inspected code already hashes IP-like values for report views, which is directionally correct.

## Implementation Sequence

The next backend sprint should follow the approved source-of-truth order: fix the baseline, implement the planning data model, then make rendering and reporting trustworthy before attempting launch acceptance testing.

| Priority | Implementation action | Acceptance evidence |
|---:|---|---|
| 1 | Select and unpack the clean fixed archive into a normal app source directory, removing corrupted duplicate archive confusion. | `pnpm run check` and `pnpm run build` pass from the chosen app source directory. |
| 2 | Fix test harness by lazy-initializing Stripe or injecting a billing client mock. | `pnpm run test` runs without requiring real Stripe secrets for unit tests. |
| 3 | Add requested-program, plan-asset, existing-inventory, plan-zone, scenario-fit, scope-item, and artifact persistence. | Drizzle migration committed; sample project stores inventory and fit results. |
| 4 | Refactor `analyze` into staged pipeline: normalize program, ingest asset, extract inventory, compare, generate scenarios, render, cost/schedule, report. | API returns `complete` or `needs_review` with auditable intermediate records. |
| 5 | Replace customer-facing SVG fallback with renderer status handling. | Failed renderer shows needs-review state, not fake finished plans. |
| 6 | Add Achieved-vs-Requested table to Project Detail, shared report, and report/PDF output. | Real report contains requested, achieved, delta, and fit-variance explanation per scenario. |
| 7 | Align billing catalog and checkout to approved commercial model. | Starter $99/$990, Professional $149/$1,490, Team $149/user/$1,490/user, 14-day trial. |
| 8 | Verify upload support for PDF, JPG, PNG, GIF, WEBP, screenshots, and phone photos. | UI, backend MIME validation, and storage flow accept the approved list. |
| 9 | Deploy staging with MySQL and required API keys. | Real staging URL, migrations applied, env vars documented. |
| 10 | Run real office-plan acceptance test. | Three refined scenarios, achieved-vs-requested report, budgets, schedules, Project Detail, shared report, and report export reviewed. |

## Immediate Next Action

The exact next action should be **implementation**, not more discovery. I recommend creating a branch such as `fix/select-clean-app-baseline` or `feature/planning-engine-v1`, copying the type-checking fixed archive into a canonical app source directory, and committing that baseline before adding any new engine logic. From there, the first code change should be the persistence schema for requested program, plan assets, existing inventory, plan zones, scenario fit results, scope items, and scenario artifacts.

## References

[1]: current-state.md "Leasibility.ai Current State"  
[2]: next-actions.md "Next Actions"  
[3]: decisions.md "Leasibility.ai Decisions"  
[4]: mvp-existing-conditions-program-logic.md "MVP Existing-Conditions Program Logic"  
[5]: inspection-evidence-2026-05-05.md "Inspection Evidence — 2026-05-05"
