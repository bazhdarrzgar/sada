'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, GraduationCap } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function TeacherInfoPage() {
  const isMobile = useIsMobile()
  const [teacherInfoData, setTeacherInfoData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    politicalName: '',
    program: '',
    specialty: '',
    subject: '',
    grade1: 1,
    grade2: 1,
    grade3: 1,
    grade4: 1,
    grade5: 1,
    grade6: 1,
    grade7: 1,
    grade8: 1,
    grade9: 1,
    totalHours: '',
    notes: ''
  })

  // Fetch teacher info data
  useEffect(() => {
    fetchTeacherInfo()
  }, [])

  const fetchTeacherInfo = async () => {
    try {
      const response = await fetch('/api/teacher-info')
      const data = await response.json()
      // Ensure data is always an array
      setTeacherInfoData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching teacher info:', error)
      setTeacherInfoData([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      const method = entry.id ? 'PUT' : 'POST'
      const response = await fetch('/api/teacher-info', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (response.ok) {
        await fetchTeacherInfo()
        setIsAddDialogOpen(false)
        setEditingRow(null)
        resetNewEntry()
      }
    } catch (error) {
      console.error('Error saving teacher info:', error)
    }
  }

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/teacher-info?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTeacherInfo()
      }
    } catch (error) {
      console.error('Error deleting teacher info:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      politicalName: '',
      program: '',
      specialty: '',
      subject: '',
      grade1: 1,
      grade2: 1,
      grade3: 1,
      grade4: 1,
      grade5: 1,
      grade6: 1,
      grade7: 1,
      grade8: 1,
      grade9: 1,
      totalHours: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    if (!Array.isArray(teacherInfoData)) return
    
    const updatedData = [...teacherInfoData]
    updatedData[rowIndex][field] = value
    setTeacherInfoData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = async (rowIndex) => {
    if (!Array.isArray(teacherInfoData) || !teacherInfoData[rowIndex]) return
    
    const entry = teacherInfoData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    fetchTeacherInfo() // Reset changes
  }

  const filteredData = Array.isArray(teacherInfoData) ? teacherInfoData.filter(entry =>
    (entry.politicalName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.program?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.specialty?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : []

  function TeacherInfoCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.politicalName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">بروانامە:</span> {entry.program}</div>
                <div><span className="font-semibold">پسپۆڕی:</span> {entry.specialty}</div>
                <div><span className="font-semibold">ناوی وانەکە کە دەیڵێتەوە:</span> {entry.subject}</div>
                <div><span className="font-semibold">کۆی کاتژمێر:</span> {entry.totalHours}</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">پۆلەکان:</span> {[entry.grade1, entry.grade2, entry.grade3, entry.grade4, entry.grade5, entry.grade6, entry.grade7, entry.grade8, entry.grade9].join(', ')}
              </div>
              <div className="text-sm">
                <span className="font-semibold">تێبینی:</span> {entry.notes}
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

  function TeacherInfoTableView({ data }) {
    // Define table columns for teacher info
    const columns = [
      {
        key: 'politicalName',
        header: 'ناوی سیاسی مامۆستا',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'program',
        header: 'بروانامە',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'specialty',
        header: 'پسپۆڕی',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'subject',
        header: 'ناوی وانەکە کە دەیڵێتەوە',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade1',
        header: 'پۆلی ١',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade2',
        header: 'پۆلی ٢',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade3',
        header: 'پۆلی ٣',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade4',
        header: 'پۆلی ٤',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade5',
        header: 'پۆلی ٥',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade6',
        header: 'پۆلی ٦',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade7',
        header: 'پۆلی ٧',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade8',
        header: 'پۆلی ٨',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'grade9',
        header: 'پۆلی ٩',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-xs">{value || 1}</span>
      },
      {
        key: 'totalHours',
        header: 'کۆی بەشە وانە کە دەوترێتەوە',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'notes',
        header: 'تێبینی',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
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
      <PageLayout title="Teacher Information" titleKu="زانیاری مامۆستا">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Teacher Information" titleKu="زانیاری مامۆستا">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕان لە زانیاری مامۆستایان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="teacher-info"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="teacher-info"
            title="Teacher Information"
            titleKu="زانیاری مامۆستا"
            columns={[
              { key: 'politicalName', header: 'ناوی سیاسی مامۆستا' },
              { key: 'program', header: 'بروانامە' },
              { key: 'specialty', header: 'پسپۆڕی' },
              { key: 'subject', header: 'ناوی وانەکە کە دەیڵێتەوە' },
              { key: 'grade1', header: 'پۆلی ١' },
              { key: 'grade2', header: 'پۆلی ٢' },
              { key: 'grade3', header: 'پۆلی ٣' },
              { key: 'grade4', header: 'پۆلی ٤' },
              { key: 'grade5', header: 'پۆلی ٥' },
              { key: 'grade6', header: 'پۆلی ٦' },
              { key: 'grade7', header: 'پۆلی ٧' },
              { key: 'grade8', header: 'پۆلی ٨' },
              { key: 'grade9', header: 'پۆلی ٩' },
              { key: 'totalHours', header: 'کۆی بەشە وانە کە دەوترێتەوە' },
              { key: 'notes', header: 'تێبینی' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">کۆی مامۆستایان</p>
            <p className="text-lg font-bold text-blue-600">{filteredData.length}</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی مامۆستا
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>زیادکردنی زانیاری مامۆستای نوێ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="politicalName">ناوی سیاسی مامۆستا</Label>
                    <Input
                      id="politicalName"
                      value={newEntry.politicalName}
                      onChange={(e) => setNewEntry({...newEntry, politicalName: e.target.value})}
                      placeholder="ناوی سیاسی مامۆستا"
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">بروانامە</Label>
                    <Input
                      id="program"
                      value={newEntry.program}
                      onChange={(e) => setNewEntry({...newEntry, program: e.target.value})}
                      placeholder="بەکالۆریۆس، ماستەر، دبلۆم"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">پسپۆڕی</Label>
                    <Input
                      id="specialty"
                      value={newEntry.specialty}
                      onChange={(e) => setNewEntry({...newEntry, specialty: e.target.value})}
                      placeholder="زمانی ئینگلیزی، کوردی، بیرکاری"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">ناوی وانەکە کە دەیڵێتەوە</Label>
                    <Input
                      id="subject"
                      value={newEntry.subject}
                      onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                      placeholder="کوردی، ئینگلیزی، بیرکاری"
                    />
                  </div>
                </div>
                <div>
                  <Label>پۆلەکان (1-9)</Label>
                  <div className="grid grid-cols-9 gap-2 mt-2">
                    {[1,2,3,4,5,6,7,8,9].map(grade => (
                      <div key={grade} className="text-center">
                        <Label htmlFor={`grade${grade}`} className="text-xs">{grade}</Label>
                        <Input
                          id={`grade${grade}`}
                          type="number"
                          value={newEntry[`grade${grade}`]}
                          onChange={(e) => setNewEntry({...newEntry, [`grade${grade}`]: parseInt(e.target.value) || 0})}
                          className="w-full text-center text-xs"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalHours">کۆی بەشە وانە کە دەوترێتەوە</Label>
                    <Input
                      id="totalHours"
                      value={newEntry.totalHours}
                      onChange={(e) => setNewEntry({...newEntry, totalHours: e.target.value})}
                      placeholder="کۆی کاتژمێر"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">تێبینی</Label>
                    <Input
                      id="notes"
                      value={newEntry.notes}
                      onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                      placeholder="تێبینی"
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

      {/* Teacher Info Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <TeacherInfoCardView data={filteredData} />
        ) : (
          <TeacherInfoTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ زانیاریەک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ زانیاریەک زیاد نەکراوە'}
            </p>
          </div>
        </Card>
      )}
    </PageLayout>
  )
}