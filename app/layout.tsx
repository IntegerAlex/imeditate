import type { Metadata } from 'next'
import Head from 'next/head'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ffffff',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload the font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Allow embedding in iframes */}
        <meta httpEquiv="X-Frame-Options" content="ALLOW-FROM *" />
      </Head>
      <body className="font-inter min-h-screen bg-white">{children}</body>
    </html>
  )
}
