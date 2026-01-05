import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendUp, TrendDown, ChartLine, Users, Eye, CursorClick, ArrowsLeftRight, Gavel } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  TokenMetric, 
  TokenValueSnapshot, 
  calculateTokenValueFromMetrics, 
  getTokenGrowthRate, 
  generateValueHistory,
  trackTokenMetric 
} from '@/lib/tokenMetrics'

interface MetricsDashboardProps {
  tokenSymbol?: string
  showAllTokens?: boolean
}

export function TokenMetricsDashboard({ tokenSymbol, showAllTokens = false }: MetricsDashboardProps) {
  const { userProfile } = useAuth()
  const [allTokens] = useKV<Record<string, any>>('business-tokens', {})
  const [selectedToken, setSelectedToken] = useState(tokenSymbol || 'INF')
  const [metrics, setMetrics] = useState<TokenMetric[]>([])
  const [snapshots, setSnapshots] = useState<TokenValueSnapshot[]>([])
  const [currentSnapshot, setCurrentSnapshot] = useState<TokenValueSnapshot | null>(null)
  const [previousSnapshot, setPreviousSnapshot] = useState<TokenValueSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [selectedToken])

  const loadMetrics = async () => {
    setIsLoading(true)
    try {
      const loadedMetrics = await window.spark.kv.get<TokenMetric[]>(`token-metrics-${selectedToken}`) || []
      const loadedSnapshots = await window.spark.kv.get<TokenValueSnapshot[]>(`token-snapshots-${selectedToken}`) || []
      
      setMetrics(loadedMetrics)
      setSnapshots(loadedSnapshots)
      
      if (loadedSnapshots.length > 0) {
        setCurrentSnapshot(loadedSnapshots[loadedSnapshots.length - 1])
        if (loadedSnapshots.length > 1) {
          setPreviousSnapshot(loadedSnapshots[loadedSnapshots.length - 2])
        }
      } else if (loadedMetrics.length > 0) {
        const tokens = await window.spark.kv.get<Record<string, any>>('business-tokens') || {}
        const tokenData = tokens[selectedToken]
        const baseValue = tokenData?.initialPrice || 1.0
        const snapshot = calculateTokenValueFromMetrics(loadedMetrics, baseValue)
        setCurrentSnapshot(snapshot)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenClick = async () => {
    if (userProfile?.userId) {
      await trackTokenMetric(selectedToken, 'click', userProfile.userId, 1)
      await loadMetrics()
    }
  }

  const growthRate = currentSnapshot && previousSnapshot 
    ? getTokenGrowthRate(currentSnapshot, previousSnapshot)
    : 0

  const chartData = snapshots.map(snapshot => ({
    time: new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: parseFloat(snapshot.totalValue.toFixed(4)),
    baseValue: parseFloat(snapshot.baseValue.toFixed(4)),
    metricValue: parseFloat(snapshot.metricValue.toFixed(4)),
  }))

  const metricsBreakdown = currentSnapshot ? [
    { name: 'Clicks', value: currentSnapshot.clickCount, color: '#8b5cf6' },
    { name: 'Views', value: currentSnapshot.viewCount, color: '#06b6d4' },
    { name: 'Transfers', value: currentSnapshot.transferCount, color: '#10b981' },
    { name: 'Bids', value: currentSnapshot.bidCount, color: '#f59e0b' },
  ] : []

  const tokenList = Object.keys(allTokens || {}).filter(symbol => {
    if (showAllTokens) return true
    return symbol === 'INF' || (userProfile?.businessTokens?.[symbol] || 0) > 0
  })

  return (
    <div className="space-y-6">
      <Card className="gradient-border bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <ChartLine size={36} weight="duotone" className="text-accent" />
                Real-Time Token Metrics
              </CardTitle>
              <CardDescription className="mt-2">
                Live tracking of token value based on actual user engagement
              </CardDescription>
            </div>
            
            {tokenList.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {tokenList.map(symbol => (
                  <Button
                    key={symbol}
                    variant={selectedToken === symbol ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedToken(symbol)}
                  >
                    {symbol}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentSnapshot ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CursorClick size={20} weight="duotone" />
                        <span className="text-sm">Total Clicks</span>
                      </div>
                      <div className="text-3xl font-bold">{currentSnapshot.clickCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        +{(currentSnapshot.clickCount * 0.01).toFixed(2)} value
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye size={20} weight="duotone" />
                        <span className="text-sm">Total Views</span>
                      </div>
                      <div className="text-3xl font-bold">{currentSnapshot.viewCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        +{(currentSnapshot.viewCount * 0.005).toFixed(2)} value
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ArrowsLeftRight size={20} weight="duotone" />
                        <span className="text-sm">Transfers</span>
                      </div>
                      <div className="text-3xl font-bold">{currentSnapshot.transferCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        +{(currentSnapshot.transferCount * 0.5).toFixed(2)} value
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Gavel size={20} weight="duotone" />
                        <span className="text-sm">Auction Bids</span>
                      </div>
                      <div className="text-3xl font-bold">{currentSnapshot.bidCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        ${currentSnapshot.tradeVolume.toFixed(2)} volume
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users size={20} weight="duotone" />
                        <span className="text-sm">Active Users</span>
                      </div>
                      <div className="text-3xl font-bold">{currentSnapshot.activeUsers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Network effect: +{(Math.log10(currentSnapshot.activeUsers + 1) * 0.5).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-accent/20 to-accent/5">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Current Token Value</div>
                      <div className="text-4xl font-bold flex items-center gap-2">
                        ${currentSnapshot.totalValue.toFixed(4)}
                        {growthRate !== 0 && (
                          <Badge variant={growthRate > 0 ? 'default' : 'destructive'} className="text-xs">
                            {growthRate > 0 ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                            {Math.abs(growthRate).toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Base: ${currentSnapshot.baseValue.toFixed(4)}</div>
                        <div className="text-accent font-semibold">Metrics: +${currentSnapshot.metricValue.toFixed(4)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-4">Value Composition</div>
                    <div className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricsBreakdown} layout="vertical">
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {chartData.length > 1 && (
                <>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Value Growth Over Time</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                            formatter={(value: number) => `$${value.toFixed(4)}`}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8b5cf6" 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            name="Total Value"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="metricValue" 
                            stroke="#06b6d4" 
                            fillOpacity={1} 
                            fill="url(#colorMetric)" 
                            name="Metrics Value"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="baseValue" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={false}
                            name="Base Value"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-center">
                <Button
                  onClick={handleTokenClick}
                  size="lg"
                  className="bg-gradient-to-r from-accent to-primary hover:from-accent/80 hover:to-primary/80"
                >
                  <CursorClick size={20} weight="duotone" className="mr-2" />
                  Click to Increase {selectedToken} Value
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                Every interaction increases token value • Click tracking is real-time • Values update every 30 seconds
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-4">
              <ChartLine size={64} weight="duotone" className="mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No Metrics Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start interacting with {selectedToken} tokens to see real-time value growth
                </p>
                <Button onClick={handleTokenClick}>
                  Generate First Metric
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
