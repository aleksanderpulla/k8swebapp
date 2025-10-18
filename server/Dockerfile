# Stage 1: Build
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript
RUN echo "Starting TypeScript compilation..." && \
    npx tsc --skipLibCheck && \
    echo "TypeScript compilation complete"

# Verify dist/index.js was created
RUN if [ -f "/app/dist/src/index.js" ]; then \
      echo "✓ SUCCESS: dist/src/index.js created"; \
    else \
      echo "✗ FAILED: dist/src/index.js not found"; \
      exit 1; \
    fi

# Stage 2: Runtime
FROM node:22.20.0-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Verify the compiled app exists
RUN if [ ! -f "dist/src/index.js" ]; then \
      echo "ERROR: dist/src/index.js not found!"; \
      exit 1; \
    fi

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 5000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/src/index.js"]