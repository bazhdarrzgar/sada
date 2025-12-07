'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Building, Languages, RefreshCw } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'
import { ImageUpload } from '@/components/ui/image-upload'
import ImageCarousel from '@/components/ui/image-carousel'

export default function BuildingExpensesPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()
  
  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Check for existing authentication on mount
  useEffect(() => {
    const buildingExpensesAuth = localStorage.getItem('building_expenses_auth')
    if (buildingExpensesAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])
  
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
  const [editingRow, setEditingRow] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [newEntry, setNewEntry] = useState({
    item: '',
    cost: 0,
    year: new Date().getFullYear().toString(),
    month: 1,
    notes: '',
    images: []
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Ensure smooth scroll behavior on page load
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

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
    // Prevent multiple submissions
    if (isSaving) {
      console.log('Save already in progress, ignoring duplicate click')
      return
    }
    
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
        
        // Update local state with the saved data - instant update without reload
        setExpensesData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            // Update existing entry in place (keep position)
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
        
        // Add a small delay before resetting isSaving to prevent rapid double-clicks
        setTimeout(() => {
          setIsSaving(false)
        }, 500)
      } else {
        console.error('Failed to save entry:', response.statusText)
        alert('Failed to save entry. Please try again.')
        setIsSaving(false)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry. Please check your connection and try again.')
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    // Prevent multiple deletions
    if (isDeleting) {
      console.log('Delete already in progress, ignoring duplicate click')
      return
    }
    
    setIsDeleting(true)
    try {
      if (id.startsWith('building-')) {
        // Remove from local state only if it's a temporary entry
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        setIsDeleting(false)
        return
      }

      const response = await fetch(`/api/building-expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        // Refresh the page after successful deletion - EXACTLY like kitchen expenses
        window.location.reload()
      } else {
        console.error('Failed to delete entry:', response.statusText)
        // Show error to user (you can add toast notification here)
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      // Show error to user (you can add toast notification here)
      setIsDeleting(false)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      item: '',
      cost: 0,
      year: new Date().getFullYear().toString(),
      month: 1,
      notes: '',
      images: []
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...expensesData]
    updatedData[rowIndex][field] = value
    setExpensesData(updatedData)
  }

  const startInlineEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    // Prevent multiple submissions
    if (isSaving) {
      console.log('Save already in progress, ignoring duplicate click')
      return
    }
    
    const entry = expensesData[rowIndex]
    saveEntry(entry)
    setEditingRow(null)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // No need to refresh - just cancel editing
  }

  const scrollToCenter = () => {
    const viewport = window.innerHeight
    const centerPosition = document.documentElement.scrollHeight / 2 - viewport / 2
    
    window.scrollTo({
      top: Math.max(0, centerPosition),
      behavior: 'smooth'
    })
  }

  const startEditing = (index) => {
    // First scroll to center quickly, then open modal
    scrollToCenter()
    
    // Small delay to allow smooth scroll to start before opening modal
    setTimeout(() => {
      const entry = expensesData[index]
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 200)
  }

  const handleModalSave = async (editedData) => {
    // Prevent multiple submissions
    if (isSaving) {
      console.log('Save already in progress from modal, ignoring duplicate click')
      return
    }
    
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
    // No page reload - state update handles UI refresh instantly
  }

  // Enhanced translation function with visual feedback
  const handleTranslateInterface = () => {
    setIsTranslating(true)
    
    // Add visual feedback
    setTimeout(() => {
      toggleLanguage()
      setIsTranslating(false)
      
      // Show brief success feedback
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0'
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="text-sm font-medium">
            ${language === 'kurdish' ? 'Language switched to English!' : 'زمان گۆڕدرا بۆ کوردی!'}
          </span>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => document.body.removeChild(notification), 300)
      }, 2000)
    }, 300)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'item',
      label: t('buildingExpenses.fields.item', language),
      labelKu: t('buildingExpenses.fields.item', 'kurdish'),
      type: 'text',
      placeholder: 'Enter building expense item'
    },
    {
      key: 'cost',
      label: t('buildingExpenses.fields.cost', language),
      labelKu: t('buildingExpenses.fields.cost', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'year',
      label: t('buildingExpenses.fields.year', language),
      labelKu: t('buildingExpenses.fields.year', 'kurdish'),
      type: 'number',
      placeholder: new Date().getFullYear().toString()
    },
    {
      key: 'month',
      label: t('buildingExpenses.fields.month', language),
      labelKu: t('buildingExpenses.fields.month', 'kurdish'),
      type: 'number',
      placeholder: '1-12'
    },
    {
      key: 'notes',
      label: t('buildingExpenses.fields.notes', language),
      labelKu: t('buildingExpenses.fields.notes', 'kurdish'),
      type: 'text',
      placeholder: 'تێبینی...'
    },
    {
      key: 'images',
      label: 'وەسڵ (Images)',
      labelKu: 'وەسڵ',
      type: 'image-upload',
      maxImages: 6
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
                  <span className="font-semibold">{t('buildingExpenses.fields.year', language)}:</span> 
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                    {entry.year || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">{t('buildingExpenses.fields.month', language)}:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                    {entry.month || 'N/A'}
                  </span>
                </div>
              </div>
              {entry.notes && (
                <div className="text-sm">
                  <span className="font-semibold">{t('buildingExpenses.fields.notes', language)}:</span> 
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {entry.notes}
                  </span>
                </div>
              )}
              {entry.images && entry.images.length > 0 && (
                <div className="text-sm">
                  <span className="font-semibold">وەسڵ:</span>
                  <div className="ml-2 mt-2">
                    <ImageCarousel images={entry.images} scrollToCenter={true} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => startEditing(idx)} 
                  disabled={isSaving || isDeleting}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteEntry(entry.id)} 
                  disabled={isSaving || isDeleting}
                  className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
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
        header: t('buildingExpenses.fields.item', language),
        align: 'center',
        editable: true,
        truncate: 30,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'cost',
        header: t('buildingExpenses.fields.cost', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'year',
        header: t('buildingExpenses.fields.year', language),
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
        header: t('buildingExpenses.fields.month', language),
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
        header: t('buildingExpenses.fields.notes', language),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-gray-600 dark:text-gray-400">{value || '-'}</span>
      },
      {
        key: 'images',
        header: 'وەسڵ',
        align: 'center',
        editable: false,
        render: (value, row) => {
          if (!value || value.length === 0) {
            return <span className="text-gray-400 text-xs">-</span>
          }
          return (
            <ImageCarousel 
              images={value}
              scrollToCenter={true}
            />
          )
        }
      }
    ]

    return (
      <>
        <EnhancedTable
          key={tableKey}
          data={data}
          columns={columns}
          editingRow={editingRow}
          onEdit={startEditing}
          onSave={saveRowEdit}
          onCancel={cancelEdit}
          onDelete={deleteEntry}
          onCellEdit={handleCellEdit}
          maxRowsPerPage={10}
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
                  {t('buildingExpenses.summary.totalBuildingExpenses', language)} / {t('buildingExpenses.summary.totalBuildingExpenses', 'kurdish')}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  {t('buildingExpenses.summary.controlledBy', language)}
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalBuildingExpenses.toLocaleString()} د.ع
                </div>
              </div>

              {/* Summary Note - Filter controls moved to top */}
              <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Summary for Displayed Data / کۆی گشتی بۆ داتای پیشاندراو
                  </p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    ({filteredData.length} items displayed)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  // Handle authentication
  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (authUsername === 'berdoz' && authPassword === 'berdoz@private') {
      setIsAuthenticated(true)
      // Save authentication to localStorage
      localStorage.setItem('building_expenses_auth', 'true')
      setAuthUsername('')
      setAuthPassword('')
    } else {
      setAuthError('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە / Username or password is incorrect')
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title={t('buildingExpenses.title', language)} titleKu={t('buildingExpenses.title', 'kurdish')}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">مەسروفی بینا</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">تکایە ناوی بەکارهێنەر و وشەی تێپەڕ بنووسە</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">ناوی بەکارهێنەر / Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="Enter username"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">وشەی تێپەڕ / Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password"
                    className="mt-1"
                    required
                  />
                </div>
                
                {authError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                    {authError}
                  </div>
                )}
                
                <Button type="submit" className="w-full">
                  چوونەژوورەوە / Sign In
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  if (loading) {
    return (
      <PageLayout title={t('buildingExpenses.title', language)} titleKu={t('buildingExpenses.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('buildingExpenses.title', language)} titleKu={t('buildingExpenses.title', 'kurdish')}>
      {/* Total Building Expenses Filter - Moved to Top */}
      <Card className="mb-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="font-semibold text-red-700 dark:text-red-300">
                  {t('buildingExpenses.summary.totalBuildingExpenses', language)} Filter / 
                  {t('buildingExpenses.summary.totalBuildingExpenses', 'kurdish')} فلتەر:
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">{t('buildingExpenses.fields.year', language)}:</Label>
                <Select value={summaryYear} onValueChange={setSummaryYear}>
                  <SelectTrigger className="w-32 border-red-300 focus:ring-red-500">
                    <SelectValue placeholder={t('buildingExpenses.summary.allYears', 'kurdish')} />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                    <SelectItem value="all-years">{t('buildingExpenses.summary.allYears', language)} / {t('buildingExpenses.summary.allYears', 'kurdish')}</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">{t('buildingExpenses.fields.month', language)}:</Label>
                <Select value={summaryMonth} onValueChange={setSummaryMonth}>
                  <SelectTrigger className="w-40 border-red-300 focus:ring-red-500">
                    <SelectValue placeholder={t('buildingExpenses.summary.allMonths', 'kurdish')} />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                    <SelectItem value="all-months">{t('buildingExpenses.summary.allMonths', language)} / {t('buildingExpenses.summary.allMonths', 'kurdish')}</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {month} - {getMonthName(month)?.split(' ')[1] || month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t('buildingExpenses.summary.totalBuildingExpenses', language)}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summaryExpenses.toLocaleString()} د.ع
              </p>
              <p className="text-xs text-red-500">
                {(summaryYear && summaryYear !== "all-years") || (summaryMonth && summaryMonth !== "all-months") 
                  ? `Filtered: ${summaryYear !== "all-years" ? summaryYear : 'All Years'} - ${summaryMonth !== "all-months" ? getMonthName(summaryMonth)?.split(' ')[1] || summaryMonth : 'All Months'}`
                  : 'All Time Total'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Add Controls */}
      <div className="space-y-4">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('buildingExpenses.searchPlaceholder', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Year and Month Filters - Controls both table AND total */}
          <div className="flex items-center gap-3 border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-blue-50/50 dark:bg-blue-900/20">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
              {t('buildingExpenses.summary.tableFilter', language)}
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t('buildingExpenses.fields.year', language)}:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('buildingExpenses.summary.allYears', 'kurdish')} />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5}>
                  <SelectItem value="all-years">{t('buildingExpenses.summary.allYears', language)}</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t('buildingExpenses.fields.month', language)}:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('buildingExpenses.summary.allMonths', 'kurdish')} />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5}>
                  <SelectItem value="all-months">{t('buildingExpenses.summary.allMonths', language)}</SelectItem>
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
              title={t('buildingExpenses.title', language)}
              titleKu={t('buildingExpenses.title', 'kurdish')}
              columns={[
                { key: 'item', header: t('buildingExpenses.fields.item', 'kurdish') },
                { key: 'cost', header: t('buildingExpenses.fields.cost', 'kurdish'), render: (value) => parseFloat(value).toLocaleString() + ' د.ع' },
                { key: 'year', header: t('buildingExpenses.fields.year', 'kurdish') },
                { key: 'month', header: t('buildingExpenses.fields.month', 'kurdish') },
                { key: 'notes', header: t('buildingExpenses.fields.notes', 'kurdish') },
                { key: 'images', header: 'وەسڵ', render: (value) => value && value.length > 0 ? `${value.length} وێنە` : '-' }
              ]}
              showTotal={true}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // First scroll to center quickly, then open modal
                    scrollToCenter()
                    setTimeout(() => {
                      setIsAddDialogOpen(true)
                    }, 200)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  {t('buildingExpenses.addButton', language)}
                </Button>
              </DialogTrigger>
            <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-5xl max-h-[95vh] overflow-y-auto z-[100] w-[95vw] sm:w-[85vw]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {t('buildingExpenses.addTitle', language)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item" className="text-sm font-medium mb-2 block">{t('buildingExpenses.fields.item', language)}</Label>
                    <Input
                      id="item"
                      value={newEntry.item}
                      onChange={(e) => setNewEntry({...newEntry, item: e.target.value})}
                      placeholder="Enter building expense item"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost" className="text-sm font-medium mb-2 block">{t('buildingExpenses.fields.cost', language)}</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newEntry.cost}
                      onChange={(e) => setNewEntry({...newEntry, cost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="year" className="text-sm font-medium mb-2 block">{t('buildingExpenses.fields.year', language)}</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newEntry.year}
                      onChange={(e) => setNewEntry({...newEntry, year: e.target.value})}
                      placeholder={new Date().getFullYear().toString()}
                    />
                  </div>

                  <div>
                    <Label htmlFor="month" className="text-sm font-medium mb-2 block">{t('buildingExpenses.fields.month', language)}</Label>
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

                  <div className="md:col-span-2">
                    <Label htmlFor="notes" className="text-sm font-medium mb-2 block">{t('buildingExpenses.fields.notes', language)}</Label>
                    <Input
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      placeholder="تێبینی..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="images" className="text-sm font-medium mb-2 block">وەسڵ (Images)</Label>
                    <div className="min-h-[200px]">
                      <ImageUpload
                        images={newEntry.images}
                        onImagesChange={(images) => setNewEntry({...newEntry, images})}
                        maxImages={6}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {language === 'english' ? 'Upload up to 6 images (max 5MB each)' : 'تا ٦ وێنە باربکە (هەر یەکێک زۆرترین ٥ مێگابایت)'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900 z-10">
                  <Button 
                    variant="outline" 
                    onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} 
                    className={`px-6 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
                    disabled={isSaving}
                  >
                    {t('buildingExpenses.buttons.cancel', language)}
                  </Button>
                  <Button 
                    onClick={() => saveEntry(newEntry)} 
                    disabled={isSaving} 
                    className={`px-6 bg-blue-600 hover:bg-blue-700 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    {isSaving ? 'پاشەکەوتکردن... / Saving...' : t('buildingExpenses.buttons.save', language)}
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
            <h3 className="text-lg font-semibold mb-2">{t('buildingExpenses.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('buildingExpenses.noData.message', language) : t('buildingExpenses.noData.emptyMessage', language)}
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
        title={t('buildingExpenses.buttons.edit', language)}
        titleKu={t('buildingExpenses.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />
      
      {/* Bottom spacing for smooth filter dropdown opening */}
      <div className="h-64"></div>
      
      {/* CSS to prevent dropdown scroll issues */}
      <style jsx>{`
        /* Ensure dropdowns don't cause page jumping */
        [data-radix-select-content] {
          position: fixed !important;
          z-index: 9999 !important;
        }
        
        /* Prevent body scroll when dropdown is open */
        body:has([data-radix-select-content][data-state="open"]) {
          overflow: auto !important;
        }
      `}</style>
    </PageLayout>
  )
}