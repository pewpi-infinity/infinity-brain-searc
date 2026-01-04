import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as d3 from 'd3'
import { 
  TrendUp, 
  TrendDown,
  ChartLine,
  Fire,
  ChartLineUp
} from '@phosphor-icons/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Transaction } from './TransactionHistory'
import { MarketOrder } from './TokenMarketplace'

interface TokenMarketData {
  symbol: string
  name: string
  price: number
  priceChange24h: number
  percentChange24h: number
  volume24h: number
  marketCap: number
  sparklineData: number[]
}

interface MarketOverviewProps {
  onTokenSelect?: (symbol: string) => void
}

export function MarketOverview({ onTokenSelect }: MarketOverviewProps) {
  const [allTokens] = useLocalStorage<Record<string, any>>('business-tokens', {})
  const [allTransactions] = useLocalStorage<Transaction[]>('all-transactions', [])
  const [marketOrders] = useLocalStorage<MarketOrder[]>('market-orders', [])
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'marketCap'>('marketCap')

  const generateMarketData = (): TokenMarketData[] => {
    const tokens = Object.values(allTokens || {}).filter((t: any) => t.symbol !== 'INF')
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    return tokens.map((token: any) => {
      const tokenOrders = (marketOrders || []).filter(
        order => order.tokenSymbol === token.symbol && order.status === 'filled'
      )

      const recentOrders = tokenOrders.filter(order => order.createdAt >= oneDayAgo)
      
      let currentPrice = 10 + Math.random() * 40
      let priceYesterday = currentPrice * (0.85 + Math.random() * 0.3)
      
      if (tokenOrders.length > 0) {
        const sortedOrders = [...tokenOrders].sort((a, b) => b.createdAt - a.createdAt)
        currentPrice = sortedOrders[0]?.pricePerToken || currentPrice
        
        const oldOrders = tokenOrders.filter(order => order.createdAt < oneDayAgo)
        if (oldOrders.length > 0) {
          priceYesterday = oldOrders[oldOrders.length - 1]?.pricePerToken || priceYesterday
        }
      }

      const priceChange = currentPrice - priceYesterday
      const percentChange = (priceChange / priceYesterday) * 100

      const volume24h = recentOrders.reduce((sum, order) => sum + order.amount, 0)
      const marketCap = token.totalSupply * currentPrice

      const sparklineData: number[] = []
      const points = 20
      let price = priceYesterday
      
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1)
        const targetPrice = priceYesterday + (priceChange * progress)
        const noise = (Math.random() - 0.5) * (currentPrice * 0.02)
        price = targetPrice + noise
        sparklineData.push(price)
      }
      sparklineData[sparklineData.length - 1] = currentPrice

      return {
        symbol: token.symbol,
        name: token.name,
        price: currentPrice,
        priceChange24h: priceChange,
        percentChange24h: percentChange,
        volume24h,
        marketCap,
        sparklineData
      }
    })
  }

  const marketData = generateMarketData()

  const sortedData = [...marketData].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price
      case 'change':
        return b.percentChange24h - a.percentChange24h
      case 'volume':
        return b.volume24h - a.volume24h
      case 'marketCap':
      default:
        return b.marketCap - a.marketCap
    }
  })

  const topGainer = marketData.reduce((max, token) => 
    token.percentChange24h > max.percentChange24h ? token : max
  , marketData[0] || { percentChange24h: -Infinity })

  const topVolume = marketData.reduce((max, token) => 
    token.volume24h > max.volume24h ? token : max
  , marketData[0] || { volume24h: -Infinity })

  if (marketData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ChartLine size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">No Market Data</h3>
        <p className="text-muted-foreground">
          Create tokens to view market overview
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Fire size={20} weight="duotone" className="text-accent" />
            <span className="text-sm font-bold text-muted-foreground">Top Gainer 24h</span>
          </div>
          {topGainer && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">{topGainer.symbol}</span>
                <Badge variant="default" className="flex items-center gap-1">
                  <TrendUp size={12} weight="bold" />
                  {topGainer.percentChange24h.toFixed(2)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold font-mono">
                ${topGainer.price.toFixed(2)}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center gap-2 mb-2">
            <ChartLineUp size={20} weight="duotone" className="text-primary" />
            <span className="text-sm font-bold text-muted-foreground">Total Market Cap</span>
          </div>
          <div className="text-2xl font-bold font-mono">
            ${marketData.reduce((sum, t) => sum + t.marketCap, 0).toLocaleString(undefined, {
              maximumFractionDigits: 0
            })}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Across {marketData.length} tokens
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-secondary/10 to-accent/10">
          <div className="flex items-center gap-2 mb-2">
            <ChartLine size={20} weight="duotone" className="text-secondary" />
            <span className="text-sm font-bold text-muted-foreground">Highest Volume 24h</span>
          </div>
          {topVolume && (
            <div>
              <div className="font-bold text-lg mb-1">{topVolume.symbol}</div>
              <div className="text-2xl font-bold font-mono">
                {topVolume.volume24h.toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">All Markets</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <Button
              variant={sortBy === 'marketCap' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('marketCap')}
              className="text-xs"
            >
              Market Cap
            </Button>
            <Button
              variant={sortBy === 'change' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('change')}
              className="text-xs"
            >
              Change
            </Button>
            <Button
              variant={sortBy === 'volume' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('volume')}
              className="text-xs"
            >
              Volume
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {sortedData.map((token, index) => (
              <TokenRow 
                key={token.symbol} 
                token={token} 
                rank={index + 1}
                onSelect={onTokenSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

interface TokenRowProps {
  token: TokenMarketData
  rank: number
  onSelect?: (symbol: string) => void
}

function TokenRow({ token, rank, onSelect }: TokenRowProps) {
  const sparklineRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!sparklineRef.current || token.sparklineData.length === 0) return

    const width = 100
    const height = 40
    const margin = 2

    d3.select(sparklineRef.current).selectAll('*').remove()

    const svg = d3.select(sparklineRef.current)
      .attr('width', width)
      .attr('height', height)

    const xScale = d3.scaleLinear()
      .domain([0, token.sparklineData.length - 1])
      .range([margin, width - margin])

    const yScale = d3.scaleLinear()
      .domain([
        Math.min(...token.sparklineData) * 0.99,
        Math.max(...token.sparklineData) * 1.01
      ])
      .range([height - margin, margin])

    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX)

    const isPositive = token.priceChange24h >= 0

    svg.append('path')
      .datum(token.sparklineData)
      .attr('fill', 'none')
      .attr('stroke', isPositive ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)')
      .attr('stroke-width', 1.5)
      .attr('d', line)

  }, [token.sparklineData, token.priceChange24h])

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onSelect?.(token.symbol)}
    >
      <div className="w-8 text-center text-sm font-bold text-muted-foreground">
        {rank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold">{token.symbol}</div>
        <div className="text-xs text-muted-foreground truncate">{token.name}</div>
      </div>

      <div className="text-right">
        <div className="font-mono font-bold">${token.price.toFixed(2)}</div>
        <Badge 
          variant={token.priceChange24h >= 0 ? 'default' : 'destructive'}
          className="text-xs mt-1"
        >
          {token.priceChange24h >= 0 ? (
            <TrendUp size={10} weight="bold" className="mr-1" />
          ) : (
            <TrendDown size={10} weight="bold" className="mr-1" />
          )}
          {token.percentChange24h.toFixed(2)}%
        </Badge>
      </div>

      <div className="w-[100px] h-[40px]">
        <svg ref={sparklineRef}></svg>
      </div>

      <div className="text-right w-32">
        <div className="text-xs text-muted-foreground">Volume 24h</div>
        <div className="font-mono text-sm font-bold">
          {token.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>

      <div className="text-right w-32">
        <div className="text-xs text-muted-foreground">Market Cap</div>
        <div className="font-mono text-sm font-bold">
          ${token.marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  )
}
