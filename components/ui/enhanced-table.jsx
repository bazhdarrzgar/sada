'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, Trash2, Save, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Text truncation component with tooltip
const TruncatedText = ({ text, maxLength = 30, className = "" }) => {
  if (!text) return <span className={className}>-</span>
  
  const shouldTruncate = text.length > maxLength
  const displayText = shouldTruncate ? text.substring(0, maxLength) + '...' : text
  
  if (!shouldTruncate) {
    return <span className={className}>{text}</span>
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-words bg-gray-900 text-white p-2 rounded shadow-lg">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Enhanced pagination component
const TablePagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Show</span>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>entries</span>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber
            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (currentPage <= 3) {
              pageNumber = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
            } else {
              pageNumber = currentPage - 2 + i
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 w-8 p-0 ${
                  currentPage === pageNumber 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Enhanced table component
const EnhancedTable = ({ 
  data, 
  columns, 
  editingRow, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onCellEdit,
  showActions = true,
  maxRowsPerPage = 10,
  enablePagination = true,
  className = ""
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(maxRowsPerPage)
  
  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = enablePagination ? data.slice(startIndex, endIndex) : data
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
  }
  
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${className}`}>
      <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className="border border-gray-300 dark:border-gray-600 p-3 text-center font-semibold text-sm transition-colors duration-300"
                  style={{ 
                    textAlign: column.align || 'center',
                    minWidth: column.width || 'auto'
                  }}
                >
                  {column.header}
                </th>
              ))}
              {showActions && (
                <th className="border border-gray-300 dark:border-gray-600 p-3 text-center font-semibold text-sm">
                  کردارەکان
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => {
              const actualRowIndex = enablePagination ? startIndex + rowIndex : rowIndex
              const isEditing = editingRow === actualRowIndex
              
              return (
                <tr 
                  key={row.id || rowIndex} 
                  className={`
                    ${rowIndex % 2 === 0 
                      ? 'bg-blue-50/50 dark:bg-gray-800/50' 
                      : 'bg-green-50/50 dark:bg-gray-700/50'
                    } 
                    hover:bg-yellow-50 dark:hover:bg-gray-600/50 
                    transition-all duration-200 ease-in-out
                    border-b border-gray-200 dark:border-gray-600
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className="border border-gray-300 dark:border-gray-600 p-3 transition-colors duration-300"
                      style={{ textAlign: column.align || 'center' }}
                    >
                      {isEditing && column.editable ? (
                        column.editComponent ? (
                          column.editComponent(row, (value) => onCellEdit(actualRowIndex, column.key, value))
                        ) : (
                          <Input
                            value={(() => {
                              // Handle nested array access for calendar week data
                              if (column.key.includes('-')) {
                                const [weekName, cellIndex] = column.key.split('-')
                                return (row[weekName] && row[weekName][parseInt(cellIndex)]) || ''
                              }
                              return row[column.key] || ''
                            })()}
                            onChange={(e) => onCellEdit(actualRowIndex, column.key, e.target.value)}
                            className="w-full text-center dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            type={column.type || 'text'}
                          />
                        )
                      ) : (
                        <div className="flex items-center justify-center">
                          {column.render ? (
                            column.render(row[column.key], row, actualRowIndex)
                          ) : column.truncate ? (
                            <TruncatedText 
                              text={row[column.key]} 
                              maxLength={column.truncate}
                              className="font-medium text-gray-900 dark:text-gray-100"
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {row[column.key] || '-'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  
                  {showActions && (
                    <td className="border border-gray-300 dark:border-gray-600 p-3">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="default" 
                              onClick={() => onSave(actualRowIndex)}
                              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={onCancel}
                              className="h-8 w-8 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => onEdit(actualRowIndex)}
                              className="h-8 w-8 p-0 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onDelete(row.id)}
                              className="h-8 w-8 p-0 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {enablePagination && data.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
      
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Add some records to see them here</p>
        </div>
      )}
    </div>
  )
}

export { EnhancedTable, TruncatedText, TablePagination }