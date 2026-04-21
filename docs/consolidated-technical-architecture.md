# Consolidated Technical Architecture

## Architectural Summary

Leasibility.ai now has a defined architectural baseline. The **archived application code** is the canonical implementation reference. Rebuild prompts remain useful as guidance for improvements, but they no longer function as parallel sources of truth. Older planning documents remain historical reference only.

The product is best understood as a modern web application with a React frontend, a TypeScript/Node backend, structured scenario generation, billing integration, upload handling, reporting, and a layout/rendering subsystem that is being actively improved before launch.

## Canonical Baseline Rule

| Architecture-governance question | Approved answer |
|---|---|
| What is the implementation source of truth? | Archived app code |
| What is the role of rebuild prompts? | Improvement guidance |
| What is the role of older planning docs? | Historical reference |
| Is the app being rebuilt from scratch? | No |
| Is the app being revised from an existing baseline? | Yes |

This governance rule is important because the repository previously mixed implementation snapshots and speculative redesign instructions without a stable hierarchy.

## System Stack

The latest archived application remains the stack baseline.

| Layer | Baseline architecture |
|---|---|
| Frontend | Vite + React + TypeScript |
| Backend | Express + tRPC on Node/TypeScript |
| Data layer | Drizzle ORM with MySQL-compatible database |
| Billing | Stripe |
| Storage | S3-style object storage |
| Reporting | PDF generation/export |
| AI layer | Structured scenario generation with image-based layout presentation |

## Core Product Architecture

The application can be understood as six connected subsystems.

| Subsystem | Role |
|---|---|
| Public funnel | Landing, start flow, onboarding, and trial entry |
| Identity and account | Authentication, user state, broker profile |
| Project intake | Project creation, headcount/custom program input, file upload |
| Analysis engine | Scenario generation, budgeting, scheduling, spatial logic |
| Reporting | Project detail, PDF export, and share surfaces where verified |
| Monetization | Checkout, trial management, subscription state, billing portal |

## Approved Intake Architecture

The intake layer now has a clear product rule: it is **dual-mode**, but it defaults to the simplest path.

| Intake element | Approved architecture behavior |
|---|---|
| Default program input | Headcount-first |
| Advanced program input | Custom program toggle |
| Precedence rule | Custom program supersedes headcount when entered |
| Launch file posture | Upload-first |
| Launch scan posture | Scanning optional |

## Approved File Support

The platform should accept the following launch input types.

| File or image type | Launch status |
|---|---|
| PDF | Supported |
| JPG | Supported |
| PNG | Supported |
| GIF | Supported |
| WEBP | Supported |
| Screenshots | Supported |
| Phone photos | Supported |

The architectural principle here is practical broker usability. The system should support the formats brokers actually have available during deal work.

## Approved Scenario Architecture

The visible scenario system remains the construction-impact framework.

| Visible scenario | Architectural role |
|---|---|
| Light Refresh | Low-impact scenario |
| Moderate Build-Out | Mid-impact scenario |
| Full Transformation | High-impact scenario |

Workplace strategy is not removed from the architecture. It is repositioned as an **upstream input to programming logic** rather than as the visible scenario output system.

## Program Consistency Rule

All scenarios should target the **same tenant program**. The engine should not treat the three scenarios as three unrelated programs. Instead, the engine should use the same core program target while varying intervention level, budget, schedule, and interior flexibility.

This decision simplifies the system conceptually and makes the outputs easier to compare and explain.

## Approved Layout Strategy

The most important technical decision is the approved **hybrid layout model**.

| Layer | Final architectural role |
|---|---|
| Structured scenario data | Source of truth |
| Deterministic or rule-based planning logic | Spatial reasoning foundation |
| AI image generation | Customer-facing visual presentation |
| Fallback safety | Operational resilience if presentation generation fails |

This means Leasibility.ai should not become a pure image-generation system. The app still needs structured scenario data that can be stored, tested, exported, and rendered consistently across the product.

## Fidelity Rules for Generated Plans

The platform now has a clear spatial-preservation rule. Certain building elements are non-negotiable and must remain preserved across generated scenarios.

| Element | Required fidelity |
|---|---|
| Perimeter | Preserve |
| Stairs | Preserve |
| Elevators | Preserve |
| Core elements | Preserve |
| Window locations | Preserve |
| Entry doors / primary and secondary egress | Preserve |
| Interior change freedom | Increase as impact level rises |

The engine may allow more interior modification as it moves from Light Refresh to Full Transformation, but it should not behave as if it can invent an entirely new outer shell or ignore code-relevant circulation realities.

## Launch Output Architecture

The reporting and delivery architecture is now clarified.

| Output path | Approved status |
|---|---|
| PDF export | Launch-ready |
| Public-share/report links | Still in progress unless verified in the running codebase |

This means PDF export should be included in launch-quality testing, while share links should be treated cautiously until verified.

## Billing and Trial Architecture

The technical architecture must also align to the approved billing model.

| Billing rule | Required technical behavior |
|---|---|
| Existing Stripe account | Remains in use |
| Product/pricing objects | Must be updated to new approved pricing |
| Trial type | 14-day card-required |
| Immediate billing event | $0 charge at signup |
| Conversion behavior | Auto-convert after trial unless canceled |

This is not merely a content update. It affects checkout, Stripe configuration, app copy, and CRM alignment.

## Immediate Engineering Path

Stephen has chosen one more serious attempt at rebuilding the space-planning logic through Claude Code before hiring a development team. Technically, this means the first major workstream is an improvement effort **against the existing archived baseline**, not a greenfield rewrite.

| Engineering choice | Architectural implication |
|---|---|
| Claude Code rebuild attempt | Improve the current engine path rather than replacing the entire platform |
| Dev-team hiring later if needed | Preserves a fallback path if quality remains insufficient |
| Archived baseline retained | Protects existing product structure and integrations |

## Architectural Priority Order

The approved near-term technical priority order is now clear.

| Priority | Technical focus |
|---:|---|
| 1 | Rebuild or significantly improve the space-planning logic |
| 2 | Align pricing, checkout, and 14-day card-required trial behavior |
| 3 | Implement or confirm dual-mode intake |
| 4 | Ensure approved file-format support works reliably |
| 5 | Run full end-to-end testing, with PDF verification included |

## Final Technical Conclusion

Leasibility.ai no longer lacks architectural direction. The architecture is now governed by one baseline, one scenario model, one intake model, one fidelity rule-set, and one launch posture. The main technical challenge is execution quality: the team must now make the approved architecture real in the running app and verify that it performs reliably before launch.
