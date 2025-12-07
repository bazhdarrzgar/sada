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
  const [previewImages, setPreviewImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [previewVideos, setPreviewVideos] = useState([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
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
    driverPhoto: [],
    driverLicensePhoto: [],
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
        
        // Update local state with the saved data - new/edited entries go to top
        setBusData(prevData => {
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
      driverPhoto: [],
      driverLicensePhoto: [],
      driverVideos: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...busData]
    updatedData[rowIndex][field] = value
    setBusData(updatedData)
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

  const startEditing = (index) => {
    // First scroll to center quickly
    scrollToCenterFast()
    
    // Small delay to ensure smooth scrolling starts, then open modal
    setTimeout(() => {
      const entry = busData[index]
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 100) // Quick delay to allow scroll to start
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

  // Handle Add Entry with smooth scrolling
  const handleAddEntry = () => {
    // First scroll to center quickly
    scrollToCenterFast()
    
    // Small delay to ensure smooth scrolling starts, then open dialog
    setTimeout(() => {
      setIsAddDialogOpen(true)
    }, 100) // Quick delay to allow scroll to start
  }

  const viewDetails = (index) => {
    // First scroll to center quickly
    scrollToCenterFast()
    
    // Small delay to ensure smooth scrolling starts, then open modal
    setTimeout(() => {
      const entry = busData[index]
      setSelectedRecord(entry)
      setIsDetailModalOpen(true)
    }, 100) // Quick delay to allow scroll to start
  }

  // Helper function to render images with eye icon for preview
  const renderImage = (images, altText, onPreview) => {
    if (!images || (Array.isArray(images) ? images.length === 0 : !images.url)) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg border text-gray-400">
          <ImageIcon className="h-5 w-5" />
        </div>
      )
    }

    // Handle both single image object and array of images
    const imageArray = Array.isArray(images) ? images : [images]
    const firstImage = imageArray[0]

    return (
      <button
        onClick={() => {
          // First scroll to center quickly
          scrollToCenterFast()
          
          // Small delay to ensure smooth scrolling starts, then open preview
          setTimeout(() => {
            if (onPreview) {
              setPreviewImages(imageArray)
              setPreviewImage(firstImage)
              setCurrentImageIndex(0)
              onPreview(firstImage)
            }
          }, 100) // Quick delay to allow scroll to start
        }}
        className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group relative"
        title={`Click to preview ${altText}${imageArray.length > 1 ? ` (${imageArray.length} images)` : ''}`}
      >
        <Eye className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        {imageArray.length > 1 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
            {imageArray.length}
          </span>
        )}
      </button>
    )
  }

  // Helper function to render videos with eye icon for preview
  const renderVideos = (videos, showControls = false) => {
    if (!videos || videos.length === 0) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg border text-gray-400">
          <Play className="h-5 w-5" />
        </div>
      )
    }

    // For detailed view (like in modal), show actual video controls
    if (showControls) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, idx) => (
            <div key={idx} className="relative group">
              <video
                src={video.url}
                className="w-full h-32 rounded-lg object-cover shadow-md"
                controls
                muted
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.originalName || `Video ${idx + 1}`}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // For table view, show eye icon with smooth scrolling
    return (
      <button
        onClick={() => {
          // First scroll to center quickly
          scrollToCenterFast()
          
          // Small delay to ensure smooth scrolling starts, then open preview
          setTimeout(() => {
            setPreviewVideos(videos)
            setPreviewVideo(videos[0])
            setCurrentVideoIndex(0)
          }, 100) // Quick delay to allow scroll to start
        }}
        className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 text-purple-600 dark:text-purple-400 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group relative"
        title={`Click to preview ${videos.length} video${videos.length > 1 ? 's' : ''}`}
      >
        <Eye className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
        {videos.length > 1 && (
          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
            {videos.length}
          </span>
        )}
      </button>
    )
  }

  // Define fields for modal editing - removed as we now use custom edit dialog

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
              ژ.پاس
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
              ژ.قوتابی
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
              ژ.مامۆستا
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-purple-600 dark:text-purple-400">{value}</span>
      },
      {
        key: 'driverPhone',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              ژ.شۆفێر
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{value}</span>
      },
      {
        key: 'driverLicense',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('fields.driverLicense', localLanguage)}
            </span>
          </div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{value}</span>
      },
      {
        key: 'driverPhoto',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              وێنەی شۆفێر
            </span>
          </div>
        ),
        align: 'center',
        editable: false,
        render: (value) => renderImage(value, 'Driver Photo', setPreviewImage)
      },
      {
        key: 'driverLicensePhoto',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              وێنەی مۆڵەتی شۆفێری
            </span>
          </div>
        ),
        align: 'center',
        editable: false,
        render: (value) => renderImage(value, 'Driver License Photo', setPreviewImage)
      },
      {
        key: 'driverVideos',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              ڤیدیۆی شۆفێر
            </span>
          </div>
        ),
        align: 'center',
        editable: false,
        render: (value) => renderVideos(value, false)
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
        render: (value) => <span className="font-medium text-gray-600 dark:text-gray-400">{value}</span>
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
            language={localLanguage}
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
              { key: 'teacherCount', header: t('fields.teacherCount', 'kurdish') },
              { key: 'driverPhone', header: t('fields.driverPhone', 'kurdish') },
              { key: 'driverLicense', header: t('fields.driverLicense', 'kurdish') },
              { key: 'notes', header: t('fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            language={localLanguage}
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddEntry} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
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
                      images={newEntry.driverPhoto || []}
                      onImagesChange={(images) => setNewEntry({...newEntry, driverPhoto: images})}
                      maxImages={6}
                      className="mt-2"
                    />
                  </div>

                  {/* Driver License Photo Upload */}
                  <div>
                    <Label>وێنەی مۆڵەتی شۆفێری / Driver License Photo</Label>
                    <ImageUpload
                      images={newEntry.driverLicensePhoto || []}
                      onImagesChange={(images) => setNewEntry({...newEntry, driverLicensePhoto: images})}
                      maxImages={6}
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

      {/* Edit Dialog - Custom with full media support */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('buttons.edit', localLanguage)}</DialogTitle>
          </DialogHeader>
          {editingData && (
            <div className="space-y-6">
              {/* Bus Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-right">{t('tabs.details', localLanguage)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-busNumber">{t('fields.busNumber', localLanguage)}</Label>
                    <Input
                      id="edit-busNumber"
                      value={editingData.busNumber || ''}
                      onChange={(e) => setEditingData({...editingData, busNumber: e.target.value})}
                      placeholder="Enter bus number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-busType">{t('fields.busType', localLanguage)}</Label>
                    <Input
                      id="edit-busType"
                      value={editingData.busType || ''}
                      onChange={(e) => setEditingData({...editingData, busType: e.target.value})}
                      placeholder="Enter bus type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-route">{t('fields.route', localLanguage)}</Label>
                    <Input
                      id="edit-route"
                      value={editingData.route || ''}
                      onChange={(e) => setEditingData({...editingData, route: e.target.value})}
                      placeholder="Enter route"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-capacity">{t('fields.capacity', localLanguage)}</Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      value={editingData.capacity || ''}
                      onChange={(e) => setEditingData({...editingData, capacity: e.target.value})}
                      placeholder="Enter capacity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-studentCount">{t('fields.studentCount', localLanguage)}</Label>
                    <Input
                      id="edit-studentCount"
                      type="number"
                      value={editingData.studentCount || ''}
                      onChange={(e) => setEditingData({...editingData, studentCount: e.target.value})}
                      placeholder="Enter student count"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-teacherCount">{t('fields.teacherCount', localLanguage)}</Label>
                    <Input
                      id="edit-teacherCount"
                      type="number"
                      value={editingData.teacherCount || ''}
                      onChange={(e) => setEditingData({...editingData, teacherCount: e.target.value})}
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
                    <Label htmlFor="edit-driverName">{t('fields.driverName', localLanguage)}</Label>
                    <Input
                      id="edit-driverName"
                      value={editingData.driverName || ''}
                      onChange={(e) => setEditingData({...editingData, driverName: e.target.value})}
                      placeholder="Enter driver name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-driverPhone">{t('fields.driverPhone', localLanguage)}</Label>
                    <Input
                      id="edit-driverPhone"
                      value={editingData.driverPhone || ''}
                      onChange={(e) => setEditingData({...editingData, driverPhone: e.target.value})}
                      placeholder="Enter driver phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-driverLicense">{t('fields.driverLicense', localLanguage)}</Label>
                    <Input
                      id="edit-driverLicense"
                      value={editingData.driverLicense || ''}
                      onChange={(e) => setEditingData({...editingData, driverLicense: e.target.value})}
                      placeholder="Enter driver license"
                    />
                  </div>
                </div>

                {/* Driver Photo Upload */}
                <div>
                  <Label>وێنەی شۆفێر / Driver Photo</Label>
                  <ImageUpload
                    images={editingData.driverPhoto || []}
                    onImagesChange={(images) => setEditingData({...editingData, driverPhoto: images})}
                    maxImages={6}
                    className="mt-2"
                  />
                </div>

                {/* Driver License Photo Upload */}
                <div>
                  <Label>وێنەی مۆڵەتی شۆفێری / Driver License Photo</Label>
                  <ImageUpload
                    images={editingData.driverLicensePhoto || []}
                    onImagesChange={(images) => setEditingData({...editingData, driverLicensePhoto: images})}
                    maxImages={6}
                    className="mt-2"
                  />
                </div>

                {/* Driver Videos Upload */}
                <div>
                  <Label>ڤیدیۆی شۆفێر / Driver Videos</Label>
                  <VideoUpload
                    videos={editingData.driverVideos || []}
                    onVideosChange={(videos) => setEditingData({...editingData, driverVideos: videos})}
                    maxVideos={3}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="edit-notes">{t('fields.notes', localLanguage)}</Label>
                <Textarea
                  id="edit-notes"
                  value={editingData.notes || ''}
                  onChange={(e) => setEditingData({...editingData, notes: e.target.value})}
                  placeholder="تێبینی سەبارەت بە پاس..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingData(null)
                }}>
                  {t('buttons.cancel', localLanguage)}
                </Button>
                <Button onClick={() => handleModalSave(editingData)}>
                  {t('buttons.save', localLanguage)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border flex justify-center">
                      {selectedRecord.driverPhoto && (Array.isArray(selectedRecord.driverPhoto) ? selectedRecord.driverPhoto.length > 0 : selectedRecord.driverPhoto.url) ? (
                        <button
                          onClick={() => {
                            // First scroll to center quickly
                            scrollToCenterFast()
                            
                            // Small delay to ensure smooth scrolling starts, then open preview
                            setTimeout(() => {
                              const images = Array.isArray(selectedRecord.driverPhoto) ? selectedRecord.driverPhoto : [selectedRecord.driverPhoto]
                              setPreviewImages(images)
                              setPreviewImage(images[0])
                              setCurrentImageIndex(0)
                            }, 100) // Quick delay to allow scroll to start
                          }}
                          className="flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group relative"
                          title="Click to preview driver photo"
                        >
                          <Eye className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                          {Array.isArray(selectedRecord.driverPhoto) && selectedRecord.driverPhoto.length > 1 && (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                              {selectedRecord.driverPhoto.length}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg border text-gray-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* License Photo */}
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      وێنەی مۆڵەتی / License Photo
                    </Label>
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border flex justify-center">
                      {selectedRecord.driverLicensePhoto && (Array.isArray(selectedRecord.driverLicensePhoto) ? selectedRecord.driverLicensePhoto.length > 0 : selectedRecord.driverLicensePhoto.url) ? (
                        <button
                          onClick={() => {
                            // First scroll to center quickly
                            scrollToCenterFast()
                            
                            // Small delay to ensure smooth scrolling starts, then open preview
                            setTimeout(() => {
                              const images = Array.isArray(selectedRecord.driverLicensePhoto) ? selectedRecord.driverLicensePhoto : [selectedRecord.driverLicensePhoto]
                              setPreviewImages(images)
                              setPreviewImage(images[0])
                              setCurrentImageIndex(0)
                            }, 100) // Quick delay to allow scroll to start
                          }}
                          className="flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group relative"
                          title="Click to preview license photo"
                        >
                          <Eye className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                          {Array.isArray(selectedRecord.driverLicensePhoto) && selectedRecord.driverLicensePhoto.length > 1 && (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                              {selectedRecord.driverLicensePhoto.length}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg border text-gray-400">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Driver Videos */}
                  <div className="text-right md:col-span-2">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      ڤیدیۆی شۆفێر / Driver Videos
                    </Label>
                    <div className="mt-1 p-3 bg-white dark:bg-gray-800 rounded border flex justify-center">
                      {selectedRecord.driverVideos && selectedRecord.driverVideos.length > 0 ? (
                        <button
                          onClick={() => {
                            // First scroll to center quickly
                            scrollToCenterFast()
                            
                            // Small delay to ensure smooth scrolling starts, then open preview
                            setTimeout(() => {
                              setPreviewVideos(selectedRecord.driverVideos)
                              setPreviewVideo(selectedRecord.driverVideos[0])
                              setCurrentVideoIndex(0)
                            }, 100) // Quick delay to allow scroll to start
                          }}
                          className="flex items-center justify-center w-12 h-12 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 text-purple-600 dark:text-purple-400 transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md group relative"
                          title={`Click to preview ${selectedRecord.driverVideos.length} video${selectedRecord.driverVideos.length > 1 ? 's' : ''}`}
                        >
                          <Eye className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                          {selectedRecord.driverVideos.length > 1 && (
                            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                              {selectedRecord.driverVideos.length}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg border text-gray-400">
                          <Play className="h-6 w-6" />
                        </div>
                      )}
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

      {/* Enhanced Image Preview Dialog with Image Navigation */}
      <Dialog open={!!previewImage} onOpenChange={() => {
        setPreviewImage(null)
        setPreviewImages([])
        setCurrentImageIndex(0)
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-semibold">
                    {previewImage?.originalName || 'Image Preview'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {previewImage?.size ? `${(previewImage.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    {previewImages.length > 1 && ` • Image ${currentImageIndex + 1} of ${previewImages.length}`}
                  </span>
                </div>
              </div>
              
              {/* Image Navigation - Only show if multiple images */}
              {previewImages.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : previewImages.length - 1
                      setCurrentImageIndex(newIndex)
                      setPreviewImage(previewImages[newIndex])
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg"
                    title="Previous image"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  
                  <span className="text-sm text-gray-300 px-2">
                    {currentImageIndex + 1}/{previewImages.length}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newIndex = currentImageIndex < previewImages.length - 1 ? currentImageIndex + 1 : 0
                      setCurrentImageIndex(newIndex)
                      setPreviewImage(previewImages[newIndex])
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg"
                    title="Next image"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {previewImage && (
            <div className="space-y-4 p-4">
              {/* Enhanced Image Container with Zoom and Controls */}
              <div className="relative bg-black rounded-lg overflow-hidden min-h-[400px] max-h-[70vh] flex items-center justify-center group">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'Image Preview'}
                  className="preview-main-image max-w-full max-h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300 select-none"
                  loading="lazy"
                  onDoubleClick={() => {
                    // Double click for fullscreen
                    const img = document.createElement('img');
                    img.src = previewImage.url;
                    img.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:contain;background:black;z-index:9999;cursor:pointer;';
                    img.onclick = () => img.remove();
                    img.onkeydown = (e) => e.key === 'Escape' && img.remove();
                    document.body.appendChild(img);
                    img.focus();
                  }}
                  draggable={false}
                />
                
                {/* Enhanced Image Controls Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Zoom In */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const img = document.querySelector('.preview-main-image');
                      if (img) {
                        img.style.transform = 'scale(1.5)';
                        img.style.cursor = 'zoom-out';
                      }
                    }}
                    title="Zoom In (Double-click for fullscreen)"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                  
                  {/* Reset Zoom */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const img = document.querySelector('.preview-main-image');
                      if (img) {
                        img.style.transform = 'scale(1)';
                        img.style.cursor = 'zoom-in';
                      }
                    }}
                    title="Reset Zoom"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  
                  {/* Fullscreen */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const img = document.createElement('img');
                      img.src = previewImage.url;
                      img.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:contain;background:black;z-index:9999;cursor:pointer;';
                      img.onclick = () => img.remove();
                      img.onkeydown = (e) => e.key === 'Escape' && img.remove();
                      document.body.appendChild(img);
                      img.focus();
                    }}
                    title="View Fullscreen (ESC to exit)"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
                
                {/* Enhanced Image Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <span>📸</span>
                    <span>{previewImage.originalName || previewImage.filename}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-300">{previewImage.size ? `${(previewImage.size / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
                  </div>
                </div>
                
                {/* Navigation instructions */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="space-y-1">
                    <div>🖱️ Double-click: Fullscreen</div>
                    <div>⌨️ ESC: Exit fullscreen</div>
                  </div>
                </div>
              </div>
              
              {/* Video Thumbnails Navigation - Only show if multiple videos */}
              {previewVideos.length > 1 && (
                <div className="bg-gray-800/80 p-4 rounded-lg">
                  <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    ڤیدیۆکانی دیکە / Other Videos ({previewVideos.length})
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {previewVideos.map((video, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentVideoIndex(index)
                          setPreviewVideo(video)
                        }}
                        className={`flex-shrink-0 relative group transition-all duration-200 ${
                          index === currentVideoIndex 
                            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-105' 
                            : 'hover:scale-105 hover:ring-1 hover:ring-gray-400'
                        }`}
                        title={video.originalName || `Video ${index + 1}`}
                      >
                        <video
                          src={video.url}
                          className="w-24 h-16 object-cover rounded-lg bg-gray-700"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 rounded-lg flex items-center justify-center">
                          <Play className="h-4 w-4 text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded text-center min-w-6">
                          {index + 1}
                        </div>
                        {index === currentVideoIndex && (
                          <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            ▶
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Enhanced Action Bar with More Features */}
              <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                {/* Main Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {previewImage.originalName || previewImage.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">
                        {previewImage.size ? `${(previewImage.size / 1024).toFixed(1)} KB` : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Download Button */}
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
                      className="flex items-center gap-2 bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50 transition-all duration-200"
                    >
                      <Download className="h-4 w-4" />
                      دابەزاندن
                    </Button>
                    
                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Driver Image',
                              text: `Driver image from bus management system`,
                              url: previewImage.url
                            });
                          } catch (err) {
                            // Fallback to copy
                            await navigator.clipboard.writeText(previewImage.url);
                            alert('بەستەرەکە کۆپی کرا / Link copied!');
                          }
                        } else {
                          await navigator.clipboard.writeText(previewImage.url);
                          alert('بەستەرەکە کۆپی کرا / Link copied!');
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      هاوبەشکردن
                    </Button>
                    
                    {/* Print Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print Image - ${previewImage.originalName || 'Driver Image'}</title>
                              <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
                                img { max-width: 100%; max-height: 100vh; object-fit: contain; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                                @media print { body { background: white; } }
                              </style>
                            </head>
                            <body>
                              <img src="${previewImage.url}" alt="${previewImage.originalName || 'Driver Image'}" onload="window.print(); window.close();" />
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }}
                      className="flex items-center gap-2 bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30 hover:border-purple-500/50 transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      چاپکردن
                    </Button>
                    
                    {/* Close Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewImage(null)}
                      className="flex items-center gap-2 bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:border-red-500/50 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                      داخستن
                    </Button>
                  </div>
                </div>
                
                {/* Image Metadata */}
                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    زانیاری وێنە / Image Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">ناوی فایل / Filename</div>
                      <div className="text-white font-medium">{previewImage.originalName || previewImage.filename || 'Unknown'}</div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">قەبارە / Size</div>
                      <div className="text-white font-medium">{previewImage.size ? `${(previewImage.size / 1024).toFixed(1)} KB` : 'Unknown'}</div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">جۆری فایل / Type</div>
                      <div className="text-white font-medium">{previewImage.url?.split('.').pop()?.toUpperCase() || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-gray-400 text-xs mb-2">Quick Actions / کردارە خێراکان:</div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        const img = document.querySelector('.preview-main-image');
                        if (img) img.style.transform = 'scale(2)';
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🔍 2x Zoom
                    </button>
                    <button 
                      onClick={() => {
                        const img = document.querySelector('.preview-main-image');
                        if (img) img.style.filter = img.style.filter === 'grayscale(1)' ? 'none' : 'grayscale(1)';
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🎨 Grayscale
                    </button>
                    <button 
                      onClick={() => {
                        const img = document.querySelector('.preview-main-image');
                        if (img) img.style.filter = img.style.filter === 'brightness(1.5)' ? 'none' : 'brightness(1.5)';
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      💡 Bright
                    </button>
                    <button 
                      onClick={() => {
                        const img = document.querySelector('.preview-main-image');
                        if (img) img.style.filter = img.style.filter === 'contrast(1.5)' ? 'none' : 'contrast(1.5)';
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🌗 Contrast
                    </button>
                    <button 
                      onClick={() => {
                        const img = document.querySelector('.preview-main-image');
                        if (img) {
                          img.style.transform = 'scale(1)';
                          img.style.filter = 'none';
                        }
                      }}
                      className="px-3 py-1 bg-red-700 hover:bg-red-600 text-red-300 rounded text-xs transition-colors duration-200"
                    >
                      🔄 Reset All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Enhanced Video Preview Dialog with Video Navigation */}
      <Dialog open={!!previewVideo} onOpenChange={() => {
        setPreviewVideo(null)
        setPreviewVideos([])
        setCurrentVideoIndex(0)
      }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Play className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-semibold">
                    {previewVideo?.originalName || 'Video Preview'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {previewVideo?.size ? `${(previewVideo.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size'}
                    {previewVideos.length > 1 && ` • Video ${currentVideoIndex + 1} of ${previewVideos.length}`}
                  </span>
                </div>
              </div>
              
              {/* Video Navigation - Only show if multiple videos */}
              {previewVideos.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newIndex = currentVideoIndex > 0 ? currentVideoIndex - 1 : previewVideos.length - 1
                      setCurrentVideoIndex(newIndex)
                      setPreviewVideo(previewVideos[newIndex])
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg"
                    title="Previous video"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  
                  <span className="text-sm text-gray-300 px-2">
                    {currentVideoIndex + 1}/{previewVideos.length}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newIndex = currentVideoIndex < previewVideos.length - 1 ? currentVideoIndex + 1 : 0
                      setCurrentVideoIndex(newIndex)
                      setPreviewVideo(previewVideos[newIndex])
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg"
                    title="Next video"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {previewVideo && (
            <div className="space-y-4 p-4">
              {/* Enhanced Video Player Container */}
              <div className="relative bg-black rounded-lg overflow-hidden min-h-[400px] max-h-[70vh] flex items-center justify-center group">
                <video
                  src={previewVideo.url}
                  className="preview-main-video max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  controls
                  autoPlay={false}
                  muted={false}
                  preload="metadata"
                  style={{ maxHeight: '60vh' }}
                  onLoadedMetadata={(e) => {
                    console.log('Video loaded:', {
                      duration: e.target.duration,
                      width: e.target.videoWidth,
                      height: e.target.videoHeight
                    });
                  }}
                />
                
                {/* Enhanced Video Controls Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Playback Speed */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const video = document.querySelector('.preview-main-video');
                      if (video) {
                        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
                        const currentSpeed = video.playbackRate;
                        const nextSpeedIndex = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
                        video.playbackRate = speeds[nextSpeedIndex];
                        
                        // Show speed indicator
                        const indicator = document.createElement('div');
                        indicator.textContent = `${speeds[nextSpeedIndex]}x`;
                        indicator.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-lg font-bold';
                        video.parentElement.appendChild(indicator);
                        setTimeout(() => indicator.remove(), 1500);
                      }
                    }}
                    title="Change Playback Speed"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                  
                  {/* Picture-in-Picture */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const video = document.querySelector('.preview-main-video');
                      if (video && video.requestPictureInPicture) {
                        video.requestPictureInPicture().catch(console.error);
                      }
                    }}
                    title="Picture-in-Picture Mode"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h11a1 1 0 011 1v11a1 1 0 01-1 1h-2v2a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h2z" />
                    </svg>
                  </button>
                  
                  {/* Fullscreen */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const video = document.querySelector('.preview-main-video');
                      if (video && video.requestFullscreen) {
                        video.requestFullscreen().catch(console.error);
                      }
                    }}
                    title="Fullscreen Mode (F key)"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  
                  {/* Volume Control */}
                  <button
                    className="p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      const video = document.querySelector('.preview-main-video');
                      if (video) {
                        video.muted = !video.muted;
                      }
                    }}
                    title="Toggle Mute (M key)"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 10H4a1 1 0 00-1 1v2a1 1 0 001 1h2l3.464 3.464A1 1 0 0011 17V7a1 1 0 00-1.536-.844L6 10z" />
                    </svg>
                  </button>
                </div>
                
                {/* Video Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <span>🎬</span>
                    <span>{previewVideo.originalName || previewVideo.filename}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-300">{previewVideo.size ? `${(previewVideo.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size'}</span>
                  </div>
                </div>
                
                {/* Keyboard shortcuts info */}
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="space-y-1">
                    <div>⌨️ Space: Play/Pause</div>
                    <div>🎵 M: Mute/Unmute</div>
                    <div>🖥️ F: Fullscreen</div>
                    <div>⏩ ←/→: Seek ±10s</div>
                  </div>
                </div>
              </div>
              
              {/* Image Thumbnails Navigation - Only show if multiple images */}
              {previewImages.length > 1 && (
                <div className="bg-gray-800/80 p-4 rounded-lg">
                  <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    وێنەکانی دیکە / Other Images ({previewImages.length})
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {previewImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index)
                          setPreviewImage(image)
                        }}
                        className={`flex-shrink-0 relative group transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black scale-105' 
                            : 'hover:scale-105 hover:ring-1 hover:ring-gray-400'
                        }`}
                        title={image.originalName || `Image ${index + 1}`}
                      >
                        <img
                          src={image.url}
                          alt={image.originalName || `Image ${index + 1}`}
                          className="w-24 h-16 object-cover rounded-lg bg-gray-700"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 rounded-lg flex items-center justify-center">
                          <Eye className="h-4 w-4 text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded text-center min-w-6">
                          {index + 1}
                        </div>
                        {index === currentImageIndex && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            👁
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Enhanced Action Bar with More Features */}
              <div className="bg-gray-800 p-4 rounded-lg space-y-3">
                {/* Main Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {previewVideo.originalName || previewVideo.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">
                        {previewVideo.size ? `${(previewVideo.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Download Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = previewVideo.url
                        link.download = previewVideo.originalName || previewVideo.filename
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      className="flex items-center gap-2 bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30 hover:border-green-500/50 transition-all duration-200"
                    >
                      <Download className="h-4 w-4" />
                      دابەزاندن
                    </Button>
                    
                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Driver Video',
                              text: `Driver video from bus management system`,
                              url: previewVideo.url
                            });
                          } catch (err) {
                            await navigator.clipboard.writeText(previewVideo.url);
                            alert('بەستەرەکە کۆپی کرا / Link copied!');
                          }
                        } else {
                          await navigator.clipboard.writeText(previewVideo.url);
                          alert('بەستەرەکە کۆپی کرا / Link copied!');
                        }
                      }}
                      className="flex items-center gap-2 bg-blue-600/20 border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      هاوبەشکردن
                    </Button>
                    
                    {/* Loop Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) {
                          video.loop = !video.loop;
                          const button = event.target.closest('button');
                          button.style.background = video.loop ? 'rgba(147, 51, 234, 0.3)' : '';
                        }
                      }}
                      className="flex items-center gap-2 bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/30 hover:border-purple-500/50 transition-all duration-200"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      تووژاوە
                    </Button>
                    
                    {/* Close Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewVideo(null)}
                      className="flex items-center gap-2 bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30 hover:border-red-500/50 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                      داخستن
                    </Button>
                  </div>
                </div>
                
                {/* Video Metadata */}
                <div className="border-t border-gray-700 pt-3">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    زانیاری ڤیدیۆ / Video Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">ناوی فایل / Filename</div>
                      <div className="text-white font-medium">{previewVideo.originalName || previewVideo.filename || 'Unknown'}</div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">قەبارە / Size</div>
                      <div className="text-white font-medium">{previewVideo.size ? `${(previewVideo.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown'}</div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">جۆری فایل / Type</div>
                      <div className="text-white font-medium">{previewVideo.url?.split('.').pop()?.toUpperCase() || 'Unknown'}</div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 mb-1">درێژایی / Duration</div>
                      <div className="text-white font-medium" id="video-duration">Loading...</div>
                    </div>
                  </div>
                </div>
                
                {/* Video Playback Controls */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-gray-400 text-xs mb-2">Playback Controls / کۆنترۆڵی لێدان:</div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) video.playbackRate = 0.5;
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🐌 0.5x
                    </button>
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) video.playbackRate = 0.75;
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🚶 0.75x
                    </button>
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) video.playbackRate = 1;
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      ▶️ 1x
                    </button>
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) video.playbackRate = 1.25;
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🏃 1.25x
                    </button>
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) video.playbackRate = 1.5;
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🏃‍♂️ 1.5x
                    </button>
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) video.playbackRate = 2;
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors duration-200"
                    >
                      🚀 2x
                    </button>
                    <button 
                      onClick={() => {
                        const video = document.querySelector('.preview-main-video');
                        if (video) {
                          video.currentTime = 0;
                          video.play();
                        }
                      }}
                      className="px-3 py-1 bg-blue-700 hover:bg-blue-600 text-blue-300 rounded text-xs transition-colors duration-200"
                    >
                      🔄 Restart
                    </button>
                  </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-gray-400 text-xs mb-2">Keyboard Shortcuts / کورتەڕێی تەختەکلیل:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
                    <div><kbd className="bg-gray-700 px-1 rounded">Space</kbd> Play/Pause</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">M</kbd> Mute/Unmute</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">F</kbd> Fullscreen</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">←/→</kbd> Seek ±10s</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">↑/↓</kbd> Volume ±10%</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">0-9</kbd> Seek to %</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">Home</kbd> Start</div>
                    <div><kbd className="bg-gray-700 px-1 rounded">End</kbd> End</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}