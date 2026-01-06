import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { TrendUp, ChartLine, Infinity, CurrencyDollar } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TokenData {
  symbol: string
  name: string
  baseValue: number
  currentValue: number
  dataPoints: { time: string; value: number; volume: number }[]
  growthRate: number
  intelligence: number
}

export function InfinityTokenCharts() {
  const [tokens, setTokens] = useKV<TokenData[]>('infinity-tokens', [])
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)

  useEffect(() => {
    if (!tokens || tokens.length === 0) {
      initializeTokens()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      updateTokenValues()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [tokens])

  const initializeTokens = async () => {
    const now = new Date()
    const initialTokens: TokenData[] = [
      {
        symbol: 'INF',
        name: 'Infinity Token',
        baseValue: 100,
        currentValue: 100,
        dataPoints: generatePlateauData(100, 30),
        growthRate: 0.02,
        intelligence: 0.95
      },
      {
        symbol: 'MONGOOSE',
        name: 'Mongoose AI Token',
        baseValue: 50,
        currentValue: 50,
        dataPoints: generatePlateauData(50, 30),
        growthRate: 0.025,
        intelligence: 0.92
      },
      {
        symbol: 'QUANTUM',
        name: 'Quantum Token',
        baseValue: 75,
        currentValue: 75,
        dataPoints: generatePlateauData(75, 30),
        growthRate: 0.018,
        intelligence: 0.88
      },
      {
        symbol: 'NEURAL',
        name: 'Neural Network Token',
        baseValue: 120,
        currentValue: 120,
        dataPoints: generatePlateauData(120, 30),
        growthRate: 0.022,
        intelligence: 0.94
      }
    ]

    await setTokens(initialTokens)
    setSelectedToken(initialTokens[0])
    toast.success('📈 Infinity token charts initialized')
  }

  const generatePlateauData = (baseValue: number, points: number) => {
    const data: { time: string; value: number; volume: number }[] = []
    const now = Date.now()
    
    for (let i = points; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000)
      const date = new Date(timestamp)
      const daysSinceStart = points - i
      
      const growth = baseValue * (1 + (0.02 * daysSinceStart))
      const intelligence = Math.random() * 5
      const plateauValue = growth + intelligence
      
      data.push({
        time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(plateauValue * 100) / 100,
        volume: Math.round((Math.random() * 100000 + 50000))
      })
    }
    
    return data
  }

  const updateTokenValues = async () => {
    await setTokens((prevTokens) => 
      (prevTokens || []).map((token) => {
        const intelligenceGrowth = Math.random() * token.intelligence * 0.5
        const organicGrowth = token.currentValue * token.growthRate
        const plateauGrowth = Math.min(intelligenceGrowth, organicGrowth)
        
        const newValue = token.currentValue + plateauGrowth
        
        const newDataPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(newValue * 100) / 100,
          volume: Math.round((Math.random() * 100000 + 50000))
        }
        
        const updatedDataPoints = [...token.dataPoints.slice(-29), newDataPoint]
        
        return {
          ...token,
          currentValue: newValue,
          dataPoints: updatedDataPoints
        }
      })
    )
  }

  const calculateGrowth = (token: TokenData) => {
    const growthPercent = ((token.currentValue - token.baseValue) / token.baseValue) * 100
    return Math.round(growthPercent * 100) / 100
  }

  const calculateTotalVolume = (token: TokenData) => {
    return token.dataPoints.reduce((sum, point) => sum + point.volume, 0)
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
              <Infinity size={32} weight="duotone" className="animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Infinity Token Charts
                <Badge variant="secondary" className="bg-white/30 text-white border-0">
                  Plateau Growth
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Intelligent growth • Never declining • AI-powered value
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {(tokens || []).map((token) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all border-2 ${
                  selectedToken?.symbol === token.symbol
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                    : 'border-blue-200 hover:border-blue-400'
                }`}
                onClick={() => setSelectedToken(token)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl font-bold flex items-center gap-2">
                        {token.symbol}
                        <TrendUp size={18} weight="fill" className="text-green-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      +{calculateGrowth(token)}%
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Current</span>
                      <span className="font-bold text-blue-600">${token.currentValue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Base</span>
                      <span className="text-sm">${token.baseValue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Intelligence</span>
                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                        {(token.intelligence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="h-16 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={token.dataPoints.slice(-10)}>
                        <defs>
                          <linearGradient id={`gradient-${token.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          fill={`url(#gradient-${token.symbol})`}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedToken && (
          <motion.div
            key={selectedToken.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <CurrencyDollar size={28} weight="duotone" className="text-blue-600" />
                      {selectedToken.symbol} - {selectedToken.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Live plateau growth algorithm • Intelligence-driven value
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ${selectedToken.currentValue.toFixed(2)}
                    </div>
                    <Badge className="mt-2 bg-green-500 text-white">
                      <TrendUp size={14} weight="fill" className="mr-1" />
                      +{calculateGrowth(selectedToken)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs defaultValue="price" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="price">
                      <ChartLine size={16} weight="fill" className="mr-2" />
                      Price Chart
                    </TabsTrigger>
                    <TabsTrigger value="volume">
                      <TrendUp size={16} weight="fill" className="mr-2" />
                      Volume
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="price" className="mt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedToken.dataPoints}>
                          <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            domain={['dataMin - 5', 'dataMax + 5']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '2px solid #3b82f6',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            fill="url(#priceGradient)"
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mt-6">
                      <Card className="border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Base Value</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${selectedToken.baseValue.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedToken.currentValue.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {(selectedToken.growthRate * 100).toFixed(1)}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200">
                        <CardContent className="p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">AI Intelligence</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {(selectedToken.intelligence * 100).toFixed(0)}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="volume" className="mt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedToken.dataPoints}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '2px solid #06b6d4',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="volume" 
                            stroke="#06b6d4" 
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#06b6d4' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <Card className="border-blue-200 mt-6 bg-gradient-to-br from-cyan-50 to-blue-50">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Total Volume (30d)</div>
                            <div className="text-3xl font-bold text-cyan-600">
                              {calculateTotalVolume(selectedToken).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Avg Daily Volume</div>
                            <div className="text-3xl font-bold text-blue-600">
                              {Math.round(calculateTotalVolume(selectedToken) / 30).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Card className="border-blue-200 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                        <Infinity size={32} weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">Infinity Plateau Algorithm</h3>
                        <p className="text-blue-100 leading-relaxed">
                          Charts never go down, only slowly grow upward based on real intelligence data and organic engagement.
                          Each token's value increases through a combination of base growth rate ({(selectedToken.growthRate * 100).toFixed(1)}%) 
                          and AI intelligence factor ({(selectedToken.intelligence * 100).toFixed(0)}%), ensuring steady appreciation over time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
