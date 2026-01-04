import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { toast } from 'sonner'
import { GitBranch, Download, Flask, CheckCircle, Sparkle, FolderOpen, FileCode, Star } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'

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
  imported?: boolean
  repoMetadata?: {
    stars: number
    forks: number
    language: string
    size: number
    description: string
  }
}

interface GitHubRepo {
  name: string
  fullName: string
  description: string
  htmlUrl: string
  language: string
  stars: number
  forks: number
  size: number
  owner: {
    login: string
    avatarUrl: string
  }
  readme?: string
}

export function GitHubRepoImporter() {
  const [tokens, setTokens] = useLocalStorage<ResearchToken[]>('research-tokens', [])
  const [githubUsername, setGithubUsername] = useState('')
  const [specificRepoUrl, setSpecificRepoUrl] = useState('')
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [discoveredRepos, setDiscoveredRepos] = useState<GitHubRepo[]>([])
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [importProgress, setImportProgress] = useState(0)

  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateVerificationHash = async (token: Partial<ResearchToken>): Promise<string> => {
    const verificationData = `${token.title}|${token.abstract}|${token.content}|${token.timestamp}|${token.author}`
    return await generateHash(verificationData)
  }

  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/
    const match = url.match(githubRegex)
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') }
    }
    return null
  }

  const fetchReadme = async (owner: string, repo: string): Promise<string> => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        }
      })
      if (response.ok) {
        return await response.text()
      }
      return ''
    } catch (error) {
      console.error('Error fetching README:', error)
      return ''
    }
  }

  const fetchUserRepos = async () => {
    if (!githubUsername.trim()) {
      toast.error('Please enter a GitHub username')
      return
    }

    setIsLoadingRepos(true)
    setDiscoveredRepos([])
    setSelectedRepos([])

    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const repos = await response.json()
      
      const formattedRepos: GitHubRepo[] = repos.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || 'No description available',
        htmlUrl: repo.html_url,
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        size: repo.size,
        owner: {
          login: repo.owner.login,
          avatarUrl: repo.owner.avatar_url
        }
      }))

      setDiscoveredRepos(formattedRepos)
      toast.success(`Found ${formattedRepos.length} repositories for ${githubUsername}`)
    } catch (error) {
      console.error('Error fetching repos:', error)
      toast.error('Failed to fetch repositories. Check username and try again.')
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const fetchSingleRepo = async () => {
    if (!specificRepoUrl.trim()) {
      toast.error('Please enter a repository URL')
      return
    }

    const parsed = parseRepoUrl(specificRepoUrl)
    if (!parsed) {
      toast.error('Invalid GitHub repository URL')
      return
    }

    setIsLoadingRepos(true)
    setDiscoveredRepos([])
    setSelectedRepos([])

    try {
      const response = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`)
      
      if (!response.ok) {
        throw new Error('Repository not found')
      }

      const repo = await response.json()
      
      const formattedRepo: GitHubRepo = {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || 'No description available',
        htmlUrl: repo.html_url,
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        size: repo.size,
        owner: {
          login: repo.owner.login,
          avatarUrl: repo.owner.avatar_url
        }
      }

      setDiscoveredRepos([formattedRepo])
      setSelectedRepos([formattedRepo.fullName])
      toast.success(`Repository found: ${formattedRepo.name}`)
    } catch (error) {
      console.error('Error fetching repo:', error)
      toast.error('Failed to fetch repository. Check URL and try again.')
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const calculateResearchValue = (repo: GitHubRepo, readme: string): number => {
    let value = 2000

    if (readme.length > 500) value += 500
    if (readme.length > 1500) value += 1000
    if (readme.length > 3000) value += 2000

    value += repo.stars * 50
    value += repo.forks * 100

    if (repo.size > 1000) value += 500
    if (repo.size > 10000) value += 1000

    const languageMultipliers: Record<string, number> = {
      'TypeScript': 1.8,
      'JavaScript': 1.5,
      'Python': 1.8,
      'Java': 1.6,
      'Go': 1.7,
      'Rust': 2.0,
      'C++': 1.8,
      'C': 1.7,
      'Unknown': 1.0
    }

    value *= languageMultipliers[repo.language] || 1.2

    return Math.floor(value)
  }

  const toggleRepoSelection = (fullName: string) => {
    setSelectedRepos((current) =>
      current.includes(fullName)
        ? current.filter(name => name !== fullName)
        : [...current, fullName]
    )
  }

  const importSelectedRepos = async () => {
    if (selectedRepos.length === 0) {
      toast.error('Please select at least one repository to import')
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    try {
      const user = await window.spark.user()
      if (!user) {
        toast.error('User not authenticated')
        setIsImporting(false)
        return
      }

      const reposToImport = discoveredRepos.filter(repo => selectedRepos.includes(repo.fullName))
      const newTokens: ResearchToken[] = []
      let importedCount = 0

      for (const repo of reposToImport) {
        const readme = await fetchReadme(repo.owner.login, repo.name)
        const timestamp = Date.now()

        const content = readme || `Repository: ${repo.name}\n\nDescription: ${repo.description}\n\nLanguage: ${repo.language}\nStars: ${repo.stars}\nForks: ${repo.forks}\n\nThis repository was automatically imported from GitHub as a research contribution.`

        const tokenData: Partial<ResearchToken> = {
          title: `${repo.name} - GitHub Research Repository`,
          abstract: repo.description,
          content,
          author: user.login,
          authorGitHub: `https://github.com/${user.login}`,
          timestamp,
          links: [repo.htmlUrl],
          citations: [],
          category: 'technical',
          repository: repo.htmlUrl,
          imported: true,
          repoMetadata: {
            stars: repo.stars,
            forks: repo.forks,
            language: repo.language,
            size: repo.size,
            description: repo.description
          }
        }

        const contentHash = await generateHash(content)
        const verificationHash = await generateVerificationHash(tokenData)
        const value = calculateResearchValue(repo, readme)

        const newToken: ResearchToken = {
          ...tokenData as ResearchToken,
          id: `RES-GH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          hash: contentHash,
          verificationHash,
          value,
          verified: true
        }

        newTokens.push(newToken)
        importedCount++
        setImportProgress((importedCount / reposToImport.length) * 100)

        await new Promise(resolve => setTimeout(resolve, 500))
      }

      setTokens((currentTokens) => [...newTokens, ...(currentTokens || [])])

      const userWalletKey = `wallet-${user.login}`
      const userWallet = await window.spark.kv.get<any>(userWalletKey) || { balance: 0, tokens: [] }
      
      const totalValue = newTokens.reduce((sum, token) => sum + token.value, 0)
      userWallet.balance = (userWallet.balance || 0) + totalValue
      
      if (!userWallet.tokens) userWallet.tokens = []
      newTokens.forEach(token => {
        userWallet.tokens.push({
          symbol: token.id,
          amount: 1,
          name: token.title,
          type: 'research'
        })
      })
      
      await window.spark.kv.set(userWalletKey, userWallet)

      toast.success(`Successfully imported ${newTokens.length} repositories!`, {
        description: `Total value: ${totalValue.toLocaleString()} INF added to your wallet`
      })

      setDiscoveredRepos([])
      setSelectedRepos([])
      setGithubUsername('')
      setSpecificRepoUrl('')
      setImportProgress(0)

    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import repositories')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download size={32} weight="duotone" className="text-accent" />
            <div>
              <CardTitle className="text-3xl">GitHub Repository Auto-Import</CardTitle>
              <CardDescription>
                Automatically import your GitHub repositories as verified research tokens with cryptographic hash generation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-username" className="text-base font-semibold">
                  Import All User Repositories
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enter a GitHub username to discover all their public repositories
                </p>
                <div className="flex gap-2">
                  <Input
                    id="github-username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="github-username"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchUserRepos()
                    }}
                  />
                  <Button 
                    onClick={fetchUserRepos}
                    disabled={isLoadingRepos || !githubUsername.trim()}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <FolderOpen size={20} weight="duotone" className="mr-2" />
                    {isLoadingRepos ? 'Loading...' : 'Discover'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-url" className="text-base font-semibold">
                  Import Specific Repository
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enter a direct GitHub repository URL to import a single repo
                </p>
                <div className="flex gap-2">
                  <Input
                    id="repo-url"
                    value={specificRepoUrl}
                    onChange={(e) => setSpecificRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchSingleRepo()
                    }}
                  />
                  <Button 
                    onClick={fetchSingleRepo}
                    disabled={isLoadingRepos || !specificRepoUrl.trim()}
                    className="bg-gradient-to-r from-accent to-primary"
                  >
                    <GitBranch size={20} weight="duotone" className="mr-2" />
                    {isLoadingRepos ? 'Loading...' : 'Fetch'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Importing repositories...</span>
                <span className="text-muted-foreground">{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}

          {discoveredRepos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileCode size={24} weight="duotone" />
                    Discovered Repositories ({discoveredRepos.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select repositories to import as research tokens ({selectedRepos.length} selected)
                  </p>
                </div>
                {selectedRepos.length > 0 && (
                  <Button
                    onClick={importSelectedRepos}
                    disabled={isImporting}
                    className="bg-gradient-to-r from-accent to-secondary"
                    size="lg"
                  >
                    <Download size={20} weight="fill" className="mr-2" />
                    Import {selectedRepos.length} Repository{selectedRepos.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {discoveredRepos.map((repo) => (
                    <Card
                      key={repo.fullName}
                      onClick={() => toggleRepoSelection(repo.fullName)}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedRepos.includes(repo.fullName)
                          ? 'border-accent bg-accent/10 shadow-md'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {selectedRepos.includes(repo.fullName) ? (
                              <CheckCircle size={24} weight="fill" className="text-accent" />
                            ) : (
                              <GitBranch size={24} weight="duotone" className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base truncate">{repo.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {repo.fullName}
                                </p>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                {repo.stars > 0 && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <Star size={12} weight="fill" />
                                    {repo.stars}
                                  </Badge>
                                )}
                                <Badge variant="outline">{repo.language}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {repo.description}
                            </p>
                            <div className="flex items-center justify-between gap-2 pt-2 border-t">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{repo.forks} forks</span>
                                <span>•</span>
                                <span>{Math.round(repo.size / 1024)} MB</span>
                              </div>
                              {selectedRepos.includes(repo.fullName) && (
                                <Badge variant="default" className="bg-accent">
                                  <Sparkle size={12} weight="fill" className="mr-1" />
                                  Selected for Import
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {!isLoadingRepos && discoveredRepos.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
              <GitBranch size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Ready to Import</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a GitHub username or repository URL above to discover repositories for automatic import as research tokens
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm font-medium text-accent">Benefits of Auto-Import:</p>
                <ul className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto">
                  <li>✓ Automatic cryptographic hash generation</li>
                  <li>✓ README content parsed and tokenized</li>
                  <li>✓ Repository metadata preserved (stars, language, size)</li>
                  <li>✓ INF tokens added to your wallet based on repo value</li>
                  <li>✓ Verified research token with full traceability</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flask size={24} weight="duotone" className="text-primary" />
            Import Value Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Base Value Components:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Base Import Value: <span className="text-foreground font-medium">2,000 INF</span></li>
                <li>• README 500+ chars: <span className="text-foreground font-medium">+500 INF</span></li>
                <li>• README 1,500+ chars: <span className="text-foreground font-medium">+1,000 INF</span></li>
                <li>• README 3,000+ chars: <span className="text-foreground font-medium">+2,000 INF</span></li>
                <li>• Per Star: <span className="text-foreground font-medium">+50 INF</span></li>
                <li>• Per Fork: <span className="text-foreground font-medium">+100 INF</span></li>
                <li>• Size 1,000+ KB: <span className="text-foreground font-medium">+500 INF</span></li>
                <li>• Size 10,000+ KB: <span className="text-foreground font-medium">+1,000 INF</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Language Multipliers:</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Rust: <span className="text-foreground font-medium">2.0x</span></li>
                <li>• TypeScript, Python, C++: <span className="text-foreground font-medium">1.8x</span></li>
                <li>• Go, C: <span className="text-foreground font-medium">1.7x</span></li>
                <li>• Java: <span className="text-foreground font-medium">1.6x</span></li>
                <li>• JavaScript: <span className="text-foreground font-medium">1.5x</span></li>
                <li>• Other Languages: <span className="text-foreground font-medium">1.2x</span></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
