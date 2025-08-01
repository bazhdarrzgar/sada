'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, ClipboardCheck } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function ExamSupervisionPage() {
  const isMobile = useIsMobile()
  const [supervisionData, setSupervisionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    subject: '',
    stage: '',
    endTime: '',
    examAchievement: '',
    supervisorName: '',
    obtainedScore: ''
  })

  const subjects = ['بیرکاری', 'زمانی کوردی', 'زمانی عەرەبی', 'ئینگلیزی', 'کیمیا', 'فیزیا', 'بایۆلۆژی', 'مێژوو', 'جوگرافیا', 'ئایینی']
  const stages = ['قۆناغی یەکەم', 'قۆناغی دووەم', 'قۆناغی سێیەم', 'قۆناغی چوارەم', 'قۆناغی پێنجەم', 'قۆناغی شەشەم']
  const achievements = ['نایاب', 'زۆر باش', 'باش', 'ناوەند', 'لاواز']

  // Fetch exam supervision data from API
  useEffect(() => {
    fetchExamSupervisionData()
  }, [])

  const fetchExamSupervisionData = async () => {
    try {
      const response = await fetch('/api/exam-supervision')
      if (response.ok) {
        const data = await response.json()
        setSupervisionData(data)
      }
    } catch (error) {
      console.error('Error fetching exam supervision data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('exam-supervision-')) {
        // Update existing entry
        response = await fetch(`/api/exam-supervision/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('exam-supervision-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/exam-supervision', {
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
      if (id.startsWith('exam-supervision-')) {
        // Remove from local state only if it's a temporary entry
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/exam-supervision/${id}`, {
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
      subject: '',
      stage: '',
      endTime: '',
      examAchievement: '',
      supervisorName: '',
      obtainedScore: ''
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
    fetchExamSupervisionData()
  }

  const filteredData = supervisionData.filter(entry =>
    (entry.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.stage?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.supervisorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.examAchievement?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Calculate statistics
  const totalExams = filteredData.length
  const excellentResults = filteredData.filter(entry => entry.examAchievement === 'نایاب' || entry.examAchievement === 'زۆر باش').length
  const averageScore = filteredData.length > 0 ? 
    Math.round(filteredData.reduce((sum, entry) => sum + parseInt(entry.obtainedScore.replace(/[^\d]/g, '') || 0), 0) / filteredData.length) : 0

  function SupervisionCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.subject} - {entry.stage}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">کۆتا کات:</span> {entry.endTime}</div>
                <div><span className="font-semibold">نمرەی گەراوە:</span> {entry.obtainedScore}</div>
                <div><span className="font-semibold">چاودێریکەر:</span> {entry.supervisorName}</div>
                <div>
                  <span className="font-semibold">گەیشتن:</span> 
                  <span className={`ml-1 font-bold ${
                    entry.examAchievement === 'نایاب' ? 'text-purple-600' :
                    entry.examAchievement === 'زۆر باش' ? 'text-green-600' :
                    entry.examAchievement === 'باش' ? 'text-blue-600' :
                    entry.examAchievement === 'ناوەند' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {entry.examAchievement}
                  </span>
                </div>
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

  function SupervisionTableView({ data }) {
    // Define table columns for exam supervision
    const columns = [
      {
        key: 'subject',
        header: 'بابەت',
        align: 'right',
        editable: true,
        truncate: 20,
        editComponent: (row, onChange) => (
          <Select value={row.subject || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'stage',
        header: 'قۆناغ',
        align: 'center',
        editable: true,
        truncate: 25,
        editComponent: (row, onChange) => (
          <Select value={row.stage || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'endTime',
        header: 'کۆتا کات',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'examAchievement',
        header: 'گەیشتنی تاقیکردنەوە',
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.examAchievement || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {achievements.map((achievement) => (
                <SelectItem key={achievement} value={achievement}>{achievement}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`font-medium px-2 py-1 rounded text-xs transition-colors duration-200 ${
            value === 'نایاب' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
            value === 'زۆر باش' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            value === 'باش' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            value === 'ناوەند' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'supervisorName',
        header: 'ناوی چاودێریکەر',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'obtainedScore',
        header: 'نمرەی گەراوە',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-bold text-blue-600 dark:text-blue-400">{value}</span>
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
      <PageLayout title="Exam Supervision Management" titleKu="بەڕێوەبردنی چاودێریکردنی تاقیکردنەوە">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Exam Supervision Management" titleKu="بەڕێوەبردنی چاودێریکردنی تاقیکردنەوە">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕان لە چاودێریکردنی تاقیکردنەوەکان... / Search exam supervisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="exam-supervision-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="exam-supervision-records"
            title="Exam Supervision Management"
            titleKu="بەڕێوەبردنی چاودێریکردنی تاقیکردنەوە"
            columns={[
              { key: 'subject', header: 'بابەت' },
              { key: 'stage', header: 'قۆناغ' },
              { key: 'endTime', header: 'کۆتا کات' },
              { key: 'examAchievement', header: 'گەیشتنی تاقیکردنەوە' },
              { key: 'supervisorName', header: 'ناوی چاودێریکەر' },
              { key: 'obtainedScore', header: 'نمرەی گەراوە' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-gray-600">کۆی گشتی</p>
                <p className="font-bold text-blue-600">{totalExams}</p>
              </div>
              <div>
                <p className="text-gray-600">نایاب/زۆر باش</p>
                <p className="font-bold text-green-600">{excellentResults}</p>
              </div>
              <div>
                <p className="text-gray-600">ناوەندی نمرە</p>
                <p className="font-bold text-purple-600">{averageScore}</p>
              </div>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی چاودێری
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>زیادکردنی چاودێریکردنی نوێ / Add New Exam Supervision</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">بابەت / Subject</Label>
                    <Select value={newEntry.subject} onValueChange={(value) => setNewEntry({...newEntry, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="بابەت هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stage">قۆناغ / Stage</Label>
                    <Select value={newEntry.stage} onValueChange={(value) => setNewEntry({...newEntry, stage: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="قۆناغ هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="endTime">کۆتا کات / End Time</Label>
                  <Input
                    id="endTime"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                    placeholder="بۆ نموونە: ١٠:٣٠ ب.ن"
                  />
                </div>
                <div>
                  <Label htmlFor="examAchievement">گەیشتنی تاقیکردنەوە / Exam Achievement</Label>
                  <Select value={newEntry.examAchievement} onValueChange={(value) => setNewEntry({...newEntry, examAchievement: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="ئاستی گەیشتن هەڵبژێرە" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievements.map((achievement) => (
                        <SelectItem key={achievement} value={achievement}>{achievement}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supervisorName">ناوی چاودێریکەر / Supervisor Name</Label>
                  <Input
                    id="supervisorName"
                    value={newEntry.supervisorName}
                    onChange={(e) => setNewEntry({...newEntry, supervisorName: e.target.value})}
                    placeholder="ناوی چاودێریکەر بنووسە"
                  />
                </div>
                <div>
                  <Label htmlFor="obtainedScore">نمرەی گەراوە / Obtained Score</Label>
                  <Input
                    id="obtainedScore"
                    value={newEntry.obtainedScore}
                    onChange={(e) => setNewEntry({...newEntry, obtainedScore: e.target.value})}
                    placeholder="بۆ نموونە: ٨٥"
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

      {/* Exam Supervision Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <SupervisionCardView data={filteredData} />
        ) : (
          <SupervisionTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ چاودێریکردنێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ چاودێریکردنێک زیاد نەکراوە'}
            </p>
          </div>
        </Card>
      )}
    </PageLayout>
  )
}