import Comparison from '@/components/sections/Comparison'
import CTA from '@/components/sections/CTA'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Container } from '@/components/common/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why Scriptly - Free vs Cursor, Copilot, VS Code',
  description:
    'Why choose Scriptly over other AI code editors. Compare Scriptly with Cursor, GitHub Copilot, and VS Code. Free, open-source, privacy-first alternative.',
  keywords: [
    'Scriptly vs Cursor',
    'Scriptly vs Copilot',
    'free AI code editor',
    'cursor alternative',
    'open-source IDE',
  ],
  openGraph: {
    title: 'Why Scriptly - Compare with Competitors',
    description: 'Why choose Scriptly over other AI code editors',
    url: 'https://scriptly.jeevanantham.site/why-scriptly',
    siteName: 'Scriptly',
  },
  alternates: {
    canonical: 'https://scriptly.jeevanantham.site/why-scriptly',
  },
}

export default function WhyScriptlyPage() {
  return (
    <>
      <div className="pt-32 pb-20">
        <Container>
          <Breadcrumbs items={[{ label: 'Why Scriptly' }]} />
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Why Choose Scriptly?</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Free, open-source, and privacy-first. Built by developers, for developers.
            </p>
          </div>
        </Container>
      </div>
      <Comparison />
      <CTA />
    </>
  )
}

