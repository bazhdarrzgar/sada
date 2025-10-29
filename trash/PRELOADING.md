# Next.js Page Preloading System

This system automatically compiles all pages and components when starting the development server, eliminating the need to manually visit each page to trigger compilation.

## 🚀 Available Scripts

### Option 1: Full Development with Preloading (Recommended)
```bash
yarn dev:preload
```
This will:
1. Start the Next.js development server
2. Wait for it to be ready
3. Automatically visit and compile all pages
4. Keep the development server running

### Option 2: Simple Preloading (Alternative)
```bash
yarn dev:preload-simple
```
Similar to Option 1 but uses a simpler approach.

### Option 3: Preload Existing Server
If you already have a dev server running on localhost:3000:
```bash
yarn preload-only
```

### Option 4: Regular Development (No Preloading)
```bash
yarn dev
```
Standard Next.js development server without preloading.

## 📄 Preloaded Pages

The system will automatically preload the following pages:

- `/` - Main dashboard
- `/daily-accounts` - Daily Accounts
- `/supervised-students` - Supervised Students  
- `/video-demo` - Video Demo
- `/employee-leaves` - Employee Leaves
- `/exam-supervision` - Exam Supervision
- `/kitchen-expenses` - Kitchen Expenses
- `/theme-demo` - Theme Demo
- `/installments` - Installments
- `/payroll` - Payroll
- `/expenses` - Expenses
- `/staff` - Staff Management
- `/table-demo` - Table Demo
- `/teachers` - Teachers
- `/activities` - Activities
- `/student-permissions` - Student Permissions
- `/general-search` - General Search
- `/supervision` - Supervision
- `/teacher-info` - Teacher Information
- `/officer-leaves` - Officer Leaves
- `/calendar` - Calendar
- `/bus` - Bus Management
- `/building-expenses` - Building Expenses

## 🔧 How It Works

1. **Server Startup**: Next.js development server starts in the background
2. **Wait for Ready**: The script waits for the server to become available
3. **Page Preloading**: Each page is requested once to trigger compilation
4. **Ready to Use**: All pages are now compiled and ready for instant navigation

## 🎯 Benefits

- **Instant Navigation**: No compilation delays when switching between pages
- **Better Development Experience**: All components are compiled upfront
- **Time Saving**: Eliminates manual page visiting for compilation
- **Complete Coverage**: Ensures all routes are properly compiled

## 📝 Adding New Pages

To add new pages to the preloading system:

1. Open `scripts/preload.js`
2. Add your new route to the `pages` array
3. Example: `"/new-page"`
4. Restart the development server with preloading

## 🛠️ Customization

You can modify the preloading behavior by editing:
- `scripts/preload.js` - Main preloader script
- `scripts/start-dev-with-preload.sh` - Bash script wrapper
- `package.json` - Script definitions

## 🚨 Troubleshooting

If you encounter issues:

1. **Port conflicts**: Make sure port 3000 is available
2. **Authentication required**: Some pages might require login - the script will still trigger compilation
3. **Network timeouts**: Increase timeout in preload.js if needed
4. **Memory issues**: The script includes memory optimization options

## 💡 Tips

- Use `yarn dev:preload` for the best experience
- The preloading process takes about 30-60 seconds depending on your application size
- You can continue development immediately after the preloading starts
- Pages will compile in parallel, so the development server remains responsive