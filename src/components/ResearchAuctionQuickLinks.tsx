import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Flask, Gavel, Sparkle, TrendUp, Fire, Eye, ShareNetwork, CurrencyDollar, Lightning } from '@phosphor-icons/react'
import { useLocalStorage, localStorageUtils } from '@/hooks/useLocalStorage'
import { toast } from 'sonner'
import { useState } from 'react'

interface ResearchToken {
  id: string
  title: string
  abstract: string
  content: string
  hash: string
  verificationHash: string
  author: string
  authorGitHub: string
  timestamp: number
  links: string[]
  citations: string[]
  category: string
  value: number
  verified: boolean
  repository?: string
}

interface Auction {
  id: string
  tokenSymbol: string
  tokenName: string
  seller: string
  startPrice: number
  currentBid: number
  highestBidder: string | null
  startTime: number
  endTime: number
  status: 'active' | 'ended' | 'cancelled'
  bids: Array<{
    bidder: string
    amount: number
    timestamp: number
  }>
  tokenType?: string
  researchTokenId?: string
}

interface ResearchAuctionQuickLinksProps {
  onNavigate?: (tab: string) => void
}

export function ResearchAuctionQuickLinks({ onNavigate }: ResearchAuctionQuickLinksProps) {
  const [researchTokens] = useLocalStorage<ResearchToken[]>('research-tokens', [])
  const [auctions] = useLocalStorage<Auction[]>('token-auctions', [])
  const [isSuggesting, setIsSuggesting] = useState(false)

  const researchAuctions = (auctions || []).filter(a => 
    a.status === 'active' && 
    a.tokenType === 'research' &&
    (researchTokens || []).some(t => t.id === a.researchTokenId)
  )

  const topResearchTokens = (researchTokens || [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  const handleSuggestToSocial = async () => {
    if (researchAuctions.length === 0 && (!researchTokens || researchTokens.length === 0)) {
      toast.error('No research tokens or auctions to suggest')
      return
    }

    setIsSuggesting(true)
    try {
      const suggestions: Array<{
        type: string
        title: string
        description: string
        url: string
        hashtags: string[]
      }> = []
      
      if (researchAuctions.length > 0) {
        for (const auction of researchAuctions.slice(0, 2)) {
          const token = (researchTokens || []).find(t => t.id === auction.researchTokenId)
          if (token) {
            suggestions.push({
              type: 'auction',
              title: `🤑 Research Auction: ${token.title}`,
              description: `Current bid: ${auction.currentBid.toLocaleString()} INF | ${token.category}`,
              url: `#auction-${auction.id}`,
              hashtags: ['ResearchToken', 'InfinityBrain', 'Auction', token.category]
            })
          }
        }
      }

      if (topResearchTokens.length > 0) {
        for (const token of topResearchTokens.slice(0, 2)) {
          suggestions.push({
            type: 'research',
            title: `🤑 New Research Token: ${token.title}`,
            description: `Verified research by @${token.author} | Value: ${token.value.toLocaleString()} INF`,
            url: `#research-${token.id}`,
            hashtags: ['ResearchToken', 'InfinityBrain', 'Research', token.category]
          })
        }
      }

      localStorageUtils.set('social-suggestions', suggestions)
      
      toast.success('🤑 Suggestions ready for social posting!', {
        description: `${suggestions.length} research items suggested for maximum views`
      })

      if (onNavigate) {
        setTimeout(() => onNavigate('social'), 500)
      }
    } catch (error) {
      console.error('Failed to suggest:', error)
      toast.error('Failed to create social suggestions')
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleCreateAuction = () => {
    if (!researchTokens || researchTokens.length === 0) {
      toast.error('Create research tokens first before auctioning')
      if (onNavigate) onNavigate('research')
      return
    }
    if (onNavigate) onNavigate('auction')
  }

  return (
    <Card className="gradient-border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Flask size={24} weight="duotone" className="text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Research Token Auctions</CardTitle>
              <CardDescription>Quick access to research tokens and auctions</CardDescription>
            </div>
          </div>
          <Button
            onClick={handleSuggestToSocial}
            disabled={isSuggesting || (researchAuctions.length === 0 && (!researchTokens || researchTokens.length === 0))}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
          >
            <ShareNetwork size={20} weight="bold" className="mr-2" />
            🤑 Suggest to Social
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Fire size={20} weight="fill" className="text-orange-500" />
                Active Research Auctions
              </h3>
              <Badge variant="secondary">{researchAuctions?.length || 0} live</Badge>
            </div>

            {researchAuctions.length === 0 ? (
              <div className="text-center py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed">
                <Gavel size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">No active research auctions</p>
                <Button 
                  onClick={handleCreateAuction}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Sparkle size={16} weight="fill" />
                  Create First Auction
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {researchAuctions.slice(0, 3).map(auction => {
                  const token = (researchTokens || []).find(t => t.id === auction.researchTokenId)
                  const timeLeft = auction.endTime - Date.now()
                  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))
                  
                  return (
                    <Card key={auction.id} className="border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-1">{token?.title || auction.tokenName}</h4>
                              <p className="text-xs text-muted-foreground">by @{auction.seller}</p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {hoursLeft}h left
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CurrencyDollar size={16} className="text-accent" />
                              <span className="font-bold text-accent">{auction.currentBid.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">INF</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{token?.category || 'research'}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                
                {researchAuctions.length > 3 && (
                  <Button
                    onClick={() => onNavigate?.('auction')}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    View all {researchAuctions.length} auctions
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendUp size={20} weight="fill" className="text-green-500" />
                Top Research Tokens
              </h3>
              <Badge variant="secondary">{researchTokens?.length || 0} total</Badge>
            </div>

            {!researchTokens || researchTokens.length === 0 ? (
              <div className="text-center py-8 px-4 bg-muted/50 rounded-lg border-2 border-dashed">
                <Flask size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">No research tokens minted yet</p>
                <Button 
                  onClick={() => onNavigate?.('research')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Sparkle size={16} weight="fill" />
                  Mint First Token
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {topResearchTokens.map(token => (
                  <Card key={token.id} className="border-accent/20 hover:border-accent/40 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-1">{token.title}</h4>
                            <p className="text-xs text-muted-foreground">by @{token.author}</p>
                          </div>
                          {token.verified && (
                            <Badge variant="default" className="text-xs bg-green-500 shrink-0">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkle size={16} className="text-accent" weight="fill" />
                            <span className="font-bold text-accent">{token.value.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">INF</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">{token.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  onClick={() => onNavigate?.('research')}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  View all research tokens
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Button
            onClick={() => onNavigate?.('research')}
            variant="outline"
            className="flex-col h-auto py-4 gap-2"
          >
            <Sparkle size={24} weight="duotone" className="text-green-500" />
            <span className="text-xs">Quality Score</span>
          </Button>

          <Button
            onClick={() => onNavigate?.('quality')}
            variant="outline"
            className="flex-col h-auto py-4 gap-2"
          >
            <Flask size={24} weight="duotone" className="text-primary" />
            <span className="text-xs">Mint Research</span>
          </Button>

          <Button
            onClick={handleCreateAuction}
            variant="outline"
            className="flex-col h-auto py-4 gap-2"
          >
            <Gavel size={24} weight="duotone" className="text-accent" />
            <span className="text-xs">Create Auction</span>
          </Button>

          <Button
            onClick={() => onNavigate?.('create-auto-auction')}
            variant="outline"
            className="flex-col h-auto py-4 gap-2 border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5"
          >
            <Lightning size={24} weight="fill" className="text-purple-500" />
            <span className="text-xs">Auto Auction</span>
          </Button>

          <Button
            onClick={() => onNavigate?.('auction')}
            variant="outline"
            className="flex-col h-auto py-4 gap-2"
          >
            <Eye size={24} weight="duotone" className="text-secondary" />
            <span className="text-xs">Browse Auctions</span>
          </Button>

          <Button
            onClick={handleSuggestToSocial}
            disabled={isSuggesting}
            variant="outline"
            className="flex-col h-auto py-4 gap-2 border-green-500/30 hover:border-green-500/60"
          >
            <ShareNetwork size={24} weight="duotone" className="text-green-500" />
            <span className="text-xs">🤑 Share</span>
          </Button>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-lg border border-purple-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lightning size={24} weight="fill" className="text-purple-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                ⚡ Auto-Priced Auction Creator
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                NEW! Create auctions with AI-calculated pricing based on quality scores, market demand, and rarity. Get suggested start price, reserve price, and buy-now price with confidence ratings!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Smart Pricing</Badge>
                <Badge variant="secondary" className="text-xs">AI Analysis</Badge>
                <Badge variant="secondary" className="text-xs">One-Click Create</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-600/10 rounded-lg border border-green-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Sparkle size={24} weight="fill" className="text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                ✨ AI-Powered Quality Scoring
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use our AI repository quality scorer to analyze code quality, documentation, activity, and community engagement. Get instant predictions for token value before minting!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Code Analysis</Badge>
                <Badge variant="secondary" className="text-xs">Value Prediction</Badge>
                <Badge variant="secondary" className="text-xs">Quality Metrics</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-lg border border-green-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ShareNetwork size={24} weight="fill" className="text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                🤑 Boost Your Research Visibility
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Click "🤑 Suggest to Social" to auto-generate engaging posts for Twitter, LinkedIn, and more. Get maximum views on your research tokens and auctions!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Auto-hashtags</Badge>
                <Badge variant="secondary" className="text-xs">Smart formatting</Badge>
                <Badge variant="secondary" className="text-xs">Multi-platform</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
