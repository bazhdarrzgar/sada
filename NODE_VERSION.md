# Node.js Version Requirements

## Required Version
This project requires **Node.js 20.x** or higher.

## Why Node 20?
- Better performance and stability
- Required for better-sqlite3 native module compilation
- Support for latest Next.js features
- Long-term support (LTS) version

## Version Configuration Files

### .nvmrc
Used by nvm (Node Version Manager):
```
20
```

### .node-version
Used by other version managers (nodenv, n, etc.):
```
20.0.0
```

### package.json
Enforced in package.json engines field:
```json
"engines": {
  "node": ">=20.0.0",
  "yarn": ">=1.22.0"
}
```

## Installation

### Using nvm (recommended)
```bash
# Install nvm if you haven't
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 20
nvm install 20
nvm use 20

# Verify version
node --version
```

### Using nodenv
```bash
nodenv install 20.0.0
nodenv local 20.0.0
```

### Using n
```bash
n 20
```

## Docker Deployment
All Dockerfiles are configured to use Node 20:
- `Dockerfile` - Uses `node:20-slim`
- `Dockerfile.simple` - Uses `node:20-alpine`
- `Dockerfile.dev` - Uses `node:20-alpine`
- `Dockerfile.fixed` - Uses `node:20-alpine`
- `Dockerfile.improved` - Uses `node:20-alpine`

## Verification
Check your Node version:
```bash
node --version
# Should output: v20.x.x
```

## Troubleshooting

### If you have a different Node version
1. Install Node 20 using one of the methods above
2. Delete node_modules and yarn.lock
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules yarn.lock
   yarn install
   ```

### For better-sqlite3 issues
If you get native module errors:
```bash
npm rebuild better-sqlite3
```

## CI/CD
Make sure your CI/CD pipeline uses Node 20:
- GitHub Actions: Use `node-version: 20`
- GitLab CI: Use `node:20-alpine` image
- Jenkins: Install Node 20 via nvm or package manager
