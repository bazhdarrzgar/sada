import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';
import extractZip from 'extract-zip';

export async function POST(request) {
  try {
    console.log('Starting restore process...');
    
    const formData = await request.formData();
    const file = formData.get('backupFile');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      );
    }
    
    // Create temporary directory for extraction
    const tempDir = path.join(process.cwd(), 'temp_restore');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const zipPath = path.join(tempDir, 'backup.zip');
    fs.writeFileSync(zipPath, buffer);
    
    console.log('Backup file saved, extracting...');
    
    // Extract zip file
    const extractDir = path.join(tempDir, 'extracted');
    await extractZip(zipPath, { dir: extractDir });
    
    // Read database backup
    const dbBackupPath = path.join(extractDir, 'database_backup.json');
    if (!fs.existsSync(dbBackupPath)) {
      throw new Error('Invalid backup file: database_backup.json not found');
    }
    
    const backupData = JSON.parse(fs.readFileSync(dbBackupPath, 'utf8'));
    console.log('Database backup loaded:', backupData.metadata);
    
    // Connect to SQLite database (via mongodb compatibility layer)
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'sada_management');
    
    // Get current collections and drop them (WARNING: This will delete all existing data)
    const existingCollections = await db.listCollections().toArray();
    for (const collectionInfo of existingCollections) {
      console.log(`Dropping existing collection: ${collectionInfo.name}`);
      await db.collection(collectionInfo.name).drop();
    }
    
    // Restore collections
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      if (documents.length === 0) {
        console.log(`Skipping empty collection: ${collectionName}`);
        continue;
      }
      
      console.log(`Restoring collection: ${collectionName} (${documents.length} documents)`);
      
      // SQLite uses string IDs, no conversion needed
      const collection = db.collection(collectionName);
      await collection.insertMany(documents);
      console.log(`Collection ${collectionName} restored successfully`);
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
    
    // Cleanup temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError.message);
    }
    
    console.log('Restore completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database and files restored successfully',
      restoredCollections: Object.keys(backupData.collections).length,
      restoredDocuments: Object.values(backupData.collections)
        .reduce((total, docs) => total + docs.length, 0),
      metadata: backupData.metadata
    });
    
  } catch (error) {
    console.error('Restore error:', error);
    
    // Cleanup on error
    const tempDir = path.join(process.cwd(), 'temp_restore');
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError.message);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to restore backup', details: error.message },
      { status: 500 }
    );
  }
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