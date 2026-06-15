# ============================================================
# Stage 1: Build — Install deps & compile TypeScript
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ============================================================
# Stage 2: Production — Lean runtime image
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy only runtime dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose the API port
EXPOSE 5000

# Generate Prisma client and start app
CMD ["sh", "-c", "npx prisma generate && node dist/main"]
