import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { TrendUp, TrendDown, Hash, Sparkle, Lightning, Clock, Users, Fire, ChartLine, MagnifyingGlass, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { motion, AnimatePresence } from 'framer-motion'

interface HashtagTrend {
  tag: string
  count: number
  velocity: number
  sentiment: 'positive' | 'neutral' | 'negative'
  category: string
  relatedTags: string[]
  peakTime: string
  engagementScore: number
  trend: 'rising' | 'falling' | 'stable'
}

interface TrendAnalysis {
  summary: string
  topCategories: string[]
  bestTimeToPost: string
  recommendedHashtags: string[]
  insights: string[]
}

export function HashtagTrendAnalyzer() {
  const [trends, setTrends] = useLocalStorage<HashtagTrend[]>('hashtag-trends', [])
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['technology', 'business', 'lifestyle', 'entertainment', 'sports', 'politics', 'health', 'education']

  useEffect(() => {
    if (!trends || trends.length === 0) {
      generateTrends()
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshTrends()
      }, 30000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const generateTrends = async () => {
    setIsAnalyzing(true)
    try {
      const prompt = `Generate 20 realistic trending hashtags with detailed metrics. Return as JSON with a "trends" array containing objects with: tag (string with #), count (number 1000-50000), velocity (number -100 to 100), sentiment (positive/neutral/negative), category (${categories.join('/')}), relatedTags (array of 3-5 related hashtags), peakTime (time string like "2:00 PM EST"), engagementScore (number 0-100), trend (rising/falling/stable).`
      
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      
      if (data.trends && Array.isArray(data.trends)) {
        setTrends(data.trends)
        setLastUpdate(new Date())
        await generateAnalysis(data.trends)
        toast.success('Trends updated successfully')
      }
    } catch (error) {
      toast.error('Failed to generate trends')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const refreshTrends = async () => {
    setIsRefreshing(true)
    await generateTrends()
    setIsRefreshing(false)
  }

  const generateAnalysis = async (trendData: HashtagTrend[]) => {
    try {
      const topTrends = trendData.slice(0, 10).map(t => t.tag).join(', ')
      const prompt = `Analyze these trending hashtags: ${topTrends}. Return JSON with: summary (brief overview string), topCategories (array of 3 categories), bestTimeToPost (time string), recommendedHashtags (array of 5 hashtags), insights (array of 3 actionable insights).`
      
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      setAnalysis(data)
    } catch (error) {
      console.error('Analysis error:', error)
    }
  }

  const analyzeCustomHashtag = async (hashtag: string) => {
    if (!hashtag.trim()) return
    
    setIsAnalyzing(true)
    try {
      const cleanTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
      const prompt = `Analyze the hashtag "${cleanTag}" for trending potential. Return JSON with: tag, count (estimated reach), velocity (growth rate -100 to 100), sentiment, category, relatedTags (5 tags), peakTime, engagementScore (0-100), trend (rising/falling/stable), and insights (array of 3 specific insights about this hashtag).`
      
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      
      toast.success(`Analysis complete for ${cleanTag}`, {
        description: data.insights?.[0] || 'Check the results below'
      })
      
      setTrends((currentTrends) => {
        if (!currentTrends) return [data]
        const filtered = currentTrends.filter(t => t.tag !== data.tag)
        return [data, ...filtered]
      })
      
      setSearchQuery('')
    } catch (error) {
      toast.error('Failed to analyze hashtag')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising':
        return <TrendUp size={16} weight="bold" className="text-green-500" />
      case 'falling':
        return <TrendDown size={16} weight="bold" className="text-red-500" />
      default:
        return <TrendUp size={16} weight="bold" className="text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'negative':
        return 'bg-red-500/20 text-red-700 border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30'
    }
  }

  const filteredTrends = selectedCategory === 'all' 
    ? (trends || [])
    : (trends || []).filter(t => t.category === selectedCategory)

  const sortedTrends = [...filteredTrends].sort((a, b) => {
    return b.engagementScore - a.engagementScore
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Hash size={32} weight="duotone" className="text-primary" />
            Hashtag Trend Analyzer
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time trending topics and AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-accent/20' : ''}
          >
            <Lightning size={16} weight={autoRefresh ? 'fill' : 'regular'} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTrends}
            disabled={isRefreshing}
          >
            <ArrowsClockwise size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <div className="text-xs text-muted-foreground">
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={20} weight="duotone" />
            Analyze Custom Hashtag
          </CardTitle>
          <CardDescription>
            Enter any hashtag to get detailed trend analysis and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter hashtag (e.g., #AIRevolution)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeCustomHashtag(searchQuery)}
              disabled={isAnalyzing}
            />
            <Button
              onClick={() => analyzeCustomHashtag(searchQuery)}
              disabled={isAnalyzing || !searchQuery.trim()}
            >
              <Sparkle size={16} weight="duotone" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={20} weight="duotone" className="text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Fire size={16} weight="duotone" className="text-orange-500" />
                    Top Categories
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.topCategories.map((cat, i) => (
                      <Badge key={i} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock size={16} weight="duotone" className="text-blue-500" />
                    Best Time to Post
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.bestTimeToPost}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Hash size={16} weight="duotone" className="text-purple-500" />
                    Recommended Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.recommendedHashtags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} className="bg-primary/20 text-primary border-primary/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ChartLine size={16} weight="duotone" className="text-accent" />
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {analysis.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-1 h-auto bg-card/50">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isAnalyzing && sortedTrends.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Sparkle size={48} weight="duotone" className="mx-auto mb-4 text-primary animate-pulse" />
                <p className="text-muted-foreground">Analyzing trending hashtags...</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {sortedTrends.map((trend, index) => (
                    <motion.div
                      key={trend.tag}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-2xl font-bold text-primary">
                                  {trend.tag}
                                </h3>
                                {getTrendIcon(trend.trend)}
                                <Badge variant="outline" className={getSentimentColor(trend.sentiment)}>
                                  {trend.sentiment}
                                </Badge>
                                <Badge variant="secondary" className="capitalize">
                                  {trend.category}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Users size={14} />
                                    Mentions
                                  </div>
                                  <div className="font-semibold">
                                    {trend.count.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Lightning size={14} />
                                    Velocity
                                  </div>
                                  <div className={`font-semibold ${trend.velocity > 0 ? 'text-green-600' : trend.velocity < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {trend.velocity > 0 ? '+' : ''}{trend.velocity}%
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Fire size={14} />
                                    Engagement
                                  </div>
                                  <div className="font-semibold">
                                    {trend.engagementScore}/100
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Clock size={14} />
                                    Peak Time
                                  </div>
                                  <div className="font-semibold text-xs">
                                    {trend.peakTime}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground mb-2">
                                  Engagement Score
                                </div>
                                <Progress value={trend.engagementScore} className="h-2" />
                              </div>

                              {trend.relatedTags && trend.relatedTags.length > 0 && (
                                <div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Related Tags
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {trend.relatedTags.map((tag, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs cursor-pointer hover:bg-accent/20"
                                        onClick={() => analyzeCustomHashtag(tag)}
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant="outline"
                                className={`text-lg px-3 py-1 ${
                                  index === 0 ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500' :
                                  index === 1 ? 'bg-gray-400/20 text-gray-700 border-gray-400' :
                                  index === 2 ? 'bg-orange-500/20 text-orange-700 border-orange-500' :
                                  'bg-muted'
                                }`}
                              >
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
