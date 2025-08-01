'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function StudentPermissionsPage() {
  const isMobile = useIsMobile()
  const [permissionsData, setPermissionsData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    studentName: '',
    department: '',
    stage: '',
    leaveDuration: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'چاوەڕوان'
  })

  const departments = ['زانستی', 'ئەدەبی', 'بازرگانی', 'هونەری']
  const stages = ['قۆناغی یەکەم', 'قۆناغی دووەم', 'قۆناغی سێیەم', 'قۆناغی چوارەم']
  const statuses = ['چاوەڕوان', 'پەسەندکراو', 'ڕەتکراوە']

  // Fetch permissions data from API
  useEffect(() => {
    fetchPermissionsData()
  }, [])

  const fetchPermissionsData = async () => {
    try {
      const response = await fetch('/api/student-permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissionsData(data)
      }
    } catch (error) {
      console.error('Error fetching permissions data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('permission-')) {
        // Update existing entry
        response = await fetch(`/api/student-permissions/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('permission-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/student-permissions', {
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
        setPermissionsData(prevData => {
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
      if (id.startsWith('permission-')) {
        // Remove from local state only if it's a temporary entry
        setPermissionsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/student-permissions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPermissionsData(prevData => prevData.filter(item => item.id !== id))
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
      stage: '',
      leaveDuration: '',
      startDate: '',
      endDate: '',
      reason: '',
      status: 'چاوەڕوان'
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...permissionsData]
    updatedData[rowIndex][field] = value
    setPermissionsData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = permissionsData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchPermissionsData()
  }

  const filteredData = permissionsData.filter(entry =>
    (entry.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.stage?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.reason?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Calculate statistics
  const totalPermissions = filteredData.length
  const approvedPermissions = filteredData.filter(entry => entry.status === 'پەسەندکراو').length
  const pendingPermissions = filteredData.filter(entry => entry.status === 'چاوەڕوان').length

  function PermissionCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.studentName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">بەش (Department):</span> {entry.department}</div>
                <div><span className="font-semibold">قۆناغ (Stage):</span> {entry.stage}</div>
                <div><span className="font-semibold">ماوەی مۆڵەت (Duration):</span> {entry.leaveDuration}</div>
                <div><span className="font-semibold">بەروار (Date):</span> {entry.startDate} - {entry.endDate}</div>
              </div>
              <div className="border-t pt-2">
                <div className="text-sm">
                  <span className="font-semibold">هۆکار (Reason):</span> {entry.reason}
                </div>
                <div className={`font-bold text-sm mt-1 ${
                  entry.status === 'پەسەندکراو' ? 'text-green-600' : 
                  entry.status === 'ڕەتکراوە' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  <span>دۆخ (Status):</span> {entry.status}
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

  function PermissionsTableView({ data }) {
    // Define table columns for student permissions
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
        editComponent: (row, onChange) => (
          <Select value={row.department || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
        key: 'leaveDuration',
        header: 'ماوەی مۆڵەت',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'dateRange',
        header: 'بەروار',
        align: 'center',
        editable: false,
        render: (value, row) => (
          <div className="text-xs">
            <div>{row.startDate}</div>
            <div>{row.endDate}</div>
          </div>
        )
      },
      {
        key: 'reason',
        header: 'هۆکار',
        align: 'center',
        editable: true,
        truncate: 30,
        editComponent: (row, onChange) => (
          <Textarea
            value={row.reason || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full dark:bg-gray-800"
            rows={2}
          />
        ),
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      },
      {
        key: 'status',
        header: 'دۆخ',
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.status || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
            value === 'پەسەندکراو' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            value === 'ڕەتکراوە' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
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
      <PageLayout title="Student Permissions Management" titleKu="بەڕێوەبردنی مۆڵەتی خوێندکاران">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Student Permissions Management" titleKu="بەڕێوەبردنی مۆڵەتی خوێندکاران">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕان لە تۆمارەکانی مۆڵەت... / Search permission records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="student-permissions"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="student-permissions"
            title="Student Permissions Management"
            titleKu="بەڕێوەبردنی مۆڵەتی خوێندکاران"
            columns={[
              { key: 'studentName', header: 'ناوی خوێندکار' },
              { key: 'department', header: 'بەش' },
              { key: 'stage', header: 'قۆناغ' },
              { key: 'leaveDuration', header: 'ماوەی مۆڵەت' },
              { key: 'startDate', header: 'بەروارەی دەستپێک' },
              { key: 'endDate', header: 'بەروارەی کۆتایی' },
              { key: 'reason', header: 'هۆکار' },
              { key: 'status', header: 'دۆخ' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-gray-600">کۆی گشتی</p>
                <p className="font-bold text-blue-600">{totalPermissions}</p>
              </div>
              <div>
                <p className="text-gray-600">پەسەند</p>
                <p className="font-bold text-green-600">{approvedPermissions}</p>
              </div>
              <div>
                <p className="text-gray-600">چاوەڕوان</p>
                <p className="font-bold text-yellow-600">{pendingPermissions}</p>
              </div>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی مۆڵەت
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>زیادکردنی مۆڵەتی نوێ / Add New Permission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName">ناوی خوێندکار / Student Name</Label>
                  <Input
                    id="studentName"
                    value={newEntry.studentName}
                    onChange={(e) => setNewEntry({...newEntry, studentName: e.target.value})}
                    placeholder="ناوی خوێندکار بنووسە"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">بەش / Department</Label>
                    <Select value={newEntry.department} onValueChange={(value) => setNewEntry({...newEntry, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="بەش هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                  <Label htmlFor="leaveDuration">ماوەی مۆڵەت / Leave Duration</Label>
                  <Input
                    id="leaveDuration"
                    value={newEntry.leaveDuration}
                    onChange={(e) => setNewEntry({...newEntry, leaveDuration: e.target.value})}
                    placeholder="بۆ نموونە: ٣ رۆژ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">بەروارەی دەستپێک / Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEntry.startDate}
                      onChange={(e) => setNewEntry({...newEntry, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">بەروارەی کۆتایی / End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEntry.endDate}
                      onChange={(e) => setNewEntry({...newEntry, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">هۆکار / Reason</Label>
                  <Textarea
                    id="reason"
                    value={newEntry.reason}
                    onChange={(e) => setNewEntry({...newEntry, reason: e.target.value})}
                    placeholder="هۆکاری داواکردنی مۆڵەت..."
                  />
                </div>
                <div>
                  <Label htmlFor="status">دۆخ / Status</Label>
                  <Select value={newEntry.status} onValueChange={(value) => setNewEntry({...newEntry, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      {/* Permissions Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <PermissionCardView data={filteredData} />
        ) : (
          <PermissionsTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ مۆڵەتێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ مۆڵەتێک زیاد نەکراوە'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}