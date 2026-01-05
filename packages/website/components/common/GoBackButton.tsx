'use client'

import { ArrowLeft } from 'lucide-react'

export function GoBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="px-6 py-3 border border-slate-700 hover:border-slate-600 hover:bg-slate-900/50 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
    >
      <ArrowLeft className="w-5 h-5" />
      Go Back
    </button>
  )
}

