import { useState } from 'react'
import { Sparkle, GitBranch, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DeviceFlowAuth } from '@/components/DeviceFlowAuth'

export const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false)

  const handleSignIn = () => {
    setShowAuth(true)
  }

  const handleAuthSuccess = () => {
    // Reload the page to initialize with authenticated session
    window.location.reload()
  }

  const handleAuthCancel = () => {
    setShowAuth(false)
  }

  if (showAuth) {
    return <DeviceFlowAuth onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />
  }

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

        {/* Important Notice */}
        <Alert className="border-accent/50 bg-card/80 backdrop-blur">
          <Sparkle className="h-5 w-5 text-accent" />
          <AlertTitle className="text-lg">Welcome to Infinity Brain on GitHub Pages</AlertTitle>
          <AlertDescription className="text-base mt-2">
            Sign in with your GitHub account to access all features including token creation, 
            trading, and building websites. Your data will be stored securely in your browser.
          </AlertDescription>
        </Alert>

        {/* Sign In Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSignIn}
            className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-lg px-8 py-6 h-auto"
          >
            <GitBranch size={24} weight="duotone" className="mr-2" />
            Sign in with GitHub
            <ArrowRight size={24} className="ml-2" />
          </Button>
        </div>

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
            <h3 className="text-xl font-semibold mb-4 text-center">How to Run Infinity Brain</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Open in GitHub Spark</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit the repository on GitHub and open it in the Spark environment
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2 mt-1">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Or Run Locally (Development)</h4>
                  <p className="text-sm text-muted-foreground">
                    Clone the repository and run with npm: <code className="bg-muted px-2 py-1 rounded">npm install && npm run dev</code>
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
            This is a static landing page. The full Infinity Brain experience 
            requires GitHub Spark authentication and runtime features.
          </p>
        </div>
      </div>
    </div>
  )
}
