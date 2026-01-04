# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs
USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV MCP_TRANSPORT=http
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/server.js"]
