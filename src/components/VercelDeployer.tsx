import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HTMLExporter } from '@/lib/htmlExporter'
import { Lightning, CheckCircle, WarningCircle, Rocket, GithubLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface VercelConfig {
  projectName: string
  apiToken: string
  framework: string
  buildCommand: string
  outputDirectory: string
  installCommand: string
  teamId?: string
}

interface VercelDeployment {
  id: string
  projectName: string
  url: string
  timestamp: string
  status: 'success' | 'failed'
  pages: number
}

export function VercelDeployer() {
  const [config, setConfig] = useState<VercelConfig>({
    projectName: '',
    apiToken: '',
    framework: 'static',
    buildCommand: '',
    outputDirectory: 'dist',
    installCommand: 'npm install'
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentHistory = [], setDeploymentHistory] = useKV<VercelDeployment[]>('vercel-deployments', [])
  const [showApiToken, setShowApiToken] = useState(false)

  const frameworks = [
    { value: 'static', label: 'Static HTML' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' }
  ]

  const handleDeploy = async () => {
    if (!config.projectName) {
      toast.error('Project name is required')
      return
    }

    if (!config.apiToken) {
      toast.error('Vercel API token is required')
      return
    }

    setIsDeploying(true)
    try {
      const pageExport = HTMLExporter.exportCurrentPage({
        title: config.projectName,
        description: 'Deployed from Infinity Brain',
        includeStyles: true,
        includeScripts: true,
        standalone: false
      })

      const vercelConfig = {
        name: config.projectName,
        files: [
          {
            file: 'index.html',
            data: pageExport.html
          },
          {
            file: 'vercel.json',
            data: generateVercelConfig(config)
          }
        ],
        projectSettings: {
          framework: config.framework,
          buildCommand: config.buildCommand || undefined,
          outputDirectory: config.outputDirectory,
          installCommand: config.installCommand
        },
        target: 'production'
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json'
      }

      if (config.teamId) {
        headers['teamId'] = config.teamId
      }

      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers,
        body: JSON.stringify(vercelConfig)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `Vercel deployment failed: ${response.statusText}`)
      }

      const result = await response.json()
      const deployUrl = result.url ? `https://${result.url}` : `https://${config.projectName}.vercel.app`

      const deployment: VercelDeployment = {
        id: result.id || Date.now().toString(),
        projectName: config.projectName,
        url: deployUrl,
        timestamp: new Date().toISOString(),
        status: 'success',
        pages: 1
      }

      setDeploymentHistory((current) => [deployment, ...(current || [])])

      toast.success('Deployed to Vercel!', {
        description: `Your site is live at ${deployUrl}`,
        action: {
          label: 'View Site',
          onClick: () => window.open(deployUrl, '_blank')
        }
      })
    } catch (error) {
      const failedDeployment: VercelDeployment = {
        id: Date.now().toString(),
        projectName: config.projectName,
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

      const vercelJson = generateVercelConfig(config)

      const files = [
        { name: 'index.html', content: pageExport.html },
        { name: 'vercel.json', content: vercelJson }
      ]

      files.forEach(file => {
        const blob = new Blob([file.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })

      toast.success('Files prepared for deployment!', {
        description: 'Upload to Vercel via CLI: vercel --prod',
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

  const handleGitHubImport = () => {
    window.open('https://vercel.com/new', '_blank')
    toast.info('Opening Vercel Import', {
      description: 'Connect your GitHub repository to deploy'
    })
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightning size={32} weight="duotone" className="text-primary" />
          <div>
            <CardTitle>Deploy to Vercel</CardTitle>
            <CardDescription>
              Lightning-fast deployment to Vercel Edge Network
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <WarningCircle size={20} weight="duotone" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Three deployment options:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Quick Deploy:</strong> Download files and deploy via Vercel CLI</li>
                <li><strong>GitHub Import:</strong> Deploy directly from your GitHub repository</li>
                <li><strong>API Deploy:</strong> Automated deployment with API token</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleQuickDeploy}
            disabled={isDeploying}
            variant="secondary"
            size="lg"
          >
            <Rocket size={20} weight="duotone" className="mr-2" />
            Quick Deploy
          </Button>
          <Button
            onClick={handleGitHubImport}
            variant="secondary"
            size="lg"
          >
            <GithubLogo size={20} weight="duotone" className="mr-2" />
            GitHub Import
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
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="my-infinity-site"
              value={config.projectName}
              onChange={(e) => setConfig({ ...config, projectName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Will be deployed to: {config.projectName || 'your-project'}.vercel.app
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vercel-token">Vercel API Token</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiToken(!showApiToken)}
              >
                {showApiToken ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Input
              id="vercel-token"
              type={showApiToken ? 'text' : 'password'}
              placeholder="Enter your Vercel access token"
              value={config.apiToken}
              onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from: <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Vercel Account Settings</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">Framework Preset</Label>
            <Select value={config.framework} onValueChange={(value) => setConfig({ ...config, framework: value })}>
              <SelectTrigger id="framework">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map(fw => (
                  <SelectItem key={fw.value} value={fw.value}>
                    {fw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="build-cmd">Build Command</Label>
              <Input
                id="build-cmd"
                placeholder="npm run build"
                value={config.buildCommand}
                onChange={(e) => setConfig({ ...config, buildCommand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-dir">Output Directory</Label>
              <Input
                id="output-dir"
                placeholder="dist"
                value={config.outputDirectory}
                onChange={(e) => setConfig({ ...config, outputDirectory: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-id">Team ID (Optional)</Label>
            <Input
              id="team-id"
              placeholder="team_xxxxxxxxx"
              value={config.teamId || ''}
              onChange={(e) => setConfig({ ...config, teamId: e.target.value })}
            />
          </div>
        </div>

        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !config.projectName || !config.apiToken}
          className="w-full"
          size="lg"
        >
          <Lightning size={20} weight="duotone" className="mr-2" />
          {isDeploying ? 'Deploying...' : 'Deploy to Vercel'}
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
                      <p className="font-medium text-sm">{deployment.projectName}</p>
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
              <li>Create a Vercel account at vercel.com</li>
              <li>Generate an access token in Account Settings</li>
              <li>Enter your token and project name above</li>
              <li>Deploy instantly to Vercel's global edge network!</li>
            </ol>
            <p className="pt-2">
              <strong>CLI Alternative:</strong> Install Vercel CLI with <code className="bg-muted px-1 rounded">npm i -g vercel</code>
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function generateVercelConfig(config: VercelConfig): string {
  const vercelJson = {
    version: 2,
    name: config.projectName,
    builds: [
      {
        src: "*.html",
        use: "@vercel/static"
      }
    ],
    routes: [
      {
        src: "/(.*)",
        dest: "/$1"
      }
    ],
    buildCommand: config.buildCommand || undefined,
    outputDirectory: config.outputDirectory,
    framework: config.framework !== 'static' ? config.framework : undefined
  }

  return JSON.stringify(vercelJson, null, 2)
}
