# Consolidated Pricing

## Purpose

This document consolidates every pricing model found in the repository into a single decision-ready view. It does **not** assume that the currently coded pricing is the correct commercial strategy. Instead, it distinguishes between **implemented pricing**, **latest requested pricing**, and **earlier planning variants**, then recommends a canonical direction for Stephen to approve.

## Executive Conclusion

The repository currently contains **four materially different pricing states**. The latest app snapshot has one set of plans wired into code. The March 21 project summary recommends another. The March 23 testing/revision notes define a later “final confirmed” structure that directly contradicts the code. Earlier business-plan documents add yet another variant, including a weekly-trial concept.

The cleanest path forward is to adopt the **latest requested business model as the canonical commercial offer**, while clearly documenting that the **codebase still reflects an older billing structure** and must be updated before launch.

## Pricing Versions Found in the Repository

| Version source | Starter / entry plan | Professional | Team | Enterprise | Trial | Annual logic |
|---|---|---|---|---|---|---|
| Early business-plan variant | $99/mo | Not clearly separated in the same way | Team/custom concepts appear later | Enterprise/custom | Weekly trial concept appears in early materials | $899/yr appears in one early framing |
| Pre-build requirements / analysis phase | Entry offer still fluid | $149/mo | $129/user/mo | Custom | 14-day trial discussed | Annual discount not fully settled |
| March 21 project summary | Not clearly named as Starter | $149/mo / $1,299/yr | $129/user/mo / $1,099/user/yr | Custom | 14-day no-card trial recommended | Annual pricing explicitly recommended |
| Latest archived code | Starter $99/mo / $996/yr | $199/mo / $1,992/yr | $149/mo / $1,492/yr | Not primary in code path | 7-day trial | Roughly monthly × 12 with minor discounting logic |
| March 23 revision notes | Starter $99/mo / $990/yr | $149/mo / $1,490/yr | $149/user/mo / $1,490/user/yr | Contact Us | 14-day trial | 20% annual discount; annual should be default view |

## What the Code Currently Implements

The latest archived billing configuration shows a monetization structure that is already wired into product behavior. The active code path treats pricing as an operational reality, not just a planning exercise. The app currently appears to enforce a **Starter**, **Professional**, and **Team** plan system, with plan-gated usage logic and billing automation downstream.

| Code-implemented plan | Current implemented reading |
|---|---|
| Starter | $99 per month, annual equivalent coded separately, usage limits enforced |
| Professional | $199 per month, annual equivalent coded separately |
| Team | $149 per month, annual equivalent coded separately |
| Trial | 7 days in code |
| Entitlement logic | Plan enforcement and billing portal behavior appear integrated |

This matters because the code does not merely display prices. It also shapes **trial messaging**, **checkout behavior**, **upgrade paths**, and likely **CRM automation**. Changing pricing therefore requires coordinated updates across the product and funnel.

## What the Latest Business Revision Requests

The latest pricing instruction in the repository is materially different from the implemented code. It asks for a lower Professional monthly price, a per-user Team structure, a longer trial, stronger annual-plan emphasis, and a placeholder Enterprise tier.

| Recommended target model from latest revision notes | Value |
|---|---|
| Starter monthly | $99/mo |
| Starter annual | $990/yr |
| Professional monthly | $149/mo |
| Professional annual | $1,490/yr |
| Team monthly | $149/user/mo |
| Team annual | $1,490/user/yr |
| Enterprise | Contact Us |
| Trial | 14 days |
| Annual discount framing | 20% off / “2 months free” |
| Pricing-page default | Annual toggle on by default |

This later revision is the most launch-oriented pricing direction in the repo because it ties pricing directly to conversion mechanics, checkout order, default annual framing, and lifecycle emails.

## Major Pricing Conflicts

### 1. Professional plan price

The code implements **$199/month**, while multiple later business documents recommend **$149/month**. This is the cleanest pricing contradiction in the repository.

### 2. Team plan semantics

Some documents define Team as **per-user pricing**, while the code reads more like a **flat plan tier**. This is not a copy tweak. It changes packaging, billing objects, entitlements, and sales motion.

### 3. Trial length and checkout posture

The code reflects a **7-day trial**, while later business strategy strongly recommends **14 days**. Some documents also imply different card requirements or no-card assumptions. Trial policy therefore remains unresolved at the commercial level.

### 4. Annual pricing philosophy

The implemented annual pricing looks like a coded price table. The later revision notes insist on a deliberate conversion strategy: **20% annual discount**, **annual shown first**, and **“2 months free” framing**. This means the repo disagrees not just on numbers, but on **pricing psychology and funnel strategy**.

### 5. Enterprise positioning

Enterprise is explicit in later pricing strategy but appears less central in the implemented code path. This suggests launch execution was focused on self-serve tiers first, while business planning still expected a high-touch enterprise lane.

## Consolidated Recommendation

The recommended canonical pricing model is the **March 23 revision-note model**, because it is the latest explicit commercial instruction and is paired with funnel tactics designed to improve conversion and cash collection.

| Recommended canonical pricing | Value | Rationale |
|---|---:|---|
| Starter | $99/mo or $990/yr | Keeps entry accessible while encouraging annual conversion |
| Professional | $149/mo or $1,490/yr | Aligns with later business guidance and removes the code’s $199 friction point |
| Team | $149/user/mo or $1,490/user/yr | Preserves expansion upside and supports brokerage-team packaging |
| Enterprise | Contact Us | Keeps room for high-touch brokerage and corporate sales |
| Trial | 14 days | Better aligned with multiple strategy docs and product-led conversion logic |
| Annual framing | 20% off / 2 months free | Consistent with latest conversion-oriented revision notes |

## Operational Notes for Implementation

If this pricing recommendation is approved, the repository should treat the current code as **out of sync with the approved commercial strategy**. The pricing change is not isolated to a single file. It would require synchronized updates to plan definitions, checkout sessions, annual billing identifiers, entitlements, pricing-page copy, onboarding flow, CRM automations, trial banners, lifecycle emails, and any sales collateral.

## Decision Required from Stephen

Stephen should explicitly approve **one** canonical pricing model before any further launch work. The highest-confidence decision would be:

> Launch with **Starter $99**, **Professional $149**, **Team $149/user**, **Enterprise Contact Us**, a **14-day trial**, and **20% annual discounting shown by default**.

If Stephen prefers to keep the current coded model, that is still viable, but it should be treated as a deliberate decision to override the later revision documents rather than an accidental default.
