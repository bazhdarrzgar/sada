'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Save, X, ChefHat, Filter } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import axios from 'axios'
import Fuse from 'fuse.js'

const MONTH_OPTIONS = [
  { value: 'مانگی ١', label: 'مانگی ١' },
  { value: 'مانگی ٢', label: 'مانگی ٢' },
  { value: 'مانگی ٣', label: 'مانگی ٣' },
  { value: 'مانگی ٤', label: 'مانگی ٤' },
  { value: 'مانگی ٥', label: 'مانگی ٥' },
  { value: 'مانگی ٦', label: 'مانگی ٦' },
  { value: 'مانگی ٧', label: 'مانگی ٧' },
  { value: 'مانگی ٨', label: 'مانگی ٨' },
  { value: 'مانگی ٩', label: 'مانگی ٩' },
  { value: 'مانگی ١٠', label: 'مانگی ١٠' },
  { value: 'مانگی ١١', label: 'مانگی ١١' },
  { value: 'مانگی ١٢', label: 'مانگی ١٢' }
]

export default function KitchenExpensesPage() {
  const isMobile = useIsMobile()
  const [expensesData, setExpensesData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('ALL_MONTHS') // Default to show all
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    item: '',
    cost: 0,
    month: 'مانگی ١',
    date: '',
    purpose: ''
  })

  // Get API URL from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'item', weight: 0.4 }, // Item name - highest weight as most descriptive
        { name: 'purpose', weight: 0.3 }, // Purpose
        { name: 'month', weight: 0.2 }, // Month
        { name: 'date', weight: 0.25 }, // Date field with enhanced weight
        { name: 'cost', weight: 0.2 }, // Cost field
        // Enhanced search patterns for better matching across all data
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.item || '',
            obj.purpose || '',
            obj.month || '',
            obj.date || '',
            obj.cost ? obj.cost.toString() : '',
            // Add formatted date versions for better date searching
            obj.date ? new Date(obj.date).toLocaleDateString('ku') : '',
            obj.date ? new Date(obj.date).toLocaleDateString('en') : '',
            // Add formatted cost with currency
            obj.cost ? `${obj.cost} د.ع` : '',
            obj.cost ? `${obj.cost} IQD` : '',
            obj.cost ? parseFloat(obj.cost).toLocaleString() : '',
            // Add month variations and translations
            obj.month ? `مانگی ${obj.month}` : '',
            obj.month ? `month ${obj.month}` : '',
            // Add expense-related keywords
            obj.item ? `خواردنگە ${obj.item}` : '',
            obj.item ? `kitchen ${obj.item}` : '',
            obj.purpose ? `خەرجی ${obj.purpose}` : '',
            obj.purpose ? `expense ${obj.purpose}` : ''
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

  // Fetch data from API or use initial data
  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/kitchen-expenses`)
      setExpensesData(response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching kitchen expenses:', error)
      setExpensesData([])
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      if (!entry.id) {
        // Create new entry
        const response = await axios.post(`${API_URL}/api/kitchen-expenses`, entry)
        setExpensesData(prevData => [...prevData, response.data])
      } else {
        // Update existing entry
        const response = await axios.put(`${API_URL}/api/kitchen-expenses/${entry.id}`, entry)
        setExpensesData(prevData => 
          prevData.map(item => item.id === entry.id ? response.data : item)
        )
      }
      setIsAddDialogOpen(false)
      resetNewEntry()
    } catch (error) {
      console.error('Error saving kitchen expense:', error)
    }
  }

  const deleteEntry = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/kitchen-expenses/${id}`)
      setExpensesData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting kitchen expense:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      item: '',
      cost: 0,
      month: 'مانگی ١',
      date: '',
      purpose: ''
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
      labelKu: 'شت و مه کی',
      type: 'text',
      placeholder: 'Enter item/description'
    },
    {
      key: 'cost',
      label: 'Cost',
      labelKu: 'تینجوو',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'date',
      label: 'Date',
      labelKu: 'بەروار',
      type: 'date'
    },
    {
      key: 'purpose',
      label: 'Purpose',
      labelKu: 'مەبەست',
      type: 'text',
      placeholder: 'Enter purpose'
    },
    {
      key: 'month',
      label: 'Month',
      labelKu: 'مانگی',
      type: 'select',
      options: MONTH_OPTIONS,
      placeholder: 'Select month'
    }
  ]

  // Filter data using fuzzy search and selected month
  const filteredData = useMemo(() => {
    let searchResults = expensesData
    
    // Apply fuzzy search if there's a search term
    if (searchTerm.trim()) {
      const fuseResults = fuse.search(searchTerm)
      searchResults = fuseResults.map(result => result.item)
    }
    
    // Apply month filter
    if (selectedMonth && selectedMonth !== 'ALL_MONTHS') {
      searchResults = searchResults.filter(entry => entry.month === selectedMonth)
    }
    
    return searchResults
  }, [fuse, searchTerm, expensesData, selectedMonth])

  // Calculate total for selected month or all data
  const selectedMonthTotal = selectedMonth && selectedMonth !== 'ALL_MONTHS'
    ? filteredData.filter(entry => entry.month === selectedMonth)
                  .reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)
    : filteredData.reduce((sum, entry) => sum + (parseFloat(entry.cost) || 0), 0)

  function ExpensesCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.item}</div>
                <div className="font-bold text-xl text-red-600 dark:text-red-400">{parseFloat(entry.cost).toLocaleString()} د.ع</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">بەروار:</span> {entry.date}
                </div>
                <div>
                  <span className="font-semibold">مەبەست:</span> {entry.purpose}
                </div>
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
    // Define table columns for kitchen expenses
    const columns = [
      {
        key: 'item',
        header: 'شت و مه کی',
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'cost',
        header: 'تینجوو',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-bold text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'date',
        header: 'بەروار',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'purpose',
        header: 'مەبەست',
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'month',
        header: 'مانگی',
        align: 'center',
        editable: true,
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
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {selectedMonth && selectedMonth !== 'ALL_MONTHS' ? `Total for ${selectedMonth}` : 'Total Kitchen Expenses'}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedMonthTotal.toLocaleString()} د.ع</p>
                {selectedMonth && selectedMonth !== 'ALL_MONTHS' && (
                  <p className="text-xs text-gray-500">
                    ({filteredData.length} items)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Kitchen Expenses" titleKu="خەرجی خواردنگە">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Kitchen Expenses" titleKu="خەرجی خواردنگە">
      {/* Search, Month Filter and Add Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="گەڕانی فازی لە هەموو ستوونەکانی خەرجی خواردنگەدا... / Fuzzy search across all kitchen expenses columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <DownloadButton 
              data={filteredData}
              filename="kitchen-expenses-records"
              className="bg-green-600 hover:bg-green-700 text-white"
            />
            <PrintButton 
              data={filteredData}
              filename="kitchen-expenses-records"
              title="Kitchen Expenses"
              titleKu="خەرجی خواردنگە"
              columns={[
                { key: 'item', header: 'شت و مه کی' },
                { key: 'cost', header: 'تینجوو', render: (value) => parseFloat(value).toLocaleString() + ' د.ع' },
                { key: 'date', header: 'بەروار' },
                { key: 'purpose', header: 'مەبەست' },
                { key: 'month', header: 'مانگی' }
              ]}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  زیادکردنی خەرجی خواردنگە
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Kitchen Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item">شت و مه کی (Item)</Label>
                    <Input
                      id="item"
                      value={newEntry.item}
                      onChange={(e) => setNewEntry({...newEntry, item: e.target.value})}
                      placeholder="Enter item/description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">تینجوو (Cost)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newEntry.cost}
                      onChange={(e) => setNewEntry({...newEntry, cost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">بەروار (Date)</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="purpose">مەبەست (Purpose)</Label>
                    <Input
                      id="purpose"
                      value={newEntry.purpose}
                      onChange={(e) => setNewEntry({...newEntry, purpose: e.target.value})}
                      placeholder="Enter purpose"
                    />
                  </div>

                  <div>
                    <Label htmlFor="month">مانگی (Month)</Label>
                    <Select value={newEntry.month} onValueChange={(value) => setNewEntry({...newEntry, month: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

        {/* Month Filter and Total Display */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Label htmlFor="monthFilter" className="font-semibold">Filter by Month:</Label>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_MONTHS">All Months / هەموو مانگەکان</SelectItem>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kitchen Expenses Table/Cards */}
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
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ خەرجی خواردنگەیەک نەدۆزرایەوە</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedMonth && selectedMonth !== 'ALL_MONTHS'
                ? `هیچ خەرجی خواردنگەیەک بۆ ${selectedMonth} نەدۆزرایەوە` 
                : searchTerm ? 'هیچ ئەنجامێک بۆ گەڕانەکەت نەدۆزرایەوە' : 'تا ئێستا هیچ خەرجی خواردنگەیەک زیاد نەکراوە'
              }
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
        title="Edit Kitchen Expense"
        titleKu="دەستکاریکردنی خەرجی خواردنگە"
      />
    </PageLayout>
  )
}