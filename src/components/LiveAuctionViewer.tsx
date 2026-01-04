import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Gavel,
  Trophy,
  Clock,
  Users,
  TrendUp,
  CurrencyDollar,
  Eye,
  ChartLine,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth'
import { TokenAuction as Auction, AuctionBid } from '@/components/TokenAuction'
import { trackTokenMetric, TokenValueSnapshot } from '@/lib/tokenMetrics'

interface LiveAuctionViewerProps {
  showCreateForm?: boolean
}

export function LiveAuctionViewer({ showCreateForm = false }: LiveAuctionViewerProps) {
  const { userProfile, isAuthenticated, login } = useAuth()
  const [auctions, setAuctions] = useKV<Auction[]>('token-auctions', [])
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({})
  const [bidCurrency, setBidCurrency] = useState<Record<string, 'INF' | 'USD'>>({})
  const [tokenSnapshots, setTokenSnapshots] = useState<Record<string, TokenValueSnapshot>>({})
  const [expandedAuction, setExpandedAuction] = useState<string | null>(null)

  useEffect(() => {
    loadTokenValues()
    const interval = setInterval(loadTokenValues, 30000)
    return () => clearInterval(interval)
  }, [auctions])

  const loadTokenValues = async () => {
    const snapshots: Record<string, TokenValueSnapshot> = {}
    
    for (const auction of auctions || []) {
      const snapshotList = await window.spark.kv.get<TokenValueSnapshot[]>(`token-snapshots-${auction.tokenSymbol}`)
      if (snapshotList && snapshotList.length > 0) {
        snapshots[auction.tokenSymbol] = snapshotList[snapshotList.length - 1]
      }
    }
    
    setTokenSnapshots(snapshots)
  }

  const handlePlaceBid = async (auction: Auction) => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to place a bid')
      await login()
      return
    }

    const bid = parseFloat(bidAmount[auction.id] || '0')
    const currency = bidCurrency[auction.id] || 'INF'

    if (isNaN(bid) || bid <= 0) {
      toast.error('Please enter a valid bid amount')
      return
    }

    const minimumBid = auction.currentBid + 0.01
    if (bid < minimumBid) {
      toast.error(`Bid must be at least $${minimumBid.toFixed(2)}`)
      return
    }

    if (auction.creatorId === userProfile.userId) {
      toast.error('Cannot bid on your own auction')
      return
    }

    try {
      const bidEntry: AuctionBid = {
        bidId: `bid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        auctionId: auction.id,
        bidderId: userProfile.userId,
        bidderUsername: userProfile.username,
        bidderAvatar: userProfile.avatarUrl,
        amount: bid,
        currency,
        timestamp: Date.now()
      }

      setAuctions((currentAuctions) =>
        (currentAuctions || []).map(a =>
          a.id === auction.id
            ? {
                ...a,
                currentBid: bid,
                bids: [...a.bids, bidEntry]
              }
            : a
        )
      )

      if (userProfile.userId) {
        await trackTokenMetric(auction.tokenSymbol, 'bid', userProfile.userId, bid, {
          auctionId: auction.id
        })
      }

      toast.success(`Bid placed: $${bid.toFixed(2)} ${currency}`, {
        description: 'You will be notified if outbid'
      })

      setBidAmount(prev => ({ ...prev, [auction.id]: '' }))
    } catch (error) {
      toast.error('Failed to place bid')
      console.error('Bid error:', error)
    }
  }

  const handleViewAuction = async (auction: Auction) => {
    if (userProfile?.userId) {
      await trackTokenMetric(auction.tokenSymbol, 'view', userProfile.userId, 1, {
        auctionId: auction.id
      })
    }
    setExpandedAuction(expandedAuction === auction.id ? null : auction.id)
  }

  const activeAuctions = (auctions || []).filter(a => a.status === 'active')
  const endedAuctions = (auctions || []).filter(a => a.status === 'ended')

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now()
    if (remaining <= 0) return 'Ended'
    
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Gavel size={36} weight="duotone" className="text-accent" />
                Live Token Auctions
              </CardTitle>
              <CardDescription className="mt-2">
                Bid with USD or INF tokens • Real-time value tracking • Instant notifications
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              <Sparkle size={20} weight="fill" className="mr-2" />
              {activeAuctions.length} Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="text-lg">
                Active Auctions ({activeAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="ended" className="text-lg">
                Ended Auctions ({endedAuctions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeAuctions.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <Gavel size={64} weight="duotone" className="mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">No Active Auctions</h3>
                    <p className="text-muted-foreground">
                      Be the first to create an auction and start earning!
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="grid gap-4 pr-4">
                    {activeAuctions.map(auction => {
                      const snapshot = tokenSnapshots[auction.tokenSymbol]
                      const isExpanded = expandedAuction === auction.id
                      const tokenRealValue = snapshot ? snapshot.totalValue : auction.startingBid
                      const valueIncrease = snapshot ? ((snapshot.totalValue - snapshot.baseValue) / snapshot.baseValue * 100) : 0

                      return (
                        <Card
                          key={auction.id}
                          className="bg-gradient-to-br from-card via-card to-accent/5 border-2 border-accent/20 hover:border-accent/40 transition-all cursor-pointer"
                          onClick={() => handleViewAuction(auction)}
                        >
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="default" className="text-lg px-3 py-1">
                                    {auction.tokenSymbol}
                                  </Badge>
                                  {snapshot && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <TrendUp size={14} weight="bold" />
                                      +{valueIncrease.toFixed(1)}% from metrics
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{auction.tokenName}</h3>
                                <p className="text-muted-foreground">
                                  {auction.amount.toLocaleString()} tokens • by {auction.creatorUsername}
                                </p>
                                {auction.description && (
                                  <p className="text-sm mt-2 text-muted-foreground">{auction.description}</p>
                                )}
                              </div>

                              <div className="text-right space-y-2">
                                <div>
                                  <div className="text-sm text-muted-foreground">Current Bid</div>
                                  <div className="text-3xl font-bold text-accent">
                                    ${auction.currentBid.toFixed(2)}
                                  </div>
                                </div>
                                {snapshot && (
                                  <div>
                                    <div className="text-xs text-muted-foreground">Real Token Value</div>
                                    <div className="text-lg font-semibold flex items-center gap-1">
                                      <ChartLine size={16} weight="duotone" />
                                      ${tokenRealValue.toFixed(4)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-4 gap-4 text-center">
                              <div>
                                <Clock size={20} weight="duotone" className="mx-auto mb-1 text-muted-foreground" />
                                <div className="text-sm font-semibold">{formatTimeRemaining(auction.endTime)}</div>
                                <div className="text-xs text-muted-foreground">Remaining</div>
                              </div>
                              <div>
                                <Users size={20} weight="duotone" className="mx-auto mb-1 text-muted-foreground" />
                                <div className="text-sm font-semibold">{auction.bids.length}</div>
                                <div className="text-xs text-muted-foreground">Bids</div>
                              </div>
                              <div>
                                <Eye size={20} weight="duotone" className="mx-auto mb-1 text-muted-foreground" />
                                <div className="text-sm font-semibold">{snapshot?.viewCount || 0}</div>
                                <div className="text-xs text-muted-foreground">Views</div>
                              </div>
                              <div>
                                <Trophy size={20} weight="duotone" className="mx-auto mb-1 text-muted-foreground" />
                                <div className="text-sm font-semibold">
                                  {auction.bids.length > 0 ? auction.bids[auction.bids.length - 1].bidderUsername : 'None'}
                                </div>
                                <div className="text-xs text-muted-foreground">Leader</div>
                              </div>
                            </div>

                            {isExpanded && (
                              <>
                                <Separator />
                                
                                {snapshot && (
                                  <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <ChartLine size={20} weight="duotone" />
                                      Real-Time Token Metrics
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>Base Value: ${snapshot.baseValue.toFixed(4)}</div>
                                      <div>Metrics Value: +${snapshot.metricValue.toFixed(4)}</div>
                                      <div>Clicks: {snapshot.clickCount.toLocaleString()}</div>
                                      <div>Active Users: {snapshot.activeUsers}</div>
                                    </div>
                                  </div>
                                )}

                                {!isAuthenticated ? (
                                  <Button onClick={login} size="lg" className="w-full">
                                    Log In to Bid
                                  </Button>
                                ) : auction.creatorId !== userProfile?.userId ? (
                                  <div className="space-y-3">
                                    <div className="flex gap-2">
                                      <div className="flex-1 space-y-2">
                                        <Label htmlFor={`bid-${auction.id}`}>Your Bid</Label>
                                        <Input
                                          id={`bid-${auction.id}`}
                                          type="number"
                                          step="0.01"
                                          min={auction.currentBid + 0.01}
                                          placeholder={`Min: $${(auction.currentBid + 0.01).toFixed(2)}`}
                                          value={bidAmount[auction.id] || ''}
                                          onChange={(e) => setBidAmount(prev => ({ ...prev, [auction.id]: e.target.value }))}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <div className="flex gap-2">
                                          <Button
                                            variant={bidCurrency[auction.id] === 'INF' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setBidCurrency(prev => ({ ...prev, [auction.id]: 'INF' }))
                                            }}
                                          >
                                            INF
                                          </Button>
                                          <Button
                                            variant={bidCurrency[auction.id] === 'USD' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setBidCurrency(prev => ({ ...prev, [auction.id]: 'USD' }))
                                            }}
                                          >
                                            <CurrencyDollar size={16} weight="bold" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePlaceBid(auction)
                                      }}
                                      size="lg"
                                      className="w-full bg-gradient-to-r from-accent to-primary"
                                    >
                                      <Gavel size={20} weight="duotone" className="mr-2" />
                                      Place Bid
                                    </Button>
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="w-full justify-center py-2">
                                    Your Auction
                                  </Badge>
                                )}

                                {auction.bids.length > 0 && (
                                  <>
                                    <Separator />
                                    <div>
                                      <h4 className="font-semibold mb-3">Bid History</h4>
                                      <ScrollArea className="h-[200px]">
                                        <div className="space-y-2">
                                          {[...auction.bids].reverse().map((bid, idx) => (
                                            <div
                                              key={bid.bidId}
                                              className={`flex items-center justify-between p-3 rounded-lg ${
                                                idx === 0 ? 'bg-accent/20 border border-accent' : 'bg-muted/50'
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                {idx === 0 && <Trophy size={20} weight="fill" className="text-accent" />}
                                                <div>
                                                  <div className="font-semibold">{bid.bidderUsername}</div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {new Date(bid.timestamp).toLocaleString()}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="font-bold">${bid.amount.toFixed(2)}</div>
                                                <div className="text-xs text-muted-foreground">{bid.currency}</div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="ended" className="space-y-4">
              {endedAuctions.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <Trophy size={64} weight="duotone" className="mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">No Ended Auctions</h3>
                    <p className="text-muted-foreground">
                      Completed auctions will appear here
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="grid gap-4 pr-4">
                    {endedAuctions.map(auction => (
                      <Card key={auction.id} className="opacity-70">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="secondary" className="mb-2">{auction.tokenSymbol}</Badge>
                              <h3 className="text-xl font-bold">{auction.tokenName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {auction.amount.toLocaleString()} tokens
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Final Price</div>
                              <div className="text-2xl font-bold">${auction.currentBid.toFixed(2)}</div>
                              {auction.winnerUsername && (
                                <div className="flex items-center gap-1 text-sm mt-1">
                                  <Trophy size={16} weight="fill" className="text-amber-500" />
                                  {auction.winnerUsername}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
