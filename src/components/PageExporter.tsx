import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { HTMLExporter, PageExport } from '@/lib/htmlExporter'
import { DeploymentHub } from '@/components/DeploymentHub'
import { DeploymentGuide } from '@/components/DeploymentGuide'
import { DeploymentStats } from '@/components/DeploymentStats'
import { StaticSiteGenerator } from '@/components/StaticSiteGenerator'
import { FileHtml, Download, Package, Rocket } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/lib/useLocalStorage'

interface ExportConfig {
  pageName: string
  includeStyles: boolean
  includeScripts: boolean
  standalone: boolean
}

export function PageExporter() {
  const [exports = [], setExports] = useLocalStorage<PageExport[]>('page-exports', [])
  const [isExporting, setIsExporting] = useState(false)
  const [config, setConfig] = useState<ExportConfig>({
    pageName: 'current-page',
    includeStyles: true,
    includeScripts: false,
    standalone: true
  })

  const availablePages = [
    { id: 'home', name: 'Home Page', description: 'Main landing page with search and AI chat' },
    { id: 'user', name: 'User Dashboard', description: 'Account management and transaction history' },
    { id: 'modules', name: 'Module Browser', description: 'Ecosystem module registry' },
    { id: 'tokens', name: 'Token Minter', description: 'Create and manage business tokens' },
    { id: 'markets', name: 'Market Overview', description: 'Token market statistics and charts' },
    { id: 'marketplace', name: 'Token Exchange', description: 'Trade tokens with other users' },
    { id: 'search', name: 'Search Results', description: 'Web search with graph visualization' },
    { id: 'chat', name: 'AI Chat', description: 'Conversational AI assistant' }
  ]

  const handleExportCurrent = async () => {
    setIsExporting(true)
    try {
      const pageExport = HTMLExporter.exportCurrentPage({
        title: config.pageName,
        description: 'Exported page from Infinity Brain',
        includeStyles: config.includeStyles,
        includeScripts: config.includeScripts,
        standalone: config.standalone
      })
      
      HTMLExporter.downloadHTML(pageExport)
      
      setExports((current) => [...(current || []), pageExport])
      
      toast.success('Page exported successfully!', {
        description: `Downloaded as ${pageExport.filename}`
      })
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const pageConfigs = availablePages.map(page => ({
        elementId: page.id,
        options: {
          title: page.name,
          description: page.description,
          includeStyles: config.includeStyles,
          includeScripts: config.includeScripts,
          standalone: config.standalone
        }
      }))
      
      const allExports = await HTMLExporter.exportMultiplePages(pageConfigs)
      
      allExports.forEach(exp => HTMLExporter.downloadHTML(exp))
      
      const indexHtml = HTMLExporter.generateIndexPage(allExports)
      HTMLExporter.downloadHTML({
        filename: 'index.html',
        html: indexHtml,
        timestamp: new Date().toISOString(),
        metadata: {
          title: 'Index',
          description: 'Main index page',
          url: window.location.origin
        }
      })
      
      setExports((current) => [...(current || []), ...allExports])
      
      toast.success(`Exported ${allExports.length} pages!`, {
        description: 'All files downloaded to your device'
      })
    } catch (error) {
      toast.error('Batch export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportSelected = async (pageId: string) => {
    setIsExporting(true)
    try {
      const page = availablePages.find(p => p.id === pageId)
      if (!page) return
      
      const element = document.getElementById(pageId)
      if (!element) {
        toast.error('Page not found', {
          description: `Could not find element with id: ${pageId}`
        })
        return
      }
      
      const html = HTMLExporter.exportElement(element, {
        title: page.name,
        description: page.description,
        includeStyles: config.includeStyles,
        includeScripts: config.includeScripts,
        standalone: config.standalone
      })
      
      const pageExport: PageExport = {
        filename: `${page.name.toLowerCase().replace(/\s+/g, '-')}.html`,
        html,
        timestamp: new Date().toISOString(),
        metadata: {
          title: page.name,
          description: page.description,
          url: `${window.location.origin}/${pageId}`
        }
      }
      
      HTMLExporter.downloadHTML(pageExport)
      setExports((current) => [...(current || []), pageExport])
      
      toast.success(`${page.name} exported!`, {
        description: `Downloaded as ${pageExport.filename}`
      })
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const clearHistory = () => {
    setExports([])
    toast.success('Export history cleared')
  }

  return (
    <div className="space-y-6">
      <DeploymentStats />
      
      <DeploymentHub />

      <DeploymentGuide />

      <StaticSiteGenerator />

      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileHtml size={32} weight="duotone" className="text-primary" />
            <div>
              <CardTitle>HTML Page Exporter</CardTitle>
              <CardDescription>
                Export pages as static HTML files for deployment to any hosting platform
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                value={config.pageName}
                onChange={(e) => setConfig({ ...config, pageName: e.target.value })}
                placeholder="my-exported-page"
              />
            </div>

            <div className="space-y-3">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-styles"
                    checked={config.includeStyles}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, includeStyles: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-styles" className="font-normal cursor-pointer">
                    Include embedded styles
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-scripts"
                    checked={config.includeScripts}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, includeScripts: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-scripts" className="font-normal cursor-pointer">
                    Include scripts
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="standalone"
                    checked={config.standalone}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, standalone: checked as boolean })
                    }
                  />
                  <Label htmlFor="standalone" className="font-normal cursor-pointer">
                    Make standalone (disable interactive elements)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <Button 
              onClick={handleExportCurrent}
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              <Download size={20} weight="duotone" className="mr-2" />
              {isExporting ? 'Exporting...' : 'Export Current View'}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="w-full">
                  <Package size={20} weight="duotone" className="mr-2" />
                  Export Specific Page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Page to Export</DialogTitle>
                  <DialogDescription>
                    Choose which page you want to export as HTML
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {availablePages.map(page => (
                    <Card key={page.id} className="hover:bg-muted/50 transition-colors">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{page.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {page.description}
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleExportSelected(page.id)}
                            disabled={isExporting}
                          >
                            <Download size={16} weight="duotone" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleExportAll}
              disabled={isExporting}
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Rocket size={20} weight="duotone" className="mr-2" />
              {isExporting ? 'Exporting All...' : 'Export All Pages + Index'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {exports.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Export History</CardTitle>
                <CardDescription>
                  {exports.length} page{exports.length !== 1 ? 's' : ''} exported
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exports.slice().reverse().map((exp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{exp.metadata.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exp.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => HTMLExporter.downloadHTML(exp)}
                  >
                    <Download size={16} weight="duotone" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-accent/10 border-accent/20">
        <CardHeader>
          <CardTitle className="text-lg">Deployment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>GitHub Pages:</strong> Upload HTML files to your repository and enable GitHub Pages in settings</p>
          <p><strong>Netlify:</strong> Drag and drop exported files to netlify.app/drop</p>
          <p><strong>Vercel:</strong> Import files via Vercel CLI or dashboard</p>
          <p><strong>Any Host:</strong> Upload files via FTP or hosting control panel</p>
        </CardContent>
      </Card>
    </div>
  )
}
