import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { HTMLExporter } from '@/lib/htmlExporter'
import { CloudArrowUp, CheckCircle, WarningCircle, Rocket } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface DeploymentConfig {
  siteName: string
  apiToken: string
  buildCommand: string
  publishDirectory: string
  autoPublish: boolean
}

interface DeploymentHistory {
  id: string
  siteName: string
  url: string
  timestamp: string
  status: 'success' | 'failed'
  pages: number
}

export function NetlifyDeployer() {
  const [config, setConfig] = useState<DeploymentConfig>({
    siteName: '',
    apiToken: '',
    buildCommand: '',
    publishDirectory: 'dist',
    autoPublish: true
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentHistory = [], setDeploymentHistory] = useKV<DeploymentHistory[]>('netlify-deployments', [])
  const [showApiToken, setShowApiToken] = useState(false)

  const handleDeploy = async () => {
    if (!config.siteName) {
      toast.error('Site name is required')
      return
    }

    if (!config.apiToken) {
      toast.error('Netlify API token is required')
      return
    }

    setIsDeploying(true)
    try {
      const pageExport = HTMLExporter.exportCurrentPage({
        title: config.siteName,
        description: 'Deployed from Infinity Brain',
        includeStyles: true,
        includeScripts: true,
        standalone: false
      })

      const deploymentPackage = {
        files: {
          'index.html': pageExport.html,
          'netlify.toml': generateNetlifyConfig(config)
        }
      }

      const formData = new FormData()
      const blob = new Blob([JSON.stringify(deploymentPackage)], { type: 'application/json' })
      formData.append('deploy', blob)

      const response = await fetch(`https://api.netlify.com/api/v1/sites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Netlify deployment failed: ${response.statusText}`)
      }

      const result = await response.json()
      const deployUrl = result.ssl_url || result.url || `https://${config.siteName}.netlify.app`

      const deployment: DeploymentHistory = {
        id: result.id || Date.now().toString(),
        siteName: config.siteName,
        url: deployUrl,
        timestamp: new Date().toISOString(),
        status: 'success',
        pages: 1
      }

      setDeploymentHistory((current) => [deployment, ...(current || [])])

      toast.success('Deployed to Netlify!', {
        description: `Your site is live at ${deployUrl}`,
        action: {
          label: 'View Site',
          onClick: () => window.open(deployUrl, '_blank')
        }
      })
    } catch (error) {
      const failedDeployment: DeploymentHistory = {
        id: Date.now().toString(),
        siteName: config.siteName,
        url: '',
        timestamp: new Date().toISOString(),
        status: 'failed',
        pages: 0
      }
      setDeploymentHistory((current) => [failedDeployment, ...(current || [])])

      toast.error('Deployment failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleQuickDeploy = async () => {
    setIsDeploying(true)
    try {
      const pageExport = HTMLExporter.exportCurrentPage({
        title: 'Infinity Brain Site',
        description: 'Quick deployment from Infinity Brain',
        includeStyles: true,
        includeScripts: true,
        standalone: false
      })

      const blob = new Blob([pageExport.html], { type: 'text/html' })
      const file = new File([blob], 'index.html', { type: 'text/html' })

      HTMLExporter.downloadHTML(pageExport)

      toast.success('Site prepared for deployment!', {
        description: 'Upload the downloaded file to Netlify Drop (app.netlify.com/drop)',
        duration: 5000
      })
    } catch (error) {
      toast.error('Quick deploy preparation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CloudArrowUp size={32} weight="duotone" className="text-accent" />
          <div>
            <CardTitle>Deploy to Netlify</CardTitle>
            <CardDescription>
              Automated deployment to Netlify hosting platform
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <WarningCircle size={20} weight="duotone" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Two deployment options:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Quick Deploy:</strong> Download HTML and drag to Netlify Drop (no API token needed)</li>
                <li><strong>API Deploy:</strong> Automated deployment with API token</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            onClick={handleQuickDeploy}
            disabled={isDeploying}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            <Rocket size={20} weight="duotone" className="mr-2" />
            Quick Deploy (Drag & Drop)
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or use API deployment</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              placeholder="my-awesome-site"
              value={config.siteName}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Will be deployed to: {config.siteName || 'your-site'}.netlify.app
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-token">Netlify API Token</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiToken(!showApiToken)}
              >
                {showApiToken ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Input
              id="api-token"
              type={showApiToken ? 'text' : 'password'}
              placeholder="Enter your Netlify personal access token"
              value={config.apiToken}
              onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from: <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Netlify User Settings</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publish-dir">Publish Directory</Label>
            <Input
              id="publish-dir"
              placeholder="dist"
              value={config.publishDirectory}
              onChange={(e) => setConfig({ ...config, publishDirectory: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-publish"
              checked={config.autoPublish}
              onCheckedChange={(checked) => 
                setConfig({ ...config, autoPublish: checked as boolean })
              }
            />
            <Label htmlFor="auto-publish" className="font-normal cursor-pointer">
              Automatically publish after build
            </Label>
          </div>
        </div>

        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !config.siteName || !config.apiToken}
          className="w-full"
          size="lg"
        >
          <CloudArrowUp size={20} weight="duotone" className="mr-2" />
          {isDeploying ? 'Deploying...' : 'Deploy to Netlify'}
        </Button>

        {deploymentHistory.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm">Recent Deployments</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {deploymentHistory.slice(0, 5).map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {deployment.status === 'success' ? (
                      <CheckCircle size={20} weight="duotone" className="text-green-500" />
                    ) : (
                      <WarningCircle size={20} weight="duotone" className="text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{deployment.siteName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deployment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {deployment.status === 'success' && (
                      <Badge variant="secondary" className="text-xs">
                        Live
                      </Badge>
                    )}
                  </div>
                  {deployment.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(deployment.url, '_blank')}
                    >
                      Visit
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-xs space-y-2">
            <p className="font-semibold">Getting Started:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create a Netlify account at netlify.com</li>
              <li>Generate a personal access token in User Settings</li>
              <li>Enter your token above and choose a site name</li>
              <li>Click deploy and your site will be live in seconds!</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function generateNetlifyConfig(config: DeploymentConfig): string {
  return `[build]
  publish = "${config.publishDirectory}"
  ${config.buildCommand ? `command = "${config.buildCommand}"` : ''}

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer-when-downgrade"
`
}
