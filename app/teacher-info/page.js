'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Eye, User, Languages } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'

import Fuse from 'fuse.js'

// Translation function for this component
const t = (key, lang = 'kurdish') => {
  const translations = {
    title: {
      english: 'Teacher Information',
      kurdish: 'زانیاری مامۆستا'
    },
    searchPlaceholder: {
      english: 'Fuzzy search across all teacher info columns...',
      kurdish: 'گەڕانی فازی لە هەموو ستوونەکانی زانیاری مامۆستاکاندا...'
    },
    addButton: {
      english: 'Add Teacher Info',
      kurdish: 'زیادکردنی زانیاری مامۆستا'
    },
    addTitle: {
      english: 'Add New Teacher Information',
      kurdish: 'زیادکردنی زانیاری مامۆستای نوێ'
    },
    fields: {
      politicalName: {
        english: 'Political Name',
        kurdish: 'ناوی سیاسی'
      },
      realName: {
        english: 'Real Name',
        kurdish: 'ناوی ڕاستەقینە'
      },
      department: {
        english: 'Department',
        kurdish: 'بەش'
      },
      subject: {
        english: 'Subject',
        kurdish: 'وانە'
      },
      grade: {
        english: 'Grade',
        kurdish: 'پۆل'
      },
      phoneNumber: {
        english: 'Phone Number',
        kurdish: 'ژمارەی تەلەفۆن'
      },
      notes: {
        english: 'Notes',
        kurdish: 'تێبینی'
      }
    },
    buttons: {
      cancel: {
        english: 'Cancel',
        kurdish: 'پاشگەزبوونەوە'
      },
      save: {
        english: 'Save',
        kurdish: 'پاشەکەوتکردن'
      },
      edit: {
        english: 'Edit Teacher Info',
        kurdish: 'دەستکاریکردنی زانیاری مامۆستا'
      }
    },
    noData: {
      title: {
        english: 'No teacher information found',
        kurdish: 'هیچ زانیاریەک دۆزرایەوە'
      },
      message: {
        english: 'No results found for your search',
        kurdish: 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە'
      },
      emptyMessage: {
        english: 'No teacher information has been added yet',
        kurdish: 'تا ئێستا هیچ زانیاریەک زیاد نەکراوە'
      }
    }
  }

  const keys = key.split('.')
  let current = translations
  
  for (const k of keys) {
    current = current[k]
    if (current === undefined) {
      return key // Return key if translation not found
    }
  }
  
  return current[lang] || current.kurdish || key
}

export default function TeacherInfoPage() {
  const isMobile = useIsMobile()
  const { language: localLanguage, toggleLanguage } = useLanguage() // Use global language context
  const [teacherInfoData, setTeacherInfoData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [newEntry, setNewEntry] = useState({
    politicalName: '',
    realName: '',
    department: '',
    subject: '',
    grade: '',
    phoneNumber: '',
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'politicalName', weight: 0.2 },
        { name: 'realName', weight: 0.2 },
        { name: 'department', weight: 0.15 },
        { name: 'subject', weight: 0.15 },
        { name: 'grade', weight: 0.1 },
        { name: 'phoneNumber', weight: 0.1 },
        { name: 'notes', weight: 0.1 },
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          return [
            obj.politicalName || '',
            obj.realName || '',
            obj.department || '',
            obj.subject || '',
            obj.grade || '',
            obj.phoneNumber || '',
            obj.notes || ''
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
    return new Fuse(teacherInfoData, options)
  }, [teacherInfoData])

  // Fetch teacher info data from API
  useEffect(() => {
    fetchTeacherInfoData()
  }, [])

  const fetchTeacherInfoData = async () => {
    try {
      const response = await fetch('/api/teacher-info')
      if (response.ok) {
        const data = await response.json()
        setTeacherInfoData(data)
      }
    } catch (error) {
      console.error('Error fetching teacher info data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    setIsSaving(true)
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('teacher-info-')) {
        // Update existing entry
        response = await fetch(`/api/teacher-info/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('teacher-info-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/teacher-info', {
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
        setTeacherInfoData(prevData => {
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
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('teacher-info-')) {
        // Remove from local state only if it's a temporary entry
        setTeacherInfoData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/teacher-info/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTeacherInfoData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      politicalName: '',
      realName: '',
      department: '',
      subject: '',
      grade: '',
      phoneNumber: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...teacherInfoData]
    updatedData[rowIndex][field] = value
    setTeacherInfoData(updatedData)
  }

  // Utility function to scroll to center of viewport smoothly and fast
  const scrollToCenter = () => {
    const scrollHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const centerPosition = (scrollHeight - windowHeight) / 2
    
    window.scrollTo({
      top: centerPosition,
      behavior: 'smooth'
    })
  }

  // Handle Add Entry with scroll to center
  const handleAddEntry = () => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      setIsAddDialogOpen(true)
    }, 100)
  }

  const startEditing = (index) => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      const entry = teacherInfoData[index]
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 100)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = teacherInfoData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchTeacherInfoData()
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'politicalName',
      label: t('fields.politicalName', localLanguage),
      labelKu: t('fields.politicalName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter political name'
    },
    {
      key: 'realName',
      label: t('fields.realName', localLanguage),
      labelKu: t('fields.realName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter real name'
    },
    {
      key: 'department',
      label: t('fields.department', localLanguage),
      labelKu: t('fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter department'
    },
    {
      key: 'subject',
      label: t('fields.subject', localLanguage),
      labelKu: t('fields.subject', 'kurdish'),
      type: 'text',
      placeholder: 'Enter subject'
    },
    {
      key: 'grade',
      label: t('fields.grade', localLanguage),
      labelKu: t('fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter grade'
    },
    {
      key: 'phoneNumber',
      label: t('fields.phoneNumber', localLanguage),
      labelKu: t('fields.phoneNumber', 'kurdish'),
      type: 'text',
      placeholder: 'Enter phone number'
    },
    {
      key: 'notes',
      label: t('fields.notes', localLanguage),
      labelKu: t('fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە مامۆستا...',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return teacherInfoData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, teacherInfoData])

  function TeacherInfoCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.politicalName}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">{t('fields.realName', localLanguage)}:</span> {entry.realName}</div>
                <div><span className="font-semibold">{t('fields.department', localLanguage)}:</span> {entry.department}</div>
                <div><span className="font-semibold">{t('fields.subject', localLanguage)}:</span> {entry.subject}</div>
                <div><span className="font-semibold">{t('fields.grade', localLanguage)}:</span> {entry.grade}</div>
                <div><span className="font-semibold">{t('fields.phoneNumber', localLanguage)}:</span> {entry.phoneNumber}</div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">{t('fields.notes', localLanguage)}:</span> {entry.notes}
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

  function TeacherInfoTableView({ data }) {
    // Define table columns for teacher information
    const columns = [
      {
        key: 'politicalName',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.politicalName', localLanguage)}
            </span>
          </div>
        ),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'realName',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.realName', localLanguage)}
            </span>
          </div>
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
              {t('fields.department', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'subject',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.subject', localLanguage)}
            </span>
          </div>
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
              {t('fields.grade', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'phoneNumber',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.phoneNumber', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{value}</span>
      },
      {
        key: 'notes',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.notes', localLanguage)}
            </span>
          </div>
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
        maxRowsPerPage={10}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  if (loading) {
    return (
      <PageLayout 
        title={t('title', localLanguage)} 
        titleKu={t('title', 'kurdish')}
        localLanguage={localLanguage}
        onLanguageChange={toggleLanguage}
      >
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout 
      title={t('title', localLanguage)} 
      titleKu={t('title', 'kurdish')}
      localLanguage={localLanguage}
      onLanguageChange={toggleLanguage}
    >
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder', localLanguage)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">

          <DownloadButton 
            data={filteredData}
            filename="teacher-info-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="teacher-info-records"
            title={t('title', localLanguage)}
            titleKu={t('title', 'kurdish')}
            columns={[
              { key: 'politicalName', header: t('fields.politicalName', 'kurdish') },
              { key: 'realName', header: t('fields.realName', 'kurdish') },
              { key: 'department', header: t('fields.department', 'kurdish') },
              { key: 'subject', header: t('fields.subject', 'kurdish') },
              { key: 'grade', header: t('fields.grade', 'kurdish') },
              { key: 'phoneNumber', header: t('fields.phoneNumber', 'kurdish') },
              { key: 'notes', header: t('fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={handleAddEntry} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t('addButton', localLanguage)}
            </Button>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('addTitle', localLanguage)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="politicalName">{t('fields.politicalName', localLanguage)}</Label>
                  <Input
                    id="politicalName"
                    value={newEntry.politicalName}
                    onChange={(e) => setNewEntry({...newEntry, politicalName: e.target.value})}
                    placeholder="Enter political name"
                  />
                </div>
                <div>
                  <Label htmlFor="realName">{t('fields.realName', localLanguage)}</Label>
                  <Input
                    id="realName"
                    value={newEntry.realName}
                    onChange={(e) => setNewEntry({...newEntry, realName: e.target.value})}
                    placeholder="Enter real name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">{t('fields.department', localLanguage)}</Label>
                    <Input
                      id="department"
                      value={newEntry.department}
                      onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                      placeholder="Enter department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">{t('fields.subject', localLanguage)}</Label>
                    <Input
                      id="subject"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                      placeholder="Enter subject"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">{t('fields.grade', localLanguage)}</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">{t('fields.phoneNumber', localLanguage)}</Label>
                    <Input
                      id="phoneNumber"
                      value={newEntry.phoneNumber}
                      onChange={(e) => setNewEntry({...newEntry, phoneNumber: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">{t('fields.notes', localLanguage)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی سەبارەت بە مامۆستا..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} disabled={isSaving}>
                    {t('buttons.cancel', localLanguage)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)} disabled={isSaving}>
                    {isSaving ? 'پاشەکەوت دەکرێت...' : t('buttons.save', localLanguage)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Teacher Info Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <TeacherInfoCardView data={filteredData} />
        ) : (
          <TeacherInfoTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noData.title', localLanguage)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('noData.message', localLanguage) : t('noData.emptyMessage', localLanguage)}
            </p>
          </div>
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
        title={t('buttons.edit', localLanguage)}
        titleKu={t('buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />
    </PageLayout>
  )
}