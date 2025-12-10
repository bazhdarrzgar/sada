'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'

import { t } from '@/lib/translations'
import Fuse from 'fuse.js'

export default function SupervisionPage() {
  const isMobile = useIsMobile()
  const { language, toggleLanguage } = useLanguage()
  const [supervisionData, setSupervisionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [editingType, setEditingType] = useState('teacher') // Track whether editing teacher or student record
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeTab, setActiveTab] = useState('teacher')
  const [isSaving, setIsSaving] = useState(false)
  const isSavingRef = useRef(false) // Immediate lock to prevent race conditions
  const [newEntry, setNewEntry] = useState({
    type: 'teacher',
    name: '',
    subject: '',
    department: '',
    grade: '',
    violationType: '',
    punishmentType: '',
    supervisionLocation: '',
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'name', weight: 0.2 },
        { name: 'subject', weight: 0.15 },
        { name: 'department', weight: 0.15 },
        { name: 'grade', weight: 0.1 },
        { name: 'violationType', weight: 0.15 },
        { name: 'punishmentType', weight: 0.1 },
        { name: 'supervisionLocation', weight: 0.1 },
        { name: 'notes', weight: 0.1 },
        { name: 'type', weight: 0.05 }
      ],
      threshold: 0.3,
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    }
    return new Fuse(supervisionData, options)
  }, [supervisionData])

  // Fetch supervision data from API
  useEffect(() => {
    fetchSupervisionData()
  }, [])

  const fetchSupervisionData = async () => {
    try {
      const response = await fetch('/api/supervision')
      if (response.ok) {
        const data = await response.json()
        setSupervisionData(data)
      }
    } catch (error) {
      console.error('Error fetching supervision data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions with both ref and state
    if (isSaving || isSavingRef.current) return
    
    isSavingRef.current = true
    setIsSaving(true)
    try {
      let response
      
      // Check if this is an update (has existing ID from database) or a new entry
      // UUID format is 36 characters with dashes (e.g., "550e8400-e29b-41d4-a716-446655440000")
      const isUpdate = entry.id && typeof entry.id === 'string' && entry.id.length >= 32 && !entry.id.startsWith('supervision-')
      
      console.log('saveEntry - entry.id:', entry.id)
      console.log('saveEntry - isUpdate:', isUpdate)
      console.log('saveEntry - entry:', entry)
      
      if (isUpdate) {
        // Update existing entry - preserve all fields including type
        const entryToUpdate = {
          id: entry.id,
          type: entry.type || activeTab,
          name: entry.name || '',
          subject: entry.subject || '',
          department: entry.department || '',
          grade: entry.grade || '',
          violationType: entry.violationType || '',
          punishmentType: entry.punishmentType || '',
          supervisionLocation: entry.supervisionLocation || '',
          notes: entry.notes || ''
        }
        
        response = await fetch(`/api/supervision/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToUpdate)
        })
      } else {
        // Create new entry
        const entryToSave = {
          type: activeTab,
          name: entry.name || '',
          subject: entry.subject || '',
          department: entry.department || '',
          grade: entry.grade || '',
          violationType: entry.violationType || '',
          punishmentType: entry.punishmentType || '',
          supervisionLocation: entry.supervisionLocation || '',
          notes: entry.notes || ''
        }
        
        if (!entryToSave.name.trim()) {
          alert('Name is required!')
          setIsSaving(false)
          return
        }
        
        response = await fetch('/api/supervision', {
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
        setSupervisionData(prevData => {
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
        setEditingRow(null)
        resetNewEntry()
      } else {
        console.error('Failed to save entry:', response.statusText)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
      isSavingRef.current = false
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('supervision-')) {
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/supervision/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  // Handle Add Entry with smooth scrolling
  const handleAddEntry = () => {
    // First scroll to center quickly
    scrollToCenterFast()
    
    // Small delay to ensure smooth scrolling starts, then open dialog
    setTimeout(() => {
      setIsAddDialogOpen(true)
    }, 100) // Quick delay to allow scroll to start
  }

  const resetNewEntry = () => {
    setNewEntry({
      type: 'teacher',
      name: '',
      subject: '',
      department: '',
      grade: '',
      violationType: '',
      punishmentType: '',
      supervisionLocation: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...supervisionData]
    updatedData[rowIndex][field] = value
    setSupervisionData(updatedData)
  }

  // Utility function to scroll to center of viewport smoothly and quickly
  const scrollToCenterFast = () => {
    const viewportHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const centerPosition = Math.max(0, (documentHeight - viewportHeight) / 2)
    
    window.scrollTo({
      top: centerPosition,
      behavior: 'smooth'
    })
  }

  const startEditing = (index, dataSource = null) => {
    // First scroll to center quickly
    scrollToCenterFast()
    
    // Small delay to ensure smooth scrolling starts, then open modal
    setTimeout(() => {
      // Always use the provided dataSource if available, otherwise use supervisionData
      const entry = dataSource ? dataSource[index] : supervisionData[index]
      
      // Create a deep copy of the entry to avoid reference issues
      const entryCopy = {
        id: entry.id,
        type: entry.type || 'teacher',
        name: entry.name || '',
        subject: entry.subject || '',
        department: entry.department || '',
        grade: entry.grade || '',
        violationType: entry.violationType || '',
        punishmentType: entry.punishmentType || '',
        supervisionLocation: entry.supervisionLocation || '',
        notes: entry.notes || ''
      }
      
      // Determine the editing type based on the entry's type field
      setEditingType(entryCopy.type)
      setEditingData(entryCopy)
      setIsEditModalOpen(true)
    }, 100) // Quick delay to allow scroll to start
  }

  const saveRowEdit = (rowIndex) => {
    const entry = supervisionData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    fetchSupervisionData()
  }

  const handleModalSave = async (editedData) => {
    // Prevent multiple submissions with both ref and state
    if (isSaving || isSavingRef.current) return
    
    // Ensure the ID from the original editingData is preserved
    const dataToSave = {
      ...editedData,
      id: editingData?.id || editedData.id
    }
    await saveEntry(dataToSave)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  const handleTranslateInterface = () => {
    setIsTranslating(true)
    
    setTimeout(() => {
      toggleLanguage()
      setIsTranslating(false)
      
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

  // Define fields for modal editing - Teacher supervision
  const teacherEditFields = [
    {
      key: 'name',
      label: t('supervision.fields.teacherName', language),
      labelKu: t('supervision.fields.teacherName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter teacher name'
    },
    {
      key: 'subject',
      label: t('supervision.fields.subject', language),
      labelKu: t('supervision.fields.subject', 'kurdish'),
      type: 'text',
      placeholder: 'Enter subject'
    },
    {
      key: 'department',
      label: t('supervision.fields.department', language),
      labelKu: t('supervision.fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter department'
    },
    {
      key: 'grade',
      label: t('supervision.fields.grade', language),
      labelKu: t('supervision.fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter grade'
    },
    {
      key: 'supervisionLocation',
      label: t('supervision.fields.supervisionLocation', language),
      labelKu: t('supervision.fields.supervisionLocation', 'kurdish'),
      type: 'text',
      placeholder: 'Enter supervision location'
    },
    {
      key: 'violationType',
      label: t('supervision.fields.violationType', language),
      labelKu: t('supervision.fields.violationType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter violation type'
    },
    {
      key: 'punishmentType',
      label: t('supervision.fields.punishmentType', language),
      labelKu: t('supervision.fields.punishmentType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter punishment type',
      span: 'full'
    },
    {
      key: 'notes',
      label: t('supervision.fields.notes', language),
      labelKu: t('supervision.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە چاودێری...',
      span: 'full'
    }
  ]

  // Define fields for modal editing - Student supervision
  const studentEditFields = [
    {
      key: 'name',
      label: t('supervision.fields.studentName', language),
      labelKu: t('supervision.fields.studentName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter student name'
    },
    {
      key: 'department',
      label: t('supervision.fields.department', language),
      labelKu: t('supervision.fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter department'
    },
    {
      key: 'grade',
      label: t('supervision.fields.grade', language),
      labelKu: t('supervision.fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter grade'
    },
    {
      key: 'supervisionLocation',
      label: t('supervision.fields.supervisionLocation', language),
      labelKu: t('supervision.fields.supervisionLocation', 'kurdish'),
      type: 'text',
      placeholder: 'Enter supervision location'
    },
    {
      key: 'violationType',
      label: t('supervision.fields.violationType', language),
      labelKu: t('supervision.fields.violationType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter violation type'
    },
    {
      key: 'punishmentType',
      label: t('supervision.fields.punishmentType', language),
      labelKu: t('supervision.fields.punishmentType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter punishment type',
      span: 'full'
    },
    {
      key: 'notes',
      label: t('supervision.fields.notes', language),
      labelKu: t('supervision.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە چاودێری...',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return supervisionData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, supervisionData])

  function SupervisionCardView({ data, type }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.name}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {type === 'teacher' && entry.subject && (
                  <div><span className="font-semibold">{t('supervision.fields.subject', language)}:</span> {entry.subject}</div>
                )}
                <div><span className="font-semibold">{t('supervision.fields.department', language)}:</span> {entry.department}</div>
                <div><span className="font-semibold">{t('supervision.fields.grade', language)}:</span> {entry.grade}</div>
                <div><span className="font-semibold">{t('supervision.fields.violationType', language)}:</span> {entry.violationType}</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">{t('supervision.fields.punishmentType', language)}:</span> 
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{entry.punishmentType}</span>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">{t('supervision.fields.notes', language)}:</span> {entry.notes}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEditing(idx, data)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
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

  function TeacherSupervisionTableView({ data }) {
    const columns = [
      {
        key: 'name',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.teacherName', language)}
            </span>
          </div>
        ),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'subject',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.subject', language)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'department',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.department', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.grade', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'supervisionLocation',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.supervisionLocation', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'violationType',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.violationType', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
      },
      {
        key: 'punishmentType',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.punishmentType', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'notes',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.notes', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 30,
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
      <EnhancedTable
        data={data}
        columns={columns}
        editingRow={null}
        onEdit={(index) => startEditing(index, data)}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={deleteEntry}
        onCellEdit={() => {}}
        maxRowsPerPage={10}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  function StudentSupervisionTableView({ data }) {
    const columns = [
      {
        key: 'name',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.studentName', language)}
            </span></div>
        ),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'department',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.department', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.grade', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'supervisionLocation',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.supervisionLocation', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'violationType',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.violationType', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
      },
      {
        key: 'punishmentType',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.punishmentType', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'notes',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('supervision.fields.notes', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 30,
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
      <EnhancedTable
        data={data}
        columns={columns}
        editingRow={null}
        onEdit={(index) => startEditing(index, data)}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={deleteEntry}
        onCellEdit={() => {}}
        maxRowsPerPage={10}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  if (loading) {
    return (
      <PageLayout title={t('supervision.title', language)} titleKu={t('supervision.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('supervision.title', language)} titleKu={t('supervision.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('supervision.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="supervision-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="supervision-records"
            title={t('supervision.title', language)}
            titleKu={t('supervision.title', 'kurdish')}
            columns={[
              { key: 'name', header: t('supervision.fields.name', 'kurdish') },
              { key: 'subject', header: t('supervision.fields.subject', 'kurdish') },
              { key: 'department', header: t('supervision.fields.department', 'kurdish') },
              { key: 'grade', header: t('supervision.fields.grade', 'kurdish') },
              { key: 'supervisionLocation', header: t('supervision.fields.supervisionLocation', 'kurdish') },
              { key: 'violationType', header: t('supervision.fields.violationType', 'kurdish') },
              { key: 'punishmentType', header: t('supervision.fields.punishmentType', 'kurdish') },
              { key: 'notes', header: t('supervision.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddEntry} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {t('supervision.addButton', language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('supervision.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="teacher">{t('supervision.tabs.teacher', language)} / {t('supervision.tabs.teacher', 'kurdish')}</TabsTrigger>
                  <TabsTrigger value="student">{t('supervision.tabs.student', language)} / {t('supervision.tabs.student', 'kurdish')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="teacher" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('supervision.fields.teacherName', language)}</Label>
                      <Input
                        id="name"
                        value={newEntry.name}
                        onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                        placeholder="Enter teacher name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">{t('supervision.fields.subject', language)}</Label>
                      <Input
                        id="subject"
                        value={newEntry.subject}
                        onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">{t('supervision.fields.department', language)}</Label>
                      <Input
                        id="department"
                        value={newEntry.department}
                        onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">{t('supervision.fields.grade', language)}</Label>
                      <Input
                        id="grade"
                        value={newEntry.grade}
                        onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supervisionLocation">{t('supervision.fields.supervisionLocation', language)}</Label>
                      <Input
                        id="supervisionLocation"
                        value={newEntry.supervisionLocation}
                        onChange={(e) => setNewEntry({...newEntry, supervisionLocation: e.target.value})}
                        placeholder="Enter supervision location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="violationType">{t('supervision.fields.violationType', language)}</Label>
                      <Input
                        id="violationType"
                        value={newEntry.violationType}
                        onChange={(e) => setNewEntry({...newEntry, violationType: e.target.value})}
                        placeholder="Enter violation type"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="punishmentType">{t('supervision.fields.punishmentType', language)}</Label>
                      <Input
                        id="punishmentType"
                        value={newEntry.punishmentType}
                        onChange={(e) => setNewEntry({...newEntry, punishmentType: e.target.value})}
                        placeholder="Enter punishment type"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">{t('supervision.fields.notes', language)}</Label>
                      <Textarea
                        id="notes"
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                        placeholder="تێبینی سەبارەت بە چاودێری..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="student" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('supervision.fields.studentName', language)}</Label>
                      <Input
                        id="name"
                        value={newEntry.name}
                        onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">{t('supervision.fields.department', language)}</Label>
                      <Input
                        id="department"
                        value={newEntry.department}
                        onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade">{t('supervision.fields.grade', language)}</Label>
                      <Input
                        id="grade"
                        value={newEntry.grade}
                        onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supervisionLocation">{t('supervision.fields.supervisionLocation', language)}</Label>
                      <Input
                        id="supervisionLocation"
                        value={newEntry.supervisionLocation}
                        onChange={(e) => setNewEntry({...newEntry, supervisionLocation: e.target.value})}
                        placeholder="Enter supervision location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="violationType">{t('supervision.fields.violationType', language)}</Label>
                      <Input
                        id="violationType"
                        value={newEntry.violationType}
                        onChange={(e) => setNewEntry({...newEntry, violationType: e.target.value})}
                        placeholder="Enter violation type"
                      />
                    </div>
                    <div>
                      <Label htmlFor="punishmentType">{t('supervision.fields.punishmentType', language)}</Label>
                      <Input
                        id="punishmentType"
                        value={newEntry.punishmentType}
                        onChange={(e) => setNewEntry({...newEntry, punishmentType: e.target.value})}
                        placeholder="Enter punishment type"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">{t('supervision.fields.notes', language)}</Label>
                      <Textarea
                        id="notes"
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                        placeholder="تێبینی سەبارەت بە چاودێری..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} 
                    disabled={isSaving}
                  >
                    {t('supervision.buttons.cancel', language)}
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      if (!isSaving && !isSavingRef.current) {
                        saveEntry(newEntry);
                      }
                    }} 
                    disabled={isSaving}
                    className={isSaving ? 'pointer-events-none opacity-70' : ''}
                  >
                    {isSaving ? 'پاشەکەوتکردن...' : t('supervision.buttons.save', language)}
                  </Button>
                </div>
              </Tabs>
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
          setEditingType('teacher')
        }}
        data={editingData}
        fields={editingType === 'teacher' ? teacherEditFields : studentEditFields}
        onSave={handleModalSave}
        title={editingType === 'teacher' ? t('supervision.buttons.edit', language) + ' - ' + t('supervision.tabs.teacher', language) : t('supervision.buttons.edit', language) + ' - ' + t('supervision.tabs.student', language)}
        titleKu={editingType === 'teacher' ? t('supervision.buttons.edit', 'kurdish') + ' - ' + t('supervision.tabs.teacher', 'kurdish') : t('supervision.buttons.edit', 'kurdish') + ' - ' + t('supervision.tabs.student', 'kurdish')}
        isSaving={isSaving}
      />

      {/* Supervision Table/Cards */}
      <div className="mt-6">
        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teachers">{t('supervision.tabs.teachers', language)}</TabsTrigger>
            <TabsTrigger value="students">{t('supervision.tabs.students', language)}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers" className="mt-6">
            {isMobile ? (
              <SupervisionCardView data={filteredData.filter(entry => entry.type === 'teacher')} type="teacher" />
            ) : (
              <TeacherSupervisionTableView data={filteredData.filter(entry => entry.type === 'teacher')} />
            )}
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            {isMobile ? (
              <SupervisionCardView data={filteredData.filter(entry => entry.type === 'student')} type="student" />
            ) : (
              <StudentSupervisionTableView data={filteredData.filter(entry => entry.type === 'student')} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('supervision.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('supervision.noData.message', language) : t('supervision.noData.emptyMessage', language)}
            </p>
          </div>
        </Card>
      )}
    </PageLayout>
  )
}