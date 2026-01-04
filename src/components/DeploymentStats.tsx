import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { CloudArrowUp, Lightning, GithubLogo, ChartBar, Globe, CheckCircle } from '@phosphor-icons/react'

interface DeploymentStats {
  totalDeployments: number
  netlifyCount: number
  vercelCount: number
  githubCount: number
  lastDeployment?: {
    platform: string
    timestamp: string
    url: string
  }
}

export function DeploymentStats() {
  const [netlifyHistory = []] = useLocalStorage<any[]>('netlify-deployments', [])
  const [vercelHistory = []] = useLocalStorage<any[]>('vercel-deployments', [])
  const [stats, setStats] = useState<DeploymentStats>({
    totalDeployments: 0,
    netlifyCount: 0,
    vercelCount: 0,
    githubCount: 0
  })

  useEffect(() => {
    const netlifyCount = netlifyHistory?.length || 0
    const vercelCount = vercelHistory?.length || 0
    const githubCount = 0
    const totalDeployments = netlifyCount + vercelCount + githubCount

    const allDeployments = [
      ...(netlifyHistory || []).map(d => ({ ...d, platform: 'Netlify' })),
      ...(vercelHistory || []).map(d => ({ ...d, platform: 'Vercel' }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const lastDeployment = allDeployments[0] ? {
      platform: allDeployments[0].platform,
      timestamp: allDeployments[0].timestamp,
      url: allDeployments[0].url
    } : undefined

    setStats({
      totalDeployments,
      netlifyCount,
      vercelCount,
      githubCount,
      lastDeployment
    })
  }, [netlifyHistory, vercelHistory])

  const getPlatformPercentage = (count: number) => {
    if (stats.totalDeployments === 0) return 0
    return Math.round((count / stats.totalDeployments) * 100)
  }

  if (stats.totalDeployments === 0) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-accent/10 via-primary/5 to-secondary/10 border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ChartBar size={28} weight="duotone" className="text-accent" />
          <div>
            <CardTitle>Deployment Statistics</CardTitle>
            <CardDescription>
              Your deployment history across all platforms
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Globe size={24} weight="duotone" className="text-accent" />
            </div>
            <p className="text-3xl font-bold text-accent">{stats.totalDeployments}</p>
            <p className="text-xs text-muted-foreground">Total Deployments</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CloudArrowUp size={24} weight="duotone" className="text-teal-500" />
            </div>
            <p className="text-3xl font-bold">{stats.netlifyCount}</p>
            <p className="text-xs text-muted-foreground">Netlify</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Lightning size={24} weight="duotone" className="text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.vercelCount}</p>
            <p className="text-xs text-muted-foreground">Vercel</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <GithubLogo size={24} weight="duotone" className="text-secondary" />
            </div>
            <p className="text-3xl font-bold">{stats.githubCount}</p>
            <p className="text-xs text-muted-foreground">GitHub Pages</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Platform Distribution</h4>
          
          {stats.netlifyCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CloudArrowUp size={16} weight="duotone" className="text-teal-500" />
                  <span>Netlify</span>
                </div>
                <span className="text-muted-foreground">{getPlatformPercentage(stats.netlifyCount)}%</span>
              </div>
              <Progress value={getPlatformPercentage(stats.netlifyCount)} className="h-2" />
            </div>
          )}

          {stats.vercelCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Lightning size={16} weight="duotone" className="text-primary" />
                  <span>Vercel</span>
                </div>
                <span className="text-muted-foreground">{getPlatformPercentage(stats.vercelCount)}%</span>
              </div>
              <Progress value={getPlatformPercentage(stats.vercelCount)} className="h-2" />
            </div>
          )}

          {stats.githubCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <GithubLogo size={16} weight="duotone" className="text-secondary" />
                  <span>GitHub Pages</span>
                </div>
                <span className="text-muted-foreground">{getPlatformPercentage(stats.githubCount)}%</span>
              </div>
              <Progress value={getPlatformPercentage(stats.githubCount)} className="h-2" />
            </div>
          )}
        </div>

        {stats.lastDeployment && (
          <div className="pt-4 border-t">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} weight="duotone" className="text-green-500 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-sm">Latest Deployment</p>
                <p className="text-xs text-muted-foreground">
                  {stats.lastDeployment.platform} • {new Date(stats.lastDeployment.timestamp).toLocaleString()}
                </p>
                {stats.lastDeployment.url && (
                  <a 
                    href={stats.lastDeployment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                  >
                    View Live Site
                    <Globe size={12} weight="duotone" />
                  </a>
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
