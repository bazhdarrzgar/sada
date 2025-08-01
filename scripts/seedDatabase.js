const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection
const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'berdoz_management';

// Sample data for seeding the database
const seedData = {
  calendar_entries: [
    {
      id: 'sample-1',
      month: '1-Jun',
      week1: ['TB', 'C1', 'B,J', 'S', 'A,C'],
      week2: ['B,T', 'D', 'B,N', 'C1', 'A,C'],
      week3: ['B,T', 'D', 'B,N', 'C1', 'A,C'],
      week4: ['TB', 'V,P', 'L,Q,X', 'G,B1', 'O,J'],
      year: new Date().getFullYear(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'sample-2',
      month: '1-Jul',
      week1: ['D,E', 'B,N', 'C1', 'A,C,N', 'B,T'],
      week2: ['D', 'B,N', 'C1', 'A,C,N', 'B,T'],
      week3: ['D,O', 'B,N', 'C1,G', 'A,C,N', 'B,T'],
      week4: ['D,B', 'B', 'C1', 'A,C,N', 'Y'],
      year: new Date().getFullYear(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'sample-3',
      month: '1-Aug',
      week1: ['TB', 'D,E', 'B,N', 'C1', 'A,C,N'],
      week2: ['B,T', 'D', 'B,N', 'C1', 'A,C,N'],
      week3: ['TB', 'D,B', 'B,N', 'C1,G', 'A,C,N'],
      week4: ['Y', 'TB', 'D', 'C1', 'A,C'],
      year: new Date().getFullYear(),
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  legend_entries: [
    { id: uuidv4(), abbreviation: 'A', full_description: 'Regis Name', category: 'General', usage_count: 15, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'B', full_description: 'Media', category: 'General', usage_count: 12, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'C', full_description: 'HR تۆمارەکانی ستاف', category: 'General', usage_count: 10, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'D', full_description: 'Ewarrada Records', category: 'General', usage_count: 8, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'TB', full_description: 'Daily Monitor Records', category: 'General', usage_count: 6, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'C1', full_description: 'Student Pay', category: 'General', usage_count: 8, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'J', full_description: 'Salary Records', category: 'General', usage_count: 4, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'S', full_description: 'Subject Records', category: 'General', usage_count: 3, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'T', full_description: 'CoCarBM Reco', category: 'General', usage_count: 5, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'N', full_description: 'Report Records', category: 'General', usage_count: 7, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'G', full_description: 'Material', category: 'General', usage_count: 2, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'Y', full_description: 'Meeting & Discussion', category: 'General', usage_count: 2, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'E', full_description: 'Bus Records', category: 'General', usage_count: 2, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'O', full_description: 'Observed Student Records', category: 'General', usage_count: 2, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'V', full_description: 'Clean Records', category: 'General', usage_count: 1, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'P', full_description: 'Future Plan Records', category: 'General', usage_count: 1, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'L', full_description: 'Activities Records', category: 'General', usage_count: 1, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'Q', full_description: 'Security Records', category: 'General', usage_count: 1, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'X', full_description: 'Student Profile Record', category: 'General', usage_count: 1, created_at: new Date(), last_used: new Date() },
    { id: uuidv4(), abbreviation: 'B1', full_description: 'Orders', category: 'General', usage_count: 1, created_at: new Date(), last_used: new Date() }
  ],

  teachers: [
    {
      id: 'teacher-1',
      fullName: 'احمد محمد علی',
      birthYear: 1985,
      certificate: 'بەکالۆریۆس کیمیا',
      jobTitle: 'مامۆستای زانست',
      specialist: 'کیمیا',
      graduationDate: '2008-06-15',
      startDate: '2010-09-01',
      previousInstitution: 'زانکۆی سلێمانی',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'teacher-2',
      fullName: 'سارا فەرهاد رەشید',
      birthYear: 1990,
      certificate: 'ماستەر لە ئینگلیزی',
      jobTitle: 'مامۆستای زمان',
      specialist: 'زمانی ئینگلیزی',
      graduationDate: '2012-07-20',
      startDate: '2013-10-15',
      previousInstitution: 'قوتابخانەی ئاراس',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'teacher-3',
      fullName: 'کامەران ئازاد محمد',
      birthYear: 1982,
      certificate: 'بەکالۆریۆس بیرکاری',
      jobTitle: 'مامۆستای بیرکاری',
      specialist: 'بیرکاری و تەکنەلۆژیا',
      graduationDate: '2005-05-30',
      startDate: '2007-08-20',
      previousInstitution: 'پەیمانگای تەکنیکی هەولێر',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  teacher_info: [
    {
      id: 'teacher-info-1',
      politicalName: 'هادی احمد عزیز',
      program: 'بەکالۆریۆس',
      specialty: 'زمانی ئینگلیزی',
      subject: 'کوردی',
      grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1, grade7: 1,
      totalHours: '',
      notes: '',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'teacher-info-2',
      politicalName: 'کوردستان سلێمان فتاح',
      program: 'بەکالۆریۆس',
      specialty: 'کوردی',
      subject: 'کوردی لاین',
      grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1, grade7: 1,
      totalHours: '',
      notes: '-',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'teacher-info-3',
      politicalName: 'نیاز ڕەوف فەرج',
      program: 'دبلۆم',
      specialty: 'کۆمەلایەتی',
      subject: 'کوردی',
      grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1, grade7: 1,
      totalHours: '',
      notes: '-',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'teacher-info-4',
      politicalName: 'پوردهان حسن والی',
      program: 'بەکالۆریۆس',
      specialty: 'زمانی عەرەبی',
      subject: 'زمانی عەرەبی لاین',
      grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1, grade7: 1,
      totalHours: '٢٢',
      notes: '٤',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'teacher-info-5',
      politicalName: 'فێنگ غەفور قادر',
      program: 'بەکالۆریۆس',
      specialty: 'زمانی ئینگلیزی',
      subject: 'زمانی ئینگلیزی',
      grade1: 1, grade2: 1, grade3: 1, grade4: 1, grade5: 1, grade6: 1, grade7: 1,
      totalHours: '٢١',
      notes: '',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  supervised_students: [
    {
      id: 'supervised-student-1',
      studentName: 'ئاحمد محەمەد علی',
      department: 'زانست',
      grade: 'قۆناغی شەشەم',
      violationType: 'دواکەوتن لە وانە',
      list: 'لیستی یەکەم',
      punishmentType: 'ئاگادارکردنەوە',
      guardianNotification: 'ناردراوە',
      guardianPhone: '٠٧٥٠١٢٣٤٥٦٧',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'supervised-student-2',
      studentName: 'فاتمە ئەحمەد حەسەن',
      department: 'ئەدەب',
      grade: 'قۆناغی حەوتەم',
      violationType: 'قسەکردن لە وانەدا',
      list: 'لیستی دووەم',
      punishmentType: 'سەرزەنشت',
      guardianNotification: 'ناردراوە',
      guardianPhone: '٠٧٥٠٩٨٧٦٥٤٣',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'supervised-student-3',
      studentName: 'عومەر خالید ئیبراهیم',
      department: 'بیرکاری',
      grade: 'قۆناغی هەشتەم',
      violationType: 'نەهێنانی پەرەسەندن',
      list: 'لیستی سێیەم',
      punishmentType: 'ئاگادارکردنەوە',
      guardianNotification: 'ناردراوە',
      guardianPhone: '٠٧٥١٤٥٦٧٨٩٠',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  employee_leaves: [
    {
      id: 'leave-1',
      employeeName: 'احمد محمد علی',
      specialty: 'ماموستای ئینگلیزی',
      leaveDate: '2024-03-15',
      leaveType: 'مۆڵەتی نەخۆشی',
      leaveDuration: 3,
      orderNumber: 'BM-2024-001',
      returnDate: '2024-03-18',
      notes: 'نەخۆشی کەمێک',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'leave-2',
      employeeName: 'فاتمە احمد حەسەن', 
      specialty: 'ماموستای کوردی',
      leaveDate: '2024-03-20',
      leaveType: 'مۆڵەتی کەسی',
      leaveDuration: 5,
      orderNumber: 'BM-2024-002',
      returnDate: '2024-03-25',
      notes: 'کاری تایبەت',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'leave-3',
      employeeName: 'عومەر ئیبراهیم محمد',
      specialty: 'بەڕێوەبەری قوتابخانە',
      leaveDate: '2024-03-22',
      leaveType: 'مۆڵەتی ساڵانە',
      leaveDuration: 7,
      orderNumber: 'BM-2024-003',
      returnDate: '2024-03-29',
      notes: 'مۆڵەتی پشوو',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  building_expenses: [
    { id: 'building-1', item: 'کریکار', cost: 20000, month: 'مانگی ١', created_at: new Date(), updated_at: new Date() },
    { id: 'building-2', item: 'جيهاني وهرزشي', cost: 71500, month: 'مانگی ٢', created_at: new Date(), updated_at: new Date() },
    { id: 'building-3', item: 'گول', cost: 15000, month: 'مانگی ٣', created_at: new Date(), updated_at: new Date() },
    { id: 'building-4', item: 'خول(بيتموز)', cost: 5000, month: 'مانگی ٤', created_at: new Date(), updated_at: new Date() },
    { id: 'building-5', item: 'كاي سواره (كارهبای)', cost: 90000, month: 'مانگی ١', created_at: new Date(), updated_at: new Date() }
  ],

  kitchen_expenses: [
    { id: 'kitchen-1', item: 'تهماته + خهيار', cost: 1750, month: 'مانگی ١', created_at: new Date(), updated_at: new Date() },
    { id: 'kitchen-2', item: 'سهموون', cost: 5000, month: 'مانگی ٢', created_at: new Date(), updated_at: new Date() },
    { id: 'kitchen-3', item: 'تهماته + خهيار', cost: 10000, month: 'مانگی ٣', created_at: new Date(), updated_at: new Date() },
    { id: 'kitchen-4', item: 'سهموون', cost: 4500, month: 'مانگی ٤', created_at: new Date(), updated_at: new Date() },
    { id: 'kitchen-5', item: 'تهماته + خهيار', cost: 6750, month: 'مانگی ١', created_at: new Date(), updated_at: new Date() }
  ]
};

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(dbName);
    
    // Seed all collections
    for (const [collectionName, data] of Object.entries(seedData)) {
      try {
        console.log(`🔄 Seeding collection: ${collectionName} (${data.length} records)`);
        
        // Check if collection already has data
        const existingCount = await db.collection(collectionName).countDocuments();
        
        if (existingCount > 0) {
          console.log(`⚠️  Collection ${collectionName} already has ${existingCount} records, skipping...`);
          continue;
        }
        
        // Insert data
        if (data.length > 0) {
          await db.collection(collectionName).insertMany(data);
          console.log(`✅ Successfully seeded ${collectionName} with ${data.length} records`);
        }
      } catch (error) {
        console.error(`❌ Error seeding ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    
    // Show summary of all collections
    for (const collectionName of Object.keys(seedData)) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} records`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;