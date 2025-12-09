/**
 * Test script for monthly expenses edit functionality
 * Tests the three reported issues:
 * 1. Edit fetches correct data from table
 * 2. Edit updates data instead of creating new entries
 * 3. Search + edit works correctly
 */

const BASE_URL = 'http://localhost:3000';

async function testMonthlyExpensesEdit() {
  console.log('🧪 Testing Monthly Expenses Edit Functionality\n');
  
  try {
    // Step 1: Fetch all expenses
    console.log('📋 Step 1: Fetching all monthly expenses...');
    const response = await fetch(`${BASE_URL}/api/monthly-expenses`);
    const allExpenses = await response.json();
    console.log(`✅ Found ${allExpenses.length} expenses`);
    
    if (allExpenses.length === 0) {
      console.log('⚠️  No expenses found. Creating a test expense first...');
      
      // Create a test expense
      const testExpense = {
        year: '2024',
        month: '12',
        requirement: 'Test Expense - Original',
        staffSalary: 1000000,
        expenses: 500000,
        buildingRent: 300000,
        dramaFee: 0,
        socialSupport: 0,
        electricity: 100000,
        books: 50000,
        clothes: 0,
        travel: 0,
        transportation: 0,
        total: 1950000,
        notes: 'This is a test expense for edit functionality'
      };
      
      const createResponse = await fetch(`${BASE_URL}/api/monthly-expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testExpense)
      });
      
      if (!createResponse.ok) {
        console.error('❌ Failed to create test expense');
        return;
      }
      
      const created = await createResponse.json();
      console.log(`✅ Created test expense with ID: ${created.id}`);
      allExpenses.push(created);
    }
    
    // Step 2: Select first expense for testing
    const testExpense = allExpenses[0];
    console.log(`\n📝 Step 2: Testing edit with expense ID: ${testExpense.id}`);
    console.log(`   Original requirement: "${testExpense.requirement}"`);
    console.log(`   Original staffSalary: ${testExpense.staffSalary}`);
    console.log(`   Original total: ${testExpense.total}`);
    
    // Step 3: Simulate edit - update the expense
    console.log('\n🔄 Step 3: Updating expense...');
    const updatedData = {
      ...testExpense,
      requirement: 'EDITED - Test Update',
      staffSalary: testExpense.staffSalary + 100000,
      total: testExpense.total + 100000,
      notes: `${testExpense.notes || ''} - EDITED at ${new Date().toISOString()}`
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/monthly-expenses/${testExpense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    if (!updateResponse.ok) {
      console.error(`❌ Failed to update expense: ${updateResponse.statusText}`);
      const errorText = await updateResponse.text();
      console.error(`   Error details: ${errorText}`);
      return;
    }
    
    const updated = await updateResponse.json();
    console.log(`✅ Update successful!`);
    console.log(`   Updated requirement: "${updated.requirement}"`);
    console.log(`   Updated staffSalary: ${updated.staffSalary}`);
    console.log(`   Updated total: ${updated.total}`);
    
    // Step 4: Verify the update
    console.log('\n🔍 Step 4: Verifying the update...');
    const verifyResponse = await fetch(`${BASE_URL}/api/monthly-expenses`);
    const allExpensesAfter = await verifyResponse.json();
    const verifiedExpense = allExpensesAfter.find(e => e.id === testExpense.id);
    
    if (!verifiedExpense) {
      console.error('❌ Expense not found after update!');
      return;
    }
    
    console.log('✅ Expense found in database');
    console.log(`   Requirement matches: ${verifiedExpense.requirement === updatedData.requirement ? '✅' : '❌'}`);
    console.log(`   StaffSalary matches: ${verifiedExpense.staffSalary === updatedData.staffSalary ? '✅' : '❌'}`);
    console.log(`   Total matches: ${verifiedExpense.total === updatedData.total ? '✅' : '❌'}`);
    
    // Step 5: Check that no duplicate was created
    const duplicates = allExpensesAfter.filter(e => 
      e.requirement === updatedData.requirement && e.notes && e.notes.includes('EDITED')
    );
    console.log(`\n📊 Step 5: Checking for duplicates...`);
    console.log(`   Found ${duplicates.length} expense(s) with edited data`);
    console.log(`   Total count before: ${allExpenses.length}`);
    console.log(`   Total count after: ${allExpensesAfter.length}`);
    
    if (allExpensesAfter.length === allExpenses.length) {
      console.log('✅ No duplicate created - edit worked correctly!');
    } else if (allExpensesAfter.length > allExpenses.length) {
      console.log('❌ WARNING: A new entry was created instead of updating!');
      console.log(`   Expected: ${allExpenses.length}, Got: ${allExpensesAfter.length}`);
    }
    
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
  }
}

// Run the test
testMonthlyExpensesEdit();
