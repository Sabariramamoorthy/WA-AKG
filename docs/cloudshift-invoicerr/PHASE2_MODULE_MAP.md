# Phase 2 – Application module map (against running baseline v1.4.5c)

Inspected from the **running** image modules and live API routes. Newer `dev` tip has a larger surface (unified `documents`, MCP, billing, client-portal, country-readiness); customization backlog should pin one version before coding.

## Module checklist (baseline image)

| Module | Baseline status | Notes for Sindhu's Pickles |
| --- | --- | --- |
| Articles | Present (`/api/articles`) | Products/SKU-like catalogue; fields today: name, description, type (`SERVICE` default), unitPrice, vatRate. Pack size / HSN / wholesale price **not** first-class — need extension later. |
| Clients | Present (`/api/clients`) | `INDIVIDUAL` vs `COMPANY`. Company requires `legalId` (upstream labelled SIRET/SIREN — can hold GSTIN later). Address fields include state. |
| Documents / Invoices | Split modules: `invoices`, `quotes`, `payments`, `recurring-invoices` | v1.4.5c is **not** yet the unified `documents` engine from current `dev`. Invoice lifecycle + PDF + archive endpoints exist. |
| Payments | Present | Partial payments via item `amountPaid`; methods via `/api/payment-methods` (UPI can be `OTHER` + details). Settlement updates invoice to `UNPAID`/`PAID`. |
| PDF | Present | Playwright/nginx-served PDF endpoints on invoices/quotes/payments. Template config under company (`pdf-template`, `invoicePDFFormat`). |
| Settings / Company | Present (`/api/company/info`) | Currency, country, numbering formats, VAT, branding hooks. INR + IN already accepted in smoke test. |
| Webhooks | Present (`/api/webhooks`) | Event notifications for client/invoice actions — candidate for WA-AKG trigger later. |
| API / Auth | better-auth + API keys | Session cookie auth; `/api/api-keys` for integration. |
| Archive | Invoice archive routes | Legal archive volumes mapped to `/data` in compose. |
| Signatures | Present | Quote signing OTP flow (less critical for pickle retail). |
| Sirene | Present | French company lookup — irrelevant for India; leave untouched. |

## Architecture (baseline)

- Frontend: React SPA behind nginx  
- Backend: NestJS under `/api`  
- DB: PostgreSQL via Prisma  
- Redis: compose-required; queue/worker env present  
- PDF: generated server-side (Playwright in product lineage)

## Version gap (do not ignore)

Running image modules (v1.4.5c) ≠ current `dev` modules (`documents`, `country-readiness`, `client-portal`, `mcp`, …).

**Recommendation before Phase 3:** either

1. Pin customization to **v1.4.5c** (matches `:latest` image), or  
2. Fork `dev` / a `v2` alpha, build your own image, and re-baseline deploy.

## Modular GST decision (confirmed)

Keep India GST as a **pluggable localization** (tax calculator + invoice numbering + PDF sections + GSTIN validation) rather than scattering CGST/SGST/IGST through core invoice code. That preserves upstream upgradeability and CloudShift reuse for future customers.
