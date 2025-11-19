import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePage } from '../hooks/usePage'

export const LoginPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState<'openai' | 'claude' | 'ollama'>('openai')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (window.vscode) {
        window.vscode.postMessage({
          command: 'configureAPI',
          provider,
          apiKey,
        })

        // Wait for response
        const listener = (event: MessageEvent) => {
          const message = event.data
          if (message.command === 'apiKeyConfigured') {
            if (message.success) {
              login()
            } else {
              setError(message.error || 'Failed to configure API key')
            }
            setIsLoading(false)
            window.removeEventListener('message', listener)
          }
        }
        window.addEventListener('message', listener)
      } else {
        // Fallback: just login (for testing)
        setTimeout(() => {
          login()
          setIsLoading(false)
        }, 500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page flex items-center justify-center h-full p-8">
      <div className="login-container w-full max-w-md">
        <div className="login-header text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">SCRIPTLY</h1>
          <p className="text-sm opacity-70">Enter your API key to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form space-y-4">
          <div>
            <label className="block text-sm mb-2">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full p-2 bg-input-background border border-border rounded"
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Anthropic Claude</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full p-2 bg-input-background border border-border rounded"
              required
            />
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (provider === 'openai') {
                  window.open('https://platform.openai.com/api-keys', '_blank')
                } else if (provider === 'claude') {
                  window.open('https://console.anthropic.com/', '_blank')
                }
              }}
              className="text-xs text-link mt-1 inline-block"
            >
              Get API Key →
            </a>
          </div>

          {error && (
            <div className="error-message text-sm text-error bg-error-bg p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !apiKey}
            className="w-full p-3 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Configuring...' : 'Continue'}
          </button>
        </form>

        <p className="text-xs text-center mt-6 opacity-60">
          Your API key is stored locally and never shared
        </p>
      </div>
    </div>
  )
}

