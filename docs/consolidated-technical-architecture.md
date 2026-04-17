# Consolidated Technical Architecture

## Architectural Summary

The repository shows a product that evolved through multiple technical phases without a single canonical architecture document. The latest archived app snapshot, the standalone layout-module package, the interface-contract document, and later rebuild prompts together reveal the current architecture more clearly than any one source alone.

The most accurate consolidated reading is that Leasibility.ai is a **web application with a modern React frontend, a TypeScript/Node backend, a relational data layer, Stripe billing, object storage for uploaded assets, and an AI-driven scenario-generation pipeline**. The largest unresolved architectural issue is the **space-planning/rendering subsystem**, where the repo contains overlapping deterministic, SVG, AI-image, and hybrid approaches.

## Current Stack Baseline

The latest archived application package indicates the following core stack.

| Layer | Consolidated architecture |
|---|---|
| Frontend | Vite + React + TypeScript |
| UI/state/query | React, TanStack Query, tRPC client, component libraries |
| Backend | Express + tRPC on Node/TypeScript |
| Database layer | Drizzle ORM with MySQL-compatible database |
| Billing | Stripe |
| File storage | S3-compatible storage for uploads and assets |
| AI services | LLM-driven scenario generation plus AI image generation |
| Reporting | Server-side PDF generation/export |

## System Domains

The app should be understood as a set of cooperating domains rather than a single monolith of undifferentiated logic.

| Domain | Responsibility |
|---|---|
| Marketing and funnel | Public site, demo, start page, onboarding survey |
| Identity and account | Authentication, user state, broker profile |
| Project intake | New-project flow, file upload/scan, program capture |
| Analysis engine | Scenario generation, program interpretation, cost and schedule logic |
| Rendering and reporting | In-app scenario display, share view, PDF export |
| Monetization | Plan definitions, checkout, billing portal, trial/usage enforcement |
| Growth loops | Referrals, share flows, notifications, CRM handoff |

## Core Analysis Data Flow

The most stable architecture in the repository is the analysis flow itself. The latest backend and interface-contract materials imply the following pipeline.

1. A user creates or updates a project record.
2. The user uploads or scans a floor plan.
3. The backend assembles project metadata such as property name, square footage, headcount, industry, market, floor-plan URL, and optional program notes/custom program metadata.
4. The analysis engine generates exactly three scenarios.
5. Scenario results are written to the database.
6. The frontend project-detail view, public share view, and PDF export all consume those stored scenarios.

This architecture is important because the interface-contract document shows that the system already depends on a **stable scenario output shape**. That contract is one of the best foundations available for future cleanup.

## Canonical Scenario Contract

The current technical baseline should keep the following contract intact.

| Contract element | Consolidated requirement |
|---|---|
| Scenario count | Exactly 3 |
| Visible labels | Light Refresh, Moderate Build-Out, Full Transformation |
| Stored data | Metrics, room breakdown, layout representation, budget, schedule, summary |
| Downstream consumers | Project-detail page, shared-report page, PDF export |

The contract document is especially valuable because it separates the **shape of the output** from the **internal implementation**. That means the engine can be improved without forcing a full reporting rewrite, as long as the output schema remains stable.

## Project Intake Architecture

The intake layer currently appears to support a wizard-style project creation flow and a backend mutation pattern that persists project metadata before or alongside analysis. The repository also shows later pressure to broaden accepted file formats and support more flexible programming modes.

The consolidated architecture should therefore support the following intake inputs.

| Input area | Consolidated technical expectation |
|---|---|
| Property metadata | Property name, size, location/market, floor number and related context |
| Tenant program | Headcount-based mode and custom-program mode |
| Floor-plan assets | Images and PDFs at minimum |
| Program modifiers | Optional workplace-strategy guidance or exact room counts |

## Current Scenario Engine Architecture

The scenario engine in the latest app snapshot combines several responsibilities inside the same analysis subsystem.

| Engine responsibility | Current-state reading |
|---|---|
| Program interpretation | LLM or logic-driven room/program generation |
| Scenario framing | Three construction-impact scenarios |
| Cost modeling | Market-sensitive benchmark tables and cost breakdowns |
| Schedule modeling | Impact-level-based schedule ranges and phases |
| Layout rendering | AI-generated image output with SVG fallback |
| Narrative output | Scenario summaries for user/client interpretation |

This architecture is functionally rich, but it also reveals why the engine became unstable as a design surface: too many conceptual decisions were changing at once.

## The Space-Planning / Rendering Conflict

The repository contains four overlapping technical approaches to layout generation.

| Approach | Where it appears | Strength | Weakness |
|---|---|---|---|
| Simple SVG layout generation | Earlier app logic and rebuild complaints | Deterministic and lightweight | Not visually or architecturally credible enough |
| Deterministic standalone layout module | Extracted `leasibility-layout-module-v1` | Transparent logic, inspectable geometry, stable API | Admitted limitations: row-based packing, weak adjacency, poor corridor logic |
| AI image generation | Later app snapshot and rebuild prompts | Visually stronger, more presentation-ready | Can hide architectural uncertainty behind rendered images |
| Hybrid image + fallback | Latest archived `aiEngine.ts` | Operational resilience | Still leaves unresolved question of what is truly authoritative |

The consolidated architecture should therefore adopt a **hybrid truth model**:

1. A deterministic or schema-grounded scenario structure remains the source of record.
2. The rendered layout image is the presentation layer, not the sole source of truth.
3. Any image rendering must continue to map back to a structured scenario output used by dashboard, share pages, and PDF export.

## Standalone Layout Module Assessment

The extracted layout-module package is useful because it documents the deterministic planning engine in isolation. It also candidly documents its own shortcomings.

| Module characteristic | Consolidated reading |
|---|---|
| Current placement model | Row-based packing with heuristic scoring |
| Corridor generation | Central spine plus optional cross-corridor |
| Room zoning | Simple perimeter vs interior logic |
| Known limitations | Weak adjacency, no reserved large-room zones, no true entry-anchored circulation, no overlap-resolution pass |
| Strategic value | Good foundation for deterministic reasoning, but not sufficient alone for high-confidence architectural output |

The module should therefore be treated as **an engine prototype or geometry substrate**, not as the finished source of architectural truth.

## Billing and Access Architecture

Billing is tightly integrated into the app’s backend behavior. The current technical architecture includes plan definitions, checkout handling, billing management, trial logic, and subscription-aware access control. The root `stripeWebhook.ts` further suggests that subscription state also affects referral crediting and external automation.

This means billing changes are architectural changes, not copy edits. Pricing drift between docs and code therefore creates real implementation risk.

## Reporting Architecture

The reporting system appears to depend on persisted scenario objects and renders them in at least three contexts.

| Consumer | Architectural role |
|---|---|
| Project detail view | Authenticated in-app scenario review |
| Shared report view | Public or semi-public shareable result view |
| PDF router/export | Branded portable report generation |

Because the reporting layer already depends on stored scenario data, preserving the scenario schema is the most important architecture-stability principle available in the current codebase.

## Current Technical Debt

The repository shows significant but understandable technical debt caused by rapid iteration.

### Source-of-truth fragmentation

The same product decision appears in multiple places: planning docs, revision notes, rebuild prompts, archived app code, and root production files. There is no single authoritative architecture document in the repo outside of what this consolidation now provides.

### Engine responsibility overload

The analysis engine currently appears to carry program interpretation, scenario logic, layout rendering, budgets, schedules, and narrative generation in one broad subsystem. That makes change management harder and amplifies regressions.

### Archive-based development history

The real application history is stored mostly as ZIP snapshots instead of one clean living source tree. This makes diffing, ownership, and confidence harder than they should be.

## Recommended Target Architecture

The consolidated target architecture should preserve what is already strong while reducing ambiguity.

| Architectural decision | Recommendation |
|---|---|
| Frontend/backend/data stack | Keep the current React + Express/tRPC + Drizzle/MySQL structure |
| Scenario contract | Keep exactly three scenarios and the current downstream schema contract |
| Programming inputs | Support both headcount-based and custom-program modes |
| Rendering strategy | Use structured scenario data as truth; rendered images remain a presentation layer |
| Engine design | Separate program generation, spatial planning, cost/schedule modeling, and rendering into clearer modules over time |
| Repository hygiene | Move from document/ZIP archive sprawl toward one maintained source tree and versioned docs |

## Final Architectural Conclusion

Leasibility.ai already has the outline of a real application architecture. The main problem is not absence of structure; it is **overlapping technical directions without a single executive decision about which one is canonical**. The strongest foundation now is the combination of the latest archived app snapshot and the explicit scenario interface contract. Future technical work should protect that contract, modularize the engine, and stop architecture drift at the pricing, workflow, and rendering layers.
