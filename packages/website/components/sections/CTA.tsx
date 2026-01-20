'use client'

import Link from 'next/link'
import { Container } from '@/components/common/Container'
import InteractiveImage from '@/components/common/InteractiveImage'
import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900/20 via-purple-900/10 to-blue-900/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left space-y-6"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to Code{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Without Boundaries?
              </span>
            </motion.h2>
            <motion.p 
              className="text-xl text-slate-400 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join 50K+ developers. Completely free. Takes 60 seconds to set up.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link
                href="/get-started"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all duration-300 text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 hover:-translate-y-0.5 active:scale-95 text-center relative overflow-hidden group"
              >
                <span className="relative z-10">Download Scriptly Now</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </Link>

              <Link
                href="https://github.com/Mjeevanantham/scriptly"
                target="_blank"
                className="px-8 py-4 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 rounded-lg font-medium transition-all duration-300 text-lg text-center hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg hover:shadow-slate-700/50"
              >
                View on GitHub
              </Link>
            </motion.div>
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
              enableFullscreen={true}
              className="max-w-full"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}

