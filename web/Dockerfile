# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json package-lock.json* ./

RUN npm ci --omit=dev

# Copy application source
COPY . .

# Build the application
RUN npm run build

EXPOSE 5173

ENV NODE_ENV=production
ENV VITE_API_BASE=/api

# Serve the built app with a lightweight static server
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "5173"]
