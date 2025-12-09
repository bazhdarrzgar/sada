// Test script for daily accounts edit functionality
const { MongoClient } = require('mongodb');

async function testDailyAccountsEdit() {
  const client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    const collection = db.collection('daily_accounts');
    
    // Get all records
    const records = await collection.find({}).limit(5).toArray();
    console.log(`\n✓ Found ${records.length} records`);
    
    if (records.length > 0) {
      console.log('\nSample record structure:');
      const sampleRecord = records[0];
      console.log(JSON.stringify({
        id: sampleRecord.id,
        number: sampleRecord.number,
        week: sampleRecord.week,
        purpose: sampleRecord.purpose,
        amount: sampleRecord.amount,
        date: sampleRecord.date,
        hasReceiptImages: sampleRecord.receiptImages ? sampleRecord.receiptImages.length : 0
      }, null, 2));
      
      console.log('\n✓ Record has ID field:', !!sampleRecord.id);
      console.log('✓ ID value:', sampleRecord.id);
    } else {
      console.log('\n! No records found in database');
    }
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✓ Connection closed');
  }
}

testDailyAccountsEdit();
