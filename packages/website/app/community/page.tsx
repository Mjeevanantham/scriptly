import { Container } from '@/components/common/Container'
import Link from 'next/link'
import { Github, MessageCircle, Twitter } from 'lucide-react'

export const metadata = {
  title: 'Community - Scriptly',
  description: 'Join the Scriptly community',
}

export default function CommunityPage() {
  return (
    <div className="pt-32 pb-20">
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Join the Scriptly Community</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Connect with developers worldwide building the future of coding
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link
            href="https://github.com/thejands/scriptly"
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

