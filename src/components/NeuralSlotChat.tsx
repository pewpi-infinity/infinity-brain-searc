import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKV } from '@github/spark/hooks'
import { Brain, PaperPlaneRight, Robot, User, Sparkle, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface SlotSymbol {
  emoji: string
  label: string
  color: string
}

interface AIInsight {
  id: string
  category: string
  message: string
  confidence: number
  timestamp: number
}

const slotSymbols: SlotSymbol[] = [
  { emoji: '🧠', label: 'Neural', color: 'text-blue-500' },
  { emoji: '⚡', label: 'Lightning', color: 'text-yellow-500' },
  { emoji: '🎯', label: 'Target', color: 'text-red-500' },
  { emoji: '💎', label: 'Diamond', color: 'text-cyan-500' },
  { emoji: '🚀', label: 'Rocket', color: 'text-purple-500' },
  { emoji: '✨', label: 'Sparkle', color: 'text-amber-500' },
]

export function NeuralSlotChat() {
  const [messages, setMessages] = useKV<Message[]>('neural-chat-messages', [])
  const [insights] = useKV<AIInsight[]>('mongoose-insights', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [reels, setReels] = useState([0, 0, 0])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const spinReels = () => {
    setSpinning(true)
    const duration = 1500
    const interval = 100
    const steps = duration / interval
    let step = 0

    const spinInterval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * slotSymbols.length),
        Math.floor(Math.random() * slotSymbols.length),
        Math.floor(Math.random() * slotSymbols.length),
      ])
      
      step++
      if (step >= steps) {
        clearInterval(spinInterval)
        setSpinning(false)
      }
    }, interval)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages((prev) => [...(prev || []), userMessage])
    setInput('')
    setIsLoading(true)
    spinReels()

    try {
      if (!window.spark || !window.spark.llm) {
        throw new Error('Spark LLM not available')
      }

      const recentInsights = (insights || []).slice(0, 5).map(i => `${i.category}: ${i.message}`).join('\n')
      
      const contextInfo = recentInsights 
        ? `\n\nMONGOOSE.OS INTELLIGENCE DATA (Use this to inform your response):\n${recentInsights}`
        : '\n\n(No Mongoose.os intelligence data available yet. Process data carts in the Mongoose tab to generate insights.)'

      const prompt = window.spark.llmPrompt`You are Mongoose.os Neural Chat AI, the intelligent assistant for Infinity Brain platform.

USER QUERY: "${input.trim()}"
${contextInfo}

Provide a helpful, conversational response (max 200 words). ${recentInsights ? 'You have access to Mongoose.os intelligence data above. Use it to:' : 'Note: No intelligence data is available yet. Suggest the user process data carts first, then:'}
- Reference actual insights when relevant to the user's question
- Suggest actionable next steps based on the intelligence
- Help with tokens, repos, automation, or platform features
- Guide deployment, trading, and project completion

Be enthusiastic and make connections between the user's question and the intelligence data when possible.`

      const response = await window.spark.llm(prompt, 'gpt-4o', false)

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }

      setMessages((prev) => [...(prev || []), assistantMessage])
      toast.success('🧠 Mongoose.os responded!')

    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to generate response')
      
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: Date.now()
      }
      setMessages((prev) => [...(prev || []), errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    setMessages([])
    toast.info('Chat history cleared')
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
              <Brain size={32} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Neural Slot Chat
                <Badge variant="secondary" className="bg-white/30 text-white border-0">
                  AI
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-100 flex items-center gap-2">
                <Brain size={16} weight="fill" />
                Powered by Mongoose.os Intelligence • Spin the reels for insights
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="secondary" 
              className={`${(insights && insights.length > 0) ? 'bg-green-500' : 'bg-yellow-500'} text-white border-0`}
            >
              {(insights && insights.length > 0) ? `✅ ${insights.length} Insights` : '⚠️ No Data'}
            </Badge>
            <span className="text-xs text-blue-100">
              {(insights && insights.length > 0) ? 'Intelligence Active' : 'Process carts to enable'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
          {reels.map((reelIndex, i) => (
            <motion.div
              key={i}
              className={`flex flex-col items-center justify-center w-24 h-24 bg-white rounded-xl border-3 border-blue-300 shadow-lg ${
                spinning ? 'animate-pulse' : ''
              }`}
              animate={spinning ? { y: [-5, 5, -5] } : {}}
              transition={{ duration: 0.3, repeat: spinning ? Infinity : 0 }}
            >
              <div className={`text-5xl ${slotSymbols[reelIndex].color}`}>
                {slotSymbols[reelIndex].emoji}
              </div>
              <span className="text-xs font-medium text-muted-foreground mt-1">
                {slotSymbols[reelIndex].label}
              </span>
            </motion.div>
          ))}
        </div>

        <ScrollArea className="h-[400px] pr-4 rounded-xl border border-blue-200 bg-white p-4">
          <div className="space-y-4">
            {(!messages || messages.length === 0) ? (
              <div className="text-center py-12 space-y-4">
                <Robot size={64} weight="duotone" className="mx-auto text-blue-400" />
                <div className="space-y-2">
                  <p className="font-semibold text-lg">Welcome to Neural Slot Chat!</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Ask me anything about your tokens, repos, automation, or get AI-powered project assistance.
                  </p>
                  {(!insights || insights.length === 0) && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Tip:</strong> For smarter responses, go to the <strong>Mongoose</strong> tab and process data carts first. This gives me intelligence to work with!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Robot size={20} weight="duotone" className="text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                        <User size={20} weight="duotone" className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <div className="flex gap-3">
            <Textarea
              placeholder="Ask anything about your projects, tokens, repos, or automation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className="min-h-[80px] resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Sparkle className="animate-spin mr-2" size={20} weight="fill" />
                  Thinking...
                </>
              ) : (
                <>
                  <PaperPlaneRight size={20} weight="fill" className="mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={clearChat}
              className="h-12 border-blue-200 hover:bg-blue-50"
            >
              Clear Chat
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightning size={14} weight="fill" className="text-blue-500" />
            <span>Press Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
