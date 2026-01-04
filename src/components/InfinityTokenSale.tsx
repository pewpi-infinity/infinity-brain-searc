import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import {
  CurrencyDollar,
  Coin,
  TrendUp,
  ShieldCheck,
  Lightning,
  Crown,
  Sparkle,
  User,
  CalendarBlank,
  Receipt,
  Check,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth'
import { PayPalPaymentDialog, PayPalBadge } from '@/components/PayPalIntegration'
import { ActionPreview, ACTION_PREVIEWS } from '@/components/ActionPreview'

interface UsdBid {
  bidId: string
  userId: string
  username: string
  avatarUrl: string
  amountUsd: number
  requestedInf: number
  pricePerToken: number
  type: 'buy' | 'earn'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  timestamp: number
  paymentMethod?: string
  notes?: string
}

interface TokenPackage {
  id: string
  name: string
  infAmount: number
  usdPrice: number
  bonusPercent: number
  popular?: boolean
  description: string
}

const SILVER_TOKEN_BACKING = 'Real silver bits'
const BETA_PROGRAM_ACTIVE = true
const SUMMER_2026_GIVEAWAY = 'Summer 2026 - Major token distribution event'

const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'bundle',
    name: '10 Token Bundle',
    infAmount: 10,
    usdPrice: 1,
    bonusPercent: 0,
    popular: true,
    description: 'Standard 10-token bundle'
  }
]

export function InfinityTokenSale() {
  const { userProfile, isAuthenticated, login, addTokens } = useAuth()
  const [usdBids, setUsdBids] = useKV<UsdBid[]>('usd-bids', [])
  const [allTokens] = useKV<Record<string, any>>('business-tokens', {})
  
  const [buyAmount, setBuyAmount] = useState('')
  const [customUsdAmount, setCustomUsdAmount] = useState('')
  const [earnAmount, setEarnAmount] = useState('')
  const [earnDescription, setEarnDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPayPalDialog, setShowPayPalDialog] = useState(false)
  const [pendingPurchase, setPendingPurchase] = useState<{ usdAmount: number; infAmount: number; bonus: number } | null>(null)

  const INF_USD_RATE = 0.10

  const handleBuyWithUsd = async (packageData?: TokenPackage) => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to purchase tokens')
      await login()
      return
    }

    let usdAmount: number
    let infAmount: number
    let bonus = 0

    if (packageData) {
      usdAmount = packageData.usdPrice
      infAmount = packageData.infAmount
      bonus = packageData.bonusPercent
    } else {
      if (!customUsdAmount) {
        toast.error('Please enter an amount')
        return
      }
      usdAmount = parseFloat(customUsdAmount)
      if (isNaN(usdAmount) || usdAmount <= 0) {
        toast.error('Invalid USD amount')
        return
      }
      infAmount = Math.floor(usdAmount / INF_USD_RATE)
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (paymentMethod === 'PayPal') {
      setPendingPurchase({ usdAmount, infAmount, bonus })
      setShowPayPalDialog(true)
      return
    }

    setIsSubmitting(true)

    try {
      const bidId = `usd-bid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const bonusTokens = bonus > 0 ? Math.floor(infAmount * (bonus / 100)) : 0
      const totalInf = infAmount + bonusTokens

      const newBid: UsdBid = {
        bidId,
        userId: userProfile.userId,
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        amountUsd: usdAmount,
        requestedInf: totalInf,
        pricePerToken: usdAmount / infAmount,
        type: 'buy',
        status: 'pending',
        timestamp: Date.now(),
        paymentMethod,
        notes: bonus > 0 ? `Includes ${bonus}% bonus (${bonusTokens} INF)` : undefined
      }

      setUsdBids((currentBids) => [...(currentBids || []), newBid])

      toast.success(
        `Purchase request submitted! ${totalInf.toLocaleString()} INF for $${usdAmount}`,
        {
          description: bonus > 0 
            ? `Includes ${bonus}% bonus (+${bonusTokens} INF)` 
            : 'Beta program pricing active',
          duration: 6000
        }
      )

      setCustomUsdAmount('')
      setPaymentMethod('')
    } catch (error) {
      toast.error('Failed to submit purchase request')
      console.error('Purchase error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayPalPaymentComplete = async (transactionId: string) => {
    if (!pendingPurchase || !userProfile) return

    const { usdAmount, infAmount, bonus } = pendingPurchase

    setIsSubmitting(true)

    try {
      const bidId = `usd-bid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const bonusTokens = bonus > 0 ? Math.floor(infAmount * (bonus / 100)) : 0
      const totalInf = infAmount + bonusTokens

      const newBid: UsdBid = {
        bidId,
        userId: userProfile.userId,
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        amountUsd: usdAmount,
        requestedInf: totalInf,
        pricePerToken: usdAmount / infAmount,
        type: 'buy',
        status: 'pending',
        timestamp: Date.now(),
        paymentMethod: `PayPal (${transactionId.slice(0, 16)}...)`,
        notes: bonus > 0 ? `Includes ${bonus}% bonus (${bonusTokens} INF). PayPal TXN: ${transactionId}` : `PayPal TXN: ${transactionId}`
      }

      setUsdBids((currentBids) => [...(currentBids || []), newBid])

      toast.success(
        `Purchase request submitted! ${totalInf.toLocaleString()} INF for $${usdAmount}`,
        {
          description: 'Your payment is being verified',
          duration: 6000
        }
      )

      setCustomUsdAmount('')
      setPaymentMethod('')
      setPendingPurchase(null)
    } catch (error) {
      toast.error('Failed to record purchase')
      console.error('Purchase error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEarnTokens = async () => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to request tokens')
      await login()
      return
    }

    if (!earnAmount || !earnDescription) {
      toast.error('Please fill in all fields')
      return
    }

    const amount = parseFloat(earnAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid token amount')
      return
    }

    setIsSubmitting(true)

    try {
      const bidId = `earn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const newBid: UsdBid = {
        bidId,
        userId: userProfile.userId,
        username: userProfile.username,
        avatarUrl: userProfile.avatarUrl,
        amountUsd: 0,
        requestedInf: amount,
        pricePerToken: 0,
        type: 'earn',
        status: 'pending',
        timestamp: Date.now(),
        notes: earnDescription
      }

      setUsdBids((currentBids) => [...(currentBids || []), newBid])

      toast.success(
        `Earn request submitted for ${amount.toLocaleString()} INF`,
        {
          description: 'Your request will be reviewed',
          duration: 5000
        }
      )

      setEarnAmount('')
      setEarnDescription('')
    } catch (error) {
      toast.error('Failed to submit earn request')
      console.error('Earn request error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveRequest = async (bid: UsdBid) => {
    if (!userProfile) return

    try {
      setUsdBids((currentBids) =>
        (currentBids || []).map(b =>
          b.bidId === bid.bidId
            ? { ...b, status: 'approved' as const }
            : b
        )
      )

      await addTokens('INF', bid.requestedInf)

      toast.success(
        `${bid.requestedInf.toLocaleString()} INF tokens delivered!`,
        {
          description: bid.type === 'buy' 
            ? `Purchase of $${bid.amountUsd} processed` 
            : 'Earn request approved',
          duration: 5000
        }
      )
    } catch (error) {
      toast.error('Failed to process request')
      console.error('Approval error:', error)
    }
  }

  const userBids = (usdBids || [])
    .filter(bid => bid.userId === userProfile?.userId)
    .sort((a, b) => b.timestamp - a.timestamp)

  const allBidsForAdmin = (usdBids || [])
    .sort((a, b) => b.timestamp - a.timestamp)

  const silverTokens = Object.values(allTokens || {})
    .filter((token: any) => token.symbol === 'SILVER' || token.name?.toLowerCase().includes('silver'))

  return (
    <div className="space-y-6">
      {pendingPurchase && (
        <PayPalPaymentDialog
          amount={pendingPurchase.usdAmount}
          auctionId={`INF-Purchase-${Date.now()}`}
          auctionName={`${pendingPurchase.infAmount} INF Tokens${pendingPurchase.bonus > 0 ? ` (+${pendingPurchase.bonus}% bonus)` : ''}`}
          onPaymentComplete={handlePayPalPaymentComplete}
          open={showPayPalDialog}
          onOpenChange={setShowPayPalDialog}
        />
      )}

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkle size={48} weight="duotone" className="text-accent animate-pulse" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Infinity Token Sale - Beta Program
          </h2>
          <Coin size={48} weight="duotone" className="text-primary animate-pulse" />
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Professional token sale platform. Purchase 10 INF tokens per bundle with USD. New users receive 10 free tokens on signup!
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <PayPalBadge />
          {BETA_PROGRAM_ACTIVE && (
            <Badge variant="default" className="text-sm px-4 py-2 bg-gradient-to-r from-accent to-primary">
              <Lightning size={16} weight="fill" className="mr-2" />
              Beta Program - Controlled Distribution to Prevent Inflation
            </Badge>
          )}
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5 border-2 border-accent/20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <CurrencyDollar size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">PayPal Payments</h3>
              <p className="text-sm text-muted-foreground mb-1">
                Send to: <strong className="text-foreground">marvaseater@gmail.com</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Kris Watson: 808-342-9975
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-accent/20">
              <CalendarBlank size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Summer 2026 Giveaway</h3>
              <p className="text-sm text-muted-foreground">
                {SUMMER_2026_GIVEAWAY}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <ShieldCheck size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Silver-Backed Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Silver tokens are backed by {SILVER_TOKEN_BACKING}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <ActionPreview 
        action="buyInf"
        description={ACTION_PREVIEWS.buyInf}
      />

      <Tabs defaultValue="buy" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
          <TabsTrigger value="buy" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
            <CurrencyDollar size={20} weight="duotone" className="mr-2" />
            Buy with USD
          </TabsTrigger>
          <TabsTrigger value="earn" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-secondary data-[state=active]:text-white">
            <TrendUp size={20} weight="duotone" className="mr-2" />
            Earn Tokens
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-primary data-[state=active]:text-white">
            <Receipt size={20} weight="duotone" className="mr-2" />
            My Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Crown size={28} weight="duotone" className="text-accent" />
              10 Token Bundles - Limited Supply
            </h3>
            <div className="max-w-md mx-auto">
              {TOKEN_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`p-6 relative ${
                    pkg.popular 
                      ? 'gradient-border shadow-lg shadow-accent/20' 
                      : 'hover:shadow-md transition-shadow'
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-primary">
                      Most Popular
                    </Badge>
                  )}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h4 className="font-bold text-lg">{pkg.name}</h4>
                      <p className="text-xs text-muted-foreground">{pkg.description}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">
                        ${pkg.usdPrice}
                      </div>
                      <div className="text-sm text-muted-foreground">USD</div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">INF Tokens:</span>
                        <span className="font-mono font-bold">{pkg.infAmount.toLocaleString()}</span>
                      </div>
                      {pkg.bonusPercent > 0 && (
                        <div className="flex items-center justify-between text-accent">
                          <span>Bonus:</span>
                          <span className="font-bold">+{pkg.bonusPercent}%</span>
                        </div>
                      )}
                      {pkg.bonusPercent > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">You get:</span>
                          <span className="font-mono font-bold text-accent">
                            {Math.floor(pkg.infAmount * (1 + pkg.bonusPercent / 100)).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className={`w-full ${
                            pkg.popular
                              ? 'bg-gradient-to-r from-accent to-primary'
                              : 'bg-gradient-to-r from-primary to-secondary'
                          }`}
                        >
                          Buy Package
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Purchase {pkg.name}</DialogTitle>
                          <DialogDescription>
                            Complete your token purchase
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Package:</span>
                              <span className="font-bold">{pkg.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Base tokens:</span>
                              <span className="font-mono">{pkg.infAmount.toLocaleString()} INF</span>
                            </div>
                            {pkg.bonusPercent > 0 && (
                              <>
                                <div className="flex justify-between text-accent">
                                  <span>Bonus ({pkg.bonusPercent}%):</span>
                                  <span className="font-mono">
                                    +{Math.floor(pkg.infAmount * (pkg.bonusPercent / 100)).toLocaleString()} INF
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total tokens:</span>
                                  <span className="font-mono text-accent">
                                    {Math.floor(pkg.infAmount * (1 + pkg.bonusPercent / 100)).toLocaleString()} INF
                                  </span>
                                </div>
                              </>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-xl">
                              <span>Price:</span>
                              <span className="text-accent">${pkg.usdPrice}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="payment-method">Payment Method</Label>
                            <select
                              id="payment-method"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                              <option value="">Select payment method</option>
                              <option value="PayPal">💳 PayPal (Recommended)</option>
                              <option value="Venmo">Venmo</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Zelle">Zelle</option>
                              <option value="Cash App">Cash App</option>
                            </select>
                            {paymentMethod === 'PayPal' && (
                              <div className="p-3 rounded-lg bg-[#0070ba]/10 border border-[#0070ba]/30 space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <PayPalBadge />
                                  <span className="text-xs font-medium">Automated Payment Flow</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Click "Continue" to be redirected to PayPal for secure payment
                                </p>
                              </div>
                            )}
                            {paymentMethod && paymentMethod !== 'PayPal' && (
                              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                                <p className="text-sm font-medium mb-1">💳 Payment Instructions:</p>
                                <p className="text-xs text-muted-foreground">
                                  PayPal: <strong className="text-foreground">marvaseater@gmail.com</strong>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Contact: Kris Watson - 808-342-9975
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Include your username in the payment note for fast processing
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleBuyWithUsd(pkg)}
                            className={paymentMethod === 'PayPal' 
                              ? "w-full bg-gradient-to-r from-[#0070ba] to-[#1546a0] text-white"
                              : "w-full bg-gradient-to-r from-accent to-primary"
                            }
                            disabled={isSubmitting || !isAuthenticated}
                          >
                            {isSubmitting ? 'Processing...' : paymentMethod === 'PayPal' ? 'Continue to PayPal' : 'Submit Purchase Request'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-6 bg-muted/30">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Coin size={32} weight="duotone" className="text-accent" />
              </div>
              <h3 className="text-xl font-bold">Controlled Token Distribution</h3>
              <p className="text-muted-foreground">
                Tokens are sold in 10-token bundles only to prevent inflation and maintain value stability. 
                This ensures a healthy economy for all participants.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-accent/10">
                  <div className="text-2xl font-bold text-accent">10</div>
                  <div className="text-xs text-muted-foreground">Tokens per bundle</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">$1</div>
                  <div className="text-xs text-muted-foreground">Per bundle</div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="earn" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendUp size={32} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Earn Infinity Tokens</h3>
                  <p className="text-sm text-muted-foreground">
                    Request tokens for contributions, development work, or other value provided
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="earn-amount">Requested INF Amount</Label>
                    <Input
                      id="earn-amount"
                      type="number"
                      placeholder="Enter token amount"
                      value={earnAmount}
                      onChange={(e) => setEarnAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="earn-description">Description / Justification</Label>
                    <textarea
                      id="earn-description"
                      className="w-full p-3 rounded-md border border-input bg-background min-h-[120px]"
                      placeholder="Describe why you're requesting these tokens (e.g., development work, contribution to ecosystem, research, etc.)"
                      value={earnDescription}
                      onChange={(e) => setEarnDescription(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleEarnTokens}
                    className="w-full bg-gradient-to-r from-accent to-secondary"
                    disabled={isSubmitting || !isAuthenticated}
                  >
                    <TrendUp size={20} weight="bold" className="mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Earn Request'}
                  </Button>
                </div>

                <div className="p-6 rounded-lg bg-gradient-to-br from-secondary/10 to-accent/10 space-y-4">
                  <h4 className="font-bold">Earn Opportunities</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                      <span>Development contributions to the ecosystem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                      <span>Research and documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                      <span>Community building and support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                      <span>Bug reports and testing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={16} weight="bold" className="text-accent mt-0.5 flex-shrink-0" />
                      <span>Content creation and marketing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Receipt size={24} weight="duotone" className="text-primary" />
              Your Token Requests
            </h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {userBids.length > 0 ? (
                  userBids.map((bid) => (
                    <Card key={bid.bidId} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge
                              variant={bid.type === 'buy' ? 'default' : 'secondary'}
                              className="mb-2"
                            >
                              {bid.type === 'buy' ? 'Purchase' : 'Earn Request'}
                            </Badge>
                            <div className="font-mono font-bold text-lg">
                              {bid.requestedInf.toLocaleString()} INF
                            </div>
                            {bid.type === 'buy' && (
                              <div className="text-sm text-muted-foreground">
                                ${bid.amountUsd} USD
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={
                              bid.status === 'approved' || bid.status === 'completed'
                                ? 'default'
                                : bid.status === 'rejected'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {bid.status === 'approved' && <Check size={12} className="mr-1" />}
                            {bid.status === 'rejected' && <X size={12} className="mr-1" />}
                            {bid.status.toUpperCase()}
                          </Badge>
                        </div>

                        {bid.paymentMethod && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Payment: </span>
                            {bid.paymentMethod}
                          </div>
                        )}

                        {bid.notes && (
                          <div className="text-sm p-2 rounded bg-muted/30">
                            {bid.notes}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {new Date(bid.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Receipt size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No requests yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {silverTokens.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={32} weight="duotone" className="text-primary" />
            <div>
              <h3 className="text-xl font-bold">Silver-Backed Tokens</h3>
              <p className="text-sm text-muted-foreground">
                These tokens are backed by real silver bits
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {silverTokens.map((token: any) => (
              <Card key={token.symbol} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{token.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {token.symbol}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
                      Silver Backed
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Supply: {token.totalSupply?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Backed by: {SILVER_TOKEN_BACKING}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
