import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GithubLogo, Rocket, Code, Flask, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TestResult {
  step: string
  status: 'pending' | 'success' | 'failed' | 'testing'
  message: string
  details?: string
}

export function GitHubDeployer() {
  const [repoUrl, setRepoUrl] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentCode, setDeploymentCode] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const generateDeploymentCode = () => {
    const code = `#!/bin/bash
# Infinity Brain - GitHub Pages Deployment Script
# Generated: ${new Date().toLocaleString()}

# Repository URL
REPO_URL="${repoUrl || 'https://github.com/your-username/your-repo.git'}"

# Create deployment directory
mkdir -p infinity-brain-deploy
cd infinity-brain-deploy

# Initialize git if needed
if [ ! -d .git ]; then
  git init
  git remote add origin $REPO_URL
fi

# Pull latest changes
git pull origin main || git pull origin master

# Copy exported HTML files (assumes they're in Downloads)
echo "Copying exported HTML files..."
cp ~/Downloads/*.html .

# Create a README if it doesn't exist
if [ ! -f README.md ]; then
  cat > README.md << 'EOF'
# Infinity Brain - Exported Pages

This repository contains exported static HTML pages from the Infinity Brain platform.

## Pages

- **index.html** - Main landing page
- **user-dashboard.html** - User account and transaction history
- **token-minter.html** - Token creation interface
- **market-overview.html** - Market statistics
- **token-exchange.html** - Trading marketplace
- **module-browser.html** - Ecosystem registry

## Deployment

This site is automatically deployed via GitHub Pages.

Visit: https://your-username.github.io/your-repo

## About

Infinity Brain is a comprehensive tokenized business ecosystem platform.
EOF
fi

# Commit changes
git add .
git commit -m "Deploy: Infinity Brain pages - $(date)"

# Push to GitHub
git push -u origin main

echo "✓ Deployment complete!"
echo "Enable GitHub Pages in your repository settings if not already enabled."
echo "Your site will be available at: https://your-username.github.io/your-repo"
`
    
    setDeploymentCode(code)
    toast.success('Deployment script generated!')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(deploymentCode)
      toast.success('Script copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadScript = () => {
    const blob = new Blob([deploymentCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'deploy-to-github.sh'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Script downloaded!')
  }

  const testGitHubConnection = async () => {
    if (!githubToken) {
      toast.error('Please enter your GitHub Personal Access Token first')
      return
    }

    setIsTesting(true)
    setShowTestPanel(true)
    const results: TestResult[] = [
      { step: 'Validate Token Format', status: 'pending', message: '' },
      { step: 'Test GitHub API Connection', status: 'pending', message: '' },
      { step: 'Verify User Access', status: 'pending', message: '' },
      { step: 'Check Repository Access', status: 'pending', message: '' },
      { step: 'Verify Pages Permissions', status: 'pending', message: '' }
    ]
    setTestResults([...results])

    try {
      results[0].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      if (githubToken.length < 20) {
        results[0].status = 'failed'
        results[0].message = 'Token appears too short'
        results[0].details = 'GitHub tokens are typically 40+ characters'
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

      const userResponse = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => null)
        results[1].status = 'failed'
        results[1].message = 'API connection failed'
        results[1].details = errorData?.message || userResponse.statusText
        setTestResults([...results])
        toast.error('Failed to connect to GitHub API')
        setIsTesting(false)
        return
      }

      results[1].status = 'success'
      results[1].message = 'Connected to GitHub API'
      setTestResults([...results])

      const userData = await userResponse.json()
      
      results[2].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      if (!userData || !userData.login) {
        results[2].status = 'failed'
        results[2].message = 'No user data found'
        results[2].details = 'Token may not have proper permissions'
        setTestResults([...results])
        toast.error('Cannot access user information')
        setIsTesting(false)
        return
      }

      results[2].status = 'success'
      results[2].message = `User: ${userData.login}`
      results[2].details = `Account type: ${userData.type || 'User'}`
      setTestResults([...results])

      results[3].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      if (repoUrl) {
        const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/)
        if (repoMatch) {
          const [, owner, repo] = repoMatch
          const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          })

          if (repoResponse.ok) {
            const repoData = await repoResponse.json()
            results[3].status = 'success'
            results[3].message = `Repository accessible: ${owner}/${repo}`
            results[3].details = `Permissions: ${repoData.permissions?.admin ? 'Admin' : repoData.permissions?.push ? 'Write' : 'Read'}`
            setTestResults([...results])
          } else {
            results[3].status = 'failed'
            results[3].message = 'Cannot access specified repository'
            results[3].details = 'Check repository URL and token permissions'
            setTestResults([...results])
          }
        } else {
          results[3].status = 'success'
          results[3].message = 'No specific repository to test'
          results[3].details = 'Repository check skipped'
          setTestResults([...results])
        }
      } else {
        results[3].status = 'success'
        results[3].message = 'Repository check skipped'
        results[3].details = 'Enter a repository URL to test specific repo access'
        setTestResults([...results])
      }

      results[4].status = 'testing'
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 300))

      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!reposResponse.ok) {
        results[4].status = 'failed'
        results[4].message = 'Cannot verify repository permissions'
        results[4].details = 'Token may lack repo scope'
        setTestResults([...results])
        toast.warning('Token works but repository permissions unclear')
        setIsTesting(false)
        return
      }

      results[4].status = 'success'
      results[4].message = 'Ready to deploy to GitHub Pages'
      results[4].details = 'Token has repository access - GitHub Pages can be enabled in repo settings'
      setTestResults([...results])

      toast.success('✅ Token validated successfully!', {
        description: 'Your GitHub token is configured correctly and ready to use',
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

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <GithubLogo size={32} weight="duotone" className="text-primary" />
            <div>
              <CardTitle>GitHub Pages Deployment Helper</CardTitle>
              <CardDescription>
                Generate deployment scripts for your GitHub Pages site
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-primary/30">
            <Info size={20} weight="duotone" className="text-primary" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold text-sm">🧪 Test Your GitHub Connection</p>
                <p className="text-xs">Enter your GitHub Personal Access Token below to test connectivity and verify permissions for deploying to GitHub Pages.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/pewpi-infinity/infinity-brain-111.git"
            />
            <p className="text-xs text-muted-foreground">
              Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="github-token">GitHub Personal Access Token (Optional)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Input
              id="github-token"
              type={showToken ? 'text' : 'password'}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from: <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">GitHub Token Settings</a> (Requires: repo scope)
            </p>
          </div>

          {githubToken && (
            <Button
              onClick={testGitHubConnection}
              disabled={isTesting}
              variant="outline"
              className="w-full"
            >
              <Flask size={20} weight="duotone" className="mr-2" />
              {isTesting ? 'Testing Connection...' : 'Test GitHub Connection'}
            </Button>
          )}

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

          <Button 
            onClick={generateDeploymentCode}
            className="w-full"
            size="lg"
          >
            <Code size={20} weight="duotone" className="mr-2" />
            Generate Deployment Script
          </Button>

          {deploymentCode && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Deployment Script (Bash)</Label>
                <Textarea
                  value={deploymentCode}
                  readOnly
                  className="font-mono text-xs h-64"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="secondary" className="flex-1">
                  Copy Script
                </Button>
                <Button onClick={downloadScript} variant="secondary" className="flex-1">
                  Download Script
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Rocket size={20} weight="duotone" />
        <AlertDescription>
          <strong>How to use:</strong>
          <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
            <li>Export your pages using the Page Exporter above</li>
            <li>Enter your GitHub repository URL and generate the script</li>
            <li>Download the script and save it as <code className="bg-muted px-1 rounded">deploy.sh</code></li>
            <li>Make it executable: <code className="bg-muted px-1 rounded">chmod +x deploy.sh</code></li>
            <li>Run it: <code className="bg-muted px-1 rounded">./deploy.sh</code></li>
            <li>Enable GitHub Pages in your repository settings (Settings → Pages)</li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card className="bg-accent/10 border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg">Manual Deployment Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Create/Clone Repository:</strong></p>
          <code className="block bg-muted p-2 rounded text-xs mb-2">
            git clone {repoUrl || 'https://github.com/username/repo.git'}<br/>
            cd {repoUrl ? repoUrl.split('/').pop()?.replace('.git', '') : 'repo'}
          </code>

          <p><strong>2. Add Exported Files:</strong></p>
          <code className="block bg-muted p-2 rounded text-xs mb-2">
            cp ~/Downloads/*.html .
          </code>

          <p><strong>3. Commit and Push:</strong></p>
          <code className="block bg-muted p-2 rounded text-xs mb-2">
            git add .<br/>
            git commit -m "Add Infinity Brain pages"<br/>
            git push origin main
          </code>

          <p><strong>4. Enable GitHub Pages:</strong></p>
          <p className="text-xs text-muted-foreground pl-4">
            Go to repository Settings → Pages → Source: Deploy from branch → Branch: main → Folder: / (root) → Save
          </p>

          <p className="mt-4"><strong>Your site will be live at:</strong></p>
          <code className="block bg-muted p-2 rounded text-xs">
            https://{repoUrl ? repoUrl.split('/')[3] : 'username'}.github.io/{repoUrl ? repoUrl.split('/').pop()?.replace('.git', '') : 'repo'}/
          </code>
        </CardContent>
      </Card>
    </div>
  )
}
