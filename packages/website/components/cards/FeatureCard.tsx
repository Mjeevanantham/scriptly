'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  benefits: string[]
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  benefits,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-lg bg-purple-500/10">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <p className="text-slate-400 mb-4">{description}</p>

      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-slate-500"
          >
            <span className="w-1 h-1 bg-green-400 rounded-full" />
            {benefit}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

