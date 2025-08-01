'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, UserCheck } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function TeachersPage() {
  const isMobile = useIsMobile()
  const [teachersData, setTeachersData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    fullName: '',
    birthYear: '',
    certificate: '',
    jobTitle: '',
    specialist: '',
    graduationDate: '',
    startDate: '',
    previousInstitution: ''
  })

  // Fetch teachers data
  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      const data = await response.json()
      // Ensure data is always an array
      setTeachersData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setTeachersData([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      const method = entry.id ? 'PUT' : 'POST'
      const response = await fetch('/api/teachers', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (response.ok) {
        await fetchTeachers()
        setIsAddDialogOpen(false)
        setEditingRow(null)
        resetNewEntry()
      }
    } catch (error) {
      console.error('Error saving teacher:', error)
    }
  }

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/teachers?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTeachers()
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      fullName: '',
      birthYear: '',
      certificate: '',
      jobTitle: '',
      specialist: '',
      graduationDate: '',
      startDate: '',
      previousInstitution: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    if (!Array.isArray(teachersData)) return
    
    const updatedData = [...teachersData]
    updatedData[rowIndex][field] = value
    setTeachersData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = async (rowIndex) => {
    if (!Array.isArray(teachersData) || !teachersData[rowIndex]) return
    
    const entry = teachersData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    fetchTeachers() // Reset changes
  }

  const filteredData = Array.isArray(teachersData) ? teachersData.filter(entry =>
    (entry.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.specialist?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : []

  function TeachersCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.fullName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">ساڵی لەدایکبوون:</span> {entry.birthYear}</div>
                <div><span className="font-semibold">بروانامە:</span> {entry.certificate}</div>
                <div><span className="font-semibold">ناونیشانی وەزیفی:</span> {entry.jobTitle}</div>
                <div><span className="font-semibold">پسپۆر:</span> {entry.specialist}</div>
                <div><span className="font-semibold">مێژووی دامەزراندن:</span> {entry.graduationDate}</div>
                <div><span className="font-semibold">دەست بەکاربوون:</span> {entry.startDate}</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">دامەزراوەی پێشوو:</span> {entry.previousInstitution}
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

  function TeachersTableView({ data }) {
    // Define table columns for teachers
    const columns = [
      {
        key: 'fullName',
        header: 'ناوی چواری',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'birthYear',
        header: 'ساڵی لەدایکبوون',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'certificate',
        header: 'بروانامە',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'jobTitle',
        header: 'ناونیشانی وەزیفی',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'specialist',
        header: 'پسپۆر',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'graduationDate',
        header: 'مێژووی دامەزراندن',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'startDate',
        header: 'دەست بەکاربوون',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'previousInstitution',
        header: 'دامەزراوەی پێشوو',
        align: 'center',
        editable: true,
        truncate: 30,
        render: (value) => <span className="text-sm">{value}</span>
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
      <PageLayout title="Teachers Records" titleKu="تۆماری مامۆستایان">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Teachers Records" titleKu="تۆماری مامۆستایان">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕان لە تۆماری مامۆستایان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="teachers-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="teachers-records"
            title="Teachers Records"
            titleKu="تۆماری مامۆستایان"
            columns={[
              { key: 'fullName', header: 'ناوی چواری' },
              { key: 'birthYear', header: 'ساڵی لەدایکبوون' },
              { key: 'certificate', header: 'بروانامە' },
              { key: 'jobTitle', header: 'ناونیشانی وەزیفی' },
              { key: 'specialist', header: 'پسپۆر' },
              { key: 'graduationDate', header: 'مێژووی دامەزراندن' },
              { key: 'startDate', header: 'دەست بەکاربوون' },
              { key: 'previousInstitution', header: 'دامەزراوەی پێشوو' }
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
                <DialogTitle>زیادکردنی مامۆستای نوێ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">ناوی چواری</Label>
                  <Input
                    id="fullName"
                    value={newEntry.fullName}
                    onChange={(e) => setNewEntry({...newEntry, fullName: e.target.value})}
                    placeholder="ناوی تەواوی مامۆستا"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthYear">ساڵی لەدایکبوون</Label>
                    <Input
                      id="birthYear"
                      type="number"
                      value={newEntry.birthYear}
                      onChange={(e) => setNewEntry({...newEntry, birthYear: e.target.value})}
                      placeholder="1985"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificate">بروانامە</Label>
                    <Input
                      id="certificate"
                      value={newEntry.certificate}
                      onChange={(e) => setNewEntry({...newEntry, certificate: e.target.value})}
                      placeholder="بەکالۆریۆس، ماستەر، دکتۆرا"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobTitle">ناونیشانی وەزیفی</Label>
                    <Input
                      id="jobTitle"
                      value={newEntry.jobTitle}
                      onChange={(e) => setNewEntry({...newEntry, jobTitle: e.target.value})}
                      placeholder="مامۆستای زانست"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialist">پسپۆر</Label>
                    <Input
                      id="specialist"
                      value={newEntry.specialist}
                      onChange={(e) => setNewEntry({...newEntry, specialist: e.target.value})}
                      placeholder="کیمیا، فیزیک، بیرکاری"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="graduationDate">مێژووی دامەزراندن</Label>
                    <Input
                      id="graduationDate"
                      type="date"
                      value={newEntry.graduationDate}
                      onChange={(e) => setNewEntry({...newEntry, graduationDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">دەست بەکاربوون لە دامەزراوکە</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEntry.startDate}
                      onChange={(e) => setNewEntry({...newEntry, startDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="previousInstitution">ناوی ئەو دامەزراوەی لێوەی هاتووە</Label>
                  <Input
                    id="previousInstitution"
                    value={newEntry.previousInstitution}
                    onChange={(e) => setNewEntry({...newEntry, previousInstitution: e.target.value})}
                    placeholder="زانکۆی سلێمانی، قوتابخانەی..."
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

      {/* Teachers Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <TeachersCardView data={filteredData} />
        ) : (
          <TeachersTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ مامۆستایەک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ مامۆستایەک زیاد نەکراوە'}
            </p>
          </div>
        </Card>
      )}
    </PageLayout>
  )
}