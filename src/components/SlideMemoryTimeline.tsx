import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkle, Clock, Tag, Brain, TrendUp } from '@phosphor-icons/react'
import { getUserSlideCoins, getTotalSlideValue, SlideCoin } from '@/lib/slideCoinSystem'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export function SlideMemoryTimeline() {
  const { userProfile, isAuthenticated } = useAuth()
  const [slideCoins, setSlideCoins] = useState<SlideCoin[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [selectedCoin, setSelectedCoin] = useState<SlideCoin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSlideCoins()
  }, [userProfile])

  const loadSlideCoins = async () => {
    if (!userProfile) return
    
    setLoading(true)
    try {
      const coins = await getUserSlideCoins(userProfile.username)
      setSlideCoins(coins)
      
      const value = await getTotalSlideValue(userProfile.username)
      setTotalValue(value)
    } catch (error) {
      console.error('Failed to load slide coins:', error)
      toast.error('Failed to load memories')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Sparkle size={48} weight="duotone" className="mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-xl font-bold">Tap Memories</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to see your interaction history
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 gradient-border bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkle size={32} weight="duotone" className="text-primary" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Tap Memories
              </h2>
            </div>
            <p className="text-muted-foreground">
              Every interaction creates lasting value
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-4xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              {totalValue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground font-mono">INF Tokens</p>
            <Badge variant="secondary" className="mt-2">
              {slideCoins.length} memories
            </Badge>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Sparkle size={48} weight="duotone" className="mx-auto animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading your memories...</p>
          </div>
        </Card>
      ) : slideCoins.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Sparkle size={64} weight="duotone" className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-bold mb-2">Start Creating Memories</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Every tap, click, and interaction creates value automatically!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slideCoins.map((coin) => (
            <Card
              key={coin.id}
              className="cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setSelectedCoin(coin)}
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkle size={48} weight="duotone" className="text-primary/50" />
              </div>
              <CardContent className="p-4 space-y-3">
                <Badge variant="default">{coin.token.value} INF</Badge>
                <p className="text-sm line-clamp-2">{coin.research.context}</p>
                <Button size="sm" variant="outline" className="w-full">
                  View Memory
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCoin && (
        <Dialog open={!!selectedCoin} onOpenChange={() => setSelectedCoin(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Memory from {format(selectedCoin.timestamp, 'PPpp')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Context</h4>
                <p className="text-sm">{selectedCoin.research.context}</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-2">AI Insights</h4>
                <p className="text-sm">{selectedCoin.quantum.semanticMeaning}</p>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}