FROM node:22-alpine AS base

# ── deps stage ──────────────────────────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ── builder stage ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Force exact Prisma 5.x — npm may resolve ^5 to v7 which has breaking schema changes
RUN npm install --save-exact prisma@5.22.0 @prisma/client@5.22.0
RUN npx prisma generate

# Ensure public dir exists (Next.js standalone expects it, even if empty)
RUN mkdir -p public

# Use build:docker (no --turbopack) — turbopack can silently fail in Docker
# DATABASE_URL is needed by Prisma at build time for type generation
# NEXT_TELEMETRY_DISABLED silences the telemetry prompt that can stall CI
ENV NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL="mysql://build:build@localhost:3306/build" npm run build:docker

# Verify the build actually produced standalone output
RUN test -d .next/standalone || (echo "ERROR: next build failed, .next/standalone missing" && exit 1)

# Compile custom server to CJS for production (ignore non-critical tsc warnings)
RUN npx tsc server.ts \
      --outDir . \
      --module commonjs \
      --target es2020 \
      --esModuleInterop \
      --skipLibCheck \
      --resolveJsonModule \
      --moduleResolution node \
      2>&1 | grep -v "TS" | cat; \
    test -f server.js || (echo "ERROR: server.ts compilation failed" && exit 1)

# ── runner stage ────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Tell Prisma not to download engines at runtime — use the ones compiled in the image
ENV PRISMA_ENGINES_MIRROR=""
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public dir if it exists (created by builder stage above)
COPY --from=builder /app/public ./public

# Custom server (compiled JS)
COPY --from=builder /app/server.js ./server.js

# Prisma
COPY --from=builder /app/prisma ./prisma
# Copy all node_modules from builder (has exact pinned Prisma 5.x, not v7)
COPY --from=builder /app/node_modules ./node_modules

# Install OpenSSL (required by Prisma engines)
RUN apk add --no-cache openssl

# Fix permissions so nextjs user can write to node_modules (Prisma engine extraction)
RUN chown -R nextjs:nodejs /app/node_modules

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
