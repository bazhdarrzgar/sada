import './globals.css'
import { AuthProvider } from '@/components/auth/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/components/ui/language-toggle'
import SchedulerInitializer from '@/components/SchedulerInitializer'

export const metadata = {
  title: 'Berdoz Management System',
  description: 'Comprehensive management system for educational institutions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <ProtectedRoute>
                {children}
                <SchedulerInitializer />
              </ProtectedRoute>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}