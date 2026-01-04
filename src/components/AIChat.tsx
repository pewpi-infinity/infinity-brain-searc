import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PaperPlaneRight, User, Robot, List, Trash, Clock, Plus } from '@phosphor-icons/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  lastUpdated: number
}

export function AIChat() {
  const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>('ai-chat-sessions', [])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentSession = chatSessions?.find(s => s.id === currentSessionId)
  const messages = currentSession?.messages || []

  useEffect(() => {
    if (!currentSessionId && chatSessions && chatSessions.length > 0) {
      setCurrentSessionId(chatSessions[0].id)
    }
  }, [chatSessions, currentSessionId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    }
    setChatSessions((prev) => [newSession, ...(prev || [])])
    setCurrentSessionId(newSession.id)
    setSheetOpen(false)
    toast.success('New chat created')
  }

  const deleteChat = (sessionId: string) => {
    setChatSessions((prev) => (prev || []).filter(s => s.id !== sessionId))
    if (sessionId === currentSessionId) {
      const remaining = (chatSessions || []).filter(s => s.id !== sessionId)
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null)
    }
    toast.success('Chat deleted')
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (!currentSessionId) {
      createNewChat()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setChatSessions((prev) => {
      return (prev || []).map(session => {
        if (session.id === currentSessionId) {
          const firstMessage = session.messages.length === 0
          return {
            ...session,
            messages: [...session.messages, userMessage],
            lastUpdated: Date.now(),
            title: firstMessage ? input.trim().substring(0, 50) : session.title
          }
        }
        return session
      })
    })

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

      setChatSessions((prev) => {
        return (prev || []).map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, assistantMessage],
              lastUpdated: Date.now()
            }
          }
          return session
        })
      })
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: Date.now()
      }
      setChatSessions((prev) => {
        return (prev || []).map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, errorMessage],
              lastUpdated: Date.now()
            }
          }
          return session
        })
      })
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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden border-2 border-border rounded-lg">
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <List size={24} weight="duotone" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Chat History</SheetTitle>
                <SheetDescription>View and manage your AI conversations</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <Button 
                  onClick={createNewChat} 
                  className="w-full bg-gradient-to-r from-accent to-secondary"
                >
                  <Plus size={20} weight="bold" className="mr-2" />
                  New Chat
                </Button>
                <Separator />
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-2">
                    {(chatSessions || []).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Robot size={48} weight="duotone" className="mx-auto mb-2 text-accent" />
                        <p>No chats yet</p>
                      </div>
                    ) : (
                      (chatSessions || []).map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            session.id === currentSessionId
                              ? 'border-accent bg-accent/10'
                              : 'border-border hover:border-accent/50'
                          }`}
                          onClick={() => {
                            setCurrentSessionId(session.id)
                            setSheetOpen(false)
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{session.title}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Clock size={12} />
                                <span>{formatTime(session.lastUpdated)}</span>
                                <span>•</span>
                                <span>{session.messages.length} messages</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteChat(session.id)
                              }}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <Robot size={24} weight="duotone" className="text-accent" />
          <h3 className="font-semibold text-lg">AI Assistant</h3>
        </div>
        {currentSession && (
          <span className="text-sm text-muted-foreground">
            {currentSession.messages.length} messages
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Robot size={48} weight="duotone" className="mx-auto mb-2 text-accent" />
              <p>Start a conversation with your AI assistant</p>
            </div>
          )}
          {messages.map((message) => (
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