import { useState, useEffect } from 'react'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClockClockwise, ArrowRight, User, Coin, Warning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RedistributionRecord {
  tokenSymbol: string
  fromOwner: string
  toOwner: string
  amount: number
  timestamp: number
  reason: string
}

export function RedistributionHistory() {
  const [redistributions] = useLocalStorage<RedistributionRecord[]>('token-redistributions', [])
  const [filteredData, setFilteredData] = useState<RedistributionRecord[]>([])
  const [filter, setFilter] = useState<'all' | 'received' | 'lost'>('all')
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    filterData()
  }, [redistributions, filter, currentUser])

  const loadUserData = async () => {
    try {
      const user = await window.spark.user()
      if (user) {
        setCurrentUser(user.login)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const filterData = () => {
    if (!redistributions) {
      setFilteredData([])
      return
    }

    let filtered = [...redistributions]

    if (currentUser && filter !== 'all') {
      if (filter === 'received') {
        filtered = filtered.filter(r => r.toOwner === currentUser)
      } else if (filter === 'lost') {
        filtered = filtered.filter(r => r.fromOwner === currentUser)
      }
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp)
    setFilteredData(filtered)
  }

  const getTotalStats = () => {
    if (!redistributions || !currentUser) {
      return { received: 0, lost: 0, total: 0 }
    }

    const received = redistributions.filter(r => r.toOwner === currentUser).length
    const lost = redistributions.filter(r => r.fromOwner === currentUser).length

    return {
      received,
      lost,
      total: redistributions.length
    }
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <ClockClockwise size={24} weight="duotone" className="text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Redistribution History</CardTitle>
              <CardDescription>Track all token redistributions in the ecosystem</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentUser && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <ClockClockwise size={32} weight="duotone" className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Received</p>
                      <p className="text-2xl font-bold text-green-700">+{stats.received}</p>
                    </div>
                    <Coin size={32} weight="duotone" className="text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700">Lost</p>
                      <p className="text-2xl font-bold text-red-700">-{stats.lost}</p>
                    </div>
                    <Warning size={32} weight="duotone" className="text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Redistributions</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              <RedistributionList data={filteredData} currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="received" className="space-y-4 mt-6">
              <RedistributionList data={filteredData} currentUser={currentUser} highlight="received" />
            </TabsContent>

            <TabsContent value="lost" className="space-y-4 mt-6">
              <RedistributionList data={filteredData} currentUser={currentUser} highlight="lost" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface RedistributionListProps {
  data: RedistributionRecord[]
  currentUser: string | null
  highlight?: 'received' | 'lost'
}

function RedistributionList({ data, currentUser, highlight }: RedistributionListProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border-2 border-dashed">
        <ClockClockwise size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium text-lg mb-1">No Redistributions</p>
        <p className="text-sm text-muted-foreground">
          {highlight === 'received' && 'You haven\'t received any tokens from redistributions'}
          {highlight === 'lost' && 'You haven\'t lost any tokens to redistribution'}
          {!highlight && 'No token redistributions have occurred yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {data.map((record, index) => {
          const isUserInvolved = currentUser && (record.fromOwner === currentUser || record.toOwner === currentUser)
          const wasReceived = currentUser && record.toOwner === currentUser
          const wasLost = currentUser && record.fromOwner === currentUser

          return (
            <motion.div
              key={`${record.tokenSymbol}-${record.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`${isUserInvolved ? 'border-2' : ''} ${wasReceived ? 'border-green-200 bg-green-50/50' : ''} ${wasLost ? 'border-red-200 bg-red-50/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${wasReceived ? 'bg-green-100' : wasLost ? 'bg-red-100' : 'bg-muted'}`}>
                          <User size={20} weight="duotone" className={wasReceived ? 'text-green-600' : wasLost ? 'text-red-600' : 'text-muted-foreground'} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {record.fromOwner}
                            {currentUser === record.fromOwner && <Badge variant="secondary" className="ml-2">You</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">Previous Owner</p>
                        </div>
                      </div>

                      <ArrowRight size={24} weight="bold" className="text-muted-foreground flex-shrink-0" />

                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${wasReceived ? 'bg-green-100' : 'bg-muted'}`}>
                          <User size={20} weight="duotone" className={wasReceived ? 'text-green-600' : 'text-muted-foreground'} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {record.toOwner}
                            {currentUser === record.toOwner && <Badge variant="secondary" className="ml-2">You</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">New Owner</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-end">
                        <Badge variant="outline" className="gap-1.5">
                          <Coin size={14} weight="fill" />
                          {record.tokenSymbol}
                        </Badge>
                        <Badge>{record.amount}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {record.reason}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
