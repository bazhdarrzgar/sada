'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react'
import { exportToCSV, exportToExcel, exportToJSON } from '@/lib/exportUtils'

export function DownloadButton({ 
  data, 
  filename = 'data', 
  className = "",
  variant = "outline",
  size = "default"
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert('هیچ داتایەک بۆ دابەزاندن نییە')
      return
    }

    setIsLoading(true)
    
    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, filename)
          break
        case 'xlsx':
          await exportToExcel(data, filename)
          break
        case 'json':
          exportToJSON(data, filename)
          break
        default:
          console.error('Unsupported format:', format)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('خەطا لە دابەزاندنی فایل')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`flex items-center gap-2 ${className}`}
          disabled={isLoading || !data || data.length === 0}
        >
          <Download className="h-4 w-4" />
          {isLoading ? 'دابەزاندن...' : 'دابەزاندنی داتا'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          <span>CSV فایل</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('xlsx')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Excel فایل</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileCode className="h-4 w-4" />
          <span>JSON فایل</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}