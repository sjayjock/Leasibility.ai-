# Consolidated User Flows

## Purpose

This document consolidates the user journeys implied by the planning documents, archived application snapshots, pricing strategy materials, and technical contracts. Where the repository conflicts, the flow below favors the **latest implemented app structure** while explicitly preserving later product revisions that should influence the final design.

## Primary User Journey

The canonical journey is a **broker-led, deal-driven workflow**. A user does not arrive primarily to browse data; they arrive because they need to answer a feasibility question for a real space and a real tenant quickly enough to influence momentum in a deal.

| Stage | User intent | Consolidated platform behavior |
|---|---|---|
| Discover | Understand what Leasibility.ai does | Public site explains broker-first value proposition and offers demo/trial entry points |
| Evaluate | Decide whether the product is credible | User can run a sample deal or view outcome-driven messaging before signup |
| Start | Enter the funnel | Branded start page and onboarding route user toward signup and plan selection |
| Subscribe / trial | Gain access | User enters trial or paid path tied to pricing logic |
| Analyze | Create a real project | User creates project, uploads floor plan, defines program, and runs analysis |
| Review | Compare scenarios | User reviews three scenario outputs with layout, budget, schedule, and narrative |
| Deliver | Share results with client | User exports PDF and, where supported, shares a report link |
| Retain / expand | Continue usage and team adoption | User manages billing, referrals, projects, and future team expansion |

## Flow 1: Public Site to Demo

The latest repository direction strongly supports a **demo-first conversion path** rather than pushing every prospect directly into signup. This reflects the belief that the product must be seen before it is understood.

### Canonical flow

1. Prospect lands on the public homepage.
2. Prospect sees positioning around instant feasibility, speed, and broker advantage.
3. Prospect chooses either **Run a Sample Deal** or **Start Free Trial**.
4. If the prospect chooses the sample path, they enter a demo experience with preset scenarios and a soft gate.
5. After seeing value, the prospect is routed toward signup/trial.

### Product intent

This flow exists to reduce skepticism around the product’s core claim. The repository repeatedly implies that the user must **see a plausible result before committing**.

## Flow 2: Branded Start and Authentication

The archived funnel work indicates that authentication is not meant to feel like a generic software login. It is intended to be a branded bridge between curiosity and account creation.

### Canonical flow

1. User reaches `/start` or an equivalent branded interstitial.
2. User sees Leasibility branding, value framing, and possibly a choice between demo and signup.
3. User initiates authentication.
4. After authentication, the app redirects the user back into the correct downstream experience rather than dropping them into a dead-end or blank state.

### Consolidated requirement

Authentication must preserve **return-path continuity** so that the user lands in the correct next step, especially when entering from pricing, demo, or onboarding contexts.

## Flow 3: Onboarding and Plan Selection

The repository suggests that onboarding is both a qualification step and a conversion step. It is not merely asking for profile data; it is part of the go-to-market system.

| Onboarding element | Consolidated role |
|---|---|
| Survey questions | Capture user context and route messaging |
| CRM/GHL handoff | Feed lead and lifecycle systems |
| Plan selection | Move user into trial or paid billing path |
| Trial framing | Reinforce urgency and annual-plan logic where applicable |

### Canonical flow

1. User completes a short onboarding survey.
2. The platform captures firm/use-case context.
3. The user is routed into plan selection or checkout.
4. After successful billing/trial activation, the user lands in the app dashboard.

## Flow 4: Dashboard to New Project

Once inside the product, the dashboard should act as the broker’s working hub. The central action is creating a new feasibility project.

### Canonical flow

1. User lands on dashboard.
2. User sees project list, recent activity, and a strong CTA to create a new project.
3. User starts a wizard-style new-project flow.
4. The system gathers project basics before requiring analysis inputs.

### Consolidated design principle

This step should feel lightweight and fast, because the broker is often under active deal pressure. Any unnecessary friction in project creation weakens the product’s core promise.

## Flow 5: Project Intake and Programming

This is the most important in-product flow and also one of the most conflicted areas in the repository. The consolidated flow resolves those conflicts by allowing **two intake modes** under one umbrella.

### Step structure

| Step | User action | Consolidated requirement |
|---|---|---|
| Property basics | Enter property and market context | Capture address/name, square footage, and market data |
| Program definition | Define tenant needs | Support both headcount mode and custom-program mode |
| Floor-plan submission | Upload or scan plan | Accept images and PDFs; support mobile-friendly capture |
| Review and submit | Confirm analysis input | User initiates AI analysis |

### Programming Mode A: Headcount-Based

The user enters total square footage, headcount, and industry, with the option to supply workplace-strategy guidance. The engine then derives a room program that fits the tenant profile.

### Programming Mode B: Custom Program

The user enters exact room quantities, such as workstations, private offices, conference rooms, and huddle rooms. The engine should preserve those explicit counts as closely as possible while adding ancillary/support spaces required for a workable plan.

### Consolidated rule

The product should **not force Stephen to choose between these modes**. The repository evidence supports both, and they serve different broker use cases.

## Flow 6: Floor-Plan Upload and Scan

The repository shows a progression from narrow file handling toward broader real-world acceptance. The consolidated flow therefore assumes that a broker may submit a plan from many different contexts.

### Canonical flow

1. User uploads an image or PDF, or uses a scan/mobile-capture path.
2. The system stores the source plan.
3. The analysis pipeline uses that plan as the baseline geometry/reference where possible.
4. If input quality is weak, the system should fail gracefully rather than reject arbitrarily.

### Consolidated requirement

The upload experience should favor **practical acceptance over purity**. Brokers will often have screenshots, PDFs, phone photos, and imperfect existing plans.

## Flow 7: Analysis Run

Once inputs are complete, the platform enters the core value moment: generating scenarios.

### Canonical flow

1. User clicks analyze.
2. Backend validates subscription/usage limits.
3. Backend assembles project context, tenant program, market inputs, and floor-plan reference.
4. Analysis engine generates exactly three scenarios.
5. The system stores scenario outputs and returns the project to a completed/results state.

### Consolidated output requirement

Each analysis should return three scenarios with **layout output, room breakdown, budget ranges, schedule ranges, and narrative summary**. The visible labels should remain **Light Refresh**, **Moderate Build-Out**, and **Full Transformation**.

## Flow 8: Scenario Review

The project-detail experience should let the broker compare scenarios quickly and understand tradeoffs without leaving the page.

| Scenario review component | Purpose |
|---|---|
| Headline efficiency and usable-area metrics | Quick decision support |
| Layout image or fallback visual | Spatial understanding |
| Room breakdown | Program validation |
| Budget range / category table | Cost confidence |
| Schedule estimate / phases | Timing confidence |
| Narrative analysis | Sales-ready interpretation |

The review layer is especially important because the platform is meant to help the broker **speak confidently to a client**, not just inspect raw data.

## Flow 9: Report Export and Share

The repository indicates that the output is designed to be portable. The platform therefore needs a clean deliverable path.

### Canonical flow

1. User chooses to export or share.
2. The system generates a branded report, typically as a PDF.
3. Where sharing is active, the platform creates a public report view or link.
4. The broker sends the output to a client or uses it directly in the sales process.

### Current-state caution

Some repository artifacts suggest the share/report-view system is still partially unfinished. PDF export appears more strongly evidenced than a fully normalized public-sharing flow.

## Flow 10: Billing, Trial, and Upgrade

Billing is not separate from user experience; it sits inside the operating loop of the app.

### Canonical flow

1. User starts on a trial or initial plan.
2. The dashboard enforces access based on subscription state and usage limits.
3. If the user approaches expiry or limits, the app surfaces upgrade messaging.
4. The user can upgrade or manage billing through a self-serve billing page/portal.

### Consolidated requirement

The product should present billing as a **continuation of value**, not a disruption. This is why pricing clarity and trial consistency are critical to the overall UX.

## Flow 11: Referrals and Retention

The later app snapshots show that referrals, join pages, and referral-crediting logic were not accidental extras. They appear to be part of a deliberate growth loop.

### Canonical flow

1. Existing user visits referrals area.
2. User shares invite link.
3. Referred prospect lands on a referral-aware join path.
4. After successful signup/subscription activation, the referrer receives credit.

## Flow 12: Future / Partial Flows

The repo suggests several flows that should be treated as roadmap or partially implemented rather than canonical launch behavior.

| Future or partially evidenced flow | Status reading |
|---|---|
| Compare properties side-by-side | Planned / partially scaffolded |
| Expanded market benchmarking | Planned |
| Full public link management and detailed view histories | Planned or partially implemented |
| Enterprise integrations and APIs | Strategic future state |

## Final Consolidated Flow Principle

The entire user journey should optimize for a single behavioral outcome:

> A broker should be able to move from **interest** to **analysis** to **client-ready output** with minimal friction and high confidence.

Every major repository conflict ultimately matters because it either strengthens or weakens that journey. This consolidated flow document therefore treats speed, clarity, and broker trust as the product’s governing UX principles.
