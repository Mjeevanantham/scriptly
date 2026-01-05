# SCRIPTLY - Website Implementation Guide (Next.js + Tailwind)

**Version:** 1.0  
**Date:** November 18, 2025  
**Framework:** Next.js 14 + TypeScript + Tailwind CSS + Shadcn/UI  
**Deployment:** Vercel  

---

## Project Structure

```
scriptly-website/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── features/
│   │   └── page.tsx
│   ├── why-scriptly/
│   │   └── page.tsx
│   ├── get-started/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── community/
│   │   └── page.tsx
│   └── api/
│       ├── newsletter/
│       │   └── route.ts
│       └── contact/
│           └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Comparison.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── UseCases.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx
│   │   └── CTA.tsx
│   ├── cards/
│   │   ├── FeatureCard.tsx
│   │   ├── TestimonialCard.tsx
│   │   ├── PricingCard.tsx
│   │   └── UseCaseCard.tsx
│   └── common/
│       ├── Button.tsx
│       └── Container.tsx
│
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   └── types.ts
│
├── public/
│   ├── images/
│   │   ├── hero.png
│   │   ├── features/
│   │   └── testimonials/
│   └── icons/
│
├── styles/
│   └── globals.css
│
├── config/
│   ├── site.config.ts
│   └── navigation.ts
│
├── .env.local              # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Setup Commands

```bash
# Create Next.js project
npx create-next-app@latest scriptly-website --typescript --tailwind

# Install dependencies
npm install -D shadcn-ui
npm install framer-motion react-icons axios

# Add shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea

# Development
npm run dev

# Production build
npm run build
npm start

# Deploy to Vercel
vercel deploy
```

---

## Core Files

### 1. app/layout.tsx

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scriptly - Free AI Code Editor',
  description: 'Free, open-source AI IDE with code completion, chat, and unified workspace. Privacy-first alternative to Cursor.',
  keywords: 'AI code editor, free IDE, cursor alternative, open-source',
  openGraph: {
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    url: 'https://scriptly-ai-ext.vercel.app',
    siteName: 'Scriptly',
    images: [
      {
        url: 'https://scriptly-ai-ext.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scriptly - Code Without Boundaries',
    description: 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.',
    images: ['https://scriptly-ai-ext.vercel.app/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
```

---

### 2. app/page.tsx (Landing Page)

```typescript
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import Problem from '@/components/sections/Problem'
import Comparison from '@/components/sections/Comparison'
import HowItWorks from '@/components/sections/HowItWorks'
import UseCases from '@/components/sections/UseCases'
import Testimonials from '@/components/sections/Testimonials'
import Pricing from '@/components/sections/Pricing'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Features />
      <Comparison />
      <HowItWorks />
      <UseCases />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  )
}
```

---

### 3. components/sections/Hero.tsx

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-slate-950 to-slate-950" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                Code Without{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Boundaries
                </span>
              </h1>
              
              <p className="text-xl text-slate-400">
                Free AI IDE. Unified Workspace. Your Privacy. Your Code.
              </p>
              
              <p className="text-lg text-slate-500">
                One place for code, research, deployment, and collaboration. No paywall. No tracking. No compromises.
              </p>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-green-400">✅</span>
                <span>100% Free & Open-Source</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-green-400">✅</span>
                <span>50K+ Developers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-green-400">✅</span>
                <span>Privacy-First</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-green-400">✅</span>
                <span>Multi-Model Support</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-4 pt-6">
              <Link href="/get-started">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Download Now
                </Button>
              </Link>
              
              <Link href="https://github.com/thejands/scriptly" target="_blank">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-900"
                >
                  View on GitHub
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Hero image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-96 rounded-lg border border-slate-700 bg-slate-900/50 backdrop-blur overflow-hidden">
              <Image
                src="/images/hero-screenshot.png"
                alt="Scriptly IDE"
                fill
                className="object-cover"
                priority
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-slate-500">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-purple-500 rounded-full mt-2" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

---

### 4. components/sections/Features.tsx

```typescript
'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/common/Container'
import FeatureCard from '@/components/cards/FeatureCard'
import { 
  Zap, 
  MessageSquare, 
  Link2, 
  Terminal, 
  Boxes, 
  Lock 
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Intelligent Completion',
    description: 'Smart Tab suggestions that understand your context. Get multi-line predictions, not just autocomplete.',
    benefits: [
      'Learn your code style',
      'Context-aware suggestions',
      '<500ms response time',
      'Works offline'
    ]
  },
  {
    icon: MessageSquare,
    title: 'Ask & Learn',
    description: 'Ask questions about your code. Get explanations, fixes, and refactoring suggestions instantly.',
    benefits: [
      'Understand complex code',
      'Get refactoring suggestions',
      'Ask about best practices',
      '24/7 availability'
    ]
  },
  {
    icon: Link2,
    title: 'Unified Workspace',
    description: 'Stop context-switching. Frontend, backend, research, deployment—all in one unified environment.',
    benefits: [
      'File explorer & git',
      'Embedded web browser',
      'Terminal integration',
      'Deployment helpers'
    ]
  },
  {
    icon: Terminal,
    title: 'Integrated Terminal',
    description: 'Run commands without leaving the IDE. Deploy to any platform directly.',
    benefits: [
      'No context switching',
      'Deploy instantly',
      'Test locally',
      'Manage dependencies'
    ]
  },
  {
    icon: Boxes,
    title: 'Use Any LLM',
    description: 'Multi-model support means you control which AI powers your coding.',
    benefits: [
      'OpenAI GPT-4',
      'Anthropic Claude',
      'Local Ollama',
      'Custom endpoints'
    ]
  },
  {
    icon: Lock,
    title: 'Privacy-First',
    description: 'Your code never leaves your machine. Bring your own API keys. Full transparency.',
    benefits: [
      'On-premises processing',
      'No tracking',
      'Your API keys',
      'Open-source verification'
    ]
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-slate-900/50">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to Code Better
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed for modern development workflows
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
```

---

### 5. components/cards/FeatureCard.tsx

```typescript
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
  benefits
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
          <li key={index} className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-1 h-1 bg-green-400 rounded-full" />
            {benefit}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
```

---

### 6. components/layout/Header.tsx

```typescript
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg" />
          <span className="font-bold text-lg">Scriptly</span>
        </Link>

        {/* Desktop navigation */}
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

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="https://github.com/thejands/scriptly" target="_blank">
            <Button variant="outline" size="sm">
              GitHub
            </Button>
          </Link>
          <Link href="/get-started">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Download
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
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

      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-sm text-slate-400 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/get-started">
              <Button className="w-full">Download</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
```

---

### 7. components/layout/Footer.tsx

```typescript
import Link from 'next/link'
import { Github, Twitter, Mail, Linkedin } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Download', href: '/get-started' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Roadmap', href: 'https://github.com/thejands/scriptly/projects' },
  ],
  Community: [
    { name: 'Discord', href: 'https://discord.gg/scriptly' },
    { name: 'GitHub', href: 'https://github.com/thejands/scriptly' },
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
    { name: 'License', href: 'https://github.com/thejands/scriptly/blob/main/LICENSE' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Scriptly</h3>
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
            <Link href="https://twitter.com/scriptly_dev" target="_blank">
              <Twitter className="w-5 h-5 text-slate-400 hover:text-white" />
            </Link>
            <Link href="https://github.com/thejands/scriptly" target="_blank">
              <Github className="w-5 h-5 text-slate-400 hover:text-white" />
            </Link>
            <Link href="https://discord.gg/scriptly" target="_blank">
              <Mail className="w-5 h-5 text-slate-400 hover:text-white" />
            </Link>
            <Link href="https://linkedin.com/company/scriptly" target="_blank">
              <Linkedin className="w-5 h-5 text-slate-400 hover:text-white" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

---

### 8. lib/constants.ts

```typescript
export const SITE_NAME = 'Scriptly'
export const SITE_DESCRIPTION = 'Free AI IDE. Unified Workspace. Your Privacy. Your Code.'
export const SITE_URL = 'https://scriptly-ai-ext.vercel.app'

export const BRAND_COLORS = {
  primary: '#7C3AED',    // Purple
  secondary: '#3B82F6',  // Blue
  accent: '#10B981',     // Green
}

export const FEATURES = [
  {
    id: 'completion',
    title: 'Intelligent Completion',
    description: 'Multi-line predictions powered by AI'
  },
  {
    id: 'chat',
    title: 'AI Chat',
    description: 'Ask questions about your code'
  },
  {
    id: 'unified',
    title: 'Unified Workspace',
    description: 'Everything in one place'
  },
  // ... more features
]
```

---

### 9. tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#030712',
        },
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [require('tailwindcss/plugin')],
}

export default config
```

---

## Environment Variables (.env.local)

```
NEXT_PUBLIC_SITE_URL=https://scriptly-ai-ext.vercel.app
NEXT_PUBLIC_GA_ID=G_XXXXXXXXX  # Google Analytics ID

# For newsletter/contact form
SENDGRID_API_KEY=SG_XXXXXXXXX
CONTACT_EMAIL=contact@scriptly-ai-ext.vercel.app

# For CMS (if using Sanity)
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=xxxxx
```

---

## SEO Optimization

### robots.txt

```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://scriptly-ai-ext.vercel.app/sitemap.xml
```

### sitemap.xml (Auto-generated)

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://scriptly-ai-ext.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://scriptly-ai-ext.vercel.app/features',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://scriptly-ai-ext.vercel.app/why-scriptly',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // ... more pages
  ]
}
```

---

## Analytics Implementation

### app/layout.tsx (already added)

```typescript
import { Analytics } from "@vercel/analytics/react"

// In return:
<Analytics />
```

### Google Analytics Script

```typescript
// lib/gtag.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

export const event = (action: string, category: string, label: string, value: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
```

---

## Deployment to Vercel

```bash
# Login
vercel login

# Deploy
vercel deploy --prod

# Or automatic deploy from GitHub:
# 1. Push to GitHub
# 2. Connect repo to Vercel
# 3. Auto-deploy on push
```

---

## Performance Optimization Checklist

- [ ] Image optimization (next/image)
- [ ] Code splitting with dynamic imports
- [ ] Font optimization
- [ ] CSS minimization
- [ ] Remove unused CSS
- [ ] Lazy load components
- [ ] Optimize LCP (Largest Contentful Paint)
- [ ] Use WebP images
- [ ] Compress assets
- [ ] Enable gzip compression

---

## Next Steps

1. ✅ Setup Next.js project
2. ✅ Create all page components
3. ✅ Integrate CMS (Sanity)
4. ✅ Setup analytics
5. ✅ Optimize for SEO
6. ✅ Deploy to Vercel
7. ✅ Test on all devices
8. ✅ Monitor performance
9. ✅ Run A/B tests
10. ✅ Gather user feedback

**Estimated Timeline:** 1-2 weeks to full launch-ready website
