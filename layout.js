import './globals.css'

export const metadata = {
  title: 'Berdoz Management System',
  description: 'Comprehensive management system for educational institutions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}