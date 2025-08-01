'use client'

import { useState, useEffect } from 'react'
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

export default function SupervisedStudentsPage() {
  const isMobile = useIsMobile()
  const [studentsData, setStudentsData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
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
    setEditingRow(index)
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

  const filteredData = studentsData.filter(entry =>
    (entry.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.grade?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.violationType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  function SupervisedStudentsCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.studentName}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">بەش:</span> {entry.department}</div>
                <div><span className="font-semibold">قۆناغ:</span> {entry.grade}</div>
                <div><span className="font-semibold">جۆری سەرپێچی:</span> {entry.violationType}</div>
                <div><span className="font-semibold">لیست:</span> {entry.list}</div>
                <div><span className="font-semibold">جۆری سزا:</span> {entry.punishmentType}</div>
                <div><span className="font-semibold">ژ.سەرپەرشتیار:</span> {entry.guardianPhone}</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">ئاگادارکردنەوەی سەرپەرشتیار:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  entry.guardianNotification === 'ناردراوە' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {entry.guardianNotification}
                </span>
              </div>
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

  function SupervisedStudentsTableView({ data }) {
    // Define table columns for supervised students
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
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: 'قۆناغ',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'violationType',
        header: 'جۆری سەرپێچی',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{value}</span>
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
        truncate: 25,
        render: (value) => (
          <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'guardianNotification',
        header: 'ئاگادارکردنەوەی سەرپەرشتیار',
        align: 'center',
        editable: true,
        render: (value) => (
          <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
            value === 'ناردراوە' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'guardianPhone',
        header: 'ژ.سەرپەرشتیار',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-mono text-sm">{value}</span>
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
        maxRowsPerPage={15}
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
            placeholder="گەڕان لە خوێندکارانی چاودێری کراو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="supervised-students-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="supervised-students-records"
            title="Supervised Students"
            titleKu="خوێندکاری چاودێری کراو"
            columns={[
              { key: 'studentName', header: 'ناوی خوێندکار' },
              { key: 'department', header: 'بەش' },
              { key: 'grade', header: 'قۆناغ' },
              { key: 'violationType', header: 'جۆری سەرپێچی' },
              { key: 'list', header: 'لیست' },
              { key: 'punishmentType', header: 'جۆری سزا' },
              { key: 'guardianNotification', header: 'ئاگادارکردنەوەی سەرپەرشتیار' },
              { key: 'guardianPhone', header: 'ژ.سەرپەرشتیار' }
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
                <DialogTitle>زیادکردنی خوێندکاری نوێ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName">ناوی خوێندکار</Label>
                  <Input
                    id="studentName"
                    value={newEntry.studentName}
                    onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                    placeholder="ناوی تەواوی خوێندکار"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">بەش</Label>
                    <Input
                      id="department"
                      value={newEntry.department}
                      onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                      placeholder="زانست، ئەدەب، بازرگانی"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">قۆناغ</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                      placeholder="یەکەم، دووەم، سێیەم"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="violationType">جۆری سەرپێچی</Label>
                    <Input
                      id="violationType"
                      value={newEntry.violationType}
                      onChange={(e) => setNewEntry({...newEntry, violationType: e.target.value})}
                      placeholder="دواکەوتن، قسەکردن، نەهاتن"
                    />
                  </div>
                  <div>
                    <Label htmlFor="list">لیست</Label>
                    <Input
                      id="list"
                      value={newEntry.list}
                      onChange={(e) => setNewEntry({...newEntry, list: e.target.value})}
                      placeholder="لیستی یەکەم، دووەم، سێیەم"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="punishmentType">جۆری سزا</Label>
                    <Input
                      id="punishmentType"
                      value={newEntry.punishmentType}
                      onChange={(e) => setNewEntry({...newEntry, punishmentType: e.target.value})}
                      placeholder="ئاگادارکردنەوە، سەرزەنشت"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardianNotification">ئاگادارکردنەوەی سەرپەرشتیار</Label>
                    <Input
                      id="guardianNotification"
                      value={newEntry.guardianNotification}
                      onChange={(e) => setNewEntry({...newEntry, guardianNotification: e.target.value})}
                      placeholder="ناردراوە، نەناردراوە"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guardianPhone">ژ.سەرپەرشتیار</Label>
                  <Input
                    id="guardianPhone"
                    value={newEntry.guardianPhone}
                    onChange={(e) => setNewEntry({...newEntry, guardianPhone: e.target.value})}
                    placeholder="٠٧٥٠١٢٣٤٥٦٧"
                  />
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

      {/* Supervised Students Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <SupervisedStudentsCardView data={filteredData} />
        ) : (
          <SupervisedStudentsTableView data={filteredData} />
        )}
      </div>

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