import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

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
        const { v4: uuidv4 } = await import('uuid')
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

// GET specific calendar entry
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const entry = await db.collection('calendar_entries').findOne({ id })
    
    if (!entry) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 })
    }
    
    const { _id, ...result } = entry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching calendar entry:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar entry' }, { status: 500 })
  }
}

// PUT update calendar entry
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('calendar_entries').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 })
    }
    
    // Parse year from month if not provided separately
    const currentYear = body.year || existing.year || new Date().getFullYear();
    let parsedYear = currentYear;
    
    // Try to extract year from month field (e.g., "Jun-2024", "1-Jul-2025")
    if (body.month && typeof body.month === 'string') {
      const yearMatch = body.month.match(/(\d{4})/);
      if (yearMatch) {
        parsedYear = parseInt(yearMatch[1]);
      }
    }
    
    const updateData = {
      ...body,
      year: parsedYear,
      updated_at: new Date()
    }
    
    // If weeks are being updated, update legend
    const hasWeekUpdates = ['week1', 'week2', 'week3', 'week4'].some(week => body[week])
    if (hasWeekUpdates) {
      const weeks = [
        body.week1 || existing.week1 || [],
        body.week2 || existing.week2 || [],
        body.week3 || existing.week3 || [],
        body.week4 || existing.week4 || []
      ]
      const allEntries = weeks.flat()
      await updateLegend(db, allEntries)
      
      // IMPORTANT: Remove old email tasks and regenerate them
      console.log('Removing old email tasks for calendar entry:', id);
      await db.collection('email_tasks').deleteMany({ calendarEntryId: id });
      
      // Create updated calendar entry object for email task generation
      const updatedCalendarEntry = {
        ...existing,
        ...updateData,
        week1: body.week1 || existing.week1 || ['', '', '', ''],
        week2: body.week2 || existing.week2 || ['', '', '', ''],
        week3: body.week3 || existing.week3 || ['', '', '', ''],
        week4: body.week4 || existing.week4 || ['', '', '', '']
      };
      
      console.log('Regenerating email tasks from updated week data for entry:', updatedCalendarEntry.month);
      // Generate email tasks from updated week data
      const weekEmailTasks = generateEmailTasksFromWeeks(updatedCalendarEntry, parsedYear);
      console.log(`Generated ${weekEmailTasks.length} email tasks from updated week data`);
      
      for (const task of weekEmailTasks) {
        const emailTaskEntry = {
          id: uuidv4(),
          calendarEntryId: id,
          date: task.date,
          codes: task.codes,
          description: task.description || '',
          monthContext: updatedCalendarEntry.month,
          year: parsedYear,
          weekContext: task.weekContext,
          dayContext: task.dayContext,
          created_at: new Date(),
          updated_at: new Date()
        }
        
        console.log('Creating updated email task entry:', {
          date: task.date.toISOString(),
          codes: task.codes,
          description: task.description
        });
        
        await db.collection('email_tasks').insertOne(emailTaskEntry)
      }
      
      console.log(`Successfully regenerated ${weekEmailTasks.length} email task entries in database`);
    }
    
    await db.collection('calendar_entries').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedEntry = await db.collection('calendar_entries').findOne({ id })
    const { _id, ...result } = updatedEntry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating calendar entry:', error)
    return NextResponse.json({ error: 'Failed to update calendar entry' }, { status: 500 })
  }
}

// DELETE calendar entry
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Also delete associated email tasks
    console.log('Deleting email tasks for calendar entry:', id);
    await db.collection('email_tasks').deleteMany({ calendarEntryId: id });
    
    const result = await db.collection('calendar_entries').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 })
    }
    
    console.log('Successfully deleted calendar entry and associated email tasks:', id);
    return NextResponse.json({ message: 'Calendar entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting calendar entry:', error)
    return NextResponse.json({ error: 'Failed to delete calendar entry' }, { status: 500 })
  }
}