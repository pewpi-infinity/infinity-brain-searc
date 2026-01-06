import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { House, Robot, Sparkle, CurrencyDollar, Storefront, GitBranch, GameController, MusicNotes, LockKey, Brain } from '@phosphor-icons/react'
import { toast, Toaster } from 'sonner'
import { TokenMinter } from '@/components/TokenMinter'
import { TokenMarketplace } from '@/components/TokenMarketplace'
import { TokenAuction } from '@/components/TokenAuction'
import { RepoManagementHub } from '@/components/RepoManagementHub'
import { AIChat } from '@/components/AIChat'
import { QuantumJukebox } from '@/components/QuantumJukebox'
import { QuantumEncryptionVault } from '@/components/QuantumEncryptionVault'
import { SlotMachine } from '@/components/SlotMachine'
import { EmojiCatcherGame } from '@/components/EmojiCatcherGame'
import { MongooseOSBrain } from '@/components/MongooseOSBrain'

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
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        <header className="mb-12 space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Sparkle size={48} weight="duotone" className="text-accent animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Infinity Brain
            </h1>
          </div>
          <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered productivity hub with Mongoose.os intelligence
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-3 md:grid-cols-9 h-auto gap-3 bg-card/80 backdrop-blur p-3 rounded-2xl">
            <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <House size={24} weight="duotone" />
              <span className="text-xs font-medium">Home</span>
            </TabsTrigger>
            <TabsTrigger value="brain" className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <Brain size={24} weight="duotone" />
              <span className="text-xs font-medium">Mongoose</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <CurrencyDollar size={24} weight="duotone" />
              <span className="text-xs font-medium">Create</span>
            </TabsTrigger>
            <TabsTrigger value="trade" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <Storefront size={24} weight="duotone" />
              <span className="text-xs font-medium">Trade</span>
            </TabsTrigger>
            <TabsTrigger value="build" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <GitBranch size={24} weight="duotone" />
              <span className="text-xs font-medium">Build</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <Robot size={24} weight="duotone" />
              <span className="text-xs font-medium">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <MusicNotes size={24} weight="duotone" />
              <span className="text-xs font-medium">Quantum</span>
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <LockKey size={24} weight="duotone" />
              <span className="text-xs font-medium">Vault</span>
            </TabsTrigger>
            <TabsTrigger value="play" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-2 py-3 rounded-xl">
              <GameController size={24} weight="duotone" />
              <span className="text-xs font-medium">Play</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-10">
            <div className="bg-gradient-to-br from-card/90 via-card/80 to-card/90 backdrop-blur rounded-3xl p-10 border-2 border-accent/20 shadow-xl">
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-bold">Welcome to Infinity Brain</h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Your personal AI-powered productivity hub for creating tokens, trading, building websites, and managing your digital economy with Mongoose.os intelligence.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Button
                onClick={() => setActiveTab('brain')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <Brain size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Mongoose.os</div>
                  <div className="text-sm opacity-90">AI intelligence system</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('create')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <CurrencyDollar size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Create Tokens</div>
                  <div className="text-sm opacity-90">Mint & manage tokens</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('trade')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <Storefront size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Trade & Markets</div>
                  <div className="text-sm opacity-90">Buy, sell, and auction</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('build')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <GitBranch size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Build & Deploy</div>
                  <div className="text-sm opacity-90">Create websites</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('explore')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <Robot size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">AI Chat</div>
                  <div className="text-sm opacity-90">Talk with AI assistant</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('quantum')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <MusicNotes size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Quantum Jukebox</div>
                  <div className="text-sm opacity-90">Bismuth audio system</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('vault')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <LockKey size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Encryption Vault</div>
                  <div className="text-sm opacity-90">SHA + Bismuth encryption</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('play')}
                className="h-40 text-lg flex-col gap-4 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg hover:shadow-xl transition-all rounded-2xl"
              >
                <GameController size={40} weight="duotone" />
                <div>
                  <div className="font-bold text-xl">Play & Earn</div>
                  <div className="text-sm opacity-90">Games and rewards</div>
                </div>
              </Button>
            </div>

            <div className="bg-card/90 backdrop-blur rounded-3xl p-8 border border-border shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-muted/70 to-muted/50 rounded-2xl">
                  <div className="text-3xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground mt-2">Tokens Created</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-muted/70 to-muted/50 rounded-2xl">
                  <div className="text-3xl font-bold text-secondary">∞</div>
                  <div className="text-sm text-muted-foreground mt-2">Active Auctions</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-muted/70 to-muted/50 rounded-2xl">
                  <div className="text-3xl font-bold text-accent">∞</div>
                  <div className="text-sm text-muted-foreground mt-2">Websites Built</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-muted/70 to-muted/50 rounded-2xl">
                  <div className="text-3xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground mt-2">Community Members</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="brain" className="space-y-8">
            <MongooseOSBrain />
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <TokenMinter />
          </TabsContent>

          <TabsContent value="trade" className="space-y-8">
            <div className="space-y-8">
              <TokenMarketplace />
              <TokenAuction />
            </div>
          </TabsContent>

          <TabsContent value="build" className="space-y-8">
            <RepoManagementHub />
          </TabsContent>

          <TabsContent value="explore" className="space-y-8">
            <AIChat />
          </TabsContent>

          <TabsContent value="quantum" className="space-y-8">
            <QuantumJukebox />
          </TabsContent>

          <TabsContent value="vault" className="space-y-8">
            <QuantumEncryptionVault />
          </TabsContent>

          <TabsContent value="play" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <SlotMachine />
              <EmojiCatcherGame />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
