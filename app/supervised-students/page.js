'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import Fuse from 'fuse.js'

export default function SupervisedStudentsPage() {
  const isMobile = useIsMobile()
  const [studentsData, setStudentsData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    studentName: '',
    department: '',
    grade: '',
    violationType: '',
    list: '',
    punishmentType: '',
    guardianNotification: '',
    guardianPhone: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'studentName', weight: 0.25 }, // Main student name
        { name: 'department', weight: 0.15 }, // Department
        { name: 'grade', weight: 0.1 }, // Grade/class
        { name: 'violationType', weight: 0.2 }, // Type of violation - important
        { name: 'punishmentType', weight: 0.15 }, // Punishment details - important
        { name: 'list', weight: 0.05 }, // List information
        { name: 'guardianNotification', weight: 0.05 }, // Guardian notification
        { name: 'guardianPhone', weight: 0.05 }, // Phone number
        // Enhanced search patterns for better matching
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.studentName || '',
            obj.department || '',
            obj.grade || '',
            obj.violationType || '',
            obj.punishmentType || '',
            obj.list || '',
            obj.guardianNotification || '',
            obj.guardianPhone || '',
            // Add formatted phone for better phone searching
            obj.guardianPhone ? obj.guardianPhone.replace(/[\s\-]/g, '') : '',
            // Add contextual information
            `ناوی قوتابی: ${obj.studentName || ''}`,
            `بەش: ${obj.department || ''}`,
            `پۆل: ${obj.grade || ''}`,
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
    try {
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
        
        // Update local state with the saved data
        setStudentsData(prevData => {
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
      violationType: '',
      list: '',
      punishmentType: '',
      guardianNotification: '',
      guardianPhone: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...studentsData]
    updatedData[rowIndex][field] = value
    setStudentsData(updatedData)
  }

  const startEditing = (index) => {
    const entry = studentsData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
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
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'studentName',
      label: 'Student Name',
      labelKu: 'ناوی خوێندکار',
      type: 'text',
      placeholder: 'Enter student name'
    },
    {
      key: 'department',
      label: 'Department',
      labelKu: 'بەش',
      type: 'text',
      placeholder: 'Enter department'
    },
    {
      key: 'grade',
      label: 'Grade',
      labelKu: 'پۆل',
      type: 'text',
      placeholder: 'Enter grade'
    },
    {
      key: 'violationType',
      label: 'Violation Type',
      labelKu: 'جۆری پێشێلکاری',
      type: 'text',
      placeholder: 'Enter violation type'
    },
    {
      key: 'list',
      label: 'List',
      labelKu: 'لیست',
      type: 'text',
      placeholder: 'Enter list information'
    },
    {
      key: 'punishmentType',
      label: 'Punishment Type',
      labelKu: 'جۆری سزا',
      type: 'text',
      placeholder: 'Enter punishment type'
    },
    {
      key: 'guardianNotification',
      label: 'Guardian Notification',
      labelKu: 'ئاگادارکردنەوەی دایکوباوک',
      type: 'text',
      placeholder: 'Enter notification details'
    },
    {
      key: 'guardianPhone',
      label: 'Guardian Phone',
      labelKu: 'تەلەفۆنی دایکوباوک',
      type: 'text',
      placeholder: 'Enter guardian phone number'
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
                <div><span className="font-semibold">بەش:</span> {entry.department}</div>
                <div><span className="font-semibold">پۆل:</span> {entry.grade}</div>
                <div><span className="font-semibold">جۆری پێشێلکاری:</span> {entry.violationType}</div>
                <div><span className="font-semibold">لیست:</span> {entry.list}</div>
                <div><span className="font-semibold">جۆری سزا:</span> {entry.punishmentType}</div>
                <div><span className="font-semibold">تەلەفۆنی دایکوباوک:</span> {entry.guardianPhone}</div>
              </div>
              {entry.guardianNotification && (
                <div className="text-sm text-gray-600 border-t pt-2">
                  <span className="font-semibold">ئاگادارکردنەوەی دایکوباوک:</span> {entry.guardianNotification}
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
    // Define table columns
    const columns = [
      {
        key: 'studentName',
        header: 'ناوی خوێندکار',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'department',
        header: 'بەش',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: 'پۆل',
        align: 'center',
        editable: true,
        truncate: 10,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'violationType',
        header: 'جۆری پێشێلکاری',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{value}</span>
      },
      {
        key: 'list',
        header: 'لیست',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'punishmentType',
        header: 'جۆری سزا',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
      },
      {
        key: 'guardianNotification',
        header: 'ئاگادارکردنەوەی دایکوباوک',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      },
      {
        key: 'guardianPhone',
        header: 'تەلەفۆنی دایکوباوک',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{value}</span>
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
      <PageLayout title="Supervised Students" titleKu="خوێندکاری چاودێری کراو">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Supervised Students" titleKu="خوێندکاری چاودێری کراو">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی خوێندکارە چاودێریکراوەکاندا... / Fuzzy search across all supervised student columns..."
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
            title="Supervised Students"
            titleKu="خوێندکاری چاودێری کراو"
            columns={[
              { key: 'studentName', header: 'ناوی خوێندکار' },
              { key: 'department', header: 'بەش' },
              { key: 'grade', header: 'پۆل' },
              { key: 'violationType', header: 'جۆری پێشێلکاری' },
              { key: 'list', header: 'لیست' },
              { key: 'punishmentType', header: 'جۆری سزا' },
              { key: 'guardianNotification', header: 'ئاگادارکردنەوەی دایکوباوک' },
              { key: 'guardianPhone', header: 'تەلەفۆنی دایکوباوک' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">کۆی خوێندکاران</p>
            <p className="text-lg font-bold text-blue-600">{filteredData.length}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی خوێندکار
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>زیادکردنی خوێندکاری چاودێریکراوی نوێ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentName">ناوی خوێندکار</Label>
                    <Input
                      id="studentName"
                      value={newEntry.studentName}
                      onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                      placeholder="ناوی خوێندکار بنووسە"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">بەش</Label>
                    <Input
                      id="department"
                      value={newEntry.department}
                      onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                      placeholder="بەشی خوێندکار"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">پۆل</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                      placeholder="پۆلی خوێندکار"
                    />
                  </div>
                  <div>
                    <Label htmlFor="violationType">جۆری پێشێلکاری</Label>
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
                    <Label htmlFor="list">لیست</Label>
                    <Input
                      id="list"
                      value={newEntry.list}
                      onChange={(e) => setNewEntry({...newEntry, list: e.target.value})}
                      placeholder="زانیاری لیست"
                    />
                  </div>
                  <div>
                    <Label htmlFor="punishmentType">جۆری سزا</Label>
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
                    <Label htmlFor="guardianNotification">ئاگادارکردنەوەی دایکوباوک</Label>
                    <Input
                      id="guardianNotification"
                      value={newEntry.guardianNotification}
                      onChange={(e) => setNewEntry({...newEntry, guardianNotification: e.target.value})}
                      placeholder="زانیاری ئاگادارکردنەوە"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianPhone">تەلەفۆنی دایکوباوک</Label>
                    <Input
                      id="guardianPhone"
                      value={newEntry.guardianPhone}
                      onChange={(e) => setNewEntry({...newEntry, guardianPhone: e.target.value})}
                      placeholder="ژمارەی تەلەفۆن"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    پاشگەزبوونەوە
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    پاشەکەوتکردن
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
        title="Edit Supervised Student"
        titleKu="دەستکاریکردنی خوێندکاری چاودێریکراو"
      />

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ خوێندکارێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ خوێندکارێک زیاد نەکراوە'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}