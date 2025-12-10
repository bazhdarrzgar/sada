'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'
import ImageUpload from '@/components/ui/image-upload'
import ActivityImageUpload from '@/components/ui/activity-image-upload'
import LicenseImageUpload from '@/components/ui/license-image-upload'
import VideoUpload from '@/components/ui/video-upload'

export const EditModal = ({ 
  isOpen, 
  onClose, 
  data, 
  fields, 
  onSave, 
  title = "Edit Record",
  titleKu = "دەستکاریکردنی تۆمار",
  onFieldChange, // Optional callback for custom field change logic
  isSaving = false // Loading state for save button
}) => {
  const [editData, setEditData] = useState({})
  const isSavingRef = useRef(false) // Immediate lock to prevent race conditions

  useEffect(() => {
    if (isOpen && data) {
      console.log('=== EditModal useEffect triggered ===')
      console.log('Received data:', data)
      console.log('Data ID:', data?.id, 'Type:', typeof data?.id)
      
      // Create a shallow copy first to preserve all properties
      const copiedData = { ...data }
      
      // CRITICAL: Double-check ID preservation
      if (data.id) {
        copiedData.id = data.id
        console.log('✓ ID explicitly preserved:', copiedData.id)
      } else {
        console.error('✗ CRITICAL WARNING: No ID in received data!')
        console.error('✗ Data received:', data)
      }
      
      console.log('EditModal setting editData:', copiedData)
      console.log('EditModal editData ID:', copiedData.id, 'Type:', typeof copiedData.id)
      setEditData(copiedData)
    } else if (!isOpen) {
      // Clear data when modal closes
      console.log('EditModal closing - clearing editData')
      setEditData({})
    }
  }, [isOpen, data])

  const handleFieldChange = (fieldKey, value) => {
    setEditData(prev => {
      const newData = {
        ...prev,
        [fieldKey]: value
      }
      
      // If onFieldChange callback is provided, use it to compute any derived values
      if (onFieldChange) {
        return onFieldChange(newData, fieldKey, value)
      }
      
      return newData
    })
  }

  const handleSave = () => {
    if (isSaving || isSavingRef.current) {
      console.log('Save already in progress, ignoring duplicate click')
      return // Prevent multiple clicks with both ref and state
    }
    
    isSavingRef.current = true
    
    console.log('=== EditModal handleSave ===')
    console.log('editData:', editData)
    console.log('editData ID:', editData?.id, 'Type:', typeof editData?.id)
    console.log('original data:', data)
    console.log('original data ID:', data?.id, 'Type:', typeof data?.id)
    
    // CRITICAL: Preserve ID from original data as primary source of truth
    // This ensures we never lose the ID even if editData loses it somehow
    const dataToSave = {
      ...editData,
      // Explicitly preserve id - use original data ID as primary source
      id: data?.id || editData?.id,
      // Preserve system fields
      ...(data?.created_at && { created_at: data.created_at }),
      ...(data?.updated_at && { updated_at: data.updated_at })
    }
    
    console.log('dataToSave:', dataToSave)
    console.log('dataToSave ID:', dataToSave.id, 'Type:', typeof dataToSave.id)
    
    // Final validation
    if (!dataToSave.id) {
      console.error('✗✗✗ CRITICAL ERROR IN MODAL: No ID in data to save! ✗✗✗')
      console.error('editData:', editData)
      console.error('original data:', data)
      alert('خەتای گرنگ: ناسنامەی تۆمار ون بووە / Critical error: Missing record ID. Please close and try editing again.')
      isSavingRef.current = false
      return
    }
    
    console.log('✓ Sending data to parent onSave with ID:', dataToSave.id)
    onSave(dataToSave)
    
    // Reset ref after a delay to allow parent to handle save
    setTimeout(() => {
      isSavingRef.current = false
    }, 1000)
  }

  const handleCancel = () => {
    if (isSaving || isSavingRef.current) return // Prevent closing during save
    setEditData({})
    onClose()
  }

  const renderField = (field) => {
    const value = editData[field.key] || ''

    switch (field.type) {
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleFieldChange(field.key, val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent modal={true}>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className="w-full"
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
            readOnly={field.readOnly}
            disabled={field.readOnly}
          />
        )

      case 'image-upload':
        // Use ActivityImageUpload for activity images, regular ImageUpload for others
        if (field.key === 'activityImages') {
          return (
            <ActivityImageUpload
              images={editData[field.key] || []}
              onImagesChange={(images) => handleFieldChange(field.key, images)}
              maxImages={5}
              className="mt-2"
            />
          )
        } else {
          return (
            <ImageUpload
              images={editData[field.key] || []}
              onImagesChange={(images) => handleFieldChange(field.key, images)}
              maxImages={field.maxImages || 6}
              className="mt-2"
            />
          )
        }

      case 'license-image-upload':
        return (
          <LicenseImageUpload
            image={editData[field.key] || null}
            onImageChange={(imageData) => handleFieldChange(field.key, imageData)}
            placeholder={field.placeholder || "Upload License Image"}
            className="mt-2"
          />
        )

      case 'video-upload':
        return (
          <VideoUpload
            videos={editData[field.key] || []}
            onVideosChange={(videos) => handleFieldChange(field.key, videos)}
            maxVideos={3}
            placeholder={field.placeholder || "Upload Videos"}
            className="mt-2"
          />
        )

      case 'week-array':
        // Special handling for calendar week arrays
        const weekData = editData[field.key] || ['', '', '', '']
        return (
          <div className="grid grid-cols-4 gap-2">
            {weekData.map((cell, cellIndex) => (
              <Input
                key={cellIndex}
                value={cell}
                onChange={(e) => {
                  const newWeekData = [...weekData]
                  newWeekData[cellIndex] = e.target.value
                  handleFieldChange(field.key, newWeekData)
                }}
                placeholder={`Day ${cellIndex + 1}`}
                className="text-sm"
              />
            ))}
          </div>
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto z-[100] w-[96vw] sm:w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {title} / {titleKu}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div 
                key={field.key} 
                className={
                  field.span === 'full' || field.type === 'image-upload' || field.type === 'video-upload' || field.type === 'license-image-upload'
                    ? 'md:col-span-2' 
                    : ''
                }
              >
                <Label htmlFor={field.key} className="text-sm font-medium block mb-2">
                  {field.label} {field.labelKu && `/ ${field.labelKu}`}
                </Label>
                <div className={field.type === 'image-upload' ? 'min-h-[200px]' : ''}>
                  {renderField(field)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900 z-10">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleCancel}
              className={`px-6 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              پاشگەزبوونەوە / Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSave}
              className={`px-6 bg-blue-600 hover:bg-blue-700 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'پاشەکەوتکردن... / Saving...' : 'پاشەکەوتکردن / Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}