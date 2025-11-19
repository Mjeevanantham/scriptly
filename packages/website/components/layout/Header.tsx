'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Why Scriptly', href: '/why-scriptly' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Docs', href: 'https://github.com/thejands/scriptly' },
  { name: 'Community', href: '/community' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg" />
          <span className="font-bold text-lg">Scriptly</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://github.com/thejands/scriptly"
            target="_blank"
            className="px-4 py-2 text-sm border border-slate-700 rounded-lg hover:bg-slate-900 transition"
          >
            GitHub
          </Link>
          <Link
            href="/get-started"
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Download
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-sm text-slate-400 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/get-started"
              className="block px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg text-center"
              onClick={() => setIsOpen(false)}
            >
              Download
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

