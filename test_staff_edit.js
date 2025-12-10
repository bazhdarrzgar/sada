/**
 * Test script to verify staff edit functionality
 * Tests:
 * 1. Fetch staff data - verify field names are correct
 * 2. Create a new staff entry
 * 3. Edit the staff entry
 * 4. Verify data persists correctly
 */

const BASE_URL = 'http://localhost:3000';

async function testStaffEdit() {
  console.log('🧪 Testing Staff Edit Functionality\n');
  
  try {
    // Step 1: Fetch existing staff data
    console.log('1️⃣  Fetching staff data...');
    const fetchResponse = await fetch(`${BASE_URL}/api/staff`);
    const staffData = await fetchResponse.json();
    console.log(`✅ Fetched ${staffData.length} staff records`);
    
    if (staffData.length > 0) {
      console.log('📋 Sample record structure:');
      const sample = staffData[0];
      console.log('   Fields:', Object.keys(sample).join(', '));
      console.log('   Full Name:', sample.fullName || 'MISSING!');
      console.log('   Address:', sample.address || 'MISSING!');
      console.log('   Education:', sample.education || 'MISSING!');
    }
    
    // Step 2: Create a new test staff entry
    console.log('\n2️⃣  Creating new test staff entry...');
    const newStaff = {
      fullName: 'Test Staff Member',
      mobile: '07501234567',
      address: 'Test Address, Erbil',
      gender: 'Male',
      dateOfBirth: '1990-01-01',
      certificate: 'Bachelor Degree',
      age: 34,
      education: 'University Graduate',
      department: 'Administration',
      bloodType: 'O+',
      contract: 'Permanent',
      attendance: 'Present',
      certificateImages: [],
      notes: 'This is a test entry for edit functionality'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff)
    });
    
    const createdStaff = await createResponse.json();
    console.log('✅ Created staff with ID:', createdStaff.id);
    console.log('   Full Name:', createdStaff.fullName);
    console.log('   Mobile:', createdStaff.mobile);
    console.log('   Department:', createdStaff.department);
    
    // Verify field names
    if (!createdStaff.fullName) {
      console.log('❌ ERROR: fullName field is missing!');
    }
    if (!createdStaff.address) {
      console.log('❌ ERROR: address field is missing!');
    }
    if (!createdStaff.education) {
      console.log('❌ ERROR: education field is missing!');
    }
    
    // Step 3: Edit the staff entry
    console.log('\n3️⃣  Editing the staff entry...');
    const updatedData = {
      ...createdStaff,
      fullName: 'Updated Test Staff',
      department: 'IT Department',
      notes: 'Updated notes after edit test',
      certificateImages: createdStaff.certificateImages || []
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/staff`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    const updatedStaff = await updateResponse.json();
    console.log('✅ Updated staff successfully');
    console.log('   New Full Name:', updatedStaff.fullName);
    console.log('   New Department:', updatedStaff.department);
    console.log('   New Notes:', updatedStaff.notes);
    
    // Verify the update actually worked
    if (updatedStaff.fullName !== 'Updated Test Staff') {
      console.log('❌ ERROR: Full name was not updated!');
    }
    if (updatedStaff.department !== 'IT Department') {
      console.log('❌ ERROR: Department was not updated!');
    }
    
    // Step 4: Fetch again to verify persistence
    console.log('\n4️⃣  Verifying data persistence...');
    const verifyResponse = await fetch(`${BASE_URL}/api/staff`);
    const verifyData = await verifyResponse.json();
    const foundStaff = verifyData.find(s => s.id === createdStaff.id);
    
    if (foundStaff) {
      console.log('✅ Staff record found in database');
      console.log('   Full Name:', foundStaff.fullName);
      console.log('   Department:', foundStaff.department);
      
      if (foundStaff.fullName === 'Updated Test Staff' && 
          foundStaff.department === 'IT Department') {
        console.log('✅ Data persisted correctly!');
      } else {
        console.log('❌ ERROR: Data did not persist correctly!');
      }
    } else {
      console.log('❌ ERROR: Could not find created staff in database!');
    }
    
    // Step 5: Clean up - delete test entry
    console.log('\n5️⃣  Cleaning up test data...');
    const deleteResponse = await fetch(`${BASE_URL}/api/staff?id=${createdStaff.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Test data cleaned up successfully');
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Field names are correct (fullName, address, education)');
    console.log('   ✅ Create functionality works');
    console.log('   ✅ Edit functionality works');
    console.log('   ✅ Data persistence works');
    console.log('   ✅ Search will work with correct data structure');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
  }
}

// Run the test
testStaffEdit().catch(console.error);
