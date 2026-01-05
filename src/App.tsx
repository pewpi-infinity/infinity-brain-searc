import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SearchBar } from '@/components/SearchBar'
import { AIChat } from '@/components/AIChat'
import { SlotMachine } from '@/components/SlotMachine'
import { SearchResults, SearchResult } from '@/components/SearchResults'
import { SearchGraph } from '@/components/SearchGraph'
import { PageHub } from '@/components/PageHub'
import { ModuleBrowser } from '@/components/ModuleBrowser'
import { SafetyPromise } from '@/components/SafetyPromise'
import { SafeModeToggle } from '@/components/SafeModeToggle'
import { AutoPilotControl } from '@/components/AutoPilotControl'
import { ComprehensiveAuctionAnalytics } from '@/components/ComprehensiveAuctionAnalytics'
import { SafetyFooter } from '@/components/SafetyFooter'
import { IntentBasedHelper } from '@/components/IntentBasedHelper'
import { AIGuardian } from '@/components/AIGuardian'
import { TokenMinter } from '@/components/TokenMinter'
import { TokenMarketplace } from '@/components/TokenMarketplace'
import { TokenAuction } from '@/components/TokenAuction'
import { LiveAuctionViewer } from '@/components/LiveAuctionViewer'
import { TokenMetricsDashboard } from '@/components/TokenMetricsDashboard'
import { AuctionTemplates } from '@/components/AuctionTemplates'
import { AuctionWatchList } from '@/components/AuctionWatchList'
import { UserDashboard } from '@/components/UserDashboard'
import { MarketOverview } from '@/components/MarketOverview'
import { PageExporter } from '@/components/PageExporter'
import { DeploymentHub } from '@/components/DeploymentHub'
import { SocialPoster } from '@/components/SocialPoster'
import { HashtagTrendAnalyzer } from '@/components/HashtagTrendAnalyzer'
import { SentimentHeatmap } from '@/components/SentimentHeatmap'
import { SentimentForecaster } from '@/components/SentimentForecaster'
import { SentimentAlertSystem } from '@/components/SentimentAlertSystem'
import { BackgroundChanger } from '@/components/BackgroundChanger'
import { EmojiFeatureHub } from '@/components/EmojiFeatureHub'
import { SocialSecurityDistributor } from '@/components/SocialSecurityDistributor'
import { SocialSecurityPlatform } from '@/components/SocialSecurityPlatform'
import { InfinityTokenSale } from '@/components/InfinityTokenSale'
import { EmojiCatcherGame } from '@/components/EmojiCatcherGame'
import { RepoBackupSystem } from '@/components/RepoBackupSystem'
import { ThemeCustomizer } from '@/components/ThemeCustomizer'
import { InteractiveTokenChart } from '@/components/InteractiveTokenChart'
import { MediaUploadWithAI } from '@/components/MediaUploadWithAI'
import { EngagementAnalytics } from '@/components/EngagementAnalytics'
import { TwitterSpacesRadio } from '@/components/TwitterSpacesRadio'
import { AdminTools } from '@/components/AdminTools'
import { ResearchTokenMinter } from '@/components/ResearchTokenMinter'
import { ResearchAuctionQuickLinks } from '@/components/ResearchAuctionQuickLinks'
import { RepoQualityScorer } from '@/components/RepoQualityScorer'
import { MarioScene } from '@/components/MarioScene'
import { House, Robot, Coin, Sparkle, CurrencyDollar, Storefront, ChartLine, GitBranch, ShareNetwork, GameController, List, ShieldCheck, HandHeart } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { AuthProvider } from '@/lib/auth'
import { restoreAdminAuctions, protectAdminAuctions } from '@/lib/adminProtection'
import { TokenRedistributionServiceProvider } from '@/lib/tokenRedistributionService.tsx'
import { AutoAuctionSystem } from '@/components/AutoAuctionSystem'
import { BatchRepoAnalyzer } from '@/components/BatchRepoAnalyzer'
import { RepoFileBuilder } from '@/components/RepoFileBuilder'
import { GitHubInfinityScanner } from '@/components/GitHubInfinityScanner'
import { TokenActivityMonitor } from '@/components/TokenActivityMonitor'
import { TokenRedistributionNotifier } from '@/components/TokenRedistributionNotifier'
import { RedistributionHistory } from '@/components/RedistributionHistory'
import { AutoPricingAlgorithm } from '@/components/AutoPricingAlgorithm'
import { AutoPricedAuctionCreator } from '@/components/AutoPricedAuctionCreator'
import { HelpMeChoose } from '@/components/HelpMeChoose'
import { WelcomeFlow } from '@/components/WelcomeFlow'
import { BatchAutomation } from '@/components/BatchAutomation'
import { PageHealthMonitor } from '@/components/PageHealthMonitor'
import { RepoManagementHub } from '@/components/RepoManagementHub'
import { BlockchainIntegration } from '@/components/BlockchainIntegration'
import { LiveRepoManager } from '@/components/LiveRepoManager'
import { AIPageRepair } from '@/components/AIPageRepair'
import { ContinuousPageMonitor } from '@/components/ContinuousPageMonitor'
import { AuthDebugPanel } from '@/components/AuthDebugPanel'
import { AIDebugger } from '@/components/AIDebugger'
import { BismuthSignalReader } from '@/components/BismuthSignalReader'

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showGraph, setShowGraph] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      // Check if Spark is available before trying to use it
      if (!window.spark) {
        console.log('Spark not available - skipping auction protection initialization')
        return
      }
      
      // Add delay to let Spark fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        await restoreAdminAuctions()
        await protectAdminAuctions()
        console.log('✅ Auction protection initialized successfully')
      } catch (error) {
        console.error('Failed to restore/protect auctions:', error)
      }
    }
    
    initializeApp()
    
    // Only set up protection interval if Spark is available
    if (!window.spark) {
      return
    }
    
    const protectionInterval = setInterval(async () => {
      try {
        await protectAdminAuctions()
      } catch (error) {
        console.error('Protection check failed:', error)
      }
    }, 60000)
    
    return () => clearInterval(protectionInterval)
  }, [])

  const handleSearch = async (query: string, mode: 'web' | 'ai') => {
    setSearchQuery(query)
    setIsSearching(true)
    setShowGraph(false)

    // Check if Spark is available
    if (!window.spark || !window.spark.llm) {
      toast.error('Search requires GitHub Spark environment')
      setIsSearching(false)
      return
    }

    if (mode === 'ai') {
      setActiveTab('explore')
      setIsSearching(false)
      return
    }

    try {
      const promptText = `Generate 5 realistic web search results for the query: "${query}". Return as JSON with a "results" array containing objects with id, title, snippet, url, and source fields.`
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      
      // Validate response before parsing
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from API')
      }
      
      let data
      try {
        data = JSON.parse(response)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Failed to parse API response')
      }
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure received')
      }
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results)
        setActiveTab('explore')
        toast.success(`Found ${data.results.length} results for "${query}"`)
      } else {
        throw new Error('Invalid results format')
      }
    } catch (error) {
      toast.error('Search failed. Please try again.')
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <AuthProvider>
      <TokenRedistributionServiceProvider>
        <div className="min-h-screen mesh-background">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <header className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="bg-card/90 backdrop-blur-md hover:bg-accent/20 border-2 shadow-lg"
                    >
                      <List size={24} weight="bold" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2 text-xl">
                        <Sparkle size={28} weight="duotone" className="text-accent" />
                        Advanced Controls
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
                      <div className="space-y-6">
                        
                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">👤 Account & Identity</h3>
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('user')}
                            >
                              <ShieldCheck size={20} weight="duotone" />
                              My Dashboard
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('admin')}
                            >
                              <ShieldCheck size={20} weight="duotone" />
                              Admin Tools
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('buy-inf')}
                            >
                              <Coin size={20} weight="duotone" />
                              Buy INF Tokens
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">💰 Token Economy</h3>
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('charts')}
                            >
                              <ChartLine size={18} weight="duotone" />
                              Token Charts
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('blockchain')}
                            >
                              <CurrencyDollar size={18} weight="duotone" />
                              Live Blockchain
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('templates')}
                            >
                              <Coin size={18} weight="duotone" />
                              Auction Templates
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('auction-analytics')}
                            >
                              <ChartLine size={18} weight="duotone" />
                              Auction Analytics
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">🤖 Automation</h3>
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('autopilot')}
                            >
                              <Robot size={18} weight="duotone" />
                              Auto-Pilot Dashboard
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('batch-automation')}
                            >
                              <Robot size={18} weight="duotone" />
                              Batch Automation
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">💻 Development</h3>
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('scanner')}
                            >
                              <GitBranch size={18} weight="duotone" />
                              GitHub Scanner
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('batch-analyzer')}
                            >
                              <GitBranch size={18} weight="duotone" />
                              Batch Analyzer
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('backup')}
                            >
                              <GitBranch size={18} weight="duotone" />
                              Backup System
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">⚡ Special</h3>
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('social-security')}
                            >
                              <HandHeart size={20} weight="duotone" />
                              Social Security
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('ss-pay')}
                            >
                              <Coin size={20} weight="duotone" />
                              Admin Distribution
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('mario')}
                            >
                              <GameController size={20} weight="duotone" />
                              Mario Scene
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-sm text-muted-foreground mb-3">⚙️ Settings</h3>
                          <div className="space-y-1">
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start gap-2 h-10"
                              onClick={() => setActiveTab('theme')}
                            >
                              <Sparkle size={18} weight="duotone" />
                              Theme Customizer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                
                <div className="flex items-center gap-3">
                  <Sparkle size={40} weight="duotone" className="text-accent animate-pulse" />
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Infinity Brain
                  </h1>
                </div>
                
                <div className="w-10" />
              </div>
              
              <div className="max-w-3xl mx-auto space-y-3">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-4 shadow-lg">
                  <h2 className="text-base font-semibold text-accent mb-2 flex items-center justify-center gap-2">
                    <ShieldCheck size={20} weight="duotone" />
                    Infinity Brain Promise
                  </h2>
                  <p className="text-sm text-foreground/90 text-center">
                    You will never be asked for secret keys, terminal commands, or code.
                    If something can be done safely for you, it will be.
                  </p>
                </div>
                
                <div className="max-w-md mx-auto">
                  <SafeModeToggle />
                </div>
              </div>
            </header>

            <div className="mb-6">
              <SearchBar onSearch={handleSearch} isLoading={isSearching} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-6 h-auto gap-2 bg-card/80 backdrop-blur p-2">
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
                    onClick={() => setActiveTab('social-security')}
                    className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-2 border-white/20"
                  >
                    <HandHeart size={32} weight="duotone" />
                    <div>
                      <div className="font-bold">Social Security</div>
                      <div className="text-sm opacity-90">Apply for support</div>
                    </div>
                  </Button>

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
                    onClick={() => setActiveTab('user')}
                    className="h-32 text-lg flex-col gap-3 bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                  >
                    <ShieldCheck size={32} weight="duotone" />
                    <div>
                      <div className="font-bold">My Dashboard</div>
                      <div className="text-sm opacity-90">View your assets</div>
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
                <div className="bg-card/80 backdrop-blur rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Create Value</h2>
                  <Tabs defaultValue="mint" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="mint">Mint Tokens</TabsTrigger>
                      <TabsTrigger value="research">Research</TabsTrigger>
                      <TabsTrigger value="quality">Quality Score</TabsTrigger>
                    </TabsList>
                    <TabsContent value="mint">
                      <div className="flex justify-end mb-4">
                        <HelpMeChoose category="tokens" onNavigate={setActiveTab} />
                      </div>
                      <TokenMinter />
                    </TabsContent>
                    <TabsContent value="research">
                      <ResearchTokenMinter />
                    </TabsContent>
                    <TabsContent value="quality">
                      <RepoQualityScorer />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="trade" className="space-y-6">
                <div className="bg-card/80 backdrop-blur rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Trade & Markets</h2>
                  <Tabs defaultValue="marketplace" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                      <TabsTrigger value="auction">Auctions</TabsTrigger>
                      <TabsTrigger value="markets">Markets</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="marketplace">
                      <TokenMarketplace />
                    </TabsContent>
                    <TabsContent value="auction">
                      <LiveAuctionViewer showCreateForm={true} />
                    </TabsContent>
                    <TabsContent value="markets">
                      <MarketOverview onTokenSelect={(symbol) => setActiveTab('trade')} />
                    </TabsContent>
                    <TabsContent value="analytics">
                      <TokenMetricsDashboard showAllTokens={true} />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="build" className="space-y-6">
                <div className="bg-card/80 backdrop-blur rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Build & Deploy</h2>
                  <Tabs defaultValue="repos" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="repos">My Repos</TabsTrigger>
                      <TabsTrigger value="live">Live Sites</TabsTrigger>
                      <TabsTrigger value="deploy">Deploy</TabsTrigger>
                      <TabsTrigger value="repair">AI Repair</TabsTrigger>
                    </TabsList>
                    <TabsContent value="repos">
                      <RepoManagementHub />
                    </TabsContent>
                    <TabsContent value="live">
                      <LiveRepoManager />
                    </TabsContent>
                    <TabsContent value="deploy">
                      <DeploymentHub />
                    </TabsContent>
                    <TabsContent value="repair">
                      <AIPageRepair />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="explore" className="space-y-6">
                <div className="bg-card/80 backdrop-blur rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Explore & Discover</h2>
                  <Tabs defaultValue="chat" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="chat">AI Chat</TabsTrigger>
                      <TabsTrigger value="search">Web Search</TabsTrigger>
                      <TabsTrigger value="modules">Add Abilities</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chat">
                      <div className="h-[600px]">
                        <AIChat />
                      </div>
                    </TabsContent>
                    <TabsContent value="search">
                      {searchResults.length > 0 ? (
                        <SearchResults
                          results={searchResults}
                          query={searchQuery}
                          onVisualize={() => setShowGraph(true)}
                        />
                      ) : (
                        <div className="text-center py-16">
                          <p className="text-muted-foreground">Enter a query above to search</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="modules">
                      <ModuleBrowser />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="play" className="space-y-6">
                <div className="bg-card/80 backdrop-blur rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Play & Earn</h2>
                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <EmojiCatcherGame />
                    <SlotMachine />
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => setActiveTab('mario')}
                      className="w-full h-20 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <GameController size={32} weight="duotone" className="mr-3" />
                      <div>
                        <div className="font-bold">Mario Scene</div>
                        <div className="text-sm opacity-90">Interactive 8-bit world</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="user"><UserDashboard /></TabsContent>
              <TabsContent value="admin"><AdminTools /></TabsContent>
              <TabsContent value="buy-inf"><InfinityTokenSale /></TabsContent>
              <TabsContent value="social-security"><SocialSecurityPlatform /></TabsContent>
              <TabsContent value="charts"><InteractiveTokenChart /></TabsContent>
              <TabsContent value="blockchain"><BlockchainIntegration /></TabsContent>
              <TabsContent value="templates"><AuctionTemplates /></TabsContent>
              <TabsContent value="auction-analytics"><ComprehensiveAuctionAnalytics /></TabsContent>
              <TabsContent value="autopilot"><AutoPilotControl /></TabsContent>
              <TabsContent value="batch-automation"><BatchAutomation /></TabsContent>
              <TabsContent value="scanner"><GitHubInfinityScanner /></TabsContent>
              <TabsContent value="batch-analyzer"><BatchRepoAnalyzer /></TabsContent>
              <TabsContent value="backup"><RepoBackupSystem /></TabsContent>
              <TabsContent value="ss-pay"><SocialSecurityDistributor /></TabsContent>
              <TabsContent value="mario"><MarioScene /></TabsContent>
              <TabsContent value="theme">
                <div className="bg-card/80 backdrop-blur rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Theme Customizer</h2>
                  <ThemeCustomizer />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <IntentBasedHelper onNavigate={setActiveTab} />
          <BackgroundChanger />
          <WelcomeFlow onNavigate={setActiveTab} />
          <SafetyFooter />
          <AuthDebugPanel />
          <AIDebugger />
          <BismuthSignalReader />
        </div>
      </TokenRedistributionServiceProvider>
    </AuthProvider>
  )
}

export default App
