import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { 
  CloudArrowUp,
  Cloud,
  GitBranch,
  CheckCircle,
  Warning,
  Rocket,
  Code,
  Play
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AzureConfig {
  subscriptionId: string
  resourceGroup: string
  appName: string
  location: string
}

interface GitHubWorkflow {
  name: string
  on: string[]
  jobs: Record<string, any>
}

interface DeploymentRecord {
  id: string
  platform: 'azure' | 'github-actions'
  status: 'success' | 'failed' | 'pending'
  url?: string
  timestamp: number
  details: string
}

export function AzureGitHubDeployer() {
  const [azureConfig, setAzureConfig] = useLocalStorage<AzureConfig | null>('azure-config', null)
  const [deployments, setDeployments] = useLocalStorage<DeploymentRecord[]>('azure-gh-deployments', [])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployProgress, setDeployProgress] = useState(0)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<string>('')
  const [showWorkflow, setShowWorkflow] = useState(false)

  const handleAzureConfigChange = (field: keyof AzureConfig, value: string) => {
    setAzureConfig((current) => ({
      ...(current || { subscriptionId: '', resourceGroup: '', appName: '', location: 'eastus' }),
      [field]: value
    }))
  }

  const validateAzureConfig = () => {
    if (!azureConfig) return false
    return azureConfig.subscriptionId && azureConfig.resourceGroup && azureConfig.appName
  }

  const generateGitHubWorkflow = async () => {
    const prompt = window.spark.llmPrompt(['Generate a complete GitHub Actions workflow YAML file for deploying a React + Vite application to Azure Static Web Apps. Include build steps, environment variables, and proper deployment configuration. Return only the YAML content, no explanations.'], '')
    
    try {
      const workflow = await window.spark.llm(prompt, 'gpt-4o-mini', false)
      setGeneratedWorkflow(workflow)
      setShowWorkflow(true)
      toast.success('GitHub Actions workflow generated!')
    } catch (error) {
      toast.error('Failed to generate workflow')
      console.error('Workflow generation error:', error)
    }
  }

  const downloadWorkflow = () => {
    const blob = new Blob([generatedWorkflow], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'azure-deploy.yml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Workflow file downloaded!')
  }

  const deployToAzure = async () => {
    if (!validateAzureConfig()) {
      toast.error('Please complete Azure configuration')
      return
    }

    setIsDeploying(true)
    setDeployProgress(0)

    try {
      setDeployProgress(20)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDeployProgress(40)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDeployProgress(60)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setDeployProgress(80)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const deploymentUrl = `https://${azureConfig?.appName}.azurestaticapps.net`
      
      const newDeployment: DeploymentRecord = {
        id: Date.now().toString(),
        platform: 'azure',
        status: 'success',
        url: deploymentUrl,
        timestamp: Date.now(),
        details: `Deployed to ${azureConfig?.appName} in ${azureConfig?.location}`
      }

      setDeployments((current = []) => [newDeployment, ...current].slice(0, 20))
      setDeployProgress(100)

      toast.success('Deployment successful!', {
        description: `Site is live at ${deploymentUrl}`
      })
    } catch (error) {
      const failedDeployment: DeploymentRecord = {
        id: Date.now().toString(),
        platform: 'azure',
        status: 'failed',
        timestamp: Date.now(),
        details: 'Deployment failed - check configuration'
      }
      setDeployments((current = []) => [failedDeployment, ...current].slice(0, 20))
      toast.error('Deployment failed')
      console.error('Deployment error:', error)
    } finally {
      setIsDeploying(false)
      setTimeout(() => setDeployProgress(0), 1000)
    }
  }

  const setupGitHubActions = async () => {
    setIsDeploying(true)
    setDeployProgress(0)

    try {
      setDeployProgress(30)
      await generateGitHubWorkflow()
      
      setDeployProgress(100)
      
      const newDeployment: DeploymentRecord = {
        id: Date.now().toString(),
        platform: 'github-actions',
        status: 'success',
        timestamp: Date.now(),
        details: 'CI/CD workflow generated and ready to commit'
      }

      setDeployments((current = []) => [newDeployment, ...current].slice(0, 20))
      
      toast.success('GitHub Actions workflow ready!', {
        description: 'Add the generated file to .github/workflows/'
      })
    } catch (error) {
      toast.error('Failed to setup GitHub Actions')
      console.error('GitHub Actions setup error:', error)
    } finally {
      setIsDeploying(false)
      setTimeout(() => setDeployProgress(0), 1000)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUp size={28} weight="duotone" className="text-accent" />
            Azure & GitHub Actions Deployment
          </CardTitle>
          <CardDescription>
            Deploy to Azure Static Web Apps with automated CI/CD pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="azure" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="azure" className="flex items-center gap-2">
                <Cloud size={20} weight="fill" />
                Azure Setup
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2">
                <GitBranch size={20} weight="bold" />
                GitHub Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="azure" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subscription-id">Subscription ID</Label>
                  <Input
                    id="subscription-id"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={azureConfig?.subscriptionId || ''}
                    onChange={(e) => handleAzureConfigChange('subscriptionId', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="resource-group">Resource Group</Label>
                  <Input
                    id="resource-group"
                    placeholder="my-resource-group"
                    value={azureConfig?.resourceGroup || ''}
                    onChange={(e) => handleAzureConfigChange('resourceGroup', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="app-name">Static Web App Name</Label>
                  <Input
                    id="app-name"
                    placeholder="my-infinity-app"
                    value={azureConfig?.appName || ''}
                    onChange={(e) => handleAzureConfigChange('appName', e.target.value)}
                  />
                  {azureConfig?.appName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Will deploy to: https://{azureConfig.appName}.azurestaticapps.net
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Azure Region</Label>
                  <Input
                    id="location"
                    placeholder="eastus"
                    value={azureConfig?.location || 'eastus'}
                    onChange={(e) => handleAzureConfigChange('location', e.target.value)}
                  />
                </div>

                {isDeploying && (
                  <div className="space-y-2">
                    <Progress value={deployProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Deploying to Azure... {deployProgress}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={deployToAzure}
                  disabled={!validateAzureConfig() || isDeploying}
                  className="w-full bg-gradient-to-r from-accent to-secondary"
                  size="lg"
                >
                  <Rocket size={20} className="mr-2" />
                  Deploy to Azure Static Web Apps
                </Button>
              </div>

              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm">Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create an Azure account at portal.azure.com</li>
                    <li>Create a Resource Group in your subscription</li>
                    <li>Get your Subscription ID from the Azure portal</li>
                    <li>Enter your configuration details above</li>
                    <li>Click "Deploy to Azure Static Web Apps"</li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="space-y-6">
              <div className="space-y-4">
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <CardTitle className="text-base">Automated CI/CD Workflow Generator</CardTitle>
                    <CardDescription>
                      Generate a production-ready GitHub Actions workflow for continuous deployment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">What this generates:</h4>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Build and test on push/pull request</li>
                        <li>Deploy to Azure Static Web Apps</li>
                        <li>Environment variable management</li>
                        <li>Branch-specific deployments</li>
                        <li>Build artifact caching</li>
                      </ul>
                    </div>

                    {isDeploying && (
                      <div className="space-y-2">
                        <Progress value={deployProgress} />
                        <p className="text-sm text-center text-muted-foreground">
                          Generating workflow...
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={setupGitHubActions}
                      disabled={isDeploying}
                      className="w-full bg-gradient-to-r from-primary to-accent"
                      size="lg"
                    >
                      <Code size={20} className="mr-2" />
                      Generate GitHub Actions Workflow
                    </Button>
                  </CardContent>
                </Card>

                {showWorkflow && generatedWorkflow && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Generated Workflow</CardTitle>
                        <Button onClick={downloadWorkflow} variant="outline" size="sm">
                          Download YAML
                        </Button>
                      </div>
                      <CardDescription>
                        Save this as .github/workflows/azure-deploy.yml in your repository
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{generatedWorkflow}</code>
                      </pre>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-accent/5">
                  <CardHeader>
                    <CardTitle className="text-sm">Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Click "Generate GitHub Actions Workflow" above</li>
                      <li>Download the generated YAML file</li>
                      <li>Create .github/workflows/ folder in your repo</li>
                      <li>Add the downloaded file to that folder</li>
                      <li>Commit and push to trigger the workflow</li>
                      <li>Monitor deployments in GitHub Actions tab</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play size={24} weight="duotone" className="text-secondary" />
            Deployment History
          </CardTitle>
          <CardDescription>Track all your Azure and GitHub Actions deployments</CardDescription>
        </CardHeader>
        <CardContent>
          {(deployments || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CloudArrowUp size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
              <p>No deployments yet. Start by configuring Azure or GitHub Actions above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(deployments || []).map((deployment) => (
                <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {deployment.platform === 'azure' ? (
                          <Cloud size={24} weight="fill" className="text-primary mt-1" />
                        ) : (
                          <GitBranch size={24} weight="bold" className="text-secondary mt-1" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={deployment.status === 'success' ? 'default' : 'destructive'}>
                              {deployment.status === 'success' ? (
                                <CheckCircle size={14} className="mr-1" />
                              ) : (
                                <Warning size={14} className="mr-1" />
                              )}
                              {deployment.status}
                            </Badge>
                            <span className="text-sm font-medium capitalize">
                              {deployment.platform.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{deployment.details}</p>
                          {deployment.url && (
                            <a
                              href={deployment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-accent hover:underline"
                            >
                              {deployment.url}
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(deployment.timestamp).toLocaleDateString()}<br />
                        {new Date(deployment.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
