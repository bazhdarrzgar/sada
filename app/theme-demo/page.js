'use client'

import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Sparkles, Palette, Eye } from 'lucide-react'

function ThemeDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 transition-all duration-500 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full shadow-lg">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
              Enhanced Dark/Light Mode Demo
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
            Experience smooth theme transitions with beautiful hover effects
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Theme Toggle Card */}
          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all duration-300 group-hover:scale-110">
                  <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                Smart Theme Toggle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                Click the theme button to cycle through Light → Dark → System modes with smooth animations
              </p>
            </CardContent>
          </Card>

          {/* Hover Effects Card */}
          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-all duration-300 group-hover:scale-110">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                Beautiful Hover Effects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                Smooth hover animations, scale effects, and color transitions enhance user experience
              </p>
            </CardContent>
          </Card>

          {/* Smooth Transitions Card */}
          <Card className="theme-card glow-button hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 dark:hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-emerald-50/50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-all duration-300 group-hover:scale-110">
                  <Sun className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:rotate-12 transition-all duration-300" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                Smooth Transitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                All colors, backgrounds, and elements transition smoothly between themes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Buttons Demo */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
            Interactive Button Examples
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <span className="group-hover:scale-105 transition-transform duration-200">Primary Button</span>
            </Button>
            
            <Button variant="outline" className="border-2 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:shadow-md group">
              <span className="group-hover:scale-105 transition-transform duration-200">Outline Button</span>
            </Button>
            
            <Button variant="ghost" className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 group">
              <span className="group-hover:scale-105 transition-transform duration-200">Ghost Button</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300 flex items-center justify-center gap-2">
            Enhanced theme system for 
            <span className="font-semibold text-blue-600 dark:text-blue-400">Berdoz Management System</span>
            <span className="text-red-500 dark:text-red-400 animate-pulse text-lg">❤️</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ThemeDemoPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeDemo />
    </ThemeProvider>
  )
}