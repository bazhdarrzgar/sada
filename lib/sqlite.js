import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'database', 'sada.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create or open database
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDatabase() {
  // Staff Records - تۆمارەکانی ستاف
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_records (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      mobile TEXT,
      address TEXT,
      gender TEXT,
      dateOfBirth TEXT,
      certificate TEXT,
      age INTEGER,
      education TEXT,
      attendance TEXT DEFAULT 'Present',
      date TEXT,
      department TEXT,
      bloodType TEXT,
      certificateImages TEXT,
      notes TEXT,
      pass TEXT,
      contract TEXT DEFAULT 'Permanent',
      cv TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Teachers - تۆماری مامۆستایان
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      fullName TEXT,
      birthYear TEXT,
      certificate TEXT,
      jobTitle TEXT,
      specialist TEXT,
      graduationDate TEXT,
      startDate TEXT,
      previousInstitution TEXT,
      bloodType TEXT,
      certificateImages TEXT,
      notes TEXT,
      cv TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Teacher Info - زانیاری مامۆستا
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_info (
      id TEXT PRIMARY KEY,
      politicalName TEXT,
      realName TEXT,
      department TEXT,
      subject TEXT,
      grade TEXT,
      phoneNumber TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Employee Leaves - مۆڵەتی مامۆستا (flexible schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS employee_leaves (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Officer Leaves - مۆڵەتی فەرمانبەر (flexible schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS officer_leaves (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Calendar - بەرێوبردنی ساڵنامە
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_entries (
      id TEXT PRIMARY KEY,
      month TEXT,
      week1 TEXT,
      week2 TEXT,
      week3 TEXT,
      week4 TEXT,
      year INTEGER,
      emailTasks TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Activities - چالاکی
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      activityType TEXT,
      preparationDate TEXT,
      content TEXT,
      startDate TEXT,
      whoDidIt TEXT,
      helper TEXT,
      activityImages TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Exam Supervision - چاودێریکردنی تاقیکردنەوە
  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_supervision (
      id TEXT PRIMARY KEY,
      subject TEXT,
      stage TEXT,
      endTime TEXT,
      examAchievement TEXT,
      supervisorName TEXT,
      obtainedScore TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Supervision - چاودێری (flexible schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS supervision (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Bus - پاس
  db.exec(`
    CREATE TABLE IF NOT EXISTS bus_records (
      id TEXT PRIMARY KEY,
      busNumber TEXT,
      busType TEXT,
      route TEXT,
      capacity TEXT,
      studentCount TEXT,
      teacherCount TEXT,
      driverName TEXT,
      driverPhone TEXT,
      driverLicense TEXT,
      driverPhoto TEXT,
      driverLicensePhoto TEXT,
      driverVideos TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Payroll - لیستی بڕی موچە
  db.exec(`
    CREATE TABLE IF NOT EXISTS payroll (
      id TEXT PRIMARY KEY,
      employeeName TEXT,
      salary REAL,
      absence REAL,
      deduction REAL,
      bonus REAL,
      total REAL,
      month TEXT,
      year TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Installments - قیستی ساڵانە
  db.exec(`
    CREATE TABLE IF NOT EXISTS installments (
      id TEXT PRIMARY KEY,
      fullName TEXT,
      grade TEXT,
      installmentType TEXT,
      annualAmount REAL,
      firstInstallment REAL,
      secondInstallment REAL,
      thirdInstallment REAL,
      fourthInstallment REAL,
      fifthInstallment REAL,
      sixthInstallment REAL,
      totalReceived REAL,
      remaining REAL,
      receiptImages TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Monthly Expenses - خەرجی مانگانە
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_expenses (
      id TEXT PRIMARY KEY,
      year TEXT,
      month TEXT,
      staffSalary REAL,
      expenses REAL,
      buildingRent REAL,
      dramaFee REAL,
      socialSupport REAL,
      electricity REAL,
      books REAL,
      clothes REAL,
      travel REAL,
      transportation REAL,
      total REAL,
      requirement TEXT,
      receiptImages TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Building Expenses - مەسروفاتی بینا
  db.exec(`
    CREATE TABLE IF NOT EXISTS building_expenses (
      id TEXT PRIMARY KEY,
      item TEXT,
      cost REAL,
      year TEXT,
      month INTEGER,
      date TEXT,
      notes TEXT,
      images TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Daily Accounts - حساباتی رۆژانە
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_accounts (
      id TEXT PRIMARY KEY,
      number INTEGER,
      week TEXT,
      purpose TEXT,
      checkNumber TEXT,
      amount REAL,
      date TEXT,
      dayOfWeek TEXT,
      receiptImages TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Kitchen Expenses - خەرجی خواردنگە
  db.exec(`
    CREATE TABLE IF NOT EXISTS kitchen_expenses (
      id TEXT PRIMARY KEY,
      item TEXT,
      cost REAL,
      date TEXT,
      month TEXT,
      year TEXT,
      purpose TEXT,
      receiptImages TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Student Permissions - مۆڵەت (flexible schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_permissions (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Supervised Students - قوتابی چاودێری کراو (flexible schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS supervised_students (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Additional tables for other features
  db.exec(`
    CREATE TABLE IF NOT EXISTS legend_entries (
      id TEXT PRIMARY KEY,
      abbreviation TEXT NOT NULL,
      full_description TEXT,
      category TEXT,
      usage_count INTEGER DEFAULT 1,
      last_used TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_settings (
      id TEXT PRIMARY KEY,
      host TEXT,
      port INTEGER,
      secure INTEGER,
      username TEXT,
      password TEXT,
      from_email TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_tasks (
      id TEXT PRIMARY KEY,
      calendarEntryId TEXT,
      to_email TEXT,
      subject TEXT,
      body TEXT,
      status TEXT DEFAULT 'Pending',
      scheduled_time TEXT,
      date TEXT,
      codes TEXT,
      description TEXT,
      monthContext TEXT,
      year INTEGER,
      weekContext TEXT,
      dayContext TEXT,
      sent_at TEXT,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT,
      fullName TEXT,
      displayName TEXT,
      email TEXT,
      bio TEXT,
      phone TEXT,
      location TEXT,
      institution TEXT,
      role TEXT DEFAULT 'user',
      joinDate TEXT,
      avatar TEXT,
      language TEXT DEFAULT 'kurdish',
      theme TEXT DEFAULT 'system',
      emailNotifications INTEGER DEFAULT 1,
      systemAlerts INTEGER DEFAULT 1,
      backupReminders INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      createdAt TEXT,
      updated_at TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      userId TEXT,
      username TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      timestamp TEXT NOT NULL,
      details TEXT
    )
  `);

  // Migration: Add month and year columns to payroll table if they don't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(payroll)").all();
    const columnNames = tableInfo.map(col => col.name);
    
    if (!columnNames.includes('month')) {
      db.exec('ALTER TABLE payroll ADD COLUMN month TEXT');
      console.log('✅ Added month column to payroll table');
    }
    
    if (!columnNames.includes('year')) {
      db.exec('ALTER TABLE payroll ADD COLUMN year TEXT');
      console.log('✅ Added year column to payroll table');
    }
  } catch (error) {
    console.error('Migration error for payroll table:', error);
  }

  // Migration: Add type column to email_settings table if it doesn't exist
  try {
    const emailSettingsInfo = db.prepare("PRAGMA table_info(email_settings)").all();
    const emailSettingsColumns = emailSettingsInfo.map(col => col.name);
    
    if (!emailSettingsColumns.includes('type')) {
      db.exec('ALTER TABLE email_settings ADD COLUMN type TEXT');
      console.log('✅ Added type column to email_settings table');
    }
  } catch (error) {
    console.error('Migration error for email_settings table:', error);
  }

  console.log('✅ SQLite database initialized successfully');
}

// Initialize database on module load
initDatabase();

// Helper class to wrap SQLite operations similar to MongoDB API
class SQLiteWrapper {
  constructor(tableName) {
    this.tableName = tableName;
    // Check if this table uses flexible schema (data column)
    this.isFlexibleSchema = this._hasDataColumn();
  }

  _hasDataColumn() {
    const flexibleTables = ['employee_leaves', 'officer_leaves', 'supervision', 'student_permissions', 'supervised_students'];
    return flexibleTables.includes(this.tableName);
  }

  _parseRow(row) {
    if (!row) return null;
    if (this.isFlexibleSchema && row.data) {
      const parsedData = JSON.parse(row.data);
      // CRITICAL: Always use ID from database row, not from parsed data
      // Remove id from parsedData if it exists to avoid conflicts
      const { id: _, ...dataWithoutId } = parsedData;
      return {
        id: row.id,  // Always use the database row ID (the source of truth)
        ...dataWithoutId,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    }
    
    // Parse JSON strings for arrays and objects in regular tables
    const parsedRow = { ...row };
    for (const key in parsedRow) {
      const value = parsedRow[key];
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          parsedRow[key] = JSON.parse(value);
        } catch (e) {
          // If parsing fails, keep the original string
        }
      }
    }
    return parsedRow;
  }

  _parseRows(rows) {
    return rows.map(row => this._parseRow(row));
  }

  // Helper method to build WHERE conditions from MongoDB-style filters
  _buildWhereClause(filter) {
    const conditions = [];
    const params = [];
    
    for (const [key, value] of Object.entries(filter)) {
      // Handle $or operator
      if (key === '$or' && Array.isArray(value)) {
        const orConditions = [];
        for (const orFilter of value) {
          const { conditions: subConditions, params: subParams } = this._buildWhereClause(orFilter);
          if (subConditions.length > 0) {
            orConditions.push(`(${subConditions.join(' AND ')})`);
            params.push(...subParams);
          }
        }
        if (orConditions.length > 0) {
          conditions.push(`(${orConditions.join(' OR ')})`);
        }
        continue;
      }
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Handle MongoDB-style operators
        for (const [operator, operatorValue] of Object.entries(value)) {
          switch (operator) {
            case '$gte':
              conditions.push(`${key} >= ?`);
              params.push(operatorValue instanceof Date ? operatorValue.toISOString() : operatorValue);
              break;
            case '$lte':
              conditions.push(`${key} <= ?`);
              params.push(operatorValue instanceof Date ? operatorValue.toISOString() : operatorValue);
              break;
            case '$gt':
              conditions.push(`${key} > ?`);
              params.push(operatorValue instanceof Date ? operatorValue.toISOString() : operatorValue);
              break;
            case '$lt':
              conditions.push(`${key} < ?`);
              params.push(operatorValue instanceof Date ? operatorValue.toISOString() : operatorValue);
              break;
            case '$ne':
              conditions.push(`${key} != ?`);
              params.push(operatorValue);
              break;
            case '$in':
              if (Array.isArray(operatorValue)) {
                const placeholders = operatorValue.map(() => '?').join(', ');
                conditions.push(`${key} IN (${placeholders})`);
                params.push(...operatorValue);
              }
              break;
            case '$exists':
              // In SQLite, check if column is NULL or NOT NULL
              if (operatorValue === false) {
                conditions.push(`${key} IS NULL`);
              } else {
                conditions.push(`${key} IS NOT NULL`);
              }
              break;
            case '$regex':
              // Handle regex search - use LIKE for case-insensitive search
              const regexValue = operatorValue.toString().replace(/^\/|\/$/g, '');
              conditions.push(`${key} LIKE ?`);
              params.push(`%${regexValue}%`);
              break;
            default:
              // Unknown operator, treat as equality
              conditions.push(`${key} = ?`);
              params.push(operatorValue);
          }
        }
      } else if (value === null) {
        // Handle NULL values
        conditions.push(`${key} IS NULL`);
      } else {
        // Simple equality
        conditions.push(`${key} = ?`);
        params.push(value instanceof Date ? value.toISOString() : value);
      }
    }
    
    return { conditions, params };
  }

  // Find all records with optional filter
  find(filter = {}) {
    return {
      sort: (sortOptions) => ({
        limit: (limitValue) => ({
          toArray: () => {
            let query = `SELECT * FROM ${this.tableName}`;
            const params = [];
            
            // Add WHERE clause if filter exists
            if (Object.keys(filter).length > 0) {
              const { conditions, params: filterParams } = this._buildWhereClause(filter);
              query += ` WHERE ${conditions.join(' AND ')}`;
              params.push(...filterParams);
            }
            
            // Add ORDER BY
            if (sortOptions && Object.keys(sortOptions).length > 0) {
              const orderClauses = Object.entries(sortOptions).map(([key, value]) => 
                `${key} ${value === -1 ? 'DESC' : 'ASC'}`
              );
              query += ` ORDER BY ${orderClauses.join(', ')}`;
            }
            
            // Add LIMIT
            if (limitValue) {
              query += ` LIMIT ?`;
              params.push(limitValue);
            }
            
            const rows = db.prepare(query).all(...params);
            return this._parseRows(rows);
          }
        }),
        toArray: () => {
          let query = `SELECT * FROM ${this.tableName}`;
          const params = [];
          
          if (Object.keys(filter).length > 0) {
            const { conditions, params: filterParams } = this._buildWhereClause(filter);
            query += ` WHERE ${conditions.join(' AND ')}`;
            params.push(...filterParams);
          }
          
          if (sortOptions && Object.keys(sortOptions).length > 0) {
            const orderClauses = Object.entries(sortOptions).map(([key, value]) => 
              `${key} ${value === -1 ? 'DESC' : 'ASC'}`
            );
            query += ` ORDER BY ${orderClauses.join(', ')}`;
          }
          
          const rows = db.prepare(query).all(...params);
          return this._parseRows(rows);
        }
      }),
      toArray: () => {
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];
        
        if (Object.keys(filter).length > 0) {
          const { conditions, params: filterParams } = this._buildWhereClause(filter);
          query += ` WHERE ${conditions.join(' AND ')}`;
          params.push(...filterParams);
        }
        
        const rows = db.prepare(query).all(...params);
        return this._parseRows(rows);
      }
    };
  }

  // Find one record
  findOne(filter) {
    let query = `SELECT * FROM ${this.tableName}`;
    
    if (Object.keys(filter).length > 0) {
      const { conditions, params } = this._buildWhereClause(filter);
      query += ` WHERE ${conditions.join(' AND ')} LIMIT 1`;
      const row = db.prepare(query).get(...params);
      return this._parseRow(row);
    }
    
    query += ` LIMIT 1`;
    const row = db.prepare(query).get();
    return this._parseRow(row);
  }

  // Insert one record
  insertOne(data) {
    if (this.isFlexibleSchema) {
      // For flexible schema tables, store everything in data column EXCEPT id, created_at, updated_at
      // CRITICAL: Never store id in the data column - it's stored separately
      const { id, created_at, updated_at, ...rest } = data;
      console.log('SQLite insertOne - storing ID in separate column:', id);
      console.log('SQLite insertOne - data column:', JSON.stringify(rest));
      const query = `INSERT INTO ${this.tableName} (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)`;
      const result = db.prepare(query).run(
        id,
        JSON.stringify(rest),  // Data column does NOT include id
        created_at instanceof Date ? created_at.toISOString() : created_at,
        updated_at instanceof Date ? updated_at.toISOString() : updated_at
      );
      return {
        insertedId: id,
        acknowledged: true
      };
    }
    
    const keys = Object.keys(data);
    // Convert Date objects and arrays to strings
    const values = Object.values(data).map(val => {
      if (val instanceof Date) return val.toISOString();
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return val;
    });
    const placeholders = keys.map(() => '?').join(', ');
    const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    const result = db.prepare(query).run(...values);
    return {
      insertedId: data.id,
      acknowledged: true
    };
  }

  // Update one record
  updateOne(filter, update, options = {}) {
    const updateData = update.$set || update;
    
    // Check if record exists
    const existing = this.findOne(filter);
    
    // Handle upsert option
    if (!existing && options.upsert) {
      // Insert new record with filter fields + update data
      const insertData = { ...filter, ...updateData };
      // Ensure timestamps exist
      if (!insertData.created_at) {
        insertData.created_at = new Date().toISOString();
      }
      if (!insertData.updated_at) {
        insertData.updated_at = new Date().toISOString();
      }
      return this.insertOne(insertData);
    }
    
    if (!existing) {
      return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
    }
    
    if (this.isFlexibleSchema) {
      // For flexible schema, need to read, modify, and write back
      // CRITICAL: Never include id, created_at, updated_at in the data column
      const { id, created_at, updated_at, ...existingData } = existing;
      console.log('SQLite updateOne - existing ID:', id);
      console.log('SQLite updateOne - update data:', updateData);
      
      // Merge existing data with updates, excluding system fields
      const { id: updateId, created_at: updateCreatedAt, updated_at: updateUpdatedAt, ...updateDataOnly } = updateData;
      const mergedData = { ...existingData, ...updateDataOnly };
      
      console.log('SQLite updateOne - merged data (without id):', mergedData);
      
      const query = `UPDATE ${this.tableName} SET data = ?, updated_at = ? WHERE id = ?`;
      const result = db.prepare(query).run(
        JSON.stringify(mergedData),  // Data column does NOT include id
        updateData.updated_at instanceof Date ? updateData.updated_at.toISOString() : (updateData.updated_at || new Date().toISOString()),
        filter.id  // ID is always in separate column
      );
      
      console.log('SQLite updateOne - updated rows:', result.changes);
      
      return {
        matchedCount: result.changes,
        modifiedCount: result.changes,
        acknowledged: true
      };
    }
    
    const setClauses = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const filterConditions = Object.keys(filter).map(key => `${key} = ?`).join(' AND ');
    
    // Convert Date objects and arrays to strings
    const updateValues = Object.values(updateData).map(val => {
      if (val instanceof Date) return val.toISOString();
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === 'object' && val !== null) return JSON.stringify(val);
      return val;
    });
    
    const query = `UPDATE ${this.tableName} SET ${setClauses} WHERE ${filterConditions}`;
    const params = [...updateValues, ...Object.values(filter)];
    
    const result = db.prepare(query).run(...params);
    return {
      matchedCount: result.changes,
      modifiedCount: result.changes,
      acknowledged: true
    };
  }

  // Find one and update record (MongoDB-compatible method)
  findOneAndUpdate(filter, update, options = {}) {
    const updateData = update.$set || update;
    
    // Check if record exists
    const existing = this.findOne(filter);
    
    // Handle upsert option
    if (!existing && options.upsert) {
      const insertData = { ...filter, ...updateData };
      if (!insertData.created_at) {
        insertData.created_at = new Date().toISOString();
      }
      if (!insertData.updated_at) {
        insertData.updated_at = new Date().toISOString();
      }
      this.insertOne(insertData);
      const newRecord = this.findOne(filter);
      return {
        value: newRecord,
        ok: 1
      };
    }
    
    if (!existing) {
      return { value: null, ok: 0 };
    }
    
    // Perform the update
    this.updateOne(filter, { $set: updateData });
    
    // Return the updated document based on returnDocument option
    const returnAfter = options.returnDocument === 'after' || options.returnOriginal === false;
    if (returnAfter) {
      const updated = this.findOne(filter);
      return {
        value: updated,
        ok: 1
      };
    } else {
      return {
        value: existing,
        ok: 1
      };
    }
  }

  // Delete one record
  deleteOne(filter) {
    const conditions = Object.keys(filter).map(key => `${key} = ?`).join(' AND ');
    const query = `DELETE FROM ${this.tableName} WHERE ${conditions}`;
    
    const result = db.prepare(query).run(...Object.values(filter));
    return {
      deletedCount: result.changes
    };
  }

  // Delete many records
  deleteMany(filter) {
    if (Object.keys(filter).length === 0) {
      const result = db.prepare(`DELETE FROM ${this.tableName}`).run();
      return {
        deletedCount: result.changes
      };
    }
    
    const conditions = Object.keys(filter).map(key => `${key} = ?`).join(' AND ');
    const query = `DELETE FROM ${this.tableName} WHERE ${conditions}`;
    
    const result = db.prepare(query).run(...Object.values(filter));
    return {
      deletedCount: result.changes
    };
  }

  // Count documents
  countDocuments(filter = {}) {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];
    
    if (Object.keys(filter).length > 0) {
      const conditions = Object.keys(filter).map(key => `${key} = ?`);
      query += ` WHERE ${conditions.join(' AND ')}`;
      params.push(...Object.values(filter));
    }
    
    const result = db.prepare(query).get(...params);
    return result.count;
  }

  // Drop collection (delete all data)
  drop() {
    db.prepare(`DELETE FROM ${this.tableName}`).run();
    return true;
  }

  // Insert many records
  insertMany(documents) {
    const insertedIds = [];
    for (const doc of documents) {
      const result = this.insertOne(doc);
      insertedIds.push(result.insertedId);
    }
    return {
      insertedIds,
      insertedCount: insertedIds.length,
      acknowledged: true
    };
  }
}

// Create a client-like interface similar to MongoDB
const sqliteClient = {
  db: (dbName) => ({
    collection: (collectionName) => new SQLiteWrapper(collectionName),
    // List all collections
    listCollections: () => {
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();
      return {
        toArray: () => tables
      };
    }
  })
};

// Export promise-like interface for compatibility
const clientPromise = Promise.resolve(sqliteClient);

export default clientPromise;
export { db };
