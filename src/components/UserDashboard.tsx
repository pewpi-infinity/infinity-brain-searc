import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, SignIn, SignOut, Clock, Shield, Wallet, ArrowsLeftRight, ArrowsClockwise, WifiSlash, Warning } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { TokenTransfer } from './TokenTransfer'
import { TransactionHistory } from './TransactionHistory'
import { useState, useEffect } from 'react'

export function UserDashboard() {
  const { currentUser, userProfile, isAuthenticated, isGuest, authMethod, connectionState, login, loginWithGitHub, continueAsGuest, logout, syncWallet, retryConnection } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [sparkReady, setSparkReady] = useState(false)

  // Check if Spark is ready
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null
    
    const checkSpark = () => {
      if (window.spark) {
        setSparkReady(true)
      } else {
        timerId = setTimeout(checkSpark, 100)
      }
    }
    
    checkSpark()
    
    return () => {
      if (timerId) {
        clearTimeout(timerId)
      }
    }
  }, [])

  const handleLogin = async () => {
    if (!sparkReady) {
      toast.error('System not ready yet', {
        description: 'Please wait a moment for the app to fully load.'
      })
      return
    }

    setIsLoggingIn(true)
    try {
      await login()
      toast.success('Successfully logged in!')
    } catch (error) {
      // Error is already handled in auth.tsx, just catch it here
      console.error('Login error in dashboard:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const handleSyncWallet = async () => {
    setIsSyncing(true)
    try {
      await syncWallet()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRetryConnection = async () => {
    setIsRetrying(true)
    try {
      await retryConnection()
      toast.success('Connection restored!')
    } catch (error) {
      console.error('Retry connection failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  // Show connection lost state
  if (connectionState === 'error' && !isAuthenticated) {
    return (
      <Card className="p-6 gradient-border border-red-500/50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-red-500/10">
            <WifiSlash size={48} weight="duotone" className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 text-red-500">Connection Lost</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to connect to the authentication service
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-left">
              <div className="flex items-start gap-2">
                <Warning size={20} weight="fill" className="text-yellow-500 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">Troubleshooting Tips:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li>Check your internet connection</li>
                    <li>Ensure popups are not blocked</li>
                    <li>Try disabling VPN or ad blockers</li>
                    <li>Refresh the page if the issue persists</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleRetryConnection}
            disabled={isRetrying}
            className="bg-gradient-to-r from-primary to-accent min-w-[200px]"
          >
            {isRetrying ? (
              <>
                <ArrowsClockwise size={20} weight="bold" className="mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <ArrowsClockwise size={20} weight="bold" className="mr-2" />
                Retry Connection
              </>
            )}
          </Button>
        </div>
      </Card>
    )
  }

  if (!isAuthenticated || !currentUser || !userProfile) {
    return (
      <Card className="p-6 gradient-border">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-muted">
            <User size={48} weight="duotone" className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Welcome to Infinity Brain</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isGuest ? 'You\'re browsing as a guest' : 'Choose how you\'d like to continue'}
            </p>
            {!sparkReady && !isGuest && (
              <p className="text-xs text-yellow-600 mb-2">
                ⏳ Initializing Spark API...
              </p>
            )}
            {isGuest && (
              <Badge variant="outline" className="mb-4 bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400">
                Guest Mode - Limited Features
              </Badge>
            )}
          </div>
          
          <div className="w-full max-w-md space-y-3">
            {/* Spark Authentication */}
            {sparkReady && (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="bg-gradient-to-r from-primary to-accent w-full"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <ArrowsClockwise size={20} weight="bold" className="mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <SignIn size={20} weight="bold" className="mr-2" />
                    Sign in with Spark (Recommended)
                  </>
                )}
              </Button>
            )}
            
            {/* GitHub OAuth (backup option) */}
            <Button
              onClick={async () => {
                try {
                  await loginWithGitHub()
                } catch (error) {
                  console.error('GitHub login failed:', error)
                }
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <SignIn size={20} weight="bold" className="mr-2" />
              Sign in with GitHub OAuth
            </Button>
            
            {/* Continue as Guest */}
            {!isGuest && (
              <Button
                onClick={continueAsGuest}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                Continue as Guest
              </Button>
            )}
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground max-w-md">
            <p className="mb-2 font-semibold">What you can do:</p>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="font-medium text-green-600 dark:text-green-400">✓ As Guest:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Browse UI</li>
                  <li>View tokens</li>
                  <li>See auctions</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">✓ When Signed In:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Create tokens</li>
                  <li>Place bids</li>
                  <li>AI features</li>
                  <li>Save progress</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-xs opacity-75">
              🔒 Your data is stored securely and never shared.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const sessionDuration = Date.now() - currentUser.loginTime
  const hours = Math.floor(sessionDuration / (1000 * 60 * 60))
  const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="space-y-6">
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
                  <Badge 
                    variant={authMethod === 'spark' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {authMethod === 'spark' ? '✓ Spark Auth' : authMethod === 'github' ? '✓ GitHub Auth' : 'Guest'}
                  </Badge>
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

      <Tabs defaultValue="wallet" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto bg-card/80 backdrop-blur p-2">
          <TabsTrigger value="wallet" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex items-center gap-2 py-2">
            <Wallet size={20} weight="duotone" />
            <span>Wallet</span>
          </TabsTrigger>
          <TabsTrigger value="transfer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex items-center gap-2 py-2">
            <ArrowsLeftRight size={20} weight="duotone" />
            <span>Transfer</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-2">
            <Clock size={20} weight="duotone" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Token Balances</h3>
              {currentUser.isOwner && (
                <Button
                  onClick={handleSyncWallet}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  title="Sync tokens from all Infinity repos (Admin only)"
                >
                  <ArrowsClockwise 
                    size={16} 
                    weight="bold" 
                    className={isSyncing ? 'animate-spin' : ''} 
                  />
                  {isSyncing ? 'Syncing...' : 'Sync from Repos'}
                </Button>
              )}
            </div>
            {currentUser.isOwner && (
              <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-sm">
                <p className="font-semibold text-accent mb-1">🔒 Admin Sync Protection</p>
                <p className="text-muted-foreground text-xs">
                  Syncs tokens FROM Infinity ecosystem repos only. Never resets spent tokens or auction earnings.
                </p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(userProfile.businessTokens).map(([symbol, balance]) => (
                <div
                  key={symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Wallet size={24} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-lg">{symbol}</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xl">{balance.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(userProfile.businessTokens).length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No tokens yet. Visit the Mint tab to create your first token!
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <TokenTransfer />
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
