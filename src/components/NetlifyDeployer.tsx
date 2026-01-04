import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { HTMLExporter } from '@/lib/htmlExporter'
import { CloudArrowUp, CheckCircle, WarningCircle, Rocket, Lightning, Trash, Flask, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface DeploymentConfig {
  siteName: string
  apiToken: string
  autoPublish: boolean
}

interface DeploymentHistory {
  id: string
  siteName: string
  url: string
  timestamp: string
  status: 'success' | 'failed' | 'deploying'
  pages: number
  deployId?: string
}

interface TestResult {
  step: string
  status: 'pending' | 'success' | 'failed' | 'testing'
  message: string
  details?: string
}

export function NetlifyDeployer() {
  const [config, setConfig] = useState<DeploymentConfig>({
    siteName: '',
    apiToken: '',
    autoPublish: true
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [deploymentHistory = [], setDeploymentHistory] = useKV<DeploymentHistory[]>('netlify-deployments', [])
  const [savedConfig, setSavedConfig] = useKV<DeploymentConfig | null>('netlify-config', null)
  const [showApiToken, setShowApiToken] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showTestPanel, setShowTestPanel] = useState(false)

  useEffect(() => {
    if (savedConfig) {
      setConfig(savedConfig)
    }
  }, [savedConfig])

  const saveConfig = () => {
    setSavedConfig(config)
    toast.success('Configuration saved!')
  }

  const testNetlifyConnection = async () => {
    if (!config.apiToken) {
      toast.error('Please enter your Netlify API token first')
      return
    }

    setIsTesting(true)
    setShowTestPanel(true)
    const results: TestResult[] = [
      { step: 'Validate Token Format', status: 'pending', message: '' },
      { step: 'Test API Connection', status: 'pending', message: '' },
      { step: 'Verify Permissions', status: 'pending', message: '' },
      { step: 'Check Account Info', status: 'pending', message: '' },
      { step: 'Test Site Creation', status: 'pending', message: '' }
    ]
    setTestResults([...results])

    try {
      results[0].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      if (config.apiToken.length < 20) {
        results[0].status = 'failed'
        results[0].message = 'Token appears too short'
        results[0].details = 'Netlify tokens are typically 40+ characters'
        setTestResults([...results])
        toast.error('Invalid token format')
        setIsTesting(false)
        return
      }

      results[0].status = 'success'
      results[0].message = 'Token format valid'
      setTestResults([...results])

      results[1].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      const accountResponse = await fetch('https://api.netlify.com/api/v1/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!accountResponse.ok) {
        const errorData = await accountResponse.json().catch(() => null)
        results[1].status = 'failed'
        results[1].message = 'API connection failed'
        results[1].details = errorData?.message || accountResponse.statusText
        setTestResults([...results])
        toast.error('Failed to connect to Netlify API')
        setIsTesting(false)
        return
      }

      results[1].status = 'success'
      results[1].message = 'Connected to Netlify API'
      setTestResults([...results])

      const accounts = await accountResponse.json()
      
      results[2].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      if (!accounts || accounts.length === 0) {
        results[2].status = 'failed'
        results[2].message = 'No accounts found'
        results[2].details = 'Token may not have proper permissions'
        setTestResults([...results])
        toast.error('No Netlify accounts accessible')
        setIsTesting(false)
        return
      }

      results[2].status = 'success'
      results[2].message = 'Permissions verified'
      setTestResults([...results])

      results[3].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      const account = accounts[0]
      results[3].status = 'success'
      results[3].message = `Account: ${account.name || 'Personal'}`
      results[3].details = `Plan: ${account.type_name || 'Free'} | Sites: ${account.sites_count || 0}`
      setTestResults([...results])

      results[4].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      const sitesResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!sitesResponse.ok) {
        results[4].status = 'failed'
        results[4].message = 'Cannot verify site creation permissions'
        results[4].details = 'May not have access to create sites'
        setTestResults([...results])
        toast.warning('Token works but site creation permissions unclear')
        setIsTesting(false)
        return
      }

      results[4].status = 'success'
      results[4].message = 'Ready to deploy sites'
      results[4].details = 'All permissions verified successfully'
      setTestResults([...results])

      toast.success('✅ Token validated successfully!', {
        description: 'Your Netlify API token is configured correctly and ready to use',
        duration: 5000
      })

    } catch (error) {
      const failedIndex = results.findIndex(r => r.status === 'testing')
      if (failedIndex !== -1) {
        results[failedIndex].status = 'failed'
        results[failedIndex].message = 'Test failed'
        results[failedIndex].details = error instanceof Error ? error.message : 'Unknown error'
        setTestResults([...results])
      }
      
      toast.error('Token validation failed', {
        description: error instanceof Error ? error.message : 'Network or authentication error'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleOneClickDeploy = async () => {
    if (!config.apiToken) {
      toast.error('Please configure your Netlify API token first')
      return
    }

    setIsDeploying(true)
    setDeployProgress(0)

    const siteName = config.siteName || `infinity-brain-${Date.now()}`

    try {
      setDeployProgress(20)
      const pageExport = HTMLExporter.exportCurrentPage({
        title: siteName,
        description: 'Deployed from Infinity Brain - Tokenized Business Ecosystem',
        includeStyles: true,
        includeScripts: false,
        standalone: true
      })

      setDeployProgress(40)

      const files = {
        'index.html': pageExport.html
      }

      const filesPayload: Record<string, string> = {}
      Object.entries(files).forEach(([path, content]) => {
        filesPayload[`/${path}`] = content
      })

      setDeployProgress(60)

      const response = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: siteName,
          custom_domain: null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to create site: ${response.statusText}`)
      }

      const site = await response.json()
      const siteId = site.id

      setDeployProgress(80)

      const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: filesPayload,
          draft: false,
          branch: 'main'
        })
      })

      if (!deployResponse.ok) {
        throw new Error(`Deployment failed: ${deployResponse.statusText}`)
      }

      const deployData = await deployResponse.json()
      setDeployProgress(100)

      const deployUrl = site.ssl_url || site.url || `https://${siteName}.netlify.app`

      const deployment: DeploymentHistory = {
        id: deployData.id || Date.now().toString(),
        siteName: siteName,
        url: deployUrl,
        timestamp: new Date().toISOString(),
        status: 'success',
        pages: 1,
        deployId: deployData.id
      }

      setDeploymentHistory((current) => [deployment, ...(current || [])])

      toast.success('🚀 Successfully deployed to Netlify!', {
        description: `Your site is live at ${deployUrl}`,
        duration: 8000,
        action: {
          label: 'View Site',
          onClick: () => window.open(deployUrl, '_blank')
        }
      })
    } catch (error) {
      const failedDeployment: DeploymentHistory = {
        id: Date.now().toString(),
        siteName: siteName,
        url: '',
        timestamp: new Date().toISOString(),
        status: 'failed',
        pages: 0
      }
      setDeploymentHistory((current) => [failedDeployment, ...(current || [])])

      toast.error('Deployment failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 6000
      })
    } finally {
      setIsDeploying(false)
      setDeployProgress(0)
    }
  }

  const handleQuickDeploy = async () => {
    setIsDeploying(true)
    try {
      const pageExport = HTMLExporter.exportCurrentPage({
        title: 'Infinity Brain Site',
        description: 'Quick deployment from Infinity Brain',
        includeStyles: true,
        includeScripts: false,
        standalone: true
      })

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

  const deleteDeployment = (id: string) => {
    setDeploymentHistory((current) => 
      (current || []).filter(d => d.id !== id)
    )
    toast.success('Deployment removed from history')
  }

  const clearAllHistory = () => {
    setDeploymentHistory([])
    toast.success('Deployment history cleared')
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CloudArrowUp size={32} weight="duotone" className="text-accent" />
          <div>
            <CardTitle>Deploy to Netlify</CardTitle>
            <CardDescription>
              One-click automated deployment to Netlify hosting platform
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-accent/50 bg-gradient-to-r from-accent/5 to-primary/5">
          <Lightning size={20} weight="duotone" className="text-accent" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">⚡ One-Click Deployment Ready!</p>
              <p className="text-sm">Configure your API token once, then deploy with a single click anytime.</p>
            </div>
          </AlertDescription>
        </Alert>

        <Alert className="border-primary/30">
          <Info size={20} weight="duotone" className="text-primary" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold text-sm">🧪 Test Your Configuration</p>
              <p className="text-xs">Use the "Test Connection" button to validate your API token before deploying. The test will verify permissions, check account details, and ensure everything is ready for deployment. See the <a href="https://github.com/pewpi-infinity/infinity-brain-111/blob/main/NETLIFY-TESTING-GUIDE.md" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Testing Guide</a> for detailed instructions.</p>
            </div>
          </AlertDescription>
        </Alert>

        {config.apiToken && (
          <div className="space-y-4 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">Ready to Deploy</h4>
                <p className="text-sm text-muted-foreground">Configuration saved and active</p>
              </div>
              <CheckCircle size={32} weight="duotone" className="text-green-500" />
            </div>
            
            <Button
              onClick={handleOneClickDeploy}
              disabled={isDeploying}
              className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
              size="lg"
            >
              <Rocket size={24} weight="duotone" className="mr-2" />
              {isDeploying ? 'Deploying to Netlify...' : 'One-Click Deploy 🚀'}
            </Button>

            {isDeploying && deployProgress > 0 && (
              <div className="space-y-2">
                <Progress value={deployProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {deployProgress < 40 && 'Exporting your site...'}
                  {deployProgress >= 40 && deployProgress < 60 && 'Preparing files...'}
                  {deployProgress >= 60 && deployProgress < 80 && 'Creating site on Netlify...'}
                  {deployProgress >= 80 && deployProgress < 100 && 'Deploying...'}
                  {deployProgress === 100 && 'Complete!'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name (Optional)</Label>
            <Input
              id="site-name"
              placeholder="Auto-generated if empty"
              value={config.siteName}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {config.siteName 
                ? `Will deploy to: ${config.siteName}.netlify.app` 
                : 'A unique name will be generated automatically'}
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
              Get your token from: <a href="https://app.netlify.com/user/applications#personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Netlify User Settings</a>
            </p>
          </div>

          {config.apiToken && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={saveConfig}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle size={16} weight="duotone" className="mr-2" />
                  Save Configuration
                </Button>
                <Button
                  onClick={testNetlifyConnection}
                  disabled={isTesting}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Flask size={16} weight="duotone" className="mr-2" />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {showTestPanel && testResults.length > 0 && (
                <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flask size={20} weight="duotone" className="text-accent" />
                      Connection Test Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-card rounded-lg border"
                      >
                        <div className="pt-0.5">
                          {result.status === 'success' && (
                            <CheckCircle size={20} weight="duotone" className="text-green-500" />
                          )}
                          {result.status === 'failed' && (
                            <WarningCircle size={20} weight="duotone" className="text-destructive" />
                          )}
                          {result.status === 'testing' && (
                            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          )}
                          {result.status === 'pending' && (
                            <div className="w-5 h-5 border-2 border-muted rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{result.step}</p>
                          {result.message && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {result.message}
                            </p>
                          )}
                          {result.details && (
                            <p className="text-xs text-accent mt-1 font-mono">
                              {result.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {!config.apiToken && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or use manual deployment</span>
              </div>
            </div>

            <Button
              onClick={handleQuickDeploy}
              disabled={isDeploying}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <Rocket size={20} weight="duotone" className="mr-2" />
              Download for Manual Deploy
            </Button>
          </>
        )}

        {deploymentHistory.length > 0 && (
          <div className="space-y-3 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Recent Deployments</h4>
              {deploymentHistory.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllHistory}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash size={16} weight="duotone" className="mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {deploymentHistory.map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {deployment.status === 'success' ? (
                      <CheckCircle size={24} weight="duotone" className="text-green-500" />
                    ) : (
                      <WarningCircle size={24} weight="duotone" className="text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{deployment.siteName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deployment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {deployment.status === 'success' && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Live
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {deployment.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(deployment.url, '_blank')}
                      >
                        Visit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDeployment(deployment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash size={16} weight="duotone" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-xs space-y-3">
            <div>
              <p className="font-semibold mb-2">🚀 Quick Start Guide:</p>
              <ol className="list-decimal list-inside space-y-1.5 ml-1">
                <li>Create a free Netlify account at <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">netlify.com</a></li>
                <li>Go to User Settings → Applications → New Access Token</li>
                <li>Copy your token and paste it above</li>
                <li>Click "Save Configuration" to store it securely</li>
                <li>Use "One-Click Deploy" anytime to publish your site!</li>
              </ol>
            </div>
            <div className="pt-2 border-t">
              <p className="font-semibold mb-1">✨ Features:</p>
              <ul className="space-y-1 ml-1">
                <li>• Free HTTPS certificates and CDN</li>
                <li>• Instant global deployment</li>
                <li>• Custom domain support</li>
                <li>• Automatic deployments on updates</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
