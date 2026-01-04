import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
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
import { InfinityTokenSale } from '@/components/InfinityTokenSale'
import { EmojiCatcherGame } from '@/components/EmojiCatcherGame'
import { RepoBackupSystem } from '@/components/RepoBackupSystem'
import { ThemeCustomizer } from '@/components/ThemeCustomizer'
import { InteractiveTokenChart } from '@/components/InteractiveTokenChart'
import { MediaUploadWithAI } from '@/components/MediaUploadWithAI'
import { EngagementAnalytics } from '@/components/EngagementAnalytics'
import { TwitterSpacesRadio } from '@/components/TwitterSpacesRadio'
import { AdminTools } from '@/components/AdminTools'
import { ActionWheel } from '@/components/ActionWheel'
import { ResearchTokenMinter } from '@/components/ResearchTokenMinter'
import { ResearchAuctionQuickLinks } from '@/components/ResearchAuctionQuickLinks'
import { RepoQualityScorer } from '@/components/RepoQualityScorer'
import { MagnifyingGlass, Robot, Coin, House, Sparkle, CurrencyDollar, Storefront, ChartLine, GitBranch, ShareNetwork, GameController, List, ShieldCheck, User, Gauge, Lightning, Eye, Bell, ClockClockwise, FolderOpen, Code, Database, FileHtml, Cloud, UploadSimple, Radio, Smiley, HandCoins } from '@phosphor-icons/react'
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

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showGraph, setShowGraph] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await restoreAdminAuctions()
        await protectAdminAuctions()
      } catch (error) {
        console.error('Failed to restore auctions:', error)
      }
    }
    
    initializeApp()
    
    const protectionInterval = setInterval(async () => {
      try {
        await protectAdminAuctions()
      } catch (error) {
        console.error('Failed to protect auctions:', error)
      }
    }, 60000)
    
    return () => clearInterval(protectionInterval)
  }, [])

  const handleSearch = async (query: string, mode: 'web' | 'ai') => {
    setSearchQuery(query)
    setIsSearching(true)
    setShowGraph(false)

    if (mode === 'ai') {
      setActiveTab('chat')
      setIsSearching(false)
      return
    }

    try {
      const prompt = (window as any).spark.llmPrompt`Generate 5 realistic web search results for the query: "${query}". Return as JSON with a "results" array containing objects with id, title, snippet, url, and source fields.`
      const response = await (window as any).spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results)
        setActiveTab('explore')
        toast.success(`Found ${data.results.length} results for "${query}"`)
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
        <ContinuousPageMonitor />
        <div className="min-h-screen mesh-background">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <header className="mb-8 text-center space-y-6">
              <div className="flex items-center justify-center gap-3 relative">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur hover:bg-accent/20 border-2 shadow-lg"
                    >
                      <List size={24} weight="bold" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Sparkle size={24} weight="duotone" className="text-accent" />
                        Advanced Controls
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">👤 Account & Identity</h3>
                        <div className="space-y-1">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('user')}
                          >
                            <User size={20} weight="duotone" />
                            My Dashboard
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('admin')}
                          >
                            <ShieldCheck size={20} weight="duotone" />
                            Admin Controls
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('buy-inf')}
                          >
                            <Coin size={20} weight="duotone" />
                            Buy INF Tokens
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">💰 Token Economy</h3>
                        <div className="space-y-1">
                          <div className="pl-2 mb-1">
                            <p className="text-xs text-muted-foreground/70">Trading</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('charts')}
                          >
                            <ChartLine size={18} weight="duotone" />
                            Token Charts
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('blockchain')}
                          >
                            <CurrencyDollar size={18} weight="duotone" />
                            Live Blockchain
                          </Button>
                          
                          <div className="pl-2 mb-1 mt-3">
                            <p className="text-xs text-muted-foreground/70">Auctions</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('templates')}
                          >
                            <ClockClockwise size={18} weight="duotone" />
                            Auction Templates
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('watchlist')}
                          >
                            <Eye size={18} weight="duotone" />
                            Watch List
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('auction-analytics')}
                          >
                            <ChartLine size={18} weight="duotone" />
                            Auction Analytics
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">🤖 Automation & AI</h3>
                        <div className="space-y-1">
                          <div className="pl-2 mb-1">
                            <p className="text-xs text-muted-foreground/70">Control Systems</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('autopilot')}
                          >
                            <Gauge size={18} weight="duotone" />
                            Auto-Pilot Dashboard
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('batch-automation')}
                          >
                            <Lightning size={18} weight="duotone" />
                            Batch Automation
                          </Button>
                          
                          <div className="pl-2 mb-1 mt-3">
                            <p className="text-xs text-muted-foreground/70">Token Automation</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('auto-auction')}
                          >
                            <Robot size={18} weight="duotone" />
                            Auto Auction System
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('auto-pricing')}
                          >
                            <Robot size={18} weight="duotone" />
                            Auto-Pricing Engine
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('create-auto-auction')}
                          >
                            <Lightning size={18} weight="duotone" />
                            Create Auto-Auction
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">📊 Analytics & Monitoring</h3>
                        <div className="space-y-1">
                          <div className="pl-2 mb-1">
                            <p className="text-xs text-muted-foreground/70">Real-Time Monitoring</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('activity-monitor')}
                          >
                            <Eye size={18} weight="duotone" />
                            Activity Monitor
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('page-health')}
                          >
                            <ShieldCheck size={18} weight="duotone" />
                            System Health
                          </Button>
                          
                          <div className="pl-2 mb-1 mt-3">
                            <p className="text-xs text-muted-foreground/70">Alerts & History</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('notifications')}
                          >
                            <Bell size={18} weight="duotone" />
                            Alert Center
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('history')}
                          >
                            <ClockClockwise size={18} weight="duotone" />
                            Token History
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">💻 Development Tools</h3>
                        <div className="space-y-1">
                          <div className="pl-2 mb-1">
                            <p className="text-xs text-muted-foreground/70">Repository Management</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('scanner')}
                          >
                            <FolderOpen size={18} weight="duotone" />
                            GitHub Scanner
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('batch-analyzer')}
                          >
                            <GitBranch size={18} weight="duotone" />
                            Batch Analyzer
                          </Button>
                          
                          <div className="pl-2 mb-1 mt-3">
                            <p className="text-xs text-muted-foreground/70">Code & Files</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('file-builder')}
                          >
                            <Code size={18} weight="duotone" />
                            File Builder
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2 pl-6"
                            onClick={() => setActiveTab('backup')}
                          >
                            <Database size={18} weight="duotone" />
                            Backup System
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">🚀 Publishing & Deploy</h3>
                        <div className="space-y-1">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('export')}
                          >
                            <FileHtml size={20} weight="duotone" />
                            Export Pages
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('deploy')}
                          >
                            <Cloud size={20} weight="duotone" />
                            Deploy Hub
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">📱 Social & Content</h3>
                        <div className="space-y-1">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('media')}
                          >
                            <UploadSimple size={20} weight="duotone" />
                            Media Upload
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('spaces')}
                          >
                            <Radio size={20} weight="duotone" />
                            Twitter Spaces
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('emoji')}
                          >
                            <Smiley size={20} weight="duotone" />
                            Emoji Hub
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">⚡ Special Systems</h3>
                        <div className="space-y-1">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start gap-2"
                            onClick={() => setActiveTab('ss-pay')}
                          >
                            <HandCoins size={20} weight="duotone" />
                            Social Security Pay
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Sparkle size={48} weight="duotone" className="text-accent animate-pulse" />
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Infinity Brain
                </h1>
              </div>
              
              <div className="max-w-3xl mx-auto space-y-3">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-4 shadow-lg">
                  <h2 className="text-lg font-semibold text-accent mb-2 flex items-center justify-center gap-2">
                    <ShieldCheck size={24} weight="duotone" />
                    Infinity Brain Promise
                  </h2>
                  <p className="text-sm text-foreground/90">
                    You will never be asked for secret keys, terminal commands, or code.
                    If something can be done safely for you, it will be.
                  </p>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Robot size={20} weight="duotone" className="text-primary" />
                    <span><strong>Infinity AI is watching for mistakes.</strong> If something looks unsafe or confusing, I'll stop and explain first.</span>
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tokenized business infrastructure ecosystem. Buy INF with USD or earn through contributions!
              </p>
              
              <SafetyPromise />
              
              <div className="max-w-md mx-auto">
                <SafeModeToggle />
              </div>
            </header>

            <div className="mb-8">
              <SearchBar onSearch={handleSearch} isLoading={isSearching} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto gap-2 bg-card/80 backdrop-blur p-3">
                <TabsTrigger value="home" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                  <House size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Home</span>
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                  <CurrencyDollar size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Create</span>
                </TabsTrigger>
                <TabsTrigger value="trade" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                  <Storefront size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Trade</span>
                </TabsTrigger>
                <TabsTrigger value="build" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                  <GitBranch size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Build</span>
                </TabsTrigger>
                <TabsTrigger value="connect" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                  <ShareNetwork size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Connect</span>
                </TabsTrigger>
                <TabsTrigger value="explore" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                  <MagnifyingGlass size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Explore</span>
                </TabsTrigger>
                <TabsTrigger value="play" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                  <GameController size={24} weight="duotone" />
                  <span className="text-xs font-semibold">Play</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="space-y-8">
                <ResearchAuctionQuickLinks onNavigate={setActiveTab} />
                
                <PageHub />
                
                <div className="grid lg:grid-cols-2 gap-6">
                  <EmojiCatcherGame />
                  <SlotMachine />
                </div>
                
                <div className="h-[500px]">
                  <AIChat />
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-8">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <CurrencyDollar size={32} weight="duotone" className="text-accent" />
                    Create Value
                  </h2>
                  <p className="text-muted-foreground mb-6">Mint tokens, create auctions, and generate research-backed value.</p>
                  
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

              <TabsContent value="trade" className="space-y-8">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Storefront size={32} weight="duotone" className="text-accent" />
                    Trade & Markets
                  </h2>
                  <p className="text-muted-foreground mb-6">Buy, sell, auction, and track token markets.</p>
                  
                  <Tabs defaultValue="marketplace" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                      <TabsTrigger value="auction">Auctions</TabsTrigger>
                      <TabsTrigger value="markets">Markets</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="marketplace">
                      <div className="flex justify-end mb-4">
                        <HelpMeChoose category="marketplace" onNavigate={setActiveTab} />
                      </div>
                      <TokenMarketplace />
                    </TabsContent>
                    
                    <TabsContent value="auction">
                      <div className="flex justify-end mb-4">
                        <HelpMeChoose category="auction" onNavigate={setActiveTab} />
                      </div>
                      <LiveAuctionViewer showCreateForm={true} />
                      <div className="mt-6">
                        <TokenAuction />
                      </div>
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

              <TabsContent value="build" className="space-y-8">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <GitBranch size={32} weight="duotone" className="text-accent" />
                    Build & Deploy
                  </h2>
                  <p className="text-muted-foreground mb-6">Manage repositories, build sites, and deploy to live platforms.</p>
                  
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

              <TabsContent value="connect" className="space-y-8">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <ShareNetwork size={32} weight="duotone" className="text-accent" />
                    Connect & Share
                  </h2>
                  <p className="text-muted-foreground mb-6">Post to social platforms, track sentiment, and analyze engagement.</p>
                  
                  <Tabs defaultValue="social" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="social">Social Poster</TabsTrigger>
                      <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                      <TabsTrigger value="trends">Trends</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="social">
                      <SocialPoster />
                    </TabsContent>
                    
                    <TabsContent value="sentiment">
                      <div className="space-y-6">
                        <SentimentHeatmap />
                        <SentimentForecaster />
                        <SentimentAlertSystem />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="trends">
                      <HashtagTrendAnalyzer />
                    </TabsContent>
                    
                    <TabsContent value="analytics">
                      <EngagementAnalytics />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="explore" className="space-y-8">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MagnifyingGlass size={32} weight="duotone" className="text-accent" />
                    Explore & Discover
                  </h2>
                  <p className="text-muted-foreground mb-6">Search the web, chat with AI, and discover new possibilities.</p>
                  
                  <Tabs defaultValue="search" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="search">Web Search</TabsTrigger>
                      <TabsTrigger value="chat">AI Chat</TabsTrigger>
                      <TabsTrigger value="modules">Add Abilities</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="search">
                      {searchResults.length > 0 ? (
                        <div className="space-y-6">
                          {showGraph ? (
                            <SearchGraph
                              results={searchResults}
                              query={searchQuery}
                              onClose={() => setShowGraph(false)}
                            />
                          ) : (
                            <SearchResults
                              results={searchResults}
                              query={searchQuery}
                              onVisualize={() => setShowGraph(true)}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <MagnifyingGlass size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-2xl font-semibold mb-2">Start Searching</h3>
                          <p className="text-muted-foreground">
                            Enter a query above to begin exploring the web
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="chat">
                      <div className="h-[600px]">
                        <AIChat />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="modules">
                      <ModuleBrowser />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="play" className="space-y-8">
                <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <GameController size={32} weight="duotone" className="text-accent" />
                    Play & Earn
                  </h2>
                  <p className="text-muted-foreground mb-6">Play games and earn bonus tokens.</p>
                  
                  <div className="grid lg:grid-cols-2 gap-6">
                    <EmojiCatcherGame />
                    <SlotMachine />
                  </div>
                </div>
              </TabsContent>

              {/* Hidden/Advanced Tabs */}
              <TabsContent value="batch-analyzer"><BatchRepoAnalyzer /></TabsContent>
              <TabsContent value="file-builder"><RepoFileBuilder /></TabsContent>
              <TabsContent value="scanner"><GitHubInfinityScanner /></TabsContent>
              <TabsContent value="autopilot"><AutoPilotControl /></TabsContent>
              <TabsContent value="auto-auction"><AutoAuctionSystem /></TabsContent>
              <TabsContent value="batch-automation"><BatchAutomation /></TabsContent>
              <TabsContent value="activity-monitor"><TokenActivityMonitor /></TabsContent>
              <TabsContent value="notifications"><TokenRedistributionNotifier /></TabsContent>
              <TabsContent value="history"><RedistributionHistory /></TabsContent>
              <TabsContent value="charts"><InteractiveTokenChart /></TabsContent>
              <TabsContent value="media"><MediaUploadWithAI maxFiles={10} onMediaApproved={(files) => toast.success(`${files.length} files approved! ✅`)} /></TabsContent>
              <TabsContent value="spaces"><TwitterSpacesRadio /></TabsContent>
              <TabsContent value="backup"><RepoBackupSystem /></TabsContent>
              <TabsContent value="buy-inf"><div className="max-w-7xl mx-auto"><InfinityTokenSale /></div></TabsContent>
              <TabsContent value="ss-pay"><div className="max-w-7xl mx-auto"><SocialSecurityDistributor /></div></TabsContent>
              <TabsContent value="emoji"><EmojiFeatureHub /></TabsContent>
              <TabsContent value="user"><UserDashboard /></TabsContent>
              <TabsContent value="templates"><AuctionTemplates /></TabsContent>
              <TabsContent value="watchlist"><div className="max-w-7xl mx-auto"><AuctionWatchList /></div></TabsContent>
              <TabsContent value="admin"><div className="max-w-6xl mx-auto"><AdminTools /></div></TabsContent>
              <TabsContent value="auto-pricing"><div className="max-w-7xl mx-auto"><AutoPricingAlgorithm /></div></TabsContent>
              <TabsContent value="create-auto-auction"><div className="max-w-7xl mx-auto"><AutoPricedAuctionCreator /></div></TabsContent>
              <TabsContent value="page-health"><div className="max-w-7xl mx-auto"><PageHealthMonitor /></div></TabsContent>
              <TabsContent value="auction-analytics"><div className="max-w-7xl mx-auto"><ComprehensiveAuctionAnalytics /></div></TabsContent>
              <TabsContent value="blockchain"><div className="max-w-7xl mx-auto"><BlockchainIntegration /></div></TabsContent>
              <TabsContent value="export"><div className="max-w-4xl mx-auto"><PageExporter /></div></TabsContent>
              <TabsContent value="deploy"><div className="max-w-5xl mx-auto"><DeploymentHub /></div></TabsContent>
            </Tabs>
          </div>

          <IntentBasedHelper onNavigate={setActiveTab} />
          <AIGuardian />
          <BackgroundChanger />
          <ThemeCustomizer />
          <WelcomeFlow onNavigate={setActiveTab} />
          <ActionWheel
            onImport={() => toast.info('Import feature - coming soon')}
            onExport={() => setActiveTab('export')}
            onEngineering={() => setActiveTab('explore')}
            onPullMemory={() => {
              setActiveTab('explore')
              toast.info('Memory pulled to conversation')
            }}
          />
          <SafetyFooter />
        </div>
      </TokenRedistributionServiceProvider>
    </AuthProvider>
  )
}

export default App
