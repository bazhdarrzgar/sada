'use client'

import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, Users, Eye, Zap, FileText, Sparkles } from 'lucide-react'

function TableDemo() {
  const [editingRow, setEditingRow] = useState(null)
  
  // Sample data with long text to demonstrate truncation
  const sampleData = [
    {
      id: 1,
      name: 'أحمد محمد عبدالله العراقي الكوردستاني',
      position: 'Senior Software Engineer and Full Stack Developer',
      department: 'Information Technology and Computer Science Department',
      salary: 1250000,
      status: 'Active',
      description: 'This is a very long description that should be truncated to demonstrate the text truncation feature with tooltip functionality in our enhanced table component. It contains more than 50 characters to show how the truncation works.',
      joinDate: '2020-03-15'
    },
    {
      id: 2,
      name: 'فاطمة علي حسن الكوردية',
      position: 'Project Manager and Team Lead',
      department: 'Human Resources and Administrative Affairs',
      salary: 980000,
      status: 'Active',
      description: 'Another long description that demonstrates how our table handles lengthy text content with proper truncation and tooltip display functionality.',
      joinDate: '2019-08-22'
    },
    {
      id: 3,
      name: 'محمد أمين صالح البغدادي',
      position: 'Database Administrator',
      department: 'Data Management and Analytics Division',
      salary: 850000,
      status: 'On Leave',
      description: 'Extended text content showing truncation capabilities.',
      joinDate: '2021-01-10'
    },
    {
      id: 4,
      name: 'زينب كريم احمد الاربيلية',
      position: 'UX/UI Designer and Creative Director',
      department: 'Design and User Experience Team',
      salary: 720000,
      status: 'Active',
      description: 'Very detailed job description that exceeds normal length to test our truncation system.',
      joinDate: '2021-11-05'
    },
    {
      id: 5,
      name: 'علي حسين محمد السليماني',
      position: 'DevOps Engineer and System Administrator',
      department: 'Infrastructure and Cloud Services',
      salary: 950000,
      status: 'Active',
      description: 'Comprehensive role description with technical details.',
      joinDate: '2020-09-18'
    },
    // Adding more rows to demonstrate pagination
    ...Array.from({ length: 20 }, (_, i) => ({
      id: i + 6,
      name: `Employee ${i + 6} with Very Long Name`,
      position: `Position ${i + 6} with Extended Title`,
      department: `Department ${i + 6} with Long Description`,
      salary: Math.floor(Math.random() * 1000000) + 500000,
      status: ['Active', 'On Leave', 'Inactive'][Math.floor(Math.random() * 3)],
      description: `This is a sample description for employee ${i + 6} with additional details that should be truncated in the table view but visible in tooltip.`,
      joinDate: `202${Math.floor(Math.random() * 4)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
    }))
  ]
  
  const [data, setData] = useState(sampleData)
  
  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...data]
    updatedData[rowIndex][field] = value
    setData(updatedData)
  }
  
  const startEditing = (index) => {
    setEditingRow(index)
  }
  
  const saveRowEdit = (rowIndex) => {
    setEditingRow(null)
    console.log('Saved row:', data[rowIndex])
  }
  
  const cancelEdit = () => {
    setEditingRow(null)
  }
  
  const deleteEntry = (id) => {
    setData(prev => prev.filter(item => item.id !== id))
  }
  
  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'الاسم الكامل',
      align: 'right',
      editable: true,
      truncate: 25,
      render: (value) => <span className="font-medium text-blue-900 dark:text-blue-100">{value}</span>
    },
    {
      key: 'position',
      header: 'المنصب',
      align: 'center',
      editable: true,
      truncate: 30,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'department',
      header: 'القسم',
      align: 'center',
      editable: true,
      truncate: 35,
      render: (value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
    },
    {
      key: 'salary',
      header: 'الراتب',
      align: 'center',
      editable: true,
      type: 'number',
      render: (value) => <span className="font-bold text-green-600 dark:text-green-400">{parseInt(value).toLocaleString()} د.ع</span>
    },
    {
      key: 'status',
      header: 'الحالة',
      align: 'center',
      editable: false,
      render: (value) => (
        <Badge className={`
          ${value === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            value === 'On Leave' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
          transition-colors duration-200
        `}>
          {value}
        </Badge>
      )
    },
    {
      key: 'description',
      header: 'الوصف',
      align: 'center',
      editable: true,
      truncate: 40,
      render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
    },
    {
      key: 'joinDate',
      header: 'تاريخ الانضمام',
      align: 'center',
      editable: true,
      type: 'date',
      render: (value) => <span className="text-sm font-mono">{value}</span>
    }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 transition-all duration-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full shadow-lg">
              <Table className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
              Enhanced Table Features Demo
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Showcase of pagination, text truncation, and enhanced dark/light mode styling
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle className="text-sm font-bold">Smart Pagination</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Automatic pagination with customizable page sizes
              </p>
            </CardContent>
          </Card>

          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-500 group">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle className="text-sm font-bold">Text Truncation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Long text with tooltips for full content
              </p>
            </CardContent>
          </Card>

          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 dark:hover:border-green-500 group">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle className="text-sm font-bold">Dark Mode</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Seamless dark/light theme transitions
              </p>
            </CardContent>
          </Card>

          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300 dark:hover:border-orange-500 group">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <CardTitle className="text-sm font-bold">Hover Effects</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Beautiful animations and interactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">
                Employee Management Table
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {data.length} employees
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
              className="shadow-none border-0"
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 text-blue-900 dark:text-blue-100">
              🎯 How to Test the Features:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">📄 Pagination:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Use page numbers at the bottom</li>
                  <li>• Change "Show X entries" dropdown</li>
                  <li>• Navigate with arrow buttons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">✂️ Text Truncation:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Hover over truncated text (with ...)</li>
                  <li>• Full content shows in tooltip</li>
                  <li>• Configurable character limits</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">🎨 Theme Toggle:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Click theme button (top right)</li>
                  <li>• Cycles: Light → Dark → System</li>
                  <li>• Watch smooth transitions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">✏️ Inline Editing:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Click edit button (pencil icon)</li>
                  <li>• Modify fields inline</li>
                  <li>• Save or cancel changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300 flex items-center justify-center gap-2">
            Enhanced table system for 
            <span className="font-semibold text-blue-600 dark:text-blue-400">Berdoz Management System</span>
            <span className="text-red-500 dark:text-red-400 animate-pulse text-lg">❤️</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TableDemoPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TableDemo />
    </ThemeProvider>
  )
}