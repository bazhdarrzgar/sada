import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// Helper function to extract abbreviations from text and update legend
async function updateLegend(db, entries) {
  const allText = entries.join(' ')
  const abbreviations = allText.match(/[A-Z][A-Z0-9]*/g) || []
  
  for (const abbr of abbreviations) {
    if (abbr.length >= 1) {
      const existing = await db.collection('legend_entries').findOne({ abbreviation: abbr })
      
      if (existing) {
        // Update usage count
        await db.collection('legend_entries').updateOne(
          { abbreviation: abbr },
          {
            $inc: { usage_count: 1 },
            $set: { last_used: new Date() }
          }
        )
      } else {
        // Create new legend entry
        const legendEntry = {
          id: uuidv4(),
          abbreviation: abbr,
          full_description: `${abbr} - Please update description`,
          category: 'General',
          usage_count: 1,
          last_used: new Date(),
          created_at: new Date()
        }
        await db.collection('legend_entries').insertOne(legendEntry)
      }
    }
  }
}

// Helper function to update legend from email tasks
async function updateLegendFromEmailTasks(db, emailTasks) {
  for (const task of emailTasks) {
    if (task.codes && Array.isArray(task.codes)) {
      for (const code of task.codes) {
        const existing = await db.collection('legend_entries').findOne({ abbreviation: code })
        
        if (existing) {
          await db.collection('legend_entries').updateOne(
            { abbreviation: code },
            {
              $inc: { usage_count: 1 },
              $set: { last_used: new Date() }
            }
          )
        }
      }
    }
  }
}

// Helper function to generate email tasks from traditional week data
function generateEmailTasksFromWeeks(calendarEntry, year) {
  const emailTasks = [];
  
  // Parse the month to get the base date
  const monthStr = calendarEntry.month;
  const baseDate = parseCalendarMonthWithYear(monthStr, year);
  
  if (!baseDate) {
    console.log('Could not parse base date from month:', monthStr);
    return emailTasks;
  }
  
  console.log('Base date for calendar entry:', baseDate.toISOString(), 'Month:', monthStr);
  
  // Calculate dates for each week and day
  const weeks = ['week1', 'week2', 'week3', 'week4'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday'];
  
  weeks.forEach((weekKey, weekIndex) => {
    const weekData = calendarEntry[weekKey] || [];
    weekData.forEach((cellData, dayIndex) => {
      if (cellData && cellData.trim() !== '') {
        // Calculate the actual date for this cell
        // Start from the base date and add the appropriate offset
        const taskDate = new Date(baseDate);
        taskDate.setDate(baseDate.getDate() + (weekIndex * 7) + dayIndex);
        
        // Extract codes from cell data
        const codes = extractCodesFromText(cellData);
        
        console.log(`Processing cell: Week ${weekIndex + 1}, Day ${dayIndex + 1} (${dayNames[dayIndex]})`);
        console.log(`Cell data: "${cellData}"`);
        console.log(`Extracted codes:`, codes);
        console.log(`Calculated date:`, taskDate.toISOString());
        
        if (codes.length > 0) {
          emailTasks.push({
            date: taskDate,
            codes: codes,
            description: `${dayNames[dayIndex]} - Week ${weekIndex + 1}: ${cellData}`,
            weekContext: `Week ${weekIndex + 1}`,
            dayContext: dayNames[dayIndex]
          });
        } else {
          console.log(`No valid codes found in cell data: "${cellData}"`);
        }
      }
    });
  });
  
  console.log(`Generated ${emailTasks.length} email tasks from week data`);
  return emailTasks;
}

// Helper function to parse calendar month with year
function parseCalendarMonthWithYear(monthStr, year) {
  if (!monthStr) return null;
  
  const monthNames = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  // Handle different formats: "1-Jun", "Jun-2024", "15-Jul", etc.
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
  
  return new Date(year, month, day);
}

// Helper function to extract codes from text
function extractCodesFromText(text) {
  if (!text || text.trim() === '') return [];
  
  // Split by common separators and clean up
  const codes = text.split(/[,\s]+/)
    .map(code => code.trim().toUpperCase())
    .filter(code => {
      // More permissive regex to catch codes like A, B1, TB, etc.
      return code && /^[A-Z][A-Z0-9]*$/.test(code) && code.length >= 1;
    });
    
  const uniqueCodes = [...new Set(codes)]; // Remove duplicates
  console.log(`Extracted codes from "${text}":`, uniqueCodes);
  return uniqueCodes;
}

// GET all calendar entries
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const entries = await db.collection('calendar_entries')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id and return
    const result = entries.map(entry => {
      const { _id, ...rest } = entry
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching calendar entries:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar entries' }, { status: 500 })
  }
}

// POST create new calendar entry
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Parse year from month if not provided separately
    const currentYear = body.year || new Date().getFullYear();
    let parsedYear = currentYear;
    
    // Try to extract year from month field (e.g., "Jun-2024", "1-Jul-2025")
    if (body.month && typeof body.month === 'string') {
      const yearMatch = body.month.match(/(\d{4})/);
      if (yearMatch) {
        parsedYear = parseInt(yearMatch[1]);
      }
    }

    const calendarEntry = {
      id: uuidv4(),
      month: body.month,
      week1: body.week1 || ['', '', '', ''],
      week2: body.week2 || ['', '', '', ''],
      week3: body.week3 || ['', '', '', ''],
      week4: body.week4 || ['', '', '', ''],
      year: parsedYear,
      // Enhanced: Add email tasks support
      emailTasks: body.emailTasks || [],
      created_at: new Date(),
      updated_at: new Date()
    }
    
    // Extract all entries for legend update (legacy support)
    const allEntries = [
      ...calendarEntry.week1,
      ...calendarEntry.week2,
      ...calendarEntry.week3,
      ...calendarEntry.week4
    ]
    await updateLegend(db, allEntries)
    
    // Update legend from email tasks (enhanced feature)
    if (calendarEntry.emailTasks && calendarEntry.emailTasks.length > 0) {
      await updateLegendFromEmailTasks(db, calendarEntry.emailTasks)
      
      // Create email task entries in separate collection for better email service integration
      for (const task of calendarEntry.emailTasks) {
        const emailTaskEntry = {
          id: uuidv4(),
          calendarEntryId: calendarEntry.id,
          date: new Date(task.date),
          codes: task.codes,
          description: task.description || '',
          monthContext: calendarEntry.month,
          year: parsedYear,
          created_at: new Date(),
          updated_at: new Date()
        }
        await db.collection('email_tasks').insertOne(emailTaskEntry)
      }
    }
    
    // Also create email tasks from traditional week data for backward compatibility
    if (!calendarEntry.emailTasks || calendarEntry.emailTasks.length === 0) {
      console.log('Generating email tasks from week data for entry:', calendarEntry.month);
      // Generate email tasks from week data
      const weekEmailTasks = generateEmailTasksFromWeeks(calendarEntry, parsedYear);
      console.log(`Generated ${weekEmailTasks.length} email tasks from week data`);
      
      for (const task of weekEmailTasks) {
        const emailTaskEntry = {
          id: uuidv4(),
          calendarEntryId: calendarEntry.id,
          date: task.date,
          codes: task.codes,
          description: task.description || '',
          monthContext: calendarEntry.month,
          year: parsedYear,
          weekContext: task.weekContext,
          dayContext: task.dayContext,
          created_at: new Date(),
          updated_at: new Date()
        }
        
        console.log('Creating email task entry:', {
          date: task.date.toISOString(),
          codes: task.codes,
          description: task.description
        });
        
        await db.collection('email_tasks').insertOne(emailTaskEntry)
      }
      
      console.log(`Successfully created ${weekEmailTasks.length} email task entries in database`);
    }
    
    await db.collection('calendar_entries').insertOne(calendarEntry)
    
    // Remove _id before returning
    const { _id, ...result } = calendarEntry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating calendar entry:', error)
    return NextResponse.json({ error: 'Failed to create calendar entry' }, { status: 500 })
  }
}