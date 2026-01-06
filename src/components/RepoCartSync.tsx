import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import { GitBranch, ArrowsClockwise, Database, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface RepoCart {
  id: string
  name: string
  description: string
  files: string[]
  lastSync: number
  syncStatus: 'synced' | 'pending' | 'error'
  connectedRepos: string[]
}

export function RepoCartSync() {
  const [carts, setCarts] = useKV<RepoCart[]>('repo-carts', [])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  useEffect(() => {
    if (!carts || carts.length === 0) {
      initializeCarts()
    }
  }, [])

  const initializeCarts = async () => {
    const initialCarts: RepoCart[] = [
      {
        id: 'cart-1',
        name: 'smug_look',
        description: 'Main infinity brain repository',
        files: ['App.tsx', 'MongooseOSBrain.tsx', 'TokenMinter.tsx', 'QuantumJukebox.tsx'],
        lastSync: Date.now(),
        syncStatus: 'synced',
        connectedRepos: ['pewpi-infinity/quantum-tools', 'pewpi-infinity/token-system']
      },
      {
        id: 'cart-2',
        name: 'quantum-tools',
        description: 'Quantum encryption and jukebox utilities',
        files: ['QuantumEncryptionVault.tsx', 'AudioProcessor.ts', 'FrequencyGenerator.ts'],
        lastSync: Date.now() - 300000,
        syncStatus: 'pending',
        connectedRepos: ['pewpi-infinity/smug_look', 'pewpi-infinity/neural-chat']
      },
      {
        id: 'cart-3',
        name: 'token-system',
        description: 'Token economy and marketplace',
        files: ['TokenMinter.tsx', 'TokenMarketplace.tsx', 'TokenAuction.tsx'],
        lastSync: Date.now() - 600000,
        syncStatus: 'synced',
        connectedRepos: ['pewpi-infinity/smug_look', 'pewpi-infinity/analytics']
      },
      {
        id: 'cart-4',
        name: 'neural-chat',
        description: 'AI chat and neural slot machine',
        files: ['NeuralSlotChat.tsx', 'AIChat.tsx', 'ChatEngine.ts'],
        lastSync: Date.now() - 900000,
        syncStatus: 'synced',
        connectedRepos: ['pewpi-infinity/smug_look', 'pewpi-infinity/quantum-tools']
      },
      {
        id: 'cart-5',
        name: 'analytics',
        description: 'Behavior heatmaps and charts',
        files: ['UserBehaviorHeatmap.tsx', 'InfinityTokenCharts.tsx', 'Analytics.ts'],
        lastSync: Date.now() - 1200000,
        syncStatus: 'pending',
        connectedRepos: ['pewpi-infinity/smug_look', 'pewpi-infinity/token-system']
      }
    ]

    await setCarts(initialCarts)
    toast.success('🔄 Repo carts initialized')
  }

  const syncAllCarts = async () => {
    setIsSyncing(true)
    setSyncProgress(0)

    const totalCarts = carts?.length || 1
    const progressStep = 100 / totalCarts

    for (let i = 0; i < totalCarts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSyncProgress((i + 1) * progressStep)
    }

    await setCarts((prev) =>
      (prev || []).map((cart) => ({
        ...cart,
        lastSync: Date.now(),
        syncStatus: 'synced'
      }))
    )

    setIsSyncing(false)
    setSyncProgress(0)
    toast.success('✅ All carts synced successfully!')
  }

  const syncSingleCart = async (cartId: string) => {
    await setCarts((prev) =>
      (prev || []).map((cart) =>
        cart.id === cartId
          ? { ...cart, lastSync: Date.now(), syncStatus: 'synced' }
          : cart
      )
    )
    toast.success(`✅ ${carts?.find(c => c.id === cartId)?.name} synced`)
  }

  const getStatusColor = (status: RepoCart['syncStatus']) => {
    switch (status) {
      case 'synced': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
    }
  }

  const getStatusIcon = (status: RepoCart['syncStatus']) => {
    switch (status) {
      case 'synced': return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'pending': return <ArrowsClockwise size={20} weight="fill" className="text-yellow-500" />
      case 'error': return <Warning size={20} weight="fill" className="text-red-500" />
    }
  }

  const formatLastSync = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
              <GitBranch size={32} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Repo Cart Sync
                <Badge variant="secondary" className="bg-white/30 text-white border-0">
                  Auto-Sync
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Cross-repo data sharing • File synchronization • Build automation
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white">
                <Database size={28} weight="duotone" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Automatic Cart Processing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  All repos can read each other's carts and pull files to build programs collaboratively. 
                  Mongoose.os intelligence syncs data between repositories automatically, enabling seamless code sharing and build automation.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={syncAllCarts}
                    disabled={isSyncing}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {isSyncing ? (
                      <>
                        <ArrowsClockwise size={20} weight="fill" className="mr-2 animate-spin" />
                        Syncing... {Math.round(syncProgress)}%
                      </>
                    ) : (
                      <>
                        <ArrowsClockwise size={20} weight="fill" className="mr-2" />
                        Sync All Repos
                      </>
                    )}
                  </Button>
                  {isSyncing && (
                    <div className="flex-1">
                      <Progress value={syncProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          {(carts || []).map((cart, index) => (
            <motion.div
              key={cart.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <GitBranch size={24} weight="duotone" className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{cart.name}</h3>
                          <Badge className={getStatusColor(cart.syncStatus)} variant="default">
                            {cart.syncStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{cart.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(cart.syncStatus)}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">Files ({cart.files.length})</div>
                    <ScrollArea className="h-24 rounded-md border border-blue-200 bg-blue-50/50 p-2">
                      <div className="space-y-1">
                        {cart.files.map((file, i) => (
                          <div key={i} className="text-xs font-mono text-blue-600 flex items-center gap-2">
                            <span className="text-blue-400">•</span>
                            {file}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground font-medium">
                      Connected Repos ({cart.connectedRepos.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cart.connectedRepos.map((repo, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-blue-500 text-blue-600">
                          {repo.split('/')[1]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-blue-200 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Last sync: {formatLastSync(cart.lastSync)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncSingleCart(cart.id)}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <ArrowsClockwise size={16} weight="fill" className="mr-1" />
                      Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-blue-200 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                <Database size={32} weight="duotone" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">How Repo Cart Sync Works</h3>
                <div className="space-y-2 text-blue-100">
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Each repository has a "cart" containing shareable files and data</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Connected repos can read each other's carts to access components, utilities, and build tools</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Automatic synchronization ensures all repos have access to the latest versions</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>•</span>
                    <span>Build programs by pulling files from multiple carts to create complex applications</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
