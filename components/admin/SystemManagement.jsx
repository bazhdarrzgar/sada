'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Database, 
  Server, 
  Users, 
  Activity,
  TrendingUp,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Upload,
  Mail,
  FileText,
  Calendar,
  Bell
} from 'lucide-react'

const SystemManagement = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalTeachers: 45,
    totalStaff: 23,
    systemUptime: 99.9,
    databaseSize: 2.4,
    storageUsed: 67,
    networkStatus: 'optimal',
    lastBackup: '2 hours ago',
    pendingTasks: 3
  })

  const quickActions = [
    {
      title: 'Create System Backup',
      description: 'Generate full system backup',
      icon: Database,
      action: 'backup',
      color: 'blue'
    },
    {
      title: 'Send School Announcement',
      description: 'Broadcast message to all users',
      icon: Mail,
      action: 'announcement',
      color: 'green'
    },
    {
      title: 'Generate Monthly Report',
      description: 'Create comprehensive system report',
      icon: FileText,
      action: 'report',
      color: 'purple'
    },
    {
      title: 'Schedule Maintenance',
      description: 'Plan system maintenance window',
      icon: Calendar,
      action: 'maintenance',
      color: 'orange'
    },
    {
      title: 'Update System Settings',
      description: 'Modify global system configuration',
      icon: Settings,
      action: 'settings',
      color: 'red'
    },
    {
      title: 'Export Data',
      description: 'Export system data for analysis',
      icon: Download,
      action: 'export',
      color: 'indigo'
    }
  ]

  const systemAlerts = [
    {
      type: 'info',
      message: 'System backup completed successfully',
      time: '2 hours ago',
      icon: CheckCircle
    },
    {
      type: 'warning',
      message: 'Storage usage above 65%',
      time: '4 hours ago',
      icon: AlertTriangle
    },
    {
      type: 'success',
      message: 'All security updates installed',
      time: '1 day ago',
      icon: Shield
    }
  ]

  const handleQuickAction = async (action) => {
    switch(action) {
      case 'backup':
        // Trigger system backup
        console.log('Creating system backup...')
        break
      case 'announcement':
        // Open announcement modal
        console.log('Opening announcement system...')
        break
      case 'report':
        // Generate monthly report
        console.log('Generating monthly report...')
        break
      case 'maintenance':
        // Schedule maintenance
        console.log('Opening maintenance scheduler...')
        break
      case 'settings':
        // Open system settings
        console.log('Opening system settings...')
        break
      case 'export':
        // Export data
        console.log('Starting data export...')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">Total Users</h4>
            </div>
            <p className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{systemStats.activeUsers} active today</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">System Health</h4>
            </div>
            <p className="text-2xl font-bold">{systemStats.systemUptime}%</p>
            <p className="text-sm text-muted-foreground">Uptime last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold">Storage</h4>
            </div>
            <p className="text-2xl font-bold">{systemStats.databaseSize} GB</p>
            <Progress value={systemStats.storageUsed} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">{systemStats.storageUsed}% used</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold">Pending Tasks</h4>
            </div>
            <p className="text-2xl font-bold">{systemStats.pendingTasks}</p>
            <p className="text-sm text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Quick Administrative Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Administrative Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleQuickAction(action.action)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                      <IconComponent className={`h-5 w-5 text-${action.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* System Alerts */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent System Alerts
        </h3>
        <div className="space-y-3">
          {systemAlerts.map((alert, index) => {
            const IconComponent = alert.icon
            return (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${
                      alert.type === 'success' ? 'text-green-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <Badge variant={
                      alert.type === 'success' ? 'default' :
                      alert.type === 'warning' ? 'destructive' :
                      'secondary'
                    }>
                      {alert.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* System Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          System Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="capitalize">{systemStats.networkStatus}</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Optimal</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span>{systemStats.lastBackup}</span>
                <Badge variant="secondary">Automated</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SystemManagement