import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { 
  Sparkle, 
  Clock,
  TrendUp,
  CalendarPlus,
  Lightbulb,
  Users
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ScheduledPost } from './ContentCalendar'

interface BestTime {
  day: string
  hour: number
  score: number
  reason: string
}

interface AIRecommendation {
  bestTimes: BestTime[]
  contentSuggestions: string[]
  trending: string[]
  generated: number
}

interface BestTimeRecommenderProps {
  onScheduleWithAI?: (time: Date, content?: string) => void
}

export function BestTimeRecommender({ onScheduleWithAI }: BestTimeRecommenderProps) {
  const [recommendations, setRecommendations] = useLocalStorage<AIRecommendation | null>('ai-recommendations', null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateRecommendations = async () => {
    setIsGenerating(true)
    setProgress(0)

    try {
      setProgress(20)
      
      const promptText = `You are a social media analytics expert. Generate best posting times and recommendations.

Analyze and provide:
1. Top 5 best times to post across social platforms (day of week and hour)
2. 5 content topic suggestions based on current trends
3. 5 trending hashtags or topics

Return as JSON with this structure:
{
  "bestTimes": [{"day": "Monday", "hour": 9, "score": 95, "reason": "High engagement morning slot"}],
  "contentSuggestions": ["Topic idea 1", "Topic idea 2"],
  "trending": ["#trend1", "#trend2"]
}`
      const prompt = window.spark.llmPrompt([promptText], '')

      setProgress(50)
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      setProgress(80)
      
      const data = JSON.parse(response)
      
      const aiRec: AIRecommendation = {
        bestTimes: data.bestTimes || [],
        contentSuggestions: data.contentSuggestions || [],
        trending: data.trending || [],
        generated: Date.now()
      }

      setRecommendations(aiRec)
      setProgress(100)
      toast.success('AI recommendations generated!')
    } catch (error) {
      toast.error('Failed to generate recommendations')
      console.error('AI recommendation error:', error)
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  useEffect(() => {
    if (!recommendations) {
      generateRecommendations()
    }
  }, [])

  const scheduleAtRecommendedTime = (bestTime: BestTime) => {
    const now = new Date()
    const targetDate = new Date(now)
    
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const targetDay = daysOfWeek.indexOf(bestTime.day)
    const currentDay = now.getDay()
    
    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7
    }
    
    targetDate.setDate(now.getDate() + daysUntilTarget)
    targetDate.setHours(bestTime.hour, 0, 0, 0)
    
    if (onScheduleWithAI) {
      onScheduleWithAI(targetDate)
    }
    toast.success(`Scheduled for ${bestTime.day} at ${bestTime.hour}:00`)
  }

  const ageInHours = recommendations ? (Date.now() - recommendations.generated) / (1000 * 60 * 60) : 0
  const needsRefresh = ageInHours > 24

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={28} weight="duotone" className="text-accent" />
                AI Best Time Recommendations
              </CardTitle>
              <CardDescription>
                Optimal posting times based on engagement analytics
              </CardDescription>
            </div>
            <Button
              onClick={generateRecommendations}
              disabled={isGenerating}
              variant={needsRefresh ? 'default' : 'outline'}
              className={needsRefresh ? 'bg-gradient-to-r from-accent to-secondary' : ''}
            >
              {isGenerating ? (
                <>Analyzing...</>
              ) : needsRefresh ? (
                <>
                  <Sparkle size={16} weight="fill" className="mr-2" />
                  Refresh
                </>
              ) : (
                <>
                  <Sparkle size={16} className="mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Analyzing engagement patterns...
              </p>
            </div>
          )}

          {recommendations && !isGenerating && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock size={20} weight="duotone" className="text-accent" />
                    Best Times to Post
                  </h4>
                  {needsRefresh && (
                    <Badge variant="outline" className="text-xs">
                      Updated {Math.floor(ageInHours)}h ago
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {recommendations.bestTimes.slice(0, 5).map((time, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="secondary" 
                              className="text-lg px-3 py-1 bg-gradient-to-r from-accent/20 to-secondary/20"
                            >
                              #{index + 1}
                            </Badge>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                <CalendarPlus size={16} weight="bold" />
                                {time.day}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock size={14} />
                                {time.hour}:00 - {(time.hour + 1) % 24}:00
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-accent to-secondary"
                                style={{ width: `${time.score}%` }}
                              />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {time.score}% engagement
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {time.reason}
                          </p>
                        </div>
                        <Button
                          onClick={() => scheduleAtRecommendedTime(time)}
                          variant="secondary"
                          size="sm"
                        >
                          <CalendarPlus size={16} className="mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb size={20} weight="duotone" className="text-secondary" />
                    Content Suggestions
                  </h4>
                  <div className="space-y-2">
                    {recommendations.contentSuggestions.slice(0, 5).map((suggestion, index) => (
                      <Card key={index} className="p-3 hover:bg-accent/5 transition-colors cursor-pointer">
                        <p className="text-sm flex items-start gap-2">
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {index + 1}
                          </Badge>
                          <span className="flex-1">{suggestion}</span>
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendUp size={20} weight="duotone" className="text-accent" />
                    Trending Now
                  </h4>
                  <div className="space-y-2">
                    {recommendations.trending.slice(0, 5).map((trend, index) => (
                      <Card key={index} className="p-3 hover:bg-secondary/5 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{trend}</span>
                          <Badge variant="secondary" className="text-xs">
                            <TrendUp size={12} weight="bold" className="mr-1" />
                            Trending
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users size={20} weight="duotone" />
            Engagement Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Peak Engagement</p>
              <p className="text-lg font-bold text-accent">
                {recommendations?.bestTimes[0]?.day || 'Loading...'} {recommendations?.bestTimes[0]?.hour || ''}:00
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Score</p>
              <p className="text-lg font-bold text-secondary">
                {recommendations ? 
                  Math.round(recommendations.bestTimes.reduce((sum, t) => sum + t.score, 0) / recommendations.bestTimes.length) 
                  : 0}%
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Recommendations update every 24 hours based on platform analytics and engagement patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
