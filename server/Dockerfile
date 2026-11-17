# syntax=docker/dockerfile:1
# =============================================================================
# Build stage
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for native modules (prisma, bcrypt)
RUN apk add --no-cache python3 make g++

# Copy dependency files first for better layer caching
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install minimal runtime dependencies
RUN apk add --no-cache python3 make g++

# Copy only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "dist/index.js"]
