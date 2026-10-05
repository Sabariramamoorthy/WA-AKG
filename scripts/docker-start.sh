#!/bin/sh
set -e

npx prisma db push --skip-generate

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  node scripts/setup-admin.js "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
fi

exec node node_modules/tsx/dist/cli.mjs src/server/index.ts
