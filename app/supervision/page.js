'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Edit, Trash2, Eye, Languages, RefreshCw } from 'lucide-react'
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
  const [isTranslating, setIsTranslating] = useState(false)
  const [newEntry, setNewEntry] = useState({
    teacherName: '',
    subject: '',
    teacherDepartment: '',
    teacherGrade: '',
    teacherViolationType: '',
    teacherPunishmentType: '',
    teacherSupervisionLocation: '',
    studentName: '',
    studentDepartment: '',
    studentGrade: '',
    studentViolationType: '',
    studentPunishmentType: '',
    studentSupervisionLocation: '',
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        // Teacher-related fields
        { name: 'teacherName', weight: 0.15 },
        { name: 'subject', weight: 0.15 },
        { name: 'teacherDepartment', weight: 0.1 },
        { name: 'teacherGrade', weight: 0.08 },
        { name: 'teacherViolationType', weight: 0.1 },
        { name: 'teacherPunishmentType', weight: 0.08 },
        { name: 'teacherSupervisionLocation', weight: 0.08 },
        // Student-related fields
        { name: 'studentName', weight: 0.15 },
        { name: 'studentDepartment', weight: 0.1 },
        { name: 'studentGrade', weight: 0.08 },
        { name: 'studentViolationType', weight: 0.1 },
        { name: 'studentPunishmentType', weight: 0.08 },
        { name: 'studentSupervisionLocation', weight: 0.08 },
        // ID field for technical searches
        { name: 'id', weight: 0.05 },
        { name: 'notes', weight: 0.1 }, // Notes field
        // Comprehensive searchable content
        { name: 'searchableContent', weight: 0.12, getFn: (obj) => {
          return [
            // All teacher fields
            obj.teacherName || '',
            obj.subject || '',
            obj.teacherDepartment || '',
            obj.teacherGrade || '',
            obj.teacherViolationType || '',
            obj.teacherPunishmentType || '',
            obj.teacherSupervisionLocation || '',
            // All student fields
            obj.studentName || '',
            obj.studentDepartment || '',
            obj.studentGrade || '',
            obj.studentViolationType || '',
            obj.studentPunishmentType || '',
            obj.studentSupervisionLocation || '',
            obj.notes || '',
            // Context keywords for enhanced search
            obj.teacherName ? 'مامۆستا teacher' : '',
            obj.studentName ? 'قوتابی student' : '',
            obj.teacherViolationType ? 'سەرپێچی violation' : '',
            obj.studentViolationType ? 'سەرپێچی violation' : '',
            obj.teacherPunishmentType ? 'سزا punishment' : '',
            obj.studentPunishmentType ? 'سزا punishment' : ''
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
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('supervision-')) {
        // Update existing entry
        response = await fetch(`/api/supervision/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('supervision-')) {
          delete entryToSave.id // Remove temporary ID for new entries
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
        
        // Update local state with the saved data
        setSupervisionData(prevData => {
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
      if (id.startsWith('supervision-')) {
        // Remove from local state only if it's a temporary entry
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

  const resetNewEntry = () => {
    setNewEntry({
      teacherName: '',
      subject: '',
      teacherDepartment: '',
      teacherGrade: '',
      teacherViolationType: '',
      teacherPunishmentType: '',
      teacherSupervisionLocation: '',
      studentName: '',
      studentDepartment: '',
      studentGrade: '',
      studentViolationType: '',
      studentPunishmentType: '',
      studentSupervisionLocation: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...supervisionData]
    updatedData[rowIndex][field] = value
    setSupervisionData(updatedData)
  }

  const startEditing = (index) => {
    const entry = supervisionData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = supervisionData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchSupervisionData()
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

  // Define fields for modal editing (combined for both teacher and student fields)
  const editFields = [
    // Teacher Fields
    {
      key: 'teacherName',
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
      key: 'teacherDepartment',
      label: t('supervision.fields.department', language),
      labelKu: t('supervision.fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter teacher department'
    },
    {
      key: 'teacherGrade',
      label: t('supervision.fields.grade', language),
      labelKu: t('supervision.fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter teacher grade'
    },
    {
      key: 'teacherSupervisionLocation',
      label: t('supervision.fields.supervisionLocation', language),
      labelKu: t('supervision.fields.supervisionLocation', 'kurdish'),
      type: 'text',
      placeholder: 'Enter supervision location'
    },
    {
      key: 'teacherViolationType',
      label: t('supervision.fields.violationType', language),
      labelKu: t('supervision.fields.violationType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter violation type'
    },
    {
      key: 'teacherPunishmentType',
      label: t('supervision.fields.punishmentType', language),
      labelKu: t('supervision.fields.punishmentType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter punishment type',
      span: 'full'
    },
    // Student Fields
    {
      key: 'studentName',
      label: t('supervision.fields.studentName', language),
      labelKu: t('supervision.fields.studentName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter student name'
    },
    {
      key: 'studentDepartment',
      label: t('supervision.fields.department', language),
      labelKu: t('supervision.fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter student department'
    },
    {
      key: 'studentGrade',
      label: t('supervision.fields.grade', language),
      labelKu: t('supervision.fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter student grade'
    },
    {
      key: 'studentSupervisionLocation',
      label: t('supervision.fields.supervisionLocation', language),
      labelKu: t('supervision.fields.supervisionLocation', 'kurdish'),
      type: 'text',
      placeholder: 'Enter supervision location'
    },
    {
      key: 'studentViolationType',
      label: t('supervision.fields.violationType', language),
      labelKu: t('supervision.fields.violationType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter violation type'
    },
    {
      key: 'studentPunishmentType',
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
              {type === 'teacher' ? (
                <>
                  <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.teacherName}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">{t('supervision.fields.subject', language)}:</span> {entry.subject}</div>
                    <div><span className="font-semibold">{t('supervision.fields.department', language)}:</span> {entry.teacherDepartment}</div>
                    <div><span className="font-semibold">{t('supervision.fields.grade', language)}:</span> {entry.teacherGrade}</div>
                    <div><span className="font-semibold">{t('supervision.fields.violationType', language)}:</span> {entry.teacherViolationType}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{t('supervision.fields.punishmentType', language)}:</span> 
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{entry.teacherPunishmentType}</span>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-semibold">{t('supervision.fields.notes', language)}:</span> {entry.notes}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.studentName}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">{t('supervision.fields.department', language)}:</span> {entry.studentDepartment}</div>
                    <div><span className="font-semibold">{t('supervision.fields.grade', language)}:</span> {entry.studentGrade}</div>
                    <div><span className="font-semibold">{t('supervision.fields.violationType', language)}:</span> {entry.studentViolationType}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{t('supervision.fields.punishmentType', language)}:</span> 
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{entry.studentPunishmentType}</span>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span className="font-semibold">{t('supervision.fields.notes', language)}:</span> {entry.notes}
                    </div>
                  )}
                </>
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

  function TeacherSupervisionTableView({ data }) {
    // Define table columns for teacher supervision with enhanced translation
    const columns = [
      {
        key: 'teacherName',
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
        key: 'teacherDepartment',
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
        key: 'teacherGrade',
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
        key: 'teacherSupervisionLocation',
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
        key: 'teacherViolationType',
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
        key: 'teacherPunishmentType',
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
        editingRow={null} // Disable inline editing
        onEdit={startEditing}
        onSave={() => {}} // No inline save
        onCancel={() => {}} // No inline cancel
        onDelete={deleteEntry}
        onCellEdit={() => {}} // No inline cell edit
        maxRowsPerPage={12}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  function StudentSupervisionTableView({ data }) {
    // Define table columns for student supervision with enhanced translation
    const columns = [
      {
        key: 'studentName',
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
        key: 'studentDepartment',
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
        key: 'studentGrade',
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
        key: 'studentSupervisionLocation',
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
        key: 'studentViolationType',
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
        key: 'studentPunishmentType',
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
        editingRow={null} // Disable inline editing
        onEdit={startEditing}
        onSave={() => {}} // No inline save
        onCancel={() => {}} // No inline cancel
        onDelete={deleteEntry}
        onCellEdit={() => {}} // No inline cell edit
        maxRowsPerPage={12}
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
          {/* Language Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTranslateInterface}
            className={`relative h-10 px-3 rounded-full border-2 border-transparent hover:border-green-200 dark:hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95 group flex items-center gap-2 ${isTranslating ? 'animate-pulse' : ''}`}
            disabled={isTranslating}
          >
            <div className="relative overflow-hidden flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 text-green-600 group-hover:text-green-500 transition-all duration-300 ${isTranslating ? 'animate-spin' : 'group-hover:rotate-12 group-hover:scale-110'}`} />
              <Languages className="h-4 w-4 text-blue-600 group-hover:text-blue-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="text-sm font-medium group-hover:scale-105 transition-transform duration-200">
                {language === 'kurdish' ? 'EN' : 'کوردی'}
              </span>
            </div>
          </Button>

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
              { key: 'teacherName', header: t('supervision.fields.teacherName', 'kurdish') },
              { key: 'subject', header: t('supervision.fields.subject', 'kurdish') },
              { key: 'teacherDepartment', header: t('supervision.fields.department', 'kurdish') },
              { key: 'teacherGrade', header: t('supervision.fields.grade', 'kurdish') },
              { key: 'teacherViolationType', header: t('supervision.fields.violationType', 'kurdish') },
              { key: 'teacherPunishmentType', header: t('supervision.fields.punishmentType', 'kurdish') },
              { key: 'studentName', header: t('supervision.fields.studentName', 'kurdish') },
              { key: 'studentDepartment', header: t('supervision.fields.department', 'kurdish') },
              { key: 'studentGrade', header: t('supervision.fields.grade', 'kurdish') },
              { key: 'studentViolationType', header: t('supervision.fields.violationType', 'kurdish') },
              { key: 'studentPunishmentType', header: t('supervision.fields.punishmentType', 'kurdish') },
              { key: 'notes', header: t('supervision.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {t('supervision.addButton', language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('supervision.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="teacher" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="teacher">{t('supervision.tabs.teacher', language)} / {t('supervision.tabs.teacher', 'kurdish')}</TabsTrigger>
                  <TabsTrigger value="student">{t('supervision.tabs.student', language)} / {t('supervision.tabs.student', 'kurdish')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="teacher" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teacherName">{t('supervision.fields.teacherName', language)}</Label>
                      <Input
                        id="teacherName"
                        value={newEntry.teacherName}
                        onChange={(e) => setNewEntry({...newEntry, teacherName: e.target.value})}
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
                      <Label htmlFor="teacherDepartment">{t('supervision.fields.department', language)}</Label>
                      <Input
                        id="teacherDepartment"
                        value={newEntry.teacherDepartment}
                        onChange={(e) => setNewEntry({...newEntry, teacherDepartment: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherGrade">{t('supervision.fields.grade', language)}</Label>
                      <Input
                        id="teacherGrade"
                        value={newEntry.teacherGrade}
                        onChange={(e) => setNewEntry({...newEntry, teacherGrade: e.target.value})}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherSupervisionLocation">{t('supervision.fields.supervisionLocation', language)}</Label>
                      <Input
                        id="teacherSupervisionLocation"
                        value={newEntry.teacherSupervisionLocation}
                        onChange={(e) => setNewEntry({...newEntry, teacherSupervisionLocation: e.target.value})}
                        placeholder="Enter supervision location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherViolationType">{t('supervision.fields.violationType', language)}</Label>
                      <Input
                        id="teacherViolationType"
                        value={newEntry.teacherViolationType}
                        onChange={(e) => setNewEntry({...newEntry, teacherViolationType: e.target.value})}
                        placeholder="Enter violation type"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="teacherPunishmentType">{t('supervision.fields.punishmentType', language)}</Label>
                      <Input
                        id="teacherPunishmentType"
                        value={newEntry.teacherPunishmentType}
                        onChange={(e) => setNewEntry({...newEntry, teacherPunishmentType: e.target.value})}
                        placeholder="Enter punishment type"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="student" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">{t('supervision.fields.studentName', language)}</Label>
                      <Input
                        id="studentName"
                        value={newEntry.studentName}
                        onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentDepartment">{t('supervision.fields.department', language)}</Label>
                      <Input
                        id="studentDepartment"
                        value={newEntry.studentDepartment}
                        onChange={(e) => setNewEntry({...newEntry, studentDepartment: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentGrade">{t('supervision.fields.grade', language)}</Label>
                      <Input
                        id="studentGrade"
                        value={newEntry.studentGrade}
                        onChange={(e) => setNewEntry({...newEntry, studentGrade: e.target.value})}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentSupervisionLocation">{t('supervision.fields.supervisionLocation', language)}</Label>
                      <Input
                        id="studentSupervisionLocation"
                        value={newEntry.studentSupervisionLocation}
                        onChange={(e) => setNewEntry({...newEntry, studentSupervisionLocation: e.target.value})}
                        placeholder="Enter supervision location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentViolationType">{t('supervision.fields.violationType', language)}</Label>
                      <Input
                        id="studentViolationType"
                        value={newEntry.studentViolationType}
                        onChange={(e) => setNewEntry({...newEntry, studentViolationType: e.target.value})}
                        placeholder="Enter violation type"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentPunishmentType">{t('supervision.fields.punishmentType', language)}</Label>
                      <Input
                        id="studentPunishmentType"
                        value={newEntry.studentPunishmentType}
                        onChange={(e) => setNewEntry({...newEntry, studentPunishmentType: e.target.value})}
                        placeholder="Enter punishment type"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="both" className="space-y-4">
                  <div>
                    <Label htmlFor="notes">{t('supervision.fields.notes', language)}</Label>
                    <Textarea
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      placeholder="تێبینی سەبارەت بە چاودێری..."
                      rows={4}
                    />
                  </div>
                </TabsContent>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    {t('supervision.buttons.cancel', language)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    {t('supervision.buttons.save', language)}
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
        }}
        data={editingData}
        fields={editFields}
        onSave={handleModalSave}
        title={t('supervision.buttons.edit', language)}
        titleKu={t('supervision.buttons.edit', 'kurdish')}
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
              <SupervisionCardView data={filteredData.filter(entry => entry.teacherName)} type="teacher" />
            ) : (
              <TeacherSupervisionTableView data={filteredData.filter(entry => entry.teacherName)} />
            )}
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            {isMobile ? (
              <SupervisionCardView data={filteredData.filter(entry => entry.studentName)} type="student" />
            ) : (
              <StudentSupervisionTableView data={filteredData.filter(entry => entry.studentName)} />
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