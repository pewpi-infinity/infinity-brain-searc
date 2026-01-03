import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Flask, Hash, FileText, Link, Sparkle, CheckCircle, Copy } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResearchTokenVerifier } from '@/components/ResearchTokenVerifier'
import { ResearchRepositoryBrowser } from '@/components/ResearchRepositoryBrowser'
import { ResearchTokenAnalytics } from '@/components/ResearchTokenAnalytics'
import { GitHubRepoImporter } from '@/components/GitHubRepoImporter'

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

export function ResearchTokenMinter() {
  const [tokens, setTokens] = useKV<ResearchToken[]>('research-tokens', [])
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [content, setContent] = useState('')
  const [links, setLinks] = useState('')
  const [citations, setCitations] = useState('')
  const [category, setCategory] = useState('general')
  const [repository, setRepository] = useState('')
  const [isMinting, setIsMinting] = useState(false)

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

  const calculateResearchValue = async (token: Partial<ResearchToken>): Promise<number> => {
    let value = 1000
    
    if (token.content && token.content.length > 500) value += 500
    if (token.content && token.content.length > 1500) value += 1000
    if (token.content && token.content.length > 3000) value += 2000
    
    if (token.links && token.links.length > 0) value += token.links.length * 100
    if (token.citations && token.citations.length > 0) value += token.citations.length * 200
    
    if (token.abstract && token.abstract.length > 100) value += 300
    
    const categoryMultipliers: Record<string, number> = {
      'scientific': 2.5,
      'medical': 3.0,
      'technical': 2.0,
      'social': 1.5,
      'economic': 2.2,
      'environmental': 2.0,
      'general': 1.0
    }
    
    value *= categoryMultipliers[token.category || 'general'] || 1.0
    
    if (token.repository && token.repository.includes('github.com')) {
      try {
        const repoMatch = token.repository.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)
        if (repoMatch) {
          const [, owner, repo] = repoMatch
          const repoName = `${owner}/${repo.replace('.git', '')}`
          
          const prompt = `Analyze GitHub repository ${repoName} for quality scoring. Return ONLY valid JSON:
{
  "qualityScore": 85,
  "codeQuality": 88,
  "documentation": 82,
  "activity": 90,
  "community": 75
}`
          
          const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
          const quality = JSON.parse(response)
          
          const qualityBonus = Math.floor((quality.qualityScore / 100) * value * 0.5)
          value += qualityBonus
          
          toast.info(`Quality score applied: +${qualityBonus} INF`, {
            description: `Repo score: ${quality.qualityScore}/100`
          })
        }
      } catch (error) {
        console.error('Quality scoring failed:', error)
      }
    }
    
    return Math.floor(value)
  }

  const mintResearchToken = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setIsMinting(true)

    try {
      const user = await window.spark.user()
      if (!user) {
        toast.error('User not authenticated')
        setIsMinting(false)
        return
      }
      
      const timestamp = Date.now()
      
      const linkArray = links.split('\n').filter(l => l.trim()).map(l => l.trim())
      const citationArray = citations.split('\n').filter(c => c.trim()).map(c => c.trim())
      
      const tokenData: Partial<ResearchToken> = {
        title,
        abstract,
        content,
        author: user.login,
        authorGitHub: `https://github.com/${user.login}`,
        timestamp,
        links: linkArray,
        citations: citationArray,
        category,
        repository: repository.trim() || undefined
      }
      
      const contentHash = await generateHash(content)
      const verificationHash = await generateVerificationHash(tokenData)
      const value = await calculateResearchValue(tokenData)
      
      const newToken: ResearchToken = {
        ...tokenData as ResearchToken,
        id: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hash: contentHash,
        verificationHash,
        value,
        verified: true
      }
      
      setTokens((currentTokens) => [newToken, ...(currentTokens || [])])
      
      const userWalletKey = `wallet-${user.login}`
      const userWallet = await window.spark.kv.get<any>(userWalletKey) || { balance: 0, tokens: [] }
      userWallet.balance = (userWallet.balance || 0) + value
      if (!userWallet.tokens) userWallet.tokens = []
      userWallet.tokens.push({
        symbol: newToken.id,
        amount: 1,
        name: newToken.title,
        type: 'research'
      })
      await window.spark.kv.set(userWalletKey, userWallet)
      
      toast.success('Research token minted successfully!', {
        description: `Token value: ${value.toLocaleString()} INF`
      })
      
      setTitle('')
      setAbstract('')
      setContent('')
      setLinks('')
      setCitations('')
      setCategory('general')
      setRepository('')
      
    } catch (error) {
      console.error('Minting error:', error)
      toast.error('Failed to mint research token')
    } finally {
      setIsMinting(false)
    }
  }

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    toast.success('Hash copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Research Tokens</TabsTrigger>
          <TabsTrigger value="import">Auto-Import</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="repos">Repository Browser</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="gradient-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Flask size={32} weight="duotone" className="text-primary" />
                <div>
                  <CardTitle className="text-3xl">Research Token Minter</CardTitle>
                  <CardDescription>
                    Create verified research tokens with cryptographic hash verification. Research contributions are tokenized and added to your wallet.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Research Token</TabsTrigger>
              <TabsTrigger value="view">View Research Tokens</TabsTrigger>
              <TabsTrigger value="verify">Verify Token</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="research-title">Research Title *</Label>
                  <Input
                    id="research-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter research title"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-category">Category</Label>
                  <select
                    id="research-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="general">General</option>
                    <option value="scientific">Scientific (2.5x value)</option>
                    <option value="medical">Medical (3.0x value)</option>
                    <option value="technical">Technical (2.0x value)</option>
                    <option value="social">Social Sciences (1.5x value)</option>
                    <option value="economic">Economic (2.2x value)</option>
                    <option value="environmental">Environmental (2.0x value)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-abstract">Abstract</Label>
                  <Textarea
                    id="research-abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Brief summary of your research (recommended 100+ characters for bonus)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {abstract.length} characters {abstract.length >= 100 ? '✓ Bonus: +300 INF' : ''}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-content">Research Content *</Label>
                  <Textarea
                    id="research-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your full research content, findings, methodology, and conclusions"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{content.length} characters</span>
                    <span>{content.length >= 500 ? '✓ +500 INF' : ''}</span>
                    <span>{content.length >= 1500 ? '✓ +1000 INF' : ''}</span>
                    <span>{content.length >= 3000 ? '✓ +2000 INF' : ''}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-links">External Links</Label>
                  <Textarea
                    id="research-links"
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                    placeholder="Enter URLs (one per line). Each link adds +100 INF"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {links.split('\n').filter(l => l.trim()).length} links (+{links.split('\n').filter(l => l.trim()).length * 100} INF)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-citations">Citations & References</Label>
                  <Textarea
                    id="research-citations"
                    value={citations}
                    onChange={(e) => setCitations(e.target.value)}
                    placeholder="Enter citations (one per line). Each citation adds +200 INF"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {citations.split('\n').filter(c => c.trim()).length} citations (+{citations.split('\n').filter(c => c.trim()).length * 200} INF)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="research-repo">Repository Link (Optional)</Label>
                  <Input
                    id="research-repo"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="p-4 bg-accent/20 rounded-lg border border-accent">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkle size={20} weight="fill" className="text-accent" />
                    Estimated Token Value
                  </h4>
                  <p className="text-3xl font-bold text-accent">
                    {calculateResearchValue({
                      title,
                      abstract,
                      content,
                      links: links.split('\n').filter(l => l.trim()),
                      citations: citations.split('\n').filter(c => c.trim()),
                      category
                    }).toLocaleString()} INF
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This value will be added to your wallet upon minting
                  </p>
                </div>

                <Button 
                  onClick={mintResearchToken} 
                  disabled={isMinting || !title.trim() || !content.trim()}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  size="lg"
                >
                  <Flask size={20} weight="fill" className="mr-2" />
                  {isMinting ? 'Minting Research Token...' : 'Mint Research Token'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="view">
              <ScrollArea className="h-[600px] pr-4">
                {!tokens || tokens.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Research Tokens Yet</h3>
                    <p className="text-muted-foreground">Create your first research token to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tokens && tokens.map((token) => (
                      <Card key={token.id} className="border-accent/20">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-xl">{token.title}</CardTitle>
                                {token.verified && (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle size={14} weight="fill" className="mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="secondary">{token.category}</Badge>
                                <Badge variant="outline" className="font-mono">{token.id}</Badge>
                              </div>
                              <CardDescription>
                                By {token.author} • {new Date(token.timestamp).toLocaleDateString()} • {token.value.toLocaleString()} INF
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {token.abstract && (
                            <div>
                              <h4 className="font-semibold mb-2">Abstract</h4>
                              <p className="text-sm text-muted-foreground">{token.abstract}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Research Content</h4>
                            <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                              <p className="text-sm whitespace-pre-wrap">{token.content}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Hash size={16} />
                                Content Hash
                              </h4>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all flex-1">
                                  {token.hash}
                                </code>
                                <Button size="icon" variant="ghost" onClick={() => copyHash(token.hash)}>
                                  <Copy size={16} />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle size={16} />
                                Verification Hash
                              </h4>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all flex-1">
                                  {token.verificationHash}
                                </code>
                                <Button size="icon" variant="ghost" onClick={() => copyHash(token.verificationHash)}>
                                  <Copy size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {token.links && token.links.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Link size={16} />
                                External Links ({token.links.length})
                              </h4>
                              <ul className="space-y-1">
                                {token.links.map((link, idx) => (
                                  <li key={idx}>
                                    <a 
                                      href={link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-accent hover:underline"
                                    >
                                      {link}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {token.citations && token.citations.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Citations ({token.citations.length})</h4>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {token.citations.map((citation, idx) => (
                                  <li key={idx}>{citation}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {token.repository && (
                            <div>
                              <h4 className="font-semibold mb-2">Repository</h4>
                              <a 
                                href={token.repository} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-accent hover:underline"
                              >
                                {token.repository}
                              </a>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Badge variant="outline" className="text-accent border-accent">
                              Token Value: {token.value.toLocaleString()} INF
                            </Badge>
                            <a 
                              href={token.authorGitHub}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              @{token.author}
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="verify">
              <ResearchTokenVerifier />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="import">
          <GitHubRepoImporter />
        </TabsContent>

        <TabsContent value="analytics">
          <ResearchTokenAnalytics />
        </TabsContent>

        <TabsContent value="repos">
          <ResearchRepositoryBrowser />
        </TabsContent>
      </Tabs>
    </div>
  )
}
