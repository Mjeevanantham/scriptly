import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePage } from '../hooks/usePage'
import {
  Button,
  Input,
  PasswordInput,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../components/ui'

type Provider = 'openai' | 'claude' | 'ollama'

interface ValidationErrors {
  apiKey?: string
  provider?: string
}

interface LoginFormData {
  provider: Provider
  apiKey: string
  rememberMe: boolean
}

const providerConfigs = {
  openai: {
    name: 'OpenAI',
    description: 'Access GPT models through OpenAI API',
    placeholder: 'sk-...',
    pattern: /^sk-[a-zA-Z0-9]{48}$/,
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Get your API key from OpenAI Platform',
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Access Claude models through Anthropic API',
    placeholder: 'sk-ant-...',
    pattern: /^sk-ant-[a-zA-Z0-9_-]{95}$/,
    helpUrl: 'https://console.anthropic.com/',
    helpText: 'Get your API key from Anthropic Console',
  },
  ollama: {
    name: 'Ollama (Local)',
    description: 'Run models locally with Ollama',
    placeholder: 'Enter Ollama server URL',
    pattern: /^https?:\/\/.+/,
    helpUrl: 'https://ollama.ai/',
    helpText: 'Install and run Ollama locally',
  },
}

const validateApiKey = (provider: Provider, apiKey: string): string | null => {
  if (!apiKey.trim()) {
    return 'API key is required'
  }

  const config = providerConfigs[provider]
  if (provider !== 'ollama' && !config.pattern.test(apiKey)) {
    return `Invalid API key format for ${config.name}`
  }

  if (provider === 'ollama' && !config.pattern.test(apiKey)) {
    return 'Please enter a valid URL (e.g., http://localhost:11434)'
  }

  return null
}

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    provider: 'openai',
    apiKey: '',
    rememberMe: false,
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle')
  const [connectionMessage, setConnectionMessage] = useState('')

  const { login } = useAuth()
  const { goToPage } = usePage()

  // Clear errors when provider changes
  useEffect(() => {
    setValidationErrors({})
    setLoginError('')
    setConnectionStatus('idle')
    setConnectionMessage('')
  }, [formData.provider])

  // Auto-test connection when API key changes (for non-local providers)
  useEffect(() => {
    if (formData.apiKey && formData.provider !== 'ollama') {
      const timeoutId = setTimeout(() => {
        testConnection()
      }, 1000) // Debounce connection test

      return () => clearTimeout(timeoutId)
    }
  }, [formData.apiKey, formData.provider])

  const testConnection = async () => {
    if (!formData.apiKey.trim()) return

    setConnectionStatus('testing')
    setConnectionMessage('Testing connection...')

    try {
      // Simulate API key validation
      await new Promise(resolve => setTimeout(resolve, 1000))

      const config = providerConfigs[formData.provider]
      if (config.pattern.test(formData.apiKey)) {
        setConnectionStatus('success')
        setConnectionMessage(`✅ Connected to ${config.name}`)
      } else {
        setConnectionStatus('error')
        setConnectionMessage('❌ Invalid API key')
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionMessage('❌ Connection failed')
    }
  }

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear specific field error
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    const apiKeyError = validateApiKey(formData.provider, formData.apiKey)
    if (apiKeyError) {
      errors.apiKey = apiKeyError
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (window.vscode) {
        window.vscode.postMessage({
          command: 'configureAPI',
          provider: formData.provider,
          apiKey: formData.apiKey,
          rememberMe: formData.rememberMe,
        })

        // Wait for response with timeout
        const timeoutId = setTimeout(() => {
          setLoginError('Request timeout. Please try again.')
          setIsLoading(false)
        }, 30000)

        const listener = (event: MessageEvent) => {
          const message = event.data
          if (message.command === 'apiKeyConfigured') {
            clearTimeout(timeoutId)
            if (message.success) {
              login()
            } else {
              setLoginError(message.error || 'Failed to configure API key')
            }
            setIsLoading(false)
            window.removeEventListener('message', listener)
          }
        }
        window.addEventListener('message', listener)
      } else {
        // Fallback: simulate login for testing
        setTimeout(() => {
          login()
          setIsLoading(false)
        }, 1500)
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const openHelpModal = () => {
    setShowHelp(true)
  }

  const openProviderHelp = () => {
    const config = providerConfigs[formData.provider]
    window.open(config.helpUrl, '_blank')
  }

  const currentConfig = providerConfigs[formData.provider]

  return (
    <div className="login-page flex items-center justify-center h-full p-4 bg-background">
      <div className="login-container w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle level={1} className="text-3xl mb-2">
              🚀 SCRIPTLY
            </CardTitle>
            <CardDescription>Enter your API key to unlock AI-powered development</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  AI Provider
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(providerConfigs).map(([key, config]) => (
                    <label
                      key={key}
                      className={`
                        relative flex cursor-pointer rounded-lg border p-4 
                        transition-all duration-200
                        ${
                          formData.provider === key
                            ? 'border-focus-border bg-input-background'
                            : 'border-border hover:border-focus-border'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={key}
                        checked={formData.provider === key}
                        onChange={e => handleInputChange('provider', e.target.value as Provider)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{config.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {config.description}
                        </div>
                      </div>
                      {formData.provider === key && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-focus-border rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <PasswordInput
                  label="API Key"
                  value={formData.apiKey}
                  onChange={e => handleInputChange('apiKey', e.target.value)}
                  placeholder={currentConfig.placeholder}
                  error={validationErrors.apiKey}
                  hint={currentConfig.helpText}
                  fullWidth
                  showStrengthIndicator={formData.provider !== 'ollama'}
                  strengthRequirements={{
                    minLength: formData.provider === 'ollama' ? 10 : 20,
                  }}
                />

                {/* Connection Status */}
                {connectionStatus !== 'idle' && (
                  <div
                    className={`mt-2 text-xs ${
                      connectionStatus === 'success'
                        ? 'text-success'
                        : connectionStatus === 'error'
                          ? 'text-error'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {connectionMessage}
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={e => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-focus-border focus:ring-focus-border border-border rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-foreground">
                  Remember my choice
                </label>
              </div>

              {/* Error Alert */}
              {loginError && (
                <Alert variant="error" dismissible onDismiss={() => setLoginError('')}>
                  {loginError}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                disabled={isLoading || !formData.apiKey.trim()}
              >
                {isLoading ? 'Configuring...' : 'Continue to Scriptly'}
              </Button>

              {/* Help Links */}
              <div className="text-center space-y-2">
                <Button type="button" variant="ghost" size="sm" onClick={openHelpModal}>
                  Need help getting started?
                </Button>

                <div className="text-xs text-muted-foreground">
                  Your API key is encrypted and stored locally
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Modal */}
        <Modal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          title="Getting Started with Scriptly"
          size="lg"
        >
          <ModalBody>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">1. Choose Your AI Provider</h4>
                <p className="text-sm text-muted-foreground">
                  Select the AI service you want to use. OpenAI and Claude require paid API keys,
                  while Ollama runs locally for free.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Get Your API Key</h4>
                <Button
                  variant="outline"
                  onClick={openProviderHelp}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  }
                >
                  Get API Key for {currentConfig.name}
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Enter Your API Key</h4>
                <p className="text-sm text-muted-foreground">
                  Paste your API key in the field above. We'll test the connection automatically to
                  make sure everything is working correctly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Start Coding with AI</h4>
                <p className="text-sm text-muted-foreground">
                  Once configured, you can chat with AI about your code, get code reviews, analyze
                  your codebase, and much more!
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setShowHelp(false)}>Got it!</Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}
