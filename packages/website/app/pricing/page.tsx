import { Container } from '@/components/common/Container'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Scriptly | Free Forever',
  description:
    'Scriptly is 100% free forever. No paywalls, no subscriptions, no hidden fees. Simple, transparent pricing for developers.',
  keywords: [
    'Scriptly pricing',
    'free IDE',
    'free code editor',
    'Scriptly cost',
    'free AI code editor',
  ],
  openGraph: {
    title: 'Pricing - Scriptly',
    description: 'Simple, transparent pricing for Scriptly',
    url: 'https://scriptly.jeevanantham.site/pricing',
    siteName: 'Scriptly',
  },
  alternates: {
    canonical: 'https://scriptly.jeevanantham.site/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="pt-32 pb-20">
      <Container>
        <Breadcrumbs items={[{ label: 'Pricing' }]} />
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Free forever. Always open-source.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="border border-purple-500/50 rounded-lg p-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">FREE</h2>
              <p className="text-xl text-slate-400">For everyone, forever</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Code completion',
                'AI chat',
                'File explorer',
                'Git integration',
                'Terminal',
                'Multi-model support',
                'No tracking',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center">
              <Link
                href="/get-started"
                className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
              >
                Download Now
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
              <p>Pricing coming Phase 3 (Month 6).</p>
              <p>Until then, enjoy Scriptly completely free with zero limitations.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

