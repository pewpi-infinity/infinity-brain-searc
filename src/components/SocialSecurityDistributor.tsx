import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useKV } from '@github/spark/hooks'
import { 
  Rocket, 
  Users, 
  CurrencyDollar, 
  CheckCircle, 
  Lightning, 
  ShieldCheck,
  House,
  Heart,
  Truck,
  Buildings,
  Wrench,
  FirstAidKit
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface PaymentBot {
  id: string
  name: string
  status: 'idle' | 'active' | 'complete' | 'collision'
  recipientCount: number
  tokensDistributed: number
  speed: number
  collisionProtection: boolean
  serviceType: 'housing' | 'food' | 'healthcare' | 'security' | 'infrastructure' | 'veterans'
}

interface PaymentRecipient {
  id: string
  name: string
  amount: number
  received: boolean
  serviceType: string
  timestamp?: number
}

interface DistributionStats {
  totalRecipients: number
  totalDistributed: number
  botsActive: number
  completionRate: number
  avgSpeed: number
}

const defaultStats: DistributionStats = {
  totalRecipients: 0,
  totalDistributed: 0,
  botsActive: 0,
  completionRate: 0,
  avgSpeed: 0
}

export function SocialSecurityDistributor() {
  const [bots, setBots] = useKV<PaymentBot[]>('ss-payment-bots', [])
  const [recipients, setRecipients] = useKV<PaymentRecipient[]>('ss-recipients', [])
  const [stats, setStats] = useKV<DistributionStats>('ss-distribution-stats', defaultStats)
  
  const [totalAmount, setTotalAmount] = useState('1000000000000')
  const [recipientCount, setRecipientCount] = useState('1000000')
  const [isDistributing, setIsDistributing] = useState(false)
  const [collisionProtection, setCollisionProtection] = useState(true)
  const [speedMultiplier, setSpeedMultiplier] = useState(1000)
  const [selectedService, setSelectedService] = useState<string>('all')

  const currentBots = bots || []
  const currentRecipients = recipients || []
  const currentStats = stats || defaultStats

  const serviceTypes = [
    { id: 'housing', name: 'Housing', icon: House, color: 'bg-blue-500' },
    { id: 'food', name: 'Meals on Wheels', icon: Truck, color: 'bg-green-500' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'bg-red-500' },
    { id: 'security', name: 'Security', icon: ShieldCheck, color: 'bg-purple-500' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Buildings, color: 'bg-orange-500' },
    { id: 'veterans', name: 'Veterans Care', icon: FirstAidKit, color: 'bg-teal-500' }
  ]

  const spawnBot = (serviceType: string) => {
    const newBot: PaymentBot = {
      id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Distribution Bot ${currentBots.length + 1}`,
      status: 'idle',
      recipientCount: 0,
      tokensDistributed: 0,
      speed: Math.floor(Math.random() * 5000) + 1000,
      collisionProtection,
      serviceType: serviceType as any
    }
    
    setBots((prev) => [...(prev || []), newBot])
    toast.success(`${newBot.name} spawned for ${serviceType}!`, {
      description: `Ready to distribute payments with collision protection ${collisionProtection ? 'enabled' : 'disabled'}`
    })
  }

  const generateRecipients = async () => {
    const count = parseInt(recipientCount)
    if (isNaN(count) || count <= 0) {
      toast.error('Invalid recipient count')
      return
    }

    toast.info('Generating recipients...', { description: 'This may take a moment for large numbers' })

    const newRecipients: PaymentRecipient[] = []
    const batchSize = 1000
    const batches = Math.ceil(count / batchSize)

    for (let batch = 0; batch < batches; batch++) {
      const batchCount = Math.min(batchSize, count - batch * batchSize)
      
      for (let i = 0; i < batchCount; i++) {
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)]
        newRecipients.push({
          id: `recipient-${batch}-${i}`,
          name: `Recipient ${batch * batchSize + i + 1}`,
          amount: parseFloat(totalAmount) / count,
          received: false,
          serviceType: serviceType.id
        })
      }
    }

    setRecipients((prev) => [...(prev || []), ...newRecipients])
    setStats((prev) => ({
      ...(prev || defaultStats),
      totalRecipients: (prev?.totalRecipients || 0) + newRecipients.length
    }))
    
    toast.success(`Generated ${count} recipients!`, {
      description: 'Ready for distribution'
    })
  }

  const startDistribution = async () => {
    if (currentBots.length === 0) {
      toast.error('No bots available', { description: 'Spawn at least one bot first' })
      return
    }

    const unreceived = currentRecipients.filter(r => !r.received)
    if (unreceived.length === 0) {
      toast.error('No recipients awaiting payment')
      return
    }

    setIsDistributing(true)
    
    setBots((prev) =>
      (prev || []).map(bot => ({ ...bot, status: 'active' as const }))
    )
    
    setStats((prev) => ({
      ...(prev || defaultStats),
      botsActive: currentBots.length
    }))

    toast.success('Distribution started!', {
      description: `${currentBots.length} bots processing ${unreceived.length} payments`
    })

    const botsToUse = currentBots.filter(bot => 
      selectedService === 'all' || bot.serviceType === selectedService
    )

    let processed = 0
    const recipientsPerBot = Math.ceil(unreceived.length / botsToUse.length)

    for (let i = 0; i < botsToUse.length; i++) {
      const bot = botsToUse[i]
      const startIdx = i * recipientsPerBot
      const endIdx = Math.min((i + 1) * recipientsPerBot, unreceived.length)
      const botRecipients = unreceived.slice(startIdx, endIdx)

      setTimeout(() => {
        processDistribution(bot, botRecipients, processed)
        processed += botRecipients.length
      }, i * 100)
    }
  }

  const processDistribution = async (
    bot: PaymentBot, 
    recipientsBatch: PaymentRecipient[],
    offset: number
  ) => {
    const delay = collisionProtection ? 50 : 10
    const batchSize = Math.ceil(recipientsBatch.length / 10)

    for (let i = 0; i < recipientsBatch.length; i += batchSize) {
      const batch = recipientsBatch.slice(i, Math.min(i + batchSize, recipientsBatch.length))
      
      await new Promise(resolve => setTimeout(resolve, delay))

      batch.forEach(recipient => {
        setRecipients((prev) =>
          (prev || []).map(r =>
            r.id === recipient.id
              ? { ...r, received: true, timestamp: Date.now() }
              : r
          )
        )

        setBots((prev) =>
          (prev || []).map(b =>
            b.id === bot.id
              ? {
                  ...b,
                  recipientCount: b.recipientCount + 1,
                  tokensDistributed: b.tokensDistributed + recipient.amount
                }
              : b
          )
        )

        setStats((prev) => {
          const current = prev || defaultStats
          const newDistributed = current.totalDistributed + recipient.amount
          return {
            ...current,
            totalDistributed: newDistributed,
            completionRate: (newDistributed / parseFloat(totalAmount)) * 100
          }
        })
      })
    }

    setBots((prev) =>
      (prev || []).map(b =>
        b.id === bot.id
          ? { ...b, status: 'complete' as const }
          : b
      )
    )

    const allComplete = currentBots.every(b => b.status === 'complete')
    if (allComplete) {
      setIsDistributing(false)
      setStats((prev) => ({
        ...(prev || defaultStats),
        botsActive: 0
      }))
      toast.success('Distribution complete!', {
        description: `All ${currentRecipients.filter(r => r.received).length} payments distributed successfully`
      })
    }
  }

  const clearBots = () => {
    setBots([])
    setStats((prev) => ({ ...(prev || defaultStats), botsActive: 0 }))
    toast.info('All bots cleared')
  }

  const clearRecipients = () => {
    setRecipients([])
    setStats(defaultStats)
    toast.info('All recipients cleared')
  }

  const receivedCount = currentRecipients.filter(r => r.received).length
  const completionPercentage = currentRecipients.length > 0 
    ? (receivedCount / currentRecipients.length) * 100 
    : 0

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rocket size={32} weight="duotone" className="text-accent" />
            <div>
              <CardTitle className="text-3xl">Social Security Rapid Distributor</CardTitle>
              <CardDescription className="text-base">
                Spawn collision-aware bots to distribute trillions in payments to millions instantly
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users size={24} className="text-primary" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Recipients</p>
                    <p className="text-2xl font-bold">{currentStats.totalRecipients.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CurrencyDollar size={24} className="text-accent" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distributed</p>
                    <p className="text-2xl font-bold">${(currentStats.totalDistributed / 1000000000).toFixed(2)}B</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Lightning size={24} className="text-secondary" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Bots</p>
                    <p className="text-2xl font-bold">{currentStats.botsActive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-green-500" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-2xl font-bold">{completionPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="bots">Bots ({currentBots.length})</TabsTrigger>
              <TabsTrigger value="recipients">Recipients ({currentRecipients.length})</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution Configuration</CardTitle>
                  <CardDescription>Configure payment distribution parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total-amount">Total Amount (USD)</Label>
                      <Input
                        id="total-amount"
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="1000000000000"
                      />
                      <p className="text-xs text-muted-foreground">
                        ${(parseFloat(totalAmount) / 1000000000000).toFixed(2)} Trillion
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient-count">Number of Recipients</Label>
                      <Input
                        id="recipient-count"
                        type="number"
                        value={recipientCount}
                        onChange={(e) => setRecipientCount(e.target.value)}
                        placeholder="1000000"
                      />
                      <p className="text-xs text-muted-foreground">
                        {parseInt(recipientCount).toLocaleString()} people
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="space-y-1">
                      <Label htmlFor="collision-protection" className="text-base">
                        Collision Protection
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Prevents duplicate payments and ensures thread safety
                      </p>
                    </div>
                    <Switch
                      id="collision-protection"
                      checked={collisionProtection}
                      onCheckedChange={setCollisionProtection}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Speed Multiplier: {speedMultiplier}x</Label>
                    <Input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={speedMultiplier}
                      onChange={(e) => setSpeedMultiplier(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher speeds process payments faster but may increase collision risk
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={generateRecipients} className="flex-1">
                      <Users size={20} className="mr-2" />
                      Generate Recipients
                    </Button>
                    <Button onClick={clearRecipients} variant="outline">
                      Clear Recipients
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spawn Distribution Bots</CardTitle>
                  <CardDescription>Create specialized bots for each service category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviceTypes.map((service) => {
                      const Icon = service.icon
                      return (
                        <Button
                          key={service.id}
                          onClick={() => spawnBot(service.id)}
                          variant="outline"
                          className="h-auto py-4 flex flex-col gap-2"
                        >
                          <Icon size={24} weight="duotone" />
                          <span className="text-sm">{service.name}</span>
                        </Button>
                      )
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={startDistribution} 
                      disabled={isDistributing || currentBots.length === 0 || currentRecipients.length === 0}
                      className="flex-1"
                      size="lg"
                    >
                      <Lightning size={20} className="mr-2" />
                      {isDistributing ? 'Distribution in Progress...' : 'Start Distribution'}
                    </Button>
                    <Button onClick={clearBots} variant="outline" size="lg">
                      Clear Bots
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bots" className="space-y-3">
              <AnimatePresence>
                {currentBots.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Rocket size={64} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
                      <h3 className="text-xl font-semibold mb-2">No Bots Spawned</h3>
                      <p className="text-muted-foreground">Create bots in the Setup tab to begin distribution</p>
                    </CardContent>
                  </Card>
                ) : (
                  currentBots.map((bot) => {
                    const serviceType = serviceTypes.find(s => s.id === bot.serviceType)
                    const Icon = serviceType?.icon || Wrench
                    
                    return (
                      <motion.div
                        key={bot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Icon size={32} weight="duotone" className="text-primary" />
                                <div>
                                  <h4 className="font-semibold">{bot.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {serviceType?.name || 'General'}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  bot.status === 'complete' ? 'default' :
                                  bot.status === 'active' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {bot.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground">Recipients</p>
                                <p className="font-semibold">{bot.recipientCount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Distributed</p>
                                <p className="font-semibold">${(bot.tokensDistributed / 1000000).toFixed(2)}M</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Speed</p>
                                <p className="font-semibold">{bot.speed}/s</p>
                              </div>
                            </div>

                            {bot.status === 'active' && (
                              <Progress value={Math.random() * 100} className="h-2" />
                            )}

                            {bot.collisionProtection && (
                              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                <ShieldCheck size={16} weight="duotone" />
                                <span>Collision Protection Enabled</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Payment Recipients</h3>
                  <p className="text-sm text-muted-foreground">
                    {receivedCount.toLocaleString()} of {currentRecipients.length.toLocaleString()} received payments
                  </p>
                </div>
                <Progress value={completionPercentage} className="w-48 h-3" />
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-2">
                {currentRecipients.slice(0, 100).map((recipient) => {
                  const serviceType = serviceTypes.find(s => s.id === recipient.serviceType)
                  const Icon = serviceType?.icon || Users
                  
                  return (
                    <Card key={recipient.id} className={recipient.received ? 'bg-muted/50' : ''}>
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon size={20} weight="duotone" />
                          <div>
                            <p className="font-medium text-sm">{recipient.name}</p>
                            <p className="text-xs text-muted-foreground">{serviceType?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">${recipient.amount.toFixed(2)}</p>
                          {recipient.received ? (
                            <CheckCircle size={20} weight="fill" className="text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {currentRecipients.length > 100 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Showing first 100 of {currentRecipients.length.toLocaleString()} recipients
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle>Service Categories</CardTitle>
                  <CardDescription>Payment distribution by service type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {serviceTypes.map((service) => {
                    const Icon = service.icon
                    const serviceRecipients = currentRecipients.filter(r => r.serviceType === service.id)
                    const servicePaid = serviceRecipients.filter(r => r.received).length
                    const serviceTotal = serviceRecipients.reduce((sum, r) => sum + (r.received ? r.amount : 0), 0)
                    const servicePercentage = serviceRecipients.length > 0 
                      ? (servicePaid / serviceRecipients.length) * 100 
                      : 0

                    return (
                      <div key={service.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${service.color}`}>
                              <Icon size={20} weight="duotone" className="text-white" />
                            </div>
                            <div>
                              <p className="font-semibold">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {servicePaid.toLocaleString()} / {serviceRecipients.length.toLocaleString()} paid
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${(serviceTotal / 1000000).toFixed(2)}M</p>
                            <p className="text-sm text-muted-foreground">{servicePercentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <Progress value={servicePercentage} className="h-2" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
