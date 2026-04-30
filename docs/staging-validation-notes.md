# Leasibility Staging Validation Notes

This note records the staging validation performed after restoring the Leasibility application source, aligning the database schema, and fixing the Stripe startup guard. The validated staging run used a real uploaded office floor-plan file and exercised the authenticated create, upload, analyze, project-detail, shared-report, and report-export procedures over the staging preview URL.

## Attachment Usage

The provided attachment files were located under `/home/ubuntu/upload` and were not re-opened through the file viewer. The primary real workflow input was `/home/ubuntu/upload/plan.jpg`, which was uploaded through the staging API and stored at the returned floor-plan URL for project `4`. After the primary acceptance run, every secondary test-fit attachment was also exercised through the same staging create/upload/analyze/shared-report/report-export workflow as a regression check. The secondary runs exposed that large generated scenario payloads could exceed MySQL `text` capacity, so migration `0009_widen_scenario_payload_text.sql` widens `layoutDescription`, `layoutSvg`, and `aiSummary` to `longtext`; after applying that migration, all secondary attachment runs completed successfully.

| File | Located Path | Validation Role | Verified Outcome |
|---|---|---|---|
| `plan.jpg` | `/home/ubuntu/upload/plan.jpg` | Primary real floor-plan workflow input | Uploaded, analyzed, and used to generate three scenarios for project `4`. |
| `testfit3.jpg` | `/home/ubuntu/upload/testfit3.jpg` | Secondary regression workflow input | Uploaded, analyzed, generated three scenarios, created shared report, and generated report HTML after `0009` longtext migration. |
| `Testfit2.png` | `/home/ubuntu/upload/Testfit2.png` | Secondary regression workflow input | Uploaded, analyzed, generated three scenarios, created shared report, and generated report HTML after `0009` longtext migration. |
| `TestFit1.jpeg` | `/home/ubuntu/upload/TestFit1.jpeg` | Secondary regression workflow input | Uploaded, analyzed, generated three scenarios, created shared report, and generated report HTML after `0009` longtext migration. |
| `testfit4.gif` | `/home/ubuntu/upload/testfit4.gif` | Secondary regression workflow input | Uploaded, analyzed, generated three scenarios, created shared report, and generated report HTML after `0009` longtext migration. |

## Real Workflow Validation Evidence

The extended validation script created project `4`, uploaded `/home/ubuntu/upload/plan.jpg`, ran analysis successfully, fetched project detail data, created a share token, fetched the public shared report, and generated report HTML output. The final primary validation record is stored at `/home/ubuntu/leasibility-staging/staging-validation-result.json`. Secondary evidence is captured in `/home/ubuntu/leasibility-staging/secondary-attachment-validation.log`, which records successful full workflow runs for `testfit3.jpg`, `Testfit2.png`, `TestFit1.jpeg`, and `testfit4.gif` after the longtext migration.

| Acceptance Area | Result |
|---|---|
| Real staging access | Staging preview responded and authenticated owner session calls succeeded. |
| Database connected | Application data persisted in the Manus-injected MySQL/TiDB database. |
| Real floor plan uploaded | `plan.jpg` uploaded to storage as project `4` floor plan. |
| Existing conditions parsed | Scenario records include `existingConditionsInventory` JSON and `renderingStatus` review metadata. |
| Three scenarios generated | Analysis returned `scenarioCount=3`; project detail fetched three scenarios. |
| Refined architectural output visible in data | Each scenario includes generated `layoutSvg` and persisted layout/report fields. |
| Achieved-vs-requested report visible in data | Scenario records include `programFit` JSON with requested, achieved, variance, and fit status fields. |
| Budget and schedule generated | Each scenario includes budget ranges and schedule ranges/phases. |
| Project Detail data | `projects.get` returned project status `complete` and three scenarios. |
| Shared Report data | `share.create` returned a 32-character token; `share.getReport` returned the project and three scenarios with `viewCount=1`. |
| PDF/report output | `pdf.generateReport` generated report HTML with URL `https://d2xsxph8kpxj0f.cloudfront.net/310519663143386675/hTNKotPFmSj57w8tzEZ5rt/reports/1/4-duJlbesl.html` and `htmlLength=142341`. |

## Visual Reference Usage and Remaining Review Limit

The visual reference files were located and treated as expected-output references, but they were not re-opened through the file viewer in this session. Because browser visual element extraction was unreliable during validation, the session verified the generated report and project-detail outputs at the data/API layer rather than performing a pixel-level or side-by-side visual comparison against the WebP references.

| Visual Reference | Located Path | Intended Review Scope | Current Status |
|---|---|---|---|
| `VisualReferenceReportDesktopOutputUX.webp` | `/home/ubuntu/upload/VisualReferenceReportDesktopOutputUX.webp` | Desktop shared-report/report-output visual quality | Located; manual or browser-based visual comparison remains recommended. |
| `VisualReferenceDashboardMobileUX(2).webp` | `/home/ubuntu/upload/VisualReferenceDashboardMobileUX(2).webp` | Mobile dashboard UX reference | Located; manual or browser-based visual comparison remains recommended. |
| `VisualReferenceDashboardMobileUX(3).webp` | `/home/ubuntu/upload/VisualReferenceDashboardMobileUX(3).webp` | Mobile dashboard UX reference | Located; manual or browser-based visual comparison remains recommended. |

## Known Validation Caveat

The real workflow acceptance evidence is strong for backend, storage, database, scenario generation, shared-report data, and report export generation. A final human visual review of the generated Project Detail, Shared Report, and report HTML against the provided WebP visual references is still recommended before calling the MVP visually accepted, because this session intentionally avoided re-viewing the reference images through the file viewer and browser visual extraction was unreliable.

## Environment Variable Presence Check

The staging runtime was checked for required environment variables without printing secret values. Manus-provided database, authentication, OAuth, and Forge variables are present. Stripe variables remain missing, so billing checkout and webhook processing are intentionally guarded by lazy Stripe initialization and should be configured before paid subscription testing.

| Environment Variable Group | Status | Notes |
|---|---|---|
| Database and auth (`DATABASE_URL`, `JWT_SECRET`) | Present | Used successfully for authenticated staging validation and database persistence. |
| Manus OAuth (`VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`) | Present | Used to mint a controlled staging owner session for validation. |
| Forge/LLM/storage (`BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`) | Present | Analysis and storage workflows completed successfully. |
| Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`) | Missing | Billing is not yet production/staging-ready; checkout should remain blocked until credentials are configured. |

## Stripe Billing Validation Update — 2026-04-30

The managed Stripe capability was activated for the staging project after the post-0009 checkpoint. A non-secret environment check confirmed that `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `VITE_STRIPE_PUBLISHABLE_KEY` are now present in the runtime. The initial checkout validation failed because the restored product configuration still referenced stale account-specific Stripe Price IDs from another sandbox. The checkout implementation was therefore changed to build Stripe Checkout `price_data` from the centralized Leasibility plan configuration instead of depending on hardcoded Price IDs. This keeps the plan catalog centralized in code while making staging checkout portable across managed Stripe sandboxes.

The validation script `scripts/validate-stripe-checkout.mjs` then successfully created a Stripe Checkout subscription session for the Starter monthly plan using an authenticated owner staging session. The script intentionally reports only non-secret readiness data: plan count, checkout host, and path prefix. The successful result returned `checkoutHost: "checkout.stripe.com"` and `checkoutPathPrefix: "/c/pay"`. A regression test was added in `server/leasibility.test.ts` to verify that checkout line items use portable `price_data` and do not include an account-specific `price` ID.

The Stripe sandbox still needs to be claimed in the Stripe dashboard before long-term activation, but runtime credential presence and checkout-session creation are now validated in this staging environment.
