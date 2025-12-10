#!/usr/bin/env node

/**
 * Test script to verify the leaves edit functionality
 * This script tests both employee-leaves and officer-leaves edit operations
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testLeaveEdit(type = 'employee') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${type}-leaves edit functionality`);
  console.log('='.repeat(60));

  const endpoint = `${BASE_URL}/${type}-leaves`;
  const nameField = type === 'employee' ? 'employeeName' : 'teacherName';

  try {
    // Step 1: Create a test entry
    console.log('\n1. Creating test entry...');
    const testData = {
      [nameField]: `Test ${type} - ${Date.now()}`,
      specialty: 'Test Specialty',
      leaveDate: '2024-01-15',
      leaveType: 'مۆڵەتی ساڵانە',
      leaveDuration: '5',
      orderNumber: `TEST-${Date.now()}`,
      returnDate: '2024-01-20',
      notes: 'Test notes for edit verification'
    };

    const createResponse = await axios.post(endpoint, testData);
    console.log('✓ Test entry created successfully');
    console.log('Created entry ID:', createResponse.data.id);
    const createdId = createResponse.data.id;

    // Step 2: Fetch the entry to verify it was created
    console.log('\n2. Fetching all entries to verify creation...');
    const getAllResponse = await axios.get(endpoint);
    const createdEntry = getAllResponse.data.find(item => item.id === createdId);
    
    if (!createdEntry) {
      console.error('✗ ERROR: Created entry not found in list!');
      return false;
    }
    console.log('✓ Entry found in list');
    console.log('Entry data:', createdEntry);

    // Step 3: Update the entry (simulating edit)
    console.log('\n3. Updating the entry (simulating edit)...');
    const updatedData = {
      ...createdEntry,
      [nameField]: `${createdEntry[nameField]} - UPDATED`,
      specialty: 'Updated Specialty',
      leaveDuration: '10',
      notes: 'Updated notes - edit test successful'
    };

    const updateResponse = await axios.put(`${endpoint}/${createdId}`, updatedData);
    console.log('✓ Entry updated successfully');
    console.log('Updated entry:', updateResponse.data);

    // Step 4: Verify the update
    console.log('\n4. Verifying the update...');
    const verifyResponse = await axios.get(endpoint);
    const updatedEntry = verifyResponse.data.find(item => item.id === createdId);

    if (!updatedEntry) {
      console.error('✗ ERROR: Updated entry not found!');
      return false;
    }

    console.log('✓ Entry found after update');
    console.log('Verifying changes...');

    const checks = [
      { field: nameField, expected: updatedData[nameField], actual: updatedEntry[nameField] },
      { field: 'specialty', expected: updatedData.specialty, actual: updatedEntry.specialty },
      { field: 'leaveDuration', expected: updatedData.leaveDuration, actual: updatedEntry.leaveDuration },
      { field: 'notes', expected: updatedData.notes, actual: updatedEntry.notes }
    ];

    let allChecksPass = true;
    checks.forEach(check => {
      const match = check.actual === check.expected;
      console.log(`  ${match ? '✓' : '✗'} ${check.field}: ${match ? 'MATCH' : `MISMATCH (expected: "${check.expected}", got: "${check.actual}")`}`);
      if (!match) allChecksPass = false;
    });

    // Step 5: Cleanup - delete the test entry
    console.log('\n5. Cleaning up test entry...');
    await axios.delete(`${endpoint}/${createdId}`);
    console.log('✓ Test entry deleted');

    if (allChecksPass) {
      console.log('\n✓✓✓ ALL TESTS PASSED ✓✓✓');
      return true;
    } else {
      console.log('\n✗✗✗ SOME TESTS FAILED ✗✗✗');
      return false;
    }

  } catch (error) {
    console.error('\n✗✗✗ TEST FAILED ✗✗✗');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('LEAVES EDIT FUNCTIONALITY TEST SUITE');
  console.log('='.repeat(60));

  const employeeResult = await testLeaveEdit('employee');
  const officerResult = await testLeaveEdit('officer');

  console.log('\n' + '='.repeat(60));
  console.log('FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`Employee Leaves Edit: ${employeeResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Officer Leaves Edit: ${officerResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log('='.repeat(60));

  process.exit(employeeResult && officerResult ? 0 : 1);
}

// Run the tests
runTests();
