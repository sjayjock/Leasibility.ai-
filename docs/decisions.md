# Leasibility.ai Decisions

## Purpose

This document records Stephen’s final decisions and establishes the approved operating baseline for Leasibility.ai. It supersedes unresolved alternatives in the earlier planning and conflict documents. Going forward, the archived application code is the canonical product baseline, the rebuild prompts serve as guidance for improvements, and older planning documents remain historical reference only.

## Executive Summary

Leasibility.ai is **already built in meaningful form**, but it requires focused revision before launch. The product will launch around visible **construction-impact scenarios** while using **workplace strategy as an upstream programming input**. The commercial model is now fixed around the **March 23 pricing revision**, with a **14-day card-required trial**, **per-user Team pricing**, and a clear requirement to align website copy, checkout behavior, and CRM messaging.

The technical direction is also now defined. The product will use a **hybrid layout strategy** in which deterministic or structured scenario truth remains authoritative, AI image generation provides presentation-quality floor-plan output, and fallback safety remains in place. The launch posture is **upload-first**, with scanning optional rather than mandatory. The immediate execution priority is one more serious rebuild attempt of the space-planning logic through Claude Code before hiring an external development team.

## Final Decisions

| # | Decision area | Final resolution |
|---:|---|---|
| 1 | Product stage | The product is built, but it needs revision before launch |
| 2 | Pricing baseline | The March 23 revision notes are canonical |
| 3 | Team plan model | Team pricing is per-user |
| 4 | Trial policy | 14-day, card-required trial with $0 charged at signup and auto-conversion after trial |
| 5 | Scenario model | Hybrid: visible construction-impact scenarios, workplace strategy as upstream input |
| 6 | Program consistency | All scenarios aim for the same program, varying by intervention and cost |
| 7 | Intake model | Dual-mode intake, with Headcount shown first and Custom Program beside it as an available option |
| 8 | Accepted file formats | PDF, JPG, PNG, GIF, WEBP, screenshots, and phone photos |
| 9 | Layout strategy | Hybrid: deterministic or structured scenario truth with AI image presentation and fallback safety |
| 10 | Fidelity rules | Preserve perimeter, stairs, elevators, core elements, window locations, and entry doors/egress; allow more interior freedom as impact increases |
| 11 | Mobile capture | Upload-first for launch, with scanning optional and the field narrative preserved in marketing |
| 12 | Engineering path | One more serious Claude Code rebuild attempt before hiring a dev team |
| 13 | Share and reports | PDF export is launch-ready; public-share features remain in progress unless verified in the running source tree |
| 14 | Source of truth | Archived app code is the canonical baseline; rebuild prompts guide improvements; all else is historical reference |

## Commercial Decisions

### Canonical Pricing

The approved pricing model is now fixed and should be treated as the only active commercial definition.

| Plan | Monthly | Annual | Notes |
|---|---:|---:|---|
| Starter | $99/mo | $990/yr | Entry plan |
| Professional | $149/mo | $1,490/yr | Main individual paid plan |
| Team | $149/user/mo | $1,490/user/yr | Explicitly per-user |
| Enterprise | Contact Us | Contact Us | Sales-led path |

The annual position should be framed as a **20% discount** and messaged in the product as a stronger annual-conversion offer. All existing website copy, checkout language, and CRM/trial messaging must be aligned to this model with no mixed wording.

### Canonical Trial Flow

The approved trial flow is also fixed.

| Trial step | Required behavior |
|---|---|
| Signup | User enters a card at signup |
| Immediate charge | $0 charged immediately |
| Trial length | 14 days |
| Conversion | Auto-converts to paid after the trial unless canceled |
| Messaging requirement | Site, checkout, CRM, and internal documentation must all match this exact flow |

## Product Decisions

### Scenario Framework

The visible output model remains the three construction-impact scenarios below.

| Visible user-facing scenario | Role |
|---|---|
| Light Refresh | Lowest-intervention scenario |
| Moderate Build-Out | Mid-level intervention scenario |
| Full Transformation | Highest-intervention scenario |

Workplace strategy remains important, but it is now formally defined as an **upstream input that influences programming**, not as the visible output scenario system.

### Programming Rules

All scenarios must aim to satisfy the **same tenant program**. Scenarios are allowed to differ in how much interior change, cost, time, and flexibility they require, but they should not represent totally different tenant needs.

### Intake Model

The intake flow will support two modes.

| Intake path | Final decision |
|---|---|
| Headcount mode | First option shown on the page |
| Custom program mode | Adjacent option shown beside Headcount |

The program page should present **Headcount** first, with **Custom Program** immediately beside it as an available option. If custom program values are entered, the custom program supersedes headcount as the controlling input. This keeps the preferred path visually first without hiding the custom path behind an advanced-toggle pattern.

### File Intake Policy

The launch product should accept the following plan inputs: **PDF, JPG, PNG, GIF, WEBP, screenshots, and phone photos**. The goal is practical broker usability rather than narrow file-type purity.

## Technical Decisions

### Layout and Rendering Strategy

The approved layout strategy is a **hybrid model**. Structured or deterministic scenario data remains the underlying truth, while AI image generation provides the polished plan output and fallback behavior remains available for resilience.

| Layer | Final role |
|---|---|
| Structured scenario truth | Source of record |
| Deterministic reasoning / layout logic | Core planning foundation |
| AI image presentation | Customer-facing floor-plan output |
| Fallback safety | Protects the workflow if image generation fails |

### Plan Fidelity Rules

Generated plans must preserve the building perimeter and key non-negotiable building elements. That includes stairs, elevators, core elements, window locations, and entry doors identified as the primary and secondary means of egress. Interior freedom may increase with scenario impact level, but the system should not behave as if it can freely invent an entirely different shell.

### Mobile Capture

The launch product is **upload-first**. Scanning remains optional and can still be referenced in marketing, but it is not the required core workflow for launch readiness.

### Engineering Path

Before hiring outside developers, the team will make **one more serious rebuild attempt** of the space-planning logic through Claude Code. This is the first major execution task for the week.

## Delivery and Repository Governance Decisions

### Reports and Sharing

PDF export is treated as launch-ready. Public-share/report-link functionality remains in progress unless it is verified directly in the running source tree.

### Source of Truth

The archived app code is the official implementation baseline. Rebuild prompts can inform future work, but they are no longer equal competitors for authority. Older documents, conflict notes, and alternative plans remain useful only as historical context.

## Operating Instruction

From this point forward, every product, technical, and documentation decision should be checked against this document first. If any working document conflicts with this file, this file wins until Stephen explicitly changes it.
