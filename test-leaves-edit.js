/**
 * Test script for verifying leave edit functionality
 * Tests both employee-leaves and officer-leaves endpoints
 */

const BASE_URL = 'http://localhost:3000';

async function testLeaveEdit(type = 'employee') {
  const apiPath = type === 'employee' ? 'employee-leaves' : 'officer-leaves';
  const nameField = type === 'employee' ? 'employeeName' : 'teacherName';
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${type} leaves edit functionality`);
  console.log('='.repeat(60));

  try {
    // Step 1: Create a test entry
    console.log('\n1. Creating test entry...');
    const testEntry = {
      [nameField]: `Test ${type} Name`,
      specialty: 'Test Specialty',
      leaveDate: '2024-01-15',
      leaveType: 'مۆڵەتی ساڵانە',
      leaveDuration: '5',
      orderNumber: 'TEST-2024-001',
      returnDate: '2024-01-20',
      notes: 'This is a test entry for edit functionality'
    };

    const createRes = await fetch(`${BASE_URL}/api/${apiPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEntry)
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create entry: ${createRes.status}`);
    }

    const createdEntry = await createRes.json();
    console.log('✅ Created entry with ID:', createdEntry.id);
    console.log('   Name:', createdEntry[nameField]);
    console.log('   Specialty:', createdEntry.specialty);

    // Step 2: Fetch all entries to verify it exists
    console.log('\n2. Fetching all entries...');
    const fetchRes = await fetch(`${BASE_URL}/api/${apiPath}`);
    const allEntries = await fetchRes.json();
    const foundEntry = allEntries.find(e => e.id === createdEntry.id);
    
    if (!foundEntry) {
      throw new Error('Created entry not found in list!');
    }
    console.log('✅ Entry found in list');
    console.log('   ID:', foundEntry.id);
    console.log('   Name:', foundEntry[nameField]);

    // Step 3: Update the entry (simulating edit functionality)
    console.log('\n3. Updating entry (simulating edit)...');
    const updatedData = {
      ...foundEntry,
      [nameField]: `Updated ${type} Name`,
      specialty: 'Updated Specialty',
      leaveDuration: '10',
      notes: 'Updated notes - edit test successful'
    };

    console.log('   Updating with ID:', updatedData.id);
    const updateRes = await fetch(`${BASE_URL}/api/${apiPath}/${updatedData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update entry: ${updateRes.status}`);
    }

    const updatedEntry = await updateRes.json();
    console.log('✅ Entry updated successfully');
    console.log('   ID:', updatedEntry.id);
    console.log('   Name:', updatedEntry[nameField]);
    console.log('   Specialty:', updatedEntry.specialty);
    console.log('   Duration:', updatedEntry.leaveDuration);

    // Step 4: Verify the update
    console.log('\n4. Verifying update...');
    const verifyRes = await fetch(`${BASE_URL}/api/${apiPath}`);
    const updatedList = await verifyRes.json();
    const verifiedEntry = updatedList.find(e => e.id === createdEntry.id);

    if (!verifiedEntry) {
      throw new Error('Updated entry not found!');
    }

    if (verifiedEntry[nameField] !== `Updated ${type} Name`) {
      throw new Error('Entry was not updated correctly!');
    }

    console.log('✅ Update verified successfully');
    console.log('   Name matches:', verifiedEntry[nameField]);
    console.log('   Specialty matches:', verifiedEntry.specialty);
    console.log('   Duration matches:', verifiedEntry.leaveDuration);

    // Step 5: Search and edit scenario
    console.log('\n5. Testing search scenario...');
    const searchEntries = updatedList.filter(e => 
      e[nameField].includes('Updated') || 
      e.specialty.includes('Updated')
    );
    console.log(`   Found ${searchEntries.length} entries matching search`);
    
    const searchedEntry = searchEntries.find(e => e.id === createdEntry.id);
    if (!searchedEntry) {
      throw new Error('Entry not found in search results!');
    }
    console.log('✅ Entry found in search results');
    console.log('   Can edit from search results: ID preserved:', searchedEntry.id);

    // Step 6: Cleanup - delete test entry
    console.log('\n6. Cleaning up test entry...');
    const deleteRes = await fetch(`${BASE_URL}/api/${apiPath}/${createdEntry.id}`, {
      method: 'DELETE'
    });

    if (!deleteRes.ok) {
      console.warn('⚠️  Failed to delete test entry');
    } else {
      console.log('✅ Test entry deleted');
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ ALL TESTS PASSED for ${type} leaves!`);
    console.log('='.repeat(60));
    return true;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run tests for both types
async function runAllTests() {
  console.log('\n🚀 Starting Leave Edit Functionality Tests\n');
  
  const employeeResult = await testLeaveEdit('employee');
  const officerResult = await testLeaveEdit('officer');

  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Employee Leaves: ${employeeResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Officer Leaves: ${officerResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(60));

  if (employeeResult && officerResult) {
    console.log('\n🎉 All tests passed! Edit functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
    process.exit(1);
  }
}

runAllTests();
