'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/common/Container'
import FeatureCard from '@/components/cards/FeatureCard'
import {
  Zap,
  MessageSquare,
  Link2,
  Terminal,
  Boxes,
  Lock,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Intelligent Completion',
    description:
      'Smart Tab suggestions that understand your context. Get multi-line predictions, not just autocomplete.',
    benefits: [
      'Learn your code style',
      'Context-aware suggestions',
      '<500ms response time',
      'Works offline',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Ask & Learn',
    description:
      'Ask questions about your code. Get explanations, fixes, and refactoring suggestions instantly.',
    benefits: [
      'Understand complex code',
      'Get refactoring suggestions',
      'Ask about best practices',
      '24/7 availability',
    ],
  },
  {
    icon: Link2,
    title: 'Unified Workspace',
    description:
      'Stop context-switching. Frontend, backend, research, deployment—all in one unified environment.',
    benefits: [
      'File explorer & git',
      'Embedded web browser',
      'Terminal integration',
      'Deployment helpers',
    ],
  },
  {
    icon: Terminal,
    title: 'Integrated Terminal',
    description:
      'Run commands without leaving the IDE. Deploy to any platform directly.',
    benefits: [
      'No context switching',
      'Deploy instantly',
      'Test locally',
      'Manage dependencies',
    ],
  },
  {
    icon: Boxes,
    title: 'Use Any LLM',
    description:
      'Multi-model support means you control which AI powers your coding.',
    benefits: [
      'OpenAI GPT-4',
      'Anthropic Claude',
      'Local Ollama',
      'Custom endpoints',
    ],
  },
  {
    icon: Lock,
    title: 'Privacy-First',
    description:
      'Your code never leaves your machine. Bring your own API keys. Full transparency.',
    benefits: [
      'On-premises processing',
      'No tracking',
      'Your API keys',
      'Open-source verification',
    ],
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-slate-900/50 relative overflow-hidden">
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative z-10"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Code Better
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Powerful features designed for modern development workflows
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}

