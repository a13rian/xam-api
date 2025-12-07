# ===========================================
# Base stage - Common dependencies
# ===========================================
FROM oven/bun:1-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./

# ===========================================
# Development stage
# ===========================================
FROM base AS development

ENV NODE_ENV=development

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]

# ===========================================
# Builder stage - Build the application
# ===========================================
FROM base AS builder

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Remove dev dependencies
RUN bun install --production --frozen-lockfile

# ===========================================
# Production stage - Minimal runtime image
# ===========================================
FROM oven/bun:1-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

USER nestjs

EXPOSE 3000

CMD ["bun", "run", "dist/main.js"]
