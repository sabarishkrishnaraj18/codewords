# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/socket-server/package.json ./package.json
COPY apps/socket-server/tsconfig.json ./tsconfig.json
COPY apps/socket-server/src ./src

# Install all deps (including devDeps for typescript)
RUN npm install

# Compile TypeScript
RUN npx tsc

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./package.json

# Install production deps only
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
