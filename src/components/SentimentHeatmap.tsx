import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { toast } from 'sonner'
import { ChartBar, Plus, Trash, Download, Sparkle, ArrowsLeftRight, TrendUp, Calendar } from '@phosphor-icons/react'
import * as d3 from 'd3'

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

interface HeatmapData {
  hour: number
  day: string
  value: number
  emotion: string
  count: number
}

export function SentimentHeatmap() {
  const [entries, setEntries] = useLocalStorage<SentimentEntry[]>('sentiment-entries', [])
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [viewMode, setViewMode] = useState<'overall' | 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'love'>('overall')
  const [activeView, setActiveView] = useState<'heatmap' | 'compare'>('heatmap')
  const [period1, setPeriod1] = useState<'7days' | '30days' | '90days' | 'all'>('7days')
  const [period2, setPeriod2] = useState<'7days' | '30days' | '90days' | 'all'>('30days')
  const heatmapRef = useRef<SVGSVGElement>(null)
  const comparisonRef = useRef<SVGSVGElement>(null)

  const analyzeSentiment = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const promptText = `Analyze the emotional sentiment of this text: "${inputText}"

Rate each emotion on a scale of 0-100:
- Joy (happiness, excitement, contentment)
- Sadness (sorrow, melancholy, disappointment)
- Anger (frustration, irritation, rage)
- Fear (anxiety, worry, nervousness)
- Surprise (amazement, shock, wonder)
- Love (affection, warmth, caring)

Return as JSON with a single property "analysis" containing an object with:
{
  "analysis": {
    "joy": number,
    "sadness": number,
    "anger": number,
    "fear": number,
    "surprise": number,
    "love": number,
    "overallScore": number (0-100, where 0 is very negative and 100 is very positive)
  }
}`
      const prompt = window.spark.llmPrompt([promptText] as any)

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)

      const newEntry: SentimentEntry = {
        id: `${Date.now()}-${Math.random()}`,
        text: inputText,
        timestamp: Date.now(),
        sentiment: data.analysis,
        overallScore: data.analysis.overallScore
      }

      setEntries((current) => [newEntry, ...(current || [])])
      setInputText('')
      toast.success('Sentiment analyzed successfully!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze sentiment')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const deleteEntry = (id: string) => {
    setEntries((current) => (current || []).filter(e => e.id !== id))
    toast.success('Entry deleted')
  }

  const clearAllEntries = () => {
    setEntries([])
    toast.success('All entries cleared')
  }

  const exportData = () => {
    const dataStr = JSON.stringify(entries || [], null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sentiment-analysis-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully!')
  }

  const getEntriesForPeriod = (period: '7days' | '30days' | '90days' | 'all') => {
    if (!entries) return []
    if (period === 'all') return entries

    const now = Date.now()
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 }
    const cutoffTime = now - (daysMap[period] * 24 * 60 * 60 * 1000)

    return entries.filter(e => e.timestamp >= cutoffTime)
  }

  const calculateAverageEmotions = (periodEntries: SentimentEntry[]) => {
    if (periodEntries.length === 0) {
      return {
        joy: 0,
        sadness: 0,
        anger: 0,
        fear: 0,
        surprise: 0,
        love: 0,
        overall: 0
      }
    }

    const sum = periodEntries.reduce((acc, entry) => ({
      joy: acc.joy + entry.sentiment.joy,
      sadness: acc.sadness + entry.sentiment.sadness,
      anger: acc.anger + entry.sentiment.anger,
      fear: acc.fear + entry.sentiment.fear,
      surprise: acc.surprise + entry.sentiment.surprise,
      love: acc.love + entry.sentiment.love,
      overall: acc.overall + entry.overallScore
    }), { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, love: 0, overall: 0 })

    return {
      joy: sum.joy / periodEntries.length,
      sadness: sum.sadness / periodEntries.length,
      anger: sum.anger / periodEntries.length,
      fear: sum.fear / periodEntries.length,
      surprise: sum.surprise / periodEntries.length,
      love: sum.love / periodEntries.length,
      overall: sum.overall / periodEntries.length
    }
  }

  const getPeriodLabel = (period: '7days' | '30days' | '90days' | 'all') => {
    const labels = {
      '7days': 'Last 7 Days',
      '30days': 'Last 30 Days',
      '90days': 'Last 90 Days',
      'all': 'All Time'
    }
    return labels[period]
  }

  useEffect(() => {
    if (activeView !== 'compare' || !comparisonRef.current || !entries || entries.length === 0) return

    const svg = d3.select(comparisonRef.current)
    svg.selectAll('*').remove()

    const width = comparisonRef.current.clientWidth
    const height = 500
    const margin = { top: 80, right: 40, bottom: 100, left: 100 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const period1Data = getEntriesForPeriod(period1)
    const period2Data = getEntriesForPeriod(period2)

    const avg1 = calculateAverageEmotions(period1Data)
    const avg2 = calculateAverageEmotions(period2Data)

    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love']
    const comparisonData = emotions.map(emotion => ({
      emotion,
      period1: avg1[emotion as keyof typeof avg1],
      period2: avg2[emotion as keyof typeof avg2],
      difference: avg2[emotion as keyof typeof avg2] - avg1[emotion as keyof typeof avg1]
    }))

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleBand()
      .domain(emotions)
      .range([0, innerWidth])
      .padding(0.3)

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0])

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '13px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .style('text-transform', 'capitalize')

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')

    const barWidth = xScale.bandwidth() / 2.5

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'comparison-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'oklch(0.20 0.05 270)')
      .style('color', 'oklch(0.98 0 0)')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.3)')

    comparisonData.forEach(d => {
      const xPos = xScale(d.emotion) || 0

      g.append('rect')
        .attr('x', xPos)
        .attr('y', yScale(d.period1))
        .attr('width', barWidth)
        .attr('height', innerHeight - yScale(d.period1))
        .attr('fill', 'oklch(0.55 0.20 250)')
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          d3.select(this).attr('opacity', 0.8)
          tooltip
            .style('visibility', 'visible')
            .html(`
              <strong>${getPeriodLabel(period1)}</strong><br/>
              ${d.emotion.charAt(0).toUpperCase() + d.emotion.slice(1)}: ${d.period1.toFixed(1)}<br/>
              Entries: ${period1Data.length}
            `)
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px')
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1)
          tooltip.style('visibility', 'hidden')
        })

      g.append('rect')
        .attr('x', xPos + barWidth + 4)
        .attr('y', yScale(d.period2))
        .attr('width', barWidth)
        .attr('height', innerHeight - yScale(d.period2))
        .attr('fill', 'oklch(0.70 0.18 200)')
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          d3.select(this).attr('opacity', 0.8)
          tooltip
            .style('visibility', 'visible')
            .html(`
              <strong>${getPeriodLabel(period2)}</strong><br/>
              ${d.emotion.charAt(0).toUpperCase() + d.emotion.slice(1)}: ${d.period2.toFixed(1)}<br/>
              Entries: ${period2Data.length}
            `)
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px')
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1)
          tooltip.style('visibility', 'hidden')
        })

      if (Math.abs(d.difference) > 5) {
        const arrow = d.difference > 0 ? '▲' : '▼'
        const color = d.difference > 0 ? 'oklch(0.70 0.18 200)' : 'oklch(0.577 0.245 27.325)'
        
        g.append('text')
          .attr('x', xPos + xScale.bandwidth() / 2)
          .attr('y', yScale(Math.max(d.period1, d.period2)) - 10)
          .attr('text-anchor', 'middle')
          .style('font-family', 'JetBrains Mono, monospace')
          .style('font-size', '16px')
          .style('fill', color)
          .text(arrow)
      }
    })

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '20px')
      .style('font-weight', '600')
      .style('fill', 'oklch(0.20 0.05 270)')
      .text('Comparative Sentiment Analysis')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '13px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text(`${getPeriodLabel(period1)} vs ${getPeriodLabel(period2)}`)

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('Emotion Type')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -70)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('Average Intensity')

    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 180}, -60)`)

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 12)
      .attr('fill', 'oklch(0.55 0.20 250)')
      .attr('rx', 3)

    legend.append('text')
      .attr('x', 25)
      .attr('y', 10)
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text(getPeriodLabel(period1))

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 20)
      .attr('height', 12)
      .attr('fill', 'oklch(0.70 0.18 200)')
      .attr('rx', 3)

    legend.append('text')
      .attr('x', 25)
      .attr('y', 30)
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text(getPeriodLabel(period2))

    const insightsData = comparisonData
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
      .slice(0, 3)

    const insightsY = innerHeight + 75
    g.append('text')
      .attr('x', 0)
      .attr('y', insightsY)
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', 'oklch(0.20 0.05 270)')
      .text('Key Insights:')

    insightsData.forEach((d, i) => {
      const trend = d.difference > 0 ? 'increased' : 'decreased'
      const text = `${d.emotion.charAt(0).toUpperCase() + d.emotion.slice(1)} ${trend} by ${Math.abs(d.difference).toFixed(1)} points`
      
      g.append('text')
        .attr('x', 0)
        .attr('y', insightsY + 20 + (i * 18))
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '12px')
        .style('fill', 'oklch(0.50 0.05 270)')
        .text(`• ${text}`)
    })

    return () => {
      tooltip.remove()
    }
  }, [entries, period1, period2, activeView])

  useEffect(() => {
    if (activeView !== 'heatmap' || !heatmapRef.current || !entries || entries.length === 0) return

    const svg = d3.select(heatmapRef.current)
    svg.selectAll('*').remove()

    const width = heatmapRef.current.clientWidth
    const height = 400
    const margin = { top: 60, right: 120, bottom: 60, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const heatmapData: HeatmapData[] = []
    
    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        const relevantEntries = entries.filter(e => {
          const date = new Date(e.timestamp)
          return date.getDay() === dayIndex && date.getHours() === hour
        })

        if (relevantEntries.length > 0) {
          const avgValue = viewMode === 'overall'
            ? d3.mean(relevantEntries, d => d.overallScore) || 0
            : d3.mean(relevantEntries, d => d.sentiment[viewMode]) || 0

          heatmapData.push({
            hour,
            day,
            value: avgValue,
            emotion: viewMode,
            count: relevantEntries.length
          })
        } else {
          heatmapData.push({
            hour,
            day,
            value: 0,
            emotion: viewMode,
            count: 0
          })
        }
      })
    })

    const xScale = d3.scaleBand()
      .domain(hours.map(String))
      .range([0, innerWidth])
      .padding(0.05)

    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, innerHeight])
      .padding(0.05)

    const colorScale = d3.scaleSequential()
      .domain([0, 100])
      .interpolator(d3.interpolateRgbBasis([
        'oklch(0.45 0.15 300)',
        'oklch(0.55 0.20 250)',
        'oklch(0.70 0.18 200)',
        'oklch(0.85 0.15 150)'
      ]))

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'sentiment-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'oklch(0.20 0.05 270)')
      .style('color', 'oklch(0.98 0 0)')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 6px rgba(0,0,0,0.3)')

    g.selectAll('rect')
      .data(heatmapData)
      .join('rect')
      .attr('x', d => xScale(String(d.hour)) || 0)
      .attr('y', d => yScale(d.day) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.count > 0 ? colorScale(d.value) : 'oklch(0.94 0.02 280)')
      .attr('stroke', 'oklch(0.88 0.03 280)')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', 'oklch(0.70 0.18 200)')
          .attr('stroke-width', 2)

        tooltip
          .style('visibility', 'visible')
          .html(`
            <strong>${d.day} ${d.hour}:00</strong><br/>
            ${viewMode === 'overall' ? 'Overall Score' : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}: ${d.value.toFixed(1)}<br/>
            Entries: ${d.count}
          `)
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke', 'oklch(0.88 0.03 280)')
          .attr('stroke-width', 1)

        tooltip.style('visibility', 'hidden')
      })

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '11px')
      .style('fill', 'oklch(0.50 0.05 270)')

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Space Grotesk, sans-serif')
      .style('font-size', '18px')
      .style('font-weight', '600')
      .style('fill', 'oklch(0.20 0.05 270)')
      .text(`${viewMode === 'overall' ? 'Overall Sentiment' : viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Patterns`)

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('Hour of Day')

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('Day of Week')

    const legendWidth = 100
    const legendHeight = 20
    const legendScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, legendWidth])

    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 20}, ${innerHeight / 2 - 60})`)

    const legendGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')

    legendGradient.selectAll('stop')
      .data([
        { offset: '0%', color: 'oklch(0.45 0.15 300)' },
        { offset: '33%', color: 'oklch(0.55 0.20 250)' },
        { offset: '66%', color: 'oklch(0.70 0.18 200)' },
        { offset: '100%', color: 'oklch(0.85 0.15 150)' }
      ])
      .join('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 4)
      .style('fill', 'url(#legend-gradient)')

    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 20)
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '11px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('0')

    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 20)
      .attr('text-anchor', 'end')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '11px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('100')

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '11px')
      .style('fill', 'oklch(0.50 0.05 270)')
      .text('Intensity')

    return () => {
      tooltip.remove()
    }
  }, [entries, viewMode, activeView])

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={28} weight="duotone" className="text-primary" />
                Sentiment Analysis Heatmap
              </CardTitle>
              <CardDescription>
                Analyze emotional patterns across time and discover insights
              </CardDescription>
            </div>
            <Sparkle size={32} weight="duotone" className="text-accent animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze sentiment... Share your thoughts, feelings, or any content you want to understand emotionally."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] text-base"
            />
            <div className="flex gap-3">
              <Button
                onClick={analyzeSentiment}
                disabled={isAnalyzing || !inputText.trim()}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                <Plus size={20} weight="bold" className="mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
              </Button>
              {entries && entries.length > 0 && (
                <>
                  <Button
                    onClick={exportData}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Download size={20} weight="bold" className="mr-2" />
                    Export Data
                  </Button>
                  <Button
                    onClick={clearAllEntries}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash size={20} weight="bold" className="mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          {entries && entries.length > 0 && (
            <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="heatmap" className="flex items-center gap-2">
                  <ChartBar size={18} weight="duotone" />
                  Heatmap View
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex items-center gap-2">
                  <ArrowsLeftRight size={18} weight="duotone" />
                  Comparative Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="heatmap" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar size={24} weight="duotone" className="text-accent" />
                      Emotional Patterns Over Time
                    </h3>
                    <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                      <SelectTrigger className="w-[180px]">
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
                  <div className="bg-card rounded-lg p-6 border border-border">
                    <svg ref={heatmapRef} className="w-full" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="compare" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendUp size={24} weight="duotone" className="text-secondary" />
                        Compare Time Periods
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analyze how emotional patterns have changed between different time periods
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-secondary/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-secondary">Period 1 (Baseline)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={period1} onValueChange={(v: any) => setPeriod1(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="mt-3 text-sm text-muted-foreground">
                          {getEntriesForPeriod(period1).length} entries
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-accent/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-accent">Period 2 (Comparison)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select value={period2} onValueChange={(v: any) => setPeriod2(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7days">Last 7 Days</SelectItem>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 90 Days</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="mt-3 text-sm text-muted-foreground">
                          {getEntriesForPeriod(period2).length} entries
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-card rounded-lg p-6 border border-border">
                    <svg ref={comparisonRef} className="w-full" />
                  </div>

                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkle size={20} weight="duotone" className="text-primary" />
                        Emotional Shifts Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        const p1Data = getEntriesForPeriod(period1)
                        const p2Data = getEntriesForPeriod(period2)
                        const avg1 = calculateAverageEmotions(p1Data)
                        const avg2 = calculateAverageEmotions(p2Data)
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-muted-foreground">
                                {getPeriodLabel(period1)}
                              </div>
                              <div className="text-2xl font-bold">
                                {avg1.overall.toFixed(1)}
                                <span className="text-sm text-muted-foreground ml-2">avg score</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Based on {p1Data.length} {p1Data.length === 1 ? 'entry' : 'entries'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-semibold text-muted-foreground">
                                {getPeriodLabel(period2)}
                              </div>
                              <div className="text-2xl font-bold">
                                {avg2.overall.toFixed(1)}
                                <span className="text-sm text-muted-foreground ml-2">avg score</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Based on {p2Data.length} {p2Data.length === 1 ? 'entry' : 'entries'}
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {entries && entries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Recent Analyses ({entries?.length || 0})</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {(entries || []).map((entry) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm flex-1">{entry.text}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash size={16} weight="bold" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                          <span className="font-semibold">
                            Overall: {entry.overallScore.toFixed(0)}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          {Object.entries(entry.sentiment).map(([emotion, value]) => (
                            <div key={emotion} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="capitalize text-muted-foreground">{emotion}</span>
                                <span className="font-mono font-semibold">{value.toFixed(0)}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300"
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!entries || entries.length === 0) && (
            <div className="text-center py-12 space-y-4">
              <ChartBar size={64} weight="duotone" className="mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Data Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start analyzing text to see emotional patterns visualized over time in the heatmap
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
