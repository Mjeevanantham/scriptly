import Link from 'next/link'
import { Container } from '@/components/common/Container'
import { Home, Search } from 'lucide-react'
import { GoBackButton } from '@/components/common/GoBackButton'

export const metadata = {
  title: '404 - Page Not Found | Scriptly',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-20">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
            <p className="text-xl text-slate-400 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            <Link
              href="/get-started"
              className="px-6 py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Get Started
            </Link>
            <GoBackButton />
          </div>

          <div className="border-t border-slate-800 pt-8">
            <p className="text-slate-500 mb-4">Popular Pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/features"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                Features
              </Link>
              <Link
                href="/why-scriptly"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                Why Scriptly
              </Link>
              <Link
                href="/pricing"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                Pricing
              </Link>
              <Link
                href="/community"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                Community
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
