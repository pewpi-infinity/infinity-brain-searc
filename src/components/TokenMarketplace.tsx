import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Storefront, 
  TrendUp, 
  TrendDown, 
  ShoppingCart, 
  Tag,
  Coins,
  ChartLine,
  Plus,
  Check,
  X,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth'
import { Transaction } from './TransactionHistory'
import { TokenPriceChart } from './TokenPriceChart'
import { trackTokenMetric } from '@/lib/tokenMetrics'

export interface MarketOrder {
  id: string
  orderType: 'buy' | 'sell'
  tokenSymbol: string
  amount: number
  pricePerToken: number
  totalValue: number
  tradePairSymbol: string
  creatorId: string
  creatorUsername: string
  status: 'open' | 'filled' | 'cancelled' | 'partial'
  filledAmount: number
  createdAt: number
  expiresAt?: number
}

interface OrderBookEntry {
  price: number
  amount: number
  total: number
  orders: number
}

export function TokenMarketplace() {
  const { userProfile, isAuthenticated } = useAuth()
  const [marketOrders, setMarketOrders] = useKV<MarketOrder[]>('market-orders', [])
  const [allTransactions, setAllTransactions] = useKV<Transaction[]>('all-transactions', [])
  const [userProfiles, setUserProfiles] = useKV<Record<string, any>>('all-user-profiles', {})
  const [allTokens] = useKV<Record<string, any>>('business-tokens', {})
  
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [selectedToken, setSelectedToken] = useState('')
  const [tradePairToken, setTradePairToken] = useState('INF')
  const [orderAmount, setOrderAmount] = useState('')
  const [pricePerToken, setPricePerToken] = useState('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [selectedOrderView, setSelectedOrderView] = useState<string>('')

  if (!isAuthenticated || !userProfile) {
    return (
      <Card className="p-8 text-center">
        <Storefront size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-2xl font-bold mb-2">Token Exchange Marketplace</h3>
        <p className="text-muted-foreground mb-4">
          Please log in to access the marketplace
        </p>
      </Card>
    )
  }

  const availableTokens = Object.keys(allTokens || {}).filter(symbol => symbol !== 'INF')
  const userTokens = Object.keys(userProfile.businessTokens).filter(
    symbol => userProfile.businessTokens[symbol] > 0
  )

  const openOrders = (marketOrders || []).filter(order => order.status === 'open')
  const userOrders = (marketOrders || []).filter(
    order => order.creatorId === userProfile.userId
  ).sort((a, b) => b.createdAt - a.createdAt)

  const handleCreateOrder = async () => {
    if (!selectedToken || !orderAmount || !pricePerToken) {
      toast.error('Please fill in all fields')
      return
    }

    const amount = parseFloat(orderAmount)
    const price = parseFloat(pricePerToken)

    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
      toast.error('Invalid amount or price')
      return
    }

    if (orderType === 'sell') {
      const currentBalance = userProfile.businessTokens[selectedToken] || 0
      if (amount > currentBalance) {
        toast.error(`Insufficient ${selectedToken} balance`)
        return
      }
    } else {
      const totalCost = amount * price
      const infBalance = userProfile.businessTokens[tradePairToken] || 0
      if (totalCost > infBalance) {
        toast.error(`Insufficient ${tradePairToken} balance`)
        return
      }
    }

    setIsCreatingOrder(true)

    try {
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newOrder: MarketOrder = {
        id: orderId,
        orderType,
        tokenSymbol: selectedToken,
        amount,
        pricePerToken: price,
        totalValue: amount * price,
        tradePairSymbol: tradePairToken,
        creatorId: userProfile.userId,
        creatorUsername: userProfile.username,
        status: 'open',
        filledAmount: 0,
        createdAt: Date.now()
      }

      setMarketOrders((currentOrders) => [...(currentOrders || []), newOrder])

      toast.success(
        `${orderType === 'buy' ? 'Buy' : 'Sell'} order created for ${amount} ${selectedToken} at ${price} ${tradePairToken} each`
      )

      setOrderAmount('')
      setPricePerToken('')
    } catch (error) {
      toast.error('Failed to create order')
      console.error('Order creation error:', error)
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleFillOrder = async (order: MarketOrder) => {
    if (!userProfile) return

    if (order.creatorId === userProfile.userId) {
      toast.error('Cannot fill your own order')
      return
    }

    if (order.orderType === 'sell') {
      const totalCost = order.amount * order.pricePerToken
      const buyerBalance = userProfile.businessTokens[order.tradePairSymbol] || 0
      if (totalCost > buyerBalance) {
        toast.error(`Insufficient ${order.tradePairSymbol} balance`)
        return
      }
    } else {
      const sellerBalance = userProfile.businessTokens[order.tokenSymbol] || 0
      if (order.amount > sellerBalance) {
        toast.error(`Insufficient ${order.tokenSymbol} balance`)
        return
      }
    }

    try {
      const creator = userProfiles?.[order.creatorId]
      if (!creator) {
        toast.error('Order creator not found')
        return
      }

      const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      if (order.orderType === 'sell') {
        const buyerInfBalance = userProfile.businessTokens[order.tradePairSymbol] || 0
        const buyerTokenBalance = userProfile.businessTokens[order.tokenSymbol] || 0
        const sellerInfBalance = creator.businessTokens[order.tradePairSymbol] || 0
        const sellerTokenBalance = creator.businessTokens[order.tokenSymbol] || 0

        const totalCost = order.amount * order.pricePerToken

        setUserProfiles((currentProfiles) => ({
          ...(currentProfiles || {}),
          [userProfile.userId]: {
            ...userProfile,
            businessTokens: {
              ...userProfile.businessTokens,
              [order.tradePairSymbol]: buyerInfBalance - totalCost,
              [order.tokenSymbol]: buyerTokenBalance + order.amount
            }
          },
          [order.creatorId]: {
            ...creator,
            businessTokens: {
              ...creator.businessTokens,
              [order.tradePairSymbol]: sellerInfBalance + totalCost,
              [order.tokenSymbol]: sellerTokenBalance - order.amount
            }
          }
        }))
      } else {
        const sellerInfBalance = userProfile.businessTokens[order.tradePairSymbol] || 0
        const sellerTokenBalance = userProfile.businessTokens[order.tokenSymbol] || 0
        const buyerInfBalance = creator.businessTokens[order.tradePairSymbol] || 0
        const buyerTokenBalance = creator.businessTokens[order.tokenSymbol] || 0

        const totalCost = order.amount * order.pricePerToken

        setUserProfiles((currentProfiles) => ({
          ...(currentProfiles || {}),
          [userProfile.userId]: {
            ...userProfile,
            businessTokens: {
              ...userProfile.businessTokens,
              [order.tradePairSymbol]: sellerInfBalance + totalCost,
              [order.tokenSymbol]: sellerTokenBalance - order.amount
            }
          },
          [order.creatorId]: {
            ...creator,
            businessTokens: {
              ...creator.businessTokens,
              [order.tradePairSymbol]: buyerInfBalance - totalCost,
              [order.tokenSymbol]: buyerTokenBalance + order.amount
            }
          }
        }))
      }

      const transaction: Transaction = {
        id: transactionId,
        type: order.orderType === 'sell' ? 'receive' : 'send',
        tokenSymbol: order.tokenSymbol,
        amount: order.amount,
        from: order.orderType === 'sell' ? order.creatorId : userProfile.userId,
        fromUsername: order.orderType === 'sell' ? order.creatorUsername : userProfile.username,
        to: order.orderType === 'sell' ? userProfile.userId : order.creatorId,
        toUsername: order.orderType === 'sell' ? userProfile.username : order.creatorUsername,
        timestamp: Date.now(),
        status: 'completed',
        note: `Marketplace trade: ${order.amount} ${order.tokenSymbol} @ ${order.pricePerToken} ${order.tradePairSymbol}`
      }

      setAllTransactions((currentTransactions) => [
        ...(currentTransactions || []),
        transaction
      ])

      setMarketOrders((currentOrders) =>
        (currentOrders || []).map(o =>
          o.id === order.id
            ? { ...o, status: 'filled' as const, filledAmount: o.amount }
            : o
        )
      )

      const totalCost = order.amount * order.pricePerToken
      await trackTokenMetric(order.tokenSymbol, 'trade', userProfile.userId, totalCost, {
        tradeId: transactionId
      })

      toast.success(
        `Trade completed! ${order.orderType === 'sell' ? 'Bought' : 'Sold'} ${order.amount} ${order.tokenSymbol}`
      )
    } catch (error) {
      toast.error('Trade failed. Please try again.')
      console.error('Trade error:', error)
    }
  }

  const handleCancelOrder = (orderId: string) => {
    setMarketOrders((currentOrders) =>
      (currentOrders || []).map(o =>
        o.id === orderId && o.creatorId === userProfile.userId
          ? { ...o, status: 'cancelled' as const }
          : o
      )
    )
    toast.success('Order cancelled')
  }

  const getOrderBook = (tokenSymbol: string): { buyOrders: OrderBookEntry[], sellOrders: OrderBookEntry[] } => {
    const tokenOrders = openOrders.filter(o => o.tokenSymbol === tokenSymbol)
    
    const buyOrderMap = new Map<number, { amount: number, orders: number }>()
    const sellOrderMap = new Map<number, { amount: number, orders: number }>()

    tokenOrders.forEach(order => {
      const map = order.orderType === 'buy' ? buyOrderMap : sellOrderMap
      const existing = map.get(order.pricePerToken) || { amount: 0, orders: 0 }
      map.set(order.pricePerToken, {
        amount: existing.amount + order.amount,
        orders: existing.orders + 1
      })
    })

    const buyOrders = Array.from(buyOrderMap.entries())
      .map(([price, data]) => ({
        price,
        amount: data.amount,
        total: price * data.amount,
        orders: data.orders
      }))
      .sort((a, b) => b.price - a.price)

    const sellOrders = Array.from(sellOrderMap.entries())
      .map(([price, data]) => ({
        price,
        amount: data.amount,
        total: price * data.amount,
        orders: data.orders
      }))
      .sort((a, b) => a.price - b.price)

    return { buyOrders, sellOrders }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Token Exchange Marketplace
          </h2>
          <p className="text-muted-foreground">
            Buy and sell tokens in the decentralized exchange
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {openOrders.length} Active Orders
        </Badge>
      </div>

      <TokenPriceChart tokenSymbol={selectedOrderView || availableTokens[0]} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <Tabs value={selectedOrderView || availableTokens[0] || ''} onValueChange={setSelectedOrderView}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ChartLine size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold">Order Book</h3>
              </div>
              <TabsList className="grid grid-cols-4 h-auto">
                {availableTokens.slice(0, 4).map(symbol => (
                  <TabsTrigger key={symbol} value={symbol} className="text-xs font-mono">
                    {symbol}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {availableTokens.map(symbol => {
              const { buyOrders, sellOrders } = getOrderBook(symbol)
              const tokenOrders = openOrders.filter(o => o.tokenSymbol === symbol && o.status === 'open')

              return (
                <TabsContent key={symbol} value={symbol} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendUp size={18} weight="duotone" className="text-accent" />
                          <span className="font-bold text-sm">Buy Orders</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {buyOrders.reduce((sum, o) => sum + o.orders, 0)} orders
                        </Badge>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {buyOrders.length > 0 ? (
                            buyOrders.map((entry, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors border border-accent/20"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono font-bold text-accent">
                                    {entry.price.toFixed(2)} {tradePairToken}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {entry.orders} order{entry.orders > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Amount: {entry.amount.toLocaleString()} {symbol}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No buy orders
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendDown size={18} weight="duotone" className="text-destructive" />
                          <span className="font-bold text-sm">Sell Orders</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {sellOrders.reduce((sum, o) => sum + o.orders, 0)} orders
                        </Badge>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {sellOrders.length > 0 ? (
                            sellOrders.map((entry, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-colors border border-destructive/20"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono font-bold text-destructive">
                                    {entry.price.toFixed(2)} {tradePairToken}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {entry.orders} order{entry.orders > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Amount: {entry.amount.toLocaleString()} {symbol}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No sell orders
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold">All Open Orders</h4>
                      <Badge variant="secondary">{tokenOrders.length}</Badge>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {tokenOrders.length > 0 ? (
                          tokenOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={order.orderType === 'buy' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {order.orderType.toUpperCase()}
                                </Badge>
                                <div>
                                  <div className="font-mono font-bold text-sm">
                                    {order.amount.toLocaleString()} {order.tokenSymbol}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    @ {order.pricePerToken.toFixed(2)} {order.tradePairSymbol}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  by {order.creatorUsername}
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant={order.creatorId === userProfile.userId ? 'destructive' : 'default'}
                                    disabled={order.creatorId === userProfile.userId}
                                  >
                                    {order.creatorId === userProfile.userId ? (
                                      <>
                                        <X size={16} className="mr-1" />
                                        Cancel
                                      </>
                                    ) : (
                                      <>
                                        <Check size={16} className="mr-1" />
                                        Fill
                                      </>
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {order.creatorId === userProfile.userId ? 'Cancel Order' : 'Fill Order'}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Type:</span>
                                        <Badge variant={order.orderType === 'buy' ? 'default' : 'destructive'}>
                                          {order.orderType.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span className="font-mono font-bold">
                                          {order.amount.toLocaleString()} {order.tokenSymbol}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Price:</span>
                                        <span className="font-mono font-bold">
                                          {order.pricePerToken.toFixed(2)} {order.tradePairSymbol}
                                        </span>
                                      </div>
                                      <div className="flex justify-between border-t pt-2">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-mono font-bold">
                                          {order.totalValue.toFixed(2)} {order.tradePairSymbol}
                                        </span>
                                      </div>
                                    </div>
                                    {order.creatorId === userProfile.userId ? (
                                      <Button
                                        onClick={() => handleCancelOrder(order.id)}
                                        variant="destructive"
                                        className="w-full"
                                      >
                                        Cancel Order
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() => handleFillOrder(order)}
                                        className="w-full bg-gradient-to-r from-primary to-accent"
                                      >
                                        Confirm Trade
                                      </Button>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No open orders for this token
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 gradient-border">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Plus size={32} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Create Order</h3>
                  <p className="text-xs text-muted-foreground">Place buy or sell order</p>
                </div>
              </div>

              <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'buy' | 'sell')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-accent">
                    <TrendUp size={16} className="mr-1" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-destructive">
                    <TrendDown size={16} className="mr-1" />
                    Sell
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="order-token">Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger id="order-token">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.length > 0 ? (
                      availableTokens.map((symbol) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol}
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

              <div className="space-y-2">
                <Label htmlFor="order-amount">Amount</Label>
                <Input
                  id="order-amount"
                  type="number"
                  placeholder="0.00"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                />
                {selectedToken && orderType === 'sell' && (
                  <p className="text-xs text-muted-foreground">
                    Available: {(userProfile.businessTokens[selectedToken] || 0).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-price">Price per Token ({tradePairToken})</Label>
                <Input
                  id="order-price"
                  type="number"
                  placeholder="0.00"
                  value={pricePerToken}
                  onChange={(e) => setPricePerToken(e.target.value)}
                  step="0.01"
                />
              </div>

              {orderAmount && pricePerToken && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-mono font-bold">
                      {(parseFloat(orderAmount) * parseFloat(pricePerToken)).toFixed(2)} {tradePairToken}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateOrder}
                className={`w-full ${
                  orderType === 'buy'
                    ? 'bg-gradient-to-r from-accent to-primary'
                    : 'bg-gradient-to-r from-destructive to-secondary'
                }`}
                disabled={isCreatingOrder || availableTokens.length === 0}
              >
                <Tag size={20} weight="bold" className="mr-2" />
                {isCreatingOrder ? 'Creating...' : `Create ${orderType === 'buy' ? 'Buy' : 'Sell'} Order`}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart size={24} weight="duotone" className="text-primary" />
              <h3 className="text-lg font-bold">Your Orders</h3>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-lg bg-muted/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={order.orderType === 'buy' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {order.orderType.toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            order.status === 'open'
                              ? 'outline'
                              : order.status === 'filled'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {order.status === 'open' && <Clock size={12} className="mr-1" />}
                          {order.status === 'filled' && <Check size={12} className="mr-1" />}
                          {order.status === 'cancelled' && <X size={12} className="mr-1" />}
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm">
                        <div className="font-mono font-bold">
                          {order.amount.toLocaleString()} {order.tokenSymbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @ {order.pricePerToken.toFixed(2)} {order.tradePairSymbol}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                      {order.status === 'open' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelOrder(order.id)}
                          className="w-full text-xs"
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No orders yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
