# Ubuntu Server Troubleshooting Guide

## Issue: "Failed to restore backup: Unexpected token '<', "<html> <h"... is not valid JSON"

This error occurs when the API endpoint returns HTML instead of JSON, typically due to Next.js routing or server configuration issues in production.

---

## Quick Diagnostics

### Step 1: Test API Endpoint Accessibility

```bash
# Test from your Ubuntu server
curl -v http://localhost:3000/api/restore/test

# Should return JSON with diagnostics
# If you get HTML or 404, the routing is broken
```

### Step 2: Check Server Logs

```bash
# If using PM2
pm2 logs

# If using systemd
journalctl -u your-service-name -f

# If running directly
# Check console output where Next.js is running
```

### Step 3: Verify Build

```bash
cd /path/to/sada
yarn build
yarn start

# Check for any build errors
```

---

## Common Issues & Solutions

### Issue 1: API Routes Not Found (404)

**Symptom:** Getting HTML 404 page instead of JSON

**Solution:**
```bash
# Ensure you're running production build correctly
yarn build
yarn start

# NOT just 'yarn dev' in production

# Verify the build includes API routes
ls -la .next/server/app/api/restore/
# Should show route.js file
```

### Issue 2: File Size Limit Exceeded

**Symptom:** Large backup files fail to upload

**Solution:**

1. **Check Nginx configuration** (if using Nginx):
```nginx
# /etc/nginx/sites-available/your-site
server {
    client_max_body_size 100M;  # Increase as needed
    ...
}

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

2. **Check Next.js configuration** (already done in next.config.js):
```javascript
api: {
  bodyParser: {
    sizeLimit: '50mb',
  },
  responseLimit: '50mb',
}
```

### Issue 3: File Permissions

**Symptom:** "EACCES: permission denied" in logs

**Solution:**
```bash
# Ensure proper permissions on directories
chmod 755 /path/to/sada/database
chmod 755 /path/to/sada/public/upload
chmod 644 /path/to/sada/database/sada.db

# Ensure the user running Next.js has write permissions
chown -R your-user:your-user /path/to/sada/database
chown -R your-user:your-user /path/to/sada/public/upload
```

### Issue 4: Module Not Found (better-sqlite3)

**Symptom:** "Cannot find module 'better-sqlite3'" in production

**Solution:**
```bash
# Rebuild native modules for production
cd /path/to/sada
npm rebuild better-sqlite3

# Or reinstall
rm -rf node_modules
yarn install --production=false
yarn build
```

### Issue 5: Temp Directory Issues

**Symptom:** "Cannot create temp directory" errors

**Solution:**
```bash
# Ensure /tmp is writable
ls -la /tmp
chmod 1777 /tmp

# Check disk space
df -h
```

### Issue 6: Process Manager Issues (PM2)

**Symptom:** Routes work sometimes but not always

**Solution:**
```bash
# Use correct PM2 configuration
pm2 delete all
pm2 start yarn --name "sada" -- start
pm2 save
pm2 startup

# Check PM2 logs
pm2 logs sada --lines 100
```

---

## Production Deployment Checklist

- [ ] Build the application: `yarn build`
- [ ] Run in production mode: `yarn start` (NOT `yarn dev`)
- [ ] Verify Node.js version: `node --version` (should be 20.x)
- [ ] Check all dependencies installed: `yarn install --production=false`
- [ ] Verify database exists: `ls -la database/sada.db`
- [ ] Check directory permissions (read/write for app user)
- [ ] Configure reverse proxy (Nginx/Apache) with proper limits
- [ ] Test API endpoint: `curl http://localhost:3000/api/restore/test`
- [ ] Check server logs for errors
- [ ] Verify better-sqlite3 compiled: `npm list better-sqlite3`

---

## Testing the Fix

### 1. Test Diagnostic Endpoint

```bash
# From Ubuntu server
curl http://localhost:3000/api/restore/test

# Should return:
# {
#   "status": "OK",
#   "checks": {
#     "admZipAvailable": true,
#     "sqliteAvailable": true,
#     ...
#   }
# }
```

### 2. Test Restore API

```bash
# Create a small test backup first
curl http://localhost:3000/api/backup -o test-backup.zip

# Try to restore it
curl -X POST http://localhost:3000/api/restore \
  -F "backupFile=@test-backup.zip" \
  -v

# Should return JSON, not HTML
```

### 3. Check Response Headers

```bash
# Verify Content-Type is application/json
curl -I http://localhost:3000/api/restore/test

# Should show:
# Content-Type: application/json
```

---

## Server Configuration Examples

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Increase body size for file uploads
    client_max_body_size 100M;
    client_body_timeout 300s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for large uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    # Increase body size
    LimitRequestBody 104857600
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Increase timeout
    ProxyTimeout 300
</VirtualHost>
```

### PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'sada',
    script: 'yarn',
    args: 'start',
    cwd: '/path/to/sada',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};

// Start with:
// pm2 start ecosystem.config.js
```

### Systemd Service

```ini
# /etc/systemd/system/sada.service
[Unit]
Description=Sada School Management System
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/sada
ExecStart=/usr/bin/yarn start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable sada
sudo systemctl start sada
sudo systemctl status sada

# View logs
sudo journalctl -u sada -f
```

---

## Environment Variables

Ensure these are set in your production environment:

```bash
# .env.production or set in your environment
NODE_ENV=production
PORT=3000

# Optional: Custom paths if needed
# DATABASE_PATH=/custom/path/to/database
# UPLOAD_PATH=/custom/path/to/uploads
```

---

## Debugging Commands

```bash
# Check if Next.js is running
ps aux | grep next

# Check port binding
netstat -tlnp | grep 3000

# Test API route directly
curl -X POST http://localhost:3000/api/restore \
  -H "Content-Type: multipart/form-data" \
  -F "backupFile=@backup.zip" \
  -v 2>&1 | grep "Content-Type"

# Check Next.js build output
ls -la .next/server/app/api/

# Verify all dependencies
yarn list better-sqlite3
yarn list adm-zip
yarn list archiver

# Check Node.js version
node --version  # Must be 20.x

# Test SQLite
node -e "const db = require('better-sqlite3')('./database/sada.db'); console.log('SQLite OK');"
```

---

## Contact & Support

If issues persist after following this guide:

1. Check the diagnostic endpoint output: `/api/restore/test`
2. Collect server logs from the time of error
3. Note your:
   - Ubuntu version
   - Node.js version
   - Deployment method (PM2/systemd/Docker/manual)
   - Reverse proxy (Nginx/Apache/none)
4. Create an issue with all the above information

---

## Quick Fix Checklist

✅ Rebuild the application: `yarn build`
✅ Use production start: `yarn start` (not dev)
✅ Test diagnostic: `curl localhost:3000/api/restore/test`
✅ Check logs for actual error messages
✅ Verify file permissions on database and upload directories
✅ Ensure reverse proxy allows large files
✅ Rebuild better-sqlite3: `npm rebuild better-sqlite3`
✅ Clear Next.js cache: `rm -rf .next`
