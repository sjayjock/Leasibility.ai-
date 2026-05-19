# Leasibility AI — GoHighLevel Setup Guide

This document contains everything needed to configure the Leasibility AI sub-account in GHL.
The inbound webhook is already wired in the app at:
`https://services.leadconnectorhq.com/hooks/sQg9E2lBwpVttgGHw6zq/webhook-trigger/e0df065b-1cf7-41b9-b8ca-8aa973d7dec1`

---

## 1. Sub-Account Branding

**Settings → Business Profile**

| Field | Value |
|---|---|
| Business Name | Leasibility AI |
| Website | https://leasibility.com |
| Email | hello@leasibility.ai |
| Phone | (your number) |
| Industry | Real Estate |
| Timezone | Your local timezone |

**Settings → Email Services**
- From Name: `Leasibility AI`
- From Email: `hello@leasibility.ai`
- Reply-To: `hello@leasibility.ai`

---

## 2. Custom Contact Fields

Go to **Settings → Custom Fields → Contacts** and create these fields:

| Field Label | Field Key | Type |
|---|---|---|
| Onboarding Role | `onboarding_role` | Text |
| Deal Volume | `onboarding_deal_volume` | Text |
| Primary Market | `onboarding_market` | Text |
| Pain Points | `onboarding_pain_points` | Text |
| Plan Selected | `plan_selected` | Text |
| Lead Source | `source` | Text |
| Trial Start Date | `trial_start_date` | Date |
| Checkout Completed | `checkout_completed` | Checkbox |

---

## 3. Contact Tags

Go to **Settings → Tags** and create these tags:

- `leasibility-ai` — all contacts from the app
- `trial-started` — completed onboarding survey, entered checkout
- `checkout-completed` — card captured, trial active
- `trial-expired` — trial ended, no upgrade
- `paid-starter` — on Starter plan
- `paid-professional` — on Professional plan
- `paid-team` — on Team plan
- `demo-completed` — ran the sample deal demo
- `survey-abandoned` — started survey but did not complete
- `high-volume` — 16+ deals/year (priority segment)
- `solo-broker` — solo tenant rep
- `team-lead` — principal or team lead

---

## 4. Pipeline Stages

Go to **CRM → Pipelines → Create Pipeline**

**Pipeline Name:** Leasibility AI Sales

| Stage | Description |
|---|---|
| 1. Demo Viewed | Ran the sample deal on /demo |
| 2. Survey Started | Began onboarding survey |
| 3. Survey Completed | Finished survey, entered checkout |
| 4. Trial Active | Card captured, in 7-day trial |
| 5. Trial Expired | Trial ended, no upgrade |
| 6. Paid Customer | Active subscription |
| 7. Churned | Cancelled subscription |

---

## 5. Email Sequences (4-Email Drip)

### Workflow: "Leasibility AI — Trial Drip"
**Trigger:** Contact tag added = `trial-started`

---

### Email 1 — Day 0 (Send Immediately)

**Subject:** Your deal analysis portal is ready

**Body:**
```
Hi {{contact.first_name}},

Your Leasibility AI account is live.

Here's what you can do right now:

→ Upload a floor plan or enter square footage
→ Get 2 AI-generated test-fit scenarios in under 60 seconds
→ See budget ranges and project timelines — ready to share with your client

[Open Your Portal →] https://leasibility.com/dashboard

This is the tool brokers are using to walk into tours with answers instead of guesses.

If you run into anything, just reply to this email. I read every one.

— The Leasibility AI Team
```

---

### Email 2 — Day 1

**Subject:** How brokers are using this to win clients

**Body:**
```
Hi {{contact.first_name}},

Here's a real scenario:

A tenant rep broker in Dallas was touring a 12,000 sq ft space with a 45-person tech company.

The client asked: "What would a full build-out cost us?"

Old answer: "I'll get back to you on that."
New answer: Pull out the phone. Upload the floor plan. 60 seconds later — two scenarios, budget ranges, timeline estimates. Branded PDF ready to send.

The client signed the LOI two days later.

That's what Leasibility AI is built for — turning your site tour into a closing moment.

[Run Your First Analysis →] https://leasibility.com/new

— The Leasibility AI Team
```

---

### Email 3 — Day 3

**Subject:** Save 3+ hours on your next deal

**Body:**
```
Hi {{contact.first_name}},

The average tenant rep broker spends 3–5 hours per deal pulling together budget estimates, coordinating with project managers, and formatting client-ready documents.

With Leasibility AI, that workflow looks like this:

1. Tour the space (or upload the floor plan)
2. Enter headcount and preferences
3. Get two AI-generated scenarios with:
   - Space layout recommendations
   - Budget ranges based on national benchmarks
   - Estimated project timelines
   - A branded PDF ready to send

Total time: under 5 minutes.

Your trial is still active. Here's your portal:

[Open Leasibility AI →] https://leasibility.com/dashboard

— The Leasibility AI Team
```

---

### Email 4 — Day 5

**Subject:** Turn your site tour into a client-ready report

**Body:**
```
Hi {{contact.first_name}},

Your 7-day trial ends in 2 days.

Before it does — here's the output your clients will see when you use Leasibility AI:

✓ Two scenario plans (conservative + aggressive)
✓ Per-square-foot budget ranges based on national CRE benchmarks
✓ Project timeline estimates (design, permitting, construction)
✓ Your name and brokerage on every page
✓ Shareable link or downloadable PDF

Brokers using this are proactively creating scenarios before tours — not just responding to client questions, but leading the conversation.

Your trial ends soon. Lock in your plan and keep the momentum:

[Choose Your Plan →] https://leasibility.com/billing

Questions? Reply here — I'll respond personally.

— The Leasibility AI Team

P.S. The Professional plan is $199/month and pays for itself on the first deal you close with it.
```

---

## 6. Workflow Setup Steps in GHL

### Workflow 1: Trial Drip Sequence

1. Go to **Automation → Workflows → Create Workflow → Start from Scratch**
2. Name: `Leasibility AI — Trial Drip`
3. **Trigger:** Contact Tag Added → Tag = `trial-started`
4. Add actions in order:
   - **Send Email** → Email 1 (Day 0, delay: 0 minutes)
   - **Wait** → 1 day
   - **Send Email** → Email 2 (Day 1)
   - **Wait** → 2 days
   - **Send Email** → Email 3 (Day 3)
   - **Wait** → 2 days
   - **Send Email** → Email 4 (Day 5)
5. Publish the workflow

### Workflow 2: Inbound Webhook → Contact Creation

1. Go to **Automation → Workflows → Create Workflow → Start from Scratch**
2. Name: `Leasibility AI — Lead Intake`
3. **Trigger:** Inbound Webhook (the URL you already created)
4. Add actions:
   - **Create/Update Contact** — map fields:
     - First Name → `{{firstName}}`
     - Email → `{{email}}`
     - Custom Field: Onboarding Role → `{{onboardingRole}}`
     - Custom Field: Deal Volume → `{{onboardingDealVolume}}`
     - Custom Field: Primary Market → `{{onboardingMarket}}`
     - Custom Field: Pain Points → `{{onboardingPainPoints}}`
     - Custom Field: Plan Selected → `{{planSelected}}`
     - Custom Field: Lead Source → `{{source}}`
   - **Add Tag** → `leasibility-ai`
   - **Add Tag** → `{{tag}}` (maps to `trial-started` or `demo-completed`)
   - **Add to Pipeline** → Leasibility AI Sales → Stage: Survey Completed
5. Publish the workflow

### Workflow 3: Checkout Completed (via Stripe webhook)

1. Create workflow: `Leasibility AI — Checkout Completed`
2. **Trigger:** Contact Tag Added → `checkout-completed`
3. Actions:
   - Remove Tag: `trial-started`
   - Add Tag: `checkout-completed`
   - Move Pipeline Stage → Trial Active
   - Send Email: "Welcome to Leasibility AI — your trial has started" (write separately)
4. Publish

---

## 7. How the App Sends Data to GHL

Every time a user completes the onboarding survey, the app automatically POSTs to your webhook with this payload:

```json
{
  "firstName": "Jane",
  "email": "jane@brokerage.com",
  "onboardingRole": "tenant_rep",
  "onboardingDealVolume": "6_15",
  "onboardingMarket": "Dallas, TX",
  "onboardingPainPoints": "budget_estimates,test_fit_speed",
  "planSelected": "professional",
  "source": "onboarding-survey",
  "tag": "trial-started"
}
```

GHL receives this, creates or updates the contact, applies tags, and fires the drip sequence automatically.

---

## 8. Stripe → GHL Integration (Future)

When a user completes Stripe checkout, the Stripe webhook fires `checkout.session.completed`. The app already handles this and updates the database. To also update GHL:

1. In the Stripe webhook handler (`server/stripeWebhook.ts`), add a POST to the GHL webhook with `tag: "checkout-completed"` and `planSelected: plan`
2. This will trigger Workflow 3 above automatically

This is a 10-minute code addition — flag when ready to implement.

---

## 9. Recommended GHL Snapshot (Optional)

If you want to import a pre-built snapshot for Leasibility AI in the future, GHL allows snapshot imports under **Settings → Snapshots**. This can replicate the entire workflow, pipeline, and email setup to a new sub-account instantly.

---

*Document generated: March 2026 | Leasibility AI*
