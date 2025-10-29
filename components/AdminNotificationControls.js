'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Settings, TestTube, RefreshCw } from 'lucide-react';

export default function AdminNotificationControls() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);

  const testEmailConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-notifications?test=true');
      const data = await response.json();
      setResult({
        type: 'test',
        success: data.success,
        message: data.message || data.error,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        type: 'test',
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTodaysTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-notifications');
      const data = await response.json();
      setResult({
        type: 'check',
        success: data.success,
        tasksData: data.tasksData,
        message: data.message,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        type: 'check',
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/daily-notifications', {
        method: 'POST'
      });
      const data = await response.json();
      setResult({
        type: 'send',
        success: data.success,
        tasksData: data.tasksData,
        emailResult: data.emailResult,
        message: data.message,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      setResult({
        type: 'send',
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
      setSchedulerStatus(data.scheduler);
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

  return (
    <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
      <CardHeader>
        <CardTitle className="text-purple-800 dark:text-purple-200 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Daily Notification System Controls
          <span className="text-sm font-normal text-gray-600 dark:text-gray-300">/ کۆنترۆڵی سیستەمی ئاگادارکردنەوەی ڕۆژانە</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={testEmailConfiguration}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
          >
            <TestTube className="h-4 w-4" />
            Test Email
          </Button>
          
          <Button
            onClick={checkTodaysTasks}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Check Today
          </Button>
          
          <Button
            onClick={sendTestNotification}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300"
          >
            <Mail className="h-4 w-4" />
            Send Test Email
          </Button>
          
          <Button
            onClick={checkSchedulerStatus}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
          >
            <Clock className="h-4 w-4" />
            Scheduler Status
          </Button>
        </div>

        {/* Results Display */}
        {result && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Success" : "Error"}
              </Badge>
              <span className="text-xs text-gray-500">{result.timestamp}</span>
            </div>
            
            <div className="space-y-2 text-sm">
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
          </div>
        )}

        {/* Information Box */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            📧 Notification System Information
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Schedule:</strong> Daily at 06:00 AM Baghdad time (UTC+3)</p>
            <p><strong>Target Email:</strong> soyansoon9@gmail.com</p>
            <p><strong>Function:</strong> Checks calendar for today's task codes and sends email notifications</p>
            <p><strong>Codes:</strong> Uses the complete code dictionary (A-Z, A1-G1, TB)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}