import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, ChatCircle, ChartBar, ChartLine, GitBranch, Robot, Infinity, Atom, MusicNotes, Wallet } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Brain, ChatCircle, ChartBar, ChartLine, GitBranch, Robot, Infinity, Atom, MusicNotes, Wallet as WalletIcon, SignOut } from '@phosphor-icons/react'
import { Brain, ChatCircle, ChartBar, ChartLine, GitBranch, Robot, Infinity, Atom, MusicNotes, Wallet as WalletIcon, LogIn } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { MongooseOSBrain } from '@/components/MongooseOSBrain'
import { NeuralSlotChat } from '@/components/NeuralSlotChat'
import { UserBehaviorHeatmap } from '@/components/UserBehaviorHeatmap'
import { AIProjectCompletionAssistant } from '@/components/AIProjectCompletionAssistant'
import { InfinityTokenCharts } from '@/components/InfinityTokenCharts'
import { RepoCartSync } from '@/components/RepoCartSync'
import { QuantumJukebox } from '@/components/QuantumJukebox'
import { DemoIntegration } from '@/components/DemoIntegration'
import { Wallet, Login, useAuth, initializePewpiShared } from '@/shared'
import { LoginComponent } from '@/shared/auth/login-component'
import { WalletUI } from '@/shared/wallet/wallet-ui'
import { TokenService } from '@/shared/token-service'
import { AuthService } from '@/shared/auth/auth-service'
import { createInfinityBrainIntegration } from '@/shared/integration/listener'
import '@/shared/theme.css'

interface UserInfo {
  avatarUrl: string
  email: string
  id: string
  isOwner: boolean
  login: string
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [sparkUser, setSparkUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenBalance, setTokenBalance] = useKV<number>('user-token-balance', 0)
  
  // Use the shared auth system
  const { user: sharedUser, isAuthenticated, logout: sharedLogout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showWallet, setShowWallet] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize shared system
        await initializePewpiShared()
        
        // Try Spark authentication first
        // Initialize integration listener
        const integration = createInfinityBrainIntegration()
        
        // Initialize token tracking
        TokenService.initAutoTracking()

        // Listen for token events
        const unsubscribe = TokenService.on('created', (event) => {
          updateTokenCount()
          toast.success(`Token created: ${event.token.name}`, {
            description: `${event.token.amount} ${event.token.symbol}`
          })
        })

        // Try Spark auth first
        const currentUser = await window.spark.user()
        console.log('Spark user data:', currentUser)
        
        if (currentUser && currentUser.login) {
          setSparkUser(currentUser)
          toast.success(`Welcome back, ${currentUser.login}! 🧠`, {
            description: `You have ${tokenBalance || 0} INF tokens`
          })
        } else {
          // Check for our auth system
          const authUser = AuthService.getCurrentUser()
          if (authUser) {
            toast.success(`Welcome back, ${authUser.username}! 🧠`)
          }
        }

        // Load initial token count
        updateTokenCount()

        return () => {
          unsubscribe()
          integration.cleanup()
        }
      } catch (error) {
        console.error('Initialization error:', error)
        console.log('Spark not available, using shared auth system')
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeApp()
  }, [])

  // Determine which user to display
  const displayUser = sparkUser || sharedUser
  const hasAuth = sparkUser !== null || isAuthenticated

  const handleLogout = async () => {
    if (sharedLogout) {
      await sharedLogout()
      toast.success('Logged out successfully')
    }
  }

  // Show login screen if no authentication
  if (!isLoading && !hasAuth) {
    return <Login />
  const updateTokenCount = async () => {
    const tokens = await TokenService.getAll()
    setTokenCount(tokens.length)
  }

  const handleLoginSuccess = () => {
    const authUser = AuthService.getCurrentUser()
    if (authUser) {
      toast.success(`Welcome, ${authUser.username}!`)
    }
    setShowLogin(false)
  }

  return (
    <div className="min-h-screen cosmic-background">
      <Toaster position="top-right" />
      
      <nav className="border-b border-border bg-card/95 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Infinity size={32} weight="duotone" className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                Infinity Brain
              </h1>
              {isAuthenticated && !sparkUser && (
                <Badge variant="outline" className="text-xs">
                  Shared Auth
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWallet(true)}
                className="flex items-center gap-2"
              >
                <WalletIcon size={16} />
                <span className="hidden sm:inline">Wallet</span>
                <Badge variant="secondary" className="text-xs">
                  {tokenCount}
                </Badge>
              </Button>
              
              {user ? (
                <div className="flex items-center gap-2">
                  <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full border-2 border-border" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">{user.login}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tokenBalance || 0} INF
                  </Badge>
                  {isAuthenticated && !sparkUser && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleLogout}
                      className="ml-2"
                    >
                      <SignOut size={16} weight="duotone" />
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 shadow-sm gap-1 flex-wrap">
            <TabsTrigger 
              value="home" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <Brain size={16} weight="duotone" className="mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <WalletIcon size={16} weight="duotone" className="mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="mongoose" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <Brain size={16} weight="duotone" className="mr-2" />
              Mongoose
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <ChatCircle size={16} weight="duotone" className="mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <ChartBar size={16} weight="duotone" className="mr-2" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <Robot size={16} weight="duotone" className="mr-2" />
              Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <ChartLine size={16} weight="duotone" className="mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger 
              value="quantum" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <Atom size={16} weight="duotone" className="mr-2" />
              Quantum
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-2 h-9 text-sm font-medium transition-all"
            >
              <Wallet size={16} weight="duotone" className="mr-2" />
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-10">
            <Card className="border border-border bg-card shadow-sm">
              <CardContent className="p-10">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">Welcome to Infinity Brain</h2>
                  <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    AI-powered intelligence system with production-grade login, wallet, token synchronization,
                    Mongoose.os, Neural Chat, Behavior Analytics, Project Completion Assistant, 
                    Infinity Token Charts with Plateau Growth, and Auto Repo Cart Sync.
                  </p>
                  <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={() => setActiveTab('wallet')}>
                      <WalletIcon size={18} weight="duotone" className="mr-2" />
                      Open Wallet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card
                className="cursor-pointer border border-border hover:border-primary hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Brain size={32} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Mongoose.os</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      AI intelligence system with data cart processing
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('mongoose')} className="mushroom-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-accent hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 w-fit">
                    <ChatCircle size={32} weight="duotone" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Neural Slot Chat</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      AI-powered chat with Mongoose.os intelligence
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('chat')} className="lightning-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-secondary hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10 w-fit">
                    <ChartBar size={32} weight="duotone" className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Behavior Heatmap</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Track most used features and activity trends
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('heatmap')} className="star-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-primary hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Robot size={32} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">AI Project Assistant</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Intelligent project completion suggestions
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('assistant')} className="crown-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-accent hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 w-fit">
                    <ChartLine size={32} weight="duotone" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Infinity Charts</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Token charts with plateau growth algorithm
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('charts')} className="brick-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-primary hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Wallet size={32} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Wallet & Tokens</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Production login and token management system
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('wallet')} className="mushroom-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-secondary hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10 w-fit">
                    <GitBranch size={32} weight="duotone" className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Repo Cart Sync</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Auto-sync files between all repos
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('mongoose')} className="square-btn">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border border-border hover:border-primary hover:shadow-md transition-all duration-300 glow-card"
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit">
                    <Atom size={32} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Quantum Jukebox</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Bismuth frequency music player with AI tracks
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('quantum')} className="lightning-btn">
                    Play
                  </button>
                </CardContent>
              </Card>
            </div>

            <RepoCartSync />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-8">
            <Wallet />
          </TabsContent>

          <TabsContent value="mongoose" className="space-y-8">
            <MongooseOSBrain />
            <RepoCartSync />
          </TabsContent>

          <TabsContent value="chat" className="space-y-8">
            <NeuralSlotChat />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-8">
            <UserBehaviorHeatmap />
          </TabsContent>

          <TabsContent value="assistant" className="space-y-8">
            <AIProjectCompletionAssistant />
          </TabsContent>

          <TabsContent value="charts" className="space-y-8">
            <InfinityTokenCharts />
          </TabsContent>

          <TabsContent value="quantum" className="space-y-8">
            <QuantumJukebox />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-8">
            <DemoIntegration />
          </TabsContent>
        </Tabs>
      </div>

      {/* Login Modal */}
      <LoginComponent
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Wallet Modal */}
      <WalletUI
        open={showWallet}
        onClose={() => setShowWallet(false)}
      />
    </div>
  )
}

export default App
