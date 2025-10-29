/**
 * Database Backup & Restore Verification Script
 * This script helps verify that all data is correctly backed up and restored
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'sada.db');

console.log('=== Database Backup/Restore Verification ===\n');

try {
  const db = new Database(dbPath);
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  
  console.log(`Found ${tables.length} tables in the database:\n`);
  
  // For each table, count records
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`  - ${table.name}: ${count.count} records`);
    
    // Show sample data for debugging
    if (count.count > 0 && count.count <= 3) {
      const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).get();
      console.log(`    Sample: ${JSON.stringify(sample).substring(0, 100)}...`);
    }
  });
  
  console.log('\n=== Database Integrity Check ===');
  const integrityCheck = db.pragma('integrity_check');
  console.log(`Status: ${integrityCheck[0].integrity_check}`);
  
  console.log('\n=== WAL Mode Status ===');
  const journalMode = db.pragma('journal_mode');
  console.log(`Journal Mode: ${journalMode[0].journal_mode}`);
  
  // Get WAL checkpoint status
  const walStatus = db.pragma('wal_checkpoint(PASSIVE)');
  console.log(`WAL Checkpoint: Busy=${walStatus[0].busy}, Log=${walStatus[0].log}, Checkpointed=${walStatus[0].checkpointed}`);
  
  db.close();
  console.log('\n✅ Verification complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
