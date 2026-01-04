import { useState, useEffect } from 'react'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartLine, TrendUp, TrendDown, Coin, Users, Clock, Lightning, ArrowsClockwise, Brain, Sparkle } from '@phosphor-icons/react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { toast } from 'sonner'

interface Auction {
  id: string
  tokenSymbol: string
  tokenName: string
  currentBid: number
  bidCount: number
  endTime: number
  status: 'active' | 'ended'
  winner?: string
  createdAt: number
  views: number
  watchers: number
}

interface AuctionMetrics {
  totalAuctions: number
  activeAuctions: number
  endedAuctions: number
  totalVolume: number
  averageBid: number
  totalBids: number
  uniqueBidders: number
  conversionRate: number
  averageDuration: number
}

interface MarketForecast {
  nextDayVolume: number
  nextWeekVolume: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  recommendation: string
}

export function ComprehensiveAuctionAnalytics() {
  const [auctions] = useLocalStorage<Auction[]>('auctions', [])
  const [metrics, setMetrics] = useState<AuctionMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [refreshing, setRefreshing] = useState(false)
  const [forecast, setForecast] = useState<MarketForecast | null>(null)
  const [generatingForecast, setGeneratingForecast] = useState(false)

  const calculateMetrics = () => {
    setRefreshing(true)
    
    const now = Date.now()
    const cutoffTimes = {
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
      'all': 0
    }
    
    const filteredAuctions = (auctions || []).filter(a => a.createdAt >= cutoffTimes[timeRange])
    
    const totalAuctions = filteredAuctions.length
    const activeAuctions = filteredAuctions.filter(a => a.status === 'active').length
    const endedAuctions = filteredAuctions.filter(a => a.status === 'ended').length
    const totalVolume = filteredAuctions.reduce((sum, a) => sum + a.currentBid, 0)
    const totalBids = filteredAuctions.reduce((sum, a) => sum + a.bidCount, 0)
    const averageBid = totalBids > 0 ? totalVolume / totalBids : 0
    
    const uniqueBidders = new Set(filteredAuctions.filter(a => a.winner).map(a => a.winner)).size
    const conversionRate = totalAuctions > 0 ? (endedAuctions / totalAuctions) * 100 : 0
    
    const durations = filteredAuctions
      .filter(a => a.status === 'ended')
      .map(a => a.endTime - a.createdAt)
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0

    setMetrics({
      totalAuctions,
      activeAuctions,
      endedAuctions,
      totalVolume,
      averageBid,
      totalBids,
      uniqueBidders,
      conversionRate,
      averageDuration
    })
    
    setTimeout(() => setRefreshing(false), 500)
  }

  const generateForecast = async () => {
    setGeneratingForecast(true)
    
    try {
      const recentAuctions = (auctions || []).slice(-30)
      const volumeHistory = recentAuctions.map(a => a.currentBid)
      const bidHistory = recentAuctions.map(a => a.bidCount)
      
      const promptText = `You are a market forecasting AI. Analyze this auction data and provide a forecast.

Recent auction volumes: ${JSON.stringify(volumeHistory)}
Recent bid counts: ${JSON.stringify(bidHistory)}
Total auctions: ${metrics?.totalAuctions || 0}
Average bid: ${metrics?.averageBid || 0}
Current active: ${metrics?.activeAuctions || 0}

Based on this data, provide a market forecast in JSON format with:
- nextDayVolume: predicted volume for next 24 hours (number)
- nextWeekVolume: predicted volume for next 7 days (number)
- confidence: confidence level 0-100 (number)
- trend: "up", "down", or "stable" (string)
- recommendation: brief actionable advice for auction creators (string, max 100 chars)

Return ONLY valid JSON, no other text.`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const forecastData = JSON.parse(response)
      
      setForecast(forecastData)
      toast.success('Market forecast generated!', {
        description: `Trend: ${forecastData.trend} | Confidence: ${forecastData.confidence}%`
      })
    } catch (error) {
      toast.error('Failed to generate forecast')
      console.error('Forecast error:', error)
    } finally {
      setGeneratingForecast(false)
    }
  }

  useEffect(() => {
    calculateMetrics()
  }, [auctions, timeRange])

  const volumeData = (auctions || [])
    .filter(a => a.status === 'ended')
    .slice(-10)
    .map((a, i) => ({
      name: a.tokenSymbol,
      value: a.currentBid,
      bids: a.bidCount
    }))

  const statusData = [
    { name: 'Active', value: metrics?.activeAuctions || 0, color: '#22c55e' },
    { name: 'Ended', value: metrics?.endedAuctions || 0, color: '#3b82f6' }
  ]

  const performanceData = (auctions || []).slice(-7).map((a, i) => ({
    day: `Day ${i + 1}`,
    volume: a.currentBid,
    bids: a.bidCount,
    views: a.views || 0
  }))

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChartLine size={32} weight="duotone" className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Auction Analytics Dashboard</h2>
              <p className="text-sm text-muted-foreground">Comprehensive insights into auction performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30d
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={calculateMetrics}
              disabled={refreshing}
            >
              <ArrowsClockwise size={16} className={refreshing ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Coin size={20} weight="duotone" className="text-blue-600" />
              <TrendUp size={16} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold">{metrics?.totalVolume.toFixed(2) || '0'}</div>
            <div className="text-xs text-muted-foreground">Total Volume (INF)</div>
          </Card>

          <Card className="p-4 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Lightning size={20} weight="duotone" className="text-orange-600" />
              <Badge variant="secondary" className="text-xs">{metrics?.activeAuctions || 0} live</Badge>
            </div>
            <div className="text-2xl font-bold">{metrics?.totalAuctions || 0}</div>
            <div className="text-xs text-muted-foreground">Total Auctions</div>
          </Card>

          <Card className="p-4 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Users size={20} weight="duotone" className="text-purple-600" />
              <span className="text-xs text-muted-foreground">{metrics?.totalBids || 0} bids</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.uniqueBidders || 0}</div>
            <div className="text-xs text-muted-foreground">Unique Bidders</div>
          </Card>

          <Card className="p-4 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} weight="duotone" className="text-green-600" />
              <TrendDown size={16} className="text-red-600" />
            </div>
            <div className="text-2xl font-bold">{metrics?.averageDuration ? `${(metrics.averageDuration / (1000 * 60 * 60)).toFixed(1)}h` : '0h'}</div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </Card>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain size={28} weight="duotone" className="text-purple-600" />
            <div>
              <h3 className="text-xl font-bold">AI Market Forecast</h3>
              <p className="text-sm text-muted-foreground">Predictive analytics powered by machine learning</p>
            </div>
          </div>
          <Button
            onClick={generateForecast}
            disabled={generatingForecast || !metrics}
            className="gap-2"
          >
            <Sparkle size={16} weight="duotone" />
            {generatingForecast ? 'Analyzing...' : 'Generate Forecast'}
          </Button>
        </div>

        {forecast && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 bg-white/80">
                <div className="text-sm text-muted-foreground mb-1">Next 24h Volume</div>
                <div className="text-2xl font-bold text-blue-600">{forecast.nextDayVolume.toFixed(2)} INF</div>
              </Card>
              <Card className="p-4 bg-white/80">
                <div className="text-sm text-muted-foreground mb-1">Next 7d Volume</div>
                <div className="text-2xl font-bold text-purple-600">{forecast.nextWeekVolume.toFixed(2)} INF</div>
              </Card>
              <Card className="p-4 bg-white/80">
                <div className="text-sm text-muted-foreground mb-1">Confidence Level</div>
                <div className="text-2xl font-bold text-green-600">{forecast.confidence}%</div>
              </Card>
            </div>

            <Card className="p-4 bg-white/80">
              <div className="flex items-center gap-3">
                {forecast.trend === 'up' && <TrendUp size={24} className="text-green-600" weight="duotone" />}
                {forecast.trend === 'down' && <TrendDown size={24} className="text-red-600" weight="duotone" />}
                {forecast.trend === 'stable' && <ChartLine size={24} className="text-blue-600" weight="duotone" />}
                <div className="flex-1">
                  <div className="font-semibold mb-1">
                    Market Trend: <Badge variant={forecast.trend === 'up' ? 'default' : forecast.trend === 'down' ? 'destructive' : 'secondary'}>{forecast.trend.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{forecast.recommendation}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!forecast && !generatingForecast && (
          <Card className="p-8 bg-white/50 text-center">
            <Brain size={48} className="mx-auto mb-3 text-muted-foreground" weight="duotone" />
            <p className="text-muted-foreground">Click "Generate Forecast" to get AI-powered market predictions</p>
          </Card>
        )}
      </Card>

      <Tabs defaultValue="volume" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Auction Volume by Token</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Final Bid (INF)" />
                <Bar dataKey="bids" fill="#22c55e" name="Bid Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="volume" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="bids" stackId="2" stroke="#22c55e" fill="#22c55e" />
                <Area type="monotone" dataKey="views" stackId="3" stroke="#a855f7" fill="#a855f7" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Auction Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average Bid</span>
                  <span className="font-semibold">{metrics?.averageBid.toFixed(2) || '0'} INF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-semibold">{metrics?.conversionRate.toFixed(1) || '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bids per Auction</span>
                  <span className="font-semibold">
                    {metrics && metrics.totalAuctions > 0 
                      ? (metrics.totalBids / metrics.totalAuctions).toFixed(1) 
                      : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active vs Ended</span>
                  <span className="font-semibold">
                    {metrics?.activeAuctions || 0} / {metrics?.endedAuctions || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
              <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2">
                  <TrendUp className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                  <span>
                    {metrics && metrics.conversionRate > 75 
                      ? 'Excellent conversion rate - auctions are highly engaging'
                      : 'Consider optimizing auction duration and pricing'
                    }
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Users className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                  <span>
                    {metrics && metrics.uniqueBidders > 10
                      ? 'Strong bidder participation across auctions'
                      : 'Focus on increasing bidder engagement through notifications'
                    }
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Lightning className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                  <span>
                    {metrics && metrics.averageBid > 100
                      ? 'High-value auctions driving strong returns'
                      : 'Consider bundling lower-value tokens for better returns'
                    }
                  </span>
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <p className="text-sm text-purple-900">
          📊 <strong>Real-time Analytics:</strong> All data updates automatically as auctions progress. 
          Use these insights to optimize your auction strategies and maximize returns.
        </p>
      </Card>
    </div>
  )
}
