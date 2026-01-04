import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown, 
  Users, 
  Coins, 
  Gavel,
  Trophy,
  Clock,
  CurrencyDollar,
  ArrowUp,
  ArrowDown,
  Calendar,
  Eye,
  Fire
} from '@phosphor-icons/react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface AuctionMetric {
  id: string
  tokenSymbol: string
  startPrice: number
  finalPrice: number
  totalBids: number
  uniqueBidders: number
  duration: number
  endTime: number
  winner: string
  status: 'completed' | 'active' | 'cancelled'
  views: number
  watchlist: number
}

const COLORS = ['oklch(0.45 0.15 300)', 'oklch(0.55 0.20 250)', 'oklch(0.70 0.18 200)', 'oklch(0.75 0.08 290)', 'oklch(0.577 0.245 27.325)']

export function AuctionAnalytics() {
  const [auctions] = useLocalStorage<AuctionMetric[]>('auction-history', [])
  const [liveAuctions] = useLocalStorage<any[]>('token-auctions', [])
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const filteredAuctions = (auctions || []).filter(auction => {
    const daysAgo = (Date.now() - auction.endTime) / (24 * 60 * 60 * 1000)
    if (timeRange === '24h') return daysAgo <= 1
    if (timeRange === '7d') return daysAgo <= 7
    if (timeRange === '30d') return daysAgo <= 30
    return true
  })

  const completedAuctions = filteredAuctions.filter(a => a.status === 'completed')
  const activeAuctionsCount = (liveAuctions || []).filter(a => a.status === 'active').length

  const auctionsList = auctions || []

  const totalRevenue = completedAuctions.reduce((sum, a) => sum + a.finalPrice, 0)
  const totalBids = completedAuctions.reduce((sum, a) => sum + a.totalBids, 0)
  const avgBidsPerAuction = completedAuctions.length > 0 ? totalBids / completedAuctions.length : 0
  const totalUniqueBidders = new Set(completedAuctions.map(a => a.winner)).size
  const avgFinalPrice = completedAuctions.length > 0 ? totalRevenue / completedAuctions.length : 0
  
  const priceAppreciation = completedAuctions.map(a => ({
    growth: ((a.finalPrice - a.startPrice) / a.startPrice * 100).toFixed(2)
  }))
  const avgPriceGrowth = priceAppreciation.length > 0 
    ? priceAppreciation.reduce((sum, p) => sum + parseFloat(p.growth), 0) / priceAppreciation.length 
    : 0

  const revenueOverTime = completedAuctions
    .sort((a, b) => a.endTime - b.endTime)
    .map((auction, idx) => ({
      name: `Auction ${idx + 1}`,
      revenue: auction.finalPrice,
      bids: auction.totalBids,
      date: new Date(auction.endTime).toLocaleDateString(),
      symbol: auction.tokenSymbol
    }))

  const tokenPerformance = completedAuctions.reduce((acc, auction) => {
    if (!acc[auction.tokenSymbol]) {
      acc[auction.tokenSymbol] = {
        symbol: auction.tokenSymbol,
        count: 0,
        totalRevenue: 0,
        avgPrice: 0,
        totalBids: 0
      }
    }
    acc[auction.tokenSymbol].count++
    acc[auction.tokenSymbol].totalRevenue += auction.finalPrice
    acc[auction.tokenSymbol].totalBids += auction.totalBids
    return acc
  }, {} as Record<string, any>)

  const tokenPerformanceData = Object.values(tokenPerformance).map((tp: any) => ({
    ...tp,
    avgPrice: tp.totalRevenue / tp.count
  }))

  const bidDistribution = [
    { name: '0-5 bids', value: completedAuctions.filter(a => a.totalBids <= 5).length },
    { name: '6-10 bids', value: completedAuctions.filter(a => a.totalBids > 5 && a.totalBids <= 10).length },
    { name: '11-20 bids', value: completedAuctions.filter(a => a.totalBids > 10 && a.totalBids <= 20).length },
    { name: '21+ bids', value: completedAuctions.filter(a => a.totalBids > 20).length }
  ]

  const engagementData = completedAuctions.map((auction, idx) => ({
    name: auction.tokenSymbol,
    views: auction.views || 0,
    bids: auction.totalBids,
    watchlist: auction.watchlist || 0,
    conversionRate: auction.views > 0 ? ((auction.totalBids / auction.views) * 100).toFixed(1) : 0
  }))

  const topPerformers = [...completedAuctions]
    .sort((a, b) => b.finalPrice - a.finalPrice)
    .slice(0, 5)

  const mostActiveTokens = [...tokenPerformanceData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Auction Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive performance metrics and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CurrencyDollar className="h-5 w-5 text-accent" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendUp className="h-3 w-3 text-green-500" weight="bold" />
              <span className="text-green-500">+{avgPriceGrowth.toFixed(1)}%</span> avg growth
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Auctions</CardTitle>
            <Gavel className="h-5 w-5 text-primary" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auctionsList.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {completedAuctions.length} completed
              </Badge>
              <Badge variant="default" className="text-xs px-1.5 py-0">
                {activeAuctionsCount} active
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <Fire className="h-5 w-5 text-secondary" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBids.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgBidsPerAuction.toFixed(1)} avg per auction
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Bidders</CardTitle>
            <Users className="h-5 w-5 text-accent" weight="duotone" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueBidders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active participants
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card/80 backdrop-blur">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartLine weight="duotone" />
                  Revenue Over Time
                </CardTitle>
                <CardDescription>Track auction revenue progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueOverTime}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.45 0.15 300)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="oklch(0.45 0.15 300)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.03 280)',
                        borderRadius: '0.75rem'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="oklch(0.45 0.15 300)" 
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fire weight="duotone" />
                  Bid Activity
                </CardTitle>
                <CardDescription>Total bids per auction</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.03 280)',
                        borderRadius: '0.75rem'
                      }}
                    />
                    <Bar dataKey="bids" fill="oklch(0.55 0.20 250)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins weight="duotone" />
                Bid Distribution
              </CardTitle>
              <CardDescription>Auction activity segmentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bidDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bidDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.03 280)',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-col justify-center space-y-4">
                  {bidDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value} auctions</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Final Price</CardTitle>
                <CurrencyDollar className="h-5 w-5 text-primary" weight="duotone" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${avgFinalPrice.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Per auction</p>
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Price Growth</CardTitle>
                <TrendUp className="h-5 w-5 text-green-500" weight="duotone" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">+{avgPriceGrowth.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">From start price</p>
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Trophy className="h-5 w-5 text-accent" weight="duotone" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {auctionsList.length > 0 ? ((completedAuctions.length / auctionsList.length) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine weight="duotone" />
                Price Appreciation Analysis
              </CardTitle>
              <CardDescription>Start vs final prices for each auction</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={completedAuctions.map((a, idx) => ({
                  name: a.tokenSymbol,
                  startPrice: a.startPrice,
                  finalPrice: a.finalPrice,
                  growth: ((a.finalPrice - a.startPrice) / a.startPrice * 100).toFixed(1)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(1 0 0)', 
                      border: '1px solid oklch(0.88 0.03 280)',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="startPrice" fill="oklch(0.70 0.18 200)" name="Start Price" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="finalPrice" fill="oklch(0.45 0.15 300)" name="Final Price" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye weight="duotone" />
                Engagement Metrics
              </CardTitle>
              <CardDescription>Views, bids, and watchlist activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(1 0 0)', 
                      border: '1px solid oklch(0.88 0.03 280)',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="oklch(0.70 0.18 200)" name="Views" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="bids" fill="oklch(0.45 0.15 300)" name="Bids" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="watchlist" fill="oklch(0.55 0.20 250)" name="Watchlist" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Views to bids conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${Math.min(parseFloat(item.conversionRate as string), 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-primary">{item.conversionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Metrics</CardTitle>
                <CardDescription>Per auction averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Avg Views</span>
                    <span className="text-lg font-bold text-primary">
                      {(engagementData.reduce((sum, e) => sum + e.views, 0) / Math.max(engagementData.length, 1)).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Avg Bids</span>
                    <span className="text-lg font-bold text-secondary">
                      {avgBidsPerAuction.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Avg Watchlist</span>
                    <span className="text-lg font-bold text-accent">
                      {(engagementData.reduce((sum, e) => sum + e.watchlist, 0) / Math.max(engagementData.length, 1)).toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins weight="duotone" />
                Token Performance
              </CardTitle>
              <CardDescription>Revenue and activity by token type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tokenPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="symbol" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(1 0 0)', 
                      border: '1px solid oklch(0.88 0.03 280)',
                      borderRadius: '0.75rem'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="oklch(0.45 0.15 300)" name="Total Revenue" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avgPrice" fill="oklch(0.70 0.18 200)" name="Avg Price" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Token Auction Counts</CardTitle>
                <CardDescription>Number of auctions per token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tokenPerformanceData.map((token, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                      <Badge variant="secondary">{token.count} auctions</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Bids by Token</CardTitle>
                <CardDescription>Bidding activity breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tokenPerformanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ symbol, totalBids }) => `${symbol}: ${totalBids}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalBids"
                    >
                      {tokenPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.03 280)',
                        borderRadius: '0.75rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy weight="duotone" className="text-accent" />
                  Top Performing Auctions
                </CardTitle>
                <CardDescription>Highest revenue generators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.map((auction, idx) => (
                    <div 
                      key={auction.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold
                          ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : ''}
                          ${idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : ''}
                          ${idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : ''}
                          ${idx > 2 ? 'bg-muted text-muted-foreground' : ''}
                        `}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{auction.tokenSymbol}</div>
                          <div className="text-xs text-muted-foreground">{auction.totalBids} bids</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">${auction.finalPrice}</div>
                        <div className="text-xs text-green-500 flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" weight="bold" />
                          {((auction.finalPrice - auction.startPrice) / auction.startPrice * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fire weight="duotone" className="text-secondary" />
                  Most Active Tokens
                </CardTitle>
                <CardDescription>By auction frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mostActiveTokens.map((token, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{token.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            ${token.totalRevenue.toLocaleString()} total
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-sm">
                          {token.count} auctions
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          ${token.avgPrice.toFixed(2)} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key metrics and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendUp className="h-5 w-5 text-green-500" weight="duotone" />
                    <span className="font-semibold text-green-700">Strong Performance</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {avgPriceGrowth.toFixed(1)}% average price appreciation</li>
                    <li>• {totalUniqueBidders} active bidders in ecosystem</li>
                    <li>• ${totalRevenue.toLocaleString()} total revenue generated</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartLine className="h-5 w-5 text-blue-500" weight="duotone" />
                    <span className="font-semibold text-blue-700">Opportunities</span>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Increase auction frequency for top tokens</li>
                    <li>• Optimize starting prices based on trends</li>
                    <li>• Promote auctions with low engagement</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
