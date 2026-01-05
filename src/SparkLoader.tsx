import { useState, useEffect, ReactNode } from 'react'
import { Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertTriangleIcon } from 'lucide-react'
import { LandingPage } from '@/components/LandingPage'

interface SparkLoaderProps {
  children: ReactNode
}

type LoadingState = 'loading' | 'ready' | 'timeout' | 'error' | 'no-spark'

// Detect if we're running on GitHub Pages (or any non-Spark environment)
const isGitHubPages = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false
  
  // Check for GitHub Pages specific indicators
  const hostname = window.location.hostname
  const isGHPages = hostname.endsWith('.github.io')
  
  // Also check if Spark is not available after a reasonable time
  // This helps detect any non-Spark deployment
  return isGHPages
}

export const SparkLoader = ({ children }: SparkLoaderProps) => {
  const [state, setState] = useState<LoadingState>('loading')
  const [dots, setDots] = useState('')

  useEffect(() => {
    let mounted = true
    let checkCount = 0
    const maxChecks = 100 // 10 seconds with 100ms interval
    
    const checkSpark = () => {
      if (!mounted) return

      // Early detection: if we're on GitHub Pages, show landing page immediately
      if (checkCount === 0 && isGitHubPages()) {
        setState('no-spark')
        return
      }

      // Check if window.spark is available
      if (typeof window !== 'undefined' && window.spark) {
        setState('ready')
        return
      }

      checkCount++
      
      // Timeout after 10 seconds - assume no Spark environment
      if (checkCount >= maxChecks) {
        setState('no-spark')
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
    window.location.reload()
  }

  // If ready, render the app
  if (state === 'ready') {
    return <>{children}</>
  }

  // No Spark environment detected - show landing page
  if (state === 'no-spark') {
    return <LandingPage />
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
              Connecting to GitHub and loading your workspace
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

  // Timeout or error state (fallback for development environment)
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
              Infinity Brain couldn't connect to GitHub within 10 seconds. This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Network connectivity issues</li>
              <li>GitHub authentication required</li>
              <li>Browser extensions blocking the connection</li>
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
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              Sign in to GitHub
            </Button>
          </a>
        </div>

        <div className="bg-card/80 backdrop-blur border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Troubleshooting Tips:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check your internet connection</li>
            <li>• Sign in to your GitHub account</li>
            <li>• Disable ad blockers or browser extensions</li>
            <li>• Try using a different browser</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
