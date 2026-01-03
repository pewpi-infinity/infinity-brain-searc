import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, SignIn, SignOut, Clock, Shield, Wallet, ArrowsLeftRight, ArrowsClockwise } from '@phosphor-icons/react'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { TokenTransfer } from './TokenTransfer'
import { TransactionHistory } from './TransactionHistory'
import { useState } from 'react'

export function UserDashboard() {
  const { currentUser, userProfile, isAuthenticated, login, logout, syncWallet } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

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
              <Button
                onClick={handleSyncWallet}
                disabled={isSyncing}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowsClockwise 
                  size={16} 
                  weight="bold" 
                  className={isSyncing ? 'animate-spin' : ''} 
                />
                {isSyncing ? 'Syncing...' : 'Sync Wallet'}
              </Button>
            </div>
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
                  No tokens yet. Visit the Tokens tab to mint your first token!
                </p>
                <Button
                  onClick={handleSyncWallet}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ArrowsClockwise 
                    size={16} 
                    weight="bold" 
                    className={isSyncing ? 'animate-spin' : ''} 
                  />
                  {isSyncing ? 'Syncing...' : 'Sync Wallet'}
                </Button>
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
