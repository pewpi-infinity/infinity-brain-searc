import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Globe,
  PaintBrush,
  Coin,
  Rocket,
  CheckCircle,
  GitBranch,
  Sparkle,
  TrendUp,
  Users,
  ChartLine
} from '@phosphor-icons/react'

interface ProfessionalDashboardProps {
  onNavigate?: (tab: string) => void
}

export function ProfessionalDashboard({ onNavigate }: ProfessionalDashboardProps) {
  const quickActions = [
    {
      icon: PaintBrush,
      label: 'Visual Editor',
      description: 'Edit websites with AI',
      color: 'from-purple-500 to-pink-500',
      action: () => onNavigate?.('visual-editor')
    },
    {
      icon: Globe,
      label: 'Preview Repo',
      description: 'View live websites',
      color: 'from-blue-500 to-cyan-500',
      action: () => onNavigate?.('repo-hub')
    },
    {
      icon: Coin,
      label: 'Mint Token',
      description: 'Create new tokens',
      color: 'from-amber-500 to-orange-500',
      action: () => onNavigate?.('create')
    },
    {
      icon: Rocket,
      label: 'Deploy',
      description: 'Launch your site',
      color: 'from-green-500 to-emerald-500',
      action: () => onNavigate?.('build')
    }
  ]

  const statusIndicators = [
    {
      icon: Brain,
      label: 'Brain Connected',
      status: 'active',
      color: 'text-green-500'
    },
    {
      icon: GitBranch,
      label: 'Repos Synced',
      status: 'synced',
      color: 'text-blue-500'
    },
    {
      icon: Rocket,
      label: 'Deployments Live',
      status: '3 active',
      color: 'text-purple-500'
    }
  ]

  const stats = [
    { label: 'Total Repos', value: '12', icon: GitBranch, trend: '+2' },
    { label: 'Active Users', value: '∞', icon: Users, trend: '+15%' },
    { label: 'Token Value', value: '$∞', icon: Coin, trend: '+8%' },
    { label: 'Page Views', value: '∞K', icon: ChartLine, trend: '+24%' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent p-8 rounded-2xl text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Sparkle size={40} weight="duotone" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to Infinity Brain</h1>
            <p className="text-white/90 text-lg">
              Your professional AI-powered productivity ecosystem
            </p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-4 mt-6">
          {statusIndicators.map((indicator, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2"
            >
              <indicator.icon size={20} className={indicator.color} />
              <div className="text-sm">
                <div className="font-medium">{indicator.label}</div>
                <div className="text-white/70 text-xs">{indicator.status}</div>
              </div>
              <CheckCircle size={16} weight="fill" className="text-green-400 ml-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Card
              key={idx}
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-accent/50"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className={`bg-gradient-to-br ${action.color} rounded-xl p-4 mb-4 inline-block`}>
                  <action.icon size={32} weight="duotone" className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-2">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <stat.icon size={32} className="text-muted-foreground" />
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                    <TrendUp size={12} className="mr-1" />
                    {stat.trend}
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={24} />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates from your ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: GitBranch,
                action: 'Repository updated',
                target: 'infinity-brain-searc',
                time: '2 minutes ago',
                color: 'text-blue-500'
              },
              {
                icon: Coin,
                action: 'Token minted',
                target: 'INF-TOKEN-001',
                time: '15 minutes ago',
                color: 'text-amber-500'
              },
              {
                icon: Rocket,
                action: 'Site deployed',
                target: 'smug_look',
                time: '1 hour ago',
                color: 'text-green-500'
              },
              {
                icon: Brain,
                action: 'AI task completed',
                target: 'Visual editor session',
                time: '2 hours ago',
                color: 'text-purple-500'
              }
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className={`${activity.color}`}>
                  <activity.icon size={24} weight="duotone" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.target}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
