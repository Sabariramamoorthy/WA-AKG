/**
 * Sindhu invoice controls for stock Invoicerr SPA.
 * - B2B / B2C template picker (create form + invoice detail)
 * - Status actions: Issue (UNPAID), Mark Paid, Send
 * Stock Invoicerr has no invoice-template master or create-form template field.
 */
(function () {
  const TAG_B2B = "[[TEMPLATE:B2B]]";
  const TAG_B2C = "[[TEMPLATE:B2C]]";
  const LS_KEY = "sindhuPreferredTemplate";

  function preferred() {
    try {
      return localStorage.getItem(LS_KEY) || "B2B";
    } catch {
      return "B2B";
    }
  }

  function setPreferred(kind) {
    try {
      localStorage.setItem(LS_KEY, kind);
    } catch {}
  }

  function invoiceIdFromPath() {
    const m = location.pathname.match(/\/invoices\/([0-9a-f-]{36})/i);
    return m ? m[1] : null;
  }

  function onInvoicesArea() {
    return /^\/invoices(\/|$)/.test(location.pathname) || location.pathname === "/";
  }

  function stripTags(notes) {
    return (notes || "")
      .replace(/\[\[TEMPLATE:(B2B|B2C)\]\]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function withTag(notes, kind) {
    const tag = kind === "B2C" ? TAG_B2C : TAG_B2B;
    return (stripTags(notes) + "\n" + tag).trim();
  }

  function findNotesField() {
    const areas = Array.from(document.querySelectorAll("textarea"));
    for (const ta of areas) {
      const id = (ta.id || "").toLowerCase();
      const name = (ta.name || "").toLowerCase();
      const ph = (ta.placeholder || "").toLowerCase();
      const label =
        (ta.labels && ta.labels[0] && ta.labels[0].textContent) ||
        (ta.getAttribute("aria-label") || "") ||
        "";
      const blob = (id + " " + name + " " + ph + " " + label).toLowerCase();
      if (blob.includes("note")) return ta;
    }
    // fallback: largest visible textarea in dialogs/forms
    const visible = areas.filter((ta) => ta.offsetParent !== null);
    return visible.sort((a, b) => (b.offsetHeight || 0) - (a.offsetHeight || 0))[0] || null;
  }

  function setNotesTemplate(kind) {
    setPreferred(kind);
    const ta = findNotesField();
    if (!ta) {
      msg(kind + " preferred. Open Notes on the form, or save after create then set on detail.");
      return false;
    }
    const start = ta.selectionStart;
    ta.value = withTag(ta.value, kind);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.dispatchEvent(new Event("change", { bubbles: true }));
    try {
      ta.setSelectionRange(start, start);
    } catch {}
    msg(kind + " template tag written into Notes. Save the invoice.");
    return true;
  }

  function ensurePanel() {
    let el = document.getElementById("sindhu-invoice-tools");
    if (el) return el;
    el = document.createElement("div");
    el.id = "sindhu-invoice-tools";
    el.innerHTML = `
      <style>
        #sindhu-invoice-tools{position:fixed;right:16px;bottom:16px;z-index:99999;width:300px;background:#063f32;color:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.25);font:13px/1.4 Arial,Helvetica,sans-serif;padding:14px 14px 12px}
        #sindhu-invoice-tools h4{margin:0 0 6px;font:700 14px Georgia,serif;color:#e9d9ae}
        #sindhu-invoice-tools .sub{font-size:11px;color:#c9d9d1;margin:0 0 8px}
        #sindhu-invoice-tools .row{display:flex;gap:8px;margin:8px 0}
        #sindhu-invoice-tools button{flex:1;border:0;border-radius:8px;padding:8px 10px;cursor:pointer;font-weight:700}
        #sindhu-invoice-tools .b2b{background:#c89b3c;color:#17251f}
        #sindhu-invoice-tools .b2c{background:#edf3ee;color:#063f32}
        #sindhu-invoice-tools .issue,#sindhu-invoice-tools .paid,#sindhu-invoice-tools .send{background:#fff;color:#063f32;width:100%;margin-top:6px}
        #sindhu-invoice-tools .paid{background:#e9d9ae}
        #sindhu-invoice-tools .msg{min-height:16px;font-size:11px;color:#d7e6df;margin-top:6px}
        #sindhu-invoice-tools .hide{position:absolute;top:8px;right:10px;background:transparent;border:0;color:#e9d9ae;cursor:pointer;font-size:16px;padding:0;width:auto}
        #sindhu-invoice-tools a.master{display:inline-block;margin-top:8px;color:#e9d9ae;font-size:11px}
        #sindhu-invoice-tools .status{font-size:11px;color:#e9d9ae;margin-top:4px}
      </style>
      <button class="hide" type="button" title="Hide">×</button>
      <h4>Sindhu invoice tools</h4>
      <p class="sub">Stock create form has no template field — use these buttons. Tag is saved in Notes.</p>
      <div>PDF template type:</div>
      <div class="row">
        <button type="button" class="b2b" data-tpl="B2B">B2B Tax</button>
        <button type="button" class="b2c" data-tpl="B2C">B2C Retail</button>
      </div>
      <div class="status" id="sindhu-status-line">Status: —</div>
      <button type="button" class="issue" data-issue="1">Issue (Draft → Unpaid)</button>
      <button type="button" class="paid" data-paid="1">Mark as Paid</button>
      <button type="button" class="send" data-send="1">Send by email</button>
      <a class="master" href="/sindhu-templates.html" target="_blank" rel="noopener">Open Template Master</a>
      <div class="msg" id="sindhu-tools-msg"></div>
    `;
    document.body.appendChild(el);
    el.querySelector(".hide").onclick = () => el.remove();
    el.querySelectorAll("[data-tpl]").forEach((btn) => {
      btn.onclick = () => applyTemplate(btn.getAttribute("data-tpl"));
    });
    el.querySelector("[data-issue]").onclick = () => setStatus("UNPAID");
    el.querySelector("[data-paid]").onclick = () => markPaid();
    el.querySelector("[data-send]").onclick = () => sendInvoice();
    return el;
  }

  function msg(text) {
    const m = document.getElementById("sindhu-tools-msg");
    if (m) m.textContent = text || "";
  }

  function setStatusLine(text) {
    const m = document.getElementById("sindhu-status-line");
    if (m) m.textContent = text || "Status: —";
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
    if (!res.ok) throw new Error((data && (data.message || data.error)) || res.statusText || "Request failed");
    return data;
  }

  async function loadInvoice(id) {
    const listed = await api("/api/invoices");
    const invoices = listed.invoices || listed || [];
    let inv = invoices.find((i) => i.id === id);
    if (!inv) {
      for (let page = 2; page <= 5 && !inv; page++) {
        const more = await api("/api/invoices?page=" + page).catch(() => null);
        const rows = (more && more.invoices) || [];
        inv = rows.find((i) => i.id === id);
      }
    }
    if (!inv) throw new Error("Invoice not found in list");
    return inv;
  }

  function patchBody(inv, extra) {
    return {
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
      status: inv.status,
      ...extra,
    };
  }

  async function applyTemplate(kind) {
    setPreferred(kind);
    const id = invoiceIdFromPath();
    if (!id) {
      setNotesTemplate(kind);
      return;
    }
    try {
      msg("Saving " + kind + " template…");
      const inv = await loadInvoice(id);
      setStatusLine("Status: " + (inv.status || "—"));
      await api("/api/invoices/" + id, {
        method: "PATCH",
        body: JSON.stringify(
          patchBody(inv, {
            notes: withTag(inv.notes, kind),
            sindhuTemplate: kind,
            status: inv.status,
          })
        ),
      });
      // also sync open notes field if editing
      setNotesTemplate(kind);
      msg(kind + " template saved. Re-open PDF to preview.");
    } catch (e) {
      msg(String(e.message || e));
    }
  }

  async function setStatus(next) {
    const id = invoiceIdFromPath();
    if (!id) return msg("Open an invoice (PDF/detail URL) to change status.");
    try {
      msg("Setting status to " + next + "…");
      const inv = await loadInvoice(id);
      await api("/api/invoices/" + id, {
        method: "PATCH",
        body: JSON.stringify(patchBody(inv, { status: next })),
      });
      setStatusLine("Status: " + next);
      msg("Status → " + next + ". Refresh the page.");
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      msg(String(e.message || e));
    }
  }

  async function markPaid() {
    const id = invoiceIdFromPath();
    if (!id) return msg("Open an invoice detail/PDF page first. Or use list → Mark as paid.");
    try {
      msg("Creating payment (marks invoice Paid)…");
      await api("/api/payments/create-from-invoice", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      setStatusLine("Status: PAID");
      msg("Payment recorded — invoice is PAID. Refresh the page.");
      setTimeout(() => location.reload(), 900);
    } catch (e) {
      msg(String(e.message || e));
    }
  }

  async function sendInvoice() {
    const id = invoiceIdFromPath();
    if (!id) return msg("Open an invoice detail/PDF page first.");
    try {
      msg("Sending invoice email…");
      await api("/api/invoices/send", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      setStatusLine("Status: SENT");
      msg("Invoice emailed (status SENT if SMTP configured).");
    } catch (e) {
      msg(String(e.message || e));
    }
  }

  async function refreshStatus() {
    const id = invoiceIdFromPath();
    if (!id) {
      setStatusLine("Status: (create/list — pick template in Notes)");
      return;
    }
    try {
      const inv = await loadInvoice(id);
      const kind = /\[\[TEMPLATE:B2C\]\]/.test(inv.notes || "")
        ? "B2C"
        : /\[\[TEMPLATE:B2B\]\]/.test(inv.notes || "")
          ? "B2B"
          : preferred();
      setStatusLine("Status: " + (inv.status || "—") + " · Template: " + kind);
    } catch {
      setStatusLine("Status: —");
    }
  }

  function tick() {
    if (onInvoicesArea() || invoiceIdFromPath()) {
      ensurePanel();
      refreshStatus();
    } else {
      const el = document.getElementById("sindhu-invoice-tools");
      if (el) el.remove();
    }
  }

  // Prefill notes when create dialog appears
  const mo = new MutationObserver(() => {
    const ta = findNotesField();
    if (!ta || ta.dataset.sindhuPrefill === "1") return;
    if (!ta.value || !/\[\[TEMPLATE:/.test(ta.value)) {
      // only auto-tag empty notes on create forms
      if (!ta.value.trim()) {
        const kind = preferred();
        ta.value = withTag("", kind);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.dataset.sindhuPrefill = "1";
      }
    } else {
      ta.dataset.sindhuPrefill = "1";
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  tick();
  setInterval(tick, 1200);
  window.addEventListener("popstate", tick);
})();
