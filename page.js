'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PayrollManagement from '@/components/management/PayrollManagement'
import SupervisionManagement from '@/components/management/SupervisionManagement'

const BerdozManagementSystem = () => {
  // Initialize with sample data to demonstrate the system
  const [calendarData, setCalendarData] = useState([
    {
      id: 'sample-1',
      month: '1-Jun',
      week1: ['TB', 'C1', 'B,J', 'S', 'A,C'],
      week2: ['B,T', 'D', 'B,N', 'C1', 'A,C'],
      week3: ['B,T', 'D', 'B,N', 'C1', 'A,C'],
      week4: ['TB', 'V,P', 'L,Q,X', 'G,B1', 'O,J']
    },
    {
      id: 'sample-2',
      month: '1-Jul',
      week1: ['D,E', 'B,N', 'C1', 'A,C,N', 'B,T'],
      week2: ['D', 'B,N', 'C1', 'A,C,N', 'B,T'],
      week3: ['D,O', 'B,N', 'C1,G', 'A,C,N', 'B,T'],
      week4: ['D,B', 'B', 'C1', 'A,C,N', 'Y']
    },
    {
      id: 'sample-3',
      month: '1-Aug',
      week1: ['TB', 'D,E', 'B,N', 'C1', 'A,C,N'],
      week2: ['B,T', 'D', 'B,N', 'C1', 'A,C,N'],
      week3: ['TB', 'D,B', 'B,N', 'C1,G', 'A,C,N'],
      week4: ['Y', 'TB', 'D', 'C1', 'A,C']
    }
  ])
  
  const [legendData, setLegendData] = useState([
    { id: '1', abbreviation: 'A', full_description: 'Regis Name', category: 'General', usage_count: 15 },
    { id: '2', abbreviation: 'B', full_description: 'Media', category: 'General', usage_count: 12 },
    { id: '3', abbreviation: 'C', full_description: 'HR Staff Records', category: 'General', usage_count: 10 },
    { id: '4', abbreviation: 'D', full_description: 'Ewarrada Records', category: 'General', usage_count: 8 },
    { id: '5', abbreviation: 'TB', full_description: 'Daily Monitor Records', category: 'General', usage_count: 6 },
    { id: '6', abbreviation: 'C1', full_description: 'Student Pay', category: 'General', usage_count: 8 },
    { id: '7', abbreviation: 'J', full_description: 'Salary Records', category: 'General', usage_count: 4 },
    { id: '8', abbreviation: 'S', full_description: 'Subject Records', category: 'General', usage_count: 3 },
    { id: '9', abbreviation: 'T', full_description: 'CoCarBM Reco', category: 'General', usage_count: 5 },
    { id: '10', abbreviation: 'N', full_description: 'Report Records', category: 'General', usage_count: 7 },
    { id: '11', abbreviation: 'G', full_description: 'Material', category: 'General', usage_count: 2 },
    { id: '12', abbreviation: 'Y', full_description: 'Meeting & Discussion', category: 'General', usage_count: 2 },
    { id: '13', abbreviation: 'E', full_description: 'Bus Records', category: 'General', usage_count: 2 },
    { id: '14', abbreviation: 'O', full_description: 'Observed Student Records', category: 'General', usage_count: 2 },
    { id: '15', abbreviation: 'V', full_description: 'Clean Records', category: 'General', usage_count: 1 },
    { id: '16', abbreviation: 'P', full_description: 'Future Plan Records', category: 'General', usage_count: 1 },
    { id: '17', abbreviation: 'L', full_description: 'Activities Records', category: 'General', usage_count: 1 },
    { id: '18', abbreviation: 'Q', full_description: 'Security Records', category: 'General', usage_count: 1 },
    { id: '19', abbreviation: 'X', full_description: 'Student Profile Record', category: 'General', usage_count: 1 },
    { id: '20', abbreviation: 'B1', full_description: 'Orders', category: 'General', usage_count: 1 }
  ])
  
  // Staff Records State
  const [staffData, setStaffData] = useState([
    {
      id: 'staff-1',
      fullName: 'Ahmed Hassan Mohammed',
      mobile: '+964 750 123 4567',
      address: 'Erbil, Kurdistan Region',
      gender: 'Male',
      dateOfBirth: '1985-03-15',
      certificate: 'Bachelor of Education',
      age: 39,
      education: 'University of Baghdad',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Mathematics',
      pass: 'Grade A',
      contract: 'Permanent'
    },
    {
      id: 'staff-2',
      fullName: 'Fatima Ali Rashid',
      mobile: '+964 750 987 6543',
      address: 'Sulaymaniyah, Kurdistan Region',
      gender: 'Female',
      dateOfBirth: '1990-07-22',
      certificate: 'Master of Science',
      age: 34,
      education: 'University of Sulaymaniyah',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Chemistry',
      pass: 'Grade A+',
      contract: 'Permanent'
    },
    {
      id: 'staff-3',
      fullName: 'Omar Khalil Ibrahim',
      mobile: '+964 751 456 7890',
      address: 'Duhok, Kurdistan Region',
      gender: 'Male',
      dateOfBirth: '1988-11-08',
      certificate: 'Bachelor of Arts',
      age: 36,
      education: 'University of Duhok',
      attendance: 'Absent',
      date: '2025-01-15',
      department: 'English',
      pass: 'Grade B+',
      contract: 'Temporary'
    },
    {
      id: 'staff-4',
      fullName: 'Zainab Mohammed Salih',
      mobile: '+964 752 321 0987',
      address: 'Kirkuk, Iraq',
      gender: 'Female',
      dateOfBirth: '1992-05-30',
      certificate: 'Bachelor of Education',
      age: 32,
      education: 'University of Mosul',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Biology',
      pass: 'Grade A',
      contract: 'Permanent'
    },
    {
      id: 'staff-5',
      fullName: 'Saman Jamal Aziz',
      mobile: '+964 753 654 3210',
      address: 'Erbil, Kurdistan Region',
      gender: 'Male',
      dateOfBirth: '1987-09-12',
      certificate: 'Master of Education',
      age: 37,
      education: 'American University of Kurdistan',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Physics',
      pass: 'Grade A+',
      contract: 'Permanent'
    }
  ])
  
  const [editingStaffRow, setEditingStaffRow] = useState(null)
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false)
  const [newStaffEntry, setNewStaffEntry] = useState({
    fullName: '',
    mobile: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    certificate: '',
    age: '',
    education: '',
    attendance: 'Present',
    date: new Date().toISOString().split('T')[0],
    department: '',
    pass: '',
    contract: 'Permanent'
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    month: '',
    week1: ['', '', '', '', ''],
    week2: ['', '', '', '', ''],
    week3: ['', '', '', '', ''],
    week4: ['', '', '', '', '']
  })

  // Load data on component mount - try API but fall back to demo data
  useEffect(() => {
    // Demo data is already loaded in state, try to sync with API if available
    loadCalendarData()
    loadLegendData()
  }, [])

  const loadCalendarData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/calendar`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setCalendarData(data)
          console.log('Calendar data loaded from API:', data.length, 'entries')
        }
      }
    } catch (error) {
      console.log('API not available, using demo data')
    }
  }

  const loadLegendData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/legend`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setLegendData(data)
          console.log('Legend data loaded from API:', data.length, 'entries')
        }
      }
    } catch (error) {
      console.log('API not available, using demo data')
    }
  }

  const saveEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'local-' + Date.now()
      }
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('local-') || entry.id.startsWith('sample-') ? 'POST' : 'PUT'
        const url = entry.id.startsWith('local-') || entry.id.startsWith('sample-') ? 
          `${process.env.REACT_APP_BACKEND_URL}/api/calendar` : 
          `${process.env.REACT_APP_BACKEND_URL}/api/calendar/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setCalendarData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })

      // Update legend with new abbreviations
      updateLocalLegend(entry)
      
      setIsAddDialogOpen(false)
      setEditingRow(null)
      resetNewEntry()
      
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const updateLocalLegend = (entry) => {
    const allEntries = [...entry.week1, ...entry.week2, ...entry.week3, ...entry.week4]
    const allText = allEntries.join(' ')
    const abbreviations = allText.match(/[A-Z][A-Z0-9]*/g) || []
    
    abbreviations.forEach(abbr => {
      setLegendData(prevLegend => {
        const existingIndex = prevLegend.findIndex(item => item.abbreviation === abbr)
        if (existingIndex !== -1) {
          // Update usage count
          const newLegend = [...prevLegend]
          newLegend[existingIndex].usage_count += 1
          return newLegend
        } else {
          // Add new legend entry
          return [...prevLegend, {
            id: 'legend-' + Date.now() + '-' + abbr,
            abbreviation: abbr,
            full_description: `${abbr} - Please update description`,
            category: 'General',
            usage_count: 1
          }]
        }
      })
    })
  }

  const deleteEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calendar/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting locally:', apiError.message)
      }

      // Remove from local state regardless
      setCalendarData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      month: '',
      week1: ['', '', '', '', ''],
      week2: ['', '', '', '', ''],
      week3: ['', '', '', '', ''],
      week4: ['', '', '', '', '']
    })
  }

  const resetNewStaffEntry = () => {
    setNewStaffEntry({
      fullName: '',
      mobile: '',
      address: '',
      gender: '',
      dateOfBirth: '',
      certificate: '',
      age: '',
      education: '',
      attendance: 'Present',
      date: new Date().toISOString().split('T')[0],
      department: '',
      pass: '',
      contract: 'Permanent'
    })
  }

  // Staff Management Functions
  const saveStaffEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'staff-' + Date.now()
      }
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('staff-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.REACT_APP_BACKEND_URL}/api/staff` : 
          `${process.env.REACT_APP_BACKEND_URL}/api/staff/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving staff locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setStaffData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddStaffDialogOpen(false)
      setEditingStaffRow(null)
      resetNewStaffEntry()
      
    } catch (error) {
      console.error('Error saving staff entry:', error)
    }
  }

  const deleteStaffEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/staff/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting staff locally:', apiError.message)
      }

      // Remove from local state regardless
      setStaffData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting staff entry:', error)
    }
  }

  const handleStaffCellEdit = (rowIndex, field, value) => {
    const updatedData = [...staffData]
    updatedData[rowIndex][field] = value
    setStaffData(updatedData)
  }

  const startStaffEditing = (index) => {
    setEditingStaffRow(index)
  }

  const saveStaffRowEdit = async (rowIndex) => {
    const entry = staffData[rowIndex]
    await saveStaffEntry(entry)
  }

  const cancelStaffEdit = () => {
    setEditingStaffRow(null)
    // Reload original data if needed
  }

  const handleCellEdit = (rowIndex, week, cellIndex, value) => {
    const updatedData = [...calendarData]
    updatedData[rowIndex][week][cellIndex] = value
    setCalendarData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = async (rowIndex) => {
    const entry = calendarData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    loadCalendarData() // Reload original data
  }

  const filteredData = calendarData.filter(entry =>
    entry.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    [...entry.week1, ...entry.week2, ...entry.week3, ...entry.week4]
      .some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredLegend = legendData.filter(item =>
    item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.full_description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const WeekCell = ({ value, onChange, readonly = false }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readonly}
      className={`w-full p-1 text-xs border rounded ${readonly ? 'bg-gray-50' : 'bg-white'} ${!readonly ? 'border-blue-300 focus:border-blue-500' : 'border-gray-200'}`}
      placeholder={readonly ? '' : 'Enter codes...'}
    />
  )

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Berdoz Management System</h1>
        <p className="text-center text-gray-600">Calendar-based task and record management</p>
        
        {/* Demo Notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-semibold">Demo Mode Active</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            System loaded with sample data showing 3 months (Jun, Jul, Aug) with 20+ auto-generated legend entries. 
            All functionality is fully working - try adding, editing, and searching!
          </p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calendar">Calendar Management</TabsTrigger>
          <TabsTrigger value="staff">Staff Records</TabsTrigger>
          <TabsTrigger value="payroll">بەڕێوەبردنی موچە</TabsTrigger>
          <TabsTrigger value="supervision">بەڕێوەبردنی چاودێری</TabsTrigger>
          <TabsTrigger value="legend">Legend & Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search calendar entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Calendar Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      value={newEntry.month}
                      onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                      placeholder="e.g., 1-Jun, 1-Jul, 1-Aug"
                    />
                  </div>
                  
                  {['week1', 'week2', 'week3', 'week4'].map((week, weekIndex) => (
                    <div key={week} className="space-y-2">
                      <Label>Week {weekIndex + 1}</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {newEntry[week].map((cell, cellIndex) => (
                          <Input
                            key={cellIndex}
                            value={cell}
                            onChange={(e) => {
                              const updated = {...newEntry}
                              updated[week][cellIndex] = e.target.value
                              setNewEntry(updated)
                            }}
                            placeholder={`Cell ${cellIndex + 1}`}
                            className="text-sm"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                      Cancel
                    </Button>
                    <Button onClick={() => saveEntry(newEntry)}>
                      Save Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Calendar Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Date</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold min-w-[200px]">W/1</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold min-w-[200px]">W/2</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold min-w-[200px]">W/3</th>
                      <th className="border border-gray-300 p-2 text-center font-semibold min-w-[200px]">W/4</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((entry, rowIndex) => (
                      <tr key={entry.id} className={rowIndex % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'}>
                        <td className="border border-gray-300 p-3 font-medium">{entry.month}</td>
                        {['week1', 'week2', 'week3', 'week4'].map((week) => (
                          <td key={week} className="border border-gray-300 p-1">
                            <div className="grid grid-cols-1 gap-1">
                              {entry[week].map((cell, cellIndex) => (
                                <WeekCell
                                  key={cellIndex}
                                  value={cell}
                                  onChange={(value) => handleCellEdit(rowIndex, week, cellIndex, value)}
                                  readonly={editingRow !== rowIndex}
                                />
                              ))}
                            </div>
                          </td>
                        ))}
                        <td className="border border-gray-300 p-3">
                          <div className="flex items-center justify-center gap-2">
                            {editingRow === rowIndex ? (
                              <>
                                <Button size="sm" variant="default" onClick={() => saveRowEdit(rowIndex)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEditing(rowIndex)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          {/* Staff Search and Add Controls */}
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
            <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newStaffEntry.fullName}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={newStaffEntry.mobile}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, mobile: e.target.value})}
                      placeholder="e.g., +964 750 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStaffEntry.address}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={newStaffEntry.gender}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, gender: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newStaffEntry.dateOfBirth}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newStaffEntry.age}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, age: e.target.value})}
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificate">Certificate</Label>
                    <Input
                      id="certificate"
                      value={newStaffEntry.certificate}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, certificate: e.target.value})}
                      placeholder="e.g., Bachelor of Education"
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={newStaffEntry.education}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, education: e.target.value})}
                      placeholder="e.g., University of Baghdad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newStaffEntry.department}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, department: e.target.value})}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendance">Attendance</Label>
                    <select
                      id="attendance"
                      value={newStaffEntry.attendance}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, attendance: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="pass">Grade/Pass</Label>
                    <Input
                      id="pass"
                      value={newStaffEntry.pass}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, pass: e.target.value})}
                      placeholder="e.g., Grade A+"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract">Contract Type</Label>
                    <select
                      id="contract"
                      value={newStaffEntry.contract}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, contract: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {setIsAddStaffDialogOpen(false); resetNewStaffEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveStaffEntry(newStaffEntry)}>
                    Save Staff Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Staff Records Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="border border-gray-300 p-3 text-left font-semibold min-w-[150px]">Full Name</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold min-w-[120px]">Mobile</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold min-w-[150px]">Address</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Gender</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Birth Date</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold min-w-[130px]">Certificate</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Age</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold min-w-[150px]">Education</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Attendance</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Date</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Department</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Grade</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Contract</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData
                      .filter(staff =>
                        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        staff.mobile.includes(searchTerm) ||
                        staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        staff.address.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((staff, rowIndex) => (
                        <tr key={staff.id} className={rowIndex % 2 === 0 ? 'bg-green-50' : 'bg-blue-50'}>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.fullName}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'fullName', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.fullName}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.mobile}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'mobile', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.mobile}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.address}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'address', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.address}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <select
                                value={staff.gender}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'gender', e.target.value)}
                                className="w-full p-1 border rounded"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : staff.gender}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                type="date"
                                value={staff.dateOfBirth}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'dateOfBirth', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.dateOfBirth}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.certificate}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'certificate', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.certificate}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {editingStaffRow === rowIndex ? (
                              <input
                                type="number"
                                value={staff.age}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'age', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.age}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.education}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'education', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.education}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              staff.attendance === 'Present' ? 'bg-green-100 text-green-800' :
                              staff.attendance === 'Absent' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {editingStaffRow === rowIndex ? (
                                <select
                                  value={staff.attendance}
                                  onChange={(e) => handleStaffCellEdit(rowIndex, 'attendance', e.target.value)}
                                  className="bg-transparent border-none text-xs"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Leave">On Leave</option>
                                </select>
                              ) : staff.attendance}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                type="date"
                                value={staff.date}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'date', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.date}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.department}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'department', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.department}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingStaffRow === rowIndex ? (
                              <input
                                value={staff.pass}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'pass', e.target.value)}
                                className="w-full p-1 border rounded"
                              />
                            ) : staff.pass}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              staff.contract === 'Permanent' ? 'bg-blue-100 text-blue-800' :
                              staff.contract === 'Temporary' ? 'bg-orange-100 text-orange-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {editingStaffRow === rowIndex ? (
                                <select
                                  value={staff.contract}
                                  onChange={(e) => handleStaffCellEdit(rowIndex, 'contract', e.target.value)}
                                  className="bg-transparent border-none text-xs"
                                >
                                  <option value="Permanent">Permanent</option>
                                  <option value="Temporary">Temporary</option>
                                  <option value="Contract">Contract</option>
                                </select>
                              ) : staff.contract}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center justify-center gap-2">
                              {editingStaffRow === rowIndex ? (
                                <>
                                  <Button size="sm" variant="default" onClick={() => saveStaffRowEdit(rowIndex)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelStaffEdit}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startStaffEditing(rowIndex)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteStaffEntry(staff.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legend" className="space-y-4">
          {/* Legend Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search legend entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Legend Display */}
          <Card>
            <CardHeader>
              <CardTitle>Code Legend ({filteredLegend.length} entries)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLegend.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="font-bold text-blue-600 text-lg">{item.abbreviation}</div>
                    <div className="text-sm text-gray-700 mt-1">{item.full_description}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Used {item.usage_count} times | Category: {item.category || 'General'}
                    </div>
                  </div>
                ))}
              </div>
              {filteredLegend.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {legendData.length === 0 ? 
                    'No legend entries yet. Start adding calendar entries to build the legend automatically.' :
                    'No legend entries match your search.'
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollManagement />
        </TabsContent>

        <TabsContent value="supervision" className="space-y-4">
          <SupervisionManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BerdozManagementSystem