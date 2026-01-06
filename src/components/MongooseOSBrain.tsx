import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import { Brain, Robot, Database, Lightning, CheckCircle, XCircle, Circle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface MongooseCart {
  id: string
  name: string
  description: string
  query: string
  resultCount: number
  lastRun?: number
  isActive: boolean
}

interface AIInsight {
  id: string
  category: string
  message: string
  confidence: number
  timestamp: number
}

export function MongooseOSBrain() {
  const [carts, setCarts] = useKV<MongooseCart[]>('mongoose-carts', [])
  const [insights, setInsights] = useKV<AIInsight[]>('mongoose-insights', [])
  const [isProcessing, setIsProcessing] = useState(false)
  const [systemStatus, setSystemStatus] = useState<'idle' | 'active' | 'processing'>('idle')

  useEffect(() => {
    if (!carts || carts.length === 0) {
      initializeDefaultCarts()
    }
  }, [])

  const initializeDefaultCarts = async () => {
    const defaultCarts: MongooseCart[] = [
      {
        id: 'cart-1',
        name: 'User Projects',
        description: 'Track incomplete projects and repositories',
        query: 'incomplete_projects',
        resultCount: 0,
        isActive: true
      },
      {
        id: 'cart-2',
        name: 'Token Analytics',
        description: 'Monitor token economy and trading patterns',
        query: 'token_patterns',
        resultCount: 0,
        isActive: true
      },
      {
        id: 'cart-3',
        name: 'Repo Health',
        description: 'Analyze repository quality and activity',
        query: 'repo_health',
        resultCount: 0,
        isActive: true
      },
      {
        id: 'cart-4',
        name: 'Auth Requests',
        description: 'Handle authentication and permissions',
        query: 'auth_requests',
        resultCount: 0,
        isActive: true
      },
      {
        id: 'cart-5',
        name: 'Quantum Radio',
        description: 'Music preferences and playback history',
        query: 'quantum_audio',
        resultCount: 0,
        isActive: true
      }
    ]
    
    await setCarts(defaultCarts)
    toast.success('🧠 Mongoose.os carts initialized')
  }

  const processCart = async (cart: MongooseCart) => {
    setIsProcessing(true)
    setSystemStatus('processing')
    
    try {
      if (!window.spark || !window.spark.llm) {
        throw new Error('Spark LLM not available')
      }

      const prompt = window.spark.llmPrompt`You are Mongoose.os, an AI intelligence system analyzing user data carts. 
      
Cart: ${cart.name}
Description: ${cart.description}
Query Type: ${cart.query}

Based on this cart type, generate 3-5 intelligent insights about the user's ${cart.query}. 
For example:
- If incomplete_projects: identify patterns in unfinished work, suggest completion strategies
- If token_patterns: analyze trading behavior, recommend optimizations
- If repo_health: assess code quality, suggest improvements
- If auth_requests: identify security patterns, recommend access controls
- If quantum_audio: analyze listening preferences, suggest new tracks

Return a JSON object with a single property "insights" containing an array of insight objects.
Each insight should have: category (string), message (string max 120 chars), confidence (0.0-1.0).

Example format:
{
  "insights": [
    {"category": "Pattern", "message": "You have 3 unfinished token projects", "confidence": 0.92},
    {"category": "Recommendation", "message": "Focus on completing repos with >50 stars first", "confidence": 0.85}
  ]
}`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      
      const newInsights: AIInsight[] = data.insights.map((insight: any) => ({
        id: `insight-${Date.now()}-${Math.random()}`,
        category: insight.category,
        message: insight.message,
        confidence: insight.confidence,
        timestamp: Date.now()
      }))
      
      await setInsights((prev) => [...newInsights, ...(prev || [])].slice(0, 20))
      
      await setCarts((prevCarts) => 
        (prevCarts || []).map(c => 
          c.id === cart.id 
            ? { ...c, resultCount: newInsights.length, lastRun: Date.now() }
            : c
        )
      )
      
      toast.success(`✨ ${cart.name} processed: ${newInsights.length} insights`)
      
    } catch (error) {
      console.error('Cart processing error:', error)
      toast.error('Failed to process cart')
    } finally {
      setIsProcessing(false)
      setSystemStatus('active')
    }
  }

  const processAllCarts = async () => {
    const activeCarts = (carts || []).filter(c => c.isActive)
    
    for (const cart of activeCarts) {
      await processCart(cart)
    }
    
    toast.success('🎯 All carts processed successfully')
  }

  const toggleCart = async (cartId: string) => {
    await setCarts((prev) => 
      (prev || []).map(c => 
        c.id === cartId ? { ...c, isActive: !c.isActive } : c
      )
    )
  }

  const clearInsights = async () => {
    await setInsights([])
    toast.info('Insights cleared')
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${systemStatus === 'processing' ? 'bg-gradient-to-br from-accent to-secondary animate-pulse' : 'bg-gradient-to-br from-primary to-accent'}`}>
                <Brain size={40} weight="duotone" className="text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  Mongoose.os Intelligence
                  <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary">
                    AI OS
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Data cart intelligence system • Analyzes patterns • Generates insights
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant={systemStatus === 'processing' ? 'default' : 'outline'} 
                className={systemStatus === 'processing' ? 'bg-accent animate-pulse' : ''}
              >
                {systemStatus === 'processing' ? '🔄 Processing' : systemStatus === 'active' ? '✅ Active' : '⚪ Idle'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {(carts || []).filter(c => c.isActive).length} / {(carts || []).length} carts active
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="flex gap-4">
            <Button 
              onClick={processAllCarts}
              disabled={isProcessing}
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 h-14 text-lg"
            >
              {isProcessing ? (
                <>
                  <Circle className="animate-spin mr-3" size={24} weight="bold" />
                  Processing Carts...
                </>
              ) : (
                <>
                  <Lightning size={24} weight="fill" className="mr-3" />
                  Process All Carts
                </>
              )}
            </Button>
            <Button 
              onClick={clearInsights}
              variant="outline"
              size="lg"
              className="h-14"
            >
              Clear Insights
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database size={24} weight="duotone" className="text-primary" />
              Data Carts
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(carts || []).map((cart) => (
                <motion.div
                  key={cart.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      cart.isActive 
                        ? 'border-2 border-accent bg-accent/5' 
                        : 'border border-border opacity-60'
                    }`}
                    onClick={() => toggleCart(cart.id)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            {cart.isActive ? (
                              <CheckCircle size={20} weight="fill" className="text-green-500" />
                            ) : (
                              <XCircle size={20} weight="fill" className="text-muted-foreground" />
                            )}
                            {cart.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {cart.description}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {cart.query}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Results</span>
                          <span className="font-semibold">{cart.resultCount}</span>
                        </div>
                        {cart.lastRun && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Last run</span>
                            <span>{formatTimestamp(cart.lastRun)}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          processCart(cart)
                        }}
                        disabled={isProcessing || !cart.isActive}
                        size="sm"
                        className="w-full"
                        variant={cart.isActive ? "default" : "ghost"}
                      >
                        Process Cart
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Robot size={24} weight="duotone" className="text-accent" />
              AI Insights ({(insights || []).length})
            </h3>
            
            {(!insights || insights.length === 0) ? (
              <Card className="p-12 text-center border-dashed">
                <Robot size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">
                  No insights yet. Process carts to generate AI intelligence.
                </p>
              </Card>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {(insights || []).map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-l-4 border-l-accent hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-xs">
                                  {insight.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {(insight.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatTimestamp(insight.timestamp)}
                                </span>
                              </div>
                              
                              <p className="text-base leading-relaxed">
                                {insight.message}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Confidence</span>
                                  <span>{(insight.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <Progress value={insight.confidence * 100} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
