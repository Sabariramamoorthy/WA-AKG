# Invoicerr (Openship deploy)

Thin deploy wrapper for the **unmodified** official Invoicerr image on CloudShift’s HP Mini Elite.

- Image: `ghcr.io/invoicerr-app/invoicerr:v1.4.5c`
- Public URL (after Caddy): `https://invoicerr.app.cloudshiftsolutions.in`
- Compose lives here so Openship can deploy from `Sabariramamoorthy/WA-AKG` with `rootDirectory=deploy/invoicerr`.

Do not put secrets in this folder. Set them on the Openship project services.

**Required:** `PORT=3000` on the `invoicerr` service. Openship’s exposed port is `80` (nginx). If Nest inherits `PORT=80`, it steals `:80`, the entrypoint never starts nginx, and the UI returns Nest `404`.
