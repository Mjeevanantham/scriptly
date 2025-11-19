import Comparison from '@/components/sections/Comparison'
import CTA from '@/components/sections/CTA'

export const metadata = {
  title: 'Why Scriptly - Scriptly',
  description: 'Why choose Scriptly over other AI code editors',
}

export default function WhyScriptlyPage() {
  return (
    <>
      <div className="pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Why Choose Scriptly?</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Free, open-source, and privacy-first. Built by developers, for developers.
          </p>
        </div>
      </div>
      <Comparison />
      <CTA />
    </>
  )
}

