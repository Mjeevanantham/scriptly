import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import Comparison from '@/components/sections/Comparison'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scriptly - Free AI Code Editor | Code Without Boundaries',
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
    'free code editor',
  ],
  openGraph: {
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    url: 'https://scriptly.jeevanantham.site',
    siteName: 'Scriptly',
    images: [
      {
        url: 'https://scriptly.jeevanantham.site/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scriptly - Free AI Code Editor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    images: ['https://scriptly.jeevanantham.site/og-image.png'],
    creator: '@scriptly_dev',
  },
  alternates: {
    canonical: 'https://scriptly.jeevanantham.site',
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
}

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Scriptly',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free, open-source AI IDE with code completion, chat, and unified workspace',
    url: 'https://scriptly.jeevanantham.site',
    author: {
      '@type': 'Organization',
      name: 'Scriptly',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Features />
      <Comparison />
      <FAQ />
      <CTA />
    </>
  )
}
