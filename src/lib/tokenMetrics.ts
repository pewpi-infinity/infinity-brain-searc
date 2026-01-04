export interface TokenMetric {
  tokenSymbol: string
  timestamp: number
  metricType: 'click' | 'view' | 'transfer' | 'bid' | 'trade' | 'mint'
  userId: string
  value: number
  metadata?: {
    auctionId?: string
    tradeId?: string
    feature?: string
    duration?: number
  }
}

export interface TokenValueSnapshot {
  tokenSymbol: string
  timestamp: number
  baseValue: number
  metricValue: number
  totalValue: number
  clickCount: number
  viewCount: number
  transferCount: number
  bidCount: number
  tradeVolume: number
  activeUsers: number
}

export interface AggregatedMetrics {
  totalClicks: number
  totalViews: number
  totalTransfers: number
  totalBids: number
  totalTradeVolume: number
  uniqueUsers: Set<string>
  valueIncrease: number
}

export function calculateTokenValueFromMetrics(
  metrics: TokenMetric[],
  baseValue: number = 1.0
): TokenValueSnapshot {
  const aggregated: AggregatedMetrics = {
    totalClicks: 0,
    totalViews: 0,
    totalTransfers: 0,
    totalBids: 0,
    totalTradeVolume: 0,
    uniqueUsers: new Set<string>(),
    valueIncrease: 0
  }

  metrics.forEach(metric => {
    aggregated.uniqueUsers.add(metric.userId)
    
    switch (metric.metricType) {
      case 'click':
        aggregated.totalClicks += 1
        aggregated.valueIncrease += 0.01
        break
      case 'view':
        aggregated.totalViews += 1
        aggregated.valueIncrease += 0.005
        break
      case 'transfer':
        aggregated.totalTransfers += 1
        aggregated.valueIncrease += 0.5
        break
      case 'bid':
        aggregated.totalBids += 1
        aggregated.valueIncrease += metric.value * 0.1
        break
      case 'trade':
        aggregated.totalTradeVolume += metric.value
        aggregated.valueIncrease += metric.value * 0.05
        break
      case 'mint':
        aggregated.valueIncrease += 1.0
        break
    }
  })

  const networkEffect = Math.log10(aggregated.uniqueUsers.size + 1) * 0.5
  const engagementMultiplier = 1 + (aggregated.totalClicks * 0.001)
  
  const metricValue = (aggregated.valueIncrease * engagementMultiplier) + networkEffect
  const totalValue = baseValue + metricValue

  return {
    tokenSymbol: metrics[0]?.tokenSymbol || 'UNKNOWN',
    timestamp: Date.now(),
    baseValue,
    metricValue,
    totalValue,
    clickCount: aggregated.totalClicks,
    viewCount: aggregated.totalViews,
    transferCount: aggregated.totalTransfers,
    bidCount: aggregated.totalBids,
    tradeVolume: aggregated.totalTradeVolume,
    activeUsers: aggregated.uniqueUsers.size
  }
}

export function getTokenGrowthRate(
  currentSnapshot: TokenValueSnapshot,
  previousSnapshot: TokenValueSnapshot | null
): number {
  if (!previousSnapshot) return 0
  
  const timeDiff = currentSnapshot.timestamp - previousSnapshot.timestamp
  if (timeDiff <= 0) return 0
  
  const valueDiff = currentSnapshot.totalValue - previousSnapshot.totalValue
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  
  return (valueDiff / previousSnapshot.totalValue) * (24 / hoursDiff) * 100
}

export function generateValueHistory(
  metrics: TokenMetric[],
  baseValue: number = 1.0,
  intervalHours: number = 1
): TokenValueSnapshot[] {
  if (metrics.length === 0) return []

  const sortedMetrics = [...metrics].sort((a, b) => a.timestamp - b.timestamp)
  const startTime = sortedMetrics[0].timestamp
  const endTime = Date.now()
  const intervalMs = intervalHours * 60 * 60 * 1000

  const history: TokenValueSnapshot[] = []
  let currentTime = startTime

  while (currentTime <= endTime) {
    const metricsUpToNow = sortedMetrics.filter(m => m.timestamp <= currentTime)
    const snapshot = calculateTokenValueFromMetrics(metricsUpToNow, baseValue)
    snapshot.timestamp = currentTime
    history.push(snapshot)
    
    currentTime += intervalMs
  }

  return history
}

export async function trackTokenMetric(
  tokenSymbol: string,
  metricType: TokenMetric['metricType'],
  userId: string,
  value: number = 1,
  metadata?: TokenMetric['metadata']
): Promise<void> {
  const metrics = await window.spark.kv.get<TokenMetric[]>(`token-metrics-${tokenSymbol}`) || []
  
  const newMetric: TokenMetric = {
    tokenSymbol,
    timestamp: Date.now(),
    metricType,
    userId,
    value,
    metadata
  }
  
  metrics.push(newMetric)
  
  const maxMetrics = 10000
  if (metrics.length > maxMetrics) {
    metrics.splice(0, metrics.length - maxMetrics)
  }
  
  localStorageUtils.set(`token-metrics-${tokenSymbol}`, metrics)
  
  await updateTokenValueSnapshot(tokenSymbol, metrics)
}

async function updateTokenValueSnapshot(tokenSymbol: string, metrics: TokenMetric[]): Promise<void> {
  const tokens = await window.spark.kv.get<Record<string, any>>('business-tokens') || {}
  const tokenData = tokens[tokenSymbol]
  const baseValue = tokenData?.initialPrice || 1.0
  
  const snapshot = calculateTokenValueFromMetrics(metrics, baseValue)
  
  const snapshots = await window.spark.kv.get<TokenValueSnapshot[]>(`token-snapshots-${tokenSymbol}`) || []
  snapshots.push(snapshot)
  
  const maxSnapshots = 1000
  if (snapshots.length > maxSnapshots) {
    snapshots.splice(0, snapshots.length - maxSnapshots)
  }
  
  localStorageUtils.set(`token-snapshots-${tokenSymbol}`, snapshots)
}
