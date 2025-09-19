import './globals.css'
import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/components/ui/language-toggle'
import { ZoomProvider } from '@/components/ui/zoom-context'
import SchedulerInitializer from '@/components/SchedulerInitializer'
import { Toaster } from '@/components/ui/sonner'
import SimpleAuth from '@/components/auth/SimpleAuth'
import { ProfileProvider } from '@/components/profile/ProfileContext'

export const metadata = {
  title: 'Berdoz Management System',
  description: 'Comprehensive management system for educational institutions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <ZoomProvider>
            <LanguageProvider>
              <SimpleAuth>
                <ProfileProvider>
                  {children}
                  <SchedulerInitializer />
                  <Toaster position="top-right" />
                </ProfileProvider>
              </SimpleAuth>
            </LanguageProvider>
          </ZoomProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}