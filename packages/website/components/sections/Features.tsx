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
    <section className="py-20 bg-slate-900/50">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to Code Better
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed for modern development workflows
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
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

