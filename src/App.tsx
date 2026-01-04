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
import { HelpLegend } from '@/components/HelpLegend'
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
import { MetricsExplainer } from '@/components/MetricsExplainer'
import { AuctionTemplates } from '@/components/AuctionTemplates'
import { AuctionAnalytics } from '@/components/AuctionAnalytics'
import { AuctionWatchList } from '@/components/AuctionWatchList'
import { UserDashboard } from '@/components/UserDashboard'
import { MarketOverview } from '@/components/MarketOverview'
import { PageExporter } from '@/components/PageExporter'
import { DeploymentHub } from '@/components/DeploymentHub'
import { SocialPoster } from '@/components/SocialPoster'
import { AzureGitHubDeployer } from '@/components/AzureGitHubDeployer'
import { HashtagTrendAnalyzer } from '@/components/HashtagTrendAnalyzer'
import { SentimentHeatmap } from '@/components/SentimentHeatmap'
import { SentimentForecaster } from '@/components/SentimentForecaster'
import { SentimentAlertSystem } from '@/components/SentimentAlertSystem'
import { BackgroundChanger } from '@/components/BackgroundChanger'
import { EmojiFeatureHub } from '@/components/EmojiFeatureHub'
import { MarioScene } from '@/components/MarioScene'
import { SpriteBuilder } from '@/components/SpriteBuilder'
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
import { MagnifyingGlass, Robot, Coin, House, Sparkle, Package, CurrencyDollar, User, Storefront, ChartLine, FileHtml, Rocket, ShareNetwork, Cloud, Hash, Heart, BellRinging, Smiley, GameController, HandCoins, Gavel, ClockClockwise, ChartBar, Eye, Database, UploadSimple, Radio, ShieldCheck, Flask, GitBranch, FolderOpen, Code, ArrowsClockwise, Bell, Lightning, Gauge, List } from '@phosphor-icons/react'
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
      const prompt = window.spark.llmPrompt`Generate 5 realistic web search results for the query: "${query}". Return as JSON with a "results" array containing objects with id, title, snippet, url, and source fields.`
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results)
        setActiveTab('search')
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
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 relative">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur hover:bg-accent/20 border-2"
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
                  <div className="mt-6 space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('admin')}
                    >
                      <ShieldCheck size={20} weight="duotone" />
                      My Controls
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('autopilot')}
                    >
                      <Gauge size={20} weight="duotone" />
                      Auto-Pilot Rules
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('batch-automation')}
                    >
                      <Lightning size={20} weight="duotone" />
                      Batch Automation
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('notifications')}
                    >
                      <Bell size={20} weight="duotone" />
                      Alerts & History
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('history')}
                    >
                      <ClockClockwise size={20} weight="duotone" />
                      Redistribution History
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('user')}
                    >
                      <User size={20} weight="duotone" />
                      Account & Identity
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('buy-inf')}
                    >
                      <Coin size={20} weight="duotone" />
                      Payments & Tokens
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('page-health')}
                    >
                      <Eye size={20} weight="duotone" />
                      System Health
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('backup')}
                    >
                      <Database size={20} weight="duotone" />
                      Backup & Restore
                    </Button>
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
                      <Rocket size={20} weight="duotone" />
                      Deploy Sites
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('activity-monitor')}
                    >
                      <ArrowsClockwise size={20} weight="duotone" />
                      Activity Monitor
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('auto-pricing')}
                    >
                      <Robot size={20} weight="duotone" />
                      Auto-Pricing
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('templates')}
                    >
                      <ClockClockwise size={20} weight="duotone" />
                      Auction Templates
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('watchlist')}
                    >
                      <Eye size={20} weight="duotone" />
                      Watch List
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('batch-analyzer')}
                    >
                      <GitBranch size={20} weight="duotone" />
                      Batch Repo Analyzer
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('file-builder')}
                    >
                      <Code size={20} weight="duotone" />
                      File Builder
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('scanner')}
                    >
                      <FolderOpen size={20} weight="duotone" />
                      GitHub Scanner
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('auto-auction')}
                    >
                      <Robot size={20} weight="duotone" />
                      Auto Auction
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('charts')}
                    >
                      <ChartLine size={20} weight="duotone" />
                      Token Charts
                    </Button>
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
                      onClick={() => setActiveTab('analytics')}
                    >
                      <ChartBar size={20} weight="duotone" />
                      Engagement Analytics
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('metrics')}
                    >
                      <ChartLine size={20} weight="duotone" />
                      Token Metrics
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('ss-pay')}
                    >
                      <HandCoins size={20} weight="duotone" />
                      Social Security Pay
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('emoji')}
                    >
                      <Smiley size={20} weight="duotone" />
                      Emoji Features
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('trends')}
                    >
                      <Hash size={20} weight="duotone" />
                      Hashtag Trends
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('azure')}
                    >
                      <Cloud size={20} weight="duotone" />
                      Azure Deploy
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('sentiment')}
                    >
                      <Heart size={20} weight="duotone" />
                      Sentiment Analysis
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('alerts')}
                    >
                      <BellRinging size={20} weight="duotone" />
                      Sentiment Alerts
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('auction-analytics')}
                    >
                      <ChartBar size={20} weight="duotone" />
                      Auction Analytics
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveTab('create-auto-auction')}
                    >
                      <Lightning size={20} weight="duotone" />
                      Create Auto-Auction
                    </Button>
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
                <h2 className="text-lg font-semibold text-accent mb-2">🤖 Infinity Brain Promise</h2>
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
            <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-3 md:grid-cols-5 lg:grid-cols-8 h-auto gap-2 bg-card/80 backdrop-blur p-3">
              <TabsTrigger value="home" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                <House size={24} weight="duotone" />
                <span className="text-sm font-medium">Home</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                <Flask size={24} weight="duotone" />
                <span className="text-sm font-medium">Research</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                <Sparkle size={24} weight="duotone" />
                <span className="text-sm font-medium">Quality AI</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                <CurrencyDollar size={24} weight="duotone" />
                <span className="text-sm font-medium">Create Value</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                <Storefront size={24} weight="duotone" />
                <span className="text-sm font-medium">Trade</span>
              </TabsTrigger>
              <TabsTrigger value="auction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                <Gavel size={24} weight="duotone" />
                <span className="text-sm font-medium">Auction</span>
              </TabsTrigger>
              <TabsTrigger value="markets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                <ChartLine size={24} weight="duotone" />
                <span className="text-sm font-medium">Markets</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                <Robot size={24} weight="duotone" />
                <span className="text-sm font-medium">AI Chat</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                <ShareNetwork size={24} weight="duotone" />
                <span className="text-sm font-medium">Social</span>
              </TabsTrigger>
              <TabsTrigger value="repos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                <GitBranch size={24} weight="duotone" />
                <span className="text-sm font-medium">My Repos</span>
              </TabsTrigger>
              <TabsTrigger value="live-repos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                <GitBranch size={24} weight="duotone" />
                <span className="text-sm font-medium">Live Sites</span>
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                <CurrencyDollar size={24} weight="duotone" />
                <span className="text-sm font-medium">Blockchain</span>
              </TabsTrigger>
              <TabsTrigger value="ai-repair" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white flex flex-col items-center gap-1 py-3">
                <Sparkle size={24} weight="duotone" />
                <span className="text-sm font-medium">AI Repair</span>
              </TabsTrigger>
              <TabsTrigger value="mario" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-3">
                <GameController size={24} weight="duotone" />
                <span className="text-sm font-medium">🍄 Games</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                <Package size={24} weight="duotone" />
                <span className="text-sm font-medium">Add Abilities</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-3">
                <MagnifyingGlass size={24} weight="duotone" />
                <span className="text-sm font-medium">Search</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-8">
              <ResearchAuctionQuickLinks onNavigate={setActiveTab} />
              
              <MetricsExplainer />
              
              <PageHub />
              
              <div className="grid lg:grid-cols-2 gap-6">
                <EmojiCatcherGame />
                <SlotMachine />
              </div>
              
              <div className="h-[500px]">
                <AIChat />
              </div>
            </TabsContent>

            <TabsContent value="research">
              <RepoQualityScorer />
            </TabsContent>

            <TabsContent value="quality">
              <ResearchTokenMinter />
            </TabsContent>

            <TabsContent value="batch-analyzer">
              <BatchRepoAnalyzer />
            </TabsContent>

            <TabsContent value="file-builder">
              <RepoFileBuilder />
            </TabsContent>

            <TabsContent value="scanner">
              <GitHubInfinityScanner />
            </TabsContent>

            <TabsContent value="autopilot">
              <AutoPilotControl />
            </TabsContent>

            <TabsContent value="auto-auction">
              <AutoAuctionSystem />
            </TabsContent>

            <TabsContent value="batch-automation">
              <BatchAutomation />
            </TabsContent>

            <TabsContent value="activity-monitor">
              <TokenActivityMonitor />
            </TabsContent>

            <TabsContent value="notifications">
              <TokenRedistributionNotifier />
            </TabsContent>

            <TabsContent value="history">
              <RedistributionHistory />
            </TabsContent>

            <TabsContent value="charts">
              <InteractiveTokenChart />
            </TabsContent>

            <TabsContent value="media">
              <MediaUploadWithAI 
                maxFiles={10}
                onMediaApproved={(files) => {
                  toast.success(`${files.length} files approved and ready! ✅`)
                }}
              />
            </TabsContent>

            <TabsContent value="spaces">
              <TwitterSpacesRadio />
            </TabsContent>

            <TabsContent value="analytics">
              <EngagementAnalytics />
            </TabsContent>

            <TabsContent value="metrics">
              <TokenMetricsDashboard showAllTokens={true} />
            </TabsContent>

            <TabsContent value="backup">
              <RepoBackupSystem />
            </TabsContent>

            <TabsContent value="buy-inf">
              <div className="max-w-7xl mx-auto">
                <InfinityTokenSale />
              </div>
            </TabsContent>

            <TabsContent value="ss-pay">
              <div className="max-w-7xl mx-auto">
                <SocialSecurityDistributor />
              </div>
            </TabsContent>

            <TabsContent value="mario">
              <div className="max-w-6xl mx-auto space-y-6">
                <MarioScene />
                <SpriteBuilder />
              </div>
            </TabsContent>

            <TabsContent value="emoji">
              <EmojiFeatureHub />
            </TabsContent>

            <TabsContent value="user">
              <UserDashboard />
            </TabsContent>

            <TabsContent value="modules">
              <ModuleBrowser />
            </TabsContent>

            <TabsContent value="tokens">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <HelpMeChoose category="tokens" onNavigate={setActiveTab} />
                </div>
                <TokenMinter />
              </div>
            </TabsContent>

            <TabsContent value="markets">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <HelpMeChoose category="marketplace" onNavigate={setActiveTab} />
                </div>
                <MarketOverview onTokenSelect={(symbol) => {
                  setActiveTab('marketplace')
                }} />
              </div>
            </TabsContent>

            <TabsContent value="marketplace">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <HelpMeChoose category="marketplace" onNavigate={setActiveTab} />
                </div>
                <TokenMarketplace />
              </div>
            </TabsContent>

            <TabsContent value="auction">
              <div className="space-y-6">
                <div className="flex justify-end">
                  <HelpMeChoose category="auction" onNavigate={setActiveTab} />
                </div>
                <LiveAuctionViewer showCreateForm={true} />
                <TokenAuction />
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <AuctionTemplates />
            </TabsContent>

            <TabsContent value="watchlist">
              <div className="max-w-7xl mx-auto">
                <AuctionWatchList />
              </div>
            </TabsContent>

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
              <div className="max-w-4xl mx-auto h-[600px]">
                <AIChat />
              </div>
            </TabsContent>

            <TabsContent value="social">
              <div className="max-w-5xl mx-auto">
                <SocialPoster />
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <div className="max-w-6xl mx-auto">
                <HashtagTrendAnalyzer />
              </div>
            </TabsContent>

            <TabsContent value="export">
              <div className="max-w-4xl mx-auto">
                <PageExporter />
              </div>
            </TabsContent>

            <TabsContent value="deploy">
              <div className="max-w-6xl mx-auto">
                <DeploymentHub />
              </div>
            </TabsContent>

            <TabsContent value="azure">
              <div className="max-w-5xl mx-auto">
                <AzureGitHubDeployer />
              </div>
            </TabsContent>

            <TabsContent value="sentiment">
              <div className="max-w-6xl mx-auto space-y-6">
                <SentimentHeatmap />
                <SentimentForecaster />
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <div className="max-w-6xl mx-auto">
                <SentimentAlertSystem />
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="max-w-6xl mx-auto">
                <AdminTools />
              </div>
            </TabsContent>

            <TabsContent value="auto-pricing">
              <div className="max-w-7xl mx-auto">
                <AutoPricingAlgorithm />
              </div>
            </TabsContent>

            <TabsContent value="create-auto-auction">
              <div className="max-w-7xl mx-auto">
                <AutoPricedAuctionCreator />
              </div>
            </TabsContent>

            <TabsContent value="auction-analytics">
              <div className="max-w-7xl mx-auto">
                <ComprehensiveAuctionAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="page-health">
              <div className="max-w-7xl mx-auto">
                <PageHealthMonitor />
              </div>
            </TabsContent>

            <TabsContent value="repos">
              <div className="max-w-7xl mx-auto">
                <RepoManagementHub />
              </div>
            </TabsContent>

            <TabsContent value="blockchain">
              <div className="max-w-7xl mx-auto">
                <BlockchainIntegration />
              </div>
            </TabsContent>

            <TabsContent value="live-repos">
              <div className="max-w-7xl mx-auto">
                <LiveRepoManager />
              </div>
            </TabsContent>

            <TabsContent value="ai-repair">
              <div className="max-w-7xl mx-auto">
                <AIPageRepair />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <IntentBasedHelper onNavigate={setActiveTab} />
        <AIGuardian />
        <HelpLegend />
        <BackgroundChanger />
        <ThemeCustomizer />
        <WelcomeFlow onNavigate={setActiveTab} />
        <ActionWheel
          onImport={() => {
            toast.info('Import feature - coming soon', {
              description: 'Import data from external sources'
            })
          }}
          onExport={() => {
            setActiveTab('export')
          }}
          onEngineering={() => {
            setActiveTab('modules')
          }}
          onPullMemory={() => {
            setActiveTab('chat')
            toast.info('Memory pulled to conversation', {
              description: 'Local context loaded for AI chat'
            })
          }}
        />
        <SafetyFooter />
      </div>
      </TokenRedistributionServiceProvider>
    </AuthProvider>
  )
}

export default App
