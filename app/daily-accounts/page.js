'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Save, X, Calculator, Image as ImageIcon, Download, Calendar, Filter } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import ImageUpload from '@/components/ui/image-upload'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'
import { format, startOfWeek, addDays, isSameWeek, getDay, parseISO, getMonth, getYear } from 'date-fns'

export default function DailyAccountsPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()
  const [dailyAccountsData, setDailyAccountsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  
  // Filter states
  const [totalsFilter, setTotalsFilter] = useState({ year: '', month: '' })
  const [mainFilter, setMainFilter] = useState({ year: '', month: '' })
  
  const [newEntry, setNewEntry] = useState({
    number: 1,
    week: '',
    dayOfWeek: '',
    purpose: '',
    checkNumber: '',
    amount: 0,
    date: '',
    receiptImages: [],
    notes: ''
  })
  const [selectedWeekStart, setSelectedWeekStart] = useState(new Date())

  // Kurdish day and month names
  const kurdishDayNames = {
    0: 'یەکشەممە', // Sunday
    1: 'دووشەممە', // Monday
    2: 'سێشەممە', // Tuesday
    3: 'چوارشەممە', // Wednesday
    4: 'پێنجشەممە', // Thursday
    5: 'هەینی', // Friday
    6: 'شەممە'  // Saturday
  }

  const kurdishMonthNames = {
    0: 'کانوونی دووەم',
    1: 'شوبات',
    2: 'ئازار',
    3: 'نیسان',
    4: 'ئایار',
    5: 'حەزیران',
    6: 'تەمموز',
    7: 'ئاب',
    8: 'ئەیلوول',
    9: 'تشرینی یەکەم',
    10: 'تشرینی دووەم',
    11: 'کانوونی یەکەم'
  }

  // Get day of week from date
  const getDayOfWeek = (dateString) => {
    if (!dateString) return ''
    try {
      const date = parseISO(dateString)
      const dayNum = getDay(date)
      return kurdishDayNames[dayNum] || ''
    } catch (error) {
      return ''
    }
  }

  // Get month and year from date
  const getMonthFromDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = parseISO(dateString)
      const monthNum = getMonth(date)
      return kurdishMonthNames[monthNum] || ''
    } catch (error) {
      return ''
    }
  }

  const getYearFromDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = parseISO(dateString)
      return getYear(date).toString()
    } catch (error) {
      return ''
    }
  }

  // Get unique years and months from data
  const availableYears = useMemo(() => {
    const years = [...new Set(dailyAccountsData
      .filter(item => item.date)
      .map(item => getYearFromDate(item.date))
      .filter(year => year))]
    return years.sort((a, b) => b.localeCompare(a))
  }, [dailyAccountsData])

  const availableMonths = useMemo(() => {
    const months = [...new Set(dailyAccountsData
      .filter(item => item.date)
      .map(item => getMonthFromDate(item.date))
      .filter(month => month))]
    return months
  }, [dailyAccountsData])

  // Get current week data with totals (filtered by totals filter)
  const getCurrentWeekData = useMemo(() => {
    const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 0 }) // Sunday start

    // Apply totals filter first
    let filteredForTotals = dailyAccountsData
    if (totalsFilter.year || totalsFilter.month) {
      filteredForTotals = dailyAccountsData.filter(entry => {
        if (!entry.date) return false
        const entryYear = getYearFromDate(entry.date)
        const entryMonth = getMonthFromDate(entry.date)
        
        if (totalsFilter.year && entryYear !== totalsFilter.year) return false
        if (totalsFilter.month && entryMonth !== totalsFilter.month) return false
        return true
      })
    }

    // Filter data for current week
    const currentWeekData = filteredForTotals.filter(entry => {
      if (!entry.date) return false
      try {
        const entryDate = parseISO(entry.date)
        return isSameWeek(entryDate, weekStart, { weekStartsOn: 0 })
      } catch (error) {
        return false
      }
    })

    // Calculate daily totals
    const dailyTotals = {}
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(weekStart, i)
      const dayName = kurdishDayNames[i]
      const dayData = currentWeekData.filter(entry => {
        if (!entry.date) return false
        try {
          const entryDate = parseISO(entry.date)
          return format(entryDate, 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd')
        } catch (error) {
          return false
        }
      })
      
      dailyTotals[dayName] = {
        count: dayData.length,
        total: dayData.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0),
        date: format(dayDate, 'yyyy-MM-dd')
      }
    }

    const weekTotal = currentWeekData.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)

    return {
      data: currentWeekData,
      dailyTotals,
      weekTotal,
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(addDays(weekStart, 6), 'yyyy-MM-dd'),
      totalFilteredAmount: filteredForTotals.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)
    }
  }, [dailyAccountsData, selectedWeekStart, kurdishDayNames, totalsFilter])

  // Initialize Fuse.js with comprehensive search options across ALL columns including Day of Week
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'number', weight: 0.15 }, // Entry number
        { name: 'week', weight: 0.2 }, // Week information
        { name: 'purpose', weight: 0.4 }, // Purpose - highest weight as most descriptive
        { name: 'date', weight: 0.25 }, // Date field with enhanced weight
        { name: 'checkNumber', weight: 0.25 }, // Check number
        { name: 'amount', weight: 0.2 }, // Amount field
        { name: 'notes', weight: 0.25 }, // Notes field
        { name: 'dayOfWeek', weight: 0.3 }, // Day of week field
        // Enhanced search patterns for better matching across all data
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          const dayOfWeek = getDayOfWeek(obj.date)
          const month = getMonthFromDate(obj.date)
          const year = getYearFromDate(obj.date)
          return [
            obj.number ? obj.number.toString() : '',
            obj.week || '',
            obj.purpose || '',
            obj.date || '',
            obj.checkNumber || '',
            obj.amount ? obj.amount.toString() : '',
            obj.notes || '',
            dayOfWeek || '',
            month || '',
            year || '',
            // Add formatted date versions for better date searching
            obj.date ? new Date(obj.date).toLocaleDateString('ku') : '',
            obj.date ? new Date(obj.date).toLocaleDateString('en') : '',
            // Add formatted amount with currency
            obj.amount ? `${obj.amount} د.ع` : '',
            obj.amount ? `${obj.amount} IQD` : '',
            // Add week variations
            obj.week ? `هەفتەی ${obj.week}` : '',
            obj.week ? `week ${obj.week}` : ''
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
    return new Fuse(dailyAccountsData, options)
  }, [dailyAccountsData, getDayOfWeek, getMonthFromDate, getYearFromDate])

  // Fetch daily accounts data from API
  useEffect(() => {
    fetchDailyAccountsData()
  }, [])

  const fetchDailyAccountsData = async () => {
    try {
      const response = await fetch('/api/daily-accounts')
      if (response.ok) {
        const data = await response.json()
        setDailyAccountsData(data)
        // Update newEntry number based on existing data
        setNewEntry(prev => ({
          ...prev,
          number: data.length + 1
        }))
      }
    } catch (error) {
      console.error('Error fetching daily accounts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('daily-')) {
        // Update existing entry
        response = await fetch(`/api/daily-accounts/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('daily-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/daily-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      }

      if (response.ok) {
        const savedEntry = await response.json()
        
        // Update local state with the saved data - new/edited entries go to top
        setDailyAccountsData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            // For updates, move the edited entry to the top
            const newData = [...prevData]
            newData.splice(existingIndex, 1) // Remove from current position
            return [savedEntry, ...newData] // Add to top
          } else {
            // For new entries, add to the top
            return [savedEntry, ...prevData]
          }
        })

        setIsAddDialogOpen(false)
        resetNewEntry()
      } else {
        console.error('Failed to save entry:', response.statusText)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('daily-')) {
        // Remove from local state only if it's a temporary entry
        setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/daily-accounts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      number: dailyAccountsData.length + 1,
      week: '',
      dayOfWeek: '',
      purpose: '',
      checkNumber: '',
      amount: 0,
      date: '',
      receiptImages: [],
      notes: ''
    })
  }

  const startEditing = (index) => {
    const entry = dailyAccountsData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
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
      key: 'number',
      label: 'Number',
      labelKu: 'ژمارە',
      type: 'number',
      placeholder: '1'
    },
    {
      key: 'week',
      label: 'Week',
      labelKu: 'هەفتە',
      type: 'text',
      placeholder: 'W/1, W/2, etc.'
    },
    {
      key: 'purpose',
      label: 'Purpose',
      labelKu: 'مەبەست',
      type: 'textarea',
      placeholder: 'Enter purpose in Kurdish',
      rows: 3,
      span: 'full'
    },
    {
      key: 'date',
      label: 'Date',
      labelKu: 'بەروار',
      type: 'date'
    },
    {
      key: 'checkNumber',
      label: 'Check Number',
      labelKu: 'ژمارە پسووڵە',
      type: 'text',
      placeholder: 'C001, C002, etc.'
    },
    {
      key: 'amount',
      label: 'Amount',
      labelKu: 'بڕی پارە',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'notes',
      label: 'Notes',
      labelKu: 'تێبینی',
      type: 'textarea',
      placeholder: 'تێبینی زیادکردن...',
      rows: 3,
      span: 'full'
    },
    {
      key: 'receiptImages',
      label: 'Receipt Images',
      labelKu: 'وێنەی پسووڵە',
      type: 'image-upload',
      span: 'full'
    }
  ]

  // Apply main filter and search
  const filteredData = useMemo(() => {
    let filtered = dailyAccountsData

    // Apply main filter (year/month)
    if (mainFilter.year || mainFilter.month) {
      filtered = filtered.filter(entry => {
        if (!entry.date) return false
        const entryYear = getYearFromDate(entry.date)
        const entryMonth = getMonthFromDate(entry.date)
        
        if (mainFilter.year && entryYear !== mainFilter.year) return false
        if (mainFilter.month && entryMonth !== mainFilter.month) return false
        return true
      })
    }

    // Apply search
    if (!searchTerm.trim()) {
      return filtered
    }

    const fuseForFiltered = new Fuse(filtered, {
      keys: [
        { name: 'number', weight: 0.15 },
        { name: 'week', weight: 0.2 },
        { name: 'purpose', weight: 0.4 },
        { name: 'date', weight: 0.25 },
        { name: 'checkNumber', weight: 0.25 },
        { name: 'amount', weight: 0.2 },
        { name: 'notes', weight: 0.25 },
        { name: 'dayOfWeek', weight: 0.3 },
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          const dayOfWeek = getDayOfWeek(obj.date)
          const month = getMonthFromDate(obj.date)
          const year = getYearFromDate(obj.date)
          return [
            obj.number ? obj.number.toString() : '',
            obj.week || '', obj.purpose || '', obj.date || '',
            obj.checkNumber || '', obj.amount ? obj.amount.toString() : '',
            obj.notes || '', dayOfWeek || '', month || '', year || ''
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

    const results = fuseForFiltered.search(searchTerm)
    return results.map(result => result.item)
  }, [dailyAccountsData, mainFilter, searchTerm, getDayOfWeek, getMonthFromDate, getYearFromDate])

  // Calculate total amount for filtered data
  const totalAmount = filteredData.reduce((sum, entry) => sum + (entry.amount || 0), 0)

  function DailyAccountsCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.purpose}</div>
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">{entry.amount.toLocaleString()} د.ع</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">ژمارە:</span> {entry.number}</div>
                <div><span className="font-semibold">هەفتە:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                    {entry.week}
                  </span>
                </div>
                <div><span className="font-semibold">ڕۆژ:</span> 
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                    {getDayOfWeek(entry.date) || 'نەناسراو'}
                  </span>
                </div>
                <div><span className="font-semibold">مانگ:</span> 
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs font-medium">
                    {getMonthFromDate(entry.date) || 'نەناسراو'}
                  </span>
                </div>
                <div><span className="font-semibold">ساڵ:</span> 
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded text-xs font-medium">
                    {getYearFromDate(entry.date) || 'نەناسراو'}
                  </span>
                </div>
                <div><span className="font-semibold">بەروار:</span> 
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                    {entry.date}
                  </span>
                </div>
                <div className="col-span-2"><span className="font-semibold">ژمارە پسووڵە:</span> 
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded text-xs font-mono">
                    {entry.checkNumber}
                  </span>
                </div>
              </div>
              
              {/* Notes section */}
              {entry.notes && (
                <div className="border-t pt-2">
                  <div className="text-sm">
                    <span className="font-semibold">تێبینی:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">{entry.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Receipt Images */}
              {entry.receiptImages && entry.receiptImages.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-sm">وێنەی پسووڵە:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {entry.receiptImages.slice(0, 3).map((image, idx) => (
                      <img
                        key={idx}
                        src={image.url}
                        alt={`Receipt ${idx + 1}`}
                        className="w-12 h-12 rounded object-cover cursor-pointer hover:scale-110 transition-transform border-2 border-gray-200"
                        onClick={() => setPreviewImage(image)}
                      />
                    ))}
                    {entry.receiptImages.length > 3 && (
                      <div className="flex items-center justify-center w-12 h-12 rounded bg-gray-100 border-2 border-gray-200 text-xs font-medium text-gray-600">
                        +{entry.receiptImages.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-colors duration-200">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)} className="hover:bg-red-50 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 transition-colors duration-200">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  function DailyAccountsTableView({ data }) {
    // Define table columns for daily accounts
    const columns = [
      {
        key: 'number',
        header: t('dashboard.modules.dailyAccounts.fields.number', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'week',
        header: t('dashboard.modules.dailyAccounts.fields.week', language),
        align: 'center',
        editable: true,
        render: (value) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'dayOfWeek',
        header: t('dashboard.modules.dailyAccounts.fields.dayOfWeek', language),
        align: 'center',
        editable: false,
        render: (value, row) => (
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
            {getDayOfWeek(row.date) || 'نەناسراو'}
          </span>
        )
      },
      {
        key: 'month',
        header: t('dashboard.modules.dailyAccounts.fields.month', language),
        align: 'center',
        editable: false,
        render: (value, row) => (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs font-medium">
            {getMonthFromDate(row.date) || 'نەناسراو'}
          </span>
        )
      },
      {
        key: 'year',
        header: t('dashboard.modules.dailyAccounts.fields.year', language),
        align: 'center',
        editable: false,
        render: (value, row) => (
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded text-xs font-medium">
            {getYearFromDate(row.date) || 'نەناسراو'}
          </span>
        )
      },
      {
        key: 'purpose',
        header: t('dashboard.modules.dailyAccounts.fields.purpose', language),
        align: 'right',
        editable: true,
        truncate: 40,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'date',
        header: t('dashboard.modules.dailyAccounts.fields.date', language),
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'checkNumber',
        header: t('dashboard.modules.dailyAccounts.fields.checkNumber', language),
        align: 'center',
        editable: true,
        render: (value) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded text-xs font-mono">
            {value}
          </span>
        )
      },
      {
        key: 'amount',
        header: t('dashboard.modules.dailyAccounts.fields.amount', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'notes',
        header: t('dashboard.modules.dailyAccounts.fields.notes', language),
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value || 'هیچ تێبینیەک نییە'}
          </span>
        )
      },
      {
        key: 'receiptImages',
        header: t('dashboard.modules.dailyAccounts.fields.receiptImages', language),
        align: 'center',
        editable: false,
        render: (value, row, rowIndex) => (
          <div className="flex items-center justify-center">
            {value && value.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {value.slice(0, 3).map((image, idx) => (
                    <img
                      key={idx}
                      src={image.url}
                      alt={`Receipt ${idx + 1}`}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setPreviewImage(image)}
                    />
                  ))}
                  {value.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium text-gray-600">
                      +{value.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {value.length} image{value.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">No images</span>
              </div>
            )}
          </div>
        )
      }
    ]

    return (
      <>
        <EnhancedTable
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
        
        {/* Totals Filter - Moved Above Week Section */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-600">
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">فیلتەری کۆکارییەکان / Totals Filter:</span>
              </div>
              <div className="flex gap-3 flex-1">
                <Select value={totalsFilter.year || 'all'} onValueChange={(value) => setTotalsFilter(prev => ({ ...prev, year: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="هەڵبژاردنی ساڵ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">هەموو ساڵەکان</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={totalsFilter.month || 'all'} onValueChange={(value) => setTotalsFilter(prev => ({ ...prev, month: value === 'all' ? '' : value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="هەڵبژاردنی مانگ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">هەموو مانگەکان</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setTotalsFilter({ year: '', month: '' })}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  پاككردنەوە
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week Navigation and Summary */}
        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-600">
          <CardContent className="p-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedWeekStart(addDays(selectedWeekStart, -7))}
                className="flex items-center gap-2"
              >
                ← هەفتەی پێشوو
              </Button>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  هەفتەی {format(selectedWeekStart, 'yyyy-MM-dd')} لە {format(addDays(selectedWeekStart, 6), 'yyyy-MM-dd')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  کۆی گشتی: {getCurrentWeekData.weekTotal.toLocaleString()} د.ع
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setSelectedWeekStart(addDays(selectedWeekStart, 7))}
                className="flex items-center gap-2"
              >
                هەفتەی داهاتوو →
              </Button>
            </div>

            {/* Daily Totals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(getCurrentWeekData.dailyTotals).map(([dayName, dayData]) => (
                <Card key={dayName} className="p-4 bg-white dark:bg-gray-800 border-2 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200">
                  <div className="text-center space-y-2">
                    <h4 className="font-bold text-sm text-blue-700 dark:text-blue-300">{dayName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{dayData.date}</p>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {dayData.total.toLocaleString()} د.ع
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {dayData.count} تۆمار
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Week Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg border-2 border-green-200 dark:border-green-600">
              <div className="text-center">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  کۆی هەفتانە
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {getCurrentWeekData.weekTotal.toLocaleString()} د.ع
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">کۆی پارە</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {getCurrentWeekData.data.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">کۆی تۆمار</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Total */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Amount (All Data) / کۆی گشتی (هەموو زانیاریەکان)</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getCurrentWeekData.totalFilteredAmount.toLocaleString()} د.ع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('dashboard.modules.dailyAccounts.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">


          <DownloadButton 
            data={filteredData}
            filename="daily-accounts-records"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <PrintButton 
            data={filteredData}
            filename="daily-accounts-records"
            title="Daily Accounts"
            titleKu="حساباتی رۆژانه"
            columns={[
              { key: 'number', header: 'ژمارە' },
              { key: 'week', header: 'هەفتە' },
              { key: 'dayOfWeek', header: 'ڕۆژ', render: (value, row) => getDayOfWeek(row.date) || 'نەناسراو' },
              { key: 'month', header: 'مانگ', render: (value, row) => getMonthFromDate(row.date) || 'نەناسراو' },
              { key: 'year', header: 'ساڵ', render: (value, row) => getYearFromDate(row.date) || 'نەناسراو' },
              { key: 'purpose', header: 'مەبەست' },
              { key: 'date', header: 'بەروار' },
              { key: 'checkNumber', header: 'ژمارە پسووڵە' },
              { key: 'amount', header: 'بڕی پارە', render: (value) => value.toLocaleString() + ' د.ع' },
              { key: 'notes', header: 'تێبینی' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی حساب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Daily Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number">Number / ژمارە</Label>
                    <Input
                      id="number"
                      type="number"
                      value={newEntry.number}
                      onChange={(e) => setNewEntry({...newEntry, number: parseInt(e.target.value) || 0})}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="week">Week / هەفتە</Label>
                    <Input
                      id="week"
                      value={newEntry.week}
                      onChange={(e) => setNewEntry({...newEntry, week: e.target.value})}
                      placeholder="W/1, W/2, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose / مەبەست</Label>
                  <Input
                    id="purpose"
                    value={newEntry.purpose}
                    onChange={(e) => setNewEntry({...newEntry, purpose: e.target.value})}
                    placeholder="Enter purpose in Kurdish"
                  />
                </div>

                <div>
                  <Label htmlFor="date">بەروار</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => {
                      const newDate = e.target.value
                      setNewEntry({
                        ...newEntry, 
                        date: newDate,
                        dayOfWeek: getDayOfWeek(newDate)
                      })
                    }}
                  />
                  {newEntry.date && (
                    <div className="mt-1 text-sm space-y-1">
                      <p className="text-green-600 dark:text-green-400">
                        ڕۆژ: {getDayOfWeek(newEntry.date)}
                      </p>
                      <p className="text-orange-600 dark:text-orange-400">
                        مانگ: {getMonthFromDate(newEntry.date)}
                      </p>
                      <p className="text-indigo-600 dark:text-indigo-400">
                        ساڵ: {getYearFromDate(newEntry.date)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="checkNumber">Check Number / ژمارە پسووڵە</Label>
                  <Input
                    id="checkNumber"
                    value={newEntry.checkNumber}
                    onChange={(e) => setNewEntry({...newEntry, checkNumber: e.target.value})}
                    placeholder="C001, C002, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount / بڕی پارە</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">تێبینی / Notes</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی زیادکردن..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>وێنەی پسووڵە / Receipt Images</Label>
                  <ImageUpload
                    images={newEntry.receiptImages}
                    onImagesChange={(images) => setNewEntry({...newEntry, receiptImages: images})}
                    maxImages={6}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    Save Record
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Filter - Moved Below Search */}
      <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-600">
        <CardContent className="p-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-800 dark:text-blue-300">فیلتەری سەرەکی / Main Filter:</span>
            </div>
            <div className="flex gap-3 flex-1">
              <Select value={mainFilter.year || 'all'} onValueChange={(value) => setMainFilter(prev => ({ ...prev, year: value === 'all' ? '' : value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="هەڵبژاردنی ساڵ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">هەموو ساڵەکان</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mainFilter.month || 'all'} onValueChange={(value) => setMainFilter(prev => ({ ...prev, month: value === 'all' ? '' : value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="هەڵبژاردنی مانگ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">هەموو مانگەکان</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setMainFilter({ year: '', month: '' })}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                پاككردنەوە
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mt-4">
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-800 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                دەرئەنجام: {filteredData.length} تۆمار لە کۆی {dailyAccountsData.length} تۆمار
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                کۆی فیلتەرکراو: {totalAmount.toLocaleString()} د.ع
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Accounts Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <DailyAccountsCardView data={filteredData} />
        ) : (
          <DailyAccountsTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ حسابێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || mainFilter.year || mainFilter.month ? 'هیچ ئەنجامێک بۆ گەڕانەکەت یا فیلتەرەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ حسابێک زیاد نەکراوە'}
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
        title="Edit Daily Account"
        titleKu="دەستکاریکردنی حساباتی رۆژانه"
      />

      {/* Optimized Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.originalName || 'Receipt Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              {/* Full size image with optimized viewing */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'Receipt Preview'}
                  className="w-full max-h-[75vh] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              
              {/* Image details and actions */}
              <div className="flex justify-between items-center text-sm text-gray-300 bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <strong>Size:</strong> 
                    {previewImage.size ? (previewImage.size / 1024).toFixed(1) + ' KB' : 'Unknown'}
                  </span>
                  <span className="flex items-center gap-2">
                    <strong>Name:</strong> 
                    {previewImage.originalName || previewImage.filename}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = previewImage.url
                      link.download = previewImage.originalName || previewImage.filename
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewImage(null)}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}