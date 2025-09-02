'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Save, X, Image as ImageIcon, Download, Languages, RefreshCw } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import ImageUpload from '@/components/ui/image-upload'
import Fuse from 'fuse.js'

export default function MonthlyExpensesPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()
  const [expensesData, setExpensesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [summaryYear, setSummaryYear] = useState('')
  const [summaryMonth, setSummaryMonth] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [newEntry, setNewEntry] = useState({
    year: new Date().getFullYear().toString(),
    month: new Date().getMonth() + 1,
    requirement: '',
    staffSalary: 0,
    expenses: 0,
    buildingRent: 0,
    dramaFee: 0,
    socialSupport: 0,
    electricity: 0,
    total: 0,
    receiptImages: [],
    notes: ''
  })

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

  const getExpenseRange = (expense) => {
    if (expense < 1000000) return 'low کەم'
    if (expense < 5000000) return 'medium ناوەند'
    if (expense < 10000000) return 'high بەرز'
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
        { name: 'year', weight: 0.15 },
        { name: 'month', weight: 0.15 },
        { name: 'notes', weight: 0.3 },
        { name: 'requirement', weight: 0.25 },
        { name: 'staffSalary', weight: 0.1 },
        { name: 'expenses', weight: 0.1 },
        { name: 'buildingRent', weight: 0.1 },
        { name: 'dramaFee', weight: 0.05 },
        { name: 'socialSupport', weight: 0.05 },
        { name: 'electricity', weight: 0.1 },
        { name: 'total', weight: 0.2 },
        { name: 'id', weight: 0.05 },
        { name: 'searchableContent', weight: 0.25, getFn: (obj) => {
          return [
            obj.year || '',
            obj.month || '',
            obj.notes || '',
            obj.requirement || '',
            obj.staffSalary ? obj.staffSalary.toString() : '',
            obj.expenses ? obj.expenses.toString() : '',
            obj.buildingRent ? obj.buildingRent.toString() : '',
            obj.dramaFee ? obj.dramaFee.toString() : '',
            obj.socialSupport ? obj.socialSupport.toString() : '',
            obj.electricity ? obj.electricity.toString() : '',
            obj.total ? obj.total.toString() : '',
            obj.staffSalary ? parseFloat(obj.staffSalary).toLocaleString() : '',
            obj.total ? parseFloat(obj.total).toLocaleString() : '',
            obj.year && obj.month ? `${obj.year}/${obj.month}` : '',
            obj.year && obj.month ? `${obj.month}/${obj.year}` : '',
            obj.month ? getMonthName(obj.month) : '',
            obj.total ? getExpenseRange(parseFloat(obj.total)) : '',
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
    }
    return new Fuse(expensesData, options)
  }, [expensesData])

  // Fetch monthly expenses data from API
  useEffect(() => {
    fetchExpensesData()
  }, [])

  const fetchExpensesData = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpensesData(data)
      }
    } catch (error) {
      console.error('Error fetching monthly expenses data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('expense-')) {
        // Update existing entry
        response = await fetch(`/api/expenses/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('expense-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/expenses', {
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
        setEditingRow(null)
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
      if (id.startsWith('expense-')) {
        // Remove from local state only if it's a temporary entry
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      year: new Date().getFullYear().toString(),
      month: new Date().getMonth() + 1,
      requirement: '',
      staffSalary: 0,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 0,
      receiptImages: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...expensesData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when expense amounts change
    if (['staffSalary', 'expenses', 'buildingRent', 'dramaFee', 'socialSupport', 'electricity'].includes(field)) {
      const staffSalary = parseFloat(updatedData[rowIndex].staffSalary) || 0
      const expenses = parseFloat(updatedData[rowIndex].expenses) || 0
      const buildingRent = parseFloat(updatedData[rowIndex].buildingRent) || 0
      const dramaFee = parseFloat(updatedData[rowIndex].dramaFee) || 0
      const socialSupport = parseFloat(updatedData[rowIndex].socialSupport) || 0
      const electricity = parseFloat(updatedData[rowIndex].electricity) || 0
      
      updatedData[rowIndex].total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity
    }
    
    setExpensesData(updatedData)
  }

  const startEditing = (index) => {
    const entry = expensesData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = expensesData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchExpensesData()
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
      key: 'year',
      label: t('monthlyExpenses.fields.year', language),
      labelKu: t('monthlyExpenses.fields.year', 'kurdish'),
      type: 'number',
      placeholder: new Date().getFullYear().toString()
    },
    {
      key: 'month',
      label: t('monthlyExpenses.fields.month', language),
      labelKu: t('monthlyExpenses.fields.month', 'kurdish'),
      type: 'number',
      placeholder: '1-12'
    },
    {
      key: 'requirement',
      label: t('monthlyExpenses.fields.requirement', language),
      labelKu: t('monthlyExpenses.fields.requirement', 'kurdish'),
      type: 'textarea',
      placeholder: 'پێداویستی و مەبەست...',
      span: 'full'
    },
    {
      key: 'staffSalary',
      label: t('monthlyExpenses.fields.staffSalary', language),
      labelKu: t('monthlyExpenses.fields.staffSalary', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'expenses',
      label: t('monthlyExpenses.fields.expenses', language),
      labelKu: t('monthlyExpenses.fields.expenses', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'buildingRent',
      label: t('monthlyExpenses.fields.buildingRent', language),
      labelKu: t('monthlyExpenses.fields.buildingRent', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'electricity',
      label: t('monthlyExpenses.fields.electricity', language),
      labelKu: t('monthlyExpenses.fields.electricity', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'receiptImages',
      label: t('monthlyExpenses.fields.receiptImages', language),
      labelKu: t('monthlyExpenses.fields.receiptImages', 'kurdish'),
      type: 'image-upload',
      span: 'full'
    },
    {
      key: 'notes',
      label: t('monthlyExpenses.fields.notes', language),
      labelKu: t('monthlyExpenses.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی...',
      span: 'full'
    }
  ]

  // FIRST FILTER - Controls only the summary calculation (affected by summaryYear and summaryMonth)
  const summaryExpenses = useMemo(() => {
    let data = expensesData

    if (summaryYear && summaryYear !== "all-years") {
      data = data.filter(item => item.year === summaryYear)
    }
    if (summaryMonth && summaryMonth !== "all-months") {
      data = data.filter(item => item.month === summaryMonth)
    }

    return data.reduce((sum, entry) => sum + (entry.total || 0), 0)
  }, [expensesData, summaryYear, summaryMonth])

  // SECOND FILTER - Controls both table and Total Monthly Expenses (Main filters + search)
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
        { name: 'year', weight: 0.15 },
        { name: 'month', weight: 0.15 },
        { name: 'notes', weight: 0.3 },
        { name: 'requirement', weight: 0.25 },
        { name: 'staffSalary', weight: 0.1 },
        { name: 'expenses', weight: 0.1 },
        { name: 'buildingRent', weight: 0.1 },
        { name: 'dramaFee', weight: 0.05 },
        { name: 'socialSupport', weight: 0.05 },
        { name: 'electricity', weight: 0.1 },
        { name: 'total', weight: 0.2 },
        { name: 'id', weight: 0.05 },
        { name: 'searchableContent', weight: 0.25, getFn: (obj) => {
          return [
            obj.year || '',
            obj.month || '',
            obj.notes || '',
            obj.requirement || '',
            obj.staffSalary ? obj.staffSalary.toString() : '',
            obj.expenses ? obj.expenses.toString() : '',
            obj.buildingRent ? obj.buildingRent.toString() : '',
            obj.dramaFee ? obj.dramaFee.toString() : '',
            obj.socialSupport ? obj.socialSupport.toString() : '',
            obj.electricity ? obj.electricity.toString() : '',
            obj.total ? obj.total.toString() : '',
            obj.staffSalary ? parseFloat(obj.staffSalary).toLocaleString() : '',
            obj.total ? parseFloat(obj.total).toLocaleString() : '',
            obj.year && obj.month ? `${obj.year}/${obj.month}` : '',
            obj.year && obj.month ? `${obj.month}/${obj.year}` : '',
            obj.month ? getMonthName(obj.month) : '',
            obj.total ? getExpenseRange(parseFloat(obj.total)) : '',
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
  }, [fuse, searchTerm, expensesData, selectedYear, selectedMonth])

  // Calculate total expenses from filtered data (affected by second filter)
  const totalExpenses = filteredData.reduce((sum, entry) => sum + (entry.total || 0), 0)

  // NEW: Total Monthly Expenses calculation (affected by second filter: search + main filters)
  const totalMonthlyExpenses = useMemo(() => {
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
          { name: 'year', weight: 0.15 },
          { name: 'month', weight: 0.15 },
          { name: 'notes', weight: 0.3 },
          { name: 'requirement', weight: 0.25 },
          { name: 'staffSalary', weight: 0.1 },
          { name: 'expenses', weight: 0.1 },
          { name: 'buildingRent', weight: 0.1 },
          { name: 'dramaFee', weight: 0.05 },
          { name: 'socialSupport', weight: 0.05 },
          { name: 'electricity', weight: 0.1 },
          { name: 'total', weight: 0.2 },
          { name: 'id', weight: 0.05 },
          { name: 'searchableContent', weight: 0.25, getFn: (obj) => {
            return [
              obj.year || '',
              obj.month || '',
              obj.notes || '',
              obj.requirement || '',
              obj.staffSalary ? obj.staffSalary.toString() : '',
              obj.expenses ? obj.expenses.toString() : '',
              obj.buildingRent ? obj.buildingRent.toString() : '',
              obj.dramaFee ? obj.dramaFee.toString() : '',
              obj.socialSupport ? obj.socialSupport.toString() : '',
              obj.electricity ? obj.electricity.toString() : '',
              obj.total ? obj.total.toString() : '',
              obj.staffSalary ? parseFloat(obj.staffSalary).toLocaleString() : '',
              obj.total ? parseFloat(obj.total).toLocaleString() : '',
              obj.year && obj.month ? `${obj.year}/${obj.month}` : '',
              obj.year && obj.month ? `${obj.month}/${obj.year}` : '',
              obj.month ? getMonthName(obj.month) : '',
              obj.total ? getExpenseRange(parseFloat(obj.total)) : '',
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

    return data.reduce((sum, entry) => sum + (entry.total || 0), 0)
  }, [expensesData, selectedYear, selectedMonth, searchTerm])

  // Get unique years and months for dropdowns
  const availableYears = useMemo(() => {
    const years = [...new Set(expensesData.map(item => item.year))].sort((a, b) => b.localeCompare(a))
    return years
  }, [expensesData])

  const availableMonths = useMemo(() => {
    const months = [...new Set(expensesData.map(item => item.month))].sort((a, b) => parseInt(a) - parseInt(b))
    return months
  }, [expensesData])

  // Add a key for forcing re-renders when data changes
  const tableKey = useMemo(() => `monthly-expenses-${expensesData.length}-${Date.now()}`, [expensesData.length])

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
                <div className="font-bold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.year}/{entry.month}</div>
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">{entry.total.toLocaleString()} د.ع</div>
              </div>
              
              {/* Requirement section */}
              {entry.requirement && (
                <div className="border-t pt-2">
                  <div className="text-sm">
                    <span className="font-semibold">{t('monthlyExpenses.fields.requirement', language)}:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">{entry.requirement}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">{t('monthlyExpenses.fields.staffSalary', language)}:</span> <span className="text-green-600 dark:text-green-400">{entry.staffSalary.toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('monthlyExpenses.fields.expenses', language)}:</span> <span className="text-red-600 dark:text-red-400">{entry.expenses.toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('monthlyExpenses.fields.buildingRent', language)}:</span> <span className="text-purple-600 dark:text-purple-400">{entry.buildingRent.toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('monthlyExpenses.fields.electricity', language)}:</span> <span className="text-orange-600 dark:text-orange-400">{entry.electricity.toLocaleString()}</span></div>
              </div>
              
              {/* Receipt Images */}
              {entry.receiptImages && entry.receiptImages.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-sm">{t('monthlyExpenses.fields.receiptImages', language)}:</span>
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
              
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{t('monthlyExpenses.fields.notes', language)}:</span> {entry.notes}
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
    // Define table columns for monthly expenses
    const columns = [
      {
        key: 'year',
        header: t('monthlyExpenses.fields.year', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'month',
        header: t('monthlyExpenses.fields.month', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'requirement',
        header: t('monthlyExpenses.fields.requirement', language),
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => <span className="font-medium">{value || '-'}</span>
      },
      {
        key: 'staffSalary',
        header: t('monthlyExpenses.fields.staffSalary', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'expenses',
        header: t('monthlyExpenses.fields.expenses', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'buildingRent',
        header: t('monthlyExpenses.fields.buildingRent', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-purple-600 dark:text-purple-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'electricity',
        header: t('monthlyExpenses.fields.electricity', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'total',
        header: t('monthlyExpenses.fields.total', language),
        align: 'center',
        editable: false,
        render: (value) => <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'receiptImages',
        header: t('monthlyExpenses.fields.receiptImages', language),
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
        header: t('monthlyExpenses.fields.notes', language),
        align: 'center',
        editable: true,
        truncate: 40,
        editComponent: (row, onChange) => (
          <Textarea
            value={row.notes || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full dark:bg-gray-800"
            rows={2}
          />
        ),
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
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
          maxRowsPerPage={12}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Total Monthly Expenses (affected by search and main filters - SECOND FILTER) */}
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {t('monthlyExpenses.summary.totalMonthlyExpenses', language)} / {t('monthlyExpenses.summary.totalMonthlyExpenses', 'kurdish')}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  {t('monthlyExpenses.summary.controlledBy', language)}
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalMonthlyExpenses.toLocaleString()} د.ع
                </div>
              </div>

              {/* Current Table Total (shows same as Total Monthly Expenses) */}
              <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                  {t('monthlyExpenses.summary.currentTableTotal', language)} / {t('monthlyExpenses.summary.currentTableTotal', 'kurdish')}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                  Same as Total Monthly Expenses above
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalExpenses.toLocaleString()} د.ع
                </div>
              </div>

              {/* Summary filters (FIRST FILTER - Controls only the summary calculation below) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-4">
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {t('monthlyExpenses.summary.summaryCalculator', language)} / {t('monthlyExpenses.summary.summaryCalculator', 'kurdish')}
                  <div className="text-xs text-gray-500 mt-1">{t('monthlyExpenses.summary.filterNote', language)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.year', language)}:</Label>
                    <Select value={summaryYear} onValueChange={setSummaryYear}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t('monthlyExpenses.summary.allYears', 'kurdish')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-years">{t('monthlyExpenses.summary.allYears', language)}</SelectItem>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.month', language)}:</Label>
                    <Select value={summaryMonth} onValueChange={setSummaryMonth}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t('monthlyExpenses.summary.allMonths', 'kurdish')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-months">{t('monthlyExpenses.summary.allMonths', language)}</SelectItem>
                        {availableMonths.map(month => (
                          <SelectItem key={month} value={month}>
                            {month} - {getMonthName(month).split(' ')[1]}
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
                          ? `${t('monthlyExpenses.summary.summaryFor', language)} ${getMonthName(summaryMonth).split(' ')[1]} ${summaryYear} / ${t('monthlyExpenses.summary.summaryFor', 'kurdish')} ${getMonthName(summaryMonth).split(' ')[1]} ${summaryYear}`
                          : (summaryYear && summaryYear !== "all-years")
                          ? `${t('monthlyExpenses.summary.summaryFor', language)} Year ${summaryYear} / ${t('monthlyExpenses.summary.summaryFor', 'kurdish')} ساڵی ${summaryYear}`
                          : `${t('monthlyExpenses.summary.summaryFor', language)} Month ${summaryMonth} / ${t('monthlyExpenses.summary.summaryFor', 'kurdish')} مانگی ${getMonthName(summaryMonth).split(' ')[1]}`
                        }
                      </p>
                      <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{summaryExpenses.toLocaleString()} د.ع</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('monthlyExpenses.summary.allRecordsSummary', language)} / {t('monthlyExpenses.summary.allRecordsSummary', 'kurdish')}</p>
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
      <PageLayout title={t('monthlyExpenses.title', language)} titleKu={t('monthlyExpenses.title', 'kurdish')}>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('monthlyExpenses.title', language)} titleKu={t('monthlyExpenses.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="space-y-4">
        {/* Search and filters row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('monthlyExpenses.searchPlaceholder', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Year and Month Filters - Controls both table AND total */}
          <div className="flex items-center gap-3 border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-blue-50/50 dark:bg-blue-900/20">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
              {t('monthlyExpenses.summary.tableFilter', language)}
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.year', language)}:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('monthlyExpenses.summary.allYears', 'kurdish')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">{t('monthlyExpenses.summary.allYears', language)}</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.month', language)}:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('monthlyExpenses.summary.allMonths', 'kurdish')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-months">{t('monthlyExpenses.summary.allMonths', language)}</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {month} - {getMonthName(month).split(' ')[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DownloadButton 
              data={filteredData}
              filename="monthly-expenses-records"
              className="bg-green-600 hover:bg-green-700 text-white"
            />
            <PrintButton 
              data={filteredData}
              filename="monthly-expenses-records"
              title={t('monthlyExpenses.title', language)}
              titleKu={t('monthlyExpenses.title', 'kurdish')}
              columns={[
                { key: 'year', header: t('monthlyExpenses.fields.year', 'kurdish') },
                { key: 'month', header: t('monthlyExpenses.fields.month', 'kurdish') },
                { key: 'requirement', header: t('monthlyExpenses.fields.requirement', 'kurdish') },
                { key: 'staffSalary', header: t('monthlyExpenses.fields.staffSalary', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'expenses', header: t('monthlyExpenses.fields.expenses', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'buildingRent', header: t('monthlyExpenses.fields.buildingRent', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'electricity', header: t('monthlyExpenses.fields.electricity', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'total', header: t('monthlyExpenses.fields.total', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'notes', header: t('monthlyExpenses.fields.notes', 'kurdish') }
              ]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  {t('monthlyExpenses.addButton', language)}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('monthlyExpenses.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">{t('monthlyExpenses.fields.year', language)}</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newEntry.year}
                      onChange={(e) => setNewEntry({...newEntry, year: e.target.value})}
                      placeholder={new Date().getFullYear().toString()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">{t('monthlyExpenses.fields.month', language)}</Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={newEntry.month}
                      onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                      placeholder="1-12"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirement">{t('monthlyExpenses.fields.requirement', language)}</Label>
                  <Textarea
                    id="requirement"
                    value={newEntry.requirement}
                    onChange={(e) => setNewEntry({...newEntry, requirement: e.target.value})}
                    placeholder="پێداویستی و مەبەست..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staffSalary">{t('monthlyExpenses.fields.staffSalary', language)}</Label>
                    <Input
                      id="staffSalary"
                      type="number"
                      value={newEntry.staffSalary}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, staffSalary: value}
                        const total = value + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses">{t('monthlyExpenses.fields.expenses', language)}</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={newEntry.expenses}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, expenses: value}
                        const total = parseFloat(updatedEntry.staffSalary) + value + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buildingRent">{t('monthlyExpenses.fields.buildingRent', language)}</Label>
                    <Input
                      id="buildingRent"
                      type="number"
                      value={newEntry.buildingRent}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, buildingRent: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + value + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="electricity">{t('monthlyExpenses.fields.electricity', language)}</Label>
                    <Input
                      id="electricity"
                      type="number"
                      value={newEntry.electricity}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, electricity: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + value
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="total">{t('monthlyExpenses.fields.total', language)}</Label>
                  <Input
                    id="total"
                    type="number"
                    value={newEntry.total}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <Label>{t('monthlyExpenses.fields.receiptImages', language)}</Label>
                  <ImageUpload
                    images={newEntry.receiptImages}
                    onImagesChange={(images) => setNewEntry({...newEntry, receiptImages: images})}
                    maxImages={6}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">{t('monthlyExpenses.fields.notes', language)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    {t('monthlyExpenses.buttons.cancel', language)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    {t('monthlyExpenses.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
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
        title={t('monthlyExpenses.buttons.edit', language)}
        titleKu={t('monthlyExpenses.buttons.edit', 'kurdish')}
      />

      {/* Expenses Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <ExpensesCardView data={filteredData} />
        ) : (
          <ExpensesTableView data={filteredData} />
        )}
      </div>

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