'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import InteractiveImage from '@/components/common/InteractiveImage'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-slate-950 to-slate-950" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                Code Without{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Boundaries
                </span>
              </h1>

              <p className="text-xl text-slate-400">
                Free AI IDE. Unified Workspace. Your Privacy. Your Code.
              </p>

              <p className="text-lg text-slate-500">
                One place for code, research, deployment, and collaboration. No
                paywall. No tracking. No compromises.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <span className="text-green-400 text-lg">✓</span>
                <span>100% Free & Open-Source</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <span className="text-green-400 text-lg">✓</span>
                <span>50K+ Developers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <span className="text-green-400 text-lg">✓</span>
                <span>Privacy-First</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <span className="text-green-400 text-lg">✓</span>
                <span>Multi-Model Support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/get-started"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 text-center"
              >
                Download Now
              </Link>

              <Link
                href="https://github.com/Mjeevanantham/scriptly"
                target="_blank"
                className="px-6 py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 rounded-lg font-medium transition-all text-center"
              >
                View on GitHub
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <InteractiveImage
              src="/images/scriptly-hero-image.png"
              alt="Scriptly IDE - AI-powered code editor interface with intelligent completion, chat, and unified workspace"
              width={1200}
              height={800}
              priority
              enableFullscreen={true}
              className="shadow-2xl"
            />
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-slate-500">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-purple-500 rounded-full mt-2" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

