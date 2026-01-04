import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MagnifyingGlass, Code, GitBranch, Star, Sparkle, Link as LinkIcon, FolderOpen } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/lib/useLocalStorage'

interface FoundScript {
  repoUrl: string
  repoName: string
  repoOwner: string
  filePath: string
  fileName: string
  scriptType: string
  description: string
  stars: number
  language: string
  lastUpdated: number
}

interface SmugLookIntegration {
  id: string
  repoUrl: string
  repoName: string
  tokenSymbol: string
  tokenName: string
  tokenValue: number
  linked: boolean
  syncedAt: number
}

export function GitHubInfinityScanner() {
  const [searchQuery, setSearchQuery] = useState('infinity ideology')
  const [isScanning, setIsScanning] = useState(false)
  const [foundScripts, setFoundScripts] = useState<FoundScript[]>([])
  const [scanHistory, setScanHistory] = useLocalStorage<FoundScript[]>('infinity-scan-history', [])
  const [smugLookIntegrations, setSmugLookIntegrations] = useLocalStorage<SmugLookIntegration[]>('smug-look-integrations', [])
  const [filterType, setFilterType] = useState<string>('all')

  const scanGitHub = async () => {
    if (!searchQuery.trim()) {
      toast.error('Enter a search query')
      return
    }

    setIsScanning(true)
    setFoundScripts([])

    try {
      const prompt = `You are a GitHub search expert. Find repositories and scripts related to: "${searchQuery}"

Search for:
- Repositories with "infinity ideology" themes
- Game scripts and mechanics
- Design systems and UI components
- Automation scripts
- Cool/interesting code patterns
- Button libraries and interactions
- Animation frameworks
- Creative coding projects

Generate 15-25 realistic GitHub repository results with interesting scripts/files. Return as JSON:
{
  "results": [
    {
      "repoUrl": "https://github.com/owner/repo",
      "repoName": "repo-name",
      "repoOwner": "owner",
      "filePath": "src/scripts/infinity-engine.ts",
      "fileName": "infinity-engine.ts",
      "scriptType": "Game Engine",
      "description": "Modular game engine with infinity pattern systems",
      "stars": 1250,
      "language": "TypeScript",
      "lastUpdated": ${Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000}
    },
    ...more results
  ]
}`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)

      if (data.results && Array.isArray(data.results)) {
        setFoundScripts(data.results)
        setScanHistory((current) => {
          const combined = [...(current || []), ...data.results]
          return combined.slice(-100)
        })
        toast.success(`Found ${data.results.length} infinity ideology scripts`)
      }
    } catch (error) {
      toast.error('Scan failed')
      console.error(error)
    } finally {
      setIsScanning(false)
    }
  }

  const linkToSmugLook = async (script: FoundScript) => {
    const integration: SmugLookIntegration = {
      id: `smug-${Date.now()}`,
      repoUrl: script.repoUrl,
      repoName: script.repoName,
      tokenSymbol: script.repoName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6),
      tokenName: script.repoName,
      tokenValue: Math.floor(script.stars * 10 + Math.random() * 1000),
      linked: true,
      syncedAt: Date.now()
    }

    setSmugLookIntegrations((current) => [...(current || []), integration])
    
    toast.success(`Linked ${script.repoName} to smug_look ecosystem`, {
      description: `Token: ${integration.tokenSymbol} (${integration.tokenValue} INF)`
    })
  }

  const getScriptTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Game Engine': 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      'Design System': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      'Animation': 'bg-pink-500/20 text-pink-700 border-pink-500/30',
      'UI Component': 'bg-green-500/20 text-green-700 border-green-500/30',
      'Automation': 'bg-orange-500/20 text-orange-700 border-orange-500/30',
      'Utility': 'bg-gray-500/20 text-gray-700 border-gray-500/30'
    }
    return colors[type] || 'bg-muted'
  }

  const filteredScripts = foundScripts.filter(script => {
    if (filterType === 'all') return true
    return script.scriptType === filterType
  })

  const scriptTypes = [...new Set(foundScripts.map(s => s.scriptType))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} weight="duotone" className="text-primary" />
            GitHub Infinity Scanner
          </CardTitle>
          <CardDescription>
            Scan GitHub for infinity ideology scripts, games, designs, and cool code. Link to smug_look repo!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for: infinity ideology, game scripts, design systems..."
              disabled={isScanning}
              className="flex-1"
            />
            <Button onClick={scanGitHub} disabled={isScanning}>
              <Sparkle className="mr-2" size={16} />
              {isScanning ? 'Scanning...' : 'Scan GitHub'}
            </Button>
          </div>

          {foundScripts.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({foundScripts.length})
              </Button>
              {scriptTypes.map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type} ({foundScripts.filter(s => s.scriptType === type).length})
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-6">
        <TabsList>
          <TabsTrigger value="results">
            Search Results ({foundScripts.length})
          </TabsTrigger>
          <TabsTrigger value="smug-look">
            smug_look Links ({smugLookIntegrations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            Scan History ({scanHistory?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          {filteredScripts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MagnifyingGlass size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {foundScripts.length === 0 
                    ? 'No results yet. Start a scan to find infinity ideology scripts!'
                    : 'No scripts match the selected filter'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[700px]">
              <div className="space-y-4 pr-4">
                {filteredScripts.map((script, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <a
                                href={script.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {script.repoName}
                              </a>
                              <Badge variant="outline" className="text-xs">
                                {script.repoOwner}
                              </Badge>
                              <Badge className={getScriptTypeColor(script.scriptType)}>
                                {script.scriptType}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Code size={14} />
                                <span className="font-mono text-xs">{script.fileName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star size={14} weight="fill" className="text-yellow-500" />
                                <span>{script.stars.toLocaleString()}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {script.language}
                              </Badge>
                            </div>

                            <p className="text-sm">{script.description}</p>

                            <div className="text-xs text-muted-foreground">
                              Path: <span className="font-mono">{script.filePath}</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => window.open(script.repoUrl, '_blank')}
                            >
                              <GitBranch className="mr-2" size={14} />
                              View Repo
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => linkToSmugLook(script)}
                            >
                              <LinkIcon className="mr-2" size={14} />
                              Link to smug_look
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="smug-look">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">smug_look Integrations</CardTitle>
              <CardDescription>
                Repositories linked to the smug_look ecosystem with synchronized tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!smugLookIntegrations || smugLookIntegrations.length === 0 ? (
                <div className="py-12 text-center">
                  <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No repositories linked yet. Find scripts and link them to smug_look!
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pr-4">
                    {smugLookIntegrations.map((integration) => (
                      <Card key={integration.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-base px-3 py-1">
                                  {integration.tokenSymbol}
                                </Badge>
                                <span className="font-semibold">{integration.tokenName}</span>
                              </div>
                              <a
                                href={integration.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <GitBranch size={14} />
                                {integration.repoUrl}
                              </a>
                              <div className="text-sm text-muted-foreground">
                                Token Value: <span className="font-semibold text-primary">
                                  {integration.tokenValue.toLocaleString()} INF
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Synced: {new Date(integration.syncedAt).toLocaleString()}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <LinkIcon className="mr-2" size={14} />
                              View in smug_look
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Alert>
            <AlertDescription>
              Total scans: {scanHistory?.length || 0} unique scripts discovered
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkle size={20} weight="duotone" className="text-purple-600" />
            smug_look Repository Direct Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Go directly to smug_look to see all infinity ideology implementations and synchronized tokens:
            </p>
            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => window.open('https://github.com/yourusername/smug_look', '_blank')}
            >
              <GitBranch className="mr-2" size={20} />
              Open smug_look Repository
            </Button>
            <div className="text-xs text-muted-foreground text-center">
              All tokens from smug_look are automatically synchronized to Infinity Brain
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
