# Leasibility.ai AI-First Launch Roadmap Evaluation

**Author:** Manus AI  
**Date:** May 18, 2026  
**Branch:** `feature/ai-first-launch-roadmap`

## Executive Recommendation

Leasibility should **not** restart from scratch. The correct path is to preserve the archived app as the product shell and replace the weak planning/rendering core with a **structured AI-assisted planning pipeline**. The Claude conversation points in the right direction because it reduces the hardest unsolved problem from brittle geometric reconstruction to a small number of well-scoped AI and deterministic steps. However, the proposal should be modified to comply with the approved project decisions: **AI-generated images may accelerate visual output, but structured scenario JSON, existing-condition inventory, achieved-vs-requested reporting, and controlled rendering/compositing must remain the product truth**.[^decisions]

The fastest credible MVP path is therefore a hybrid rebuild. The app should use vision AI to interpret the uploaded floor plan, deterministic code to create and validate the requested program and scenario specs, image-editing models to produce directionally useful architectural plan visuals, and a deterministic post-processing layer to enforce labels, legends, fixed elements, counts, branding, and report consistency. This approach aligns with the source-of-truth requirement that Leasibility remain upload-first, preserve core/perimeter/fixed building elements, produce three construction-impact scenarios, include achieved-vs-requested reporting, and avoid customer-facing fake block diagrams.[^current-state] [^next-actions]

> **Strategic decision:** Move forward with the AI-first experiment, but do it as a **controlled replacement of `aiEngine` and the rendering/report pipeline inside the existing app**, not as a disconnected prototype and not as an image-only product.

## What I Reviewed

The evaluation reviewed the source-of-truth repository documents in the required order, including `docs/current-state.md`, `docs/next-actions.md`, and `docs/decisions.md`. It also reviewed the attached Claude conversation, the extracted latest app archive, the `app_fixed` archive, the current `server/aiEngine.ts`, the tRPC project flow, the database schema, the report and shared-report surfaces, and the standalone deterministic layout module.

| Evidence area | Finding | Product implication |
|---|---|---|
| Source-of-truth docs | The app is considered built in meaningful form but not launch-ready. The highest-risk area is still planning logic and plan rendering. | Do not restart discovery; execute a focused rebuild of the planning/rendering core. |
| Current app shell | Authentication, intake, upload, storage, scenario persistence, project detail, sharing, billing, and report surfaces already exist. | Preserve the product shell and replace the engine rather than rebuilding all workflows. |
| Current AI engine | The `app_fixed` engine is cleaner than the malformed v10 engine, but it is still a prompt-to-room-breakdown/image pipeline with no robust vision extraction, fixed-element control, QA loop, or achieved-vs-requested layer. | The engine is the right replacement target. |
| Deterministic layout module | The module confirms the weakness of row/grid packing, simplistic corridors, weak adjacency, and limited geometry intelligence. | Do not make this module the MVP rendering foundation without major rework. |
| Claude image-generation test | The test produced promising visuals but showed count drift, column/core drift, legend inconsistency, and distribution mistakes. | Image generation can be used, but only with deterministic truth, QA, and compositing controls. |
| API feasibility | OpenAI’s image edit documentation states that the image edit endpoint creates edited or extended images from one or more source images and a prompt, supporting GPT Image models.[^openai-image-edit] | A source-plan-plus-scenario image workflow is technically feasible enough to prototype now. |

## My Assessment of the Claude Proposal

The Claude proposal is directionally strong because it recognizes that Leasibility’s market value is not perfect architectural automation on day one. The immediate customer value is a broker-usable feasibility package that converts a floor plan and tenant need into three credible scenarios, clear budget and schedule ranges, and a polished report that can start a leasing conversation. The current deterministic floorplan approach has been spending too much effort on reconstructing geometry before proving that the user-facing package is commercially convincing.

The weakness in the Claude proposal is that it can be read as too image-first. The source-of-truth decisions explicitly require structured scenario truth, existing-condition inventory, architectural plan rendering, fixed-element preservation, and achieved-vs-requested reporting.[^decisions] A generated image alone cannot be accepted as the source of truth because it may undercount workstations, move columns, invent rooms, or create a legend that contradicts the data. The test result in the attached conversation already confirmed those failure modes.

The right interpretation is therefore not **“let the image model solve test fits.”** The right interpretation is **“use AI vision and image editing where they are strongest, and use deterministic code where precision matters.”** That is the same architecture principle used in strong AI products: use specialized AI for perception and generative presentation, but keep authoritative quantities, business rules, and acceptance criteria in software.[^ai-skill]

## Recommended Target Architecture

The recommended architecture is an eight-stage pipeline inside the existing application. Each stage should have a narrow responsibility, a machine-readable output, and a validation gate before the next stage begins.

| Stage | Name | Purpose | Authoritative output | MVP acceptance rule |
|---:|---|---|---|---|
| 1 | File normalization | Convert PDF/images/photos into standardized page images with known dimensions. | `normalized_plan_image`, page metadata. | All approved file types load: PDF, JPG, PNG, GIF, WEBP, screenshots, and phone photos. |
| 2 | Existing-condition vision extraction | Extract visible room inventory, reusable zones, fixed zones, core, perimeter, columns, entries, windows, and ambiguity flags. | `existing_conditions_json`. | Output must identify fixed elements and confidence; low confidence triggers needs-review. |
| 3 | Requested program normalization | Convert headcount-first or custom-program intake into a structured requested program. | `requested_program_json`. | Custom program supersedes headcount when entered, as required by project decisions. |
| 4 | Scenario spec generation | Generate Light Refresh, Moderate Build-Out, and Full Transformation as structured specs against the same requested program. | `scenario_spec_json[]`. | Each scenario includes requested count, achieved count, program gap, budget drivers, schedule drivers, and reuse/demolition assumptions. |
| 5 | Deterministic validation | Enforce feasibility bounds, room counts, no impossible claims, and scenario-specific intervention levels. | `validated_scenario_spec_json[]`. | No report can be marked complete if the scenario spec fails validation. |
| 6 | Visual generation | Use image editing/generation to create plan visuals from the original plan and validated specs. | Draft images only. | Draft images are never the source of quantities or budgets. |
| 7 | Visual QA and compositing | Check fixed-element preservation, strip model legends, overlay controlled labels/legends/title bars, and optionally re-overlay fixed elements. | Final scenario images. | If visual QA fails after retries, mark the project needs review rather than showing a fake plan. |
| 8 | Report assembly | Generate Project Detail, Shared Report, PDF/report, budget, schedule, and achieved-vs-requested output from validated JSON. | Customer-facing deliverables. | Stephen reviews a real uploaded office plan end to end before launch. |

This architecture preserves the app’s current data and workflow investments while replacing the part that is least credible today. It also creates a clean human-AI boundary: AI helps read and visualize; deterministic code decides what is authoritative.

## What to Reuse Versus Replace

The existing app has enough useful product infrastructure that a full rebuild would add unnecessary risk. The engine and report data contracts need focused replacement, but the surrounding application should remain the starting point.

| Area | Recommendation | Rationale |
|---|---|---|
| Authentication and user flow | Reuse. | The product already has login, onboarding, and protected app routes. |
| Project creation and upload | Reuse with targeted file normalization upgrades. | The upload-first workflow matches current source-of-truth decisions. |
| Database schema | Reuse but extend. | Existing tables for projects and scenarios are useful, but need fields for existing-condition inventory, requested program, achieved-vs-requested gaps, QA status, and report artifacts. |
| `server/aiEngine.ts` | Replace. | The current engine lacks the required vision inventory, structured scenario truth, QA, and controlled rendering pipeline. |
| v10 custom program logic | Restore selectively. | The `app_fixed` archive appears to have removed the stronger custom-program path, but the approved intake model requires it. |
| Deterministic layout module | Archive as reference only. | Its row/grid placement and simplistic corridor logic are not enough for customer-facing MVP output. |
| Project Detail UI | Reuse and upgrade. | The screen already renders scenarios, budgets, schedules, and layouts, but it needs achieved-vs-requested and QA state. |
| Shared Report | Keep behind verification. | Public share is not confirmed launch scope unless tested; the current implementation may have data-shape mismatches. |
| PDF/report generation | Rebuild the data contract and final output. | The current HTML report shell is useful, but PDF/report acceptance must be proven with real data and a real plan. |
| Billing and pricing | Correct before launch. | Current artifacts show mismatches with approved $99/$149/$149-user pricing and 14-day card-required trial. |

## Development Roadmap to Marketable MVP

The roadmap should be treated as a sequence of gated milestones rather than an open-ended engineering project. The goal is to produce a real staging deployment that Stephen can use with a real office floor plan, not just fixture screenshots or local smoke tests.

| Phase | Duration | Primary outcome | High-level deliverables | Exit gate |
|---|---:|---|---|---|
| Phase 0 — Build Inputs and Gold Standard | 2–3 days | Remove ambiguity before coding. | Ten diverse test floor plans; one hand-built gold-standard report; cost/schedule benchmark table; visual style guide; room taxonomy; accepted ambiguity policy. | Stephen approves the gold-standard output as the report target. |
| Phase 1 — Engine Prototype | 5–7 days | Prove the new pipeline outside the UI. | File normalization script; vision extraction prompt; existing-condition JSON schema; requested-program schema; scenario spec generator; validation tests. | Five real plans produce usable existing-condition inventory and three valid scenario specs. |
| Phase 2 — Visual Deliverables | 5–7 days | Produce broker-credible plan visuals. | Image-generation provider interface; prompt templates; visual QA checks; compositing layer for title, legend, labels, fixed elements, and branding; retry/needs-review logic. | Three plan images per real test plan are credible enough for a leasing conversation. |
| Phase 3 — App Integration | 5–10 days | Replace current engine inside the app. | New `aiEngine` pipeline; schema migrations; scenario persistence updates; Project Detail achieved-vs-requested UI; report data contract cleanup. | A real upload completes inside the app and shows three scenarios, budgets, schedules, images, and gap reporting. |
| Phase 4 — Staging Readiness | 3–5 days | Make the product operational. | MySQL staging database; migrations applied; storage configured; AI keys configured; Stripe products/trial corrected; deployed staging URL. | End-to-end real plan test passes in staging. |
| Phase 5 — Launch Package | 3–5 days | Prepare to sell and market. | Updated homepage/pricing/trial copy; demo report; founder sales demo script; broker email sequence; first customer onboarding checklist; feedback capture loop. | Stephen can run a live demo and send a professional report to prospects. |

## Required Inputs From Stephen Before the Build Sprint

The single most important non-engineering action is to create a small, high-quality evaluation set. Without this, the team will tune against one plan and discover failure cases only after launch.

| Input package | What to provide | Why it matters | Required for build start? |
|---|---|---|---|
| Test floor plan set | 10 diverse commercial office plans, including clean PDFs, JPG/PNG exports, screenshots, and phone photos. | Vision extraction reliability depends on plan diversity. | Yes. |
| Gold-standard report | One manually assembled report showing the exact desired final output for one real plan. | It defines “done” better than verbal requirements. | Yes. |
| Room taxonomy | Approved room names, aliases, colors, and grouping rules. | Prevents inconsistent legends and report language. | Yes. |
| Cost benchmark table | Cost per SF or per-unit assumptions by market, intervention level, and category. | Budget outputs are only as trustworthy as the source table. | Yes. |
| Schedule assumptions | Standard schedule ranges by intervention level and project complexity. | Ensures scenario schedules are credible and consistent. | Yes. |
| Brand/report style | Logo, colors, fonts, title block, disclaimer language, and preferred PDF layout. | Allows deterministic report and legend generation. | Yes. |
| QA tolerance policy | Acceptable visual approximation rules and fail/needs-review rules. | Defines when the system should refuse to show a result. | Yes. |
| Staging credentials | Database, storage, Stripe, AI provider, and deployment environment credentials. | Required for real acceptance testing. | Before Phase 4. |

## Critical Acceptance Criteria

Leasibility should not be considered launch-ready because the code compiles, a demo fixture works, or a local report renders. The source-of-truth instructions correctly set a higher bar. Acceptance requires a real staging environment, a connected database, configured API keys, a real office floor plan upload, existing-condition parsing, three generated scenarios, refined architectural plan outputs, achieved-vs-requested reporting, budget and schedule generation, and review of Project Detail, Shared Report if in scope, and PDF/report output.

| Acceptance area | Required proof |
|---|---|
| Staging deployment | Public staging URL running the current branch with environment variables configured. |
| Database | MySQL-compatible `DATABASE_URL` configured and migrations applied. The app’s Drizzle config uses the `mysql` dialect and `mysql2`, so the fastest staging provider should be PlanetScale, TiDB Cloud, or another managed MySQL-compatible database. |
| Upload | Real floor plan uploaded through the application, not a fixture-only test. |
| Existing conditions | Extracted room inventory, fixed elements, reusable/repurposable zones, and ambiguity flags visible in logs or admin/debug output. |
| Scenario logic | Light Refresh, Moderate Build-Out, and Full Transformation all target the same requested program and report gaps honestly. |
| Visual output | Final images preserve the original shell/core/key fixed elements sufficiently and use Leasibility-controlled legends and labels. |
| Report output | Project Detail and final report show scenario images, room/program tables, achieved-vs-requested, budget, schedule, and disclaimers. |
| Commercial flow | Pricing, trial copy, Stripe products, checkout, and legal terms all match the approved 14-day card-required trial and current pricing. |
| Founder review | Stephen personally reviews one successful real test package before marketing launch. |

## Main Risks and Mitigations

The highest risk is not whether a model can generate a nice plan image. The highest risk is whether Leasibility can consistently produce an output that a broker trusts enough to send to a client. That requires disciplined failure handling.

| Risk | Severity | Mitigation |
|---|---:|---|
| Vision extraction misses or mislabels existing conditions. | High | Use confidence scores, ambiguity flags, and needs-review states; test on at least ten diverse plans before integration. |
| Generated images contradict authoritative counts. | High | Generate legends and counts deterministically from JSON; never rely on model-rendered legends. |
| Fixed elements drift in generated images. | High | Use fixed-canvas generation, visual QA, and compositing overlays; fail to needs-review if preservation is inadequate. |
| Budget/schedule assumptions lack credibility. | High | Source or manually approve cost/schedule benchmarks before launch; expose ranges and assumptions. |
| Current app data shapes mismatch reports. | Medium | Clean and version the scenario/report schema during Phase 3. |
| Pricing/trial mismatch undermines trust. | High | Correct site copy, onboarding, Stripe products, terms, and checkout before any paid traffic. |
| Public share appears marketed but unverified. | Medium | Keep share links out of launch promise unless tested end to end; prioritize PDF/report first. |
| Building proceeds without a gold-standard output. | High | Require Stephen-approved sample report before engineering sprint starts. |

## Immediate Next Actions

The next step should be a small but decisive implementation branch, not another broad strategy discussion. The proposed branch should be named `feature/ai-engine-pipeline-v1` and should replace the current engine with a pipeline that can be tested from the command line before being wired to the UI.

| Order | Action | Owner | Output |
|---:|---|---|---|
| 1 | Assemble the required input package, especially ten test plans and one gold-standard report. | Stephen | Approved evaluation set and sample output. |
| 2 | Create `feature/ai-engine-pipeline-v1` from the source-of-truth repo. | Developer/agent | Clean implementation branch. |
| 3 | Restore and preserve custom-program precedence from v10 where app_fixed regressed to headcount-only behavior. | Developer/agent | Dual-mode intake aligned to decisions. |
| 4 | Build the file-normalization and existing-condition vision extraction prototype. | Developer/agent | JSON extraction output for five to ten plans. |
| 5 | Build deterministic requested-program and scenario-spec schemas. | Developer/agent | Validated Light/Moderate/Full JSON specs. |
| 6 | Build image generation plus deterministic compositing. | Developer/agent | Three controlled plan visuals per test plan. |
| 7 | Integrate pipeline into app and migrate schema. | Developer/agent | Project Detail and reports use new scenario truth. |
| 8 | Configure staging database and environment variables, then apply migrations. | Developer/agent with Stephen credentials as needed | Real staging deployment. |
| 9 | Run real acceptance test with one office plan. | Stephen and developer/agent | Go/no-go decision. |
| 10 | Update pricing, trial, legal, homepage, onboarding, and Stripe products. | Developer/agent | Launch-aligned commercial funnel. |

## Market-Readiness Deliverables

To begin marketing and selling Leasibility, the deliverables must be framed around buyer confidence rather than just software completion. The first launch package should make the product easy to understand, easy to demo, and safe to test with early brokers.

| Deliverable | Definition of done |
|---|---|
| Working staging MVP | Real deployment with database, AI providers, storage, and Stripe configured. |
| Demo property package | One polished sample report based on a real or representative office floor plan. |
| Founder demo script | A five-minute walkthrough showing upload, scenarios, budget, schedule, and report export. |
| Broker pilot offer | A limited early-access offer with clear expectations, pricing, and feedback loop. |
| Sales one-pager | Concise explanation of the problem, output, pricing, and why brokers should use it. |
| Feedback instrumentation | Captures user rating, “would send to client?” answer, corrections, and plan failure reasons. |
| Support workflow | Clear path for plans that need review, fail QA, or require human cleanup. |
| Launch copy alignment | Homepage, pricing, onboarding, checkout, terms, and CRM emails all match the approved commercial model. |

## Bottom Line

Leasibility can get to market faster by adopting the Claude conversation’s core insight: stop trying to make brittle geometry reconstruction do all the work and instead build a pipeline of simple, verifiable steps. But the product should not become an ungoverned image-generation wrapper. The sellable MVP is a **structured feasibility report system** with AI-assisted floor-plan interpretation and AI-assisted visual plan generation, controlled by deterministic program truth, validation, compositing, and report logic.

If this path is executed with a real test-plan set and a gold-standard report target, the project can move from “built but not launch-aligned” to a credible staging MVP in roughly three to four focused weeks. If Phase 1 cannot reliably extract existing conditions from diverse real plans, the go/no-go decision should be made immediately and the next move should be hiring specialized technical help for vision/planning rather than continuing to iterate on prompt wording.

## References

[^current-state]: [`docs/current-state.md`](./current-state.md), Leasibility.ai Current State.
[^next-actions]: [`docs/next-actions.md`](./next-actions.md), Leasibility.ai Next Actions.
[^decisions]: [`docs/decisions.md`](./decisions.md), Leasibility.ai Decisions.
[^openai-image-edit]: [OpenAI API Reference, “Create image edit”](https://developers.openai.com/api/reference/resources/images/methods/edit/).
[^ai-skill]: Internal Manus skill guidance, `ai-product-strategy`, emphasizing human-AI boundaries, specialized model use, evals, and failure handling.
