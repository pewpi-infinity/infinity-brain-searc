import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchBar } from '@/components/SearchBar'
import { AIChat } from '@/components/AIChat'
import { SlotMachine } from '@/components/SlotMachine'
import { SearchResults, SearchResult } from '@/components/SearchResults'
import { SearchGraph } from '@/components/SearchGraph'
import { PageHub } from '@/components/PageHub'
import { HelpLegend } from '@/components/HelpLegend'
import { ModuleBrowser } from '@/components/ModuleBrowser'
import { TokenMinter } from '@/components/TokenMinter'
import { TokenMarketplace } from '@/components/TokenMarketplace'
import { UserDashboard } from '@/components/UserDashboard'
import { MagnifyingGlass, Robot, Coin, House, Sparkle, Package, CurrencyDollar, User, Storefront } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { AuthProvider } from '@/lib/auth'

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showGraph, setShowGraph] = useState(false)

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
      <div className="min-h-screen mesh-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkle size={48} weight="duotone" className="text-accent animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Infinity Brain
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive ecosystem registry powering tokenized business infrastructure
            </p>
          </header>

          <div className="mb-8">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 md:grid-cols-7 h-auto gap-1 bg-card/80 backdrop-blur p-2">
              <TabsTrigger value="home" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <House size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Home</span>
              </TabsTrigger>
              <TabsTrigger value="user" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <User size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Account</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Package size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Modules</span>
              </TabsTrigger>
              <TabsTrigger value="tokens" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <CurrencyDollar size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Mint</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Storefront size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Market</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <MagnifyingGlass size={20} weight="duotone" />
                <span className="text-xs md:text-sm">Search</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-1 py-2">
                <Robot size={20} weight="duotone" />
                <span className="text-xs md:text-sm">AI Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-8">
              <PageHub />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[500px]">
                  <AIChat />
                </div>
                <SlotMachine />
              </div>
            </TabsContent>

            <TabsContent value="user">
              <UserDashboard />
            </TabsContent>

            <TabsContent value="modules">
              <ModuleBrowser />
            </TabsContent>

            <TabsContent value="tokens">
              <TokenMinter />
            </TabsContent>

            <TabsContent value="marketplace">
              <TokenMarketplace />
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
          </Tabs>
        </div>

        <HelpLegend />
      </div>
    </AuthProvider>
  )
}

export default App