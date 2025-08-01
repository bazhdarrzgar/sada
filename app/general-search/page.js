'use client'

import React, { useState, useEffect, useCallback } from 'react'
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

export default function GeneralSearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Debounced search function
  const debounceSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults({})
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      try {
        const response = await fetch(`/api/general-search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        if (response.ok) {
          setSearchResults(data)
        } else {
          console.error('Search failed:', data.error)
          setSearchResults({})
        }
      } catch (error) {
        console.error('Error performing search:', error)
        setSearchResults({})
      } finally {
        setIsLoading(false)
      }
    }, 500), // 500ms delay
    []
  )

  // Effect for real-time search
  useEffect(() => {
    debounceSearch(searchQuery)
  }, [searchQuery, debounceSearch])

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
      'calendar': '/calendar',
      'student_permissions': '/student-permissions',
      'employee_leaves': '/employee-leaves',
      'supervision': '/supervision',
      'supervised_students': '/supervised-students',
      'installments': '/installments',
      'expenses': '/expenses',
      'building_expenses': '/building-expenses',
      'daily_accounts': '/daily-accounts',
      'kitchen_expenses': '/kitchen-expenses',
      'exam_supervision': '/exam-supervision',
      'teacher_info': '/teacher-info'
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
      'calendar': 'ساڵنامە',
      'student_permissions': 'مۆڵەت',
      'employee_leaves': 'مۆڵەتی فەرمانبەران',
      'supervision': 'چاودێری',
      'supervised_students': 'خوێندکاری چاودێری کراو',
      'installments': 'قیستی ساڵانه',
      'expenses': 'خەرجی مانگانه',
      'building_expenses': 'مەسروفی بینا',
      'daily_accounts': 'حساباتی رۆژانه',
      'kitchen_expenses': 'خەرجی خواردنگە',
      'exam_supervision': 'چاودێریکردنی تاقیرکدنەوە',
      'teacher_info': 'زانیاری مامۆستا'
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              گەرانی گشتی لە هەموو داتابەیسەکەدا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                type="text"
                placeholder="بنووسە بۆ گەرانی خێرا لە هەموو تۆمارەکاندا..."
                value={searchQuery}
                onChange={handleInputChange}
                className="flex-1 pr-10"
                dir="rtl"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              گەران بەشێوەی خێرا و بەردەوام ئەنجام دەدرێت • کلیک لەسەر ڕیزەکان بۆ چوونە لاپەڕەی سەرەکی
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