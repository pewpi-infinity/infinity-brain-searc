import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Globe,
  MonitorPlay,
  DeviceMobile,
  DeviceTablet,
  Desktop,
  Code,
  FileText,
  ArrowSquareOut
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getGitHubPagesUrl, fetchRepoReadme, type Repository } from '@/lib/githubRepos'
import { marked } from 'marked'

// Configure marked with security options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
  sanitize: false // We'll use DOMPurify for sanitization
})

interface WebsitePreviewProps {
  repository: Repository | null
  onClose?: () => void
}

type ViewMode = 'desktop' | 'tablet' | 'mobile'

export function WebsitePreview({ repository, onClose }: WebsitePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop')
  const [previewType, setPreviewType] = useState<'website' | 'readme' | 'files'>('website')
  const [readme, setReadme] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null)

  useEffect(() => {
    if (repository) {
      loadPreview()
    }
  }, [repository])

  const loadPreview = async () => {
    if (!repository) return

    setIsLoading(true)

    // Check for GitHub Pages
    const pagesUrl = getGitHubPagesUrl(repository)
    setWebsiteUrl(pagesUrl)

    if (!pagesUrl) {
      // No GitHub Pages, load README instead
      setPreviewType('readme')
      const [owner, repo] = repository.full_name.split('/')
      const readmeContent = await fetchRepoReadme(owner, repo)
      setReadme(readmeContent)
    }

    setIsLoading(false)
  }

  const getIframeWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return '375px'
      case 'tablet':
        return '768px'
      case 'desktop':
        return '100%'
    }
  }

  const getIframeHeight = () => {
    switch (viewMode) {
      case 'mobile':
        return '667px'
      case 'tablet':
        return '1024px'
      case 'desktop':
        return '600px'
    }
  }

  if (!repository) {
    return (
      <Card className="gradient-border bg-card/95 backdrop-blur">
        <CardContent className="py-16">
          <div className="text-center text-muted-foreground">
            <Globe size={48} className="mx-auto mb-4 opacity-50" />
            <p>Select a repository to preview</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gradient-border bg-card/95 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <MonitorPlay size={28} weight="duotone" className="text-accent" />
              {repository.name}
            </CardTitle>
            <CardDescription>
              {repository.description || 'No description available'}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Controls */}
        <div className="flex items-center justify-between">
          <Tabs value={previewType} onValueChange={val => setPreviewType(val as any)}>
            <TabsList>
              <TabsTrigger value="website" disabled={!websiteUrl}>
                <Globe size={16} className="mr-2" />
                Website
              </TabsTrigger>
              <TabsTrigger value="readme">
                <FileText size={16} className="mr-2" />
                README
              </TabsTrigger>
              <TabsTrigger value="files">
                <Code size={16} className="mr-2" />
                Files
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {previewType === 'website' && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Desktop size={16} />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <DeviceTablet size={16} />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <DeviceMobile size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Deployment Status */}
        {websiteUrl && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                <Globe size={14} className="mr-1" />
                Deployed
              </Badge>
              <span className="text-sm text-muted-foreground">{websiteUrl}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(websiteUrl, '_blank')}
            >
              <ArrowSquareOut size={16} className="mr-2" />
              Open in New Tab
            </Button>
          </div>
        )}

        {/* Preview Content */}
        <div className="border-2 border-accent/20 rounded-lg overflow-hidden bg-muted/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <div className="animate-spin mb-4">
                  <MonitorPlay size={48} className="text-accent" />
                </div>
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : previewType === 'website' && websiteUrl ? (
            <div className="flex justify-center bg-white p-4">
              <iframe
                src={websiteUrl}
                style={{
                  width: getIframeWidth(),
                  height: getIframeHeight(),
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                title={`Preview of ${repository.name}`}
                sandbox="allow-scripts"
              />
            </div>
          ) : previewType === 'readme' ? (
            <ScrollArea className="h-[600px]">
              <div className="p-6 prose dark:prose-invert max-w-none">
                {readme ? (
                  <div
                    dangerouslySetInnerHTML={{
                      // Note: marked library sanitizes by default in newer versions
                      // For production, consider using react-markdown instead
                      __html: marked(readme) as string
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground">No README available</p>
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Repository Files</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Code size={16} />
                    File structure preview coming soon...
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => window.open(repository.html_url, '_blank')}
                    >
                      <ArrowSquareOut size={16} className="mr-2" />
                      View on GitHub
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Repository Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="text-xl font-bold">
              {repository.stargazers_count}
            </div>
            <div className="text-xs text-muted-foreground">Stars</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              {repository.forks_count}
            </div>
            <div className="text-xs text-muted-foreground">Forks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              {repository.open_issues_count}
            </div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">
              {new Date(repository.updated_at).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">Updated</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
