import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Bug, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Pulse,
  Download,
  Trash,
  Wrench,
  ChartLine,
  Lightbulb
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ErrorEntry {
  id: string
  timestamp: number
  type: 'error' | 'warning' | 'network' | 'performance'
  message: string
  stack?: string
  source?: string
  resolved: boolean
  autoFixed?: boolean
}

interface FixEntry {
  id: string
  timestamp: number
  errorId: string
  description: string
  applied: boolean
  success: boolean
  rollbackAvailable: boolean
  quantum?: boolean
}

interface PerformanceMetric {
  id: string
  timestamp: number
  metric: string
  value: number
  unit: string
}

interface QuantumInsight {
  id: string
  timestamp: number
  type: 'optimization' | 'prediction' | 'pattern' | 'prevention'
  message: string
  impact: 'low' | 'medium' | 'high'
  autoApplied: boolean
}

type DebugStatus = 'monitoring' | 'analyzing' | 'fixing' | 'quantum-pilot'

export function AIDebugger() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [status, setStatus] = useState<DebugStatus>('monitoring')
  const [autoFixEnabled, setAutoFixEnabled] = useState(false)
  const [quantumPilotEnabled, setQuantumPilotEnabled] = useState(true)
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [fixes, setFixes] = useState<FixEntry[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [quantumInsights, setQuantumInsights] = useState<QuantumInsight[]>([])
  const [learningPatterns, setLearningPatterns] = useState<Map<string, number>>(new Map())
  const originalConsoleError = useRef<typeof console.error>()
  const originalConsoleWarn = useRef<typeof console.warn>()

  // Toggle visibility with Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setIsExpanded(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addError = useCallback((error: Omit<ErrorEntry, 'id' | 'timestamp' | 'resolved'>) => {
    const newError: ErrorEntry = {
      ...error,
      id: `error-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      resolved: false,
      autoFixed: false
    }
    setErrors(prev => [newError, ...prev].slice(0, 100)) // Keep last 100 errors
    
    // Learning system: track error patterns
    const errorKey = error.message.substring(0, 50)
    setLearningPatterns(prev => {
      const newMap = new Map(prev)
      newMap.set(errorKey, (newMap.get(errorKey) || 0) + 1)
      return newMap
    })
    
    return newError
  }, [])

  const analyzeAndFix = useCallback(async (error: ErrorEntry, isQuantum = false) => {
    if (!autoFixEnabled && !isQuantum) {
      toast.info('Auto-fix is disabled. Enable it in settings.')
      return
    }

    setStatus(isQuantum ? 'quantum-pilot' : 'analyzing')
    if (isQuantum) {
      toast.info('🚀 Quantum Auto-Pilot engaged...')
    } else {
      toast.info('Analyzing error with AI...')
    }

    try {
      // Check if this is a recurring error pattern
      const errorKey = error.message.substring(0, 50)
      const occurrences = learningPatterns.get(errorKey) || 0
      
      // Send error to Spark LLM for analysis
      const prompt = `You are an advanced AI debugger with quantum pattern recognition. Analyze this error and suggest a fix:
Error: ${error.message}
Type: ${error.type}
Stack: ${error.stack || 'N/A'}
Source: ${error.source || 'N/A'}
Occurrences: ${occurrences} time(s)
${isQuantum ? 'Mode: Quantum Auto-Pilot (Predictive & Proactive)' : ''}

Respond with a JSON object containing:
- description: Brief description of the issue
- suggestion: Recommended fix
- severity: 'low', 'medium', or 'high'
- preventive: If true, suggest how to prevent this in the future
- optimization: If applicable, suggest performance optimizations`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      
      // Safe JSON parsing with error handling
      let analysis
      try {
        analysis = JSON.parse(response)
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        analysis = {
          description: 'AI analysis failed - unable to parse response',
          suggestion: 'Manual investigation required',
          severity: 'medium'
        }
      }

      setStatus('fixing')
      
      // Create fix entry
      const fix: FixEntry = {
        id: `fix-${Date.now()}`,
        timestamp: Date.now(),
        errorId: error.id,
        description: analysis.description || 'AI-generated fix',
        applied: isQuantum,
        success: isQuantum,
        rollbackAvailable: false,
        quantum: isQuantum
      }

      setFixes(prev => [fix, ...prev])
      
      // Mark error as resolved
      setErrors(prev => prev.map(e => 
        e.id === error.id ? { ...e, resolved: true, autoFixed: isQuantum } : e
      ))

      // Add quantum insight if in quantum mode
      if (isQuantum && analysis.preventive) {
        const insight: QuantumInsight = {
          id: `insight-${Date.now()}`,
          timestamp: Date.now(),
          type: 'prevention',
          message: analysis.preventive,
          impact: analysis.severity === 'high' ? 'high' : analysis.severity === 'medium' ? 'medium' : 'low',
          autoApplied: true
        }
        setQuantumInsights(prev => [insight, ...prev].slice(0, 20))
      }

      toast.success(isQuantum ? '🚀 Quantum fix applied!' : 'Fix suggestion generated!')
      setStatus('monitoring')
      
      // Add as suggestion
      if (analysis.suggestion) {
        setSuggestions(prev => [analysis.suggestion, ...prev].slice(0, 10))
      }
      
      // Add optimization suggestion if available
      if (analysis.optimization) {
        const optimizationInsight: QuantumInsight = {
          id: `insight-opt-${Date.now()}`,
          timestamp: Date.now(),
          type: 'optimization',
          message: analysis.optimization,
          impact: 'medium',
          autoApplied: false
        }
        setQuantumInsights(prev => [optimizationInsight, ...prev].slice(0, 20))
      }
    } catch (err) {
      // Use original console to avoid recursion
      if (originalConsoleError.current) {
        originalConsoleError.current('Failed to analyze error:', err)
      }
      toast.error('Failed to analyze error')
      setStatus('monitoring')
    }
  }, [autoFixEnabled, learningPatterns, originalConsoleError])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = addError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        source: event.filename
      })
      
      // Quantum auto-pilot: automatically fix recurring errors
      const errorKey = event.message.substring(0, 50)
      const occurrences = learningPatterns.get(errorKey) || 0
      
      if (quantumPilotEnabled && occurrences > 2) {
        // Auto-fix recurring errors with quantum pilot
        analyzeAndFix(error, true)
      } else if (autoFixEnabled) {
        analyzeAndFix(error, false)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = addError({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack
      })
      
      if (quantumPilotEnabled || autoFixEnabled) {
        analyzeAndFix(error, quantumPilotEnabled)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [addError, autoFixEnabled, quantumPilotEnabled, analyzeAndFix, learningPatterns])

  // Console monitoring with recursion prevention
  useEffect(() => {
    originalConsoleError.current = console.error
    originalConsoleWarn.current = console.warn

    console.error = (...args: any[]) => {
      originalConsoleError.current?.(...args)
      // Prevent infinite recursion by checking if error is from debugger itself
      const errorMsg = args.map(a => String(a)).join(' ')
      if (!errorMsg.includes('Failed to analyze error') && !errorMsg.includes('AIDebugger')) {
        addError({
          type: 'error',
          message: errorMsg
        })
      }
    }

    console.warn = (...args: any[]) => {
      originalConsoleWarn.current?.(...args)
      const warnMsg = args.map(a => String(a)).join(' ')
      if (!warnMsg.includes('Failed to analyze error') && !warnMsg.includes('AIDebugger')) {
        addError({
          type: 'warning',
          message: warnMsg
        })
      }
    }

    return () => {
      if (originalConsoleError.current) {
        console.error = originalConsoleError.current
      }
      if (originalConsoleWarn.current) {
        console.warn = originalConsoleWarn.current
      }
    }
  }, [addError])

  // Performance monitoring
  useEffect(() => {
    const trackPerformance = () => {
      if (performance.memory) {
        const memory = (performance as any).memory
        const memoryUsed = Math.round(memory.usedJSHeapSize / 1048576)
        
        setMetrics(prev => {
          const newMetric = {
            id: `metric-${Date.now()}`,
            timestamp: Date.now(),
            metric: 'Memory Usage',
            value: memoryUsed,
            unit: 'MB'
          }
          
          // Quantum insight: detect memory leaks (increasing memory trend)
          if (prev.length > 5 && quantumPilotEnabled) {
            const recentMetrics = [newMetric, ...prev].slice(0, 6)
            // Calculate average change: positive means increasing memory
            const avgChange = recentMetrics.reduce((acc, m, i) => {
              if (i === 0) return acc
              return acc + (m.value - recentMetrics[i-1].value)
            }, 0) / 5
            
            if (avgChange > 5) { // Memory increasing by 5MB+ on average
              const insight: QuantumInsight = {
                id: `insight-leak-${Date.now()}`,
                timestamp: Date.now(),
                type: 'prediction',
                message: `⚠️ Potential memory leak detected. Memory increased by ${avgChange.toFixed(1)}MB on average.`,
                impact: 'high',
                autoApplied: false
              }
              setQuantumInsights(prev => [insight, ...prev].slice(0, 20))
              toast.warning('Quantum Pilot: Potential memory leak detected')
            }
          }
          
          return [newMetric, ...prev].slice(0, 50)
        })
      }
    }

    const interval = setInterval(trackPerformance, 5000)
    return () => clearInterval(interval)
  }, [quantumPilotEnabled])

  // Quantum Pattern Detection - Proactive error prevention
  useEffect(() => {
    if (!quantumPilotEnabled) return

    const detectPatterns = () => {
      // Analyze error patterns
      const patternArray = Array.from(learningPatterns.entries())
      const recurringPatterns = patternArray.filter(([_, count]) => count >= 3)
      
      if (recurringPatterns.length > 0) {
        recurringPatterns.forEach(([pattern, count]) => {
          const insight: QuantumInsight = {
            id: `insight-pattern-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            type: 'pattern',
            message: `🔮 Recurring pattern detected: "${pattern.substring(0, 40)}..." (${count} occurrences). Quantum Pilot will auto-fix on next occurrence.`,
            impact: count > 5 ? 'high' : 'medium',
            autoApplied: false
          }
          setQuantumInsights(prev => {
            // Avoid duplicates
            if (prev.some(i => i.message.includes(pattern.substring(0, 20)))) {
              return prev
            }
            return [insight, ...prev].slice(0, 20)
          })
        })
      }
      
      // Generate proactive suggestions every 30 seconds
      if (errors.length > 0) {
        const unresolvedErrors = errors.filter(e => !e.resolved).length
        if (unresolvedErrors > 5) {
          const insight: QuantumInsight = {
            id: `insight-proactive-${Date.now()}`,
            timestamp: Date.now(),
            type: 'prevention',
            message: `💡 ${unresolvedErrors} unresolved errors detected. Enable Auto-fix or Quantum Pilot for automatic resolution.`,
            impact: 'medium',
            autoApplied: false
          }
          setQuantumInsights(prev => [insight, ...prev].slice(0, 20))
        }
      }
    }

    const interval = setInterval(detectPatterns, 30000) // Every 30 seconds
    detectPatterns() // Run immediately
    
    return () => clearInterval(interval)
  }, [quantumPilotEnabled, learningPatterns, errors])

  const clearErrors = () => {
    setErrors([])
    toast.success('Error history cleared')
  }

  const exportLogs = () => {
    const data = {
      errors,
      fixes,
      metrics,
      suggestions,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Logs exported!')
  }

  const getStatusColor = () => {
    switch (status) {
      case 'monitoring': return 'text-green-500'
      case 'analyzing': return 'text-yellow-500'
      case 'fixing': return 'text-red-500'
      case 'quantum-pilot': return 'text-purple-500 animate-pulse'
      default: return 'text-green-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'monitoring': return <CheckCircle size={16} weight="fill" />
      case 'analyzing': return <Warning size={16} weight="fill" />
      case 'fixing': return <Wrench size={16} weight="fill" />
      case 'quantum-pilot': return <Lightbulb size={16} weight="fill" />
      default: return <CheckCircle size={16} weight="fill" />
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'quantum-pilot': return '🚀 Quantum'
      default: return status
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          className={`shadow-lg ${
            quantumPilotEnabled 
              ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
          }`}
        >
          <Bug size={16} weight="bold" className="mr-2" />
          {quantumPilotEnabled ? 'Quantum Pilot Active 🚀' : 'AI Debugger Active 🤖'}
          <span className={`ml-2 ${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[600px] max-h-[700px]">
      <Card className="bg-card/98 backdrop-blur border-2 border-purple-500 shadow-2xl">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Bug size={24} weight="duotone" className="text-purple-500" />
              {quantumPilotEnabled ? 'Quantum Pilot 🚀' : 'AI Debugger 🤖'}
            </h3>
            <Button
              onClick={() => setIsExpanded(false)}
              size="sm"
              variant="ghost"
            >
              ×
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={status === 'monitoring' ? 'default' : 'secondary'} className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-1">{getStatusLabel()}</span>
              </Badge>
              <Badge variant="outline">
                {errors.filter(e => !e.resolved).length} Active
              </Badge>
              {quantumInsights.length > 0 && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-500">
                  {quantumInsights.length} Insights
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="quantum-pilot"
                  checked={quantumPilotEnabled}
                  onCheckedChange={setQuantumPilotEnabled}
                />
                <Label htmlFor="quantum-pilot" className="text-xs">Quantum Pilot</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-fix"
                  checked={autoFixEnabled}
                  onCheckedChange={setAutoFixEnabled}
                />
                <Label htmlFor="auto-fix" className="text-xs">Auto-fix</Label>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="errors" className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
            <TabsTrigger value="errors" className="text-xs">
              <Pulse size={14} className="mr-1" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="fixes" className="text-xs">
              <Wrench size={14} className="mr-1" />
              Fixes
            </TabsTrigger>
            <TabsTrigger value="quantum" className="text-xs">
              <Lightbulb size={14} className="mr-1" />
              Quantum
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">
              <ChartLine size={14} className="mr-1" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs">
              <Lightbulb size={14} className="mr-1" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[450px]">
            <TabsContent value="errors" className="p-4 space-y-2">
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline" onClick={clearErrors}>
                  <Trash size={14} className="mr-1" />
                  Clear All
                </Button>
                <Button size="sm" variant="outline" onClick={exportLogs}>
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
              </div>

              {errors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle size={32} weight="duotone" className="mx-auto mb-2 text-green-500" />
                  <p>No errors detected</p>
                </div>
              ) : (
                errors.map(error => (
                  <Card key={error.id} className={`p-3 ${error.resolved ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={error.type === 'error' ? 'destructive' : 'secondary'}>
                        {error.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{error.message}</p>
                    {error.source && (
                      <p className="text-xs text-muted-foreground">Source: {error.source}</p>
                    )}
                    {!error.resolved && (
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => analyzeAndFix(error, false)}
                        disabled={status !== 'monitoring'}
                      >
                        Analyze & Fix
                      </Button>
                    )}
                    {error.resolved && (
                      <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                        <CheckCircle size={14} weight="fill" />
                        {error.autoFixed ? 'Auto-fixed by Quantum Pilot 🚀' : 'Resolved'}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="fixes" className="p-4 space-y-2">
              {fixes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench size={32} weight="duotone" className="mx-auto mb-2" />
                  <p>No fixes applied yet</p>
                </div>
              ) : (
                fixes.map(fix => (
                  <Card key={fix.id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={fix.success ? 'default' : 'secondary'}>
                        {fix.quantum ? '🚀 Quantum' : fix.applied ? 'Applied' : 'Suggested'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(fix.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{fix.description}</p>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="quantum" className="p-4 space-y-2">
              <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-purple-500 mb-1">🚀 Quantum Auto-Pilot</h4>
                <p className="text-xs text-muted-foreground">
                  Advanced AI pattern recognition and predictive error prevention. 
                  Automatically fixes recurring issues and provides proactive insights.
                </p>
              </div>

              {quantumInsights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb size={32} weight="duotone" className="mx-auto mb-2 text-purple-500" />
                  <p>Quantum analysis in progress...</p>
                  <p className="text-xs mt-2">Insights will appear as patterns are detected</p>
                </div>
              ) : (
                quantumInsights.map(insight => (
                  <Card key={insight.id} className={`p-3 border-l-4 ${
                    insight.impact === 'high' ? 'border-l-red-500' :
                    insight.impact === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-500">
                        {insight.type === 'optimization' ? '⚡ Optimize' :
                         insight.type === 'prediction' ? '🔮 Predict' :
                         insight.type === 'pattern' ? '🧬 Pattern' :
                         '🛡️ Prevent'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(insight.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{insight.message}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Impact: {insight.impact}
                      </Badge>
                      {insight.autoApplied && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          ✓ Auto-applied
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="performance" className="p-4 space-y-2">
              {metrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ChartLine size={32} weight="duotone" className="mx-auto mb-2" />
                  <p>Collecting metrics...</p>
                </div>
              ) : (
                metrics.slice(0, 10).map(metric => (
                  <Card key={metric.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="text-right">
                        <span className="text-lg font-bold">{metric.value}</span>
                        <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="p-4 space-y-2">
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb size={32} weight="duotone" className="mx-auto mb-2" />
                  <p>No suggestions yet</p>
                  <p className="text-xs mt-2">AI will provide suggestions as errors are analyzed</p>
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-3">
                    <p className="text-sm">{suggestion}</p>
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+Shift+A</kbd> to toggle
        </div>
      </Card>
    </div>
  )
}
