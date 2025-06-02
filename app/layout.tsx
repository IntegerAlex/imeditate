import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'iMeditate',
  description: 'Relax and reset',
  generator: 'iMeditate',
  icons: {
    icon: '/favicon.ico',
  },
}

// New viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* Removed <Head> component and its contents */}
      <body className="font-inter min-h-screen bg-white">{children}</body>
    </html>
  )
}
