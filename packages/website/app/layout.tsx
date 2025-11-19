import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scriptly - Free AI Code Editor',
  description:
    'Free, open-source AI IDE with code completion, chat, and unified workspace. Privacy-first alternative to Cursor.',
  keywords: 'AI code editor, free IDE, cursor alternative, open-source',
  openGraph: {
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    url: 'https://scriptly.dev',
    siteName: 'Scriptly',
    images: [
      {
        url: 'https://scriptly.dev/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    images: ['https://scriptly.dev/og-image.png'],
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
