# CloudShift Invoicerr – Phase 1 Baseline (Sindhu's Pickles)

**Approach:** Fork → Deploy → Understand → Customize → Test → Production  
**Status (2026-11-13, Asia/Calcutta):** Unmodified Invoicerr is running locally in the Cloud Agent VM. GitHub fork into `cloudshiftsolutions-dev` is still blocked (agent cannot create forks). Public domain/HTTPS not configured (no public hostname on this VM).

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

## Local URL

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

## Still required for true M1 “production-shaped” baseline

1. **User action:** Fork https://github.com/invoicerr-app/invoicerr into `cloudshiftsolutions-dev`, grant Cursor GitHub App access, reply with fork URL.
2. Deploy the same unmodified image on homelab/VPS with working Docker networking.
3. Configure public domain + HTTPS (Caddy/Traefik/nginx).
4. Recreate admin with a strong secret; store secrets in Infisical / environment secrets (never commit `.env`).

## AGPL note

Any CloudShift-modified network service built on Invoicerr must offer corresponding source to users of that service. Prefer a public fork under `cloudshiftsolutions-dev` as the source of truth.
