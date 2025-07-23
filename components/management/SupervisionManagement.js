'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Edit, Trash2, Users, GraduationCap } from 'lucide-react'

const SupervisionManagement = () => {
  const [teacherRecords, setTeacherRecords] = useState([])
  const [studentRecords, setStudentRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('teacher')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [modalType, setModalType] = useState('teacher')
  
  const [teacherFormData, setTeacherFormData] = useState({
    teacher_name: '',
    subject: '',
    department: '',
    stage: '',
    violation_type: '',
    punishment_type: ''
  })

  const [studentFormData, setStudentFormData] = useState({
    student_name: '',
    department: '',
    stage: '',
    violation_type: '',
    punishment_type: ''
  })

  // Load teacher records
  const loadTeacherRecords = async (search = '') => {
    setLoading(true)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/supervision/teacher${params}`)
      if (response.ok) {
        const data = await response.json()
        setTeacherRecords(data)
      }
    } catch (error) {
      console.error('Error fetching teacher supervision records:', error)
      alert('هەڵەیەک هەیە لە هێنانی داتاکانی چاودێری مامۆستا')
    } finally {
      setLoading(false)
    }
  }

  // Load student records
  const loadStudentRecords = async (search = '') => {
    setLoading(true)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/supervision/student${params}`)
      if (response.ok) {
        const data = await response.json()
        setStudentRecords(data)
      }
    } catch (error) {
      console.error('Error fetching student supervision records:', error)
      alert('هەڵەیەک هەیە لە هێنانی داتاکانی چاودێری خوێندکار')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeacherRecords()
    loadStudentRecords()
  }, [])

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (activeTab === 'teacher') {
      loadTeacherRecords(value)
    } else {
      loadStudentRecords(value)
    }
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchTerm('')
  }

  // Handle form input changes
  const handleTeacherInputChange = (e) => {
    const { name, value } = e.target
    setTeacherFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStudentInputChange = (e) => {
    const { name, value } = e.target
    setStudentFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Open modal for add/edit
  const openModal = (type, record = null) => {
    setModalType(type)
    if (record) {
      setEditingRecord(record)
      if (type === 'teacher') {
        setTeacherFormData(record)
      } else {
        setStudentFormData(record)
      }
    } else {
      setEditingRecord(null)
      if (type === 'teacher') {
        setTeacherFormData({
          teacher_name: '',
          subject: '',
          department: '',
          stage: '',
          violation_type: '',
          punishment_type: ''
        })
      } else {
        setStudentFormData({
          student_name: '',
          department: '',
          stage: '',
          violation_type: '',
          punishment_type: ''
        })
      }
    }
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRecord(null)
    setTeacherFormData({
      teacher_name: '',
      subject: '',
      department: '',
      stage: '',
      violation_type: '',
      punishment_type: ''
    })
    setStudentFormData({
      student_name: '',
      department: '',
      stage: '',
      violation_type: '',
      punishment_type: ''
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const endpoint = modalType === 'teacher' ? '/supervision/teacher' : '/supervision/student'
    const submitData = modalType === 'teacher' ? teacherFormData : studentFormData

    try {
      const method = editingRecord ? 'PUT' : 'POST'
      const url = editingRecord ? 
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api${endpoint}/${editingRecord.id}` : 
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api${endpoint}`
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        alert(editingRecord ? 'تۆمارەکە بە سەرکەوتوویی نوێکرایەوە' : 'تۆمارەکە بە سەرکەوتوویی زیادکرا')
        closeModal()
        if (modalType === 'teacher') {
          loadTeacherRecords(searchTerm)
        } else {
          loadStudentRecords(searchTerm)
        }
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
  const handleDelete = async (type, id, name) => {
    if (window.confirm(`ئایا دڵنیایت لە سڕینەوەی تۆمارەکەی ${name}؟`)) {
      setLoading(true)
      const endpoint = type === 'teacher' ? '/supervision/teacher' : '/supervision/student'
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api${endpoint}/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('تۆمارەکە بە سەرکەوتوویی سڕایەوە')
          if (type === 'teacher') {
            loadTeacherRecords(searchTerm)
          } else {
            loadStudentRecords(searchTerm)
          }
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

  const renderTeacherTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="border border-gray-300 p-3 text-right font-semibold">ناوی مامۆستا</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">بابەت</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">بەش</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">قۆناخ</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">جۆری سەرپێچی</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">جۆری سزا</th>
            <th className="border border-gray-300 p-3 text-center font-semibold">کردارەکان</th>
          </tr>
        </thead>
        <tbody>
          {teacherRecords.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                هیچ تۆمارێک نەدۆزرایەوە
              </td>
            </tr>
          ) : (
            teacherRecords.map((record, index) => (
              <tr key={record.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'}>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.teacher_name}</td>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.subject}</td>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.department}</td>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.stage}</td>
                <td className="border border-gray-300 p-3 text-sm text-red-600">{record.violation_type}</td>
                <td className="border border-gray-300 p-3 text-sm text-orange-600">{record.punishment_type}</td>
                <td className="border border-gray-300 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal('teacher', record)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete('teacher', record.id, record.teacher_name)}
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
  )

  const renderStudentTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green-600 text-white">
            <th className="border border-gray-300 p-3 text-right font-semibold">ناوی خوێندکار</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">بەش</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">قۆناخ</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">جۆری سەرپێچی</th>
            <th className="border border-gray-300 p-3 text-right font-semibold">جۆری سزا</th>
            <th className="border border-gray-300 p-3 text-center font-semibold">کردارەکان</th>
          </tr>
        </thead>
        <tbody>
          {studentRecords.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                هیچ تۆمارێک نەدۆزرایەوە
              </td>
            </tr>
          ) : (
            studentRecords.map((record, index) => (
              <tr key={record.id} className={index % 2 === 0 ? 'bg-green-50' : 'bg-blue-50'}>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.student_name}</td>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.department}</td>
                <td className="border border-gray-300 p-3 text-sm text-gray-900">{record.stage}</td>
                <td className="border border-gray-300 p-3 text-sm text-red-600">{record.violation_type}</td>
                <td className="border border-gray-300 p-3 text-sm text-orange-600">{record.punishment_type}</td>
                <td className="border border-gray-300 p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal('student', record)}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete('student', record.id, record.student_name)}
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
  )

  const renderForm = () => {
    if (modalType === 'teacher') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="teacher_name">ناوی مامۆستا *</Label>
            <Input
              id="teacher_name"
              name="teacher_name"
              value={teacherFormData.teacher_name}
              onChange={handleTeacherInputChange}
              required
              placeholder="ناوی مامۆستا بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="subject">بابەت *</Label>
            <Input
              id="subject"
              name="subject"
              value={teacherFormData.subject}
              onChange={handleTeacherInputChange}
              required
              placeholder="بابەت بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="department">بەش *</Label>
            <Input
              id="department"
              name="department"
              value={teacherFormData.department}
              onChange={handleTeacherInputChange}
              required
              placeholder="بەش بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="stage">قۆناخ *</Label>
            <Input
              id="stage"
              name="stage"
              value={teacherFormData.stage}
              onChange={handleTeacherInputChange}
              required
              placeholder="قۆناخ بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="violation_type">جۆری سەرپێچی *</Label>
            <Input
              id="violation_type"
              name="violation_type"
              value={teacherFormData.violation_type}
              onChange={handleTeacherInputChange}
              required
              placeholder="جۆری سەرپێچی بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="punishment_type">جۆری سزا *</Label>
            <Input
              id="punishment_type"
              name="punishment_type"
              value={teacherFormData.punishment_type}
              onChange={handleTeacherInputChange}
              required
              placeholder="جۆری سزا بنووسە"
            />
          </div>
        </div>
      )
    } else {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="student_name">ناوی خوێندکار *</Label>
            <Input
              id="student_name"
              name="student_name"
              value={studentFormData.student_name}
              onChange={handleStudentInputChange}
              required
              placeholder="ناوی خوێندکار بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="department">بەش *</Label>
            <Input
              id="department"
              name="department"
              value={studentFormData.department}
              onChange={handleStudentInputChange}
              required
              placeholder="بەش بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="stage">قۆناخ *</Label>
            <Input
              id="stage"
              name="stage"
              value={studentFormData.stage}
              onChange={handleStudentInputChange}
              required
              placeholder="قۆناخ بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="violation_type">جۆری سەرپێچی *</Label>
            <Input
              id="violation_type"
              name="violation_type"
              value={studentFormData.violation_type}
              onChange={handleStudentInputChange}
              required
              placeholder="جۆری سەرپێچی بنووسە"
            />
          </div>
          
          <div>
            <Label htmlFor="punishment_type">جۆری سزا *</Label>
            <Input
              id="punishment_type"
              name="punishment_type"
              value={studentFormData.punishment_type}
              onChange={handleStudentInputChange}
              required
              placeholder="جۆری سزا بنووسە"
            />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="h-6 w-6" />
            بەڕێوەبردنی چاودێری
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                چاودێری مامۆستا
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                چاودێری خوێندکار
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {/* Search and Add Button */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={`گەڕان لە ${activeTab === 'teacher' ? 'چاودێری مامۆستا' : 'چاودێری خوێندکار'}...`}
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => openModal(activeTab)}
                      className={`flex items-center gap-2 ${
                        activeTab === 'teacher' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                      زیادکردنی تۆمارێکی نوێ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRecord 
                          ? `دەستکاری ${modalType === 'teacher' ? 'چاودێری مامۆستا' : 'چاودێری خوێندکار'}`
                          : `زیادکردنی ${modalType === 'teacher' ? 'چاودێری مامۆستا' : 'چاودێری خوێندکار'}`
                        }
                      </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit}>
                      {renderForm()}
                      
                      <div className="flex items-center justify-end gap-3 pt-6">
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
                          className={`${
                            modalType === 'teacher' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                          disabled={loading}
                        >
                          {loading ? 'چاوەڕوان بە...' : (editingRecord ? 'نوێکردنەوە' : 'زیادکردن')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="teacher" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    {loading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">چاوەڕوان بە...</p>
                      </div>
                    )}
                    {!loading && renderTeacherTable()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="student" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    {loading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-600">چاوەڕوان بە...</p>
                      </div>
                    )}
                    {!loading && renderStudentTable()}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SupervisionManagement