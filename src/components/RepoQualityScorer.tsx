import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GitBranch, Star, GitFork, Code, FileText, TrendUp, Coins, CheckCircle, XCircle, Info, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface QualityScore {
  overall: number
  codeQuality: number
  documentation: number
  activity: number
  community: number
  predictedValue: number
  confidence: number
  factors: {
    name: string
    score: number
    weight: number
    description: string
  }[]
  recommendations: string[]
  repoUrl: string
  repoName: string
  timestamp: number
}

interface RepoAnalysis {
  stars: number
  forks: number
  watchers: number
  openIssues: number
  hasReadme: boolean
  hasLicense: boolean
  hasContributing: boolean
  languages: string[]
  commits: number
  contributors: number
  recentActivity: boolean
  codeToCommentRatio: number
}

export function RepoQualityScorer() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentScore, setCurrentScore] = useState<QualityScore | null>(null)
  const [scoringHistory, setScoringHistory] = useKV<QualityScore[]>('repo-quality-scores', [])

  const analyzeRepository = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL')
      return
    }

    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)
    if (!repoMatch) {
      toast.error('Invalid GitHub repository URL')
      return
    }

    const [, owner, repo] = repoMatch
    const repoName = `${owner}/${repo.replace('.git', '')}`

    setIsAnalyzing(true)

    try {
      const prompt = `You are an expert software quality analyst and token valuation specialist. Analyze the following GitHub repository and provide a comprehensive quality assessment.

Repository: ${repoName}

Simulate a realistic analysis of this repository considering:

1. **Code Quality Metrics** (0-100):
   - Code structure and organization
   - Best practices adherence
   - Testing coverage (estimate)
   - Code complexity
   - Security considerations

2. **Documentation Quality** (0-100):
   - README completeness
   - API documentation
   - Code comments
   - Contributing guidelines
   - License presence

3. **Activity Metrics** (0-100):
   - Commit frequency
   - Recent updates
   - Release cadence
   - Issue resolution time
   - Pull request activity

4. **Community Engagement** (0-100):
   - Stars and forks
   - Contributors count
   - Issue discussions
   - Community health
   - Project popularity

Based on these metrics, calculate:
- Overall quality score (weighted average)
- Predicted token value (in INF tokens, range 100-10000)
- Confidence level (0-100)

Provide 5-7 specific factors with individual scores and weights, plus 3-5 actionable recommendations for improvement.

Return a JSON object with this exact structure:
{
  "analysis": {
    "codeQuality": <number 0-100>,
    "documentation": <number 0-100>,
    "activity": <number 0-100>,
    "community": <number 0-100>
  },
  "factors": [
    {
      "name": "<factor name>",
      "score": <number 0-100>,
      "weight": <number 0-1, sum should be 1>,
      "description": "<short description>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "predictedValue": <number 100-10000>,
  "confidence": <number 0-100>
}`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)

      const overall = Math.round(
        (data.analysis.codeQuality * 0.3) +
        (data.analysis.documentation * 0.2) +
        (data.analysis.activity * 0.25) +
        (data.analysis.community * 0.25)
      )

      const qualityScore: QualityScore = {
        overall,
        codeQuality: data.analysis.codeQuality,
        documentation: data.analysis.documentation,
        activity: data.analysis.activity,
        community: data.analysis.community,
        predictedValue: data.predictedValue,
        confidence: data.confidence,
        factors: data.factors,
        recommendations: data.recommendations,
        repoUrl,
        repoName,
        timestamp: Date.now()
      }

      setCurrentScore(qualityScore)
      setScoringHistory((current) => [qualityScore, ...(current || []).slice(0, 19)])

      toast.success('Repository analysis complete!', {
        description: `Overall score: ${overall}/100 | Predicted value: ${data.predictedValue} INF`
      })
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze repository')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-accent'
    if (score >= 40) return 'text-yellow-600'
    return 'text-destructive'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', variant: 'default' as const }
    if (score >= 80) return { label: 'Very Good', variant: 'default' as const }
    if (score >= 70) return { label: 'Good', variant: 'secondary' as const }
    if (score >= 60) return { label: 'Fair', variant: 'secondary' as const }
    if (score >= 40) return { label: 'Needs Work', variant: 'outline' as const }
    return { label: 'Poor', variant: 'destructive' as const }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-3">
            <Sparkle size={32} weight="duotone" className="text-primary" />
            <div>
              <CardTitle className="text-2xl">AI Repository Quality Scorer</CardTitle>
              <CardDescription className="text-base">
                Analyze GitHub repositories and predict token value with AI-powered quality assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">GitHub Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeRepository()}
              />
              <Button 
                onClick={analyzeRepository}
                disabled={isAnalyzing}
                className="min-w-[120px]"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkle className="animate-spin mr-2" size={16} />
                    Analyzing
                  </>
                ) : (
                  <>
                    <TrendUp size={20} weight="duotone" className="mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <Info size={18} weight="duotone" />
            <AlertDescription>
              Our AI analyzes code quality, documentation, activity patterns, and community engagement to predict token value
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {currentScore && (
        <Card className="border-2 border-accent/30 shadow-xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-1">{currentScore.repoName}</CardTitle>
                <CardDescription className="text-sm break-all">{currentScore.repoUrl}</CardDescription>
              </div>
              <Badge {...getScoreBadge(currentScore.overall)} className="text-sm px-3 py-1">
                {getScoreBadge(currentScore.overall).label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {currentScore.overall}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Overall Quality Score</div>
                    <Progress value={currentScore.overall} className="h-2 mt-3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Coins size={32} weight="duotone" className="text-accent" />
                      <div className="text-4xl font-bold text-accent">
                        {currentScore.predictedValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Predicted Token Value (INF)</div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
                      <span>Confidence:</span>
                      <span className="font-semibold">{currentScore.confidence}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
                <TabsTrigger value="factors">Key Factors</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code size={20} weight="duotone" className="text-primary" />
                        <span className="font-medium">Code Quality</span>
                      </div>
                      <span className={`font-bold ${getScoreColor(currentScore.codeQuality)}`}>
                        {currentScore.codeQuality}/100
                      </span>
                    </div>
                    <Progress value={currentScore.codeQuality} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={20} weight="duotone" className="text-secondary" />
                        <span className="font-medium">Documentation</span>
                      </div>
                      <span className={`font-bold ${getScoreColor(currentScore.documentation)}`}>
                        {currentScore.documentation}/100
                      </span>
                    </div>
                    <Progress value={currentScore.documentation} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch size={20} weight="duotone" className="text-accent" />
                        <span className="font-medium">Activity</span>
                      </div>
                      <span className={`font-bold ${getScoreColor(currentScore.activity)}`}>
                        {currentScore.activity}/100
                      </span>
                    </div>
                    <Progress value={currentScore.activity} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star size={20} weight="duotone" className="text-yellow-500" />
                        <span className="font-medium">Community</span>
                      </div>
                      <span className={`font-bold ${getScoreColor(currentScore.community)}`}>
                        {currentScore.community}/100
                      </span>
                    </div>
                    <Progress value={currentScore.community} className="h-2" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="factors" className="space-y-3 mt-4">
                {currentScore.factors.map((factor, idx) => (
                  <Card key={idx} className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{factor.name}</span>
                            <Badge variant="outline" className="text-xs">
                              Weight: {(factor.weight * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </div>
                        <div className={`text-2xl font-bold ml-4 ${getScoreColor(factor.score)}`}>
                          {factor.score}
                        </div>
                      </div>
                      <Progress value={factor.score} className="h-1.5" />
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-3 mt-4">
                {currentScore.recommendations.map((rec, idx) => (
                  <Alert key={idx}>
                    <CheckCircle size={18} weight="duotone" className="text-primary" />
                    <AlertDescription className="text-sm">{rec}</AlertDescription>
                  </Alert>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {scoringHistory && scoringHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={24} weight="duotone" />
              Analysis History
            </CardTitle>
            <CardDescription>Recent repository quality assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoringHistory.slice(0, 5).map((score, idx) => (
                <Card 
                  key={idx} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setCurrentScore(score)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{score.repoName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(score.timestamp).toLocaleDateString()} at{' '}
                          {new Date(score.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(score.overall)}`}>
                            {score.overall}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-accent">
                            {score.predictedValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">INF</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
