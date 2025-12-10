const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'sada.db');

async function testEditAPI() {
  console.log('🧪 Testing Supervision Edit API\n');
  console.log('==========================================\n');

  // Get records from database
  let db = new Database(dbPath);
  let records = db.prepare('SELECT * FROM supervision ORDER BY updated_at DESC').all();
  
  if (records.length === 0) {
    console.log('❌ No records found in database');
    db.close();
    return;
  }

  const testRecord = records[0];
  const testData = JSON.parse(testRecord.data);
  
  console.log('📊 Test Record:');
  console.log(`   ID: ${testRecord.id}`);
  console.log(`   Type: ${testData.type}`);
  console.log(`   Name: ${testData.name}`);
  console.log(`   Subject: ${testData.subject || 'N/A'}`);
  console.log(`   Department: ${testData.department}\n`);

  // Test 1: Verify GET endpoint returns correct data
  console.log('📝 TEST 1: GET /api/supervision');
  console.log('----------------------------------------------');
  try {
    const getResponse = await fetch('http://localhost:3000/api/supervision');
    const getData = await getResponse.json();
    
    console.log(`✅ GET request successful`);
    console.log(`   Total records returned: ${getData.length}`);
    
    const firstApiRecord = getData[0];
    console.log(`\n   First record from API:`);
    console.log(`   ID: ${firstApiRecord.id}`);
    console.log(`   Name: ${firstApiRecord.name}`);
    
    if (firstApiRecord.id === testRecord.id && firstApiRecord.name === testData.name) {
      console.log('✅ API data matches database!');
    } else {
      console.log('❌ API data mismatch with database');
    }
  } catch (error) {
    console.log(`❌ GET request failed: ${error.message}`);
  }

  console.log('\n');

  // Test 2: Update record via PUT
  console.log('📝 TEST 2: PUT /api/supervision/:id');
  console.log('----------------------------------------------');
  
  const updatedName = testData.name + ' - API Test';
  const updatePayload = {
    ...testData,
    name: updatedName
  };
  
  console.log(`Updating record ${testRecord.id}`);
  console.log(`   Original name: "${testData.name}"`);
  console.log(`   New name: "${updatedName}"`);
  
  try {
    const putResponse = await fetch(`http://localhost:3000/api/supervision/${testRecord.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log(`✅ PUT request successful`);
      console.log(`   Returned name: "${putData.name}"`);
      
      // Verify in database
      db = new Database(dbPath);
      const dbVerify = db.prepare('SELECT * FROM supervision WHERE id = ?').get(testRecord.id);
      const dbVerifyData = JSON.parse(dbVerify.data);
      db.close();
      
      console.log(`\n📊 Database verification:`);
      console.log(`   Database name: "${dbVerifyData.name}"`);
      
      if (dbVerifyData.name === updatedName) {
        console.log('✅ SUCCESS: Database updated correctly!');
      } else {
        console.log('❌ ERROR: Database not updated!');
      }
    } else {
      console.log(`❌ PUT request failed: ${putResponse.status} ${putResponse.statusText}`);
    }
  } catch (error) {
    console.log(`❌ PUT request failed: ${error.message}`);
  }

  console.log('\n');
  console.log('==========================================');
  console.log('🎉 API TESTS COMPLETED!');
  console.log('==========================================\n');
  
  db.close();
}

testEditAPI().catch(console.error);
