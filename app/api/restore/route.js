import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';

export async function POST(request) {
  let tempDir = null;
  
  try {
    console.log('Starting restore process...');
    
    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('backup');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      );
    }
    
    console.log('Backup file received:', file.name, 'Size:', file.size);
    
    // Create temporary directory for extraction
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'restore-'));
    console.log('Temp directory created:', tempDir);
    
    // Save uploaded file to temp directory
    const uploadedFilePath = path.join(tempDir, 'backup.zip');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(uploadedFilePath, buffer);
    console.log('Backup file saved to:', uploadedFilePath);
    
    // Extract zip file
    const zip = new AdmZip(uploadedFilePath);
    const extractPath = path.join(tempDir, 'extracted');
    fs.mkdirSync(extractPath, { recursive: true });
    zip.extractAllTo(extractPath, true);
    console.log('Backup extracted to:', extractPath);
    
    // Check for metadata file
    const metadataPath = path.join(extractPath, 'backup_metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log('Backup metadata:', metadata);
    }
    
    // Path to restore database
    const dbPath = path.join(process.cwd(), 'database', 'sada.db');
    const dbDir = path.dirname(dbPath);
    
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Backup existing database before restore (safety measure)
    if (fs.existsSync(dbPath)) {
      const backupDbPath = path.join(dbDir, `sada_pre_restore_${Date.now()}.db`);
      fs.copyFileSync(dbPath, backupDbPath);
      console.log('Existing database backed up to:', backupDbPath);
    }
    
    // Restore database file
    const extractedDbPath = path.join(extractPath, 'database', 'sada.db');
    if (!fs.existsSync(extractedDbPath)) {
      throw new Error('Database file not found in backup');
    }
    
    // Remove existing database files
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
    
    // Copy database file
    fs.copyFileSync(extractedDbPath, dbPath);
    console.log('Database restored to:', dbPath);
    
    // Restore WAL and SHM files if they exist
    const extractedWalPath = path.join(extractPath, 'database', 'sada.db-wal');
    const extractedShmPath = path.join(extractPath, 'database', 'sada.db-shm');
    
    if (fs.existsSync(extractedWalPath)) {
      fs.copyFileSync(extractedWalPath, walPath);
      console.log('WAL file restored');
    }
    if (fs.existsSync(extractedShmPath)) {
      fs.copyFileSync(extractedShmPath, shmPath);
      console.log('SHM file restored');
    }
    
    // Restore upload directory (images and videos)
    const uploadDir = path.join(process.cwd(), 'public', 'upload');
    const extractedUploadDir = path.join(extractPath, 'uploads');
    
    if (fs.existsSync(extractedUploadDir)) {
      // Remove existing upload directory
      if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
        console.log('Existing upload directory removed');
      }
      
      // Create upload directory
      fs.mkdirSync(uploadDir, { recursive: true });
      
      // Copy all files from extracted upload directory
      const copyRecursive = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      
      copyRecursive(extractedUploadDir, uploadDir);
      console.log('Upload directory restored to:', uploadDir);
    } else {
      console.log('No upload directory found in backup');
    }
    
    // Cleanup temp directory
    if (tempDir) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('Temp directory cleaned up');
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError.message);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database and files restored successfully',
      restoredAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Restore error:', error);
    
    // Cleanup temp directory on error
    if (tempDir) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError.message);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to restore backup', details: error.message },
      { status: 500 }
    );
  }
}
