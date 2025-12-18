import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  Spinner,
} from '../components/ui'
import { ChatMessage } from '../../types'

export const ChatPage: React.FC = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    currentConversationId,
    addConversation,
    updateConversation,
    setCurrentConversation,
    userProfile,
  } = useAppStore()

  const suggestions = [
    {
      title: 'Analyze the codebase',
      description: 'Get insights into your project structure',
      icon: '🔍',
      prompt: 'Analyze the current codebase structure and identify key components and patterns.',
    },
    {
      title: 'Review code quality',
      description: 'Find potential improvements',
      icon: '📝',
      prompt: 'Review the code quality and suggest improvements for better maintainability.',
    },
    {
      title: 'Find bugs',
      description: 'Debug issues in your code',
      icon: '🐛',
      prompt: 'Search through the code and identify any potential bugs or issues.',
    },
    {
      title: 'Explain architecture',
      description: 'Understand the system design',
      icon: '🏗️',
      prompt: 'Explain the current application architecture and how different components interact.',
    },
    {
      title: 'Suggest improvements',
      description: 'Get optimization suggestions',
      icon: '⚡',
      prompt: 'Suggest ways to improve performance, code organization, and best practices.',
    },
    {
      title: 'Document functions',
      description: 'Generate documentation',
      icon: '📚',
      prompt: 'Generate documentation for the key functions and classes in your codebase.',
    },
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)
    setError('')

    // Create or update conversation
    let conversationId = currentConversationId
    if (!conversationId) {
      const newConversation = {
        id: `conv_${Date.now()}`,
        title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        mode: 'chat' as const,
      }
      addConversation(newConversation)
      setCurrentConversation(newConversation.id)
      conversationId = newConversation.id
    } else {
      const currentConversation = conversations.find(c => c.id === conversationId)
      if (currentConversation) {
        updateConversation(conversationId, {
          messages: [...currentConversation.messages, userMessage],
          updatedAt: Date.now(),
        })
      }
    }

    try {
      if (window.vscode) {
        window.vscode.postMessage({
          command: 'sendMessage',
          text: userMessage.content,
          conversationId,
        })

        let fullResponse = ''
        let hasError = false

        const listener = (event: MessageEvent) => {
          const data = event.data
          if (data.command === 'streamChunk') {
            fullResponse += data.chunk
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              if (lastMessage?.role === 'assistant') {
                lastMessage.content = fullResponse
              } else {
                const assistantMessage: ChatMessage = {
                  id: generateMessageId(),
                  role: 'assistant',
                  content: fullResponse,
                  timestamp: Date.now(),
                }
                newMessages.push(assistantMessage)
              }
              return newMessages
            })
          } else if (data.command === 'streamComplete') {
            setIsLoading(false)

            // Update conversation with final messages
            if (conversationId) {
              const assistantMessage: ChatMessage = {
                id: generateMessageId(),
                role: 'assistant',
                content: fullResponse,
                timestamp: Date.now(),
              }
              setMessages(prev => [...prev.slice(0, -1), assistantMessage])

              const currentConversation = conversations.find(c => c.id === conversationId)
              if (currentConversation) {
                updateConversation(conversationId, {
                  messages: [...currentConversation.messages, userMessage, assistantMessage],
                  updatedAt: Date.now(),
                })
              }
            }
            window.removeEventListener('message', listener)
          } else if (data.command === 'error') {
            hasError = true
            const errorMessage: ChatMessage = {
              id: generateMessageId(),
              role: 'assistant',
              content: `❌ Error: ${data.error}`,
              timestamp: Date.now(),
            }
            setMessages(prev => [...prev, errorMessage])
            setIsLoading(false)
            window.removeEventListener('message', listener)
          }
        }
        window.addEventListener('message', listener)

        // Timeout after 30 seconds
        setTimeout(() => {
          if (isLoading && !hasError) {
            setError('Request timed out. Please try again.')
            setIsLoading(false)
            window.removeEventListener('message', listener)
          }
        }, 30000)
      } else {
        // Fallback: simulate response for testing
        const responses = [
          "I'd be happy to help you with that! I can see your code structure and provide insights.",
          'Looking at your codebase, I notice several interesting patterns and areas for improvement.',
          "Great question! Based on my analysis of your code, here's what I found...",
          "I've analyzed your codebase and here are some recommendations for optimization.",
        ]

        setTimeout(
          () => {
            const assistantMessage: ChatMessage = {
              id: generateMessageId(),
              role: 'assistant',
              content: responses[Math.floor(Math.random() * responses.length)],
              timestamp: Date.now(),
            }
            setMessages(prev => [...prev, assistantMessage])
            setIsLoading(false)

            // Update conversation
            if (conversationId) {
              const currentConversation = conversations.find(c => c.id === conversationId)
              if (currentConversation) {
                updateConversation(conversationId, {
                  messages: [...currentConversation.messages, userMessage, assistantMessage],
                  updatedAt: Date.now(),
                })
              }
            }
          },
          1500 + Math.random() * 2000
        )
      }
    } catch (err) {
      setError('Failed to send message. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: (typeof suggestions)[0]) => {
    setMessage(suggestion.prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError('')
    setCurrentConversation(undefined)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="chat-page flex flex-col h-full">
      {/* Chat Header */}
      <div className="chat-header border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">AI Chat Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask questions about your code • Powered by {userProfile?.apiKeyProfile || 'AI'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-info/10 text-info rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to Scriptly AI Chat! 🤖
                </h3>
                <p className="text-muted-foreground">
                  I'm here to help you with your code. Ask me anything!
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion, idx) => (
                  <Card
                    key={idx}
                    hover
                    clickable
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{suggestion.icon}</div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`message ${
                msg.role === 'user'
                  ? 'user-message ml-auto max-w-[80%]'
                  : 'assistant-message mr-auto max-w-[80%]'
              }`}
            >
              <Card
                className={`
                ${
                  msg.role === 'user'
                    ? 'bg-button-background text-button-foreground'
                    : 'bg-input-background border-border'
                }
              `}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${msg.role === 'user' ? 'bg-button-hover' : 'bg-info/10 text-info'}
                    `}
                    >
                      {msg.role === 'user' ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {msg.role === 'user' ? 'You' : 'Scriptly AI'}
                        </span>
                        <span className="text-xs opacity-60">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="assistant-message mr-auto max-w-[80%]">
              <Card className="bg-input-background border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-info/10 text-info flex items-center justify-center flex-shrink-0">
                      <Spinner size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Scriptly AI is thinking...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <div className="input-container border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your code..."
                disabled={isLoading}
                fullWidth
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              }
            >
              Send
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <span>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
