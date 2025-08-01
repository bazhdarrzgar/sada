'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function SupervisionPage() {
  const isMobile = useIsMobile()
  const [supervisionData, setSupervisionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    teacherName: '',
    subject: '',
    teacherDepartment: '',
    teacherGrade: '',
    teacherViolationType: '',
    teacherPunishmentType: '',
    studentName: '',
    studentDepartment: '',
    studentGrade: '',
    studentViolationType: '',
    studentPunishmentType: ''
  })

  // Fetch supervision data from API
  useEffect(() => {
    fetchSupervisionData()
  }, [])

  const fetchSupervisionData = async () => {
    try {
      const response = await fetch('/api/supervision')
      if (response.ok) {
        const data = await response.json()
        setSupervisionData(data)
      }
    } catch (error) {
      console.error('Error fetching supervision data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('supervision-')) {
        // Update existing entry
        response = await fetch(`/api/supervision/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('supervision-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/supervision', {
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
        setSupervisionData(prevData => {
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
      if (id.startsWith('supervision-')) {
        // Remove from local state only if it's a temporary entry
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/supervision/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      teacherName: '',
      subject: '',
      teacherDepartment: '',
      teacherGrade: '',
      teacherViolationType: '',
      teacherPunishmentType: '',
      studentName: '',
      studentDepartment: '',
      studentGrade: '',
      studentViolationType: '',
      studentPunishmentType: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...supervisionData]
    updatedData[rowIndex][field] = value
    setSupervisionData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = supervisionData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchSupervisionData()
  }

  const filteredData = supervisionData.filter(entry =>
    (entry.teacherName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.teacherDepartment?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  function SupervisionCardView({ data, type }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              {type === 'teacher' ? (
                <>
                  <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.teacherName}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">Subject:</span> {entry.subject}</div>
                    <div><span className="font-semibold">Department:</span> {entry.teacherDepartment}</div>
                    <div><span className="font-semibold">Grade:</span> {entry.teacherGrade}</div>
                    <div><span className="font-semibold">Violation:</span> {entry.teacherViolationType}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Punishment:</span> 
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{entry.teacherPunishmentType}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.studentName}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">Department:</span> {entry.studentDepartment}</div>
                    <div><span className="font-semibold">Grade:</span> {entry.studentGrade}</div>
                    <div><span className="font-semibold">Violation:</span> {entry.studentViolationType}</div>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Punishment:</span> 
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{entry.studentPunishmentType}</span>
                  </div>
                </>
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

  function TeacherSupervisionTableView({ data }) {
    // Define table columns for teacher supervision
    const columns = [
      {
        key: 'teacherName',
        header: 'Teacher Name',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'subject',
        header: 'Subject',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'teacherDepartment',
        header: 'Department',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'teacherGrade',
        header: 'Grade',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'teacherViolationType',
        header: 'Violation',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
      },
      {
        key: 'teacherPunishmentType',
        header: 'Punishment',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      }
    ]

    return (
      <EnhancedTable
        data={data}
        columns={columns}
        editingRow={editingRow}
        onEdit={startEditing}
        onSave={saveRowEdit}
        onCancel={cancelEdit}
        onDelete={deleteEntry}
        onCellEdit={handleCellEdit}
        maxRowsPerPage={12}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  function StudentSupervisionTableView({ data }) {
    // Define table columns for student supervision
    const columns = [
      {
        key: 'studentName',
        header: 'Student Name',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'studentDepartment',
        header: 'Department',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'studentGrade',
        header: 'Grade',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'studentViolationType',
        header: 'Violation',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
      },
      {
        key: 'studentPunishmentType',
        header: 'Punishment',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      }
    ]

    return (
      <EnhancedTable
        data={data}
        columns={columns}
        editingRow={editingRow}
        onEdit={startEditing}
        onSave={saveRowEdit}
        onCancel={cancelEdit}
        onDelete={deleteEntry}
        onCellEdit={handleCellEdit}
        maxRowsPerPage={12}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  if (loading) {
    return (
      <PageLayout title="Supervision System" titleKu="چاودێری">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Supervision System" titleKu="چاودێری">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search supervision records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="supervision-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="supervision-records"
            title="Supervision System"
            titleKu="چاودێری"
            columns={[
              { key: 'teacherName', header: 'ناوی مامۆستا' },
              { key: 'subject', header: 'بابەت' },
              { key: 'teacherDepartment', header: 'بەش' },
              { key: 'teacherGrade', header: 'پۆل' },
              { key: 'teacherViolationType', header: 'جۆری سەرپێچی' },
              { key: 'teacherPunishmentType', header: 'جۆری سزا' },
              { key: 'studentName', header: 'ناوی قوتابی' },
              { key: 'studentDepartment', header: 'بەشی قوتابی' },
              { key: 'studentGrade', header: 'پۆلی قوتابی' },
              { key: 'studentViolationType', header: 'سەرپێچی قوتابی' },
              { key: 'studentPunishmentType', header: 'سزای قوتابی' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی چاودێری
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Supervision Record</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="teacher" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="teacher">Teacher / مامۆستا</TabsTrigger>
                  <TabsTrigger value="student">Student / قوتابی</TabsTrigger>
                </TabsList>
                
                <TabsContent value="teacher" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teacherName">Teacher Name</Label>
                      <Input
                        id="teacherName"
                        value={newEntry.teacherName}
                        onChange={(e) => setNewEntry({...newEntry, teacherName: e.target.value})}
                        placeholder="Enter teacher name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newEntry.subject}
                        onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherDepartment">Department</Label>
                      <Input
                        id="teacherDepartment"
                        value={newEntry.teacherDepartment}
                        onChange={(e) => setNewEntry({...newEntry, teacherDepartment: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherGrade">Grade</Label>
                      <Input
                        id="teacherGrade"
                        value={newEntry.teacherGrade}
                        onChange={(e) => setNewEntry({...newEntry, teacherGrade: e.target.value})}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherViolationType">Violation Type</Label>
                      <Input
                        id="teacherViolationType"
                        value={newEntry.teacherViolationType}
                        onChange={(e) => setNewEntry({...newEntry, teacherViolationType: e.target.value})}
                        placeholder="Enter violation type"
                      />
                    </div>
                    <div>
                      <Label htmlFor="teacherPunishmentType">Punishment Type</Label>
                      <Input
                        id="teacherPunishmentType"
                        value={newEntry.teacherPunishmentType}
                        onChange={(e) => setNewEntry({...newEntry, teacherPunishmentType: e.target.value})}
                        placeholder="Enter punishment type"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="student" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={newEntry.studentName}
                        onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentDepartment">Department</Label>
                      <Input
                        id="studentDepartment"
                        value={newEntry.studentDepartment}
                        onChange={(e) => setNewEntry({...newEntry, studentDepartment: e.target.value})}
                        placeholder="Enter department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentGrade">Grade</Label>
                      <Input
                        id="studentGrade"
                        value={newEntry.studentGrade}
                        onChange={(e) => setNewEntry({...newEntry, studentGrade: e.target.value})}
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentViolationType">Violation Type</Label>
                      <Input
                        id="studentViolationType"
                        value={newEntry.studentViolationType}
                        onChange={(e) => setNewEntry({...newEntry, studentViolationType: e.target.value})}
                        placeholder="Enter violation type"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="studentPunishmentType">Punishment Type</Label>
                      <Input
                        id="studentPunishmentType"
                        value={newEntry.studentPunishmentType}
                        onChange={(e) => setNewEntry({...newEntry, studentPunishmentType: e.target.value})}
                        placeholder="Enter punishment type"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                  Cancel
                </Button>
                <Button onClick={() => saveEntry(newEntry)}>
                  Save Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Supervision Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teachers">Teacher Supervision / چاودێری مامۆستایان</TabsTrigger>
            <TabsTrigger value="students">Student Supervision / چاودێری قوتابیان</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teachers" className="space-y-4">
            {isMobile ? (
              <SupervisionCardView data={filteredData} type="teacher" />
            ) : (
              <TeacherSupervisionTableView data={filteredData} />
            )}
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            {isMobile ? (
              <SupervisionCardView data={filteredData} type="student" />
            ) : (
              <StudentSupervisionTableView data={filteredData} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ چاودێریەک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ چاودێریەک زیاد نەکراوە'}
            </p>
          </div>
        </Card>
      )}
    </PageLayout>
  )
}