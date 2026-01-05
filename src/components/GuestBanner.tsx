import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Info, SignIn } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'

interface GuestBannerProps {
  onSignInClick?: () => void
}

export function GuestBanner({ onSignInClick }: GuestBannerProps) {
  const { isGuest, isAuthenticated } = useAuth()

  // Don't show banner if user is authenticated
  if (isAuthenticated && !isGuest) {
    return null
  }

  // Only show if in guest mode
  if (!isGuest) {
    return null
  }

  return (
    <Alert className="border-blue-500/50 bg-blue-500/10 backdrop-blur">
      <Info className="h-5 w-5 text-blue-500" />
      <div className="flex items-center justify-between flex-1">
        <div>
          <AlertTitle className="text-blue-700 dark:text-blue-400">
            Browsing as Guest
          </AlertTitle>
          <AlertDescription className="text-sm text-blue-600 dark:text-blue-300">
            You can view all content, but sign in to create tokens, place bids, and save your progress.
          </AlertDescription>
        </div>
        {onSignInClick && (
          <Button
            onClick={onSignInClick}
            variant="outline"
            size="sm"
            className="ml-4 border-blue-500/50 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20"
          >
            <SignIn size={16} weight="bold" className="mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </Alert>
  )
}
