import { useEffect, useState } from 'react'
import { Sparkle, CheckCircle, XCircle } from '@phosphor-icons/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { handleOAuthCallback, getRedirectPath } from '@/lib/githubAuth'

export const OAuthCallback = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract code and state from URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        // Check for OAuth errors
        if (error) {
          setStatus('error')
          setErrorMessage(errorDescription || error)
          return
        }

        // Validate parameters
        if (!code || !state) {
          setStatus('error')
          setErrorMessage('Missing authorization code or state parameter')
          return
        }

        // Exchange code for token and fetch user
        await handleOAuthCallback(code, state)
        
        setStatus('success')
        
        // Redirect to app after a short delay
        setTimeout(() => {
          const redirectPath = getRedirectPath() || '/infinity-brain-searc/'
          window.location.href = redirectPath
        }, 1500)
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed')
      }
    }

    processCallback()
  }, [])

  if (status === 'processing') {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <Sparkle 
              size={64} 
              weight="duotone" 
              className="text-accent animate-pulse" 
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Completing Authentication</h2>
            <p className="text-muted-foreground">
              Processing your GitHub authorization...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-pulse w-4/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <CheckCircle 
              size={64} 
              weight="duotone" 
              className="text-green-500" 
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Authentication Successful!</h2>
            <p className="text-muted-foreground">
              Redirecting you to Infinity Brain...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <XCircle 
            size={64} 
            weight="duotone" 
            className="text-red-500" 
          />
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{errorMessage}</p>
            <p className="text-sm mt-2">
              Please try again or contact support if the problem persists.
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.href = '/infinity-brain-searc/'} 
            className="w-full"
            size="lg"
          >
            Return to Home
          </Button>

          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="w-full"
            size="lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
