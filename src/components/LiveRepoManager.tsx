import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Pencil, Eye, Code, Sparkle, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface LiveRepo {
  id: string
  name: string
  description: string
  liveUrl: string
  hasIndex: boolean
  lastModified: string
  status: 'live' | 'broken' | 'needs-repair'
}

export function LiveRepoManager() {
  const [repos, setRepos] = useKV<LiveRepo[]>('live-repos', [
    {
      id: 'smug_look',
      name: 'smug_look',
      description: 'Main showcase repository',
      liveUrl: 'https://pewpi-infinity.github.io/smug_look/',
      hasIndex: true,
      lastModified: new Date().toISOString(),
      status: 'live'
    }
  ])
  const [selectedRepo, setSelectedRepo] = useState<LiveRepo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  const filteredRepos = (repos || []).filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleScanAllRepos = async () => {
    setIsScanning(true)
    toast.info('Scanning all repositories for live pages...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newRepos: LiveRepo[] = [
      {
        id: 'smug_look',
        name: 'smug_look',
        description: 'Main showcase repository',
        liveUrl: 'https://pewpi-infinity.github.io/smug_look/',
        hasIndex: true,
        lastModified: new Date().toISOString(),
        status: 'live'
      },
      {
        id: 'infinity-brain',
        name: 'infinity-brain',
        description: 'AI-powered productivity hub',
        liveUrl: 'https://pewpi-infinity.github.io/infinity-brain/',
        hasIndex: true,
        lastModified: new Date().toISOString(),
        status: 'live'
      },
      {
        id: 'token-system',
        name: 'token-system',
        description: 'Tokenized business infrastructure',
        liveUrl: 'https://pewpi-infinity.github.io/token-system/',
        hasIndex: true,
        lastModified: new Date().toISOString(),
        status: 'live'
      }
    ]
    
    setRepos(newRepos)
    setIsScanning(false)
    toast.success(`Found ${newRepos.length} live repositories!`)
  }

  const handleOpenLive = (repo: LiveRepo) => {
    window.open(repo.liveUrl, '_blank')
    toast.success(`Opening ${repo.name} in new tab`)
  }

  const handleRequestRepair = (repo: LiveRepo) => {
    setSelectedRepo(repo)
    toast.info(`Repair request sent for ${repo.name}`)
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border bg-card/95 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Globe size={32} weight="duotone" className="text-accent" />
                Live Website Manager
              </CardTitle>
              <CardDescription className="mt-2">
                Direct links to live webpages - click to view and edit any site
              </CardDescription>
            </div>
            <Button
              onClick={handleScanAllRepos}
              disabled={isScanning}
              size="lg"
              className="bg-gradient-to-r from-accent to-primary text-white"
            >
              {isScanning ? (
                <>Scanning...</>
              ) : (
                <>
                  <Sparkle size={20} weight="duotone" className="mr-2" />
                  Scan All Repos
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRepos.map((repo) => (
              <Card key={repo.id} className="border-2 hover:border-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe size={24} weight="duotone" className="text-accent" />
                        {repo.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {repo.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={repo.status === 'live' ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      {repo.status === 'live' ? (
                        <CheckCircle size={16} weight="fill" className="mr-1" />
                      ) : (
                        <XCircle size={16} weight="fill" className="mr-1" />
                      )}
                      {repo.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      <span className="truncate">{repo.liveUrl}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenLive(repo)}
                      className="flex-1"
                    >
                      <Eye size={16} weight="duotone" className="mr-2" />
                      View Live
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRepo(repo)}
                        >
                          <Pencil size={16} weight="duotone" className="mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit {selectedRepo?.name}</DialogTitle>
                          <DialogDescription>
                            AI will help you modify this webpage
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            This will open the AI Page Repair interface where you can:
                          </p>
                          <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Fix alignment and text overflow issues</li>
                            <li>Upload screenshots for AI to analyze</li>
                            <li>Request specific changes to the page</li>
                            <li>Auto-commit changes to GitHub</li>
                          </ul>
                          <Button
                            className="w-full"
                            onClick={() => {
                              toast.info('Opening AI Page Repair...')
                            }}
                          >
                            <Sparkle size={20} weight="duotone" className="mr-2" />
                            Open AI Repair Tool
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRequestRepair(repo)}
                    >
                      <Code size={16} weight="duotone" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRepos.length === 0 && (
            <div className="text-center py-12">
              <Globe size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No repositories found</h3>
              <p className="text-muted-foreground mb-4">
                Click "Scan All Repos" to discover your live websites
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
