const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection
const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'berdoz_management';

// Sample data for missing collections
const missingCollectionsData = {
  // Staff Records (تۆمارەکانی ستاف)
  staff_records: [
    {
      id: uuidv4(),
      fullName: 'ئازاد قادر محمد',
      mobile: '07501234567',
      address: 'سلێمانی، گەڕەکی سەرچنار',
      gender: 'نێر',
      dateOfBirth: '1985-03-15',
      certificate: 'بەکالۆریۆس بازرگانی',
      age: 38,
      education: 'زانکۆیی',
      attendance: 'Present',
      date: '2024-01-15',
      department: 'بەڕێوەبردن',
      pass: 'A+',
      contract: 'Permanent',
      bloodType: 'O+',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      fullName: 'شیرین احمد علی',
      mobile: '07509876543',
      address: 'هەولێر، شاری نوێ',
      gender: 'مێ',
      dateOfBirth: '1990-07-20',
      certificate: 'ماستەر لە یاسا',
      age: 33,
      education: 'زانکۆیی',
      attendance: 'Present',
      date: '2024-01-15',
      department: 'کاروباری یاسایی',
      pass: 'A',
      contract: 'Permanent',
      bloodType: 'A+',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Activities (چالاکی)
  activities: [
    {
      id: uuidv4(),
      activityType: 'چالاکی هونەری',
      preparationDate: '2024-02-01',
      content: 'پیشاندانی نووسین و شیعر بۆ قوتابیانی پۆلی ناوین',
      startDate: '2024-02-15',
      whoDidIt: 'یەکیتی هونەرمەندان',
      helper: 'مامۆستایانی کوردی',
      activityImages: [],
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      activityType: 'چالاکی وەرزشی',
      preparationDate: '2024-03-01',
      content: 'پاڵەوانی تۆپی پێ لە نێوان پۆلەکاندا',
      startDate: '2024-03-10',
      whoDidIt: 'بەشی وەرزش',
      helper: 'مامۆستایانی وەرزش',
      activityImages: [],
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Payroll (لیستی بڕی موچە)
  payroll: [
    {
      id: uuidv4(),
      employeeName: 'احمد محمد علی',
      salary: 800000,
      absence: 2,
      deduction: 50000,
      bonus: 100000,
      total: 850000,
      notes: 'پاداشتی باشی',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      employeeName: 'فاتمە احمد حەسەن',
      salary: 750000,
      absence: 0,
      deduction: 0,
      bonus: 75000,
      total: 825000,
      notes: 'هەموو ڕۆژەکان ئامادەبووە',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Student Permissions (مۆڵەت)
  student_permissions: [
    {
      id: uuidv4(),
      studentName: 'سەرهەنگ ئەحمەد محمد',
      grade: 'پۆلی شەشەم',
      department: 'زانست',
      permissionType: 'مۆڵەتی نەخۆشی',
      startDate: '2024-03-10',
      endDate: '2024-03-12',
      duration: 3,
      reason: 'نەخۆشی',
      guardianName: 'ئەحمەد محمد',
      guardianPhone: '07501234567',
      approved: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      studentName: 'دلیا فەرید قادر',
      grade: 'پۆلی حەوتەم',
      department: 'ئەدەب',
      permissionType: 'مۆڵەتی کەسی',
      startDate: '2024-03-15',
      endDate: '2024-03-16',
      duration: 2,
      reason: 'کاری تایبەت',
      guardianName: 'فەرید قادر',
      guardianPhone: '07509876543',
      approved: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Supervision (چاودێری)
  supervision: [
    {
      id: uuidv4(),
      teacherName: 'احمد محمد علی',
      subject: 'کیمیا',
      grade: 'پۆلی نۆیەم',
      supervisionDate: '2024-03-01',
      supervisionType: 'چاودێری پۆلی',
      notes: 'وانەکە باش پێشکەوتووە، قوتابیان چالاکن',
      rating: 'باش',
      supervisor: 'بەڕێوەبەری قوتابخانە',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      teacherName: 'سارا فەرهاد رەشید',
      subject: 'ئینگلیزی',
      grade: 'پۆلی هەشتەم',
      supervisionDate: '2024-03-05',
      supervisionType: 'چاودێری ئەرکی ماڵەوە',
      notes: 'ئەرکەکان باش ڕاستکراونەتەوە',
      rating: 'زۆر باش',
      supervisor: 'بەڕێوەبەری پەروەردە',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Installments (قیستی ساڵانه)
  installments: [
    {
      id: uuidv4(),
      studentName: 'کاروان ئەحمەد محمد',
      grade: 'پۆلی شەشەم',
      totalAmount: 1200000,
      paidAmount: 800000,
      remaining: 400000,
      installmentNumber: 2,
      dueDate: '2024-04-01',
      status: 'نیمچە دراوە',
      paymentDate: '2024-02-15',
      notes: 'پارەی قیستی دووەم وەرگیرا',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      studentName: 'ئاوات فەرید قادر',
      grade: 'پۆلی حەوتەم',
      totalAmount: 1200000,
      paidAmount: 1200000,
      remaining: 0,
      installmentNumber: 3,
      dueDate: '2024-03-01',
      status: 'تەواو دراوە',
      paymentDate: '2024-02-28',
      notes: 'پارەی تەواو وەرگیرا',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Monthly Expenses (خەرجی مانگانه)
  monthly_expenses: [
    {
      id: uuidv4(),
      month: 'کانونی دووەم ٢٠٢٤',
      salaries: 5000000,
      rent: 800000,
      utilities: 300000,
      maintenance: 200000,
      supplies: 150000,
      other: 100000,
      total: 6550000,
      notes: 'خەرجی مانگی کانونی دووەم',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      month: 'شوبات ٢٠٢٤',
      salaries: 5200000,
      rent: 800000,
      utilities: 350000,
      maintenance: 180000,
      supplies: 120000,
      other: 80000,
      total: 6730000,
      notes: 'خەرجی مانگی شوبات',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Daily Accounts (حساباتی رۆژانه)
  daily_accounts: [
    {
      id: uuidv4(),
      date: '2024-03-01',
      income: 500000,
      expenses: 200000,
      balance: 300000,
      incomeSource: 'پارەی قیست',
      expenseType: 'کڕینی پێداویستی',
      description: 'وەرگرتنی پارەی قیستی قوتابیان',
      responsiblePerson: 'بەڕێوەبەری دارایی',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      date: '2024-03-02',
      income: 300000,
      expenses: 150000,
      balance: 150000,
      incomeSource: 'پارەی چالاکی',
      expenseType: 'خەرجی ڕۆژانە',
      description: 'پارەی چالاکی هونەری',
      responsiblePerson: 'بەڕێوەبەری قوتابخانە',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // Exam Supervision (چاودێریکردنی تاقیرکدنەوە)
  exam_supervision: [
    {
      id: uuidv4(),
      examName: 'تاقیکردنەوەی مانگانەی یەکەم',
      examDate: '2024-03-10',
      subject: 'بیرکاری',
      grade: 'پۆلی نۆیەم',
      supervisorName: 'احمد محمد علی',
      assistantSupervisor: 'سارا فەرهاد رەشید',
      examRoom: 'پۆلی یەکەم',
      startTime: '08:00',
      endTime: '10:00',
      numberOfStudents: 25,
      notes: 'تاقیکردنەوەکە بە باشی تەواوبوو',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: uuidv4(),
      examName: 'تاقیکردنەوەی مانگانەی دووەم',
      examDate: '2024-03-15',
      subject: 'زانست',
      grade: 'پۆلی هەشتەم',
      supervisorName: 'کامەران ئازاد محمد',
      assistantSupervisor: 'شیرین احمد علی',
      examRoom: 'پۆلی دووەم',
      startTime: '10:30',
      endTime: '12:30',
      numberOfStudents: 30,
      notes: 'قوتابیان باش ئامادەبوون',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
};

async function addMissingCollections() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(dbName);
    
    // Add missing collections
    for (const [collectionName, data] of Object.entries(missingCollectionsData)) {
      try {
        console.log(`🔄 Adding collection: ${collectionName} (${data.length} records)`);
        
        // Check if collection already has data
        const existingCount = await db.collection(collectionName).countDocuments();
        
        if (existingCount > 0) {
          console.log(`⚠️  Collection ${collectionName} already has ${existingCount} records, skipping...`);
          continue;
        }
        
        // Insert data
        if (data.length > 0) {
          await db.collection(collectionName).insertMany(data);
          console.log(`✅ Successfully added ${collectionName} with ${data.length} records`);
        }
      } catch (error) {
        console.error(`❌ Error adding ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Missing collections added successfully!');
    console.log('\n📊 Updated Summary:');
    
    // Show summary of all collections
    const allCollections = await db.listCollections().toArray();
    for (const collection of allCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} records`);
    }
    
  } catch (error) {
    console.error('❌ Error adding missing collections:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script if executed directly
if (require.main === module) {
  addMissingCollections();
}

module.exports = addMissingCollections;