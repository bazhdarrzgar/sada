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
  description: 'Comprehensive management system for educational institutions - سیستەمی بەڕێوبردنی بەردۆز',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' }
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Berdoz'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
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