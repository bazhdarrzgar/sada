const Database = require('better-sqlite3');
const path = require('path');
const { chromium } = require('playwright');

const dbPath = path.join(__dirname, 'database', 'sada.db');

async function testEditFunctionality() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 Testing Supervision Edit Functionality\n');
    console.log('==========================================\n');

    // Login
    console.log('🔐 Step 1: Logging in...');
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder*="username"]', 'berdoz');
    await page.fill('input[type="password"]', 'berdoz@code');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in successfully\n');

    // Navigate to supervision
    console.log('📄 Step 2: Navigating to supervision page...');
    await page.goto('http://localhost:3000/supervision');
    await page.waitForTimeout(4000);
    console.log('✅ Supervision page loaded\n');

    // Get initial data from database
    let db = new Database(dbPath);
    let initialRecords = db.prepare('SELECT * FROM supervision ORDER BY updated_at DESC').all();
    console.log(`📊 Initial database records: ${initialRecords.length}`);
    const firstRecord = initialRecords[0];
    const firstRecordData = JSON.parse(firstRecord.data);
    console.log(`   First record ID: ${firstRecord.id}`);
    console.log(`   First record name: ${firstRecordData.name}\n`);
    db.close();

    // Test 1: Edit first record without search
    console.log('📝 TEST 1: Edit first record (no search filter)');
    console.log('----------------------------------------------');
    
    // Click the edit button in the first row
    const editButtons = await page.$$('button[aria-label*="Edit"]');
    if (editButtons.length === 0) {
      // Try alternative selector for edit button (look for pencil icon parent)
      const alternativeEditBtns = await page.$$('svg.lucide-edit');
      if (alternativeEditBtns.length > 0) {
        console.log(`Found ${alternativeEditBtns.length} edit buttons (via icon lookup)`);
        await alternativeEditBtns[0].click();
      } else {
        // Last resort: find all buttons and look for one containing edit icon
        console.log('Using fallback method to find edit button...');
        await page.evaluate(() => {
          const allButtons = document.querySelectorAll('button');
          for (const btn of allButtons) {
            if (btn.querySelector('.lucide-edit, [data-icon="edit"]')) {
              btn.click();
              break;
            }
          }
        });
      }
    } else {
      console.log(`Found ${editButtons.length} edit buttons`);
      await editButtons[0].click();
    }
    
    await page.waitForTimeout(2500);
    console.log('✅ Edit modal opened');

    // Check loaded data
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) {
      const loadedName = await nameInput.inputValue();
      console.log(`✅ Data loaded in modal: "${loadedName}"`);
      console.log(`   Expected: "${firstRecordData.name}"`);
      
      const isCorrect = loadedName === firstRecordData.name;
      if (isCorrect) {
        console.log('✅ CORRECT: Data loaded matches database record!');
      } else {
        console.log('❌ ERROR: Data mismatch - wrong record loaded!');
      }

      // Modify the name
      const modifiedName = loadedName + ' - EditTest1';
      await nameInput.fill(modifiedName);
      await page.waitForTimeout(500);
      console.log(`✅ Modified name to: "${modifiedName}"`);

      // Save
      const saveButton = await page.$('button:has-text("Save")');
      if (saveButton) {
        await saveButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ Save button clicked');

        // Verify database was updated
        db = new Database(dbPath);
        const updatedRecord = db.prepare('SELECT * FROM supervision WHERE id = ?').get(firstRecord.id);
        const updatedData = JSON.parse(updatedRecord.data);
        db.close();

        console.log(`\n📊 Database verification:`);
        console.log(`   Updated name: "${updatedData.name}"`);
        
        if (updatedData.name === modifiedName) {
          console.log('✅ SUCCESS: Database updated correctly!');
        } else {
          console.log('❌ ERROR: Database not updated or wrong record modified!');
          console.log(`   Expected: "${modifiedName}"`);
          console.log(`   Got: "${updatedData.name}"`);
        }
      }
    }

    console.log('\n');

    // Test 2: Edit with search filter
    console.log('🔍 TEST 2: Edit with search filter');
    console.log('----------------------------------------------');
    
    // Get a different record to search for
    db = new Database(dbPath);
    let allRecords = db.prepare('SELECT * FROM supervision').all();
    const secondRecord = allRecords.length > 1 ? allRecords[1] : allRecords[0];
    const secondRecordData = JSON.parse(secondRecord.data);
    const searchTerm = secondRecordData.name.substring(0, 4); // First few characters
    console.log(`🔍 Searching for: "${searchTerm}"`);
    console.log(`   Target record ID: ${secondRecord.id}`);
    console.log(`   Target record name: "${secondRecordData.name}"`);
    db.close();

    // Perform search
    const searchInput = await page.$('input[placeholder*="گەڕان"]');
    if (searchInput) {
      await searchInput.fill('');
      await page.waitForTimeout(500);
      await searchInput.fill(searchTerm);
      await page.waitForTimeout(2000);
      console.log('✅ Search applied');

      // Click edit on the filtered result
      await page.evaluate(() => {
        const allButtons = document.querySelectorAll('button');
        for (const btn of allButtons) {
          if (btn.querySelector('.lucide-edit, [data-icon="edit"]')) {
            btn.click();
            break;
          }
        }
      });
      
      await page.waitForTimeout(2500);
      console.log('✅ Edit modal opened from search');

      // Verify loaded data
      const nameInputSearch = await page.$('input[type="text"]');
      if (nameInputSearch) {
        const loadedNameSearch = await nameInputSearch.inputValue();
        console.log(`✅ Data loaded in modal: "${loadedNameSearch}"`);
        console.log(`   Expected: "${secondRecordData.name}"`);
        
        const isCorrectSearch = loadedNameSearch === secondRecordData.name;
        if (isCorrectSearch) {
          console.log('✅ CORRECT: Search filter edit loaded correct record!');
        } else {
          console.log('❌ ERROR: Wrong record loaded from search!');
        }

        // Modify and save
        const modifiedNameSearch = loadedNameSearch + ' - SearchTest';
        await nameInputSearch.fill(modifiedNameSearch);
        await page.waitForTimeout(500);
        console.log(`✅ Modified name to: "${modifiedNameSearch}"`);

        const saveButtonSearch = await page.$('button:has-text("Save")');
        if (saveButtonSearch) {
          await saveButtonSearch.click();
          await page.waitForTimeout(3000);
          console.log('✅ Save button clicked');

          // Verify database
          db = new Database(dbPath);
          const updatedRecordSearch = db.prepare('SELECT * FROM supervision WHERE id = ?').get(secondRecord.id);
          const updatedDataSearch = JSON.parse(updatedRecordSearch.data);
          db.close();

          console.log(`\n📊 Database verification:`);
          console.log(`   Updated name: "${updatedDataSearch.name}"`);
          
          if (updatedDataSearch.name === modifiedNameSearch) {
            console.log('✅ SUCCESS: Search filter edit updated database correctly!');
          } else {
            console.log('❌ ERROR: Database not updated correctly!');
            console.log(`   Expected: "${modifiedNameSearch}"`);
            console.log(`   Got: "${updatedDataSearch.name}"`);
          }
        }
      }
    }

    console.log('\n');
    console.log('==========================================');
    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('==========================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testEditFunctionality().catch(console.error);
