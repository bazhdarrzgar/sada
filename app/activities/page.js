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
import Fuse from 'fuse.js'

export default function ActivitiesPage() {
  const isMobile = useIsMobile()
  const [activitiesData, setActivitiesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [newEntry, setNewEntry] = useState({
    activityType: '',
    preparationDate: '',
    content: '',
    startDate: '',
    whoDidIt: '',
    helper: '',
    activityImages: []
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
        
        // Update local state with the saved data
        setActivitiesData(prevData => {
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
      activityImages: []
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...activitiesData]
    updatedData[rowIndex][field] = value
    setActivitiesData(updatedData)
  }

  const startEditing = (index) => {
    const entry = activitiesData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
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
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'activityType',
      label: 'Activity Type',
      labelKu: 'جۆری چالاکی',
      type: 'select',
      options: activityTypes.map(type => ({ value: type, label: type })),
      placeholder: 'جۆری چالاکی هەڵبژێرە'
    },
    {
      key: 'preparationDate',
      label: 'Preparation Date',
      labelKu: 'بەرواری ئامادەکاری',
      type: 'date'
    },
    {
      key: 'startDate',
      label: 'Start Date',
      labelKu: 'بەرواری دەست پێکردن',
      type: 'date'
    },
    {
      key: 'whoDidIt',
      label: 'Who Did It',
      labelKu: 'کێ کردی',
      type: 'text',
      placeholder: 'ناوی کەسی کردووی چالاکیەکە بنووسە...'
    },
    {
      key: 'helper',
      label: 'Helper',
      labelKu: 'هاوکار',
      type: 'text',
      placeholder: 'ناوی هاوکارەکان بنووسە...'
    },
    {
      key: 'content',
      label: 'Content',
      labelKu: 'ناوەرۆک',
      type: 'textarea',
      placeholder: 'ناوەرۆکی چالاکی بنووسە...',
      rows: 4,
      span: 'full'
    },
    {
      key: 'activityImages',
      label: 'Activity Images',
      labelKu: 'وێنەی چالاکیەکە',
      type: 'image-upload',
      span: 'full'
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
                <div><span className="font-semibold">بەرواری ئامادەکاری:</span> {entry.preparationDate}</div>
                <div><span className="font-semibold">بەرواری دەست پێکردن:</span> {entry.startDate}</div>
                <div><span className="font-semibold">کێ کردی:</span> {entry.whoDidIt || 'نەناسراو'}</div>
                <div><span className="font-semibold">هاوکار:</span> {entry.helper || 'هیچ'}</div>
              </div>
              <div className="border-t pt-2">
                <div className="text-sm">
                  <span className="font-semibold">ناوەرۆک (Content):</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{entry.content}</p>
                </div>
              </div>
              
              {/* Activity Images */}
              {entry.activityImages && entry.activityImages.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-sm">وێنەی چالاکیەکە:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {entry.activityImages.slice(0, 3).map((image, idx) => (
                      <img
                        key={idx}
                        src={image.url}
                        alt={`Activity ${idx + 1}`}
                        className="w-12 h-12 rounded object-cover cursor-pointer hover:scale-110 transition-transform border-2 border-gray-200"
                        onClick={() => setPreviewImage(image)}
                      />
                    ))}
                    {entry.activityImages.length > 3 && (
                      <div className="flex items-center justify-center w-12 h-12 rounded bg-gray-100 border-2 border-gray-200 text-xs font-medium text-gray-600">
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
    // Define table columns for activities
    const columns = [
      {
        key: 'activityType',
        header: 'جۆری چالاکی',
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
        header: 'بەرواری ئامادەکاری',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'whoDidIt',
        header: 'کێ کردی',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value || 'نەناسراو'}</span>
      },
      {
        key: 'helper',
        header: 'هاوکار',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value || 'هیچ'}</span>
      },
      {
        key: 'content',
        header: 'ناوەرۆک',
        align: 'center',
        editable: true,
        truncate: 40,
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
        header: 'بەرواری دەست پێکردن',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => (
          <span className={`font-medium ${new Date(value) > new Date() ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {value}
          </span>
        )
      },
      {
        key: 'activityImages',
        header: 'وێنەی چالاکیەکە',
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
                      alt={`Activity ${idx + 1}`}
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
      <PageLayout title="Activities Management" titleKu="بەڕێوەبردنی چالاکییەکان">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Activities Management" titleKu="بەڕێوەبردنی چالاکییەکان">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی چالاکییەکاندا... / Fuzzy search across all activity columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="activities-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="activities-records"
            title="Activities Management"
            titleKu="بەڕێوەبردنی چالاکییەکان"
            columns={[
              { key: 'activityType', header: 'جۆری چالاکی' },
              { key: 'preparationDate', header: 'بەرواری ئامادەکاری' },
              { key: 'content', header: 'ناوەرۆک' },
              { key: 'startDate', header: 'بەرواری دەست پێکردن' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-gray-600">کۆی گشتی</p>
                <p className="font-bold text-blue-600">{totalActivities}</p>
              </div>
              <div>
                <p className="text-gray-600">داهاتوو</p>
                <p className="font-bold text-green-600">{upcomingActivities}</p>
              </div>
              <div>
                <p className="text-gray-600">تەواوبوو</p>
                <p className="font-bold text-gray-600">{pastActivities}</p>
              </div>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی چالاکی
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>زیادکردنی چالاکی نوێ / Add New Activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activityType">جۆری چالاکی / Activity Type</Label>
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
                    <Label htmlFor="preparationDate">بەرواری ئامادەکاری / Preparation Date</Label>
                    <Input
                      id="preparationDate"
                      type="date"
                      value={newEntry.preparationDate}
                      onChange={(e) => setNewEntry({...newEntry, preparationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">بەرواری دەست پێکردن / Start Date</Label>
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
                    <Label htmlFor="whoDidIt">کێ کردی / Who Did It</Label>
                    <Input
                      id="whoDidIt"
                      value={newEntry.whoDidIt}
                      onChange={(e) => setNewEntry({...newEntry, whoDidIt: e.target.value})}
                      placeholder="ناوی کەسی کردووی چالاکیەکە بنووسە..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="helper">هاوکار / Helper</Label>
                    <Input
                      id="helper"
                      value={newEntry.helper}
                      onChange={(e) => setNewEntry({...newEntry, helper: e.target.value})}
                      placeholder="ناوی هاوکارەکان بنووسە..."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">ناوەرۆک / Content</Label>
                  <Textarea
                    id="content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    placeholder="ناوەرۆکی چالاکی بنووسە..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>وێنەی چالاکیەکە / Activity Images</Label>
                  <ActivityImageUpload
                    images={newEntry.activityImages}
                    onImagesChange={(images) => setNewEntry({...newEntry, activityImages: images})}
                    maxImages={5}
                    className="mt-2"
                  />
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
            <h3 className="text-lg font-semibold mb-2">هیچ چالاکیەک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ چالاکیەک زیاد نەکراوە'}
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
        title="Edit Activity"
        titleKu="دەستکاریکردنی چالاکی"
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