import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GitBranch, Sparkle, TrendUp, CheckCircle, Warning, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface BatchRepoScore {
  repoUrl: string
  repoName: string
  owner: string
  qualityScore: number
  codeQuality: number
  documentation: number
  activity: number
  community: number
  predictedValue: number
  confidence: number
  status: 'pending' | 'analyzing' | 'complete' | 'error'
  error?: string
  timestamp: number
}

export function BatchRepoAnalyzer() {
  const [repoList, setRepoList] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [batchResults, setBatchResults] = useState<BatchRepoScore[]>([])
  const [progress, setProgress] = useState(0)
  const [batchHistory, setBatchHistory] = useLocalStorage<BatchRepoScore[]>('batch-repo-analysis', [])

  const parseRepoUrls = (text: string): string[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const repos: string[] = []

    for (const line of lines) {
      const match = line.match(/github\.com\/([^\/\s]+)\/([^\/\s]+)/)
      if (match) {
        repos.push(`https://github.com/${match[1]}/${match[2].replace('.git', '')}`)
      }
    }

    return [...new Set(repos)]
  }

  const analyzeBatch = async () => {
    const repos = parseRepoUrls(repoList)

    if (repos.length === 0) {
      toast.error('No valid GitHub repository URLs found')
      return
    }

    if (repos.length > 20) {
      toast.error('Maximum 20 repositories per batch')
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    
    const results: BatchRepoScore[] = repos.map(url => {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)
      return {
        repoUrl: url,
        repoName: match ? `${match[1]}/${match[2]}` : url,
        owner: match ? match[1] : '',
        qualityScore: 0,
        codeQuality: 0,
        documentation: 0,
        activity: 0,
        community: 0,
        predictedValue: 0,
        confidence: 0,
        status: 'pending' as const,
        timestamp: Date.now()
      }
    })

    setBatchResults(results)

    for (let i = 0; i < results.length; i++) {
      try {
        results[i].status = 'analyzing'
        setBatchResults([...results])

        const score = await analyzeRepository(results[i].repoName)
        
        results[i] = {
          ...results[i],
          ...score,
          status: 'complete'
        }
      } catch (error) {
        results[i].status = 'error'
        results[i].error = error instanceof Error ? error.message : 'Analysis failed'
      }

      setProgress(Math.round(((i + 1) / results.length) * 100))
      setBatchResults([...results])
    }

    setBatchHistory((current) => [...(current || []), ...results.filter(r => r.status === 'complete')])
    
    setIsAnalyzing(false)
    toast.success(`Analyzed ${results.filter(r => r.status === 'complete').length} repositories`)
  }

  const analyzeRepository = async (repoName: string): Promise<Partial<BatchRepoScore>> => {
    const prompt = `You are an expert software quality analyst. Analyze the GitHub repository ${repoName} and provide quality scores.

Generate realistic scores (0-100) for:
- Overall Quality Score
- Code Quality (structure, best practices, testing)
- Documentation (README, API docs, comments)
- Activity (commit frequency, updates, releases)
- Community (contributors, issues, engagement)
- Predicted Token Value (1000-50000 based on quality)
- Confidence Level (0-100)

Return ONLY valid JSON in this exact format:
{
  "qualityScore": 85,
  "codeQuality": 88,
  "documentation": 82,
  "activity": 90,
  "community": 75,
  "predictedValue": 12500,
  "confidence": 87
}`

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const data = JSON.parse(response)

    return {
      qualityScore: data.qualityScore || 0,
      codeQuality: data.codeQuality || 0,
      documentation: data.documentation || 0,
      activity: data.activity || 0,
      community: data.community || 0,
      predictedValue: data.predictedValue || 0,
      confidence: data.confidence || 0
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    if (score >= 40) return 'outline'
    return 'destructive'
  }

  const exportResults = () => {
    const csv = ['Repository,Quality Score,Code Quality,Documentation,Activity,Community,Predicted Value,Confidence']
    batchResults.filter(r => r.status === 'complete').forEach(r => {
      csv.push(`${r.repoName},${r.qualityScore},${r.codeQuality},${r.documentation},${r.activity},${r.community},${r.predictedValue},${r.confidence}`)
    })

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-analysis-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Results exported to CSV')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch size={24} weight="duotone" className="text-primary" />
            Batch Repository Analyzer
          </CardTitle>
          <CardDescription>
            Analyze multiple GitHub repositories at once. Paste URLs (one per line) or import from search.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={repoList}
              onChange={(e) => setRepoList(e.target.value)}
              placeholder={`Paste repository URLs (one per line):
https://github.com/username/repo1
https://github.com/username/repo2
github.com/username/repo3

Max 20 repositories per batch`}
              rows={8}
              disabled={isAnalyzing}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {parseRepoUrls(repoList).length} repositories detected
              </span>
              {parseRepoUrls(repoList).length > 20 && (
                <Badge variant="destructive">Max 20 repos</Badge>
              )}
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Analyzing repositories...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={analyzeBatch} 
              disabled={isAnalyzing || parseRepoUrls(repoList).length === 0}
              className="flex-1"
            >
              <Sparkle className="mr-2" size={16} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Batch'}
            </Button>
            {batchResults.length > 0 && !isAnalyzing && (
              <Button onClick={exportResults} variant="outline">
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Results</CardTitle>
            <CardDescription>
              {batchResults.filter(r => r.status === 'complete').length} complete • {' '}
              {batchResults.filter(r => r.status === 'analyzing').length} analyzing • {' '}
              {batchResults.filter(r => r.status === 'error').length} errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {batchResults.map((result, idx) => (
                  <Card key={idx} className={result.status === 'error' ? 'border-destructive' : ''}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{result.repoName}</span>
                              {result.status === 'complete' && (
                                <CheckCircle size={16} className="text-green-600" />
                              )}
                              {result.status === 'analyzing' && (
                                <div className="animate-spin">
                                  <Sparkle size={16} className="text-primary" />
                                </div>
                              )}
                              {result.status === 'error' && (
                                <X size={16} className="text-destructive" />
                              )}
                            </div>
                            <a 
                              href={result.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              {result.repoUrl}
                            </a>
                          </div>

                          {result.status === 'complete' && (
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(result.qualityScore)}`}>
                                {result.qualityScore}
                              </div>
                              <div className="text-xs text-muted-foreground">Quality Score</div>
                            </div>
                          )}
                        </div>

                        {result.status === 'complete' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Code Quality</div>
                                <Badge variant={getScoreBadgeVariant(result.codeQuality)}>
                                  {result.codeQuality}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Documentation</div>
                                <Badge variant={getScoreBadgeVariant(result.documentation)}>
                                  {result.documentation}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Activity</div>
                                <Badge variant={getScoreBadgeVariant(result.activity)}>
                                  {result.activity}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Community</div>
                                <Badge variant={getScoreBadgeVariant(result.community)}>
                                  {result.community}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <TrendUp size={16} className="text-primary" />
                                <span className="text-sm font-medium">Predicted Token Value</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">
                                  {result.predictedValue.toLocaleString()} INF
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {result.confidence}% confidence
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {result.status === 'error' && (
                          <Alert variant="destructive">
                            <Warning className="h-4 w-4" />
                            <AlertDescription>
                              {result.error || 'Analysis failed'}
                            </AlertDescription>
                          </Alert>
                        )}

                        {result.status === 'pending' && (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            Waiting to analyze...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
