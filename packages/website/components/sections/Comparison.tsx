'use client'

import { Container } from '@/components/common/Container'
import { Check, X } from 'lucide-react'

const comparison = [
  { feature: 'Price', scriptly: 'FREE', cursor: '$20/mo', copilot: '$10/mo', vscode: 'FREE' },
  { feature: 'Open Source', scriptly: true, cursor: false, copilot: false, vscode: true },
  { feature: 'Privacy', scriptly: true, cursor: false, copilot: false, vscode: true },
  { feature: 'Multi-Model', scriptly: true, cursor: false, copilot: false, vscode: false },
  { feature: 'Unified Workspace', scriptly: true, cursor: false, copilot: false, vscode: false },
  { feature: 'Customizable', scriptly: true, cursor: false, copilot: false, vscode: true },
]

export default function Comparison() {
  return (
    <section className="py-20 bg-slate-950">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Built Different. Built Better.</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See how Scriptly compares to the competition
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400">Feature</th>
                <th className="text-center p-4 font-bold text-purple-400">Scriptly</th>
                <th className="text-center p-4 text-slate-400">Cursor</th>
                <th className="text-center p-4 text-slate-400">GitHub Copilot</th>
                <th className="text-center p-4 text-slate-400">VS Code</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, index) => (
                <tr key={index} className="border-b border-slate-800 hover:bg-slate-900/50 transition">
                  <td className="p-4 text-slate-300">{row.feature}</td>
                  <td className="p-4 text-center">
                    {typeof row.scriptly === 'boolean' ? (
                      row.scriptly ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )
                    ) : (
                      <span className="font-medium">{row.scriptly}</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-slate-400">
                    {typeof row.cursor === 'boolean' ? (
                      row.cursor ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )
                    ) : (
                      row.cursor
                    )}
                  </td>
                  <td className="p-4 text-center text-slate-400">
                    {typeof row.copilot === 'boolean' ? (
                      row.copilot ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )
                    ) : (
                      row.copilot
                    )}
                  </td>
                  <td className="p-4 text-center text-slate-400">
                    {typeof row.vscode === 'boolean' ? (
                      row.vscode ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )
                    ) : (
                      row.vscode
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  )
}

