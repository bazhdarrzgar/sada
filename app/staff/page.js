'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, User, FileText, Eye, Image as ImageIcon, Download, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import PageLayout from '@/components/layout/PageLayout'
import { DownloadButton } from '@/components/ui/download-button'
import { PrintButton } from '@/components/ui/print-button'
import { EnhancedTable } from '@/components/ui/enhanced-table'
import { EditModal } from '@/components/ui/edit-modal'
import { CVPreview } from '@/components/ui/cv-preview'
import { CVForm } from '@/components/ui/cv-form'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import ImageUpload from '@/components/ui/image-upload'
import Fuse from 'fuse.js'

export default function StaffPage() {
  const isMobile = useIsMobile()
  const { language } = useLanguage()
  const [staffData, setStaffData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false)
  const [cvFormOpen, setCvFormOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [imageCarouselOpen, setImageCarouselOpen] = useState(false)
  const [carouselImages, setCarouselImages] = useState([])
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0)
  const [newEntry, setNewEntry] = useState({
    fullName: '',
    mobile: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    certificate: '',
    age: '',
    education: '',
    department: '',
    bloodType: '',
    contract: '',
    attendance: '',
    certificateImages: [],
    notes: ''
  })

  // Initialize Fuse.js with comprehensive search options across ALL columns
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'fullName', weight: 0.25 }, // Full name - high priority
        { name: 'department', weight: 0.2 }, // Department
        { name: 'education', weight: 0.15 }, // Education
        { name: 'mobile', weight: 0.12 }, // Mobile number
        { name: 'notes', weight: 0.1 }, // Notes field
        { name: 'address', weight: 0.08 }, // Address
        { name: 'gender', weight: 0.08 }, // Gender
        { name: 'dateOfBirth', weight: 0.05 }, // Birth date
        { name: 'certificate', weight: 0.1 }, // Certificate
        { name: 'age', weight: 0.05 }, // Age
        { name: 'bloodType', weight: 0.08 }, // Blood type
        { name: 'contract', weight: 0.1 }, // Contract type
        { name: 'attendance', weight: 0.08 }, // Attendance status
        { name: 'id', weight: 0.03 }, // ID for technical searches
        // Comprehensive searchable content
        { name: 'searchableContent', weight: 0.15, getFn: (obj) => {
          return [
            // All main fields
            obj.fullName || '',
            obj.department || '',
            obj.education || '',
            obj.mobile || '',
            obj.address || '',
            obj.gender || '',
            obj.dateOfBirth || '',
            obj.certificate || '',
            obj.age ? obj.age.toString() : '',
            obj.bloodType || '',
            obj.contract || '',
            obj.attendance || '',
            obj.notes || '',
            // Add CV data if available
            obj.cv ? JSON.stringify(obj.cv).toLowerCase() : '',
            // Enhanced search terms
            obj.gender === 'Male' ? 'نێر مێرد male' : obj.gender === 'Female' ? 'مێینە ژن female' : '',
            obj.contract === 'Permanent' ? 'هەمیشەیی permanent دائمی' : 
            obj.contract === 'Temporary' ? 'کاتی temporary مؤقت' : 
            obj.contract === 'Contract' ? 'گرێبەست contract عقد' : '',
            obj.attendance === 'Present' ? 'ئامادە present حاضر' : 
            obj.attendance === 'Absent' ? 'غائب absent نەهاتوو' : '',
            // Age categories for better search
            obj.age ? (
              parseInt(obj.age) < 25 ? 'گەنج young صغير' :
              parseInt(obj.age) >= 25 && parseInt(obj.age) < 35 ? 'ناوەند middle متوسط' :
              parseInt(obj.age) >= 35 && parseInt(obj.age) < 50 ? 'گەورە mature كبير' : 
              'زۆر گەورە senior كبير جداً'
            ) : '',
            // Blood type search enhancement
            obj.bloodType ? 'blood خوێن دم' : ''
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
    return new Fuse(staffData, options)
  }, [staffData])

  // Fetch staff data
  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      const data = await response.json()
      setStaffData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      setStaffData([])
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async (entry) => {
    // Prevent multiple submissions
    if (isSaving) return
    
    try {
      setIsSaving(true)
      const method = entry.id ? 'PUT' : 'POST'
      const response = await fetch('/api/staff', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (response.ok) {
        const savedEntry = await response.json()
        
        // Update local state with the saved data - new/edited entries go to top
        setStaffData(prevData => {
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
      }
    } catch (error) {
      console.error('Error saving staff:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/staff?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update local state directly instead of re-fetching
        setStaffData(prevData => prevData.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
    }
  }

  const openImageCarousel = (images, initialIndex = 0) => {
    setCarouselImages(images || [])
    setCarouselInitialIndex(initialIndex)
    setImageCarouselOpen(true)
  }

  const openCvPreview = (staff) => {
    console.log('Opening CV preview for staff:', staff)
    setSelectedStaff(staff)
    if (staff.cv && typeof staff.cv === 'string') {
      try {
        setSelectedStaff({ ...staff, cv: JSON.parse(staff.cv) })
      } catch (e) {
        console.error('Error parsing CV:', e)
      }
    }
    setCvPreviewOpen(true)
  }

  const openCvForm = (staff) => {
    console.log('Opening CV form for staff:', staff)
    setSelectedStaff(staff)
    if (staff.cv && typeof staff.cv === 'string') {
      try {
        setSelectedStaff({ ...staff, cv: JSON.parse(staff.cv) })
      } catch (e) {
        console.error('Error parsing CV:', e)
        setSelectedStaff({ ...staff, cv: null })
      }
    }
    setCvFormOpen(true)
  }

  const closeCvDialogs = () => {
    setCvPreviewOpen(false)
    setCvFormOpen(false)
    setSelectedStaff(null)
  }

  const saveCvData = async (cvData) => {
    if (!selectedStaff) return

    try {
      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedStaff,
          cv: cvData
        }),
      })

      if (response.ok) {
        await fetchStaff()
        setCvFormOpen(false)
        setSelectedStaff(null)
      }
    } catch (error) {
      console.error('Error saving CV data:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      fullName: '',
      mobile: '',
      address: '',
      gender: '',
      dateOfBirth: '',
      certificate: '',
      age: '',
      education: '',
      department: '',
      bloodType: '',
      contract: '',
      attendance: '',
      certificateImages: [],
      notes: ''
    })
  }

  const handleCellEdit = (rowIndex, field, value) => {
    if (!Array.isArray(staffData)) return
    
    const updatedData = [...staffData]
    updatedData[rowIndex][field] = value
    setStaffData(updatedData)
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

  // Handle Add Entry with scroll to center
  const handleAddEntry = () => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      setIsAddDialogOpen(true)
    }, 100)
  }

  const startEditing = (index) => {
    // Scroll to center first
    scrollToCenter()
    
    // Small delay to ensure scroll starts before modal opens
    setTimeout(() => {
      const entry = staffData[index]
      setEditingData(entry)
      setIsEditModalOpen(true)
    }, 100)
  }

  const saveRowEdit = async (rowIndex) => {
    if (!Array.isArray(staffData) || !staffData[rowIndex]) return
    
    const entry = staffData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    fetchStaff() // Reset changes
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
      key: 'fullName',
      label: t('staffRecords.fields.fullName', language),
      labelKu: t('staffRecords.fields.fullName', 'kurdish'),
      type: 'text',
      placeholder: 'Enter full name'
    },
    {
      key: 'mobile',
      label: t('staffRecords.fields.mobile', language),
      labelKu: t('staffRecords.fields.mobile', 'kurdish'),
      type: 'text',
      placeholder: 'Enter mobile number'
    },
    {
      key: 'address',
      label: t('staffRecords.fields.address', language),
      labelKu: t('staffRecords.fields.address', 'kurdish'),
      type: 'text',
      placeholder: 'Enter address',
      span: 'full'
    },
    {
      key: 'gender',
      label: t('staffRecords.fields.gender', language),
      labelKu: t('staffRecords.fields.gender', 'kurdish'),
      type: 'select',
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ]
    },
    {
      key: 'dateOfBirth',
      label: t('staffRecords.fields.dateOfBirth', language),
      labelKu: t('staffRecords.fields.dateOfBirth', 'kurdish'),
      type: 'date'
    },
    {
      key: 'certificate',
      label: t('staffRecords.fields.certificate', language),
      labelKu: t('staffRecords.fields.certificate', 'kurdish'),
      type: 'text',
      placeholder: 'Enter certificate'
    },
    {
      key: 'age',
      label: t('staffRecords.fields.age', language),
      labelKu: t('staffRecords.fields.age', 'kurdish'),
      type: 'number',
      placeholder: 'Enter age'
    },
    {
      key: 'education',
      label: t('staffRecords.fields.education', language),
      labelKu: t('staffRecords.fields.education', 'kurdish'),
      type: 'text',
      placeholder: 'Enter education level'
    },
    {
      key: 'department',
      label: t('staffRecords.fields.department', language),
      labelKu: t('staffRecords.fields.department', 'kurdish'),
      type: 'text',
      placeholder: 'Enter department'
    },
    {
      key: 'bloodType',
      label: t('staffRecords.fields.bloodType', language),
      labelKu: t('staffRecords.fields.bloodType', 'kurdish'),
      type: 'text',
      placeholder: 'A+، B+، O+، AB+، A-، B-، O-، AB-'
    },
    {
      key: 'contract',
      label: t('staffRecords.fields.contract', language),
      labelKu: t('staffRecords.fields.contract', 'kurdish'),
      type: 'select',
      options: [
        { value: 'Permanent', label: 'Permanent' },
        { value: 'Temporary', label: 'Temporary' },
        { value: 'Contract', label: 'Contract' }
      ]
    },
    {
      key: 'attendance',
      label: t('staffRecords.fields.attendance', language),
      labelKu: t('staffRecords.fields.attendance', 'kurdish'),
      type: 'select',
      options: [
        { value: 'Present', label: 'Present' },
        { value: 'Absent', label: 'Absent' }
      ]
    },
    {
      key: 'certificateImages',
      label: language === 'kurdish' ? 'شەهادە' : 'Certificate Images',
      labelKu: 'شەهادە',
      type: 'image-upload',
      span: 'full'
    },
    {
      key: 'notes',
      label: t('staffRecords.fields.notes', language),
      labelKu: t('staffRecords.fields.notes', 'kurdish'),
      type: 'textarea',
      placeholder: 'تێبینی سەبارەت بە ستاف...',
      span: 'full'
    }
  ]

  // Implement fuzzy search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return Array.isArray(staffData) ? staffData : []
    }

    const results = fuse.search(searchTerm)
    return results.map(result => result.item)
  }, [fuse, searchTerm, staffData])

  function StaffTableView({ data }) {
    return (
      <div className="space-y-4">
        {data.map((staff, idx) => (
          <Card key={staff.id} className="p-4 theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 group">
            <div className="space-y-2">
              <div className="font-bold text-lg text-right group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{staff.fullName}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold">{t('staffRecords.fields.mobile', language)}:</span> {staff.mobile}</div>
                <div><span className="font-semibold">{t('staffRecords.fields.department', language)}:</span> {staff.department}</div>
                <div><span className="font-semibold">{t('staffRecords.fields.gender', language)}:</span> {staff.gender}</div>
                <div><span className="font-semibold">{t('staffRecords.fields.age', language)}:</span> {staff.age}</div>
                <div><span className="font-semibold">{t('staffRecords.fields.bloodType', language)}:</span> {staff.bloodType}</div>
                <div><span className="font-semibold">{t('staffRecords.fields.contract', language)}:</span> {staff.contract}</div>
                <div><span className="font-semibold">{t('staffRecords.fields.attendance', language)}:</span> {staff.attendance}</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold">{t('staffRecords.fields.address', language)}:</span> {staff.address}
              </div>
              {staff.dateOfBirth && (
                <div className="text-sm">
                  <span className="font-semibold">{t('staffRecords.fields.dateOfBirth', language)}:</span> {staff.dateOfBirth}
                </div>
              )}
              {staff.certificate && (
                <div className="text-sm">
                  <span className="font-semibold">{t('staffRecords.fields.certificate', language)}:</span> {staff.certificate}
                </div>
              )}
              {staff.education && (
                <div className="text-sm">
                  <span className="font-semibold">{t('staffRecords.fields.education', language)}:</span> {staff.education}
                </div>
              )}
              {staff.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{t('staffRecords.fields.notes', language)}:</span> {staff.notes}
                </div>
              )}
              {staff.certificateImages && staff.certificateImages.length > 0 && (
                <div className="text-sm">
                  <span className="font-semibold">{language === 'kurdish' ? 'شەهادە' : 'Certificate Images'}:</span> 
                  <button 
                    onClick={() => openImageCarousel(staff.certificateImages, 0)}
                    className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >
                    {staff.certificateImages.length} {language === 'kurdish' ? 'وێنە' : 'images'}
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => startEditing(idx)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                  <Edit className="h-4 w-4 mr-1" />
                  {language === 'kurdish' ? 'دەستکاری' : 'Edit'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openCvPreview(staff)} className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200">
                  <Eye className="h-4 w-4 mr-1" />
                  CV
                </Button>
                <Button size="sm" variant="outline" onClick={() => openCvForm(staff)} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
                  <FileText className="h-4 w-4 mr-1" />
                  CV {language === 'kurdish' ? 'دەستکاری' : 'Edit'}
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
      header: t('staffRecords.fields.fullName', language),
      align: 'right',
      editable: true,
      truncate: 25,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'mobile',
      header: t('staffRecords.fields.mobile', language),
      align: 'center',
      editable: true,
      truncate: 15,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'department',
      header: t('staffRecords.fields.department', language),
      align: 'center',
      editable: true,
      truncate: 20,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'gender',
      header: t('staffRecords.fields.gender', language),
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
      header: t('staffRecords.fields.age', language),
      align: 'center',
      editable: true,
      type: 'number',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'bloodType',
      header: t('staffRecords.fields.bloodType', language),
      align: 'center',
      editable: true,
      truncate: 10,
      render: (value) => <span className="font-medium text-red-600 dark:text-red-400">{value}</span>
    },
    {
      key: 'contract',
      header: t('staffRecords.fields.contract', language),
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
      header: t('staffRecords.fields.attendance', language),
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
      header: t('staffRecords.fields.address', language),
      align: 'center',
      editable: true,
      truncate: 30,
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'dateOfBirth',
      header: t('staffRecords.fields.dateOfBirth', language),
      align: 'center',
      editable: true,
      type: 'date',
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'certificate',
      header: t('staffRecords.fields.certificate', language),
      align: 'center',
      editable: true,
      truncate: 20,
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'education',
      header: t('staffRecords.fields.education', language),
      align: 'center',
      editable: true,
      truncate: 20,
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'certificateImages',
      header: language === 'kurdish' ? 'شەهادە' : 'Certificate Images',
      align: 'center',
      editable: false,
      render: (value, entry) => (
        <div className="flex items-center justify-center gap-2">
          {entry.certificateImages && entry.certificateImages.length > 0 ? (
            <button
              onClick={() => openImageCarousel(entry.certificateImages, 0)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="flex -space-x-2">
                {entry.certificateImages.slice(0, 3).map((image, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-gray-800 flex items-center justify-center hover:scale-110 transition-transform">
                    <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                ))}
              </div>
              {entry.certificateImages.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  +{entry.certificateImages.length - 3}
                </span>
              )}
            </button>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-600">No images</span>
          )}
        </div>
      )
    },
    {
      key: 'cv',
      header: 'CV',
      align: 'center',
      editable: false,
      render: (value, entry) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openCvPreview(entry)} className="hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200" title={language === 'kurdish' ? 'بینینی CV' : 'View CV'}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => openCvForm(entry)} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200" title={language === 'kurdish' ? 'دەستکاریکردنی CV' : 'Edit CV'}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )
    },
    {
      key: 'notes',
      header: t('staffRecords.fields.notes', language),
      align: 'center',
      editable: true,
      truncate: 30,
      editComponent: (row, onChange) => (
        <Textarea
          value={row.notes || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full dark:bg-gray-800"
          rows={2}
        />
      ),
      render: (value) => <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
    }
  ]

  if (loading) {
    return (
      <PageLayout title={t('staffRecords.title', language)} titleKu={t('staffRecords.title', 'kurdish')}>
        <div className="flex justify-center py-8">Loading...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title={t('staffRecords.title', language)} titleKu={t('staffRecords.title', 'kurdish')}>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('staffRecords.searchPlaceholder', language)}
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
            title={t('staffRecords.title', language)}
            titleKu={t('staffRecords.title', 'kurdish')}
            columns={[
              { key: 'fullName', header: t('staffRecords.fields.fullName', 'kurdish') },
              { key: 'mobile', header: t('staffRecords.fields.mobile', 'kurdish') },
              { key: 'department', header: t('staffRecords.fields.department', 'kurdish') },
              { key: 'gender', header: t('staffRecords.fields.gender', 'kurdish') },
              { key: 'age', header: t('staffRecords.fields.age', 'kurdish') },
              { key: 'bloodType', header: t('staffRecords.fields.bloodType', 'kurdish') },
              { key: 'contract', header: t('staffRecords.fields.contract', 'kurdish') },
              { key: 'attendance', header: t('staffRecords.fields.attendance', 'kurdish') },
              { key: 'address', header: t('staffRecords.fields.address', 'kurdish') },
              { key: 'dateOfBirth', header: t('staffRecords.fields.dateOfBirth', 'kurdish') },
              { key: 'certificate', header: t('staffRecords.fields.certificate', 'kurdish') },
              { key: 'education', header: t('staffRecords.fields.education', 'kurdish') },
              { key: 'certificateImages', header: 'شەهادە', render: (value) => value && value.length > 0 ? `${value.length} وێنە` : '-' },
              { key: 'cv', header: 'CV', render: (value) => value && value.length > 0 ? `${value.length} وێنە` : '-' },
              { key: 'notes', header: t('staffRecords.fields.notes', 'kurdish') }
            ]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button onClick={handleAddEntry} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t('staffRecords.addButton', language)}
            </Button>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('staffRecords.addTitle', language)}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{t('staffRecords.fields.fullName', language)}</Label>
                <Input
                  id="fullName"
                  value={newEntry.fullName}
                  onChange={(e) => setNewEntry({...newEntry, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="mobile">{t('staffRecords.fields.mobile', language)}</Label>
                <Input
                  id="mobile"
                  value={newEntry.mobile}
                  onChange={(e) => setNewEntry({...newEntry, mobile: e.target.value})}
                  placeholder="Enter mobile number"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">{t('staffRecords.fields.address', language)}</Label>
                <Input
                  id="address"
                  value={newEntry.address}
                  onChange={(e) => setNewEntry({...newEntry, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label htmlFor="gender">{t('staffRecords.fields.gender', language)}</Label>
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
                <Label htmlFor="dateOfBirth">{t('staffRecords.fields.dateOfBirth', language)}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newEntry.dateOfBirth}
                  onChange={(e) => setNewEntry({...newEntry, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="certificate">{t('staffRecords.fields.certificate', language)}</Label>
                <Input
                  id="certificate"
                  value={newEntry.certificate}
                  onChange={(e) => setNewEntry({...newEntry, certificate: e.target.value})}
                  placeholder="Enter certificate"
                />
              </div>
              <div>
                <Label htmlFor="age">{t('staffRecords.fields.age', language)}</Label>
                <Input
                  id="age"
                  type="number"
                  value={newEntry.age}
                  onChange={(e) => setNewEntry({...newEntry, age: e.target.value})}
                  placeholder="Enter age"
                />
              </div>
              <div>
                <Label htmlFor="education">{t('staffRecords.fields.education', language)}</Label>
                <Input
                  id="education"
                  value={newEntry.education}
                  onChange={(e) => setNewEntry({...newEntry, education: e.target.value})}
                  placeholder="Enter education"
                />
              </div>
              <div>
                <Label htmlFor="department">{t('staffRecords.fields.department', language)}</Label>
                <Input
                  id="department"
                  value={newEntry.department}
                  onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                  placeholder="Enter department"
                />
              </div>
              <div>
                <Label htmlFor="bloodType">{t('staffRecords.fields.bloodType', language)}</Label>
                <Input
                  id="bloodType"
                  value={newEntry.bloodType}
                  onChange={(e) => setNewEntry({...newEntry, bloodType: e.target.value})}
                  placeholder="A+، B+، O+، AB+، A-، B-، O-، AB-"
                />
              </div>
              <div>
                <Label htmlFor="contract">{t('staffRecords.fields.contract', language)}</Label>
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
                <Label htmlFor="attendance">{t('staffRecords.fields.attendance', language)}</Label>
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
              <div className="md:col-span-2">
                <Label>{language === 'kurdish' ? 'شەهادە' : 'Certificate Images'}</Label>
                <ImageUpload
                  images={newEntry.certificateImages || []}
                  onImagesChange={(images) => setNewEntry({...newEntry, certificateImages: images})}
                  maxImages={5}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">{t('staffRecords.fields.notes', language)}</Label>
                <Textarea
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                  placeholder="تێبینی سەبارەت بە ستاف..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                {t('staffRecords.buttons.cancel', language)}
              </Button>
              <Button onClick={() => saveEntry(newEntry)} disabled={isSaving}>
                {isSaving ? 'چاوەڕوانبە...' : t('staffRecords.buttons.save', language)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="mt-6">
        {isMobile ? (
          <StaffTableView data={filteredData} />
        ) : (
          <EnhancedTable
            data={filteredData}
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
        )}
      </div>

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
        title={t('staffRecords.buttons.edit', language)}
        titleKu={t('staffRecords.buttons.edit', 'kurdish')}
        isSaving={isSaving}
      />

      {filteredData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('staffRecords.noData.title', language)}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? t('staffRecords.noData.message', language) : t('staffRecords.noData.emptyMessage', language)}
            </p>
          </div>
        </Card>
      )}

      {/* CV Preview Dialog */}
      {cvPreviewOpen && selectedStaff && (
        <CVPreview
          isOpen={cvPreviewOpen}
          onClose={closeCvDialogs}
          teacherData={selectedStaff}
          title={language === 'kurdish' ? 'پێشاندانی CV' : 'CV Preview'}
        />
      )}

      {/* CV Form Dialog */}
      {cvFormOpen && selectedStaff && (
        <CVForm
          isOpen={cvFormOpen}
          onClose={closeCvDialogs}
          teacherData={selectedStaff}
          onSave={saveCvData}
          title={language === 'kurdish' ? 'دەستکاریکردنی CV' : 'Edit CV'}
        />
      )}

      {/* Image Carousel Dialog */}
      {imageCarouselOpen && (
        <ImageCarousel
          images={carouselImages}
          isOpen={imageCarouselOpen}
          onClose={() => setImageCarouselOpen(false)}
          initialIndex={carouselInitialIndex}
        />
      )}
    </PageLayout>
  )
}