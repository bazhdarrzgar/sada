'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, ClipboardCheck } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import Fuse from 'fuse.js'

export default function ExamSupervisionPage() {
  const isMobile = useIsMobile()
  const { language } = useLanguage()
  const [supervisionData, setSupervisionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const [newEntry, setNewEntry] = useState({
    subject: '',
    stage: '',
    endTime: '',
    examAchievement: '',
    supervisorName: '',
    obtainedScore: '',
    notes: ''
  })

  const subjects = ['بیرکاری', 'زمانی کوردی', 'زمانی عەرەبی', 'ئینگلیزی', 'کیمیا', 'فیزیا', 'بایۆلۆژی', 'مێژوو', 'جوگرافیا', 'ئایینی']
  const stages = ['پۆلی یەکەم', 'پۆلی دووەم', 'پۆلی سێیەم', 'پۆلی چوارەم', 'پۆلی پێنجەم', 'پۆلی شەشەم', 'پۆلی حەوتەم', 'پۆلی هەشتەم', 'پۆلی نۆیەم']
  const achievements = ['نایاب', 'زۆر باش', 'باش', 'ناوەند', 'لاواز']

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'subject', weight: 0.25 }, // Subject field
        { name: 'stage', weight: 0.2 }, // Stage field
        { name: 'supervisorName', weight: 0.25 }, // Supervisor name
        { name: 'examAchievement', weight: 0.15 }, // Achievement level
        { name: 'endTime', weight: 0.1 }, // End time
        { name: 'obtainedScore', weight: 0.1 }, // Score
        { name: 'notes', weight: 0.2 }, // Notes field
        { name: 'id', weight: 0.05 }, // ID for technical searches
        // Enhanced searchable content combining all fields
        { name: 'searchableContent', weight: 0.2, getFn: (obj) => {
          // Combine all searchable fields into one comprehensive string
          return [
            obj.subject || '',
            obj.stage || '',
            obj.supervisorName || '',
            obj.examAchievement || '',
            obj.endTime || '',
            obj.obtainedScore || '',
            obj.notes || '',
            // Add score categories for enhanced searching
            obj.obtainedScore ? (
              parseInt(obj.obtainedScore.replace(/[^\d]/g, '') || 0) >= 90 ? 'نایاب excellent high' :
              parseInt(obj.obtainedScore.replace(/[^\d]/g, '') || 0) >= 80 ? 'زۆر باش very good' :
              parseInt(obj.obtainedScore.replace(/[^\d]/g, '') || 0) >= 70 ? 'باش good' :
              parseInt(obj.obtainedScore.replace(/[^\d]/g, '') || 0) >= 60 ? 'ناوەند average' : 'لاواز weak poor'
            ) : '',
            // Add Kurdish translations for search enhancement
            subjects.includes(obj.subject) ? obj.subject : '',
            stages.includes(obj.stage) ? obj.stage : ''
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
    return new Fuse(supervisionData, options)
  }, [supervisionData])

  // Fetch exam supervision data from API
  useEffect(() => {
    fetchExamSupervisionData()
  }, [])

  const fetchExamSupervisionData = async () => {
    try {
      const response = await fetch('/api/exam-supervision')
      if (response.ok) {
        const data = await response.json()
        setSupervisionData(data)
      }
    } catch (error) {
      console.error('Error fetching exam supervision data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    setIsSaving(true)
    try {
      let response
      
      if (entry.id && !entry.id.startsWith('exam-supervision-')) {
        // Update existing entry
        response = await fetch(`/api/exam-supervision/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        })
      } else {
        // Create new entry
        const entryToSave = { ...entry }
        if (entryToSave.id && entryToSave.id.startsWith('exam-supervision-')) {
          delete entryToSave.id // Remove temporary ID for new entries
        }
        
        response = await fetch('/api/exam-supervision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryToSave)
        })
      }

      if (response.ok) {
        const savedEntry = await response.json()
        
        // Update local state with the saved data - new/edited entries go to top
        setSupervisionData(prevData => {
          const existingIndex = prevData.findIndex(item => item.id === savedEntry.id)
          if (existingIndex !== -1) {
            // For updates, move the edited entry to the top
            const newData = [...prevData]
            newData.splice(existingIndex, 1) // Remove from current position
            return [savedEntry, ...newData] // Add to top
          } else {
            // For new entries, add to the top
            return [savedEntry, ...prevData]
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
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (id.startsWith('exam-supervision-')) {
        // Remove from local state only if it's a temporary entry
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
        return
      }

      const response = await fetch(`/api/exam-supervision/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSupervisionData(prevData => prevData.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      subject: '',
      stage: '',
      endTime: '',
      examAchievement: '',
      supervisorName: '',
      obtainedScore: '',
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    const updatedData = [...supervisionData]
    updatedData[rowIndex][field] = value
    setSupervisionData(updatedData)
  }

  // Utility function to scroll to center of viewport smoothly and fast
  const scrollToCenter = () => {
    const scrollHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const centerPosition = (scrollHeight - windowHeight) / 2
    
    window.scrollTo({
      top: centerPosition,
      behavior: 'smooth'
    })
  }

  const startEditing = (idOrIndex) => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      // Handle both ID (from table) and index (legacy support)
      let entry
      if (typeof idOrIndex === 'string' && !idOrIndex.match(/^\d+$/)) {
        // It's an ID string (UUID), find the entry by ID
        entry = filteredData.find(item => item.id === idOrIndex)
      } else {
        // It's an index number, use array access
        entry = filteredData[idOrIndex]
      }
      
      console.log('startEditing - idOrIndex:', idOrIndex)
      console.log('startEditing - found entry:', entry)
      console.log('startEditing - entry ID:', entry?.id)
      
      if (entry) {
        setEditingData(entry)
        setIsEditModalOpen(true)
      } else {
        console.error('startEditing - Could not find entry for:', idOrIndex)
      }
    }, 100)
  }

  const saveRowEdit = (rowIndex) => {
    const entry = supervisionData[rowIndex]
    saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    // Refresh data to discard unsaved changes
    fetchExamSupervisionData()
  }

  const handleModalSave = async (editedData) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    await saveEntry(editedData)
    setIsEditModalOpen(false)
    setEditingData(null)
  }



  // Define fields for modal editing
  const editFields = [
    {
      key: 'subject',
      label: t('examSupervision.fields.subject', language),
      labelKu: t('examSupervision.fields.subject', 'kurdish'),
      type: 'select',
      options: subjects.map(subject => ({ value: subject, label: subject })),
      placeholder: 'بابەت هەڵبژێرە'
    },
    {
      key: 'stage',
      label: t('examSupervision.fields.stage', language),
      labelKu: t('examSupervision.fields.stage', 'kurdish'),
      type: 'select',
      options: stages.map(stage => ({ value: stage, label: stage })),
      placeholder: 'پۆل هەڵبژێرە'
    },
    {
      key: 'endTime',
      label: t('examSupervision.fields.endTime', language),
      labelKu: t('examSupervision.fields.endTime', 'kurdish'),
      type: 'text',
      placeholder: 'بۆ نموونە: ١٠:٣٠ ب.ن'
    },
    {
      key: 'examAchievement',
      label: t('examSupervision.fields.examAchievement', language),
      labelKu: t('examSupervision.fields.examAchievement', 'kurdish'),
      type: 'select',
      options: achievements.map(achievement => ({ value: achievement, label: achievement })),
      placeholder: 'ئاستی گەیشتن هەڵبژێرە'
    },
    {
      key: 'supervisorName',
      label: t('examSupervision.fields.supervisorName', language),
      labelKu: t('examSupervision.fields.supervisorName', 'kurdish'),
      type: 'text',
      placeholder: 'ناوی چاودێریکەر بنووسە'
    },
    {
      key: 'obtainedScore',
      label: t('examSupervision.fields.obtainedScore', language),
      labelKu: t('examSupervision.fields.obtainedScore', 'kurdish'),
      type: 'text',
      placeholder: 'بۆ نموونە: ٨٥'
    },
    {
      key: 'notes',
      label: t('examSupervision.fields.notes', language),
      labelKu: t('examSupervision.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی زیادکردن...',
      rows: 3,
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return supervisionData
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, supervisionData])

  // Calculate statistics
  const totalExams = filteredData.length
  const excellentResults = filteredData.filter(entry => entry.examAchievement === 'نایاب' || entry.examAchievement === 'زۆر باش').length
  const averageScore = filteredData.length > 0 ? 
    Math.round(filteredData.reduce((sum, entry) => {
      const score = entry.obtainedScore ? entry.obtainedScore.replace(/[^\d]/g, '') : '0'
      return sum + parseInt(score || 0)
    }, 0) / filteredData.length) : 0

  function SupervisionCardView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((entry, idx) => (
          <Card key={entry.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{entry.subject} - {entry.stage}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">{t('examSupervision.fields.endTime', language)}:</span> {entry.endTime}</div>
                <div><span className="font-semibold">{t('examSupervision.fields.obtainedScore', language)}:</span> {entry.obtainedScore}</div>
                <div><span className="font-semibold">{t('examSupervision.fields.supervisorName', language)}:</span> {entry.supervisorName}</div>
                <div>
                  <span className="font-semibold">{t('examSupervision.fields.examAchievement', language)}:</span> 
                  <span className={`ml-1 font-bold ${
                    entry.examAchievement === 'نایاب' ? 'text-purple-600' :
                    entry.examAchievement === 'زۆر باش' ? 'text-green-600' :
                    entry.examAchievement === 'باش' ? 'text-blue-600' :
                    entry.examAchievement === 'ناوەند' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {entry.examAchievement}
                  </span>
                </div>
              </div>
              {/* Notes section */}
              {entry.notes && (
                <div className="border-t pt-2">
                  <div className="text-sm">
                    <span className="font-semibold">{t('examSupervision.fields.notes', language)}:</span>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">{entry.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => {
                  // Pass entry directly instead of index to ensure correct data
                  scrollToCenter()
                  setTimeout(() => {
                    setEditingData(entry)
                    setIsEditModalOpen(true)
                  }, 100)
                }} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
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

  function SupervisionTableView({ data }) {
    // Define table columns for exam supervision with enhanced translation
    const columns = [
      {
        key: 'subject',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.subject', language)}
            </span></div>
        ),
        align: 'right',
        editable: true,
        truncate: 20,
        editComponent: (row, onChange) => (
          <Select value={row.subject || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'stage',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.stage', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        editComponent: (row, onChange) => (
          <Select value={row.stage || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'endTime',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.endTime', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'examAchievement',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.examAchievement', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        editComponent: (row, onChange) => (
          <Select value={row.examAchievement || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {achievements.map((achievement) => (
                <SelectItem key={achievement} value={achievement}>{achievement}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
        render: (value) => (
          <span className={`font-medium px-2 py-1 rounded text-xs transition-colors duration-200 ${
            value === 'نایاب' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
            value === 'زۆر باش' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            value === 'باش' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
            value === 'ناوەند' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {value}
          </span>
        )
      },
      {
        key: 'supervisorName',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.supervisorName', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 25,
        render: (value) => <span className="font-medium">{value}</span>
      },
      {
        key: 'obtainedScore',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.obtainedScore', language)}
            </span></div>
        ),
        align: 'center',
        editable: true,
        truncate: 15,
        render: (value) => <span className="font-bold text-blue-600 dark:text-blue-400">{value}</span>
      },
      {
        key: 'notes',
        header: (
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold">
              {t('examSupervision.fields.notes', language)}
            </span></div>
        ),
        align: 'right',
        editable: true,
        truncate: 30,
        render: (value) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value || 'هیچ تێبینیەک نییە'}
          </span>
        )
      }
    ]

    return (
      <EnhancedTable
        data={data}
        columns={columns}
        editingRow={null} // Disable inline editing
        onEdit={startEditing}
        onSave={() => {}} // No inline save
        onCancel={() => {}} // No inline cancel
        onDelete={deleteEntry}
        onCellEdit={() => {}} // No inline cell edit
        maxRowsPerPage={10}
        enablePagination={true}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300"
      />
    )
  }

  if (loading) {
    return (
      <PageLayout title={t('examSupervision.title', language)} titleKu={t('examSupervision.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('examSupervision.title', language)} titleKu={t('examSupervision.title', 'kurdish')}>
      {/* Search and Add Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('examSupervision.searchPlaceholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">

          <DownloadButton 
            data={filteredData}
            filename="exam-supervision-records"
            className="bg-green-600 hover:bg-green-700 text-white"
          />
          <PrintButton 
            data={filteredData}
            filename="exam-supervision-records"
            title={t('examSupervision.title', language)}
            titleKu={t('examSupervision.title', 'kurdish')}
            columns={[
              { key: 'subject', header: t('examSupervision.fields.subject', 'kurdish') },
              { key: 'stage', header: t('examSupervision.fields.stage', 'kurdish') },
              { key: 'endTime', header: t('examSupervision.fields.endTime', 'kurdish') },
              { key: 'examAchievement', header: t('examSupervision.fields.examAchievement', 'kurdish') },
              { key: 'supervisorName', header: t('examSupervision.fields.supervisorName', 'kurdish') },
              { key: 'obtainedScore', header: t('examSupervision.fields.obtainedScore', 'kurdish') },
              { key: 'notes', header: t('examSupervision.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <div className="text-right text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-gray-600">{t('examSupervision.stats.total', language)}</p>
                <p className="font-bold text-blue-600">{totalExams}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('examSupervision.stats.excellent', language)}</p>
                <p className="font-bold text-green-600">{excellentResults}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('examSupervision.stats.averageScore', language)}</p>
                <p className="font-bold text-purple-600">{averageScore}</p>
              </div>
            </div>
          </div>
          {/* Handle Add Entry with scroll to center */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button 
              onClick={() => {
                // Scroll to center first
                scrollToCenter()
                
                // Small delay to ensure scroll starts before modal opens
                setTimeout(() => {
                  setIsAddDialogOpen(true)
                }, 100)
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              {t('examSupervision.addButton', language)}
            </Button>
            <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('examSupervision.addTitle', language)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">{t('examSupervision.fields.subject', language)}</Label>
                    <Select value={newEntry.subject} onValueChange={(value) => setNewEntry({...newEntry, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="بابەت هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stage">{t('examSupervision.fields.stage', language)}</Label>
                    <Select value={newEntry.stage} onValueChange={(value) => setNewEntry({...newEntry, stage: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="پۆل هەڵبژێرە" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="endTime">{t('examSupervision.fields.endTime', language)}</Label>
                  <Input
                    id="endTime"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                    placeholder="بۆ نموونە: ١٠:٣٠ ب.ن"
                  />
                </div>
                <div>
                  <Label htmlFor="examAchievement">{t('examSupervision.fields.examAchievement', language)}</Label>
                  <Select value={newEntry.examAchievement} onValueChange={(value) => setNewEntry({...newEntry, examAchievement: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="ئاستی گەیشتن هەڵبژێرە" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievements.map((achievement) => (
                        <SelectItem key={achievement} value={achievement}>{achievement}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supervisorName">{t('examSupervision.fields.supervisorName', language)}</Label>
                  <Input
                    id="supervisorName"
                    value={newEntry.supervisorName}
                    onChange={(e) => setNewEntry({...newEntry, supervisorName: e.target.value})}
                    placeholder="ناوی چاودێریکەر بنووسە"
                  />
                </div>
                <div>
                  <Label htmlFor="obtainedScore">{t('examSupervision.fields.obtainedScore', language)}</Label>
                  <Input
                    id="obtainedScore"
                    value={newEntry.obtainedScore}
                    onChange={(e) => setNewEntry({...newEntry, obtainedScore: e.target.value})}
                    placeholder="بۆ نموونە: ٨٥"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">{t('examSupervision.fields.notes', language)}</Label>
                  <Textarea
                    id="notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    placeholder="تێبینی زیادکردن..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}} disabled={isSaving}>
                    {t('examSupervision.buttons.cancel', language)}
                  </Button>
                  <Button onClick={() => saveEntry(newEntry)} disabled={isSaving}>
                    {isSaving ? 'پاشەکەوتکردن...' : t('examSupervision.buttons.save', language)}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Exam Supervision Table/Cards */}
      <div className="mt-6">
        {isMobile ? (
          <SupervisionCardView data={filteredData} />
        ) : (
          <SupervisionTableView data={filteredData} />
        )}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('examSupervision.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('examSupervision.noData.message', language) : t('examSupervision.noData.emptyMessage', language)}
            </p>
          </div>
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
        title={t('examSupervision.buttons.edit', language)}
        titleKu={t('examSupervision.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />
    </PageLayout>
  )
}