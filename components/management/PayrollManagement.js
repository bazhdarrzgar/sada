'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X, Calculator } from 'lucide-react'

const PayrollManagement = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [formData, setFormData] = useState({
    employee_name: '',
    salary: '',
    absence: '',
    deduction: '',
    bonus: '',
    notes: ''
  })

  // Load payroll records
  const loadRecords = async (search = '') => {
    setLoading(true)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payroll${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error)
      alert('هەڵەیەک هەیە لە هێنانی داتاکان')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    loadRecords(value)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate total preview
  const calculateTotal = () => {
    const salary = parseFloat(formData.salary) || 0
    const absence = parseFloat(formData.absence) || 0
    const deduction = parseFloat(formData.deduction) || 0
    const bonus = parseFloat(formData.bonus) || 0
    return salary - absence - deduction + bonus
  }

  // Open modal for add/edit
  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record)
      setFormData({
        employee_name: record.employee_name,
        salary: record.salary.toString(),
        absence: record.absence.toString(),
        deduction: record.deduction.toString(),
        bonus: record.bonus.toString(),
        notes: record.notes
      })
    } else {
      setEditingRecord(null)
      setFormData({
        employee_name: '',
        salary: '',
        absence: '',
        deduction: '',
        bonus: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRecord(null)
    setFormData({
      employee_name: '',
      salary: '',
      absence: '',
      deduction: '',
      bonus: '',
      notes: ''
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const submitData = {
      employee_name: formData.employee_name,
      salary: parseFloat(formData.salary) || 0,
      absence: parseFloat(formData.absence) || 0,
      deduction: parseFloat(formData.deduction) || 0,
      bonus: parseFloat(formData.bonus) || 0,
      notes: formData.notes
    }

    try {
      const method = editingRecord ? 'PUT' : 'POST'
      const url = editingRecord ? 
        `${process.env.REACT_APP_BACKEND_URL}/api/payroll/${editingRecord.id}` : 
        `${process.env.REACT_APP_BACKEND_URL}/api/payroll`
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        alert(editingRecord ? 'تۆمارەکە بە سەرکەوتوویی نوێکرایەوە' : 'تۆمارەکە بە سەرکەوتوویی زیادکرا')
        closeModal()
        loadRecords(searchTerm)
      } else {
        throw new Error('Failed to save record')
      }
    } catch (error) {
      console.error('Error saving record:', error)
      alert('هەڵەیەک هەیە لە پاشەکەوتکردنی تۆمارەکە')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`ئایا دڵنیایت لە سڕینەوەی تۆمارەکەی ${employeeName}؟`)) {
      setLoading(true)
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payroll/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('تۆمارەکە بە سەرکەوتوویی سڕایەوە')
          loadRecords(searchTerm)
        } else {
          throw new Error('Failed to delete record')
        }
      } catch (error) {
        console.error('Error deleting record:', error)
        alert('هەڵەیەک هەیە لە سڕینەوەی تۆمارەکە')
      } finally {
        setLoading(false)
      }
    }
  }

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-IQ').format(num)
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            بەڕێوەبردنی موچە
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="گەڕان بە ناوی کارمەند..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => openModal()}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  زیادکردنی تۆمارێکی نوێ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'دەستکاری تۆمارەکە' : 'زیادکردنی تۆمارێکی نوێ'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="employee_name">ناوی کارمەند *</Label>
                    <Input
                      id="employee_name"
                      name="employee_name"
                      value={formData.employee_name}
                      onChange={handleInputChange}
                      required
                      placeholder="ناوی کارمەند بنووسە"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="salary">موچە *</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="absence">نەھاتن</Label>
                    <Input
                      id="absence"
                      name="absence"
                      type="number"
                      value={formData.absence}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deduction">لێ برین</Label>
                    <Input
                      id="deduction"
                      name="deduction"
                      type="number"
                      value={formData.deduction}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bonus">پاداشت</Label>
                    <Input
                      id="bonus"
                      name="bonus"
                      type="number"
                      value={formData.bonus}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  {/* Total Preview */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800">کۆی گشتی:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatNumber(calculateTotal())}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">تێبینی</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="تێبینی لێرە بنووسە..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      disabled={loading}
                    >
                      پاشگەزبوونەوە
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'چاوەڕوان بە...' : (editingRecord ? 'نوێکردنەوە' : 'زیادکردن')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">چاوەڕوان بە...</p>
            </div>
          )}
          
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 p-3 text-right font-semibold">ناوی کارمەند</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">موچە</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">نەھاتن</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">لێ برین</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">پاداشت</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">کۆی گشتی</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">تێبینی</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">کردارەکان</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        هیچ تۆمارێک نەدۆزرایەوە
                      </td>
                    </tr>
                  ) : (
                    records.map((record, index) => (
                      <tr key={record.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'}>
                        <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.employee_name}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-900">{formatNumber(record.salary)}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-900">{formatNumber(record.absence)}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-900">{formatNumber(record.deduction)}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-900">{formatNumber(record.bonus)}</td>
                        <td className="border border-gray-300 p-3 text-sm font-semibold text-green-600">{formatNumber(record.total)}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.notes || '-'}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openModal(record)}
                              disabled={loading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(record.id, record.employee_name)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PayrollManagement