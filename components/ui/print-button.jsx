'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Printer } from 'lucide-react'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'

export function PrintButton({
  data,
  filename = 'table-data',
  title = 'Table Data',
  titleKu = '',
  columns = [],
  className = "",
  variant = "outline",
  size = "default",
  language: propLanguage, // Accept language as prop
  showTotal = false, // New prop to enable total row
  totalColumn = 'total', // Column key to calculate total for (default: 'total')
  totalLabel = '', // Custom label for the total row
  summaryItems = [], // New prop for multiple summary items
  selectedMonth = null, // Month to display in print header
  selectedYear = null // Year to display in print header
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showOrientationDialog, setShowOrientationDialog] = useState(false)
  const { language: globalLanguage } = useLanguage()

  // Use prop language if provided, fallback to global language
  const currentLanguage = propLanguage || globalLanguage

  // Month name mappings
  const getMonthName = (monthNumber) => {
    const monthMappings = {
      english: {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December'
      },
      kurdish: {
        1: 'رێبەندان (January)',
        2: 'رەشەمێ (February)',
        3: 'نەورۆز / خاکەلێوە (March)',
        4: 'بانەمەڕ (April)',
        5: 'جۆزەردان (May)',
        6: 'پووشپەڕ (June)',
        7: 'خەرمانان (July)',
        8: 'گەلاوێژ (August)',
        9: 'رەزبەر (September)',
        10: 'گەڵاڕێزان / خەزەڵوەر (October)',
        11: 'سەرماوەز (November)',
        12: 'بەفرانبار (December)'
      }
    }
    return {
      english: monthMappings.english[monthNumber] || `Month ${monthNumber}`,
      kurdish: monthMappings.kurdish[monthNumber] || `مانگ ${monthNumber}`
    }
  }

  const generatePrintablePage = (orientation = 'portrait') => {
    if (!data || data.length === 0) {
      alert(t('common.noDataToPrint', currentLanguage))
      return
    }

    setIsLoading(true)
    setShowOrientationDialog(false)

    try {
      // Prepare table data
      let tableColumns, tableRows, summaryData = []

      if (columns.length > 0) {
        // Use provided columns configuration
        tableColumns = columns.map(col => col.header || col.key)
        tableRows = data.map(row => columns.map(col => {
          const value = row[col.key]
          if (col.render && typeof col.render === 'function') {
            const rendered = col.render(value, row)
            // Convert numbers to string to handle formatting
            return typeof rendered === 'number' ? rendered.toLocaleString() : (rendered || '')
          }
          return value || ''
        }))

        // Calculate summary items if provided
        if (summaryItems && summaryItems.length > 0) {
          summaryData = summaryItems.map(item => {
            const totalSum = data.reduce((acc, row) => {
              const value = parseFloat(row[item.key]) || 0
              return acc + value
            }, 0)

            const col = columns.find(c => c.key === item.key)
            let displaySum = totalSum.toLocaleString()
            if (col && col.render && typeof col.render === 'function') {
              displaySum = col.render(totalSum)
            }

            return {
              label: item.label,
              value: displaySum
            }
          })
        } else if (showTotal && data.length > 0) {
          // Fallback to existing showTotal logic
          const targetColumnIndex = columns.findIndex(col => col.key === totalColumn)

          if (targetColumnIndex !== -1) {
            const totalSum = data.reduce((acc, row) => {
              const value = parseFloat(row[totalColumn]) || 0
              return acc + value
            }, 0)

            const targetColumn = columns[targetColumnIndex]
            let displaySum = totalSum.toLocaleString()

            if (targetColumn.render && typeof targetColumn.render === 'function') {
              displaySum = targetColumn.render(totalSum)
            }

            summaryData = [{
              label: totalLabel || targetColumn.header,
              value: displaySum
            }]
          }
        }
      } else {
        // Auto-detect columns from data
        if (data.length > 0) {
          const keys = Object.keys(data[0])
          tableColumns = keys.map(key => key.charAt(0).toUpperCase() + key.slice(1))
          tableRows = data.map(row => keys.map(key => row[key] || ''))
        } else {
          tableColumns = []
          tableRows = []
        }
      }

      // Create HTML content for printing
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Generate month/year display text
      let periodText = ''
      if (selectedMonth && selectedYear) {
        const monthNames = getMonthName(parseInt(selectedMonth))
        periodText = `
          <div class="period-info">
            <div class="period-ku">${monthNames.kurdish} - ${selectedYear}</div>
            <div class="period-en">${monthNames.english} ${selectedYear}</div>
          </div>
        `
      } else if (selectedYear) {
        periodText = `<div class="period-info"><div class="period-en">Year: ${selectedYear}</div></div>`
      } else if (selectedMonth) {
        const monthNames = getMonthName(parseInt(selectedMonth))
        periodText = `
          <div class="period-info">
            <div class="period-ku">${monthNames.kurdish}</div>
            <div class="period-en">${monthNames.english}</div>
          </div>
        `
      }

      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ku">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${filename}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', 'Tahoma', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              padding: 20px;
              direction: rtl;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
            }
            
            .title-ku {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .title-en {
              font-size: 16px;
              font-weight: bold;
              color: #4b5563;
              margin-bottom: 10px;
            }
            
            .date {
              font-size: 11px;
              color: #6b7280;
            }
            
            .period-info {
              margin: 10px 0;
              padding: 10px;
              background-color: #f0f9ff;
              border-radius: 6px;
              border: 1px solid #2563eb;
            }
            
            .period-ku {
              font-size: 15px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 3px;
            }
            
            .period-en {
              font-size: 13px;
              font-weight: 600;
              color: #4b5563;
            }
            
            .table-container {
              width: 100%;
              overflow-x: auto;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 10px;
            }
            
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 6px;
              text-align: center;
              vertical-align: middle;
            }
            
            th {
              background-color: #2563eb;
              color: white;
              font-weight: bold;
              font-size: 12px;
            }
            
            .row-number {
              background-color: #1e40af;
              color: white;
              font-weight: bold;
              width: 50px;
              min-width: 50px;
            }
            
            .row-number-cell {
              font-weight: bold;
              color: #1e40af;
              background-color: #e0f2fe;
            }
            
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            
            tr:nth-child(odd) {
              background-color: #ffffff;
            }
            
            tr:nth-child(even) .row-number-cell {
              background-color: #dbeafe;
            }
            
            tr:nth-child(odd) .row-number-cell {
              background-color: #e0f2fe;
            }
            
            .summary-container {
              margin-top: 20px;
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              justify-content: center;
            }
            
            .total-summary {
              flex: 1;
              min-width: 180px;
              padding: 15px;
              background-color: #dbeafe;
              border: 2px solid #2563eb;
              border-radius: 8px;
              text-align: center;
            }
            
            .total-summary-label {
              font-size: 14px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .total-summary-value {
              font-size: 16px;
              font-weight: bold;
              color: #1e3a8a;
              font-family: 'Arial', monospace;
              direction: ltr;
            }
            
            .number {
              font-family: 'Arial', monospace;
              text-align: right;
              direction: ltr;
            }
            
            @media print {
              @page {
                size: ${orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
                margin: 15mm;
              }
              
              body {
                padding: 10px;
              }
              
              .print-header {
                margin-bottom: 20px;
              }
              
              table {
                font-size: 10px;
              }
              
              th, td {
                padding: 6px 4px;
              }
              
              .no-print {
                display: none;
              }
              
              .summary-container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            ${titleKu ? `<div class="title-ku">${titleKu}</div>` : ''}
            <div class="title-en">${title}</div>
            ${periodText}
            <div class="date">Generated on: ${currentDate}</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th class="row-number">#</th>
                  ${tableColumns.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${tableRows.map((row, rowIndex) =>
        `<tr>
                    <td class="row-number-cell">${rowIndex + 1}</td>
                    ${row.map((cell, index) => {
          // Check if this is a number column by looking at the cell content
          const isNumber = !isNaN(parseFloat(cell.toString().replace(/,/g, ''))) && cell.toString().match(/[\d,]+/);
          return `<td class="${isNumber ? 'number' : ''}">${cell}</td>`
        }).join('')}
                  </tr>`
      ).join('')}
              </tbody>
            </table>
          </div>
          
          ${summaryData.length > 0 ? `
            <div class="summary-container">
              ${summaryData.map(item => `
                <div class="total-summary">
                  <div class="total-summary-label">${item.label}</div>
                  <div class="total-summary-value">${item.value}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
        </html>
      `

      // Open print window
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()

        // Wait for content to load then trigger print
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print()
            // Close the window after printing
            printWindow.addEventListener('afterprint', () => {
              printWindow.close()
            })
          }, 500)
        })
      } else {
        alert(t('common.popupBlockerWarning', currentLanguage))
      }

    } catch (error) {
      console.error('Print generation error:', error)
      alert(t('common.printError', currentLanguage))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintClick = () => {
    if (!data || data.length === 0) {
      alert(t('common.noDataToPrint', currentLanguage))
      return
    }
    setShowOrientationDialog(true)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
        disabled={isLoading || !data || data.length === 0}
        onClick={handlePrintClick}
      >
        <Printer className="h-4 w-4" />
        {isLoading ? t('common.printing', currentLanguage) : t('common.print', currentLanguage)}
      </Button>

      <Dialog open={showOrientationDialog} onOpenChange={setShowOrientationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              {currentLanguage === 'kurdish' ? 'هەڵبژاردنی ئاراستەی چاپکردن' : 'Select Print Orientation'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 p-4">
            <Button
              onClick={() => generatePrintablePage('portrait')}
              className="w-full h-20 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              <div className="flex flex-col items-center gap-1">
                <span>{currentLanguage === 'kurdish' ? 'درێژی' : 'Portrait'}</span>
                <span className="text-sm font-normal opacity-90">
                  {currentLanguage === 'kurdish' ? '(ستوونی)' : '(Vertical)'}
                </span>
              </div>
            </Button>

            <Button
              onClick={() => generatePrintablePage('landscape')}
              className="w-full h-20 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              <div className="flex flex-col items-center gap-1">
                <span>{currentLanguage === 'kurdish' ? 'پانی' : 'Landscape'}</span>
                <span className="text-sm font-normal opacity-90">
                  {currentLanguage === 'kurdish' ? '(ئاسۆیی)' : '(Horizontal)'}
                </span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}