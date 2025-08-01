'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Plus, Save, Search, Trash2, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'

function StaffPage() {
  const isMobile = useIsMobile()
  const [staffData, setStaffData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newEntry, setNewEntry] = useState({
    fullName: '',
    mobile: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    marriage: '',
    certificate: '',
    age: '',
    education: '',
    attendance: 'Present',
    date: new Date().toISOString().split('T')[0],
    department: '',
    pass_grade: '',
    contract: 'Permanent'
  })

  // Fetch staff data from API
  useEffect(() => {
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaffData(data)
      }
    } catch (error) {
      console.error('Error fetching staff data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    try {
      if (!entry.id) {
        // Create new entry
        const response = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
        
        if (response.ok) {
          const newEntry = await response.json()
          setStaffData(prev => [...prev, newEntry])
        }
      } else {
        // Update existing entry
        const response = await fetch(`/api/staff/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
        
        if (response.ok) {
          const updatedEntry = await response.json()
          setStaffData(prev => prev.map(item => 
            item.id === entry.id ? updatedEntry : item
          ))
        }
      }
      
      setIsAddDialogOpen(false)
      setEditingRow(null)
      resetNewEntry()
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setStaffData(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      fullName: '',
      mobile: '',
      address: '',
      gender: '',
      dateOfBirth: '',
      marriage: '',
      certificate: '',
      age: '',
      education: '',
      attendance: 'Present',
      date: new Date().toISOString().split('T')[0],
      department: '',
      pass_grade: '',
      contract: 'Permanent'
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...staffData]
    updatedData[rowIndex][field] = value
    setStaffData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = staffData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    fetchStaffData() // Reload original data
  }

  const filteredData = staffData.filter(staff =>
    (staff.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.mobile?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  function StaffTableView({ data }) {
    if (isMobile) {
      return (
        <div className="space-y-4">
          {data.map((staff, idx) => (
            <Card key={staff.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
              <div className="space-y-2">
                <div className="font-bold text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{staff.fullName}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">Mobile:</span> {staff.mobile}</div>
                  <div><span className="font-semibold">Department:</span> {staff.department}</div>
                  <div><span className="font-semibold">Gender:</span> {staff.gender}</div>
                  <div><span className="font-semibold">Age:</span> {staff.age}</div>
                  <div><span className="font-semibold">Contract:</span> {staff.contract}</div>
                  <div>
                    <span className="font-semibold">Attendance:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      staff.attendance === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {staff.attendance}
                    </span>
                  </div>
                </div>
                <div className="text-sm"><span className="font-semibold">Address:</span> {staff.address}</div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteEntry(staff.id)} className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    // Define table columns
    const columns = [
      {
        key: 'fullName',
        header: 'ناوی تەواو',
        align: 'right',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'mobile',
        header: 'مۆبایل',
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'department',
        header: 'بەش',
        align: 'center',
        editable: true,
        truncate: 20,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'gender',
        header: 'ڕەگەز',
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.gender || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'age',
        header: 'تەمەن',
        align: 'center',
        editable: true,
        type: 'number',
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'contract',
        header: 'گرێبەست',
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.contract || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Permanent">Permanent</SelectItem>
              <SelectItem value="Temporary">Temporary</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
            value === 'Permanent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            value === 'Temporary' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'attendance',
        header: 'ئامادەبوون',
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.attendance || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Present">Present</SelectItem>
              <SelectItem value="Absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
            value === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'address',
        header: 'ناونیشان',
        align: 'center',
        editable: true,
        truncate: 30,
        render: (value) => <span className="text-sm">{value}</span>
      }
    ]

    return (
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
    )
  }

  if (loading) {
    return (
      <PageLayout title="Staff Records" titleKu="تۆمارەکانی ستاف">
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Staff Records" titleKu="تۆمارەکانی ستاف">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search staff records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <DownloadButton 
            data={filteredData}
            filename="staff-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="staff-records"
            title="Staff Records"
            titleKu="تۆمارەکانی ستاف"
            columns={[
              { key: 'fullName', header: 'ناوی تەواو' },
              { key: 'mobile', header: 'مۆبایل' },
              { key: 'department', header: 'بەش' },
              { key: 'gender', header: 'ڕەگەز' },
              { key: 'age', header: 'تەمەن' },
              { key: 'contract', header: 'گرێبەست' },
              { key: 'attendance', header: 'ئامادەبوون' },
              { key: 'address', header: 'ناونیشان' }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                زیادکردنی ستافێکی نوێ
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newEntry.fullName}
                  onChange={(e) => setNewEntry({...newEntry, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={newEntry.mobile}
                  onChange={(e) => setNewEntry({...newEntry, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newEntry.address}
                  onChange={(e) => setNewEntry({...newEntry, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={newEntry.gender} onValueChange={(value) => setNewEntry({...newEntry, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newEntry.dateOfBirth}
                  onChange={(e) => setNewEntry({...newEntry, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="certificate">Certificate</Label>
                <Input
                  id="certificate"
                  value={newEntry.certificate}
                  onChange={(e) => setNewEntry({...newEntry, certificate: e.target.value})}
                  placeholder="Enter certificate"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newEntry.age}
                  onChange={(e) => setNewEntry({...newEntry, age: e.target.value})}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={newEntry.education}
                  onChange={(e) => setNewEntry({...newEntry, education: e.target.value})}
                  placeholder="Enter education"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newEntry.department}
                  onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="contract">Contract Type</Label>
                <Select value={newEntry.contract} onValueChange={(value) => setNewEntry({...newEntry, contract: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="attendance">Attendance</Label>
                <Select value={newEntry.attendance} onValueChange={(value) => setNewEntry({...newEntry, attendance: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => saveEntry(newEntry)}>
                Save Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="mt-6">
        <StaffTableView data={filteredData} />
      </div>
    </PageLayout>
  )
}

export default StaffPage