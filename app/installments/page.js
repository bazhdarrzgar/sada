'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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

export default function InstallmentsPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()

  // Password protection states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Check for existing authentication on mount
  useEffect(() => {
    const installmentsAuth = localStorage.getItem('installments_auth')
    if (installmentsAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const [installmentsData, setInstallmentsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [newEntry, setNewEntry] = useState({
    fullName: '',
    grade: '',
    installmentType: '',
    annualAmount: '',
    firstInstallment: 0,
    secondInstallment: 0,
    thirdInstallment: 0,
    fourthInstallment: 0,
    fifthInstallment: 0,
    sixthInstallment: 0,
    totalReceived: 0,
    remaining: 0,
    receiptImages: [],
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'fullName', weight: 0.3 }, // High weight for student name
        { name: 'grade', weight: 0.2 }, // Grade field
        { name: 'installmentType', weight: 0.25 }, // Installment type
        // Individual installment amounts for precise searching
        { name: 'annualAmount', weight: 0.1 },
        { name: 'firstInstallment', weight: 0.05 },
        { name: 'secondInstallment', weight: 0.05 },
        { name: 'thirdInstallment', weight: 0.05 },
        { name: 'fourthInstallment', weight: 0.05 },
        { name: 'fifthInstallment', weight: 0.05 },
        { name: 'sixthInstallment', weight: 0.05 },
        { name: 'totalReceived', weight: 0.1 },
        { name: 'remaining', weight: 0.1 },
        // Include ID for technical searches
        { name: 'id', weight: 0.05 },
        // Custom comprehensive search field
        {
          name: 'searchableContent', weight: 0.25, getFn: (obj) => {
            return [
              obj.fullName || '',
              obj.grade || '',
              obj.installmentType || '',
              // Add all numeric values as strings for better searching
              obj.annualAmount ? obj.annualAmount.toString() : '',
              obj.firstInstallment ? obj.firstInstallment.toString() : '',
              obj.secondInstallment ? obj.secondInstallment.toString() : '',
              obj.thirdInstallment ? obj.thirdInstallment.toString() : '',
              obj.fourthInstallment ? obj.fourthInstallment.toString() : '',
              obj.fifthInstallment ? obj.fifthInstallment.toString() : '',
              obj.sixthInstallment ? obj.sixthInstallment.toString() : '',
              obj.totalReceived ? obj.totalReceived.toString() : '',
              obj.remaining ? obj.remaining.toString() : '',
              // Add formatted amounts for localized searching
              obj.annualAmount ? parseFloat(obj.annualAmount).toLocaleString() : '',
              obj.totalReceived ? parseFloat(obj.totalReceived).toLocaleString() : '',
              obj.remaining ? parseFloat(obj.remaining).toLocaleString() : '',
              // Add payment status indicators
              obj.remaining ? (parseFloat(obj.remaining) > 0 ? 'unpaid نەدراو باقی' : parseFloat(obj.remaining) === 0 ? 'paid تەواو درا' : 'overpaid زیاد درا') : '',
              // Add progress indicators
              obj.annualAmount && obj.totalReceived ?
                `${Math.round((parseFloat(obj.totalReceived) / parseFloat(obj.annualAmount)) * 100)}% پەرسەند percent` : ''
            ].join(' ').toLowerCase()
          }
        }
      ],
      threshold: 0.3, // Lower threshold = more exact matches
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    }
    return new Fuse(installmentsData, options)
  }, [installmentsData])

  // Fetch installments data from API
  useEffect(() => {
    fetchInstallmentsData()
  }, [])

  const fetchInstallmentsData = async () => {
    try {
      const response = await fetch('/api/installments')
      if (response.ok) {
        const data = await response.json()
        setInstallmentsData(data)
      }
    } catch (error) {
      console.error('Error fetching installments data:', error)
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
      console.log('saveEntry called with:', entry)
      console.log('Entry ID:', entry.id)
      console.log('Is temporary ID?:', entry.id?.startsWith('installment-'))

      // Calculate totals
      const annualAmount = parseFloat(entry.annualAmount) || 0
      const first = parseFloat(entry.firstInstallment) || 0
      const second = parseFloat(entry.secondInstallment) || 0
      const third = parseFloat(entry.thirdInstallment) || 0
      const fourth = parseFloat(entry.fourthInstallment) || 0
      const fifth = parseFloat(entry.fifthInstallment) || 0
      const sixth = parseFloat(entry.sixthInstallment) || 0

      entry.totalReceived = first + second + third + fourth + fifth + sixth
      entry.remaining = annualAmount - entry.totalReceived

      let response

      if (entry.id && !entry.id.startsWith('installment-')) {
        // Update existing entry
        console.log('Updating existing entry with ID:', entry.id)
        response = await fetch(`/api/installments/${entry.id}`, {
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
        if (entryToSave.id && entryToSave.id.startsWith('installment-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }

        response = await fetch('/api/installments', {
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
        setInstallmentsData(prevData => {
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
      if (id.startsWith('installment-')) {
        // Remove from local state only if it's a temporary entry
        setInstallmentsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/installments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInstallmentsData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      fullName: '',
      grade: '',
      installmentType: '',
      annualAmount: '',
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 0,
      remaining: 0,
      receiptImages: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...installmentsData]
    updatedData[rowIndex][field] = value

    // Auto-calculate totals when installment amounts change
    if (['annualAmount', 'firstInstallment', 'secondInstallment', 'thirdInstallment', 'fourthInstallment', 'fifthInstallment', 'sixthInstallment'].includes(field)) {
      const annualAmount = parseFloat(updatedData[rowIndex].annualAmount) || 0
      const first = parseFloat(updatedData[rowIndex].firstInstallment) || 0
      const second = parseFloat(updatedData[rowIndex].secondInstallment) || 0
      const third = parseFloat(updatedData[rowIndex].thirdInstallment) || 0
      const fourth = parseFloat(updatedData[rowIndex].fourthInstallment) || 0
      const fifth = parseFloat(updatedData[rowIndex].fifthInstallment) || 0
      const sixth = parseFloat(updatedData[rowIndex].sixthInstallment) || 0

      updatedData[rowIndex].totalReceived = first + second + third + fourth + fifth + sixth
      updatedData[rowIndex].remaining = annualAmount - updatedData[rowIndex].totalReceived
    }

    setInstallmentsData(updatedData)
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

  const startEditing = (indexOrId) => {
    // First scroll to center, then open modal after a brief delay
    scrollToCenter()
    setTimeout(() => {
      // Handle both index (number) and ID (string) parameters
      let entry
      if (typeof indexOrId === 'number') {
        // Called from card view with index
        entry = filteredData[indexOrId]
      } else {
        // Called from table view with ID
        entry = installmentsData.find(item => item.id === indexOrId)
      }

      console.log('Starting edit for entry:', entry)
      console.log('Entry ID:', entry?.id)

      if (!entry) {
        console.error('Entry not found for indexOrId:', indexOrId)
        return
      }

      // Create a deep copy to ensure all data is properly passed
      const entryData = {
        ...entry,
        // Ensure numeric fields are properly set
        annualAmount: entry.annualAmount || 0,
        firstInstallment: entry.firstInstallment || 0,
        secondInstallment: entry.secondInstallment || 0,
        thirdInstallment: entry.thirdInstallment || 0,
        fourthInstallment: entry.fourthInstallment || 0,
        fifthInstallment: entry.fifthInstallment || 0,
        sixthInstallment: entry.sixthInstallment || 0,
        totalReceived: entry.totalReceived || 0,
        remaining: entry.remaining || 0,
        receiptImages: entry.receiptImages || [],
        notes: entry.notes || ''
      }
      setEditingData(entryData)
      setIsEditModalOpen(true)
    }, 300) // Small delay to allow scroll to start
  }

  const saveRowEdit = (rowIndex) => {
    const entry = installmentsData[rowIndex]
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

  // Handle field changes in edit modal with auto-calculation
  const handleModalFieldChange = (newData, fieldKey, value) => {
    // Auto-calculate totals when installment amounts or annual amount change
    if (['annualAmount', 'firstInstallment', 'secondInstallment', 'thirdInstallment', 'fourthInstallment', 'fifthInstallment', 'sixthInstallment'].includes(fieldKey)) {
      const annualAmount = parseFloat(newData.annualAmount) || 0
      const first = parseFloat(newData.firstInstallment) || 0
      const second = parseFloat(newData.secondInstallment) || 0
      const third = parseFloat(newData.thirdInstallment) || 0
      const fourth = parseFloat(newData.fourthInstallment) || 0
      const fifth = parseFloat(newData.fifthInstallment) || 0
      const sixth = parseFloat(newData.sixthInstallment) || 0

      newData.totalReceived = first + second + third + fourth + fifth + sixth
      newData.remaining = annualAmount - newData.totalReceived
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
      key: 'fullName',
      label: t('annualInstallments.fields.fullName', language),
      labelKu: t('annualInstallments.fields.fullName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter student name'
    },
    {
      key: 'grade',
      label: t('annualInstallments.fields.grade', language),
      labelKu: t('annualInstallments.fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter grade'
    },
    {
      key: 'installmentType',
      label: t('annualInstallments.fields.installmentType', language),
      labelKu: t('annualInstallments.fields.installmentType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter installment type'
    },
    {
      key: 'annualAmount',
      label: t('annualInstallments.fields.annualAmount', language),
      labelKu: t('annualInstallments.fields.annualAmount', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'firstInstallment',
      label: t('annualInstallments.fields.firstInstallment', language),
      labelKu: t('annualInstallments.fields.firstInstallment', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'secondInstallment',
      label: t('annualInstallments.fields.secondInstallment', language),
      labelKu: t('annualInstallments.fields.secondInstallment', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'thirdInstallment',
      label: t('annualInstallments.fields.thirdInstallment', language),
      labelKu: t('annualInstallments.fields.thirdInstallment', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'fourthInstallment',
      label: t('annualInstallments.fields.fourthInstallment', language),
      labelKu: t('annualInstallments.fields.fourthInstallment', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'fifthInstallment',
      label: t('annualInstallments.fields.fifthInstallment', language),
      labelKu: t('annualInstallments.fields.fifthInstallment', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'sixthInstallment',
      label: t('annualInstallments.fields.sixthInstallment', language),
      labelKu: t('annualInstallments.fields.sixthInstallment', 'kurdish'),
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'totalReceived',
      label: t('annualInstallments.fields.totalReceived', language),
      labelKu: t('annualInstallments.fields.totalReceived', 'kurdish'),
      type: 'number',
      placeholder: '0',
      readOnly: true
    },
    {
      key: 'remaining',
      label: t('annualInstallments.fields.remaining', language),
      labelKu: t('annualInstallments.fields.remaining', 'kurdish'),
      type: 'number',
      placeholder: '0',
      readOnly: true
    },
    {
      key: 'notes',
      label: t('annualInstallments.fields.notes', language),
      labelKu: t('annualInstallments.fields.notes', 'kurdish'),
      type: 'text',
      placeholder: 'تێبینی...'
    },
    {
      key: 'receiptImages',
      label: t('annualInstallments.fields.receiptImages', language),
      labelKu: t('annualInstallments.fields.receiptImages', 'kurdish'),
      type: 'image-upload',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return installmentsData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, installmentsData])

  // Calculate totals
  const totalAnnual = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.annualAmount) || 0), 0)
  const totalReceived = filteredData.reduce((sum, entry) => sum + (entry.totalReceived || 0), 0)
  const totalRemaining = filteredData.reduce((sum, entry) => sum + (entry.remaining || 0), 0)

  function InstallmentsCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.fullName}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">{t('annualInstallments.fields.grade', language)}:</span> {entry.grade}</div>
                <div><span className="font-semibold">{t('annualInstallments.fields.installmentType', language)}:</span> {entry.installmentType}</div>
              </div>
              <div className="border-t pt-2">
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div><span className="font-semibold">{t('annualInstallments.fields.annualAmount', language)}:</span> {entry.annualAmount.toLocaleString()} د.ع</div>
                  <div><span className="font-semibold">{t('annualInstallments.fields.totalReceived', language)}:</span> {entry.totalReceived.toLocaleString()} د.ع</div>
                  <div><span className="font-semibold text-red-600">{t('annualInstallments.fields.remaining', language)}:</span> {entry.remaining.toLocaleString()} د.ع</div>
                  {entry.notes && (
                    <div><span className="font-semibold">{t('annualInstallments.fields.notes', language)}:</span> {entry.notes}</div>
                  )}

                  {/* Receipt Images */}
                  {entry.receiptImages && entry.receiptImages.length > 0 && (
                    <div>
                      <span className="font-semibold">{t('annualInstallments.fields.receiptImages', language)}:</span>
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

  function InstallmentsTableView({ data }) {
    // Define table columns for installments
    const columns = [
      {
        key: 'fullName',
        header: t('annualInstallments.fields.fullName', language),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: t('annualInstallments.fields.grade', language),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'installmentType',
        header: t('annualInstallments.fields.installmentType', language),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'annualAmount',
        header: t('annualInstallments.fields.annualAmount', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'firstInstallment',
        header: t('annualInstallments.fields.firstInstallment', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'secondInstallment',
        header: t('annualInstallments.fields.secondInstallment', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'thirdInstallment',
        header: t('annualInstallments.fields.thirdInstallment', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'fourthInstallment',
        header: t('annualInstallments.fields.fourthInstallment', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'fifthInstallment',
        header: t('annualInstallments.fields.fifthInstallment', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'sixthInstallment',
        header: t('annualInstallments.fields.sixthInstallment', language),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'totalReceived',
        header: t('annualInstallments.fields.totalReceived', language),
        align: 'center',
        editable: false,
        render: (value) => <span className="font-bold text-green-600 dark:text-green-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'remaining',
        header: t('annualInstallments.fields.remaining', language),
        align: 'center',
        editable: false,
        render: (value) => {
          const amount = parseFloat(value || 0)
          return (
            <span className={`font-bold ${amount > 0 ? 'text-red-600 dark:text-red-400' : amount === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {amount.toLocaleString()}
            </span>
          )
        }
      },
      {
        key: 'notes',
        header: t('annualInstallments.fields.notes', language),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-gray-600 dark:text-gray-400">{value || '-'}</span>
      },
      {
        key: 'receiptImages',
        header: t('annualInstallments.fields.receiptImages', language),
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
          onSave={() => { }} // No inline save
          onCancel={() => { }} // No inline cancel
          onDelete={deleteEntry}
          onCellEdit={() => { }} // No inline cell edit
          maxRowsPerPage={10}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />

        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('annualInstallments.summary.totalAnnual', language)}</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalAnnual.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('annualInstallments.summary.totalReceived', language)}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalReceived.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('annualInstallments.summary.totalRemaining', language)}</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{totalRemaining.toLocaleString()}</p>
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
      localStorage.setItem('installments_auth', 'true')
      setAuthUsername('')
      setAuthPassword('')
    } else {
      setAuthError('ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە / Username or password is incorrect')
    }
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <PageLayout title={t('annualInstallments.title', language)} titleKu={t('annualInstallments.title', 'kurdish')}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">قیستی ساڵانە</h2>
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
      <PageLayout title={t('annualInstallments.title', language)} titleKu={t('annualInstallments.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('annualInstallments.title', language)} titleKu={t('annualInstallments.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('annualInstallments.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton
            data={filteredData}
            filename="installments-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton
            data={filteredData}
            filename="installments-records"
            title={t('annualInstallments.title', language)}
            titleKu={t('annualInstallments.title', 'kurdish')}
            columns={[
              { key: 'fullName', header: t('annualInstallments.fields.fullName', 'kurdish') },
              { key: 'grade', header: t('annualInstallments.fields.grade', 'kurdish') },
              { key: 'installmentType', header: t('annualInstallments.fields.installmentType', 'kurdish') },
              { key: 'annualAmount', header: t('annualInstallments.fields.annualAmount', 'kurdish'), render: (value) => parseFloat(value).toLocaleString() },
              { key: 'firstInstallment', header: t('annualInstallments.fields.firstInstallment', 'kurdish'), render: (value) => parseFloat(value || 0).toLocaleString() },
              { key: 'secondInstallment', header: t('annualInstallments.fields.secondInstallment', 'kurdish'), render: (value) => parseFloat(value || 0).toLocaleString() },
              { key: 'thirdInstallment', header: t('annualInstallments.fields.thirdInstallment', 'kurdish'), render: (value) => parseFloat(value || 0).toLocaleString() },
              { key: 'fourthInstallment', header: t('annualInstallments.fields.fourthInstallment', 'kurdish'), render: (value) => parseFloat(value || 0).toLocaleString() },
              { key: 'fifthInstallment', header: t('annualInstallments.fields.fifthInstallment', 'kurdish'), render: (value) => parseFloat(value || 0).toLocaleString() },
              { key: 'sixthInstallment', header: t('annualInstallments.fields.sixthInstallment', 'kurdish'), render: (value) => parseFloat(value || 0).toLocaleString() },
              { key: 'totalReceived', header: t('annualInstallments.fields.totalReceived', 'kurdish'), render: (value) => parseFloat(value).toLocaleString() },
              { key: 'remaining', header: t('annualInstallments.fields.remaining', 'kurdish'), render: (value) => parseFloat(value).toLocaleString() },
              { key: 'receiptImages', header: t('annualInstallments.fields.receiptImages', 'kurdish') },
              { key: 'notes', header: t('annualInstallments.fields.notes', 'kurdish') }
            ]}
            summaryItems={[
              { key: 'annualAmount', label: 'کۆی ساڵانە' },
              { key: 'totalReceived', label: 'کۆی وەرگیراو' },
              { key: 'remaining', label: 'کۆی ماوە' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                {t('annualInstallments.addButton', language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-4xl max-h-[90vh] overflow-y-auto z-[100]">
              <DialogHeader>
                <DialogTitle>{t('annualInstallments.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t('annualInstallments.fields.fullName', language)}</Label>
                  <Input
                    id="fullName"
                    value={newEntry.fullName}
                    onChange={(e) => setNewEntry({ ...newEntry, fullName: e.target.value })}
                    placeholder="Enter student name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">{t('annualInstallments.fields.grade', language)}</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({ ...newEntry, grade: e.target.value })}
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installmentType">{t('annualInstallments.fields.installmentType', language)}</Label>
                    <Input
                      id="installmentType"
                      value={newEntry.installmentType}
                      onChange={(e) => setNewEntry({ ...newEntry, installmentType: e.target.value })}
                      placeholder="Enter type"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="annualAmount">{t('annualInstallments.fields.annualAmount', language)}</Label>
                  <Input
                    id="annualAmount"
                    type="number"
                    value={newEntry.annualAmount}
                    onChange={(e) => {
                      const annualAmount = parseFloat(e.target.value) || 0
                      setNewEntry({
                        ...newEntry,
                        annualAmount: annualAmount,
                        remaining: annualAmount - newEntry.totalReceived
                      })
                    }}
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstInstallment">{t('annualInstallments.installmentNumbers.first', language)}</Label>
                    <Input
                      id="firstInstallment"
                      type="number"
                      value={newEntry.firstInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const totalReceived = value + newEntry.secondInstallment + newEntry.thirdInstallment + newEntry.fourthInstallment + newEntry.fifthInstallment + newEntry.sixthInstallment
                        setNewEntry({
                          ...newEntry,
                          firstInstallment: value,
                          totalReceived: totalReceived,
                          remaining: parseFloat(newEntry.annualAmount) - totalReceived
                        })
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondInstallment">{t('annualInstallments.installmentNumbers.second', language)}</Label>
                    <Input
                      id="secondInstallment"
                      type="number"
                      value={newEntry.secondInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const totalReceived = newEntry.firstInstallment + value + newEntry.thirdInstallment + newEntry.fourthInstallment + newEntry.fifthInstallment + newEntry.sixthInstallment
                        setNewEntry({
                          ...newEntry,
                          secondInstallment: value,
                          totalReceived: totalReceived,
                          remaining: parseFloat(newEntry.annualAmount) - totalReceived
                        })
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thirdInstallment">{t('annualInstallments.installmentNumbers.third', language)}</Label>
                    <Input
                      id="thirdInstallment"
                      type="number"
                      value={newEntry.thirdInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const totalReceived = newEntry.firstInstallment + newEntry.secondInstallment + value + newEntry.fourthInstallment + newEntry.fifthInstallment + newEntry.sixthInstallment
                        setNewEntry({
                          ...newEntry,
                          thirdInstallment: value,
                          totalReceived: totalReceived,
                          remaining: parseFloat(newEntry.annualAmount) - totalReceived
                        })
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fourthInstallment">{t('annualInstallments.installmentNumbers.fourth', language)}</Label>
                    <Input
                      id="fourthInstallment"
                      type="number"
                      value={newEntry.fourthInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const totalReceived = newEntry.firstInstallment + newEntry.secondInstallment + newEntry.thirdInstallment + value + newEntry.fifthInstallment + newEntry.sixthInstallment
                        setNewEntry({
                          ...newEntry,
                          fourthInstallment: value,
                          totalReceived: totalReceived,
                          remaining: parseFloat(newEntry.annualAmount) - totalReceived
                        })
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fifthInstallment">{t('annualInstallments.installmentNumbers.fifth', language)}</Label>
                    <Input
                      id="fifthInstallment"
                      type="number"
                      value={newEntry.fifthInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const totalReceived = newEntry.firstInstallment + newEntry.secondInstallment + newEntry.thirdInstallment + newEntry.fourthInstallment + value + newEntry.sixthInstallment
                        setNewEntry({
                          ...newEntry,
                          fifthInstallment: value,
                          totalReceived: totalReceived,
                          remaining: parseFloat(newEntry.annualAmount) - totalReceived
                        })
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sixthInstallment">{t('annualInstallments.installmentNumbers.sixth', language)}</Label>
                    <Input
                      id="sixthInstallment"
                      type="number"
                      value={newEntry.sixthInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const totalReceived = newEntry.firstInstallment + newEntry.secondInstallment + newEntry.thirdInstallment + newEntry.fourthInstallment + newEntry.fifthInstallment + value
                        setNewEntry({
                          ...newEntry,
                          sixthInstallment: value,
                          totalReceived: totalReceived,
                          remaining: parseFloat(newEntry.annualAmount) - totalReceived
                        })
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalReceived">{t('annualInstallments.fields.totalReceived', language)}</Label>
                    <Input
                      id="totalReceived"
                      type="number"
                      value={newEntry.totalReceived}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remaining">{t('annualInstallments.fields.remaining', language)}</Label>
                    <Input
                      id="remaining"
                      type="number"
                      value={newEntry.remaining}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">{t('annualInstallments.fields.notes', language)}</Label>
                  <Input
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    placeholder="تێبینی..."
                  />
                </div>

                <div>
                  <Label>{t('annualInstallments.fields.receiptImages', language)}</Label>
                  <ImageUpload
                    images={newEntry.receiptImages}
                    onImagesChange={(images) => setNewEntry({ ...newEntry, receiptImages: images })}
                    maxImages={6}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setIsAddDialogOpen(false); resetNewEntry(); }}
                    disabled={isSaving}
                  >
                    {t('annualInstallments.buttons.cancel', language)}
                  </Button>
                  <Button
                    onClick={() => saveEntry(newEntry)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'پاشەکەوتکردن... / Saving...' : t('annualInstallments.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Installments Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <InstallmentsCardView data={filteredData} />
        ) : (
          <InstallmentsTableView data={filteredData} />
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
        onFieldChange={handleModalFieldChange}
        title={t('annualInstallments.buttons.edit', language)}
        titleKu={t('annualInstallments.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />

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
                                title: 'Receipt Image - Annual Installments',
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
                                    <h2>وەسڵ - Receipt Image - Annual Installments</h2>
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

                        <Button
                          variant="outline"
                          onClick={() => {
                            // Reset image transformations
                            const img = document.querySelector('.image-preview-main')
                            if (img) {
                              img.style.transform = 'scale(1) rotate(0deg)'
                              img.style.cursor = 'zoom-in'
                              const container = img.parentElement
                              container.style.overflow = 'visible'
                              container.parentElement.scrollTop = 0
                            }
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 hover:border-yellow-700 transition-all duration-200"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Reset View
                        </Button>
                      </div>

                      {/* Zoom and navigation instructions */}
                      <div className="text-center text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                        <p className="flex items-center justify-center gap-2 mb-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Click on the image to zoom in/out • Scroll to navigate when zoomed
                        </p>
                        <p className="text-xs text-gray-500">
                          Use action buttons below for download, print, share, rotate, and other features
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

      {/* CSS to ensure modal proper positioning regardless of page scroll */}
      <style jsx>{`
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