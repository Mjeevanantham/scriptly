import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Mail, Linkedin } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Download', href: '/get-started' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    {
      name: 'Roadmap',
      href: 'https://github.com/Mjeevanantham/scriptly/projects',
    },
  ],
  Community: [
    { name: 'Discord', href: 'https://discord.gg/scriptly' },
    { name: 'GitHub', href: 'https://github.com/Mjeevanantham/scriptly' },
    { name: 'Twitter', href: 'https://twitter.com/scriptly_dev' },
    { name: 'Reddit', href: 'https://reddit.com/r/scriptly' },
  ],
  Resources: [
    { name: 'Docs', href: 'https://docs.scriptly-ai-ext.vercel.app' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contributing', href: '/contributing' },
    { name: 'Press', href: '/press' },
  ],
  Legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    {
      name: 'License',
      href: 'https://github.com/Mjeevanantham/scriptly/blob/main/LICENSE',
    },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity inline-block">
              <Image
                src="/primary_logo.png"
                alt="Scriptly Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h3 className="font-bold">Scriptly</h3>
            </Link>
            <p className="text-sm text-slate-400">
              Free AI IDE built for developers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      className="text-sm text-slate-400 hover:text-white transition"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2025 Thejands. Scriptly is MIT Licensed.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com/scriptly_dev"
              target="_blank"
              className="text-slate-400 hover:text-white transition"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/Mjeevanantham/scriptly"
              target="_blank"
              className="text-slate-400 hover:text-white transition"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="mailto:contact@scriptly-ai-ext.vercel.app"
              className="text-slate-400 hover:text-white transition"
            >
              <Mail className="w-5 h-5" />
            </Link>
            <Link
              href="https://linkedin.com/company/scriptly"
              target="_blank"
              className="text-slate-400 hover:text-white transition"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

