import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKV } from '@github/spark/hooks'
import { ChartBar, TrendUp, Eye, Fire } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface UserAction {
  id: string
  feature: string
  timestamp: number
  category: string
}

interface FeatureUsage {
  feature: string
  count: number
  category: string
  lastUsed: number
  trend: 'up' | 'down' | 'stable'
}

const categories = [
  { name: 'Tokens', color: 'bg-blue-500' },
  { name: 'Repos', color: 'bg-cyan-500' },
  { name: 'AI', color: 'bg-purple-500' },
  { name: 'Trading', color: 'bg-green-500' },
  { name: 'Build', color: 'bg-amber-500' },
  { name: 'Chat', color: 'bg-pink-500' },
]

export function UserBehaviorHeatmap() {
  const [actions, setActions] = useKV<UserAction[]>('user-behavior-actions', [])
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([])

  useEffect(() => {
    if (actions && actions.length > 0) {
      calculateFeatureUsage()
    }
  }, [actions])

  useEffect(() => {
    if (!actions || actions.length === 0) {
      generateSampleData()
    }
  }, [])

  const generateSampleData = async () => {
    const features = [
      { name: 'Token Minter', category: 'Tokens' },
      { name: 'Mongoose.os Brain', category: 'AI' },
      { name: 'Neural Chat', category: 'Chat' },
      { name: 'Repo Manager', category: 'Repos' },
      { name: 'Token Marketplace', category: 'Trading' },
      { name: 'Quantum Jukebox', category: 'Build' },
      { name: 'Auto-Pilot', category: 'AI' },
      { name: 'Auction System', category: 'Trading' },
      { name: 'AI Project Assistant', category: 'AI' },
      { name: 'Token Charts', category: 'Tokens' },
    ]

    const sampleActions: UserAction[] = []
    const now = Date.now()
    
    for (let i = 0; i < 50; i++) {
      const feature = features[Math.floor(Math.random() * features.length)]
      sampleActions.push({
        id: `action-${Date.now()}-${i}`,
        feature: feature.name,
        timestamp: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
        category: feature.category
      })
    }

    await setActions(sampleActions)
    toast.success('📊 Behavior data initialized')
  }

  const calculateFeatureUsage = () => {
    const usageMap = new Map<string, { count: number; category: string; lastUsed: number; prevCount: number }>()

    actions?.forEach((action) => {
      const key = action.feature
      if (!usageMap.has(key)) {
        usageMap.set(key, { count: 0, category: action.category, lastUsed: 0, prevCount: 0 })
      }
      const current = usageMap.get(key)!
      current.count++
      if (action.timestamp > current.lastUsed) {
        current.lastUsed = action.timestamp
      }
    })

    const usage: FeatureUsage[] = Array.from(usageMap.entries()).map(([feature, data]) => {
      const trend = data.count > data.prevCount + 2 ? 'up' : data.count < data.prevCount - 2 ? 'down' : 'stable'
      return {
        feature,
        count: data.count,
        category: data.category,
        lastUsed: data.lastUsed,
        trend
      }
    })

    usage.sort((a, b) => b.count - a.count)
    setFeatureUsage(usage)
  }

  const trackAction = async (feature: string, category: string) => {
    const newAction: UserAction = {
      id: `action-${Date.now()}`,
      feature,
      timestamp: Date.now(),
      category
    }

    await setActions((prev) => [...(prev || []), newAction].slice(-100))
    toast.success(`Tracked: ${feature}`)
  }

  const clearData = async () => {
    await setActions([])
    setFeatureUsage([])
    toast.info('Behavior data cleared')
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getIntensityColor = (count: number, max: number) => {
    const intensity = count / max
    if (intensity > 0.7) return 'bg-blue-600'
    if (intensity > 0.5) return 'bg-blue-500'
    if (intensity > 0.3) return 'bg-blue-400'
    if (intensity > 0.1) return 'bg-blue-300'
    return 'bg-blue-100'
  }

  const maxUsage = Math.max(...featureUsage.map(f => f.count), 1)

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
              <ChartBar size={32} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl">User Behavior Heatmap</CardTitle>
              <CardDescription className="text-blue-100">
                Most used features • Usage patterns • Activity trends
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/30 text-white border-0">
              {actions?.length || 0} actions tracked
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Fire size={24} weight="fill" className="text-orange-500" />
                  Top Features
                </h3>
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {featureUsage.length} features
                </Badge>
              </div>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {featureUsage.slice(0, 10).map((feature, index) => (
                    <motion.div
                      key={feature.feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{feature.feature}</span>
                          {feature.trend === 'up' && (
                            <TrendUp size={14} weight="fill" className="text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {feature.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(feature.lastUsed)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="default" className="bg-blue-500">
                          {feature.count}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Eye size={24} weight="fill" className="text-blue-500" />
                  Category Breakdown
                </h3>
              </div>
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryTotal = featureUsage
                    .filter(f => f.category === category.name)
                    .reduce((sum, f) => sum + f.count, 0)
                  const percentage = actions && actions.length > 0
                    ? Math.round((categoryTotal / actions.length) * 100)
                    : 0

                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{categoryTotal} uses</span>
                          <Badge variant="outline" className="text-xs">
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={category.color}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          style={{ height: '100%' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Usage Intensity Heatmap</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {featureUsage.map((feature, index) => (
                <motion.div
                  key={feature.feature}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`aspect-square rounded ${getIntensityColor(feature.count, maxUsage)} cursor-pointer hover:scale-110 transition-transform`}
                  title={`${feature.feature}: ${feature.count} uses`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less used</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-100 rounded" />
                <div className="w-4 h-4 bg-blue-300 rounded" />
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <div className="w-4 h-4 bg-blue-600 rounded" />
              </div>
              <span>Most used</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={() => trackAction('Test Feature', 'AI')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Fire size={20} weight="fill" className="mr-2" />
            Track Test Action
          </Button>
          <Button variant="outline" onClick={clearData} className="border-blue-200">
            Clear Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
