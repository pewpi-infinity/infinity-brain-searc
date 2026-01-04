import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { 
  ChartLine,
  TrendUp,
  TrendDown,
  Users,
  Eye,
  Heart,
  ChatCircle,
  Share,
  ArrowUp,
  ArrowDown,
  TwitterLogo,
  FacebookLogo,
  LinkedinLogo,
  InstagramLogo,
  MusicNote
} from '@phosphor-icons/react'

interface PostAnalytics {
  postId: string
  platform: string
  impressions: number
  reach: number
  engagement: number
  likes: number
  comments: number
  shares: number
  timestamp: number
}

interface PlatformMetrics {
  platform: string
  followers: number
  growth: number
  avgEngagement: number
  totalPosts: number
  icon: typeof TwitterLogo
  color: string
}

export function AnalyticsDashboard() {
  const [postHistory] = useLocalStorage<any[]>('post-history', [])
  const [platforms] = useLocalStorage<any[]>('social-platforms', [])
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const generateMockAnalytics = (): PostAnalytics[] => {
    return (postHistory || []).flatMap(post => 
      post.platforms.map((platformName: string) => ({
        postId: post.id,
        platform: platformName,
        impressions: Math.floor(Math.random() * 5000) + 500,
        reach: Math.floor(Math.random() * 3000) + 300,
        engagement: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 300) + 20,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 100) + 10,
        timestamp: post.timestamp
      }))
    )
  }

  const analytics = useMemo(() => generateMockAnalytics(), [postHistory])

  const platformMetrics: PlatformMetrics[] = useMemo(() => {
    const platformMap = {
      'Twitter/X': { icon: TwitterLogo, color: 'oklch(0.55 0.15 220)' },
      'Facebook': { icon: FacebookLogo, color: 'oklch(0.50 0.20 250)' },
      'LinkedIn': { icon: LinkedinLogo, color: 'oklch(0.45 0.15 240)' },
      'Instagram': { icon: InstagramLogo, color: 'oklch(0.60 0.25 320)' },
      'TikTok': { icon: MusicNote, color: 'oklch(0.40 0.10 280)' }
    }

    return (platforms || [])
      .filter(p => p.connected)
      .map(platform => {
        const platformData = analytics.filter(a => a.platform === platform.name)
        const totalEngagement = platformData.reduce((sum, a) => sum + a.engagement, 0)
        const avgEngagement = platformData.length > 0 ? totalEngagement / platformData.length : 0

        return {
          platform: platform.name,
          followers: Math.floor(Math.random() * 50000) + 1000,
          growth: Math.random() * 20 - 5,
          avgEngagement: avgEngagement,
          totalPosts: platformData.length,
          icon: platformMap[platform.name as keyof typeof platformMap]?.icon || TwitterLogo,
          color: platformMap[platform.name as keyof typeof platformMap]?.color || 'oklch(0.50 0.15 250)'
        }
      })
  }, [platforms, analytics])

  const totalMetrics = useMemo(() => {
    const total = analytics.reduce((acc, curr) => ({
      impressions: acc.impressions + curr.impressions,
      reach: acc.reach + curr.reach,
      engagement: acc.engagement + curr.engagement,
      likes: acc.likes + curr.likes,
      comments: acc.comments + curr.comments,
      shares: acc.shares + curr.shares
    }), { impressions: 0, reach: 0, engagement: 0, likes: 0, comments: 0, shares: 0 })

    return total
  }, [analytics])

  const engagementRate = totalMetrics.reach > 0 
    ? ((totalMetrics.engagement / totalMetrics.reach) * 100).toFixed(2)
    : '0.00'

  const topPerformingPost = useMemo(() => {
    if (analytics.length === 0) return null
    return analytics.reduce((best, current) => 
      current.engagement > best.engagement ? current : best
    )
  }, [analytics])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChartLine size={28} weight="duotone" className="text-accent" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Track your social media performance across all platforms
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod('7d')}
              >
                7 Days
              </Badge>
              <Badge
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod('30d')}
              >
                30 Days
              </Badge>
              <Badge
                variant={selectedPeriod === '90d' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod('90d')}
              >
                90 Days
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Eye size={24} weight="duotone" className="text-accent" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <ArrowUp size={12} weight="bold" className="mr-1" />
                  12.5%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalMetrics.impressions)}</p>
              <p className="text-xs text-muted-foreground">Total Impressions</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Users size={24} weight="duotone" className="text-secondary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <ArrowUp size={12} weight="bold" className="mr-1" />
                  8.3%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalMetrics.reach)}</p>
              <p className="text-xs text-muted-foreground">Total Reach</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Heart size={24} weight="duotone" className="text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <ArrowUp size={12} weight="bold" className="mr-1" />
                  15.7%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalMetrics.engagement)}</p>
              <p className="text-xs text-muted-foreground">Total Engagement</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-accent/10 to-secondary/10">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-accent/20">
                  <TrendUp size={24} weight="duotone" className="text-accent" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {engagementRate}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{engagementRate}%</p>
              <p className="text-xs text-muted-foreground">Engagement Rate</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Heart size={20} weight="fill" className="text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">{formatNumber(totalMetrics.likes)}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <ChatCircle size={20} weight="fill" className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">{formatNumber(totalMetrics.comments)}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Share size={20} weight="fill" className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">{formatNumber(totalMetrics.shares)}</p>
                  <p className="text-xs text-muted-foreground">Shares</p>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
          <TabsTrigger value="performance">Top Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          {platformMetrics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <ChartLine size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
                <p>Connect platforms to see analytics</p>
              </CardContent>
            </Card>
          ) : (
            platformMetrics.map((platform) => {
              const PlatformIcon = platform.icon
              return (
                <Card key={platform.platform} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          <PlatformIcon
                            size={32}
                            weight="fill"
                            style={{ color: platform.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{platform.platform}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(platform.followers)} followers
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={platform.growth >= 0 ? 'default' : 'destructive'}
                        className="text-sm"
                      >
                        {platform.growth >= 0 ? (
                          <TrendUp size={14} weight="bold" className="mr-1" />
                        ) : (
                          <TrendDown size={14} weight="bold" className="mr-1" />
                        )}
                        {Math.abs(platform.growth).toFixed(1)}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Posts</p>
                        <p className="text-lg font-bold">{platform.totalPosts}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Avg. Engagement</p>
                        <p className="text-lg font-bold">{formatNumber(Math.round(platform.avgEngagement))}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Growth</p>
                        <p className="text-lg font-bold">{platform.growth >= 0 ? '+' : ''}{platform.growth.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Engagement Rate</span>
                        <span className="font-semibold">
                          {platform.totalPosts > 0 ? ((platform.avgEngagement / platform.followers) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendUp size={20} weight="duotone" className="text-accent" />
                Top Performing Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformingPost ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-secondary/10">
                    <Badge variant="secondary" className="mb-2">{topPerformingPost.platform}</Badge>
                    <p className="text-sm text-muted-foreground mb-4">
                      Posted {new Date(topPerformingPost.timestamp).toLocaleDateString()}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Impressions</p>
                        <p className="text-xl font-bold text-accent">{formatNumber(topPerformingPost.impressions)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Reach</p>
                        <p className="text-xl font-bold text-secondary">{formatNumber(topPerformingPost.reach)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Engagement</p>
                        <p className="text-xl font-bold text-primary">{formatNumber(topPerformingPost.engagement)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3 text-center">
                      <Heart size={20} weight="fill" className="mx-auto mb-1 text-accent" />
                      <p className="text-lg font-bold">{formatNumber(topPerformingPost.likes)}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <ChatCircle size={20} weight="fill" className="mx-auto mb-1 text-secondary" />
                      <p className="text-lg font-bold">{formatNumber(topPerformingPost.comments)}</p>
                      <p className="text-xs text-muted-foreground">Comments</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <Share size={20} weight="fill" className="mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold">{formatNumber(topPerformingPost.shares)}</p>
                      <p className="text-xs text-muted-foreground">Shares</p>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <TrendUp size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
                  <p>No posts yet to analyze</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Post Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <ChartLine size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
                  <p>Start posting to see performance data</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {analytics.slice(0, 10).map((post, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{post.platform}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Eye size={12} /> {formatNumber(post.impressions)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} /> {formatNumber(post.reach)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={12} /> {formatNumber(post.likes)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {formatNumber(post.engagement)} eng.
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
