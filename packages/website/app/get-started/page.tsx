import { Container } from '@/components/common/Container'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata = {
  title: 'Get Started - Scriptly',
  description: 'Get started with Scriptly in 60 seconds',
}

export default function GetStartedPage() {
  return (
    <div className="pt-32 pb-20">
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Get Started in 60 Seconds</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Install Scriptly and start coding with AI assistance
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          <div className="border border-slate-800 rounded-lg p-8 bg-slate-900/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Install Extension (30 seconds)</h3>
                <p className="text-slate-400 mb-4">
                  Install Scriptly from the VS Code Marketplace or download the desktop app.
                </p>
                <Link
                  href="https://marketplace.visualstudio.com/vscode"
                  target="_blank"
                  className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
                >
                  Install from Marketplace
                </Link>
              </div>
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg p-8 bg-slate-900/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Configure API Key (20 seconds)</h3>
                <p className="text-slate-400 mb-4">
                  Add your API key (OpenAI/Claude/Ollama) in settings. Press Cmd+Shift+P and select "Configure API Keys".
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>OpenAI GPT-4</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Anthropic Claude</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Local Ollama</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg p-8 bg-slate-900/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-purple-400">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Start Coding (10 seconds)</h3>
                <p className="text-slate-400 mb-4">
                  Press Tab for completions, Cmd+Shift+L for chat. That's it! You're productive.
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Tab for AI completions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Cmd+Shift+L for chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Git integration included</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

