# Weekly Plan

## Purpose

This plan translates Stephen’s approved decisions into a practical Tuesday-through-Friday execution schedule for this week. The goal is to complete the full app rebuild work that is now in scope, perform full testing, and reach a clear end-of-week launch-readiness judgment.

The operating principle for the week is simple: **space planning comes first**, then pricing and trial alignment, then intake and file-support alignment, then full testing and deployment-readiness review.

## TUESDAY

### Primary outcome by 4:00 PM

A fully prepared rebuild foundation for the space-planning logic exists inside the current archived app baseline, and Claude Code has a clear implementation target with the approved decisions documented and translated into a concrete rebuild brief.

### Tuesday schedule

| Time | Task | Owner |
|---|---|---|
| 8:00–8:30 AM | Review `docs/decisions.md`, `docs/current-state.md`, and `docs/next-actions.md` together so the day starts from the approved baseline | Stephen + Manus |
| 8:30–9:30 AM | Pull the latest repo, identify the exact current app snapshot/code location to use as the working baseline, and confirm the engine files that must change first | Manus / Claude Code |
| 9:30–10:30 AM | Write the rebuild brief for the space-planning logic, including scenario rules, fidelity rules, same-program rule, and hybrid rendering strategy | Manus |
| 10:30–12:00 PM | Begin the first implementation pass on the planning engine foundation, including structured truth model, preserved-building-elements rules, and fallback assumptions | Claude Code |
| 12:00–12:30 PM | Midday review of progress, open blockers, and whether the engine direction still matches the approved decisions | Stephen + Manus |
| 12:30–2:00 PM | Continue engine foundation work and isolate the key modules or files that will control scenario generation and layout behavior | Claude Code |
| 2:00–3:00 PM | Validate that the visible scenarios remain Light Refresh, Moderate Build-Out, and Full Transformation while workplace strategy is treated as upstream input | Manus / Claude Code |
| 3:00–4:00 PM | Produce end-of-day status notes, list open issues for Wednesday, and confirm the exact next implementation targets | Manus |

### What Stephen does vs. what Manus/Claude Code handles

| Person | Responsibility |
|---|---|
| Stephen | Confirms priorities, reviews the rebuild brief, and makes any fast decisions needed to keep the day moving |
| Manus / Claude Code | Pulls the repo, inspects the current baseline, writes the rebuild brief, and starts the actual space-planning logic rebuild |

### Definition of done for Tuesday

Tuesday is complete when the rebuild baseline is confirmed, the approved planning rules are translated into a concrete implementation brief, the first foundational engine changes are underway, and the Wednesday work can begin without re-deciding the architecture.

## WEDNESDAY

### Primary outcome by 4:00 PM

The space-planning rebuild is materially advanced, and the pricing plus 14-day card-required trial alignment work has begun against the existing Stripe-connected product setup.

### Wednesday schedule

| Time | Task | Owner |
|---|---|---|
| 8:00–8:30 AM | Review Tuesday status and confirm the top three engineering targets for the day | Stephen + Manus |
| 8:30–11:00 AM | Continue the core space-planning rebuild, focusing on program consistency across scenarios, fidelity handling, and hybrid layout output behavior | Claude Code |
| 11:00–12:00 PM | Inspect current billing, checkout, and pricing logic in the app to identify where the old pricing and old trial behavior still exist | Manus |
| 12:00–12:30 PM | Midday checkpoint on whether the planning rebuild is strong enough to continue without redesigning again | Stephen + Manus |
| 12:30–2:00 PM | Begin updating pricing references to Starter $99, Professional $149, Team $149 per user, and Enterprise Contact Us in the app and related configuration | Claude Code |
| 2:00–3:00 PM | Begin trial-flow alignment to the approved model: card required, $0 charged at signup, 14-day trial, auto-convert after trial | Manus / Claude Code |
| 3:00–4:00 PM | Confirm which website, checkout, and CRM messages still need alignment on Thursday | Manus |

### What Stephen does vs. what Manus/Claude Code handles

| Person | Responsibility |
|---|---|
| Stephen | Reviews whether the rebuild direction is acceptable and confirms the pricing/trial language if any edge cases appear |
| Manus / Claude Code | Continues the engine rebuild, audits billing logic, and starts pricing and trial updates in the existing connected Stripe-based flow |

### Definition of done for Wednesday

Wednesday is complete when the rebuild is significantly advanced, the old pricing/trial mismatches are identified, and the app has begun moving to the approved pricing and 14-day trial model without creating a new Stripe account.

## THURSDAY

### Primary outcome by 4:00 PM

The space-planning rebuild is functionally complete enough for active testing, the intake flow reflects the approved dual-mode model, the upload flow supports the approved formats, and formal testing begins.

### Thursday schedule

| Time | Task | Owner |
|---|---|---|
| 8:00–8:30 AM | Review Wednesday status and lock the must-finish list for the day | Stephen + Manus |
| 8:30–10:30 AM | Finish the core space-planning implementation pass and confirm the preserved-building-elements logic is behaving correctly across scenarios | Claude Code |
| 10:30–12:00 PM | Implement or verify dual-mode intake: headcount-first default, advanced custom-program toggle, and custom-program precedence | Claude Code |
| 12:00–12:30 PM | Midday review of whether the app behavior matches the approved decisions in practice | Stephen + Manus |
| 12:30–1:30 PM | Implement or verify file support for PDF, JPG, PNG, GIF, WEBP, screenshots, and phone photos | Claude Code |
| 1:30–2:30 PM | Start structured testing of project creation, file upload, scenario generation, and output review | Manus |
| 2:30–3:30 PM | Document bugs, regression issues, and open fixes needed for Friday | Manus |
| 3:30–4:00 PM | Decide which Friday tests are mandatory for launch-readiness judgment | Stephen + Manus |

### What Stephen does vs. what Manus/Claude Code handles

| Person | Responsibility |
|---|---|
| Stephen | Reviews whether the rebuilt behavior is good enough to move into full testing and resolves any end-of-day prioritization tradeoffs |
| Manus / Claude Code | Completes the planning rebuild, aligns intake and file support, starts structured testing, and records defects |

### Definition of done for Thursday

Thursday is complete when the rebuilt planning flow is ready for real testing, the approved intake model is present, the approved file types are supported, and there is a clear bug list for Friday.

## FRIDAY

### Primary outcome by 4:00 PM

Full end-to-end testing is completed, major bugs are fixed or explicitly logged, PDF export is verified, and Stephen has a clear deployment-readiness view.

### Friday schedule

| Time | Task | Owner |
|---|---|---|
| 8:00–8:30 AM | Review the Thursday bug list and sort issues into must-fix, should-fix, and post-launch buckets | Stephen + Manus |
| 8:30–11:00 AM | Run full end-to-end testing across signup, trial, project creation, upload, scenario generation, PDF export, and billing logic | Manus |
| 11:00–12:00 PM | Fix the must-fix bugs found during testing | Claude Code |
| 12:00–12:30 PM | Midday readiness review and decision on whether more testing or bug fixing is required in the afternoon | Stephen + Manus |
| 12:30–1:30 PM | Verify PDF export output and confirm that launch-ready reporting is working as expected | Manus |
| 1:30–2:30 PM | Perform deployment-readiness checks, including copy consistency, pricing consistency, and obvious broken-flow review | Manus |
| 2:30–3:30 PM | Fix final high-priority issues or record blockers that prevent launch readiness | Claude Code |
| 3:30–4:00 PM | Write the final weekly status summary and make the go/no-go recommendation for next steps | Manus + Stephen |

### What Stephen does vs. what Manus/Claude Code handles

| Person | Responsibility |
|---|---|
| Stephen | Reviews bug severity, approves tradeoffs, and makes the final readiness judgment |
| Manus / Claude Code | Runs end-to-end testing, verifies PDF export, fixes high-priority bugs, and prepares the final readiness summary |

### Definition of done for Friday

Friday is complete when the app has been tested end to end, the most important bugs are fixed or clearly documented, PDF export is verified, and Stephen has a clear answer on whether the app is ready for deployment preparation or needs outside development help.

## End-of-Week Success Condition

This week is successful if Leasibility.ai ends Friday with four things: a materially improved space-planning engine, aligned pricing and trial behavior, the approved intake and file-support model implemented, and a documented end-to-end testing result that supports a real launch-readiness judgment.
