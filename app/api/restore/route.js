import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import Database from 'better-sqlite3';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  let tempDir = null;
  
  // Wrap everything in try-catch to ensure JSON response
  try {
    console.log('=== Restore API Called ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    // Verify it's a POST request
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed', details: 'Only POST requests are accepted' },
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('Starting restore process...');
    
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Failed to parse form data:', formError);
      return NextResponse.json(
        { error: 'Invalid form data', details: formError.message },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const file = formData.get('backupFile');
    
    if (!file) {
      console.error('No backup file in request');
      return NextResponse.json(
        { error: 'No backup file provided', details: 'backupFile field is missing from form data' },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('File received:', file.name, 'Size:', file.size);
    
    // Create temporary directory for extraction
    try {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-'));
      console.log('Temp directory created:', tempDir);
    } catch (tempError) {
      console.error('Failed to create temp directory:', tempError);
      throw new Error(`Cannot create temp directory: ${tempError.message}`);
    }
    
    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const zipPath = path.join(tempDir, 'backup.zip');
    fs.writeFileSync(zipPath, buffer);
    
    console.log('Backup file saved, extracting...');
    
    // Extract zip file
    const extractDir = path.join(tempDir, 'extracted');
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);
    
    // Read metadata
    const metadataPath = path.join(extractDir, 'backup_metadata.json');
    let metadata = null;
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log('Backup metadata loaded:', metadata.metadata);
    }
    
    // Restore SQLite database
    const backupDbPath = path.join(extractDir, 'database', 'sada.db');
    if (!fs.existsSync(backupDbPath)) {
      throw new Error('Invalid backup file: database/sada.db not found');
    }
    
    const targetDbPath = path.join(process.cwd(), 'database', 'sada.db');
    const dbDir = path.dirname(targetDbPath);
    
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    console.log('Restoring SQLite database...');
    
    // Backup current database before replacing (safety measure)
    if (fs.existsSync(targetDbPath)) {
      const backupOldDb = targetDbPath + '.backup_' + Date.now();
      fs.copyFileSync(targetDbPath, backupOldDb);
      console.log('Current database backed up to:', backupOldDb);
    }
    
    // Replace database file
    fs.copyFileSync(backupDbPath, targetDbPath);
    console.log('Database restored successfully');
    
    // Restore WAL and SHM files if they exist
    const backupWalPath = backupDbPath + '-wal';
    const backupShmPath = backupDbPath + '-shm';
    if (fs.existsSync(backupWalPath)) {
      fs.copyFileSync(backupWalPath, targetDbPath + '-wal');
      console.log('WAL file restored');
    }
    if (fs.existsSync(backupShmPath)) {
      fs.copyFileSync(backupShmPath, targetDbPath + '-shm');
      console.log('SHM file restored');
    }
    
    // Restore upload files
    const uploadsSourceDir = path.join(extractDir, 'uploads');
    const uploadsTargetDir = path.join(process.cwd(), 'public', 'upload');
    
    if (fs.existsSync(uploadsSourceDir)) {
      console.log('Restoring upload files...');
      
      // Remove existing upload directory
      if (fs.existsSync(uploadsTargetDir)) {
        fs.rmSync(uploadsTargetDir, { recursive: true, force: true });
      }
      
      // Copy uploads from backup
      await copyDirectory(uploadsSourceDir, uploadsTargetDir);
      console.log('Upload files restored successfully');
    }
    
    // Restore configuration files (optional - can be dangerous)
    const configSourceDir = path.join(extractDir, 'config');
    if (fs.existsSync(configSourceDir)) {
      console.log('Configuration files found in backup (not restoring for safety)');
      // We don't restore config files automatically as it could break the system
    }
    
    // Get database statistics from restored SQLite database
    let dbStats = {
      tables: 0,
      totalRecords: 0,
      tableInfo: []
    };
    
    try {
      const db = new Database(targetDbPath, { readonly: true });
      
      // Get list of tables
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();
      
      dbStats.tables = tables.length;
      
      // Count records in each table
      for (const table of tables) {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        dbStats.totalRecords += count.count;
        dbStats.tableInfo.push({
          tableName: table.name,
          recordCount: count.count
        });
      }
      
      db.close();
      console.log('Database statistics:', dbStats);
    } catch (dbError) {
      console.warn('Could not get database statistics:', dbError.message);
    }
    
    // Cleanup temp files
    if (tempDir) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Temp directory cleaned up:', tempDir);
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError.message);
      }
    }
    
    console.log('Restore completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'SQLite database and files restored successfully',
      databaseType: 'SQLite',
      restoredTables: dbStats.tables,
      totalRecords: dbStats.totalRecords,
      tableDetails: dbStats.tableInfo,
      metadata: metadata ? metadata.metadata : null
    });
    
  } catch (error) {
    console.error('=== RESTORE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    // Cleanup temp files on error
    if (tempDir) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Temp directory cleaned up after error');
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp directory:', cleanupError.message);
      }
    }
    
    // Ensure we always return JSON
    return NextResponse.json(
      { 
        error: 'Failed to restore backup', 
        details: error.message,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Ensure GET requests also return JSON (not HTML)
export async function GET(request) {
  return NextResponse.json(
    { 
      error: 'Method not allowed', 
      details: 'This endpoint only accepts POST requests with multipart/form-data',
      usage: 'POST /api/restore with backupFile in form data'
    },
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper function to copy directory recursively
async function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}