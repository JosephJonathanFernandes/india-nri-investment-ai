# syntax=docker/dockerfile:1
# =============================================================================
# Build stage
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev for build)
RUN npm ci

# Copy application source
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5173

ENV NODE_ENV=production
ENV VITE_API_BASE=/api

CMD ["serve", "-s", "dist", "-l", "5173"]
