'use client'

import { Container } from '@/components/common/Container'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is Scriptly really free?',
    answer:
      'Yes, 100% free and open-source forever. No paywalls, no ads, no tracking. We believe great tools should be accessible to everyone.',
  },
  {
    question: 'Where does my code go?',
    answer:
      'Your code NEVER leaves your machine. When you use AI features, only the code you\'re working on goes to your chosen LLM (OpenAI/Claude/Ollama). Scriptly\'s servers are never involved.',
  },
  {
    question: 'Can I use my own API keys?',
    answer:
      'Yes! Bring your own API keys. We never handle billing or payment. You control everything.',
  },
  {
    question: 'How is this different from Cursor?',
    answer:
      'Cursor is $20/month and proprietary. Scriptly is free, open-source, privacy-first, and supports any LLM. See our detailed comparison.',
  },
  {
    question: 'Can I modify Scriptly?',
    answer:
      'Absolutely! MIT license means you can modify, redistribute, and commercialize it if you want.',
  },
  {
    question: 'Is there a web version?',
    answer:
      'Currently VS Code Extension. Desktop app (Phase 2) launching Q2 2026. Web version (Phase 3) Q3 2026.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-slate-900/50">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Common Questions</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Scriptly
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-800 rounded-lg bg-slate-900/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/50 transition rounded-lg"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-slate-400">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

