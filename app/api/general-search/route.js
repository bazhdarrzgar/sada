import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Define collections to search in
    const collections = [
      'staff_records',
      'teachers', 
      'activities',
      'payroll',
      'calendar',
      'student_permissions',
      'employee_leaves',
      'supervision',
      'supervised_students',
      'installments',
      'expenses',
      'building_expenses',
      'daily_accounts',
      'kitchen_expenses',
      'exam_supervision',
      'teacher_info'
    ]
    
    const searchResults = {}
    
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
        
        // Build dynamic search query for all string fields
        const searchCriteria = { $or: [] }
        
        for (const [key, value] of Object.entries(sampleDoc)) {
          if (typeof value === 'string' && key !== '_id' && key !== 'id') {
            searchCriteria.$or.push({ [key]: searchRegex })
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