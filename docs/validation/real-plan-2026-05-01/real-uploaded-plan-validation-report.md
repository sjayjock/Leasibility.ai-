# Real Uploaded Office Plan Validation — 2026-05-01

This validation artifact uses the uploaded office floor-plan image at `/home/ubuntu/upload/plan.jpg`, copied into this repository as `docs/validation/real-plan-2026-05-01/uploaded-real-office-plan.jpg`. The validation executes the current Leasibility code path for parser fallback/confidence, requested-program generation, existing-conditions inventory, Light/Moderate/Full scenario generation, deterministic test-fit rendering, achieved-vs-requested reporting, and cost/schedule reporting.

> **Acceptance caveat:** The current parser still uses a deterministic uploaded-plan fallback rather than computer-vision extraction from the actual pixels. The uploaded image is real, and the output is generated from the app code path using that uploaded-plan flag, but category-level extraction from the drawing content remains a next repair priority.

## Input

| Field | Value |
|---|---:|
| Property | Real Uploaded Office Plan Validation |
| Market | New York |
| Total area | 11,800 SF |
| Headcount | 92 |
| Planning mode | Auto |
| Planning style | Collaborative Mix |
| Uploaded plan | docs/validation/real-plan-2026-05-01/uploaded-real-office-plan.jpg |

## Parser Result And Confidence Summary

| Parser Field | Result |
|---|---|
| Source | synthetic_rectangular_model |
| Floorplate | x=0, y=0, w=143.7, h=82.11 |
| Core/restroom/stair/elevator elements | 1 detected / protected |
| Entries / egress points | 2 detected |
| Window / glazing segments | 3 detected |
| Existing interior walls | 4 detected |
| Overall confidence | 46% |
| Review required | Yes |
| Review reasons | Uploaded plan content has not yet been machine-extracted in this V1 sandbox path; shell, core, entries, glazing, and walls are inferred placeholders requiring confirmation.; Do not treat default core/restroom/stair/elevator positions as confirmed existing conditions until the uploaded plan is reviewed.; Parser confidence is below the architectural acceptance threshold, so scenario outputs must remain needs-review until shell/core confirmation is completed. |

## Existing Conditions Inventory

| Category | Count | Est. SF | Location | Reuse Potential | Confidence | Notes |
|---|---:|---:|---|---|---:|---|
| Fixed Core / Restrooms | 1 | 431 | Fixed building core | fixed | 48% | Preserve shell, core, restrooms, stairs, elevators, and shafts in every scenario. |
| Existing private offices | 7 | 140 | Perimeter office bands | high | 46% | Likely reusable with finish refresh and furniture updates. |
| Existing conference / meeting rooms | 4 | 280 | Near core and primary circulation | high | 46% | Meeting rooms can generally remain if technology and finishes are upgraded. |
| Existing pantry / break area | 1 | 531 | Adjacent to fixed core | high | 46% | Wet-wall adjacency makes this a strong reuse candidate. |
| Existing workstation zones | 85 | 4250 | Open interior workspace fields | medium | 50% | Systems furniture is estimated at the current 50 SF planning target, with 36–64 SF treated as the acceptable workstation range. |
| Existing huddle / collaboration areas | 2 | 413 | Secondary circulation nodes | medium | 50% | Can be repurposed as focus, lounge, or informal collaboration space. |
| Geometry requiring confirmation | 1 | 944 | Uploaded plan underlay / inferred tenant area | ambiguous | 45% | Shell/core confirmation is recommended before treating this as an as-built test-fit. |
| Selective partition zones | 4 | 2124 | Interior partition field | medium | 48% | Candidate walls for selective demolition or reconfiguration in Moderate Build-Out. |
| Full interior redesign field | 1 | 7316 | Interior tenant improvement area outside fixed core | low | 45% | Full Transformation assumes these flexible zones can be rebuilt around the preserved shell/core. |

## Requested Program

| Room / Program Item | Quantity | SF Each |
|---|---:|---:|
| Open Workspace | 1 | 3950 |
| Private Office | 13 | 100 |
| Conference Room | 6 | 252 |
| Huddle Room | 6 | 100 |
| Phone Booth | 7 | 36 |
| Collaboration Zone | 4 | 120 |
| Break Room | 1 | 120 |
| Print Area | 1 | 48 |
| Reception | 1 | 120 |

## Light / Moderate / Full Scenarios

| Scenario | Impact | Efficiency | Usable SF | Budget Low | Budget Mid | Budget High | Schedule Low | Schedule Mid | Schedule High | Rendering Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Light Refresh | low | 75% | 8,850 | $649,000 | $944,000 | $1,298,000 | 8 wks | 12 wks | 16 wks | needs_review: Needs Review: this plan uses owner-confirmable rectangular geometry until uploaded shell/core extraction is verified. |
| Moderate Build-Out | medium | 82% | 9,676 | $1,298,000 | $1,829,000 | $2,478,000 | 14 wks | 20 wks | 26 wks | needs_review: Needs Review: this plan uses owner-confirmable rectangular geometry until uploaded shell/core extraction is verified. |
| Full Transformation | high | 88% | 10,384 | $2,065,000 | $2,714,000 | $3,658,000 | 22 wks | 30 wks | 40 wks | needs_review: Needs Review: this plan uses owner-confirmable rectangular geometry until uploaded shell/core extraction is verified. |

## Achieved vs Requested Program Comparison

| Scenario | Program Item | Requested | Achieved | Variance | Status | Notes |
|---|---|---:|---:|---:|---|---|
| Light Refresh | Private Offices | 13 | 10 | -3 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Light Refresh | Workstations | 92 | 0 | -92 | gap | Program item not accommodated within this scenario’s intervention level. |
| Light Refresh | Conference Rooms | 7 | 5 | -2 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Light Refresh | Phone Rooms | 7 | 5 | -2 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Light Refresh | Collaboration Areas | 10 | 6 | -4 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Light Refresh | Pantry / Break Areas | 1 | 1 | 0 | met | Requested program achieved in this scenario. |
| Light Refresh | Support Spaces | 2 | 2 | 0 | met | Requested program achieved in this scenario. |
| Moderate Build-Out | Private Offices | 13 | 12 | -1 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Moderate Build-Out | Workstations | 92 | 0 | -92 | gap | Program item not accommodated within this scenario’s intervention level. |
| Moderate Build-Out | Conference Rooms | 7 | 6 | -1 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Moderate Build-Out | Phone Rooms | 7 | 6 | -1 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Moderate Build-Out | Collaboration Areas | 10 | 9 | -1 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Moderate Build-Out | Pantry / Break Areas | 1 | 1 | 0 | met | Requested program achieved in this scenario. |
| Moderate Build-Out | Support Spaces | 2 | 2 | 0 | met | Requested program achieved in this scenario. |
| Full Transformation | Private Offices | 13 | 13 | 0 | met | Requested program achieved in this scenario. |
| Full Transformation | Workstations | 92 | 88 | -4 | partial | Fit variance remains; item is partially accommodated within this scenario’s intervention level. |
| Full Transformation | Conference Rooms | 7 | 7 | 0 | met | Requested program achieved in this scenario. |
| Full Transformation | Phone Rooms | 7 | 7 | 0 | met | Requested program achieved in this scenario. |
| Full Transformation | Collaboration Areas | 10 | 10 | 0 | met | Requested program achieved in this scenario. |
| Full Transformation | Pantry / Break Areas | 1 | 1 | 0 | met | Requested program achieved in this scenario. |
| Full Transformation | Support Spaces | 2 | 2 | 0 | met | Requested program achieved in this scenario. |

## Scenario Scope And Strategy

### Light Refresh

This 'Light Refresh' scenario is ideal for the tenant seeking rapid occupancy and minimal upfront costs, utilizing 75% of the space efficiently by largely preserving the existing floor plan. While it may not fully meet the requested program's room counts, it offers a functional space with new finishes, flooring, and furniture. This option presents the lowest cost and shortest timeline, allowing the tenant to quickly establish a presence in the New York market with a refreshed, yet largely pre-determined, layout. Light Refresh achieves approximately 22% of the requested program while minimizing demolition, new partitions, and schedule impact. Remaining differences are fit variance, not a software failure.

| Scope Field | Value |
|---|---|
| Reuse strategy | Preserve existing partitions and repurpose usable rooms with cosmetic refresh only; no interior wall demolition is assumed. |
| Retained elements | Fixed Core / Restrooms, Existing private offices, Existing conference / meeting rooms, Existing pantry / break area |
| Repurposed elements | Existing workstation zones, Existing huddle / collaboration areas |
| Reconfiguration scope | 0% interior wall demolition; Finish refresh; Furniture reconfiguration; Minor signage and technology upgrades |
| Program gaps | Private Offices: 3 not accommodated; Workstations: 92 not accommodated; Conference Rooms: 2 not accommodated; Phone Rooms: 2 not accommodated; Collaboration Areas: 4 not accommodated |
| Budget/schedule rationale | Lower budget and shorter schedule reflect high reuse and minimal demolition. |
| Plan visual | docs/validation/real-plan-2026-05-01/scenario-1-light-refresh.svg |

### Moderate Build-Out

The 'Moderate Build-Out' scenario perfectly matches the tenant's program requirements, achieving an 82% efficiency score through strategic reconfigurations. This approach involves selective demolition and new construction, allowing for a tailored layout that optimizes both collaborative and private work zones. It represents a balanced investment in cost and time, providing a highly functional and customized space without a full gut renovation. This scenario offers the tenant a well-designed office that supports their collaborative culture and growth needs effectively. Moderate Build-Out achieves approximately 27% of the requested program through targeted reconfiguration and selective reuse of existing conditions.

| Scope Field | Value |
|---|---|
| Reuse strategy | Retain high-value rooms and fixed infrastructure while selectively removing 10–30% of conflicting non-structural partitions. |
| Retained elements | Fixed Core / Restrooms, Existing private offices, Existing conference / meeting rooms, Existing pantry / break area |
| Repurposed elements | Existing workstation zones, Existing huddle / collaboration areas |
| Reconfiguration scope | 10–30% selective non-structural wall removal; New targeted partitions; MEP tie-ins at reconfigured rooms; Furniture and technology refresh |
| Program gaps | Private Offices: 1 not accommodated; Workstations: 92 not accommodated; Conference Rooms: 1 not accommodated; Phone Rooms: 1 not accommodated; Collaboration Areas: 1 not accommodated |
| Budget/schedule rationale | Mid-range budget and schedule reflect selective demolition, retained core infrastructure, and targeted build-back. |
| Plan visual | docs/validation/real-plan-2026-05-01/scenario-2-moderate-build-out.svg |

### Full Transformation

The 'Full Transformation' scenario provides the ultimate long-term solution, achieving an 88% efficiency score by completely optimizing the space for the tenant's program and future growth. This approach involves extensive demolition and a full build-out, ensuring a bespoke design that perfectly reflects the tenant's brand and collaborative culture. While it represents the highest cost and longest timeline, it yields the best long-term outcome, offering a state-of-the-art office environment. This option allows the tenant to create a truly distinctive and highly functional space in the competitive New York market. Full Transformation achieves approximately 97% of the requested program by preserving shell/core and redesigning flexible interior zones for best long-term fit.

| Scope Field | Value |
|---|---|
| Reuse strategy | Preserve shell/core only while removing 80–100% of removable interior partitions for optimal program alignment. |
| Retained elements | Fixed Core / Restrooms, Existing private offices, Existing conference / meeting rooms, Existing pantry / break area |
| Repurposed elements | Existing workstation zones, Existing huddle / collaboration areas |
| Reconfiguration scope | 80–100% removable interior wall removal; New partitions and finish package; Comprehensive MEP / IT / AV redesign; New furniture package |
| Program gaps | Workstations: 4 not accommodated |
| Budget/schedule rationale | Highest budget and longest schedule reflect full interior redesign while preserving shell and fixed core elements. |
| Plan visual | docs/validation/real-plan-2026-05-01/scenario-3-full-transformation.svg |

## Project Detail, Shared Report, And Report Artifact Review Notes

The current generated scenario payload includes the fields consumed by the Project Detail and Shared Report views: parser inventory, program-fit summary, scope summary, rendering status, room breakdown, SVG plan visual, budget range, budget breakdown, and schedule phases. The generated Markdown report in this folder is the reviewable report artifact for this validation run; it should be compared in the browser against the Project Detail and Shared Report pages after a staging database record is created from the same uploaded plan.

## Remaining Limitations And Next Repair Priorities

| Priority | Limitation | Next Repair |
|---:|---|---|
| 1 | Uploaded-plan parser uses deterministic fallback geometry and visible-plan notes instead of extracting pixel-level rooms/walls/text from the uploaded image. | Add OCR/CV extraction or an LLM vision parser that returns category-level confidence for floorplate, core, entries, windows, interior walls, and existing program labels. |
| 2 | Real staging acceptance still requires a deployed environment, configured database, and authenticated browser run that creates a Project Detail/Shared Report/PDF from this same uploaded plan. | Deploy the latest branch, apply migrations, upload this plan through the UI, and capture Project Detail, Shared Report, and PDF screenshots/artifacts. |
| 3 | Cost/schedule assumptions are centralized but not yet fully editable in an admin configuration UI. | Add a protected assumptions editor and persist market/scenario assumptions in the database. |
| 4 | Visual refinement has not re-opened the restricted WebP references; current plan visuals remain deterministic architectural SVGs. | After authorization, compare against visual references and tune line weights, legends, labels, and architectural styling without changing deterministic geometry. |
