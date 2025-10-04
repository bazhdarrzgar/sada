# Production Dockerfile for Sada School Management System with SQLite
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps

# Install necessary build tools for better-sqlite3 compilation
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    sqlite \
    sqlite-dev \
    git

WORKDIR /app

# Copy package files for better layer caching
COPY package.json yarn.lock ./

# Install dependencies
RUN echo "✅ Installing with yarn..." && \
    yarn --frozen-lockfile --production=false

# Rebuild the source code only when needed
FROM base AS builder

# Install build tools for better-sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN yarn build

# Production image - copy all the files and run next
FROM base AS runner

# Install SQLite runtime
RUN apk add --no-cache \
    sqlite \
    libc6-compat

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with proper permissions
RUN mkdir -p .next && \
    chown nextjs:nodejs .next

# Create database directory with proper permissions for SQLite
RUN mkdir -p ./database && \
    chown -R nextjs:nodejs ./database && \
    chmod -R 755 ./database

# Create upload directory with proper permissions for file uploads
RUN mkdir -p ./public/upload && \
    chown -R nextjs:nodejs ./public/upload && \
    chmod -R 755 ./public/upload

# Create subdirectories for different types of uploads
RUN mkdir -p ./public/upload/{uploads,images,videos,documents} && \
    chown -R nextjs:nodejs ./public/upload && \
    chmod -R 755 ./public/upload

# Copy standalone output and static files with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database files if they exist
COPY --from=builder --chown=nextjs:nodejs /app/database ./database

# Copy scripts if needed
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for container health monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { \
    if (res.statusCode === 200) process.exit(0); \
    else process.exit(1); \
  }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "server.js"]