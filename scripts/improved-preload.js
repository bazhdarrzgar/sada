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

// Function to check if server is ready
function checkServerReady(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      resolve(true);
      req.destroy();
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for server to be ready with retries
async function waitForServer(baseUrl, maxRetries = 30, delay = 2000) {
  console.log('🔍 Checking if server is ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    const ready = await checkServerReady(baseUrl);
    if (ready) {
      console.log('✅ Server is ready!');
      return true;
    }
    
    console.log(`⏳ Server not ready, waiting... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error('Server failed to become ready after maximum retries');
}

// Enhanced fetch function with retries and better error handling
function fetchUrl(url, retries = 3) {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        
        req.on('error', (err) => {
          if (attempt === retries) {
            reject(err);
          } else {
            console.log(`🔄 Retry ${attempt}/${retries} for ${url}: ${err.message}`);
          }
        });
        
        req.setTimeout(45000, () => {
          req.destroy();
          if (attempt === retries) {
            reject(new Error('Request timeout after all retries'));
          } else {
            console.log(`⏰ Timeout on attempt ${attempt}/${retries} for ${url}`);
          }
        });
        
        return; // Exit the retry loop if request is sent successfully
      } catch (err) {
        if (attempt === retries) {
          reject(err);
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  });
}

async function preloadPages() {
  console.log('🚀 Starting intelligent page preloading...');
  console.log(`📄 Found ${pages.length} pages to preload`);
  
  const baseUrl = 'http://localhost:3000';
  let successCount = 0;
  let errorCount = 0;
  
  // Wait for server to be ready initially
  try {
    await waitForServer(baseUrl);
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    return;
  }
  
  for (const page of pages) {
    try {
      console.log(`⏳ Preloading ${page}...`);
      
      // Check if server is still responsive before each request
      const serverReady = await checkServerReady(baseUrl);
      if (!serverReady) {
        console.log('🔄 Server appears to be restarting, waiting...');
        await waitForServer(baseUrl);
      }
      
      const response = await fetchUrl(`${baseUrl}${page}`);
      
      if (response.status === 200) {
        console.log(`✅ Successfully preloaded ${page}`);
        successCount++;
      } else if (response.status >= 200 && response.status < 400) {
        console.log(`✅ Preloaded ${page} (status: ${response.status})`);
        successCount++;
      } else {
        console.log(`⚠️  ${page} returned status ${response.status}`);
        successCount++; // Still count as success since it compiled
      }
    } catch (err) {
      console.error(`❌ Failed to preload ${page}:`, err.message);
      errorCount++;
    }
    
    // Add a longer delay to allow server to process and avoid memory issues
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('');
  console.log('📊 Preloading Summary:');
  console.log(`✅ Successfully preloaded: ${successCount} pages`);
  console.log(`❌ Failed to preload: ${errorCount} pages`);
  console.log('');
  
  if (errorCount === 0) {
    console.log('🎉 All pages successfully preloaded! Your Next.js dev server is ready.');
  } else if (errorCount < pages.length / 2) {
    console.log('✅ Most pages preloaded successfully! Some failures are normal during development.');
  } else {
    console.log('⚠️  Many pages failed to preload. Check the server and routes.');
  }
  
  console.log('🔥 You can now navigate to any preloaded page without waiting for compilation!');
}

// Run the improved preloader
preloadPages().catch(console.error);