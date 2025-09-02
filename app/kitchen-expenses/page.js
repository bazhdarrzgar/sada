'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Save, X, ChefHat, Filter, Image as ImageIcon, Download, Languages, RefreshCw } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import ImageUpload from '@/components/ui/image-upload'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import axios from 'axios'
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

  // Get API URL from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

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
      const response = await axios.get(`${API_URL}/api/kitchen-expenses`)
      setExpensesData(response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching kitchen expenses:', error)
      setExpensesData([])
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    setIsSaving(true)
    try {
      if (!entry.id) {
        // Create new entry
        const response = await axios.post(`${API_URL}/api/kitchen-expenses`, entry)
        if (response.data) {
          setExpensesData(prevData => [response.data, ...prevData]) // Add to beginning for newest first
        }
      } else {
        // Update existing entry
        const response = await axios.put(`${API_URL}/api/kitchen-expenses/${entry.id}`, entry)
        if (response.data) {
          setExpensesData(prevData => 
            prevData.map(item => item.id === entry.id ? response.data : item)
          )
        }
      }
      setIsAddDialogOpen(false)
      resetNewEntry()
      // Refresh the page after successful operation
      window.location.reload()
    } catch (error) {
      console.error('Error saving kitchen expense:', error)
      // Show error to user (you can add toast notification here)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    setIsDeleting(true)
    try {
      await axios.delete(`${API_URL}/api/kitchen-expenses/${id}`)
      setExpensesData(prevData => prevData.filter(item => item.id !== id))
      // Refresh the page after successful deletion
      window.location.reload()
    } catch (error) {
      console.error('Error deleting kitchen expense:', error)
      // Show error to user (you can add toast notification here)
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
          maxRowsPerPage={15}
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

  return (
    <PageLayout title="Kitchen Expenses" titleKu="خەرجی خواردنگە">
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
                { key: 'notes', header: 'تێبینی' }
              ]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  زیادکردنی خەرجی خواردنگە
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      <SelectContent>
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
                      <SelectContent>
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
              <SelectContent>
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
              <SelectContent>
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

      {/* Total Kitchen Expenses Filter - Moved Below Table */}
      <Card className="mt-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
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
                <SelectContent>
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
                <SelectContent>
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

      {/* Image Preview Dialog */}
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