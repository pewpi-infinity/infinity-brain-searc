import { useState, useEffect, ReactNode } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangleIcon } from 'lucide-react'

interface SparkLoaderProps {
  children: ReactNode
}

type LoadingState = 'loading' | 'ready' | 'timeout' | 'error'

export const SparkLoader = ({ children }: SparkLoaderProps) => {
  const [state, setState] = useState<LoadingState>('loading')
  const [dots, setDots] = useState('')

  useEffect(() => {
    let mounted = true
    let checkCount = 0
    const maxChecks = 100 // 10 seconds with 100ms interval
    
    const checkSpark = () => {
      if (!mounted) return

      // Check if window.spark is available
      if (typeof window !== 'undefined' && window.spark) {
        setState('ready')
        return
      }

      checkCount++
      
      // Timeout after 10 seconds
      if (checkCount >= maxChecks) {
        setState('timeout')
        return
      }

      // Continue checking
      setTimeout(checkSpark, 100)
    }

    checkSpark()

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
    setState('loading')
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
              Setting up the GitHub Spark runtime
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-pulse" 
                   style={{ width: '60%' }} />
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
          <AlertTriangleIcon />
          <AlertTitle>Failed to initialize GitHub Spark</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              The Spark runtime didn't load within 10 seconds. This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Network connectivity issues</li>
              <li>GitHub Spark service unavailable</li>
              <li>Browser extensions blocking the runtime</li>
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

          <a 
            href="https://githubnext.com/projects/github-spark"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              Learn About GitHub Spark
            </Button>
          </a>
        </div>

        <div className="bg-card/80 backdrop-blur border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Troubleshooting Tips:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check your internet connection</li>
            <li>• Disable ad blockers or browser extensions</li>
            <li>• Try using a different browser</li>
            <li>• Ensure you're accessing this from GitHub Spark</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
