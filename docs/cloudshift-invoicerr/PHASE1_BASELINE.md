# CloudShift Invoicerr – Phase 1 Baseline (Sindhu's Pickles)

**Approach:** Fork → Deploy → Understand → Customize → Test → Production  
**Status (2026-11-13, Asia/Calcutta):** Unmodified Invoicerr **v1.4.5c** is live on HP Mini via Openship + VPS Caddy at https://invoicerr.app.cloudshiftsolutions.in. Local Cloud Agent baseline smoke tests are recorded. GitHub fork into `cloudshiftsolutions-dev` is still blocked (agent cannot create forks).

## Official source

| Item | Value |
| --- | --- |
| Upstream | https://github.com/invoicerr-app/invoicerr |
| License | AGPL-3.0 (network users must receive corresponding source for modifications) |
| Target fork org | `cloudshiftsolutions-dev` |
| WA-AKG integration partner | https://github.com/Sabariramamoorthy/WA-AKG |

## Deployed version (recorded)

| Item | Value |
| --- | --- |
| Image | `ghcr.io/invoicerr-app/invoicerr:latest` |
| Digest | `sha256:615f4cec6cd1e22ac8e473c6ae33f7191ca93d32545fca38cddc3368b3419eec` |
| Image created (UTC) | 2026-06-29T10:33:00Z |
| Matches GitHub release | **v1.4.5c** |
| Cloned `dev` tip (for reference only) | `487ab811` (2026-11-13) |
| Latest GitHub tag | `v2.0.0-alpha.6` (not what `:latest` pulls) |

**Important:** `ghcr.io/.../invoicerr:latest` tracks the last **stable** release (v1.4.5c), not current `dev`. Do not start GST/PDF customization against newer `dev` source until the fork/image pin is aligned.

## Stack

- App: NestJS + React (nginx) from official image
- PostgreSQL 15 (`invoicerr_db`)
- Redis (`bitnami/redis`) — required by current compose; present even for this image
- Persistent volumes: `db_data`, `db_backups`, `redis-data`, `documents_data`
- Compose: upstream `docker-compose.yml` + CloudShift local override (see `docker-compose.local.yml`)

## Public URL (HP Mini / Openship)

- App: https://invoicerr.app.cloudshiftsolutions.in  
- Health: `GET /api/health` → `{"status":"ok","database":"up"}`  
- Sign-in: https://invoicerr.app.cloudshiftsolutions.in/auth/sign-in  
- Compose: `deploy/invoicerr/docker-compose.yml` (`PORT=3000` required so Nest does not steal nginx `:80`)  
- Edge: Caddy (VPS) → Tailscale `100.98.161.75:80` → Openship published `127.0.0.1:20012`

## Local URL (Cloud Agent smoke)

- App: http://127.0.0.1:80  
- Health: `GET /api/health` → `{"status":"ok","database":"up"}`  
- Swagger UI: http://127.0.0.1:80/swagger  

## Networking note (Cloud Agent VM)

Docker bridge **inter-container** TCP timed out in this environment (DNS resolved, `nc` to peer containers hung). Host→published ports worked. Workaround used for baseline only:

- Publish Postgres `5432` and Redis `6379` to the host
- Run the app with `network_mode: host` and point `DATABASE_URL` / `REDIS_HOST` at `127.0.0.1`

On a normal homelab/VPS with working Docker bridge, use unmodified upstream compose (Postgres + Redis service names) and do **not** need host networking.

## Administrator bootstrap

- First-user signup allowed (`/api/invitations/is-first-user` → true before bootstrap)
- Endpoint: `POST /api/auth/sign-up/email` with `email`, `password`, `name`, `firstname`, `lastname`
- Admin used for smoke tests: `admin@cloudshiftsolutions.in`  
- Password is **not** stored in git; rotate before any shared/production deploy

## Smoke tests completed (unmodified app)

| Workflow | Result |
| --- | --- |
| Company settings | Created “Sindhu's Pickles (Baseline)”, currency **INR**, country **IN** |
| Clients | Individual (`INDIVIDUAL` + `contactFirstname`/`contactLastname`) and company (`COMPANY` + `name` + `legalId`) |
| Articles (products) | Created “Mango Pickle 500g” @ ₹250 |
| Invoice | Draft invoice total **₹500** (`currency: INR`) |
| Payment method | UPI (`type: OTHER`) |
| Payment | `POST /api/payments/create-from-invoice` with `{"id":"<invoiceId>"}` → ₹500 paid |
| PDF | `GET /api/invoices/:id/pdf` → PDF 1.4, ~67 KB |

## Still required after live baseline

1. **User action:** Fork https://github.com/invoicerr-app/invoicerr into `cloudshiftsolutions-dev`, grant Cursor GitHub App access, reply with fork URL.
2. First-user / admin signup on the public URL (fresh HP Mini DB); store secrets in Infisical / Openship env (never commit `.env`).
3. Only then start India/GST/PDF customization on the fork (not on floating `dev`).

## AGPL note

Any CloudShift-modified network service built on Invoicerr must offer corresponding source to users of that service. Prefer a public fork under `cloudshiftsolutions-dev` as the source of truth.
