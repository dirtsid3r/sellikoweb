import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'
import './globals.css'
import { ClientProviders } from '@/components/providers/client-providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#007AFF' },
    { media: '(prefers-color-scheme: dark)', color: '#007AFF' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'SELLIKO - Mobile Device Resale Auction Platform',
    template: '%s | SELLIKO',
  },
  description: 'Kerala\'s premier mobile device resale auction platform. Sell your used phones, tablets, and gadgets through secure auctions with verified buyers.',
  keywords: [
    'mobile resale',
    'phone auction', 
    'Kerala marketplace',
    'used mobile phones',
    'device resale',
    'auction platform',
    'selliko',
  ],
  authors: [{ name: 'SELLIKO Team' }],
  creator: 'SELLIKO',
  publisher: 'SELLIKO',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://selliko.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://selliko.com',
    siteName: 'SELLIKO',
    title: 'SELLIKO - Mobile Device Resale Auction Platform',
    description: 'Kerala\'s premier mobile device resale auction platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SELLIKO - Mobile Device Resale Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SELLIKO - Mobile Device Resale Auction Platform',
    description: 'Kerala\'s premier mobile device resale auction platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${plusJakartaSans.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SELLIKO" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#007AFF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body 
        className={`${plusJakartaSans.className} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ClientProviders>
          {/* Main app container */}
          <div className="relative min-h-screen">
            {children}
          </div>
          
          {/* Preline JS initialization script */}
          <script 
            defer 
            src="/node_modules/preline/preline.js"
          />
        </ClientProviders>
      </body>
    </html>
  )
} 