import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as d3 from 'd3'
import { 
  ChartLine, 
  TrendUp, 
  TrendDown,
  Calendar,
  ChartLineUp,
  ChartBar,
  ArrowsOutLineHorizontal
} from '@phosphor-icons/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Transaction } from './TransactionHistory'
import { MarketOrder } from './TokenMarketplace'

interface PriceDataPoint {
  timestamp: number
  price: number
  volume: number
  high: number
  low: number
  open: number
  close: number
}

interface TokenPriceChartProps {
  tokenSymbol?: string
}

export function TokenPriceChart({ tokenSymbol: initialToken }: TokenPriceChartProps) {
  const chartRef = useRef<SVGSVGElement>(null)
  const volumeChartRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [allTransactions] = useLocalStorage<Transaction[]>('all-transactions', [])
  const [marketOrders] = useLocalStorage<MarketOrder[]>('market-orders', [])
  const [allTokens] = useLocalStorage<Record<string, any>>('business-tokens', {})
  
  const [selectedToken, setSelectedToken] = useState(initialToken || '')
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D' | '30D' | 'ALL'>('24H')
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line')
  
  const availableTokens = Object.keys(allTokens || {}).filter(s => s !== 'INF')

  useEffect(() => {
    if (availableTokens.length > 0 && !selectedToken) {
      setSelectedToken(availableTokens[0])
    }
  }, [availableTokens, selectedToken])

  const generatePriceData = (): PriceDataPoint[] => {
    if (!selectedToken || !allTransactions) return []

    const now = Date.now()
    const timeRanges = {
      '1H': 60 * 60 * 1000,
      '24H': 24 * 60 * 60 * 1000,
      '7D': 7 * 24 * 60 * 60 * 1000,
      '30D': 30 * 24 * 60 * 60 * 1000,
      'ALL': Infinity
    }
    
    const rangeMs = timeRanges[timeRange]
    const startTime = now - rangeMs

    const tokenTrades = allTransactions
      .filter(tx => 
        tx.tokenSymbol === selectedToken && 
        tx.timestamp >= startTime &&
        tx.note?.includes('Marketplace trade')
      )
      .sort((a, b) => a.timestamp - b.timestamp)

    const filledOrders = (marketOrders || []).filter(
      order => 
        order.tokenSymbol === selectedToken && 
        order.status === 'filled' &&
        order.createdAt >= startTime
    )

    if (tokenTrades.length === 0 && filledOrders.length === 0) {
      return generateSyntheticData(startTime, now)
    }

    const intervalMs = rangeMs / 50
    const dataPoints: PriceDataPoint[] = []
    
    let currentPrice = 10
    
    for (let time = startTime; time <= now; time += intervalMs) {
      const tradesInInterval = tokenTrades.filter(
        tx => tx.timestamp >= time && tx.timestamp < time + intervalMs
      )
      
      const ordersInInterval = filledOrders.filter(
        order => order.createdAt >= time && order.createdAt < time + intervalMs
      )

      let intervalPrices: number[] = []
      let volume = 0

      ordersInInterval.forEach(order => {
        intervalPrices.push(order.pricePerToken)
        volume += order.amount
      })

      if (intervalPrices.length === 0) {
        const volatility = 0.02
        const change = (Math.random() - 0.5) * volatility * currentPrice
        currentPrice = Math.max(0.1, currentPrice + change)
        intervalPrices = [currentPrice]
      }

      const open = intervalPrices[0]
      const close = intervalPrices[intervalPrices.length - 1]
      const high = Math.max(...intervalPrices)
      const low = Math.min(...intervalPrices)

      dataPoints.push({
        timestamp: time,
        price: close,
        volume,
        high,
        low,
        open,
        close
      })

      currentPrice = close
    }

    return dataPoints
  }

  const generateSyntheticData = (startTime: number, endTime: number): PriceDataPoint[] => {
    const points = 50
    const intervalMs = (endTime - startTime) / points
    const dataPoints: PriceDataPoint[] = []
    
    let currentPrice = 10 + Math.random() * 20
    
    for (let i = 0; i < points; i++) {
      const time = startTime + i * intervalMs
      const volatility = 0.05
      const trend = 0.001
      
      const change = (Math.random() - 0.5) * volatility * currentPrice + trend * currentPrice
      currentPrice = Math.max(0.5, currentPrice + change)
      
      const variance = currentPrice * 0.02
      const open = currentPrice + (Math.random() - 0.5) * variance
      const close = currentPrice
      const high = Math.max(open, close) + Math.random() * variance
      const low = Math.min(open, close) - Math.random() * variance
      const volume = Math.random() * 1000 + 100

      dataPoints.push({
        timestamp: time,
        price: currentPrice,
        volume,
        high,
        low,
        open,
        close
      })
    }

    return dataPoints
  }

  const priceData = generatePriceData()

  const stats = {
    currentPrice: priceData[priceData.length - 1]?.price || 0,
    priceChange: priceData.length >= 2 
      ? priceData[priceData.length - 1].price - priceData[0].price 
      : 0,
    percentChange: priceData.length >= 2
      ? ((priceData[priceData.length - 1].price - priceData[0].price) / priceData[0].price) * 100
      : 0,
    high24h: Math.max(...priceData.map(d => d.high)),
    low24h: Math.min(...priceData.map(d => d.low)),
    volume24h: priceData.reduce((sum, d) => sum + d.volume, 0)
  }

  useEffect(() => {
    if (!chartRef.current || !containerRef.current || priceData.length === 0) return

    const container = containerRef.current
    const margin = { top: 20, right: 60, bottom: 40, left: 60 }
    const width = container.clientWidth - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    d3.select(chartRef.current).selectAll('*').remove()

    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleTime()
      .domain(d3.extent(priceData, d => d.timestamp) as [number, number])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(priceData, d => chartType === 'candlestick' ? d.low : d.price)! * 0.95,
        d3.max(priceData, d => chartType === 'candlestick' ? d.high : d.price)! * 1.05
      ])
      .range([height, 0])

    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', `price-gradient-${selectedToken}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', stats.priceChange >= 0 ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)')
      .attr('stop-opacity', 0.4)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', stats.priceChange >= 0 ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)')
      .attr('stop-opacity', 0)

    if (chartType === 'line') {
      const area = d3.area<PriceDataPoint>()
        .x(d => xScale(d.timestamp))
        .y0(height)
        .y1(d => yScale(d.price))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(priceData)
        .attr('fill', `url(#price-gradient-${selectedToken})`)
        .attr('d', area)

      const line = d3.line<PriceDataPoint>()
        .x(d => xScale(d.timestamp))
        .y(d => yScale(d.price))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(priceData)
        .attr('fill', 'none')
        .attr('stroke', stats.priceChange >= 0 ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)')
        .attr('stroke-width', 2.5)
        .attr('d', line)

      const circles = svg.selectAll('.price-point')
        .data(priceData.filter((_, i) => i % Math.ceil(priceData.length / 20) === 0))
        .enter()
        .append('circle')
        .attr('class', 'price-point')
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => yScale(d.price))
        .attr('r', 0)
        .attr('fill', stats.priceChange >= 0 ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)')
        .attr('opacity', 0)

      circles.transition()
        .duration(800)
        .delay((_, i) => i * 30)
        .attr('r', 4)
        .attr('opacity', 0.8)
    } else {
      const candleWidth = Math.max(2, width / priceData.length - 2)

      priceData.forEach((d, i) => {
        const isUp = d.close >= d.open
        const color = isUp ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)'
        const x = xScale(d.timestamp)

        svg.append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', yScale(d.high))
          .attr('y2', yScale(d.low))
          .attr('stroke', color)
          .attr('stroke-width', 1)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(i * 10)
          .attr('opacity', 0.8)

        svg.append('rect')
          .attr('x', x - candleWidth / 2)
          .attr('y', yScale(Math.max(d.open, d.close)))
          .attr('width', candleWidth)
          .attr('height', Math.max(1, Math.abs(yScale(d.open) - yScale(d.close))))
          .attr('fill', color)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(i * 10)
          .attr('opacity', 0.9)
      })
    }

    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => {
        const date = new Date(d as number)
        if (timeRange === '1H') return d3.timeFormat('%H:%M')(date)
        if (timeRange === '24H') return d3.timeFormat('%H:%M')(date)
        return d3.timeFormat('%m/%d')(date)
      })

    const yAxis = d3.axisRight(yScale)
      .ticks(6)
      .tickFormat(d => `$${d3.format('.2f')(d as number)}`)

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('color', 'oklch(0.50 0.05 270)')
      .attr('font-size', '11px')

    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(yAxis)
      .attr('color', 'oklch(0.50 0.05 270)')
      .attr('font-size', '11px')

    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height)
      .attr('y2', height)
      .attr('stroke', 'oklch(0.88 0.03 280)')
      .attr('stroke-width', 1)

    svg.append('line')
      .attr('x1', width)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'oklch(0.88 0.03 280)')
      .attr('stroke-width', 1)

  }, [priceData, chartType, selectedToken, timeRange])

  useEffect(() => {
    if (!volumeChartRef.current || !containerRef.current || priceData.length === 0) return

    const container = containerRef.current
    const margin = { top: 10, right: 60, bottom: 30, left: 60 }
    const width = container.clientWidth - margin.left - margin.right
    const height = 100 - margin.top - margin.bottom

    d3.select(volumeChartRef.current).selectAll('*').remove()

    const svg = d3.select(volumeChartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleTime()
      .domain(d3.extent(priceData, d => d.timestamp) as [number, number])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(priceData, d => d.volume)!])
      .range([height, 0])

    const barWidth = width / priceData.length - 1

    svg.selectAll('.volume-bar')
      .data(priceData)
      .enter()
      .append('rect')
      .attr('class', 'volume-bar')
      .attr('x', d => xScale(d.timestamp) - barWidth / 2)
      .attr('y', height)
      .attr('width', Math.max(1, barWidth))
      .attr('height', 0)
      .attr('fill', (d, i) => {
        const isUp = i === 0 || d.close >= priceData[i - 1].close
        return isUp ? 'oklch(0.70 0.18 200 / 0.5)' : 'oklch(0.577 0.245 27.325 / 0.5)'
      })
      .transition()
      .duration(800)
      .delay((_, i) => i * 10)
      .attr('y', d => yScale(d.volume))
      .attr('height', d => height - yScale(d.volume))

    const yAxis = d3.axisRight(yScale)
      .ticks(3)
      .tickFormat(d => {
        const val = d as number
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
        return val.toString()
      })

    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(yAxis)
      .attr('color', 'oklch(0.50 0.05 270)')
      .attr('font-size', '10px')

  }, [priceData])

  if (availableTokens.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ChartLine size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">No Token Data Available</h3>
        <p className="text-muted-foreground">
          Create tokens to view price charts and market trends
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-mono">
                  ${stats.currentPrice.toFixed(2)}
                </span>
                <Badge 
                  variant={stats.priceChange >= 0 ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {stats.priceChange >= 0 ? (
                    <TrendUp size={14} weight="bold" />
                  ) : (
                    <TrendDown size={14} weight="bold" />
                  )}
                  {stats.percentChange.toFixed(2)}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.priceChange >= 0 ? '+' : ''}${stats.priceChange.toFixed(2)} ({timeRange})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'line' | 'candlestick')}>
              <TabsList className="h-8">
                <TabsTrigger value="line" className="text-xs px-3">
                  <ChartLineUp size={14} className="mr-1" />
                  Line
                </TabsTrigger>
                <TabsTrigger value="candlestick" className="text-xs px-3">
                  <ChartBar size={14} className="mr-1" />
                  Candles
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="1H" className="text-xs px-2">1H</TabsTrigger>
                <TabsTrigger value="24H" className="text-xs px-2">24H</TabsTrigger>
                <TabsTrigger value="7D" className="text-xs px-2">7D</TabsTrigger>
                <TabsTrigger value="30D" className="text-xs px-2">30D</TabsTrigger>
                <TabsTrigger value="ALL" className="text-xs px-2">ALL</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">24h High</div>
            <div className="font-mono font-bold text-sm">${stats.high24h.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">24h Low</div>
            <div className="font-mono font-bold text-sm">${stats.low24h.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
            <div className="font-mono font-bold text-sm">{stats.volume24h.toLocaleString()}</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
            <div className="font-mono font-bold text-sm">
              ${((allTokens?.[selectedToken]?.totalSupply || 0) * stats.currentPrice).toLocaleString()}
            </div>
          </div>
        </div>

        <div ref={containerRef} className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ChartLine size={20} weight="duotone" className="text-primary" />
              <span className="text-sm font-bold">Price Chart</span>
            </div>
          </div>
          <svg ref={chartRef} className="w-full"></svg>
          
          <div className="flex items-center gap-2 mt-4">
            <ArrowsOutLineHorizontal size={18} weight="duotone" className="text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">Volume</span>
          </div>
          <svg ref={volumeChartRef} className="w-full"></svg>
        </div>
      </Card>
    </div>
  )
}
