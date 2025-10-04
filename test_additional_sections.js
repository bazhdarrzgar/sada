#!/usr/bin/env node

/**
 * Test script for additional 3 sections:
 * 1. بەرێوبردنی ساڵنامە (Calendar Management)
 * 2. چالاکی (Activities)
 * 3. چاودێریکردنی تاقیکردنەوە (Exam Supervision)
 */

const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/berdoz_management';
const dbName = process.env.DB_NAME || 'berdoz_management';

async function testAdditionalSections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    
    // Test 1: Calendar Management (بەرێوبردنی ساڵنامە)
    console.log('📅 Testing Calendar Management (بەرێوبردنی ساڵنامە) insertion...');
    const calendarCollection = db.collection('calendar_entries');
    
    const calendarTestData = {
      id: uuidv4(),
      month: '1-Oct',
      year: 2024,
      week1: ['TB', 'A', 'B1', 'C'],
      week2: ['TB, A', 'B1', 'C', 'TB'],
      week3: ['A', 'B1, C', 'TB', 'A'],
      week4: ['C', 'TB', 'A', 'B1'],
      emailTasks: [
        {
          date: new Date('2024-10-01'),
          codes: ['TB', 'A'],
          description: 'Sunday - Week 1: TB, A'
        },
        {
          date: new Date('2024-10-02'),
          codes: ['B1'],
          description: 'Monday - Week 1: B1'
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const calendarResult = await calendarCollection.insertOne(calendarTestData);
    console.log(`  ✅ Calendar entry inserted with ID: ${calendarResult.insertedId}`);
    
    const savedCalendar = await calendarCollection.findOne({ id: calendarTestData.id });
    const calendarFields = Object.keys(savedCalendar).filter(key => key !== '_id');
    console.log(`  Fields saved: ${calendarFields.join(', ')}`);
    console.log(`  Total fields: ${calendarFields.length}\n`);
    
    // Test 2: Activities (چالاکی)
    console.log('🎨 Testing Activities (چالاکی) insertion...');
    const activitiesCollection = db.collection('activities');
    
    const activityTestData = {
      id: uuidv4(),
      activityType: 'وەرزشی',
      preparationDate: '2024-10-01',
      content: 'یاری تۆپی پێ لە گۆڕەپانی قوتابخانە',
      startDate: '2024-10-05',
      whoDidIt: 'مامۆستا ئەحمەد',
      helper: 'مامۆستا سارا',
      activityImages: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ],
      notes: 'چالاکییەکی زۆر سەرکەوتوو بوو',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const activityResult = await activitiesCollection.insertOne(activityTestData);
    console.log(`  ✅ Activity inserted with ID: ${activityResult.insertedId}`);
    
    const savedActivity = await activitiesCollection.findOne({ id: activityTestData.id });
    const activityFields = Object.keys(savedActivity).filter(key => key !== '_id');
    console.log(`  Fields saved: ${activityFields.join(', ')}`);
    console.log(`  Total fields: ${activityFields.length}\n`);
    
    // Test 3: Exam Supervision (چاودێریکردنی تاقیکردنەوە)
    console.log('📝 Testing Exam Supervision (چاودێریکردنی تاقیکردنەوە) insertion...');
    const examSupervisionCollection = db.collection('exam_supervision');
    
    const examTestData = {
      id: uuidv4(),
      subject: 'بیرکاری',
      stage: 'پۆلی شەشەم',
      endTime: '10:30 AM',
      examAchievement: 'زۆر باش',
      supervisorName: 'مامۆستا کەریم',
      obtainedScore: '85/100',
      notes: 'تاقیکردنەوەکە بە باشی تەواو بوو',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const examResult = await examSupervisionCollection.insertOne(examTestData);
    console.log(`  ✅ Exam supervision record inserted with ID: ${examResult.insertedId}`);
    
    const savedExam = await examSupervisionCollection.findOne({ id: examTestData.id });
    const examFields = Object.keys(savedExam).filter(key => key !== '_id');
    console.log(`  Fields saved: ${examFields.join(', ')}`);
    console.log(`  Total fields: ${examFields.length}\n`);
    
    // Final summary
    console.log('═'.repeat(70));
    console.log('✅ ALL ADDITIONAL SECTION TESTS PASSED!\n');
    console.log('Summary:');
    console.log(`  • Calendar Management: ${calendarFields.length} fields saved`);
    console.log(`  • Activities: ${activityFields.length} fields saved`);
    console.log(`  • Exam Supervision: ${examFields.length} fields saved`);
    console.log('═'.repeat(70));
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAdditionalSections();
