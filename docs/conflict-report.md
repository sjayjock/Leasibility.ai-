# Conflict Report

## Status Update

The major repository conflicts identified in the earlier audit have now been **resolved by Stephen**. This document remains in the repository as a record of the original decision areas, but it should no longer be treated as an open decision log. The authoritative source for all final outcomes is now `docs/decisions.md`.

## Purpose of This Document Now

This file no longer exists to keep decisions open. Its new purpose is to show **which conflict areas existed**, **how they were resolved**, and **which final direction now governs the project**.

## Resolution Summary

| # | Original conflict area | Final resolution |
|---:|---|---|
| 1 | Product stage | Built, but needs revision before launch |
| 2 | Pricing baseline | March 23 revision notes are canonical |
| 3 | Team plan model | Per-user pricing |
| 4 | Trial structure | 14-day, card-required, $0 at signup, auto-convert after trial |
| 5 | Scenario model | Hybrid: visible construction-impact scenarios plus workplace strategy as upstream input |
| 6 | Program consistency | All scenarios aim at the same program |
| 7 | Intake model | Dual-mode with headcount first by default and custom program as advanced toggle |
| 8 | File formats | PDF, JPG, PNG, GIF, WEBP, screenshots, phone photos |
| 9 | Layout strategy | Hybrid deterministic or structured truth with AI image presentation and fallback |
| 10 | Fidelity rule | Preserve perimeter and key building elements; allow more interior freedom as impact increases |
| 11 | Mobile capture posture | Upload-first for launch; scanning optional |
| 12 | Engineering path | One more Claude Code rebuild attempt before hiring a dev team |
| 13 | Share/report status | PDF export launch-ready; public-share features still in progress unless verified |
| 14 | Source of truth | Archived app code is canonical; rebuild prompts guide improvements |

## What This Means Practically

The repository no longer needs to debate foundational product direction. The major decisions are now closed. The project should move forward by aligning the running app, checkout, documentation, and testing plan to the approved decisions rather than generating additional parallel versions.

## Closed Conflict Areas

### Product stage

This is no longer an unresolved question. Leasibility.ai is treated as a built product that needs revision and testing before launch.

### Pricing and trial policy

This is now fixed. The approved pricing and trial flow must govern the website, Stripe setup, app copy, and CRM messaging with no mixed language.

### Scenario and program logic

The product now has a stable interpretation: visible construction-impact scenarios remain in place, workplace strategy influences programming upstream, and all scenarios aim for the same tenant program.

### Intake and file support

The app now has a fixed launch posture: headcount-first default intake, custom program as an advanced path, and broad practical upload support.

### Technical direction

The layout strategy is no longer open-ended. The product will use structured scenario truth with AI image presentation and fallback safety while preserving key building constraints.

### Source-of-truth governance

The archived app code is now the canonical baseline. This ends the prior ambiguity between archived code, prompt-driven redesigns, and historical planning documents.

## Remaining Work Is Execution Work, Not Decision Work

The project still has meaningful work ahead, but that work is now mostly implementation and testing work.

| Category | Current status |
|---|---|
| Executive decisions | Closed |
| Product definition | Closed |
| Technical direction | Closed |
| Commercial model | Closed |
| Rebuild and testing work | Still active |

## Final Note

Anyone reviewing this repository should read this document as a **closed issue register** rather than an active conflict tracker. For the live operating baseline, use `docs/decisions.md`, `docs/current-state.md`, `docs/next-actions.md`, and `docs/weekly-plan.md`.
