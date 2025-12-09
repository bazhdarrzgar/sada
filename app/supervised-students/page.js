'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'

export default function SupervisedStudentsPage() {
  const isMobile = useIsMobile()
  const { language } = useLanguage()
  const [studentsData, setStudentsData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newEntry, setNewEntry] = useState({
    studentName: '',
    department: '',
    grade: '',
    subject: '',
    violationType: '',
    list: '',
    punishmentType: '',
    guardianNotification: '',
    guardianPhone: '',
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'studentName', weight: 0.25 }, // Main student name
        { name: 'department', weight: 0.15 }, // Department
        { name: 'grade', weight: 0.1 }, // Grade/class
        { name: 'subject', weight: 0.15 }, // Subject - important for academic context
        { name: 'violationType', weight: 0.2 }, // Type of violation - important
        { name: 'punishmentType', weight: 0.15 }, // Punishment details - important
        { name: 'list', weight: 0.05 }, // List information
        { name: 'guardianNotification', weight: 0.05 }, // Guardian notification
        { name: 'guardianPhone', weight: 0.05 }, // Phone number
        { name: 'notes', weight: 0.1 }, // Notes field
        // Enhanced search patterns for better matching
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.studentName || '',
            obj.department || '',
            obj.grade || '',
            obj.subject || '',
            obj.violationType || '',
            obj.punishmentType || '',
            obj.list || '',
            obj.guardianNotification || '',
            obj.guardianPhone || '',
            obj.notes || '',
            // Add formatted phone for better phone searching
            obj.guardianPhone ? obj.guardianPhone.replace(/[\s\-]/g, '') : '',
            // Add contextual information
            `ناوی قوتابی: ${obj.studentName || ''}`,
            `بەش: ${obj.department || ''}`,
            `پۆل: ${obj.grade || ''}`,
            `بابەت: ${obj.subject || ''}`,
            `جۆری پێشێلکاری: ${obj.violationType || ''}`,
            `جۆری سزا: ${obj.punishmentType || ''}`,
            `تەلەفۆنی دایک و باوک: ${obj.guardianPhone || ''}`
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
    return new Fuse(studentsData, options)
  }, [studentsData])

  // Fetch supervised students data from API
  useEffect(() => {
    fetchStudentsData()
  }, [])

  const fetchStudentsData = async () => {
    try {
      const response = await fetch('/api/supervised-students')
      if (response.ok) {
        const data = await response.json()
        setStudentsData(data)
      }
    } catch (error) {
      console.error('Error fetching supervised students data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    try {
      setIsSaving(true)
      let response
      
      if (entry.id && !entry.id.startsWith('student-')) {
        // Update existing entry
        response = await fetch(`/api/supervised-students/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('student-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/supervised-students', {
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
        setStudentsData(prevData => {
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
      if (id.startsWith('student-')) {
        // Remove from local state only if it's a temporary entry
        setStudentsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/supervised-students/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setStudentsData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      studentName: '',
      department: '',
      grade: '',
      subject: '',
      violationType: '',
      list: '',
      punishmentType: '',
      guardianNotification: '',
      guardianPhone: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...studentsData]
    updatedData[rowIndex][field] = value
    setStudentsData(updatedData)
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

  const startEditing = (idOrIndex) => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      // Check if idOrIndex is actually an ID (string) or index (number)
      let entry
      
      if (typeof idOrIndex === 'string') {
        // It's an ID from the EnhancedTable, find the entry by ID
        entry = filteredData.find(item => item.id === idOrIndex)
      } else {
        // It's an index from the card view, use it directly
        entry = filteredData[idOrIndex]
      }
      
      if (!entry) {
        console.error('Could not find entry for editing:', idOrIndex)
        return
      }
      
      console.log('Starting to edit entry:', entry)
      console.log('Entry ID:', entry.id)
      
      // Create a deep copy to avoid reference issues
      const entryCopy = { ...entry }
      setEditingData(entryCopy)
      setIsEditModalOpen(true)
    }, 100)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = studentsData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchStudentsData()
  }

  const handleModalSave = async (editedData) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    // Ensure the ID from the original editingData is preserved
    const dataToSave = {
      ...editedData,
      id: editingData?.id || editedData.id
    }
    await saveEntry(dataToSave)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'studentName',
      label: t('supervisedStudents.fields.studentName', language),
      labelKu: t('supervisedStudents.fields.studentName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter student name'
    },
    {
      key: 'department',
      label: t('supervisedStudents.fields.department', language),
      labelKu: t('supervisedStudents.fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter department'
    },
    {
      key: 'grade',
      label: t('supervisedStudents.fields.grade', language),
      labelKu: t('supervisedStudents.fields.grade', 'kurdish'),
      type: 'text',
      placeholder: 'Enter grade'
    },
    {
      key: 'subject',
      label: t('supervisedStudents.fields.subject', language),
      labelKu: t('supervisedStudents.fields.subject', 'kurdish'),
      type: 'text',
      placeholder: 'Enter subject'
    },
    {
      key: 'violationType',
      label: t('supervisedStudents.fields.violationType', language),
      labelKu: t('supervisedStudents.fields.violationType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter violation type'
    },
    {
      key: 'list',
      label: t('supervisedStudents.fields.list', language),
      labelKu: t('supervisedStudents.fields.list', 'kurdish'),
      type: 'text',
      placeholder: 'Enter list information'
    },
    {
      key: 'punishmentType',
      label: t('supervisedStudents.fields.punishmentType', language),
      labelKu: t('supervisedStudents.fields.punishmentType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter punishment type'
    },
    {
      key: 'guardianNotification',
      label: t('supervisedStudents.fields.guardianNotification', language),
      labelKu: t('supervisedStudents.fields.guardianNotification', 'kurdish'),
      type: 'text',
      placeholder: 'Enter notification details'
    },
    {
      key: 'guardianPhone',
      label: t('supervisedStudents.fields.guardianPhone', language),
      labelKu: t('supervisedStudents.fields.guardianPhone', 'kurdish'),
      type: 'text',
      placeholder: 'Enter guardian phone number'
    },
    {
      key: 'notes',
      label: t('supervisedStudents.fields.notes', language),
      labelKu: t('supervisedStudents.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە قوتابی...',
      span: 'full'
    }
  ]

  // Implement comprehensive fuzzy search across all columns
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return studentsData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, studentsData])

  function StudentsCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.studentName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">{t('supervisedStudents.fields.department', language)}:</span> {entry.department}</div>
                <div><span className="font-semibold">{t('supervisedStudents.fields.grade', language)}:</span> {entry.grade}</div>
                <div><span className="font-semibold">{t('supervisedStudents.fields.subject', language)}:</span> {entry.subject}</div>
                <div><span className="font-semibold">{t('supervisedStudents.fields.violationType', language)}:</span> {entry.violationType}</div>
                <div><span className="font-semibold">{t('supervisedStudents.fields.punishmentType', language)}:</span> {entry.punishmentType}</div>
                <div><span className="font-semibold">{t('supervisedStudents.fields.guardianPhone', language)}:</span> {entry.guardianPhone}</div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-semibold">{t('supervisedStudents.fields.notes', language)}:</span> {entry.notes}
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

  function StudentsTableView({ data }) {
    // Define table columns for supervised students
    const columns = [
      {
        key: 'studentName',
        header: t('supervisedStudents.fields.studentName', language),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'department',
        header: t('supervisedStudents.fields.department', language),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: t('supervisedStudents.fields.grade', language),
        align: 'center',
        editable: true,
        truncate: 10,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'subject',
        header: t('supervisedStudents.fields.subject', language),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{value}</span>
      },
      {
        key: 'violationType',
        header: t('supervisedStudents.fields.violationType', language),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{value}</span>
      },
      {
        key: 'list',
        header: t('supervisedStudents.fields.list', language),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'punishmentType',
        header: t('supervisedStudents.fields.punishmentType', language),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
      },
      {
        key: 'guardianNotification',
        header: t('supervisedStudents.fields.guardianNotification', language),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      },
      {
        key: 'guardianPhone',
        header: t('supervisedStudents.fields.guardianPhone', language),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{value}</span>
      },
      {
        key: 'notes',
        header: t('supervisedStudents.fields.notes', language),
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
      <PageLayout title={t('supervisedStudents.title', language)} titleKu={t('supervisedStudents.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('supervisedStudents.title', language)} titleKu={t('supervisedStudents.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('supervisedStudents.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="supervised-students"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="supervised-students"
            title={t('supervisedStudents.title', language)}
            titleKu={t('supervisedStudents.title', 'kurdish')}
            columns={[
              { key: 'studentName', header: t('supervisedStudents.fields.studentName', 'kurdish') },
              { key: 'department', header: t('supervisedStudents.fields.department', 'kurdish') },
              { key: 'grade', header: t('supervisedStudents.fields.grade', 'kurdish') },
              { key: 'subject', header: t('supervisedStudents.fields.subject', 'kurdish') },
              { key: 'violationType', header: t('supervisedStudents.fields.violationType', 'kurdish') },
              { key: 'list', header: t('supervisedStudents.fields.list', 'kurdish') },
              { key: 'punishmentType', header: t('supervisedStudents.fields.punishmentType', 'kurdish') },
              { key: 'guardianNotification', header: t('supervisedStudents.fields.guardianNotification', 'kurdish') },
              { key: 'guardianPhone', header: t('supervisedStudents.fields.guardianPhone', 'kurdish') },
              { key: 'notes', header: t('supervisedStudents.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('supervisedStudents.stats.total', language)}</p>
            <p className="text-lg font-bold text-blue-600">{filteredData.length}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={handleAddEntry} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t('supervisedStudents.addButton', language)}
            </Button>
            <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('supervisedStudents.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">{t('supervisedStudents.fields.studentName', language)}</Label>
                    <Input
                      id="studentName"
                      value={newEntry.studentName}
                      onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                      placeholder="ناوی قوتابی بنووسە"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">{t('supervisedStudents.fields.department', language)}</Label>
                    <Input
                      id="department"
                      value={newEntry.department}
                      onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                      placeholder="بەشی قوتابی"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">{t('supervisedStudents.fields.grade', language)}</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                      placeholder="پۆلی قوتابی"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">{t('supervisedStudents.fields.subject', language)}</Label>
                    <Input
                      id="subject"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                      placeholder="بابەتی قوتابی"
                    />
                  </div>
                  <div>
                    <Label htmlFor="violationType">{t('supervisedStudents.fields.violationType', language)}</Label>
                    <Input
                      id="violationType"
                      value={newEntry.violationType}
                      onChange={(e) => setNewEntry({...newEntry, violationType: e.target.value})}
                      placeholder="جۆری پێشێلکاری"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="list">{t('supervisedStudents.fields.list', language)}</Label>
                    <Input
                      id="list"
                      value={newEntry.list}
                      onChange={(e) => setNewEntry({...newEntry, list: e.target.value})}
                      placeholder="زانیاری لیست"
                    />
                  </div>
                  <div>
                    <Label htmlFor="punishmentType">{t('supervisedStudents.fields.punishmentType', language)}</Label>
                    <Input
                      id="punishmentType"
                      value={newEntry.punishmentType}
                      onChange={(e) => setNewEntry({...newEntry, punishmentType: e.target.value})}
                      placeholder="جۆری سزا"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guardianNotification">{t('supervisedStudents.fields.guardianNotification', language)}</Label>
                    <Input
                      id="guardianNotification"
                      value={newEntry.guardianNotification}
                      onChange={(e) => setNewEntry({...newEntry, guardianNotification: e.target.value})}
                      placeholder="زانیاری ئاگادارکردنەوە"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianPhone">{t('supervisedStudents.fields.guardianPhone', language)}</Label>
                    <Input
                      id="guardianPhone"
                      value={newEntry.guardianPhone}
                      onChange={(e) => setNewEntry({...newEntry, guardianPhone: e.target.value})}
                      placeholder="ژمارەی تەلەفۆن"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">{t('supervisedStudents.fields.notes', language)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی سەبارەت بە قوتابی..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} disabled={isSaving}>
                    {t('supervisedStudents.buttons.cancel', language)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)} disabled={isSaving}>
                    {isSaving ? 'چاوەڕوانبە...' : t('supervisedStudents.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Students Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <StudentsCardView data={filteredData} />
        ) : (
          <StudentsTableView data={filteredData} />
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
        title={t('supervisedStudents.buttons.edit', language)}
        titleKu={t('supervisedStudents.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('supervisedStudents.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('supervisedStudents.noData.message', language) : t('supervisedStudents.noData.emptyMessage', language)}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}