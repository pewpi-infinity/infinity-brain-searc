import { Sparkle, GitBranch, ArrowRight, GithubLogo } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangleIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useState, useEffect } from 'react'

export const LandingPage = () => {
  const { login, continueAsGuest, deviceCode, connectionState } = useAuth()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleSignIn = async () => {
    setIsAuthenticating(true)
    setAuthError(null)
    try {
      await login()
      setRetryCount(0)
    } catch (error) {
      console.error('Sign in failed:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Authentication failed. Please try again.'
      setAuthError(errorMessage)
      setRetryCount(prev => prev + 1)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleCopyCode = () => {
    if (deviceCode?.user_code) {
      navigator.clipboard.writeText(deviceCode.user_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Open GitHub verification page automatically
  useEffect(() => {
    if (deviceCode?.verification_uri) {
      window.open(deviceCode.verification_uri, '_blank')
    }
  }, [deviceCode])

  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Sparkle 
              size={80} 
              weight="duotone" 
              className="text-accent animate-pulse" 
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Infinity Brain
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered productivity hub for tokens, trading, and building
          </p>
        </div>

        {/* Authentication Section */}
        {!deviceCode && connectionState !== 'connected' && (
          <div className="space-y-4">
            {/* Show error message if authentication failed */}
            {authError && (
              <Alert variant="destructive" className="border-2 border-destructive/50 bg-card/80 backdrop-blur">
                <AlertTriangleIcon className="h-5 w-5" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{authError}</p>
                  {retryCount >= 3 && (
                    <p className="text-sm font-semibold">
                      After 3 failed attempts, you can continue as a guest and retry later.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <Card className="bg-card/80 backdrop-blur border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <GithubLogo className="h-6 w-6" />
                  Sign in with GitHub
                </CardTitle>
                <CardDescription className="text-center">
                  Authenticate to access all features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleSignIn} 
                  className="w-full" 
                  size="lg"
                  disabled={isAuthenticating}
                >
                  <GithubLogo className="mr-2 h-5 w-5" />
                  {isAuthenticating 
                    ? retryCount > 0 
                      ? `Retrying (${retryCount})...` 
                      : 'Connecting...'
                    : authError 
                      ? 'Retry Sign In'
                      : 'Sign in with GitHub'
                  }
                </Button>
                <Button 
                  onClick={continueAsGuest} 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                >
                  Continue as Guest
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Device Code Display */}
        {deviceCode && (
          <Alert className="border-accent/50 bg-card/80 backdrop-blur">
            <GithubLogo className="h-5 w-5 text-accent" />
            <AlertTitle className="text-lg">Complete GitHub Authorization</AlertTitle>
            <AlertDescription className="text-base mt-2 space-y-3">
              <p>A new tab has been opened. Please enter this code on GitHub:</p>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-4 py-2 rounded text-2xl font-mono font-bold tracking-wider">
                  {deviceCode.user_code}
                </code>
                <Button 
                  onClick={handleCopyCode} 
                  variant="outline" 
                  size="sm"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Waiting for authorization... This will complete automatically once you authorize on GitHub.
              </p>
              {!window.opener && (
                <a 
                  href={deviceCode.verification_uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="link" size="sm">
                    Open GitHub in new tab <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/80 backdrop-blur border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-primary" />
                Token Economy
              </CardTitle>
              <CardDescription>
                Create, mint, and trade custom tokens with built-in auction system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Token minting and management</li>
                <li>• Live auction marketplace</li>
                <li>• Token analytics dashboard</li>
                <li>• Automated pricing algorithms</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-2 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-secondary" />
                Build & Deploy
              </CardTitle>
              <CardDescription>
                Create and deploy websites with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Repository management</li>
                <li>• Automated deployment</li>
                <li>• AI-powered page repair</li>
                <li>• Live site monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-accent" />
                AI Features
              </CardTitle>
              <CardDescription>
                Intelligent automation and assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• AI chat assistant</li>
                <li>• Intent-based help system</li>
                <li>• Automated workflows</li>
                <li>• Smart recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-primary" />
                Social Features
              </CardTitle>
              <CardDescription>
                Community and social integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Social security platform</li>
                <li>• Community token distribution</li>
                <li>• Social media posting</li>
                <li>• Sentiment analysis</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="bg-card/80 backdrop-blur rounded-lg p-6 border-2 border-accent/20">
            <h3 className="text-xl font-semibold mb-4 text-center">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Sign in with GitHub</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Sign in with GitHub" above to authenticate using GitHub Device Flow
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Or Continue as Guest</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse all features in read-only mode without authentication
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/pewpi-infinity/infinity-brain-searc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <GitBranch size={20} weight="duotone" className="mr-2" />
                View Repository
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </a>
            
            <a 
              href="https://github.com/pewpi-infinity/infinity-brain-searc#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none"
            >
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2"
              >
                Read Documentation
              </Button>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Sign in with your GitHub account to access all features. No server required - 
            authentication uses GitHub's Device Flow for secure, serverless auth.
          </p>
        </div>
      </div>
    </div>
  )
}
