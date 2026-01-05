'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/common/Container'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-20">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-500/10">
                <AlertTriangle className="w-16 h-16 text-red-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">Something went wrong!</h1>
            <p className="text-xl text-slate-400 mb-4">
              We encountered an unexpected error. Our team has been notified.
            </p>
            {error.message && (
              <p className="text-sm text-slate-500 mb-4">
                Error: {error.message}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}

