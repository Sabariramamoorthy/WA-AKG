#!/bin/sh

# Navigate to the backend directory where the compiled code and config are
cd /usr/share/nginx/backend/src

echo "[DEBUG] - Listing files in /usr/share/nginx/backend"
ls -la /usr/share/nginx/backend

echo "[DEBUG] - Listing files in /usr/share/nginx/backend/src"
ls -la /usr/share/nginx/backend/src

echo "[DEBUG] - Listing files in /usr/share/nginx/backend/prisma"
ls -la /usr/share/nginx/backend/prisma

echo "[DEBUG] - Listing files in /usr/share/nginx/backend/src/prisma"
ls -la /usr/share/nginx/backend/src/prisma

echo "[DEBUG] - Listing files in /"
ls -la /

echo "[DEBUG] - Architecture info"
uname -a

# Create runtime config for frontend (populated from environment variables)
echo "[DEBUG] - Writing frontend runtime config to /usr/share/nginx/html/config.json"
mkdir -p /usr/share/nginx/html
cat > /usr/share/nginx/html/config.json <<EOF
{
  "VITE_OIDC_PROVIDER_ID": "${OIDC_NAME:-}"
}
EOF

# Push FULL current schema (not schema-v1.4.4a) so Company.payment* and Article exist.
echo "Pushing database schema..."
cd /usr/share/nginx/backend
npx prisma db push --accept-data-loss --schema=/usr/share/nginx/backend/prisma/schema.prisma
cd /usr/share/nginx/backend/src

# Overlay Sindhu B2B/B2C invoice PDF template (sidecar file or GitHub raw fallback).
TPL_DST=/usr/share/nginx/backend/src/modules/invoices/templates/base.template.js
TPL_SRC=/usr/share/nginx/backend/src/modules/invoices/templates/base.template.js.sindhu
RAW_BASE="${SINDHU_PACK_RAW_BASE:-https://raw.githubusercontent.com/Sabariramamoorthy/WA-AKG/cursor/invoicerr-phase1-baseline-a84b/deploy/invoicerr/templates/sindhus-pickles}"
TPL_URL="${SINDHU_INVOICE_TEMPLATE_URL:-$RAW_BASE/invoicerr-base.template.js}"
if [ -f "$TPL_SRC" ]; then
  echo "Applying Sindhu invoice PDF template overlay (sidecar)..."
  cp "$TPL_SRC" "$TPL_DST"
elif command -v curl >/dev/null 2>&1; then
  echo "Fetching Sindhu invoice PDF template overlay..."
  curl -fsSL "$TPL_URL" -o "$TPL_DST" || echo "WARN: could not fetch Sindhu template; keeping image default"
fi

# SPA overlays: tools panel, template master, B2B/B2C HTML references
if command -v curl >/dev/null 2>&1; then
  echo "Fetching Sindhu SPA overlays..."
  curl -fsSL "$RAW_BASE/sindhu-invoice-tools.js" -o /usr/share/nginx/html/sindhu-invoice-tools.js || true
  curl -fsSL "$RAW_BASE/sindhu-templates.html" -o /usr/share/nginx/html/sindhu-templates.html || true
  mkdir -p /usr/share/nginx/html/sindhu-ref
  curl -fsSL "$RAW_BASE/invoice-b2b.html" -o /usr/share/nginx/html/sindhu-ref/invoice-b2b.html || true
  curl -fsSL "$RAW_BASE/invoice-b2c.html" -o /usr/share/nginx/html/sindhu-ref/invoice-b2c.html || true
  curl -fsSL "$RAW_BASE/invoice.css" -o /usr/share/nginx/html/sindhu-ref/invoice.css || true
  if [ -f /usr/share/nginx/html/index.html ] && ! grep -q sindhu-invoice-tools.js /usr/share/nginx/html/index.html; then
    sed -i 's#</body>#<script src="/sindhu-invoice-tools.js" defer></script>\n</body>#' /usr/share/nginx/html/index.html || true
  fi
fi

# Patch invoices.service.js for Draft→Unpaid + template notes (idempotent script if present)
if [ -f /usr/share/nginx/backend/src/modules/invoices/patch-invoices-service.js ]; then
  node /usr/share/nginx/backend/src/modules/invoices/patch-invoices-service.js || true
elif command -v curl >/dev/null 2>&1; then
  curl -fsSL "$RAW_BASE/patch-invoices-service.js" -o /tmp/patch-invoices-service.js && \
    node /tmp/patch-invoices-service.js || true
fi

# Start the backend service
echo "Starting backend service..."
node main.js &

# Wait for backend to be ready
echo "Waiting for backend to start..."
while ! nc -z localhost 3000; do
    sleep 1
done

echo "Backend is ready, starting nginx..."
nginx -g "daemon off;" >/dev/null 2>&1
