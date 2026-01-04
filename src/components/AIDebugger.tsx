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
}

interface FixEntry {
  id: string
  timestamp: number
  errorId: string
  description: string
  applied: boolean
  success: boolean
  rollbackAvailable: boolean
}

interface PerformanceMetric {
  id: string
  timestamp: number
  metric: string
  value: number
  unit: string
}

type DebugStatus = 'monitoring' | 'analyzing' | 'fixing'

export function AIDebugger() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [status, setStatus] = useState<DebugStatus>('monitoring')
  const [autoFixEnabled, setAutoFixEnabled] = useState(false)
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [fixes, setFixes] = useState<FixEntry[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
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
      resolved: false
    }
    setErrors(prev => [newError, ...prev].slice(0, 100)) // Keep last 100 errors
    return newError
  }, [])

  const analyzeAndFix = useCallback(async (error: ErrorEntry) => {
    if (!autoFixEnabled) {
      toast.info('Auto-fix is disabled. Enable it in settings.')
      return
    }

    setStatus('analyzing')
    toast.info('Analyzing error with AI...')

    try {
      // Send error to Spark LLM for analysis
      const prompt = `You are an AI debugger. Analyze this error and suggest a fix:
Error: ${error.message}
Type: ${error.type}
Stack: ${error.stack || 'N/A'}
Source: ${error.source || 'N/A'}

Respond with a JSON object containing:
- description: Brief description of the issue
- suggestion: Recommended fix
- severity: 'low', 'medium', or 'high'`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const analysis = JSON.parse(response)

      setStatus('fixing')
      
      // Create fix entry
      const fix: FixEntry = {
        id: `fix-${Date.now()}`,
        timestamp: Date.now(),
        errorId: error.id,
        description: analysis.description || 'AI-generated fix',
        applied: false,
        success: false,
        rollbackAvailable: false
      }

      setFixes(prev => [fix, ...prev])
      
      // Mark error as resolved
      setErrors(prev => prev.map(e => 
        e.id === error.id ? { ...e, resolved: true } : e
      ))

      toast.success('Fix suggestion generated!')
      setStatus('monitoring')
      
      // Add as suggestion
      if (analysis.suggestion) {
        setSuggestions(prev => [analysis.suggestion, ...prev].slice(0, 10))
      }
    } catch (err) {
      console.error('Failed to analyze error:', err)
      toast.error('Failed to analyze error')
      setStatus('monitoring')
    }
  }, [autoFixEnabled])

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = addError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        source: event.filename
      })
      
      if (autoFixEnabled) {
        analyzeAndFix(error)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = addError({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack
      })
      
      if (autoFixEnabled) {
        analyzeAndFix(error)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [addError, autoFixEnabled, analyzeAndFix])

  // Console monitoring
  useEffect(() => {
    originalConsoleError.current = console.error
    originalConsoleWarn.current = console.warn

    console.error = (...args: any[]) => {
      originalConsoleError.current?.(...args)
      addError({
        type: 'error',
        message: args.map(a => String(a)).join(' ')
      })
    }

    console.warn = (...args: any[]) => {
      originalConsoleWarn.current?.(...args)
      addError({
        type: 'warning',
        message: args.map(a => String(a)).join(' ')
      })
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
        setMetrics(prev => [
          {
            id: `metric-${Date.now()}`,
            timestamp: Date.now(),
            metric: 'Memory Usage',
            value: Math.round(memory.usedJSHeapSize / 1048576),
            unit: 'MB'
          },
          ...prev
        ].slice(0, 50))
      }
    }

    const interval = setInterval(trackPerformance, 5000)
    return () => clearInterval(interval)
  }, [])

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
      default: return 'text-green-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'monitoring': return <CheckCircle size={16} weight="fill" />
      case 'analyzing': return <Warning size={16} weight="fill" />
      case 'fixing': return <Wrench size={16} weight="fill" />
      default: return <CheckCircle size={16} weight="fill" />
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
        >
          <Bug size={16} weight="bold" className="mr-2" />
          AI Debugger Active 🤖
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
              AI Debugger 🤖
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
                <span className="ml-1">{status}</span>
              </Badge>
              <Badge variant="outline">
                {errors.filter(e => !e.resolved).length} Active
              </Badge>
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

        <Tabs defaultValue="errors" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
            <TabsTrigger value="errors" className="text-xs">
              <Pulse size={14} className="mr-1" />
              Errors
            </TabsTrigger>
            <TabsTrigger value="fixes" className="text-xs">
              <Wrench size={14} className="mr-1" />
              Fixes
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
                        onClick={() => analyzeAndFix(error)}
                        disabled={status !== 'monitoring'}
                      >
                        Analyze & Fix
                      </Button>
                    )}
                    {error.resolved && (
                      <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
                        <CheckCircle size={14} weight="fill" />
                        Resolved
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
                        {fix.applied ? 'Applied' : 'Suggested'}
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
