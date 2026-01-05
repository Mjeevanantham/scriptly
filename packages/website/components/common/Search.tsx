'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X, Command } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  title: string
  href: string
  description?: string
}

const searchData: SearchResult[] = [
  {
    title: 'Home',
    href: '/',
    description: 'Main landing page',
  },
  {
    title: 'Features',
    href: '/features',
    description: 'Discover all the powerful features Scriptly offers',
  },
  {
    title: 'Why Scriptly',
    href: '/why-scriptly',
    description: 'Why choose Scriptly over other AI code editors',
  },
  {
    title: 'Get Started',
    href: '/get-started',
    description: 'Get started with Scriptly in 60 seconds',
  },
  {
    title: 'Pricing',
    href: '/pricing',
    description: 'Simple, transparent pricing for Scriptly',
  },
  {
    title: 'Community',
    href: '/community',
    description: 'Join the Scriptly community',
  },
]

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTerm = query.toLowerCase()
    const filtered = searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
    )
    setResults(filtered.slice(0, 6))
  }, [query])

  const handleSelect = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-lg hover:border-slate-600 hover:bg-slate-900/50 transition-all text-sm text-slate-400"
        aria-label="Open search"
      >
        <SearchIcon className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-700 rounded">
          <Command className="w-3 h-3" />
          K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Search Modal */}
      <div
        ref={containerRef}
        className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-32 md:w-full md:max-w-2xl z-50"
      >
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-800">
            <SearchIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="flex-1 bg-transparent outline-none text-white placeholder-slate-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-800 border border-slate-700 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query && results.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No results found for &quot;{query}&quot;</p>
              </div>
            ) : query && results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.href}
                    onClick={() => handleSelect(result.href)}
                    className="block px-4 py-3 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="font-medium text-white">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-slate-400 mt-1">
                        {result.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p>Start typing to search...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

