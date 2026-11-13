# Openship deploy — Sindhu Invoicerr overlays

Deploy from this folder (`rootDirectory=deploy/invoicerr`) using `docker-compose.yml`.

## 1. Service env (required)

On the **invoicerr** service set at least:

| Variable | Notes |
| --- | --- |
| `PORT` | **`3000`** (do not leave Openship’s default `80`) |
| `APP_URL` | `https://invoicerr.app.cloudshiftsolutions.in` |
| `CORS_ORIGINS` | same origin |
| `DATABASE_URL` | compose default is fine if using bundled Postgres |
| `BETTER_AUTH_SECRET` | random |
| `CREDENTIALS_ENCRYPTION_KEY` | 32-byte hex/secret |
| `POSTGRES_PASSWORD` | for `invoicerr_db` |

## 2. Entrypoint file override (required for Sindhu pack)

In Openship → invoicerr service → **advanced files**, mount:

- **Path:** `/usr/share/nginx/entrypoint.sh`
- **Content:** copy from [`entrypoint.sh`](./entrypoint.sh) in this folder

That script:

1. Runs `prisma db push` against full `schema.prisma`
2. Fetches Sindhu PDF template + SPA tools from this branch
3. Serves Template Master at `/sindhu-templates.html`
4. Starts Nest on `:3000` then nginx on `:80`

Branch raw base (already in the script):

`https://raw.githubusercontent.com/Sabariramamoorthy/WA-AKG/cursor/invoicerr-phase1-baseline-a84b/deploy/invoicerr/templates/sindhus-pickles`

## 3. Redeploy

Redeploy / restart the **invoicerr** service so the entrypoint runs. Confirm:

- `GET /api/health` → ok
- `GET /sindhu-invoice-tools.js` → JS
- `GET /sindhu-templates.html` → Template Master

## 4. After first boot (optional)

- Email bodies: `templates/sindhus-pickles/apply-email-templates.py`
- UI guide: `templates/sindhus-pickles/UI_STATUS_AND_TEMPLATES.md`

## Prefer building from the Invoicerr fork (native source)

Sindhu B2B/B2C + branding are now in parent source:

- Repo: https://github.com/cloudshiftsolutions-dev/invoicerr
- Branch: `cursor/sindhu-gst-templates-a84b`
- Guide: `CLOUDSHIFT_SINDHU.md` in that repo

Build/push an image from that branch and point Openship at it (instead of stock `ghcr.io/invoicerr-app/invoicerr` + entrypoint overlays).
