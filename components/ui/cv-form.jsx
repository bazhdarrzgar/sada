'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

export function CVForm({ isOpen, onClose, teacherData, onSave }) {
  const [cvData, setCvData] = useState({
    field: '',
    phone: '',
    location: '',
    email: '',
    aboutMe: '',
    education: [{
      startYear: '',
      endYear: '',
      institution: '',
      degree: '',
      details: ['']
    }],
    experience: [{
      startYear: '',
      endYear: '',
      company: '',
      position: '',
      responsibilities: ['']
    }],
    skills: [''],
    languages: [{
      language: '',
      level: '',
      details: ''
    }]
  })

  useEffect(() => {
    if (teacherData && teacherData.cv) {
      setCvData({
        field: teacherData.cv.field || '',
        phone: teacherData.cv.phone || '',
        location: teacherData.cv.location || '',
        email: teacherData.cv.email || '',
        aboutMe: teacherData.cv.aboutMe || '',
        education: teacherData.cv.education && teacherData.cv.education.length > 0 
          ? teacherData.cv.education 
          : [{
              startYear: '',
              endYear: '',
              institution: '',
              degree: '',
              details: ['']
            }],
        experience: teacherData.cv.experience && teacherData.cv.experience.length > 0
          ? teacherData.cv.experience
          : [{
              startYear: '',
              endYear: '',
              company: '',
              position: '',
              responsibilities: ['']
            }],
        skills: teacherData.cv.skills && teacherData.cv.skills.length > 0
          ? teacherData.cv.skills
          : [''],
        languages: teacherData.cv.languages && teacherData.cv.languages.length > 0
          ? teacherData.cv.languages
          : [{
              language: '',
              level: '',
              details: ''
            }]
      })
    }
  }, [teacherData])

  const handleSubmit = async () => {
    // Clean up empty entries
    const cleanedData = {
      ...cvData,
      education: cvData.education.filter(edu => edu.degree || edu.institution),
      experience: cvData.experience.filter(exp => exp.position || exp.company),
      skills: cvData.skills.filter(skill => skill.trim()),
      languages: cvData.languages.filter(lang => lang.language)
    }

    await onSave(cleanedData)
    onClose()
  }

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [...cvData.education, {
        startYear: '',
        endYear: '',
        institution: '',
        degree: '',
        details: ['']
      }]
    })
  }

  const removeEducation = (index) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index)
    })
  }

  const updateEducation = (index, field, value) => {
    const updated = [...cvData.education]
    updated[index][field] = value
    setCvData({ ...cvData, education: updated })
  }

  const addEducationDetail = (eduIndex) => {
    const updated = [...cvData.education]
    updated[eduIndex].details.push('')
    setCvData({ ...cvData, education: updated })
  }

  const updateEducationDetail = (eduIndex, detailIndex, value) => {
    const updated = [...cvData.education]
    updated[eduIndex].details[detailIndex] = value
    setCvData({ ...cvData, education: updated })
  }

  const removeEducationDetail = (eduIndex, detailIndex) => {
    const updated = [...cvData.education]
    updated[eduIndex].details = updated[eduIndex].details.filter((_, i) => i !== detailIndex)
    setCvData({ ...cvData, education: updated })
  }

  // Similar functions for experience
  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [...cvData.experience, {
        startYear: '',
        endYear: '',
        company: '',
        position: '',
        responsibilities: ['']
      }]
    })
  }

  const removeExperience = (index) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((_, i) => i !== index)
    })
  }

  const updateExperience = (index, field, value) => {
    const updated = [...cvData.experience]
    updated[index][field] = value
    setCvData({ ...cvData, experience: updated })
  }

  const addExperienceResponsibility = (expIndex) => {
    const updated = [...cvData.experience]
    updated[expIndex].responsibilities.push('')
    setCvData({ ...cvData, experience: updated })
  }

  const updateExperienceResponsibility = (expIndex, respIndex, value) => {
    const updated = [...cvData.experience]
    updated[expIndex].responsibilities[respIndex] = value
    setCvData({ ...cvData, experience: updated })
  }

  const removeExperienceResponsibility = (expIndex, respIndex) => {
    const updated = [...cvData.experience]
    updated[expIndex].responsibilities = updated[expIndex].responsibilities.filter((_, i) => i !== respIndex)
    setCvData({ ...cvData, experience: updated })
  }

  // Skills functions
  const addSkill = () => {
    setCvData({
      ...cvData,
      skills: [...cvData.skills, '']
    })
  }

  const updateSkill = (index, value) => {
    const updated = [...cvData.skills]
    updated[index] = value
    setCvData({ ...cvData, skills: updated })
  }

  const removeSkill = (index) => {
    setCvData({
      ...cvData,
      skills: cvData.skills.filter((_, i) => i !== index)
    })
  }

  // Languages functions
  const addLanguage = () => {
    setCvData({
      ...cvData,
      languages: [...cvData.languages, {
        language: '',
        level: '',
        details: ''
      }]
    })
  }

  const updateLanguage = (index, field, value) => {
    const updated = [...cvData.languages]
    updated[index][field] = value
    setCvData({ ...cvData, languages: updated })
  }

  const removeLanguage = (index) => {
    setCvData({
      ...cvData,
      languages: cvData.languages.filter((_, i) => i !== index)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>دەستکاریکردنی CV - {teacherData?.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">زانیاری بنەڕەتی</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field">بواری کارکردن</Label>
                <Input
                  id="field"
                  value={cvData.field}
                  onChange={(e) => setCvData({ ...cvData, field: e.target.value })}
                  placeholder="وەک: NURSING، TEACHING، ENGINEERING"
                />
              </div>
              <div>
                <Label htmlFor="phone">ژمارەی مۆبایل</Label>
                <Input
                  id="phone"
                  value={cvData.phone}
                  onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                  placeholder="+9647719907236"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">ناونیشان</Label>
                <Input
                  id="location"
                  value={cvData.location}
                  onChange={(e) => setCvData({ ...cvData, location: e.target.value })}
                  placeholder="شۆرش، چەمچەماڵ"
                />
              </div>
              <div>
                <Label htmlFor="email">ئیمەیڵ</Label>
                <Input
                  id="email"
                  type="email"
                  value={cvData.email}
                  onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                  placeholder="example@gmail.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="aboutMe">دەربارەی خۆم</Label>
              <Textarea
                id="aboutMe"
                value={cvData.aboutMe}
                onChange={(e) => setCvData({ ...cvData, aboutMe: e.target.value })}
                placeholder="کورتە باسێک دەربارەی خۆت و ئامانجەکانت..."
                rows={4}
              />
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">خوێندن</h3>
              <Button onClick={addEducation} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                زیادکردن
              </Button>
            </div>
            {cvData.education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">خوێندن {index + 1}</h4>
                  <Button 
                    onClick={() => removeEducation(index)} 
                    size="sm" 
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    placeholder="ساڵی دەستپێک"
                    value={edu.startYear}
                    onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                  />
                  <Input
                    placeholder="ساڵی کۆتایی"
                    value={edu.endYear}
                    onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                  />
                  <Input
                    placeholder="دامەزراوە"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  />
                  <Input
                    placeholder="بروانامە"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>وردەکاری</Label>
                    <Button 
                      onClick={() => addEducationDetail(index)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {edu.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex gap-2">
                      <Input
                        placeholder="وردەکاری"
                        value={detail}
                        onChange={(e) => updateEducationDetail(index, detailIndex, e.target.value)}
                      />
                      <Button 
                        onClick={() => removeEducationDetail(index, detailIndex)} 
                        size="sm" 
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">ئەزموون</h3>
              <Button onClick={addExperience} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                زیادکردن
              </Button>
            </div>
            {cvData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">ئەزموون {index + 1}</h4>
                  <Button 
                    onClick={() => removeExperience(index)} 
                    size="sm" 
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    placeholder="ساڵی دەستپێک"
                    value={exp.startYear}
                    onChange={(e) => updateExperience(index, 'startYear', e.target.value)}
                  />
                  <Input
                    placeholder="ساڵی کۆتایی"
                    value={exp.endYear}
                    onChange={(e) => updateExperience(index, 'endYear', e.target.value)}
                  />
                  <Input
                    placeholder="کۆمپانیا"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                  <Input
                    placeholder="پۆست"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>بەرپرسیاریەتیەکان</Label>
                    <Button 
                      onClick={() => addExperienceResponsibility(index)} 
                      size="sm" 
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {exp.responsibilities.map((resp, respIndex) => (
                    <div key={respIndex} className="flex gap-2">
                      <Input
                        placeholder="بەرپرسیاریەتی"
                        value={resp}
                        onChange={(e) => updateExperienceResponsibility(index, respIndex, e.target.value)}
                      />
                      <Button 
                        onClick={() => removeExperienceResponsibility(index, respIndex)} 
                        size="sm" 
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">لێهاتووی</h3>
              <Button onClick={addSkill} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                زیادکردن
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="لێهاتووی"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                  />
                  <Button 
                    onClick={() => removeSkill(index)} 
                    size="sm" 
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">زمانەکان</h3>
              <Button onClick={addLanguage} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                زیادکردن
              </Button>
            </div>
            {cvData.languages.map((lang, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="زمان"
                    value={lang.language}
                    onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="ئاست"
                    value={lang.level}
                    onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="وردەکاری"
                    value={lang.details}
                    onChange={(e) => updateLanguage(index, 'details', e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => removeLanguage(index)} 
                  size="sm" 
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            پاشگەزبوونەوە
          </Button>
          <Button onClick={handleSubmit}>
            پاشەکەوتکردن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}