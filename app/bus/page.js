'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Bus, Image as ImageIcon, Download, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
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
    driverLicenseImage: '',
    driverMobile: '',
    driverAddress: ''
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
            obj.driverAddress || ''
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
      driverLicenseImage: '',
      driverMobile: '',
      driverAddress: ''
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
      labelKu: 'زانیاری خوێندکاری سەرنشین',
      type: 'section-header',
      span: 'full'
    },
    {
      key: 'studentFullName',
      label: 'Student Full Name',
      labelKu: 'ناوی تەواوی خوێندکار',
      type: 'text',
      placeholder: 'ناوی تەواوی خوێندکار بنووسە...'
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
      key: 'driverLicenseImage',
      label: 'License Image',
      labelKu: 'وێنەی سەنەوی',
      type: 'text',
      placeholder: 'لینکی وێنەی سەنەوی بنووسە...'
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
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">زانیاری خوێندکاری سەرنشین</h4>
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
                  <div><span className="font-semibold">وێنەی سەنەوی:</span> {entry.driverLicenseImage ? 'هەیە' : 'نییە'}</div>
                </div>
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
      // Student Info Columns
      {
        key: 'studentFullName',
        header: 'ناوی تەواوی خوێندکار',
        align: 'right',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{value || 'نەناسراو'}</span>
      },
      {
        key: 'studentClass',
        header: 'پۆلی خوێندکار',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value || 'نەناسراو'}</span>
      },
      {
        key: 'studentMobile',
        header: 'مۆبایلی خوێندکار',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value || 'نەناسراو'}</span>
      },
      
      // Teacher Info Columns
      {
        key: 'teacherFullName',
        header: 'ناوی تەواوی مامۆستا',
        align: 'right',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{value || 'نەناسراو'}</span>
      },
      {
        key: 'teachingExperience',
        header: 'ئەزموونی وانە',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value || 'نەناسراو'}</span>
      },
      
      // Driver Info Columns
      {
        key: 'driverFullName',
        header: 'ناوی تەواوی شۆفێر',
        align: 'right',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value || 'نەناسراو'}</span>
      },
      {
        key: 'driverLicenseImage',
        header: 'وێنەی سەنەوی',
        align: 'center',
        editable: false,
        render: (value) => (
          <div className="flex items-center justify-center">
            {value ? (
              <div className="flex items-center gap-2">
                {value.startsWith('http') ? (
                  <img
                    src={value}
                    alt="License"
                    className="w-8 h-8 rounded object-cover cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setPreviewImage({ url: value, originalName: 'License Image' })}
                  />
                ) : (
                  <span className="text-xs text-green-600">هەیە</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">نییە</span>
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
        editingRow={null}
        onEdit={startEditing}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={deleteEntry}
        onCellEdit={() => {}}
        maxRowsPerPage={12}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
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
              { key: 'studentFullName', header: 'ناوی خوێندکار' },
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
                <p className="text-gray-600">خوێندکار</p>
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="bus-form-description">
              <DialogHeader>
                <DialogTitle>زیادکردنی تۆماری پاسی نوێ / Add New Bus Record</DialogTitle>
              </DialogHeader>
              <p id="bus-form-description" className="sr-only">
                Form to add new bus transportation record with student, teacher, and driver information
              </p>
              <div className="space-y-6">
                {/* Student Info Section */}
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">زانیاری خوێندکاری سەرنشین</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentFullName">ناوی تەواو / Full Name</Label>
                      <Input
                        id="studentFullName"
                        value={newEntry.studentFullName}
                        onChange={(e) => setNewEntry({...newEntry, studentFullName: e.target.value})}
                        placeholder="ناوی تەواوی خوێندکار بنووسە..."
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
                      <Label htmlFor="driverLicenseImage">وێنەی سەنەوی / License Image</Label>
                      <Input
                        id="driverLicenseImage"
                        value={newEntry.driverLicenseImage}
                        onChange={(e) => setNewEntry({...newEntry, driverLicenseImage: e.target.value})}
                        placeholder="لینکی وێنەی سەنەوی بنووسە..."
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.originalName || 'License Image Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'License Preview'}
                  className="w-full max-h-[70vh] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = previewImage.url
                    link.download = previewImage.originalName || 'license-image'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setPreviewImage(null)}>
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}