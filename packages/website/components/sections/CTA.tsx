'use client'

import Link from 'next/link'
import { Container } from '@/components/common/Container'
import InteractiveImage from '@/components/common/InteractiveImage'
import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900/20 via-purple-900/10 to-blue-900/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
      
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Code Without Boundaries?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl">
              Join 50K+ developers. Completely free. Takes 60 seconds to set up.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/get-started"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 text-center"
              >
                Download Scriptly Now
              </Link>

              <Link
                href="https://github.com/Mjeevanantham/scriptly"
                target="_blank"
                className="px-8 py-4 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 rounded-lg font-medium transition-all text-lg text-center"
              >
                View on GitHub
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <InteractiveImage
              src="/images/above-footer-image.png"
              alt="Scriptly IDE features showcase - showing advanced coding capabilities and AI-powered assistance"
              width={1200}
              height={800}
              enableZoom={true}
              enableFullscreen={true}
              hoverEffect={true}
              className="max-w-full"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

