import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const loadAll = searchParams.get('loadAll')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Define collections to search in - Updated with correct collection names
    const collections = [
      'staff_records',
      'teachers', 
      'activities',
      'payroll',
      'calendar_entries',  // Updated: was 'calendar'
      'student_permissions',
      'employee_leaves',
      'supervision',
      'supervised_students',
      'installments',
      'monthly_expenses',  // Updated: was 'expenses' 
      'building_expenses',
      'daily_accounts',
      'kitchen_expenses',
      'exam_supervision',
      'teacher_info',
      'legend_entries'     // Added: missing collection
    ]
    
    const searchResults = {}
    
    // If loadAll is requested, return all data for fuzzy search
    if (loadAll === 'true') {
      for (const collectionName of collections) {
        try {
          const collectionExists = await db.listCollections({ name: collectionName }).hasNext()
          if (!collectionExists) continue
          
          const collection = db.collection(collectionName)
          const results = await collection
            .find({})
            .limit(100) // Limit per collection for performance
            .toArray()
          
          if (results.length > 0) {
            // Remove MongoDB _id field
            const cleanResults = results.map(doc => {
              const { _id, ...rest } = doc
              return rest
            })
            searchResults[collectionName] = cleanResults
          }
        } catch (collectionError) {
          console.warn(`Error loading collection ${collectionName}:`, collectionError.message)
        }
      }
      
      return NextResponse.json(searchResults)
    }
    
    // Original search functionality (fallback)
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }
    
    // Search in each collection
    for (const collectionName of collections) {
      try {
        // Check if collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext()
        if (!collectionExists) continue
        
        const collection = db.collection(collectionName)
        
        // Create search criteria - search in all text fields
        const searchRegex = new RegExp(query, 'i') // case-insensitive search
        
        // Get a sample document to understand the structure
        const sampleDoc = await collection.findOne({})
        if (!sampleDoc) continue
        
        // Build dynamic search query for ALL fields (strings, numbers, dates)
        const searchCriteria = { $or: [] }
        
        for (const [key, value] of Object.entries(sampleDoc)) {
          if (key !== '_id' && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            // Search in string fields
            if (typeof value === 'string') {
              searchCriteria.$or.push({ [key]: searchRegex })
            }
            // Search in numeric fields (convert search term to number if possible)
            else if (typeof value === 'number') {
              const numericQuery = parseFloat(query)
              if (!isNaN(numericQuery)) {
                searchCriteria.$or.push({ [key]: numericQuery })
                // Also search for partial numeric matches (e.g., searching "800" should find "800000")
                searchCriteria.$or.push({ [key]: { $regex: query, $options: 'i' } })
              }
              // Convert number to string for text-based search
              searchCriteria.$or.push({ [key]: { $regex: query.toString(), $options: 'i' } })
            }
            // Search in date fields
            else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
              // Search for date patterns in the query
              if (query.match(/\d{4}/) || query.match(/\d{1,2}[\-\/]\d{1,2}/) || query.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)) {
                searchCriteria.$or.push({ [key]: searchRegex })
              }
            }
            // Search in boolean fields
            else if (typeof value === 'boolean') {
              if (query.toLowerCase().includes('true') || query.toLowerCase().includes('false') || 
                  query.includes('1') || query.includes('0')) {
                const boolQuery = query.toLowerCase().includes('true') || query.includes('1')
                searchCriteria.$or.push({ [key]: boolQuery })
              }
            }
            // Search in array fields
            else if (Array.isArray(value)) {
              searchCriteria.$or.push({ [key]: { $elemMatch: { $regex: query, $options: 'i' } } })
            }
            // Search in object fields (convert to string)
            else if (typeof value === 'object' && value !== null) {
              const objectString = JSON.stringify(value)
              if (objectString.toLowerCase().includes(query.toLowerCase())) {
                searchCriteria.$or.push({ [key]: searchRegex })
              }
            }
          }
        }
        
        // Only search if we have criteria
        if (searchCriteria.$or.length > 0) {
          const results = await collection
            .find(searchCriteria)
            .limit(50) // Limit results per collection
            .toArray()
          
          // Remove MongoDB _id field
          const cleanResults = results.map(doc => {
            const { _id, ...rest } = doc
            return rest
          })
          
          if (cleanResults.length > 0) {
            searchResults[collectionName] = cleanResults
          }
        }
      } catch (collectionError) {
        console.warn(`Error searching in collection ${collectionName}:`, collectionError.message)
        // Continue with other collections
      }
    }
    
    return NextResponse.json(searchResults)
    
  } catch (error) {
    console.error('Error performing general search:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}