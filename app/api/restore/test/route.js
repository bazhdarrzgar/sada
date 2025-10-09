import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify restore API is accessible
 * Access via: GET /api/restore/test
 */
export async function GET(request) {
  try {
    const diagnostics = {
      status: 'OK',
      message: 'Restore API endpoint is accessible',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
        env: process.env.NODE_ENV
      },
      paths: {
        databaseDir: require('path').join(process.cwd(), 'database'),
        publicDir: require('path').join(process.cwd(), 'public'),
        uploadDir: require('path').join(process.cwd(), 'public', 'upload'),
        tmpDir: require('os').tmpdir()
      }
    };

    // Check if directories exist
    const fs = require('fs');
    const path = require('path');
    
    diagnostics.checks = {
      databaseDirExists: fs.existsSync(path.join(process.cwd(), 'database')),
      publicDirExists: fs.existsSync(path.join(process.cwd(), 'public')),
      uploadDirExists: fs.existsSync(path.join(process.cwd(), 'public', 'upload')),
      sqliteDatabaseExists: fs.existsSync(path.join(process.cwd(), 'database', 'sada.db'))
    };

    // Check module availability
    try {
      require('adm-zip');
      diagnostics.checks.admZipAvailable = true;
    } catch (e) {
      diagnostics.checks.admZipAvailable = false;
      diagnostics.checks.admZipError = e.message;
    }

    try {
      require('better-sqlite3');
      diagnostics.checks.sqliteAvailable = true;
    } catch (e) {
      diagnostics.checks.sqliteAvailable = false;
      diagnostics.checks.sqliteError = e.message;
    }

    return NextResponse.json(diagnostics, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Diagnostics failed',
      error: error.message,
      stack: error.stack
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request) {
  return NextResponse.json({
    status: 'OK',
    message: 'POST request received at test endpoint',
    note: 'Use /api/restore for actual restore operations'
  }, {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
