'use client'

import { useState, useEffect } from 'react'
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
  titleKu = "دەستکاریکردنی تۆمار"
}) => {
  const [editData, setEditData] = useState({})

  useEffect(() => {
    if (isOpen && data) {
      setEditData({ ...data })
    }
  }, [isOpen, data])

  const handleFieldChange = (fieldKey, value) => {
    setEditData(prev => ({
      ...prev,
      [fieldKey]: value
    }))
  }

  const handleSave = () => {
    onSave(editData)
    onClose()
  }

  const handleCancel = () => {
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
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-6xl max-h-[95vh] overflow-y-auto z-[100] w-[96vw] sm:w-[90vw]">
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
              variant="outline" 
              onClick={handleCancel}
              className="px-6"
            >
              <X className="h-4 w-4 mr-2" />
              پاشگەزبوونەوە / Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              پاشەکەوتکردن / Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}