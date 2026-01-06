import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <div className="min-h-screen mesh-background">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <header className="mb-10 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Infinity size={56} weight="duotone" className="text-blue-500 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Infinity Brain
            </h1>
          </div>
          <p className="text-center text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-Powered Intelligence System • Clean Blue & White Design
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-6 gap-2 bg-white/80 backdrop-blur p-2 rounded-xl border-2 border-blue-200">
            <TabsTrigger 
              value="home" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2 py-3 rounded-lg"
            >
              <Brain size={20} weight="duotone" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mongoose" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2 py-3 rounded-lg"
            >
              <Brain size={20} weight="duotone" />
              <span className="hidden sm:inline">Mongoose</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2 py-3 rounded-lg"
            >
              <ChatCircle size={20} weight="duotone" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="heatmap" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2 py-3 rounded-lg"
            >
              <ChartBar size={20} weight="duotone" />
              <span className="hidden sm:inline">Heatmap</span>
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2 py-3 rounded-lg"
            >
              <Robot size={20} weight="duotone" />
              <span className="hidden sm:inline">Assistant</span>
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white flex items-center gap-2 py-3 rounded-lg"
            >
              <ChartLine size={20} weight="duotone" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl p-8 md:p-12 border-2 border-blue-300 shadow-xl">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Welcome to Infinity Brain</h2>
                <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                  Your AI-powered intelligence system with Mongoose.os, Neural Chat, Behavior Analytics, 
                  Project Completion Assistant, Infinity Token Charts with Plateau Growth, and Auto Repo Cart Sync.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('mongoose')}
                className="cursor-pointer group h-48 bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <Brain size={48} weight="duotone" className="mb-4" />
                <div>
                  <div className="font-bold text-2xl">Mongoose.os</div>
                  <div className="text-sm text-blue-100 mt-2">AI intelligence system with data cart processing</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('chat')}
                className="cursor-pointer group h-48 bg-gradient-to-br from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <ChatCircle size={48} weight="duotone" className="mb-4" />
                <div>
                  <div className="font-bold text-2xl">Neural Slot Chat</div>
                  <div className="text-sm text-blue-100 mt-2">AI-powered chat with spinning slot reels</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('heatmap')}
                className="cursor-pointer group h-48 bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <ChartBar size={48} weight="duotone" className="mb-4" />
                <div>
                  <div className="font-bold text-2xl">Behavior Heatmap</div>
                  <div className="text-sm text-cyan-100 mt-2">Track most used features and activity trends</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('assistant')}
                className="cursor-pointer group h-48 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <Robot size={48} weight="duotone" className="mb-4" />
                <div>
                  <div className="font-bold text-2xl">AI Project Assistant</div>
                  <div className="text-sm text-blue-100 mt-2">Intelligent project completion suggestions</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('charts')}
                className="cursor-pointer group h-48 bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <ChartLine size={48} weight="duotone" className="mb-4" />
                <div>
                  <div className="font-bold text-2xl">Infinity Charts</div>
                  <div className="text-sm text-cyan-100 mt-2">Token charts with plateau growth algorithm</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('mongoose')}
                className="cursor-pointer group h-48 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <GitBranch size={48} weight="duotone" className="mb-4" />
                <div>
                  <div className="font-bold text-2xl">Repo Cart Sync</div>
                  <div className="text-sm text-blue-100 mt-2">Auto-sync files between all repos</div>
                </div>
              </div>
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
