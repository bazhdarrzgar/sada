const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'sada.db');
const db = new Database(dbPath);

// Add test supervision records
const testRecords = [
  {
    type: 'teacher',
    name: 'احمد محمود',
    subject: 'ریاضی',
    department: 'زانست',
    grade: 'پۆلی ٥',
    violationType: 'دواکەوتن',
    punishmentType: 'ئاگاداری',
    supervisionLocation: 'پاسگە',
    notes: 'تێبینی یەکەم'
  },
  {
    type: 'teacher',
    name: 'سارا علی',
    subject: 'ئینگلیزی',
    department: 'زمان',
    grade: 'پۆلی ٦',
    violationType: 'کەموکوڕی',
    punishmentType: 'سزا',
    supervisionLocation: 'هۆڵ',
    notes: 'تێبینی دووەم'
  },
  {
    type: 'student',
    name: 'عمر حسن',
    department: 'زانست',
    grade: 'پۆلی ٤',
    violationType: 'ژاوەژاو',
    punishmentType: 'هۆشدارانە',
    supervisionLocation: 'حەوشە',
    notes: 'خوێندکاری یەکەم'
  }
];

console.log('Adding test supervision records...\n');

testRecords.forEach((record, index) => {
  const id = uuidv4();
  const created_at = new Date().toISOString();
  const updated_at = created_at;
  
  // Store all data except id, created_at, updated_at in data column
  const { ...dataOnly } = record;
  
  const stmt = db.prepare(`
    INSERT INTO supervision (id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(id, JSON.stringify(dataOnly), created_at, updated_at);
  
  console.log(`✅ Record ${index + 1} added:`);
  console.log(`  ID: ${id}`);
  console.log(`  Type: ${record.type}`);
  console.log(`  Name: ${record.name}\n`);
});

// Query and display all records
console.log('\nAll supervision records in database:');
const records = db.prepare('SELECT * FROM supervision').all();
console.log(`Total records: ${records.length}\n`);

records.forEach((record, index) => {
  const data = JSON.parse(record.data);
  console.log(`Record ${index + 1}:`);
  console.log(`  ID: ${record.id}`);
  console.log(`  Type: ${data.type}`);
  console.log(`  Name: ${data.name}`);
  console.log(`  Created: ${record.created_at}\n`);
});

db.close();
console.log('✅ Test data added successfully!');
