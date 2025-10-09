// Excel export utility - client-side only
export const exportToExcel = async (data, filename) => {
  try {
    // Only run on client side
    if (typeof window === 'undefined') {
      console.warn('Excel export only works on client side')
      return
    }

    if (!data || data.length === 0) {
      alert('هیچ داتایەک بۆ هەناردن نییە')
      return
    }

    // Dynamic import for client-side only
    const { utils, writeFile } = await import('xlsx')
    
    // Filter out internal fields
    const cleanData = data.map(item => {
      const { id, _id, created_at, updated_at, ...rest } = item
      return rest
    })

    // Create workbook
    const wb = utils.book_new()
    const ws = utils.json_to_sheet(cleanData)
    
    // Add worksheet to workbook
    utils.book_append_sheet(wb, ws, 'Data')
    
    // Save file
    writeFile(wb, `${filename}.xlsx`)
    
    console.log('Excel file exported successfully')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    alert('خەطا لە دروستکردنی فایلی Excel')
  }
}

// CSV export utility
export const exportToCSV = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      alert('هیچ داتایەک بۆ هەناردن نییە')
      return
    }

    // Get all unique keys
    const keys = [...new Set(data.flatMap(item => Object.keys(item)))]
    const filteredKeys = keys.filter(key => 
      key !== 'id' && 
      key !== '_id' && 
      key !== 'created_at' && 
      key !== 'updated_at'
    )
    
    // Create CSV header
    const csvHeader = filteredKeys.join(',')
    
    // Create CSV rows
    const csvRows = data.map(item => 
      filteredKeys.map(key => {
        const value = item[key] || ''
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    const csvContent = [csvHeader, ...csvRows].join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('CSV file exported successfully')
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    alert('خەطا لە دروستکردنی فایلی CSV')
  }
}

// JSON export utility
export const exportToJSON = (data, filename) => {
  try {
    if (!data || data.length === 0) {
      alert('هیچ داتایەک بۆ هەناردن نییە')
      return
    }

    // Filter out internal fields
    const cleanData = data.map(item => {
      const { id, _id, created_at, updated_at, ...rest } = item
      return rest
    })

    const jsonString = JSON.stringify(cleanData, null, 2)
    
    // Create and download file
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('JSON file exported successfully')
  } catch (error) {
    console.error('Error exporting to JSON:', error)
    alert('خەطا لە دروستکردنی فایلی JSON')
  }
}