import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneRight, User, Robot } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function AIChat() {
  const [messages, setMessages] = useKV<Message[]>('ai-chat-messages', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages((prev) => [...(prev || []), userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const userInput = input.trim()
      const prompt = `You are a helpful AI assistant in the Infinity Brain platform. The user says: ${userInput}. Provide a helpful, friendly, and concise response.`
      const response = await window.spark.llm(prompt, 'gpt-4o-mini')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }

      setMessages((prev) => [...(prev || []), assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: Date.now()
      }
      setMessages((prev) => [...(prev || []), errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="h-full flex flex-col gradient-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Robot size={24} weight="duotone" className="text-accent" />
          AI Assistant
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {(messages || []).length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Robot size={48} weight="duotone" className="mx-auto mb-2 text-accent" />
              <p>Start a conversation with your AI assistant</p>
            </div>
          )}
          {(messages || []).map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center flex-shrink-0">
                  <Robot size={18} weight="bold" className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <User size={18} weight="bold" className="text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center flex-shrink-0">
                <Robot size={18} weight="bold" className="text-white" />
              </div>
              <div className="bg-muted rounded-2xl p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-accent to-secondary hover:opacity-90"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </div>
      </div>
    </Card>
  )
}