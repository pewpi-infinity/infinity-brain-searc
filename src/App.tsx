import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, ChatCircle, ChartBar, ChartLine, GitBranch, Robot, Infinity, Atom, MusicNotes } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { MongooseOSBrain } from '@/components/MongooseOSBrain'
import { NeuralSlotChat } from '@/components/NeuralSlotChat'
import { UserBehaviorHeatmap } from '@/components/UserBehaviorHeatmap'
import { AIProjectCompletionAssistant } from '@/components/AIProjectCompletionAssistant'
import { InfinityTokenCharts } from '@/components/InfinityTokenCharts'
import { RepoCartSync } from '@/components/RepoCartSync'
import { QuantumJukebox } from '@/components/QuantumJukebox'

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
        const currentUser = await window.spark.user()
        console.log('User data:', currentUser)
        
        if (currentUser && currentUser.login) {
          setUser(currentUser)
          toast.success(`Welcome back, ${currentUser.login}! 🧠`, {
            description: `You have ${tokenBalance || 0} INF tokens`
          })
        }
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeApp()
  }, [])



  return (
    <div className="min-h-screen cosmic-background">
      <Toaster position="top-right" />
      
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Infinity size={32} weight="duotone" className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                Infinity Brain
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full border-2 border-primary/40" />
                  <span className="text-sm font-medium">{user.login}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tokenBalance || 0} INF
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-card/60 backdrop-blur border border-border/50 p-1.5 shadow-lg gap-2">
            <TabsTrigger 
              value="home" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <Brain size={18} weight="duotone" className="mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger 
              value="mongoose" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <Brain size={18} weight="duotone" className="mr-2" />
              Mongoose
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <ChatCircle size={18} weight="duotone" className="mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <ChartBar size={18} weight="duotone" className="mr-2" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <Robot size={18} weight="duotone" className="mr-2" />
              Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <ChartLine size={18} weight="duotone" className="mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger 
              value="quantum" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2 h-10 text-sm font-medium transition-all"
            >
              <Atom size={18} weight="duotone" className="mr-2" />
              Quantum
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-card/50">
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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card
                onClick={() => setActiveTab('mongoose')}
                className="cursor-pointer border-2 border-primary/20 hover:border-primary hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 w-fit">
                    <Brain size={40} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">Mongoose.os</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI intelligence system with data cart processing
                    </p>
                  </div>
                  <button className="mushroom-btn w-full">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('chat')}
                className="cursor-pointer border-2 border-accent/20 hover:border-accent hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 w-fit">
                    <ChatCircle size={40} weight="duotone" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">Neural Slot Chat</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI-powered chat with Mongoose.os intelligence
                    </p>
                  </div>
                  <button className="lightning-btn w-full">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('heatmap')}
                className="cursor-pointer border-2 border-secondary/20 hover:border-secondary hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 w-fit">
                    <ChartBar size={40} weight="duotone" className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">Behavior Heatmap</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Track most used features and activity trends
                    </p>
                  </div>
                  <button className="star-btn w-full">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('assistant')}
                className="cursor-pointer border-2 border-primary/20 hover:border-primary hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 w-fit">
                    <Robot size={40} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">AI Project Assistant</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Intelligent project completion suggestions
                    </p>
                  </div>
                  <button className="crown-btn w-full">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('charts')}
                className="cursor-pointer border-2 border-accent/20 hover:border-accent hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/10 w-fit">
                    <ChartLine size={40} weight="duotone" className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">Infinity Charts</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Token charts with plateau growth algorithm
                    </p>
                  </div>
                  <button className="brick-btn w-full">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('mongoose')}
                className="cursor-pointer border-2 border-secondary/20 hover:border-secondary hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/10 w-fit">
                    <GitBranch size={40} weight="duotone" className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">Repo Cart Sync</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Auto-sync files between all repos
                    </p>
                  </div>
                  <button className="square-btn w-full">
                    Open
                  </button>
                </CardContent>
              </Card>

              <Card
                onClick={() => setActiveTab('quantum')}
                className="cursor-pointer border-2 border-primary/20 hover:border-primary hover:shadow-2xl transition-all duration-300 glow-card"
              >
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 w-fit">
                    <Atom size={40} weight="duotone" className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 text-foreground">Quantum Jukebox</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Bismuth frequency music player with AI tracks
                    </p>
                  </div>
                  <button className="lightning-btn w-full">
                    Play
                  </button>
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

          <TabsContent value="quantum" className="space-y-8">
            <QuantumJukebox />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
