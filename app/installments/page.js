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
  const [installmentsData, setInstallmentsData] = useState([])
  const [loading, setLoading] = useState(true)
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
        { name: 'searchableContent', weight: 0.25, getFn: (obj) => {
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
        }}
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
    try {
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
        response = await fetch(`/api/installments/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
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
        
        // Update local state with the saved data
        setInstallmentsData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            const newData = [...prevData]
            newData[existingIndex] = savedEntry
            return newData
          } else {
            return [...prevData, savedEntry]
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

  const startEditing = (index) => {
    const entry = installmentsData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = installmentsData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchInstallmentsData()
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
              { key: 'totalReceived', header: t('annualInstallments.fields.totalReceived', 'kurdish'), render: (value) => parseFloat(value).toLocaleString() },
              { key: 'remaining', header: t('annualInstallments.fields.remaining', 'kurdish'), render: (value) => parseFloat(value).toLocaleString() },
              { key: 'notes', header: t('annualInstallments.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {t('annualInstallments.addButton', language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('annualInstallments.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t('annualInstallments.fields.fullName', language)}</Label>
                  <Input
                    id="fullName"
                    value={newEntry.fullName}
                    onChange={(e) => setNewEntry({...newEntry, fullName: e.target.value})}
                    placeholder="Enter student name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">{t('annualInstallments.fields.grade', language)}</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installmentType">{t('annualInstallments.fields.installmentType', language)}</Label>
                    <Input
                      id="installmentType"
                      value={newEntry.installmentType}
                      onChange={(e) => setNewEntry({...newEntry, installmentType: e.target.value})}
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
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remaining">{t('annualInstallments.fields.remaining', language)}</Label>
                    <Input
                      id="remaining"
                      type="number"
                      value={newEntry.remaining}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">{t('annualInstallments.fields.notes', language)}</Label>
                  <Input
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی..."
                  />
                </div>

                <div>
                  <Label>{t('annualInstallments.fields.receiptImages', language)}</Label>
                  <ImageUpload
                    images={newEntry.receiptImages}
                    onImagesChange={(images) => setNewEntry({...newEntry, receiptImages: images})}
                    maxImages={6}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    {t('annualInstallments.buttons.cancel', language)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    {t('annualInstallments.buttons.save', language)}
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
        title={t('annualInstallments.buttons.edit', language)}
        titleKu={t('annualInstallments.buttons.edit', 'kurdish')}
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