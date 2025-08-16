'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Building } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import Fuse from 'fuse.js'

export default function BuildingExpensesPage() {
  const isMobile = useIsMobile()
  const [expensesData, setExpensesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [newEntry, setNewEntry] = useState({
    item: '',
    cost: 0,
    month: 1
  })

  // Helper functions for enhanced search - MUST be defined before Fuse.js configuration
  const getMonthName = (month) => {
    const monthNames = {
      1: 'January کانونی دووەم',
      2: 'February شوبات',
      3: 'March ئادار',
      4: 'April نیسان',
      5: 'May ئایار',
      6: 'June حوزەیران',
      7: 'July تەمووز',
      8: 'August ئاب',
      9: 'September ئەیلوول',
      10: 'October تشرینی یەکەم',
      11: 'November تشرینی دووەم',
      12: 'December کانونی یەکەم'
    }
    return monthNames[month] || ''
  }

  const getCostRange = (cost) => {
    if (cost < 100000) return 'low کەم'
    if (cost < 500000) return 'medium ناوەند'
    if (cost < 1000000) return 'high بەرز'
    return 'very-high زۆر بەرز'
  }

  const getSeason = (month) => {
    if ([12, 1, 2].includes(month)) return 'winter زستان'
    if ([3, 4, 5].includes(month)) return 'spring بەھار'
    if ([6, 7, 8].includes(month)) return 'summer ھاوین'
    if ([9, 10, 11].includes(month)) return 'autumn پاییز'
    return ''
  }

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'item', weight: 0.5 }, // High weight for item description
        { name: 'cost', weight: 0.2 }, // Cost field for amount searches
        { name: 'month', weight: 0.15 }, // Month field
        // Include ID for technical searches
        { name: 'id', weight: 0.05 },
        // Custom comprehensive search field
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          return [
            obj.item || '',
            // Add numeric values as strings for better searching
            obj.cost ? obj.cost.toString() : '',
            obj.month ? obj.month.toString() : '',
            // Add formatted cost for localized searching
            obj.cost ? parseFloat(obj.cost).toLocaleString() : '',
            // Add month names in both English and Kurdish
            obj.month ? getMonthName(obj.month) : '',
            // Add cost range indicators
            obj.cost ? getCostRange(parseFloat(obj.cost)) : '',
            // Add seasonal indicators based on month
            obj.month ? getSeason(obj.month) : ''
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
    return new Fuse(expensesData, options)
  }, [expensesData])

  // Fetch building expenses data from API
  useEffect(() => {
    fetchExpensesData()
  }, [])

  const fetchExpensesData = async () => {
    try {
      const response = await fetch('/api/building-expenses')
      if (response.ok) {
        const data = await response.json()
        setExpensesData(data)
      }
    } catch (error) {
      console.error('Error fetching building expenses data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('building-')) {
        // Update existing entry
        response = await fetch(`/api/building-expenses/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('building-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/building-expenses', {
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
      if (id.startsWith('building-')) {
        // Remove from local state only if it's a temporary entry
        setExpensesData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/building-expenses/${id}`, {
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
      item: '',
      cost: 0,
      month: 1
    })
  }

  const startEditing = (index) => {
    const entry = expensesData[index]
    setEditingData(entry)
    setIsEditModalOpen(true)
  }

  const handleModalSave = async (editedData) => {
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }

  // Define fields for modal editing
  const editFields = [
    {
      key: 'item',
      label: 'Item',
      labelKu: 'بڕگە',
      type: 'text',
      placeholder: 'Enter building expense item'
    },
    {
      key: 'cost',
      label: 'Cost',
      labelKu: 'تێچوون',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'month',
      label: 'Month',
      labelKu: 'مانگ',
      type: 'number',
      placeholder: '1-12'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return expensesData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, expensesData])

  // Calculate total expenses
  const totalExpenses = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)

  function ExpensesCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.item}</div>
                <div className="font-bold text-xl text-red-600 dark:text-red-400">{parseFloat(entry.cost).toLocaleString()} د.ع</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">مانگ:</span> 
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                  {entry.month}
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

  function ExpensesTableView({ data }) {
    // Define table columns for building expenses
    const columns = [
      {
        key: 'item',
        header: 'بڕگە',
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'cost',
        header: 'تێچوون',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'month',
        header: 'مانگ',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
            {value}
          </span>
        )
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
          maxRowsPerPage={15}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Building Expenses</p>
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
      <PageLayout title="Building Expenses" titleKu="مەسروفی بینا">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Building Expenses" titleKu="مەسروفی بینا">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی مەسروفی بیناکاندا... / Fuzzy search across all building expense columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="building-expenses-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="building-expenses-records"
            title="Building Expenses"
            titleKu="مەسروفی بینا"
            columns={[
              { key: 'item', header: 'بڕگە' },
              { key: 'cost', header: 'تێچوون', render: (value) => parseFloat(value).toLocaleString() + ' د.ع' },
              { key: 'month', header: 'مانگ' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی مەسروفی بینا
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Building Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Item / بڕگە</Label>
                  <Input
                    id="item"
                    value={newEntry.item}
                    onChange={(e) => setNewEntry({...newEntry, item: e.target.value})}
                    placeholder="Enter building expense item"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Cost / تێچوون</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newEntry.cost}
                    onChange={(e) => setNewEntry({...newEntry, cost: parseFloat(e.target.value) || 0})}
                    placeholder="0"
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
                    onChange={(e) => setNewEntry({...newEntry, month: parseInt(e.target.value) || 1})}
                    placeholder="1-12"
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

      {/* Building Expenses Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <ExpensesCardView data={filteredData} />
        ) : (
          <ExpensesTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ مەسروفی بیناێک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ مەسروفی بیناێک زیاد نەکراوە'}
            </p>
          </CardContent>
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
        title="Edit Building Expense"
        titleKu="دەستکاریکردنی مەسروفی بینا"
      />
    </PageLayout>
  )
}