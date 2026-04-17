# Leasibility.ai Current State

## Executive Summary

The repository is **not** a conventional single-source application repository. It is a mixed archive that combines planning documents, business-plan iterations, pricing revisions, technical prompt documents, a root production-oriented Stripe webhook file, and several ZIP snapshots of the application at different points in time. The safest reading of the repo is that **Leasibility.ai progressed from a pre-build planning phase into a partially implemented product**, but the documentation was never normalized into one canonical source of truth.

The most important practical conclusion is that there are **three overlapping states** in the repo. First, the early planning documents describe a product that is still being defined. Second, the ZIP snapshots show a much more mature web application with billing, onboarding, reporting, referrals, and a three-scenario analysis workflow. Third, later revision notes show that even after those builds, the owner was still changing pricing, positioning, upload rules, and the underlying space-planning logic.

## Repository Inventory

The top-level repository currently contains the following file mix, excluding Git internals and the temporary review workspace created during this audit.

| File type | Count | Notes |
|---|---:|---|
| DOCX | 15 | Business plans, requirements, revision notes, rebuild prompts, technical interface docs, marketing prompts |
| ZIP | 6 | Bundled project/app snapshots and layout-module package |
| PDF | 2 | Requirements/business analysis artifacts |
| TypeScript | 1 | Root `stripeWebhook.ts` |
| Markdown | 1 | Root `README.md` |
| JSON | 1 | Sample layout output |
| GIF | 1 | Example floor-plan/test-fit visual |
| Python | 4 | Audit utilities created during this review only |

## Major Repository Artifact Groups

The repository content falls into several clear groups.

| Group | What it contains | Why it matters |
|---|---|---|
| Early planning and business docs | Business plans, revised strategy docs, pre-build requirements, business analysis | These define the intended business model, product vision, and unresolved decisions |
| Implementation snapshots | Multiple zipped app builds, especially `leasibility_ai_v10_final.zip` | These are the best evidence of what was actually built |
| Technical redesign prompts | Multiple “rebuild” and “final fix” documents for the space-planning engine | These capture unresolved technical direction and repeated architecture pivots |
| Root production logic | `Leasibility.AI Test UPDATE/stripeWebhook.ts` | This shows real billing/referral automation logic outside the archived app zips |
| Standalone layout module | `leasibility-layout-module-v1` package | This isolates the deterministic test-fit engine and makes its limitations explicit |
| Marketing collateral | Marketing prompt and generic ecommerce map | These reflect demand-generation thinking but are secondary to the core product docs |

## What the Current Application Appears to Be

Based on the latest archived app snapshot and related technical documents, Leasibility.ai is a **broker-facing SaaS application for rapid office-space feasibility analysis**. Its intended workflow is to let a broker create a project, upload or scan an existing floor plan, define a tenant program, run an AI-assisted analysis, and receive three scenario outputs that combine space-planning, budget, schedule, and narrative interpretation.

The latest archived implementation indicates that the app is substantially beyond concept stage. The application stack appears to be a **Vite + React frontend**, an **Express + tRPC backend**, a **Drizzle/MySQL data layer**, **Stripe billing**, **S3-style file storage**, PDF export, and AI-based scenario generation. The packaged app also includes broker-profile handling, legal pages, a demo funnel, onboarding, referral logic, and billing management.

## Best Evidence of the Current Implemented State

The following artifacts are the strongest indicators of the current implemented product state.

| Artifact | Signal | Interpretation |
|---|---|---|
| Archived `todo.md` in `leasibility_ai_v10_final.zip` | Many features marked complete | Suggests the app reached a late-stage pre-launch build |
| `server/routers.ts` in latest app snapshot | Full project creation, upload, analysis, and plan-enforcement flow | Confirms a working backend design for the core workflow |
| `server/stripeProducts.ts` in latest app snapshot | Defined plans, features, trial settings, entitlements | Confirms real pricing was wired into code |
| `server/aiEngine.ts` in latest app snapshot | Three-scenario generation, market benchmarks, schedule logic, AI image rendering | Confirms the current analysis model is scenario-based, not just conceptual |
| Root `stripeWebhook.ts` | Subscription and referral lifecycle automation | Suggests production-grade monetization work existed outside the zip snapshots |
| Layout engine interface contract | Stable input/output contract and downstream consumers | Confirms how analysis output feeds dashboard, share page, and PDF export |

## Current Functional Scope of the Latest Archived App

The latest archived snapshot points to the following implemented or substantially implemented capabilities.

| Domain | Current-state reading |
|---|---|
| Marketing funnel | Landing page, demo page, branded start page, onboarding survey, GHL lead push |
| Authentication/app shell | Branded sign-in flow and post-auth redirection appear implemented |
| Core project workflow | Dashboard, new project wizard, upload/scan flow, analysis run, project detail view |
| Analysis output | Three scenarios with budget, schedule, room breakdown, summary, and layout rendering |
| Billing | Stripe checkout, subscription paywall, billing portal, plan enforcement |
| Reporting | PDF export and branded report generation |
| Broker identity | Broker profile, logo/photo upload, profile setup |
| Growth loops | Referral flows, join page, crediting logic, LinkedIn sharing |
| Legal/readiness | Privacy, terms, contact, security pages, PWA assets |

## What Still Appears Incomplete or Unsettled

Despite the breadth of the archived build, the repository still shows major unresolved areas. The most visible gap is the **space-planning engine itself**. Multiple documents argue that the existing SVG-based or deterministic output is not sufficiently architectural, realistic, or constraint-aware. The repository also shows open disagreement about accepted upload formats, the correct programming model, whether scenario logic should change the room program, and whether floor plans should be rendered through deterministic layout logic, AI image generation, or a hybrid approach.

The archived TODO file also leaves some roadmap items open, especially around public share/read-receipt infrastructure, expanded market data, compare-properties workflows, and a homepage tRPC JSON issue. Because later documents sometimes describe these as finished and other artifacts still mark them unfinished, these areas should be treated as **partially implemented or unverified** rather than fully complete.

## Versioning Reality Across the App Snapshots

Across the four archived application builds, the review found that most internal files are identical. Only a small set of files changed across versions.

| Internal files that materially differ across app snapshots | Why they matter |
|---|---|
| `client/src/pages/NewProject.tsx` | Programming inputs, upload flow, custom-program behavior |
| `client/src/pages/ProjectDetail.tsx` | Scenario rendering and report display |
| `client/src/pages/SharedReport.tsx` | Public report rendering |
| `server/aiEngine.ts` | Scenario logic, rendering method, program interpretation |
| `server/pdfRouter.ts` | Export behavior and floor-plan inclusion |
| `server/routers.ts` | Input schema, project creation, analysis pipeline |

This pattern suggests that the product evolved mainly through repeated iteration on the **input workflow** and the **scenario-generation/rendering layer**, not through wholesale changes to the rest of the app.

## Current Pricing State

The current pricing state is **internally inconsistent**. The latest archived code implements one pricing model, while the later revision notes propose another. Because billing affects onboarding, trial behavior, entitlements, messaging, and CRM automation, pricing should be treated as **not canonically decided**.

| Pricing layer | Current reading |
|---|---|
| Implemented code | Starter $99/mo, Professional $199/mo, Team $149/mo, annual amounts coded, 7-day trial |
| Later requested revision | Starter $99/mo, Professional $149/mo, Team $149/user/mo, Enterprise contact us, 14-day trial, 20% annual discount |
| Earlier planning docs | Additional variants including weekly trial, Team at $129/user, and different annual pricing |

## Current Product Direction

At the strategic level, the documents still align on one durable thesis: **the product exists to help tenant-rep and office-leasing brokers answer feasibility, budget, and planning questions far faster than the traditional architect-contractor cycle**. The most consistent differentiator across versions is not simply “AI,” but the promise of a **broker-first, field-ready workflow** that turns a live tour or active deal into immediate decision support.

Where the documents diverge is in **how the product should operationalize that promise**. Some documents position the three scenarios as workplace strategy modes such as Collaborative Hub, Balanced Standard, and Privacy-First. Others position the three scenarios as construction-impact options such as Light Refresh, Moderate Build-Out, and Full Transformation. The current code and interface contract follow the second model, while several later rebuild notes still argue for elements of the first model to survive as user inputs.

## Bottom-Line Current State

The current repository should be understood as an **archive of a real but not fully normalized product effort**. The app is not merely an idea; there is substantial implementation evidence. However, the repo does **not** yet provide one clean canonical product definition, one pricing system, one technical architecture decision, or one stable source tree. That is why the consolidated documents created in this audit are necessary: they establish a decision-ready operating baseline without altering the original uploaded files.
