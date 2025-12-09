'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, DollarSign, RefreshCw, Languages } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'

export default function PayrollPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()
  
  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Check for existing authentication on mount
  useEffect(() => {
    const payrollAuth = localStorage.getItem('payroll_auth')
    if (payrollAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])
  
  const [payrollData, setPayrollData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [summaryYear, setSummaryYear] = useState('')
  const [summaryMonth, setSummaryMonth] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [newEntry, setNewEntry] = useState({
    employeeName: '',
    salary: 0,
    absence: 0,
    deduction: 0,
    bonus: 0,
    total: 0,
    month: '',
    year: '',
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'employeeName', weight: 0.3 },
        { name: 'salary', weight: 0.15 },
        { name: 'absence', weight: 0.1 },
        { name: 'deduction', weight: 0.1 },
        { name: 'bonus', weight: 0.1 },
        { name: 'total', weight: 0.15 },
        { name: 'month', weight: 0.15 },
        { name: 'year', weight: 0.15 },
        { name: 'notes', weight: 0.1 },
        // Enhanced search patterns for better matching
        { name: 'searchableContent', weight: 0.2, getFn: (obj) => {
          return [
            obj.employeeName || '',
            obj.salary ? obj.salary.toString() : '',
            obj.absence ? obj.absence.toString() : '',
            obj.deduction ? obj.deduction.toString() : '',
            obj.bonus ? obj.bonus.toString() : '',
            obj.total ? obj.total.toString() : '',
            obj.month || '',
            obj.year || '',
            obj.notes || '',
            // Context keywords for enhanced search
            obj.salary ? 'موچە salary' : '',
            obj.absence ? 'نەھاتن absence' : '',
            obj.deduction ? 'سزا deduction' : '',
            obj.bonus ? 'پاداشت bonus' : ''
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
    return new Fuse(payrollData, options)
  }, [payrollData])

  // Fetch payroll data from API
  useEffect(() => {
    fetchPayrollData()
  }, [])

  const fetchPayrollData = async () => {
    try {
      const response = await fetch('/api/payroll')
      if (response.ok) {
        const data = await response.json()
        setPayrollData(data)
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions
    if (isSaving) {
      return false
    }
    
    setIsSaving(true)
    
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('payroll-')) {
        // Update existing entry
        response = await fetch(`/api/payroll/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('payroll-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/payroll', {
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
        setPayrollData(prevData => {
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
        setEditingRow(null)
        resetNewEntry()
        return true
      } else {
        console.error('Failed to save entry:', response.statusText)
        return false
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('payroll-')) {
        // Remove from local state only if it's a temporary entry
        setPayrollData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/payroll/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPayrollData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      employeeName: '',
      salary: 0,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 0,
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...payrollData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when salary, absence, deduction, or bonus changes
    if (['salary', 'absence', 'deduction', 'bonus'].includes(field)) {
      const salary = parseFloat(updatedData[rowIndex].salary) || 0
      const absence = parseFloat(updatedData[rowIndex].absence) || 0
      const deduction = parseFloat(updatedData[rowIndex].deduction) || 0
      const bonus = parseFloat(updatedData[rowIndex].bonus) || 0
      
      updatedData[rowIndex].total = salary - absence - deduction + bonus
    }
    
    setPayrollData(updatedData)
  }

  const scrollToCenter = () => {
    const viewport = window.innerHeight
    const centerPosition = document.documentElement.scrollHeight / 2 - viewport / 2
    
    window.scrollTo({
      top: Math.max(0, centerPosition),
      behavior: 'smooth'
    })
  }

  const startEditing = (idOrIndex) => {
    // First scroll to center quickly, then open modal
    scrollToCenter()
    
    // Small delay to allow smooth scroll to start before opening modal
    setTimeout(() => {
      // Check if the parameter is an index (number less than data length) or an ID (string/UUID)
      let entry
      if (typeof idOrIndex === 'number' && idOrIndex < filteredData.length) {
        // It's an index from mobile card view
        entry = filteredData[idOrIndex]
      } else {
        // It's an ID from table view - find the entry by ID in filteredData
        entry = filteredData.find(item => item.id === idOrIndex)
      }
      
      if (entry) {
        // Create a deep copy of the entry to avoid reference issues
        setEditingData({...entry})
        setIsEditModalOpen(true)
      }
    }, 200)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = payrollData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // No need to refresh - just cancel editing
  }

  const handleModalSave = async (editedData) => {
    const success = await saveEntry(editedData)
    if (success) {
      setIsEditModalOpen(false)
      setEditingData(null)
    }
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
      key: 'employeeName',
      label: t('payroll.fields.employeeName', language),
      labelKu: t('payroll.fields.employeeName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter employee name'
    },
    {
      key: 'salary',
      label: t('payroll.fields.salary', language),
      labelKu: t('payroll.fields.salary', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'absence',
      label: t('payroll.fields.absence', language),
      labelKu: t('payroll.fields.absence', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'deduction',
      label: t('payroll.fields.deduction', language),
      labelKu: t('payroll.fields.deduction', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'bonus',
      label: t('payroll.fields.bonus', language),
      labelKu: t('payroll.fields.bonus', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'total',
      label: t('payroll.fields.total', language),
      labelKu: t('payroll.fields.total', 'kurdish'),
      type: 'number',
      placeholder: '0',
      readOnly: true
    },
    {
      key: 'month',
      label: t('payroll.fields.month', language),
      labelKu: t('payroll.fields.month', 'kurdish'),
      type: 'text',
      placeholder: 'Enter month'
    },
    {
      key: 'year',
      label: t('payroll.fields.year', language),
      labelKu: t('payroll.fields.year', 'kurdish'),
      type: 'text',
      placeholder: 'Enter year'
    },
    {
      key: 'notes',
      label: t('payroll.fields.notes', language),
      labelKu: t('payroll.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'Additional notes...',
      span: 'full'
    }
  ]

  // FIRST FILTER - Controls only the summary calculation (affected by summaryYear and summaryMonth)
  const summaryPayroll = useMemo(() => {
    let data = payrollData

    if (summaryYear && summaryYear !== "all-years") {
      data = data.filter(item => item.year === summaryYear)
    }
    if (summaryMonth && summaryMonth !== "all-months") {
      data = data.filter(item => item.month === summaryMonth)
    }

    return data.reduce((sum, entry) => sum + (parseFloat(entry.salary) || 0), 0)
  }, [payrollData, summaryYear, summaryMonth])

  // SECOND FILTER - Controls both table and Total Payroll (Main filters + search)
  const filteredData = useMemo(() => {
    let data = payrollData

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
        { name: 'employeeName', weight: 0.3 },
        { name: 'salary', weight: 0.15 },
        { name: 'absence', weight: 0.1 },
        { name: 'deduction', weight: 0.1 },
        { name: 'bonus', weight: 0.1 },
        { name: 'total', weight: 0.15 },
        { name: 'month', weight: 0.15 },
        { name: 'year', weight: 0.15 },
        { name: 'notes', weight: 0.1 },
        { name: 'searchableContent', weight: 0.2, getFn: (obj) => {
          return [
            obj.employeeName || '',
            obj.salary ? obj.salary.toString() : '',
            obj.absence ? obj.absence.toString() : '',
            obj.deduction ? obj.deduction.toString() : '',
            obj.bonus ? obj.bonus.toString() : '',
            obj.total ? obj.total.toString() : '',
            obj.month || '',
            obj.year || '',
            obj.notes || '',
            obj.salary ? 'موچە salary' : '',
            obj.absence ? 'نەھاتن absence' : '',
            obj.deduction ? 'سزا deduction' : '',
            obj.bonus ? 'پاداشت bonus' : ''
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
  }, [fuse, searchTerm, payrollData, selectedYear, selectedMonth])

  // Calculate totals for summary
  const totalSalary = useMemo(() => 
    filteredData.reduce((sum, entry) => sum + (parseFloat(entry.salary) || 0), 0)
  , [filteredData])

  const totalDeductions = useMemo(() => 
    filteredData.reduce((sum, entry) => sum + (parseFloat(entry.absence) || 0) + (parseFloat(entry.deduction) || 0), 0)
  , [filteredData])

  const totalBonuses = useMemo(() => 
    filteredData.reduce((sum, entry) => sum + (parseFloat(entry.bonus) || 0), 0)
  , [filteredData])

  const grandTotal = useMemo(() => 
    totalSalary - totalDeductions + totalBonuses
  , [totalSalary, totalDeductions, totalBonuses])

  // Get unique years and months for dropdowns
  const availableYears = useMemo(() => {
    const years = [...new Set(payrollData.map(item => item.year).filter(Boolean))].sort((a, b) => b.localeCompare(a))
    return years
  }, [payrollData])

  const availableMonths = useMemo(() => {
    const months = [...new Set(payrollData.map(item => item.month).filter(Boolean))].sort((a, b) => {
      // Convert to number for proper sorting
      const aNum = parseInt(a) || 0
      const bNum = parseInt(b) || 0
      return aNum - bNum
    })
    return months
  }, [payrollData])

  function PayrollCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.employeeName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">{t('payroll.fields.salary', language)}:</span> <span className="text-green-600 dark:text-green-400">{parseFloat(entry.salary || 0).toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('payroll.fields.absence', language)}:</span> <span className="text-red-600 dark:text-red-400">{parseFloat(entry.absence || 0).toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('payroll.fields.deduction', language)}:</span> <span className="text-red-600 dark:text-red-400">{parseFloat(entry.deduction || 0).toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('payroll.fields.bonus', language)}:</span> <span className="text-purple-600 dark:text-purple-400">{parseFloat(entry.bonus || 0).toLocaleString()}</span></div>
                <div><span className="font-semibold">{t('payroll.fields.month', language)}:</span> <span className="text-indigo-600 dark:text-indigo-400">{entry.month || '-'}</span></div>
                <div><span className="font-semibold">{t('payroll.fields.year', language)}:</span> <span className="text-indigo-600 dark:text-indigo-400">{entry.year || '-'}</span></div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{t('payroll.fields.notes', language)}:</span> {entry.notes}
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

  const PayrollTableView = ({ data }) => {
    // Define table columns for payroll - using useMemo to ensure translation updates when language changes
    const columns = useMemo(() => [
      {
        key: 'employeeName',
        header: t('payroll.fields.employeeName', language),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'salary',
        header: t('payroll.fields.salary', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'absence',
        header: t('payroll.fields.absence', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'deduction',
        header: t('payroll.fields.deduction', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'bonus',
        header: t('payroll.fields.bonus', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-purple-600 dark:text-purple-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'total',
        header: t('payroll.fields.total', language),
        align: 'center',
        editable: false,
        render: (value) => <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'month',
        header: t('payroll.fields.month', language),
        align: 'center',
        editable: true,
        render: (value) => <span className="font-medium text-indigo-600 dark:text-indigo-400">{value || '-'}</span>
      },
      {
        key: 'year',
        header: t('payroll.fields.year', language),
        align: 'center',
        editable: true,
        render: (value) => <span className="font-medium text-indigo-600 dark:text-indigo-400">{value || '-'}</span>
      },
      {
        key: 'notes',
        header: t('payroll.fields.notes', language),
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
    ], [language]) // Re-create columns when language changes

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
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('payroll.summary.baseSalary', language)}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalSalary.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('payroll.summary.deductions', language)}</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{totalDeductions.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('payroll.summary.bonuses', language)}</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalBonuses.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('payroll.summary.grandTotal', language)}</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{grandTotal.toLocaleString()}</p>
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
      localStorage.setItem('payroll_auth', 'true')
      setAuthUsername('')
      setAuthPassword('')
    } else {
      setAuthError('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە / Username or password is incorrect')
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title={t('payroll.title', language)} titleKu={t('payroll.title', 'kurdish')}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">لیستی بڕی موچە</h2>
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
      <PageLayout title={t('payroll.title', language)} titleKu={t('payroll.title', 'kurdish')}>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('payroll.title', language)} titleKu={t('payroll.title', 'kurdish')}>
      {/* Total Payroll Filter - First Filter */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label className="font-semibold text-green-700 dark:text-green-300">
                  {t('payroll.summary.totalPayroll', language) || 'کۆی گشتی بڕی موچە'} Filter / 
                  {t('payroll.summary.totalPayroll', 'kurdish') || 'کۆی گشتی بڕی موچە'} فلتەر:
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">{t('payroll.fields.year', language) || 'ساڵ'}:</Label>
                <Select value={summaryYear} onValueChange={setSummaryYear}>
                  <SelectTrigger className="w-32 border-green-300 focus:ring-green-500">
                    <SelectValue placeholder="هەموو ساڵەکان" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                    <SelectItem value="all-years">هەموو ساڵەکان / All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">{t('payroll.fields.month', language) || 'مانگ'}:</Label>
                <Select value={summaryMonth} onValueChange={setSummaryMonth}>
                  <SelectTrigger className="w-40 border-green-300 focus:ring-green-500">
                    <SelectValue placeholder="هەموو مانگەکان" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="center" sideOffset={5} position="popper" avoidCollisions={true}>
                    <SelectItem value="all-months">هەموو مانگەکان / All Months</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {t('payroll.summary.totalPayroll', language) || 'کۆی گشتی بڕی موچە'}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summaryPayroll.toLocaleString()} د.ع
              </p>
              <p className="text-xs text-green-500">
                {(summaryYear && summaryYear !== "all-years") || (summaryMonth && summaryMonth !== "all-months") 
                  ? `Filtered: ${summaryYear !== "all-years" ? summaryYear : 'All Years'} - ${summaryMonth !== "all-months" ? summaryMonth : 'All Months'}`
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
            placeholder={t('payroll.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Year and Month Filters - Controls both table AND total */}
        <div className="flex items-center gap-3 border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-blue-50/50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">{t('payroll.fields.year', language) || 'ساڵ'}:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="هەموو ساڵەکان" />
              </SelectTrigger>
              <SelectContent side="bottom" align="center" sideOffset={5}>
                <SelectItem value="all-years">هەموو ساڵەکان / All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">{t('payroll.fields.month', language) || 'مانگ'}:</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="هەموو مانگەکان" />
              </SelectTrigger>
              <SelectContent side="bottom" align="center" sideOffset={5}>
                <SelectItem value="all-months">هەموو مانگەکان / All Months</SelectItem>
                {availableMonths.map(month => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="payroll-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="payroll-records"
            title={t('payroll.title', language)}
            titleKu={t('payroll.title', 'kurdish')}
            selectedMonth={selectedMonth !== "all-months" ? selectedMonth : null}
            selectedYear={selectedYear !== "all-years" ? selectedYear : null}
            columns={[
              { key: 'employeeName', header: t('payroll.fields.employeeName', 'kurdish') },
              { key: 'salary', header: t('payroll.fields.salary', 'kurdish'), render: (value) => value.toLocaleString() },
              { key: 'absence', header: t('payroll.fields.absence', 'kurdish'), render: (value) => value.toLocaleString() },
              { key: 'deduction', header: t('payroll.fields.deduction', 'kurdish'), render: (value) => value.toLocaleString() },
              { key: 'bonus', header: t('payroll.fields.bonus', 'kurdish'), render: (value) => value.toLocaleString() },
              { key: 'total', header: t('payroll.fields.total', 'kurdish'), render: (value) => value.toLocaleString() },
              { key: 'month', header: t('payroll.fields.month', 'kurdish') },
              { key: 'year', header: t('payroll.fields.year', 'kurdish') },
              { key: 'notes', header: t('payroll.fields.notes', 'kurdish') }
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
                {t('payroll.addButton', language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('payroll.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employeeName">{t('payroll.fields.employeeName', language)}</Label>
                  <Input
                    id="employeeName"
                    value={newEntry.employeeName}
                    onChange={(e) => setNewEntry({...newEntry, employeeName: e.target.value})}
                    placeholder="ناوی کارمەند بنووسە"
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">{t('payroll.fields.salary', language)}</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newEntry.salary}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, salary: value}
                        const total = value - parseFloat(updatedEntry.absence) - parseFloat(updatedEntry.deduction) + parseFloat(updatedEntry.bonus)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="absence">{t('payroll.fields.absence', language)}</Label>
                    <Input
                      id="absence"
                      type="number"
                      value={newEntry.absence}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, absence: value}
                        const total = parseFloat(updatedEntry.salary) - value - parseFloat(updatedEntry.deduction) + parseFloat(updatedEntry.bonus)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deduction">{t('payroll.fields.deduction', language)}</Label>
                    <Input
                      id="deduction"
                      type="number"
                      value={newEntry.deduction}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, deduction: value}
                        const total = parseFloat(updatedEntry.salary) - parseFloat(updatedEntry.absence) - value + parseFloat(updatedEntry.bonus)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonus">{t('payroll.fields.bonus', language)}</Label>
                    <Input
                      id="bonus"
                      type="number"
                      value={newEntry.bonus}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, bonus: value}
                        const total = parseFloat(updatedEntry.salary) - parseFloat(updatedEntry.absence) - parseFloat(updatedEntry.deduction) + value
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="total">{t('payroll.fields.total', language)}</Label>
                  <Input
                    id="total"
                    type="number"
                    value={newEntry.total}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 read-only:bg-gray-50 dark:read-only:bg-gray-800 read-only:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="month">{t('payroll.fields.month', language)}</Label>
                    <Input
                      id="month"
                      value={newEntry.month}
                      onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                      placeholder="مانگ بنووسە"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">{t('payroll.fields.year', language)}</Label>
                    <Input
                      id="year"
                      value={newEntry.year}
                      onChange={(e) => setNewEntry({...newEntry, year: e.target.value})}
                      placeholder="ساڵ بنووسە"
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">{t('payroll.fields.notes', language)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی زیاتر..."
                    rows={3}
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}
                    disabled={isSaving}
                  >
                    {t('payroll.buttons.cancel', language)}
                  </Button>
                  <Button 
                    onClick={() => saveEntry(newEntry)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'پاشەکەوتکردن... / Saving...' : t('payroll.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
        title={t('payroll.buttons.edit', language)}
        titleKu={t('payroll.buttons.edit', 'kurdish')}
        isSaving={isSaving}
        onFieldChange={(newData, fieldKey, value) => {
          // Recalculate total whenever salary, absence, deduction, or bonus changes
          if (['salary', 'absence', 'deduction', 'bonus'].includes(fieldKey)) {
            const salary = parseFloat(newData.salary) || 0
            const absence = parseFloat(newData.absence) || 0
            const deduction = parseFloat(newData.deduction) || 0
            const bonus = parseFloat(newData.bonus) || 0
            
            newData.total = salary - absence - deduction + bonus
          }
          
          return newData
        }}
      />

      {/* Payroll Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <PayrollCardView data={filteredData} />
        ) : (
          <PayrollTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('payroll.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('payroll.noData.message', language) : t('payroll.noData.emptyMessage', language)}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}