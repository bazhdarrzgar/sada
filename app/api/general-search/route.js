import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { db } from '@/lib/sqlite'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const loadAll = searchParams.get('loadAll')
    
    // Define collections to search in
    const collections = [
      'staff_records',
      'teachers', 
      'activities',
      'payroll',
      'calendar_entries',
      'student_permissions',
      'employee_leaves',
      'supervision',
      'supervised_students',
      'installments',
      'monthly_expenses',
      'building_expenses',
      'daily_accounts',
      'kitchen_expenses',
      'exam_supervision',
      'teacher_info',
      'legend_entries'
    ]
    
    const searchResults = {}
    
    // If loadAll is requested, return all data for fuzzy search
    if (loadAll === 'true') {
      for (const collectionName of collections) {
        try {
          // Check if table exists
          const tableExists = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name=?
          `).get(collectionName)
          
          if (!tableExists) continue
          
          // Get all rows with limit
          const rows = db.prepare(`SELECT * FROM ${collectionName} LIMIT 100`).all()
          
          if (rows.length > 0) {
            // Parse flexible schema tables
            const flexibleTables = ['employee_leaves', 'officer_leaves', 'supervision', 'student_permissions', 'supervised_students']
            const isFlexible = flexibleTables.includes(collectionName)
            
            const cleanResults = rows.map(row => {
              if (isFlexible && row.data) {
                const parsedData = JSON.parse(row.data)
                const { id, created_at, updated_at, ...rest } = { ...parsedData, id: row.id }
                return { id, ...rest, created_at, updated_at }
              } else {
                // Parse JSON strings for arrays in regular tables
                const parsedRow = { ...row }
                for (const key in parsedRow) {
                  const value = parsedRow[key]
                  if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                    try {
                      parsedRow[key] = JSON.parse(value)
                    } catch (e) {
                      // Keep original if parsing fails
                    }
                  }
                }
                return parsedRow
              }
            })
            searchResults[collectionName] = cleanResults
          }
        } catch (collectionError) {
          console.warn(`Error loading collection ${collectionName}:`, collectionError.message)
        }
      }
      
      return NextResponse.json(searchResults)
    }
    
    // Search functionality
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }
    
    // Search in each collection using SQLite
    for (const collectionName of collections) {
      try {
        // Check if table exists
        const tableExists = db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name=?
        `).get(collectionName)
        
        if (!tableExists) continue
        
        // Get table columns
        const columns = db.prepare(`PRAGMA table_info(${collectionName})`).all()
        const columnNames = columns
          .map(col => col.name)
          .filter(name => name !== 'id' && name !== 'created_at' && name !== 'updated_at')
        
        if (columnNames.length === 0) continue
        
        const flexibleTables = ['employee_leaves', 'officer_leaves', 'supervision', 'student_permissions', 'supervised_students']
        const isFlexible = flexibleTables.includes(collectionName)
        
        let results = []
        
        if (isFlexible) {
          // For flexible schema, search in the data JSON field
          const rows = db.prepare(`
            SELECT * FROM ${collectionName}
            WHERE data LIKE ?
            LIMIT 50
          `).all(`%${query}%`)
          
          results = rows.map(row => {
            const parsedData = JSON.parse(row.data)
            return {
              id: row.id,
              ...parsedData,
              created_at: row.created_at,
              updated_at: row.updated_at
            }
          })
        } else {
          // For regular tables, build dynamic search query
          const searchConditions = columnNames.map(col => `CAST(${col} AS TEXT) LIKE ?`).join(' OR ')
          const searchParams = columnNames.map(() => `%${query}%`)
          
          const sqlQuery = `
            SELECT * FROM ${collectionName}
            WHERE ${searchConditions}
            LIMIT 50
          `
          
          const rows = db.prepare(sqlQuery).all(...searchParams)
          
          results = rows.map(row => {
            // Parse JSON strings for arrays
            const parsedRow = { ...row }
            for (const key in parsedRow) {
              const value = parsedRow[key]
              if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                try {
                  parsedRow[key] = JSON.parse(value)
                } catch (e) {
                  // Keep original if parsing fails
                }
              }
            }
            return parsedRow
          })
        }
        
        if (results.length > 0) {
          searchResults[collectionName] = results
        }
      } catch (collectionError) {
        console.warn(`Error searching in collection ${collectionName}:`, collectionError.message)
      }
    }
    
    return NextResponse.json(searchResults)
    
  } catch (error) {
    console.error('Error performing general search:', error)
    return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 })
  }
}