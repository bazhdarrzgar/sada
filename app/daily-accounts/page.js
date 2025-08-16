'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X, Calculator, Image as ImageIcon, Download } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import ImageUpload from '@/components/ui/image-upload'
import Fuse from 'fuse.js'

export default function DailyAccountsPage() {
  const isMobile = useIsMobile()
  const [dailyAccountsData, setDailyAccountsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [newEntry, setNewEntry] = useState({
    number: 1,
    week: '',
    purpose: '',
    checkNumber: '',
    amount: 0,
    date: '',
    receiptImages: []
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'number', weight: 0.15 }, // Entry number
        { name: 'week', weight: 0.2 }, // Week information
        { name: 'purpose', weight: 0.4 }, // Purpose - highest weight as most descriptive
        { name: 'date', weight: 0.25 }, // Date field with enhanced weight
        { name: 'checkNumber', weight: 0.25 }, // Check number
        { name: 'amount', weight: 0.2 }, // Amount field
        // Enhanced search patterns for better matching across all data
        { name: 'searchableContent', weight: 0.3, getFn: (obj) => {
          // Combine all searchable fields into one searchable string
          return [
            obj.number ? obj.number.toString() : '',
            obj.week || '',
            obj.purpose || '',
            obj.date || '',
            obj.checkNumber || '',
            obj.amount ? obj.amount.toString() : '',
            // Add formatted date versions for better date searching
            obj.date ? new Date(obj.date).toLocaleDateString('ku') : '',
            obj.date ? new Date(obj.date).toLocaleDateString('en') : '',
            // Add formatted amount with currency
            obj.amount ? `${obj.amount} د.ع` : '',
            obj.amount ? `${obj.amount} IQD` : '',
            // Add week variations
            obj.week ? `هەفتەی ${obj.week}` : '',
            obj.week ? `week ${obj.week}` : ''
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
    return new Fuse(dailyAccountsData, options)
  }, [dailyAccountsData])

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
      amount: 0,
      date: '',
      receiptImages: []
    })
  }

  const startEditing = (index) => {
    const entry = dailyAccountsData[index]
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
      key: 'number',
      label: 'Number',
      labelKu: 'ژمارە',
      type: 'number',
      placeholder: '1'
    },
    {
      key: 'week',
      label: 'Week',
      labelKu: 'هەفتە',
      type: 'text',
      placeholder: 'W/1, W/2, etc.'
    },
    {
      key: 'purpose',
      label: 'Purpose',
      labelKu: 'مەبەست',
      type: 'textarea',
      placeholder: 'Enter purpose in Kurdish',
      rows: 3,
      span: 'full'
    },
    {
      key: 'date',
      label: 'Date',
      labelKu: 'بەروار',
      type: 'date'
    },
    {
      key: 'checkNumber',
      label: 'Check Number',
      labelKu: 'ژمارە پسووڵە',
      type: 'text',
      placeholder: 'C001, C002, etc.'
    },
    {
      key: 'amount',
      label: 'Amount',
      labelKu: 'بڕی پارە',
      type: 'number',
      placeholder: '0'
    },
    {
      key: 'receiptImages',
      label: 'Receipt Images',
      labelKu: 'وێنەی پسووڵە',
      type: 'image-upload',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return dailyAccountsData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, dailyAccountsData])

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
                <div><span className="font-semibold">بەروار:</span> 
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                    {entry.date}
                  </span>
                </div>
                <div className="col-span-1"><span className="font-semibold">ژمارە پسووڵە:</span> 
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 rounded text-xs font-mono">
                    {entry.checkNumber}
                  </span>
                </div>
              </div>
              
              {/* Receipt Images */}
              {entry.receiptImages && entry.receiptImages.length > 0 && (
                <div className="mt-3">
                  <span className="font-semibold text-sm">وێنەی پسووڵە:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {entry.receiptImages.slice(0, 3).map((image, idx) => (
                      <img
                        key={idx}
                        src={image.url}
                        alt={`Receipt ${idx + 1}`}
                        className="w-12 h-12 rounded object-cover cursor-pointer hover:scale-110 transition-transform border-2 border-gray-200"
                        onClick={() => setPreviewImage(image)}
                      />
                    ))}
                    {entry.receiptImages.length > 3 && (
                      <div className="flex items-center justify-center w-12 h-12 rounded bg-gray-100 border-2 border-gray-200 text-xs font-medium text-gray-600">
                        +{entry.receiptImages.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 transition-colors duration-200">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)} className="hover:bg-red-50 dark:hover:bg-red-900/30 border-red-200 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 transition-colors duration-200">
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
        key: 'date',
        header: 'بەروار',
        align: 'center',
        editable: true,
        type: 'date',
        render: (value) => (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs font-medium">
            {value}
          </span>
        )
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
      },
      {
        key: 'receiptImages',
        header: 'وێنەی پسووڵە',
        align: 'center',
        editable: false,
        render: (value, row, rowIndex) => (
          <div className="flex items-center justify-center">
            {value && value.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {value.slice(0, 3).map((image, idx) => (
                    <img
                      key={idx}
                      src={image.url}
                      alt={`Receipt ${idx + 1}`}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setPreviewImage(image)}
                    />
                  ))}
                  {value.length > 3 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs font-medium text-gray-600">
                      +{value.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {value.length} image{value.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">No images</span>
              </div>
            )}
          </div>
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
            placeholder="گەڕانی فازی لە هەموو ستوونەکانی حساباتی رۆژانەدا... / Fuzzy search across all daily accounts columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="daily-accounts-records"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
              { key: 'date', header: 'بەروار' },
              { key: 'checkNumber', header: 'ژمارە پسووڵە' },
              { key: 'amount', header: 'بڕی پارە', render: (value) => value.toLocaleString() + ' د.ع' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white dark:text-white shadow-lg hover:shadow-xl transition-all duration-200"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی حساب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="date">بەروار</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
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

                <div>
                  <Label>وێنەی پسووڵە / Receipt Images</Label>
                  <ImageUpload
                    images={newEntry.receiptImages}
                    onImagesChange={(images) => setNewEntry({...newEntry, receiptImages: images})}
                    maxImages={6}
                    className="mt-2"
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
        title="Edit Daily Account"
        titleKu="دەستکاریکردنی حساباتی رۆژانه"
      />

      {/* Optimized Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.originalName || 'Receipt Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              {/* Full size image with optimized viewing */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'Receipt Preview'}
                  className="w-full max-h-[75vh] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              
              {/* Image details and actions */}
              <div className="flex justify-between items-center text-sm text-gray-300 bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <strong>Size:</strong> 
                    {previewImage.size ? (previewImage.size / 1024).toFixed(1) + ' KB' : 'Unknown'}
                  </span>
                  <span className="flex items-center gap-2">
                    <strong>Name:</strong> 
                    {previewImage.originalName || previewImage.filename}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = previewImage.url
                      link.download = previewImage.originalName || previewImage.filename
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewImage(null)}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}