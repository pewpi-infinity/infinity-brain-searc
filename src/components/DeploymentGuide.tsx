import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CloudArrowUp, 
  Lightning, 
  GithubLogo, 
  CheckCircle, 
  Warning,
  Info,
  Lightbulb
} from '@phosphor-icons/react'

export function DeploymentGuide() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={24} weight="duotone" className="text-accent" />
          Quick Deployment Guide
        </CardTitle>
        <CardDescription>
          Everything you need to know to deploy your Infinity Brain sites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="quickstart" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="tips">Pro Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-4">
            <Alert>
              <Info size={20} weight="duotone" />
              <AlertDescription>
                <strong>3-Step Deployment Process:</strong>
                <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                  <li>Export your pages using the options above</li>
                  <li>Choose your hosting platform (Netlify, Vercel, or GitHub)</li>
                  <li>Deploy via Quick Deploy (drag & drop) or API Deploy (automated)</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle size={20} weight="duotone" className="text-green-500" />
                    Quick Deploy (Easy)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>No API token required!</strong></p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Export your pages</li>
                    <li>• Download HTML files</li>
                    <li>• Drag to platform</li>
                    <li>• Site goes live!</li>
                  </ul>
                  <Badge variant="secondary" className="mt-2">Recommended for beginners</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightning size={20} weight="duotone" className="text-accent" />
                    API Deploy (Advanced)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>One-click automation</strong></p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Get API token from platform</li>
                    <li>• Enter in Deployment Hub</li>
                    <li>• Configure settings</li>
                    <li>• Deploy instantly!</li>
                  </ul>
                  <Badge variant="secondary" className="mt-2">Best for frequent updates</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <div className="space-y-3">
              <Card className="border-teal-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CloudArrowUp size={24} weight="duotone" className="text-teal-500" />
                      <CardTitle className="text-base">Netlify</CardTitle>
                    </div>
                    <Badge className="bg-teal-500 text-white">Popular</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Best for continuous deployment and team collaboration</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="font-semibold">Pros:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• Instant rollbacks</li>
                        <li>• Form handling</li>
                        <li>• Split testing</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Free Tier:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• 100GB bandwidth</li>
                        <li>• 300 build mins</li>
                        <li>• Unlimited sites</li>
                      </ul>
                    </div>
                  </div>
                  <p className="pt-2 text-xs">
                    <strong>Quick Deploy:</strong> <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">app.netlify.com/drop</a>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Lightning size={24} weight="duotone" className="text-primary" />
                      <CardTitle className="text-base">Vercel</CardTitle>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Fast</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Best for edge network deployment and zero configuration</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="font-semibold">Pros:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• Global edge CDN</li>
                        <li>• Serverless functions</li>
                        <li>• Real-time analytics</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Free Tier:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• 100GB bandwidth</li>
                        <li>• 100hrs build time</li>
                        <li>• Unlimited projects</li>
                      </ul>
                    </div>
                  </div>
                  <p className="pt-2 text-xs">
                    <strong>Quick Deploy:</strong> Install CLI with <code className="bg-muted px-1 rounded">npm i -g vercel</code>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GithubLogo size={24} weight="duotone" className="text-secondary" />
                      <CardTitle className="text-base">GitHub Pages</CardTitle>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">Simple</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Best for simple static sites and open-source projects</p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <p className="font-semibold">Pros:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• Free for public repos</li>
                        <li>• Git integration</li>
                        <li>• Jekyll support</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Free Tier:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• 100GB bandwidth</li>
                        <li>• 2000 build mins</li>
                        <li>• Unlimited sites</li>
                      </ul>
                    </div>
                  </div>
                  <p className="pt-2 text-xs">
                    <strong>Quick Deploy:</strong> Enable in repo Settings → Pages
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Alert>
              <Lightbulb size={20} weight="duotone" />
              <AlertDescription>
                <strong>Pro Tips for Successful Deployment:</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">✅ Before Deploying</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Test export locally by opening HTML files in browser</li>
                    <li>• Enable "Include embedded styles" for self-contained files</li>
                    <li>• Use "Standalone" mode for static hosting platforms</li>
                    <li>• Name files descriptively (e.g., user-dashboard.html)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">🚀 During Deployment</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Keep API tokens secure - never share or commit to Git</li>
                    <li>• Start with Quick Deploy before trying API deployment</li>
                    <li>• Choose descriptive site/project names</li>
                    <li>• Save deployment URLs in history for easy access</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">🔧 After Deployment</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Test all pages and links on the live site</li>
                    <li>• Set up custom domain for professional appearance</li>
                    <li>• Enable analytics to track visitors</li>
                    <li>• Set up continuous deployment for automatic updates</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">⚠️ Common Pitfalls to Avoid</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Don't use absolute paths - they break on deployed sites</li>
                    <li>• Don't skip the "test export" step before deploying</li>
                    <li>• Don't forget to check deployment history</li>
                    <li>• Don't deploy without verifying all assets load correctly</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Warning size={20} weight="duotone" />
              <AlertDescription className="text-xs">
                <strong>Troubleshooting:</strong> If your deployment fails, check:
                1) API token permissions, 2) Site/project name availability, 
                3) File size limits, 4) Browser console for errors
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="pt-6">
            <p className="text-sm">
              <strong>Need more help?</strong> Check the full{' '}
              <a 
                href="/DEPLOYMENT-GUIDE.md" 
                target="_blank" 
                className="text-accent hover:underline font-semibold"
              >
                Deployment Guide
              </a>
              {' '}for detailed instructions, troubleshooting, and advanced features.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
