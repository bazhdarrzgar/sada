/**
 * Test script for supervised students edit functionality
 * This tests:
 * 1. Fetching all students
 * 2. Editing a student (updating their name)
 * 3. Verifying the update worked
 * 4. Restoring original data
 */

const BASE_URL = 'http://localhost:3000'

async function testSupervisedStudentsEdit() {
  console.log('🧪 Testing Supervised Students Edit Functionality...\n')

  try {
    // Step 1: Fetch all supervised students
    console.log('📥 Step 1: Fetching all supervised students...')
    const fetchResponse = await fetch(`${BASE_URL}/api/supervised-students`)
    
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch students: ${fetchResponse.statusText}`)
    }
    
    const students = await fetchResponse.json()
    console.log(`✅ Found ${students.length} students`)
    
    if (students.length === 0) {
      console.log('⚠️  No students in database. Creating a test student first...')
      
      // Create a test student
      const createResponse = await fetch(`${BASE_URL}/api/supervised-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: 'Test Student Original',
          department: 'Science',
          grade: '10',
          subject: 'Math',
          violationType: 'Test Violation',
          list: 'List A',
          punishmentType: 'Warning',
          guardianNotification: 'Called',
          guardianPhone: '0751234567',
          notes: 'Test notes'
        })
      })
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create test student: ${createResponse.statusText}`)
      }
      
      const newStudent = await createResponse.json()
      console.log(`✅ Created test student with ID: ${newStudent.id}`)
      students.push(newStudent)
    }
    
    // Get the first student to edit
    const studentToEdit = students[0]
    console.log(`\n📝 Step 2: Editing student...`)
    console.log(`   ID: ${studentToEdit.id}`)
    console.log(`   Original Name: ${studentToEdit.studentName}`)
    
    const originalName = studentToEdit.studentName
    const updatedName = `${originalName} [EDITED ${Date.now()}]`
    
    // Step 2: Update the student
    const editResponse = await fetch(`${BASE_URL}/api/supervised-students/${studentToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...studentToEdit,
        studentName: updatedName
      })
    })
    
    if (!editResponse.ok) {
      throw new Error(`Failed to edit student: ${editResponse.statusText}`)
    }
    
    const editedStudent = await editResponse.json()
    console.log(`✅ Student updated successfully`)
    console.log(`   New Name: ${editedStudent.studentName}`)
    
    // Step 3: Verify the update by fetching the student again
    console.log(`\n🔍 Step 3: Verifying the update...`)
    const verifyResponse = await fetch(`${BASE_URL}/api/supervised-students/${studentToEdit.id}`)
    
    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify student: ${verifyResponse.statusText}`)
    }
    
    const verifiedStudent = await verifyResponse.json()
    
    if (verifiedStudent.studentName === updatedName) {
      console.log(`✅ Verification successful! Name was updated correctly.`)
      console.log(`   Verified Name: ${verifiedStudent.studentName}`)
    } else {
      console.error(`❌ Verification failed! Name mismatch.`)
      console.error(`   Expected: ${updatedName}`)
      console.error(`   Got: ${verifiedStudent.studentName}`)
      return false
    }
    
    // Step 4: Restore original name
    console.log(`\n🔄 Step 4: Restoring original data...`)
    const restoreResponse = await fetch(`${BASE_URL}/api/supervised-students/${studentToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...studentToEdit,
        studentName: originalName
      })
    })
    
    if (!restoreResponse.ok) {
      throw new Error(`Failed to restore student: ${restoreResponse.statusText}`)
    }
    
    console.log(`✅ Original data restored`)
    
    console.log('\n✨ All tests passed! Edit functionality is working correctly.\n')
    return true
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}\n`)
    return false
  }
}

// Run the test
testSupervisedStudentsEdit().then(success => {
  process.exit(success ? 0 : 1)
})
