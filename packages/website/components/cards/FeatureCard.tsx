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
      whileHover={{ y: -8, scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur hover:border-purple-500/50 transition-all duration-300 h-full group cursor-pointer relative overflow-hidden"
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-all duration-300" />
          </motion.div>
          <h3 className="text-lg font-semibold group-hover:text-white transition-colors duration-300">{title}</h3>
        </div>

        <p className="text-slate-400 mb-4 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">{description}</p>

        <ul className="space-y-2.5">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-all duration-300 group/item"
            >
              <motion.span 
                className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"
                whileHover={{ scale: 1.5, boxShadow: "0 0 8px rgba(74, 222, 128, 0.6)" }}
              />
              <span className="group-hover/item:translate-x-1 transition-transform duration-300">{benefit}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

