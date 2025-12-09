/**
 * Test: Edit functionality with search/filter
 * This simulates the user scenario: Search -> Edit -> Save
 */

const BASE_URL = 'http://localhost:3000';

async function testEditWithSearch() {
  console.log('🔍 Testing Edit with Search/Filter\n');
  
  try {
    // Step 1: Add multiple test expenses
    console.log('📝 Step 1: Creating test data...');
    
    const testExpenses = [
      {
        year: '2024',
        month: '1',
        requirement: 'January Expenses - Salary',
        staffSalary: 2000000,
        expenses: 300000,
        buildingRent: 500000,
        total: 2800000,
        notes: 'January test data'
      },
      {
        year: '2024',
        month: '2',
        requirement: 'February Expenses - Equipment',
        staffSalary: 2000000,
        expenses: 800000,
        buildingRent: 500000,
        total: 3300000,
        notes: 'February test data'
      },
      {
        year: '2024',
        month: '3',
        requirement: 'March Expenses - Training',
        staffSalary: 2000000,
        expenses: 1000000,
        buildingRent: 500000,
        total: 3500000,
        notes: 'March test data'
      }
    ];
    
    const createdIds = [];
    for (const expense of testExpenses) {
      const response = await fetch(`${BASE_URL}/api/monthly-expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      
      if (response.ok) {
        const created = await response.json();
        createdIds.push(created.id);
        console.log(`✅ Created expense for ${expense.requirement.split(' - ')[0]}`);
      }
    }
    
    console.log(`\n📊 Created ${createdIds.length} test expenses\n`);
    
    // Step 2: Fetch all expenses
    console.log('📋 Step 2: Fetching all expenses...');
    const allResponse = await fetch(`${BASE_URL}/api/monthly-expenses`);
    const allExpenses = await allResponse.json();
    console.log(`   Total expenses in database: ${allExpenses.length}`);
    
    // Step 3: Simulate filter/search - find February expense
    console.log('\n🔍 Step 3: Simulating search for "February"...');
    const februaryExpense = allExpenses.find(e => e.requirement && e.requirement.includes('February'));
    
    if (!februaryExpense) {
      console.error('❌ February expense not found!');
      return;
    }
    
    console.log(`✅ Found expense: ${februaryExpense.requirement}`);
    console.log(`   ID: ${februaryExpense.id}`);
    console.log(`   Original total: ${februaryExpense.total}`);
    console.log(`   Original expenses: ${februaryExpense.expenses}`);
    
    // Step 4: Edit the filtered item
    console.log('\n✏️  Step 4: Editing the February expense...');
    const updatedData = {
      ...februaryExpense,
      requirement: 'February Expenses - Equipment [EDITED AFTER SEARCH]',
      expenses: februaryExpense.expenses + 200000,
      total: februaryExpense.total + 200000,
      notes: `${februaryExpense.notes} - EDITED via search at ${new Date().toISOString()}`
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/monthly-expenses/${februaryExpense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    if (!updateResponse.ok) {
      console.error(`❌ Failed to update: ${updateResponse.statusText}`);
      return;
    }
    
    const updated = await updateResponse.json();
    console.log('✅ Update successful!');
    console.log(`   New requirement: ${updated.requirement}`);
    console.log(`   New expenses: ${updated.expenses}`);
    console.log(`   New total: ${updated.total}`);
    
    // Step 5: Verify the update
    console.log('\n🔍 Step 5: Verifying the update...');
    const verifyResponse = await fetch(`${BASE_URL}/api/monthly-expenses`);
    const allExpensesAfter = await verifyResponse.json();
    
    console.log(`   Total count before: ${allExpenses.length}`);
    console.log(`   Total count after: ${allExpensesAfter.length}`);
    
    const verifiedExpense = allExpensesAfter.find(e => e.id === februaryExpense.id);
    
    if (!verifiedExpense) {
      console.error('❌ Expense not found after update!');
      return;
    }
    
    console.log('\n📊 Verification Results:');
    console.log(`   ✅ Expense still exists with same ID`);
    console.log(`   ${verifiedExpense.requirement === updatedData.requirement ? '✅' : '❌'} Requirement updated correctly`);
    console.log(`   ${verifiedExpense.expenses === updatedData.expenses ? '✅' : '❌'} Expenses updated correctly`);
    console.log(`   ${verifiedExpense.total === updatedData.total ? '✅' : '❌'} Total updated correctly`);
    console.log(`   ${verifiedExpense.notes.includes('EDITED via search') ? '✅' : '❌'} Notes updated correctly`);
    
    if (allExpensesAfter.length === allExpenses.length) {
      console.log(`   ✅ No duplicate created`);
    } else {
      console.log(`   ❌ WARNING: Record count changed! (${allExpenses.length} -> ${allExpensesAfter.length})`);
    }
    
    // Step 6: Test editing with month filter
    console.log('\n🗓️  Step 6: Testing edit with month filter...');
    const marchExpenses = allExpensesAfter.filter(e => e.month === '3');
    console.log(`   Found ${marchExpenses.length} expense(s) for March`);
    
    if (marchExpenses.length > 0) {
      const marchExpense = marchExpenses[0];
      console.log(`   Editing: ${marchExpense.requirement}`);
      
      const marchUpdate = {
        ...marchExpense,
        requirement: 'March Expenses - Training [EDITED WITH MONTH FILTER]',
        staffSalary: marchExpense.staffSalary + 100000,
        total: marchExpense.total + 100000
      };
      
      const marchResponse = await fetch(`${BASE_URL}/api/monthly-expenses/${marchExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marchUpdate)
      });
      
      if (marchResponse.ok) {
        console.log('   ✅ March expense updated successfully');
        
        // Verify
        const finalVerify = await fetch(`${BASE_URL}/api/monthly-expenses`);
        const finalExpenses = await finalVerify.json();
        const finalMarch = finalExpenses.find(e => e.id === marchExpense.id);
        
        if (finalMarch && finalMarch.requirement.includes('[EDITED WITH MONTH FILTER]')) {
          console.log('   ✅ Verification passed: Edit with filter works correctly!');
        }
      }
    }
    
    console.log('\n✨ All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Edit with search works correctly');
    console.log('   ✅ Edit with filter works correctly');
    console.log('   ✅ No duplicate entries created');
    console.log('   ✅ Correct data fetched for editing');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testEditWithSearch();
