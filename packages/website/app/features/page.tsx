import Features from '@/components/sections/Features'
import CTA from '@/components/sections/CTA'

export const metadata = {
  title: 'Features - Scriptly',
  description: 'Discover all the powerful features Scriptly offers',
}

export default function FeaturesPage() {
  return (
    <>
      <div className="pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Everything You Need</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed for modern development workflows
          </p>
        </div>
      </div>
      <Features />
      <CTA />
    </>
  )
}

