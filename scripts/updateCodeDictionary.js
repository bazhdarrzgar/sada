const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection
const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'berdoz_management';

// Updated code dictionary as provided by the user
const CODE_DICTIONARY = {
  'A': 'Regis Name',
  'B': 'Media', 
  'C': 'HR Staff Records',
  'D': 'E.parwarda records',
  'E': 'Bus Records',
  'F': 'Monitoring R',
  'G': 'S License Records',
  'H': 'Teacher Evaluation Records',
  'I': 'Student Absent',
  'J': 'Salary Records',
  'K': 'Pen Records',
  'L': 'Daily Manager Records',
  'M': 'Teacher Attendance',
  'N': 'Report Records',
  'O': 'Observed Student Records',
  'P': 'Class Record',
  'Q': 'Activities Records',
  'R': 'Future Plan Records',
  'S': 'Subject Records',
  'T': 'CoCar BM Records',
  'U': 'Parent Rec',
  'V': 'Security Records',
  'W': 'Clean Records',
  'X': 'Student Profile Record',
  'Y': 'Meeting & Discussion',
  'Z': 'Time Table',
  'A1': 'Progress',
  'B1': 'Orders',
  'C1': 'Student Pay',
  'D1': 'Exam Records',
  'E1': 'First Day of CoCar',
  'F1': 'CourseWare Record',
  'G1': 'Material',
  'TB': 'Daily Monitor Records'
};

async function updateCodeDictionary() {
  const client = new MongoClient(uri);
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(dbName);
    const collection = db.collection('legend_entries');
    
    console.log('🔄 Updating code dictionary...');
    
    let updatedCount = 0;
    let createdCount = 0;
    
    // Update or create each code in the dictionary
    for (const [code, description] of Object.entries(CODE_DICTIONARY)) {
      try {
        const existingEntry = await collection.findOne({ abbreviation: code });
        
        if (existingEntry) {
          // Update existing entry with correct description
          await collection.updateOne(
            { abbreviation: code },
            {
              $set: {
                full_description: description,
                updated_at: new Date()
              }
            }
          );
          updatedCount++;
          console.log(`✅ Updated: ${code} = ${description}`);
        } else {
          // Create new entry
          const newEntry = {
            id: uuidv4(),
            abbreviation: code,
            full_description: description,
            category: 'Records',
            usage_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
            last_used: null
          };
          
          await collection.insertOne(newEntry);
          createdCount++;
          console.log(`🆕 Created: ${code} = ${description}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${code}:`, error.message);
      }
    }
    
    console.log('\n🎉 Code dictionary update completed!');
    console.log(`📊 Summary:`);
    console.log(`   Updated: ${updatedCount} codes`);
    console.log(`   Created: ${createdCount} codes`);
    console.log(`   Total processed: ${Object.keys(CODE_DICTIONARY).length} codes`);
    
    // Show final count
    const totalCount = await collection.countDocuments();
    console.log(`   Total codes in database: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Error updating code dictionary:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  updateCodeDictionary();
}

module.exports = updateCodeDictionary;