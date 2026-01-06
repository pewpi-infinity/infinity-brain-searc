import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Brain, ChatCircle, ChartBar, ChartLine, GitBranch, Robot, Infinity } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import { MongooseOSBrain } from '@/components/MongooseOSBrain'
import { NeuralSlotChat } from '@/components/NeuralSlotChat'
import { UserBehaviorHeatmap } from '@/components/UserBehaviorHeatmap'
import { AIProjectCompletionAssistant } from '@/components/AIProjectCompletionAssistant'
import { InfinityTokenCharts } from '@/components/InfinityTokenCharts'
import { RepoCartSync } from '@/components/RepoCartSync'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (typeof window !== 'undefined' && window.spark) {
          console.log('✅ Infinity Brain initialized')
          toast.success('Welcome to Infinity Brain 🧠')
        }
      } catch (error) {
        console.warn('Initialization:', error)
      }
    }
    
    initializeApp().catch(err => console.warn('Init:', err))
  }, [])

  return (
    <div className="min-h-screen paypal-background">
      <Toaster position="top-right" />
      
      <nav className="border-b border-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Infinity size={32} weight="duotone" className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                Infinity Brain
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="slim-button slim-button-secondary">
                Sign In
              </Button>
              <Button size="sm" className="slim-button slim-button-primary">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <TabsTrigger 
              value="home" 
              className="slim-button data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Brain size={18} weight="duotone" className="mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger 
              value="mongoose" 
              className="slim-button data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Brain size={18} weight="duotone" className="mr-2" />
              Mongoose
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="slim-button data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <ChatCircle size={18} weight="duotone" className="mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="slim-button data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <ChartBar size={18} weight="duotone" className="mr-2" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="slim-button data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Robot size={18} weight="duotone" className="mr-2" />
              Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="slim-button data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <ChartLine size={18} weight="duotone" className="mr-2" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="paypal-section">
              <div className="text-center space-y-3 py-8">
                <h2 className="text-3xl font-bold text-foreground">Welcome to Infinity Brain</h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  AI-powered intelligence system with Mongoose.os, Neural Chat, Behavior Analytics, 
                  Project Completion Assistant, Infinity Token Charts with Plateau Growth, and Auto Repo Cart Sync.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('mongoose')}
                className="glow-card cursor-pointer p-6 flex flex-col gap-4"
              >
                <Brain size={32} weight="duotone" className="text-primary" />
                <div>
                  <div className="font-semibold text-lg text-foreground">Mongoose.os</div>
                  <div className="text-sm text-muted-foreground mt-1">AI intelligence system with data cart processing</div>
                </div>
                <Button className="slim-button slim-button-primary w-full mt-auto">
                  Open
                </Button>
              </div>

              <div
                onClick={() => setActiveTab('chat')}
                className="glow-card cursor-pointer p-6 flex flex-col gap-4"
              >
                <ChatCircle size={32} weight="duotone" className="text-primary" />
                <div>
                  <div className="font-semibold text-lg text-foreground">Neural Slot Chat</div>
                  <div className="text-sm text-muted-foreground mt-1">AI-powered chat with spinning slot reels</div>
                </div>
                <Button className="slim-button slim-button-primary w-full mt-auto">
                  Open
                </Button>
              </div>

              <div
                onClick={() => setActiveTab('heatmap')}
                className="glow-card cursor-pointer p-6 flex flex-col gap-4"
              >
                <ChartBar size={32} weight="duotone" className="text-primary" />
                <div>
                  <div className="font-semibold text-lg text-foreground">Behavior Heatmap</div>
                  <div className="text-sm text-muted-foreground mt-1">Track most used features and activity trends</div>
                </div>
                <Button className="slim-button slim-button-primary w-full mt-auto">
                  Open
                </Button>
              </div>

              <div
                onClick={() => setActiveTab('assistant')}
                className="glow-card cursor-pointer p-6 flex flex-col gap-4"
              >
                <Robot size={32} weight="duotone" className="text-primary" />
                <div>
                  <div className="font-semibold text-lg text-foreground">AI Project Assistant</div>
                  <div className="text-sm text-muted-foreground mt-1">Intelligent project completion suggestions</div>
                </div>
                <Button className="slim-button slim-button-primary w-full mt-auto">
                  Open
                </Button>
              </div>

              <div
                onClick={() => setActiveTab('charts')}
                className="glow-card cursor-pointer p-6 flex flex-col gap-4"
              >
                <ChartLine size={32} weight="duotone" className="text-primary" />
                <div>
                  <div className="font-semibold text-lg text-foreground">Infinity Charts</div>
                  <div className="text-sm text-muted-foreground mt-1">Token charts with plateau growth algorithm</div>
                </div>
                <Button className="slim-button slim-button-primary w-full mt-auto">
                  Open
                </Button>
              </div>

              <div
                onClick={() => setActiveTab('mongoose')}
                className="glow-card cursor-pointer p-6 flex flex-col gap-4"
              >
                <GitBranch size={32} weight="duotone" className="text-primary" />
                <div>
                  <div className="font-semibold text-lg text-foreground">Repo Cart Sync</div>
                  <div className="text-sm text-muted-foreground mt-1">Auto-sync files between all repos</div>
                </div>
                <Button className="slim-button slim-button-primary w-full mt-auto">
                  Open
                </Button>
              </div>
            </div>

            <RepoCartSync />
          </TabsContent>

          <TabsContent value="mongoose" className="space-y-6">
            <MongooseOSBrain />
            <RepoCartSync />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <NeuralSlotChat />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <UserBehaviorHeatmap />
          </TabsContent>

          <TabsContent value="assistant" className="space-y-6">
            <AIProjectCompletionAssistant />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <InfinityTokenCharts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
