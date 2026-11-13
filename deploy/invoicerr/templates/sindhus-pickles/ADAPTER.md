# Sindhu's Pickles → Invoicerr adapter

Reference HTML in this folder uses logical placeholders (`company.gstin`, `totals.cgst`, …). Stock Invoicerr v1.4.5c PDF rendering uses a different Handlebars context from `InvoicesService.getInvoicePDF`.

## Runtime mapping (PDF)

| Pack placeholder | Invoicerr context |
| --- | --- |
| `company.legalName` / brand | `company.name` |
| `company.gstin` | `company.VAT` |
| `company.pan` | `company.legalId` |
| `company.address` | `company.address` + `addressLine2` + `city`/`state`/`postalCode` |
| `customer.*` / buyer | `client.*` (`client.VAT` = buyer GSTIN) |
| `invoice.number` | `number` (rawNumber) |
| `invoice.date` / `dueDate` | `date` / `dueDate` |
| `invoice.placeOfSupply` | `client.state` (fallback `company.state`) |
| `lines[]` | `items[]` (`name`, `description`, `quantity`, `unitPrice`, `vatRate`, `totalPrice`) |
| HSN / SKU | Put in article `description` (e.g. `HSN: 1602`) until schema is extended |
| `totals.taxableValue` | `totalHT` |
| `totals.cgst` + `totals.sgst` | Shown combined as **CGST + SGST** = `totalVAT` (intra-state TN) |
| `totals.grandTotal` | `totalTTC` |
| B2B vs B2C | B2B if `client.VAT` or `client.legalId`; else B2C retail |

## Email mapping (Invoicerr MailTemplate)

| Pack | Invoicerr type | Variables |
| --- | --- | --- |
| `email-invoice.html` | `INVOICE` | `CLIENT_NAME`, `INVOICE_NUMBER`, `COMPANY_NAME`, `APP_URL` |
| `email-payment-received.html` | `PAYMENT` | `CLIENT_NAME`, `PAYMENT_NUMBER`, `COMPANY_NAME`, `APP_URL` |
| `email-payment-reminder.html` | *(no dedicated type)* | Keep as reference; send manually or add after fork |

## Applied live

- PDF: `invoicerr-base.template.js` overlaid onto `/usr/share/nginx/backend/src/modules/invoices/templates/base.template.js`
- PDF colors/labels: `POST /api/company/pdf-template` (green `#063f32`)
- Emails: `PUT /api/company/email-templates` for INVOICE + PAYMENT

## Still needs fork (Phase 3+)

- First-class HSN, pack size, CGST/SGST/IGST split columns
- Dual template selector + amount-in-words helper
- Dedicated payment-reminder mail type
- Remove “Made with Invoicerr” / full Factur-X India GST profile
