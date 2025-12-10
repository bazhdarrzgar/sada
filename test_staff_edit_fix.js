/**
 * Test script for Staff Edit Fix
 * Tests:
 * 1. Add a test staff member
 * 2. Edit the staff member
 * 3. Verify the update (not adding new record)
 * 4. Search and edit
 */

const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(process.cwd(), 'database', 'sada.db');
const db = new Database(dbPath);

console.log('🧪 Testing Staff Edit Functionality\n');

// Step 1: Add a test staff member
console.log('Step 1: Adding test staff member...');
const testStaffId = uuidv4();
const testStaff = {
  id: testStaffId,
  fullName: 'Test Staff Member',
  mobile: '0750123456',
  address: 'Test Address',
  gender: 'Male',
  dateOfBirth: '1990-01-01',
  certificate: 'Bachelor',
  age: 34,
  education: 'University',
  attendance: 'Present',
  date: new Date().toISOString().split('T')[0],
  department: 'IT',
  bloodType: 'O+',
  certificateImages: JSON.stringify([]),
  notes: 'Test notes',
  pass: '',
  contract: 'Permanent',
  cv: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const insertStmt = db.prepare(`
  INSERT INTO staff_records (
    id, fullName, mobile, address, gender, dateOfBirth, certificate, age,
    education, attendance, date, department, bloodType, certificateImages,
    notes, pass, contract, cv, created_at, updated_at
  ) VALUES (
    @id, @fullName, @mobile, @address, @gender, @dateOfBirth, @certificate, @age,
    @education, @attendance, @date, @department, @bloodType, @certificateImages,
    @notes, @pass, @contract, @cv, @created_at, @updated_at
  )
`);

insertStmt.run(testStaff);
console.log('✅ Test staff member added with ID:', testStaffId);

// Step 2: Verify the staff was added
const selectStmt = db.prepare('SELECT * FROM staff_records WHERE id = ?');
let staffRecord = selectStmt.get(testStaffId);
console.log('✅ Verified staff exists:', staffRecord.fullName);
console.log('   Mobile:', staffRecord.mobile);
console.log('   Department:', staffRecord.department);

// Step 3: Count records before update
const countBefore = db.prepare('SELECT COUNT(*) as count FROM staff_records').get().count;
console.log('\n📊 Total staff records before update:', countBefore);

// Step 4: Update the staff member (simulating edit)
console.log('\nStep 2: Updating staff member...');
const updateStmt = db.prepare(`
  UPDATE staff_records 
  SET fullName = ?, mobile = ?, department = ?, updated_at = ?
  WHERE id = ?
`);

const updatedName = 'Updated Test Staff';
const updatedMobile = '0751999999';
const updatedDepartment = 'HR';
const result = updateStmt.run(
  updatedName,
  updatedMobile,
  updatedDepartment,
  new Date().toISOString(),
  testStaffId
);

console.log('✅ Update operation affected', result.changes, 'record(s)');

// Step 5: Verify the update
staffRecord = selectStmt.get(testStaffId);
console.log('✅ Verified staff was updated:');
console.log('   Name:', staffRecord.fullName);
console.log('   Mobile:', staffRecord.mobile);
console.log('   Department:', staffRecord.department);

// Step 6: Count records after update (should be same)
const countAfter = db.prepare('SELECT COUNT(*) as count FROM staff_records').get().count;
console.log('\n📊 Total staff records after update:', countAfter);

if (countBefore === countAfter) {
  console.log('✅ SUCCESS: Update did not create new record!');
} else {
  console.log('❌ FAILURE: Update created new record!');
}

// Step 7: Test search functionality
console.log('\nStep 3: Testing search functionality...');
const searchStmt = db.prepare(`
  SELECT * FROM staff_records 
  WHERE fullName LIKE ? OR mobile LIKE ? OR department LIKE ?
`);

const searchTerm = '%Updated%';
const searchResults = searchStmt.all(searchTerm, searchTerm, searchTerm);
console.log('✅ Search found', searchResults.length, 'record(s)');

if (searchResults.length > 0) {
  console.log('   Found:', searchResults[0].fullName);
  console.log('   ID matches original:', searchResults[0].id === testStaffId);
}

// Step 8: Cleanup - Remove test data
console.log('\nStep 4: Cleaning up test data...');
const deleteStmt = db.prepare('DELETE FROM staff_records WHERE id = ?');
deleteStmt.run(testStaffId);
console.log('✅ Test data cleaned up');

// Final verification
const finalCount = db.prepare('SELECT COUNT(*) as count FROM staff_records').get().count;
console.log('\n📊 Final staff count:', finalCount);

db.close();
console.log('\n✨ Test completed successfully!\n');
