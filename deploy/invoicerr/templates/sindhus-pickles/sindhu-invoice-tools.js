/**
 * Floating Sindhu invoice controls: pick B2B/B2C template + issue (leave DRAFT).
 * Loaded into Invoicerr SPA via index.html overlay.
 */
(function () {
  const TAG_B2B = "[[TEMPLATE:B2B]]";
  const TAG_B2C = "[[TEMPLATE:B2C]]";

  function invoiceIdFromPath() {
    const m = location.pathname.match(/\/invoices\/([0-9a-f-]{36})/i);
    return m ? m[1] : null;
  }

  function ensurePanel() {
    let el = document.getElementById("sindhu-invoice-tools");
    if (el) return el;
    el = document.createElement("div");
    el.id = "sindhu-invoice-tools";
    el.innerHTML = `
      <style>
        #sindhu-invoice-tools{position:fixed;right:16px;bottom:16px;z-index:99999;width:280px;background:#063f32;color:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);font:13px/1.4 Arial,Helvetica,sans-serif;padding:14px 14px 12px}
        #sindhu-invoice-tools h4{margin:0 0 8px;font:700 14px Georgia,serif;color:#e9d9ae}
        #sindhu-invoice-tools .row{display:flex;gap:8px;margin:8px 0}
        #sindhu-invoice-tools button{flex:1;border:0;border-radius:8px;padding:8px 10px;cursor:pointer;font-weight:700}
        #sindhu-invoice-tools .b2b{background:#c89b3c;color:#17251f}
        #sindhu-invoice-tools .b2c{background:#edf3ee;color:#063f32}
        #sindhu-invoice-tools .issue{background:#fff;color:#063f32;width:100%}
        #sindhu-invoice-tools .msg{min-height:16px;font-size:11px;color:#d7e6df;margin-top:6px}
        #sindhu-invoice-tools .hide{position:absolute;top:8px;right:10px;background:transparent;border:0;color:#e9d9ae;cursor:pointer;font-size:16px;padding:0;width:auto}
      </style>
      <button class="hide" type="button" title="Hide">×</button>
      <h4>Sindhu invoice template</h4>
      <div>Choose PDF layout for this invoice:</div>
      <div class="row">
        <button type="button" class="b2b" data-tpl="B2B">B2B Tax</button>
        <button type="button" class="b2c" data-tpl="B2C">B2C Retail</button>
      </div>
      <button type="button" class="issue" data-issue="1">Issue (remove Draft)</button>
      <div class="msg" id="sindhu-tools-msg"></div>
    `;
    document.body.appendChild(el);
    el.querySelector(".hide").onclick = () => el.remove();
    el.querySelectorAll("[data-tpl]").forEach((btn) => {
      btn.onclick = () => setTemplate(btn.getAttribute("data-tpl"));
    });
    el.querySelector("[data-issue]").onclick = () => issueInvoice();
    return el;
  }

  function msg(text) {
    const m = document.getElementById("sindhu-tools-msg");
    if (m) m.textContent = text || "";
  }

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) throw new Error((data && data.message) || res.statusText || "Request failed");
    return data;
  }

  function stripTags(notes) {
    return (notes || "")
      .replace(/\[\[TEMPLATE:(B2B|B2C)\]\]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  async function loadInvoice(id) {
    // list endpoint returns items; try search then fallbacks
    const listed = await api("/api/invoices");
    const invoices = listed.invoices || listed || [];
    let inv = invoices.find((i) => i.id === id);
    if (!inv) {
      const page2 = await api("/api/invoices?page=2").catch(() => null);
      const more = (page2 && page2.invoices) || [];
      inv = more.find((i) => i.id === id);
    }
    if (!inv) throw new Error("Invoice not found in list");
    return inv;
  }

  async function setTemplate(kind) {
    const id = invoiceIdFromPath();
    if (!id) return msg("Open an invoice detail page first.");
    try {
      msg("Saving " + kind + " template…");
      const inv = await loadInvoice(id);
      const tag = kind === "B2C" ? TAG_B2C : TAG_B2B;
      const notes = (stripTags(inv.notes) + "\n" + tag).trim();
      const body = {
        id: inv.id,
        clientId: inv.clientId || (inv.client && inv.client.id),
        dueDate: inv.dueDate,
        currency: inv.currency,
        notes,
        paymentMethod: inv.paymentMethod,
        paymentDetails: inv.paymentDetails,
        paymentMethodId: inv.paymentMethodId,
        discountRate: inv.discountRate || 0,
        items: (inv.items || []).map((it, idx) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          vatRate: it.vatRate,
          type: it.type || "PRODUCT",
          order: it.order != null ? it.order : idx + 1,
        })),
        sindhuTemplate: kind,
        status: inv.status,
      };
      await api("/api/invoices/" + id, { method: "PATCH", body: JSON.stringify(body) });
      msg(kind + " template saved. Re-open PDF to preview.");
    } catch (e) {
      msg(String(e.message || e));
    }
  }

  async function issueInvoice() {
    const id = invoiceIdFromPath();
    if (!id) return msg("Open an invoice detail page first.");
    try {
      msg("Issuing invoice…");
      const inv = await loadInvoice(id);
      const body = {
        id: inv.id,
        clientId: inv.clientId || (inv.client && inv.client.id),
        dueDate: inv.dueDate,
        currency: inv.currency,
        notes: inv.notes || "",
        paymentMethod: inv.paymentMethod,
        paymentDetails: inv.paymentDetails,
        paymentMethodId: inv.paymentMethodId,
        discountRate: inv.discountRate || 0,
        items: (inv.items || []).map((it, idx) => ({
          id: it.id,
          name: it.name,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          vatRate: it.vatRate,
          type: it.type || "PRODUCT",
          order: it.order != null ? it.order : idx + 1,
        })),
        status: "UNPAID",
      };
      await api("/api/invoices/" + id, { method: "PATCH", body: JSON.stringify(body) });
      msg("Issued as UNPAID (Draft watermark removed). Refresh the page.");
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      msg(String(e.message || e));
    }
  }

  function tick() {
    if (invoiceIdFromPath()) ensurePanel();
    else {
      const el = document.getElementById("sindhu-invoice-tools");
      if (el) el.remove();
    }
  }

  tick();
  setInterval(tick, 800);
  window.addEventListener("popstate", tick);
})();
