'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import AdminNotificationControls from '@/components/AdminNotificationControls'
import AdvancedAdminControls from '@/components/AdvancedAdminControls'
import Fuse from 'fuse.js'

export default function CalendarPage() {
  const isMobile = useIsMobile()
  const [calendarData, setCalendarData] = useState([])
  const [legendData, setLegendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  
  // Code management states
  const [codeSearchTerm, setCodeSearchTerm] = useState('')
  const [isAddCodeDialogOpen, setIsAddCodeDialogOpen] = useState(false)
  const [isEditCodeDialogOpen, setIsEditCodeDialogOpen] = useState(false)
  const [editingCodeData, setEditingCodeData] = useState(null)
  const [newCodeData, setNewCodeData] = useState({
    abbreviation: '',
    full_description: '',
    category: 'Records'
  })
  
  const [newEntry, setNewEntry] = useState({
    month: '',
    week1: ['', '', '', ''],
    week2: ['', '', '', ''],
    week3: ['', '', '', ''],
    week4: ['', '', '', '']
  })

  // Enhanced function to calculate actual dates for each week and day
  const calculateActualDates = (monthStr, year) => {
    const monthNames = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
      '1-Jan': 0, '1-Feb': 1, '1-Mar': 2, '1-Apr': 3, '1-May': 4, '1-Jun': 5,
      '1-Jul': 6, '1-Aug': 7, '1-Sep': 8, '1-Oct': 9, '1-Nov': 10, '1-Dec': 11,
      // Kurdish month names support
      'کانونی دووەم': 0, 'شوبات': 1, 'ئازار': 2, 'نیسان': 3, 'ئایار': 4, 'حوزەیران': 5,
      'تەمووز': 6, 'ئاب': 7, 'ئەیلوول': 8, 'تشرینی یەکەم': 9, 'تشرینی دووەم': 10, 'کانونی یەکەم': 11
    }
    
    // Enhanced date extraction logic
    let month = 0
    let day = 1
    
    // Handle different date formats: "15-Jun", "Jun-2024", "1-Jun", etc.
    if (monthStr.includes('-')) {
      const parts = monthStr.split('-')
      if (parts.length === 2) {
        // Check if first part is a number (day) or second part is a year
        const firstPart = parts[0]
        const secondPart = parts[1]
        
        if (!isNaN(firstPart) && isNaN(secondPart)) {
          // Format: "15-Jun"
          day = parseInt(firstPart)
          for (const [key, value] of Object.entries(monthNames)) {
            if (secondPart.includes(key)) {
              month = value
              break
            }
          }
        } else if (isNaN(firstPart) && !isNaN(secondPart)) {
          // Format: "Jun-2024" or similar
          for (const [key, value] of Object.entries(monthNames)) {
            if (firstPart.includes(key)) {
              month = value
              break
            }
          }
        } else {
          // Fallback to original logic
          for (const [key, value] of Object.entries(monthNames)) {
            if (monthStr.includes(key)) {
              month = value
              break
            }
          }
        }
      }
    } else {
      // Handle month names without dashes
      for (const [key, value] of Object.entries(monthNames)) {
        if (monthStr.includes(key)) {
          month = value
          break
        }
      }
    }
    
    const currentYear = year || new Date().getFullYear()
    const targetDate = new Date(currentYear, month, day)
    
    // Find the first Sunday of the month containing our target date
    const firstDayOfMonth = new Date(currentYear, month, 1)
    const firstSunday = new Date(firstDayOfMonth)
    
    const dayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
    if (dayOfWeek !== 0) {
      firstSunday.setDate(firstDayOfMonth.getDate() - dayOfWeek)
    }
    
    // Calculate dates for 4 weeks, 4 days each (Sun, Mon, Tue, Wed)
    const weeks = []
    for (let week = 0; week < 4; week++) {
      const weekDates = []
      for (let day = 0; day < 4; day++) { // Only Sun, Mon, Tue, Wed
        const date = new Date(firstSunday)
        date.setDate(firstSunday.getDate() + (week * 7) + day)
        weekDates.push(date)
      }
      weeks.push(weekDates)
    }
    
    return {
      weeks: weeks,
      targetDate: targetDate,
      monthName: monthStr,
      calculatedMonth: month,
      calculatedDay: day
    }
  }

  // Function to get actual date for email integration
  const getActualDateForCell = (monthStr, weekIndex, dayIndex, year) => {
    const result = calculateActualDates(monthStr, year || new Date().getFullYear())
    if (result.weeks[weekIndex] && result.weeks[weekIndex][dayIndex]) {
      return result.weeks[weekIndex][dayIndex]
    }
    return null
  }

  // Function to format date for display in headers
  const formatDateForHeader = (date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    return `${day}/${month}`
  }

  // Function to format date for email (e.g., "Sunday, January 15, 2025")
  const formatDateForEmail = (date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
    
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'month', weight: 0.3 },
        // Search individual cells in each week for better granularity
        { name: 'week1.0', weight: 0.2 },
        { name: 'week1.1', weight: 0.2 },
        { name: 'week1.2', weight: 0.2 },
        { name: 'week1.3', weight: 0.2 },
        { name: 'week2.0', weight: 0.2 },
        { name: 'week2.1', weight: 0.2 },
        { name: 'week2.2', weight: 0.2 },
        { name: 'week2.3', weight: 0.2 },
        { name: 'week3.0', weight: 0.2 },
        { name: 'week3.1', weight: 0.2 },
        { name: 'week3.2', weight: 0.2 },
        { name: 'week3.3', weight: 0.2 },
        { name: 'week4.0', weight: 0.2 },
        { name: 'week4.1', weight: 0.2 },
        { name: 'week4.2', weight: 0.2 },
        { name: 'week4.3', weight: 0.2 },
        // Search joined week data as well for complete coverage
        { name: 'week1_joined', weight: 0.15, getFn: (obj) => Array.isArray(obj.week1) ? obj.week1.join(' ') : '' },
        { name: 'week2_joined', weight: 0.15, getFn: (obj) => Array.isArray(obj.week2) ? obj.week2.join(' ') : '' },
        { name: 'week3_joined', weight: 0.15, getFn: (obj) => Array.isArray(obj.week3) ? obj.week3.join(' ') : '' },
        { name: 'week4_joined', weight: 0.15, getFn: (obj) => Array.isArray(obj.week4) ? obj.week4.join(' ') : '' }
      ],
      threshold: 0.3, // Lower threshold = more exact matches
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    }
    return new Fuse(calendarData, options)
  }, [calendarData])

  // Fetch data from APIs
  useEffect(() => {
    fetchCalendarData()
    fetchLegendData()
  }, [])

  // Debug: Log when calendarData changes
  useEffect(() => {
    console.log('Calendar data state updated:', calendarData)
  }, [calendarData])

  const fetchCalendarData = async () => {
    try {
      console.log('Fetching calendar data...')
      const response = await fetch('/api/calendar?t=' + Date.now())
      console.log('Calendar response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Calendar data received:', data)
        setCalendarData(data)
      } else {
        console.error('Failed to fetch calendar data:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    }
  }

  const fetchLegendData = async () => {
    try {
      const response = await fetch('/api/legend')
      if (response.ok) {
        const data = await response.json()
        setLegendData(data)
      }
    } catch (error) {
      console.error('Error fetching legend data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      console.log('Saving entry:', entry)
      let response
      
      if (entry.id && !entry.id.startsWith('local-')) {
        // Update existing entry
        console.log('Updating existing entry with ID:', entry.id)
        response = await fetch(`/api/calendar/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        console.log('Creating new entry')
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('local-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      }

      console.log('Save response status:', response.status)
      if (response.ok) {
        const savedEntry = await response.json()
        console.log('Saved entry received:', savedEntry)
        
        // Update local state with the saved data
        setCalendarData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            const newData = [...prevData]
            newData[existingIndex] = savedEntry
            console.log('Updated existing entry in state')
            console.log('New state will be:', newData)
            return newData
          } else {
            console.log('Added new entry to state')
            const newState = [...prevData, savedEntry]
            console.log('New state will be:', newState)
            return newState
          }
        })

        setIsAddDialogOpen(false)
        setEditingRow(null)
        resetNewEntry()
        
        // Refresh legend data to show updated usage counts
        fetchLegendData()
      } else {
        console.error('Failed to save entry:', response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('local-')) {
        // Remove from local state only if it's a temporary entry
        setCalendarData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/calendar/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCalendarData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      month: '',
      week1: ['', '', '', ''],
      week2: ['', '', '', ''],
      week3: ['', '', '', ''],
      week4: ['', '', '', '']
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    setCalendarData(prevData => {
      const updatedData = [...prevData]
      if (field.startsWith('week')) {
        // For week arrays, we need to handle differently
        const weekName = field.split('-')[0]
        const cellIndex = parseInt(field.split('-')[1])
        if (!updatedData[rowIndex][weekName]) {
          updatedData[rowIndex][weekName] = ['', '', '', '']
        }
        // Create a new array to ensure React recognizes the change
        updatedData[rowIndex][weekName] = [...updatedData[rowIndex][weekName]]
        updatedData[rowIndex][weekName][cellIndex] = value
      } else {
        updatedData[rowIndex][field] = value
      }
      return updatedData
    })
  }

  const startEditing = (index) => {
    const entry = calendarData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = async (rowIndex) => {
    const entry = calendarData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchCalendarData()
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Code management functions
  const resetNewCodeData = () => {
    setNewCodeData({
      abbreviation: '',
      full_description: '',
      category: 'Records'
    })
  }

  const handleAddCode = async () => {
    try {
      const response = await fetch('/api/legend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCodeData)
      })

      if (response.ok) {
        const newCode = await response.json()
        setLegendData(prev => [...prev, newCode])
        setIsAddCodeDialogOpen(false)
        resetNewCodeData()
      } else {
        console.error('Failed to add code')
      }
    } catch (error) {
      console.error('Error adding code:', error)
    }
  }

  const startEditingCode = (code) => {
    setEditingCodeData({...code})
    setIsEditCodeDialogOpen(true)
  }

  const handleUpdateCode = async () => {
    try {
      const response = await fetch(`/api/legend/${editingCodeData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCodeData)
      })

      if (response.ok) {
        const updatedCode = await response.json()
        setLegendData(prev => prev.map(code => 
          code.id === updatedCode.id ? updatedCode : code
        ))
        setIsEditCodeDialogOpen(false)
        setEditingCodeData(null)
      } else {
        console.error('Failed to update code')
      }
    } catch (error) {
      console.error('Error updating code:', error)
    }
  }

  const handleDeleteCode = async (codeId) => {
    if (!confirm('Are you sure you want to delete this code? / دڵنیایت لە سڕینەوەی ئەم کۆدە؟')) {
      return
    }

    try {
      const response = await fetch(`/api/legend/${codeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLegendData(prev => prev.filter(code => code.id !== codeId))
      } else {
        console.error('Failed to delete code')
      }
    } catch (error) {
      console.error('Error deleting code:', error)
    }
  }

  // Filter codes based on search
  const filteredCodes = useMemo(() => {
    if (!codeSearchTerm.trim()) {
      return legendData
    }
    
    return legendData.filter(code => 
      code.abbreviation?.toLowerCase().includes(codeSearchTerm.toLowerCase()) ||
      code.full_description?.toLowerCase().includes(codeSearchTerm.toLowerCase()) ||
      code.category?.toLowerCase().includes(codeSearchTerm.toLowerCase())
    )
  }, [legendData, codeSearchTerm])

  // Define fields for modal editing
  const editFields = [
    {
      key: 'month',
      label: 'Month',
      labelKu: 'دیمەن',
      type: 'text',
      placeholder: 'e.g., 1-Jun, 1-Jul, 1-Aug'
    },
    {
      key: 'week1',
      label: 'Week 1',
      labelKu: 'هەفتەی یەکەم',
      type: 'week-array',
      span: 'full'
    },
    {
      key: 'week2',
      label: 'Week 2', 
      labelKu: 'هەفتەی دووەم',
      type: 'week-array',
      span: 'full'
    },
    {
      key: 'week3',
      label: 'Week 3',
      labelKu: 'هەفتەی سێیەم', 
      type: 'week-array',
      span: 'full'
    },
    {
      key: 'week4',
      label: 'Week 4',
      labelKu: 'هەفتەی چوارەم',
      type: 'week-array',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return calendarData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, calendarData])

  function CalendarCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.month}</div>
              {["week1", "week2", "week3", "week4"].map((week, i) => (
                <div key={week} className="flex text-xs mb-1">
                  <span className="font-semibold min-w-[2.5rem]">W/{i+1}:</span>
                  <span className="ml-2 truncate">{(entry[week] || []).join(", ")}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)} className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  function CalendarTableView({ data }) {
    // Calculate actual dates for the first entry to use in headers
    const sampleEntry = data[0]
    const currentYear = new Date().getFullYear()
    let dateResult = { weeks: [] }
    
    if (sampleEntry) {
      dateResult = calculateActualDates(sampleEntry.month, currentYear)
    }
    
    const weekDates = dateResult.weeks
    
    // Define table columns for calendar with dynamic dates and enhanced email integration
    const columns = [
      {
        key: 'month',
        header: 'Date',
        align: 'right',
        editable: true,
        truncate: 20,
        render: (value, row) => (
          <div className="font-medium">
            <div>{value}</div>
            {dateResult.targetDate && (
              <div className="text-xs text-gray-500 mt-1">
                📅 {formatDateForEmail(dateResult.targetDate)}
              </div>
            )}
          </div>
        )
      },
      // Week 1
      {
        key: 'week1-0',
        header: weekDates[0] ? `Sun ${formatDateForHeader(weekDates[0][0])}` : 'W/1-Sun',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week1 && row.week1[0]) || ''}</div>
            {weekDates[0] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[0][0].getDate()}/{weekDates[0][0].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week1-1',
        header: weekDates[0] ? `Mon ${formatDateForHeader(weekDates[0][1])}` : 'W/1-Mon',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week1 && row.week1[1]) || ''}</div>
            {weekDates[0] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[0][1].getDate()}/{weekDates[0][1].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week1-2',
        header: weekDates[0] ? `Tue ${formatDateForHeader(weekDates[0][2])}` : 'W/1-Tue',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week1 && row.week1[2]) || ''}</div>
            {weekDates[0] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[0][2].getDate()}/{weekDates[0][2].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week1-3',
        header: weekDates[0] ? `Wed ${formatDateForHeader(weekDates[0][3])}` : 'W/1-Wed',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week1 && row.week1[3]) || ''}</div>
            {weekDates[0] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[0][3].getDate()}/{weekDates[0][3].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      // Week 2
      {
        key: 'week2-0',
        header: weekDates[1] ? `Sun ${formatDateForHeader(weekDates[1][0])}` : 'W/2-Sun',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week2 && row.week2[0]) || ''}</div>
            {weekDates[1] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[1][0].getDate()}/{weekDates[1][0].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week2-1',
        header: weekDates[1] ? `Mon ${formatDateForHeader(weekDates[1][1])}` : 'W/2-Mon',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week2 && row.week2[1]) || ''}</div>
            {weekDates[1] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[1][1].getDate()}/{weekDates[1][1].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week2-2',
        header: weekDates[1] ? `Tue ${formatDateForHeader(weekDates[1][2])}` : 'W/2-Tue',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week2 && row.week2[2]) || ''}</div>
            {weekDates[1] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[1][2].getDate()}/{weekDates[1][2].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week2-3',
        header: weekDates[1] ? `Wed ${formatDateForHeader(weekDates[1][3])}` : 'W/2-Wed',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week2 && row.week2[3]) || ''}</div>
            {weekDates[1] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[1][3].getDate()}/{weekDates[1][3].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      // Week 3
      {
        key: 'week3-0',
        header: weekDates[2] ? `Sun ${formatDateForHeader(weekDates[2][0])}` : 'W/3-Sun',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week3 && row.week3[0]) || ''}</div>
            {weekDates[2] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[2][0].getDate()}/{weekDates[2][0].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week3-1',
        header: weekDates[2] ? `Mon ${formatDateForHeader(weekDates[2][1])}` : 'W/3-Mon',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week3 && row.week3[1]) || ''}</div>
            {weekDates[2] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[2][1].getDate()}/{weekDates[2][1].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week3-2',
        header: weekDates[2] ? `Tue ${formatDateForHeader(weekDates[2][2])}` : 'W/3-Tue',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week3 && row.week3[2]) || ''}</div>
            {weekDates[2] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[2][2].getDate()}/{weekDates[2][2].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week3-3',
        header: weekDates[2] ? `Wed ${formatDateForHeader(weekDates[2][3])}` : 'W/3-Wed',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week3 && row.week3[3]) || ''}</div>
            {weekDates[2] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[2][3].getDate()}/{weekDates[2][3].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      // Week 4
      {
        key: 'week4-0',
        header: weekDates[3] ? `Sun ${formatDateForHeader(weekDates[3][0])}` : 'W/4-Sun',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week4 && row.week4[0]) || ''}</div>
            {weekDates[3] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[3][0].getDate()}/{weekDates[3][0].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week4-1',
        header: weekDates[3] ? `Mon ${formatDateForHeader(weekDates[3][1])}` : 'W/4-Mon',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week4 && row.week4[1]) || ''}</div>
            {weekDates[3] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[3][1].getDate()}/{weekDates[3][1].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week4-2',
        header: weekDates[3] ? `Tue ${formatDateForHeader(weekDates[3][2])}` : 'W/4-Tue',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week4 && row.week4[2]) || ''}</div>
            {weekDates[3] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[3][2].getDate()}/{weekDates[3][2].getMonth() + 1}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'week4-3',
        header: weekDates[3] ? `Wed ${formatDateForHeader(weekDates[3][3])}` : 'W/4-Wed',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => (
          <div className="text-xs">
            <div className="font-medium">{(row.week4 && row.week4[3]) || ''}</div>
            {weekDates[3] && (
              <div className="text-gray-400 mt-1">
                📧 {weekDates[3][3].getDate()}/{weekDates[3][3].getMonth() + 1}
              </div>
            )}
          </div>
        )
      }
    ]

    return (
      <div>
        {/* Enhanced Date Information Panel */}
        {data.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📅 Current Month Schedule Overview
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  <strong>Month:</strong> {sampleEntry?.month} | 
                  <strong> Predicted Date:</strong> {dateResult.targetDate ? formatDateForEmail(dateResult.targetDate) : 'N/A'} |
                  <strong> Email Integration:</strong> ✅ Active
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    // This could trigger a preview of today's email
                    alert('Email preview functionality - would show today\'s scheduled tasks')
                  }}
                >
                  📧 Preview Today's Email
                </Button>
              </div>
            </div>
          </div>
        )}

        <EnhancedTable
          data={data}
          columns={columns}
          editingRow={null} // Disable inline editing
          onEdit={startEditing}
          onSave={() => {}} // No inline save
          onCancel={() => {}} // No inline cancel
          onDelete={deleteEntry}
          onCellEdit={() => {}} // No inline cell edit
          maxRowsPerPage={10}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
      </div>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Calendar Management" titleKu="بەڕێوەبردنی ساڵنامە">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Calendar Management" titleKu="بەڕێوەبردنی ساڵنامە">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی ساڵنامەدا... / Fuzzy search across all calendar columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="calendar-data"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="calendar-data"
            title="Calendar Management"
            titleKu="بەڕێوەبردنی ساڵنامە"
            columns={[
              { key: 'month', header: 'Date' },
              { key: 'week1', header: 'W/1', render: (value) => Array.isArray(value) ? value.join(', ') : value },
              { key: 'week2', header: 'W/2', render: (value) => Array.isArray(value) ? value.join(', ') : value },
              { key: 'week3', header: 'W/3', render: (value) => Array.isArray(value) ? value.join(', ') : value },
              { key: 'week4', header: 'W/4', render: (value) => Array.isArray(value) ? value.join(', ') : value }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی تۆمارێکی نوێ
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Calendar Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  value={newEntry.month}
                  onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                  placeholder="e.g., 1-Jun, 1-Jul, 1-Aug"
                />
              </div>
              
              {['week1', 'week2', 'week3', 'week4'].map((week, weekIndex) => (
                <div key={week} className="space-y-2">
                  <Label>Week {weekIndex + 1}</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {newEntry[week].map((cell, cellIndex) => (
                      <Input
                        key={cellIndex}
                        value={cell}
                        onChange={(e) => {
                          const updated = {...newEntry}
                          updated[week][cellIndex] = e.target.value
                          setNewEntry(updated)
                        }}
                        placeholder={`Day ${cellIndex + 1}`}
                        className="text-sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                  Cancel
                </Button>
                <Button onClick={() => saveEntry(newEntry)}>
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Calendar Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <CalendarCardView data={filteredData} />
        ) : (
          <CalendarTableView data={filteredData} />
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingData(null)
        }}
        data={editingData}
        fields={editFields}
        onSave={handleModalSave}
        title="Edit Calendar Entry"
        titleKu="دەستکاریکردنی تۆماری ساڵنامە"
      />

      {/* Enhanced Email Integration Controls */}
      <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
              <span>📧</span>
              Email Integration & Date Prediction
              <span className="text-sm font-normal text-gray-600 dark:text-gray-300">/ پەیوەندی ئیمەیڵ و پێشبینی ڕێکەوت</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Prediction Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                🎯 Smart Date Prediction
              </h4>
              <div className="text-sm space-y-2">
                <p><strong>✅ Enhanced Format Support:</strong></p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                  <li>Standard: "1-Jun", "15-Jul", "1-Aug"</li>
                  <li>Full dates: "June-2024", "July-2024"</li>
                  <li>Kurdish months: "حوزەیران", "تەمووز", "ئاب"</li>
                  <li>Auto-calculation: Week numbers → Real dates</li>
                </ul>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300">
                  <p><strong>🔄 Auto-Updates:</strong> Dates are automatically calculated based on month and week information</p>
                </div>
              </div>
            </div>

            {/* Email Integration Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                📨 Email Notification Features
              </h4>
              <div className="text-sm space-y-2">
                <p><strong>✅ Automated System:</strong></p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-2">
                  <li>Daily notifications at 6:00 AM Baghdad time</li>
                  <li>Smart code extraction from calendar entries</li>
                  <li>Task descriptions with code dictionary</li>
                  <li>Date-specific email content</li>
                </ul>
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300">
                  <p><strong>🎯 Integration:</strong> Each calendar cell with date prediction is connected to email system</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Date Preview */}
          {filteredData.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-600">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                🗓️ Live Date Prediction Preview for "{filteredData[0]?.month}"
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {(() => {
                  const result = calculateActualDates(filteredData[0]?.month, new Date().getFullYear())
                  return result.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="bg-white dark:bg-gray-800 p-2 rounded border">
                      <div className="font-semibold mb-1">Week {weekIndex + 1}</div>
                      {week.map((date, dayIndex) => {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed']
                        return (
                          <div key={dayIndex} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">{dayNames[dayIndex]}:</span>
                            <span className="font-medium">{date.getDate()}/{date.getMonth() + 1}</span>
                          </div>
                        )
                      })}
                    </div>
                  ))
                })()}
              </div>
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span>🔄</span>
                <span>Dates update automatically based on month field. Email system uses these predictions for notifications.</span>
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
            <span className="font-semibold">💡 How it works:</span> Enter month (e.g., "1-Jun") → System predicts all week dates → Email notifications use exact dates for each task code.
            <br />
            <span className="font-semibold">چۆن کاردەکات:</span> مانگ بنووسە (وەک "1-Jun") ← سیستەم هەموو ڕێکەوتەکانی هەفتە پێشبینی دەکات ← ئاگادارکردنەوەی ئیمەیڵ ڕێکەوتی وردی بەکاردەهێنێت.
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <span>📋</span>
              Record Type Codes Reference
              <span className="text-sm font-normal text-gray-600 dark:text-gray-300">/ كۆدەكانی جۆرەكانی تۆمار</span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="گەڕان لە کۆدەکان... / Search codes..."
                  value={codeSearchTerm}
                  onChange={(e) => setCodeSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isAddCodeDialogOpen} onOpenChange={setIsAddCodeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    کۆدی نوێ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Code / زیادکردنی کۆدی نوێ</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code">Code / کۆد</Label>
                      <Input
                        id="code"
                        value={newCodeData.abbreviation}
                        onChange={(e) => setNewCodeData({...newCodeData, abbreviation: e.target.value.toUpperCase()})}
                        placeholder="e.g., A, B1, C2"
                        maxLength={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="meaning">Meaning / واتا</Label>
                      <Input
                        id="meaning"
                        value={newCodeData.full_description}
                        onChange={(e) => setNewCodeData({...newCodeData, full_description: e.target.value})}
                        placeholder="Description of the code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category / پۆل</Label>
                      <Input
                        id="category"
                        value={newCodeData.category}
                        onChange={(e) => setNewCodeData({...newCodeData, category: e.target.value})}
                        placeholder="e.g., Records, Management, Academic"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {setIsAddCodeDialogOpen(false); resetNewCodeData();}}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCode} disabled={!newCodeData.abbreviation || !newCodeData.full_description}>
                        Add Code
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Display filtered codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm">
            {filteredCodes.map((code) => (
              <div key={code.id} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border group hover:shadow-md transition-all">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`font-mono px-2 py-1 rounded font-semibold min-w-[2rem] text-center text-white ${
                    code.abbreviation?.includes('1') || code.abbreviation?.includes('2') || code.abbreviation?.includes('3')
                      ? 'bg-green-600' 
                      : 'bg-blue-600'
                  }`}>
                    {code.abbreviation}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 truncate" title={code.full_description}>
                    {code.full_description}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditingCode(code)}
                    className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCode(code.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Show message if no codes found */}
          {filteredCodes.length === 0 && codeSearchTerm && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No codes found matching "{codeSearchTerm}"</p>
              <p className="text-sm">هیچ کۆدێک نەدۆزرایەوە بۆ "{codeSearchTerm}"</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <span className="font-semibold">💡 Usage Tip:</span> Use these codes when entering calendar data for quick reference to different record types.
            <br />
            <span className="font-semibold">ئامۆژگاری بەکارهێنان:</span> ئەم کۆدانە بەکاربهێنە کاتی داخڵکردنی داتاکانی ساڵنامە بۆ ئاماژەدانی خێرا بە جۆرە جیاوازەکانی تۆمار.
          </div>
        </CardContent>
      </Card>

      {/* Edit Code Modal */}
      <Dialog open={isEditCodeDialogOpen} onOpenChange={setIsEditCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Code / دەستکاریکردنی کۆد</DialogTitle>
          </DialogHeader>
          {editingCodeData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCode">Code / کۆد</Label>
                <Input
                  id="editCode"
                  value={editingCodeData.abbreviation}
                  onChange={(e) => setEditingCodeData({...editingCodeData, abbreviation: e.target.value.toUpperCase()})}
                  placeholder="e.g., A, B1, C2"
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="editMeaning">Meaning / واتا</Label>
                <Input
                  id="editMeaning"
                  value={editingCodeData.full_description}
                  onChange={(e) => setEditingCodeData({...editingCodeData, full_description: e.target.value})}
                  placeholder="Description of the code"
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category / پۆل</Label>
                <Input
                  id="editCategory"
                  value={editingCodeData.category || ''}
                  onChange={(e) => setEditingCodeData({...editingCodeData, category: e.target.value})}
                  placeholder="e.g., Records, Management, Academic"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {setIsEditCodeDialogOpen(false); setEditingCodeData(null);}}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCode} disabled={!editingCodeData.abbreviation || !editingCodeData.full_description}>
                  Update Code
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Advanced Admin Controls */}
      <AdvancedAdminControls />
    </PageLayout>
  )
}