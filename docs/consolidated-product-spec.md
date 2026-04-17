# Consolidated Product Specification

## Product Definition

Leasibility.ai is a **broker-first commercial real-estate feasibility platform** designed to help tenant-rep and office-leasing brokers evaluate a space quickly enough to influence a live deal. Across nearly all iterations, the durable promise is the same: a broker should be able to turn an existing floor plan and a tenant program into **decision-ready test-fit scenarios, budget guidance, schedule expectations, and exportable client materials** in minutes instead of days or weeks.

The repository contains multiple generations of this concept, but the latest archived application provides the clearest product backbone. This consolidated specification therefore treats the archived app snapshot as the current structural baseline, while incorporating later business and technical revisions where they clarify intent.

## Core User and Job-to-Be-Done

The primary user is an **individual tenant-rep broker or small brokerage team** handling office leasing deals. The core job-to-be-done is to answer feasibility questions before the competition does: whether the space works, how it could be laid out, what level of intervention is required, what it may cost, and how long it may take.

| User segment | Priority | Primary need |
|---|---|---|
| Tenant-rep and office-leasing brokers | Primary | Rapid deal support during tours and early negotiations |
| Small brokerage teams | Secondary | Shared workflows, team packaging, branded outputs |
| Large brokerages / corporate real-estate teams | Tertiary | Enterprise controls, integrations, analytics |
| Architects / consultants | Adjacent | Potential future users or partners, but not the primary launch user |

## Consolidated Product Scope

The product should be understood as six connected layers rather than a single feature.

| Layer | Consolidated scope |
|---|---|
| Funnel and acquisition | Landing page, demo flow, branded start page, onboarding survey |
| Account and identity | Authentication, broker profile, branding assets |
| Project intake | New project wizard, floor-plan upload/scan, tenant program capture |
| Analysis engine | Three scenarios with layout, room program, budget, schedule, and narrative output |
| Deliverables | In-app project detail, PDF export, public/shareable reports where supported |
| Monetization and retention | Stripe plans, trial, billing portal, referrals, lifecycle automation |

## Canonical Core Workflow

The latest app evidence supports the following canonical workflow.

1. A prospect lands on the marketing site and is encouraged to run a sample deal or start a trial.
2. The user enters a branded start/onboarding flow and creates an account.
3. The user selects or is routed into a pricing/trial path.
4. The user reaches the dashboard and creates a new project.
5. The user enters property details and tenant-program information.
6. The user uploads or scans a floor plan.
7. The app runs the analysis engine and generates three scenarios.
8. The user reviews scenario layouts, budgets, schedules, and summaries.
9. The user exports a report, shares the result, or continues managing projects and billing.

## Functional Requirements

### 1. Marketing and Pre-Product Experience

The product should maintain a conversion-oriented public experience with a **sample deal/demo path**, a **branded start page**, and a **post-signup onboarding survey**. Later documents show that the public site is not just informational; it is part of the product-led-growth motion and should be treated as an integrated acquisition system.

### 2. Authentication and Broker Identity

The app should support sign-in, redirection back into the correct app state, and a broker profile that stores at minimum the user’s identifying data and brand assets used for reports. Broker branding is important because the product’s output is not merely analytical; it is also a client-facing sales asset.

### 3. Project Creation and Intake

The project-intake flow should allow a broker to create a new project with property name, square footage, location/market, industry, headcount or program inputs, and a floor-plan asset. The latest app evidence supports a wizard-style intake flow with stepwise progression and support for either direct upload or a scan/mobile capture experience.

The repository contains disagreement about the exact programming inputs. The consolidated spec resolves that by supporting **both** of the following modes.

| Programming mode | Consolidated requirement |
|---|---|
| Headcount-based mode | User enters headcount, industry, and optionally workplace strategy guidance |
| Custom program mode | User specifies required room quantities and the engine adds ancillary/support spaces |

This dual-mode model best reconciles the later rebuild notes with the current app’s custom-program parsing logic.

### 4. File Intake

The later technical direction strongly argues that floor-plan intake should not be artificially narrow. The consolidated requirement is that the platform should accept **standard image formats and PDF floor plans**, with graceful processing rather than brittle rejection. Broader document/CAD support can remain a future extension, but the app should at minimum support the common real-world broker workflow of photos, screenshots, JPG/PNG, and PDF plans.

### 5. Analysis Output

The platform should always produce **exactly three scenarios**, because this is the most stable contract across the latest archived app and the downstream reporting system. However, the repository contains two competing conceptual models for what those three scenarios mean. The consolidated specification resolves that tension as follows:

| Dimension | Consolidated decision |
|---|---|
| Scenario framework | Use **construction-impact scenarios** as the visible output model |
| Visible scenario names | Light Refresh, Moderate Build-Out, Full Transformation |
| Optional upstream strategy input | Workplace strategy may inform the room mix, but it should not replace the three visible output scenarios |

This preserves compatibility with the current implementation while still incorporating the more strategic programming concepts from the rebuild notes.

### 6. Scenario Contents

Each scenario should contain the following output components.

| Output component | Requirement |
|---|---|
| Scenario label and impact level | Required |
| Efficiency / usable-space metric | Required |
| Room breakdown | Required |
| Layout representation | Required |
| Budget range and category breakdown | Required |
| Schedule range and phased timeline | Required |
| Narrative summary for the broker/client | Required |

### 7. Reporting and Sharing

The app should support **in-app review**, **PDF export**, and **shareable external report views** where the share infrastructure is complete. The reporting layer is a core product function because the output is intended to travel into deal conversations, not remain confined to the app dashboard.

### 8. Billing and Access Control

The product should gate premium usage through Stripe-backed plans, support a trial period, enforce usage limits where the entry plan requires them, and provide self-serve billing management. Because the repository’s pricing values conflict, pricing numbers are defined separately in `docs/consolidated-pricing.md`, but the feature model below reflects the intended packaging logic.

| Packaging logic | Consolidated requirement |
|---|---|
| Starter / entry tier | Limited monthly analyses, core workflow access |
| Professional tier | Higher or unlimited project volume, full report/export value |
| Team tier | Team-oriented packaging, shared workflows, brand controls, future collaboration extensions |
| Enterprise | High-touch custom packaging, integrations, analytics, support |

### 9. Growth and Retention Features

Later app snapshots show that referrals, join pages, changelog/onboarding touches, and CRM handoff were part of the broader operating plan. These should be considered **secondary but real product features**, not random experiments. They support the PLG-to-sales expansion strategy documented elsewhere in the repo.

## Non-Functional Requirements

The repository makes clear that product quality is judged not only by whether the app runs, but by whether its outputs are **credible in a broker-client setting**. The consolidated non-functional requirements are therefore:

| Area | Consolidated expectation |
|---|---|
| Output credibility | Floor plans, budgets, and schedules must be believable enough for live deal discussion |
| Speed | Analysis must feel fast enough to preserve the promise of “answers before anyone else” |
| Brandability | Reports must support broker branding |
| Mobile/field readiness | Intake and usage should work during tours and out-of-office workflows |
| Consistency | Pricing, copy, scenarios, and feature packaging must be aligned across app, docs, and funnel |
| Trust | Legal pages, billing clarity, and data-handling posture must support real commercial usage |

## Major Product Risks

The largest product risk is still the **space-planning output quality**. Multiple documents state that the current deterministic/SVG approach is not sufficiently architectural or realistic. Even where AI image generation was later introduced, the repo still shows unresolved concern about whether the rendered layouts truly respect uploaded plan geometry, core elements, walls, circulation, and room-program fidelity.

The second major risk is **source-of-truth drift**. Pricing, scenario logic, and feature packaging changed repeatedly without a synchronized documentation update. The product can only launch cleanly once one canonical specification is approved and reflected consistently in code and collateral.

## Final Consolidated Product Position

Leasibility.ai should be treated as a **rapid-feasibility, broker-decision platform**, not merely a floor-plan generator. Its MVP/launch product is the combination of intake, scenario generation, budget/schedule guidance, and branded reporting. The app already contains enough surrounding billing and funnel machinery to support that position, but it needs one finalized spec so the business, product, and code layers stop diverging.
