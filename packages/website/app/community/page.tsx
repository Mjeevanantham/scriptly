import { Container } from '@/components/common/Container'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import Link from 'next/link'
import { Github, MessageCircle, Twitter } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community - Scriptly | Join Our Developer Community',
  description:
    'Join the Scriptly community. Connect with developers on GitHub, Discord, and Twitter. Get help, share projects, and contribute to open-source.',
  keywords: [
    'Scriptly community',
    'Scriptly Discord',
    'Scriptly GitHub',
    'Scriptly support',
    'open-source community',
  ],
  openGraph: {
    title: 'Community - Scriptly',
    description: 'Join the Scriptly community',
    url: 'https://scriptly.jeevanantham.site/community',
    siteName: 'Scriptly',
  },
  alternates: {
    canonical: 'https://scriptly.jeevanantham.site/community',
  },
}

export default function CommunityPage() {
  return (
    <div className="pt-32 pb-20">
      <Container>
        <Breadcrumbs items={[{ label: 'Community' }]} />
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Join the Scriptly Community</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Connect with developers worldwide building the future of coding
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link
            href="https://github.com/Mjeevanantham/scriptly"
            target="_blank"
            className="border border-slate-800 rounded-lg p-8 bg-slate-900/50 hover:border-purple-500/50 transition group"
          >
            <Github className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold mb-2">GitHub</h3>
            <p className="text-slate-400">
              Contribute to Scriptly, report issues, and request features
            </p>
          </Link>

          <Link
            href="https://discord.gg/scriptly"
            target="_blank"
            className="border border-slate-800 rounded-lg p-8 bg-slate-900/50 hover:border-purple-500/50 transition group"
          >
            <MessageCircle className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold mb-2">Discord</h3>
            <p className="text-slate-400">
              Chat with the community, get help, and share projects
            </p>
          </Link>

          <Link
            href="https://twitter.com/scriptly_dev"
            target="_blank"
            className="border border-slate-800 rounded-lg p-8 bg-slate-900/50 hover:border-purple-500/50 transition group"
          >
            <Twitter className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold mb-2">Twitter</h3>
            <p className="text-slate-400">
              Follow updates, announcements, and coding tips
            </p>
          </Link>
        </div>
      </Container>
    </div>
  )
}

