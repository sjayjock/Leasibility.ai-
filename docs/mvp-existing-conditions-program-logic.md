# MVP Existing-Conditions Program Logic

## Status

This document is now part of the Leasibility.ai MVP rebuild scope. It records the required product-logic correction that the app must interpret the uploaded floor plan as an **existing-conditions program inventory** before generating Light Refresh, Moderate Build-Out, and Full Transformation scenarios.

## Product Principle

Leasibility.ai should not generate scenarios from a blank requested program alone. The app must first answer this question:

> What usable spaces already exist, and how close are they to the requested program?

This shifts the product from “AI makes layouts” toward a more commercially useful leasing workflow: **AI evaluates whether an existing office can be adapted to a new tenant program, how much change is required, and whether the space is worth pursuing.**

## Required Planning Sequence

The MVP planning sequence should be treated as four connected stages.

| Stage | Required behavior | Customer-facing purpose |
|---|---|---|
| Existing-conditions inventory | Extract the current usable program from the uploaded plan before scenario generation. | Establish what the space already contains. |
| Existing vs. requested comparison | Compare the extracted current program against the tenant’s requested program. | Establish fit variance before drawing scenarios. |
| Scenario generation | Generate three scenarios from the same shell and same requested program, varying intervention level. | Show the cost/time/fit tradeoff of adapting the space. |
| Report explanation | Report achieved vs. requested, program gaps, reused areas, repurposed areas, demolition/reconfiguration, budget, and schedule. | Give brokers, tenants, landlords, and investors a decision-ready feasibility output. |

## Existing-Conditions Inventory Requirements

Before scenario generation, the system should extract an existing-conditions program inventory from the uploaded floor plan. Each item should include count or area where feasible, approximate location, reuse potential, and confidence.

| Inventory item | Required treatment |
|---|---|
| Existing private offices | Count, locate, estimate size/category, and determine whether each can be reused or repurposed. |
| Existing workstations | Estimate count or capacity by zone and determine whether systems furniture can remain or be reconfigured. |
| Existing conference / meeting rooms | Count, classify by size where possible, and identify reuse potential. |
| Existing huddle rooms | Count and locate where visible. |
| Existing collaboration areas | Identify open collaboration, lounge, or informal meeting zones. |
| Existing reception | Identify whether reception exists and whether it aligns with the requested program. |
| Existing pantry / break area | Identify location, size class, and reuse potential. |
| Existing phone / focus rooms | Count and locate where visible. |
| Existing support rooms | Identify storage, IT, copy/print, mail, wellness, or other support spaces where inferable. |
| Core / restrooms / stairs / elevators | Treat as fixed constraints that must be preserved. |
| Major circulation | Identify primary circulation patterns and corridor spines where apparent. |
| Wall / partition patterns | Identify retained partition zones, likely removable partitions, and areas requiring reconfiguration. |
| Reusable zones | Mark spaces that can remain substantially intact or be repurposed with low intervention. |
| Likely demo/reconfiguration zones | Mark areas where selective demolition, new partitions, or full redesign are likely required. |
| Ambiguous areas | Flag uncertain classifications for confirmation or report caveats. |

## Scenario Logic Requirements

The scenario engine must compare **Existing Program vs. Requested Program** before generating the three user-facing scenarios. All three scenarios should continue to use the same requested tenant program, but each scenario should respond differently to the existing plan inventory.

| Scenario | Required planning logic | Program-fit expectation | Required output explanation |
|---|---|---|---|
| Light Refresh | Preserve and repurpose as much of the existing layout as possible. Minimize demolition, new partitions, and schedule impact. | This scenario does not need to hit 100% of the requested program. It should show how close the existing plan can get with limited change. | Show what was reused, what was repurposed, what was not accommodated, where program gaps remain, why cost/schedule are lower, and whether the tradeoff may be acceptable. |
| Moderate Build-Out | Retain useful existing spaces while selectively demolishing and reconfiguring targeted zones. | This scenario should aim to get close to or fully aligned with the requested program where reasonably possible. | Show retained spaces, repurposed spaces, selective demolition, new partitions, achieved program vs. requested program, and cost/schedule impacts. |
| Full Transformation | Preserve shell/core and redesign the interior for best-fit program alignment. | This scenario should usually hit the requested program unless the space is too small, constrained, or poorly shaped. | If the full requested program is still not achieved, explain that the space may not support the requested program without reducing requirements or expanding square footage. |

## Required Report Feature: Achieved vs. Requested

The report must include an **Achieved vs. Requested** table by scenario. This is core MVP scope, not a future enhancement.

| Program Item | Requested | Achieved — Light Refresh | Achieved — Moderate Build-Out | Achieved — Full Transformation |
|---|---:|---:|---:|---:|
| Private Offices | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |
| Workstations | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |
| Conference Rooms | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |
| Phone Rooms | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |
| Collaboration Areas | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |
| Pantry / Break Areas | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |
| Support Spaces | Requested count | Scenario 1 achieved count | Scenario 2 achieved count | Scenario 3 achieved count |

The report should include a short plain-English interpretation after the table. A typical format is: Light Refresh achieves a defined percentage of the requested program while minimizing demolition and schedule impact; Moderate Build-Out achieves or approaches the requested program with targeted reconfiguration; Full Transformation offers the cleanest long-term planning solution if the shell can physically support the program, but carries the highest cost and longest schedule.

## Customer-Facing Language Rules

Unmet program items should be presented as feasibility findings, not software failures.

| Avoid | Use instead |
|---|---|
| failed to place | program item not accommodated |
| layout failed | requirements not achieved in this scenario |
| unplaced rooms | program gaps |
| failure | fit variance |
| could not place | not accommodated within this scenario’s intervention level |

## Budget and Schedule Logic

Budgets and schedules should be tied directly to reuse, repurposing, demolition, and new-build scope. Light Refresh should generally carry lower cost and shorter schedule because it preserves more existing conditions. Moderate Build-Out should carry mid-level cost and schedule because it selectively reconfigures targeted areas. Full Transformation should carry the highest cost and longest schedule because it redesigns the interior while preserving shell/core.

## Fallback and Failure Rule

Customer-facing MVP output must not show fake/block fallback plans as if they are architectural test-fit plans. If parsing, inventory extraction, or architectural rendering fails, the app should show a clear needs-review state or require geometry/program confirmation instead of presenting a program block diagram as a finished plan.

## MVP Acceptance Criteria

The rebuilt MVP is only valid after Stephen can personally upload a real office plan and review three decision-ready outputs.

| Acceptance area | Passing standard |
|---|---|
| Existing-condition understanding | The app extracts a usable existing program inventory before scenario generation. |
| Same-shell scenario generation | All three scenarios preserve the same shell/core and respond to the same requested program. |
| Scenario distinction | Light Refresh, Moderate Build-Out, and Full Transformation differ based on reuse, repurpose, selective demolition, and redesign logic. |
| Program-fit reporting | The report shows achieved vs. requested by scenario and explains program gaps as fit variance. |
| Architectural plan quality | Scenario visuals resemble real architectural office test-fit plans, not program block diagrams. |
| Commercial output | Each scenario includes budget, schedule, assumptions, exclusions, and tradeoff explanation. |
| Failure behavior | If the system cannot produce a credible plan, it asks for confirmation or reports a needs-review state rather than showing a fake plan. |

## Bottom Line

This product logic is now core rebuild scope. The product should be positioned around this practical leasing question: **can this existing office work for the requested tenant program, how much change does it need, and is it worth pursuing?**
