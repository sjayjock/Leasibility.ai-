# Consolidated Product Specification

## Product Definition

Leasibility.ai is a **broker-first office-feasibility application** that is already built in meaningful form but still requires revision before launch. It is not a blank concept, and it is not a finished launch product. The approved product stage is therefore: **built, but in need of focused revision and testing before launch**.

The product’s job is to help a broker take an existing office-space opportunity and quickly answer whether the space works, what level of build-out it may require, what it may cost, how long it may take, and how to present those answers in a client-ready format.

## Product Baseline

The archived application code is now the canonical implementation baseline. Earlier planning documents remain useful as historical context, and rebuild prompts remain useful as guidance for improvements, but they no longer compete with the archived app code as equal sources of truth.

| Product baseline question | Approved answer |
|---|---|
| Is the product still pre-build? | No |
| Is the product launch-ready as-is? | No |
| What is the base implementation reference? | The archived app code |
| What is the role of rebuild prompts? | Improvement guidance |
| What is the role of older planning docs? | Historical reference |

## Primary User

The primary user remains the **tenant-rep or office-leasing broker** who needs faster feasibility answers during real deal activity. Secondary expansion users include small brokerage teams and later larger brokerage organizations.

## Core Product Promise

The product promise is to give the broker a fast, structured answer to five practical questions.

| Broker question | Product answer |
|---|---|
| Can this space work? | Scenario-based feasibility view |
| What does the plan look like? | Structured layout truth with AI image presentation |
| What will it likely cost? | Budget range and breakdown |
| How long will it take? | Schedule range and phased timeline |
| How do I present this? | PDF export and client-facing deliverables |

## Canonical Scenario Model

Stephen approved the **hybrid scenario model**. This means the visible scenario framework shown to the user remains the construction-impact model, while workplace strategy influences programming upstream.

### Visible user-facing scenarios

| Scenario | Meaning |
|---|---|
| Light Refresh | Minimal-intervention scenario |
| Moderate Build-Out | Mid-level intervention scenario |
| Full Transformation | Highest-intervention scenario |

### Upstream workplace-strategy role

Workplace strategy is still part of the product, but it is not the visible scenario system. Instead, it acts as an **input that influences the room program and planning logic before the three visible scenarios are generated**.

## Program Consistency Rule

All three scenarios must aim for the **same tenant program**. The scenario differences should come from intervention level, cost profile, and allowable interior change, not from representing entirely different tenant requirements.

| Product rule | Approved decision |
|---|---|
| Can one scenario reduce the tenant program while another expands it? | No, not as the default logic |
| What varies across scenarios? | Intervention level, interior flexibility, cost, and timeline |
| What should remain stable? | The target tenant program |

## Intake Model

The approved intake model is **dual-mode**, with a strong preference for simplicity in the default path.

| Intake path | Product behavior |
|---|---|
| Headcount mode | Default first path for most users |
| Custom program mode | Advanced toggle for users with precise room requirements |

If a user enters a custom program, the custom program supersedes headcount as the controlling input. This preserves an easy default workflow while still supporting more exact deal requirements when necessary.

## File Intake

The launch product should accept a practical set of broker-friendly file types rather than forcing narrow file purity.

| Accepted input types | Approved launch set |
|---|---|
| Documents | PDF |
| Images | JPG, PNG, GIF, WEBP |
| Practical real-world inputs | Screenshots and phone photos |

This policy supports actual brokerage behavior, where the source plan is often imperfect or comes from an email attachment, screenshot, or photographed plan set.

## Layout and Rendering Model

The approved product behavior is a **hybrid layout model**.

| Layer | Product role |
|---|---|
| Structured scenario data | Authoritative truth |
| Deterministic or rule-based planning logic | Core spatial reasoning layer |
| AI image generation | Polished customer-facing floor-plan presentation |
| Fallback behavior | Keeps the workflow functioning when presentation generation fails |

This model is important because Leasibility.ai is not merely an image generator. It is a structured feasibility tool that also needs presentation-quality output.

## Plan Fidelity Requirements

Generated plans must preserve key building constraints. The product may vary interior interventions more aggressively as scenario impact rises, but it should not behave as if the building shell is fully disposable.

| Building element | Fidelity expectation |
|---|---|
| Perimeter | Preserve |
| Stairs | Preserve |
| Elevators | Preserve |
| Core elements | Preserve |
| Window locations | Preserve |
| Entry doors / primary and secondary egress | Preserve |
| Interior partitions | Increasing freedom as scenario impact increases |

## Launch Workflow Position

The approved launch posture is **upload-first**, not scan-first. Mobile or field-scanning language can remain part of the broader story, but scanning is optional for launch rather than the defining technical dependency.

## Reporting and Sharing

PDF export is treated as launch-ready. Public-share functionality remains in progress unless it is verified directly in the running source tree.

| Output path | Approved current-state interpretation |
|---|---|
| PDF export | Launch-ready |
| Public share/report links | In progress unless verified |

## Product Priorities for the Immediate Rebuild Window

The first major product task is not a marketing rewrite or pricing experiment. It is one more serious attempt to rebuild the space-planning logic through Claude Code while keeping the archived app as the baseline system.

| Immediate priority | Why it comes first |
|---|---|
| Space-planning logic rebuild | It is the highest product-credibility risk |
| Pricing/trial alignment | It affects launch conversion and billing trust |
| Dual-mode intake implementation | It resolves a major product-design decision |
| File-format support alignment | It reduces user friction in the real workflow |
| Full testing | It determines launch readiness |

## Final Product Position

Leasibility.ai should now be understood as a **built but not yet launch-aligned broker workflow product**. The product baseline is clear, the scenario model is clear, the intake model is clear, the file policy is clear, and the layout strategy is clear. The next step is no longer figuring out what the product is. The next step is revising and testing the app so the implementation matches the approved definition.
