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
  
  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Check for existing authentication on mount
  useEffect(() => {
    const dailyAccountsAuth = localStorage.getItem('daily_accounts_auth')
    if (dailyAccountsAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])
  
  const [dailyAccountsData, setDailyAccountsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [previewImages, setPreviewImages] = useState([]) // All images in current entry
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // Current image index
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
    // Prevent multiple submissions
    if (isSaving) {
      console.log('Save already in progress, ignoring duplicate click')
      return
    }
    
    setIsSaving(true)
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
        
        // Update local state with the saved data - keep position for edits
        setDailyAccountsData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            // For updates, keep in same position for instant visual feedback
            const newData = [...prevData]
            newData[existingIndex] = savedEntry
            return newData
          } else {
            // For new entries, add to the top
            return [savedEntry, ...prevData]
          }
        })

        setIsAddDialogOpen(false)
        resetNewEntry()
        setIsSaving(false)
      } else {
        console.error('Failed to save entry:', response.statusText)
        setIsSaving(false)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
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
      if (id.startsWith('daily-')) {
        // Remove from local state only if it's a temporary entry
        setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
        setIsDeleting(false)
        return
      }

      const response = await fetch(`/api/daily-accounts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
        setIsDeleting(false)
      } else {
        console.error('Failed to delete entry:', response.statusText)
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      setIsDeleting(false)
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

  // Smooth scroll to center function
  const scrollToCenter = () => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const targetScrollPosition = (documentHeight - windowHeight) / 2
    
    window.scrollTo({
      top: targetScrollPosition,
      behavior: 'smooth'
    })
  }

  const startEditing = (index) => {
    // First scroll to center, then open modal after a brief delay
    scrollToCenter()
    setTimeout(() => {
      const entry = dailyAccountsData[index]
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 300) // Small delay to allow scroll to start
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

  // Keyboard navigation for image preview
  useEffect(() => {
    if (!previewImage || previewImages.length <= 1) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : previewImages.length - 1
        setCurrentImageIndex(newIndex)
        setPreviewImage(previewImages[newIndex])
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newIndex = currentImageIndex < previewImages.length - 1 ? currentImageIndex + 1 : 0
        setCurrentImageIndex(newIndex)
        setPreviewImage(previewImages[newIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [previewImage, previewImages, currentImageIndex])

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
                        onClick={() => {
                          // First scroll to center, then open modal
                          scrollToCenter()
                          setTimeout(() => {
                            setPreviewImages(entry.receiptImages)
                            setCurrentImageIndex(idx)
                            setPreviewImage(image)
                          }, 300) // Small delay to allow scroll to start
                        }}
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => startEditing(idx)} 
                  disabled={isSaving || isDeleting}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteEntry(entry.id)} 
                  disabled={isSaving || isDeleting}
                  className="hover:bg-red-50 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 transition-colors duration-200"
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
        render: (value, row, rowIndex) => {
          // Ensure value is an array
          const images = Array.isArray(value) ? value : (value ? JSON.parse(value) : [])
          return (
            <div className="flex items-center justify-center">
              {images && images.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {images.slice(0, 3).map((image, idx) => (
                    <img
                      key={idx}
                      src={image.url}
                      alt={`Receipt ${idx + 1}`}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        // First scroll to center, then open modal
                        scrollToCenter()
                        setTimeout(() => {
                          setPreviewImages(images)
                          setCurrentImageIndex(idx)
                          setPreviewImage(image)
                        }, 300) // Small delay to allow scroll to start
                      }}
                    />
                  ))}
                  {images.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium text-gray-600">
                      +{images.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {images.length} image{images.length !== 1 ? 's' : ''}
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
          maxRowsPerPage={10}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
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

  // Handle authentication
  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (authUsername === 'berdoz' && authPassword === 'berdoz@private') {
      setIsAuthenticated(true)
      // Save authentication to localStorage
      localStorage.setItem('daily_accounts_auth', 'true')
      setAuthUsername('')
      setAuthPassword('')
    } else {
      setAuthError('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە / Username or password is incorrect')
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">حساباتی رۆژانه</h2>
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
      <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
      {/* Totals Filter - Moved to Top */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-600">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">فیلتەری کۆکارییەکان / Totals Filter:</span>
              </div>
              <Select value={totalsFilter.year || 'all'} onValueChange={(value) => setTotalsFilter(prev => ({ ...prev, year: value === 'all' ? '' : value }))}>
                <SelectTrigger className="w-40 border-yellow-300 focus:ring-yellow-500">
                  <SelectValue placeholder="هەڵبژاردنی ساڵ" />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                  <SelectItem value="all">هەموو ساڵەکان</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={totalsFilter.month || 'all'} onValueChange={(value) => setTotalsFilter(prev => ({ ...prev, month: value === 'all' ? '' : value }))}>
                <SelectTrigger className="w-40 border-yellow-300 focus:ring-yellow-500">
                  <SelectValue placeholder="هەڵبژاردنی مانگ" />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
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
            <div className="text-center">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                Total Filtered Amount
              </p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {getCurrentWeekData.totalFilteredAmount.toLocaleString()} د.ع
              </p>
              <p className="text-xs text-yellow-500">
                {(totalsFilter.year || totalsFilter.month) 
                  ? `Filtered: ${totalsFilter.year || 'All Years'} - ${totalsFilter.month || 'All Months'}`
                  : 'All Time Total'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            showTotal={true}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // First scroll to center, then open modal
                  scrollToCenter()
                  setTimeout(() => {
                    setIsAddDialogOpen(true)
                  }, 300) // Small delay to allow scroll to start
                }}
              >
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
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} disabled={isSaving}>
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
                <SelectContent side="bottom" align="center" sideOffset={5}>
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
                <SelectContent side="bottom" align="center" sideOffset={5}>
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

      {/* Enhanced Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => {
        setPreviewImage(null)
        setPreviewImages([])
        setCurrentImageIndex(0)
      }}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black border-gray-700 overflow-auto">
          {previewImage && (
            <div className="flex flex-col h-full">
              {/* Header with title and controls */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-black/95 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium truncate max-w-xs">
                    {previewImage?.originalName || 'Receipt Preview'}
                  </span>
                  {previewImages.length > 1 && (
                    <span className="text-gray-400 text-sm">
                      ({currentImageIndex + 1} of {previewImages.length})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Navigation arrows for multiple images */}
                  {previewImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : previewImages.length - 1
                          setCurrentImageIndex(newIndex)
                          setPreviewImage(previewImages[newIndex])
                        }}
                        className="text-white hover:bg-white/10 transition-colors"
                        title="Previous Image"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newIndex = currentImageIndex < previewImages.length - 1 ? currentImageIndex + 1 : 0
                          setCurrentImageIndex(newIndex)
                          setPreviewImage(previewImages[newIndex])
                        }}
                        className="text-white hover:bg-white/10 transition-colors"
                        title="Next Image"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = previewImage.url
                      link.download = previewImage.originalName || previewImage.filename
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="text-white hover:bg-white/10 transition-colors"
                    title="Download Image"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreviewImage(null)
                      setPreviewImages([])
                      setCurrentImageIndex(0)
                    }}
                    className="text-white hover:bg-white/10 transition-colors"
                    title="Close Preview"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Scrollable content area with improved scrolling */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-900" style={{ scrollBehavior: 'smooth' }}>
                <div className="min-h-full flex flex-col">
                  {/* Image container with zoom capabilities */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={previewImage.url}
                        alt={previewImage.originalName || 'Receipt Preview'}
                        className="max-w-full max-h-[calc(95vh-300px)] object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300 rounded-lg shadow-2xl"
                        loading="lazy"
                        onClick={(e) => {
                          // Toggle full screen zoom with proper scrolling
                          const container = e.target.parentElement
                          if (e.target.style.transform === 'scale(2)') {
                            e.target.style.transform = 'scale(1)'
                            e.target.style.cursor = 'zoom-in'
                            container.style.overflow = 'visible'
                            // Reset scroll position
                            container.parentElement.scrollTop = 0
                          } else {
                            e.target.style.transform = 'scale(2)'
                            e.target.style.cursor = 'zoom-out'
                            container.style.overflow = 'auto'
                            // Enable scrolling for zoomed image
                            container.style.height = 'auto'
                            container.style.minHeight = '100%'
                          }
                        }}
                        style={{ 
                          transformOrigin: 'center center',
                          transition: 'transform 0.3s ease-in-out'
                        }}
                      />
                    </div>
                  </div>

                  {/* Image thumbnails for navigation (if multiple images) */}
                  {previewImages.length > 1 && (
                    <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
                      <div className="flex gap-2 justify-center overflow-x-auto">
                        {previewImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className={`w-16 h-16 object-cover rounded cursor-pointer transition-all duration-200 flex-shrink-0 ${
                              idx === currentImageIndex 
                                ? 'ring-2 ring-blue-400 scale-110' 
                                : 'hover:scale-105 opacity-70 hover:opacity-100'
                            }`}
                            onClick={() => {
                              setCurrentImageIndex(idx)
                              setPreviewImage(img)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Image Information Panel */}
                  <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-700 border-t border-gray-600 flex-shrink-0">
                    <div className="space-y-4">
                      {/* Image metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 font-medium mb-1">File Name</div>
                          <div className="text-white truncate">{previewImage.originalName || previewImage.filename || 'Unknown'}</div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 font-medium mb-1">File Size</div>
                          <div className="text-white">
                            {previewImage.size ? 
                              (previewImage.size / 1024 / 1024 > 1 ? 
                                (previewImage.size / 1024 / 1024).toFixed(2) + ' MB' : 
                                (previewImage.size / 1024).toFixed(1) + ' KB'
                              ) : 'Unknown'
                            }
                          </div>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="text-gray-400 font-medium mb-1">Type</div>
                          <div className="text-white">Receipt Image</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = previewImage.url
                            link.download = previewImage.originalName || previewImage.filename
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 transition-all duration-200"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Original
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (navigator.share && previewImage.url) {
                              navigator.share({
                                title: 'Receipt Image',
                                url: previewImage.url
                              })
                            } else {
                              // Fallback: copy URL to clipboard
                              navigator.clipboard.writeText(previewImage.url)
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          Share
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            const printWindow = window.open('', '_blank')
                            printWindow.document.write(`
                              <html>
                                <head><title>Print Receipt</title>
                                <style>
                                  body { margin: 0; padding: 20px; background: white; }
                                  img { max-width: 100%; height: auto; }
                                  .header { text-align: center; margin-bottom: 20px; }
                                </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h2>وێنەی پسووڵە - Receipt Image - Daily Accounts</h2>
                                    <p>${previewImage.originalName || 'Receipt'}</p>
                                  </div>
                                  <img src="${previewImage.url}" alt="Receipt" />
                                </body>
                              </html>
                            `)
                            printWindow.document.close()
                            setTimeout(() => {
                              printWindow.print()
                              printWindow.close()
                            }, 500)
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 hover:border-purple-700 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print
                        </Button>
                        
                        {previewImages.length > 1 && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Download all images
                              const downloadPromises = previewImages.map(async (img, idx) => {
                                const response = await fetch(img.url)
                                const blob = await response.blob()
                                return { name: `receipt-${idx + 1}.${img.url.split('.').pop()}`, blob }
                              })
                              
                              Promise.all(downloadPromises).then(files => {
                                // Create multiple downloads
                                files.forEach(file => {
                                  const link = document.createElement('a')
                                  link.href = URL.createObjectURL(file.blob)
                                  link.download = file.name
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                })
                              })
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700 transition-all duration-200"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download All ({previewImages.length})
                          </Button>
                        )}
                      </div>

                      {/* Pro tip */}
                      <div className="bg-blue-900/30 border border-blue-600/30 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-blue-100 text-sm">
                            <p className="font-medium mb-1">Pro Tips:</p>
                            <ul className="space-y-1 text-blue-200">
                              <li>• Click image to zoom in/out</li>
                              <li>• When zoomed, scroll to navigate around the image</li>
                              <li>• Use ← → arrow keys to navigate between images</li>
                              <li>• Use the thumbnail bar below for quick navigation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bottom spacing for smooth filter dropdown opening */}
      <div className="h-64"></div>
    </PageLayout>
  )
}