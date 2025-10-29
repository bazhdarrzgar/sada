'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Mail, Plus, Save, X } from 'lucide-react'
import { EnhancedDatePicker } from '@/components/ui/enhanced-date-picker'
import { CodeMultiSelect } from '@/components/ui/code-multi-select'
import { MonthSelect } from '@/components/ui/month-select'
import { format, addDays, startOfMonth } from 'date-fns'

export function EnhancedCalendarEntry({ 
  legendData = [], 
  onSave, 
  onCancel,
  initialData = null 
}) {
  const [entryData, setEntryData] = useState({
    month: '',
    emailTasks: [], // Array of { date, codes, description }
    // Keep existing week structure for compatibility
    week1: ['', '', '', ''],
    week2: ['', '', '', ''],
    week3: ['', '', '', ''],
    week4: ['', '', '', '']
  })

  const [currentEmailTask, setCurrentEmailTask] = useState({
    date: null,
    codes: [],
    description: ''
  })

  useEffect(() => {
    if (initialData) {
      setEntryData({
        ...initialData,
        emailTasks: initialData.emailTasks || []
      })
    }
  }, [initialData])

  const handleMonthChange = (month) => {
    setEntryData(prev => ({
      ...prev,
      month: month
    }))
  }

  const addEmailTask = () => {
    if (!currentEmailTask.date || currentEmailTask.codes.length === 0) {
      alert('Please select a date and at least one code')
      return
    }

    const newTask = {
      id: Date.now().toString(),
      date: currentEmailTask.date,
      codes: [...currentEmailTask.codes],
      description: currentEmailTask.description || generateTaskDescription(currentEmailTask.codes),
      created_at: new Date().toISOString()
    }

    setEntryData(prev => ({
      ...prev,
      emailTasks: [...prev.emailTasks, newTask]
    }))

    // Reset current task
    setCurrentEmailTask({
      date: null,
      codes: [],
      description: ''
    })
  }

  const removeEmailTask = (taskId) => {
    setEntryData(prev => ({
      ...prev,
      emailTasks: prev.emailTasks.filter(task => task.id !== taskId)
    }))
  }

  const generateTaskDescription = (codes) => {
    const codeDescriptions = codes.map(code => {
      const legend = legendData.find(l => l.abbreviation === code)
      return legend ? legend.full_description : code
    })
    return codeDescriptions.join(', ')
  }

  const handleSave = () => {
    if (!entryData.month) {
      alert('Please select a month')
      return
    }

    // Auto-populate week data from email tasks for compatibility
    const weekData = generateWeekDataFromTasks(entryData.emailTasks)
    
    const finalData = {
      ...entryData,
      ...weekData,
      updated_at: new Date().toISOString()
    }

    onSave(finalData)
  }

  const generateWeekDataFromTasks = (tasks) => {
    const weeks = {
      week1: ['', '', '', ''],
      week2: ['', '', '', ''],
      week3: ['', '', '', ''],
      week4: ['', '', '', '']
    }

    tasks.forEach(task => {
      // Convert task codes to string format for backward compatibility
      const codeString = task.codes.join(', ')
      
      // Determine which week this task belongs to (simplified logic)
      const taskDate = new Date(task.date)
      const dayOfMonth = taskDate.getDate()
      
      let weekIndex, dayIndex
      
      if (dayOfMonth <= 7) {
        weekIndex = 'week1'
      } else if (dayOfMonth <= 14) {
        weekIndex = 'week2'
      } else if (dayOfMonth <= 21) {
        weekIndex = 'week3'
      } else {
        weekIndex = 'week4'
      }

      // Determine day index (0=Sun, 1=Mon, 2=Tue, 3=Wed)
      dayIndex = taskDate.getDay()
      if (dayIndex > 3) dayIndex = 3 // Limit to 4 days as in original system

      weeks[weekIndex][dayIndex] = codeString
    })

    return weeks
  }

  const getSelectedCodesDisplay = (codes) => {
    return codes.map(code => {
      const legend = legendData.find(l => l.abbreviation === code)
      return {
        code,
        description: legend?.full_description || code
      }
    })
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Enhanced Calendar Entry with Email Tasks
          <span className="text-sm font-normal text-muted-foreground">
            / تۆماری ساڵنامەی پێشکەوتوو لەگەڵ ئەرکەکانی ئیمەیڵ
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Month Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="month-select">Month Selection / هەڵبژاردنی مانگ</Label>
            <MonthSelect
              value={entryData.month}
              onChange={handleMonthChange}
              placeholder="Select month..."
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              <p><strong>Current Selection:</strong> {entryData.month || 'None'}</p>
              <p><strong>Email Tasks Count:</strong> {entryData.emailTasks.length}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Email Task Creation */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Add Email Task / زیادکردنی ئەرکی ئیمەیڵ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <Label>Task Date / ڕێکەوتی ئەرک</Label>
              <EnhancedDatePicker
                value={currentEmailTask.date}
                onChange={(date) => setCurrentEmailTask(prev => ({ ...prev, date }))}
                placeholder="Select task date..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Record Type Codes / کۆدەکانی جۆری تۆمار</Label>
              <CodeMultiSelect
                options={legendData}
                value={currentEmailTask.codes}
                onChange={(codes) => setCurrentEmailTask(prev => ({ ...prev, codes }))}
                placeholder="Select codes..."
                className="mt-1"
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={addEmailTask}
                className="w-full"
                disabled={!currentEmailTask.date || currentEmailTask.codes.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Current Task Preview */}
            {currentEmailTask.codes.length > 0 && (
              <div className="col-span-full">
                <Label className="text-sm font-medium">Selected Codes Preview:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getSelectedCodesDisplay(currentEmailTask.codes).map(({ code, description }) => (
                    <Badge key={code} variant="secondary" className="text-xs">
                      <span className="font-mono font-bold">{code}</span>
                      <span className="ml-1">- {description}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Tasks List */}
        {entryData.emailTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Email Tasks ({entryData.emailTasks.length})
            </h3>
            
            <div className="space-y-3">
              {entryData.emailTasks.map((task) => (
                <Card key={task.id} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          📅 {format(new Date(task.date), 'MMM dd, yyyy (EEEE)')}
                        </Badge>
                        <Badge variant="secondary">
                          {task.codes.length} code{task.codes.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Codes:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.codes.map(code => {
                              const legend = legendData.find(l => l.abbreviation === code)
                              return (
                                <Badge key={code} variant="default" className="text-xs font-mono">
                                  {code}
                                  {legend && (
                                    <span className="ml-1 font-normal">- {legend.full_description}</span>
                                  )}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        
                        {task.description && (
                          <div>
                            <Label className="text-xs">Description:</Label>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmailTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!entryData.month}>
            <Save className="h-4 w-4 mr-2" />
            Save Calendar Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}