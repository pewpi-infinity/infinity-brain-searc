import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, SignIn, SignOut, Clock, Shield } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

export function UserDashboard() {
  const { currentUser, userProfile, isAuthenticated, login, logout } = useAuth()

  const handleLogin = async () => {
    try {
      await login()
      toast.success('Successfully logged in!')
    } catch (error) {
      toast.error('Failed to log in')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  if (!isAuthenticated || !currentUser || !userProfile) {
    return (
      <Card className="p-6 gradient-border">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-muted">
            <User size={48} weight="duotone" className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Welcome to Infinity</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Log in to access the tokenized business ecosystem
            </p>
          </div>
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <SignIn size={20} weight="bold" className="mr-2" />
            Log In with GitHub
          </Button>
        </div>
      </Card>
    )
  }

  const sessionDuration = Date.now() - currentUser.loginTime
  const hours = Math.floor(sessionDuration / (1000 * 60 * 60))
  const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Card className="p-6 gradient-border bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-accent">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.username} />
              <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{currentUser.username}</h3>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {currentUser.isOwner && (
                  <Badge variant="default" className="text-xs">
                    <Shield size={12} weight="fill" className="mr-1" />
                    Owner
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            <SignOut size={16} weight="bold" className="mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-card">
            <p className="text-xs text-muted-foreground mb-1">User ID</p>
            <p className="font-mono text-xs truncate">{currentUser.userId}</p>
          </div>
          <div className="p-3 rounded-lg bg-card">
            <p className="text-xs text-muted-foreground mb-1">Session Time</p>
            <p className="font-mono text-xs">
              {hours}h {minutes}m
            </p>
          </div>
          <div className="p-3 rounded-lg bg-card">
            <p className="text-xs text-muted-foreground mb-1">Token Types</p>
            <p className="font-mono text-xs">
              {Object.keys(userProfile.businessTokens).length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-card">
            <p className="text-xs text-muted-foreground mb-1">Member Since</p>
            <p className="font-mono text-xs">
              {new Date(userProfile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={14} weight="duotone" />
            <span>
              Last active: {new Date(currentUser.lastActive).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <Shield size={14} weight="duotone" />
            <span>Session ID: {currentUser.sessionId}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
