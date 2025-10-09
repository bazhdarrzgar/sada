const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'sada.db');
console.log('Database path:', dbPath);

try {
    const db = new Database(dbPath);
    
    // Check if payroll table exists
    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='payroll'
    `).all();
    
    console.log('Payroll table exists:', tables.length > 0);
    
    if (tables.length > 0) {
        // Get table schema
        const schema = db.prepare('PRAGMA table_info(payroll)').all();
        console.log('\nPayroll table schema:');
        console.log('Column Name | Type | Not Null | Default | Primary Key');
        console.log('-'.repeat(60));
        
        schema.forEach(col => {
            console.log(`${col.name.padEnd(12)} | ${col.type.padEnd(4)} | ${col.notnull.toString().padEnd(8)} | ${(col.dflt_value || 'NULL').toString().padEnd(7)} | ${col.pk}`);
        });
        
        // Check if there are any records
        const count = db.prepare('SELECT COUNT(*) as count FROM payroll').get();
        console.log(`\nTotal payroll records: ${count.count}`);
        
        // Show sample records if any exist
        if (count.count > 0) {
            const samples = db.prepare('SELECT * FROM payroll LIMIT 3').all();
            console.log('\nSample records:');
            samples.forEach((record, index) => {
                console.log(`\nRecord ${index + 1}:`);
                Object.entries(record).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            });
        }
    }
    
    db.close();
    console.log('\n✅ Database check completed successfully');
    
} catch (error) {
    console.error('❌ Database check failed:', error.message);
}