'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Building } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import Fuse from 'fuse.js'

export default function BuildingExpensesPage() {
  const isMobile = useIsMobile()
  const [expensesData, setExpensesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [summaryYear, setSummaryYear] = useState('')
  const [summaryMonth, setSummaryMonth] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [newEntry, setNewEntry] = useState({
    item: '',
    cost: 0,
    year: new Date().getFullYear().toString(),
    month: 1,
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Helper functions for enhanced search - MUST be defined before Fuse.js configuration
  const getMonthName = (month) => {
    const monthNames = {
      1: 'January کانونی دووەم',
      2: 'February شوبات',
      3: 'March ئادار',
      4: 'April نیسان',
      5: 'May ئایار',
      6: 'June حوزەیران',
      7: 'July تەمووز',
      8: 'August ئاب',
      9: 'September ئەیلوول',
      10: 'October تشرینی یەکەم',
      11: 'November تشرینی دووەم',
      12: 'December کانونی یەکەم'
    }
    return monthNames[month] || ''
  }

  const getCostRange = (cost) => {
    if (cost < 100000) return 'low کەم'
    if (cost < 500000) return 'medium ناوەند'
    if (cost < 1000000) return 'high بەرز'
    return 'very-high زۆر بەرز'
  }

  const getSeason = (month) => {
    if ([12, 1, 2].includes(month)) return 'winter زستان'
    if ([3, 4, 5].includes(month)) return 'spring بەھار'
    if ([6, 7, 8].includes(month)) return 'summer ھاوین'
    if ([9, 10, 11].includes(month)) return 'autumn پاییز'
    return ''
  }

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'item', weight: 0.4 }, // High weight for item description
        { name: 'cost', weight: 0.2 }, // Cost field for amount searches
        { name: 'year', weight: 0.15 }, // Year field
        { name: 'month', weight: 0.15 }, // Month field
        { name: 'notes', weight: 0.1 }, // Notes field
        // Include ID for technical searches
        { name: 'id', weight: 0.05 },
        // Custom comprehensive search field
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          return [
            obj.item || '',
            obj.year || '',
            // Add numeric values as strings for better searching
            obj.cost ? obj.cost.toString() : '',
            obj.month ? obj.month.toString() : '',
            obj.notes || '',
            // Add formatted cost for localized searching
            obj.cost ? parseFloat(obj.cost).toLocaleString() : '',
            // Add date combinations for better date searching
            obj.year && obj.month ? `${obj.year}/${obj.month}` : '',
            obj.year && obj.month ? `${obj.month}/${obj.year}` : '',
            // Add month names in both English and Kurdish
            obj.month ? getMonthName(obj.month) : '',
            // Add cost range indicators
            obj.cost ? getCostRange(parseFloat(obj.cost)) : '',
            // Add seasonal indicators based on month
            obj.month ? getSeason(obj.month) : ''
          ].join(' ').toLowerCase()
        }}
      ],
      threshold: 0.3, // Lower threshold = more exact matches
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    }
    return new Fuse(expensesData, options)
  }, [expensesData])

  // Fetch building expenses data from API
  useEffect(() => {
    fetchExpensesData()
  }, [])

  const fetchExpensesData = async () => {
    try {
      const response = await fetch('/api/building-expenses')
      if (response.ok) {
        const data = await response.json()
        setExpensesData(data)
      }
    } catch (error) {
      console.error('Error fetching building expenses data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    setIsSaving(true)
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('building-')) {
        // Update existing entry
        response = await fetch(`/api/building-expenses/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('building-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/building-expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      }

      if (response.ok) {
        const savedEntry = await response.json()
        
        // Update local state with the saved data
        setExpensesData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            // Update existing entry
            const newData = [...prevData]
            newData[existingIndex] = savedEntry
            return newData
          } else {
            // Add new entry at the beginning (newest first)
            return [savedEntry, ...prevData]
          }
        })

        setIsAddDialogOpen(false)
        resetNewEntry()
        // Refresh the page after successful operation
        window.location.reload()
      } else {
        console.error('Failed to save entry:', response.statusText)
        // Show error to user (you can add toast notification here)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
      // Show error to user (you can add toast notification here)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    setIsDeleting(true)
    try {
      if (id.startsWith('building-')) {
        // Remove from local state only if it's a temporary entry
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/building-expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        // Refresh the page after successful deletion
        window.location.reload()
      } else {
        console.error('Failed to delete entry:', response.statusText)
        // Show error to user (you can add toast notification here)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      // Show error to user (you can add toast notification here)
    } finally {
      setIsDeleting(false)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      item: '',
      cost: 0,
      year: new Date().getFullYear().toString(),
      month: 1,
      notes: ''
    })
  }

  const startEditing = (index) => {
    const entry = expensesData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
    // Refresh the page after successful edit operation
    window.location.reload()
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'item',
      label: 'Item',
      labelKu: 'مەبەست و پێداویستی',
      type: 'text',
      placeholder: 'Enter building expense item'
    },
    {
      key: 'cost',
      label: 'Cost',
      labelKu: 'تێچوون',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'year',
      label: 'Year',
      labelKu: 'ساڵ',
      type: 'number',
      placeholder: new Date().getFullYear().toString()
    },
    {
      key: 'month',
      label: 'Month',
      labelKu: 'مانگ',
      type: 'number',
      placeholder: '1-12'
    },
    {
      key: 'notes',
      label: 'Notes',
      labelKu: 'تێبینی',
      type: 'text',
      placeholder: 'تێبینی...'
    }
  ]

  // FIRST FILTER - Controls only Total Building Expenses (Summary)
  const summaryExpenses = useMemo(() => {
    let data = expensesData

    if (summaryYear && summaryYear !== "all-years") {
      data = data.filter(item => item.year === summaryYear)
    }
    if (summaryMonth && summaryMonth !== "all-months") {
      data = data.filter(item => item.month === summaryMonth)
    }

    return data.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)
  }, [expensesData, summaryYear, summaryMonth])

  // SECOND FILTER - Controls both table and Total Building Expenses (Main filters + search)
  const filteredData = useMemo(() => {
    let data = expensesData

    // Apply year and month filters first (these affect both table and total)
    if (selectedYear && selectedYear !== "all-years") {
      data = data.filter(item => item.year === selectedYear)
    }
    if (selectedMonth && selectedMonth !== "all-months") {
      data = data.filter(item => item.month === selectedMonth)
    }

    // Then apply search if there's a search term
    if (!searchTerm.trim()) {
      return data
    }

    const searchFuse = new Fuse(data, {
      keys: [
        { name: 'item', weight: 0.4 },
        { name: 'cost', weight: 0.2 },
        { name: 'year', weight: 0.15 },
        { name: 'month', weight: 0.15 },
        { name: 'notes', weight: 0.1 },
        { name: 'id', weight: 0.05 },
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          return [
            obj.item || '',
            obj.year || '',
            obj.cost ? obj.cost.toString() : '',
            obj.month ? obj.month.toString() : '',
            obj.notes || '',
            obj.cost ? parseFloat(obj.cost).toLocaleString() : '',
            obj.year && obj.month ? `${obj.year}/${obj.month}` : '',
            obj.year && obj.month ? `${obj.month}/${obj.year}` : '',
            obj.month ? getMonthName(obj.month) : '',
            obj.cost ? getCostRange(parseFloat(obj.cost)) : '',
            obj.month ? getSeason(obj.month) : ''
          ].join(' ').toLowerCase()
        }}
      ],
      threshold: 0.3,
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    })

    const results = searchFuse.search(searchTerm)
    return results.map(result => result.item)
  }, [searchTerm, expensesData, selectedYear, selectedMonth])

  // Calculate total expenses from filtered data (affected by second filter)
  const totalExpenses = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)

  // NEW: Total Building Expenses calculation (affected by second filter: search + main filters)
  const totalBuildingExpenses = useMemo(() => {
    let data = expensesData

    // Apply the same filters as filteredData (selectedYear, selectedMonth, searchTerm)
    if (selectedYear && selectedYear !== "all-years") {
      data = data.filter(item => item.year === selectedYear)
    }
    if (selectedMonth && selectedMonth !== "all-months") {
      data = data.filter(item => item.month === selectedMonth)
    }

    // Apply search if there's a search term
    if (searchTerm.trim()) {
      const searchFuse = new Fuse(data, {
        keys: [
          { name: 'item', weight: 0.4 },
          { name: 'cost', weight: 0.2 },
          { name: 'year', weight: 0.15 },
          { name: 'month', weight: 0.15 },
          { name: 'notes', weight: 0.1 },
          { name: 'id', weight: 0.05 },
          { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
            return [
              obj.item || '',
              obj.year || '',
              obj.cost ? obj.cost.toString() : '',
              obj.month ? obj.month.toString() : '',
              obj.notes || '',
              obj.cost ? parseFloat(obj.cost).toLocaleString() : '',
              obj.year && obj.month ? `${obj.year}/${obj.month}` : '',
              obj.year && obj.month ? `${obj.month}/${obj.year}` : '',
              obj.month ? getMonthName(obj.month) : '',
              obj.cost ? getCostRange(parseFloat(obj.cost)) : '',
              obj.month ? getSeason(obj.month) : ''
            ].join(' ').toLowerCase()
          }}
        ],
        threshold: 0.3,
        distance: 100,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        ignoreLocation: true
      })

      const results = searchFuse.search(searchTerm)
      data = results.map(result => result.item)
    }

    return data.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)
  }, [expensesData, selectedYear, selectedMonth, searchTerm])

  // Get unique years and months for dropdowns
  const availableYears = useMemo(() => {
    const years = [...new Set(expensesData.map(item => item.year).filter(Boolean))].sort((a, b) => b.localeCompare(a))
    return years
  }, [expensesData])

  const availableMonths = useMemo(() => {
    const months = [...new Set(expensesData.map(item => item.month).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b))
    return months
  }, [expensesData])

  // Add a key for forcing re-renders when data changes
  const tableKey = useMemo(() => `building-expenses-${expensesData.length}-${Date.now()}`, [expensesData.length])

  // Force re-render when data changes
  useEffect(() => {
    // This effect ensures the table re-renders when data changes
  }, [expensesData])

  function ExpensesCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.item}</div>
                <div className="font-bold text-xl text-red-600 dark:text-red-400">{parseFloat(entry.cost).toLocaleString()} د.ع</div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-semibold">ساڵ:</span> 
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                    {entry.year || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">مانگ:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                    {entry.month || 'N/A'}
                  </span>
                </div>
              </div>
              {entry.notes && (
                <div className="text-sm">
                  <span className="font-semibold">تێبینی:</span> 
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {entry.notes}
                  </span>
                </div>
              )}
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

  function ExpensesTableView({ data }) {
    // Define table columns for building expenses
    const columns = [
      {
        key: 'item',
        header: 'مەبەست و پێداویستی',
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'cost',
        header: 'تێچوون',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'year',
        header: 'ساڵ',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => (
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'month',
        header: 'مانگ',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'notes',
        header: 'تێبینی',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-gray-600 dark:text-gray-400">{value || '-'}</span>
      }
    ]

    return (
      <>
        <EnhancedTable
          key={tableKey}
          data={data}
          columns={columns}
          editingRow={null} // Disable inline editing
          onEdit={startEditing}
          onSave={() => {}} // No inline save
          onCancel={() => {}} // No inline cancel
          onDelete={deleteEntry}
          onCellEdit={() => {}} // No inline cell edit
          maxRowsPerPage={15}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Total Building Expenses (affected by search and main filters - SECOND FILTER) */}
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  Total Building Expenses / کۆی گشتی مەسروفی بینا
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  Controlled by search bar and filters above
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalBuildingExpenses.toLocaleString()} د.ع
                </div>
              </div>

              {/* Current Table Total (shows same as Total Building Expenses) */}
              <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                  Current Table Total / کۆی خشتەی ئێستا
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                  Same as Total Building Expenses above
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalExpenses.toLocaleString()} د.ع
                </div>
              </div>

              {/* Summary filters (FIRST FILTER - Controls only the summary calculation below) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-4">
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Summary Calculator (Independent) / حیسابکەری کۆی سەربەخۆ
                  <div className="text-xs text-gray-500 mt-1">This filter controls ONLY the summary calculation below</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">ساڵ:</Label>
                    <Select value={summaryYear} onValueChange={setSummaryYear}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="هەڵبژاردنی ساڵ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-years">هەموو ساڵەکان</SelectItem>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">مانگ:</Label>
                    <Select value={summaryMonth} onValueChange={setSummaryMonth}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="هەڵبژاردنی مانگ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-months">هەموو مانگەکان</SelectItem>
                        {availableMonths.map(month => (
                          <SelectItem key={month} value={month}>
                            {month} - {getMonthName(month)?.split(' ')[1] || month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Summary results (affected by FIRST FILTER only) */}
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  {(summaryYear && summaryYear !== "all-years") || (summaryMonth && summaryMonth !== "all-months") ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {(summaryYear && summaryYear !== "all-years") && (summaryMonth && summaryMonth !== "all-months") 
                          ? `Summary for ${getMonthName(summaryMonth)?.split(' ')[1] || summaryMonth} ${summaryYear} / کۆی ${getMonthName(summaryMonth)?.split(' ')[1] || summaryMonth} ${summaryYear}`
                          : (summaryYear && summaryYear !== "all-years")
                          ? `Summary for Year ${summaryYear} / کۆی ساڵی ${summaryYear}`
                          : `Summary for Month ${summaryMonth} / کۆی مانگی ${getMonthName(summaryMonth)?.split(' ')[1] || summaryMonth}`
                        }
                      </p>
                      <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{summaryExpenses.toLocaleString()} د.ع</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">All Records Summary / کۆی گشتی هەموو تۆمارەکان</p>
                      <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{summaryExpenses.toLocaleString()} د.ع</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Building Expenses" titleKu="مەسروفی بینا">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Building Expenses" titleKu="مەسروفی بینا">
      {/* Search and Add Controls */}
      <div className="space-y-4">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="گەڕانی فازی لە هەموو ستوونەکانی مەسروفی بیناکاندا... / Fuzzy search across all building expense columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Year and Month Filters - Controls both table AND total */}
          <div className="flex items-center gap-3 border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-blue-50/50 dark:bg-blue-900/20">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
              Table & Total Filter:
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">ساڵ:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="هەموو ساڵەکان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">هەموو ساڵەکان</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">مانگ:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="هەموو مانگەکان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-months">هەموو مانگەکان</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {month} - {getMonthName(month)?.split(' ')[1] || month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DownloadButton 
              data={filteredData}
              filename="building-expenses-records"
              className="bg-green-600 hover:bg-green-700 text-white"
            />
            <PrintButton 
              data={filteredData}
              filename="building-expenses-records"
              title="Building Expenses"
              titleKu="مەسروفی بینا"
              columns={[
                { key: 'item', header: 'مەبەست و پێداویستی' },
                { key: 'cost', header: 'تێچوون', render: (value) => parseFloat(value).toLocaleString() + ' د.ع' },
                { key: 'year', header: 'ساڵ' },
                { key: 'month', header: 'مانگ' },
                { key: 'notes', header: 'تێبینی' }
              ]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  زیادکردنی مەسروفی بینا
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Building Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Item / مەبەست و پێداویستی</Label>
                  <Input
                    id="item"
                    value={newEntry.item}
                    onChange={(e) => setNewEntry({...newEntry, item: e.target.value})}
                    placeholder="Enter building expense item"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Cost / تێچوون</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newEntry.cost}
                    onChange={(e) => setNewEntry({...newEntry, cost: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year / ساڵ</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newEntry.year}
                    onChange={(e) => setNewEntry({...newEntry, year: e.target.value})}
                    placeholder={new Date().getFullYear().toString()}
                  />
                </div>

                <div>
                  <Label htmlFor="month">Month / مانگ</Label>
                  <Input
                    id="month"
                    type="number"
                    min="1"
                    max="12"
                    value={newEntry.month}
                    onChange={(e) => setNewEntry({...newEntry, month: parseInt(e.target.value) || 1})}
                    placeholder="1-12"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes / تێبینی</Label>
                  <Input
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Record'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      </div>

      {/* Building Expenses Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <ExpensesCardView data={filteredData} />
        ) : (
          <ExpensesTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ مەسروفی بیناێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ مەسروفی بیناێک زیاد نەکراوە'}
            </p>
          </CardContent>
        </Card>
      )}

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
        title="Edit Building Expense"
        titleKu="دەستکاریکردنی مەسروفی بینا"
      />
    </PageLayout>
  )
}