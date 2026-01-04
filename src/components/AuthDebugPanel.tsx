import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bug, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'

interface AuthState {
  sparkLoaded: boolean
  sparkUserAvailable: boolean
  lastAuthAttempt: string | null
  authStatus: 'idle' | 'loading' | 'success' | 'error'
  errorMessage: string | null
  appId: string | null
}

export function AuthDebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [authState, setAuthState] = useState<AuthState>({
    sparkLoaded: false,
    sparkUserAvailable: false,
    lastAuthAttempt: null,
    authStatus: 'idle',
    errorMessage: null,
    appId: null
  })

  // Check auth state periodically
  useEffect(() => {
    const checkAuthState = () => {
      setAuthState(prev => ({
        ...prev,
        sparkLoaded: !!window.spark,
        sparkUserAvailable: !!(window.spark && typeof window.spark.user === 'function'),
        appId: document.querySelector('meta[name="spark:app"]')?.getAttribute('content') || null
      }))
    }

    checkAuthState()
    const interval = setInterval(checkAuthState, 1000)
    return () => clearInterval(interval)
  }, []) // Only check Spark status periodically, other state changes are triggered by user actions

  // Toggle visibility with Ctrl+Shift+D
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setIsVisible(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const testAuth = async () => {
    setAuthState(prev => ({
      ...prev,
      lastAuthAttempt: new Date().toISOString(),
      authStatus: 'loading',
      errorMessage: null
    }))

    try {
      if (!window.spark) {
        throw new Error('Spark not loaded')
      }

      const user = await window.spark.user()
      
      setAuthState(prev => ({
        ...prev,
        authStatus: 'success',
        errorMessage: null
      }))

      console.log('Auth test successful:', user)
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        authStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }))
      console.error('Auth test failed:', error)
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-yellow-500/20 border-yellow-500"
        >
          <Bug size={16} weight="bold" className="mr-2" />
          Auth Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="p-4 bg-card/95 backdrop-blur border-2 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Bug size={20} weight="duotone" className="text-yellow-500" />
            Auth Debug Panel
          </h3>
          <Button
            onClick={() => setIsVisible(false)}
            size="sm"
            variant="ghost"
          >
            ×
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spark Loaded:</span>
            {authState.sparkLoaded ? (
              <CheckCircle size={20} weight="fill" className="text-green-500" />
            ) : (
              <XCircle size={20} weight="fill" className="text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Spark.user() Available:</span>
            {authState.sparkUserAvailable ? (
              <CheckCircle size={20} weight="fill" className="text-green-500" />
            ) : (
              <XCircle size={20} weight="fill" className="text-red-500" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">App ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {authState.appId || 'Not found'}
            </code>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Auth Status:</span>
            <Badge 
              variant={
                authState.authStatus === 'success' ? 'default' :
                authState.authStatus === 'error' ? 'destructive' :
                authState.authStatus === 'loading' ? 'secondary' : 'outline'
              }
            >
              {authState.authStatus}
            </Badge>
          </div>

          {authState.lastAuthAttempt && (
            <div className="text-xs text-muted-foreground">
              <Clock size={14} className="inline mr-1" />
              Last attempt: {new Date(authState.lastAuthAttempt).toLocaleTimeString()}
            </div>
          )}

          {authState.errorMessage && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-500">
              {authState.errorMessage}
            </div>
          )}

          <Button
            onClick={testAuth}
            disabled={authState.authStatus === 'loading'}
            className="w-full"
            size="sm"
          >
            {authState.authStatus === 'loading' ? 'Testing...' : 'Test Authentication'}
          </Button>
        </div>

        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+Shift+D</kbd> to toggle
        </div>
      </Card>
    </div>
  )
}
