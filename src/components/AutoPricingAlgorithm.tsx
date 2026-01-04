import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkle, TrendUp, Lightning, ChartLine, Robot, Cpu, Target, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage, localStorageUtils } from '@/hooks/useLocalStorage'

interface PricingConfig {
  enabled: boolean
  baseMultiplier: number
  qualityWeight: number
  marketDemandWeight: number
  rarityWeight: number
  timeDecayEnabled: boolean
  dynamicAdjustment: boolean
  minPrice: number
  maxPrice: number
  updateInterval: number
}

interface TokenPricing {
  tokenId: string
  symbol: string
  calculatedPrice: number
  basePrice: number
  qualityScore: number
  marketDemand: number
  rarityBonus: number
  finalPrice: number
  confidence: number
  lastUpdated: string
  priceHistory: number[]
}

interface AuctionAutoPricing {
  auctionId: string
  tokenSymbol: string
  suggestedStartPrice: number
  suggestedReservePrice: number
  suggestedBuyNowPrice: number
  confidence: number
  reasoning: string[]
}

export function AutoPricingAlgorithm() {
  const [config, setConfig] = useLocalStorage<PricingConfig>('auto-pricing-config', {
    enabled: false,
    baseMultiplier: 1.0,
    qualityWeight: 0.4,
    marketDemandWeight: 0.35,
    rarityWeight: 0.25,
    timeDecayEnabled: true,
    dynamicAdjustment: true,
    minPrice: 100,
    maxPrice: 100000,
    updateInterval: 300000
  })

  const [tokenPricings, setTokenPricings] = useLocalStorage<TokenPricing[]>('token-pricings', [])
  const [auctionPricings, setAuctionPricings] = useLocalStorage<AuctionAutoPricing[]>('auction-auto-pricings', [])
  const [isCalculating, setIsCalculating] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [algorithmStatus, setAlgorithmStatus] = useState<'idle' | 'running' | 'paused'>('idle')

  useEffect(() => {
    if (!config?.enabled) return

    const interval = setInterval(() => {
      recalculateAllPrices()
    }, config?.updateInterval || 300000)

    return () => clearInterval(interval)
  }, [config?.enabled, config?.updateInterval])

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
    const tokens = localStorageUtils.get<any[]>('business-tokens', [])
    const token = tokens.find(t => t.symbol === symbol)
    
    if (!token) return 50

    const metrics = token.metrics || {}
    const clicks = metrics.clicks || 0
    const views = metrics.views || 0
    const transfers = metrics.transfers || 0
    const trades = metrics.trades || 0

    const demandScore = Math.min(100, (
      clicks * 0.1 +
      views * 0.05 +
      transfers * 2 +
      trades * 3
    ))

    return demandScore
  }

  const calculateRarityBonus = async (symbol: string): Promise<number> => {
    const tokens = localStorageUtils.get<any[]>('business-tokens', [])
    const token = tokens.find(t => t.symbol === symbol)
    
    if (!token) return 1.0

    const supply = token.supply || 1000000
    const holders = token.holders?.length || 1

    const supplyRarity = Math.max(0, 100 - (supply / 10000))
    const holderRarity = Math.min(100, holders * 5)

    return 1 + ((supplyRarity + holderRarity) / 200)
  }

  const calculateTokenPrice = async (tokenId: string, symbol: string): Promise<TokenPricing> => {
    const qualityScore = await calculateQualityScore(tokenId)
    const marketDemand = await calculateMarketDemand(symbol)
    const rarityBonus = await calculateRarityBonus(symbol)

    const basePrice = 1000

    const qualityContribution = (qualityScore / 100) * basePrice * (config?.qualityWeight || 0.4)
    const demandContribution = (marketDemand / 100) * basePrice * (config?.marketDemandWeight || 0.35)
    const rarityContribution = basePrice * (rarityBonus - 1) * (config?.rarityWeight || 0.25)

    const calculatedPrice = basePrice + qualityContribution + demandContribution + rarityContribution

    const adjustedPrice = calculatedPrice * (config?.baseMultiplier || 1.0)

    const finalPrice = Math.max(
      config?.minPrice || 100,
      Math.min(config?.maxPrice || 100000, adjustedPrice)
    )

    const confidence = Math.min(100, (
      (qualityScore > 0 ? 25 : 0) +
      (marketDemand > 0 ? 35 : 0) +
      (rarityBonus > 1 ? 25 : 0) +
      15
    ))

    const existing = tokenPricings?.find(p => p.tokenId === tokenId)
    const priceHistory = existing?.priceHistory || []
    priceHistory.push(finalPrice)
    if (priceHistory.length > 50) priceHistory.shift()

    return {
      tokenId,
      symbol,
      calculatedPrice,
      basePrice,
      qualityScore,
      marketDemand,
      rarityBonus,
      finalPrice,
      confidence,
      lastUpdated: new Date().toISOString(),
      priceHistory
    }
  }

  const calculateAuctionPricing = async (tokenId: string, symbol: string): Promise<AuctionAutoPricing> => {
    const pricing = await calculateTokenPrice(tokenId, symbol)
    
    const suggestedStartPrice = Math.round(pricing.finalPrice * 0.7)
    const suggestedReservePrice = Math.round(pricing.finalPrice * 0.85)
    const suggestedBuyNowPrice = Math.round(pricing.finalPrice * 1.3)

    const reasoning: string[] = []

    if (pricing.qualityScore > 80) {
      reasoning.push(`High quality score (${pricing.qualityScore.toFixed(1)}) increases confidence`)
    }
    if (pricing.marketDemand > 70) {
      reasoning.push(`Strong market demand (${pricing.marketDemand.toFixed(1)}) supports higher pricing`)
    }
    if (pricing.rarityBonus > 1.5) {
      reasoning.push(`Rare token (${((pricing.rarityBonus - 1) * 100).toFixed(0)}% bonus) commands premium`)
    }
    if (pricing.confidence < 50) {
      reasoning.push(`Lower confidence (${pricing.confidence.toFixed(0)}%) suggests conservative pricing`)
    }

    return {
      auctionId: `auction-${tokenId}-${Date.now()}`,
      tokenSymbol: symbol,
      suggestedStartPrice,
      suggestedReservePrice,
      suggestedBuyNowPrice,
      confidence: pricing.confidence,
      reasoning
    }
  }

  const recalculateAllPrices = async () => {
    if (!config?.enabled) return

    setIsCalculating(true)
    setAlgorithmStatus('running')

    try {
      const tokens = localStorageUtils.get<any[]>('business-tokens', [])
      const researchTokens = localStorageUtils.get<any[]>('research-tokens', [])
      
      const allTokens = [
        ...tokens.map(t => ({ id: t.id, symbol: t.symbol })),
        ...researchTokens.map(t => ({ id: t.id, symbol: t.symbol }))
      ]

      const newPricings: TokenPricing[] = []
      const newAuctionPricings: AuctionAutoPricing[] = []

      for (const token of allTokens.slice(0, 20)) {
        const pricing = await calculateTokenPrice(token.id, token.symbol)
        newPricings.push(pricing)

        const auctionPricing = await calculateAuctionPricing(token.id, token.symbol)
        newAuctionPricings.push(auctionPricing)
      }

      setTokenPricings(newPricings)
      setAuctionPricings(newAuctionPricings)
      setLastUpdate(new Date())
      
      toast.success(`Auto-pricing updated for ${newPricings.length} tokens`)
    } catch (error) {
      console.error('Pricing calculation error:', error)
      toast.error('Failed to calculate prices')
    } finally {
      setIsCalculating(false)
      setAlgorithmStatus('idle')
    }
  }

  const applyPricingToAuction = async (auctionPricing: AuctionAutoPricing) => {
    try {
      const auctions = localStorageUtils.get<any[]>('token-auctions', [])
      
      const newAuction = {
        id: auctionPricing.auctionId,
        tokenSymbol: auctionPricing.tokenSymbol,
        startingBid: auctionPricing.suggestedStartPrice,
        reservePrice: auctionPricing.suggestedReservePrice,
        buyNowPrice: auctionPricing.suggestedBuyNowPrice,
        currentBid: auctionPricing.suggestedStartPrice,
        bids: [],
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        autoPriced: true,
        pricingConfidence: auctionPricing.confidence,
        createdBy: 'auto-pricing-algorithm'
      }

      localStorageUtils.set('token-auctions', [...auctions, newAuction])
      
      toast.success(`Auto-priced auction created for ${auctionPricing.tokenSymbol}`, {
        description: `Start: ${auctionPricing.suggestedStartPrice} INF`
      })
    } catch (error) {
      console.error('Failed to create auction:', error)
      toast.error('Failed to create auto-priced auction')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Robot size={32} weight="duotone" className="text-primary" />
                Auto-Pricing Algorithm
              </CardTitle>
              <CardDescription>
                AI-powered dynamic pricing engine using quality scores, market demand, and rarity analysis
              </CardDescription>
            </div>
            <Badge variant={algorithmStatus === 'running' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {algorithmStatus === 'running' && <Lightning size={16} weight="fill" className="mr-1 animate-pulse" />}
              {algorithmStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Cpu size={24} weight="duotone" className="text-accent" />
              <div>
                <Label htmlFor="algo-enabled" className="text-base font-semibold">Enable Auto-Pricing</Label>
                <p className="text-sm text-muted-foreground">Automatically calculate and update token prices</p>
              </div>
            </div>
            <Switch
              id="algo-enabled"
              checked={config?.enabled || false}
              onCheckedChange={(enabled) => setConfig(prev => ({ ...prev!, enabled }))}
            />
          </div>

          {config?.enabled && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center justify-between mb-2">
                      <span>Quality Score Weight</span>
                      <span className="text-primary font-bold">{((config?.qualityWeight || 0.4) * 100).toFixed(0)}%</span>
                    </Label>
                    <Slider
                      value={[(config?.qualityWeight || 0.4) * 100]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev!, qualityWeight: value / 100 }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Impact of repository quality on price</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center justify-between mb-2">
                      <span>Market Demand Weight</span>
                      <span className="text-secondary font-bold">{((config?.marketDemandWeight || 0.35) * 100).toFixed(0)}%</span>
                    </Label>
                    <Slider
                      value={[(config?.marketDemandWeight || 0.35) * 100]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev!, marketDemandWeight: value / 100 }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Impact of user engagement on price</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center justify-between mb-2">
                      <span>Rarity Weight</span>
                      <span className="text-accent font-bold">{((config?.rarityWeight || 0.25) * 100).toFixed(0)}%</span>
                    </Label>
                    <Slider
                      value={[(config?.rarityWeight || 0.25) * 100]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev!, rarityWeight: value / 100 }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Impact of token scarcity on price</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center justify-between mb-2">
                      <span>Base Multiplier</span>
                      <span className="font-bold">{(config?.baseMultiplier || 1.0).toFixed(2)}x</span>
                    </Label>
                    <Slider
                      value={[(config?.baseMultiplier || 1.0) * 100]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev!, baseMultiplier: value / 100 }))}
                      min={50}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Global price scaling factor</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Min Price (INF)</Label>
                      <Select
                        value={(config?.minPrice || 100).toString()}
                        onValueChange={(value) => setConfig(prev => ({ ...prev!, minPrice: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                          <SelectItem value="1000">1000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Max Price (INF)</Label>
                      <Select
                        value={(config?.maxPrice || 100000).toString()}
                        onValueChange={(value) => setConfig(prev => ({ ...prev!, maxPrice: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10000">10,000</SelectItem>
                          <SelectItem value="50000">50,000</SelectItem>
                          <SelectItem value="100000">100,000</SelectItem>
                          <SelectItem value="500000">500,000</SelectItem>
                          <SelectItem value="1000000">1,000,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Time Decay</Label>
                      <p className="text-xs text-muted-foreground">Reduce prices for stale tokens</p>
                    </div>
                    <Switch
                      checked={config?.timeDecayEnabled || false}
                      onCheckedChange={(enabled) => setConfig(prev => ({ ...prev!, timeDecayEnabled: enabled }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Dynamic Adjustment</Label>
                      <p className="text-xs text-muted-foreground">Real-time price updates</p>
                    </div>
                    <Switch
                      checked={config?.dynamicAdjustment || false}
                      onCheckedChange={(enabled) => setConfig(prev => ({ ...prev!, dynamicAdjustment: enabled }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={recalculateAllPrices}
                  disabled={isCalculating}
                  className="flex-1"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <Sparkle size={20} weight="fill" className="mr-2 animate-spin" />
                      Calculating Prices...
                    </>
                  ) : (
                    <>
                      <Target size={20} weight="duotone" className="mr-2" />
                      Recalculate All Prices
                    </>
                  )}
                </Button>
                
                {lastUpdate && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {config?.enabled && (tokenPricings?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={24} weight="duotone" className="text-accent" />
              Token Pricing Analysis
            </CardTitle>
            <CardDescription>
              Real-time calculated prices for {tokenPricings?.length || 0} tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(tokenPricings || []).slice(0, 10).map((pricing) => (
                <div key={pricing.tokenId} className="p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-sm">
                        {pricing.symbol}
                      </Badge>
                      <div className="text-2xl font-bold text-primary">
                        {pricing.finalPrice.toFixed(0)} INF
                      </div>
                    </div>
                    <Badge variant={pricing.confidence > 70 ? 'default' : 'secondary'}>
                      {pricing.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Quality:</span>
                      <Progress value={pricing.qualityScore} className="h-2 mt-1" />
                      <span className="text-xs font-medium">{pricing.qualityScore.toFixed(0)}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Demand:</span>
                      <Progress value={pricing.marketDemand} className="h-2 mt-1" />
                      <span className="text-xs font-medium">{pricing.marketDemand.toFixed(0)}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Rarity:</span>
                      <div className="text-xs font-medium mt-1">{pricing.rarityBonus.toFixed(2)}x</div>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Base: {pricing.basePrice} INF</span>
                    <span>•</span>
                    <span>Calculated: {pricing.calculatedPrice.toFixed(0)} INF</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {config?.enabled && (auctionPricings?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={24} weight="duotone" className="text-secondary" />
              Suggested Auction Pricing
            </CardTitle>
            <CardDescription>
              AI-recommended pricing for auction listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(auctionPricings || []).slice(0, 5).map((pricing) => (
                <div key={pricing.auctionId} className="p-4 border-2 border-dashed rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-base px-3 py-1">
                      {pricing.tokenSymbol}
                    </Badge>
                    <Badge variant={pricing.confidence > 70 ? 'default' : 'secondary'}>
                      {pricing.confidence.toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Start Price</div>
                      <div className="text-xl font-bold text-primary">
                        {pricing.suggestedStartPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">INF</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/5 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Reserve</div>
                      <div className="text-xl font-bold text-secondary">
                        {pricing.suggestedReservePrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">INF</div>
                    </div>
                    <div className="text-center p-3 bg-accent/5 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Buy Now</div>
                      <div className="text-xl font-bold text-accent">
                        {pricing.suggestedBuyNowPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">INF</div>
                    </div>
                  </div>

                  {pricing.reasoning.length > 0 && (
                    <div className="space-y-1">
                      {pricing.reasoning.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => applyPricingToAuction(pricing)}
                    className="w-full"
                    variant="outline"
                  >
                    Create Auto-Priced Auction
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
