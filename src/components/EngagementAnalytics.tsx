import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { ChartBar, Users, Eye, Heart, ShareNetwork, TrendUp } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface EngagementMetrics {
  views: number
  clicks: number
  shares: number
  likes: number
  comments: number
  timeSpent: number
  bounceRate: number
  conversionRate: number
}

interface EngagementEvent {
  type: 'view' | 'click' | 'share' | 'like' | 'comment' | 'conversion'
  timestamp: number
  userId?: string
  contentId: string
  metadata?: Record<string, any>
}

interface ContentAnalytics {
  contentId: string
  contentTitle: string
  metrics: EngagementMetrics
  history: EngagementEvent[]
}

export function EngagementAnalytics() {
  const [analytics, setAnalytics] = useLocalStorage<Record<string, ContentAnalytics>>('engagement-analytics', {})
  const [globalEvents, setGlobalEvents] = useLocalStorage<EngagementEvent[]>('global-engagement-events', [])
  const [selectedContent, setSelectedContent] = useState<string>('global')

  useEffect(() => {
    const trackPageView = () => {
      const event: EngagementEvent = {
        type: 'view',
        timestamp: Date.now(),
        contentId: 'platform-overview'
      }
      
      setGlobalEvents(prev => [...(prev || []), event])
      
      setAnalytics(prev => {
        const updated = { ...(prev || {}) }
        if (!updated['platform-overview']) {
          updated['platform-overview'] = {
            contentId: 'platform-overview',
            contentTitle: 'Infinity Brain Platform',
            metrics: {
              views: 0,
              clicks: 0,
              shares: 0,
              likes: 0,
              comments: 0,
              timeSpent: 0,
              bounceRate: 0,
              conversionRate: 0
            },
            history: []
          }
        }
        
        updated['platform-overview'].metrics.views += 1
        updated['platform-overview'].history.push(event)
        
        return updated
      })
    }

    trackPageView()
  }, [])

  const trackEngagement = (contentId: string, type: EngagementEvent['type'], metadata?: Record<string, any>) => {
    const event: EngagementEvent = {
      type,
      timestamp: Date.now(),
      contentId,
      metadata
    }

    setGlobalEvents(prev => [...(prev || []), event])

    setAnalytics(prev => {
      const updated = { ...(prev || {}) }
      
      if (!updated[contentId]) {
        updated[contentId] = {
          contentId,
          contentTitle: contentId,
          metrics: {
            views: 0,
            clicks: 0,
            shares: 0,
            likes: 0,
            comments: 0,
            timeSpent: 0,
            bounceRate: 0,
            conversionRate: 0
          },
          history: []
        }
      }

      const content = updated[contentId]
      
      switch (type) {
        case 'view':
          content.metrics.views += 1
          break
        case 'click':
          content.metrics.clicks += 1
          break
        case 'share':
          content.metrics.shares += 1
          break
        case 'like':
          content.metrics.likes += 1
          break
        case 'comment':
          content.metrics.comments += 1
          break
        case 'conversion':
          content.metrics.conversionRate = ((content.metrics.conversionRate * (content.history.length - 1) + 1) / content.history.length) * 100
          break
      }

      content.history.push(event)
      
      return updated
    })

    toast.success(`Tracked ${type} event for ${contentId}! 📊`)
  }

  const getGlobalMetrics = (): EngagementMetrics => {
    if (!analytics) return {
      views: 0,
      clicks: 0,
      shares: 0,
      likes: 0,
      comments: 0,
      timeSpent: 0,
      bounceRate: 0,
      conversionRate: 0
    }

    const allContent = Object.values(analytics)
    
    return {
      views: allContent.reduce((sum, c) => sum + c.metrics.views, 0),
      clicks: allContent.reduce((sum, c) => sum + c.metrics.clicks, 0),
      shares: allContent.reduce((sum, c) => sum + c.metrics.shares, 0),
      likes: allContent.reduce((sum, c) => sum + c.metrics.likes, 0),
      comments: allContent.reduce((sum, c) => sum + c.metrics.comments, 0),
      timeSpent: allContent.reduce((sum, c) => sum + c.metrics.timeSpent, 0),
      bounceRate: allContent.length > 0 ? allContent.reduce((sum, c) => sum + c.metrics.bounceRate, 0) / allContent.length : 0,
      conversionRate: allContent.length > 0 ? allContent.reduce((sum, c) => sum + c.metrics.conversionRate, 0) / allContent.length : 0
    }
  }

  const globalMetrics = getGlobalMetrics()
  const contentList = analytics ? Object.values(analytics) : []

  const pieData = [
    { name: 'Views', value: globalMetrics.views, color: '#8b5cf6' },
    { name: 'Clicks', value: globalMetrics.clicks, color: '#06b6d4' },
    { name: 'Shares', value: globalMetrics.shares, color: '#10b981' },
    { name: 'Likes', value: globalMetrics.likes, color: '#f59e0b' }
  ]

  const timelineData = (globalEvents || [])
    .slice(-20)
    .reduce((acc: any[], event) => {
      const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      const existing = acc.find(d => d.time === time)
      
      if (existing) {
        existing[event.type] = (existing[event.type] || 0) + 1
      } else {
        acc.push({ time, [event.type]: 1 })
      }
      
      return acc
    }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar size={24} weight="duotone" className="text-primary" />
            Engagement Analytics API
          </CardTitle>
          <CardDescription>
            Real-time engagement tracking for all platform content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye size={16} />
                <span className="text-sm">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-purple-500">
                {globalMetrics.views.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users size={16} />
                <span className="text-sm">Clicks</span>
              </div>
              <p className="text-3xl font-bold text-cyan-500">
                {globalMetrics.clicks.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShareNetwork size={16} />
                <span className="text-sm">Shares</span>
              </div>
              <p className="text-3xl font-bold text-green-500">
                {globalMetrics.shares.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart size={16} />
                <span className="text-sm">Likes</span>
              </div>
              <p className="text-3xl font-bold text-orange-500">
                {globalMetrics.likes.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Engagement Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Recent Activity Timeline</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="view" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="click" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="share" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="like" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Track Demo Engagement</h3>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => trackEngagement('demo-token', 'click')} size="sm" variant="outline">
                Track Click
              </Button>
              <Button onClick={() => trackEngagement('demo-token', 'like')} size="sm" variant="outline">
                Track Like
              </Button>
              <Button onClick={() => trackEngagement('demo-token', 'share')} size="sm" variant="outline">
                Track Share
              </Button>
              <Button onClick={() => trackEngagement('demo-token', 'comment')} size="sm" variant="outline">
                Track Comment
              </Button>
              <Button onClick={() => trackEngagement('demo-token', 'conversion')} size="sm" variant="outline">
                Track Conversion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {contentList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Performance</CardTitle>
            <CardDescription>Detailed metrics per content item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentList.map(content => (
                <div key={content.contentId} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{content.contentTitle}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye size={14} /> {content.metrics.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {content.metrics.clicks}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShareNetwork size={14} /> {content.metrics.shares}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} /> {content.metrics.likes}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {content.history.length} events
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function useEngagementTracking(contentId: string) {
  const [, setAnalytics] = useLocalStorage<Record<string, ContentAnalytics>>('engagement-analytics', {})

  const track = (type: EngagementEvent['type'], metadata?: Record<string, any>) => {
    const event: EngagementEvent = {
      type,
      timestamp: Date.now(),
      contentId,
      metadata
    }

    setAnalytics(prev => {
      const updated = { ...(prev || {}) }
      
      if (!updated[contentId]) {
        updated[contentId] = {
          contentId,
          contentTitle: contentId,
          metrics: {
            views: 0,
            clicks: 0,
            shares: 0,
            likes: 0,
            comments: 0,
            timeSpent: 0,
            bounceRate: 0,
            conversionRate: 0
          },
          history: []
        }
      }

      const content = updated[contentId]
      
      switch (type) {
        case 'view':
          content.metrics.views += 1
          break
        case 'click':
          content.metrics.clicks += 1
          break
        case 'share':
          content.metrics.shares += 1
          break
        case 'like':
          content.metrics.likes += 1
          break
        case 'comment':
          content.metrics.comments += 1
          break
      }

      content.history.push(event)
      
      return updated
    })
  }

  return { track }
}
