import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

export async function GET() {
  try {
    console.log('Starting backup process...');
    
    // Connect to SQLite database (via mongodb compatibility layer)
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'sada_management');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));
    
    // Create backup data object
    const backupData = {
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        databaseType: 'SQLite',
        databaseName: process.env.DB_NAME || 'sada_management',
        totalCollections: collections.length
      },
      collections: {}
    };
    
    // Export all collections
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`Backing up collection: ${collectionName}`);
      
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      // SQLite already returns plain objects, no need to convert ObjectId
      backupData.collections[collectionName] = documents;
      console.log(`Collection ${collectionName}: ${documents.length} documents`);
    }
    
    // Create temporary directory for backup
    const tempDir = path.join(process.cwd(), 'temp_backup');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write database backup to JSON file
    const dbBackupPath = path.join(tempDir, 'database_backup.json');
    fs.writeFileSync(dbBackupPath, JSON.stringify(backupData, null, 2));
    console.log('Database backup written to:', dbBackupPath);
    
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
          fs.unlinkSync(dbBackupPath);
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
      
      // Add database backup file
      archive.file(dbBackupPath, { name: 'database_backup.json' });
      
      // Add upload directory if it exists
      const uploadDir = path.join(process.cwd(), 'public', 'upload');
      if (fs.existsSync(uploadDir)) {
        console.log('Adding upload directory to backup...');
        archive.directory(uploadDir, 'uploads');
      }
      
      // Add system configuration files
      const configFiles = [
        'package.json',
        'next.config.js',
        'tailwind.config.js',
        'postcss.config.js',
        'jsconfig.json'
      ];
      
      configFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          console.log(`Adding config file: ${file}`);
          archive.file(filePath, { name: `config/${file}` });
        }
      });
      
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