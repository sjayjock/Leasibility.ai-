# Conflict Report

## Purpose

This report identifies the major places where the repository disagrees with itself, shows the competing versions, and states the exact decisions Stephen needs to make in order to establish a single source of truth.

The conflicts below focus on the areas the repository changes most often: **pricing**, **feature scope**, **user flow**, **business strategy**, and **technical architecture**. Original files are intentionally left untouched. This report only surfaces the contradictions.

## Conflict 1: What stage is the product actually in?

The repository contains one class of documents that describe the product as still in a **pre-build / requirements-definition stage**, and another class of artifacts that show a **substantially implemented web application** already exists.

| Where the repo says one thing | Where the repo says another | Options | Decision Stephen needs to make |
|---|---|---|---|
| `CRE_Space_Intelligence_—_Pre-Build_Requirements.docx` and related duplicate / PDF versions frame many core issues as unresolved requirements | Archived app snapshots, archived `todo.md`, `server/routers.ts`, `server/stripeProducts.ts`, and root `stripeWebhook.ts` show a broad implemented app and production-style billing logic | A. Treat the app as still fundamentally pre-build. B. Treat the app as a late-stage prototype / pre-launch product that needs alignment, not reinvention. | Decide whether the company narrative is **“we are still defining the product”** or **“we have a build that needs consolidation and finishing.”** |

### Recommended resolution

Choose **Option B**. The repo clearly contains more than concept material. The safer executive reading is that Leasibility.ai is a **real but misaligned pre-launch product**, not a blank-sheet concept.

## Conflict 2: Which pricing model is canonical?

This is the clearest and most commercially important contradiction in the repository.

| Source | Pricing position |
|---|---|
| Early business-plan material | Includes early weekly-trial logic and older annual pricing variants |
| Pre-build requirements / business analysis | Professional at $149/mo, Team at $129/user/mo, custom enterprise, 14-day trial direction |
| `PROJECT_STATUS_SUMMARY.md` from March 21 archive | Professional $149/mo / $1,299/yr; Team $129/user/mo / $1,099/user/yr; 14-day no-card trial recommendation |
| Latest archived `server/stripeProducts.ts` | Starter $99/mo, Professional $199/mo, Team $149/mo, annual amounts coded, 7-day trial |
| `Leasibility, Testing and Revisiion notes 3.23.26.docx` | Starter $99/mo / $990/yr, Professional $149/mo / $1,490/yr, Team $149/user/mo / $1,490/user/yr, Enterprise Contact Us, 14-day trial, 20% annual discount |

| Options | Decision Stephen needs to make |
|---|---|
| A. Keep the code-implemented pricing as the launch pricing | Approve the current app code as the commercial source of truth |
| B. Adopt the March 21 project-summary model | Use the earlier recommended business pricing with lower annuals |
| C. Adopt the March 23 revision-note model | Treat the later revision as the final launch pricing and update code accordingly |

### Recommended resolution

Choose **Option C** unless there is a hidden sales reason to keep the current code pricing. It is the latest explicit pricing instruction and the only version tied to a full conversion strategy.

## Conflict 3: Is the Team plan flat-rate or per-user?

The documents disagree on whether the Team plan is sold as a **team tier** or as **per-user team pricing**.

| Where flat-tier behavior appears | Where per-user behavior appears | Options | Decision Stephen needs to make |
|---|---|---|---|
| Latest archived code pricing appears to define Team as a coded plan tier rather than an obviously per-seat commercial model | Business analysis, project summary, and March 23 revision notes all describe Team in per-user terms | A. Keep Team as a flat tier. B. Convert Team to per-user pricing. | Decide whether Team is a **seat-based expansion product** or a **single higher tier**. |

### Recommended resolution

Choose **per-user Team pricing** if the business goal is office expansion and multi-user economics. Choose a flat Team tier only if the launch needs to stay operationally simpler.

## Conflict 4: Is the trial 7 days or 14 days, and is it card-required or not?

| Where 7-day behavior appears | Where 14-day behavior appears | Options | Decision Stephen needs to make |
|---|---|---|---|
| Latest archived pricing/code path references a 7-day trial | Business analysis, project summary, and March 23 revision notes recommend 14 days; some materials imply a no-card trial, others reference card-required checkout | A. 7-day trial. B. 14-day no-card trial. C. 14-day card-required trial. | Decide the exact launch trial policy. |

### Recommended resolution

Choose **14-day card-required or 14-day no-card trial intentionally**, then align all copy and checkout logic. The worst outcome is a mixed message across site, checkout, and CRM.

## Conflict 5: What do the three scenarios actually represent?

This is one of the deepest product conflicts in the repo.

| Construction-impact interpretation | Workplace-strategy interpretation |
|---|---|
| Latest app snapshot, interface contract, and much of the reporting logic use **Light Refresh**, **Moderate Build-Out**, and **Full Transformation** | Multiple rebuild prompts and notes propose **Collaborative Hub**, **Balanced Standard**, and **Privacy-First** |

| Options | Decision Stephen needs to make |
|---|---|
| A. Keep visible scenarios as construction-impact choices only | Approve Light Refresh / Moderate Build-Out / Full Transformation as the canonical user-facing outputs |
| B. Replace visible scenarios with workplace-strategy choices | Reframe the product around Collaborative Hub / Balanced Standard / Privacy-First |
| C. Hybrid model | Keep the visible outputs as construction-impact scenarios, but allow workplace strategy to influence programming as an upstream input |

### Recommended resolution

Choose **Option C**. It preserves compatibility with the latest implementation while retaining the strategic value of workplace-style guidance.

## Conflict 6: Should scenarios change the program, or should every scenario attempt the same tenant program?

| Where program compromise appears | Where full-program consistency appears | Options | Decision Stephen needs to make |
|---|---|---|---|
| Some earlier logic and prompt structures imply that lower-impact scenarios may compromise the ideal room program | Later rebuild notes explicitly argue that all scenarios should attempt to hit the tenant’s required program, with scenario differences limited to construction method/cost/flexibility | A. Allow scenarios to reduce the program. B. Require all scenarios to aim for the same program, varying only intervention/cost. | Decide whether scenarios represent **different solutions to the same need** or **different levels of compromise**. |

### Recommended resolution

Choose **Option B**. It is easier to explain to customers and aligns better with the product promise of helping determine what it takes to make the space work.

## Conflict 7: What programming model should the intake flow support?

| One-mode interpretation | Two-mode interpretation |
|---|---|
| Some earlier materials frame intake around headcount and industry only | Later rebuild notes and code patches argue for both headcount mode and custom-program mode, with custom counts persisted through the backend |

| Options | Decision Stephen needs to make |
|---|---|
| A. Headcount-only intake | Simpler UI but less control |
| B. Custom-program-only intake | More precise but less lightweight |
| C. Dual-mode intake | Support both headcount-based and exact custom-program paths |

### Recommended resolution

Choose **Option C**. The repository already contains evidence for both use cases, and the dual model best reconciles the product directions.

## Conflict 8: Which file formats should the app accept for floor plans?

| Narrow input direction | Broad input direction | Options | Decision Stephen needs to make |
|---|---|---|---|
| Earlier flows appear more image-oriented | Later rebuild notes explicitly demand support for JPG, PNG, GIF, WEBP, PDF, screenshots, and broader practical inputs | A. Keep narrow image-first acceptance. B. Support common real-world image + PDF intake. C. Go broader still toward CAD-oriented support later. | Decide the launch file-acceptance policy. |

### Recommended resolution

Choose **Option B** for launch and keep CAD/deeper conversion as a later-stage enhancement.

## Conflict 9: What is the authoritative layout-generation strategy?

| Strategy | Where it appears |
|---|---|
| Simple SVG layout generation | Earlier app logic and several complaints about poor output quality |
| Deterministic layout module | Standalone `leasibility-layout-module-v1` package |
| AI image generation | Later rebuild prompts and latest archived app engine |
| Hybrid image + SVG fallback | Latest archived `server/aiEngine.ts` |

| Options | Decision Stephen needs to make |
|---|---|
| A. Deterministic/SVG-first | More inspectable, less visually compelling |
| B. AI-image-first | More visually impressive, but easier to over-promise |
| C. Hybrid model | Structured deterministic/scenario truth with AI image presentation and fallback safety |

### Recommended resolution

Choose **Option C**. It is the only direction that matches both the latest implementation and the need for structured, auditable outputs.

## Conflict 10: Should uploaded plans be preserved geometrically in all scenarios, or can the engine invent freer test fits?

| Preservation-heavy direction | Freedom-heavy direction | Options | Decision Stephen needs to make |
|---|---|---|---|
| Rebuild notes and later image-generation prompts insist on preserving perimeter, core elements, walls, windows, and uploaded plan geometry as the basis for scenario generation, especially in Light Refresh and Moderate Build-Out | Earlier/generic planning logic and weak deterministic outputs sometimes behave more like synthetic diagrams than faithful plan overlays | A. Require strict existing-conditions fidelity. B. Allow looser synthetic planning. C. Use fidelity by default, with more freedom only as scenario impact increases. | Decide the realism standard for generated plans. |

### Recommended resolution

Choose **Option C**. It best fits the visible scenario logic and user expectations.

## Conflict 11: Is the product a mobile-first capture tool, or is capture optional?

| Mobile-first emphasis | De-risked upload-first emphasis | Options | Decision Stephen needs to make |
|---|---|---|---|
| Several business and product docs emphasize field capture/mobile scanning as a key moat | The business-analysis report recommends making scanning optional in the MVP and using uploaded plans as the default to reduce technical risk | A. Make scan/capture central at launch. B. Make upload-first the default and scanning optional. | Decide how aggressive the launch scope should be. |

### Recommended resolution

Choose **Option B** for launch discipline, while still preserving the broker-field narrative in marketing.

## Conflict 12: Is the project primarily a one-agent build, or should it be staffed as a real engineering effort?

| Solo/agent-heavy implication | Team-based execution recommendation | Options | Decision Stephen needs to make |
|---|---|---|---|
| Some repository materials implicitly treat the build as if it can be fully driven through iterative prompt-based implementation | The business-analysis report explicitly recommends 2–3 engineers or a specialist agency and warns that layout-generation quality is too complex to rely on lightweight implementation alone | A. Continue primarily ad hoc prompt-driven iteration. B. Staff a small engineering effort around the canonical spec. | Decide the execution model for finishing the product. |

### Recommended resolution

Choose **Option B**. The repository already shows the costs of too many overlapping prompt-led iterations without a final canonical owner.

## Conflict 13: Are share/report-read-receipt features complete or still roadmap?

| Complete-looking evidence | Incomplete-looking evidence | Options | Decision Stephen needs to make |
|---|---|---|---|
| Some later product narratives assume shareable reports and client-facing output are part of the system | Archived TODO still marks share tokens, report views, and related APIs as open items | A. Treat sharing as launched. B. Treat PDF export as launch-ready and public-share features as still in progress. | Decide what counts as launch-ready today. |

### Recommended resolution

Choose **Option B** unless the share flows are verified directly in the running source tree.

## Conflict 14: Are there one or three current sources of truth for technical decisions?

The repository currently spreads technical truth across three places: archived app code, standalone engine package, and narrative rebuild prompts.

| Source | Role |
|---|---|
| Archived app snapshot | Best evidence of what was actually implemented |
| Standalone layout module | Best evidence of deterministic engine mechanics and limitations |
| Rebuild prompts / fix notes | Best evidence of intended changes and dissatisfaction with the current state |

| Options | Decision Stephen needs to make |
|---|---|
| A. Let all three continue to coexist informally | Continue current drift |
| B. Choose one canonical product/engineering baseline and treat the others as historical reference only | Create an actual operating source of truth |

### Recommended resolution

Choose **Option B** immediately.

## Highest-Priority Decisions Stephen Should Make First

| Priority | Decision |
|---:|---|
| 1 | Approve the canonical pricing, trial, and Team-plan semantics |
| 2 | Approve the canonical scenario model: construction-impact, workplace-strategy, or hybrid |
| 3 | Approve the canonical programming-input model: headcount, custom, or dual-mode |
| 4 | Approve the canonical floor-plan rendering strategy: deterministic, AI image, or hybrid |
| 5 | Approve whether launch scope is upload-first with optional scan, or truly mobile-first from day one |
| 6 | Approve one canonical implementation baseline and stop adding parallel versions |

## Final Assessment

The repository’s problem is **not lack of effort**. It is **accumulated decision overlap**. The good news is that most conflicts are now legible. If Stephen approves the six priority decisions above, the project can move from an archive of iterations into a coherent launch program.
