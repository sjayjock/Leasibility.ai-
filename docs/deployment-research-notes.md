# Deployment Research Notes

Date: 2026-05-18 EDT

The current Leasibility AI app is a full-stack Node/Express + Vite + React application using Drizzle with a MySQL-compatible `DATABASE_URL`. The temporary sandbox URL is not persistent because the sandbox process and exposed proxy are session-bound.

Search results identified Railway as a suitable fastest-path persistent host because it supports full-stack web services and provides a MySQL database template. Railway documentation pages for variables and MySQL were located, but direct extraction/browser rendering was incomplete in this environment. The implementation therefore uses provider-neutral Node deployment primitives plus a Railway-oriented configuration path rather than relying on provider-specific undocumented behavior.

Key deployment implications:

- A permanent website must run the server process with `pnpm start` after `pnpm build`.
- A MySQL-compatible database must be provisioned and assigned to `DATABASE_URL`.
- Migrations must be applied with Drizzle before acceptance testing.
- Required secrets must be configured outside Git: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, and production AI/OCR/image variables as applicable.
- The deployment should include health checking and reproducible commands so any host can run it reliably.
