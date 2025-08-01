'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

export default function InstallmentsPage() {
  const isMobile = useIsMobile()
  const [installmentsData, setInstallmentsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    fullName: '',
    grade: '',
    installmentType: '',
    annualAmount: '',
    firstInstallment: 0,
    secondInstallment: 0,
    thirdInstallment: 0,
    fourthInstallment: 0,
    fifthInstallment: 0,
    sixthInstallment: 0,
    totalReceived: 0,
    remaining: 0
  })

  // Fetch installments data from API
  useEffect(() => {
    fetchInstallmentsData()
  }, [])

  const fetchInstallmentsData = async () => {
    try {
      const response = await fetch('/api/installments')
      if (response.ok) {
        const data = await response.json()
        setInstallmentsData(data)
      }
    } catch (error) {
      console.error('Error fetching installments data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      // Calculate totals
      const annualAmount = parseFloat(entry.annualAmount) || 0
      const first = parseFloat(entry.firstInstallment) || 0
      const second = parseFloat(entry.secondInstallment) || 0
      const third = parseFloat(entry.thirdInstallment) || 0
      const fourth = parseFloat(entry.fourthInstallment) || 0
      const fifth = parseFloat(entry.fifthInstallment) || 0
      const sixth = parseFloat(entry.sixthInstallment) || 0
      
      entry.totalReceived = first + second + third + fourth + fifth + sixth
      entry.remaining = annualAmount - entry.totalReceived

      let response
      
      if (entry.id && !entry.id.startsWith('installment-')) {
        // Update existing entry
        response = await fetch(`/api/installments/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('installment-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/installments', {
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
        setInstallmentsData(prevData => {
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
      if (id.startsWith('installment-')) {
        // Remove from local state only if it's a temporary entry
        setInstallmentsData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/installments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInstallmentsData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      fullName: '',
      grade: '',
      installmentType: '',
      annualAmount: '',
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 0,
      remaining: 0
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...installmentsData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate totals when installment amounts change
    if (['annualAmount', 'firstInstallment', 'secondInstallment', 'thirdInstallment', 'fourthInstallment', 'fifthInstallment', 'sixthInstallment'].includes(field)) {
      const annualAmount = parseFloat(updatedData[rowIndex].annualAmount) || 0
      const first = parseFloat(updatedData[rowIndex].firstInstallment) || 0
      const second = parseFloat(updatedData[rowIndex].secondInstallment) || 0
      const third = parseFloat(updatedData[rowIndex].thirdInstallment) || 0
      const fourth = parseFloat(updatedData[rowIndex].fourthInstallment) || 0
      const fifth = parseFloat(updatedData[rowIndex].fifthInstallment) || 0
      const sixth = parseFloat(updatedData[rowIndex].sixthInstallment) || 0
      
      updatedData[rowIndex].totalReceived = first + second + third + fourth + fifth + sixth
      updatedData[rowIndex].remaining = annualAmount - updatedData[rowIndex].totalReceived
    }
    
    setInstallmentsData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = installmentsData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchInstallmentsData()
  }

  const filteredData = installmentsData.filter(entry =>
    (entry.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.grade?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (entry.installmentType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  // Calculate totals
  const totalAnnual = filteredData.reduce((sum, entry) => sum + (parseFloat(entry.annualAmount) || 0), 0)
  const totalReceived = filteredData.reduce((sum, entry) => sum + (entry.totalReceived || 0), 0)
  const totalRemaining = filteredData.reduce((sum, entry) => sum + (entry.remaining || 0), 0)

  function InstallmentsCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-3">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.fullName}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">پۆل (Grade):</span> {entry.grade}</div>
                <div><span className="font-semibold">جۆری قیست:</span> {entry.installmentType}</div>
              </div>
              <div className="border-t pt-2">
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div><span className="font-semibold">بڕی ساڵانە:</span> {entry.annualAmount.toLocaleString()} د.ع</div>
                  <div><span className="font-semibold">بڕی وەرگیراو:</span> {entry.totalReceived.toLocaleString()} د.ع</div>
                  <div><span className="font-semibold text-red-600">چەندی ماوە:</span> {entry.remaining.toLocaleString()} د.ع</div>
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

  function InstallmentsTableView({ data }) {
    // Define table columns for installments
    const columns = [
      {
        key: 'fullName',
        header: 'ناوی قوتابی',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'grade',
        header: 'پۆل',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'installmentType',
        header: 'جۆری قیست',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'annualAmount',
        header: 'بڕی ساڵانە',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium text-blue-600 dark:text-blue-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'firstInstallment',
        header: 'قیستی یەکەم',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'secondInstallment',
        header: 'قیستی دووەم',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'thirdInstallment',
        header: 'قیستی سێیەم',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'totalReceived',
        header: 'بڕی وەرگیراو',
        align: 'center',
        editable: false,
        render: (value) => <span className="font-bold text-green-600 dark:text-green-400">{parseFloat(value || 0).toLocaleString()}</span>
      },
      {
        key: 'remaining',
        header: 'چەندی ماوە',
        align: 'center',
        editable: false,
        render: (value) => <span className="font-bold text-red-600 dark:text-red-400">{parseFloat(value || 0).toLocaleString()}</span>
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
          maxRowsPerPage={10}
          enablePagination={true}
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
        {/* Summary footer */}
        <Card className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Annual</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalAnnual.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Received</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalReceived.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Remaining</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{totalRemaining.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <PageLayout title="Annual Installments" titleKu="قیستی ساڵانه">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Annual Installments" titleKu="قیستی ساڵانه">
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search installment records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="annual-installments-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="annual-installments-records"
            title="Annual Installments"
            titleKu="قیستی ساڵانه"
            columns={[
              { key: 'fullName', header: 'ناوی قوتابی' },
              { key: 'grade', header: 'پۆل' },
              { key: 'installmentType', header: 'جۆری قیست' },
              { key: 'annualAmount', header: 'بڕی ساڵانە' },
              { key: 'firstInstallment', header: 'قیستی یەکەم' },
              { key: 'secondInstallment', header: 'قیستی دووەم' },
              { key: 'thirdInstallment', header: 'قیستی سێیەم' },
              { key: 'fourthInstallment', header: 'قیستی چوارەم' },
              { key: 'fifthInstallment', header: 'قیستی پێنجەم' },
              { key: 'sixthInstallment', header: 'قیستی شەشەم' },
              { key: 'totalReceived', header: 'بڕی وەرگیراو' },
              { key: 'remaining', header: 'چەندی ماوە' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی قیست
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Installment Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fullName">Student Name / ناوی قوتابی</Label>
                    <Input
                      id="fullName"
                      value={newEntry.fullName}
                      onChange={(e) => setNewEntry({...newEntry, fullName: e.target.value})}
                      placeholder="Enter student name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Grade / پۆل</Label>
                    <Input
                      id="grade"
                      value={newEntry.grade}
                      onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installmentType">Installment Type / جۆری قیست</Label>
                    <Input
                      id="installmentType"
                      value={newEntry.installmentType}
                      onChange={(e) => setNewEntry({...newEntry, installmentType: e.target.value})}
                      placeholder="Enter installment type"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="annualAmount">Annual Amount / بڕی ساڵانە</Label>
                  <Input
                    id="annualAmount"
                    type="number"
                    value={newEntry.annualAmount}
                    onChange={(e) => {
                      const value = e.target.value
                      const updatedEntry = {...newEntry, annualAmount: value}
                      const annualAmount = parseFloat(value) || 0
                      const totalReceived = parseFloat(updatedEntry.firstInstallment) + parseFloat(updatedEntry.secondInstallment) + parseFloat(updatedEntry.thirdInstallment) + parseFloat(updatedEntry.fourthInstallment) + parseFloat(updatedEntry.fifthInstallment) + parseFloat(updatedEntry.sixthInstallment)
                      updatedEntry.remaining = annualAmount - totalReceived
                      setNewEntry(updatedEntry)
                    }}
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="firstInstallment">قیستی یەکەم</Label>
                    <Input
                      id="firstInstallment"
                      type="number"
                      value={newEntry.firstInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, firstInstallment: value}
                        const totalReceived = value + parseFloat(updatedEntry.secondInstallment) + parseFloat(updatedEntry.thirdInstallment) + parseFloat(updatedEntry.fourthInstallment) + parseFloat(updatedEntry.fifthInstallment) + parseFloat(updatedEntry.sixthInstallment)
                        updatedEntry.totalReceived = totalReceived
                        updatedEntry.remaining = parseFloat(updatedEntry.annualAmount) - totalReceived
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondInstallment">قیستی دووەم</Label>
                    <Input
                      id="secondInstallment"
                      type="number"
                      value={newEntry.secondInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, secondInstallment: value}
                        const totalReceived = parseFloat(updatedEntry.firstInstallment) + value + parseFloat(updatedEntry.thirdInstallment) + parseFloat(updatedEntry.fourthInstallment) + parseFloat(updatedEntry.fifthInstallment) + parseFloat(updatedEntry.sixthInstallment)
                        updatedEntry.totalReceived = totalReceived
                        updatedEntry.remaining = parseFloat(updatedEntry.annualAmount) - totalReceived
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thirdInstallment">قیستی سێیەم</Label>
                    <Input
                      id="thirdInstallment"
                      type="number"
                      value={newEntry.thirdInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, thirdInstallment: value}
                        const totalReceived = parseFloat(updatedEntry.firstInstallment) + parseFloat(updatedEntry.secondInstallment) + value + parseFloat(updatedEntry.fourthInstallment) + parseFloat(updatedEntry.fifthInstallment) + parseFloat(updatedEntry.sixthInstallment)
                        updatedEntry.totalReceived = totalReceived
                        updatedEntry.remaining = parseFloat(updatedEntry.annualAmount) - totalReceived
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fourthInstallment">قیستی چوارەم</Label>
                    <Input
                      id="fourthInstallment"
                      type="number"
                      value={newEntry.fourthInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, fourthInstallment: value}
                        const totalReceived = parseFloat(updatedEntry.firstInstallment) + parseFloat(updatedEntry.secondInstallment) + parseFloat(updatedEntry.thirdInstallment) + value + parseFloat(updatedEntry.fifthInstallment) + parseFloat(updatedEntry.sixthInstallment)
                        updatedEntry.totalReceived = totalReceived
                        updatedEntry.remaining = parseFloat(updatedEntry.annualAmount) - totalReceived
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fifthInstallment">قیستی پێنجەم</Label>
                    <Input
                      id="fifthInstallment"
                      type="number"
                      value={newEntry.fifthInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, fifthInstallment: value}
                        const totalReceived = parseFloat(updatedEntry.firstInstallment) + parseFloat(updatedEntry.secondInstallment) + parseFloat(updatedEntry.thirdInstallment) + parseFloat(updatedEntry.fourthInstallment) + value + parseFloat(updatedEntry.sixthInstallment)
                        updatedEntry.totalReceived = totalReceived
                        updatedEntry.remaining = parseFloat(updatedEntry.annualAmount) - totalReceived
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sixthInstallment">قیستی شەشەم</Label>
                    <Input
                      id="sixthInstallment"
                      type="number"
                      value={newEntry.sixthInstallment}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const updatedEntry = {...newEntry, sixthInstallment: value}
                        const totalReceived = parseFloat(updatedEntry.firstInstallment) + parseFloat(updatedEntry.secondInstallment) + parseFloat(updatedEntry.thirdInstallment) + parseFloat(updatedEntry.fourthInstallment) + parseFloat(updatedEntry.fifthInstallment) + value
                        updatedEntry.totalReceived = totalReceived
                        updatedEntry.remaining = parseFloat(updatedEntry.annualAmount) - totalReceived
                        setNewEntry(updatedEntry)
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalReceived">بڕی وەرگیراو (Total Received)</Label>
                    <Input
                      id="totalReceived"
                      type="number"
                      value={newEntry.totalReceived}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="remaining">چەندی ماوە (Remaining)</Label>
                    <Input
                      id="remaining"
                      type="number"
                      value={newEntry.remaining}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
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

      {/* Installments Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <InstallmentsCardView data={filteredData} />
        ) : (
          <InstallmentsTableView data={filteredData} />
        )}
      </div>
    </PageLayout>
  )
}