import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Sparkle } from '@phosphor-icons/react'

export function AuthCallback() {
  const { handleOAuthCallback } = useAuth()
  
  useEffect(() => {
    // Handle the OAuth callback when component mounts
    const processCallback = async () => {
      try {
        await handleOAuthCallback()
        // Redirect to home after successful auth
        setTimeout(() => {
          window.location.href = '/'
        }, 1000)
      } catch (error) {
        console.error('Auth callback error:', error)
        // Redirect to home even on error
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    }
    
    processCallback()
  }, [handleOAuthCallback])
  
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
            Authenticating with GitHub...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we complete your sign-in
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
