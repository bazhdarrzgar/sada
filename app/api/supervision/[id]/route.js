import { NextResponse } from 'next/server'

// Import the supervision data (in production, this would be from a database)
import { supervisionData } from '../route.js'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updates = await request.json()
    
    const index = supervisionData.findIndex(item => item.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Supervision entry not found' }, { status: 404 })
    }
    
    supervisionData[index] = {
      ...supervisionData[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(supervisionData[index])
  } catch (error) {
    console.error('Error updating supervision entry:', error)
    return NextResponse.json({ error: 'Failed to update supervision entry' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const index = supervisionData.findIndex(item => item.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Supervision entry not found' }, { status: 404 })
    }
    
    supervisionData.splice(index, 1)
    
    return NextResponse.json({ message: 'Supervision entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting supervision entry:', error)
    return NextResponse.json({ error: 'Failed to delete supervision entry' }, { status: 500 })
  }
}