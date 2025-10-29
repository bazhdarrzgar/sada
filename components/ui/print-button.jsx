'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
  language: propLanguage // Accept language as prop
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { language: globalLanguage } = useLanguage()
  
  // Use prop language if provided, fallback to global language
  const currentLanguage = propLanguage || globalLanguage

  const generatePrintablePage = () => {
    if (!data || data.length === 0) {
      alert(t('common.noDataToPrint', currentLanguage))
      return
    }

    setIsLoading(true)
    
    try {
      // Prepare table data
      let tableColumns, tableRows
      
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
            
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            
            tr:nth-child(odd) {
              background-color: #ffffff;
            }
            
            .number {
              font-family: 'Arial', monospace;
              text-align: right;
              direction: ltr;
            }
            
            @media print {
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
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            ${titleKu ? `<div class="title-ku">${titleKu}</div>` : ''}
            <div class="title-en">${title}</div>
            <div class="date">Generated on: ${currentDate}</div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  ${tableColumns.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${tableRows.map(row => 
                  `<tr>
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

  return (
    <Button 
      variant={variant} 
      size={size}
      className={`flex items-center gap-2 ${className}`}
      disabled={isLoading || !data || data.length === 0}
      onClick={generatePrintablePage}
    >
      <Printer className="h-4 w-4" />
      {isLoading ? t('common.printing', currentLanguage) : t('common.print', currentLanguage)}
    </Button>
  )
}