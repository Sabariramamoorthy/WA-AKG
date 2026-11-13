#!/usr/bin/env node
/**
 * Patch stock Invoicerr invoices.service.js for:
 * - status transitions DRAFT -> UNPAID/SENT
 * - sindhuTemplate / [[TEMPLATE:B2B|B2C]] notes tags
 * - isB2B + notesDisplay for PDF template
 */
const fs = require("fs");
const path = process.argv[2] || "/usr/share/nginx/backend/src/modules/invoices/invoices.service.js";
let s = fs.readFileSync(path, "utf8");
const bak = path + ".pre-sindhu";
if (!fs.existsSync(bak)) fs.writeFileSync(bak, s);

// 1) Allow status on update + sindhuTemplate notes handling
const draftGuard = `        if (existingInvoice.status !== 'DRAFT') {
            logger_service_1.logger.error('Only draft invoices can be edited', { category: 'invoice', details: { invoiceId: id, status: existingInvoice.status } });
            throw new common_1.BadRequestException('Only draft invoices can be edited');
        }`;

const draftGuardNew = `        const issuing = existingInvoice.status === 'DRAFT' && body.status && body.status !== 'DRAFT';
        if (existingInvoice.status !== 'DRAFT' && !issuing) {
            logger_service_1.logger.error('Only draft invoices can be edited', { category: 'invoice', details: { invoiceId: id, status: existingInvoice.status } });
            throw new common_1.BadRequestException('Only draft invoices can be edited');
        }
        if (body.sindhuTemplate === 'B2B' || body.sindhuTemplate === 'B2C') {
            const cleaned = String(data.notes ?? existingInvoice.notes ?? '').replace(/\\[\\[TEMPLATE:(B2B|B2C)\\]\\]/g, '').trim();
            data.notes = (cleaned + '\\n[[TEMPLATE:' + body.sindhuTemplate + ']]').trim();
        }`;

if (!s.includes("const issuing = existingInvoice.status === 'DRAFT'")) {
  if (!s.includes(draftGuard)) throw new Error("draft guard block not found");
  s = s.replace(draftGuard, draftGuardNew);
}

// 2) Persist status in prisma update data
const updateDataStart = `            data: {
                recurringInvoiceId: data.recurringInvoiceId,
                paymentMethod: data.paymentMethod || existingInvoice.paymentMethod,`;
const updateDataStartNew = `            data: {
                status: body.status || existingInvoice.status,
                recurringInvoiceId: data.recurringInvoiceId,
                paymentMethod: data.paymentMethod || existingInvoice.paymentMethod,`;
if (!s.includes("status: body.status || existingInvoice.status")) {
  if (!s.includes(updateDataStart)) throw new Error("update data block not found");
  s = s.replace(updateDataStart, updateDataStartNew);
}

// 3) PDF context: isB2B + notesDisplay
const pdfMarker = `            isDraft: invoice.status === 'DRAFT',
            draftLabel: (0, watermark_1.getDraftWatermarkLabel)(invoice.company.country),
            number: invoice.rawNumber || invoice.number.toString(),`;
const pdfMarkerNew = `            isDraft: invoice.status === 'DRAFT',
            draftLabel: (0, watermark_1.getDraftWatermarkLabel)(invoice.company.country),
            isB2B: (function () {
                const notesRaw = invoice.notes || '';
                if (/\\[\\[TEMPLATE:B2C\\]\\]/.test(notesRaw)) return false;
                if (/\\[\\[TEMPLATE:B2B\\]\\]/.test(notesRaw)) return true;
                const c = invoice.client || {};
                return !!(c.VAT || c.legalId || c.type === 'COMPANY');
            })(),
            notesDisplay: String(invoice.notes || '').replace(/\\[\\[TEMPLATE:(B2B|B2C)\\]\\]/g, '').trim().replace(/\\n/g, '<br>'),
            number: invoice.rawNumber || invoice.number.toString(),`;
if (!s.includes("notesDisplay:")) {
  if (!s.includes(pdfMarker)) throw new Error("pdf marker not found");
  s = s.replace(pdfMarker, pdfMarkerNew);
}

// Prefer notesDisplay in template call notes field if present - template uses notesDisplay separately

fs.writeFileSync(path, s);
console.log("patched", path);
