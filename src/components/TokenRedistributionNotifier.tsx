import { useState, useEffect } from 'react'
import { useLocalStorage, localStorageUtils } from '@/hooks/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, BellRinging, Warning, CheckCircle, Clock, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface TokenHolding {
  tokenSymbol: string
  amount: number
  lastActivity: number
  daysUntilRedistribution: number
  warningLevel: 'safe' | 'warning' | 'critical' | 'imminent'
}

interface NotificationSettings {
  enabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  warningThreshold: number
  email?: string
}

export function TokenRedistributionNotifier() {
  const [holdings, setHoldings] = useLocalStorage<TokenHolding[]>('user-token-holdings', [])
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>('notification-settings', {
    enabled: true,
    emailNotifications: false,
    pushNotifications: true,
    warningThreshold: 7
  })
  const [dismissedWarnings, setDismissedWarnings] = useLocalStorage<string[]>('dismissed-warnings', [])
  const [activeWarnings, setActiveWarnings] = useState<TokenHolding[]>([])
  const [lastCheck, setLastCheck] = useLocalStorage<number>('last-notification-check', Date.now())

  useEffect(() => {
    checkTokenActivity()
    const interval = setInterval(checkTokenActivity, 60000)
    return () => clearInterval(interval)
  }, [holdings, notifications])

  const checkTokenActivity = async () => {
    if (!notifications || !notifications.enabled) return

    const now = Date.now()
    const daysSinceLastCheck = (now - (lastCheck || 0)) / (1000 * 60 * 60 * 24)

    const warnings = (holdings || [])
      .filter(h => h.daysUntilRedistribution <= (notifications?.warningThreshold || 7))
      .filter(h => !(dismissedWarnings || []).includes(`${h.tokenSymbol}-${h.lastActivity}`))
      .sort((a, b) => a.daysUntilRedistribution - b.daysUntilRedistribution)

    setActiveWarnings(warnings)

    if (warnings.length > 0 && daysSinceLastCheck > 0.5) {
      const criticalWarnings = warnings.filter(w => w.warningLevel === 'critical' || w.warningLevel === 'imminent')
      
      if (criticalWarnings.length > 0) {
        toast.error(`⚠️ Token Redistribution Alert!`, {
          description: `${criticalWarnings.length} token(s) will be redistributed soon. Take action now!`,
          duration: 10000,
          action: {
            label: 'View',
            onClick: () => {}
          }
        })
      } else if (warnings.length > 0) {
        toast.warning('Token Activity Reminder', {
          description: `${warnings.length} token(s) approaching inactivity threshold`,
          duration: 5000
        })
      }

      setLastCheck(now)
    }
  }

  const calculateTokenActivity = async (tokenSymbol: string) => {
    const tokens = localStorageUtils.get<any[]>('minted-tokens', [])
    const token = tokens.find(t => t.symbol === tokenSymbol)
    
    if (token) {
      const now = Date.now()
      const lastActivity = token.lastActivity || token.createdAt
      const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24)
      const inactivityThreshold = 30
      const daysUntilRedistribution = Math.max(0, inactivityThreshold - daysSinceActivity)

      let warningLevel: TokenHolding['warningLevel'] = 'safe'
      if (daysUntilRedistribution <= 1) warningLevel = 'imminent'
      else if (daysUntilRedistribution <= 3) warningLevel = 'critical'
      else if (daysUntilRedistribution <= 7) warningLevel = 'warning'

      return {
        tokenSymbol,
        amount: token.supply,
        lastActivity,
        daysUntilRedistribution,
        warningLevel
      }
    }

    return null
  }

  const refreshHoldings = async () => {
    const tokens = localStorageUtils.get<any[]>('minted-tokens', [])
    // TODO: Remove Spark user() call - use auth context instead
    // const user = await window.spark.user()
    if (!user) return
    const userTokens = tokens.filter(t => t.owner === user.login)

    const updatedHoldings = await Promise.all(
      userTokens.map(t => calculateTokenActivity(t.symbol))
    )

    setHoldings((current) => updatedHoldings.filter(Boolean) as TokenHolding[])
    toast.success('Holdings refreshed')
  }

  const takeActivity = async (tokenSymbol: string) => {
    const tokens = localStorageUtils.get<any[]>('minted-tokens', [])
    const tokenIndex = tokens.findIndex(t => t.symbol === tokenSymbol)

    if (tokenIndex !== -1) {
      tokens[tokenIndex].lastActivity = Date.now()
      localStorageUtils.set('minted-tokens', tokens)
      
      await refreshHoldings()
      
      toast.success(`Activity recorded for ${tokenSymbol}`, {
        description: 'Your 30-day inactivity timer has been reset'
      })
    }
  }

  const dismissWarning = (tokenSymbol: string, lastActivity: number) => {
    setDismissedWarnings((current) => [...(current || []), `${tokenSymbol}-${lastActivity}`])
  }

  const getWarningColor = (level: TokenHolding['warningLevel']) => {
    switch (level) {
      case 'imminent': return 'text-red-600 bg-red-50 border-red-200'
      case 'critical': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getWarningIcon = (level: TokenHolding['warningLevel']) => {
    switch (level) {
      case 'imminent': return <BellRinging size={20} weight="fill" className="text-red-600 animate-pulse" />
      case 'critical': return <Warning size={20} weight="fill" className="text-orange-600" />
      case 'warning': return <Clock size={20} weight="fill" className="text-yellow-600" />
      default: return <CheckCircle size={20} weight="fill" className="text-green-600" />
    }
  }

  const formatTimeRemaining = (days: number) => {
    if (days < 1) {
      const hours = Math.floor(days * 24)
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    return `${Math.floor(days)} day${Math.floor(days) !== 1 ? 's' : ''}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Bell size={24} weight="duotone" className="text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Token Redistribution Alerts</CardTitle>
                <CardDescription>Stay active to keep your tokens</CardDescription>
              </div>
            </div>
            <Button onClick={refreshHoldings} variant="outline">
              Refresh Holdings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
            <div className="flex items-start gap-3">
              <Warning size={24} weight="duotone" className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How Token Redistribution Works</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tokens held without any activity for <strong>30 days</strong> are automatically redistributed to active traders. 
                  This ensures tokens circulate in the ecosystem and rewards active participants.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="gap-1.5">
                    <CheckCircle size={14} weight="fill" className="text-green-600" />
                    Safe: 8+ days
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Clock size={14} weight="fill" className="text-yellow-600" />
                    Warning: 4-7 days
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <Warning size={14} weight="fill" className="text-orange-600" />
                    Critical: 2-3 days
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <BellRinging size={14} weight="fill" className="text-red-600" />
                    Imminent: &lt;24 hours
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell size={20} weight="duotone" />
              Notification Settings
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled" className="cursor-pointer">
                  Enable Notifications
                </Label>
                <Switch
                  id="notifications-enabled"
                  checked={notifications?.enabled ?? true}
                  onCheckedChange={(checked) => 
                    setNotifications((current) => ({ 
                      ...(current || { enabled: true, emailNotifications: false, pushNotifications: true, warningThreshold: 7 }), 
                      enabled: checked 
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="cursor-pointer">
                  Browser Push Notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={notifications?.pushNotifications ?? true}
                  disabled={!notifications?.enabled}
                  onCheckedChange={(checked) => 
                    setNotifications((current) => ({ 
                      ...(current || { enabled: true, emailNotifications: false, pushNotifications: true, warningThreshold: 7 }), 
                      pushNotifications: checked 
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warning-threshold">
                  Warning Threshold (days before redistribution)
                </Label>
                <Input
                  id="warning-threshold"
                  type="number"
                  min="1"
                  max="29"
                  value={notifications?.warningThreshold ?? 7}
                  disabled={!notifications?.enabled}
                  onChange={(e) => 
                    setNotifications((current) => ({ 
                      ...(current || { enabled: true, emailNotifications: false, pushNotifications: true, warningThreshold: 7 }), 
                      warningThreshold: parseInt(e.target.value) || 7 
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive alerts when tokens have this many days or fewer remaining
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Warning size={20} weight="duotone" />
                Active Warnings
              </h3>
              {activeWarnings.length > 0 && (
                <Badge variant="destructive" className="gap-1.5">
                  <BellRinging size={14} weight="fill" />
                  {activeWarnings.length}
                </Badge>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {activeWarnings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12 rounded-lg border-2 border-dashed"
                >
                  <CheckCircle size={48} weight="duotone" className="mx-auto mb-3 text-green-500" />
                  <p className="font-medium text-lg mb-1">All Tokens Safe</p>
                  <p className="text-sm text-muted-foreground">
                    No tokens are at risk of redistribution
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-3">
                  {activeWarnings.map((warning, index) => (
                    <motion.div
                      key={`${warning.tokenSymbol}-${warning.lastActivity}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`border-2 ${getWarningColor(warning.warningLevel)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {getWarningIcon(warning.warningLevel)}
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-lg">{warning.tokenSymbol}</h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {warning.amount} tokens
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    Redistribution in {formatTimeRemaining(warning.daysUntilRedistribution)}
                                  </p>
                                  <Progress 
                                    value={(warning.daysUntilRedistribution / 30) * 100} 
                                    className="h-2"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Last activity: {new Date(warning.lastActivity).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => takeActivity(warning.tokenSymbol)}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                  >
                                    Record Activity
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => dismissWarning(warning.tokenSymbol, warning.lastActivity)}
                                  >
                                    Dismiss
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={() => dismissWarning(warning.tokenSymbol, warning.lastActivity)}
                            >
                              <X size={20} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle size={20} weight="duotone" />
              All Token Holdings
            </h3>
            {!holdings || holdings.length === 0 ? (
              <div className="text-center py-8 rounded-lg border-2 border-dashed">
                <p className="text-sm text-muted-foreground">
                  No token holdings found. Mint tokens to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {holdings.map((holding) => (
                  <Card key={holding.tokenSymbol}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getWarningIcon(holding.warningLevel)}
                          <div>
                            <p className="font-semibold">{holding.tokenSymbol}</p>
                            <p className="text-xs text-muted-foreground">
                              {holding.amount} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatTimeRemaining(holding.daysUntilRedistribution)}
                          </p>
                          <p className="text-xs text-muted-foreground">remaining</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
