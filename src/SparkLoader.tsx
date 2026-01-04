import { useState, useEffect, ReactNode } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangleIcon } from 'lucide-react'

interface AppLoaderProps {
  children: ReactNode
}

type LoadingState = 'loading' | 'ready' | 'timeout' | 'error'

export const SparkLoader = ({ children }: AppLoaderProps) => {
  const [state, setState] = useState<LoadingState>('loading')
  const [dots, setDots] = useState('')

  useEffect(() => {
    let mounted = true
    
    // Simple ready check - just verify DOM is loaded
    const checkReady = () => {
      if (!mounted) return

      // Check if window is available and document is loaded
      if (typeof window !== 'undefined' && document.readyState === 'complete') {
        setState('ready')
        return
      }

      // Continue checking
      setTimeout(checkReady, 100)
    }

    // Start checking after a brief delay to show loading state
    setTimeout(() => {
      if (mounted) {
        checkReady()
      }
    }, 500)

    return () => {
      mounted = false
    }
  }, [])

  // Animate dots for loading message
  useEffect(() => {
    if (state !== 'loading') return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [state])

  const handleRetry = () => {
    window.location.reload()
  }

  // If ready, render the app
  if (state === 'ready') {
    return <>{children}</>
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Sparkle 
              size={64} 
              weight="duotone" 
              className="text-accent animate-pulse" 
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Initializing Infinity Brain{dots}
            </h2>
            <p className="text-muted-foreground">
              Loading your workspace
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-pulse w-3/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Timeout or error state
  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Sparkle 
            size={48} 
            weight="duotone" 
            className="text-muted-foreground" 
          />
        </div>

        <Alert variant="destructive">
          <AlertTriangleIcon aria-label="Warning" />
          <AlertTitle>Failed to initialize Infinity Brain</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Infinity Brain couldn't load properly. This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Network connectivity issues</li>
              <li>Browser compatibility issues</li>
              <li>Browser extensions blocking the app</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
        </div>

        <div className="bg-card/80 backdrop-blur border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Troubleshooting Tips:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check your internet connection</li>
            <li>• Disable ad blockers or browser extensions</li>
            <li>• Try using a different browser</li>
            <li>• Clear your browser cache and reload</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
