'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Upload, Database, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

export default function BackupTestPage() {
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [backupProgress, setBackupProgress] = useState('')
  const [restoreFile, setRestoreFile] = useState(null)
  const [status, setStatus] = useState('')

  const handleBackupDownload = async () => {
    setBackupLoading(true)
    setBackupProgress('Preparing backup...')
    setStatus('')
    
    try {
      const response = await fetch('/api/backup', {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create backup')
      }
      
      setBackupProgress('Downloading backup file...')
      
      // Get the blob and create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'sada_backup.zip'
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]*)"/)
        if (matches) filename = matches[1]
      }
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setStatus('✅ Backup downloaded successfully!')
      setBackupProgress('Backup completed!')
      
    } catch (error) {
      console.error('Backup error:', error)
      setStatus('❌ Failed to create backup: ' + error.message)
      setBackupProgress('')
    } finally {
      setBackupLoading(false)
      setTimeout(() => setBackupProgress(''), 3000)
    }
  }

  const handleRestoreUpload = async () => {
    if (!restoreFile) {
      setStatus('❌ Please select a backup file first')
      return
    }
    
    setRestoreLoading(true)
    setBackupProgress('Uploading and restoring backup...')
    setStatus('')
    
    try {
      const formData = new FormData()
      formData.append('backupFile', restoreFile)
      
      const response = await fetch('/api/restore', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to restore backup')
      }
      
      setStatus(`✅ Backup restored successfully! Restored ${result.restoredCollections} collections with ${result.restoredDocuments} documents.`)
      setBackupProgress('Restore completed!')
      setRestoreFile(null)
      
      // Reload the page after successful restore
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Restore error:', error)
      setStatus('❌ Failed to restore backup: ' + error.message)
      setBackupProgress('')
    } finally {
      setRestoreLoading(false)
      setTimeout(() => setBackupProgress(''), 3000)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/zip') {
      setRestoreFile(file)
      setStatus(`✅ Selected backup file: ${file.name}`)
    } else {
      setStatus('❌ Please select a valid ZIP backup file')
      setRestoreFile(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Backup System Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Backup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Download Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a complete backup of your system including all database collections, uploaded files, and system configuration.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Backup includes:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• All SQLite database collections and data</li>
                  <li>• Images and videos from upload directory</li>
                  <li>• System configuration files</li>
                  <li>• User profiles and settings</li>
                </ul>
              </div>

              {backupProgress && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    {backupLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm text-green-800 dark:text-green-200">{backupProgress}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleBackupDownload}
                disabled={backupLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {backupLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Restore Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Restore Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a backup file to restore your system data. This will replace all current data.
              </p>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-900 dark:text-red-100">Warning</h4>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Restoring data will permanently replace all existing data in the system. Make sure to create a backup before proceeding.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="backup-file" className="text-sm font-medium">
                    Select Backup File (.zip)
                  </label>
                  <input
                    id="backup-file"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {restoreFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {restoreFile.name} ({(restoreFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleRestoreUpload}
                  disabled={!restoreFile || restoreLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {restoreLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Restoring Data...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Backup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Display */}
        {status && (
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <span className="font-medium">Status:</span>
                <span>{status}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}