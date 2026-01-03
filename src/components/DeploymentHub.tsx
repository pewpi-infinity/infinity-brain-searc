import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { NetlifyDeployer } from './NetlifyDeployer'
import { VercelDeployer } from './VercelDeployer'
import { GitHubDeployer } from './GitHubDeployer'
import { Rocket, CloudArrowUp, Lightning, GithubLogo, Globe } from '@phosphor-icons/react'

export function DeploymentHub() {
  const [activeTab, setActiveTab] = useState('overview')

  const platforms = [
    {
      id: 'netlify',
      name: 'Netlify',
      icon: CloudArrowUp,
      color: 'text-teal-500',
      description: 'Automated deployments with continuous integration',
      features: ['Free tier', 'Instant rollbacks', 'Custom domains', 'HTTPS included'],
      recommended: true
    },
    {
      id: 'vercel',
      name: 'Vercel',
      icon: Lightning,
      color: 'text-primary',
      description: 'Edge network deployment with zero configuration',
      features: ['Global CDN', 'Serverless functions', 'Analytics', 'Preview deployments'],
      recommended: true
    },
    {
      id: 'github',
      name: 'GitHub Pages',
      icon: GithubLogo,
      color: 'text-secondary',
      description: 'Deploy directly from your GitHub repository',
      features: ['Free hosting', 'Custom domain', 'HTTPS', 'Jekyll support'],
      recommended: false
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="gradient-border bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rocket size={40} weight="duotone" className="text-accent" />
            <div>
              <CardTitle className="text-2xl">Deployment Hub</CardTitle>
              <CardDescription className="text-base">
                Deploy your Infinity Brain sites to world-class hosting platforms
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-auto gap-2 bg-card/80 backdrop-blur p-2">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-2 py-3"
          >
            <Globe size={20} weight="duotone" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="netlify" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground flex flex-col md:flex-row items-center gap-2 py-3"
          >
            <CloudArrowUp size={20} weight="duotone" />
            <span>Netlify</span>
          </TabsTrigger>
          <TabsTrigger 
            value="vercel" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-secondary-foreground flex flex-col md:flex-row items-center gap-2 py-3"
          >
            <Lightning size={20} weight="duotone" />
            <span>Vercel</span>
          </TabsTrigger>
          <TabsTrigger 
            value="github" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-accent-foreground flex flex-col md:flex-row items-center gap-2 py-3"
          >
            <GithubLogo size={20} weight="duotone" />
            <span>GitHub</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <Card 
                  key={platform.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setActiveTab(platform.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon size={32} weight="duotone" className={platform.color} />
                      {platform.recommended && (
                        <Badge className="bg-gradient-to-r from-accent to-primary text-primary-foreground">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-accent transition-colors">
                      {platform.name}
                    </CardTitle>
                    <CardDescription>
                      {platform.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {platform.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">How Deployment Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">1</span>
                    Export Your Site
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your Infinity Brain pages are converted to static HTML files with all styles and content embedded
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">2</span>
                    Choose Platform
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Select from Netlify, Vercel, or GitHub Pages based on your needs and preferences
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">3</span>
                    Configure & Deploy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add your API credentials or use quick deploy methods to push your site live
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm">4</span>
                    Go Live
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your site is deployed globally with HTTPS, custom domains, and automatic scaling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Quick Deploy:</strong> No API tokens needed! Download files and use drag-and-drop deployment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>API Deploy:</strong> Automate deployments directly from Infinity Brain with API tokens</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Custom Domains:</strong> All platforms support free custom domains with HTTPS</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span><strong>Continuous Deployment:</strong> Connect GitHub for automatic deployments on every push</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="netlify" className="mt-6">
          <NetlifyDeployer />
        </TabsContent>

        <TabsContent value="vercel" className="mt-6">
          <VercelDeployer />
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <GitHubDeployer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
