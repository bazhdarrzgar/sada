'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react'
import { exportToCSV, exportToExcel, exportToJSON } from '@/lib/exportUtils'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'

export function DownloadButton({ 
  data, 
  filename = 'data', 
  className = "",
  variant = "outline",
  size = "default",
  language: propLanguage // Accept language as prop
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { language: globalLanguage } = useLanguage()
  
  // Use prop language if provided, fallback to global language
  const currentLanguage = propLanguage || globalLanguage

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert(t('common.noDataToDownload', currentLanguage))
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
      alert(t('common.downloadError', currentLanguage))
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
          {isLoading ? t('common.downloading', currentLanguage) : t('common.downloadData', currentLanguage)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          <span>{t('common.csvFile', currentLanguage)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('xlsx')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>{t('common.excelFile', currentLanguage)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileCode className="h-4 w-4" />
          <span>{t('common.jsonFile', currentLanguage)}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}