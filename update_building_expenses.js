const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'berdoz_management';

async function updateBuildingExpenses() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log('🔄 Updating building expenses to add year field...');
    
    // Update all records that don't have year field
    const result = await db.collection('building_expenses').updateMany(
      { year: { $exists: false } },
      { 
        $set: { 
          year: "2024",  // Set default year as 2024 for existing records
          month: 1       // Ensure month is a number
        },
        $currentDate: { updated_at: true }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} building expense records with year field`);
    
    // Also ensure month is a number for all records
    const monthResult = await db.collection('building_expenses').updateMany(
      { month: { $type: "string" } },
      [
        {
          $set: {
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$month", "کانوونی دووەم - January"] }, then: 1 },
                  { case: { $eq: ["$month", "شوبات - February"] }, then: 2 },
                  { case: { $eq: ["$month", "ئازار - March"] }, then: 3 },
                  { case: { $eq: ["$month", "نیسان - April"] }, then: 4 },
                  { case: { $eq: ["$month", "ئایار - May"] }, then: 5 },
                  { case: { $eq: ["$month", "حوزەیران - June"] }, then: 6 },
                  { case: { $eq: ["$month", "تەمووز - July"] }, then: 7 },
                  { case: { $eq: ["$month", "ئاب - August"] }, then: 8 },
                  { case: { $eq: ["$month", "ئەیلوول - September"] }, then: 9 },
                  { case: { $eq: ["$month", "تشرینی یەکەم - October"] }, then: 10 },
                  { case: { $eq: ["$month", "تشرینی دووەم - November"] }, then: 11 },
                  { case: { $eq: ["$month", "کانوونی یەکەم - December"] }, then: 12 }
                ],
                default: 1
              }
            }
          }
        }
      ]
    );
    
    console.log(`✅ Converted ${monthResult.modifiedCount} month fields from string to number`);
    
  } catch (error) {
    console.error('Error updating building expenses:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

updateBuildingExpenses();