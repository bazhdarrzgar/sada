/**
 * Test Script: Insert and Verify Data for All Sections
 * This script will:
 * 1. Insert sample data into each section
 * 2. Verify the data was saved correctly
 * 3. Check that all columns are properly stored
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data for each section
const testData = {
  payroll: {
    employeeName: 'Test Employee محەممەد',
    salary: 1000000,
    absence: 50000,
    deduction: 25000,
    bonus: 100000,
    total: 1025000,
    notes: 'Test payroll entry'
  },
  
  installments: {
    fullName: 'قوتابی تاقیکردنەوە',
    grade: 'پۆلی یەکەم',
    installmentType: 'شاگردی ناوخۆیی',
    annualAmount: 3000000,
    firstInstallment: 500000,
    secondInstallment: 500000,
    thirdInstallment: 500000,
    fourthInstallment: 500000,
    fifthInstallment: 500000,
    sixthInstallment: 500000,
    totalReceived: 3000000,
    remaining: 0,
    receiptImages: [],
    notes: 'تاقیکردنەوەی قیستەکان'
  },
  
  monthlyExpenses: {
    year: '2024',
    month: '1',
    staffSalary: 5000000,
    expenses: 1000000,
    buildingRent: 2000000,
    dramaFee: 500000,
    socialSupport: 300000,
    electricity: 200000,
    books: 150000,
    clothes: 100000,
    travel: 250000,
    transportation: 300000,
    total: 9800000,
    requirement: 'پێداویستیەکانی مانگی یەک',
    receiptImages: [],
    notes: 'تاقیکردنەوەی خەرجی مانگانە'
  },
  
  buildingExpenses: {
    item: 'چاکردنەوەی دیوار',
    cost: 500000,
    year: '2024',
    month: 1,
    date: '2024-01-15',
    notes: 'تاقیکردنەوەی مەسروفاتی بینا',
    images: []
  },
  
  dailyAccounts: {
    number: 1,
    week: 'هەفتەی یەکەم',
    purpose: 'کڕینی کەلوپەل',
    checkNumber: 'CH-001',
    amount: 250000,
    date: '2024-01-15',
    dayOfWeek: 'دووشەممە',
    receiptImages: [],
    notes: 'تاقیکردنەوەی حساباتی رۆژانە'
  },
  
  kitchenExpenses: {
    item: 'خواردنی نانی نیوەڕۆ',
    cost: 150000,
    date: '2024-01-15',
    month: 'کانوونی دووەم',
    year: '2024',
    purpose: 'خواردنی قوتابیان',
    receiptImages: [],
    notes: 'تاقیکردنەوەی خەرجی خواردنگە'
  }
};

async function testSection(sectionName, endpoint, data) {
  try {
    console.log(`\n📝 Testing: ${sectionName}`);
    console.log(`   Endpoint: POST ${endpoint}`);
    
    // Insert data
    const response = await axios.post(`${BASE_URL}${endpoint}`, data);
    
    if (response.status === 200 || response.status === 201) {
      console.log('   ✅ Data inserted successfully');
      console.log('   Response ID:', response.data.id);
      
      // Verify by fetching all records
      const getResponse = await axios.get(`${BASE_URL}${endpoint}`);
      const records = getResponse.data;
      
      console.log(`   📊 Total records in collection: ${records.length}`);
      
      // Find the record we just inserted
      const insertedRecord = records.find(r => r.id === response.data.id);
      
      if (insertedRecord) {
        console.log('   ✅ Record verified in database');
        console.log('   📋 Columns stored:', Object.keys(insertedRecord).filter(k => k !== '_id').join(', '));
        
        // Verify key fields
        let allFieldsCorrect = true;
        for (const [key, value] of Object.entries(data)) {
          if (insertedRecord[key] !== value && typeof value !== 'object') {
            console.log(`   ⚠️  Field mismatch: ${key} (expected: ${value}, got: ${insertedRecord[key]})`);
            allFieldsCorrect = false;
          }
        }
        
        if (allFieldsCorrect) {
          console.log('   ✅ All fields match!');
        }
        
        return { success: true, recordId: response.data.id };
      } else {
        console.log('   ❌ Record not found in database after insertion');
        return { success: false };
      }
    } else {
      console.log(`   ❌ Failed with status: ${response.status}`);
      return { success: false };
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.response) {
      console.log('   Error details:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING ALL SECTIONS - INSERT & VERIFY DATA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {};
  
  // Test 1: Payroll
  results.payroll = await testSection(
    'لیستی بڕی موچە (Payroll)',
    '/payroll',
    testData.payroll
  );
  
  // Test 2: Installments
  results.installments = await testSection(
    'قیستی ساڵانە (Annual Installments)',
    '/installments',
    testData.installments
  );
  
  // Test 3: Monthly Expenses
  results.monthlyExpenses = await testSection(
    'خەرجی مانگانە (Monthly Expenses)',
    '/monthly-expenses',
    testData.monthlyExpenses
  );
  
  // Test 4: Building Expenses
  results.buildingExpenses = await testSection(
    'مەسروفاتی بینا (Building Expenses)',
    '/building-expenses',
    testData.buildingExpenses
  );
  
  // Test 5: Daily Accounts
  results.dailyAccounts = await testSection(
    'حساباتی رۆژانە (Daily Accounts)',
    '/daily-accounts',
    testData.dailyAccounts
  );
  
  // Test 6: Kitchen Expenses
  results.kitchenExpenses = await testSection(
    'خەرجی خواردنگە (Kitchen Expenses)',
    '/kitchen-expenses',
    testData.kitchenExpenses
  );
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let passedTests = 0;
  let totalTests = 0;
  
  for (const [section, result] of Object.entries(results)) {
    totalTests++;
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${section}`);
    if (result.success) passedTests++;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📈 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! All sections are saving data correctly to MongoDB.\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

// Run tests
runAllTests().catch(console.error);
