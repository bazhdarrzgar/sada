# Production Dockerfile for Sada School Management System with SQLite
# Use Debian-based image instead of Alpine for better-sqlite3 compatibility
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps

# Install necessary build tools and runtime libraries for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    sqlite3 \
    libsqlite3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

# Copy package files for better layer caching
COPY package.json yarn.lock ./

# Set Python path for native module compilation
ENV PYTHON=/usr/bin/python3

# Install node-gyp globally for native module compilation
RUN npm install -g node-gyp

# Install dependencies with extended timeout
RUN echo "✅ Installing with yarn..." && \
    yarn install --frozen-lockfile --production=false --network-timeout 1000000

# Rebuild the source code only when needed
FROM base AS builder

# Install build tools for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

# Copy dependencies from previous stage
COPY --from=deps /home/app/node_modules ./node_modules

# Copy source code
COPY . .

# Set Python path for native module compilation
ENV PYTHON=/usr/bin/python3

# Install node-gyp globally
RUN npm install -g node-gyp

# Completely remove and reinstall better-sqlite3 from source
RUN echo "🔨 Building better-sqlite3 from source for Node $(node -v)..." && \
    rm -rf /home/app/node_modules/better-sqlite3 && \
    npm install better-sqlite3@12.4.1 --build-from-source --verbose

# Verify better-sqlite3 works before building
RUN node -e "const Database = require('better-sqlite3'); console.log('✅ better-sqlite3 loaded successfully');" || \
    (echo "❌ better-sqlite3 failed to load" && exit 1)

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN yarn build

# Production image - copy all the files and run next
FROM base AS runner

# Install SQLite runtime libraries
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --home /home/app nextjs

# Copy public assets
COPY --from=builder /home/app/public ./public

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

# Create temp directory for backup/restore operations with proper permissions
RUN mkdir -p /tmp/sada_temp && \
    chown -R nextjs:nodejs /tmp/sada_temp && \
    chmod -R 755 /tmp/sada_temp

# Copy standalone output and static files with proper ownership
COPY --from=builder --chown=nextjs:nodejs /home/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /home/app/.next/static ./.next/static

# Copy database files if they exist
COPY --from=builder --chown=nextjs:nodejs /home/app/database ./database

# Copy scripts if needed
COPY --from=builder --chown=nextjs:nodejs /home/app/scripts ./scripts

# Ensure proper ownership of home directory
RUN chown -R nextjs:nodejs /home/app

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