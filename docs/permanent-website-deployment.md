# Permanent Website Deployment Guide — Leasibility AI

This guide converts the rebuilt Leasibility AI app from a temporary sandbox run into a persistent public website. The app is a full-stack **Vite + React + Express + tRPC** service backed by **Drizzle + MySQL**, so a static-only host is not sufficient for the MVP acceptance flow.

## Recommended Fastest Path

The fastest persistent staging path is **Railway with a MySQL service**, using the app subdirectory `leasibility-ai` as the project root. Railway is recommended here because the repository already requires a MySQL-compatible `DATABASE_URL`, and the app can run as a single Node web service for MVP validation.

| Requirement | Permanent Deployment Choice | Notes |
|---|---:|---|
| Web app runtime | Node.js 22 | Matches local build and Dockerfile. |
| Frontend | Built by Vite | Served by the Express production server from `dist/public`. |
| Backend | Express + tRPC | Runs through `pnpm start`. |
| Database | MySQL-compatible database | `DATABASE_URL` is mandatory. |
| Migrations | Drizzle SQL migrations | Run with `pnpm db:migrate` before or during deploy. |
| Health check | `/api/health` | Added for persistent host uptime checks. |

## Railway Setup

1. Create a Railway project from the GitHub repository `sjayjock/Leasibility.ai-`.
2. Set the service root directory to `leasibility-ai`.
3. Add a Railway MySQL database service.
4. Set the web service environment variables from `.env.example`.
5. Point `DATABASE_URL` to the Railway MySQL internal connection URL.
6. Deploy the branch `feature/ai-engine-pipeline-v1` or merge it to the branch used by production.
7. Confirm `/api/health` returns `{ "ok": true }`.
8. Run the MVP acceptance flow with a real uploaded office floor plan.

The committed `leasibility-ai/railway.json` config uses:

```json
{
  "build": { "builder": "NIXPACKS", "buildCommand": "pnpm install --frozen-lockfile && pnpm build" },
  "deploy": { "startCommand": "pnpm start:hosted", "healthcheckPath": "/api/health" }
}
```

`pnpm start:hosted` runs `pnpm db:migrate && pnpm start`, which is acceptable for a single-instance MVP staging deployment. For multi-instance production, move migrations into a dedicated release job to avoid concurrent migration attempts.

## Docker-Based Alternative

A provider-neutral Dockerfile is also included in `leasibility-ai/Dockerfile`. Any host that supports Docker can deploy the app using the `leasibility-ai` directory as the Docker build context.

```bash
docker build -t leasibility-ai ./leasibility-ai
docker run --env-file ./leasibility-ai/.env -p 3000:3000 leasibility-ai
```

## Required Environment Variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | Yes | MySQL-compatible database connection string. |
| `JWT_SECRET` | Yes | Signs authentication/session tokens. |
| `OAUTH_SERVER_URL` | Yes | OAuth integration endpoint used by the existing runtime. |
| `VITE_APP_ID` | Yes | App identifier consumed by the runtime. |
| `STRIPE_SECRET_KEY` | Yes for billing | Required because billing routes initialize Stripe. |
| `STRIPE_WEBHOOK_SECRET` | Yes for billing webhooks | Validates Stripe webhook requests. |
| `OWNER_OPEN_ID` | Recommended | Admin/owner identity. |
| `BUILT_IN_FORGE_API_URL` | As applicable | AI/file-processing service endpoint. |
| `BUILT_IN_FORGE_API_KEY` | As applicable | AI/file-processing service key. |
| `VITE_ANALYTICS_ENDPOINT` | Optional | Analytics endpoint. |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional | Analytics website identifier. |

## Production Readiness Gate

The permanent website should not be considered accepted until the deployed environment passes the project MVP standard: real staging deployment, database connected, API keys configured, real office floor plan uploaded, existing conditions parsed, three scenarios generated, refined architectural plan outputs visible, achieved-vs-requested report visible, budget and schedule generated, and Project Detail, Shared Report, and PDF outputs reviewed.
