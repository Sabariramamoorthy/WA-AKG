# Sindhu's Pickles – customization backlog (after M1/M2)

Do **not** start these until the unmodified baseline is forked and redeployable on homelab/VPS.

## M3 – India / INR configuration

- [ ] Company currency INR (₹) — *smoke-tested in baseline*
- [ ] India country + Tamil Nadu state fields
- [ ] GSTIN and PAN on company (and B2B clients)
- [ ] Logo and branding assets

## M4 – GST localization (modular)

- [ ] CGST / SGST / IGST calculator plugin
- [ ] Place of supply
- [ ] GSTIN validation
- [ ] HSN + tax breakup on line items
- [ ] Credit notes under GST rules
- [ ] GST invoice numbering series

## M5 – B2B / B2C invoice designs

- [ ] B2C A4 retail invoice
- [ ] B2B A4 GST invoice
- [ ] Product table, QR, bank details, T&Cs

## M6 – WA-AKG integration

- [ ] Configure WA-AKG API (this repo)
- [ ] Send invoice PDF to customer mobile
- [ ] Custom message templates
- [ ] Delivery status + retry

## M7 – Testing and production

- [ ] E2E B2C/B2B paths
- [ ] Production secrets, backups, HTTPS
- [ ] AGPL corresponding-source publication

## Invoice pack (2026-11-13)

Committed under `deploy/invoicerr/templates/sindhus-pickles/`:
- Reference B2B/B2C HTML + CSS + email pack from Zepto/Sindhu pack
- `invoicerr-base.template.js` adapted for stock Invoicerr Handlebars context
- Mapped INVOICE + PAYMENT emails applied live
- PDF brand colors `#063f32` / cream secondary

Still post-fork: per-line HSN columns, separate CGST/SGST/IGST amounts, amount-in-words helper, payment-reminder mail type.
