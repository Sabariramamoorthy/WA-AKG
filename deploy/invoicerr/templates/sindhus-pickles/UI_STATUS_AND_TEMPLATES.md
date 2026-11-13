# How to change status & pick B2B/B2C (stock Invoicerr)

Stock Invoicerr **does not** ship:

- a template-type field on Create Invoice
- an Invoice Template Master screen

Sindhu overlays add both via the green floating panel + `/sindhu-templates.html`.

## Change invoice status

| Goal | Where |
| --- | --- |
| Draft → Unpaid (remove Draft watermark) | Open invoice → floating panel → **Issue (Draft → Unpaid)** |
| Unpaid → Paid | Floating panel → **Mark as Paid**, or Invoices list → Mark as paid / record payment |
| Email client | Floating panel → **Send by email** (SMTP required) or list Send |
| Archive | Invoices list archive (only when **Paid**) |

Statuses in DB: `DRAFT`, `UNPAID`, `SENT`, `OVERDUE`, `PAID`, `ARCHIVED`.

## Choose template on create

1. Open **Invoices** → Add new (create dialog).
2. On the green **Sindhu invoice tools** panel, click **B2B Tax** or **B2C Retail**.
3. That writes `[[TEMPLATE:B2B]]` / `[[TEMPLATE:B2C]]` into **Notes**.
4. Save. PDF uses that tag (B2B also if client has GSTIN).

## Template Master

Open **https://invoicerr.app.cloudshiftsolutions.in/sindhu-templates.html** (link also on the floating panel).

Settings → PDF template only controls colors/labels, not B2B vs B2C layout.
