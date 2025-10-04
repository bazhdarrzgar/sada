# Port Configuration

## Overview

The Sada project has been updated to run on **port 3000** by default, with automatic fallback to higher ports (3001, 3002, etc.) if port 3000 is not available.

## Available Scripts

### Standard Development (Port 3000)
```bash
yarn dev
```
Runs the development server on port 3000. If port 3000 is busy, it will fail.

### Smart Development (Port Fallback)
```bash
yarn dev:smart
```
**Recommended**: Automatically finds the first available port starting from 3000, then falls back to 3001, 3002, etc.

## Port Changes Made

The following files were updated to use port 3000 as the default:

1. **package.json** - Updated all dev scripts
2. **docker-compose.yml** - Updated port mapping from 3001:3000 to 3000:3000
3. **start.sh** - Updated status messages
4. **Documentation files** - Updated all references in README files

## Smart Port Detection

The `start-with-port-fallback.js` script provides intelligent port detection:

- Tries port 3000 first (preferred)
- If busy, tries 3001, 3002, up to 3009
- Shows clear messages about which port is being used
- Handles graceful shutdown

## Usage Examples

```bash
# Use smart port detection (recommended)
yarn dev:smart

# Force specific port (may fail if busy)
yarn dev

# For production
yarn build
yarn start
```

## Benefits

- ✅ Primary port is now 3000 (industry standard)
- ✅ Automatic fallback prevents port conflicts
- ✅ Clear console messages show active port
- ✅ Works seamlessly in development and Docker environments
- ✅ Maintains compatibility with existing workflows