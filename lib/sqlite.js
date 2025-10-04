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
      notes TEXT,
      pass TEXT,
      contract TEXT DEFAULT 'Permanent',
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
      name TEXT,
      subject TEXT,
      experience TEXT,
      qualification TEXT,
      contact TEXT,
      email TEXT,
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
      title TEXT NOT NULL,
      description TEXT,
      color TEXT,
      type TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      scheduled_time TEXT,
      sent_at TEXT,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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
      return {
        ...parsedData,
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
              const conditions = Object.keys(filter).map(key => `${key} = ?`);
              query += ` WHERE ${conditions.join(' AND ')}`;
              params.push(...Object.values(filter));
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
            const conditions = Object.keys(filter).map(key => `${key} = ?`);
            query += ` WHERE ${conditions.join(' AND ')}`;
            params.push(...Object.values(filter));
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
          const conditions = Object.keys(filter).map(key => `${key} = ?`);
          query += ` WHERE ${conditions.join(' AND ')}`;
          params.push(...Object.values(filter));
        }
        
        const rows = db.prepare(query).all(...params);
        return this._parseRows(rows);
      }
    };
  }

  // Find one record
  findOne(filter) {
    const conditions = Object.keys(filter).map(key => `${key} = ?`);
    const query = `SELECT * FROM ${this.tableName} WHERE ${conditions.join(' AND ')} LIMIT 1`;
    const row = db.prepare(query).get(...Object.values(filter));
    return this._parseRow(row);
  }

  // Insert one record
  insertOne(data) {
    if (this.isFlexibleSchema) {
      // For flexible schema tables, store everything in data column
      const { id, created_at, updated_at, ...rest } = data;
      const query = `INSERT INTO ${this.tableName} (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)`;
      const result = db.prepare(query).run(
        id,
        JSON.stringify(rest),
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
      const { created_at, ...dataFields } = existing;
      const updated = { ...dataFields, ...updateData };
      const { id, updated_at, ...rest } = updated;
      
      const query = `UPDATE ${this.tableName} SET data = ?, updated_at = ? WHERE id = ?`;
      const result = db.prepare(query).run(
        JSON.stringify(rest),
        updated_at instanceof Date ? updated_at.toISOString() : updated_at,
        filter.id
      );
      
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
