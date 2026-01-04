import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { MagnifyingGlass, Robot, Coin, House, Sparkle, Package, CurrencyDollar, User, Storefront, ChartLine, FileHtml, Rocket, ShareNetwork, Cloud, Hash, Heart, BellRinging, Smiley, GameController, HandCoins, Gavel, ClockClockwise, ChartBar, Eye, Database, UploadSimple, Radio, ShieldCheck, Flask, GitBranch, FolderOpen, Code, ArrowsClockwise, Bell, Lightning, Gauge } from '@phosphor-icons/react'
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
      const prompt = `Generate 5 realistic web search results for the query: "${query}". Return as JSON with a "results" array containing objects with id, title, snippet, url, and source fields.`
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
        <div className="min-h-screen mesh-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
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
            <TabsList className="grid w-full max-w-6xl mx-auto grid-cols-6 md:grid-cols-36 h-auto gap-1 bg-card/80 backdrop-blur p-2">
              <TabsTrigger value="home" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <House size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Home</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Flask size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Research</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Sparkle size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Quality AI</span>
              </TabsTrigger>
              <TabsTrigger value="batch-analyzer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <GitBranch size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Do Many Things</span>
              </TabsTrigger>
              <TabsTrigger value="file-builder" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Code size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Create</span>
              </TabsTrigger>
              <TabsTrigger value="scanner" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <FolderOpen size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Recognize Things</span>
              </TabsTrigger>
              <TabsTrigger value="autopilot" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Gauge size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Auto-Pilot</span>
              </TabsTrigger>
              <TabsTrigger value="auto-auction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Robot size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Auto</span>
              </TabsTrigger>
              <TabsTrigger value="batch-automation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Lightning size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Batch Auto</span>
              </TabsTrigger>
              <TabsTrigger value="activity-monitor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <ArrowsClockwise size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Bell size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <ClockClockwise size={20} weight="duotone" />
                <span className="text-xs md:text-sm">History</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <ChartLine size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Charts</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <UploadSimple size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Media</span>
              </TabsTrigger>
              <TabsTrigger value="spaces" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Radio size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Spaces</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <ChartBar size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <ChartLine size={20} weight="duotone" />
                <span className="text-xs md:text-sm">📊 Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Database size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Backup</span>
              </TabsTrigger>
              <TabsTrigger value="buy-inf" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Coin size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Buy INF</span>
              </TabsTrigger>
              <TabsTrigger value="ss-pay" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <HandCoins size={20} weight="duotone" />
                <span className="text-xs md:text-sm">SS Pay</span>
              </TabsTrigger>
              <TabsTrigger value="mario" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <GameController size={20} weight="duotone" />
                <span className="text-xs md:text-sm">🍄 Mario</span>
              </TabsTrigger>
              <TabsTrigger value="emoji" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Smiley size={20} weight="duotone" />
                <span className="text-xs md:text-sm">🍄👑 Emoji</span>
              </TabsTrigger>
              <TabsTrigger value="user" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <User size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Account</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Package size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Add Abilities</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <CurrencyDollar size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Create Value</span>
              </TabsTrigger>
              <TabsTrigger value="markets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <ChartLine size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Markets</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Storefront size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Trade</span>
              </TabsTrigger>
              <TabsTrigger value="auction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Gavel size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Auction</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <ClockClockwise size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Eye size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Watch</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <MagnifyingGlass size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Search</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Robot size={20} weight="duotone" />
                <span className="text-xs md:text-sm">AI Chat</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <ShareNetwork size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Social</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Hash size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <FileHtml size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Take With Me</span>
              </TabsTrigger>
              <TabsTrigger value="deploy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Rocket size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Publish</span>
              </TabsTrigger>
              <TabsTrigger value="azure" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Cloud size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Azure</span>
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Heart size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Sentiment</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <BellRinging size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <ShieldCheck size={20} weight="duotone" />
                <span className="text-xs md:text-sm">My Controls</span>
              </TabsTrigger>
              <TabsTrigger value="auction-analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <ChartBar size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Auction Data</span>
              </TabsTrigger>
              <TabsTrigger value="auto-pricing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Robot size={20} weight="duotone" />
                <span className="text-xs md:text-sm">AutoPrice</span>
              </TabsTrigger>
              <TabsTrigger value="create-auto-auction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Lightning size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Auto Auction</span>
              </TabsTrigger>
              <TabsTrigger value="page-health" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <Eye size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Page Health</span>
              </TabsTrigger>
              <TabsTrigger value="repos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <GitBranch size={20} weight="duotone" />
                <span className="text-xs md:text-sm">My Repos</span>
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white flex flex-col md:flex-row items-center gap-1 py-2">
                <CurrencyDollar size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Live Blockchain</span>
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