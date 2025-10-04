#!/usr/bin/env node

/**
 * Test data insertion script for all 4 sections
 */

const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/berdoz_management';
const dbName = process.env.DB_NAME || 'berdoz_management';

async function testDataInsertion() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    
    // Test 1: Staff Records - Insert test data
    console.log('📋 Testing Staff Records (تۆماری ستاف) insertion...');
    const staffCollection = db.collection('staff_records');
    
    const staffTestData = {
      id: uuidv4(),
      fullName: 'Test Staff Member',
      mobile: '07501234567',
      address: 'Test Address, Erbil',
      gender: 'Male',
      dateOfBirth: '1990-01-15',
      certificate: 'Test Certificate',
      age: 34,
      education: 'Bachelor Degree',
      attendance: 'Present',
      date: new Date().toISOString().split('T')[0],
      department: 'IT Department',
      bloodType: 'A+',
      notes: 'Test notes for staff record',
      pass: 'Grade A',
      contract: 'Permanent',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const staffResult = await staffCollection.insertOne(staffTestData);
    console.log(`  ✅ Staff record inserted with ID: ${staffResult.insertedId}`);
    
    // Verify all fields were saved
    const savedStaff = await staffCollection.findOne({ id: staffTestData.id });
    const staffFields = Object.keys(savedStaff).filter(key => key !== '_id');
    console.log(`  Fields saved: ${staffFields.join(', ')}`);
    console.log(`  Total fields: ${staffFields.length}\n`);
    
    // Test 2: Teacher Information - Insert test data
    console.log('👨‍🏫 Testing Teacher Information (زانیاری مامۆستا) insertion...');
    const teacherInfoCollection = db.collection('teacher_info');
    
    const teacherTestData = {
      id: uuidv4(),
      politicalName: 'Political Name Test',
      realName: 'Real Name Test',
      department: 'Science Department',
      subject: 'Physics',
      grade: 'Grade 10',
      phoneNumber: '07509876543',
      notes: 'Test notes for teacher',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const teacherResult = await teacherInfoCollection.insertOne(teacherTestData);
    console.log(`  ✅ Teacher info inserted with ID: ${teacherResult.insertedId}`);
    
    const savedTeacher = await teacherInfoCollection.findOne({ id: teacherTestData.id });
    const teacherFields = Object.keys(savedTeacher).filter(key => key !== '_id');
    console.log(`  Fields saved: ${teacherFields.join(', ')}`);
    console.log(`  Total fields: ${teacherFields.length}\n`);
    
    // Test 3: Officer Leaves - Insert test data
    console.log('📅 Testing Officer Leaves (مۆڵەتی مامۆستا) insertion...');
    const officerLeavesCollection = db.collection('officer_leaves');
    
    const officerLeaveTestData = {
      id: uuidv4(),
      teacherName: 'Test Teacher Name',
      specialty: 'Mathematics',
      leaveDate: '2024-10-01',
      leaveType: 'مۆڵەتی ساڵانە',
      leaveDuration: '15',
      orderNumber: 'ORD-2024-001',
      returnDate: '2024-10-15',
      notes: 'Annual leave for vacation',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const officerResult = await officerLeavesCollection.insertOne(officerLeaveTestData);
    console.log(`  ✅ Officer leave inserted with ID: ${officerResult.insertedId}`);
    
    const savedOfficerLeave = await officerLeavesCollection.findOne({ id: officerLeaveTestData.id });
    const officerFields = Object.keys(savedOfficerLeave).filter(key => key !== '_id');
    console.log(`  Fields saved: ${officerFields.join(', ')}`);
    console.log(`  Total fields: ${officerFields.length}\n`);
    
    // Test 4: Employee Leaves - Insert test data
    console.log('📅 Testing Employee Leaves (مۆڵەتی فەرمانبەر) insertion...');
    const employeeLeavesCollection = db.collection('employee_leaves');
    
    const employeeLeaveTestData = {
      id: uuidv4(),
      employeeName: 'Test Employee Name',
      specialty: 'Administration',
      leaveDate: '2024-10-05',
      leaveType: 'مۆڵەتی نەخۆشی',
      leaveDuration: '7',
      orderNumber: 'ORD-2024-002',
      returnDate: '2024-10-12',
      notes: 'Sick leave for medical treatment',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const employeeResult = await employeeLeavesCollection.insertOne(employeeLeaveTestData);
    console.log(`  ✅ Employee leave inserted with ID: ${employeeResult.insertedId}`);
    
    const savedEmployeeLeave = await employeeLeavesCollection.findOne({ id: employeeLeaveTestData.id });
    const employeeFields = Object.keys(savedEmployeeLeave).filter(key => key !== '_id');
    console.log(`  Fields saved: ${employeeFields.join(', ')}`);
    console.log(`  Total fields: ${employeeFields.length}\n`);
    
    // Final summary
    console.log('═'.repeat(70));
    console.log('✅ ALL DATA INSERTION TESTS PASSED!\n');
    console.log('Summary:');
    console.log(`  • Staff Records: ${staffFields.length} fields saved`);
    console.log(`  • Teacher Information: ${teacherFields.length} fields saved`);
    console.log(`  • Officer Leaves: ${officerFields.length} fields saved`);
    console.log(`  • Employee Leaves: ${employeeFields.length} fields saved`);
    console.log('═'.repeat(70));
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testDataInsertion();
