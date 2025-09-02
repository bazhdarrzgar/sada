'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Eye, Bus, Download, X, Image as ImageIcon, Play, Languages } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { LocalLanguageToggle } from '@/components/ui/local-language-toggle'
import ImageUpload from '@/components/ui/image-upload'
import VideoUpload from '@/components/ui/video-upload'
import Fuse from 'fuse.js'

// Translation function for this component
const t = (key, lang = 'kurdish') => {
  const translations = {
    title: {
      english: 'Bus Management',
      kurdish: 'بەڕێوەبردنی پاس'
    },
    searchPlaceholder: {
      english: 'Fuzzy search across all bus management columns...',
      kurdish: 'گەڕانی فازی لە هەموو ستوونەکانی بەڕێوەبردنی پاسدا...'
    },
    addButton: {
      english: 'Add Bus Record',
      kurdish: 'زیادکردنی تۆماری پاس'
    },
    addTitle: {
      english: 'Add New Bus Record',
      kurdish: 'زیادکردنی تۆماری پاسی نوێ'
    },
    tabs: {
      details: {
        english: 'Bus Details',
        kurdish: 'وردەکاری پاس'
      },
      driver: {
        english: 'Driver Info',
        kurdish: 'زانیاری شۆفێر'
      }
    },
    fields: {
      busNumber: {
        english: 'Bus Number',
        kurdish: 'ژمارەی پاس'
      },
      busType: {
        english: 'Bus Type',
        kurdish: 'جۆری پاس'
      },
      route: {
        english: 'Route',
        kurdish: 'ڕێگا'
      },
      capacity: {
        english: 'Capacity',
        kurdish: 'گونجایی'
      },
      studentCount: {
        english: 'Student Count',
        kurdish: 'ژمارەی قوتابی'
      },
      teacherCount: {
        english: 'Teacher Count',
        kurdish: 'ژمارەی مامۆستا'
      },
      driverName: {
        english: 'Driver Name',
        kurdish: 'ناوی شۆفێر'
      },
      driverPhone: {
        english: 'Driver Phone',
        kurdish: 'تەلەفۆنی شۆفێر'
      },
      driverLicense: {
        english: 'Driver License',
        kurdish: 'مۆڵەتی شۆفێری'
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
        english: 'Edit Bus Record',
        kurdish: 'دەستکاریکردنی تۆماری پاس'
      },
      viewDetails: {
        english: 'View Details',
        kurdish: 'بینینی وردەکاری'
      },
      close: {
        english: 'Close',
        kurdish: 'داخستن'
      }
    },
    noData: {
      title: {
        english: 'No bus records found',
        kurdish: 'هیچ تۆمارێکی پاس نەدۆزرایەوە'
      },
      message: {
        english: 'No results found for your search',
        kurdish: 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە'
      },
      emptyMessage: {
        english: 'No bus records have been added yet',
        kurdish: 'تا ئێستا هیچ تۆمارێکی پاس زیاد نەکراوە'
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

export default function BusPage() {
  const isMobile = useIsMobile()
  const [localLanguage, setLocalLanguage] = useState('kurdish')
  const [busData, setBusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [newEntry, setNewEntry] = useState({
    busNumber: '',
    busType: '',
    route: '',
    capacity: '',
    studentCount: '',
    teacherCount: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    driverPhoto: null,
    driverLicensePhoto: null,
    driverVideos: [],
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'busNumber', weight: 0.2 },
        { name: 'busType', weight: 0.15 },
        { name: 'route', weight: 0.15 },
        { name: 'driverName', weight: 0.2 },
        { name: 'driverPhone', weight: 0.1 },
        { name: 'driverLicense', weight: 0.1 },
        { name: 'notes', weight: 0.1 },
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          return [
            obj.busNumber || '',
            obj.busType || '',
            obj.route || '',
            obj.capacity ? obj.capacity.toString() : '',
            obj.studentCount ? obj.studentCount.toString() : '',
            obj.teacherCount ? obj.teacherCount.toString() : '',
            obj.driverName || '',
            obj.driverPhone || '',
            obj.driverLicense || '',
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
    return new Fuse(busData, options)
  }, [busData])

  // Fetch bus data from API
  useEffect(() => {
    fetchBusData()
  }, [])

  const fetchBusData = async () => {
    try {
      const response = await fetch('/api/bus')
      if (response.ok) {
        const data = await response.json()
        setBusData(data)
      }
    } catch (error) {
      console.error('Error fetching bus data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('bus-')) {
        // Update existing entry
        response = await fetch(`/api/bus/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('bus-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/bus', {
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
        setBusData(prevData => {
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
      if (id.startsWith('bus-')) {
        // Remove from local state only if it's a temporary entry
        setBusData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/bus/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBusData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      busNumber: '',
      busType: '',
      route: '',
      capacity: '',
      studentCount: '',
      teacherCount: '',
      driverName: '',
      driverPhone: '',
      driverLicense: '',
      driverPhoto: null,
      driverLicensePhoto: null,
      driverVideos: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...busData]
    updatedData[rowIndex][field] = value
    setBusData(updatedData)
  }

  const startEditing = (index) => {
    const entry = busData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = busData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchBusData()
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  const viewDetails = (index) => {
    const entry = busData[index]
    setSelectedRecord(entry)
    setIsDetailModalOpen(true)
  }

  // Helper function to render images
  const renderImage = (image, altText, onPreview) => {
    if (!image || !image.url) {
      return (
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded border text-gray-400">
          <ImageIcon className="h-6 w-6" />
        </div>
      )
    }

    return (
      <img
        src={image.url}
        alt={altText}
        className="w-16 h-16 rounded object-cover cursor-pointer hover:scale-110 transition-transform border-2 border-gray-200"
        onClick={() => onPreview && onPreview(image)}
      />
    )
  }

  // Helper function to render videos
  const renderVideos = (videos, showControls = false) => {
    if (!videos || videos.length === 0) {
      return (
        <div className="flex items-center justify-center w-full h-16 bg-gray-100 dark:bg-gray-700 rounded border text-gray-400">
          <Play className="h-6 w-6 mr-2" />
          <span className="text-sm">هیچ ڤیدیۆیەک نییە</span>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {videos.slice(0, showControls ? videos.length : 2).map((video, idx) => (
          <div key={idx} className="relative">
            <video
              src={video.url}
              className="w-full h-20 rounded object-cover"
              controls={showControls}
              muted
            />
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1 rounded">
              {video.originalName || `Video ${idx + 1}`}
            </div>
          </div>
        ))}
        {!showControls && videos.length > 2 && (
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border text-gray-600 dark:text-gray-400 text-xs">
            +{videos.length - 2} more
          </div>
        )}
      </div>
    )
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'busNumber',
      label: t('fields.busNumber', localLanguage),
      labelKu: t('fields.busNumber', 'kurdish'),
      type: 'text',
      placeholder: 'Enter bus number'
    },
    {
      key: 'busType',
      label: t('fields.busType', localLanguage),
      labelKu: t('fields.busType', 'kurdish'),
      type: 'text',
      placeholder: 'Enter bus type'
    },
    {
      key: 'route',
      label: t('fields.route', localLanguage),
      labelKu: t('fields.route', 'kurdish'),
      type: 'text',
      placeholder: 'Enter route'
    },
    {
      key: 'capacity',
      label: t('fields.capacity', localLanguage),
      labelKu: t('fields.capacity', 'kurdish'),
      type: 'number',
      placeholder: 'Enter capacity'
    },
    {
      key: 'studentCount',
      label: t('fields.studentCount', localLanguage),
      labelKu: t('fields.studentCount', 'kurdish'),
      type: 'number',
      placeholder: 'Enter student count'
    },
    {
      key: 'teacherCount',
      label: t('fields.teacherCount', localLanguage),
      labelKu: t('fields.teacherCount', 'kurdish'),
      type: 'number',
      placeholder: 'Enter teacher count'
    },
    {
      key: 'driverName',
      label: t('fields.driverName', localLanguage),
      labelKu: t('fields.driverName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter driver name'
    },
    {
      key: 'driverPhone',
      label: t('fields.driverPhone', localLanguage),
      labelKu: t('fields.driverPhone', 'kurdish'),
      type: 'text',
      placeholder: 'Enter driver phone'
    },
    {
      key: 'driverLicense',
      label: t('fields.driverLicense', localLanguage),
      labelKu: t('fields.driverLicense', 'kurdish'),
      type: 'text',
      placeholder: 'Enter driver license'
    },
    {
      key: 'notes',
      label: t('fields.notes', localLanguage),
      labelKu: t('fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە پاس...',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return busData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, busData])

  function BusCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.busNumber}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">{t('fields.busType', localLanguage)}:</span> {entry.busType}</div>
                <div><span className="font-semibold">{t('fields.route', localLanguage)}:</span> {entry.route}</div>
                <div><span className="font-semibold">{t('fields.capacity', localLanguage)}:</span> {entry.capacity}</div>
                <div><span className="font-semibold">{t('fields.driverName', localLanguage)}:</span> {entry.driverName}</div>
                <div><span className="font-semibold">{t('fields.studentCount', localLanguage)}:</span> {entry.studentCount}</div>
                <div><span className="font-semibold">{t('fields.teacherCount', localLanguage)}:</span> {entry.teacherCount}</div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">{t('fields.notes', localLanguage)}:</span> {entry.notes}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => viewDetails(idx)} className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200">
                  <Eye className="h-4 w-4" />
                  {t('buttons.viewDetails', localLanguage)}
                </Button>
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

  function BusTableView({ data }) {
    // Define table columns for bus management
    const columns = [
      {
        key: 'busNumber',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.busNumber', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'busType',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.busType', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'route',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.route', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'capacity',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.capacity', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{value}</span>
      },
      {
        key: 'driverName',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.driverName', localLanguage)}
            </span>
          </div>
        ),
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'studentCount',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.studentCount', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{value}</span>
      },
      {
        key: 'teacherCount',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.teacherCount', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-purple-600 dark:text-purple-400">{value}</span>
      },
      {
        key: 'actions',
        header: 'Actions',
        align: 'center',
        editable: false,
        render: (value, row, rowIndex) => (
          <div className="flex gap-1 justify-center">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => viewDetails(rowIndex)}
              className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
              title={t('buttons.viewDetails', localLanguage)}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
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
        maxRowsPerPage={12}
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
        onLanguageChange={setLocalLanguage}
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
      onLanguageChange={setLocalLanguage}
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
            filename="bus-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="bus-records"
            title={t('title', localLanguage)}
            titleKu={t('title', 'kurdish')}
            columns={[
              { key: 'busNumber', header: t('fields.busNumber', 'kurdish') },
              { key: 'busType', header: t('fields.busType', 'kurdish') },
              { key: 'route', header: t('fields.route', 'kurdish') },
              { key: 'capacity', header: t('fields.capacity', 'kurdish') },
              { key: 'driverName', header: t('fields.driverName', 'kurdish') },
              { key: 'studentCount', header: t('fields.studentCount', 'kurdish') },
              { key: 'teacherCount', header: t('fields.teacherCount', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {t('addButton', localLanguage)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('addTitle', localLanguage)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Bus Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right">{t('tabs.details', localLanguage)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="busNumber">{t('fields.busNumber', localLanguage)}</Label>
                      <Input
                        id="busNumber"
                        value={newEntry.busNumber}
                        onChange={(e) => setNewEntry({...newEntry, busNumber: e.target.value})}
                        placeholder="Enter bus number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="busType">{t('fields.busType', localLanguage)}</Label>
                      <Input
                        id="busType"
                        value={newEntry.busType}
                        onChange={(e) => setNewEntry({...newEntry, busType: e.target.value})}
                        placeholder="Enter bus type"
                      />
                    </div>
                    <div>
                      <Label htmlFor="route">{t('fields.route', localLanguage)}</Label>
                      <Input
                        id="route"
                        value={newEntry.route}
                        onChange={(e) => setNewEntry({...newEntry, route: e.target.value})}
                        placeholder="Enter route"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">{t('fields.capacity', localLanguage)}</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={newEntry.capacity}
                        onChange={(e) => setNewEntry({...newEntry, capacity: e.target.value})}
                        placeholder="Enter capacity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentCount">{t('fields.studentCount', localLanguage)}</Label>
                      <Input
                        id="studentCount"
                        type="number"
                        value={newEntry.studentCount}
                        onChange={(e) => setNewEntry({...newEntry, studentCount: e.target.value})}
                        placeholder="Enter student count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherCount">{t('fields.teacherCount', localLanguage)}</Label>
                      <Input
                        id="teacherCount"
                        type="number"
                        value={newEntry.teacherCount}
                        onChange={(e) => setNewEntry({...newEntry, teacherCount: e.target.value})}
                        placeholder="Enter teacher count"
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-right">{t('tabs.driver', localLanguage)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driverName">{t('fields.driverName', localLanguage)}</Label>
                      <Input
                        id="driverName"
                        value={newEntry.driverName}
                        onChange={(e) => setNewEntry({...newEntry, driverName: e.target.value})}
                        placeholder="Enter driver name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverPhone">{t('fields.driverPhone', localLanguage)}</Label>
                      <Input
                        id="driverPhone"
                        value={newEntry.driverPhone}
                        onChange={(e) => setNewEntry({...newEntry, driverPhone: e.target.value})}
                        placeholder="Enter driver phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverLicense">{t('fields.driverLicense', localLanguage)}</Label>
                      <Input
                        id="driverLicense"
                        value={newEntry.driverLicense}
                        onChange={(e) => setNewEntry({...newEntry, driverLicense: e.target.value})}
                        placeholder="Enter driver license"
                      />
                    </div>
                  </div>

                  {/* Driver Photo Upload */}
                  <div>
                    <Label>وێنەی شۆفێر / Driver Photo</Label>
                    <ImageUpload
                      images={newEntry.driverPhoto ? [newEntry.driverPhoto] : []}
                      onImagesChange={(images) => setNewEntry({...newEntry, driverPhoto: images[0] || null})}
                      maxImages={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Driver License Photo Upload */}
                  <div>
                    <Label>وێنەی مۆڵەتی شۆفێری / Driver License Photo</Label>
                    <ImageUpload
                      images={newEntry.driverLicensePhoto ? [newEntry.driverLicensePhoto] : []}
                      onImagesChange={(images) => setNewEntry({...newEntry, driverLicensePhoto: images[0] || null})}
                      maxImages={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Driver Videos Upload */}
                  <div>
                    <Label>ڤیدیۆی شۆفێر / Driver Videos</Label>
                    <VideoUpload
                      videos={newEntry.driverVideos}
                      onVideosChange={(videos) => setNewEntry({...newEntry, driverVideos: videos})}
                      maxVideos={3}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">{t('fields.notes', localLanguage)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی سەبارەت بە پاس..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    {t('buttons.cancel', localLanguage)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    {t('buttons.save', localLanguage)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bus Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <BusCardView data={filteredData} />
        ) : (
          <BusTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
      />

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">
              وردەکاری پاس {selectedRecord?.busNumber} / Bus Details {selectedRecord?.busNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Bus Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3 text-right">
                  زانیاری پاس / Bus Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
                  <div>
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      ژمارەی پاس / Bus Number
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.busNumber || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      جۆری پاس / Bus Type
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.busType || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      ڕێگا / Route
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.route || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      گونجایی / Capacity
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.capacity || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      ژمارەی قوتابی / Student Count
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.studentCount || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      ژمارەی مامۆستا / Teacher Count
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.teacherCount || 'نەناسراو'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Information */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3 text-right">
                  زانیاری شۆفێر / Driver Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
                  <div>
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      ناوی شۆفێر / Driver Name
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.driverName || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      تەلەفۆنی شۆفێر / Driver Phone
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.driverPhone || 'نەناسراو'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      مۆڵەتی شۆفێری / Driver License
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.driverLicense || 'نەناسراو'}
                    </p>
                  </div>
                  
                  {/* Driver Photo */}
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      وێنەی شۆفێر / Driver Photo
                    </Label>
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {renderImage(selectedRecord.driverPhoto, 'Driver Photo', setPreviewImage)}
                    </div>
                  </div>
                  
                  {/* License Photo */}
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      وێنەی مۆڵەتی / License Photo
                    </Label>
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {renderImage(selectedRecord.driverLicensePhoto, 'License Photo', setPreviewImage)}
                    </div>
                  </div>
                  
                  {/* Driver Videos */}
                  <div className="text-right md:col-span-2">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      ڤیدیۆی شۆفێر / Driver Videos
                    </Label>
                    <div className="mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
                      {renderVideos(selectedRecord.driverVideos, true)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    تێبینی / Notes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-right leading-relaxed">
                    {selectedRecord.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      const recordIndex = filteredData.findIndex(item => item.id === selectedRecord.id)
                      if (recordIndex !== -1) {
                        startEditing(recordIndex)
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    دەستکاریکردن / Edit
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('دڵنیایت لە سڕینەوەی ئەم تۆمارە؟ / Are you sure you want to delete this record?')) {
                        deleteEntry(selectedRecord.id)
                        setIsDetailModalOpen(false)
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    سڕینەوە / Delete
                  </Button>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('buttons.close', localLanguage)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.originalName || 'Image Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              {/* Full size image with optimized viewing */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'Image Preview'}
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