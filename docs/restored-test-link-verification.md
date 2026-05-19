# Restored Temporary Test Link Verification

Date: 2026-05-19

The previous sandbox URL became unavailable because the local sandbox-hosted server stopped. The local MariaDB service was restarted, the Leasibility app was restarted in production mode on port 3000, and the port was exposed again.

Verified URL:

https://3000-i7clmdln8uuse8cbsq86o-1606975c.us2.manus.computer/report/manual-test-report-20260518

Verification performed:

| Check | Result |
|---|---:|
| `/api/health` | Returned `{"ok":true,"service":"leasibility-ai","environment":"production"}` |
| `/report/manual-test-report-20260518` HTTP status | `200` |
| `share.getReport` tRPC API | Returned diagnostic project and 3 scenarios |
| Diagnostic report rows | 1 complete project, 3 scenarios, active share token |

Plain-English caveat: this is still a sandbox test link, not the permanent Railway deployment. It is useful for seeing the rebuilt update immediately, but it can still stop if the sandbox/server stops. The permanent website deployment remains the next step.

## Railway Dashboard Access Check

The browser is logged into Railway and opens the new-project screen. Visible options include GitHub Repository, Database, Docker Image, Function, Bucket, and Empty Project. The account shows remaining trial/credit information in the header, so creating a persistent app and database may consume Railway account resources. Human confirmation is required before provisioning billable/persistent resources.


## Shared Report Crash Fix Verification — 2026-05-19

After the user reported the `TypeError: y.map is not a function` error screen, the shared report renderer was patched to parse persisted JSON strings before calling array methods. The rebuilt production bundle was served from the same public sandbox URL and verified as follows:

| Check | Result |
|---|---|
| `/api/health` | Returned `{"ok":true,"service":"leasibility-ai","environment":"production"}` |
| `share.getReport` API | Returned 3 scenarios for token `manual-test-report-20260518` |
| Public report route | Returned HTTP `200` and served rebuilt asset bundle `index-CtomWKLv.js` |
| Headless Chromium render | Did **not** contain `An unexpected error occurred`, `TypeError`, or `This page is currently unavailable` |
| Rendered report text | Included `Space Intelligence Report`, `Diagnostic Office Floor Plan Upload`, `3 Scenarios Ready`, `Program Fit`, `Existing Conditions`, and `Achieved vs Requested` |

Verified public test URL: `https://3000-i7clmdln8uuse8cbsq86o-1606975c.us2.manus.computer/report/manual-test-report-20260518`.
