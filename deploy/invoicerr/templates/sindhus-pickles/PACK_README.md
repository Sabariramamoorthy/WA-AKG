# Sindhu's Pickles — Invoicerr template pack

## Contents
- `invoice-b2c.html` — A4 retail invoice HTML reference template
- `invoice-b2b.html` — A4 B2B GST invoice HTML reference template
- `invoice.css` — shared print styling (A4 portrait)
- `email-invoice.html` — invoice delivery email
- `email-payment-reminder.html` — payment reminder email
- `email-payment-received.html` — payment confirmation email

## Business details sourced from the supplied invoice
- Trading name: Sindhu's Pickles
- GSTIN: 33GZBPS5378R1ZC
- Address: 13/150 Ganapathi Nagar, Mohan Nagar Post, Salem - 30, Tamil Nadu
- Phone: 8838083381
- Email: sindhuspickles8@gmail.com

The legal name is not confirmed. Use the exact legal name shown on the GST registration certificate before issuing tax invoices.

## Important integration note
These are branded HTML/CSS reference templates with illustrative Handlebars-style placeholders. They are **not drop-in Invoicerr templates**. The current Invoicerr repository uses a shared document PDF renderer and has email templates per document type plus system emails. Map the placeholders to the actual Invoicerr document/company/client DTOs in the fork, then place the HTML into the appropriate renderer and email-template flow.

Invoicerr docs:
- https://docs.invoicerr.app/
- https://docs.invoicerr.app/docs/developer-guide/architecture/
- https://github.com/invoicerr-app/invoicerr

## Placeholder mapping
The templates use logical names such as `company.gstin`, `customer.gstin`, `invoice.number`, `lines[]`, and `totals.cgst`. These are adapter-level names, not verified Invoicerr runtime variable names. Build a mapping layer from the current Prisma/document data model.

## GST and legal checks
- GST rates and HSN codes must be verified for each product by the business's tax adviser.
- Determine intra-state vs inter-state supply from the legally relevant place-of-supply data.
- Do not show both CGST/SGST and IGST simultaneously; render the applicable tax components only.
- Amount in words must be generated from the final rounded invoice total.
- Never use placeholder GSTIN, PAN, bank details, QR codes, or sample customer details on live invoices.
- Validate invoice numbering, mandatory particulars, tax rounding and credit-note behaviour before production.

## Preview
Open either invoice HTML file in a browser. Replace placeholders with test data or connect the mapping adapter. Print using A4 portrait.
