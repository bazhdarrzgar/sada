'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Calendar, Eye } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import VideoUpload from '@/components/ui/video-upload'
import { EnhancedVideoPreview } from '@/components/ui/enhanced-video-preview'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'

export default function StudentPermissionsPage() {
  const isMobile = useIsMobile()
  const { language } = useLanguage()
  const [permissionsData, setPermissionsData] = useState([])
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
    stage: '',
    leaveDuration: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'چاوەڕوان',
    notes: '',
    supportingVideos: []
  })

  const departments = ['زانستی', 'ئەدەبی', 'بازرگانی', 'هونەری']
  const stages = ['پۆلی یەکەم', 'پۆلی دووەم', 'پۆلی سێیەم', 'پۆلی چوارەم', 'پۆلی پێنجەم', 'پۆلی شەشەم', 'پۆلی حەوتەم', 'پۆلی هەشتەم', 'پۆلی نۆیەم']
  const statuses = ['چاوەڕوان', 'پەسەندکراو', 'ڕەتکراوە']

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'studentName', weight: 0.3 }, // Main student name
        { name: 'department', weight: 0.15 }, // Department/subject
        { name: 'stage', weight: 0.15 }, // Academic stage
        { name: 'reason', weight: 0.2 }, // Important reason field
        { name: 'status', weight: 0.1 }, // Status field
        { name: 'leaveDuration', weight: 0.05 }, // Duration
        { name: 'startDate', weight: 0.025 }, // Start date
        { name: 'endDate', weight: 0.025 }, // End date
        { name: 'notes', weight: 0.1 }, // Notes field
        // Enhanced search patterns for better matching
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.studentName || '',
            obj.department || '',
            obj.stage || '',
            obj.reason || '',
            obj.status || '',
            obj.leaveDuration || '',
            obj.startDate || '',
            obj.endDate || '',
            obj.notes || '',
            // Add formatted date versions for better date searching
            obj.startDate ? new Date(obj.startDate).toLocaleDateString('ku') : '',
            obj.endDate ? new Date(obj.endDate).toLocaleDateString('ku') : '',
            // Add status translations
            obj.status === 'چاوەڕوان' ? 'pending waiting' : '',
            obj.status === 'پەسەندکراو' ? 'approved accepted' : '',
            obj.status === 'ڕەتکراوە' ? 'rejected denied' : '',
            // Add department translations
            obj.department === 'زانستی' ? 'science scientific' : '',
            obj.department === 'ئەدەبی' ? 'literature literary' : '',
            obj.department === 'بازرگانی' ? 'business commercial' : '',
            obj.department === 'هونەری' ? 'art artistic' : ''
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
    return new Fuse(permissionsData, options)
  }, [permissionsData])

  // Fetch permissions data from API
  useEffect(() => {
    fetchPermissionsData()
  }, [])

  const fetchPermissionsData = async () => {
    try {
      const response = await fetch('/api/student-permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissionsData(data)
      }
    } catch (error) {
      console.error('Error fetching permissions data:', error)
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
      
      // Check if this is an existing entry (has a valid UUID id)
      const isExistingEntry = entry.id && entry.id.length > 10 && !entry.id.startsWith('permission-')
      
      console.log('Saving entry:', { id: entry.id, isExistingEntry })
      
      if (isExistingEntry) {
        // Update existing entry
        console.log('Updating existing entry with ID:', entry.id)
        response = await fetch(`/api/student-permissions/${entry.id}`, {
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
        if (entryToSave.id && entryToSave.id.startsWith('permission-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/student-permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      }

      if (response.ok) {
        const savedEntry = await response.json()
        console.log('Save successful, received:', savedEntry)
        
        // Update local state with the saved data - new/edited entries go to top
        setPermissionsData(prevData => {
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
        const errorText = await response.text()
        console.error('Failed to save entry:', response.statusText, errorText)
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('permission-')) {
        // Remove from local state only if it's a temporary entry
        setPermissionsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/student-permissions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPermissionsData(prevData => prevData.filter(item => item.id !== id))
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
      stage: '',
      leaveDuration: '',
      startDate: '',
      endDate: '',
      reason: '',
      status: 'چاوەڕوان',
      notes: '',
      supportingVideos: []
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    // Use filteredData to find the correct entry when search is active
    const entryToEdit = filteredData[rowIndex]
    if (!entryToEdit) return
    
    // Find and update the entry in the main permissionsData array
    const updatedData = permissionsData.map(item => 
      item.id === entryToEdit.id 
        ? { ...item, [field]: value }
        : item
    )
    setPermissionsData(updatedData)
  }

  const scrollToCenter = () => {
    const viewport = window.innerHeight
    const centerPosition = document.documentElement.scrollHeight / 2 - viewport / 2
    
    window.scrollTo({
      top: Math.max(0, centerPosition),
      behavior: 'smooth'
    })
  }

  const startEditing = (indexOrIdOrEntry) => {
    // First scroll to center quickly, then open modal
    scrollToCenter()
    
    // Small delay to allow smooth scroll to start before opening modal
    setTimeout(() => {
      // Support multiple parameter types: index (number), id (string), or entry (object)
      let entry
      
      if (typeof indexOrIdOrEntry === 'object' && indexOrIdOrEntry !== null) {
        // Already an entry object
        entry = indexOrIdOrEntry
      } else if (typeof indexOrIdOrEntry === 'number') {
        // It's an index
        entry = filteredData[indexOrIdOrEntry]
      } else if (typeof indexOrIdOrEntry === 'string') {
        // It's an ID - find the entry by ID from filteredData
        entry = filteredData.find(item => item.id === indexOrIdOrEntry)
      }
      
      console.log('Starting edit for entry:', entry)
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 200)
  }

  const saveRowEdit = (indexOrId) => {
    // Support both index (number) and id (string) parameters
    let entry
    if (typeof indexOrId === 'number') {
      entry = filteredData[indexOrId]
    } else if (typeof indexOrId === 'string') {
      entry = filteredData.find(item => item.id === indexOrId)
    }
    console.log('Saving row edit for entry:', entry)
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchPermissionsData()
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
      label: t('studentPermissions.fields.studentName', language),
      labelKu: t('studentPermissions.fields.studentName', 'kurdish'),
      type: 'text',
      placeholder: 'ناوی قوتابی بنووسە'
    },
    {
      key: 'department',
      label: t('studentPermissions.fields.department', language),
      labelKu: t('studentPermissions.fields.department', 'kurdish'),
      type: 'select',
      options: departments.map(dept => ({ value: dept, label: dept }))
    },
    {
      key: 'stage',
      label: t('studentPermissions.fields.stage', language),
      labelKu: t('studentPermissions.fields.stage', 'kurdish'),
      type: 'select',
      options: stages.map(stage => ({ value: stage, label: stage }))
    },
    {
      key: 'leaveDuration',
      label: t('studentPermissions.fields.leaveDuration', language),
      labelKu: t('studentPermissions.fields.leaveDuration', 'kurdish'),
      type: 'text',
      placeholder: 'بۆ نموونە: ٣ رۆژ'
    },
    {
      key: 'startDate',
      label: t('studentPermissions.fields.startDate', language),
      labelKu: t('studentPermissions.fields.startDate', 'kurdish'),
      type: 'date'
    },
    {
      key: 'endDate',
      label: t('studentPermissions.fields.endDate', language),
      labelKu: t('studentPermissions.fields.endDate', 'kurdish'),
      type: 'date'
    },
    {
      key: 'status',
      label: t('studentPermissions.fields.status', language),
      labelKu: t('studentPermissions.fields.status', 'kurdish'),
      type: 'select',
      options: statuses.map(status => ({ value: status, label: status }))
    },
    {
      key: 'reason',
      label: t('studentPermissions.fields.reason', language),
      labelKu: t('studentPermissions.fields.reason', 'kurdish'),
      type: 'textarea',
      placeholder: 'هۆکاری داواکردنی مۆڵەت...',
      span: 'full'
    },
    {
      key: 'notes',
      label: t('studentPermissions.fields.notes', language),
      labelKu: t('studentPermissions.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە مۆڵەت...',
      span: 'full'
    },
    {
      key: 'supportingVideos',
      label: 'Videos',
      labelKu: 'ڤیدیۆ',
      type: 'video-upload',
      span: 'full'
    }
  ]

  // Implement comprehensive fuzzy search across all columns
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return permissionsData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, permissionsData])

  // Calculate statistics
  const totalPermissions = filteredData.length
  const approvedPermissions = filteredData.filter(entry => entry.status === 'پەسەندکراو').length
  const pendingPermissions = filteredData.filter(entry => entry.status === 'چاوەڕوان').length

  function PermissionCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.studentName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">{t('studentPermissions.fields.department', language)}:</span> {entry.department}</div>
                <div><span className="font-semibold">{t('studentPermissions.fields.stage', language)}:</span> {entry.stage}</div>
                <div><span className="font-semibold">{t('studentPermissions.fields.leaveDuration', language)}:</span> {entry.leaveDuration}</div>
                <div><span className="font-semibold">{t('studentPermissions.fields.dateRange', language)}:</span> {entry.startDate} - {entry.endDate}</div>
              </div>
              <div className="border-t pt-2">
                <div className="text-sm">
                  <span className="font-semibold">{t('studentPermissions.fields.reason', language)}:</span> {entry.reason}
                </div>
                {entry.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-semibold">{t('studentPermissions.fields.notes', language)}:</span> {entry.notes}
                  </div>
                )}
                {entry.supportingVideos && entry.supportingVideos.length > 0 && (
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    <span className="font-semibold">ڤیدیۆ:</span>
                    <div className="mt-2">
                      <EnhancedVideoPreview videos={entry.supportingVideos} />
                    </div>
                  </div>
                )}
                <div className={`font-bold text-sm mt-1 ${
                  entry.status === 'پەسەندکراو' ? 'text-green-600' : 
                  entry.status === 'ڕەتکراوە' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  <span>{t('studentPermissions.fields.status', language)}:</span> {entry.status}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEditing(entry)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
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

  function PermissionsTableView({ data }) {
    // Define table columns for student permissions
    const columns = [
      {
        key: 'studentName',
        header: t('studentPermissions.fields.studentName', language),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'department',
        header: t('studentPermissions.fields.department', language),
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.department || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'stage',
        header: t('studentPermissions.fields.stage', language),
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.stage || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'leaveDuration',
        header: t('studentPermissions.fields.leaveDuration', language),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'dateRange',
        header: t('studentPermissions.fields.dateRange', language),
        align: 'center',
        editable: false,
        render: (value, row) => (
          <div className="text-xs">
            <div>{row.startDate}</div>
            <div>{row.endDate}</div>
          </div>
        )
      },
      {
        key: 'reason',
        header: t('studentPermissions.fields.reason', language),
        align: 'center',
        editable: true,
        truncate: 30,
        editComponent: (row, onChange) => (
          <Textarea
            value={row.reason || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full dark:bg-gray-800"
            rows={2}
          />
        ),
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      },
      {
        key: 'notes',
        header: t('studentPermissions.fields.notes', language),
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
      },
      {
        key: 'supportingVideos',
        header: language === 'english' ? 'Videos' : 'ڤیدیۆ',
        align: 'center',
        editable: false,
        render: (value, row) => (
          <div className="text-xs">
            <EnhancedVideoPreview videos={value || []} />
          </div>
        )
      },
      {
        key: 'status',
        header: t('studentPermissions.fields.status', language),
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.status || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
            value === 'پەسەندکراو' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            value === 'ڕەتکراوە' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {value}
          </span>
        )
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
      <PageLayout title={t('studentPermissions.title', language)} titleKu={t('studentPermissions.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('studentPermissions.title', language)} titleKu={t('studentPermissions.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('studentPermissions.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="student-permissions"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="student-permissions"
            title={t('studentPermissions.title', language)}
            titleKu={t('studentPermissions.title', 'kurdish')}
            columns={[
              { key: 'studentName', header: t('studentPermissions.fields.studentName', 'kurdish') },
              { key: 'department', header: t('studentPermissions.fields.department', 'kurdish') },
              { key: 'stage', header: t('studentPermissions.fields.stage', 'kurdish') },
              { key: 'leaveDuration', header: t('studentPermissions.fields.leaveDuration', 'kurdish') },
              { key: 'startDate', header: t('studentPermissions.fields.startDate', 'kurdish') },
              { key: 'endDate', header: t('studentPermissions.fields.endDate', 'kurdish') },
              { key: 'reason', header: t('studentPermissions.fields.reason', 'kurdish') },
              { key: 'status', header: t('studentPermissions.fields.status', 'kurdish') },
              { key: 'notes', header: t('studentPermissions.fields.notes', 'kurdish') },
              { key: 'supportingVideos', header: 'ڤیدیۆ' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-gray-600">{t('studentPermissions.stats.total', language)}</p>
                <p className="font-bold text-blue-600">{totalPermissions}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('studentPermissions.stats.approved', language)}</p>
                <p className="font-bold text-green-600">{approvedPermissions}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('studentPermissions.stats.pending', language)}</p>
                <p className="font-bold text-yellow-600">{pendingPermissions}</p>
              </div>
            </div>
          </div>
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
                {t('studentPermissions.addButton', language)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('studentPermissions.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName">{t('studentPermissions.fields.studentName', language)}</Label>
                  <Input
                    id="studentName"
                    value={newEntry.studentName}
                    onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                    placeholder="ناوی قوتابی بنووسە"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">{t('studentPermissions.fields.department', language)}</Label>
                    <Select value={newEntry.department} onValueChange={(value) => setNewEntry({...newEntry, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="وانە هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stage">{t('studentPermissions.fields.stage', language)}</Label>
                    <Select value={newEntry.stage} onValueChange={(value) => setNewEntry({...newEntry, stage: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="پۆل هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="leaveDuration">{t('studentPermissions.fields.leaveDuration', language)}</Label>
                  <Input
                    id="leaveDuration"
                    value={newEntry.leaveDuration}
                    onChange={(e) => setNewEntry({...newEntry, leaveDuration: e.target.value})}
                    placeholder="بۆ نموونە: ٣ رۆژ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">{t('studentPermissions.fields.startDate', language)}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEntry.startDate}
                      onChange={(e) => setNewEntry({...newEntry, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">{t('studentPermissions.fields.endDate', language)}</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEntry.endDate}
                      onChange={(e) => setNewEntry({...newEntry, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">{t('studentPermissions.fields.reason', language)}</Label>
                  <Textarea
                    id="reason"
                    value={newEntry.reason}
                    onChange={(e) => setNewEntry({...newEntry, reason: e.target.value})}
                    placeholder="هۆکاری داواکردنی مۆڵەت..."
                  />
                </div>
                <div>
                  <Label htmlFor="status">{t('studentPermissions.fields.status', language)}</Label>
                  <Select value={newEntry.status} onValueChange={(value) => setNewEntry({...newEntry, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">{t('studentPermissions.fields.notes', language)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی سەبارەت بە مۆڵەت..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="supportingVideos">Videos / ڤیدیۆ</Label>
                  <VideoUpload
                    videos={newEntry.supportingVideos}
                    onVideosChange={(videos) => setNewEntry({...newEntry, supportingVideos: videos})}
                    maxVideos={2}
                    placeholder="Upload Supporting Videos"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} disabled={isSaving}>
                    {t('studentPermissions.buttons.cancel', language)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)} disabled={isSaving}>
                    {isSaving ? 'چاوەڕوانبە...' : t('studentPermissions.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Permissions Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <PermissionCardView data={filteredData} />
        ) : (
          <PermissionsTableView data={filteredData} />
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
        title={t('studentPermissions.buttons.edit', language)}
        titleKu={t('studentPermissions.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('studentPermissions.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('studentPermissions.noData.message', language) : t('studentPermissions.noData.emptyMessage', language)}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}