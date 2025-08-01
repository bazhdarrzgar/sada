'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Activity } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function ActivitiesPage() {
  const isMobile = useIsMobile()
  const [activitiesData, setActivitiesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    activityType: '',
    preparationDate: '',
    content: '',
    startDate: ''
  })

  const activityTypes = ['وەرزشی', 'هونەری', 'زانستی', 'کۆمەڵایەتی', 'فێرکاری', 'گەڕان و فێربوون', 'کولتووری']

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
      startDate: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...activitiesData]
    updatedData[rowIndex][field] = value
    setActivitiesData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
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

  const filteredData = activitiesData.filter(entry =>
    (entry.activityType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.content?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

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
              </div>
              <div className="border-t pt-2">
                <div className="text-sm">
                  <span className="font-semibold">ناوەرۆک (Content):</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">{entry.content}</p>
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
            placeholder="گەڕان لە چالاکییەکان... / Search activities..."
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
            <DialogContent className="max-w-md">
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
    </PageLayout>
  )
}