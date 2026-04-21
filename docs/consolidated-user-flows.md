# Consolidated User Flows

## Purpose

This document defines the approved working flows for Leasibility.ai after Stephen’s decisions. The archived app code remains the baseline product structure, but the flows below clarify how the launch version should behave once the app is revised and aligned.

## Core Flow Summary

The product should move a broker through a simple sequence: understand the product, start a trial with a card on file, create a project, upload a plan, run the analysis, review three construction-impact scenarios, export a PDF, and continue using the product through a managed subscription.

| Flow stage | Approved launch behavior |
|---|---|
| Discover | User learns the broker-first value proposition |
| Start | User enters a branded signup/trial path |
| Trial activation | User adds a card, is charged $0 immediately, and starts a 14-day trial |
| Project intake | User creates a project and follows the default headcount-first flow |
| File submission | User uploads a practical plan source such as PDF, image, screenshot, or phone photo |
| Analysis | System generates three construction-impact scenarios aiming at the same tenant program |
| Review | User evaluates layout, budget, schedule, and narrative outputs |
| Deliver | User exports PDF; public share remains secondary unless verified |
| Continue | User manages billing and keeps working in the app |

## Flow 1: Public Site to Signup

The public experience should still be organized around credibility and speed. A prospect should understand that Leasibility.ai helps brokers answer feasibility questions faster than the traditional workflow.

The public path should lead naturally into signup or trial initiation. The messaging may still preserve the field-ready narrative, but the launch product should not depend on scan-first behavior to validate its value.

## Flow 2: Trial Activation

The trial flow is now fully defined and should be implemented consistently everywhere.

| Trial step | Required behavior |
|---|---|
| Account creation | User signs up |
| Billing step | User enters card details at signup |
| Immediate charge | $0 |
| Trial duration | 14 days |
| Trial end behavior | Subscription auto-converts to paid unless canceled |

This trial flow must be reflected identically in site copy, pricing pages, checkout, onboarding language, and CRM automations. There should be no remaining references to a no-card trial or a 7-day trial.

## Flow 3: Dashboard to New Project

Once inside the app, the user should reach the dashboard and start a new project quickly. The dashboard should continue acting as the user’s working hub, but the product should be optimized for action rather than browsing.

The main call to action remains **create a new project**.

## Flow 4: Project Intake

The approved intake model is dual-mode, but the product should present the preferred path first while keeping the alternative immediately visible.

| Intake mode | Approved flow behavior |
|---|---|
| Headcount mode | First option shown to the user on the page |
| Custom program mode | Adjacent option shown beside Headcount for more precise requirements |

The user should begin with the Headcount-first experience visually, while still seeing Custom Program as a direct option beside it. If the user chooses to enter a custom room program, that custom input becomes the controlling program definition and supersedes headcount.

## Flow 5: File Submission

The launch flow is **upload-first**. Scanning can remain optional and can still be discussed in the product story, but it is not the required default flow.

| Accepted file inputs | Launch behavior |
|---|---|
| PDF | Accepted |
| JPG / PNG / GIF / WEBP | Accepted |
| Screenshots | Accepted |
| Phone photos | Accepted |

The app should favor practical usability. A broker should be able to work with the plan source they actually have, not the idealized source they wish they had.

## Flow 6: Analysis Generation

Once project data and the floor-plan input are complete, the user initiates analysis. The analysis flow must generate exactly three visible scenarios.

| Visible scenario | Product meaning |
|---|---|
| Light Refresh | Lowest level of intervention |
| Moderate Build-Out | Mid-level intervention |
| Full Transformation | Highest level of intervention |

Workplace strategy may influence programming upstream, but it should not replace these visible scenarios. All three scenarios should aim at the same underlying tenant program. The differences should come from intervention, cost profile, timeline, and interior flexibility.

## Flow 7: Scenario Review

The scenario-review screen should help the broker compare options quickly and confidently.

| Review component | Purpose |
|---|---|
| Layout output | Understand how the space could work |
| Room breakdown | Confirm the tenant program |
| Budget range and breakdown | Support financial discussion |
| Schedule range and phases | Support timing discussion |
| Narrative summary | Support client communication |

The layout output should follow the approved hybrid model: structured scenario truth underneath, AI image presentation for the visible floor plan, and fallback safety where needed.

## Flow 8: Report Delivery

The launch-ready deliverable is the PDF export path.

| Delivery path | Current approved status |
|---|---|
| PDF export | Launch-ready |
| Public report sharing | Still in progress unless verified in running source tree |

The broker should be able to move from scenario review to PDF export cleanly. Public-share functionality should not be assumed to be complete unless it is directly verified in the live codebase.

## Flow 9: Subscription Continuation

After the trial begins, the user should continue working normally during the 14-day period. The product should communicate clearly that the card is already on file and that the plan will convert automatically unless the user cancels.

This means the billing flow should feel like a continuation of product value rather than a surprise event later.

## Flow 10: Ongoing Work Sessions

The app should support repeated project creation and ongoing project review. Over time, the product should encourage users to maintain a reliable rhythm: create project, run analysis, export deliverable, continue usage, and upgrade to team access where needed.

## Final Flow Principle

The approved user-flow principle is simple:

> The default path should be easy, upload-first, and Headcount-first, while still showing Custom Program beside it when the broker needs a more precise room definition.

That principle now governs intake, analysis, billing, and launch positioning across the app.
