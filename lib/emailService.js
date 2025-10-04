import nodemailer from 'nodemailer';
import clientPromise from './mongodb.js';

// Code dictionary as provided by the user
const CODE_DICTIONARY = {
  'A': 'Regis Name',
  'B': 'Media', 
  'C': 'HR Staff Records',
  'D': 'E.parwarda records',
  'E': 'Bus Records',
  'F': 'Monitoring R',
  'G': 'S License Records',
  'H': 'Teacher Evaluation Records',
  'I': 'Student Absent',
  'J': 'Salary Records',
  'K': 'Pen Records',
  'L': 'Daily Manager Records',
  'M': 'Teacher Attendance',
  'N': 'Report Records',
  'O': 'Observed Student Records',
  'P': 'Class Record',
  'Q': 'Activities Records',
  'R': 'Future Plan Records',
  'S': 'Subject Records',
  'T': 'CoCar BM Records',
  'U': 'Parent Rec',
  'V': 'Security Records',
  'W': 'Clean Records',
  'X': 'Student Profile Record',
  'Y': 'Meeting & Discussion',
  'Z': 'Time Table',
  'A1': 'Progress',
  'B1': 'Orders',
  'C1': 'Student Pay',
  'D1': 'Exam Records',
  'E1': 'First Day of CoCar',
  'F1': 'CourseWare Record',
  'G1': 'Material',
  'TB': 'Daily Monitor Records'
};

// Function to get email settings from database
async function getEmailSettings() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    const settings = await db.collection('email_settings').findOne({ type: 'notification' });
    
    if (settings) {
      return {
        senderEmail: settings.senderEmail,
        senderPassword: settings.senderPassword,
        targetEmail: settings.targetEmail
      };
    }
  } catch (error) {
    console.log('Using environment variables for email settings');
  }
  
  // Fallback to environment variables
  return {
    senderEmail: process.env.EMAIL_USER || 'swyanswartz@gmail.com',
    senderPassword: process.env.EMAIL_PASS || 'moiy tvnm emmq jlks',
    targetEmail: process.env.NOTIFICATION_EMAIL || 'soyansoon9@gmail.com'
  };
}

// Function to create transporter with dynamic settings
async function createTransporter(customEmail = null, customPassword = null) {
  const settings = await getEmailSettings();
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: customEmail || settings.senderEmail,
      pass: customPassword || settings.senderPassword
    }
  });
}

// Function to get Baghdad time
function getBaghdadTime() {
  const now = new Date();
  // Baghdad is UTC+3
  const baghdadTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  return baghdadTime;
}

// Function to format date for comparison (YYYY-MM-DD)
function formatDateForComparison(date) {
  return date.toISOString().split('T')[0];
}

// Enhanced function to get tasks for today using new email_tasks collection
export async function getTodaysTasks(db) {
  const today = getBaghdadTime();
  return getTasksForDate(db, today);
}

// Enhanced function to get tasks for a specific date using email_tasks collection
export async function getTasksForDate(db, targetDate) {
  const targetDateStr = formatDateForComparison(targetDate);
  
  try {
    // First try to get from new email_tasks collection (enhanced method)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`Searching for tasks between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);
    
    const emailTasks = await db.collection('email_tasks').find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).toArray();
    
    console.log(`Found ${emailTasks.length} email tasks for date ${targetDateStr}`);
    
    if (emailTasks.length > 0) {
      // Use enhanced email tasks method
      let todaysCodes = [];
      
      for (const task of emailTasks) {
        if (task.codes && Array.isArray(task.codes)) {
          todaysCodes.push(...task.codes);
        }
      }
      
      // Remove duplicates and sort
      todaysCodes = [...new Set(todaysCodes)].sort();
      
      return {
        hasTasksToday: todaysCodes.length > 0,
        codes: todaysCodes,
        date: targetDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Asia/Baghdad'
        }),
        emailTasks: emailTasks,
        method: 'enhanced'
      };
    }
    
    // Fallback to legacy calendar parsing method with improved year handling
    return getLegacyTasksForDate(db, targetDate);
    
  } catch (error) {
    console.error('Error getting tasks for date:', error);
    return {
      hasTasksToday: false,
      codes: [],
      date: targetDate.toLocaleDateString('en-US'),
      emailTasks: [],
      error: error.message
    };
  }
}

// Legacy method for backward compatibility with improved year handling
async function getLegacyTasksForDate(db, targetDate) {
  const targetDateStr = formatDateForComparison(targetDate);
  const targetYear = targetDate.getFullYear();
  
  try {
    // Get all calendar entries, prioritizing entries from the target year
    const entries = await db.collection('calendar_entries').find({
      $or: [
        { year: targetYear },
        { year: { $exists: false } }, // Include entries without year field (legacy)
        { year: null }
      ]
    }).sort({ year: -1, updated_at: -1 }).toArray();
    
    console.log(`Found ${entries.length} legacy calendar entries for year ${targetYear}`);
    
    let todaysCodes = [];
    let matchingEntries = [];
    
    for (const entry of entries) {
      // Parse the month field to get dates, considering the entry's year
      const entryYear = entry.year || targetYear;
      const possibleDates = parseCalendarMonthToAllDates(entry.month, entryYear);
      
      // Check if any of the possible dates match our target date
      for (const possibleDate of possibleDates) {
        if (formatDateForComparison(possibleDate.date) === targetDateStr) {
          matchingEntries.push({
            entry,
            matchedDate: possibleDate.date,
            weekIndex: possibleDate.weekIndex,
            dayIndex: possibleDate.dayIndex
          });
          
          // Get the specific cell data for this date
          const weekKey = `week${possibleDate.weekIndex + 1}`;
          const cellData = entry[weekKey] && entry[weekKey][possibleDate.dayIndex];
          
          if (cellData) {
            const codes = extractCodes(cellData);
            todaysCodes.push(...codes);
          }
        }
      }
    }
    
    // Remove duplicates and sort
    todaysCodes = [...new Set(todaysCodes)].sort();
    
    return {
      hasTasksToday: todaysCodes.length > 0,
      codes: todaysCodes,
      date: targetDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Baghdad'
      }),
      matchingEntries: matchingEntries,
      method: 'legacy'
    };
  } catch (error) {
    console.error('Error getting legacy tasks for date:', error);
    return {
      hasTasksToday: false,
      codes: [],
      date: targetDate.toLocaleDateString('en-US'),
      matchingEntries: [],
      error: error.message,
      method: 'legacy'
    };
  }
}

// Function to parse calendar month to date (legacy support)
function parseCalendarMonth(monthStr) {
  const currentYear = new Date().getFullYear();
  // Handle formats like "1-Jun", "15-Jul", etc.
  const [day, month] = monthStr.split('-');
  
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  if (monthMap[month] !== undefined) {
    return new Date(currentYear, monthMap[month], parseInt(day));
  }
  return null;
}

// Enhanced function to parse calendar month to all possible dates in the 4-week grid
function parseCalendarMonthToAllDates(monthStr, year) {
  const possibleDates = [];
  
  if (!monthStr) return possibleDates;
  
  const monthNames = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  // Parse the month string to get base date
  let month = 0;
  let day = 1;
  
  if (monthStr.includes('-')) {
    const parts = monthStr.split('-');
    if (parts.length === 2) {
      const firstPart = parts[0];
      const secondPart = parts[1];
      
      if (!isNaN(firstPart) && isNaN(secondPart)) {
        // Format: "15-Jun"
        day = parseInt(firstPart);
        for (const [key, value] of Object.entries(monthNames)) {
          if (secondPart.includes(key)) {
            month = value;
            break;
          }
        }
      } else if (isNaN(firstPart) && !isNaN(secondPart)) {
        // Format: "Jun-2024"
        year = parseInt(secondPart);
        for (const [key, value] of Object.entries(monthNames)) {
          if (firstPart.includes(key)) {
            month = value;
            break;
          }
        }
      }
    }
  } else {
    // Handle month names without dashes
    for (const [key, value] of Object.entries(monthNames)) {
      if (monthStr.includes(key)) {
        month = value;
        break;
      }
    }
  }
  
  // Calculate the base date
  const baseDate = new Date(year, month, day);
  
  // Generate all possible dates for the 4-week, 4-day grid
  for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
    for (let dayIndex = 0; dayIndex < 4; dayIndex++) { // Sun, Mon, Tue, Wed
      const cellDate = new Date(baseDate);
      cellDate.setDate(baseDate.getDate() + (weekIndex * 7) + dayIndex);
      
      possibleDates.push({
        date: cellDate,
        weekIndex: weekIndex,
        dayIndex: dayIndex,
        weekName: `week${weekIndex + 1}`,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'][dayIndex]
      });
    }
  }
  
  return possibleDates;
}

// Function to extract codes from a text string
function extractCodes(text) {
  if (!text || text.trim() === '') return [];
  
  // Split by common separators and clean up
  const codes = text.split(/[,\s]+/)
    .map(code => code.trim().toUpperCase())
    .filter(code => code && CODE_DICTIONARY[code]);
    
  return [...new Set(codes)]; // Remove duplicates
}

// Enhanced function to send daily task notification email
export async function sendDailyTaskNotification(tasksData, customTarget = null) {
  const settings = await getEmailSettings();
  const recipientEmail = customTarget || settings.targetEmail;
  
  if (!tasksData.hasTasksToday) {
    console.log('No tasks for today, skipping email notification');
    return { success: true, message: 'No tasks for today' };
  }
  
  try {
    const transporter = await createTransporter();
    
    // Build the email content with enhanced task information
    let emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">📅 Daily Task Notification</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">${tasksData.date}</p>
    ${tasksData.method ? `<p style="margin: 5px 0 0 0; opacity: 0.7; font-size: 12px;">Method: ${tasksData.method}</p>` : ''}
  </div>
  
  <div style="padding: 30px; background-color: #f8f9fa;">
    <h2 style="color: #495057; margin-bottom: 20px;">📋 Today's Scheduled Tasks</h2>
    
    <div style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <p style="margin-bottom: 15px; color: #6c757d;">The following codes have been scheduled for today:</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e9ecef;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Code</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Description</th>
          </tr>
        </thead>
        <tbody>`;

    // Add each code and its meaning to the table
    for (const code of tasksData.codes) {
      const meaning = CODE_DICTIONARY[code] || 'Unknown task';
      emailBody += `
          <tr style="border-bottom: 1px solid #dee2e6;">
            <td style="padding: 12px; font-family: monospace; font-weight: bold; color: #007bff;">${code}</td>
            <td style="padding: 12px; color: #495057;">${meaning}</td>
          </tr>`;
    }

    emailBody += `
        </tbody>
      </table>
    </div>`;

    // Add enhanced task details if available
    if (tasksData.emailTasks && tasksData.emailTasks.length > 0) {
      emailBody += `
    <div style="margin-top: 20px; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h3 style="color: #495057; margin-bottom: 15px;">📝 Task Details</h3>`;
      
      for (const task of tasksData.emailTasks) {
        if (task.description) {
          emailBody += `
        <div style="margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
          <p style="margin: 0; color: #495057;"><strong>Task:</strong> ${task.description}</p>
          <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Codes: ${task.codes.join(', ')}</p>
        </div>`;
        }
      }
      
      emailBody += `
    </div>`;
    }
    
    emailBody += `
    <div style="margin-top: 30px; padding: 15px; background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px;">
      <p style="margin: 0; color: #0c5460; font-size: 14px;">
        <strong>📌 Note:</strong> This is an automated reminder from the Berdoz Management System. 
        Please complete the scheduled tasks for today.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <p style="color: #6c757d; font-size: 12px; margin: 0;">
        Generated at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Baghdad' })} (Baghdad Time)
      </p>
    </div>
  </div>
</div>`;

    const mailOptions = {
      from: {
        name: 'Berdoz Management System',
        address: settings.senderEmail
      },
      to: recipientEmail,
      subject: `Daily Task Notification – ${tasksData.date}`,
      html: emailBody
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Daily task notification sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      codesCount: tasksData.codes.length,
      codes: tasksData.codes,
      sentTo: recipientEmail,
      method: tasksData.method || 'unknown'
    };
    
  } catch (error) {
    console.error('Error sending daily task notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to test email configuration
export async function testEmailConfiguration(customEmail = null, customPassword = null) {
  try {
    const transporter = await createTransporter(customEmail, customPassword);
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('Email configuration error:', error);
    return { success: false, error: error.message };
  }
}

// Function to send test email
export async function sendTestEmail(targetEmail, customSender = null, customPassword = null) {
  try {
    const transporter = await createTransporter(customSender, customPassword);
    const settings = await getEmailSettings();
    
    const mailOptions = {
      from: {
        name: 'Berdoz Management System - Test',
        address: customSender || settings.senderEmail
      },
      to: targetEmail,
      subject: 'Test Email - Berdoz Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007bff;">✅ Email Test Successful!</h2>
          <p>This is a test email from the Berdoz Management System.</p>
          <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>From:</strong> ${customSender || settings.senderEmail}</p>
          <p><strong>To:</strong> ${targetEmail}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              If you received this email, your notification system is working correctly!
            </p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: `Test email sent successfully to ${targetEmail}`
    };
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}