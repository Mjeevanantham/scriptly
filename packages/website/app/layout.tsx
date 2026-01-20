import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://scriptly-ai-ext.vercel.app'),
  title: {
    default: 'Scriptly - Free AI Code Editor',
    template: '%s | Scriptly',
  },
  description:
    'Free, open-source AI IDE with code completion, chat, and unified workspace. Privacy-first alternative to Cursor. 100% free forever.',
  keywords: [
    'AI code editor',
    'free IDE',
    'cursor alternative',
    'open-source IDE',
    'AI coding assistant',
    'code completion',
    'privacy-first IDE',
  ],
  authors: [{ name: 'Scriptly Team' }],
  creator: 'Scriptly',
  publisher: 'Scriptly',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scriptly-ai-ext.vercel.app',
    siteName: 'Scriptly',
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    images: [
      {
        url: 'https://scriptly-ai-ext.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scriptly - Free AI Code Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    images: ['https://scriptly-ai-ext.vercel.app/og-image.png'],
    creator: '@scriptly_dev',
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
  icons: {
    icon: '/ext-logo.png',
    apple: '/ext-logo.png',
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
