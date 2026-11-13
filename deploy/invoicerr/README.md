# Invoicerr (Openship deploy)

Thin deploy wrapper for the **unmodified** official Invoicerr image on CloudShift’s HP Mini Elite.

- Image: `ghcr.io/invoicerr-app/invoicerr:v1.4.5c`
- Public URL (after Caddy): `https://invoicerr.app.cloudshiftsolutions.in`
- Compose lives here so Openship can deploy from `Sabariramamoorthy/WA-AKG` with `rootDirectory=deploy/invoicerr`.

Do not put secrets in this folder. Set them on the Openship project services.
