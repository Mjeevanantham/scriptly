'use client'

import Link from 'next/link'
import { Container } from '@/components/common/Container'

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
      <Container>
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Ready to Code Without Boundaries?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join 50K+ developers. Completely free. Takes 60 seconds to set up.
          </p>

          <div className="flex gap-4 justify-center pt-6">
            <Link
              href="/get-started"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition text-lg"
            >
              Download Scriptly Now
            </Link>

            <Link
              href="https://github.com/thejands/scriptly"
              target="_blank"
              className="px-8 py-4 border border-slate-700 hover:bg-slate-900 rounded-lg font-medium transition text-lg"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}

