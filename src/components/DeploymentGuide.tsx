import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Rocket, 
  CheckCircle, 
  Lightning, 
  Globe, 
  Lock, 
  ChartLine,
  CloudArrowUp,
  Gear,
  Link as LinkIcon
} from '@phosphor-icons/react'

export function DeploymentGuide() {
  return (
    <div className="space-y-6">
      <Card className="gradient-border bg-gradient-to-br from-accent/10 to-primary/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Rocket size={40} weight="duotone" className="text-accent" />
            <div>
              <CardTitle className="text-2xl">Deployment Guide</CardTitle>
              <CardDescription className="text-base">
                Everything you need to deploy Infinity Brain to the world
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="quickstart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="quickstart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightning size={24} weight="duotone" className="text-accent" />
                5-Minute Setup
              </CardTitle>
              <CardDescription>
                Get your site live with one-click deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Get Your Netlify Token</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sign up for free at netlify.com, then get your API token from User Settings → Applications
                    </p>
                    <a 
                      href="https://app.netlify.com/user/applications#personal-access-tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
                    >
                      <LinkIcon size={14} />
                      Get Token
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Configure & Save</h4>
                    <p className="text-sm text-muted-foreground">
                      Paste your token in the Netlify deployer, optionally add a site name, then click "Save Configuration"
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Deploy!</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the big "One-Click Deploy 🚀" button and watch your site go live in ~20 seconds
                    </p>
                  </div>
                </div>
              </div>

              <Alert className="border-green-500/50 bg-green-500/5">
                <CheckCircle size={20} weight="duotone" className="text-green-500" />
                <AlertDescription>
                  <strong>That's it!</strong> After initial setup, you can re-deploy anytime with just one click.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alternative: Manual Deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't want to use API tokens? Use the manual download option:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Click "Download for Manual Deploy" button</li>
                <li>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">app.netlify.com/drop</a></li>
                <li>Drag and drop your downloaded file</li>
                <li>Your site is live instantly!</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Lightning size={24} weight="duotone" className="text-accent" />
                  <CardTitle className="text-lg">One-Click Deployment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  After initial setup, deploy your entire site with a single button click. No command line, no configuration files.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={24} weight="duotone" className="text-primary" />
                  <CardTitle className="text-lg">Secure Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  API tokens are stored securely in your browser using Spark's KV system. Never exposed or transmitted unnecessarily.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <ChartLine size={24} weight="duotone" className="text-secondary" />
                  <CardTitle className="text-lg">Progress Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time progress bar shows export, preparation, site creation, and deployment stages with clear feedback.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={24} weight="duotone" className="text-accent" />
                  <CardTitle className="text-lg">Global CDN</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sites are deployed to Netlify's worldwide edge network with automatic HTTPS certificates and instant propagation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <CloudArrowUp size={24} weight="duotone" className="text-primary" />
                  <CardTitle className="text-lg">Deployment History</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track all deployments with timestamps and live URLs. Visit any previous deployment or clear history anytime.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Gear size={24} weight="duotone" className="text-secondary" />
                  <CardTitle className="text-lg">Flexible Options</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Choose between automated API deployment or manual download. Custom site names or auto-generated URLs.
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-accent/50">
            <AlertDescription className="text-sm">
              <strong>What gets deployed:</strong> Standalone HTML with embedded styles, optimized for static hosting. 
              All visual design preserved, interactive elements converted to static display.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>World Currency Deployment Architecture</CardTitle>
              <CardDescription>
                How to structure your deployment for global scale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-primary text-primary-foreground">Primary</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Infinity Brain on Spark</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Main platform for full functionality:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• Token minting and management</li>
                        <li>• User authentication and sessions</li>
                        <li>• Real-time trading and transactions</li>
                        <li>• AI-powered features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-accent text-accent-foreground">Mirror</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Static Sites on Netlify/GitHub</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Public-facing content:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• Marketing and landing pages</li>
                        <li>• Documentation and guides</li>
                        <li>• Token information displays</li>
                        <li>• SEO-optimized content</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-secondary text-secondary-foreground">Storage</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Spark KV + Optional Backend</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Persistent data layer:
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• User accounts and sessions (Spark KV)</li>
                        <li>• Token balances and ownership (Spark KV)</li>
                        <li>• Transaction history (Spark KV)</li>
                        <li>• Advanced features (MongoDB/API - optional)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Recommended Workflow:</strong> Develop and run the full app on Spark, then use one-click 
                  deployment to create static mirrors on Netlify for public access and marketing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scaling Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">Start: Spark + Netlify</h5>
                    <p className="text-xs text-muted-foreground">
                      Use Spark for app logic, deploy static mirrors to Netlify
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">Grow: Add Backend APIs</h5>
                    <p className="text-xs text-muted-foreground">
                      Implement MongoDB for advanced querying and analytics
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">Scale: Multi-Platform</h5>
                    <p className="text-xs text-muted-foreground">
                      Deploy to multiple regions and platforms for redundancy
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm">Global: Edge Network</h5>
                    <p className="text-xs text-muted-foreground">
                      Distribute globally with CDN and edge computing
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle size={24} weight="duotone" className="text-accent" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Deploy regularly to keep public mirrors updated</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Use custom domains for professional branding</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Keep API tokens secure and never share them</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Test exported pages locally before deploying</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Direct users to main app for interactive features</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Monitor deployment history for audit trail</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
