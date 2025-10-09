'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Clock, Settings, TestTube, RefreshCw, Save, 
  Eye, Calendar, Timer, Globe, Send, AlertCircle, 
  ChevronLeft, ChevronRight, Filter, List, Grid,
  Search, ArrowUpDown, Plus, Minus
} from 'lucide-react';

export default function AdvancedAdminControls() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [schedulePreview, setSchedulePreview] = useState([]);
  
  // Enhanced pagination and filtering states
  const [scheduleFilters, setScheduleFilters] = useState({
    searchTerm: '',
    dateRange: 'all', // 'all', 'today', 'week', 'month'
    codeFilter: '',
    sortBy: 'date',
    sortOrder: 'asc'
  });
  
  const [schedulePagination, setSchedulePagination] = useState({
    currentPage: 1,
    itemsPerPage: 10, // Configurable items per page
    viewMode: 'list' // 'list' or 'grid'
  });
  
  const [historyFilters, setHistoryFilters] = useState({
    searchTerm: '',
    dateRange: 'week', // 'week', 'month', 'all'
    codeFilter: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const [historyPagination, setHistoryPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10, // Smaller for history view
    viewMode: 'list'
  });
  
  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    senderEmail: '',
    senderPassword: '',
    targetEmail: '',
    notificationTime: '06:00',
    timezone: 'Asia/Baghdad'
  });
  
  const [originalSettings, setOriginalSettings] = useState({});

  // Load initial data
  useEffect(() => {
    loadEmailSettings();
    loadCurrentTime();
    loadSchedulePreview();
    
    // Update time every minute
    const timeInterval = setInterval(loadCurrentTime, 60000);
    
    // Listen for refresh events from calendar saves
    const handleRefresh = () => {
      loadSchedulePreview();
    };
    
    window.addEventListener('refreshSchedulePreview', handleRefresh);
    
    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('refreshSchedulePreview', handleRefresh);
    };
  }, []);

  const loadEmailSettings = async () => {
    try {
      const response = await fetch('/api/email-settings');
      const data = await response.json();
      if (data.success) {
        setEmailSettings(data.settings);
        setOriginalSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
    }
  };

  const loadCurrentTime = async () => {
    try {
      const response = await fetch('/api/system-time');
      const data = await response.json();
      if (data.success) {
        setCurrentTime(data.time);
      }
    } catch (error) {
      console.error('Error loading current time:', error);
    }
  };

  const loadSchedulePreview = async (days = 30, history = 14) => {
    try {
      const response = await fetch(`/api/schedule-preview?days=${days}&history=${history}`);
      const data = await response.json();
      if (data.success) {
        setSchedulePreview(data.schedule);
      }
    } catch (error) {
      console.error('Error loading schedule preview:', error);
    }
  };

  // Enhanced filtering functions
  const filterScheduleData = (data, filters, isHistory = false) => {
    let filtered = data.filter(day => {
      const hasValidTasks = day.tasksData?.hasTasksToday && day.tasksData?.codes?.length > 0;
      if (!hasValidTasks) return false;
      
      if (isHistory && !day.isHistorical) return false;
      if (!isHistory && day.isHistorical) return false;
      
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDate = day.displayDate.toLowerCase().includes(searchLower);
        const matchesCodes = day.tasksData.codes.some(code => 
          code.toLowerCase().includes(searchLower)
        );
        if (!matchesDate && !matchesCodes) return false;
      }
      
      // Code filter
      if (filters.codeFilter) {
        const hasCode = day.tasksData.codes.some(code => 
          code.toLowerCase().includes(filters.codeFilter.toLowerCase())
        );
        if (!hasCode) return false;
      }
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const today = new Date();
        const itemDate = new Date(day.date);
        const daysDiff = Math.abs((itemDate - today) / (1000 * 60 * 60 * 24));
        
        if (filters.dateRange === 'today' && daysDiff > 1) return false;
        if (filters.dateRange === 'week' && daysDiff > 7) return false;
        if (filters.dateRange === 'month' && daysDiff > 30) return false;
      }
      
      return true;
    });
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'codes':
          aValue = a.tasksData.codes.length;
          bValue = b.tasksData.codes.length;
          break;
        case 'name':
          aValue = a.displayDate;
          bValue = b.displayDate;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // Pagination helper
  const paginateData = (data, pagination) => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const saveEmailSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });
      const data = await response.json();
      
      setResult({
        type: 'save-settings',
        success: data.success,
        message: data.message,
        testResult: data.testResult,
        timestamp: new Date().toLocaleString()
      });
      
      if (data.success) {
        setOriginalSettings(emailSettings);
      }
    } catch (error) {
      setResult({
        type: 'save-settings',
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-notifications?test=true');
      const data = await response.json();
      setResult({
        type: 'test-config',
        success: data.success,
        message: data.message || data.error,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        type: 'test-config',
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-notifications', {
        method: 'POST'
      });
      const data = await response.json();
      setResult({
        type: 'send-test',
        success: data.success,
        tasksData: data.tasksData,
        emailResult: data.emailResult,
        message: data.message,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        type: 'send-test',
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSchedulerStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scheduler');
      const data = await response.json();
      setResult({
        type: 'scheduler',
        success: data.success,
        message: data.message,
        scheduler: data.scheduler,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        type: 'scheduler',
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const hasUnsavedChanges = () => {
    return JSON.stringify(emailSettings) !== JSON.stringify(originalSettings);
  };

  const formatTimeDisplay = (timeObj) => {
    if (!timeObj) return 'Loading...';
    
    const baghdadTime = new Date(timeObj.baghdad);
    return {
      time: baghdadTime.toLocaleTimeString('en-US', { 
        hour12: true, 
        timeZone: 'Asia/Baghdad' 
      }),
      date: baghdadTime.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Baghdad' 
      })
    };
  };

  // Enhanced Schedule/History Viewer Component
  const EnhancedScheduleViewer = ({ data, filters, pagination, setFilters, setPagination, isHistory = false, title }) => {
    const filteredData = filterScheduleData(data, filters, isHistory);
    const paginatedData = paginateData(filteredData, pagination);
    const totalPages = Math.ceil(filteredData.length / pagination.itemsPerPage);
    
    const updateFilter = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter change
    };
    
    const updatePagination = (key, value) => {
      setPagination(prev => ({ ...prev, [key]: value }));
    };
    
    const goToPage = (page) => {
      setPagination(prev => ({ ...prev, currentPage: Math.max(1, Math.min(page, totalPages)) }));
    };

    return (
      <div className="space-y-4">
        {/* Enhanced Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {title} ({filteredData.length} items)
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => loadSchedulePreview(30, 14)} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => updatePagination('viewMode', pagination.viewMode === 'list' ? 'grid' : 'list')}
                  variant="outline"
                  size="sm"
                >
                  {pagination.viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search dates, codes..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Input
              placeholder="Filter by code..."
              value={filters.codeFilter}
              onChange={(e) => updateFilter('codeFilter', e.target.value)}
            />
            
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Time</option>
              {!isHistory && <option value="today">Today</option>}
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="codes">Sort by Code Count</option>
              <option value="name">Sort by Name</option>
            </select>
            
            <Button
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
            
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => updatePagination('itemsPerPage', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          
          {/* Clear Filters */}
          {(filters.searchTerm || filters.codeFilter || filters.dateRange !== 'all') && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {filters.searchTerm && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('searchTerm', '')}>
                  Search: {filters.searchTerm} ×
                </Badge>
              )}
              {filters.codeFilter && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('codeFilter', '')}>
                  Code: {filters.codeFilter} ×
                </Badge>
              )}
              {filters.dateRange !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('dateRange', 'all')}>
                  Range: {filters.dateRange} ×
                </Badge>
              )}
              <Button
                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '', codeFilter: '', dateRange: 'all' }))}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Data Display */}
        <div className={pagination.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {paginatedData.map((day, index) => (
            <Card key={day.date} className={`p-4 transition-all duration-200 hover:shadow-lg ${
              day.isToday 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 ring-2 ring-blue-200' 
                : day.isTomorrow 
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-600' 
                  : day.isYesterday
                    ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600'
                    : day.isHistorical
                      ? 'bg-gray-50 dark:bg-gray-800/30 border-gray-300 dark:border-gray-600 opacity-90'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{day.displayDate}</span>
                    {day.isToday && (
                      <Badge variant="default" className="bg-blue-600 dark:bg-blue-500 text-white dark:text-white">
                        Today
                      </Badge>
                    )}
                    {day.isTomorrow && (
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600">
                        Tomorrow
                      </Badge>
                    )}
                    {day.isYesterday && (
                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600">
                        Yesterday
                      </Badge>
                    )}
                    {day.isHistorical && !day.isYesterday && (
                      <Badge variant="outline" className="text-xs text-gray-600 dark:text-gray-400 border-gray-400">
                        {Math.abs(day.daysFromToday)} days ago
                      </Badge>
                    )}
                    {!day.isToday && !day.isTomorrow && !day.isYesterday && !day.isHistorical && day.daysFromToday > 1 && (
                      <Badge variant="outline" className="text-xs text-gray-600 dark:text-gray-400 border-gray-400">
                        +{day.daysFromToday} days
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tasks: {day.tasksData.codes.length} codes
                    </p>
                    {day.tasksData?.method && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Source: {day.tasksData.method}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {day.tasksData.codes.slice(0, pagination.viewMode === 'grid' ? 3 : 6).map(code => (
                    <Badge 
                      key={code} 
                      variant="outline" 
                      className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => updateFilter('codeFilter', code)}
                    >
                      {code}
                    </Badge>
                  ))}
                  {day.tasksData.codes.length > (pagination.viewMode === 'grid' ? 3 : 6) && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      +{day.tasksData.codes.length - (pagination.viewMode === 'grid' ? 3 : 6)} more
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredData.length)} of {filteredData.length} items
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
              >
                First
              </Button>
              <Button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="min-w-[32px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => goToPage(totalPages)}
                disabled={pagination.currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Last
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No scheduled tasks found</p>
              <p className="text-sm mt-1">هیچ کارێکی خشتەکراو نەدۆزرایەوە</p>
              <p className="text-xs mt-2 text-gray-400">
                {(filters.searchTerm || filters.codeFilter || filters.dateRange !== 'all') 
                  ? 'Try adjusting your filters' 
                  : 'Add calendar entries with codes to see them here'
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
      <CardHeader>
        <CardTitle className="text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Advanced Email & Schedule Management
          <span className="text-sm font-normal text-gray-600 dark:text-gray-300">/ بەڕێوەبردنی پێشکەوتووی ئیمەیڵ و خشتەکار</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Settings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Time & Status
            </TabsTrigger>
          </TabsList>

          {/* Email Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Email Configuration</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="senderEmail">Sender Email (Gmail)</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={emailSettings.senderEmail}
                      onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="senderPassword">App Password (16 characters)</Label>
                    <Input
                      id="senderPassword"
                      type="password"
                      value={emailSettings.senderPassword}
                      onChange={(e) => setEmailSettings({...emailSettings, senderPassword: e.target.value})}
                      placeholder="xxxx xxxx xxxx xxxx"
                      maxLength={19} // Including spaces
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Generate from Gmail: Account → Security → 2-Step Verification → App passwords
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetEmail">Target Email (Recipient)</Label>
                    <Input
                      id="targetEmail"
                      type="email"
                      value={emailSettings.targetEmail}
                      onChange={(e) => setEmailSettings({...emailSettings, targetEmail: e.target.value})}
                      placeholder="recipient@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Schedule Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="notificationTime">Notification Time</Label>
                    <Input
                      id="notificationTime"
                      type="time"
                      value={emailSettings.notificationTime}
                      onChange={(e) => setEmailSettings({...emailSettings, notificationTime: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone"
                      value={emailSettings.timezone}
                      onChange={(e) => setEmailSettings({...emailSettings, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Baghdad">Baghdad (UTC+3)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">New York (EST)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button 
                onClick={saveEmailSettings}
                disabled={loading || !hasUnsavedChanges()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
              
              {hasUnsavedChanges() && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </TabsContent>

          {/* Enhanced Schedule Preview Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <EnhancedScheduleViewer
              data={schedulePreview}
              filters={scheduleFilters}
              pagination={schedulePagination}
              setFilters={setScheduleFilters}
              setPagination={setSchedulePagination}
              isHistory={false}
              title="Schedule Preview (Upcoming & Current)"
            />
          </TabsContent>

          {/* Enhanced History Tab */}
          <TabsContent value="history" className="space-y-4">
            <EnhancedScheduleViewer
              data={schedulePreview}
              filters={historyFilters}
              pagination={historyPagination}
              setFilters={setHistoryFilters}
              setPagination={setHistoryPagination}
              isHistory={true}
              title="History Schedule (Past Events)"
            />
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={testEmailConfiguration}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 border-blue-300 dark:border-blue-700"
              >
                <TestTube className="h-4 w-4" />
                Test Email Config
              </Button>
              
              <Button
                onClick={sendTestEmail}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 border-orange-300 dark:border-orange-700"
              >
                <Send className="h-4 w-4" />
                Send Test Notification
              </Button>
              
              <Button
                onClick={checkSchedulerStatus}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 border-purple-300 dark:border-purple-700"
              >
                <Clock className="h-4 w-4" />
                Check Scheduler
              </Button>
            </div>

            {/* Results Display */}
            {result && (
              <Card className="p-4 bg-white dark:bg-gray-800 border">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Error"}
                  </Badge>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Operation:</strong> {result.type}</p>
                  <p><strong>Message:</strong> {result.message}</p>
                  
                  {result.tasksData && (
                    <div>
                      <p><strong>Today's Tasks:</strong></p>
                      <div className="ml-4 mt-2">
                        <p>Date: {result.tasksData.date}</p>
                        <p>Has Tasks: {result.tasksData.hasTasksToday ? 'Yes' : 'No'}</p>
                        {result.tasksData.codes && result.tasksData.codes.length > 0 && (
                          <div>
                            <p>Codes ({result.tasksData.codes.length}):</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.tasksData.codes.map(code => (
                                <Badge 
                                  key={code} 
                                  variant="outline" 
                                  className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                                >
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {result.emailResult && (
                    <div>
                      <p><strong>Email Result:</strong></p>
                      <div className="ml-4 mt-2">
                        <p>Success: {result.emailResult.success ? 'Yes' : 'No'}</p>
                        <p>Sent To: {result.emailResult.sentTo}</p>
                        {result.emailResult.messageId && (
                          <p>Message ID: {result.emailResult.messageId}</p>
                        )}
                        {result.emailResult.error && (
                          <p className="text-red-600">Error: {result.emailResult.error}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {result.scheduler && (
                    <div>
                      <p><strong>Scheduler Status:</strong></p>
                      <div className="ml-4 mt-2">
                        <p>Running: {result.scheduler.running ? 'Yes' : 'No'}</p>
                        <p>Next Run: {result.scheduler.nextRun}</p>
                        <p>Timezone: {result.scheduler.timezone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Time & Status Tab */}
          <TabsContent value="time" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Current Time
                </h3>
                {currentTime ? (
                  <div className="space-y-2">
                    <div>
                      <strong>Baghdad Time:</strong>
                      <div className="text-2xl font-mono text-blue-600 dark:text-blue-400">
                        {formatTimeDisplay(currentTime).time}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTimeDisplay(currentTime).date}
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1 pt-2 border-t">
                      <p><strong>UTC:</strong> {new Date(currentTime.utc).toLocaleString()}</p>
                      <p><strong>Local:</strong> {currentTime.local}</p>
                    </div>
                  </div>
                ) : (
                  <p>Loading time...</p>
                )}
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Next Notification
                </h3>
                <div className="space-y-2">
                  <p><strong>Scheduled Time:</strong> {emailSettings.notificationTime}</p>
                  <p><strong>Timezone:</strong> {emailSettings.timezone}</p>
                  <p><strong>Target Email:</strong> {emailSettings.targetEmail || 'Not set'}</p>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>💡 Tip:</strong> The system automatically checks for scheduled tasks every day at the specified time and sends notifications only when tasks are found.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <h3 className="text-lg font-semibold mb-3">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p><strong>Email Service:</strong> Gmail SMTP</p>
                  <p><strong>Scheduler:</strong> Node-cron</p>
                </div>
                <div>
                  <p><strong>Database:</strong> SQLite</p>
                  <p><strong>Code Dictionary:</strong> 34 codes</p>
                </div>
                <div>
                  <p><strong>Timezone Support:</strong> Multiple</p>
                  <p><strong>Auto-Detection:</strong> Enabled</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}