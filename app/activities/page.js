'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Activity, Image as ImageIcon, Download, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import ActivityImageUpload from '@/components/ui/activity-image-upload'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'

export default function ActivitiesPage() {
  const isMobile = useIsMobile()
  const { language } = useLanguage()
  const [activitiesData, setActivitiesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const [newEntry, setNewEntry] = useState({
    activityType: '',
    preparationDate: '',
    content: '',
    startDate: '',
    whoDidIt: '',
    helper: '',
    activityImages: [],
    notes: ''
  })

  const activityTypes = ['وەرزشی', 'هونەری', 'زانستی', 'کۆمەڵایەتی', 'فێرکاری', 'گەڕان و فێربوون', 'کولتووری']

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'activityType', weight: 0.3 }, // High weight for activity type
        { name: 'content', weight: 0.4 }, // Highest weight for content since it's most descriptive
        { name: 'preparationDate', weight: 0.15 }, // Date fields with moderate weight
        { name: 'startDate', weight: 0.15 },
        { name: 'notes', weight: 0.25 }, // Notes field
        // Enhanced search patterns for better matching
        { name: 'id', weight: 0.05 }, // Include ID for technical searches
        // Custom search fields for enhanced matching
        { name: 'searchableContent', weight: 0.25, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.activityType || '',
            obj.content || '',
            obj.preparationDate || '',
            obj.startDate || '',
            obj.whoDidIt || '',
            obj.helper || '',
            obj.notes || '',
            // Add formatted date versions for better date searching
            obj.preparationDate ? new Date(obj.preparationDate).toLocaleDateString('ku') : '',
            obj.startDate ? new Date(obj.startDate).toLocaleDateString('ku') : '',
            // Add status based on date
            obj.startDate ? (new Date(obj.startDate) > new Date() ? 'داهاتوو upcoming' : 'تەواوبوو completed past') : ''
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
    return new Fuse(activitiesData, options)
  }, [activitiesData])

  // Fetch activities data from API
  useEffect(() => {
    fetchActivitiesData()
  }, [])

  const fetchActivitiesData = async () => {
    try {
      const response = await fetch('/api/activities')
      if (response.ok) {
        const data = await response.json()
        setActivitiesData(data)
      }
    } catch (error) {
      console.error('Error fetching activities data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions - early return if already saving
    if (isSaving) {
      console.log('Already saving, ignoring duplicate submission')
      return false
    }
    
    setIsSaving(true)
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('activity-')) {
        // Update existing entry
        response = await fetch(`/api/activities/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('activity-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/activities', {
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
        setActivitiesData(prevData => {
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
        return true // Return success
      } else {
        console.error('Failed to save entry:', response.statusText)
        alert('خەتایەک ڕوویدا لە کاتی پاشەکەوتکردن / Error occurred while saving')
        return false // Return failure
      }
      
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('خەتایەک ڕوویدا لە کاتی پاشەکەوتکردن / Error occurred while saving')
      return false // Return failure
    } finally {
      // Always reset isSaving state
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('activity-')) {
        // Remove from local state only if it's a temporary entry
        setActivitiesData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setActivitiesData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      activityType: '',
      preparationDate: '',
      content: '',
      startDate: '',
      whoDidIt: '',
      helper: '',
      activityImages: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...activitiesData]
    updatedData[rowIndex][field] = value
    setActivitiesData(updatedData)
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

  const startEditing = (index) => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      const entry = activitiesData[index]
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 100)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = activitiesData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchActivitiesData()
  }

  const handleModalSave = async (editedData) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    const success = await saveEntry(editedData)
    if (success) {
      setIsEditModalOpen(false)
      setEditingData(null)
    }
  }



  // Define fields for modal editing
  const editFields = [
    {
      key: 'activityType',
      label: t('activities.fields.activityType', language),
      labelKu: t('activities.fields.activityType', 'kurdish'),
      type: 'select',
      options: activityTypes.map(type => ({ value: type, label: type })),
      placeholder: 'جۆری چالاکی هەڵبژێرە'
    },
    {
      key: 'preparationDate',
      label: t('activities.fields.preparationDate', language),
      labelKu: t('activities.fields.preparationDate', 'kurdish'),
      type: 'date'
    },
    {
      key: 'startDate',
      label: t('activities.fields.startDate', language),
      labelKu: t('activities.fields.startDate', 'kurdish'),
      type: 'date'
    },
    {
      key: 'whoDidIt',
      label: t('activities.fields.whoDidIt', language),
      labelKu: t('activities.fields.whoDidIt', 'kurdish'),
      type: 'text',
      placeholder: 'ناوی کەسی کردووی چالاکیەکە بنووسە...'
    },
    {
      key: 'helper',
      label: t('activities.fields.helper', language),
      labelKu: t('activities.fields.helper', 'kurdish'),
      type: 'text',
      placeholder: 'ناوی هاوکارەکان بنووسە...'
    },
    {
      key: 'content',
      label: t('activities.fields.content', language),
      labelKu: t('activities.fields.content', 'kurdish'),
      type: 'textarea',
      placeholder: 'ناوەرۆکی چالاکی بنووسە...',
      span: 'full'
    },
    {
      key: 'notes',
      label: t('activities.fields.notes', language),
      labelKu: t('activities.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی زیادکردن...',
      span: 'full'
    },
    {
      key: 'activityImages',
      label: t('activities.fields.activityImages', language),
      labelKu: t('activities.fields.activityImages', 'kurdish'),
      type: 'image-upload',
      span: 'full',
      maxImages: 5
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return activitiesData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, activitiesData])

  // Calculate statistics
  const totalActivities = filteredData.length
  const upcomingActivities = filteredData.filter(entry => new Date(entry.startDate) > new Date()).length
  const pastActivities = filteredData.filter(entry => new Date(entry.startDate) <= new Date()).length

  function ActivityCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.activityType}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">{t('activities.fields.preparationDate', language)}:</span> {entry.preparationDate}</div>
                <div><span className="font-semibold">{t('activities.fields.startDate', language)}:</span> {entry.startDate}</div>
                <div><span className="font-semibold">{t('activities.fields.whoDidIt', language)}:</span> {entry.whoDidIt}</div>
                <div><span className="font-semibold">{t('activities.fields.helper', language)}:</span> {entry.helper}</div>
              </div>
              <div className="border-t pt-2">
                <div className="text-sm">
                  <span className="font-semibold">{t('activities.fields.content', language)}:</span> {entry.content}
                </div>
                {entry.notes && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-semibold">{t('activities.fields.notes', language)}:</span> {entry.notes}
                  </div>
                )}
              </div>
              
              {/* Activity Images */}
              {entry.activityImages && entry.activityImages.length > 0 && (
                <div className="border-t pt-2">
                  <span className="font-semibold text-sm">{t('activities.fields.activityImages', language)}:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {entry.activityImages.slice(0, 3).map((image, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={image.url}
                        alt={`Activity ${imgIdx + 1}`}
                        className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewImage(image)}
                      />
                    ))}
                    {entry.activityImages.length > 3 && (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center text-xs font-medium">
                        +{entry.activityImages.length - 3}
                      </div>
                    )}
                  </div>
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

  function ActivitiesTableView({ data }) {
    // Define table columns for activities with enhanced translation
    const columns = [
      {
        key: 'activityType',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('activities.fields.activityType', language)}
            </span></div>
        ),
        align: 'right',
        editable: true,
        truncate: 20,
        editComponent: (row, onChange) => (
          <Select value={row.activityType || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'preparationDate',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('activities.fields.preparationDate', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'content',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('activities.fields.content', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 30,
        editComponent: (row, onChange) => (
          <Textarea
            value={row.content || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full dark:bg-gray-800"
            rows={2}
          />
        ),
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      },
      {
        key: 'startDate',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('activities.fields.startDate', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => {
          const isUpcoming = new Date(value) > new Date()
          return (
            <span className={`font-medium ${isUpcoming ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {value}
            </span>
          )
        }
      },
      {
        key: 'whoDidIt',
        header: t('activities.fields.whoDidIt', language),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'helper',
        header: t('activities.fields.helper', language),
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'activityImages',
        header: t('activities.fields.activityImages', language),
        align: 'center',
        editable: false,
        render: (value, row) => {
          // Ensure value is an array
          const images = Array.isArray(value) ? value : (value ? JSON.parse(value) : [])
          if (!images || images.length === 0) return <span className="text-gray-400">هیچ وێنەیەک نییە</span>
          
          return (
            <div className="flex items-center justify-center gap-2">
              {/* Show first few images as thumbnails */}
              <div className="flex -space-x-1 overflow-hidden">
                {images.slice(0, 3).map((image, imgIdx) => (
                  <img
                    key={imgIdx}
                    src={image.url}
                    alt={`Activity ${imgIdx + 1}`}
                    className="inline-block h-8 w-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform duration-200 hover:z-10 relative"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage(image)
                    }}
                    title={`Click to preview: ${image.originalName || image.filename}`}
                  />
                ))}
                {images.length > 3 && (
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                    +{images.length - 3}
                  </div>
                )}
              </div>
              
              {/* Clickable count with icon */}
              <div 
                className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors duration-200" 
                onClick={(e) => {
                  e.stopPropagation()
                  if (images.length > 0) {
                    setPreviewImage(images[0])
                  }
                }}
                title="Click to preview images"
              >
                <ImageIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{images.length}</span>
              </div>
            </div>
          )
        }
      },
      {
        key: 'notes',
        header: t('activities.fields.notes', language),
        align: 'center',
        editable: true,
        truncate: 25,
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
      <PageLayout title={t('activities.title', language)} titleKu={t('activities.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('activities.title', language)} titleKu={t('activities.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('activities.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          {/* Enhanced Translation Button */}

          <DownloadButton 
            data={filteredData}
            filename="activities-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="activities-records"
            title={t('activities.title', language)}
            titleKu={t('activities.title', 'kurdish')}
            columns={[
              { key: 'activityType', header: t('activities.fields.activityType', 'kurdish') },
              { key: 'preparationDate', header: t('activities.fields.preparationDate', 'kurdish') },
              { key: 'content', header: t('activities.fields.content', 'kurdish') },
              { key: 'startDate', header: t('activities.fields.startDate', 'kurdish') },
              { key: 'notes', header: t('activities.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-gray-600">{t('activities.stats.total', language)}</p>
                <p className="font-bold text-blue-600">{totalActivities}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('activities.stats.upcoming', language)}</p>
                <p className="font-bold text-green-600">{upcomingActivities}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('activities.stats.completed', language)}</p>
                <p className="font-bold text-gray-600">{pastActivities}</p>
              </div>
            </div>
          </div>
          {/* Handle Add Entry with scroll to center */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button 
              onClick={() => {
                // Scroll to center first
                scrollToCenter()
                
                // Small delay to ensure scroll starts before modal opens
                setTimeout(() => {
                  setIsAddDialogOpen(true)
                }, 100)
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t('activities.addButton', language)}
            </Button>
            <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('activities.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activityType">{t('activities.fields.activityType', language)}</Label>
                  <Select value={newEntry.activityType} onValueChange={(value) => setNewEntry({...newEntry, activityType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="جۆری چالاکی هەڵبژێرە" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preparationDate">{t('activities.fields.preparationDate', language)}</Label>
                    <Input
                      id="preparationDate"
                      type="date"
                      value={newEntry.preparationDate}
                      onChange={(e) => setNewEntry({...newEntry, preparationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">{t('activities.fields.startDate', language)}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEntry.startDate}
                      onChange={(e) => setNewEntry({...newEntry, startDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="whoDidIt">{t('activities.fields.whoDidIt', language)}</Label>
                    <Input
                      id="whoDidIt"
                      value={newEntry.whoDidIt}
                      onChange={(e) => setNewEntry({...newEntry, whoDidIt: e.target.value})}
                      placeholder="ناوی کەسی کردووی چالاکیەکە بنووسە..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="helper">{t('activities.fields.helper', language)}</Label>
                    <Input
                      id="helper"
                      value={newEntry.helper}
                      onChange={(e) => setNewEntry({...newEntry, helper: e.target.value})}
                      placeholder="ناوی هاوکارەکان بنووسە..."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">{t('activities.fields.content', language)}</Label>
                  <Textarea
                    id="content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    placeholder="ناوەرۆکی چالاکی بنووسە..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">{t('activities.fields.notes', language)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی زیادکردن..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{t('activities.fields.activityImages', language)}</Label>
                  <ActivityImageUpload
                    images={newEntry.activityImages}
                    onImagesChange={(images) => setNewEntry({...newEntry, activityImages: images})}
                    maxImages={5}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}
                    disabled={isSaving}
                    className={isSaving ? 'pointer-events-none opacity-50' : ''}
                  >
                    {t('activities.buttons.cancel', language)}
                  </Button>
                  <Button 
                    onClick={() => saveEntry(newEntry)}
                    disabled={isSaving}
                    className={isSaving ? 'pointer-events-none opacity-50' : ''}
                  >
                    {isSaving ? 'پاشەکەوت دەکرێت... / Saving...' : t('activities.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Activities Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <ActivityCardView data={filteredData} />
        ) : (
          <ActivitiesTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('activities.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('activities.noData.message', language) : t('activities.noData.emptyMessage', language)}
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
        title={t('activities.buttons.edit', language)}
        titleKu={t('activities.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />

      {/* Optimized Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.originalName || 'Activity Image Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              {/* Full size image with optimized viewing */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'Activity Preview'}
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