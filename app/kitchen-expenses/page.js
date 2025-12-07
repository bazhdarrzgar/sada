'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Save, X, ChefHat, Filter, Image as ImageIcon, Download } from 'lucide-react'
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

const MONTH_OPTIONS = [
  { value: 'مانگی ١', label: 'مانگی ١' },
  { value: 'مانگی ٢', label: 'مانگی ٢' },
  { value: 'مانگی ٣', label: 'مانگی ٣' },
  { value: 'مانگی ٤', label: 'مانگی ٤' },
  { value: 'مانگی ٥', label: 'مانگی ٥' },
  { value: 'مانگی ٦', label: 'مانگی ٦' },
  { value: 'مانگی ٧', label: 'مانگی ٧' },
  { value: 'مانگی ٨', label: 'مانگی ٨' },
  { value: 'مانگی ٩', label: 'مانگی ٩' },
  { value: 'مانگی ١٠', label: 'مانگی ١٠' },
  { value: 'مانگی ١١', label: 'مانگی ١١' },
  { value: 'مانگی ١٢', label: 'مانگی ١٢' }
]

// Generate year options (current year and past 10 years)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push({ value: i.toString(), label: i.toString() })
  }
  return years
}

const YEAR_OPTIONS = generateYearOptions()

export default function KitchenExpensesPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()
  
  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Check for existing kitchen authentication on mount
  useEffect(() => {
    const kitchenAuth = localStorage.getItem('kitchen_expenses_auth')
    if (kitchenAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])
  
  const [expensesData, setExpensesData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  
  // Two separate filter systems
  const [totalFilterYear, setTotalFilterYear] = useState('ALL_YEARS') // Filter for Total Kitchen Expenses only
  const [totalFilterMonth, setTotalFilterMonth] = useState('ALL_MONTHS') // Filter for Total Kitchen Expenses only
  const [tableFilterYear, setTableFilterYear] = useState('ALL_YEARS') // Filter for both table and total (alongside search)
  const [tableFilterMonth, setTableFilterMonth] = useState('ALL_MONTHS') // Filter for both table and total (alongside search)
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [previewImages, setPreviewImages] = useState([]) // All images in current entry
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // Current image index
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    item: '',
    cost: 0,
    month: 'مانگی ١',
    year: new Date().getFullYear().toString(),
    date: '',
    purpose: '',
    receiptImages: [], // New field: وەسڵ
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'item', weight: 0.4 }, // Item name - highest weight as most descriptive
        { name: 'purpose', weight: 0.3 }, // Purpose
        { name: 'month', weight: 0.2 }, // Month
        { name: 'year', weight: 0.2 }, // Year
        { name: 'date', weight: 0.25 }, // Date field with enhanced weight
        { name: 'cost', weight: 0.2 }, // Cost field
        // Enhanced search patterns for better matching across all data
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.item || '',
            obj.purpose || '',
            obj.month || '',
            obj.year || '',
            obj.date || '',
            obj.cost ? obj.cost.toString() : '',
            obj.notes || '',
            // Add formatted date versions for better date searching
            obj.date ? new Date(obj.date).toLocaleDateString('ku') : '',
            obj.date ? new Date(obj.date).toLocaleDateString('en') : '',
            // Add formatted cost with currency
            obj.cost ? `${obj.cost} د.ع` : '',
            obj.cost ? `${obj.cost} IQD` : '',
            obj.cost ? parseFloat(obj.cost).toLocaleString() : '',
            // Add month and year variations and translations
            obj.month ? `مانگی ${obj.month}` : '',
            obj.month ? `month ${obj.month}` : '',
            obj.year ? `ساڵی ${obj.year}` : '',
            obj.year ? `year ${obj.year}` : '',
            // Add expense-related keywords
            obj.item ? `خواردنگە ${obj.item}` : '',
            obj.item ? `kitchen ${obj.item}` : '',
            obj.purpose ? `خەرجی ${obj.purpose}` : '',
            obj.purpose ? `expense ${obj.purpose}` : '',
            obj.notes ? `تێبینی ${obj.notes}` : '',
            obj.notes ? `notes ${obj.notes}` : ''
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

  // Auto-update year when date changes in new entry
  useEffect(() => {
    if (newEntry.date) {
      const yearFromDate = new Date(newEntry.date).getFullYear().toString()
      if (yearFromDate !== newEntry.year) {
        setNewEntry(prev => ({ ...prev, year: yearFromDate }))
      }
    }
  }, [newEntry.date, newEntry.year])

  // Fetch data from API or use initial data
  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/kitchen-expenses')
      if (response.ok) {
        const data = await response.json()
        setExpensesData(data)
      }
    } catch (error) {
      console.error('Error fetching kitchen expenses:', error)
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
      
      if (entry.id) {
        // Update existing entry
        response = await fetch(`/api/kitchen-expenses/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        response = await fetch('/api/kitchen-expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      }

      if (response.ok) {
        const savedEntry = await response.json()
        
        // Update local state with the saved data - keep position for edits
        setExpensesData(prevData => {
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
        setIsEditModalOpen(false)
        setEditingData(null)
        resetNewEntry()
      } else {
        console.error('Failed to save entry:', response.statusText)
        alert('Failed to save kitchen expense. Please try again.')
      }
      
    } catch (error) {
      console.error('Error saving kitchen expense:', error)
      alert('Failed to save kitchen expense. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    // Prevent multiple deletions
    if (isDeleting) {
      console.log('Delete already in progress, ignoring duplicate click')
      return
    }
    
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kitchen-expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
        alert('Failed to delete kitchen expense. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting kitchen expense:', error)
      alert('Failed to delete kitchen expense. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      item: '',
      cost: 0,
      month: 'مانگی ١',
      year: new Date().getFullYear().toString(),
      date: '',
      purpose: '',
      receiptImages: [],
      notes: ''
    })
  }

  // Utility function for smooth scrolling to center viewport
  const scrollToCenter = () => {
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    const centerPosition = Math.max(0, (scrollHeight - clientHeight) / 2)
    
    window.scrollTo({
      top: centerPosition,
      behavior: 'smooth'
    })
    
    // Return a Promise to wait for scroll completion
    return new Promise(resolve => {
      setTimeout(resolve, 500) // Wait for smooth scroll to complete
    })
  }

  const startEditing = async (index) => {
    // Scroll to center before opening modal
    await scrollToCenter()
    
    const entry = expensesData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  // Handle Add Dialog with smooth scrolling
  const handleAddEntry = async () => {
    // Scroll to center before opening modal
    await scrollToCenter()
    setIsAddDialogOpen(true)
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

  // Define fields for modal editing (now includes year)
  const editFields = [
    {
      key: 'item',
      label: 'Item',
      labelKu: 'شت و مه کی',
      type: 'text',
      placeholder: 'Enter item/description'
    },
    {
      key: 'cost',
      label: 'Cost',
      labelKu: 'تێچوو',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'date',
      label: 'Date',
      labelKu: 'بەروار',
      type: 'date'
    },
    {
      key: 'year',
      label: 'Year',
      labelKu: 'ساڵ',
      type: 'select',
      options: YEAR_OPTIONS,
      placeholder: 'Select year'
    },
    {
      key: 'purpose',
      label: 'Purpose',
      labelKu: 'مەبەست',
      type: 'text',
      placeholder: 'Enter purpose'
    },
    {
      key: 'month',
      label: 'Month',
      labelKu: 'مانگی',
      type: 'select',
      options: MONTH_OPTIONS,
      placeholder: 'Select month'
    },
    {
      key: 'receiptImages',
      label: 'Receipt Images',
      labelKu: 'وەسڵ',
      type: 'image-upload',
      span: 'full'
    },
    {
      key: 'notes',
      label: 'Notes',
      labelKu: 'تێبینی',
      type: 'text',
      placeholder: 'تێبینی...'
    }
  ]

  // Filter data using fuzzy search and table filter (used for both table and Total Kitchen Expenses when tableFilter is active)
  const filteredData = useMemo(() => {
    let searchResults = expensesData
    
    // Apply fuzzy search if there's a search term
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm)
      searchResults = fuseResults.map(result => result.item)
    }
    
    // Apply table filters (affects both table and Total Kitchen Expenses when active)
    if (tableFilterYear && tableFilterYear !== 'ALL_YEARS') {
      searchResults = searchResults.filter(entry => entry.year === tableFilterYear)
    }
    if (tableFilterMonth && tableFilterMonth !== 'ALL_MONTHS') {
      searchResults = searchResults.filter(entry => entry.month === tableFilterMonth)
    }
    
    return searchResults
  }, [fuse, searchTerm, expensesData, tableFilterYear, tableFilterMonth])

  // Calculate total for Total Kitchen Expenses filter (separate from table filter)
  const totalKitchenExpenses = useMemo(() => {
    let dataForTotal = expensesData
    
    // Apply Total Kitchen Expenses specific filters
    if (totalFilterYear && totalFilterYear !== 'ALL_YEARS') {
      dataForTotal = dataForTotal.filter(entry => entry.year === totalFilterYear)
    }
    if (totalFilterMonth && totalFilterMonth !== 'ALL_MONTHS') {
      dataForTotal = dataForTotal.filter(entry => entry.month === totalFilterMonth)
    }
    
    return dataForTotal.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)
  }, [expensesData, totalFilterYear, totalFilterMonth])

  // Calculate total for currently displayed table data
  const displayedDataTotal = useMemo(() => {
    return filteredData.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)
  }, [filteredData])

  // Add a key for forcing re-renders when data changes
  const tableKey = useMemo(() => `kitchen-expenses-${expensesData.length}-${Date.now()}`, [expensesData.length])

  // Force re-render when data changes
  useEffect(() => {
    // This effect ensures the table re-renders when data changes
  }, [expensesData])

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

  function ExpensesCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.item}</div>
                <div className="font-bold text-xl text-red-600 dark:text-red-400">{parseFloat(entry.cost).toLocaleString()} د.ع</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">بەروار:</span> {entry.date}
                </div>
                <div>
                  <span className="font-semibold">مەبەست:</span> {entry.purpose}
                </div>
                {entry.notes && (
                  <div className="col-span-2">
                    <span className="font-semibold">تێبینی:</span> {entry.notes}
                  </div>
                )}
              </div>
              
              {/* Receipt Images */}
              {entry.receiptImages && entry.receiptImages.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-sm">وەسڵ:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {entry.receiptImages.slice(0, 3).map((image, idx) => (
                      <img
                        key={idx}
                        src={image.url}
                        alt={`Receipt ${idx + 1}`}
                        className="w-12 h-12 rounded object-cover cursor-pointer hover:scale-110 transition-transform border-2 border-gray-200"
                        onClick={async () => {
                          // Scroll to center before opening image preview
                          await scrollToCenter()
                          
                          setPreviewImages(entry.receiptImages)
                          setCurrentImageIndex(idx)
                          setPreviewImage(image)
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
              
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-semibold">مانگ:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                    {entry.month}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">ساڵ:</span> 
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                    {entry.year}
                  </span>
                </div>
              </div>
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
    // Define table columns for kitchen expenses (now includes year)
    const columns = [
      {
        key: 'item',
        header: t('dashboard.modules.kitchenExpenses.fields.item', language),
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'cost',
        header: t('dashboard.modules.kitchenExpenses.fields.cost', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'date',
        header: t('dashboard.modules.kitchenExpenses.fields.date', language),
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'month',
        header: t('dashboard.modules.kitchenExpenses.fields.month', language),
        align: 'center',
        editable: true,
        render: (value) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'year',
        header: t('dashboard.modules.kitchenExpenses.fields.year', language),
        align: 'center',
        editable: true,
        render: (value) => (
          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'purpose',
        header: t('dashboard.modules.kitchenExpenses.fields.purpose', language),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'receiptImages',
        header: t('dashboard.modules.kitchenExpenses.fields.receiptImages', language),
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
                        onClick={async () => {
                          // Scroll to center before opening image preview
                          await scrollToCenter()
                          
                          setPreviewImages(images)
                          setCurrentImageIndex(idx)
                          setPreviewImage(image)
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
      },
      {
        key: 'notes',
        header: t('dashboard.modules.kitchenExpenses.fields.notes', language),
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
          maxRowsPerPage={10}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
        {/* Summary footer for displayed data */}
        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-800 dark:to-blue-700 border-blue-200 dark:border-blue-600">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="space-y-1">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total for Displayed Data
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{displayedDataTotal.toLocaleString()} د.ع</p>
                <p className="text-xs text-blue-500">
                  ({filteredData.length} items displayed)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Kitchen Expenses" titleKu="خەرجی خواردنگە">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </PageLayout>
    )
  }

  // Handle authentication
  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    
    if (authUsername === 'berdoz' && authPassword === 'berdoz@private') {
      setIsAuthenticated(true)
      // Save authentication to localStorage so it persists on refresh
      localStorage.setItem('kitchen_expenses_auth', 'true')
      setAuthUsername('')
      setAuthPassword('')
    } else {
      setAuthError('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە / Username or password is incorrect')
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title="Kitchen Expenses" titleKu="خەرجی خواردنگە">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">خەرجی خواردنگە</h2>
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

  return (
    <PageLayout title="Kitchen Expenses" titleKu="خەرجی خواردنگە">
      {/* Total Kitchen Expenses Filter - Moved to Top */}
      <Card className="mb-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-red-600" />
                <Label className="font-semibold text-red-700 dark:text-red-300">Total Kitchen Expenses Filter:</Label>
              </div>
              <Select value={totalFilterYear} onValueChange={setTotalFilterYear}>
                <SelectTrigger className="w-32 border-red-300 focus:ring-red-500">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                  <SelectItem value="ALL_YEARS">All Years / هەموو ساڵەکان</SelectItem>
                  {YEAR_OPTIONS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={totalFilterMonth} onValueChange={setTotalFilterMonth}>
                <SelectTrigger className="w-40 border-red-300 focus:ring-red-500">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                  <SelectItem value="ALL_MONTHS">All Months / هەموو مانگەکان</SelectItem>
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Total Kitchen Expenses
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalKitchenExpenses.toLocaleString()} د.ع
              </p>
              <p className="text-xs text-red-500">
                {(totalFilterYear !== 'ALL_YEARS' || totalFilterMonth !== 'ALL_MONTHS') 
                  ? `Filtered: ${totalFilterYear !== 'ALL_YEARS' ? totalFilterYear : 'All Years'} - ${totalFilterMonth !== 'ALL_MONTHS' ? totalFilterMonth : 'All Months'}`
                  : 'All Time Total'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Add Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('dashboard.modules.kitchenExpenses.searchPlaceholder', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">


            <DownloadButton 
              data={filteredData}
              filename="kitchen-expenses-records"
              className="bg-green-600 hover:bg-green-700 text-white"
            />
            <PrintButton 
              data={filteredData}
              filename="kitchen-expenses-records"
              title="Kitchen Expenses"
              titleKu="خەرجی خواردنگە"
              columns={[
                { key: 'item', header: 'شت و مه کی' },
                { key: 'cost', header: 'تێچوو', render: (value) => parseFloat(value).toLocaleString() + ' د.ع' },
                { key: 'date', header: 'بەروار' },
                { key: 'month', header: 'مانگ' },
                { key: 'year', header: 'ساڵ' },
                { key: 'purpose', header: 'مەبەست' },
                { key: 'receiptImages', header: 'وەسڵ', render: (value) => value && value.length > 0 ? `${value.length} وێنە` : '-' },
                { key: 'notes', header: 'تێبینی' }
              ]}
              showTotal={true}
              totalColumn="cost"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <Button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddEntry}
              >
                <Plus className="h-4 w-4" />
                زیادکردنی خەرجی خواردنگە
              </Button>
              <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-2xl max-h-[90vh] overflow-y-auto z-[100] w-[95vw]">
                <DialogHeader>
                  <DialogTitle>Add New Kitchen Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item">شت و مه کی (Item)</Label>
                    <Input
                      id="item"
                      value={newEntry.item}
                      onChange={(e) => setNewEntry({...newEntry, item: e.target.value})}
                      placeholder="Enter item/description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">تێچوو (Cost)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newEntry.cost}
                      onChange={(e) => setNewEntry({...newEntry, cost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">بەروار (Date)</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">ساڵ (Year)</Label>
                    <Select value={newEntry.year} onValueChange={(value) => setNewEntry({...newEntry, year: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent modal={true}>
                        {YEAR_OPTIONS.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="purpose">مەبەست (Purpose)</Label>
                    <Input
                      id="purpose"
                      value={newEntry.purpose}
                      onChange={(e) => setNewEntry({...newEntry, purpose: e.target.value})}
                      placeholder="Enter purpose"
                    />
                  </div>

                  <div>
                    <Label htmlFor="month">مانگی (Month)</Label>
                    <Select value={newEntry.month} onValueChange={(value) => setNewEntry({...newEntry, month: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent modal={true}>
                        {MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Receipt Images / وەسڵ</Label>
                    <ImageUpload
                      images={newEntry.receiptImages}
                      onImagesChange={(images) => setNewEntry({...newEntry, receiptImages: images})}
                      maxImages={6}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">تێبینی (Notes)</Label>
                    <Input
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      placeholder="تێبینی..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => saveEntry(newEntry)}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Record'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter 2: Table and Total Display Filter (alongside search) */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Label className="font-semibold">Table & Search Filter:</Label>
            </div>
            <Select value={tableFilterYear} onValueChange={setTableFilterYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent side="bottom" align="center" sideOffset={5}>
                <SelectItem value="ALL_YEARS">All Years / هەموو ساڵەکان</SelectItem>
                {YEAR_OPTIONS.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tableFilterMonth} onValueChange={setTableFilterMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent side="bottom" align="center" sideOffset={5}>
                <SelectItem value="ALL_MONTHS">All Months / هەموو مانگەکان</SelectItem>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kitchen Expenses Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <ExpensesCardView data={filteredData} />
        ) : (
          <ExpensesTableView data={filteredData} />
        )}
      </div>

      {/* Total Kitchen Expenses Filter moved to top */}

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ خەرجی خواردنگەیەک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {((tableFilterYear && tableFilterYear !== 'ALL_YEARS') || (tableFilterMonth && tableFilterMonth !== 'ALL_MONTHS'))
                ? `هیچ خەرجی خواردنگەیەک بۆ ${tableFilterYear !== 'ALL_YEARS' ? tableFilterYear : 'All Years'} - ${tableFilterMonth !== 'ALL_MONTHS' ? tableFilterMonth : 'All Months'} نەدۆزرایەوە` 
                : searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ خەرجی خواردنگەیەک زیاد نەکراوە'
              }
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
        title="Edit Kitchen Expense"
        titleKu="دەستکاریکردنی خەرجی خواردنگە"
      />

      {/* Enhanced Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => {
        setPreviewImage(null)
        setPreviewImages([])
        setCurrentImageIndex(0)
      }}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-7xl w-[95vw] h-[95vh] p-0 bg-black border-gray-700 overflow-auto z-[100]">
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
                                    <h2>وەسڵی خەرجی خواردنگە - Receipt Image - Kitchen Expenses</h2>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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