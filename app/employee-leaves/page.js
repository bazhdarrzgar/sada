'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Calendar, User } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import Fuse from 'fuse.js'

export default function EmployeeLeavesPage() {
  const isMobile = useIsMobile()
  const [leavesData, setLeavesData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    employeeName: '',
    specialty: '',
    leaveDate: '',
    leaveType: '',
    leaveDuration: '',
    orderNumber: '',
    returnDate: '',
    notes: ''
  })

  const leaveTypes = [
    'مۆڵەتی ساڵانە',
    'مۆڵەتی نەخۆشی', 
    'مۆڵەتی کەسی',
    'مۆڵەتی دایکبوون',
    'مۆڵەتی مردن',
    'مۆڵەتی زەواج',
    'مۆڵەتی بێ موچە'
  ]

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'employeeName', weight: 0.25 }, // Main name field
        { name: 'specialty', weight: 0.2 }, // Important field
        { name: 'leaveType', weight: 0.15 }, // Type of leave
        { name: 'orderNumber', weight: 0.1 }, // Order number
        { name: 'notes', weight: 0.1 }, // Additional notes
        { name: 'leaveDate', weight: 0.05 }, // Leave date
        { name: 'returnDate', weight: 0.05 }, // Return date
        { name: 'leaveDuration', weight: 0.05 }, // Duration
        // Enhanced search patterns for better matching
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.employeeName || '',
            obj.specialty || '',
            obj.leaveType || '',
            obj.orderNumber || '',
            obj.notes || '',
            obj.leaveDate || '',
            obj.returnDate || '',
            obj.leaveDuration ? obj.leaveDuration.toString() : '',
            // Add formatted date versions for better date searching
            obj.leaveDate ? new Date(obj.leaveDate).toLocaleDateString('ku') : '',
            obj.returnDate ? new Date(obj.returnDate).toLocaleDateString('ku') : '',
            // Add duration with text
            obj.leaveDuration ? `${obj.leaveDuration} رۆژ` : '',
            // Add status based on dates
            obj.returnDate ? (new Date(obj.returnDate) > new Date() ? 'گەڕاوەتەوە returned' : 'لە مۆڵەتدایە on leave') : ''
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
    return new Fuse(leavesData, options)
  }, [leavesData])

  // Load initial data
  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await fetch('/api/employee-leaves')
      if (response.ok) {
        const data = await response.json()
        setLeavesData(data)
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      if (!entry.id) {
        // Create new entry
        const response = await fetch('/api/employee-leaves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
        if (response.ok) {
          const newLeave = await response.json()
          setLeavesData(prev => [...prev, newLeave])
        }
      } else {
        // Update existing entry
        const response = await fetch(`/api/employee-leaves/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
        if (response.ok) {
          const updatedLeave = await response.json()
          setLeavesData(prev => prev.map(item => item.id === entry.id ? updatedLeave : item))
        }
      }

      setIsAddDialogOpen(false)
      setEditingRow(null)
      resetNewEntry()
    } catch (error) {
      console.error('Failed to save entry:', error)
    }
  }

  const deleteEntry = async (id) => {
    if (confirm('دڵنیایت لە سڕینەوەی ئەم تۆمارە؟ / Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`/api/employee-leaves/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setLeavesData(prev => prev.filter(item => item.id !== id))
        }
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      employeeName: '',
      specialty: '',
      leaveDate: '',
      leaveType: '',
      leaveDuration: '',
      orderNumber: '',
      returnDate: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...leavesData]
    updatedData[rowIndex][field] = value
    setLeavesData(updatedData)
  }

  const startEditing = (index) => {
    const entry = leavesData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = async (rowIndex) => {
    const entry = leavesData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    fetchLeaves() // Reload original data
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'employeeName',
      label: 'Teacher Name',
      labelKu: 'ناوی سیانی مامۆستا',
      type: 'text',
      placeholder: 'ناوی سیانی مامۆستا بنووسە'
    },
    {
      key: 'specialty',
      label: 'Specialty',
      labelKu: 'پسپۆری',
      type: 'text',
      placeholder: 'پسپۆری یان بەش'
    },
    {
      key: 'leaveDate',
      label: 'Leave Date',
      labelKu: 'ڕێکەوتی مۆڵەت',
      type: 'date'
    },
    {
      key: 'leaveType',
      label: 'Leave Type',
      labelKu: 'جۆری مۆڵەت',
      type: 'select',
      options: leaveTypes.map(type => ({ value: type, label: type }))
    },
    {
      key: 'leaveDuration',
      label: 'Duration (Days)',
      labelKu: 'ماوەی مۆڵەت بە رۆژ',
      type: 'number',
      placeholder: 'ژمارەی رۆژەکان'
    },
    {
      key: 'orderNumber',
      label: 'Order Number',
      labelKu: 'ژمارەی فەرمانی کارگێری مۆڵەت',
      type: 'text',
      placeholder: 'BM-2024-XXX'
    },
    {
      key: 'returnDate',
      label: 'Return Date',
      labelKu: 'رێکەوتی دەست بەکاربوونەوە دوای مۆڵەت',
      type: 'date'
    },
    {
      key: 'notes',
      label: 'Notes',
      labelKu: 'تێبینی',
      type: 'textarea',
      placeholder: 'تێبینی زیاتر...',
      span: 'full'
    }
  ]

  // Implement comprehensive fuzzy search across all columns
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return leavesData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, leavesData])

  function LeavesCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.employeeName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">پسپۆری:</span> {entry.specialty}</div>
                <div><span className="font-semibold">ڕێکەوتی مۆڵەت:</span> {entry.leaveDate}</div>
                <div><span className="font-semibold">جۆری مۆڵەت:</span> {entry.leaveType}</div>
                <div><span className="font-semibold">ماوەی مۆڵەت:</span> {entry.leaveDuration} رۆژ</div>
                <div><span className="font-semibold">ژمارەی فەرمان:</span> {entry.orderNumber}</div>
                <div><span className="font-semibold">ڕێکەوتی گەڕانەوە:</span> {entry.returnDate}</div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 border-t pt-2">
                  <span className="font-semibold">تێبینی:</span> {entry.notes}
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

  function LeavesTableView({ data }) {
    // Define table columns for employee leaves
    const columns = [
      {
        key: 'employeeName',
        header: 'ناوی سیانی مامۆستا',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'specialty',
        header: 'پسپۆری',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'leaveDate',
        header: 'ڕێکەوتی مۆڵەت',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'leaveType',
        header: 'جۆری مۆڵەت',
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.leaveType || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leaveTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
            value === 'مۆڵەتی ساڵانە' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            value === 'مۆڵەتی نەخۆشی' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            value === 'مۆڵەتی دایکبوون' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' :
            value === 'مۆڵەتی بێ موچە' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'leaveDuration',
        header: 'ماوەی مۆڵەت بە رۆژ',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value} رۆژ</span>
      },
      {
        key: 'orderNumber',
        header: 'ژمارەی فەرمانی کارگێری مۆڵەت',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-mono text-sm">{value}</span>
      },
      {
        key: 'returnDate',
        header: 'رێکەوتی دەست بەکاربوونەوە دوای مۆڵەت',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'notes',
        header: 'تێبینی',
        align: 'center',
        editable: true,
        truncate: 30,
        editComponent: (row, onChange) => (
          <Textarea
            value={row.notes || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full dark:bg-gray-800"
            rows={2}
          />
        ),
        render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
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
      <PageLayout title="Employee Leaves Management" titleKu="مۆڵەتی فەرمانبەران">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Employee Leaves Management" titleKu="مۆڵەتی فەرمانبەران">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی تۆمارەکانی مۆڵەتدا... / Fuzzy search across all leave record columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="employee-leaves-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="employee-leaves-records"
            title="Employee Leaves Management"
            titleKu="بەڕێوەبردنی مۆڵەتی کارمەندان"
            columns={[
              { key: 'employeeName', header: 'ناوی مامۆستا' },
              { key: 'specialty', header: 'پسپۆری' },
              { key: 'leaveDate', header: 'بەروواری مۆڵەت' },
              { key: 'leaveType', header: 'جۆری مۆڵەت' },
              { key: 'leaveDuration', header: 'ماوەی مۆڵەت' },
              { key: 'orderNumber', header: 'ژمارەی فەرمان' },
              { key: 'returnDate', header: 'بەروواری گەڕانەوە' },
              { key: 'notes', header: 'تێبینی' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right">
            <p className="text-sm text-gray-600">کۆی گشتی / Total Records</p>
            <p className="text-lg font-bold text-blue-600">{filteredData.length}</p>
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
                <DialogTitle>زیادکردنی مۆڵەتی نوێ / Add New Leave Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeName">ناوی سیانی مامۆستا / Teacher Name</Label>
                    <Input
                      id="employeeName"
                      value={newEntry.employeeName}
                      onChange={(e) => setNewEntry({...newEntry, employeeName: e.target.value})}
                      placeholder="ناوی سیانی مامۆستا بنووسە"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">پسپۆری / Specialty</Label>
                    <Input
                      id="specialty"
                      value={newEntry.specialty}
                      onChange={(e) => setNewEntry({...newEntry, specialty: e.target.value})}
                      placeholder="پسپۆری یان بەش"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leaveDate">ڕێکەوتی مۆڵەت / Leave Date</Label>
                    <Input
                      id="leaveDate"
                      type="date"
                      value={newEntry.leaveDate}
                      onChange={(e) => setNewEntry({...newEntry, leaveDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaveDuration">ماوەی مۆڵەت بە رۆژ / Duration (Days)</Label>
                    <Input
                      id="leaveDuration"
                      type="number"
                      value={newEntry.leaveDuration}
                      onChange={(e) => setNewEntry({...newEntry, leaveDuration: e.target.value})}
                      placeholder="ژمارەی رۆژەکان"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="leaveType">جۆری مۆڵەت / Leave Type</Label>
                  <Select value={newEntry.leaveType} onValueChange={(value) => setNewEntry({...newEntry, leaveType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="جۆری مۆڵەت هەڵبژێرە" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="orderNumber">ژمارەی فەرمانی کارگێری مۆڵەت / Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={newEntry.orderNumber}
                    onChange={(e) => setNewEntry({...newEntry, orderNumber: e.target.value})}
                    placeholder="BM-2024-XXX"
                  />
                </div>
                <div>
                  <Label htmlFor="returnDate">رێکەوتی دەست بەکاربوونەوە دوای مۆڵەت / Return Date</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={newEntry.returnDate}
                    onChange={(e) => setNewEntry({...newEntry, returnDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">تێبینی / Notes</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی زیاتر..."
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

      {/* Leaves Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <LeavesCardView data={filteredData} />
        ) : (
          <LeavesTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ تۆمارێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ تۆمارێک زیاد نەکراوە'}
            </p>
          </div>
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
        title="Edit Leave Record"
        titleKu="دەستکاریکردنی تۆماری مۆڵەت"
      />
    </PageLayout>
  )
}