# Deployed Visual Validation Notes — 2026-05-01

## Scope

This note records visual evidence captured from the published staging domain `https://leasestage-htnkotpf.manus.space` for the existing diagnostic project `Project #13`, titled **Staging Validation Floor Plan**. These screenshots are useful deployment evidence, but they are **not final MVP acceptance evidence** because the project appears to be a staging validation/diagnostic record rather than a customer-supplied real office floor plan test.

## Evidence Files

| Evidence | Route | File | Result |
|---|---|---|---|
| Public Shared Report | `/report/9KwglJrgRuTKTjXS21W6vttmzPm9-kHU` | `shared-report-project-13.png` | Published unauthenticated report route renders successfully. |
| Authenticated Project Detail | `/project/13` | `project-detail-13.png` and `project-detail-13-dom.html` | Published broker-facing Project Detail route renders successfully when a valid app session is present. |

## Authenticated Project Detail Findings

The Project Detail screenshot shows a visually coherent dark dashboard experience with a branded header, scenario tabs, a generated architectural plan, AI analysis copy, budget ranges, schedule forecast, share-link CTA, and PDF export CTA. The primary scenario shown is **Light Refresh**, with **78% efficiency**, a **$703K–$1.5M budget range**, an **8–16 week schedule**, and **109 rooms**. The generated plan image is visible and appears materially better than a text-only feasibility report because it gives brokers a shareable visual artifact.

The deployed page also exposes a few launch-readiness issues that should be fixed before treating the product as customer-ready. The plan card includes **“PARSER REVIEW REQUIRED”** and **“Needs Review”** language. That may be useful internally, but it can undermine client confidence if shown in broker/client-facing deliverables. The AI analysis also says remaining differences are **“fit variance, not a software failure,”** which is defensive language and should be rewritten in a more customer-facing tone. The screenshot confirms the product is deployable and reviewable, but it also confirms that report polish still matters before launch validation.

## Acceptance Implication

This evidence satisfies part of the deployment-validation workflow: the published site can render authenticated Project Detail and unauthenticated Shared Report views. It does **not** satisfy final MVP acceptance by itself. Final acceptance still requires a real deployed environment with database and API keys configured, a real office floor plan upload, existing conditions parsed, three scenarios generated, refined plan outputs visible, achieved-vs-requested reporting visible, budget and schedule visible, and Project Detail, Shared Report, and PDF/report outputs reviewed.
