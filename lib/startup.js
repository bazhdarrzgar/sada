// Startup initialization for the application
import { startDailyNotificationScheduler } from './scheduler.js';

let initialized = false;

export function initializeApplication() {
  if (initialized) {
    console.log('Application already initialized');
    return;
  }
  
  console.log('🚀 Initializing Berdoz Management System...');
  
  try {
    // Start the daily notification scheduler
    startDailyNotificationScheduler();
    
    initialized = true;
    console.log('✅ Application initialization completed successfully');
    
    // Log startup information
    console.log('📋 Daily Task Notification System:');
    console.log('   - Scheduler: Active');
    console.log('   - Schedule: Daily at 06:00 AM Baghdad time');
    console.log('   - Email: Configured');
    console.log('   - Target: soyansoon9@gmail.com');
    
  } catch (error) {
    console.error('❌ Error during application initialization:', error);
    throw error;
  }
}

export function isInitialized() {
  return initialized;
}