import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GithubLogo, Rocket, Code } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function GitHubDeployer() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentCode, setDeploymentCode] = useState('')

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
