'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  
  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Check for existing authentication on mount
  useEffect(() => {
    const expensesAuth = localStorage.getItem('expenses_auth')
    if (expensesAuth === 'true') {
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
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [tableVersion, setTableVersion] = useState(0)
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
    books: 0,
    clothes: 0,
    travel: 0,
    transportation: 0,
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
      const response = await fetch('/api/monthly-expenses')
      if (response.ok) {
        const data = await response.json()
        setExpensesData(data)
        setTableVersion(v => v + 1)
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
        response = await fetch(`/api/monthly-expenses/${entry.id}`, {
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
        
        response = await fetch('/api/monthly-expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      }

      // If updating and not found, retry as create with same id
      if (!response.ok && response.status === 404 && entry.id) {
        const createWithId = { ...entry }
        response = await fetch('/api/monthly-expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createWithId)
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

        // Force full page reload so the entire page refreshes after save
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
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

      const response = await fetch(`/api/monthly-expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        setTableVersion(v => v + 1)
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
      books: 0,
      clothes: 0,
      travel: 0,
      transportation: 0,
      total: 0,
      receiptImages: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...expensesData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when expense amounts change
    if (['staffSalary', 'expenses', 'buildingRent', 'dramaFee', 'socialSupport', 'electricity', 'books', 'clothes', 'travel', 'transportation'].includes(field)) {
      const staffSalary = parseFloat(updatedData[rowIndex].staffSalary) || 0
      const expenses = parseFloat(updatedData[rowIndex].expenses) || 0
      const buildingRent = parseFloat(updatedData[rowIndex].buildingRent) || 0
      const dramaFee = parseFloat(updatedData[rowIndex].dramaFee) || 0
      const socialSupport = parseFloat(updatedData[rowIndex].socialSupport) || 0
      const electricity = parseFloat(updatedData[rowIndex].electricity) || 0
      const books = parseFloat(updatedData[rowIndex].books) || 0
      const clothes = parseFloat(updatedData[rowIndex].clothes) || 0
      const travel = parseFloat(updatedData[rowIndex].travel) || 0
      const transportation = parseFloat(updatedData[rowIndex].transportation) || 0
      
      updatedData[rowIndex].total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity + books + clothes + travel + transportation
    }
    
    setExpensesData(updatedData)
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

  const saveRowEdit = (rowIndex) => {
    const entry = expensesData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchExpensesData()
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

  // Handle field changes in edit modal with auto-calculation
  const handleModalFieldChange = (newData, fieldKey, value) => {
    // Auto-calculate total when any expense field changes
    if (['staffSalary', 'expenses', 'buildingRent', 'dramaFee', 'socialSupport', 'electricity', 'books', 'clothes', 'travel', 'transportation'].includes(fieldKey)) {
      const staffSalary = parseFloat(newData.staffSalary) || 0
      const expenses = parseFloat(newData.expenses) || 0
      const buildingRent = parseFloat(newData.buildingRent) || 0
      const dramaFee = parseFloat(newData.dramaFee) || 0
      const socialSupport = parseFloat(newData.socialSupport) || 0
      const electricity = parseFloat(newData.electricity) || 0
      const books = parseFloat(newData.books) || 0
      const clothes = parseFloat(newData.clothes) || 0
      const travel = parseFloat(newData.travel) || 0
      const transportation = parseFloat(newData.transportation) || 0
      
      newData.total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity + books + clothes + travel + transportation
    }
    
    return newData
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
      key: 'dramaFee',
      label: t('monthlyExpenses.fields.dramaFee', language),
      labelKu: t('monthlyExpenses.fields.dramaFee', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'socialSupport',
      label: t('monthlyExpenses.fields.socialSupport', language),
      labelKu: t('monthlyExpenses.fields.socialSupport', 'kurdish'),
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
      key: 'books',
      label: t('monthlyExpenses.fields.books', language),
      labelKu: t('monthlyExpenses.fields.books', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'clothes',
      label: t('monthlyExpenses.fields.clothes', language),
      labelKu: t('monthlyExpenses.fields.clothes', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'travel',
      label: t('monthlyExpenses.fields.travel', language),
      labelKu: t('monthlyExpenses.fields.travel', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'transportation',
      label: t('monthlyExpenses.fields.transportation', language),
      labelKu: t('monthlyExpenses.fields.transportation', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'total',
      label: t('monthlyExpenses.fields.total', language),
      labelKu: t('monthlyExpenses.fields.total', 'kurdish'),
      type: 'number',
      placeholder: '0',
      readOnly: true,
      span: 'full'
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

  // Versioned key forces table to re-render when data changes
  const tableKey = useMemo(() => `monthly-expenses-${tableVersion}`, [tableVersion])

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
                        onClick={async () => {
                          // Scroll to center before opening image preview
                          await scrollToCenter()
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
        key: 'dramaFee',
        header: t('monthlyExpenses.fields.dramaFee', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-yellow-600 dark:text-yellow-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'socialSupport',
        header: t('monthlyExpenses.fields.socialSupport', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-emerald-600 dark:text-emerald-400">{parseFloat(value || 0).toLocaleString()}</span>
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
        key: 'books',
        header: t('monthlyExpenses.fields.books', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-indigo-600 dark:text-indigo-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'clothes',
        header: t('monthlyExpenses.fields.clothes', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-pink-600 dark:text-pink-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'travel',
        header: t('monthlyExpenses.fields.travel', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-teal-600 dark:text-teal-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'transportation',
        header: t('monthlyExpenses.fields.transportation', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-cyan-600 dark:text-cyan-400">{parseFloat(value || 0).toLocaleString()}</span>
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
          maxRowsPerPage={10}
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
      localStorage.setItem('expenses_auth', 'true')
      setAuthUsername('')
      setAuthPassword('')
    } else {
      setAuthError('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە / Username or password is incorrect')
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title={t('monthlyExpenses.title', language)} titleKu={t('monthlyExpenses.title', 'kurdish')}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">پوختی حساباتی مانگانە</h2>
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
      <PageLayout title={t('monthlyExpenses.title', language)} titleKu={t('monthlyExpenses.title', 'kurdish')}>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('monthlyExpenses.title', language)} titleKu={t('monthlyExpenses.title', 'kurdish')}>
      {/* Total Monthly Expenses Filter - Moved to Top */}
      <Card className="mb-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="font-semibold text-red-700 dark:text-red-300">
                  {t('monthlyExpenses.summary.totalMonthlyExpenses', language)} Filter / 
                  {t('monthlyExpenses.summary.totalMonthlyExpenses', 'kurdish')} فلتەر:
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.year', language)}:</Label>
                <Select value={summaryYear} onValueChange={setSummaryYear}>
                  <SelectTrigger className="w-32 border-red-300 focus:ring-red-500">
                    <SelectValue placeholder={t('monthlyExpenses.summary.allYears', 'kurdish')} />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                    <SelectItem value="all-years">{t('monthlyExpenses.summary.allYears', language)} / {t('monthlyExpenses.summary.allYears', 'kurdish')}</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.month', language)}:</Label>
                <Select value={summaryMonth} onValueChange={setSummaryMonth}>
                  <SelectTrigger className="w-40 border-red-300 focus:ring-red-500">
                    <SelectValue placeholder={t('monthlyExpenses.summary.allMonths', 'kurdish')} />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                    <SelectItem value="all-months">{t('monthlyExpenses.summary.allMonths', language)} / {t('monthlyExpenses.summary.allMonths', 'kurdish')}</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {month} - {getMonthName(month).split(' ')[1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t('monthlyExpenses.summary.totalMonthlyExpenses', language)}
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
              placeholder={t('monthlyExpenses.searchPlaceholder', language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Year and Month Filters - Controls both table AND total */}
          <div className="flex items-center gap-3 border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-blue-50/50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">{t('monthlyExpenses.fields.year', language)}:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('monthlyExpenses.summary.allYears', 'kurdish')} />
                </SelectTrigger>
                <SelectContent side="bottom" align="center" sideOffset={5}>
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
                <SelectContent side="bottom" align="center" sideOffset={5}>
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
              title="خەرجی مانگانە"
              titleKu="پوختی حساباتی مانگانە"
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              columns={[
                { key: 'year', header: t('monthlyExpenses.fields.year', 'kurdish') },
                { key: 'month', header: t('monthlyExpenses.fields.month', 'kurdish') },
                { key: 'requirement', header: t('monthlyExpenses.fields.requirement', 'kurdish') },
                { key: 'staffSalary', header: t('monthlyExpenses.fields.staffSalary', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'expenses', header: t('monthlyExpenses.fields.expenses', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'buildingRent', header: t('monthlyExpenses.fields.buildingRent', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'dramaFee', header: t('monthlyExpenses.fields.dramaFee', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'socialSupport', header: t('monthlyExpenses.fields.socialSupport', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'electricity', header: t('monthlyExpenses.fields.electricity', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'books', header: t('monthlyExpenses.fields.books', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'clothes', header: t('monthlyExpenses.fields.clothes', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'travel', header: t('monthlyExpenses.fields.travel', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'transportation', header: t('monthlyExpenses.fields.transportation', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'total', header: t('monthlyExpenses.fields.total', 'kurdish'), render: (value) => value.toLocaleString() },
                { key: 'notes', header: t('monthlyExpenses.fields.notes', 'kurdish') }
              ]}
              showTotal={true}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <Button 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddEntry}
              >
                <Plus className="h-4 w-4" />
                {t('monthlyExpenses.addButton', language)}
              </Button>
            <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-2xl max-h-[90vh] overflow-y-auto z-[100]">
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
                        const total = value + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
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
                        const total = parseFloat(updatedEntry.staffSalary) + value + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
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
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + value + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dramaFee">{t('monthlyExpenses.fields.dramaFee', language)}</Label>
                    <Input
                      id="dramaFee"
                      type="number"
                      value={newEntry.dramaFee}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, dramaFee: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + value + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="socialSupport">{t('monthlyExpenses.fields.socialSupport', language)}</Label>
                    <Input
                      id="socialSupport"
                      type="number"
                      value={newEntry.socialSupport}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, socialSupport: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + value + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
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
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + value + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="books">{t('monthlyExpenses.fields.books', language)}</Label>
                    <Input
                      id="books"
                      type="number"
                      value={newEntry.books}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, books: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + value + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clothes">{t('monthlyExpenses.fields.clothes', language)}</Label>
                    <Input
                      id="clothes"
                      type="number"
                      value={newEntry.clothes}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, clothes: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + value + parseFloat(updatedEntry.travel) + parseFloat(updatedEntry.transportation)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="travel">{t('monthlyExpenses.fields.travel', language)}</Label>
                    <Input
                      id="travel"
                      type="number"
                      value={newEntry.travel}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, travel: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + value + parseFloat(updatedEntry.transportation)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transportation">{t('monthlyExpenses.fields.transportation', language)}</Label>
                    <Input
                      id="transportation"
                      type="number"
                      value={newEntry.transportation}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, transportation: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity) + parseFloat(updatedEntry.books) + parseFloat(updatedEntry.clothes) + parseFloat(updatedEntry.travel) + value
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
        onFieldChange={handleModalFieldChange}
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

      {/* Enhanced Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
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
                </div>
                <div className="flex items-center gap-2">
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
                    onClick={() => setPreviewImage(null)}
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
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={previewImage.url}
                        alt={previewImage.originalName || 'Receipt Preview'}
                        className="image-preview-main max-w-full max-h-[calc(95vh-300px)] object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300 rounded-lg shadow-2xl"
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
                              navigator.clipboard.writeText(previewImage.url).then(() => {
                                // Show success feedback
                                const notification = document.createElement('div')
                                notification.className = 'fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg'
                                notification.textContent = 'URL copied to clipboard!'
                                document.body.appendChild(notification)
                                setTimeout(() => document.body.removeChild(notification), 3000)
                              })
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          Share / Copy URL
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
                                    <h2>وەسڵ - Receipt Image - Monthly Expenses</h2>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            // Open image in new tab for full screen viewing
                            window.open(previewImage.url, '_blank')
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open in New Tab
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            // Rotate image
                            const img = document.querySelector('.image-preview-main')
                            if (img) {
                              const currentRotation = img.style.transform.match(/rotate\((\d+)deg\)/)
                              const rotation = currentRotation ? parseInt(currentRotation[1]) + 90 : 90
                              img.style.transform = `rotate(${rotation % 360}deg)`
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 hover:border-indigo-700 transition-all duration-200"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Rotate
                        </Button>
                      </div>

                      {/* Zoom instructions */}
                      <div className="text-center text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                        <p className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Click on the image to zoom in/out • Scroll to navigate when zoomed
                        </p>
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
      
      {/* CSS to prevent dropdown scroll issues and ensure modal positioning */}
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
        
        /* Force modal proper positioning regardless of page scroll */
        [data-radix-dialog-content] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 95vh !important;
          z-index: 100 !important;
        }
        
        /* Ensure modal overlay covers full viewport */
        [data-radix-dialog-overlay] {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 99 !important;
        }
        
        /* Prevent body scroll when modal is open */
        body:has([data-radix-dialog-content]) {
          overflow: hidden !important;
        }
      `}</style>
    </PageLayout>
  )
}