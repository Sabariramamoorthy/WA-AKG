#!/usr/bin/env python3
"""Apply Sindhu email templates to a running Invoicerr instance via API + DB for RECEIPT/reminder."""
from __future__ import annotations

import json
import pathlib
import sys
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
BASE = sys.argv[1] if len(sys.argv) > 1 else "https://invoicerr.app.cloudshiftsolutions.in"
EMAIL = sys.argv[2] if len(sys.argv) > 2 else "sabarimani.ramamoorthi@gmail.com"
PASSWORD = sys.argv[3] if len(sys.argv) > 3 else ""

if not PASSWORD:
    print("Usage: apply-email-templates.py <base_url> <email> <password>", file=sys.stderr)
    sys.exit(2)


def req(method: str, path: str, data=None, cookie: str | None = None):
    body = None if data is None else json.dumps(data).encode()
    r = urllib.request.Request(BASE + path, data=body, method=method)
    r.add_header("Origin", BASE)
    if cookie:
        r.add_header("Cookie", cookie)
    if data is not None:
        r.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(r, timeout=60) as resp:
        raw = resp.read().decode() or "null"
        return resp.status, json.loads(raw), resp.headers.get_all("Set-Cookie") or []


def main():
    st, _, cookies = req(
        "POST",
        "/api/auth/sign-in/email",
        {"email": EMAIL, "password": PASSWORD},
    )
    assert st == 200, st
    cookie = None
    for c in cookies:
        if c.startswith("better-auth.session_token="):
            cookie = c.split(";", 1)[0]
            break
    if not cookie:
        raise SystemExit("no session cookie")

    st, templates, _ = req("GET", "/api/company/email-templates", cookie=cookie)
    by = {t["id"]: t for t in templates}
    print("existing", sorted(by))

    mapping = {
        "INVOICE": (
            "Invoice {{INVOICE_NUMBER}} from Sindhu's Pickles",
            HERE / "email-invoice.invoicerr.html",
        ),
        "PAYMENT": (
            "Payment received — {{PAYMENT_NUMBER}}",
            HERE / "email-payment-received.invoicerr.html",
        ),
        "SIGNATURE_REQUEST": (
            "Please sign document #{{SIGNATURE_NUMBER}} — Sindhu's Pickles",
            HERE / "email-signature-request.invoicerr.html",
        ),
        "VERIFICATION_CODE": (
            "Your Sindhu's Pickles verification code",
            HERE / "email-verification-code.invoicerr.html",
        ),
    }

    for tid, (subject, path) in mapping.items():
        body = path.read_text()
        st, _, _ = req(
            "PUT",
            "/api/company/email-templates",
            {"dbId": by[tid]["dbId"], "subject": subject, "body": body},
            cookie=cookie,
        )
        print("updated", tid, st, path.name)

    # Payment reminder: store under deprecated RECEIPT enum slot (visible in DB; pack reference in repo)
    reminder = (HERE / "email-payment-reminder.invoicerr.html").read_text()
    print(
        "REMINDER_SQL",
        json.dumps(
            {
                "type": "RECEIPT",
                "subject": "Payment reminder: Invoice {{INVOICE_NUMBER}}",
                "body": reminder,
            }
        ),
    )
    print("done")


if __name__ == "__main__":
    main()
