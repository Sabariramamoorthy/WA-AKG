"use strict";
/**
 * Sindhu's Pickles PDF template for stock Invoicerr (Handlebars).
 * B2B when `isB2B` is true (from notes [[TEMPLATE:B2B]] / buyer GSTIN), else B2C retail.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseTemplate = void 0;
exports.baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{#if isB2B}}TAX INVOICE{{else}}RETAIL INVOICE{{/if}} {{number}}</title>
  <style>
    :root{--green:#063f32;--green2:#0b5a45;--gold:#c89b3c;--cream:#f7f4ea;--ink:#17251f;--muted:#63716b;--line:#d9ded8}
    *{box-sizing:border-box}
    html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{margin:0;color:var(--ink);font:10pt/1.35 {{fontFamily}},Arial,Helvetica,sans-serif;padding:{{padding}}px}
    .topbar{height:6px;background:linear-gradient(90deg,var(--green),var(--green2),var(--gold));margin:0 0 8px}
    .brand{display:flex;align-items:flex-start;gap:12px;border-bottom:1px solid var(--line);padding-bottom:8px}
    .logo{max-height:56px;max-width:56px;object-fit:contain}
    .brand h1{margin:0;color:var(--green);font:700 18pt Georgia,serif;letter-spacing:-.4px}
    .tagline{margin:2px 0 0;color:var(--muted);font-style:italic;font-size:8.5pt}
    .seller{margin-left:auto;text-align:right;font-size:8.5pt;line-height:1.4;max-width:46%}
    .dochead{display:flex;justify-content:space-between;align-items:flex-end;margin:12px 0 8px;gap:10px}
    .dochead h2{margin:0;color:var(--green);font:700 15pt Georgia,serif}
    .pill{display:inline-block;border:1px solid var(--gold);color:var(--green);padding:2px 7px;border-radius:20px;font-size:7.5pt;font-weight:700;margin-top:4px}
    .meta{min-width:190px;background:var(--cream);border:1px solid #e9dfc8;border-radius:6px;padding:8px 10px;font-size:8.5pt}
    .meta-row{display:flex;justify-content:space-between;gap:10px;padding:1px 0}
    .meta-row span:first-child{color:var(--muted)}
    .cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0;page-break-inside:avoid;break-inside:avoid}
    .panel{border:1px solid var(--line);border-radius:6px;overflow:hidden;page-break-inside:avoid;break-inside:avoid}
    .panel h3{margin:0;padding:5px 8px;background:#edf3ee;color:var(--green);font-size:8pt;text-transform:uppercase;letter-spacing:.4px}
    .panel .body{padding:8px;min-height:54px;font-size:8.5pt;line-height:1.35}
    table{width:100%;border-collapse:collapse;margin:8px 0 6px;font-size:8.5pt}
    thead{display:table-header-group}
    thead th{background:var(--green);color:#fff;padding:6px 5px;text-align:left;font-size:8pt}
    tbody td{border-bottom:1px solid var(--line);padding:6px 5px;vertical-align:top}
    tbody tr{page-break-inside:avoid;break-inside:avoid}
    tbody tr:nth-child(even){background:#fafbf9}
    .num{text-align:right;white-space:nowrap}
    .item-description{display:block;color:var(--muted);font-size:7.5pt;margin-top:1px;white-space:pre-line}
    .summary-wrap{display:flex;justify-content:space-between;gap:12px;margin-top:6px;page-break-inside:avoid;break-inside:avoid}
    .note{flex:1;background:var(--cream);border-radius:6px;padding:8px;font-size:8.5pt}
    .totals{width:46%;border:1px solid var(--line);border-radius:6px;overflow:hidden;font-size:8.5pt;page-break-inside:avoid;break-inside:avoid}
    .total-row{display:flex;justify-content:space-between;padding:5px 8px;border-bottom:1px solid var(--line)}
    .total-row.grand{background:var(--green);color:#fff;font-weight:700;font-size:11pt;border:0}
    .closing{page-break-inside:avoid;break-inside:avoid;margin-top:10px}
    .bankrow{display:grid;grid-template-columns:1fr 1fr;gap:8px;page-break-inside:avoid;break-inside:avoid}
    .bank{border:1px solid var(--line);border-radius:6px;padding:8px;font-size:8pt;line-height:1.35;page-break-inside:avoid;break-inside:avoid}
    .bank h3{margin:0 0 4px;color:var(--green);font-size:8.5pt}
    .footer{border-top:2px solid var(--gold);margin-top:10px;padding-top:8px;display:flex;justify-content:space-between;gap:10px;color:var(--muted);font-size:7.5pt;page-break-inside:avoid;break-inside:avoid}
    .sign{text-align:right;min-width:140px;color:var(--ink)}
    .signline{margin:16px 0 3px;border-top:1px solid #7c8982;padding-top:3px}
    .watermark{position:fixed;top:45%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;font-weight:bold;color:#c0392b;opacity:.12;z-index:1000;pointer-events:none;white-space:nowrap}
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
      <div style="font-size:8pt;color:var(--muted)">Traditional recipes · Gingelly oil · Salem, Tamil Nadu</div>
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
      {{#if isB2B}}
        <h2>TAX INVOICE</h2>
        <span class="pill">B2B · GST INVOICE</span>
      {{else}}
        <h2>RETAIL INVOICE</h2>
        <span class="pill">B2C · CUSTOMER COPY</span>
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
        <b>{{labels.notes}}</b><br>{{{notesDisplay}}}
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

  <div class="closing">
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
  </div>
</body>
</html>
`;
