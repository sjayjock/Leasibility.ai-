# Leasibility AI — App TODO

## Backend
- [x] Database schema: users, brokerProfiles, projects, scenarios
- [x] DB migration pushed
- [x] DB helpers: CRUD for all tables
- [x] AI engine: scenario generation with budget + schedule
- [x] tRPC routers: broker, projects (list, get, create, upload, analyze, delete)

## Frontend
- [x] Landing page (Home.tsx) — all sections
- [x] App.tsx routing — add /dashboard, /project/:id, /new routes
- [x] index.css — dark theme tokens + input-field utility
- [x] Dashboard page — project list, stats, new project CTA
- [x] New Project wizard — 3-step form (property → program → upload/scan)
- [x] Scan flow — camera capture UI for mobile (live in NewProject step 3)
- [x] Analyzing screen — loading state while AI runs
- [x] Scenario results page — 2 scenarios, budget breakdown, schedule forecast
- [x] Report export — PDF export wired via pdfRouter
- [x] Broker profile settings page

## Testing
- [x] Unit tests for AI engine
- [x] Unit tests for project router (8 tests passing)

## Polish
- [x] Responsive mobile layout for all app pages
- [x] Empty states for dashboard
- [x] Error handling toasts

## Updates — Launch Preparation
- [x] AI engine: update to 3 scenarios (Low Impact / Medium Impact / High Impact)
- [x] Landing page: remove all beta/waitlist language, replace with launch CTAs
- [x] App UI: remove beta references from navbar, hero, pricing, CTA sections
- [x] Vitest: update tests to expect 3 scenarios

## Phase 3 — Launch Features
- [x] Stripe billing: add stripe feature, create products/prices via MCP
- [x] Stripe: subscription paywall on dashboard (trial gate)
- [x] Stripe: billing portal and plan management page
- [x] Broker profile: schema + upload photo/logo to S3
- [x] Broker profile: profile setup page UI
- [x] PDF export: server-side branded report generation
- [x] PDF export: wire Export button in ProjectDetail
- [x] PDF export: embed broker profile in report

## Phase 4 — Viral Loop Features
- [ ] DB schema: shareTokens table (token, projectId, createdBy, viewCount, lastViewedAt)
- [ ] DB schema: reportViews table (tokenId, viewedAt, ipHash, userAgent)
- [ ] tRPC: share.create — generate unique token, return public URL
- [ ] tRPC: share.getReport — public procedure, fetch project + scenarios by token, record view
- [ ] tRPC: share.getViews — protected, return view history for a project
- [ ] Owner notification on first view and every subsequent view
- [ ] Public report viewer page (/report/:token) — full branded report, no auth
- [ ] Wire Share button in ProjectDetail to call share.create and copy link
- [ ] Read receipt badge on project cards in Dashboard
- [ ] Read receipt detail view in ProjectDetail (who opened, when)
- [ ] Vitest: share router tests

## Phase 5 — Market Data + Link Management + Onboarding
- [ ] Market data: add 25-city cost multiplier table to AI engine
- [ ] Market data: add city/market dropdown to New Project wizard (Step 1)
- [ ] Market data: pass market selection through to scenario budget calculations
- [ ] Link management: share link panel in ProjectDetail (view history, revoke, copy link)
- [ ] Link management: show last viewed timestamp and total view count per link
- [ ] Onboarding: research conversion-optimized funnel patterns
- [ ] Onboarding: build survey-style onboarding flow (post-signup, pre-dashboard)
- [ ] Onboarding: wire plan selection into onboarding funnel

## Phase 6 — Compare Properties + Publish
- [ ] Compare Properties page — select 2-3 completed projects, side-by-side view
- [ ] Compare: show best scenario per property (efficiency score, budget range, timeline)
- [ ] Compare: recommendation engine picks the strongest property
- [ ] Compare: export single comparison PDF/shareable link
- [ ] Add /compare route to App.tsx
- [ ] Add Compare button to Dashboard
- [ ] Stripe sandbox claim link delivered to user

## Phase 7 — Positioning & Language Overhaul
- [x] Rename scenarios: low→lightRefresh, medium→moderateBuildOut, high→fullTransformation
- [x] Update scenario labels in AI engine, DB schema, all server files
- [x] Rewrite hero headline: "Know If a Space Works—Before Your Client Asks."
- [x] Rewrite hero subheadline with "Turn every tour into a decision point."
- [x] Rewrite hero body copy with final recommended structure
- [x] Update How It Works step 3 copy to use new scenario names
- [x] Update Features section copy to reflect certainty positioning
- [x] Update all app UI pages with new scenario names (ProjectDetail, Compare, SharedReport)
- [x] Update impact level color coding and badges to match new names

## Phase 8 — Checkout Fix
- [x] Diagnose "no such price" error — check if price IDs are test vs live mode mismatch
- [x] Fix each pricing plan CTA to pass the correct plan key to checkout session
- [x] Ensure billing page "Choose Your Plan" buttons route to correct plan/interval
- [x] Verify end-to-end checkout with test card 4242 4242 4242 4242

## Phase 9 — Post-Checkout UX & Retention
- [x] Post-checkout welcome modal on /dashboard?billing=success with onboarding steps
- [x] Configure Stripe Customer Portal via MCP and verify Manage Billing button
- [x] Trial-expiry banner (≤3 days remaining) with countdown and upgrade CTA

## Phase 10 — Referral Program & Changelog
- [x] Add referrals table and seenChangelog field to DB schema, push migration
- [x] Build referralRouter: generate code, list referrals, claim credit
- [x] Build changelogRouter: get unseen changelog entries, mark as seen
- [x] Build /referrals page: invite link, copy button, referral table, credit status
- [x] Build What's New changelog modal: version-gated, shown once per version
- [x] Wire changelog modal into Dashboard and app shell
- [x] Register /referrals route in App.tsx

## Phase 11 — Referral Join Page, Webhook Credits & LinkedIn Share
- [x] Build /join page: show referrer name, acknowledge code, CTA to sign up
- [x] Store ref code in sessionStorage so claimReferral fires after OAuth
- [x] Auto-claim referral on first login if ref code is in sessionStorage
- [x] Stripe webhook: on customer.subscription.updated status=active, find referral, mark credited, create coupon, apply to referrer
- [x] Add LinkedIn share button with pre-filled copy to /referrals page
- [x] Register /join route in App.tsx

## Phase 12 — Referral Terms Page & Credit Notification
- [x] Build /referrals/terms page with eligibility, credit limits, expiry, abuse policy
- [x] Add "View Terms" link from /referrals page
- [x] Register /referrals/terms route in App.tsx
- [x] Add notifyOwner call in webhook when referral credit is applied
- [x] Add a tRPC query so referrers can see their latest credit notification in-app

## Phase 13 — Privacy Policy & Readiness Audit
- [x] Build /privacy page (data collection, Stripe, referrals, cookies, contact)
- [x] Link /privacy from landing page footer and billing page
- [x] Register /privacy route in App.tsx
- [x] Full feature audit: all routes, auth, AI engine, PDF, Stripe, referrals

## Phase 14 — Terms of Service & Mobile Scan Flow
- [x] Build /terms page (acceptable use, subscription, liability, IP, termination, governing law)
- [x] Link /terms from landing page footer
- [x] Register /terms route in App.tsx
- [x] Build mobile camera scan UI in NewProject.tsx (camera capture, multi-photo, preview, upload)
- [x] Wire scan photos to existing floor plan upload pipeline

## Phase 15 — tRPC JSON Error Fix
- [ ] Diagnose which tRPC query returns HTML on homepage
- [ ] Fix root cause (missing route, crashing procedure, or middleware issue)
- [ ] Verify fix with TypeScript check and tests

## Phase 16 — Final Build-Out (Critical Gaps)
- [x] Add analysisCount and analysisResetDate fields to users schema, push migration
- [x] Add subscription gate to analyze mutation (check plan status, enforce Starter 10/month limit)
- [x] Build /contact page with name/email/message form firing notifyOwner
- [x] Build /security page with encryption, retention, compliance posture
- [x] Register /contact and /security routes in App.tsx, link from footer
- [x] Add PWA manifest.json and icons to client/public
- [x] Add Add to Home Screen install prompt component
- [x] Polish mobile dashboard (stats grid, project cards at 375px)
- [x] Polish billing page for mobile conversion (plan cards, toggle, CTA)
- [x] Remove "Admin dashboard" from Team plan feature list everywhere
- [x] Remove ChangelogModal from App.tsx and delete the component
- [x] Remove "Made by Manus" / any Manus branding from all pages

## SEO Fixes
- [x] Shorten meta description to under 160 characters
- [x] Add meta keywords tag with CRE/proptech terms
- [x] Add alt text to hero background image (was empty string)

## Phase 17 — Auth Funnel Fix & Branded Login Flow
- [x] Diagnose React error #310 on Start Free Trial click
- [x] Fix crashing useEffect / setState-in-render in all 7 affected pages
- [x] Build branded /start page — dark navy, Leasibility branding, benefits, sign-in CTA
- [x] Ensure "Start Free Trial" CTA routes through /start before OAuth redirect
- [x] Ensure all auth redirects land back inside the app (not a blank white page)
- [x] Update getLoginUrl() to support returnPath in state
- [x] Update OAuth callback to parse returnPath and redirect correctly after login
- [x] 0 TypeScript errors, 8/8 tests passing

## Phase 18 — High-Conversion Funnel Build
- [x] Landing page: updated headline, subheadline, body copy
- [x] Landing page: CTA hierarchy — "Run a Sample Deal" primary, "Start Free Trial" secondary
- [x] Landing page: "Run a Sample Deal" CTA in hero and navbar
- [x] Build /demo page — 3 preset scenarios, fake-load animation, real output, blurred soft gate
- [x] Redesign /start interstitial — "Want to see it first?" with Try Sample Deal / Continue to Signup
- [x] Onboarding survey — 4 questions, progress bar, GHL webhook push
- [x] Wire survey completion → Stripe Checkout (card-required trial, same tab)
- [x] Add GHL /api/ghl/lead endpoint to server (webhook push on survey completion)
- [x] Register /demo route in App.tsx
- [x] GHL setup guide written: GHL_SETUP_GUIDE.md (contact fields, tags, pipeline, 4-email sequence)
- [x] 0 TypeScript errors, 8/8 tests passing
