import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { House, Robot, Sparkle, CurrencyDollar, Storefront, GitBranch, GameController, MusicNotes, LockKey } from '@phosphor-icons/react'
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

function App() {
  const [activeTab, setActiveTab] = useState('home')

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (typeof window !== 'undefined' && window.spark) {
          console.log('✅ Infinity Brain initialized')
          toast.success('Welcome to Infinity Brain')
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkle size={40} weight="duotone" className="text-accent animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Infinity Brain
            </h1>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-4 md:grid-cols-8 h-auto gap-2 bg-card/80 backdrop-blur p-2">
            <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-2">
              <House size={20} weight="duotone" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-1 py-2">
              <CurrencyDollar size={20} weight="duotone" />
              <span className="text-xs">Create</span>
            </TabsTrigger>
            <TabsTrigger value="trade" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-2">
              <Storefront size={20} weight="duotone" />
              <span className="text-xs">Trade</span>
            </TabsTrigger>
            <TabsTrigger value="build" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-2">
              <GitBranch size={20} weight="duotone" />
              <span className="text-xs">Build</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-1 py-2">
              <Robot size={20} weight="duotone" />
              <span className="text-xs">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-2">
              <MusicNotes size={20} weight="duotone" />
              <span className="text-xs">Quantum</span>
            </TabsTrigger>
            <TabsTrigger value="vault" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-1 py-2">
              <LockKey size={20} weight="duotone" />
              <span className="text-xs">Vault</span>
            </TabsTrigger>
            <TabsTrigger value="play" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-2">
              <GameController size={20} weight="duotone" />
              <span className="text-xs">Play</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            <div className="bg-card/80 backdrop-blur rounded-lg p-8 border-2 border-accent/20">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Welcome to Infinity Brain</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Your personal AI-powered productivity hub for creating tokens, trading, building websites, and managing your digital economy.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Button
                onClick={() => setActiveTab('create')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <CurrencyDollar size={32} weight="duotone" />
                <div>
                  <div className="font-bold">Create Tokens</div>
                  <div className="text-sm opacity-90">Mint & manage tokens</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('trade')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Storefront size={32} weight="duotone" />
                <div>
                  <div className="font-bold">Trade & Markets</div>
                  <div className="text-sm opacity-90">Buy, sell, and auction</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('build')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              >
                <GitBranch size={32} weight="duotone" />
                <div>
                  <div className="font-bold">Build & Deploy</div>
                  <div className="text-sm opacity-90">Create websites</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('explore')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Robot size={32} weight="duotone" />
                <div>
                  <div className="font-bold">AI Chat</div>
                  <div className="text-sm opacity-90">Talk with AI assistant</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('quantum')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
              >
                <MusicNotes size={32} weight="duotone" />
                <div>
                  <div className="font-bold">Quantum Jukebox</div>
                  <div className="text-sm opacity-90">Bismuth audio system</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('vault')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <LockKey size={32} weight="duotone" />
                <div>
                  <div className="font-bold">Encryption Vault</div>
                  <div className="text-sm opacity-90">SHA + Bismuth encryption</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveTab('play')}
                className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              >
                <GameController size={32} weight="duotone" />
                <div>
                  <div className="font-bold">Play & Earn</div>
                  <div className="text-sm opacity-90">Games and rewards</div>
                </div>
              </Button>
            </div>

            <div className="bg-card/80 backdrop-blur rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground">Tokens Created</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">∞</div>
                  <div className="text-sm text-muted-foreground">Active Auctions</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-accent">∞</div>
                  <div className="text-sm text-muted-foreground">Websites Built</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground">Community Members</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <TokenMinter />
          </TabsContent>

          <TabsContent value="trade" className="space-y-6">
            <div className="space-y-6">
              <TokenMarketplace />
              <TokenAuction />
            </div>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <RepoManagementHub />
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <AIChat />
          </TabsContent>

          <TabsContent value="quantum" className="space-y-6">
            <QuantumJukebox />
          </TabsContent>

          <TabsContent value="vault" className="space-y-6">
            <QuantumEncryptionVault />
          </TabsContent>

          <TabsContent value="play" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
