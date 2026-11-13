# Sindhu's Pickles — Email Templates

All email templates are responsive HTML email layouts. They use inline CSS for compatibility and logical placeholders that must be mapped to Invoicerr's actual email variables.

## 03 — Invoice email
Suggested subject: `Invoice {{invoice.number}} from Sindhu's Pickles`
Purpose: Send the invoice PDF as an attachment or secure invoice link. Include invoice number, date, total due and customer support details.

## 04 — Payment reminder
Suggested subject: `Payment reminder: Invoice {{invoice.number}}`
Purpose: Friendly reminder before/after due date. Do not send if invoice is paid, void, disputed or under an agreed hold.

## 05 — Payment confirmation
Suggested subject: `Payment received — Invoice {{invoice.number}}`
Purpose: Confirm amount, date, payment method/reference and remaining balance (if partial payment).

## Email integration requirements
- Attach the generated PDF or include an authenticated invoice link.
- Escape customer-supplied values before HTML rendering.
- Do not expose internal notes or other customers' information.
- Use the invoice's actual outstanding balance, not the original total, for reminders.
- Respect email consent, bounce/suppression and retry rules.
- Map placeholders to Invoicerr's actual DTOs; names in these files are illustrative.
