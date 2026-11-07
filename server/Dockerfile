# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy dependency files first for better layer caching
COPY package.json package-lock.json* ./

RUN npm ci --omit=dev

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "dist/index.js"]
