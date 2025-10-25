# Stage 1: Build
FROM node:22.20.0-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL (matches your local setup with /api)
ARG VITE_API_URL=https://portfolio.local/api
ENV VITE_API_URL=$VITE_API_URL

# Build with Vite
RUN npm run build

# Stage 2: Runtime
FROM node:22.20.0-alpine
WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:nodejs /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["serve", "-l", "3000", "-s", "dist"]