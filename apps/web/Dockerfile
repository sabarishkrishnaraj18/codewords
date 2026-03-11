# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/web/next.config.mjs ./apps/web/
COPY apps/web/tailwind.config.ts ./apps/web/
COPY apps/web/postcss.config.mjs ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public

# Install all workspace deps at root
RUN npm install --ignore-scripts

# Build Next.js (standalone output)
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED=1
RUN node ../../node_modules/next/dist/bin/next build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
