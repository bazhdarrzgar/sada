import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';

export async function GET() {
  try {
    console.log('Starting backup process...');
    
    // Path to SQLite database
    const dbPath = path.join(process.cwd(), 'database', 'sada.db');
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { error: 'Database file not found' },
        { status: 404 }
      );
    }
    
    console.log('Database file found at:', dbPath);
    
    // Create backup metadata
    const backupData = {
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        databaseType: 'SQLite',
        databaseFile: 'sada.db',
        backupSize: fs.statSync(dbPath).size
      }
    };
    
    // Create temporary directory for backup
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'backup-'));
    console.log('Temp directory created:', tempDir);
    
    // Write metadata file
    const metadataPath = path.join(tempDir, 'backup_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(backupData, null, 2));
    console.log('Metadata written to:', metadataPath);
    
    // Create zip archive
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `sada_backup_${timestamp}.zip`;
    const zipPath = path.join(tempDir, zipFileName);
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Backup created: ${archive.pointer()} total bytes`);
        
        // Read the zip file and send as response
        const zipBuffer = fs.readFileSync(zipPath);
        
        // Cleanup temp files
        try {
          fs.unlinkSync(metadataPath);
          fs.unlinkSync(zipPath);
          fs.rmdirSync(tempDir);
        } catch (cleanupError) {
          console.warn('Cleanup warning:', cleanupError.message);
        }
        
        resolve(new NextResponse(zipBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${zipFileName}"`,
            'Content-Length': zipBuffer.length.toString(),
          },
        }));
      });
      
      output.on('error', (err) => {
        console.error('Output stream error:', err);
        reject(new NextResponse(JSON.stringify({ error: 'Failed to create backup' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }));
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        reject(new NextResponse(JSON.stringify({ error: 'Failed to create backup archive' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }));
      });
      
      archive.pipe(output);
      
      // Add metadata file
      archive.file(metadataPath, { name: 'backup_metadata.json' });
      
      // Add SQLite database file
      console.log('Adding SQLite database to backup...');
      archive.file(dbPath, { name: 'database/sada.db' });
      
      // Add WAL and SHM files if they exist
      const walPath = dbPath + '-wal';
      const shmPath = dbPath + '-shm';
      if (fs.existsSync(walPath)) {
        console.log('Adding WAL file to backup...');
        archive.file(walPath, { name: 'database/sada.db-wal' });
      }
      if (fs.existsSync(shmPath)) {
        console.log('Adding SHM file to backup...');
        archive.file(shmPath, { name: 'database/sada.db-shm' });
      }
      
      // Add upload directory if it exists
      const uploadDir = path.join(process.cwd(), 'public', 'upload');
      if (fs.existsSync(uploadDir)) {
        console.log('Adding upload directory to backup...');
        archive.directory(uploadDir, 'uploads');
      }
      
      archive.finalize();
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup', details: error.message },
      { status: 500 }
    );
  }
}