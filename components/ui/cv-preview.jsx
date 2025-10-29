'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone, MapPin, Mail, User } from 'lucide-react'

export function CVPreview({ isOpen, onClose, teacherData }) {
  if (!teacherData) return null

  const {
    fullName = '',
    cv = {}
  } = teacherData || {} // Additional null check

  // Ensure cv is always an object, even if it's null or undefined
  const cvData = cv || {}

  const {
    field = '',
    phone = '',
    location = '',
    email = '',
    aboutMe = '',
    education = [],
    experience = [],
    skills = [],
    languages = []
  } = cvData

  // If no CV data exists, show a message
  const hasAnyData = field || phone || location || email || aboutMe || 
                     (education && education.length > 0) || 
                     (experience && experience.length > 0) || 
                     (skills && skills.length > 0) || 
                     (languages && languages.length > 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {fullName.toUpperCase()}
          </DialogTitle>
          {field && (
            <p className="text-center text-lg text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {field}
            </p>
          )}
        </DialogHeader>

        {!hasAnyData ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              هیچ زانیاریەکی CV نەدۆزرایەوە
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              تکایە کلیک لە دوگمەی دەستکاری بکە بۆ زیادکردنی زانیاری CV
            </p>
          </div>
        ) : (
          <div className="cv-content bg-white dark:bg-gray-900 p-8 rounded-lg border">
            {/* Header with contact info */}
            <div className="flex justify-center items-center gap-8 mb-8 text-sm border-b pb-6">
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-yellow-600" />
                  <span>{phone}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-yellow-600" />
                  <span>{location}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-yellow-600" />
                  <span className="underline">{email}</span>
                </div>
              )}
            </div>

            {/* About Me Section */}
            {aboutMe && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-800 dark:border-gray-200 pb-2">
                  ABOUT ME
                </h3>
                <p className="text-sm leading-relaxed text-justify">
                  {aboutMe}
                </p>
              </div>
            )}

            {/* Education Section */}
            {education && education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-800 dark:border-gray-200 pb-2">
                  EDUCATION
                </h3>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="min-w-[120px] text-sm font-semibold">
                        {edu.startYear && edu.endYear && (
                          <div>{edu.startYear} - {edu.endYear}</div>
                        )}
                        {edu.institution && (
                          <div className="text-gray-600 dark:text-gray-400 font-normal mt-1">
                            {edu.institution}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {edu.degree && (
                          <h4 className="font-semibold text-sm mb-2">{edu.degree}</h4>
                        )}
                        {edu.details && edu.details.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {edu.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start gap-2">
                                <span className="text-gray-600 dark:text-gray-400">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {experience && experience.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-800 dark:border-gray-200 pb-2">
                  EXPERIENCE
                </h3>
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="min-w-[120px] text-sm font-semibold">
                        {exp.startYear && exp.endYear && (
                          <div>{exp.startYear} - {exp.endYear}</div>
                        )}
                        {exp.company && (
                          <div className="text-gray-600 dark:text-gray-400 font-normal mt-1">
                            {exp.company}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {exp.position && (
                          <h4 className="font-semibold text-sm mb-2">{exp.position}</h4>
                        )}
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {exp.responsibilities.map((resp, respIndex) => (
                              <li key={respIndex} className="flex items-start gap-2">
                                <span className="text-gray-600 dark:text-gray-400">•</span>
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {skills && skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-800 dark:border-gray-200 pb-2">
                  SKILLS
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">•</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {languages && languages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-800 dark:border-gray-200 pb-2">
                  LANGUAGES
                </h3>
                <div className="space-y-2">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">•</span>
                      <span className="font-medium">{lang.language}</span>
                      {lang.level && (
                        <>
                          <span className="text-gray-600 dark:text-gray-400">—</span>
                          <span>{lang.level}</span>
                          {lang.details && (
                            <>
                              <span className="text-gray-600 dark:text-gray-400">(</span>
                              <span className="text-gray-600 dark:text-gray-400">{lang.details}</span>
                              <span className="text-gray-600 dark:text-gray-400">)</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            داخستن
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}