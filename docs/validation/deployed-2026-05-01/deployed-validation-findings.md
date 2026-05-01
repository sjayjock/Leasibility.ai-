# Deployed Validation Findings — Active Manus-Hosted Site

**Author:** Manus AI  
**Date:** 2026-05-01  
**Published domain reviewed:** `https://leasestage-htnkotpf.manus.space`  
**Evidence record:** Project `#13`, **Staging Validation Floor Plan**

## Why This Validation Was Performed

The published-site review was performed because the active Manus-hosted site is the environment that a broker, client, or reviewer would actually experience after a checkpoint is published. This was **not** intended to restart development in a separate website or declare the full Leasibility revision complete. It was a production-like validation step for the current active site so we could confirm which parts of the revision are actually visible after publish and which parts still need repair before launch-readiness acceptance.

The user's concern is valid: if the objective is a full revision and update of the current active website, then every staging or checkpoint activity must feed back into that active product path. In this workflow, the published checkpoint was used to verify the active Manus-hosted deployment, not as a substitute for completing the unfinished revision.

## Validation Results

| Area Reviewed | Evidence | Result | Launch-Readiness Interpretation |
|---|---|---|---|
| Published Shared Report route | `shared-report-project-13.png` | Pass for route rendering. The unauthenticated shared-report URL loads on the active domain. | The public report path is deployable, but content polish and final real-plan acceptance remain pending. |
| Published authenticated Project Detail route | `project-detail-13.png`, `project-detail-13-dom.html` | Pass for authenticated rendering. Project details, scenario tabs, plan visual, budget, schedule, share, and PDF CTA are visible. | The broker-facing report page is materially functional after publish. Diagnostic language has been cleaned up in source and requires re-publish/recheck. |
| Scenario coverage | DOM evidence and screenshot | Three scenario labels are present: Light Refresh, Moderate Build-Out, and Full Transformation. | Core MVP scenario structure is visible in deployed UI. |
| Budget and schedule | Screenshot and DOM evidence | Budget range and schedule forecast are visible. | Required commercial decision outputs are present. |
| Plan output | Screenshot | A deterministic architectural plan visual is visible. | Stronger than a text-only output. The visible review-state wording has been changed in source to planning-confidence language and requires re-publish/recheck. |
| PDF/report export | Visible CTA; `pdf-report-validation.json` | Pass for report generation. The app generated a hosted report URL for Project `#13`, with project name, all three scenarios, budget, schedule, and disclaimer present in the generated HTML. | The report-generation path is now validated as diagnostic/staging evidence. A final real-plan browser export review remains part of MVP acceptance. |

## Key Findings

The active published site can render both the public Shared Report route and the authenticated Project Detail route for the staging validation project. This is important because it proves that the current revision is not only compiling locally; key report surfaces are available on the active Manus-hosted domain.

The original deployed output also showed launch-readiness issues. The plan card included **“PARSER REVIEW REQUIRED”** and **“Needs Review”** in the visible client-facing plan area, and the AI analysis copy included the defensive phrase **“not a software failure.”** The source has now been updated to use professional planning-confidence language while preserving internal review-state metadata. These copy fixes still need to be re-published and visually rechecked on the active domain before being treated as deployed evidence.

## Acceptance Boundary

This deployed validation should be treated as **diagnostic deployment evidence**, not final MVP acceptance. The record reviewed is named **Staging Validation Floor Plan**, and the workflow still needs final acceptance evidence from a real deployed test using the current active site, configured database, required API keys, real office floor plan upload, existing-condition parsing, three scenario generation, refined plan outputs, achieved-vs-requested reporting, budget, schedule, Project Detail review, Shared Report review, and PDF/report review.

## Immediate Backlog Impact

The next implementation step is to re-publish the launch-readiness copy and storage-timeout fixes, then run one real-plan browser review on the active domain. The remaining acceptance boundary is not whether the diagnostic Project `#13` can render; it is whether a real uploaded office plan produces professional Project Detail, Shared Report, and PDF/report outputs with existing-conditions parsing, three scenario generation, achieved-vs-requested reporting, budget, and schedule reviewed end to end.

## Post-publish validation update — confirmed `plan.jpg` Project #4

After checkpoint `2b4a7ae0` was published to `https://leasestage-htnkotpf.manus.space`, the validation pass was repeated against the project record tied to the staged real uploaded floor-plan pathway: Project #4, `Staging Validation Floor Plan`, with share token `pvnaTy_pSUuQLNNUXk3xpVsDEcJQ_dD-`.

| Surface | Published validation result | Evidence |
| --- | --- | --- |
| Authenticated Project Detail | **Passed for the tested staging record.** The published Project Detail route loaded Project #4 and did not expose `PARSER REVIEW REQUIRED`, `Needs Review`, or `software failure` in captured HTML. | `post-publish/project-4-plan-jpg/project-detail-4.png`; `post-publish/project-4-plan-jpg/project-detail-4.html` |
| Public Shared Report | **Passed for the tested staging record.** The published Shared Report route loaded the Project #4 share token and did not expose the legacy diagnostic phrases in captured HTML. | `post-publish/project-4-plan-jpg/shared-report-4.png`; `post-publish/project-4-plan-jpg/shared-report-4.html` |
| Generated report / PDF source | **Passed for the tested staging record.** The published `pdf.generateReport` endpoint returned generated HTML and a stored report URL for Project #4. The response HTML and browser-captured stored report URL contained no legacy diagnostic phrases. | `post-publish/project-4-plan-jpg/pdf-generate-response.json`; `post-publish/project-4-plan-jpg/pdf-report-4.html`; `post-publish/project-4-plan-jpg/generated-report-url-4.png`; `post-publish/project-4-plan-jpg/generated-report-url-4.html` |

This closes the specific post-sanitization deployment-validation loop for the confirmed `plan.jpg` staging project. It should still be treated as **staging validation evidence**, not as a blanket declaration of product launch acceptance, because commercial acceptance still depends on stakeholder review of output quality, API-key configuration, and any production-domain/payment/onboarding requirements.
