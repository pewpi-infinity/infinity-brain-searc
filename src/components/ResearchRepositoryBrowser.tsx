import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { toast } from 'sonner'
import { GitBranch, Flask, Link as LinkIcon, CheckCircle, Package } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ResearchToken {
  id: string
  title: string
  abstract: string
  content: string
  hash: string
  verificationHash: string
  author: string
  authorGitHub: string
  timestamp: number
  links: string[]
  citations: string[]
  category: string
  value: number
  verified: boolean
  repository?: string
}

interface RepoConnection {
  repoUrl: string
  repoName: string
  owner: string
  connectedTokens: string[]
  timestamp: number
}

export function ResearchRepositoryBrowser() {
  const [tokens] = useLocalStorage<ResearchToken[]>('research-tokens', [])
  const [connections, setConnections] = useLocalStorage<RepoConnection[]>('research-repo-connections', [])
  const [repoUrl, setRepoUrl] = useState('')
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/
    const match = url.match(githubRegex)
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') }
    }
    return null
  }

  const connectTokensToRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL')
      return
    }

    if (selectedTokens.length === 0) {
      toast.error('Please select at least one research token')
      return
    }

    const parsedRepo = parseRepoUrl(repoUrl)
    if (!parsedRepo) {
      toast.error('Invalid GitHub repository URL')
      return
    }

    setIsConnecting(true)

    try {
      const existingConnection = connections?.find(c => c.repoUrl === repoUrl.trim())

      if (existingConnection) {
        const updatedConnections = connections?.map(c => 
          c.repoUrl === repoUrl.trim()
            ? { ...c, connectedTokens: [...new Set([...c.connectedTokens, ...selectedTokens])] }
            : c
        )
        setConnections(() => updatedConnections || [])
      } else {
        const newConnection: RepoConnection = {
          repoUrl: repoUrl.trim(),
          repoName: parsedRepo.repo,
          owner: parsedRepo.owner,
          connectedTokens: selectedTokens,
          timestamp: Date.now()
        }
        setConnections((current) => [newConnection, ...(current || [])])
      }

      toast.success('Research tokens connected to repository!', {
        description: `${selectedTokens.length} token(s) linked to ${parsedRepo.repo}`
      })

      setRepoUrl('')
      setSelectedTokens([])
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect tokens to repository')
    } finally {
      setIsConnecting(false)
    }
  }

  const toggleTokenSelection = (tokenId: string) => {
    setSelectedTokens((current) =>
      current.includes(tokenId)
        ? current.filter(id => id !== tokenId)
        : [...current, tokenId]
    )
  }

  const getTokenById = (tokenId: string) => tokens?.find(t => t.id === tokenId)

  const getTotalValue = (connection: RepoConnection) => {
    return connection.connectedTokens.reduce((sum, tokenId) => {
      const token = getTokenById(tokenId)
      return sum + (token?.value || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <GitBranch size={32} weight="duotone" className="text-primary" />
            <div>
              <CardTitle className="text-3xl">Research Repository Browser</CardTitle>
              <CardDescription>
                Connect research tokens to GitHub repositories to create a verified research ecosystem
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Repository URL</label>
              <div className="flex gap-2">
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="flex-1"
                />
                <Button 
                  onClick={connectTokensToRepo}
                  disabled={isConnecting || !repoUrl.trim() || selectedTokens.length === 0}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  <LinkIcon size={20} weight="bold" className="mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Research Tokens ({selectedTokens.length} selected)
              </label>
              <ScrollArea className="h-64 border rounded-lg p-4">
                {!tokens || tokens.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flask size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
                    <p>No research tokens available</p>
                    <p className="text-sm mt-1">Create research tokens first to connect them</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tokens.map((token) => (
                      <div
                        key={token.id}
                        onClick={() => toggleTokenSelection(token.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTokens.includes(token.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">{token.title}</h4>
                              {selectedTokens.includes(token.id) && (
                                <CheckCircle size={16} weight="fill" className="text-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              <Badge variant="secondary" className="text-xs">{token.category}</Badge>
                              <Badge variant="outline" className="text-xs font-mono">{token.id}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {token.value.toLocaleString()} INF • {token.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={24} weight="duotone" />
            Connected Repositories
          </CardTitle>
          <CardDescription>
            Repositories with linked research tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {!connections || connections.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <GitBranch size={64} weight="duotone" className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>
                <p>Connect research tokens to repositories to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((connection, idx) => (
                  <Card key={idx} className="border-accent/20">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <GitBranch size={20} weight="duotone" />
                            {connection.owner}/{connection.repoName}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Connected {connection.connectedTokens.length} research token(s) • 
                            Total Value: {getTotalValue(connection).toLocaleString()} INF
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(connection.repoUrl, '_blank')}
                        >
                          <LinkIcon size={16} className="mr-1" />
                          View Repo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Connected Research Tokens:</h4>
                        <div className="space-y-2">
                          {connection.connectedTokens.map((tokenId) => {
                            const token = getTokenById(tokenId)
                            if (!token) return null
                            return (
                              <div key={tokenId} className="p-2 bg-muted rounded-lg">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{token.title}</p>
                                    <div className="flex gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">{token.category}</Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {token.value.toLocaleString()} INF
                                      </span>
                                    </div>
                                  </div>
                                  {token.verified && (
                                    <CheckCircle size={16} weight="fill" className="text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
