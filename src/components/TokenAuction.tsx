import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { 
  Gavel,
  Trophy,
  Clock,
  Users,
  TrendUp,
  Link as LinkIcon,
  Copy,
  Coins,
  SignIn,
  Crown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth'

export interface AuctionBid {
  bidId: string
  auctionId: string
  bidderId: string
  bidderUsername: string
  bidderAvatar: string
  amount: number
  timestamp: number
}

export interface TokenAuction {
  id: string
  tokenSymbol: string
  tokenName: string
  amount: number
  startingBid: number
  currentBid: number
  reservePrice?: number
  creatorId: string
  creatorUsername: string
  startTime: number
  endTime: number
  status: 'pending' | 'active' | 'ended' | 'cancelled'
  winnerId?: string
  winnerUsername?: string
  bids: AuctionBid[]
  description?: string
}

export function TokenAuction() {
  const { userProfile, isAuthenticated, login, deductTokens, addTokens } = useAuth()
  const [auctions, setAuctions] = useKV<TokenAuction[]>('token-auctions', [])
  const [auctionHistory, setAuctionHistory] = useKV<any[]>('auction-history', [])
  const [allProfiles, setAllProfiles] = useKV<Record<string, any>>('all-user-profiles', {})
  const [allTokens] = useKV<Record<string, any>>('business-tokens', {})

  const [selectedToken, setSelectedToken] = useState('')
  const [auctionAmount, setAuctionAmount] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [duration, setDuration] = useState('24')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [selectedAuction, setSelectedAuction] = useState<TokenAuction | null>(null)
  const [bidAmount, setBidAmount] = useState('')

  const availableTokens = userProfile 
    ? Object.keys(userProfile.businessTokens).filter(
        symbol => userProfile.businessTokens[symbol] > 0 && symbol !== 'INF'
      )
    : []

  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions((currentAuctions) => {
        const updated = (currentAuctions || []).map(auction => {
          if (auction.status === 'active' && Date.now() >= auction.endTime) {
            const winningBid = auction.bids[auction.bids.length - 1]
            const endedAuction = winningBid && auction.currentBid >= (auction.reservePrice || 0)
              ? {
                  ...auction,
                  status: 'ended' as const,
                  winnerId: winningBid.bidderId,
                  winnerUsername: winningBid.bidderUsername
                }
              : { ...auction, status: 'ended' as const }
            
            const uniqueBidders = new Set(auction.bids.map(b => b.bidderId)).size
            const auctionMetric = {
              id: auction.id,
              tokenSymbol: auction.tokenSymbol,
              startPrice: auction.startingBid,
              finalPrice: auction.currentBid,
              totalBids: auction.bids.length,
              uniqueBidders,
              duration: auction.endTime - auction.startTime,
              endTime: auction.endTime,
              winner: winningBid?.bidderUsername || 'No winner',
              status: 'completed' as const,
              views: Math.floor(Math.random() * 100) + 20,
              watchlist: Math.floor(Math.random() * 20) + 5
            }
            
            setAuctionHistory((currentHistory) => [...(currentHistory || []), auctionMetric])
            
            return endedAuction
          }
          if (auction.status === 'pending' && Date.now() >= auction.startTime) {
            return { ...auction, status: 'active' as const }
          }
          return auction
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [setAuctions, setAuctionHistory])

  const handleCreateAuction = async () => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to create an auction')
      return
    }

    if (!selectedToken || !auctionAmount || !startingBid || !duration) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(auctionAmount)
    const startBid = parseFloat(startingBid)
    const reserve = reservePrice ? parseFloat(reservePrice) : undefined
    const durationHours = parseFloat(duration)

    if (isNaN(amount) || amount <= 0 || isNaN(startBid) || startBid <= 0 || isNaN(durationHours) || durationHours <= 0) {
      toast.error('Invalid amount, bid, or duration')
      return
    }

    if (reserve && reserve < startBid) {
      toast.error('Reserve price must be greater than or equal to starting bid')
      return
    }

    const userBalance = userProfile.businessTokens[selectedToken] || 0
    if (amount > userBalance) {
      toast.error(`Insufficient ${selectedToken} balance`)
      return
    }

    setIsCreating(true)

    try {
      const auctionId = `auction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const tokenInfo = allTokens?.[selectedToken]

      const newAuction: TokenAuction = {
        id: auctionId,
        tokenSymbol: selectedToken,
        tokenName: tokenInfo?.name || selectedToken,
        amount,
        startingBid: startBid,
        currentBid: startBid,
        reservePrice: reserve,
        creatorId: userProfile.userId,
        creatorUsername: userProfile.username,
        startTime: Date.now(),
        endTime: Date.now() + (durationHours * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        description
      }

      await deductTokens(selectedToken, amount)

      setAuctions((currentAuctions) => [...(currentAuctions || []), newAuction])

      toast.success(`Auction created for ${amount} ${selectedToken}!`)

      setSelectedToken('')
      setAuctionAmount('')
      setStartingBid('')
      setReservePrice('')
      setDuration('24')
      setDescription('')
    } catch (error) {
      toast.error('Failed to create auction')
      console.error('Auction creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handlePlaceBid = async (auction: TokenAuction) => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to place a bid')
      await login()
      return
    }

    if (!bidAmount) {
      toast.error('Please enter a bid amount')
      return
    }

    const bid = parseFloat(bidAmount)

    if (isNaN(bid) || bid <= 0) {
      toast.error('Invalid bid amount')
      return
    }

    if (bid <= auction.currentBid) {
      toast.error(`Bid must be higher than current bid of ${auction.currentBid} INF`)
      return
    }

    const userInfBalance = userProfile.businessTokens['INF'] || 0
    if (bid > userInfBalance) {
      toast.error('Insufficient INF balance')
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

      toast.success(`Bid placed successfully! Current bid: ${bid} INF`)
      setBidAmount('')
    } catch (error) {
      toast.error('Failed to place bid')
      console.error('Bid error:', error)
    }
  }

  const handleFinalizeAuction = async (auction: TokenAuction) => {
    if (!auction.winnerId || !userProfile) return

    const winner = allProfiles?.[auction.winnerId]
    const creator = allProfiles?.[auction.creatorId]

    if (!winner || !creator) {
      toast.error('User profiles not found')
      return
    }

    try {
      setAllProfiles((currentProfiles) => ({
        ...(currentProfiles || {}),
        [auction.winnerId!]: {
          ...winner,
          businessTokens: {
            ...winner.businessTokens,
            [auction.tokenSymbol]: (winner.businessTokens[auction.tokenSymbol] || 0) + auction.amount,
            INF: (winner.businessTokens.INF || 0) - auction.currentBid
          }
        },
        [auction.creatorId]: {
          ...creator,
          businessTokens: {
            ...creator.businessTokens,
            INF: (creator.businessTokens.INF || 0) + auction.currentBid
          }
        }
      }))

      if (userProfile.userId === auction.winnerId) {
        await deductTokens('INF', auction.currentBid)
        await addTokens(auction.tokenSymbol, auction.amount)
      } else if (userProfile.userId === auction.creatorId) {
        await addTokens('INF', auction.currentBid)
      }

      toast.success('Auction finalized! Tokens transferred.')
    } catch (error) {
      toast.error('Failed to finalize auction')
      console.error('Finalization error:', error)
    }
  }

  const getShareableLink = (auctionId: string) => {
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?auction=${auctionId}`
  }

  const copyAuctionLink = (auctionId: string) => {
    const link = getShareableLink(auctionId)
    navigator.clipboard.writeText(link)
    toast.success('Auction link copied to clipboard!')
  }

  const activeAuctions = (auctions || []).filter(a => a.status === 'active').sort((a, b) => a.endTime - b.endTime)
  const endedAuctions = (auctions || []).filter(a => a.status === 'ended').sort((a, b) => b.endTime - a.endTime)
  const myAuctions = (auctions || []).filter(a => a.creatorId === userProfile?.userId)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Token Auctions
          </h2>
          <p className="text-muted-foreground">
            Auction your tokens to the highest bidder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-lg px-4 py-2">
            <Gavel size={20} weight="duotone" className="mr-2" />
            {activeAuctions.length} Active
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 gradient-border">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Gavel size={32} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Create Auction</h3>
                <p className="text-xs text-muted-foreground">List tokens for bidding</p>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="text-center py-8 space-y-4">
                <SignIn size={48} weight="duotone" className="mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Log in to create auctions</p>
                <Button onClick={login} className="w-full bg-gradient-to-r from-primary to-accent">
                  <SignIn size={20} className="mr-2" />
                  Sign in with GitHub
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="auction-token">Token to Auction</Label>
                  <select
                    id="auction-token"
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                  >
                    <option value="">Select token</option>
                    {availableTokens.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol} (Balance: {userProfile?.businessTokens[symbol]?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auction-amount">Amount</Label>
                  <Input
                    id="auction-amount"
                    type="number"
                    placeholder="0.00"
                    value={auctionAmount}
                    onChange={(e) => setAuctionAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starting-bid">Starting Bid (INF)</Label>
                  <Input
                    id="starting-bid"
                    type="number"
                    placeholder="0.00"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserve-price">Reserve Price (INF, Optional)</Label>
                  <Input
                    id="reserve-price"
                    type="number"
                    placeholder="0.00"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="24"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Add details about your tokens..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateAuction}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  disabled={isCreating || availableTokens.length === 0}
                >
                  <Gavel size={20} weight="bold" className="mr-2" />
                  {isCreating ? 'Creating...' : 'Start Auction'}
                </Button>
              </>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy size={28} weight="duotone" className="text-accent" />
                Active Auctions
              </h3>

              {activeAuctions.length === 0 ? (
                <div className="text-center py-12">
                  <Gavel size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active auctions</p>
                  <p className="text-sm text-muted-foreground mt-2">Be the first to create one!</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {activeAuctions.map((auction) => (
                      <Card key={auction.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xl font-bold">{auction.tokenName}</h4>
                                <Badge variant="secondary" className="font-mono">
                                  {auction.tokenSymbol}
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
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock size={14} weight="bold" />
                              {getTimeRemaining(auction.endTime)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-mono font-bold">{auction.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Current Bid</p>
                              <p className="font-mono font-bold text-accent">
                                {auction.currentBid.toLocaleString()} INF
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Bids</p>
                              <p className="font-mono font-bold flex items-center gap-1">
                                <Users size={16} weight="duotone" />
                                {auction.bids.length}
                              </p>
                            </div>
                          </div>

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
                                      {bid.bidderUsername}
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-accent to-primary"
                                  onClick={() => setSelectedAuction(auction)}
                                  disabled={auction.creatorId === userProfile?.userId}
                                >
                                  <TrendUp size={20} weight="bold" className="mr-2" />
                                  Place Bid
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Place Bid</DialogTitle>
                                  <DialogDescription>
                                    {!isAuthenticated && 'Sign in with GitHub to place your bid'}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Token:</span>
                                      <span className="font-mono font-bold">
                                        {auction.amount.toLocaleString()} {auction.tokenSymbol}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Current Bid:</span>
                                      <span className="font-mono font-bold text-accent">
                                        {auction.currentBid.toLocaleString()} INF
                                      </span>
                                    </div>
                                    {auction.reservePrice && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reserve:</span>
                                        <span className="font-mono text-sm">
                                          {auction.reservePrice.toLocaleString()} INF
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {!isAuthenticated ? (
                                    <Button
                                      onClick={login}
                                      className="w-full bg-gradient-to-r from-primary to-accent"
                                    >
                                      <SignIn size={20} className="mr-2" />
                                      Sign in with GitHub to Bid
                                    </Button>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        <Label htmlFor="bid-amount">Your Bid (INF)</Label>
                                        <Input
                                          id="bid-amount"
                                          type="number"
                                          placeholder={`Min: ${auction.currentBid + 1}`}
                                          value={bidAmount}
                                          onChange={(e) => setBidAmount(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Your balance: {userProfile?.businessTokens['INF']?.toLocaleString() || 0} INF
                                        </p>
                                      </div>

                                      <Button
                                        onClick={() => handlePlaceBid(auction)}
                                        className="w-full bg-gradient-to-r from-accent to-primary"
                                      >
                                        <TrendUp size={20} weight="bold" className="mr-2" />
                                        Confirm Bid
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyAuctionLink(auction.id)}
                            >
                              <Copy size={20} weight="duotone" />
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <LinkIcon size={20} weight="duotone" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Share Auction Link</DialogTitle>
                                  <DialogDescription>
                                    Share this link for others to view and bid on this auction
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-3 rounded-lg bg-muted/50 font-mono text-xs break-all">
                                    {getShareableLink(auction.id)}
                                  </div>
                                  <Button
                                    onClick={() => copyAuctionLink(auction.id)}
                                    className="w-full"
                                  >
                                    <Copy size={20} className="mr-2" />
                                    Copy Link
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {endedAuctions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Crown size={24} weight="duotone" className="text-muted-foreground" />
                  Ended Auctions
                </h3>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {endedAuctions.slice(0, 10).map((auction) => (
                      <Card key={auction.id} className="p-4 opacity-75">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">
                              {auction.amount.toLocaleString()} {auction.tokenSymbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {auction.winnerId ? `Won by ${auction.winnerUsername}` : 'No winner'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-sm">
                              {auction.currentBid.toLocaleString()} INF
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {auction.winnerId && userProfile?.userId === auction.winnerId && auction.status === 'ended' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFinalizeAuction(auction)}
                            >
                              Claim
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </Card>
      </div>

      {isAuthenticated && myAuctions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Coins size={24} weight="duotone" className="text-primary" />
            Your Auctions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAuctions.map((auction) => (
              <Card key={auction.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono">
                      {auction.tokenSymbol}
                    </Badge>
                    <Badge
                      variant={
                        auction.status === 'active'
                          ? 'default'
                          : auction.status === 'ended'
                          ? 'outline'
                          : 'secondary'
                      }
                    >
                      {auction.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-bold">{auction.amount.toLocaleString()} tokens</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {auction.currentBid.toLocaleString()} INF
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
                  </div>
                  {auction.status === 'active' && (
                    <div className="text-xs font-mono text-muted-foreground">
                      {getTimeRemaining(auction.endTime)}
                    </div>
                  )}
                  {auction.status === 'ended' && auction.winnerId && (
                    <p className="text-xs text-accent">
                      Winner: {auction.winnerUsername}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
