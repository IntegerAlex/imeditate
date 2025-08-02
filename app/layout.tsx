import type { Metadata, Viewport } from 'next'
import './globals.css'

// Enhanced Typography Setup - Fallback to system fonts for now
// const inter = Inter({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-inter',
//   weight: ['200', '300', '400', '500', '600'],
// })

// const quicksand = Quicksand({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-quicksand',
//   weight: ['300', '400', '500', '600', '700'],
// })

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  )
}
