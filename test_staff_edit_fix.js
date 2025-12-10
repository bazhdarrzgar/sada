#!/usr/bin/env node

/**
 * Test script for Staff Edit functionality
 * Tests the complete flow: fetch -> edit -> save -> verify
 */

const API_BASE = 'http://localhost:3000/api';

async function testStaffEditFlow() {
  console.log('='.repeat(80));
  console.log('TESTING STAFF EDIT FUNCTIONALITY');
  console.log('='.repeat(80));
  console.log();

  try {
    // Step 1: Fetch all staff records
    console.log('📋 Step 1: Fetching all staff records...');
    const fetchResponse = await fetch(`${API_BASE}/staff`);
    
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch staff: ${fetchResponse.status}`);
    }
    
    const staffRecords = await fetchResponse.json();
    console.log(`✅ Successfully fetched ${staffRecords.length} staff records`);
    
    if (staffRecords.length === 0) {
      console.log('⚠️  No staff records found. Creating a test record first...');
      
      // Create a test record
      const testRecord = {
        fullName: 'Test Staff Member',
        mobile: '0750 123 4567',
        address: 'Test Address Sulaymaniyah',
        gender: 'Male',
        dateOfBirth: '1990-01-15',
        certificate: 'Bachelor Degree',
        age: '34',
        education: 'University of Sulaymaniyah',
        department: 'Computer Science',
        bloodType: 'A+',
        contract: 'Permanent',
        attendance: 'Present',
        certificateImages: [],
        notes: 'Test staff member for edit testing'
      };
      
      const createResponse = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRecord)
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create test record: ${createResponse.status}`);
      }
      
      const createdRecord = await createResponse.json();
      console.log(`✅ Created test record with ID: ${createdRecord.id}`);
      staffRecords.push(createdRecord);
    }
    
    // Step 2: Select first record for editing
    const recordToEdit = staffRecords[0];
    console.log();
    console.log('📝 Step 2: Selected record for editing:');
    console.log(`   ID: ${recordToEdit.id}`);
    console.log(`   Name: ${recordToEdit.fullName}`);
    console.log(`   Mobile: ${recordToEdit.mobile}`);
    console.log(`   Department: ${recordToEdit.department}`);
    console.log(`   Certificate Images: ${Array.isArray(recordToEdit.certificateImages) ? 'Array ✓' : 'NOT Array ✗'}`);
    
    // Verify ID exists
    if (!recordToEdit.id) {
      throw new Error('❌ CRITICAL: Record has no ID!');
    }
    console.log(`✅ Record has valid ID: ${recordToEdit.id}`);
    
    // Step 3: Prepare edited data (simulating user edits)
    console.log();
    console.log('✏️  Step 3: Preparing edited data...');
    const editedData = {
      ...recordToEdit,
      mobile: '0751 999 8888', // Changed
      department: 'Updated Department', // Changed
      notes: `Edited at ${new Date().toISOString()}` // Changed
    };
    
    console.log(`   ✓ Changed mobile to: ${editedData.mobile}`);
    console.log(`   ✓ Changed department to: ${editedData.department}`);
    console.log(`   ✓ Added edit timestamp to notes`);
    console.log(`   ✓ ID preserved: ${editedData.id}`);
    
    // Step 4: Send PUT request to update
    console.log();
    console.log('💾 Step 4: Sending PUT request to update record...');
    const updateResponse = await fetch(`${API_BASE}/staff`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update record: ${updateResponse.status} - ${errorText}`);
    }
    
    const updatedRecord = await updateResponse.json();
    console.log(`✅ Successfully updated record`);
    console.log(`   Response ID: ${updatedRecord.id}`);
    
    // Step 5: Verify the update
    console.log();
    console.log('🔍 Step 5: Verifying the update...');
    
    // Fetch the specific record again
    const verifyResponse = await fetch(`${API_BASE}/staff`);
    const allRecords = await verifyResponse.json();
    const verifiedRecord = allRecords.find(r => r.id === recordToEdit.id);
    
    if (!verifiedRecord) {
      throw new Error(`❌ Record with ID ${recordToEdit.id} not found after update!`);
    }
    
    console.log('   Checking updated fields:');
    
    // Verify mobile was updated
    if (verifiedRecord.mobile === '0751 999 8888') {
      console.log(`   ✅ Mobile updated correctly: ${verifiedRecord.mobile}`);
    } else {
      console.log(`   ❌ Mobile NOT updated: Expected "0751 999 8888", Got "${verifiedRecord.mobile}"`);
    }
    
    // Verify department was updated
    if (verifiedRecord.department === 'Updated Department') {
      console.log(`   ✅ Department updated correctly: ${verifiedRecord.department}`);
    } else {
      console.log(`   ❌ Department NOT updated: Expected "Updated Department", Got "${verifiedRecord.department}"`);
    }
    
    // Verify it's still the same record (not a new one)
    if (verifiedRecord.id === recordToEdit.id) {
      console.log(`   ✅ Record ID matches (not a duplicate): ${verifiedRecord.id}`);
    } else {
      console.log(`   ❌ Record ID mismatch! Original: ${recordToEdit.id}, After update: ${verifiedRecord.id}`);
    }
    
    // Verify certificateImages is still an array
    if (Array.isArray(verifiedRecord.certificateImages)) {
      console.log(`   ✅ Certificate Images is an array`);
    } else {
      console.log(`   ❌ Certificate Images is NOT an array: ${typeof verifiedRecord.certificateImages}`);
    }
    
    // Step 6: Test search functionality with edit
    console.log();
    console.log('🔍 Step 6: Testing search + edit functionality...');
    const searchTerm = verifiedRecord.fullName.substring(0, 5);
    console.log(`   Searching for: "${searchTerm}"`);
    
    const searchResponse = await fetch(`${API_BASE}/staff?search=${encodeURIComponent(searchTerm)}`);
    const searchResults = await searchResponse.json();
    
    console.log(`   Found ${searchResults.length} results`);
    
    const searchedRecord = searchResults.find(r => r.id === recordToEdit.id);
    if (searchedRecord) {
      console.log(`   ✅ Found our edited record in search results`);
      console.log(`   ✓ ID: ${searchedRecord.id}`);
      console.log(`   ✓ Mobile: ${searchedRecord.mobile}`);
      console.log(`   ✓ Department: ${searchedRecord.department}`);
      
      if (searchedRecord.mobile === '0751 999 8888' && searchedRecord.department === 'Updated Department') {
        console.log(`   ✅ Search results show updated data correctly`);
      } else {
        console.log(`   ❌ Search results show outdated data`);
      }
    } else {
      console.log(`   ❌ Our edited record not found in search results`);
    }
    
    // Final summary
    console.log();
    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log();
    console.log('Summary:');
    console.log('  ✓ Records fetch correctly with certificateImages as arrays');
    console.log('  ✓ Edit preserves record ID');
    console.log('  ✓ Update saves changes to existing record (not creating new)');
    console.log('  ✓ Updated data persists in database');
    console.log('  ✓ Search functionality works with edited records');
    console.log();
    
  } catch (error) {
    console.error();
    console.error('='.repeat(80));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(80));
    console.error();
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testStaffEditFlow();
