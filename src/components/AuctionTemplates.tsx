import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  ClockClockwise,
  CalendarPlus,
  Lightning,
  Copy,
  Trash,
  Play,
  Pause,
  Check,
  Plus,
  ArrowsClockwise,
  Timer,
  Sparkle,
  ListChecks,
  FileText
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { TokenAuction } from './TokenAuction'

export interface AuctionTemplate {
  id: string
  name: string
  description: string
  tokenSymbol: string
  amount: number
  startingBid: number
  reservePrice?: number
  duration: number
  recurring: boolean
  recurringInterval?: number
  recurringUnit?: 'hours' | 'days' | 'weeks'
  autoStart: boolean
  createdAt: number
  createdBy: string
  isActive: boolean
  scheduledAuctions: ScheduledAuction[]
}

export interface ScheduledAuction {
  id: string
  templateId: string
  scheduledTime: number
  status: 'pending' | 'launched' | 'cancelled'
  auctionId?: string
}

export function AuctionTemplates() {
  const [templates, setTemplates] = useKV<AuctionTemplate[]>('auction-templates', [])
  const [auctions, setAuctions] = useKV<TokenAuction[]>('token-auctions', [])
  const [allTokens] = useKV<Record<string, any>>('business-tokens', {})

  const [isCreating, setIsCreating] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AuctionTemplate | null>(null)

  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [selectedToken, setSelectedToken] = useState('')
  const [amount, setAmount] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [duration, setDuration] = useState('24')
  const [recurring, setRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState('7')
  const [recurringUnit, setRecurringUnit] = useState<'hours' | 'days' | 'weeks'>('days')
  const [autoStart, setAutoStart] = useState(false)

  const availableTokens = userProfile 
    ? Object.keys(userProfile.businessTokens).filter(
        symbol => userProfile.businessTokens[symbol] > 0 && symbol !== 'INF'
      )
    : []

  const resetForm = () => {
    setTemplateName('')
    setTemplateDescription('')
    setSelectedToken('')
    setAmount('')
    setStartingBid('')
    setReservePrice('')
    setDuration('24')
    setRecurring(false)
    setRecurringInterval('7')
    setRecurringUnit('days')
    setAutoStart(false)
    setEditingTemplate(null)
  }

  const loadTemplate = (template: AuctionTemplate) => {
    setEditingTemplate(template)
    setTemplateName(template.name)
    setTemplateDescription(template.description)
    setSelectedToken(template.tokenSymbol)
    setAmount(template.amount.toString())
    setStartingBid(template.startingBid.toString())
    setReservePrice(template.reservePrice?.toString() || '')
    setDuration(template.duration.toString())
    setRecurring(template.recurring)
    setRecurringInterval(template.recurringInterval?.toString() || '7')
    setRecurringUnit(template.recurringUnit || 'days')
    setAutoStart(template.autoStart)
  }

  const handleSaveTemplate = async () => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to create templates')
      return
    }

    if (!templateName || !selectedToken || !amount || !startingBid || !duration) {
      toast.error('Please fill in all required fields')
      return
    }

    const amountNum = parseFloat(amount)
    const startBid = parseFloat(startingBid)
    const reserve = reservePrice ? parseFloat(reservePrice) : undefined
    const durationHours = parseFloat(duration)
    const intervalNum = recurring ? parseFloat(recurringInterval) : undefined

    if (isNaN(amountNum) || amountNum <= 0 || isNaN(startBid) || startBid <= 0 || isNaN(durationHours) || durationHours <= 0) {
      toast.error('Invalid amount, bid, or duration')
      return
    }

    if (reserve && reserve < startBid) {
      toast.error('Reserve price must be greater than or equal to starting bid')
      return
    }

    if (recurring && (!intervalNum || intervalNum <= 0)) {
      toast.error('Invalid recurring interval')
      return
    }

    setIsCreating(true)

    try {
      const template: AuctionTemplate = {
        id: editingTemplate?.id || `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: templateName,
        description: templateDescription,
        tokenSymbol: selectedToken,
        amount: amountNum,
        startingBid: startBid,
        reservePrice: reserve,
        duration: durationHours,
        recurring,
        recurringInterval: intervalNum,
        recurringUnit,
        autoStart,
        createdAt: editingTemplate?.createdAt || Date.now(),
        createdBy: userProfile.userId,
        isActive: editingTemplate?.isActive ?? true,
        scheduledAuctions: editingTemplate?.scheduledAuctions || []
      }

      if (editingTemplate) {
        setTemplates((current) =>
          (current || []).map(t => t.id === editingTemplate.id ? template : t)
        )
        toast.success('Template updated successfully!')
      } else {
        setTemplates((current) => [...(current || []), template])
        toast.success('Template created successfully!')
      }

      resetForm()
    } catch (error) {
      toast.error('Failed to save template')
      console.error('Template save error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((current) =>
      (current || []).filter(t => t.id !== templateId)
    )
    toast.success('Template deleted')
  }

  const handleToggleActive = (templateId: string) => {
    setTemplates((current) =>
      (current || []).map(t =>
        t.id === templateId ? { ...t, isActive: !t.isActive } : t
      )
    )
  }

  const handleLaunchFromTemplate = async (template: AuctionTemplate) => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to launch auctions')
      return
    }

    const userBalance = userProfile.businessTokens[template.tokenSymbol] || 0
    if (template.amount > userBalance) {
      toast.error(`Insufficient ${template.tokenSymbol} balance`)
      return
    }

    try {
      const auctionId = `auction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const tokenInfo = allTokens?.[template.tokenSymbol]

      const newAuction: TokenAuction = {
        id: auctionId,
        tokenSymbol: template.tokenSymbol,
        tokenName: tokenInfo?.name || template.tokenSymbol,
        amount: template.amount,
        startingBid: template.startingBid,
        currentBid: template.startingBid,
        reservePrice: template.reservePrice,
        creatorId: userProfile.userId,
        creatorUsername: userProfile.username,
        startTime: Date.now(),
        endTime: Date.now() + (template.duration * 60 * 60 * 1000),
        status: 'active',
        bids: [],
        description: template.description
      }

      setAuctions((current) => [...(current || []), newAuction])

      if (template.recurring && template.recurringInterval) {
        const intervalMs = getIntervalMs(template.recurringInterval, template.recurringUnit!)
        const nextScheduledTime = Date.now() + intervalMs

        const scheduledAuction: ScheduledAuction = {
          id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId: template.id,
          scheduledTime: nextScheduledTime,
          status: 'pending'
        }

        setTemplates((current) =>
          (current || []).map(t =>
            t.id === template.id
              ? { ...t, scheduledAuctions: [...t.scheduledAuctions, scheduledAuction] }
              : t
          )
        )
      }

      toast.success(`Auction launched! ${template.amount} ${template.tokenSymbol}`)
    } catch (error) {
      toast.error('Failed to launch auction')
      console.error('Launch error:', error)
    }
  }

  const handleScheduleAuction = (template: AuctionTemplate, scheduledTime: number) => {
    const scheduledAuction: ScheduledAuction = {
      id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      scheduledTime,
      status: 'pending'
    }

    setTemplates((current) =>
      (current || []).map(t =>
        t.id === template.id
          ? { ...t, scheduledAuctions: [...t.scheduledAuctions, scheduledAuction] }
          : t
      )
    )

    toast.success('Auction scheduled successfully!')
  }

  const handleCancelScheduled = (templateId: string, scheduledId: string) => {
    setTemplates((current) =>
      (current || []).map(t =>
        t.id === templateId
          ? {
              ...t,
              scheduledAuctions: t.scheduledAuctions.map(sa =>
                sa.id === scheduledId ? { ...sa, status: 'cancelled' as const } : sa
              )
            }
          : t
      )
    )
    toast.success('Scheduled auction cancelled')
  }

  const handleDuplicateTemplate = (template: AuctionTemplate) => {
    const duplicate: AuctionTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      createdAt: Date.now(),
      scheduledAuctions: []
    }

    setTemplates((current) => [...(current || []), duplicate])
    toast.success('Template duplicated!')
  }

  const getIntervalMs = (interval: number, unit: 'hours' | 'days' | 'weeks') => {
    switch (unit) {
      case 'hours':
        return interval * 60 * 60 * 1000
      case 'days':
        return interval * 24 * 60 * 60 * 1000
      case 'weeks':
        return interval * 7 * 24 * 60 * 60 * 1000
      default:
        return 0
    }
  }

  const formatScheduledTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const myTemplates = (templates || []).filter(t => t.createdBy === userProfile?.userId)
  const activeTemplates = myTemplates.filter(t => t.isActive)
  const recurringTemplates = activeTemplates.filter(t => t.recurring)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Auction Templates
          </h2>
          <p className="text-muted-foreground">
            Create recurring auction schedules and automate token sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-lg px-4 py-2">
            <ClockClockwise size={20} weight="duotone" className="mr-2" />
            {recurringTemplates.length} Recurring
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 gradient-border">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText size={32} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingTemplate ? 'Update your auction template' : 'Set up recurring auctions'}
                </p>
              </div>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    placeholder="Weekly Token Sale"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    placeholder="Regular weekly token auction..."
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="template-token">Token *</Label>
                  <select
                    id="template-token"
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
                  <Label htmlFor="template-amount">Amount *</Label>
                  <Input
                    id="template-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-starting-bid">Starting Bid (INF) *</Label>
                  <Input
                    id="template-starting-bid"
                    type="number"
                    placeholder="0.00"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-reserve">Reserve Price (INF)</Label>
                  <Input
                    id="template-reserve"
                    type="number"
                    placeholder="Optional minimum"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-duration">Duration (hours) *</Label>
                  <Input
                    id="template-duration"
                    type="number"
                    placeholder="24"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="template-recurring">Recurring Auctions</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically schedule future auctions
                      </p>
                    </div>
                    <Switch
                      id="template-recurring"
                      checked={recurring}
                      onCheckedChange={setRecurring}
                    />
                  </div>

                  {recurring && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="template-interval">Interval</Label>
                          <Input
                            id="template-interval"
                            type="number"
                            placeholder="7"
                            value={recurringInterval}
                            onChange={(e) => setRecurringInterval(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-unit">Unit</Label>
                          <select
                            id="template-unit"
                            className="w-full p-2 rounded-md border border-input bg-background"
                            value={recurringUnit}
                            onChange={(e) => setRecurringUnit(e.target.value as 'hours' | 'days' | 'weeks')}
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="template-autostart">Auto-Start</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically launch scheduled auctions
                          </p>
                        </div>
                        <Switch
                          id="template-autostart"
                          checked={autoStart}
                          onCheckedChange={setAutoStart}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveTemplate}
                    className="flex-1 bg-gradient-to-r from-primary to-accent"
                    disabled={isCreating || !isAuthenticated}
                  >
                    <Check size={20} weight="bold" className="mr-2" />
                    {editingTemplate ? 'Update' : 'Create'} Template
                  </Button>
                  {editingTemplate && (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <ListChecks size={28} weight="duotone" className="text-accent" />
                Your Templates
              </h3>
              <Badge variant="outline">
                {myTemplates.length} Total
              </Badge>
            </div>

            {myTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No templates yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create your first auction template!</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {myTemplates.map((template) => (
                    <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xl font-bold">{template.name}</h4>
                              {template.recurring && (
                                <Badge variant="default" className="bg-gradient-to-r from-accent to-primary">
                                  <ArrowsClockwise size={14} weight="bold" className="mr-1" />
                                  Recurring
                                </Badge>
                              )}
                              {!template.isActive && (
                                <Badge variant="secondary">
                                  <Pause size={14} weight="bold" className="mr-1" />
                                  Paused
                                </Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-xs text-muted-foreground">Token</p>
                            <p className="font-mono font-bold">{template.tokenSymbol}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-mono font-bold">{template.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Starting Bid</p>
                            <p className="font-mono font-bold text-accent">
                              {template.startingBid.toLocaleString()} INF
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="font-mono font-bold">{template.duration}h</p>
                          </div>
                        </div>

                        {template.recurring && (
                          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Timer size={16} weight="duotone" className="text-accent" />
                              <p className="text-sm font-semibold">
                                Repeats every {template.recurringInterval} {template.recurringUnit}
                              </p>
                            </div>
                            {template.autoStart && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Lightning size={12} weight="fill" className="text-accent" />
                                Auto-start enabled
                              </p>
                            )}
                          </div>
                        )}

                        {template.scheduledAuctions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                              <CalendarPlus size={14} weight="duotone" />
                              Scheduled Auctions
                            </p>
                            <div className="space-y-1">
                              {template.scheduledAuctions
                                .filter(sa => sa.status === 'pending')
                                .slice(0, 3)
                                .map((scheduled) => (
                                  <div
                                    key={scheduled.id}
                                    className="flex items-center justify-between text-xs p-2 rounded bg-muted/20"
                                  >
                                    <span className="font-mono">
                                      {formatScheduledTime(scheduled.scheduledTime)}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCancelScheduled(template.id, scheduled.id)}
                                    >
                                      <Trash size={14} weight="duotone" />
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        <Separator />

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            className="flex-1 bg-gradient-to-r from-accent to-primary"
                            onClick={() => handleLaunchFromTemplate(template)}
                            disabled={!template.isActive}
                          >
                            <Play size={18} weight="fill" className="mr-2" />
                            Launch Now
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <CalendarPlus size={20} weight="duotone" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Schedule Auction</DialogTitle>
                                <DialogDescription>
                                  Choose when to launch this auction
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="scheduled-time">Date & Time</Label>
                                  <Input
                                    id="scheduled-time"
                                    type="datetime-local"
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) => {
                                      const time = new Date(e.target.value).getTime()
                                      if (time > Date.now()) {
                                        handleScheduleAuction(template, time)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => loadTemplate(template)}
                          >
                            <FileText size={20} weight="duotone" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDuplicateTemplate(template)}
                          >
                            <Copy size={20} weight="duotone" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleActive(template.id)}
                          >
                            {template.isActive ? (
                              <Pause size={20} weight="duotone" />
                            ) : (
                              <Play size={20} weight="duotone" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash size={20} weight="duotone" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </Card>
      </div>

      {recurringTemplates.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Sparkle size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Quick Stats</h3>
              <p className="text-xs text-muted-foreground">Overview of your recurring auctions</p>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
              <p className="text-sm text-muted-foreground mb-1">Active Templates</p>
              <p className="text-3xl font-bold">{activeTemplates.length}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10">
              <p className="text-sm text-muted-foreground mb-1">Recurring</p>
              <p className="text-3xl font-bold">{recurringTemplates.length}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-primary/10">
              <p className="text-sm text-muted-foreground mb-1">Scheduled</p>
              <p className="text-3xl font-bold">
                {myTemplates.reduce((sum, t) => sum + t.scheduledAuctions.filter(sa => sa.status === 'pending').length, 0)}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-primary/10">
              <p className="text-sm text-muted-foreground mb-1">Total Templates</p>
              <p className="text-3xl font-bold">{myTemplates.length}</p>
            </Card>
          </div>
        </Card>
      )}
    </div>
  )
}
