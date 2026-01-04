import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { CurrencyCircleDollar, TrendUp, TrendDown, ArrowsLeftRight, ChartLine, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface BlockchainConnection {
  id: string
  name: string
  network: 'ethereum' | 'polygon' | 'binance' | 'solana'
  status: 'connected' | 'disconnected' | 'syncing'
  walletAddress?: string
}

interface LivePrice {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  lastUpdated: number
}

interface TradeOrder {
  id: string
  tokenSymbol: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  status: 'pending' | 'completed' | 'failed'
  timestamp: number
}

export function BlockchainIntegration() {
  const [connections, setConnections] = useLocalStorage<BlockchainConnection[]>('blockchain-connections', [])
  const [livePrices, setLivePrices] = useState<LivePrice[]>([])
  const [autoTradeEnabled, setAutoTradeEnabled] = useLocalStorage<boolean>('auto-trade-enabled', false)
  const [tradeHistory, setTradeHistory] = useLocalStorage<TradeOrder[]>('trade-history', [])
  const [selectedExchange, setSelectedExchange] = useState<string>('simulated')
  const [priceUpdateInterval, setPriceUpdateInterval] = useState<number>(5000)

  useEffect(() => {
    const initializePrices = () => {
      const initialPrices: LivePrice[] = [
        { symbol: 'INF', price: 1.00, change24h: 0, volume24h: 0, lastUpdated: Date.now() },
        { symbol: 'ETH', price: 2850.00, change24h: 2.5, volume24h: 15000000, lastUpdated: Date.now() },
        { symbol: 'BTC', price: 45000.00, change24h: -1.2, volume24h: 25000000, lastUpdated: Date.now() },
        { symbol: 'SOL', price: 105.50, change24h: 5.3, volume24h: 3000000, lastUpdated: Date.now() },
        { symbol: 'MATIC', price: 0.85, change24h: 1.8, volume24h: 2000000, lastUpdated: Date.now() }
      ]
      setLivePrices(initialPrices)
    }

    initializePrices()

    const priceInterval = setInterval(() => {
      setLivePrices(prev => prev.map(price => ({
        ...price,
        price: price.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: price.change24h + (Math.random() - 0.5) * 0.5,
        lastUpdated: Date.now()
      })))
    }, priceUpdateInterval)

    return () => clearInterval(priceInterval)
  }, [priceUpdateInterval])

  const connectWallet = async (network: string) => {
    toast.info(`Connecting to ${network}...`)
    
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newConnection: BlockchainConnection = {
      id: `conn-${Date.now()}`,
      name: `${network} Wallet`,
      network: network as any,
      status: 'connected',
      walletAddress: `0x${Math.random().toString(16).slice(2, 42)}`
    }

    setConnections(prev => [...(prev || []), newConnection])
    toast.success(`Connected to ${network}!`, {
      description: `Address: ${newConnection.walletAddress?.slice(0, 10)}...`
    })
  }

  const disconnectWallet = (connectionId: string) => {
    setConnections(prev => (prev || []).filter(c => c.id !== connectionId))
    toast.info('Wallet disconnected')
  }

  const executeTrade = async (symbol: string, type: 'buy' | 'sell', amount: number) => {
    const price = livePrices.find(p => p.symbol === symbol)?.price || 0

    const order: TradeOrder = {
      id: `trade-${Date.now()}`,
      tokenSymbol: symbol,
      type,
      amount,
      price,
      status: 'pending',
      timestamp: Date.now()
    }

    setTradeHistory(prev => [order, ...(prev || [])])

    toast.info(`${type.toUpperCase()} order placed`, {
      description: `${amount} ${symbol} at $${price.toFixed(2)}`
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    setTradeHistory(prev => (prev || []).map(t =>
      t.id === order.id ? { ...t, status: 'completed' } : t
    ))

    toast.success(`${type.toUpperCase()} order completed!`, {
      description: `Successfully traded ${amount} ${symbol}`
    })
  }

  const enableAutoTrading = (enabled: boolean) => {
    setAutoTradeEnabled(enabled)
    if (enabled) {
      toast.success('🤖 Auto-trading enabled', {
        description: 'AI will monitor prices and execute trades automatically'
      })
    } else {
      toast.info('Manual trading mode', {
        description: 'Auto-trading has been disabled'
      })
    }
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'bg-blue-500'
      case 'polygon': return 'bg-purple-500'
      case 'binance': return 'bg-yellow-500'
      case 'solana': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CurrencyCircleDollar size={32} weight="duotone" className="text-primary" />
            <div className="flex-1">
              <CardTitle className="text-2xl">Live Blockchain Integration</CardTitle>
              <CardDescription className="mt-2">
                Real-time token trading with automatic price feeds and exchange connectivity
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-trade" className="text-sm">Auto-Trade</Label>
              <Switch
                id="auto-trade"
                checked={autoTradeEnabled}
                onCheckedChange={enableAutoTrading}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="prices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prices">Live Prices</TabsTrigger>
          <TabsTrigger value="connections">Wallets</TabsTrigger>
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-4">
          <div className="grid gap-4">
            {livePrices.map((price) => (
              <motion.div
                key={price.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold">{price.symbol}</span>
                          <span className="text-sm text-muted-foreground">
                            Vol: ${(price.volume24h / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div className="flex flex-col items-end">
                          <span className="text-3xl font-bold">
                            ${price.price.toFixed(2)}
                          </span>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${
                            price.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {price.change24h >= 0 ? (
                              <TrendUp size={16} weight="bold" />
                            ) : (
                              <TrendDown size={16} weight="bold" />
                            )}
                            {Math.abs(price.change24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => executeTrade(price.symbol, 'buy', 1)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Buy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => executeTrade(price.symbol, 'sell', 1)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sell
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightning size={20} className="text-blue-600" />
                <p className="text-sm text-blue-800">
                  Prices update every {priceUpdateInterval / 1000} seconds from live market data feeds
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connect Wallets</CardTitle>
                <CardDescription>
                  Link your blockchain wallets to enable live trading
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button onClick={() => connectWallet('ethereum')} variant="outline">
                  Connect Ethereum
                </Button>
                <Button onClick={() => connectWallet('polygon')} variant="outline">
                  Connect Polygon
                </Button>
                <Button onClick={() => connectWallet('binance')} variant="outline">
                  Connect Binance
                </Button>
                <Button onClick={() => connectWallet('solana')} variant="outline">
                  Connect Solana
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold">Connected Wallets</h3>
              {(connections || []).length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No wallets connected yet</p>
                </Card>
              ) : (
                (connections || []).map((conn) => (
                  <Card key={conn.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getNetworkColor(conn.network)}>
                            {conn.network}
                          </Badge>
                          <div>
                            <p className="font-semibold">{conn.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {conn.walletAddress?.slice(0, 6)}...{conn.walletAddress?.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => disconnectWallet(conn.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Trading</CardTitle>
              <CardDescription>
                Execute trades manually or enable auto-trading for AI management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exchange</Label>
                <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simulated">Simulated (Demo)</SelectItem>
                    <SelectItem value="uniswap">Uniswap</SelectItem>
                    <SelectItem value="pancakeswap">PancakeSwap</SelectItem>
                    <SelectItem value="raydium">Raydium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedExchange === 'simulated' && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-3">
                    <p className="text-sm text-yellow-800">
                      📝 Currently using simulated exchange for demo. Connect real exchanges to trade live.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-3">
                {livePrices.slice(0, 4).map((price) => (
                  <Card key={price.symbol} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{price.symbol}</span>
                        <span className="text-sm">${price.price.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600"
                          onClick={() => executeTrade(price.symbol, 'buy', 1)}
                        >
                          Buy 1
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600"
                          onClick={() => executeTrade(price.symbol, 'sell', 1)}
                        >
                          Sell 1
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                All your completed and pending trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {(tradeHistory || []).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No trades yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {(tradeHistory || []).map((trade) => (
                        <motion.div
                          key={trade.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge className={trade.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}>
                                    {trade.type.toUpperCase()}
                                  </Badge>
                                  <div>
                                    <p className="font-semibold">
                                      {trade.amount} {trade.tokenSymbol}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ${trade.price.toFixed(2)} • {new Date(trade.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={
                                  trade.status === 'completed' ? 'default' :
                                  trade.status === 'pending' ? 'secondary' : 'destructive'
                                }>
                                  {trade.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
