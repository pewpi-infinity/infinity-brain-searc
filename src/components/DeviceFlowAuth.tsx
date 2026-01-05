import { useState, useEffect } from 'react'
import { Sparkle, CheckCircle, Copy, ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import * as githubAuth from '@/lib/githubAuth'

interface DeviceFlowAuthProps {
  onSuccess: () => void
  onCancel: () => void
}

export const DeviceFlowAuth = ({ onSuccess, onCancel }: DeviceFlowAuthProps) => {
  const [deviceFlow, setDeviceFlow] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'waiting' | 'polling' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    const initDeviceFlow = async () => {
      try {
        setStatus('loading')
        await githubAuth.loginWithGitHub()
        
        // Get device flow info from session storage
        const flowData = githubAuth.getActiveDeviceFlow()
        if (!flowData) {
          throw new Error('Failed to initiate device flow')
        }
        
        setDeviceFlow(flowData)
        setTimeRemaining(flowData.expires_in)
        setStatus('waiting')
        
        // Start polling after a short delay
        setTimeout(() => {
          setStatus('polling')
          startPolling(flowData.device_code, flowData.interval)
        }, 3000)
      } catch (error) {
        console.error('Device flow init error:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Failed to start authentication')
      }
    }

    initDeviceFlow()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (status === 'waiting' || status === 'polling') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setStatus('error')
            setErrorMessage('Device code expired. Please try again.')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [status])

  const startPolling = async (deviceCode: string, interval: number) => {
    try {
      await githubAuth.pollForAccessToken(deviceCode, interval)
      setStatus('success')
      githubAuth.clearDeviceFlow()
      
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      console.error('Polling error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed')
      githubAuth.clearDeviceFlow()
    }
  }

  const copyUserCode = () => {
    if (deviceFlow?.user_code) {
      navigator.clipboard.writeText(deviceFlow.user_code)
      toast.success('Code copied to clipboard!')
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Sparkle size={48} weight="duotone" className="text-accent animate-pulse" />
            </div>
            <CardTitle className="text-center">Starting GitHub Authentication</CardTitle>
            <CardDescription className="text-center">
              Please wait while we prepare your authentication...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} weight="duotone" className="text-green-500" />
            </div>
            <CardTitle className="text-center">Authentication Successful!</CardTitle>
            <CardDescription className="text-center">
              Redirecting you to Infinity Brain...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button onClick={onCancel} className="flex-1">
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Waiting or polling state
  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Sparkle size={48} weight="duotone" className="text-accent animate-pulse" />
          </div>
          <CardTitle className="text-center">Sign in with GitHub</CardTitle>
          <CardDescription className="text-center">
            {status === 'polling' ? 'Waiting for authorization...' : 'Complete the steps below'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle>Step 1: Copy Your Code</AlertTitle>
            <AlertDescription>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-2xl font-bold text-center tracking-wider">
                  {deviceFlow?.user_code}
                </code>
                <Button size="icon" variant="outline" onClick={copyUserCode}>
                  <Copy size={20} />
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTitle>Step 2: Authorize on GitHub</AlertTitle>
            <AlertDescription>
              <div className="mt-3">
                <a
                  href={deviceFlow?.verification_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full" size="lg">
                    <ArrowSquareOut size={20} className="mr-2" />
                    Open GitHub Authorization
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  A new window will open. Paste your code there.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {status === 'polling' && (
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Checking authorization status...
              </p>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Code expires in: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>

          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
