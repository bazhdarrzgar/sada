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
  Eye, Calendar, Timer, Globe, Send, AlertCircle 
} from 'lucide-react';

export default function AdvancedAdminControls() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [schedulePreview, setSchedulePreview] = useState([]);
  
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
    return () => clearInterval(timeInterval);
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

  const loadSchedulePreview = async (days = 7) => {
    try {
      const response = await fetch(`/api/schedule-preview?days=${days}`);
      const data = await response.json();
      if (data.success) {
        setSchedulePreview(data.schedule);
      }
    } catch (error) {
      console.error('Error loading schedule preview:', error);
    }
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Settings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Preview
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
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

          {/* Schedule Preview Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Upcoming Schedule Preview
              </h3>
              <Button 
                onClick={() => loadSchedulePreview(7)} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {schedulePreview.map((day, index) => (
                <Card key={day.date} className={`p-4 ${day.isToday ? 'bg-blue-50 border-blue-300' : day.isTomorrow ? 'bg-green-50 border-green-300' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{day.displayDate}</span>
                        {day.isToday && <Badge variant="default">Today</Badge>}
                        {day.isTomorrow && <Badge variant="secondary">Tomorrow</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Tasks: {day.tasksData?.hasTasksToday ? `${day.tasksData.codes.length} codes` : 'No tasks scheduled'}
                      </p>
                    </div>
                    
                    {day.tasksData?.hasTasksToday && (
                      <div className="flex flex-wrap gap-1">
                        {day.tasksData.codes.slice(0, 5).map(code => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                        {day.tasksData.codes.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{day.tasksData.codes.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
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
                                <Badge key={code} variant="outline" className="text-xs">
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
                  <p><strong>Database:</strong> MongoDB</p>
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