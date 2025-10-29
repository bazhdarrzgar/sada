'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, FileText, User, Calendar, Activity, DollarSign, Download, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToExcel, exportToCSV, exportToJSON } from '@/lib/exportUtils'
import Fuse from 'fuse.js'

export default function GeneralSearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({})
  const [allData, setAllData] = useState({}) // Store all data for fuzzy search
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Helper functions for enhanced search (moved before fuseInstances to avoid hoisting issues)
  const getNumberRange = (value, key) => {
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    
    // Different ranges for different field types
    if (key.includes('salary') || key.includes('amount') || key.includes('total') || key.includes('cost')) {
      if (num < 100000) return 'low کەم'
      if (num < 500000) return 'medium ناوەند'
      if (num < 1000000) return 'high بەرز'
      return 'very-high زۆر بەرز'
    }
    
    if (key.includes('age') || key.includes('تەمەن')) {
      if (num < 25) return 'young گەنج'
      if (num < 50) return 'middle-aged ناوەندی تەمەن'
      return 'senior گەورە'
    }
    
    return num > 0 ? 'positive ئەرێنی' : num < 0 ? 'negative نەرێنی' : 'zero سفر'
  }

  const getCollectionSemanticTerms = (collection, obj) => {
    const terms = []
    
    switch (collection) {
      case 'payroll':
        if (obj.total > (obj.salary || 0)) terms.push('bonus پاداشت')
        if (obj.total < (obj.salary || 0)) terms.push('deduction لەبرین')
        if (obj.absence > 0) terms.push('absent نەھاتوو')
        break
        
      case 'installments':
        const remaining = parseFloat(obj.remaining) || 0
        if (remaining > 0) terms.push('unpaid نەدراو باقی')
        else if (remaining === 0) terms.push('paid تەواو درا')
        else terms.push('overpaid زیاد درا')
        break
        
      case 'activities':
        if (obj.startDate && new Date(obj.startDate) > new Date()) {
          terms.push('upcoming داهاتوو')
        } else if (obj.startDate) {
          terms.push('completed تەواوبوو past')
        }
        break
        
      case 'staff_records':
      case 'teachers':
        if (obj.gender === 'male' || obj.gender === 'نێر') terms.push('male نێر پیاو')
        if (obj.gender === 'female' || obj.gender === 'مێ') terms.push('female مێ ژن')
        break
    }
    
    return terms.join(' ')
  }

  const getKurdishTerms = (obj) => {
    const terms = []
    
    // Common Kurdish translations
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase()
        
        // Month translations
        if (lowerValue.includes('january') || lowerValue.includes('jan')) terms.push('کانونی دووەم')
        if (lowerValue.includes('february') || lowerValue.includes('feb')) terms.push('شوبات')
        if (lowerValue.includes('march') || lowerValue.includes('mar')) terms.push('ئادار')
        if (lowerValue.includes('april') || lowerValue.includes('apr')) terms.push('نیسان')
        if (lowerValue.includes('may')) terms.push('ئایار')
        if (lowerValue.includes('june') || lowerValue.includes('jun')) terms.push('حوزەیران')
        if (lowerValue.includes('july') || lowerValue.includes('jul')) terms.push('تەمووز')
        if (lowerValue.includes('august') || lowerValue.includes('aug')) terms.push('ئاب')
        if (lowerValue.includes('september') || lowerValue.includes('sep')) terms.push('ئەیلوول')
        if (lowerValue.includes('october') || lowerValue.includes('oct')) terms.push('تشرینی یەکەم')
        if (lowerValue.includes('november') || lowerValue.includes('nov')) terms.push('تشرینی دووەم')
        if (lowerValue.includes('december') || lowerValue.includes('dec')) terms.push('کانونی یەکەم')
        
        // Status translations
        if (lowerValue.includes('active')) terms.push('چالاک')
        if (lowerValue.includes('inactive')) terms.push('ناچالاک')
        if (lowerValue.includes('pending')) terms.push('چاوەڕوان')
        if (lowerValue.includes('completed')) terms.push('تەواوبوو')
        if (lowerValue.includes('approved')) terms.push('پەسەندکراو')
        if (lowerValue.includes('rejected')) terms.push('ڕەتکرایەوە')
      }
    })
    
    return terms.join(' ')
  }

  const getStatusIndicators = (obj, collection) => {
    const terms = []
    
    // Add general status terms based on object properties
    if (obj.status) terms.push(obj.status)
    if (obj.isActive === true) terms.push('active چالاک')
    if (obj.isActive === false) terms.push('inactive ناچالاک')
    if (obj.approved === true) terms.push('approved پەسەندکراو')
    if (obj.approved === false) terms.push('pending چاوەڕوان')
    
    return terms.join(' ')
  }

  const getDateTerms = (obj) => {
    const terms = []
    
    // Find date fields and add seasonal/temporal terms
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'string' && (key.includes('date') || key.includes('Date') || key.includes('بەروار'))) {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          const month = date.getMonth() + 1
          
          // Seasonal terms
          if ([12, 1, 2].includes(month)) terms.push('winter زستان')
          else if ([3, 4, 5].includes(month)) terms.push('spring بەھار')
          else if ([6, 7, 8].includes(month)) terms.push('summer ھاوین')
          else if ([9, 10, 11].includes(month)) terms.push('autumn پاییز')
          
          // Year terms
          const year = date.getFullYear()
          terms.push(year.toString())
          
          // Recent vs old
          const now = new Date()
          const diffMonths = (now.getFullYear() - year) * 12 + (now.getMonth() - (month - 1))
          if (diffMonths <= 6) terms.push('recent تازە')
          else if (diffMonths >= 24) terms.push('old کۆن')
        }
      }
    })
    
    return terms.join(' ')
  }

  // Initialize Fuse.js for each collection with comprehensive search across ALL columns
  const fuseInstances = useMemo(() => {
    const instances = {}
    
    Object.entries(allData).forEach(([collection, data]) => {
      if (data && data.length > 0) {
        // Get sample document to determine ALL searchable fields
        const sampleDoc = data[0]
        const allFields = Object.keys(sampleDoc).filter(key => 
          key !== '_id' && 
          key !== 'created_at' && 
          key !== 'updated_at'
        )
        
        // Create comprehensive search keys for ALL fields with weights
        const keys = [
          // Primary text fields get highest weight
          ...allFields
            .filter(key => typeof sampleDoc[key] === 'string')
            .map((field, index) => ({
              name: field,
              weight: Math.max(0.2, 0.6 - (index * 0.05))
            })),
          
          // Numeric fields for amount/number searches
          ...allFields
            .filter(key => typeof sampleDoc[key] === 'number' || !isNaN(parseFloat(sampleDoc[key])))
            .map((field) => ({
              name: field,
              weight: 0.15
            })),
          
          // ID field for technical searches
          { name: 'id', weight: 0.05 },
          
          // Custom comprehensive search field that combines everything
          {
            name: 'searchableContent',
            weight: 0.3,
            getFn: (obj) => {
              return Object.entries(obj)
                .filter(([key, value]) => key !== '_id' && key !== 'created_at' && key !== 'updated_at')
                .map(([key, value]) => {
                  if (value === null || value === undefined) return ''
                  
                  // Handle different data types
                  if (typeof value === 'string') {
                    return value
                  } else if (typeof value === 'number') {
                    return [
                      value.toString(),
                      value.toLocaleString(), // Formatted numbers
                      getNumberRange(value, key) // Range indicators
                    ].join(' ')
                  } else if (Array.isArray(value)) {
                    return value.join(' ')
                  } else if (typeof value === 'object') {
                    return JSON.stringify(value)
                  }
                  
                  return value.toString()
                })
                .concat([
                  // Add collection-specific semantic search terms
                  getCollectionSemanticTerms(collection, obj),
                  // Add Kurdish translations for common terms
                  getKurdishTerms(obj),
                  // Add status indicators
                  getStatusIndicators(obj, collection),
                  // Add date-based terms
                  getDateTerms(obj)
                ])
                .filter(term => term && term.length > 0)
                .join(' ')
                .toLowerCase()
            }
          }
        ]
        
        instances[collection] = new Fuse(data, {
          keys,
          threshold: 0.3, // More precise for comprehensive search
          distance: 100,
          includeScore: true,
          includeMatches: true,
          minMatchCharLength: 2,
          ignoreLocation: true
        })
      }
    })
    
    return instances
  }, [allData])



  // Load all data initially for fuzzy search
  useEffect(() => {
    const loadAllData = async () => {
      setIsInitialLoading(true)
      try {
        // Load all data without search query for fuzzy search
        const response = await fetch('/api/general-search?loadAll=true')
        const data = await response.json()
        
        if (response.ok) {
          setAllData(data)
        } else {
          console.error('Failed to load initial data:', data.error)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadAllData()
  }, [])

  // Fuzzy search function using Fuse.js
  const performFuzzySearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults({})
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      try {
        const results = {}
        
        // Perform fuzzy search across all collections
        Object.entries(fuseInstances).forEach(([collection, fuse]) => {
          const searchResults = fuse.search(query)
          if (searchResults.length > 0) {
            // Extract items from Fuse.js results and limit to 20 per collection
            results[collection] = searchResults
              .slice(0, 20)
              .map(result => result.item)
          }
        })
        
        setSearchResults(results)
      } catch (error) {
        console.error('Error performing fuzzy search:', error)
        setSearchResults({})
      } finally {
        setIsLoading(false)
      }
    }, 300), // Faster response for better UX
    [fuseInstances]
  )

  // Effect for real-time fuzzy search
  useEffect(() => {
    if (Object.keys(fuseInstances).length > 0) {
      performFuzzySearch(searchQuery)
    }
  }, [searchQuery, performFuzzySearch, fuseInstances])

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Navigation function
  const navigateToCollection = (collection) => {
    const routes = {
      'staff_records': '/staff',
      'teachers': '/teachers',
      'activities': '/activities',
      'payroll': '/payroll',
      'calendar_entries': '/calendar',
      'student_permissions': '/student-permissions',
      'employee_leaves': '/employee-leaves',
      'supervision': '/supervision',
      'supervised_students': '/supervised-students',
      'installments': '/installments',
      'monthly_expenses': '/monthly-expenses',
      'building_expenses': '/building-expenses',
      'daily_accounts': '/daily-accounts',
      'kitchen_expenses': '/kitchen-expenses',
      'exam_supervision': '/exam-supervision',
      'teacher_info': '/teacher-info',
      'legend_entries': '/legend'
    }
    
    const route = routes[collection]
    if (route) {
      router.push(route)
    }
  }

  // Download functions using utilities
  const handleDownload = (format, data, collectionName) => {
    const filename = `${collectionName}_search_results`
    
    switch (format) {
      case 'json':
        exportToJSON(data, filename)
        break
      case 'csv':
        exportToCSV(data, filename)
        break
      case 'xlsx':
        exportToExcel(data, filename)
        break
      default:
        console.error('Unsupported format:', format)
    }
  }

  const getCollectionIcon = (collection) => {
    switch (collection) {
      case 'staff_records': return User
      case 'teachers': return User  
      case 'activities': return Activity
      case 'payroll': return DollarSign
      case 'calendar': return Calendar
      default: return FileText
    }
  }

  const getCollectionName = (collection) => {
    const names = {
      'staff_records': 'تۆمارەکانی ستاف',
      'teachers': 'مامۆستایان',
      'activities': 'چالاکی',
      'payroll': 'موچە',
      'calendar_entries': 'ساڵنامە',
      'student_permissions': 'مۆڵەت',
      'employee_leaves': 'مۆڵەتی فەرمانبەران',
      'supervision': 'چاودێری',
      'supervised_students': 'قوتابیی چاودێری کراو',
      'installments': 'قیستی ساڵانه',
      'monthly_expenses': 'خەرجی مانگانه',
      'building_expenses': 'مەسروفی بینا',
      'daily_accounts': 'حساباتی رۆژانه',
      'kitchen_expenses': 'خەرجی خواردنگە',
      'exam_supervision': 'چاودێریکردنی تاقیرکدنەوە',
      'teacher_info': 'زانیاری مامۆستا',
      'legend_entries': 'پێناسەکان'
    }
    return names[collection] || collection
  }

  const formatFieldName = (key) => {
    const fieldNames = {
      'fullName': 'ناوی تەواو',
      'mobile': 'مۆبایل',
      'address': 'ناونیشان',
      'gender': 'رەگەز',
      'dateOfBirth': 'بەرواری لەدایکبوون',
      'certificate': 'بڕوانامە',
      'age': 'تەمەن',
      'education': 'خوێندن',
      'attendance': 'ئامادەبوون',
      'date': 'بەروار',
      'department': 'بەش',
      'pass': 'پلە',
      'contract': 'گرێبەست',
      'subject': 'بابەت',
      'grade': 'پۆل',
      'activityType': 'جۆری چالاکی',
      'preparationDate': 'بەرواری ئامادەکردن',
      'content': 'ناوەڕۆک',
      'startDate': 'بەرواری دەستپێک'
    }
    return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  const renderTable = (results, collectionName) => {
    if (!results || results.length === 0) return null

    // Get all unique keys from all results
    const allKeys = [...new Set(results.flatMap(item => Object.keys(item)))]
    const displayKeys = allKeys.filter(key => 
      key !== 'id' && 
      key !== '_id' && 
      key !== 'created_at' && 
      key !== 'updated_at'
    ).slice(0, 6) // Limit to 6 columns for better table display

    return (
      <div className="space-y-4">
        {/* Download buttons */}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                داونلۆد
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload('xlsx', results, collectionName)}>
                <FileText className="h-4 w-4 mr-2" />
                Excel (XLSX)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload('csv', results, collectionName)}>
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload('json', results, collectionName)}>
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">#</TableHead>
                {displayKeys.map(key => (
                  <TableHead key={key} className="text-right min-w-[120px]">
                    {formatFieldName(key)}
                  </TableHead>
                ))}
                <TableHead className="text-center">چالاکی</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                  onClick={() => navigateToCollection(collectionName)}
                >
                  <TableCell className="font-medium text-center">
                    {index + 1}
                  </TableCell>
                  {displayKeys.map(key => (
                    <TableCell key={key} className="text-right" dir="rtl">
                      <div className="max-w-[200px] truncate" title={result[key]}>
                        {typeof result[key] === 'string' ? result[key] : JSON.stringify(result[key])}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigateToCollection(collectionName)
                      }}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      بینین
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const totalResults = Object.values(searchResults).reduce((sum, results) => sum + (results?.length || 0), 0)

  return (
    <PageLayout 
      title="General Search" 
      titleKu="گەرانی گشتی"
      showBackButton={true}
    >
      <div className="w-full p-0 m-0 space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              گەڕانی فازی لە هەموو ستوونەکانی هەموو داتابەیسەکەدا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="گەڕانی فازی لە هەموو ستوونەکانی هەموو داتابەیسەکەدا... / Comprehensive fuzzy search across all columns of all databases..."
                value={searchQuery}
                onChange={handleInputChange}
                className="w-full pr-10"
                dir="rtl"
                disabled={isInitialLoading}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {isLoading || isInitialLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {isInitialLoading 
                ? "بارکردنی داتا بۆ گەرانی فازی لە هەموو ستوونەکاندا..." 
                : "گەرانی فازی لە هەموو ستوونەکانی هەموو تۆمارەکاندا - بەشێوەی خێرا و بەردەوام • کلیک لەسەر ڕیزەکان بۆ چوونە لاپەڕەی سەرەکی"
              }
            </p>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {hasSearched && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg">
                    {totalResults} ئەنجام دۆزرایەوە
                  </Badge>
                  {searchQuery && (
                    <span className="text-gray-600">
                      بۆ "{searchQuery}"
                    </span>
                  )}
                </div>
                {isLoading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    گەران...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {hasSearched && totalResults > 0 && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="all">هەموو ({totalResults})</TabsTrigger>
              {Object.entries(searchResults).slice(0, 3).map(([collection, results]) => (
                <TabsTrigger key={collection} value={collection}>
                  {getCollectionName(collection)} ({results?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {Object.entries(searchResults).map(([collection, results]) => {
                if (!results || results.length === 0) return null
                const IconComponent = getCollectionIcon(collection)
                
                return (
                  <Card key={collection}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {getCollectionName(collection)}
                        <Badge variant="outline">{results.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderTable(results, collection)}
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            {Object.entries(searchResults).map(([collection, results]) => (
              <TabsContent key={collection} value={collection} className="space-y-4">
                {results && results.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {React.createElement(getCollectionIcon(collection), { className: "h-5 w-5" })}
                        {getCollectionName(collection)}
                        <Badge variant="outline">{results.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderTable(results, collection)}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">هیچ ئەنجامێک نەدۆزرایەوە</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* No Results */}
        {hasSearched && totalResults === 0 && !isLoading && searchQuery.trim() && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                هیچ ئەنجامێک نەدۆزرایەوە
              </h3>
              <p className="text-gray-500">
                تکایە وشەی گەرانەکەت بگۆڕە و دووبارە هەوڵبدەوە
              </p>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                گەرانی گشتی
              </h3>
              <p className="text-gray-500">
                دەست بکە بە نووسین بۆ گەران لە هەموو تۆمارەکاندا
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}

// Debounce utility function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}