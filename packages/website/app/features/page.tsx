import Features from '@/components/sections/Features'
import CTA from '@/components/sections/CTA'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Container } from '@/components/common/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - Scriptly | AI Code Editor Features',
  description:
    'Discover all the powerful features Scriptly offers: intelligent completion, AI chat, unified workspace, integrated terminal, multi-model support, and privacy-first architecture.',
  keywords: [
    'Scriptly features',
    'AI code completion',
    'code editor features',
    'IDE features',
    'AI coding assistant',
  ],
  openGraph: {
    title: 'Features - Scriptly',
    description: 'Discover all the powerful features Scriptly offers',
    url: 'https://scriptly.jeevanantham.site/features',
    siteName: 'Scriptly',
  },
  alternates: {
    canonical: 'https://scriptly.jeevanantham.site/features',
  },
}

export default function FeaturesPage() {
  return (
    <>
      <div className="pt-32 pb-20">
        <Container>
          <Breadcrumbs items={[{ label: 'Features' }]} />
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Everything You Need</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed for modern development workflows
            </p>
          </div>
        </Container>
      </div>
      <Features />
      <CTA />
    </>
  )
}

