# Invoicerr (Openship deploy)

Thin deploy wrapper for the **unmodified** official Invoicerr image on CloudShift’s HP Mini Elite.

- Image: `ghcr.io/invoicerr-app/invoicerr:v1.4.5c`
- Public URL (after Caddy): `https://invoicerr.app.cloudshiftsolutions.in`
- Compose lives here so Openship can deploy from `Sabariramamoorthy/WA-AKG` with `rootDirectory=deploy/invoicerr`.

Do not put secrets in this folder. Set them on the Openship project services.

**Required:** `PORT=3000` on the `invoicerr` service. Openship’s exposed port is `80` (nginx). If Nest inherits `PORT=80`, it steals `:80`, the entrypoint never starts nginx, and the UI returns Nest `404`.

**Schema:** Image entrypoint originally runs `prisma db push` against `schema-v1.4.4a.prisma`, which omits `Company.paymentStartingNumber` / `paymentNumberFormat` and can leave `Article` out of sync with the v1.4.5c binary. Openship mounts a patched `/usr/share/nginx/entrypoint.sh` that pushes `prisma/schema.prisma` instead.

**Sindhu pack:** PDF/email overlays + floating B2B/B2C tools live under `templates/sindhus-pickles/`. For Openship redeploy steps, mount `entrypoint.sh` as `/usr/share/nginx/entrypoint.sh` — see [OPENSHIP_DEPLOY.md](./OPENSHIP_DEPLOY.md).
