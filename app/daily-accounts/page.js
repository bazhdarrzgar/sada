'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X, Calculator } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function DailyAccountsPage() {
  const isMobile = useIsMobile()
  const [dailyAccountsData, setDailyAccountsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    number: 1,
    week: '',
    purpose: '',
    checkNumber: '',
    amount: 0
  })

  // Fetch daily accounts data from API
  useEffect(() => {
    fetchDailyAccountsData()
  }, [])

  const fetchDailyAccountsData = async () => {
    try {
      const response = await fetch('/api/daily-accounts')
      if (response.ok) {
        const data = await response.json()
        setDailyAccountsData(data)
        // Update newEntry number based on existing data
        setNewEntry(prev => ({
          ...prev,
          number: data.length + 1
        }))
      }
    } catch (error) {
      console.error('Error fetching daily accounts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('daily-')) {
        // Update existing entry
        response = await fetch(`/api/daily-accounts/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('daily-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/daily-accounts', {
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
        setDailyAccountsData(prevData => {
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
      if (id.startsWith('daily-')) {
        // Remove from local state only if it's a temporary entry
        setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/daily-accounts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      number: dailyAccountsData.length + 1,
      week: '',
      purpose: '',
      checkNumber: '',
      amount: 0
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...dailyAccountsData]
    updatedData[rowIndex][field] = value
    setDailyAccountsData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = dailyAccountsData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchDailyAccountsData()
  }

  const filteredData = dailyAccountsData.filter(entry =>
    (entry.purpose?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.checkNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.week?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    entry.number.toString().includes(searchTerm)
  )

  // Calculate total amount
  const totalAmount = filteredData.reduce((sum, entry) => sum + (entry.amount || 0), 0)

  function DailyAccountsCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.purpose}</div>
                <div className="font-bold text-xl text-blue-600 dark:text-blue-400">{entry.amount.toLocaleString()} د.ع</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">ژمارە:</span> {entry.number}</div>
                <div><span className="font-semibold">هەفتە:</span> 
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                    {entry.week}
                  </span>
                </div>
                <div className="col-span-2"><span className="font-semibold">ژمارە پسووڵە:</span> 
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded text-xs font-mono">
                    {entry.checkNumber}
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

  function DailyAccountsTableView({ data }) {
    // Define table columns for daily accounts
    const columns = [
      {
        key: 'number',
        header: 'ژمارە',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'week',
        header: 'هەفتە',
        align: 'center',
        editable: true,
        render: (value) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
            {value}
          </span>
        )
      },
      {
        key: 'purpose',
        header: 'مەبەست',
        align: 'right',
        editable: true,
        truncate: 40,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'checkNumber',
        header: 'ژمارە پسووڵە',
        align: 'center',
        editable: true,
        render: (value) => (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded text-xs font-mono">
            {value}
          </span>
        )
      },
      {
        key: 'amount',
        header: 'بڕی پارە',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
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
          maxRowsPerPage={15}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Amount / کۆی گشتی</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAmount.toLocaleString()} د.ع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Daily Accounts" titleKu="حساباتی رۆژانه">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search daily accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="daily-accounts-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="daily-accounts-records"
            title="Daily Accounts"
            titleKu="حساباتی رۆژانه"
            columns={[
              { key: 'number', header: 'ژمارە' },
              { key: 'week', header: 'هەفتە' },
              { key: 'purpose', header: 'مەبەست' },
              { key: 'checkNumber', header: 'ژمارە پسووڵە' },
              { key: 'amount', header: 'بڕی پارە', render: (value) => value.toLocaleString() + ' د.ع' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی حساب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Daily Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number">Number / ژمارە</Label>
                    <Input
                      id="number"
                      type="number"
                      value={newEntry.number}
                      onChange={(e) => setNewEntry({...newEntry, number: parseInt(e.target.value) || 0})}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="week">Week / هەفتە</Label>
                    <Input
                      id="week"
                      value={newEntry.week}
                      onChange={(e) => setNewEntry({...newEntry, week: e.target.value})}
                      placeholder="W/1, W/2, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose / مەبەست</Label>
                  <Input
                    id="purpose"
                    value={newEntry.purpose}
                    onChange={(e) => setNewEntry({...newEntry, purpose: e.target.value})}
                    placeholder="Enter purpose in Kurdish"
                  />
                </div>

                <div>
                  <Label htmlFor="checkNumber">Check Number / ژمارە پسووڵە</Label>
                  <Input
                    id="checkNumber"
                    value={newEntry.checkNumber}
                    onChange={(e) => setNewEntry({...newEntry, checkNumber: e.target.value})}
                    placeholder="C001, C002, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount / بڕی پارە</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0"
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

      {/* Daily Accounts Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <DailyAccountsCardView data={filteredData} />
        ) : (
          <DailyAccountsTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ حسابێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ حسابێک زیاد نەکراوە'}
            </p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  )
}