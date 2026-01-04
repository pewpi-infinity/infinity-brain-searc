import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sparkle, Robot, Lightning, TrendUp, CheckCircle, Gavel, Coins, Clock, Target, ArrowRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage, localStorageUtils } from '@/hooks/useLocalStorage'
import { useAuth } from '@/lib/auth'
import { TokenAuction } from '@/components/TokenAuction'

interface AuctionAutoPricing {
  tokenSymbol: string
  tokenId: string
  suggestedStartPrice: number
  suggestedReservePrice: number
  suggestedBuyNowPrice: number
  confidence: number
  reasoning: string[]
  qualityScore: number
  marketDemand: number
  rarityBonus: number
}

export function AutoPricedAuctionCreator() {
  const { userProfile, isAuthenticated, login } = useAuth()
  const [auctions, setAuctions] = useLocalStorage<TokenAuction[]>('token-auctions', [])
  const [auctionPricings, setAuctionPricings] = useLocalStorage<AuctionAutoPricing[]>('auction-auto-pricings', [])
  const [businessTokens] = useLocalStorage<any[]>('business-tokens', [])
  const [researchTokens] = useLocalStorage<any[]>('research-tokens', [])
  
  const [selectedToken, setSelectedToken] = useState<string>('')
  const [tokenAmount, setTokenAmount] = useState<string>('1')
  const [duration, setDuration] = useState<string>('24')
  const [isCreating, setIsCreating] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [currentPricing, setCurrentPricing] = useState<AuctionAutoPricing | null>(null)

  const allTokens = [
    ...(businessTokens || []).map(t => ({ ...t, type: 'business' })),
    ...(researchTokens || []).map(t => ({ ...t, type: 'research' }))
  ]

  const availableTokens = userProfile 
    ? allTokens.filter(token => {
        const balance = userProfile.businessTokens[token.symbol] || 0
        return balance > 0 && token.symbol !== 'INF'
      })
    : []

  const calculateQualityScore = async (tokenId: string): Promise<number> => {
    const qualityScores = localStorageUtils.get<any[]>('quality-scores', [])
    const score = qualityScores.find(s => s.tokenId === tokenId || s.repoUrl === tokenId)
    
    if (!score) return 50

    const metrics = score.metrics || {}
    const qualityScore = (
      (metrics.codeQuality || 0) * 0.3 +
      (metrics.documentation || 0) * 0.2 +
      (metrics.activity || 0) * 0.2 +
      (metrics.community || 0) * 0.15 +
      (metrics.innovation || 0) * 0.15
    )

    return Math.min(100, qualityScore)
  }

  const calculateMarketDemand = async (symbol: string): Promise<number> => {
    const existingAuctions = auctions?.filter(a => 
      a.tokenSymbol === symbol && a.status === 'ended'
    ) || []
    
    const avgBids = existingAuctions.reduce((sum, a) => sum + a.bids.length, 0) / (existingAuctions.length || 1)
    const recentViews = Math.random() * 100
    
    return Math.min(100, avgBids * 15 + recentViews * 0.3)
  }

  const calculateRarityBonus = async (symbol: string): Promise<number> => {
    const token = allTokens.find(t => t.symbol === symbol)
    if (!token) return 1.0

    const supply = token.supply || 1000000
    const holders = token.holders?.length || 1

    const supplyRarity = Math.max(0, 100 - (supply / 10000))
    const holderRarity = Math.min(100, holders * 5)

    return 1 + ((supplyRarity + holderRarity) / 200)
  }

  const calculatePricing = async (tokenSymbol: string) => {
    setIsCalculating(true)
    
    try {
      const token = allTokens.find(t => t.symbol === tokenSymbol)
      if (!token) {
        toast.error('Token not found')
        return
      }

      const qualityScore = await calculateQualityScore(token.id)
      const marketDemand = await calculateMarketDemand(tokenSymbol)
      const rarityBonus = await calculateRarityBonus(tokenSymbol)

      const basePrice = 1000
      const qualityContribution = (qualityScore / 100) * basePrice * 0.4
      const demandContribution = (marketDemand / 100) * basePrice * 0.35
      const rarityContribution = basePrice * (rarityBonus - 1) * 0.25

      const calculatedPrice = basePrice + qualityContribution + demandContribution + rarityContribution
      const finalPrice = Math.max(100, Math.min(100000, calculatedPrice))

      const suggestedStartPrice = Math.round(finalPrice * 0.7)
      const suggestedReservePrice = Math.round(finalPrice * 0.85)
      const suggestedBuyNowPrice = Math.round(finalPrice * 1.3)

      const confidence = Math.min(100, (
        (qualityScore > 0 ? 25 : 0) +
        (marketDemand > 0 ? 35 : 0) +
        (rarityBonus > 1 ? 25 : 0) +
        15
      ))

      const reasoning: string[] = []
      if (qualityScore > 80) {
        reasoning.push(`High quality score (${qualityScore.toFixed(1)}) increases confidence`)
      }
      if (qualityScore > 60 && qualityScore <= 80) {
        reasoning.push(`Good quality score (${qualityScore.toFixed(1)}) supports mid-range pricing`)
      }
      if (marketDemand > 70) {
        reasoning.push(`Strong market demand (${marketDemand.toFixed(1)}) supports higher pricing`)
      }
      if (marketDemand > 40 && marketDemand <= 70) {
        reasoning.push(`Moderate demand (${marketDemand.toFixed(1)}) suggests steady interest`)
      }
      if (rarityBonus > 1.5) {
        reasoning.push(`Rare token (${((rarityBonus - 1) * 100).toFixed(0)}% bonus) commands premium`)
      }
      if (confidence < 50) {
        reasoning.push(`Lower confidence (${confidence.toFixed(0)}%) suggests conservative pricing`)
      }
      if (reasoning.length === 0) {
        reasoning.push('Standard pricing based on current market conditions')
      }

      const pricing: AuctionAutoPricing = {
        tokenSymbol,
        tokenId: token.id,
        suggestedStartPrice,
        suggestedReservePrice,
        suggestedBuyNowPrice,
        confidence,
        reasoning,
        qualityScore,
        marketDemand,
        rarityBonus
      }

      setCurrentPricing(pricing)
      
      const existingPricings = auctionPricings || []
      const updatedPricings = existingPricings.filter(p => p.tokenSymbol !== tokenSymbol)
      updatedPricings.push(pricing)
      setAuctionPricings(updatedPricings)

      toast.success(`Pricing calculated for ${tokenSymbol}`, {
        description: `Start: ${suggestedStartPrice} INF | Confidence: ${confidence.toFixed(0)}%`
      })
    } catch (error) {
      console.error('Pricing calculation error:', error)
      toast.error('Failed to calculate pricing')
    } finally {
      setIsCalculating(false)
    }
  }

  const createAutoPricedAuction = async () => {
    if (!isAuthenticated) {
      login()
      return
    }

    if (!selectedToken || !currentPricing) {
      toast.error('Please select a token and calculate pricing first')
      return
    }

    const amount = parseFloat(tokenAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid token amount')
      return
    }

    const userBalance = userProfile?.businessTokens[selectedToken] || 0
    if (amount > userBalance) {
      toast.error(`Insufficient balance. You have ${userBalance} ${selectedToken}`)
      return
    }

    setIsCreating(true)

    try {
      const token = allTokens.find(t => t.symbol === selectedToken)
      const durationHours = parseInt(duration)
      
      const newAuction: TokenAuction = {
        id: `auction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tokenSymbol: selectedToken,
        tokenName: token?.name || selectedToken,
        amount,
        startingBid: currentPricing.suggestedStartPrice,
        currentBid: currentPricing.suggestedStartPrice,
        reservePrice: currentPricing.suggestedReservePrice,
        creatorId: userProfile?.userId || 'unknown',
        creatorUsername: userProfile?.username || 'Anonymous',
        startTime: Date.now(),
        endTime: Date.now() + (durationHours * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        description: `Auto-priced auction with ${currentPricing.confidence.toFixed(0)}% confidence. ${currentPricing.reasoning.join('. ')}`
      }

      setAuctions((current) => [...(current || []), newAuction])

      toast.success(`Auto-priced auction created! 🎉`, {
        description: `${amount} ${selectedToken} starting at ${currentPricing.suggestedStartPrice} INF`
      })

      setSelectedToken('')
      setTokenAmount('1')
      setCurrentPricing(null)
    } catch (error) {
      console.error('Failed to create auction:', error)
      toast.error('Failed to create auction')
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (selectedToken) {
      calculatePricing(selectedToken)
    } else {
      setCurrentPricing(null)
    }
  }, [selectedToken])

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Lightning size={36} weight="duotone" className="text-accent" />
                Auto-Priced Auction Creator
              </CardTitle>
              <CardDescription className="text-base">
                Create auctions with AI-powered pricing based on quality, demand, and rarity analysis
              </CardDescription>
            </div>
            {!isAuthenticated && (
              <Button onClick={login} size="lg" className="gap-2">
                <CheckCircle size={20} weight="duotone" />
                Sign In to Create
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAuthenticated ? (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-select" className="text-base font-semibold">
                      Select Token
                    </Label>
                    <Select value={selectedToken} onValueChange={setSelectedToken}>
                      <SelectTrigger id="token-select" className="h-12">
                        <SelectValue placeholder="Choose a token to auction" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.length > 0 ? (
                          availableTokens.map(token => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">{token.symbol}</span>
                                <Badge variant="secondary">
                                  {userProfile?.businessTokens[token.symbol] || 0} available
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No tokens available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-base font-semibold">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        placeholder="1"
                        min="1"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-base font-semibold">
                        Duration (hours)
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration" className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="12">12 hours</SelectItem>
                          <SelectItem value="24">24 hours</SelectItem>
                          <SelectItem value="48">2 days</SelectItem>
                          <SelectItem value="72">3 days</SelectItem>
                          <SelectItem value="168">1 week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {isCalculating ? (
                    <Card className="bg-muted/50 border-2 border-dashed">
                      <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Robot size={48} weight="duotone" className="text-primary animate-pulse" />
                          <p className="text-muted-foreground text-center">
                            AI analyzing token value...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : currentPricing ? (
                    <Card className="bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 border-2 border-accent/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Target size={24} weight="duotone" className="text-accent" />
                          Suggested Pricing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Starting Bid</p>
                            <p className="text-xl font-bold text-primary">
                              {currentPricing.suggestedStartPrice}
                            </p>
                            <p className="text-xs text-muted-foreground">INF</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Reserve</p>
                            <p className="text-xl font-bold text-secondary">
                              {currentPricing.suggestedReservePrice}
                            </p>
                            <p className="text-xs text-muted-foreground">INF</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Buy Now</p>
                            <p className="text-xl font-bold text-accent">
                              {currentPricing.suggestedBuyNowPrice}
                            </p>
                            <p className="text-xs text-muted-foreground">INF</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Confidence</span>
                            <Badge variant={currentPricing.confidence > 70 ? 'default' : 'secondary'}>
                              {currentPricing.confidence.toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Quality Score</span>
                            <Badge variant="outline">
                              {currentPricing.qualityScore.toFixed(0)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Market Demand</span>
                            <Badge variant="outline">
                              {currentPricing.marketDemand.toFixed(0)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Rarity Bonus</span>
                            <Badge variant="outline">
                              {((currentPricing.rarityBonus - 1) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-muted/30 border-2 border-dashed">
                      <CardContent className="py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Sparkle size={48} weight="duotone" className="text-muted-foreground" />
                          <p className="text-muted-foreground text-center">
                            Select a token to see AI pricing suggestions
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {currentPricing && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <TrendUp size={20} weight="duotone" className="text-primary" />
                        Pricing Analysis
                      </h4>
                      <ul className="space-y-2">
                        {currentPricing.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <ArrowRight size={16} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {currentPricing ? (
                      <>
                        Auction will run for <span className="font-semibold text-foreground">{duration}h</span> starting at{' '}
                        <span className="font-semibold text-primary">{currentPricing.suggestedStartPrice} INF</span>
                      </>
                    ) : (
                      'Configure your auction above'
                    )}
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={createAutoPricedAuction}
                  disabled={!selectedToken || !currentPricing || isCreating}
                  className="gap-2 min-w-[200px]"
                >
                  {isCreating ? (
                    <>
                      <Robot size={20} weight="duotone" className="animate-pulse" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Gavel size={20} weight="duotone" />
                      Create Auto-Priced Auction
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-muted/30 border-2 border-dashed">
              <CardContent className="py-16">
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle size={64} weight="duotone" className="text-muted-foreground" />
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Sign In Required</h3>
                    <p className="text-muted-foreground max-w-md">
                      Sign in to create auto-priced auctions with AI-powered pricing analysis
                    </p>
                  </div>
                  <Button size="lg" onClick={login} className="gap-2 mt-4">
                    <CheckCircle size={20} weight="duotone" />
                    Sign In Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins size={24} weight="duotone" className="text-primary" />
            Recent Auto-Priced Auctions
          </CardTitle>
          <CardDescription>
            Auctions created with AI pricing suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {auctions && auctions.length > 0 ? (
                auctions
                  .filter(a => a.description?.includes('Auto-priced'))
                  .slice(0, 10)
                  .map((auction) => (
                    <Card key={auction.id} className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{auction.tokenSymbol}</h4>
                              <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
                                {auction.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Current Bid</p>
                                <p className="font-semibold">{auction.currentBid} INF</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Reserve</p>
                                <p className="font-semibold">{auction.reservePrice || 'None'} INF</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Bids</p>
                                <p className="font-semibold">{auction.bids.length}</p>
                              </div>
                            </div>
                            {auction.status === 'active' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock size={16} weight="duotone" />
                                Ends {new Date(auction.endTime).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-12">
                  <Gavel size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No auto-priced auctions yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create your first auction above
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
