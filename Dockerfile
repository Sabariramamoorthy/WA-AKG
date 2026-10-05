FROM node:26-alpine AS builder
RUN apk add --no-cache openssl ca-certificates
WORKDIR /app

# Dependency layer — cache-friendly: only rerun when package*.json changes
COPY package*.json ./
COPY patches ./patches/
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Source & build
COPY . .
RUN npx prisma generate && npm run build

# Strip devDeps from node_modules after build
# tsx and the prisma CLI (for `db push` on boot) are needed at runtime, kept explicitly
RUN npm prune --omit=dev && npm install --no-save --legacy-peer-deps tsx typescript "prisma@$(node -p "require('./package.json').devDependencies.prisma")"

# Production image
FROM node:26-alpine AS runner
RUN apk add --no-cache openssl ca-certificates
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/scripts ./scripts
RUN sed -i 's/\r$//' scripts/docker-start.sh && mkdir -p data/media uploads

ENV NODE_ENV=production
ENV PORT=3020
ENV HOST=0.0.0.0
ENV HOSTNAME=0.0.0.0
EXPOSE 3020

CMD ["sh", "scripts/docker-start.sh"]
