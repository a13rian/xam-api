# ===========================================
# Base stage - Common dependencies
# ===========================================
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./

# ===========================================
# Development stage
# ===========================================
FROM base AS development

ENV NODE_ENV=development

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]

# ===========================================
# Builder stage - Build the application
# ===========================================
FROM base AS builder

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Remove dev dependencies
RUN yarn install --production --frozen-lockfile && yarn cache clean

# ===========================================
# Production stage - Minimal runtime image
# ===========================================
FROM node:22-alpine AS production

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

CMD ["node", "dist/main.js"]
