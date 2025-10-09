import cron from 'node-cron';
import clientPromise from '@/lib/mongodb';
import { getTodaysTasks, sendDailyTaskNotification } from '@/lib/emailService';

let schedulerStarted = false;

export function startDailyNotificationScheduler() {
  if (schedulerStarted) {
    console.log('Daily notification scheduler is already running');
    return;
  }
  
  // Schedule daily notification at 06:00 AM Baghdad time (UTC+3)
  // This corresponds to 03:00 AM UTC
  const cronExpression = '0 3 * * *'; // 03:00 UTC = 06:00 Baghdad time
  
  console.log('🔔 Starting daily notification scheduler...');
  console.log(`📅 Scheduled to run at 06:00 AM Baghdad time (03:00 UTC)`);
  
  cron.schedule(cronExpression, async () => {
    console.log('⏰ Daily notification scheduler triggered at', new Date().toISOString());
    
    try {
      const client = await clientPromise;
      const db = client.db(process.env.DB_NAME || 'berdoz_management');
      
      // Get today's tasks
      const tasksData = await getTodaysTasks(db);
      
      console.log(`📋 Tasks found for today: ${tasksData.codes.length} codes`);
      
      if (tasksData.hasTasksToday) {
        console.log('📨 Sending daily task notification email...');
        const emailResult = await sendDailyTaskNotification(tasksData);
        
        if (emailResult.success) {
          console.log('✅ Daily notification sent successfully');
          console.log(`📧 Email sent with ${emailResult.codesCount} task codes:`, emailResult.codes);
        } else {
          console.error('❌ Failed to send daily notification:', emailResult.error);
        }
      } else {
        console.log('📭 No tasks for today, no notification sent');
      }
      
    } catch (error) {
      console.error('❌ Error in daily notification scheduler:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  
  schedulerStarted = true;
  console.log('✅ Daily notification scheduler started successfully');
}

export function getSchedulerStatus() {
  return {
    running: schedulerStarted,
    nextRun: schedulerStarted ? 'Daily at 06:00 AM Baghdad time (03:00 UTC)' : 'Not scheduled',
    timezone: 'Asia/Baghdad (UTC+3)'
  };
}