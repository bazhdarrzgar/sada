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
  const [newEntry, setNewEntry] = useState({
    month: '',
    week1: ['', '', '', ''],
    week2: ['', '', '', ''],
    week3: ['', '', '', ''],
    week4: ['', '', '', '']
  })

  // Initialize Fuse.js with search options for comprehensive search across all columns
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
    // Define table columns for calendar
    const columns = [
      {
        key: 'month',
        header: 'Date',
        align: 'right',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'week1-0',
        header: 'W/1-1',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week1 && row.week1[0]) || ''}</span>
      },
      {
        key: 'week1-1',
        header: 'W/1-2',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week1 && row.week1[1]) || ''}</span>
      },
      {
        key: 'week1-2',
        header: 'W/1-3',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week1 && row.week1[2]) || ''}</span>
      },
      {
        key: 'week1-3',
        header: 'W/1-4',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week1 && row.week1[3]) || ''}</span>
      },
      {
        key: 'week2-0',
        header: 'W/2-1',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week2 && row.week2[0]) || ''}</span>
      },
      {
        key: 'week2-1',
        header: 'W/2-2',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week2 && row.week2[1]) || ''}</span>
      },
      {
        key: 'week2-2',
        header: 'W/2-3',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week2 && row.week2[2]) || ''}</span>
      },
      {
        key: 'week2-3',
        header: 'W/2-4',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week2 && row.week2[3]) || ''}</span>
      },
      {
        key: 'week3-0',
        header: 'W/3-1',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week3 && row.week3[0]) || ''}</span>
      },
      {
        key: 'week3-1',
        header: 'W/3-2',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week3 && row.week3[1]) || ''}</span>
      },
      {
        key: 'week3-2',
        header: 'W/3-3',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week3 && row.week3[2]) || ''}</span>
      },
      {
        key: 'week3-3',
        header: 'W/3-4',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week3 && row.week3[3]) || ''}</span>
      },
      {
        key: 'week4-0',
        header: 'W/4-1',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week4 && row.week4[0]) || ''}</span>
      },
      {
        key: 'week4-1',
        header: 'W/4-2',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week4 && row.week4[1]) || ''}</span>
      },
      {
        key: 'week4-2',
        header: 'W/4-3',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week4 && row.week4[2]) || ''}</span>
      },
      {
        key: 'week4-3',
        header: 'W/4-4',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value, row) => <span className="text-xs font-medium">{(row.week4 && row.week4[3]) || ''}</span>
      }
    ]

    return (
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
    </PageLayout>
  )
}