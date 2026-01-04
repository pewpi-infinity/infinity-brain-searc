import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  Eye,
  EyeSlash,
  Clock,
  TrendUp,
  Users,
  Star,
  Bell,
  BellSlash,
  Gavel,
  MagnifyingGlass,
  Trophy,
  ArrowUp,
  ArrowDown,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAuth } from '@/lib/auth'
import type { TokenAuction } from './TokenAuction'

interface WatchListItem {
  auctionId: string
  addedAt: number
  notifications: boolean
  notes?: string
  priceAlert?: number
}

export function AuctionWatchList() {
  const { userProfile, isAuthenticated } = useAuth()
  const [auctions] = useLocalStorage<TokenAuction[]>('token-auctions', [])
  const [watchList, setWatchList] = useLocalStorage<Record<string, WatchListItem>>('auction-watchlist', {})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'bids' | 'activity'>('time')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ending-soon'>('all')
  const [notifiedAuctions, setNotifiedAuctions] = useState<Set<string>>(new Set())

  const watchedAuctions = (auctions || [])
    .filter(auction => watchList?.[auction.id])
    .map(auction => ({
      ...auction,
      watchItem: watchList![auction.id]
    }))

  useEffect(() => {
    if (!isAuthenticated || !watchList || !auctions) return

    const checkPriceAlerts = () => {
      const now = Date.now()
      
      watchedAuctions.forEach(({ id, currentBid, tokenName, endTime, status, watchItem }) => {
        if (status !== 'active') return
        if (!watchItem.notifications) return
        if (notifiedAuctions.has(id)) return

        const timeRemaining = endTime - now
        const hoursRemaining = timeRemaining / (1000 * 60 * 60)

        if (hoursRemaining <= 1 && hoursRemaining > 0) {
          toast.warning(`Auction Ending Soon: ${tokenName}`, {
            description: `Less than 1 hour remaining! Current bid: ${currentBid.toLocaleString()} INF`,
            icon: <Lightning size={20} weight="fill" className="text-yellow-500" />,
            duration: 10000
          })
          setNotifiedAuctions(prev => new Set(prev).add(id))
        }

        if (watchItem.priceAlert && currentBid >= watchItem.priceAlert) {
          toast.info(`Price Alert: ${tokenName}`, {
            description: `Bid reached ${currentBid.toLocaleString()} INF (Alert: ${watchItem.priceAlert.toLocaleString()} INF)`,
            icon: <Bell size={20} weight="fill" className="text-accent" />,
            duration: 8000
          })
          
          setWatchList((current) => ({
            ...(current || {}),
            [id]: {
              ...watchItem,
              priceAlert: undefined
            }
          }))
        }
      })
    }

    checkPriceAlerts()
    const interval = setInterval(checkPriceAlerts, 10000)
    return () => clearInterval(interval)
  }, [auctions, watchList, isAuthenticated, notifiedAuctions, setWatchList, watchedAuctions])

  const addToWatchList = (auctionId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add auctions to your watch list')
      return
    }

    setWatchList((current) => ({
      ...(current || {}),
      [auctionId]: {
        auctionId,
        addedAt: Date.now(),
        notifications: true
      }
    }))

    toast.success('Added to watch list', {
      icon: <Star size={20} weight="fill" className="text-accent" />
    })
  }

  const removeFromWatchList = (auctionId: string) => {
    setWatchList((current) => {
      const updated = { ...(current || {}) }
      delete updated[auctionId]
      return updated
    })

    toast.success('Removed from watch list')
  }

  const toggleNotifications = (auctionId: string) => {
    const watchItem = watchList?.[auctionId]
    if (!watchItem) return

    setWatchList((current) => ({
      ...(current || {}),
      [auctionId]: {
        ...watchItem,
        notifications: !watchItem.notifications
      }
    }))

    toast.success(
      watchItem.notifications ? 'Notifications disabled' : 'Notifications enabled'
    )
  }

  const setPriceAlert = (auctionId: string, price: number) => {
    const watchItem = watchList?.[auctionId]
    if (!watchItem) return

    setWatchList((current) => ({
      ...(current || {}),
      [auctionId]: {
        ...watchItem,
        priceAlert: price > 0 ? price : undefined
      }
    }))

    if (price > 0) {
      toast.success(`Price alert set at ${price.toLocaleString()} INF`)
    }
  }

  const getTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now()
    if (remaining <= 0) return 'Ended'

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  const getRecentActivity = (auction: TokenAuction) => {
    if (auction.bids.length === 0) return null
    
    const lastBid = auction.bids[auction.bids.length - 1]
    const timeSinceLastBid = Date.now() - lastBid.timestamp
    const minutesSince = Math.floor(timeSinceLastBid / (1000 * 60))

    if (minutesSince < 5) return 'Very Active'
    if (minutesSince < 15) return 'Active'
    if (minutesSince < 60) return 'Moderate'
    return 'Quiet'
  }

  const getPriceChange = (auction: TokenAuction) => {
    if (auction.bids.length < 2) return null
    
    const previousBid = auction.bids[auction.bids.length - 2].amount
    const currentBid = auction.currentBid
    const change = ((currentBid - previousBid) / previousBid) * 100

    return {
      percentage: change.toFixed(1),
      direction: change > 0 ? 'up' : 'down'
    }
  }

  let filteredAuctions = watchedAuctions.filter(auction => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        auction.tokenName.toLowerCase().includes(query) ||
        auction.tokenSymbol.toLowerCase().includes(query) ||
        auction.creatorUsername.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (filterStatus === 'active') {
    filteredAuctions = filteredAuctions.filter(a => a.status === 'active')
  } else if (filterStatus === 'ending-soon') {
    const oneHour = 60 * 60 * 1000
    filteredAuctions = filteredAuctions.filter(
      a => a.status === 'active' && (a.endTime - Date.now()) <= oneHour
    )
  }

  filteredAuctions.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.currentBid - a.currentBid
      case 'bids':
        return b.bids.length - a.bids.length
      case 'activity': {
        const aLastBid = a.bids[a.bids.length - 1]?.timestamp || 0
        const bLastBid = b.bids[b.bids.length - 1]?.timestamp || 0
        return bLastBid - aLastBid
      }
      case 'time':
      default:
        return a.endTime - b.endTime
    }
  })

  const availableAuctions = (auctions || [])
    .filter(a => a.status === 'active' && !watchList?.[a.id])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Auction Watch List
          </h2>
          <p className="text-muted-foreground">
            Monitor your favorite auctions without bidding
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-lg px-4 py-2">
            <Star size={20} weight="fill" className="mr-2" />
            {watchedAuctions.length} Watched
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass 
                  size={20} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                />
                <Input
                  placeholder="Search watched auctions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="time">Time Remaining</option>
                  <option value="price">Current Bid</option>
                  <option value="bids">Most Bids</option>
                  <option value="activity">Recent Activity</option>
                </select>

                <select
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">All Auctions</option>
                  <option value="active">Active Only</option>
                  <option value="ending-soon">Ending Soon</option>
                </select>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="text-center py-16">
                <Eye size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Watch List Requires Login</h3>
                <p className="text-muted-foreground">
                  Sign in to save and monitor your favorite auctions
                </p>
              </div>
            ) : watchedAuctions.length === 0 ? (
              <div className="text-center py-16">
                <Star size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Your Watch List is Empty</h3>
                <p className="text-muted-foreground">
                  Add auctions to monitor them without placing bids
                </p>
              </div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-16">
                <MagnifyingGlass size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[700px] pr-4">
                <div className="space-y-4">
                  {filteredAuctions.map((auction) => {
                    const watchItem = auction.watchItem
                    const priceChange = getPriceChange(auction)
                    const activity = getRecentActivity(auction)
                    const isEndingSoon = auction.status === 'active' && 
                      (auction.endTime - Date.now()) <= (60 * 60 * 1000)

                    return (
                      <Card 
                        key={auction.id} 
                        className={`p-6 transition-all ${
                          isEndingSoon 
                            ? 'border-accent/50 shadow-lg shadow-accent/10' 
                            : 'hover:shadow-lg'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xl font-bold">{auction.tokenName}</h4>
                                <Badge variant="secondary" className="font-mono">
                                  {auction.tokenSymbol}
                                </Badge>
                                {isEndingSoon && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    <Lightning size={12} weight="fill" className="mr-1" />
                                    Ending Soon
                                  </Badge>
                                )}
                                {activity && (
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      activity === 'Very Active' || activity === 'Active'
                                        ? 'bg-green-500/10 text-green-600 border-green-500/30'
                                        : 'bg-muted'
                                    }
                                  >
                                    {activity}
                                  </Badge>
                                )}
                                <Badge 
                                  variant={auction.status === 'active' ? 'default' : 'outline'}
                                >
                                  {auction.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                by {auction.creatorUsername}
                              </p>
                              {auction.description && (
                                <p className="text-sm text-muted-foreground italic">
                                  {auction.description}
                                </p>
                              )}
                              {watchItem.notes && (
                                <p className="text-sm text-accent italic">
                                  Note: {watchItem.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {auction.status === 'active' && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock size={14} weight="bold" />
                                  {getTimeRemaining(auction.endTime)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-mono font-bold">{auction.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Current Bid</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono font-bold text-accent">
                                  {auction.currentBid.toLocaleString()} INF
                                </p>
                                {priceChange && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      priceChange.direction === 'up' 
                                        ? 'bg-green-500/10 text-green-600 border-green-500/30' 
                                        : 'bg-red-500/10 text-red-600 border-red-500/30'
                                    }`}
                                  >
                                    {priceChange.direction === 'up' ? (
                                      <ArrowUp size={10} weight="bold" />
                                    ) : (
                                      <ArrowDown size={10} weight="bold" />
                                    )}
                                    {priceChange.percentage}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Bids</p>
                              <p className="font-mono font-bold flex items-center gap-1">
                                <Users size={16} weight="duotone" />
                                {auction.bids.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Start Bid</p>
                              <p className="font-mono text-sm">
                                {auction.startingBid.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {watchItem.priceAlert && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
                              <Bell size={16} weight="fill" className="text-accent" />
                              <span className="text-sm">
                                Price alert: {watchItem.priceAlert.toLocaleString()} INF
                              </span>
                            </div>
                          )}

                          {auction.bids.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Recent Bids</p>
                              <div className="space-y-1">
                                {auction.bids.slice(-3).reverse().map((bid) => (
                                  <div
                                    key={bid.bidId}
                                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/20"
                                  >
                                    <span className="flex items-center gap-2">
                                      {bid.bidderAvatar && (
                                        <img
                                          src={bid.bidderAvatar}
                                          alt={bid.bidderUsername}
                                          className="w-5 h-5 rounded-full"
                                        />
                                      )}
                                      <span>{bid.bidderUsername}</span>
                                    </span>
                                    <span className="font-mono font-bold">
                                      {bid.amount.toLocaleString()} INF
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Separator />

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleNotifications(auction.id)}
                              className={watchItem.notifications ? 'bg-accent/10' : ''}
                            >
                              {watchItem.notifications ? (
                                <>
                                  <Bell size={16} weight="fill" className="mr-2" />
                                  Notifications On
                                </>
                              ) : (
                                <>
                                  <BellSlash size={16} weight="duotone" className="mr-2" />
                                  Notifications Off
                                </>
                              )}
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFromWatchList(auction.id)}
                            >
                              <EyeSlash size={16} weight="duotone" className="mr-2" />
                              Remove
                            </Button>

                            {auction.status === 'active' && (
                              <div className="flex-1 flex items-center gap-2 ml-auto">
                                <Input
                                  type="number"
                                  placeholder="Price alert..."
                                  className="h-8 text-xs w-32"
                                  defaultValue={watchItem.priceAlert || ''}
                                  onBlur={(e) => {
                                    const value = parseFloat(e.target.value)
                                    if (!isNaN(value)) {
                                      setPriceAlert(auction.id, value)
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <Trophy size={28} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Available Auctions</h3>
                <p className="text-xs text-muted-foreground">Add to watch list</p>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Log in to see available auctions
                </p>
              </div>
            ) : availableAuctions.length === 0 ? (
              <div className="text-center py-8">
                <Gavel size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No active auctions available
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {availableAuctions.map((auction) => (
                    <Card key={auction.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{auction.tokenName}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {auction.tokenSymbol}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {auction.creatorUsername}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Current Bid:</span>
                            <span className="font-mono font-bold text-accent">
                              {auction.currentBid.toLocaleString()} INF
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Bids:</span>
                            <span className="font-mono">{auction.bids.length}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Ends:</span>
                            <span className="font-mono">{getTimeRemaining(auction.endTime)}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-primary to-accent"
                          onClick={() => addToWatchList(auction.id)}
                        >
                          <Star size={16} weight="duotone" className="mr-2" />
                          Add to Watch List
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Watch List Stats</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Watched:</span>
                  <span className="font-mono font-bold">{watchedAuctions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-mono">
                    {watchedAuctions.filter(a => a.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Alerts:</span>
                  <span className="font-mono">
                    {Object.values(watchList || {}).filter(w => w.priceAlert).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notifications:</span>
                  <span className="font-mono">
                    {Object.values(watchList || {}).filter(w => w.notifications).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
