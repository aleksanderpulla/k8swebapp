# Stage 1: Build
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev for TypeScript compilation)
RUN npm ci

# Copy source code
COPY . .

# Copy tsconfig with skipLibCheck
# (Ensure tsconfig.json has "skipLibCheck": true to avoid drizzle-orm type errors)

# Build TypeScript to JavaScript
RUN npx tsc --skipLibCheck

# Verify dist folder was created
RUN ls -la dist/ || (echo "ERROR: dist folder not created!" && exit 1)

# Stage 2: Runtime
FROM node:22.20.0-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 5000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/index.js"]