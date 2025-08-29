'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Bus, Image as ImageIcon, Download, X, Video, Play } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import LicenseImageUpload from '@/components/ui/license-image-upload'
import VideoUpload from '@/components/ui/video-upload'
import Fuse from 'fuse.js'

export default function BusPage() {
  const isMobile = useIsMobile()
  const [busData, setBusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    // Student passenger info
    studentFullName: '',
    studentClass: '',
    studentMobile: '',
    studentAddress: '',
    
    // Teacher info
    teacherFullName: '',
    teacherMobile: '',
    teacherAddress: '',
    teachingExperience: '',
    teacherClass: '',
    
    // Bus driver info
    driverFullName: '',
    driverLicenseImage: null, // Changed to object for image data
    driverPhoto: null, // New field: وێنەی سایەق
    driverLicensePhoto: null, // New field: وێنەی ئیجازەی
    driverVideos: [], // New field: دانانی ڤیدیۆ
    driverMobile: '',
    driverAddress: '',
    
    // Notes field
    notes: ''
  })

  const classOptions = ['پۆل یەکەم', 'پۆل دووەم', 'پۆل سێەم', 'پۆل چوارەم', 'پۆل پێنجەم', 'پۆل شەشەم', 'پۆل حەوتەم', 'پۆل هەشتەم', 'پۆل نۆیەم', 'پۆل دەیەم', 'پۆل یازدەیەم', 'پۆل دوازدەیەم']

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        // Student fields
        { name: 'studentFullName', weight: 0.2 },
        { name: 'studentClass', weight: 0.15 },
        { name: 'studentMobile', weight: 0.1 },
        { name: 'studentAddress', weight: 0.1 },
        
        // Teacher fields
        { name: 'teacherFullName', weight: 0.2 },
        { name: 'teacherMobile', weight: 0.1 },
        { name: 'teacherAddress', weight: 0.1 },
        { name: 'teachingExperience', weight: 0.15 },
        { name: 'teacherClass', weight: 0.15 },
        
        // Driver fields
        { name: 'driverFullName', weight: 0.2 },
        { name: 'driverMobile', weight: 0.1 },
        { name: 'driverAddress', weight: 0.1 },
        
        // Notes field
        { name: 'notes', weight: 0.15 },
        
        // Combined search field
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          return [
            obj.studentFullName || '',
            obj.studentClass || '',
            obj.studentMobile || '',
            obj.studentAddress || '',
            obj.teacherFullName || '',
            obj.teacherMobile || '',
            obj.teacherAddress || '',
            obj.teachingExperience || '',
            obj.teacherClass || '',
            obj.driverFullName || '',
            obj.driverMobile || '',
            obj.driverAddress || '',
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
      
      // Prepare entry data for saving
      const entryToSave = { ...entry }
      
      // Handle license image data - convert object to URL string if needed
      if (entryToSave.driverLicenseImage && typeof entryToSave.driverLicenseImage === 'object') {
        entryToSave.driverLicenseImage = entryToSave.driverLicenseImage.url || ''
      }
      
      // Handle driver photo data
      if (entryToSave.driverPhoto && typeof entryToSave.driverPhoto === 'object') {
        entryToSave.driverPhoto = entryToSave.driverPhoto.url || ''
      }
      
      // Handle driver license photo data
      if (entryToSave.driverLicensePhoto && typeof entryToSave.driverLicensePhoto === 'object') {
        entryToSave.driverLicensePhoto = entryToSave.driverLicensePhoto.url || ''
      }
      
      // Handle videos data - keep as array of objects
      if (entryToSave.driverVideos && Array.isArray(entryToSave.driverVideos)) {
        entryToSave.driverVideos = entryToSave.driverVideos
      } else {
        entryToSave.driverVideos = []
      }
      
      if (entry.id && !entry.id.startsWith('bus-')) {
        // Update existing entry
        response = await fetch(`/api/bus/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      } else {
        // Create new entry
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
      // Student passenger info
      studentFullName: '',
      studentClass: '',
      studentMobile: '',
      studentAddress: '',
      
      // Teacher info
      teacherFullName: '',
      teacherMobile: '',
      teacherAddress: '',
      teachingExperience: '',
      teacherClass: '',
      
      // Bus driver info
      driverFullName: '',
      driverLicenseImage: null, // Changed to null for image object
      driverPhoto: null, // New field: وێنەی سایەق
      driverLicensePhoto: null, // New field: وێنەی ئیجازەی
      driverVideos: [], // New field: دانانی ڤیدیۆ
      driverMobile: '',
      driverAddress: '',
      
      // Notes field
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

  // Define fields for modal editing
  const editFields = [
    // Student Info Section
    {
      key: 'section-student',
      label: 'Student Passenger Information',
      labelKu: 'زانیاری قوتابیی سەرنشین',
      type: 'section-header',
      span: 'full'
    },
    {
      key: 'studentFullName',
      label: 'Student Full Name',
      labelKu: 'ناوی تەواوی قوتابی',
      type: 'text',
      placeholder: 'ناوی تەواوی قوتابی بنووسە...'
    },
    {
      key: 'studentClass',
      label: 'Class',
      labelKu: 'پۆل',
      type: 'select',
      options: classOptions.map(cls => ({ value: cls, label: cls })),
      placeholder: 'پۆل هەڵبژێرە'
    },
    {
      key: 'studentMobile',
      label: 'Mobile Number',
      labelKu: 'ژ.مۆبایل',
      type: 'text',
      placeholder: 'ژمارەی مۆبایل بنووسە...'
    },
    {
      key: 'studentAddress',
      label: 'Address',
      labelKu: 'شوێنی نیشتەجێبوون',
      type: 'text',
      placeholder: 'ناونیشان بنووسە...'
    },
    
    // Teacher Info Section
    {
      key: 'section-teacher',
      label: 'Teacher Information',
      labelKu: 'زانیاری مامۆستا',
      type: 'section-header',
      span: 'full'
    },
    {
      key: 'teacherFullName',
      label: 'Teacher Full Name',
      labelKu: 'ناوی تەواوی مامۆستا',
      type: 'text',
      placeholder: 'ناوی تەواوی مامۆستا بنووسە...'
    },
    {
      key: 'teacherMobile',
      label: 'Mobile Number',
      labelKu: 'ژ.مۆبایل',
      type: 'text',
      placeholder: 'ژمارەی مۆبایل بنووسە...'
    },
    {
      key: 'teacherAddress',
      label: 'Address',
      labelKu: 'شوێنی نیشتەجێبوون',
      type: 'text',
      placeholder: 'ناونیشان بنووسە...'
    },
    {
      key: 'teachingExperience',
      label: 'Teaching Experience',
      labelKu: 'ئەزموونی وانە',
      type: 'text',
      placeholder: 'ئەزموونی وانەوتنەوە بنووسە...'
    },
    {
      key: 'teacherClass',
      label: 'Class',
      labelKu: 'پۆل',
      type: 'select',
      options: classOptions.map(cls => ({ value: cls, label: cls })),
      placeholder: 'پۆل هەڵبژێرە'
    },
    
    // Driver Info Section
    {
      key: 'section-driver',
      label: 'Bus Driver Information',
      labelKu: 'زانیاری شۆفێری پاس',
      type: 'section-header',
      span: 'full'
    },
    {
      key: 'driverFullName',
      label: 'Driver Full Name',
      labelKu: 'ناوی تەواوی شۆفێر',
      type: 'text',
      placeholder: 'ناوی تەواوی شۆفێر بنووسە...'
    },
    {
      key: 'driverPhoto',
      label: 'Driver Photo',
      labelKu: 'وێنەی سایەق',
      type: 'license-image-upload',
      placeholder: 'Upload driver photo',
      span: 'full'
    },
    {
      key: 'driverLicensePhoto',
      label: 'License Photo',
      labelKu: 'وێنەی ئیجازەی',
      type: 'license-image-upload',
      placeholder: 'Upload license photo',
      span: 'full'
    },
    {
      key: 'driverVideos',
      label: 'Driver Videos',
      labelKu: 'دانانی ڤیدیۆ',
      type: 'video-upload',
      placeholder: 'Upload driver videos',
      span: 'full'
    },
    {
      key: 'driverLicenseImage',
      label: 'Legacy License Image',
      labelKu: 'وێنەی سەنەوی',
      type: 'license-image-upload',
      placeholder: 'Upload license image',
      span: 'full'
    },
    {
      key: 'driverMobile',
      label: 'Mobile Number',
      labelKu: 'ژ.مۆبایل',
      type: 'text',
      placeholder: 'ژمارەی مۆبایل بنووسە...'
    },
    {
      key: 'driverAddress',
      label: 'Address',
      labelKu: 'شوێنی نیشتەجێبوون',
      type: 'text',
      placeholder: 'ناونیشان بنووسە...'
    },
    {
      key: 'notes',
      label: 'Notes',
      labelKu: 'تێبینی',
      type: 'text',
      placeholder: 'تێبینی بنووسە...',
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

  // Calculate statistics
  const totalRecords = filteredData.length
  const studentsCount = filteredData.filter(entry => entry.studentFullName?.trim()).length
  const teachersCount = filteredData.filter(entry => entry.teacherFullName?.trim()).length
  const driversCount = filteredData.filter(entry => entry.driverFullName?.trim()).length

  function BusCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                  پاسی ژ.{idx + 1}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)} className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Student Info */}
              <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">زانیاری قوتابیی سەرنشین</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">ناوی تەواو:</span> {entry.studentFullName || 'نەناسراو'}</div>
                  <div><span className="font-semibold">پۆل:</span> {entry.studentClass || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ژ.مۆبایل:</span> {entry.studentMobile || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ناونیشان:</span> {entry.studentAddress || 'نەناسراو'}</div>
                </div>
              </div>

              {/* Teacher Info */}
              <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">زانیاری مامۆستا</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">ناوی تەواو:</span> {entry.teacherFullName || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ژ.مۆبایل:</span> {entry.teacherMobile || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ناونیشان:</span> {entry.teacherAddress || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ئەزموونی وانە:</span> {entry.teachingExperience || 'نەناسراو'}</div>
                  <div><span className="font-semibold">پۆل:</span> {entry.teacherClass || 'نەناسراو'}</div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">زانیاری شۆفێری پاس</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">ناوی تەواو:</span> {entry.driverFullName || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ژ.مۆبایل:</span> {entry.driverMobile || 'نەناسراو'}</div>
                  <div><span className="font-semibold">ناونیشان:</span> {entry.driverAddress || 'نەناسراو'}</div>
                  <div><span className="font-semibold">وێنەی سایەق:</span> {entry.driverPhoto ? 'هەیە' : 'نییە'}</div>
                  <div><span className="font-semibold">وێنەی ئیجازەی:</span> {entry.driverLicensePhoto ? 'هەیە' : 'نییە'}</div>
                  <div><span className="font-semibold">دانانی ڤیدیۆ:</span> {entry.driverVideos && entry.driverVideos.length > 0 ? `${entry.driverVideos.length} ڤیدیۆ` : 'نییە'}</div>
                  <div><span className="font-semibold">وێنەی سەنەوی:</span> {entry.driverLicenseImage ? 'هەیە' : 'نییە'}</div>
                  {entry.notes && (
                    <div className="col-span-2"><span className="font-semibold">تێبینی:</span> {entry.notes}</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  function BusTableView({ data }) {
    // Define simplified table columns - only showing the 3 main names
    const columns = [
      {
        key: 'teacherFullName',
        header: 'ناوی تەواوی مامۆستا',
        align: 'right',
        editable: false,
        truncate: 25,
        render: (value, row, index) => (
          <span 
            className="font-medium text-green-600 dark:text-green-400 cursor-pointer hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors"
            onClick={() => {
              setSelectedRecord(row)
              setIsDetailModalOpen(true)
            }}
          >
            {value || 'نەناسراو'}
          </span>
        )
      },
      {
        key: 'studentFullName',
        header: 'ناوی تەواوی قوتابی',
        align: 'right',
        editable: false,
        truncate: 25,
        render: (value, row, index) => (
          <span 
            className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            onClick={() => {
              setSelectedRecord(row)
              setIsDetailModalOpen(true)
            }}
          >
            {value || 'نەناسراو'}
          </span>
        )
      },
      {
        key: 'driverFullName',
        header: 'ناوی تەواوی شۆفێر',
        align: 'right',
        editable: false,
        truncate: 25,
        render: (value, row, index) => (
          <span 
            className="font-medium text-orange-600 dark:text-orange-400 cursor-pointer hover:underline hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            onClick={() => {
              setSelectedRecord(row)
              setIsDetailModalOpen(true)
            }}
          >
            {value || 'نەناسراو'}
          </span>
        )
      }
    ]

    return (
      <EnhancedTable
        data={data}
        columns={columns}
        editingRow={null}
        onEdit={startEditing}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={deleteEntry}
        onCellEdit={() => {}}
        maxRowsPerPage={12}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        onRowClick={(row) => {
          setSelectedRecord(row)
          setIsDetailModalOpen(true)
        }}
      />
    )
  }

  // Helper function to display image
  const renderImage = (imageData, altText, onPreview) => {
    if (!imageData) return <span className="text-gray-500">نییە</span>
    
    let imageUrl = ''
    if (typeof imageData === 'object' && imageData.url) {
      imageUrl = imageData.url
    } else if (typeof imageData === 'string' && imageData.startsWith('http')) {
      imageUrl = imageData
    } else {
      return <span className="text-green-600">هەیە</span>
    }
    
    return (
      <img
        src={imageUrl}
        alt={altText}
        className="w-16 h-12 rounded object-cover cursor-pointer hover:scale-105 transition-transform"
        onClick={() => onPreview({
          url: imageUrl,
          originalName: typeof imageData === 'object' ? imageData.originalName || altText : altText
        })}
      />
    )
  }

  // Helper function to display videos
  const renderVideos = (videosData, showAllVideos = false) => {
    if (!videosData || !Array.isArray(videosData) || videosData.length === 0) {
      return <span className="text-gray-500">هیچ ڤیدیۆیەک نییە</span>
    }
    
    const videosToShow = showAllVideos ? videosData : videosData.slice(0, 2)
    
    return (
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {videosToShow.map((video, idx) => (
            <div key={idx} className="relative group">
              <video
                src={video.url}
                className="w-20 h-16 rounded object-cover cursor-pointer hover:scale-105 transition-transform border-2 border-gray-300 hover:border-blue-500"
                onClick={() => setPreviewVideo(video)}
                muted
                preload="metadata"
                title={`Preview ${video.originalName || video.filename || `Video ${idx + 1}`}`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded group-hover:bg-black/50 transition-all">
                <Play className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 rounded-b truncate">
                {video.originalName || video.filename || `ڤیدیۆ ${idx + 1}`}
              </div>
            </div>
          ))}
          {!showAllVideos && videosData.length > 2 && (
            <div className="flex items-center justify-center w-20 h-16 rounded bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 text-xs font-medium text-gray-600 dark:text-gray-400">
              +{videosData.length - 2}
            </div>
          )}
        </div>
        
        {/* Video management controls */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">
            {videosData.length} ڤیدیۆ / {videosData.length} video{videosData.length !== 1 ? 's' : ''}
          </span>
          {videosData.length > 0 && (
            <div className="flex gap-2">
              {videosData.map((video, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewVideo(video)}
                  className="text-xs h-7 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title={`پیشاندانی ${video.originalName || video.filename || `ڤیدیۆ ${idx + 1}`}`}
                >
                  <Play className="h-3 w-3 mr-1" />
                  {idx + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Download all videos button */}
        {videosData.length > 1 && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                videosData.forEach((video, idx) => {
                  setTimeout(() => {
                    const link = document.createElement('a')
                    link.href = video.url
                    link.download = video.originalName || video.filename || `driver-video-${idx + 1}.mp4`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }, idx * 500) // Delay each download to avoid browser blocking
                })
              }}
              className="text-xs h-7 px-3 flex items-center gap-1"
              title="داونلۆدی هەموو ڤیدیۆکان"
            >
              <Download className="h-3 w-3" />
              داونلۆدی هەمووی
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Bus Management" titleKu="بەڕێوەبردنی پاس">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Bus Management" titleKu="بەڕێوەبردنی پاس">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی پاسەکاندا... / Fuzzy search across all bus columns..."
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
            title="Bus Management"
            titleKu="بەڕێوەبردنی پاس"
            columns={[
              { key: 'studentFullName', header: 'ناوی قوتابی' },
              { key: 'teacherFullName', header: 'ناوی مامۆستا' },
              { key: 'driverFullName', header: 'ناوی شۆفێر' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <p className="text-gray-600">کۆی گشتی</p>
                <p className="font-bold text-blue-600">{totalRecords}</p>
              </div>
              <div>
                <p className="text-gray-600">قوتابی</p>
                <p className="font-bold text-blue-600">{studentsCount}</p>
              </div>
              <div>
                <p className="text-gray-600">مامۆستا</p>
                <p className="font-bold text-green-600">{teachersCount}</p>
              </div>
              <div>
                <p className="text-gray-600">شۆفێر</p>
                <p className="font-bold text-orange-600">{driversCount}</p>
              </div>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی تۆماری پاس
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="bus-form-description">
              <DialogHeader>
                <DialogTitle>زیادکردنی تۆماری پاسی نوێ / Add New Bus Record</DialogTitle>
              </DialogHeader>
              <p id="bus-form-description" className="sr-only">
                Form to add new bus transportation record with student, teacher, and driver information
              </p>
              <div className="space-y-6">
                {/* Student Info Section */}
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">زانیاری قوتابیی سەرنشین</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentFullName">ناوی تەواو / Full Name</Label>
                      <Input
                        id="studentFullName"
                        value={newEntry.studentFullName}
                        onChange={(e) => setNewEntry({...newEntry, studentFullName: e.target.value})}
                        placeholder="ناوی تەواوی قوتابی بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentClass">پۆل / Class</Label>
                      <Input
                        id="studentClass"
                        value={newEntry.studentClass}
                        onChange={(e) => setNewEntry({...newEntry, studentClass: e.target.value})}
                        placeholder="پۆل بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentMobile">ژ.مۆبایل / Mobile Number</Label>
                      <Input
                        id="studentMobile"
                        value={newEntry.studentMobile}
                        onChange={(e) => setNewEntry({...newEntry, studentMobile: e.target.value})}
                        placeholder="ژمارەی مۆبایل بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentAddress">شوێنی نیشتەجێبوون / Address</Label>
                      <Input
                        id="studentAddress"
                        value={newEntry.studentAddress}
                        onChange={(e) => setNewEntry({...newEntry, studentAddress: e.target.value})}
                        placeholder="ناونیشان بنووسە..."
                      />
                    </div>
                  </div>
                </div>

                {/* Teacher Info Section */}
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4">زانیاری مامۆستا</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teacherFullName">ناوی تەواو / Full Name</Label>
                      <Input
                        id="teacherFullName"
                        value={newEntry.teacherFullName}
                        onChange={(e) => setNewEntry({...newEntry, teacherFullName: e.target.value})}
                        placeholder="ناوی تەواوی مامۆستا بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherMobile">ژ.مۆبایل / Mobile Number</Label>
                      <Input
                        id="teacherMobile"
                        value={newEntry.teacherMobile}
                        onChange={(e) => setNewEntry({...newEntry, teacherMobile: e.target.value})}
                        placeholder="ژمارەی مۆبایل بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherAddress">شوێنی نیشتەجێبوون / Address</Label>
                      <Input
                        id="teacherAddress"
                        value={newEntry.teacherAddress}
                        onChange={(e) => setNewEntry({...newEntry, teacherAddress: e.target.value})}
                        placeholder="ناونیشان بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="teachingExperience">ئەزموونی وانە / Teaching Experience</Label>
                      <Input
                        id="teachingExperience"
                        value={newEntry.teachingExperience}
                        onChange={(e) => setNewEntry({...newEntry, teachingExperience: e.target.value})}
                        placeholder="ئەزموونی وانەوتنەوە بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherClass">پۆل / Class</Label>
                      <Input
                        id="teacherClass"
                        value={newEntry.teacherClass}
                        onChange={(e) => setNewEntry({...newEntry, teacherClass: e.target.value})}
                        placeholder="پۆل بنووسە..."
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Info Section */}
                <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-4">زانیاری شۆفێری پاس</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="driverFullName">ناوی تەواو / Full Name</Label>
                      <Input
                        id="driverFullName"
                        value={newEntry.driverFullName}
                        onChange={(e) => setNewEntry({...newEntry, driverFullName: e.target.value})}
                        placeholder="ناوی تەواوی شۆفێر بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverMobile">ژ.مۆبایل / Mobile Number</Label>
                      <Input
                        id="driverMobile"
                        value={newEntry.driverMobile}
                        onChange={(e) => setNewEntry({...newEntry, driverMobile: e.target.value})}
                        placeholder="ژمارەی مۆبایل بنووسە..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="driverAddress">شوێنی نیشتەجێبوون / Address</Label>
                      <Input
                        id="driverAddress"
                        value={newEntry.driverAddress}
                        onChange={(e) => setNewEntry({...newEntry, driverAddress: e.target.value})}
                        placeholder="ناونیشان بنووسە..."
                      />
                    </div>
                    
                    {/* Driver Photo */}
                    <div className="col-span-2">
                      <Label>وێنەی سایەق / Driver Photo</Label>
                      <LicenseImageUpload
                        image={newEntry.driverPhoto}
                        onImageChange={(imageData) => setNewEntry({...newEntry, driverPhoto: imageData})}
                        placeholder="Upload Driver Photo"
                      />
                    </div>
                    
                    {/* License Photo */}
                    <div className="col-span-2">
                      <Label>وێنەی ئیجازەی / License Photo</Label>
                      <LicenseImageUpload
                        image={newEntry.driverLicensePhoto}
                        onImageChange={(imageData) => setNewEntry({...newEntry, driverLicensePhoto: imageData})}
                        placeholder="Upload License Photo"
                      />
                    </div>
                    
                    {/* Driver Videos */}
                    <div className="col-span-2">
                      <Label>دانانی ڤیدیۆ / Driver Videos</Label>
                      <VideoUpload
                        videos={newEntry.driverVideos}
                        onVideosChange={(videos) => setNewEntry({...newEntry, driverVideos: videos})}
                        placeholder="Upload Driver Videos (Max 3)"
                        maxVideos={3}
                      />
                    </div>
                    
                    {/* Legacy License Image */}
                    <div className="col-span-2">
                      <Label>وێنەی سەنەوی / License Image</Label>
                      <LicenseImageUpload
                        image={newEntry.driverLicenseImage}
                        onImageChange={(imageData) => setNewEntry({...newEntry, driverLicenseImage: imageData})}
                        placeholder="Upload License Image"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    پاشگەزبوونەوە / Cancel
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    پاشەکەوتکردن / Save
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
          <CardContent className="p-8 text-center">
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ تۆماری پاسێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ تۆماری پاسێک زیاد نەکراوە'}
            </p>
          </CardContent>
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
        title="Edit Bus Record"
        titleKu="دەستکاریکردنی تۆماری پاس"
      />

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto bg-black/95 dark:bg-black/95 border-gray-700 p-0">
          <DialogHeader className="border-b border-gray-700 px-6 py-4">
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-blue-400" />
                <div>
                  <span className="text-lg font-semibold">
                    {previewImage?.originalName || 'Image Preview'}
                  </span>
                  <p className="text-sm text-gray-400 font-normal">
                    پیشاندانی وێنە / Image Preview
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex flex-col h-full">
              {/* Image Container */}
              <div className="flex-1 bg-black p-6">
                <div className="relative bg-black rounded-lg overflow-hidden max-w-5xl mx-auto">
                  <img
                    src={previewImage.url}
                    alt={previewImage.originalName || 'Image Preview'}
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg shadow-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* Fixed Bottom Panel */}
              <div className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
                {/* Image Details Section */}
                <div className="px-6 py-4 border-b border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm max-w-5xl mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs mb-1">ناو / Name</p>
                        <p className="font-semibold text-gray-200 truncate">
                          {previewImage.originalName || previewImage.filename || 'Unnamed Image'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                        <Download className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs mb-1">قەبارە / Size</p>
                        <p className="font-semibold text-gray-200">
                          {previewImage.size ? (previewImage.size / 1024).toFixed(1) + ' KB' : 'نەناسراو / Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs mb-1">جۆر / Type</p>
                        <p className="font-semibold text-gray-200">
                          {previewImage.type || 'Image/JPEG'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Action Buttons Panel */}
                <div className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 max-w-5xl mx-auto">
                    {/* Help Text */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                      <span>تێبینی: بۆ بینینی باشتر، دەتوانیت وێنەکە داونلۆد بکەیت</span>
                    </div>
                    
                    {/* Fixed Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = previewImage.url
                          link.download = previewImage.originalName || previewImage.filename || 'image'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="h-10 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                        title="داونلۆدی وێنە"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">داونلۆد / Download</span>
                        <span className="sm:hidden">داونلۆد</span>
                      </Button>
                      
                      {typeof navigator !== 'undefined' && navigator.share && (
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.share({
                              title: previewImage.originalName || 'Driver Image',
                              url: previewImage.url
                            }).catch(console.error)
                          }}
                          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                          title="هاوبەشکردن"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">هاوبەشکردن / Share</span>
                          <span className="sm:hidden">هاوبەش</span>
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => setPreviewImage(null)}
                        className="h-10 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                        title="داخستن"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">داخستن / Close</span>
                        <span className="sm:hidden">داخستن</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700 p-0">
          <DialogHeader className="border-b border-gray-700 px-6 py-4">
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Video className="h-6 w-6 text-blue-400" />
                <div>
                  <span className="text-lg font-semibold">
                    {previewVideo?.originalName || previewVideo?.filename || 'Video Preview'}
                  </span>
                  <p className="text-sm text-gray-400 font-normal">
                    پیشاندانی ڤیدیۆ / Video Preview
                  </p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          {previewVideo && (
            <div className="flex flex-col h-full">
              {/* Video Player Container */}
              <div className="flex-1 bg-black p-6">
                <div className="relative bg-black rounded-lg overflow-hidden max-w-5xl mx-auto">
                  <video
                    src={previewVideo.url}
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg"
                    controls
                    autoPlay={false}
                    poster={previewVideo.thumbnail || undefined}
                  />
                </div>
              </div>
              
              {/* Fixed Bottom Panel */}
              <div className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
                {/* Video Details Section */}
                <div className="px-6 py-4 border-b border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm max-w-5xl mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <Video className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs mb-1">ناو / Name</p>
                        <p className="font-semibold text-gray-200 truncate">
                          {previewVideo.originalName || previewVideo.filename || 'Unnamed Video'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                        <Download className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs mb-1">قەبارە / Size</p>
                        <p className="font-semibold text-gray-200">
                          {previewVideo.size ? (previewVideo.size / 1024 / 1024).toFixed(1) + ' MB' : 'نەناسراو / Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-400 text-xs mb-1">جۆر / Type</p>
                        <p className="font-semibold text-gray-200">
                          {previewVideo.mimeType || previewVideo.type || 'Video/MP4'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Action Buttons Panel */}
                <div className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 max-w-5xl mx-auto">
                    {/* Help Text */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                      <span>تێبینی: بۆ کۆنترۆڵی باشتر، دەتوانیت ڤیدیۆکە داونلۆد بکەیت</span>
                    </div>
                    
                    {/* Fixed Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = previewVideo.url
                          link.download = previewVideo.originalName || previewVideo.filename || 'driver-video.mp4'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                        title="داونلۆدی ڤیدیۆ"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">داونلۆد / Download</span>
                        <span className="sm:hidden">داونلۆد</span>
                      </Button>
                      
                      {typeof navigator !== 'undefined' && navigator.share && (
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.share({
                              title: previewVideo.originalName || 'Driver Video',
                              url: previewVideo.url
                            }).catch(console.error)
                          }}
                          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                          title="هاوبەشکردن"
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">هاوبەشکردن / Share</span>
                          <span className="sm:hidden">هاوبەش</span>
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => setPreviewVideo(null)}
                        className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium flex items-center gap-2"
                        title="داخستن"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">داخستن / Close</span>
                        <span className="sm:hidden">داخستن</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detailed Information Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="bus-detail-description">
          <DialogHeader>
            <DialogTitle className="text-right">
              زانیاری تەواوی تۆماری پاس / Complete Bus Record Information
            </DialogTitle>
          </DialogHeader>
          <p id="bus-detail-description" className="sr-only">
            Detailed view of bus transportation record with student, teacher, and driver information
          </p>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 text-right">
                  زانیاری قوتابیی سەرنشین
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-right">
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      ناوی تەواو / Full Name
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.studentFullName || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      پۆل / Class
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.studentClass || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      ژ.مۆبایل / Mobile Number
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.studentMobile || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">
                      شوێنی نیشتەجێبوون / Address
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.studentAddress || 'نەناسراو'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teacher Information */}
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4 text-right">
                  زانیاری مامۆستا
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-right">
                    <Label className="text-green-700 dark:text-green-300 font-semibold">
                      ناوی تەواو / Full Name
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.teacherFullName || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-green-700 dark:text-green-300 font-semibold">
                      ژ.مۆبایل / Mobile Number
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.teacherMobile || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-green-700 dark:text-green-300 font-semibold">
                      شوێنی نیشتەجێبوون / Address
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.teacherAddress || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-green-700 dark:text-green-300 font-semibold">
                      ئەزموونی وانە / Teaching Experience
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.teachingExperience || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right md:col-span-2">
                    <Label className="text-green-700 dark:text-green-300 font-semibold">
                      پۆل / Class
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.teacherClass || 'نەناسراو'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Information with Images and Videos */}
              <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-4 text-right">
                  زانیاری شۆفێری پاس
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      ناوی تەواو / Full Name
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.driverFullName || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      ژ.مۆبایل / Mobile Number
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.driverMobile || 'نەناسراو'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      شوێنی نیشتەجێبوون / Address
                    </Label>
                    <p className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {selectedRecord.driverAddress || 'نەناسراو'}
                    </p>
                  </div>
                  
                  {/* Driver Photo */}
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      وێنەی سایەق / Driver Photo
                    </Label>
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {renderImage(selectedRecord.driverPhoto, 'Driver Photo', setPreviewImage)}
                    </div>
                  </div>
                  
                  {/* License Photo */}
                  <div className="text-right">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      وێنەی ئیجازەی / License Photo
                    </Label>
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {renderImage(selectedRecord.driverLicensePhoto, 'License Photo', setPreviewImage)}
                    </div>
                  </div>
                  
                  {/* Driver Videos */}
                  <div className="text-right md:col-span-2">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      دانانی ڤیدیۆ / Driver Videos
                    </Label>
                    <div className="mt-1 p-3 bg-white dark:bg-gray-800 rounded border">
                      {renderVideos(selectedRecord.driverVideos, true)}
                    </div>
                  </div>
                  
                  {/* Legacy License Image */}
                  <div className="text-right md:col-span-2">
                    <Label className="text-orange-700 dark:text-orange-300 font-semibold">
                      وێنەی سەنەوی / License Image
                    </Label>
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border">
                      {renderImage(selectedRecord.driverLicenseImage, 'License Image', setPreviewImage)}
                    </div>
                  </div>
                </div>
              </div>

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
                  داخستن / Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}