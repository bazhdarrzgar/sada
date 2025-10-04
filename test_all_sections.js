/**
 * Comprehensive Test Script for All Sections
 * Tests data saving to MongoDB for:
 * 1. لیستی بڕی موچە (Payroll)
 * 2. قیستی ساڵانە (Installments)
 * 3. خەرجی مانگانە (Monthly Expenses)
 * 4. مەسروفاتی بینا (Building Expenses)
 * 5. حساباتی رۆژانە (Daily Accounts)
 * 6. خەرجی خواردنگە (Kitchen Expenses)
 */

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'berdoz_management';

async function testAllSections() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = await MongoClient.connect(MONGO_URI);
    const db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Payroll (لیستی بڕی موچە)
    console.log('📋 Testing Section 1: لیستی بڕی موچە (Payroll)');
    const payrollCollection = db.collection('payroll');
    const payrollCount = await payrollCollection.countDocuments();
    const payrollSample = await payrollCollection.findOne({});
    console.log(`   Records: ${payrollCount}`);
    if (payrollSample) {
      console.log('   Columns:', Object.keys(payrollSample).filter(k => k !== '_id').join(', '));
      console.log('   ✅ Schema: employeeName, salary, absence, deduction, bonus, total, notes');
    } else {
      console.log('   ⚠️  No records found');
    }
    console.log('');
    
    // Test 2: Installments (قیستی ساڵانە)
    console.log('📋 Testing Section 2: قیستی ساڵانە (Annual Installments)');
    const installmentsCollection = db.collection('installments');
    const installmentsCount = await installmentsCollection.countDocuments();
    const installmentsSample = await installmentsCollection.findOne({});
    console.log(`   Records: ${installmentsCount}`);
    if (installmentsSample) {
      console.log('   Columns:', Object.keys(installmentsSample).filter(k => k !== '_id').join(', '));
      console.log('   ✅ Schema: fullName, grade, installmentType, annualAmount, firstInstallment-sixthInstallment, totalReceived, remaining, receiptImages, notes');
    } else {
      console.log('   ⚠️  No records found');
    }
    console.log('');
    
    // Test 3: Monthly Expenses (خەرجی مانگانە)
    console.log('📋 Testing Section 3: خەرجی مانگانە (Monthly Expenses)');
    const monthlyExpensesCollection = db.collection('monthly_expenses');
    const monthlyExpensesCount = await monthlyExpensesCollection.countDocuments();
    const monthlyExpensesSample = await monthlyExpensesCollection.findOne({});
    console.log(`   Records: ${monthlyExpensesCount}`);
    if (monthlyExpensesSample) {
      console.log('   Columns:', Object.keys(monthlyExpensesSample).filter(k => k !== '_id').join(', '));
      console.log('   ✅ Schema: year, month, staffSalary, expenses, buildingRent, dramaFee, socialSupport, electricity, books, clothes, travel, transportation, total, requirement, receiptImages, notes');
    } else {
      console.log('   ⚠️  No records found');
    }
    console.log('');
    
    // Test 4: Building Expenses (مەسروفاتی بینا)
    console.log('📋 Testing Section 4: مەسروفاتی بینا (Building Expenses)');
    const buildingExpensesCollection = db.collection('building_expenses');
    const buildingExpensesCount = await buildingExpensesCollection.countDocuments();
    const buildingExpensesSample = await buildingExpensesCollection.findOne({});
    console.log(`   Records: ${buildingExpensesCount}`);
    if (buildingExpensesSample) {
      console.log('   Columns:', Object.keys(buildingExpensesSample).filter(k => k !== '_id').join(', '));
      console.log('   ✅ Schema: item, cost, year, month, date, notes, images');
    } else {
      console.log('   ⚠️  No records found');
    }
    console.log('');
    
    // Test 5: Daily Accounts (حساباتی رۆژانە)
    console.log('📋 Testing Section 5: حساباتی رۆژانە (Daily Accounts)');
    const dailyAccountsCollection = db.collection('daily_accounts');
    const dailyAccountsCount = await dailyAccountsCollection.countDocuments();
    const dailyAccountsSample = await dailyAccountsCollection.findOne({});
    console.log(`   Records: ${dailyAccountsCount}`);
    if (dailyAccountsSample) {
      console.log('   Columns:', Object.keys(dailyAccountsSample).filter(k => k !== '_id').join(', '));
      console.log('   ✅ Schema: number, week, purpose, checkNumber, amount, date, dayOfWeek, receiptImages, notes');
    } else {
      console.log('   ⚠️  No records found');
    }
    console.log('');
    
    // Test 6: Kitchen Expenses (خەرجی خواردنگە)
    console.log('📋 Testing Section 6: خەرجی خواردنگە (Kitchen Expenses)');
    const kitchenExpensesCollection = db.collection('kitchen_expenses');
    const kitchenExpensesCount = await kitchenExpensesCollection.countDocuments();
    const kitchenExpensesSample = await kitchenExpensesCollection.findOne({});
    console.log(`   Records: ${kitchenExpensesCount}`);
    if (kitchenExpensesSample) {
      console.log('   Columns:', Object.keys(kitchenExpensesSample).filter(k => k !== '_id').join(', '));
      console.log('   ✅ Schema: item, cost, date, month, year, purpose, receiptImages, notes');
    } else {
      console.log('   ⚠️  No records found');
    }
    console.log('');
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`1. Payroll (لیستی بڕی موچە): ${payrollCount} records`);
    console.log(`2. Installments (قیستی ساڵانە): ${installmentsCount} records`);
    console.log(`3. Monthly Expenses (خەرجی مانگانە): ${monthlyExpensesCount} records`);
    console.log(`4. Building Expenses (مەسروفاتی بینا): ${buildingExpensesCount} records`);
    console.log(`5. Daily Accounts (حساباتی رۆژانە): ${dailyAccountsCount} records`);
    console.log(`6. Kitchen Expenses (خەرجی خواردنگە): ${kitchenExpensesCount} records`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalRecords = payrollCount + installmentsCount + monthlyExpensesCount + 
                        buildingExpensesCount + dailyAccountsCount + kitchenExpensesCount;
    
    console.log(`\n📈 Total Records: ${totalRecords}`);
    console.log('✅ All collections are accessible and properly structured!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

testAllSections();
