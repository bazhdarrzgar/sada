import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database', 'sada.db');
const db = new Database(dbPath);

try {
  // Check if columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(staff_records)").all();
  const columnNames = tableInfo.map(col => col.name);
  
  console.log('Current columns:', columnNames);
  
  // Add certificateImages column if it doesn't exist
  if (!columnNames.includes('certificateImages')) {
    db.exec('ALTER TABLE staff_records ADD COLUMN certificateImages TEXT');
    console.log('✅ Added certificateImages column to staff_records');
  } else {
    console.log('ℹ️ certificateImages column already exists');
  }
  
  // Add cv column if it doesn't exist
  if (!columnNames.includes('cv')) {
    db.exec('ALTER TABLE staff_records ADD COLUMN cv TEXT');
    console.log('✅ Added cv column to staff_records');
  } else {
    console.log('ℹ️ cv column already exists');
  }
  
  console.log('✅ Migration completed successfully');
} catch (error) {
  console.error('Error during migration:', error);
  process.exit(1);
} finally {
  db.close();
}
