import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendUp, TrendDown, ChartLine, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface TokenPriceData {
  timestamp: number
  price: number
  volume: number
  clicks: number
  engagement: number
}

interface TokenMetrics {
  symbol: string
  name: string
  currentPrice: number
  priceHistory: TokenPriceData[]
  totalClicks: number
  totalVolume: number
  marketCap: number
  change24h: number
}

export function InteractiveTokenChart() {
  const [tokenMetrics, setTokenMetrics] = useLocalStorage<Record<string, TokenMetrics>>('token-metrics-advanced', {})
  const [selectedToken, setSelectedToken] = useState<string>('INF')
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h')

  useEffect(() => {
    const initializeMetrics = async () => {
      const allTokens = await window.spark.kv.get<any[]>('minted-tokens') || []
      const existingMetrics = { ...(tokenMetrics || {}) }

      if (!existingMetrics['INF']) {
        existingMetrics['INF'] = {
          symbol: 'INF',
          name: 'Infinity Token',
          currentPrice: 1.0,
          priceHistory: generateInitialHistory(1.0),
          totalClicks: 0,
          totalVolume: 0,
          marketCap: 1000000,
          change24h: 0
        }
      }

      for (const token of allTokens) {
        if (!existingMetrics[token.symbol]) {
          existingMetrics[token.symbol] = {
            symbol: token.symbol,
            name: token.name,
            currentPrice: token.initialPrice || 10,
            priceHistory: generateInitialHistory(token.initialPrice || 10),
            totalClicks: 0,
            totalVolume: 0,
            marketCap: (token.initialPrice || 10) * (token.totalSupply || 1000),
            change24h: 0
          }
        }
      }

      setTokenMetrics(existingMetrics)
    }

    initializeMetrics()
  }, [])

  const generateInitialHistory = (basePrice: number): TokenPriceData[] => {
    const history: TokenPriceData[] = []
    const now = Date.now()
    const dataPoints = 50

    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = now - (i * 30 * 60 * 1000)
      const variance = (Math.random() - 0.5) * 0.1
      const price = basePrice * (1 + variance)
      
      history.push({
        timestamp,
        price: parseFloat(price.toFixed(4)),
        volume: Math.floor(Math.random() * 1000),
        clicks: 0,
        engagement: 0
      })
    }

    return history
  }

  const handleChartClick = (tokenSymbol: string) => {
    setTokenMetrics(current => {
      if (!current) return {}
      const updated = { ...current }
      const token = updated[tokenSymbol]
      
      if (!token) return current

      const clickValue = 0.01
      const engagementBoost = 0.005
      
      const newPrice = token.currentPrice + clickValue + (Math.random() * engagementBoost)
      const newClicks = token.totalClicks + 1
      
      const latestHistory = [...token.priceHistory]
      const lastEntry = latestHistory[latestHistory.length - 1]
      
      const timeSinceLastEntry = Date.now() - lastEntry.timestamp
      
      if (timeSinceLastEntry > 60000) {
        latestHistory.push({
          timestamp: Date.now(),
          price: parseFloat(newPrice.toFixed(4)),
          volume: lastEntry.volume + 1,
          clicks: 1,
          engagement: 1
        })
        
        if (latestHistory.length > 100) {
          latestHistory.shift()
        }
      } else {
        latestHistory[latestHistory.length - 1] = {
          ...lastEntry,
          price: parseFloat(newPrice.toFixed(4)),
          clicks: lastEntry.clicks + 1,
          engagement: lastEntry.engagement + 1,
          volume: lastEntry.volume + 1
        }
      }

      const oldPrice = token.priceHistory[Math.max(0, token.priceHistory.length - 25)]?.price || token.currentPrice
      const change24h = ((newPrice - oldPrice) / oldPrice) * 100

      updated[tokenSymbol] = {
        ...token,
        currentPrice: parseFloat(newPrice.toFixed(4)),
        priceHistory: latestHistory,
        totalClicks: newClicks,
        totalVolume: token.totalVolume + 1,
        change24h: parseFloat(change24h.toFixed(2))
      }

      toast.success(`🚀 ${tokenSymbol} +${clickValue.toFixed(4)}! Price: $${newPrice.toFixed(4)}`, {
        duration: 2000
      })

      return updated
    })
  }

  const filterHistoryByTimeRange = (history: TokenPriceData[]) => {
    const now = Date.now()
    let cutoff = 0

    switch (timeRange) {
      case '24h':
        cutoff = now - 24 * 60 * 60 * 1000
        break
      case '7d':
        cutoff = now - 7 * 24 * 60 * 60 * 1000
        break
      case '30d':
        cutoff = now - 30 * 24 * 60 * 60 * 1000
        break
      case 'all':
        return history
    }

    return history.filter(entry => entry.timestamp >= cutoff)
  }

  const currentToken = tokenMetrics ? tokenMetrics[selectedToken] : null
  const filteredHistory = currentToken ? filterHistoryByTimeRange(currentToken.priceHistory) : []

  const chartData = filteredHistory.map(entry => ({
    time: new Date(entry.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    price: entry.price,
    volume: entry.volume,
    fullDate: new Date(entry.timestamp).toLocaleString()
  }))

  const tokenList = tokenMetrics ? Object.values(tokenMetrics) : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tokenList.map(token => (
          <motion.div
            key={token.symbol}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedToken === token.symbol ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedToken(token.symbol)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{token.symbol}</CardTitle>
                    <CardDescription className="text-xs">{token.name}</CardDescription>
                  </div>
                  <Badge 
                    variant={token.change24h >= 0 ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {token.change24h >= 0 ? <TrendUp size={12} /> : <TrendDown size={12} />}
                    {Math.abs(token.change24h).toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    ${token.currentPrice.toFixed(4)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Clicks: {token.totalClicks}</span>
                    <span>Vol: {token.totalVolume}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {currentToken && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine size={24} weight="duotone" className="text-primary" />
                  {currentToken.name} ({currentToken.symbol})
                </CardTitle>
                <CardDescription>
                  Interactive price chart - Click to increase value!
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  Line
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {(['24h', '7d', '30d', 'all'] as const).map(range => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold text-primary">
                    ${currentToken.currentPrice.toFixed(4)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className={`text-2xl font-bold ${
                    currentToken.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {currentToken.change24h >= 0 ? '+' : ''}{currentToken.change24h.toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{currentToken.totalClicks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-2xl font-bold">
                    ${currentToken.marketCap.toLocaleString()}
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button 
                  size="lg"
                  className="w-full"
                  onClick={() => handleChartClick(selectedToken)}
                >
                  <Plus size={20} weight="bold" />
                  Click to Boost {currentToken.symbol} Price (+$0.01)
                </Button>
              </motion.div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
