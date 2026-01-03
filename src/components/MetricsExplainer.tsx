import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartLine, CursorClick, Eye, ArrowsLeftRight, Gavel, TrendUp, Sparkle } from '@phosphor-icons/react'
import { useState } from 'react'

export function MetricsExplainer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="gradient-border bg-gradient-to-br from-accent/10 via-card to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Sparkle size={32} weight="duotone" className="text-accent animate-pulse" />
              Real Token Value System
            </CardTitle>
            <CardDescription className="mt-2">
              Your interactions directly increase token values in real-time
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Hide' : 'Learn More'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendUp size={24} weight="duotone" className="text-accent" />
              How Token Values Grow
            </h3>
            <p className="text-muted-foreground mb-4">
              Every action you take with tokens creates measurable value. The system tracks real engagement metrics and automatically adjusts token values based on actual usage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-purple-500/10">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <CursorClick size={24} weight="duotone" />
                  <span className="font-semibold">Clicks</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Each click adds <Badge variant="secondary">+$0.01</Badge> to token value
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500/10">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Eye size={24} weight="duotone" />
                  <span className="font-semibold">Views</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Each view adds <Badge variant="secondary">+$0.005</Badge> to token value
                </div>
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/10">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <ArrowsLeftRight size={24} weight="duotone" />
                  <span className="font-semibold">Transfers</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Each transfer adds <Badge variant="secondary">+$0.50</Badge> to token value
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <Gavel size={24} weight="duotone" />
                  <span className="font-semibold">Auction Bids</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Each bid adds <Badge variant="secondary">10% of bid value</Badge> to token
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border-accent/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ChartLine size={20} weight="duotone" />
                Network Effect Multiplier
              </h4>
              <p className="text-sm text-muted-foreground">
                More active users = higher token values. The system applies a logarithmic network effect multiplier based on the number of unique users interacting with each token.
              </p>
            </CardContent>
          </Card>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold">Key Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Real-time value updates every 30 seconds</li>
              <li>Historical value tracking with charts</li>
              <li>Transparent metric breakdowns</li>
              <li>Fair value calculation based on actual engagement</li>
              <li>All metrics are permanent and verifiable</li>
            </ul>
          </div>

          <div className="text-center pt-4">
            <Button size="lg" className="bg-gradient-to-r from-accent to-primary">
              <ChartLine size={20} weight="duotone" className="mr-2" />
              View Metrics Dashboard
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
