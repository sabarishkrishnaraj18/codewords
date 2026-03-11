# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY apps/socket-server/package.json ./apps/socket-server/
COPY apps/socket-server/tsconfig.json ./apps/socket-server/
COPY apps/socket-server/src ./apps/socket-server/src

# Install all workspace deps at root
RUN npm install --ignore-scripts

# Compile TypeScript
RUN cd apps/socket-server && node ../../node_modules/typescript/bin/tsc

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/apps/socket-server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/socket-server/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]
