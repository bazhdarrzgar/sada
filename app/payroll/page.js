'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Save, X, DollarSign } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import Fuse from 'fuse.js'

export default function PayrollPage() {
  const isMobile = useIsMobile()
  const [payrollData, setPayrollData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [newEntry, setNewEntry] = useState({
    employeeName: '',
    salary: 0,
    absence: 0,
    deduction: 0,
    bonus: 0,
    total: 0,
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'employeeName', weight: 0.4 }, // High weight for employee name
        { name: 'notes', weight: 0.3 }, // High weight for notes content
        { name: 'salary', weight: 0.1 }, // Numeric fields for salary searches
        { name: 'absence', weight: 0.1 },
        { name: 'deduction', weight: 0.1 },
        { name: 'bonus', weight: 0.1 },
        { name: 'total', weight: 0.15 },
        // Enhanced search patterns for better matching
        { name: 'id', weight: 0.05 }, // Include ID for technical searches
        // Custom search field for comprehensive matching
        { name: 'searchableContent', weight: 0.25, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.employeeName || '',
            obj.notes || '',
            // Add formatted salary amounts for better number searching
            obj.salary ? obj.salary.toString() : '',
            obj.absence ? obj.absence.toString() : '',
            obj.deduction ? obj.deduction.toString() : '',
            obj.bonus ? obj.bonus.toString() : '',
            obj.total ? obj.total.toString() : '',
            // Add formatted amounts with localization
            obj.salary ? parseFloat(obj.salary).toLocaleString() : '',
            obj.total ? parseFloat(obj.total).toLocaleString() : '',
            // Add status based on total amount
            obj.total ? (parseFloat(obj.total) > 0 ? 'positive ئەرێنی' : parseFloat(obj.total) < 0 ? 'negative نەرێنی' : 'zero سفر') : ''
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
    return new Fuse(payrollData, options)
  }, [payrollData])

  // Fetch payroll data from API
  useEffect(() => {
    fetchPayrollData()
  }, [])

  const fetchPayrollData = async () => {
    try {
      const response = await fetch('/api/payroll')
      if (response.ok) {
        const data = await response.json()
        setPayrollData(data)
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      // Calculate total
      const salary = parseFloat(entry.salary) || 0
      const absence = parseFloat(entry.absence) || 0
      const deduction = parseFloat(entry.deduction) || 0
      const bonus = parseFloat(entry.bonus) || 0
      
      entry.total = salary - absence - deduction + bonus

      let response
      
      if (entry.id && !entry.id.startsWith('payroll-')) {
        // Update existing entry
        response = await fetch(`/api/payroll/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('payroll-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/payroll', {
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
        setPayrollData(prevData => {
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
      if (id.startsWith('payroll-')) {
        // Remove from local state only if it's a temporary entry
        setPayrollData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/payroll/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPayrollData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      employeeName: '',
      salary: 0,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 0,
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...payrollData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when amounts change
    if (['salary', 'absence', 'deduction', 'bonus'].includes(field)) {
      const salary = parseFloat(updatedData[rowIndex].salary) || 0
      const absence = parseFloat(updatedData[rowIndex].absence) || 0
      const deduction = parseFloat(updatedData[rowIndex].deduction) || 0
      const bonus = parseFloat(updatedData[rowIndex].bonus) || 0
      
      updatedData[rowIndex].total = salary - absence - deduction + bonus
    }
    
    setPayrollData(updatedData)
  }

  const startEditing = (index) => {
    const entry = payrollData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = payrollData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchPayrollData()
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
      label: 'Employee Name',
      labelKu: 'ناوی کارمەند',
      type: 'text',
      placeholder: 'Enter employee name'
    },
    {
      key: 'salary',
      label: 'Base Salary',
      labelKu: 'موچە',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'absence',
      label: 'Absence',
      labelKu: 'نەھاتن',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'deduction',
      label: 'Deduction',
      labelKu: 'سزا',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'bonus',
      label: 'Bonus',
      labelKu: 'پاداشت',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'notes',
      label: 'Notes',
      labelKu: 'تێبینی',
      type: 'textarea',
      placeholder: 'Additional notes...',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return payrollData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, payrollData])

  // Calculate totals
  const totalSalary = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.salary) || 0), 0)
  const totalDeductions = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.absence) || 0) + (parseFloat(entry.deduction) || 0), 0)
  const totalBonuses = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.bonus) || 0), 0)
  const grandTotal = filteredData.reduce((sum, entry) => sum + (entry.total || 0), 0)

  function PayrollCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.employeeName}</div>
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">{entry.total.toLocaleString()} د.ع</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">موچە:</span> <span className="text-green-600 dark:text-green-400">{entry.salary.toLocaleString()}</span></div>
                <div><span className="font-semibold">نەھاتن:</span> <span className="text-red-600 dark:text-red-400">{entry.absence.toLocaleString()}</span></div>
                <div><span className="font-semibold">سزا:</span> <span className="text-red-600 dark:text-red-400">{entry.deduction.toLocaleString()}</span></div>
                <div><span className="font-semibold">پاداشت:</span> <span className="text-purple-600 dark:text-purple-400">{entry.bonus.toLocaleString()}</span></div>
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
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

  const PayrollTableView = ({ data }) => {
    // Define table columns for payroll
    const columns = [
      {
        key: 'employeeName',
        header: 'ناوی کارمەند',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'salary',
        header: 'موچە',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'absence',
        header: 'نەھاتن',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'deduction',
        header: 'سزا',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'bonus',
        header: 'پاداشت',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-purple-600 dark:text-purple-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'total',
        header: 'کۆی گشتی',
        align: 'center',
        editable: false,
        render: (value) => <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'notes',
        header: 'تێبینی',
        align: 'center',
        editable: true,
        truncate: 40,
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
      <>
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
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Base Salary</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalSalary.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Deductions</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{totalDeductions.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Bonuses</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalBonuses.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Grand Total</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{grandTotal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Payroll Management" titleKu="لیستی بڕی موچە">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Payroll Management" titleKu="لیستی بڕی موچە">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی موچەدا... / Fuzzy search across all payroll columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="payroll-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="payroll-records"
            title="Payroll Management"
            titleKu="لیستی بڕی موچە"
            columns={[
              { key: 'employeeName', header: 'ناوی کارمەند' },
              { key: 'salary', header: 'موچە', render: (value) => value.toLocaleString() },
              { key: 'absence', header: 'نەھاتن', render: (value) => value.toLocaleString() },
              { key: 'deduction', header: 'سزا', render: (value) => value.toLocaleString() },
              { key: 'bonus', header: 'پاداشت', render: (value) => value.toLocaleString() },
              { key: 'total', header: 'کۆی گشتی', render: (value) => value.toLocaleString() },
              { key: 'notes', header: 'تێبینی' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی موچە
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Payroll Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employeeName">Employee Name / ناوی کارمەند</Label>
                  <Input
                    id="employeeName"
                    value={newEntry.employeeName}
                    onChange={(e) => setNewEntry({...newEntry, employeeName: e.target.value})}
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Base Salary / موچە</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newEntry.salary}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, salary: value}
                        const total = value - parseFloat(updatedEntry.absence) - parseFloat(updatedEntry.deduction) + parseFloat(updatedEntry.bonus)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="absence">Absence / نەھاتن</Label>
                    <Input
                      id="absence"
                      type="number"
                      value={newEntry.absence}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, absence: value}
                        const total = parseFloat(updatedEntry.salary) - value - parseFloat(updatedEntry.deduction) + parseFloat(updatedEntry.bonus)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deduction">Deduction / سزا</Label>
                    <Input
                      id="deduction"
                      type="number"
                      value={newEntry.deduction}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, deduction: value}
                        const total = parseFloat(updatedEntry.salary) - parseFloat(updatedEntry.absence) - value + parseFloat(updatedEntry.bonus)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonus">Bonus / پاداشت</Label>
                    <Input
                      id="bonus"
                      type="number"
                      value={newEntry.bonus}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, bonus: value}
                        const total = parseFloat(updatedEntry.salary) - parseFloat(updatedEntry.absence) - parseFloat(updatedEntry.deduction) + value
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="total">Total / کۆی گشتی</Label>
                  <Input
                    id="total"
                    type="number"
                    value={newEntry.total}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes / تێبینی</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)}>
                    Save Record
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
        title="Edit Payroll Record"
        titleKu="دەستکاریکردنی تۆماری موچە"
      />

      {/* Payroll Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <PayrollCardView data={filteredData} />
        ) : (
          <PayrollTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ تۆمارێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ تۆمارێک زیاد نەکراوە'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}