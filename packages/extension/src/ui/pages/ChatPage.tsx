import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store'

export const ChatPage: React.FC = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    'Analyze the codebase',
    'Analyze and document it',
    'Research and find the bugs',
    'Explain the architecture',
    'Suggest improvements',
    'Review code quality',
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = { role: 'user', content: message }
    setMessages((prev) => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    if (window.vscode) {
      window.vscode.postMessage({
        command: 'sendMessage',
        text: userMessage.content,
      })

      let fullResponse = ''
      const listener = (event: MessageEvent) => {
        const data = event.data
        if (data.command === 'streamChunk') {
          fullResponse += data.chunk
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = fullResponse
            } else {
              newMessages.push({ role: 'assistant', content: fullResponse })
            }
            return newMessages
          })
        } else if (data.command === 'streamComplete') {
          setIsLoading(false)
          window.removeEventListener('message', listener)
        } else if (data.command === 'error') {
          setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
          setIsLoading(false)
          window.removeEventListener('message', listener)
        }
      }
      window.addEventListener('message', listener)
    }
  }

  return (
    <div className="chat-page flex flex-col h-full">
      <div className="messages-container flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="welcome-message text-center opacity-70 mt-8">
            <p className="mb-4">Welcome to Scriptly Chat! Ask me anything about your code.</p>
            <div className="suggestions flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(suggestion)}
                  className="suggestion-button px-3 py-1.5 bg-input-background border border-border rounded text-sm hover:bg-button-background hover:text-button-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === 'user' ? 'user-message ml-auto' : 'assistant-message mr-auto'}`}
          >
            <div
              className={`message-content p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-button-background text-button-foreground'
                  : 'bg-input-background border border-border'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="loading-indicator flex items-center gap-2 opacity-70">
            <div className="spinner w-4 h-4"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container border-t border-border p-4">
        <div className="input-wrapper flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your code..."
            className="flex-1 p-2 bg-input-background border border-border rounded"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

