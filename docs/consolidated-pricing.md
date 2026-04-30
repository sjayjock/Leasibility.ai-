# Consolidated Pricing

## Purpose

This document defines the **approved commercial model** for Leasibility.ai. Earlier pricing variants in the repository are now historical only. Stephen has selected the **March 23 revision-note model** as the canonical pricing and trial framework, and all website copy, checkout behavior, billing configuration, and CRM messaging should align to this document.

## Executive Summary

Leasibility.ai will launch with a four-part commercial structure: **Starter**, **Professional**, **Team**, and **Enterprise**. The Team plan is explicitly **per-user**, not a flat office tier. The trial is a **14-day card-required trial** with **$0 charged at signup** and **automatic conversion to paid** at the end of the trial unless the user cancels.

The annual offer is also fixed. The annual view should be framed as a **20% discount**, and the product experience should encourage annual conversion through clear copy and a consistent checkout path.

## Canonical Pricing Table

| Plan | Monthly price | Annual price | Commercial meaning |
|---|---:|---:|---|
| Starter | $99/mo | $990/yr | Entry plan for individual users |
| Professional | $149/mo | $1,490/yr | Core paid plan for active individual brokers |
| Team | $149/user/mo | $1,490/user/yr | Per-user plan for brokerage teams |
| Enterprise | Contact Us | Contact Us | Custom sales-led plan |

## Pricing Rules

The following rules are now fixed and should be treated as operational requirements.

| Rule | Approved decision |
|---|---|
| Pricing baseline | March 23 revision notes are canonical |
| Team-plan structure | Per-user pricing |
| Annual discount | 20% |
| Existing Stripe direction | Update the existing connected Stripe products; do not create a new Stripe account |
| Messaging requirement | Website, checkout, and CRM must all say the same thing |

## Trial Policy

The trial flow is part of the commercial model and is now fully defined.

| Trial stage | Required behavior |
|---|---|
| At signup | User enters a card |
| Immediate billing event | $0 charged immediately |
| Trial duration | 14 days |
| End of trial | Auto-converts to paid unless canceled |
| Copy alignment | No conflicting language across site, checkout, onboarding, or CRM |

This means Leasibility.ai is **not** using a no-card trial and is **not** using the older 7-day implementation found in archived code. Any references to those older flows should be updated or treated as superseded.

## Packaging Logic

The plan structure should support both self-serve entry and expansion into brokerage teams.

| Plan | Packaging role | Expected user type |
|---|---|---|
| Starter | Low-friction entry | New or occasional individual broker |
| Professional | Main individual monetization tier | Active broker using the platform consistently |
| Team | Seat-based expansion | Small brokerage team or office |
| Enterprise | Custom contract path | Larger brokerage or corporate opportunity |

The Team plan’s per-user structure is strategically important because it supports a more natural office-expansion motion than a flat plan would.

## Annual-Plan Positioning

Annual pricing should not be treated as a passive billing interval toggle. It should be treated as part of the conversion strategy.

| Annual-plan requirement | Approved direction |
|---|---|
| Discount framing | 20% off |
| Default posture | Encourage annual selection clearly |
| Checkout clarity | Make it obvious how annual pricing compares with monthly |
| Messaging consistency | Keep the same savings language everywhere |

The product does not need to keep the older inconsistent annual numbers found in prior planning documents or in archived code. Those values are now historical reference only.

## Implications for Existing Stripe Configuration

Stephen has explicitly chosen to keep the **existing connected Stripe account** and update the existing pricing configuration rather than opening a new billing environment. This means the implementation task is a **pricing migration/alignment task**, not a platform-replacement task.

| Stripe implementation implication | Meaning |
|---|---|
| Existing Stripe account remains | Do not create a new account |
| Existing products/prices must be updated | Remove mismatch with archived pricing configuration |
| Trial logic must be updated | Replace older 7-day logic with approved 14-day card-required flow |
| Customer-facing naming must match | No mixed wording between code and checkout |

## Superseded Pricing Variants

The following pricing positions should now be treated as superseded.

| Superseded version | Why it is no longer active |
|---|---|
| Earlier weekly-trial concepts | Replaced by the approved 14-day card-required trial |
| Archived code pricing with Professional at $199 | Replaced by the approved $149 Professional plan |
| Flat Team-tier interpretation | Replaced by explicit per-user Team pricing |
| Older annual-price variants | Replaced by the approved March 23 pricing set |

## Commercial Operating Standard

From this point forward, pricing should be discussed, implemented, and tested against one simple rule:

> Leasibility.ai sells **Starter, Professional, Team, and Enterprise**, with **Team priced per user** and a **14-day card-required trial that auto-converts**.

If any file, page, or automation contradicts that rule, it is out of date and should be corrected.
