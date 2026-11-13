"use strict";
/**
 * Sindhu's Pickles PDF template for stock Invoicerr (Handlebars).
 * Adapted from invoice-b2b.html / invoice-b2c.html + invoice.css.
 *
 * Runtime context comes from InvoicesService.getInvoicePDF — not the pack's
 * logical placeholders. B2B when client.VAT or client.type === COMPANY.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTemplate = void 0;
exports.baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{#if client.VAT}}TAX INVOICE{{else}}{{#if client.legalId}}TAX INVOICE{{else}}RETAIL INVOICE{{/if}}{{/if}} {{number}}</title>
  <style>
    :root{--green:#063f32;--green2:#0b5a45;--gold:#c89b3c;--cream:#f7f4ea;--ink:#17251f;--muted:#63716b;--line:#d9ded8}
    *{box-sizing:border-box}
    body{margin:0;color:var(--ink);font:10.5pt/1.42 {{fontFamily}},Arial,Helvetica,sans-serif;padding:{{padding}}px}
    .topbar{height:8px;background:linear-gradient(90deg,var(--green),var(--green2),var(--gold));margin:0 0 12px}
    .brand{display:flex;align-items:flex-start;gap:14px;border-bottom:1px solid var(--line);padding-bottom:12px}
    .logo{max-height:72px;max-width:72px;object-fit:contain}
    .brand h1{margin:0;color:var(--green);font:700 22pt Georgia,serif;letter-spacing:-.5px}
    .tagline{margin:3px 0 0;color:var(--muted);font-style:italic;font-size:9.5pt}
    .seller{margin-left:auto;text-align:right;font-size:9pt;line-height:1.5;max-width:46%}
    .dochead{display:flex;justify-content:space-between;align-items:flex-end;margin:18px 0 12px;gap:12px}
    .dochead h2{margin:0;color:var(--green);font:700 18pt Georgia,serif}
    .pill{display:inline-block;border:1px solid var(--gold);color:var(--green);padding:3px 8px;border-radius:20px;font-size:8pt;font-weight:700;margin-top:6px}
    .meta{min-width:210px;background:var(--cream);border:1px solid #e9dfc8;border-radius:8px;padding:10px 12px;font-size:9pt}
    .meta-row{display:flex;justify-content:space-between;gap:12px;padding:2px 0}
    .meta-row span:first-child{color:var(--muted)}
    .cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
    .panel{border:1px solid var(--line);border-radius:8px;overflow:hidden}
    .panel h3{margin:0;padding:7px 10px;background:#edf3ee;color:var(--green);font-size:8.5pt;text-transform:uppercase;letter-spacing:.5px}
    .panel .body{padding:10px;min-height:70px;font-size:9.5pt;line-height:1.45}
    table{width:100%;border-collapse:collapse;margin:14px 0 10px;font-size:9pt}
    thead th{background:var(--green);color:#fff;padding:8px 6px;text-align:left;font-size:8.5pt}
    tbody td{border-bottom:1px solid var(--line);padding:8px 6px;vertical-align:top}
    tbody tr:nth-child(even){background:#fafbf9}
    .num{text-align:right;white-space:nowrap}
    .item-description{display:block;color:var(--muted);font-size:8pt;margin-top:2px;white-space:pre-line}
    .summary-wrap{display:flex;justify-content:space-between;gap:16px;margin-top:8px}
    .note{flex:1;background:var(--cream);border-radius:8px;padding:12px;font-size:9pt}
    .totals{width:48%;border:1px solid var(--line);border-radius:8px;overflow:hidden;font-size:9.5pt}
    .total-row{display:flex;justify-content:space-between;padding:7px 10px;border-bottom:1px solid var(--line)}
    .total-row.grand{background:var(--green);color:#fff;font-weight:700;font-size:12pt;border:0}
    .bankrow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
    .bank{border:1px solid var(--line);border-radius:8px;padding:10px;font-size:8.5pt;line-height:1.45}
    .bank h3{margin:0 0 6px;color:var(--green);font-size:9pt}
    .footer{border-top:2px solid var(--gold);margin-top:16px;padding-top:10px;display:flex;justify-content:space-between;gap:12px;color:var(--muted);font-size:8pt}
    .sign{text-align:right;min-width:150px;color:var(--ink)}
    .signline{margin:22px 0 4px;border-top:1px solid #7c8982;padding-top:4px}
    .watermark{position:fixed;top:45%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:86px;font-weight:bold;color:#c0392b;opacity:.12;z-index:1000;pointer-events:none;white-space:nowrap}
    .made-with{display:none}
  </style>
</head>
<body>
  {{#if isDraft}}<div class="watermark">{{draftLabel}}</div>{{/if}}
  <div class="topbar"></div>
  <header class="brand">
    {{#if includeLogo}}<img class="logo" src="{{logoB64}}" alt="Logo">{{/if}}
    <div>
      <h1>{{company.name}}</h1>
      <p class="tagline">Homemade Non-Vegetarian Pickles</p>
      <div style="font-size:8.5pt;color:var(--muted)">Traditional recipes · Gingelly oil · Salem, Tamil Nadu</div>
    </div>
    <div class="seller">
      <b>{{company.name}}</b><br>
      {{company.address}}{{#if company.addressLine2}}, {{company.addressLine2}}{{/if}}<br>
      {{company.city}}{{#if company.state}}, {{company.state}}{{/if}} {{company.postalCode}}<br>
      {{#if company.VAT}}GSTIN: {{company.VAT}}<br>{{/if}}
      {{#if company.legalId}}PAN: {{company.legalId}}<br>{{/if}}
      {{company.phone}} · {{company.email}}
    </div>
  </header>

  <section class="dochead">
    <div>
      {{#if client.VAT}}
        <h2>TAX INVOICE</h2>
        <span class="pill">B2B · GST INVOICE</span>
      {{else}}
        {{#if client.legalId}}
          <h2>TAX INVOICE</h2>
          <span class="pill">B2B · GST INVOICE</span>
        {{else}}
          <h2>RETAIL INVOICE</h2>
          <span class="pill">B2C · CUSTOMER COPY</span>
        {{/if}}
      {{/if}}
    </div>
    <div class="meta">
      <div class="meta-row"><span>Invoice No.</span><b>{{number}}</b></div>
      <div class="meta-row"><span>{{labels.date}}</span><b>{{date}}</b></div>
      <div class="meta-row"><span>{{labels.dueDate}}</span><b>{{dueDate}}</b></div>
      {{#if client.state}}
      <div class="meta-row"><span>Place of Supply</span><b>{{client.state}}</b></div>
      {{else}}
        {{#if company.state}}<div class="meta-row"><span>Place of Supply</span><b>{{company.state}}</b></div>{{/if}}
      {{/if}}
    </div>
  </section>

  <section class="cards">
    <div class="panel">
      <h3>Supplier / Bill From</h3>
      <div class="body">
        <b>{{company.name}}</b><br>
        {{company.address}}{{#if company.addressLine2}}<br>{{company.addressLine2}}{{/if}}<br>
        {{company.city}}{{#if company.state}}, {{company.state}}{{/if}} {{company.postalCode}}<br>
        {{#if company.VAT}}GSTIN: {{company.VAT}}{{/if}}
      </div>
    </div>
    <div class="panel">
      <h3>{{labels.billTo}}</h3>
      <div class="body">
        <b>{{client.name}}</b><br>
        {{client.address}}{{#if client.addressLine2}}<br>{{client.addressLine2}}{{/if}}<br>
        {{client.city}}{{#if client.state}}, {{client.state}}{{/if}} {{client.postalCode}}<br>
        {{#if client.VAT}}GSTIN: {{client.VAT}}<br>{{/if}}
        {{#if client.contactPhone}}{{client.contactPhone}}{{/if}}{{#if client.contactEmail}} · {{client.contactEmail}}{{/if}}
        {{#if client.email}}{{client.email}}{{/if}}
      </div>
    </div>
  </section>

  <table>
    <thead>
      <tr>
        <th>{{labels.description}}</th>
        <th>{{labels.type}}</th>
        <th class="num">{{labels.quantity}}</th>
        <th class="num">{{labels.unitPrice}}</th>
        <th class="num">{{labels.vatRate}}</th>
        <th class="num">{{labels.total}}</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td><strong>{{name}}</strong>{{#if description}}<span class="item-description">{{{description}}}</span>{{/if}}</td>
        <td>{{type}}</td>
        <td class="num">{{quantity}}</td>
        <td class="num">{{../currency}} {{unitPrice}}</td>
        <td class="num">{{vatRate}}%</td>
        <td class="num"><b>{{../currency}} {{totalPrice}}</b></td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <section class="summary-wrap">
    <div class="note">
      {{#if noteExists}}
        <b>{{labels.notes}}</b><br>{{{notes}}}
      {{else}}
        <b>Thank you for choosing {{company.name}}.</b><br>
        Store in a cool, dry place. Refrigerate after opening.
      {{/if}}
      {{#if vatExemptText}}<br><em>{{vatExemptText}}</em>{{/if}}
    </div>
    <div class="totals">
      <div class="total-row"><span>{{labels.subtotal}}</span><b>{{currency}} {{subtotalBeforeDiscount}}</b></div>
      {{#if hasDiscount}}
      <div class="total-row"><span>{{labels.discount}} ({{discountRate}}%)</span><b>-{{currency}} {{discountAmount}}</b></div>
      {{/if}}
      <div class="total-row"><span>Taxable Value</span><b>{{currency}} {{totalHT}}</b></div>
      <div class="total-row"><span>CGST + SGST</span><b>{{currency}} {{totalVAT}}</b></div>
      <div class="total-row grand"><span>{{labels.grandTotal}}</span><span>{{currency}} {{totalTTC}}</span></div>
    </div>
  </section>

  {{#if paymentMethod}}
  <section class="bankrow">
    <div class="bank">
      <h3>{{labels.paymentMethod}}</h3>
      {{paymentMethod}}
      {{#if paymentDetails}}<br><br><strong>{{labels.paymentDetails}}</strong><br>{{{paymentDetails}}}{{/if}}
    </div>
    <div class="bank">
      <h3>Declaration</h3>
      We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.<br><br>
      For payment queries: {{company.phone}} · {{company.email}}
    </div>
  </section>
  {{/if}}

  <footer class="footer">
    <div>
      {{company.address}}{{#if company.addressLine2}}, {{company.addressLine2}}{{/if}}<br>
      {{#if company.VAT}}GSTIN: {{company.VAT}} · {{/if}}{{company.phone}} · {{company.email}}
    </div>
    <div class="sign">
      <b>For {{company.name}}</b>
      <div class="signline">Authorised Signatory</div>
    </div>
  </footer>
</body>
</html>
`;
