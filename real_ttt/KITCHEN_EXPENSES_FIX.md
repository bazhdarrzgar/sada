# Kitchen Expenses Module Fix - VPS Issue

## Problem
The Kitchen Expenses module ("خەرجی خواردنگە") was unable to save new entries on VPS, showing "Failed to save kitchen expense" error. This issue only occurred on VPS, not on local PC.

## Root Cause
The frontend code was using the default API URL (`http://localhost:3000`) which works on local development but fails on VPS. When the browser tries to make API calls to `localhost`, it refers to the user's local machine, not the VPS server.

## Solution
Added the `NEXT_PUBLIC_API_URL` environment variable to `.env.local` file with the correct VPS domain:

```env
NEXT_PUBLIC_API_URL=http://berdozmanagement.work.gd:3000
```

### Why This Works
- The `NEXT_PUBLIC_` prefix makes the variable available to the browser/client-side code
- The frontend now correctly points to `http://berdozmanagement.work.gd:3000` instead of `localhost`
- API calls from the browser now reach the actual VPS server

## Files Modified
1. `/app/.env.local` - Added `NEXT_PUBLIC_API_URL` configuration

## Testing
Backend API has been tested and verified working:
```bash
✅ GET /api/kitchen-expenses - Returns all records
✅ POST /api/kitchen-expenses - Creates new records successfully
✅ MongoDB - Records are being saved correctly
```

## What You Need to Do on Your VPS

1. **Update the .env.local file** on your VPS with this content:
```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=berdoz_management
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://berdozmanagement.work.gd:3000
```

2. **Restart the Next.js server** to apply the changes:
```bash
# Stop the current server
pkill -f "next dev"

# Start the server again
cd /app
yarn dev
```

Or if you're using PM2:
```bash
pm2 restart all
```

3. **Clear browser cache** or do a hard refresh (Ctrl+F5) after restarting the server

## Verification Steps
After applying the fix:

1. Login to your application at `http://berdozmanagement.work.gd:3000`
2. Navigate to Kitchen Expenses (خەرجی خواردنگە)
3. Click "Add New Entry" button
4. Fill in the form with test data
5. Click Save
6. The entry should now save successfully without errors

## Important Notes
- This same fix applies if you have other modules with similar save issues
- If you change your domain or port, update the `NEXT_PUBLIC_API_URL` accordingly
- The environment variable must start with `NEXT_PUBLIC_` to be accessible in the browser
- Always restart the Next.js server after changing .env files

## Status
✅ **Fixed** - The API backend is working correctly
✅ **Configuration Applied** - Environment variable has been set
⏳ **Awaiting Deployment** - Apply these changes to your production VPS

---
**Date**: October 1, 2025  
**Module**: Kitchen Expenses (خەرجی خواردنگە)  
**Issue**: Failed to save entries on VPS  
**Status**: Resolved
