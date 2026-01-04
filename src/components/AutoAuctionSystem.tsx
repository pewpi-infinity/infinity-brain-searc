import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Gavel, Robot, Clock, Coins, TrendUp, Sparkle, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage, localStorageUtils } from '@/hooks/useLocalStorage'
import { useAuth } from '@/lib/auth'

interface AutoAuctionRule {
  id: string
  enabled: boolean
  tokenSymbol: string
  trigger: 'stale' | 'inactive' | 'threshold' | 'scheduled'
  staleDays?: number
  inactiveTransferDays?: number
  priceThreshold?: number
  scheduleInterval?: number
  minBid: number
  duration: number
  reservePrice?: number
  created: number
  lastTriggered?: number
  timesTriggered: number
}

interface StaleToken {
  symbol: string
  name: string
  holder: string
  amount: number
  lastActivity: number
  daysSinceActivity: number
  suggestedStartBid: number
}

export function AutoAuctionSystem() {
  const { userProfile, isAuthenticated } = useAuth()
  const [rules, setRules] = useLocalStorage<AutoAuctionRule[]>('auto-auction-rules', [])
  const [staleTokens, setStaleTokens] = useState<StaleToken[]>([])
  const [autoEnabled, setAutoEnabled] = useLocalStorage<boolean>('auto-auction-enabled', false)
  const [allProfiles] = useLocalStorage<Record<string, any>>('all-user-profiles', {})
  const [allTokens] = useLocalStorage<Record<string, any>>('business-tokens', {})
  
  const [newRuleToken, setNewRuleToken] = useState('')
  const [newRuleTrigger, setNewRuleTrigger] = useState<'stale' | 'inactive' | 'threshold' | 'scheduled'>('stale')
  const [newRuleStaleDays, setNewRuleStaleDays] = useState('30')
  const [newRuleMinBid, setNewRuleMinBid] = useState('100')
  const [newRuleDuration, setNewRuleDuration] = useState('48')
  const [newRuleReserve, setNewRuleReserve] = useState('')

  useEffect(() => {
    scanForStaleTokens()
  }, [allProfiles, allTokens])

  useEffect(() => {
    if (!autoEnabled) return

    const interval = setInterval(() => {
      processAutoAuctionRules()
    }, 60000)

    return () => clearInterval(interval)
  }, [autoEnabled, rules])

  const scanForStaleTokens = () => {
    const stale: StaleToken[] = []
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    if (!allProfiles) return

    Object.entries(allProfiles).forEach(([userId, profile]) => {
      if (!profile.businessTokens) return

      Object.entries(profile.businessTokens).forEach(([symbol, amount]) => {
        if (symbol === 'INF' || typeof amount !== 'number' || amount <= 0) return

        const lastActivity = profile.tokenActivity?.[symbol] || profile.createdAt || now
        const daysSinceActivity = Math.floor((now - lastActivity) / (24 * 60 * 60 * 1000))

        if (now - lastActivity > thirtyDays) {
          const tokenInfo = allTokens?.[symbol]
          stale.push({
            symbol,
            name: tokenInfo?.name || symbol,
            holder: profile.username || userId,
            amount: amount as number,
            lastActivity,
            daysSinceActivity,
            suggestedStartBid: Math.floor((amount as number) * 0.8)
          })
        }
      })
    })

    setStaleTokens(stale.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity))
  }

  const processAutoAuctionRules = async () => {
    if (!rules || rules.length === 0) return

    const now = Date.now()
    const enabledRules = rules.filter(r => r.enabled)

    for (const rule of enabledRules) {
      let shouldTrigger = false

      switch (rule.trigger) {
        case 'stale':
          const staleToken = staleTokens.find(t => t.symbol === rule.tokenSymbol)
          if (staleToken && staleToken.daysSinceActivity >= (rule.staleDays || 30)) {
            shouldTrigger = true
          }
          break

        case 'scheduled':
          const intervalMs = (rule.scheduleInterval || 168) * 60 * 60 * 1000
          if (!rule.lastTriggered || now - rule.lastTriggered >= intervalMs) {
            shouldTrigger = true
          }
          break

        case 'threshold':
          break

        case 'inactive':
          break
      }

      if (shouldTrigger) {
        await createAutoAuction(rule)
        
        setRules((currentRules) =>
          (currentRules || []).map(r =>
            r.id === rule.id
              ? { ...r, lastTriggered: now, timesTriggered: r.timesTriggered + 1 }
              : r
          )
        )
      }
    }
  }

  const createAutoAuction = async (rule: AutoAuctionRule) => {
    const staleToken = staleTokens.find(t => t.symbol === rule.tokenSymbol)
    if (!staleToken) return

    const auction = {
      id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenSymbol: rule.tokenSymbol,
      tokenName: staleToken.name,
      amount: staleToken.amount,
      startingBid: rule.minBid,
      currentBid: rule.minBid,
      reservePrice: rule.reservePrice,
      creatorId: 'system',
      creatorUsername: 'Auto-Auction System',
      startTime: Date.now(),
      endTime: Date.now() + (rule.duration * 60 * 60 * 1000),
      status: 'active' as const,
      bids: [],
      description: `Auto-listed: Stale token (${staleToken.daysSinceActivity} days inactive) from holder ${staleToken.holder}. Gets tokens back into circulation!`
    }

    const currentAuctions = localStorageUtils.get<any[]>('token-auctions', [])
    localStorageUtils.set('token-auctions', [...currentAuctions, auction])

    toast.success(`Auto-auction created for ${rule.tokenSymbol}`, {
      description: `Starting bid: ${rule.minBid} INF`
    })
  }

  const createRule = () => {
    if (!newRuleToken.trim()) {
      toast.error('Select a token')
      return
    }

    const rule: AutoAuctionRule = {
      id: `rule-${Date.now()}`,
      enabled: true,
      tokenSymbol: newRuleToken,
      trigger: newRuleTrigger,
      staleDays: newRuleTrigger === 'stale' ? parseInt(newRuleStaleDays) : undefined,
      inactiveTransferDays: newRuleTrigger === 'inactive' ? parseInt(newRuleStaleDays) : undefined,
      scheduleInterval: newRuleTrigger === 'scheduled' ? parseInt(newRuleStaleDays) : undefined,
      minBid: parseInt(newRuleMinBid),
      duration: parseInt(newRuleDuration),
      reservePrice: newRuleReserve ? parseInt(newRuleReserve) : undefined,
      created: Date.now(),
      timesTriggered: 0
    }

    setRules((current) => [...(current || []), rule])
    
    setNewRuleToken('')
    setNewRuleMinBid('100')
    setNewRuleDuration('48')
    setNewRuleReserve('')
    
    toast.success('Auto-auction rule created')
  }

  const toggleRule = (ruleId: string) => {
    setRules((current) =>
      (current || []).map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)
    )
  }

  const deleteRule = (ruleId: string) => {
    setRules((current) => (current || []).filter(r => r.id !== ruleId))
    toast.success('Rule deleted')
  }

  const manualTriggerStale = async (token: StaleToken) => {
    const auction = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      amount: token.amount,
      startingBid: token.suggestedStartBid,
      currentBid: token.suggestedStartBid,
      creatorId: 'system',
      creatorUsername: 'Circulation System',
      startTime: Date.now(),
      endTime: Date.now() + (48 * 60 * 60 * 1000),
      status: 'active' as const,
      bids: [],
      description: `Manually listed stale token (${token.daysSinceActivity} days inactive) to increase circulation`
    }

    const currentAuctions = localStorageUtils.get<any[]>('token-auctions', [])
    localStorageUtils.set('token-auctions', [...currentAuctions, auction])

    toast.success(`Auction created for ${token.symbol}`, {
      description: `Starting bid: ${token.suggestedStartBid} INF`
    })

    scanForStaleTokens()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Robot size={24} weight="duotone" className="text-primary" />
                Auto-Auction System
              </CardTitle>
              <CardDescription>
                Automatically list stale or inactive tokens to improve circulation
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="auto-enable" className="text-sm font-medium">
                {autoEnabled ? 'System Active' : 'System Inactive'}
              </Label>
              <Switch
                id="auto-enable"
                checked={autoEnabled}
                onCheckedChange={setAutoEnabled}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="stale" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stale">
            <Clock className="mr-2" size={16} />
            Stale Tokens ({staleTokens.length})
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Gavel className="mr-2" size={16} />
            Auto Rules ({rules?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="create">
            <Sparkle className="mr-2" size={16} />
            New Rule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stale" className="space-y-4">
          {autoEnabled && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                System is scanning for stale tokens every minute. Tokens inactive for 30+ days will be auto-listed.
              </AlertDescription>
            </Alert>
          )}

          {staleTokens.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No stale tokens detected</p>
                <p className="text-sm text-muted-foreground mt-2">
                  All tokens are actively circulating!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {staleTokens.map((token) => (
                <Card key={`${token.symbol}-${token.holder}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {token.symbol}
                          </Badge>
                          <span className="font-semibold">{token.name}</span>
                          <Badge variant="secondary">
                            {token.daysSinceActivity} days inactive
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <span>Holder: {token.holder}</span>
                            <Coins size={14} />
                            <span>{token.amount.toLocaleString()} tokens</span>
                          </div>
                          <div>
                            Last activity: {new Date(token.lastActivity).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <TrendUp size={14} />
                            Suggested starting bid: {token.suggestedStartBid.toLocaleString()} INF
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => manualTriggerStale(token)} size="sm">
                        <Gavel className="mr-2" size={16} />
                        List Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          {!rules || rules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Gavel size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No auto-auction rules configured</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create rules to automatically list tokens based on conditions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {rule.tokenSymbol}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteRule(rule.id)}>
                        Delete
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.trigger}
                        </Badge>
                        {rule.trigger === 'stale' && (
                          <span className="text-muted-foreground">
                            Triggers after {rule.staleDays} days of inactivity
                          </span>
                        )}
                        {rule.trigger === 'scheduled' && (
                          <span className="text-muted-foreground">
                            Triggers every {rule.scheduleInterval} hours
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        Min bid: {rule.minBid} INF • Duration: {rule.duration}h
                        {rule.reservePrice && ` • Reserve: ${rule.reservePrice} INF`}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(rule.created).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Triggered: {rule.timesTriggered} times</span>
                        {rule.lastTriggered && (
                          <>
                            <span>•</span>
                            <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Auto-Auction Rule</CardTitle>
              <CardDescription>
                Configure automatic auction triggers for token circulation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-token">Token Symbol</Label>
                  <Input
                    id="rule-token"
                    value={newRuleToken}
                    onChange={(e) => setNewRuleToken(e.target.value.toUpperCase())}
                    placeholder="e.g., TECH, DESIGN, AI"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-trigger">Trigger Type</Label>
                  <Select value={newRuleTrigger} onValueChange={(v: any) => setNewRuleTrigger(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stale">Stale (no activity)</SelectItem>
                      <SelectItem value="scheduled">Scheduled (time-based)</SelectItem>
                      <SelectItem value="inactive">Inactive transfers</SelectItem>
                      <SelectItem value="threshold">Price threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-days">
                  {newRuleTrigger === 'stale' && 'Days of Inactivity'}
                  {newRuleTrigger === 'scheduled' && 'Interval (hours)'}
                  {newRuleTrigger === 'inactive' && 'Days Without Transfers'}
                  {newRuleTrigger === 'threshold' && 'Threshold Value'}
                </Label>
                <Input
                  id="rule-days"
                  type="number"
                  value={newRuleStaleDays}
                  onChange={(e) => setNewRuleStaleDays(e.target.value)}
                  placeholder={newRuleTrigger === 'scheduled' ? '168' : '30'}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-min-bid">Minimum Bid (INF)</Label>
                  <Input
                    id="rule-min-bid"
                    type="number"
                    value={newRuleMinBid}
                    onChange={(e) => setNewRuleMinBid(e.target.value)}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-duration">Duration (hours)</Label>
                  <Input
                    id="rule-duration"
                    type="number"
                    value={newRuleDuration}
                    onChange={(e) => setNewRuleDuration(e.target.value)}
                    placeholder="48"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-reserve">Reserve Price (optional)</Label>
                  <Input
                    id="rule-reserve"
                    type="number"
                    value={newRuleReserve}
                    onChange={(e) => setNewRuleReserve(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button onClick={createRule} className="w-full">
                <Sparkle className="mr-2" size={16} />
                Create Auto-Auction Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
