# Inspection Evidence — 2026-05-05

**Author:** Manus AI  
**Purpose:** This file records the validation commands and inspected app-snapshot findings that support `docs/backend-architecture-assessment-2026-05-05.md`.

## Repository Review Order

The source-of-truth repository was cloned with `gh repo clone sjayjock/Leasibility.ai-`, and the required documents were reviewed in the project-mandated order: `docs/current-state.md`, `docs/next-actions.md`, `docs/decisions.md`, `docs/handoff.md` if present, then README/package/deployment files. No `docs/handoff.md` file was present at the start of this session.

## App Snapshot Validation

The repository contains archived application snapshots rather than a single clean live app directory. Two extracted inspection copies were compared without modifying production code.

| Snapshot | Validation command | Result | Evidence summary |
|---|---|---|---|
| Latest-looking extracted archive inspected first | `pnpm install --frozen-lockfile --ignore-scripts`; `pnpm run check` | Failed | TypeScript reported 332 parse errors concentrated in `server/aiEngine.ts` and `server/pdfRouter.ts`, including unterminated template literals and invalid escaped template syntax. |
| `leasibility-ai-FIXED-2026-03-24, 2.zip` | `pnpm install --frozen-lockfile --ignore-scripts`; `pnpm run check` | Passed | The fixed archive type-checked successfully. |
| `leasibility-ai-FIXED-2026-03-24, 2.zip` | `pnpm run build` | Passed with warnings | Vite/esbuild built successfully. Warnings referenced missing analytics placeholders and a large JavaScript chunk. |
| `leasibility-ai-FIXED-2026-03-24, 2.zip` | `pnpm run test` | Failed before tests executed | Stripe initialized at module import time and threw because `STRIPE_SECRET_KEY` was unset. |

## Backend Files Reviewed

The following implementation files were reviewed during the assessment: `server/routers.ts`, `server/aiEngine.ts`, `server/pdfRouter.ts`, `server/billingRouter.ts`, `server/stripeProducts.ts`, `server/stripeWebhook.ts`, `server/shareRouter.ts`, `server/db.ts`, `server/storage.ts`, `server/_core/imageGeneration.ts`, `drizzle/schema.ts`, `drizzle.config.ts`, `package.json`, and the client intake page.

## Key Code-Level Findings

The inspected schema persists users, broker profiles, projects, scenarios, share tokens, report views, referrals, and changelog acknowledgement. It does not persist a structured existing-conditions inventory, reusable/repurposable/fixed/ambiguous plan zones, requested-vs-achieved program rows, scenario scope items, renderer status, or a needs-review state.

The inspected planning engine creates three impact-level scenarios and can prompt an image-generation service to produce architectural-looking plan images. It still stores a generated SVG layout fallback for every scenario and does not first extract a persisted existing-conditions program inventory.

The inspected report router creates branded HTML report output and stores it via the storage helper. It includes scenario metrics, layout image/SVG, AI summary, room breakdown, budget breakdown, and schedule tables. It does not include an Achieved-vs-Requested matrix, explicit program-gap explanation, existing-condition reuse/repurpose/demo narrative, or renderer needs-review handling.

The inspected Stripe product catalog hardcodes a 7-day trial and has Professional plan amounts that do not match the approved commercial decisions in `docs/decisions.md`.
