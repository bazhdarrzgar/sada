#!/usr/bin/env node

/**
 * Test script for final 2 sections:
 * 1. چاودێری (Supervision)
 * 2. پاس (Payroll)
 */

const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/berdoz_management';
const dbName = process.env.DB_NAME || 'berdoz_management';

async function testSupervisionAndPayroll() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    
    // Test 1: Supervision (چاودێری)
    console.log('👁️ Testing Supervision (چاودێری) insertion...');
    const supervisionCollection = db.collection('supervision');
    
    const supervisionTestData = {
      id: uuidv4(),
      type: 'teacher',
      name: 'مامۆستا سەرهەنگ',
      subject: 'بیرکاری',
      department: 'بەشی زانست',
      grade: 'پۆلی حەوتەم',
      violationType: 'دواکەوتن لە وەرزی حەوار',
      punishmentType: 'ئاگاداریکردنەوەی سەرەتایی',
      supervisionLocation: 'هۆڵی سەرەکی',
      notes: 'چاودێری یەکەم - هیچ کێشەیەکی ترم نەدیتەوە',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const supervisionResult = await supervisionCollection.insertOne(supervisionTestData);
    console.log(`  ✅ Supervision record inserted with ID: ${supervisionResult.insertedId}`);
    
    const savedSupervision = await supervisionCollection.findOne({ id: supervisionTestData.id });
    const supervisionFields = Object.keys(savedSupervision).filter(key => key !== '_id');
    console.log(`  Fields saved: ${supervisionFields.join(', ')}`);
    console.log(`  Total fields: ${supervisionFields.length}\n`);
    
    // Test 2: Payroll (پاس)
    console.log('💰 Testing Payroll (پاس) insertion...');
    const payrollCollection = db.collection('payroll');
    
    const payrollTestData = {
      id: uuidv4(),
      employeeName: 'کارمەند تێست',
      salary: 1500000,
      absence: 50000,
      deduction: 25000,
      bonus: 100000,
      total: 1525000,
      month: 'October',
      year: '2024',
      notes: 'پاسی مانگی ئۆکتۆبەر - تەواو',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const payrollResult = await payrollCollection.insertOne(payrollTestData);
    console.log(`  ✅ Payroll record inserted with ID: ${payrollResult.insertedId}`);
    
    const savedPayroll = await payrollCollection.findOne({ id: payrollTestData.id });
    const payrollFields = Object.keys(savedPayroll).filter(key => key !== '_id');
    console.log(`  Fields saved: ${payrollFields.join(', ')}`);
    console.log(`  Total fields: ${payrollFields.length}\n`);
    
    // Final summary
    console.log('═'.repeat(70));
    console.log('✅ ALL TESTS PASSED FOR FINAL 2 SECTIONS!\n');
    console.log('Summary:');
    console.log(`  • Supervision (چاودێری): ${supervisionFields.length} fields saved`);
    console.log(`  • Payroll (پاس): ${payrollFields.length} fields saved`);
    console.log('═'.repeat(70));
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testSupervisionAndPayroll();
