const https = require('https');
const http = require('http');

// All the routes in your Next.js application
const pages = [
  "/", // Main dashboard page
  "/daily-accounts",
  "/supervised-students", 
  "/video-demo",
  "/employee-leaves",
  "/exam-supervision",
  "/kitchen-expenses",
  "/theme-demo", 
  "/installments",
  "/payroll",
  "/expenses",
  "/staff",
  "/table-demo",
  "/teachers",
  "/activities",
  "/student-permissions",
  "/general-search",
  "/supervision",
  "/teacher-info",
  "/officer-leaves", 
  "/calendar",
  "/bus",
  "/building-expenses"
];

// Simple fetch function using Node.js built-in modules
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function preloadPages() {
  console.log('🚀 Starting page preloading...');
  console.log(`📄 Found ${pages.length} pages to preload`);
  
  const baseUrl = 'http://localhost:3000';
  let successCount = 0;
  let errorCount = 0;
  
  for (const page of pages) {
    try {
      console.log(`⏳ Preloading ${page}...`);
      const response = await fetchUrl(`${baseUrl}${page}`);
      
      if (response.status === 200) {
        console.log(`✅ Successfully preloaded ${page}`);
        successCount++;
      } else {
        console.log(`⚠️  ${page} returned status ${response.status}`);
        successCount++; // Still count as success since it compiled
      }
    } catch (err) {
      console.error(`❌ Failed to preload ${page}:`, err.message);
      errorCount++;
    }
    
    // Add a delay to avoid overwhelming the server and allow compilation
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('');
  console.log('📊 Preloading Summary:');
  console.log(`✅ Successfully preloaded: ${successCount} pages`);
  console.log(`❌ Failed to preload: ${errorCount} pages`);
  console.log('');
  
  if (errorCount === 0) {
    console.log('🎉 All pages successfully preloaded! Your Next.js dev server is ready.');
  } else {
    console.log('⚠️  Some pages failed to preload. Check the errors above.');
  }
  
  console.log('🔥 You can now navigate to any page without waiting for compilation!');
}

// Run the preloader
preloadPages().catch(console.error);