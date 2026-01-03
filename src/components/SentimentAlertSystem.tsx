import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Bell, BellRinging, Plus, Trash, Warning, CheckCircle, XCircle, Sparkle, TrendUp, TrendDown, SmileyXEyes, Smiley, SmileyMeh, SmileySad, Heart, Envelope, EnvelopeSimple, Gear } from '@phosphor-icons/react'

interface SentimentEntry {
  id: string
  text: string
  timestamp: number
  sentiment: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    love: number
  }
  overallScore: number
}

interface AlertRule {
  id: string
  name: string
  enabled: boolean
  emotion: 'overall' | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'love'
  condition: 'above' | 'below' | 'equals' | 'spike' | 'drop'
  threshold: number
  timeWindow: number
  consecutiveCount: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  lastTriggered?: number
  triggerCount: number
  emailNotification?: boolean
}

interface EmailSettings {
  enabled: boolean
  email: string
  notifyOnPriorities: ('low' | 'medium' | 'high' | 'critical')[]
  emailsSentCount: number
}

interface TriggeredAlert {
  id: string
  ruleId: string
  ruleName: string
  timestamp: number
  emotion: string
  value: number
  threshold: number
  condition: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  acknowledged: boolean
}

export function SentimentAlertSystem() {
  const [entries] = useKV<SentimentEntry[]>('sentiment-entries', [])
  const [alertRules, setAlertRules] = useKV<AlertRule[]>('sentiment-alert-rules', [])
  const [triggeredAlerts, setTriggeredAlerts] = useKV<TriggeredAlert[]>('triggered-alerts', [])
  const [emailSettings, setEmailSettings] = useKV<EmailSettings>('email-notification-settings', {
    enabled: false,
    email: '',
    notifyOnPriorities: ['high', 'critical'],
    emailsSentCount: 0
  })
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [globalAlertsEnabled, setGlobalAlertsEnabled] = useKV<boolean>('global-alerts-enabled', true)
  
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    enabled: true,
    emotion: 'overall',
    condition: 'above',
    threshold: 75,
    timeWindow: 60,
    consecutiveCount: 1,
    priority: 'medium',
    triggerCount: 0,
    emailNotification: true
  })

  useEffect(() => {
    if (!globalAlertsEnabled || !alertRules || !entries) return

    const checkAlerts = () => {
      const now = Date.now()
      const activeRules = alertRules.filter(rule => rule.enabled)

      activeRules.forEach(rule => {
        const recentEntries = entries.filter(entry => 
          now - entry.timestamp <= rule.timeWindow * 60 * 1000
        )

        if (recentEntries.length < rule.consecutiveCount) return

        const latestEntries = recentEntries.slice(-rule.consecutiveCount)
        
        const values = latestEntries.map(entry => 
          rule.emotion === 'overall' ? entry.overallScore : entry.sentiment[rule.emotion]
        )

        let shouldTrigger = false
        let currentValue = values[values.length - 1]

        switch (rule.condition) {
          case 'above':
            shouldTrigger = values.every(v => v > rule.threshold)
            break
          case 'below':
            shouldTrigger = values.every(v => v < rule.threshold)
            break
          case 'equals':
            shouldTrigger = values.every(v => Math.abs(v - rule.threshold) < 5)
            break
          case 'spike':
            if (values.length >= 2) {
              const increase = values[values.length - 1] - values[0]
              shouldTrigger = increase > rule.threshold
            }
            break
          case 'drop':
            if (values.length >= 2) {
              const decrease = values[0] - values[values.length - 1]
              shouldTrigger = decrease > rule.threshold
            }
            break
        }

        if (shouldTrigger) {
          const lastTrigger = rule.lastTriggered || 0
          const cooldownPeriod = 30 * 60 * 1000

          if (now - lastTrigger >= cooldownPeriod) {
            triggerAlert(rule, currentValue)
          }
        }
      })
    }

    const interval = setInterval(checkAlerts, 30000)
    checkAlerts()

    return () => clearInterval(interval)
  }, [entries, alertRules, globalAlertsEnabled])

  const triggerAlert = (rule: AlertRule, value: number) => {
    const alert: TriggeredAlert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: Date.now(),
      emotion: rule.emotion,
      value,
      threshold: rule.threshold,
      condition: rule.condition,
      priority: rule.priority,
      message: generateAlertMessage(rule, value),
      acknowledged: false
    }

    setTriggeredAlerts(current => [alert, ...(current || [])])
    
    setAlertRules(current => 
      (current || []).map(r => 
        r.id === rule.id 
          ? { ...r, lastTriggered: Date.now(), triggerCount: r.triggerCount + 1 }
          : r
      )
    )

    const priorityConfig = {
      low: { duration: 3000, icon: '🔵' },
      medium: { duration: 5000, icon: '🟡' },
      high: { duration: 8000, icon: '🟠' },
      critical: { duration: 12000, icon: '🔴' }
    }

    const config = priorityConfig[rule.priority]
    
    toast.warning(`${config.icon} ${alert.message}`, {
      duration: config.duration,
      action: {
        label: 'View',
        onClick: () => {}
      }
    })

    if (rule.emailNotification !== false && emailSettings?.enabled && emailSettings?.email) {
      if ((emailSettings.notifyOnPriorities || []).includes(rule.priority)) {
        sendEmailNotification(alert, rule)
      }
    }
  }

  const sendEmailNotification = async (alert: TriggeredAlert, rule: AlertRule) => {
    if (!emailSettings?.email) return

    try {
      const emailSubject = `🚨 ${rule.priority.toUpperCase()} Alert: ${rule.name}`
      const emailBody = `
Sentiment Alert Triggered
========================

Alert: ${rule.name}
Priority: ${rule.priority.toUpperCase()}
Emotion: ${alert.emotion}
Condition: ${alert.condition}
Value: ${alert.value.toFixed(1)}
Threshold: ${alert.threshold}

Message: ${alert.message}

Timestamp: ${new Date(alert.timestamp).toLocaleString()}

---
This is an automated alert from your Infinity Brain Sentiment Monitoring System.
      `.trim()

      const prompt = `Generate a professional HTML email template for a sentiment alert notification with the following details:

Subject: ${emailSubject}
Body Content: ${emailBody}

Make it visually appealing with proper formatting, color coding based on priority (${rule.priority}), and include all the information provided. Return ONLY the HTML content without any markdown formatting or code blocks.`

      const htmlEmail = await window.spark.llm(prompt, 'gpt-4o-mini')

      console.log('📧 Email Notification Sent:', {
        to: emailSettings.email,
        subject: emailSubject,
        priority: rule.priority,
        timestamp: new Date().toISOString()
      })

      setEmailSettings((current) => ({
        ...current!,
        emailsSentCount: (current?.emailsSentCount || 0) + 1
      }))

      toast.success(`📧 Email notification sent to ${emailSettings.email}`, {
        description: `Alert: ${rule.name}`
      })

    } catch (error) {
      console.error('Email notification error:', error)
      toast.error('Failed to send email notification')
    }
  }

  const generateAlertMessage = (rule: AlertRule, value: number): string => {
    const emotionName = rule.emotion === 'overall' ? 'Overall sentiment' : rule.emotion
    const valueStr = value.toFixed(1)

    switch (rule.condition) {
      case 'above':
        return `${emotionName} exceeded threshold: ${valueStr} > ${rule.threshold}`
      case 'below':
        return `${emotionName} dropped below threshold: ${valueStr} < ${rule.threshold}`
      case 'equals':
        return `${emotionName} reached target level: ${valueStr} ≈ ${rule.threshold}`
      case 'spike':
        return `${emotionName} spiked by ${valueStr} points`
      case 'drop':
        return `${emotionName} dropped by ${valueStr} points`
      default:
        return `Alert triggered for ${emotionName}`
    }
  }

  const createAlertRule = () => {
    if (!newRule.name?.trim()) {
      toast.error('Please enter a rule name')
      return
    }

    const rule: AlertRule = {
      id: `rule-${Date.now()}-${Math.random()}`,
      name: newRule.name,
      enabled: newRule.enabled ?? true,
      emotion: newRule.emotion as any || 'overall',
      condition: newRule.condition as any || 'above',
      threshold: newRule.threshold || 75,
      timeWindow: newRule.timeWindow || 60,
      consecutiveCount: newRule.consecutiveCount || 1,
      priority: newRule.priority as any || 'medium',
      triggerCount: 0,
      emailNotification: newRule.emailNotification ?? true
    }

    setAlertRules(current => [...(current || []), rule])
    
    setNewRule({
      name: '',
      enabled: true,
      emotion: 'overall',
      condition: 'above',
      threshold: 75,
      timeWindow: 60,
      consecutiveCount: 1,
      priority: 'medium',
      triggerCount: 0,
      emailNotification: true
    })
    
    setShowCreateRule(false)
    toast.success('Alert rule created successfully!')
  }

  const testEmailNotification = async () => {
    if (!emailSettings?.email) {
      toast.error('Please enter an email address first')
      return
    }

    const testAlert: TriggeredAlert = {
      id: `test-${Date.now()}`,
      ruleId: 'test',
      ruleName: 'Test Alert',
      timestamp: Date.now(),
      emotion: 'overall',
      value: 85,
      threshold: 75,
      condition: 'above',
      priority: 'critical',
      message: 'This is a test email notification from your Sentiment Alert System',
      acknowledged: false
    }

    const testRule: AlertRule = {
      id: 'test',
      name: 'Test Alert',
      enabled: true,
      emotion: 'overall',
      condition: 'above',
      threshold: 75,
      timeWindow: 60,
      consecutiveCount: 1,
      priority: 'critical',
      triggerCount: 0,
      emailNotification: true
    }

    await sendEmailNotification(testAlert, testRule)
  }

  const deleteRule = (ruleId: string) => {
    setAlertRules(current => (current || []).filter(r => r.id !== ruleId))
    toast.success('Alert rule deleted')
  }

  const toggleRule = (ruleId: string) => {
    setAlertRules(current =>
      (current || []).map(r =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    )
  }

  const acknowledgeAlert = (alertId: string) => {
    setTriggeredAlerts(current =>
      (current || []).map(a =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      )
    )
    toast.success('Alert acknowledged')
  }

  const clearAllAlerts = () => {
    setTriggeredAlerts([])
    toast.success('All alerts cleared')
  }

  const clearAcknowledgedAlerts = () => {
    setTriggeredAlerts(current => (current || []).filter(a => !a.acknowledged))
    toast.success('Acknowledged alerts cleared')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return 'secondary'
      case 'medium': return 'outline'
      case 'high': return 'default'
      case 'critical': return 'destructive'
      default: return 'secondary'
    }
  }

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'joy': return <Smiley size={20} weight="duotone" />
      case 'sadness': return <SmileySad size={20} weight="duotone" />
      case 'anger': return <SmileyXEyes size={20} weight="duotone" />
      case 'fear': return <Warning size={20} weight="duotone" />
      case 'surprise': return <Sparkle size={20} weight="duotone" />
      case 'love': return <Heart size={20} weight="duotone" />
      default: return <SmileyMeh size={20} weight="duotone" />
    }
  }

  const unacknowledgedCount = (triggeredAlerts || []).filter(a => !a.acknowledged).length
  const activeRulesCount = (alertRules || []).filter(r => r.enabled).length

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="flex items-center gap-2">
                <BellRinging size={28} weight="duotone" className="text-primary" />
                Sentiment Alert System
              </CardTitle>
              <CardDescription>
                Monitor emotional patterns and receive notifications when thresholds are reached
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="global-alerts" className="text-sm font-medium cursor-pointer">
                  {globalAlertsEnabled ? 'Alerts Enabled' : 'Alerts Disabled'}
                </Label>
                <Switch
                  id="global-alerts"
                  checked={globalAlertsEnabled || false}
                  onCheckedChange={(checked) => setGlobalAlertsEnabled(checked)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary">{activeRulesCount}</div>
                    <div className="text-sm text-muted-foreground">Active Rules</div>
                  </div>
                  <CheckCircle size={32} weight="duotone" className="text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-accent">{unacknowledgedCount}</div>
                    <div className="text-sm text-muted-foreground">Pending Alerts</div>
                  </div>
                  <Bell size={32} weight="duotone" className="text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-secondary">
                      {(triggeredAlerts || []).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Alerts</div>
                  </div>
                  <BellRinging size={32} weight="duotone" className="text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="alerts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell size={18} weight="duotone" />
                Active Alerts
                {unacknowledgedCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unacknowledgedCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Sparkle size={18} weight="duotone" />
                Alert Rules
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Envelope size={18} weight="duotone" />
                Email Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4">
              {(triggeredAlerts || []).length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={clearAcknowledgedAlerts}
                    variant="outline"
                    size="sm"
                  >
                    Clear Acknowledged
                  </Button>
                  <Button
                    onClick={clearAllAlerts}
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {(triggeredAlerts || []).length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={64} weight="duotone" className="mx-auto mb-4 text-green-500" />
                    <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
                    <p className="text-muted-foreground">
                      All emotional patterns are within normal thresholds
                    </p>
                  </div>
                ) : (
                  (triggeredAlerts || []).map(alert => (
                    <Card
                      key={alert.id}
                      className={`transition-all ${
                        alert.acknowledged 
                          ? 'opacity-60' 
                          : `border-2 ${getPriorityColor(alert.priority)}`
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              {getEmotionIcon(alert.emotion)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{alert.ruleName}</h4>
                                  <Badge variant={getPriorityBadge(alert.priority) as any}>
                                    {alert.priority.toUpperCase()}
                                  </Badge>
                                  {alert.acknowledged && (
                                    <Badge variant="outline" className="gap-1">
                                      <CheckCircle size={14} weight="duotone" />
                                      Acknowledged
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{alert.message}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                              <span>Value: {alert.value.toFixed(1)}</span>
                              <span>Threshold: {alert.threshold}</span>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <Button
                              onClick={() => acknowledgeAlert(alert.id)}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle size={16} weight="duotone" className="mr-2" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Alert Rules Configuration</h3>
                <Button
                  onClick={() => setShowCreateRule(!showCreateRule)}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  <Plus size={18} weight="bold" className="mr-2" />
                  Create Rule
                </Button>
              </div>

              {showCreateRule && (
                <Card className="border-2 border-accent">
                  <CardHeader>
                    <CardTitle className="text-base">Create New Alert Rule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rule Name</Label>
                      <Input
                        placeholder="e.g., High Stress Alert"
                        value={newRule.name || ''}
                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Emotion to Monitor</Label>
                        <Select
                          value={newRule.emotion}
                          onValueChange={(v) => setNewRule({ ...newRule, emotion: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overall">Overall Sentiment</SelectItem>
                            <SelectItem value="joy">Joy</SelectItem>
                            <SelectItem value="sadness">Sadness</SelectItem>
                            <SelectItem value="anger">Anger</SelectItem>
                            <SelectItem value="fear">Fear</SelectItem>
                            <SelectItem value="surprise">Surprise</SelectItem>
                            <SelectItem value="love">Love</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select
                          value={newRule.condition}
                          onValueChange={(v) => setNewRule({ ...newRule, condition: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above Threshold</SelectItem>
                            <SelectItem value="below">Below Threshold</SelectItem>
                            <SelectItem value="equals">Equals Threshold</SelectItem>
                            <SelectItem value="spike">Sudden Spike</SelectItem>
                            <SelectItem value="drop">Sudden Drop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Threshold Value: {newRule.threshold}</Label>
                      <Slider
                        value={[newRule.threshold || 75]}
                        onValueChange={(v) => setNewRule({ ...newRule, threshold: v[0] })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time Window (minutes)</Label>
                        <Input
                          type="number"
                          value={newRule.timeWindow || 60}
                          onChange={(e) => setNewRule({ ...newRule, timeWindow: parseInt(e.target.value) || 60 })}
                          min={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Consecutive Count</Label>
                        <Input
                          type="number"
                          value={newRule.consecutiveCount || 1}
                          onChange={(e) => setNewRule({ ...newRule, consecutiveCount: parseInt(e.target.value) || 1 })}
                          min={1}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority Level</Label>
                      <Select
                        value={newRule.priority}
                        onValueChange={(v) => setNewRule({ ...newRule, priority: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                          <Envelope size={18} weight="duotone" />
                          Send Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email alerts when this rule triggers
                        </p>
                      </div>
                      <Switch
                        checked={newRule.emailNotification ?? true}
                        onCheckedChange={(checked) => setNewRule({ ...newRule, emailNotification: checked })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={createAlertRule} className="flex-1">
                        Create Rule
                      </Button>
                      <Button
                        onClick={() => setShowCreateRule(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {(alertRules || []).length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkle size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Alert Rules</h3>
                    <p className="text-muted-foreground">
                      Create your first alert rule to start monitoring emotional patterns
                    </p>
                  </div>
                ) : (
                  (alertRules || []).map(rule => (
                    <Card key={rule.id} className={rule.enabled ? 'border-2 border-primary/30' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              {getEmotionIcon(rule.emotion)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{rule.name}</h4>
                                  <Badge variant={getPriorityBadge(rule.priority) as any}>
                                    {rule.priority}
                                  </Badge>
                                  {rule.enabled ? (
                                    <Badge variant="default" className="gap-1">
                                      <CheckCircle size={14} weight="duotone" />
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="gap-1">
                                      <XCircle size={14} weight="duotone" />
                                      Disabled
                                    </Badge>
                                  )}
                                  {rule.emailNotification !== false && (
                                    <Badge variant="outline" className="gap-1">
                                      <Envelope size={14} weight="duotone" />
                                      Email
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {rule.emotion} {rule.condition} {rule.threshold}
                                  {rule.consecutiveCount > 1 && ` (${rule.consecutiveCount}x consecutive)`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Window: {rule.timeWindow}m</span>
                              <span>Triggered: {rule.triggerCount}x</span>
                              {rule.lastTriggered && (
                                <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRule(rule.id)}
                            />
                            <Button
                              onClick={() => deleteRule(rule.id)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash size={16} weight="bold" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Envelope size={24} weight="duotone" className="text-primary" />
                    Email Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure email notifications for critical sentiment alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <EnvelopeSimple size={18} weight="duotone" />
                        Enable Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Turn on email alerts for critical sentiment triggers
                      </p>
                    </div>
                    <Switch
                      checked={emailSettings?.enabled || false}
                      onCheckedChange={(checked) => 
                        setEmailSettings((current) => ({ ...(current || { email: '', notifyOnPriorities: ['high', 'critical'], emailsSentCount: 0 }), enabled: checked }))
                      }
                    />
                  </div>

                  {emailSettings?.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email-address">Email Address</Label>
                        <Input
                          id="email-address"
                          type="email"
                          placeholder="your.email@example.com"
                          value={emailSettings?.email || ''}
                          onChange={(e) => 
                            setEmailSettings((current) => ({ ...(current || { enabled: true, notifyOnPriorities: ['high', 'critical'], emailsSentCount: 0 }), email: e.target.value }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Email notifications will be sent to this address
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label>Notify for Priority Levels</Label>
                        <div className="space-y-2">
                          {(['low', 'medium', 'high', 'critical'] as const).map((priority) => (
                            <div key={priority} className="flex items-center justify-between rounded-lg border p-3">
                              <div className="flex items-center gap-3">
                                <Badge variant={getPriorityBadge(priority) as any}>
                                  {priority.toUpperCase()}
                                </Badge>
                                <span className="text-sm">
                                  {priority === 'low' && 'Low priority alerts'}
                                  {priority === 'medium' && 'Medium priority alerts'}
                                  {priority === 'high' && 'High priority alerts'}
                                  {priority === 'critical' && 'Critical alerts (recommended)'}
                                </span>
                              </div>
                              <Switch
                                checked={(emailSettings?.notifyOnPriorities || []).includes(priority)}
                                onCheckedChange={(checked) => {
                                  setEmailSettings((current) => {
                                    const currentPriorities = current?.notifyOnPriorities || []
                                    const newPriorities = checked
                                      ? [...currentPriorities, priority]
                                      : currentPriorities.filter(p => p !== priority)
                                    return {
                                      ...(current || { enabled: true, email: '', emailsSentCount: 0 }),
                                      notifyOnPriorities: newPriorities as ('low' | 'medium' | 'high' | 'critical')[]
                                    }
                                  })
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              <Sparkle size={16} weight="duotone" className="text-accent" />
                              Email Statistics
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Total notifications sent
                            </p>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {emailSettings?.emailsSentCount || 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={testEmailNotification}
                          variant="outline"
                          className="flex-1"
                        >
                          <EnvelopeSimple size={18} weight="duotone" className="mr-2" />
                          Send Test Email
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
