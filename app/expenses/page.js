'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function ExpensesPage() {
  const isMobile = useIsMobile()
  const [expensesData, setExpensesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    year: new Date().getFullYear().toString(),
    month: '1',
    staffSalary: 0,
    expenses: 0,
    buildingRent: 0,
    dramaFee: 0,
    socialSupport: 0,
    electricity: 0,
    total: 0,
    notes: ''
  })

  // Fetch monthly expenses data from API
  useEffect(() => {
    fetchExpensesData()
  }, [])

  const fetchExpensesData = async () => {
    try {
      const response = await fetch('/api/monthly-expenses')
      if (response.ok) {
        const data = await response.json()
        setExpensesData(data)
      }
    } catch (error) {
      console.error('Error fetching expenses data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      // Calculate total
      const staffSalary = parseFloat(entry.staffSalary) || 0
      const expenses = parseFloat(entry.expenses) || 0
      const buildingRent = parseFloat(entry.buildingRent) || 0
      const dramaFee = parseFloat(entry.dramaFee) || 0
      const socialSupport = parseFloat(entry.socialSupport) || 0
      const electricity = parseFloat(entry.electricity) || 0
      
      entry.total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity

      let response
      
      if (entry.id && !entry.id.startsWith('expense-')) {
        // Update existing entry
        response = await fetch(`/api/monthly-expenses/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('expense-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/monthly-expenses', {
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
        setExpensesData(prevData => {
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
      if (id.startsWith('expense-')) {
        // Remove from local state only if it's a temporary entry
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/monthly-expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      year: new Date().getFullYear().toString(),
      month: '1',
      staffSalary: 0,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 0,
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...expensesData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when amounts change
    if (['staffSalary', 'expenses', 'buildingRent', 'dramaFee', 'socialSupport', 'electricity'].includes(field)) {
      const staffSalary = parseFloat(updatedData[rowIndex].staffSalary) || 0
      const expenses = parseFloat(updatedData[rowIndex].expenses) || 0
      const buildingRent = parseFloat(updatedData[rowIndex].buildingRent) || 0
      const dramaFee = parseFloat(updatedData[rowIndex].dramaFee) || 0
      const socialSupport = parseFloat(updatedData[rowIndex].socialSupport) || 0
      const electricity = parseFloat(updatedData[rowIndex].electricity) || 0
      
      updatedData[rowIndex].total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity
    }
    
    setExpensesData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = expensesData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchExpensesData()
  }

  const filteredData = expensesData.filter(entry =>
    entry.year.toString().includes(searchTerm) ||
    entry.month.toString().includes(searchTerm) ||
    (entry.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Calculate total expenses
  const totalExpenses = filteredData.reduce((sum, entry) => sum + (entry.total || 0), 0)

  function ExpensesCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.year}/{entry.month}</div>
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">{entry.total.toLocaleString()} د.ع</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">موچەی ستاف:</span> <span className="text-green-600 dark:text-green-400">{entry.staffSalary.toLocaleString()}</span></div>
                <div><span className="font-semibold">مەسروفات:</span> <span className="text-red-600 dark:text-red-400">{entry.expenses.toLocaleString()}</span></div>
                <div><span className="font-semibold">کرێی بینا:</span> <span className="text-purple-600 dark:text-purple-400">{entry.buildingRent.toLocaleString()}</span></div>
                <div><span className="font-semibold">کارەبا:</span> <span className="text-orange-600 dark:text-orange-400">{entry.electricity.toLocaleString()}</span></div>
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

  function ExpensesTableView({ data }) {
    // Define table columns for monthly expenses
    const columns = [
      {
        key: 'year',
        header: 'ساڵ',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'month',
        header: 'مانگ',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'staffSalary',
        header: 'موچەی ستاف',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-green-600 dark:text-green-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'expenses',
        header: 'مەسروفات',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'buildingRent',
        header: 'کرێی بینا',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-purple-600 dark:text-purple-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'electricity',
        header: 'کارەبا',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-orange-600 dark:text-orange-400">{parseFloat(value || 0).toLocaleString()}</span>
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
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalExpenses.toLocaleString()} د.ع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Monthly Expenses" titleKu="خەرجی مانگانه">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Monthly Expenses" titleKu="خەرجی مانگانه">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search monthly expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="monthly-expenses-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="monthly-expenses-records"
            title="Monthly Expenses"
            titleKu="خەرجی مانگانه"
            columns={[
              { key: 'year', header: 'ساڵ' },
              { key: 'month', header: 'مانگ' },
              { key: 'staffSalary', header: 'موچەی ستاف', render: (value) => value.toLocaleString() },
              { key: 'expenses', header: 'مەسروفات', render: (value) => value.toLocaleString() },
              { key: 'buildingRent', header: 'کرێی بینا', render: (value) => value.toLocaleString() },
              { key: 'electricity', header: 'کارەبا', render: (value) => value.toLocaleString() },
              { key: 'total', header: 'کۆی گشتی', render: (value) => value.toLocaleString() },
              { key: 'notes', header: 'تێبینی' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی خەرجی مانگانە
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Monthly Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year / ساڵ</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newEntry.year}
                      onChange={(e) => setNewEntry({...newEntry, year: e.target.value})}
                      placeholder={new Date().getFullYear().toString()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">Month / مانگ</Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={newEntry.month}
                      onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                      placeholder="1-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staffSalary">Staff Salary / موچەی ستاف</Label>
                    <Input
                      id="staffSalary"
                      type="number"
                      value={newEntry.staffSalary}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, staffSalary: value}
                        const total = value + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses">Expenses / مەسروفات</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={newEntry.expenses}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, expenses: value}
                        const total = parseFloat(updatedEntry.staffSalary) + value + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buildingRent">Building Rent / کرێی بینا</Label>
                    <Input
                      id="buildingRent"
                      type="number"
                      value={newEntry.buildingRent}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, buildingRent: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + value + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + parseFloat(updatedEntry.electricity)
                        updatedEntry.total = total
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="electricity">Electricity / کارەبا</Label>
                    <Input
                      id="electricity"
                      type="number"
                      value={newEntry.electricity}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, electricity: value}
                        const total = parseFloat(updatedEntry.staffSalary) + parseFloat(updatedEntry.expenses) + parseFloat(updatedEntry.buildingRent) + parseFloat(updatedEntry.dramaFee) + parseFloat(updatedEntry.socialSupport) + value
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

      {/* Expenses Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <ExpensesCardView data={filteredData} />
        ) : (
          <ExpensesTableView data={filteredData} />
        )}
      </div>
    </PageLayout>
  )
}