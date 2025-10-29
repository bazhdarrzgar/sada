#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to find the first available port starting from 3000
async function findAvailablePort(startPort = 3000, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    console.log(`Port ${port} is busy, trying next port...`);
  }
  throw new Error(`No available port found after ${maxAttempts} attempts starting from ${startPort}`);
}

// Main function to start the Next.js dev server
async function startNextServer() {
  try {
    const port = await findAvailablePort(3000);
    
    console.log(`🚀 Starting Next.js development server on port ${port}...`);
    console.log(`📱 Application will be available at: http://localhost:${port}`);
    console.log(`🌐 Network access available at: http://0.0.0.0:${port}`);
    
    const args = [
      'run',
      'next',
      'dev',
      '--hostname',
      '0.0.0.0',
      '--port',
      port.toString()
    ];
    
    // Add NODE_OPTIONS for memory optimization
    const env = { 
      ...process.env, 
      NODE_OPTIONS: '--max-old-space-size=512' 
    };
    
    const nextProcess = spawn('yarn', args, {
      stdio: 'inherit',
      env: env
    });
    
    nextProcess.on('close', (code) => {
      console.log(`Next.js server exited with code ${code}`);
      process.exit(code);
    });
    
    nextProcess.on('error', (error) => {
      console.error(`Failed to start Next.js server: ${error.message}`);
      process.exit(1);
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down Next.js server...');
      nextProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      console.log('\n👋 Shutting down Next.js server...');
      nextProcess.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error(`❌ Error starting server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startNextServer();