import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowsClockwise, Warning, CheckCircle, TrendUp, UsersFour, Clock, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface TokenHolder {
  userId: string
  username: string
  tokenSymbol: string
  balance: number
  lastActivity: number
  activityScore: number
  status: 'active' | 'inactive' | 'dormant'
}

interface TransferRecord {
  id: string
  fromUser: string
  toUser: string
  tokenSymbol: string
  amount: number
  reason: string
  timestamp: number
  type: 'auto-redistribution' | 'activity-reward'
}

interface RedistributionConfig {
  enabled: boolean
  inactivityThreshold: number
  dormantThreshold: number
  redistributionPercentage: number
  targetTopTraders: number
  checkInterval: number
}

export function TokenActivityMonitor() {
  const [config, setConfig] = useKV<RedistributionConfig>('redistribution-config', {
    enabled: false,
    inactivityThreshold: 30,
    dormantThreshold: 90,
    redistributionPercentage: 25,
    targetTopTraders: 10,
    checkInterval: 24
  })
  
  const [holders, setHolders] = useKV<TokenHolder[]>('token-holders', [])
  const [transfers, setTransfers] = useKV<TransferRecord[]>('redistribution-transfers', [])
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useKV<number>('last-redistribution-scan', 0)
  const [stats, setStats] = useState({
    totalHolders: 0,
    activeHolders: 0,
    inactiveHolders: 0,
    dormantHolders: 0,
    tokensRedistributed: 0,
    totalTransfers: 0
  })

  useEffect(() => {
    calculateStats()
    
    if (config?.enabled) {
      const interval = setInterval(() => {
        const hoursSinceLastScan = (Date.now() - (lastScan || 0)) / (1000 * 60 * 60)
        if (hoursSinceLastScan >= (config?.checkInterval || 24)) {
          performAutoRedistribution()
        }
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [config?.enabled, config?.checkInterval, lastScan])

  const calculateStats = () => {
    if (!config || !holders || !transfers) return
    
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    
    const active = holders.filter(h => (now - h.lastActivity) / dayInMs < config.inactivityThreshold)
    const inactive = holders.filter(h => {
      const days = (now - h.lastActivity) / dayInMs
      return days >= config.inactivityThreshold && days < config.dormantThreshold
    })
    const dormant = holders.filter(h => (now - h.lastActivity) / dayInMs >= config.dormantThreshold)
    
    const totalRedistributed = transfers.reduce((sum, t) => sum + t.amount, 0)
    
    setStats({
      totalHolders: holders.length,
      activeHolders: active.length,
      inactiveHolders: inactive.length,
      dormantHolders: dormant.length,
      tokensRedistributed: totalRedistributed,
      totalTransfers: transfers.length
    })
  }

  const scanTokenActivity = async () => {
    if (!config) return
    
    setIsScanning(true)
    
    try {
      const allKeys = await window.spark.kv.keys()
      const balanceKeys = allKeys.filter(key => key.startsWith('balance-'))
      const activityKeys = allKeys.filter(key => key.startsWith('token-activity-'))
      
      const holdersData: TokenHolder[] = []
      const now = Date.now()
      
      for (const key of balanceKeys) {
        const parts = key.split('-')
        if (parts.length < 3) continue
        
        const userId = parts[1]
        const tokenSymbol = parts[2]
        
        const balance = await window.spark.kv.get<number>(key)
        if (!balance || balance <= 0) continue
        
        const activityKey = `token-activity-${userId}-${tokenSymbol}`
        const activityData = await window.spark.kv.get<{ lastActivity: number; score: number }>(activityKey)
        
        const lastActivity = activityData?.lastActivity || now - (100 * 24 * 60 * 60 * 1000)
        const activityScore = activityData?.score || 0
        
        const daysSinceActivity = (now - lastActivity) / (24 * 60 * 60 * 1000)
        
        let status: 'active' | 'inactive' | 'dormant' = 'active'
        if (daysSinceActivity >= config.dormantThreshold) {
          status = 'dormant'
        } else if (daysSinceActivity >= config.inactivityThreshold) {
          status = 'inactive'
        }
        
        holdersData.push({
          userId,
          username: userId,
          tokenSymbol,
          balance,
          lastActivity,
          activityScore,
          status
        })
      }
      
      setHolders(holdersData)
      setLastScan(now)
      
      toast.success(`Scanned ${holdersData.length} token holders`, {
        description: `Found ${holdersData.filter(h => h.status === 'inactive').length} inactive and ${holdersData.filter(h => h.status === 'dormant').length} dormant holders`
      })
    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Failed to scan token activity')
    } finally {
      setIsScanning(false)
    }
  }

  const performAutoRedistribution = async () => {
    if (!config?.enabled) return
    
    setIsScanning(true)
    
    try {
      await scanTokenActivity()
      
      const currentHolders = await window.spark.kv.get<TokenHolder[]>('token-holders') || []
      const inactiveAndDormant = currentHolders.filter(h => h.status === 'inactive' || h.status === 'dormant')
      const activeTraders = currentHolders
        .filter(h => h.status === 'active')
        .sort((a, b) => b.activityScore - a.activityScore)
        .slice(0, config.targetTopTraders)
      
      if (inactiveAndDormant.length === 0 || activeTraders.length === 0) {
        toast.info('No redistribution needed', {
          description: 'All holders are active or no active traders found'
        })
        setIsScanning(false)
        return
      }
      
      const newTransfers: TransferRecord[] = []
      
      for (const holder of inactiveAndDormant) {
        const redistributeAmount = Math.floor(holder.balance * (config.redistributionPercentage / 100))
        
        if (redistributeAmount <= 0) continue
        
        const amountPerTrader = Math.floor(redistributeAmount / activeTraders.length)
        
        if (amountPerTrader <= 0) continue
        
        const balanceKey = `balance-${holder.userId}-${holder.tokenSymbol}`
        const newBalance = holder.balance - redistributeAmount
        await window.spark.kv.set(balanceKey, newBalance)
        
        for (const trader of activeTraders) {
          const traderBalanceKey = `balance-${trader.userId}-${trader.tokenSymbol}`
          const traderBalance = await window.spark.kv.get<number>(traderBalanceKey) || 0
          await window.spark.kv.set(traderBalanceKey, traderBalance + amountPerTrader)
          
          newTransfers.push({
            id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromUser: holder.username,
            toUser: trader.username,
            tokenSymbol: holder.tokenSymbol,
            amount: amountPerTrader,
            reason: `Auto-redistribution from ${holder.status} holder`,
            timestamp: Date.now(),
            type: 'auto-redistribution'
          })
        }
      }
      
      if (newTransfers.length > 0) {
        setTransfers(currentTransfers => [...(currentTransfers || []), ...newTransfers])
        
        toast.success(`Redistributed tokens to active traders! 🚀`, {
          description: `${newTransfers.length} transfers completed from inactive holders`
        })
      } else {
        toast.info('No tokens redistributed', {
          description: 'Balances too small or no eligible transfers'
        })
      }
      
      calculateStats()
    } catch (error) {
      console.error('Redistribution error:', error)
      toast.error('Auto-redistribution failed')
    } finally {
      setIsScanning(false)
    }
  }

  const manualRedistribute = async () => {
    await performAutoRedistribution()
  }

  const resetSystem = async () => {
    if (!confirm('Reset all redistribution data? This will clear transfer history but not affect token balances.')) {
      return
    }
    
    setTransfers([])
    setLastScan(0)
    toast.success('Redistribution system reset')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-3">
                <ArrowsClockwise size={32} weight="duotone" className="text-primary" />
                Token Activity Monitor
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Automatic token redistribution from inactive holders to active traders - keeping tokens in circulation
              </CardDescription>
            </div>
            <Badge variant={config?.enabled ? "default" : "secondary"} className="text-sm px-3 py-1">
              {config?.enabled ? "Active" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <UsersFour size={32} weight="duotone" className="mx-auto text-primary" />
                  <div className="text-3xl font-bold">{stats.totalHolders}</div>
                  <div className="text-sm text-muted-foreground">Total Holders</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <CheckCircle size={32} weight="duotone" className="mx-auto text-green-500" />
                  <div className="text-3xl font-bold">{stats.activeHolders}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Warning size={32} weight="duotone" className="mx-auto text-orange-500" />
                  <div className="text-3xl font-bold">{stats.inactiveHolders}</div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Clock size={32} weight="duotone" className="mx-auto text-red-500" />
                  <div className="text-3xl font-bold">{stats.dormantHolders}</div>
                  <div className="text-sm text-muted-foreground">Dormant</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendUp size={24} weight="duotone" className="text-accent" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tokens Redistributed</div>
                      <div className="text-2xl font-bold">{stats.tokensRedistributed.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lightning size={24} weight="duotone" className="text-accent" />
                    <div>
                      <div className="text-sm text-muted-foreground">Total Transfers</div>
                      <div className="text-2xl font-bold">{stats.totalTransfers}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Redistribution Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-enable" className="text-base font-medium">Enable Auto-Redistribution</Label>
                  <p className="text-sm text-muted-foreground">Automatically transfer tokens from inactive holders to active traders</p>
                </div>
                <Switch
                  id="auto-enable"
                  checked={config?.enabled || false}
                  onCheckedChange={(checked) => setConfig(c => ({ ...(c || { enabled: false, inactivityThreshold: 30, dormantThreshold: 90, redistributionPercentage: 25, targetTopTraders: 10, checkInterval: 24 }), enabled: checked }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Inactivity Threshold: {config?.inactivityThreshold || 30} days</Label>
                <Slider
                  value={[config?.inactivityThreshold || 30]}
                  onValueChange={([value]) => setConfig(c => ({ ...(c || { enabled: false, inactivityThreshold: 30, dormantThreshold: 90, redistributionPercentage: 25, targetTopTraders: 10, checkInterval: 24 }), inactivityThreshold: value }))}
                  min={7}
                  max={90}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Holders inactive for this many days are flagged</p>
              </div>

              <div className="space-y-3">
                <Label>Dormant Threshold: {config?.dormantThreshold || 90} days</Label>
                <Slider
                  value={[config?.dormantThreshold || 90]}
                  onValueChange={([value]) => setConfig(c => ({ ...(c || { enabled: false, inactivityThreshold: 30, dormantThreshold: 90, redistributionPercentage: 25, targetTopTraders: 10, checkInterval: 24 }), dormantThreshold: value }))}
                  min={30}
                  max={365}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Holders inactive for this many days are considered dormant</p>
              </div>

              <div className="space-y-3">
                <Label>Redistribution Percentage: {config?.redistributionPercentage || 25}%</Label>
                <Slider
                  value={[config?.redistributionPercentage || 25]}
                  onValueChange={([value]) => setConfig(c => ({ ...(c || { enabled: false, inactivityThreshold: 30, dormantThreshold: 90, redistributionPercentage: 25, targetTopTraders: 10, checkInterval: 24 }), redistributionPercentage: value }))}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Percentage of inactive holder balance to redistribute</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="top-traders">Target Top Traders</Label>
                <Input
                  id="top-traders"
                  type="number"
                  value={config?.targetTopTraders || 10}
                  onChange={(e) => setConfig(c => ({ ...(c || { enabled: false, inactivityThreshold: 30, dormantThreshold: 90, redistributionPercentage: 25, targetTopTraders: 10, checkInterval: 24 }), targetTopTraders: parseInt(e.target.value) || 10 }))}
                  min={1}
                  max={100}
                />
                <p className="text-sm text-muted-foreground">Number of most active traders to receive redistributed tokens</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="check-interval">Check Interval (hours)</Label>
                <Input
                  id="check-interval"
                  type="number"
                  value={config?.checkInterval || 24}
                  onChange={(e) => setConfig(c => ({ ...(c || { enabled: false, inactivityThreshold: 30, dormantThreshold: 90, redistributionPercentage: 25, targetTopTraders: 10, checkInterval: 24 }), checkInterval: parseInt(e.target.value) || 24 }))}
                  min={1}
                  max={168}
                />
                <p className="text-sm text-muted-foreground">How often to check for inactive holders and redistribute</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={scanTokenActivity}
              disabled={isScanning}
              size="lg"
              className="flex-1 min-w-[200px]"
            >
              <ArrowsClockwise size={20} weight="bold" className={isScanning ? 'animate-spin' : ''} />
              {isScanning ? 'Scanning...' : 'Scan Activity Now'}
            </Button>
            
            <Button
              onClick={manualRedistribute}
              disabled={isScanning || !holders || holders.length === 0}
              variant="secondary"
              size="lg"
              className="flex-1 min-w-[200px]"
            >
              <Lightning size={20} weight="bold" />
              Manual Redistribution
            </Button>
            
            <Button
              onClick={resetSystem}
              variant="outline"
              size="lg"
            >
              <Warning size={20} weight="bold" />
              Reset System
            </Button>
          </div>

          {lastScan && lastScan > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Last scan: {new Date(lastScan).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {transfers && transfers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Redistributions</CardTitle>
            <CardDescription>Latest automatic token transfers from inactive to active holders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {transfers.slice(-20).reverse().map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{transfer.tokenSymbol}</Badge>
                      <span className="text-sm font-medium">{transfer.amount.toLocaleString()} tokens</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      From <span className="font-medium">{transfer.fromUser}</span> → To <span className="font-medium">{transfer.toUser}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {transfer.reason} • {new Date(transfer.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <CheckCircle size={24} weight="duotone" className="text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {holders && holders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Token Holder Status</CardTitle>
            <CardDescription>Current activity status of all token holders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {holders.map((holder, index) => {
                const daysSinceActivity = Math.floor((Date.now() - holder.lastActivity) / (24 * 60 * 60 * 1000))
                
                return (
                  <div
                    key={`${holder.userId}-${holder.tokenSymbol}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Badge
                        variant={
                          holder.status === 'active' ? 'default' :
                          holder.status === 'inactive' ? 'secondary' :
                          'destructive'
                        }
                        className="min-w-[80px] justify-center"
                      >
                        {holder.status}
                      </Badge>
                      <div>
                        <div className="font-medium">{holder.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {holder.balance.toLocaleString()} {holder.tokenSymbol} • Last active {daysSinceActivity}d ago
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Score: {holder.activityScore}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
