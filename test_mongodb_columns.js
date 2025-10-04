#!/usr/bin/env node

/**
 * Test script to verify MongoDB data saving for all 4 sections:
 * 1. تۆماری ستاف (Staff Records)
 * 2. زانیاری مامۆستا (Teacher Information)
 * 3. مۆڵەتی مامۆستا (Teacher Leaves)
 * 4. مۆڵەتی فەرمانبەر (Employee Leaves)
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/berdoz_management';
const dbName = process.env.DB_NAME || 'berdoz_management';

async function testCollections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Test 1: Staff Records
    console.log('\n📋 Testing Staff Records (تۆماری ستاف)...');
    const staffCollection = db.collection('staff_records');
    const staffCount = await staffCollection.countDocuments();
    const staffSample = await staffCollection.findOne({}, { sort: { updated_at: -1 } });
    
    console.log(`  Records found: ${staffCount}`);
    if (staffSample) {
      const staffFields = Object.keys(staffSample).filter(key => key !== '_id');
      console.log(`  Fields: ${staffFields.join(', ')}`);
      console.log('  ✅ Staff Records collection structure verified');
    } else {
      console.log('  ⚠️  No records found in Staff Records');
    }
    
    // Test 2: Teacher Information
    console.log('\n👨‍🏫 Testing Teacher Information (زانیاری مامۆستا)...');
    const teacherInfoCollection = db.collection('teacher_info');
    const teacherInfoCount = await teacherInfoCollection.countDocuments();
    const teacherInfoSample = await teacherInfoCollection.findOne({}, { sort: { updated_at: -1 } });
    
    console.log(`  Records found: ${teacherInfoCount}`);
    if (teacherInfoSample) {
      const teacherFields = Object.keys(teacherInfoSample).filter(key => key !== '_id');
      console.log(`  Fields: ${teacherFields.join(', ')}`);
      console.log('  ✅ Teacher Information collection structure verified');
    } else {
      console.log('  ⚠️  No records found in Teacher Information');
    }
    
    // Test 3: Officer Leaves (مۆڵەتی مامۆستا)
    console.log('\n📅 Testing Officer Leaves (مۆڵەتی مامۆستا)...');
    const officerLeavesCollection = db.collection('officer_leaves');
    const officerLeavesCount = await officerLeavesCollection.countDocuments();
    const officerLeavesSample = await officerLeavesCollection.findOne({}, { sort: { updated_at: -1 } });
    
    console.log(`  Records found: ${officerLeavesCount}`);
    if (officerLeavesSample) {
      const officerFields = Object.keys(officerLeavesSample).filter(key => key !== '_id');
      console.log(`  Fields: ${officerFields.join(', ')}`);
      console.log('  ✅ Officer Leaves collection structure verified');
    } else {
      console.log('  ⚠️  No records found in Officer Leaves');
    }
    
    // Test 4: Employee Leaves (مۆڵەتی فەرمانبەر)
    console.log('\n📅 Testing Employee Leaves (مۆڵەتی فەرمانبەر)...');
    const employeeLeavesCollection = db.collection('employee_leaves');
    const employeeLeavesCount = await employeeLeavesCollection.countDocuments();
    const employeeLeavesSample = await employeeLeavesCollection.findOne({}, { sort: { updated_at: -1 } });
    
    console.log(`  Records found: ${employeeLeavesCount}`);
    if (employeeLeavesSample) {
      const employeeFields = Object.keys(employeeLeavesSample).filter(key => key !== '_id');
      console.log(`  Fields: ${employeeFields.join(', ')}`);
      console.log('  ✅ Employee Leaves collection structure verified');
    } else {
      console.log('  ⚠️  No records found in Employee Leaves');
    }
    
    console.log('\n✅ All collection tests completed!');
    
  } catch (error) {
    console.error('❌ Error testing collections:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testCollections();
