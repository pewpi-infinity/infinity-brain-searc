import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, ChatCircle, ChartBar, ChartLine, GitBranch, Robot, Infinity, SignIn, SignOut } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { MongooseOSBrain } from '@/components/MongooseOSBrain'
import { NeuralSlotChat } from '@/components/NeuralSlotChat'
import { UserBehaviorHeatmap } from '@/components/UserBehaviorHeatmap'
import { AIProjectCompletionAssistant } from '@/components/AIProjectCompletionAssistant'
import { InfinityTokenCharts } from '@/components/InfinityTokenCharts'
import { RepoCartSync } from '@/components/RepoCartSync'

interface UserInfo {
  avatarUrl: string
  email: string
  id: string
  isOwner: boolean
  login: string
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenBalance, setTokenBalance] = useKV<number>('user-token-balance', 0)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (typeof window !== 'undefined' && window.spark && typeof window.spark.user === 'function') {
          console.log('✅ Infinity Brain initialized')
          
          const currentUser = await window.spark.user()
          console.log('User data:', currentUser)
          
          if (currentUser && currentUser.login) {
            setUser(currentUser)
            toast.success(`Welcome back, ${currentUser.login}! 🧠`, {
              description: `You have ${tokenBalance || 0} INF tokens`
            })
          } else {
            console.warn('No user logged in')
            toast.info('Sign in with GitHub to access all features', {
              description: 'Click the Sign In button in the top right'
            })
          }
        } else {
          console.error('Spark SDK not available')
          toast.error('Platform initialization issue', {
            description: 'Spark SDK is not loaded properly'
          })
        }
      } catch (error) {
        console.error('Initialization error:', error)
        toast.error('Failed to initialize user session', {
          description: String(error)
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeApp().catch(err => console.error('Init error:', err))
  }, [tokenBalance])

  const handleSignIn = async () => {
    try {
      if (!window.spark || typeof window.spark.user !== 'function') {
        toast.error('Cannot sign in', {
          description: 'Spark SDK not available. Please refresh the page.'
        })
        return
      }

      const currentUser = await window.spark.user()
      console.log('Sign in attempt, user:', currentUser)
      
      if (currentUser && currentUser.login) {
        setUser(currentUser)
        toast.success(`✅ Signed in as ${currentUser.login}`, {
          description: 'All features are now available'
        })
      } else {
        toast.error('Sign in failed', {
          description: 'No GitHub user found. You may need to authorize this app in your GitHub settings.'
        })
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Sign in failed', {
        description: String(error)
      })
    }
  }

  const handleSignOut = () => {
    setUser(null)
    toast.success('Signed out successfully')
  }

  return (
    <div className="min-h-screen paypal-background">
      <Toaster position="top-right" />
      
      <nav className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Infinity size={32} weight="duotone" className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                Infinity Brain
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2">
                    <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium">{user.login}</span>
                    <span className="text-xs text-muted-foreground">
                      {tokenBalance || 0} INF
                    </span>
                  </div>
                  <Button variant="outline" size="default" onClick={handleSignOut}>
                    <SignOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="default" onClick={handleSignIn}>
                    <SignIn size={18} className="mr-2" />
                    Sign In with GitHub
                  </Button>
                  <Button size="default" className="bg-gradient-to-r from-primary to-secondary" onClick={handleSignIn}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-white border border-border p-1 shadow-sm gap-1">
            <TabsTrigger 
              value="home" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-3 h-9 text-sm"
            >
              <Brain size={16} weight="duotone" className="mr-1.5" />
              Home
            </TabsTrigger>
            <TabsTrigger 
              value="mongoose" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-3 h-9 text-sm"
            >
              <Brain size={16} weight="duotone" className="mr-1.5" />
              Mongoose
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-3 h-9 text-sm"
            >
              <ChatCircle size={16} weight="duotone" className="mr-1.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-3 h-9 text-sm"
            >
              <ChartBar size={16} weight="duotone" className="mr-1.5" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-3 h-9 text-sm"
            >
              <Robot size={16} weight="duotone" className="mr-1.5" />
              Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-3 h-9 text-sm"
            >
              <ChartLine size={16} weight="duotone" className="mr-1.5" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-foreground">Welcome to Infinity Brain</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    AI-powered intelligence system with Mongoose.os, Neural Chat, Behavior Analytics, 
                    Project Completion Assistant, Infinity Token Charts with Plateau Growth, and Auto Repo Cart Sync.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                onClick={() => setActiveTab('mongoose')}
                className="cursor-pointer border-2 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit">
                    <Brain size={40} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">Mongoose.os</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI intelligence system with data cart processing
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary h-9 text-sm">
                    Open
                  </Button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('chat')}
                className="cursor-pointer border-2 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 w-fit">
                    <ChatCircle size={40} weight="duotone" className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">Neural Slot Chat</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI-powered chat with Mongoose.os intelligence
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 h-9 text-sm">
                    Open
                  </Button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('heatmap')}
                className="cursor-pointer border-2 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 w-fit">
                    <ChartBar size={40} weight="duotone" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">Behavior Heatmap</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Track most used features and activity trends
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-accent to-secondary h-9 text-sm">
                    Open
                  </Button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('assistant')}
                className="cursor-pointer border-2 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 w-fit">
                    <Robot size={40} weight="duotone" className="text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">AI Project Assistant</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Intelligent project completion suggestions
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 h-9 text-sm">
                    Open
                  </Button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('charts')}
                className="cursor-pointer border-2 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 w-fit">
                    <ChartLine size={40} weight="duotone" className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">Infinity Charts</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Token charts with plateau growth algorithm
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 h-9 text-sm">
                    Open
                  </Button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('mongoose')}
                className="cursor-pointer border-2 hover:border-primary hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 w-fit">
                    <GitBranch size={40} weight="duotone" className="text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">Repo Cart Sync</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Auto-sync files between all repos
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 h-9 text-sm">
                    Open
                  </Button>
                </CardContent>
              </Card>
            </div>

            <RepoCartSync />
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
        </Tabs>
      </div>
    </div>
  )
}

export default App
