import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { 
  UploadSimple, 
  FileCsv,
  FileText,
  Calendar,
  Trash,
  Plus,
  Sparkle,
  CheckCircle,
  Clock,
  ListBullets
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { ScheduledPost } from './ContentCalendar'

interface BulkPost {
  id: string
  content: string
  scheduledTime: string
  status: 'draft' | 'validated' | 'error'
  errorMessage?: string
}

interface BulkUploaderProps {
  platforms: string[]
  onScheduleBulk?: (posts: ScheduledPost[]) => void
}

export function BulkUploader({ platforms, onScheduleBulk }: BulkUploaderProps) {
  const [scheduledPosts, setScheduledPosts] = useKV<ScheduledPost[]>('scheduled-posts', [])
  const [bulkPosts, setBulkPosts] = useState<BulkPost[]>([])
  const [csvContent, setCsvContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [useAIGeneration, setUseAIGeneration] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [numberOfPosts, setNumberOfPosts] = useState(5)
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'csv' | 'ai'>('manual')

  const addManualPost = () => {
    const newPost: BulkPost = {
      id: Date.now().toString(),
      content: '',
      scheduledTime: '',
      status: 'draft'
    }
    setBulkPosts([...bulkPosts, newPost])
  }

  const removePost = (postId: string) => {
    setBulkPosts(bulkPosts.filter(p => p.id !== postId))
  }

  const updatePost = (postId: string, field: 'content' | 'scheduledTime', value: string) => {
    setBulkPosts(bulkPosts.map(p => 
      p.id === postId ? { ...p, [field]: value, status: 'draft' as const } : p
    ))
  }

  const validatePosts = () => {
    const validated = bulkPosts.map(post => {
      let status: 'validated' | 'error' = 'validated'
      let errorMessage: string | undefined

      if (!post.content.trim()) {
        status = 'error'
        errorMessage = 'Content is required'
      } else if (!post.scheduledTime) {
        status = 'error'
        errorMessage = 'Schedule time is required'
      } else if (new Date(post.scheduledTime).getTime() <= Date.now()) {
        status = 'error'
        errorMessage = 'Schedule time must be in the future'
      }

      return { ...post, status, errorMessage }
    })

    setBulkPosts(validated)

    const errors = validated.filter(p => p.status === 'error').length
    if (errors > 0) {
      toast.error(`${errors} post${errors > 1 ? 's have' : ' has'} validation errors`)
      return false
    }

    toast.success('All posts validated successfully!')
    return true
  }

  const parseCsvContent = (csv: string) => {
    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const lines = csv.trim().split('\n')
      const hasHeader = lines[0].toLowerCase().includes('content') || lines[0].toLowerCase().includes('text')
      const dataLines = hasHeader ? lines.slice(1) : lines

      const posts: BulkPost[] = []

      dataLines.forEach((line, index) => {
        setProcessingProgress((index / dataLines.length) * 100)
        
        const match = line.match(/^"?([^"]*?)"?,\s*"?([^"]*?)"?\s*$/)
        
        if (match) {
          const [, content, datetime] = match
          
          if (content && datetime) {
            posts.push({
              id: `csv-${Date.now()}-${index}`,
              content: content.trim(),
              scheduledTime: datetime.trim(),
              status: 'draft'
            })
          }
        }
      })

      setBulkPosts(posts)
      toast.success(`Imported ${posts.length} posts from CSV`)
    } catch (error) {
      toast.error('Failed to parse CSV. Please check the format.')
      console.error('CSV parsing error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const generateWithAI = async () => {
    if (!generationPrompt.trim()) {
      toast.error('Please enter a topic or theme for AI generation')
      return
    }

    if (numberOfPosts < 1 || numberOfPosts > 50) {
      toast.error('Number of posts must be between 1 and 50')
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      setProcessingProgress(20)
      
      const now = new Date()
      const hoursApart = Math.max(2, Math.floor(168 / numberOfPosts))
      
      const promptText = `Generate ${numberOfPosts} engaging social media posts about: ${generationPrompt}

Requirements:
- Each post should be unique and valuable
- Keep posts under 280 characters for Twitter compatibility
- Mix different content types: tips, questions, facts, quotes
- Make them engaging and actionable
- Use appropriate emojis sparingly

Return as JSON with a "posts" array containing objects with a "content" field.`

      const prompt = window.spark.llmPrompt([promptText], '')
      
      setProcessingProgress(40)
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      
      setProcessingProgress(70)

      if (data.posts && Array.isArray(data.posts)) {
        const generatedPosts: BulkPost[] = data.posts.map((post: { content: string }, index: number) => {
          const scheduleDate = new Date(now.getTime() + (index * hoursApart * 60 * 60 * 1000))
          
          return {
            id: `ai-${Date.now()}-${index}`,
            content: post.content,
            scheduledTime: scheduleDate.toISOString().slice(0, 16),
            status: 'draft' as const
          }
        })

        setBulkPosts(generatedPosts)
        setProcessingProgress(100)
        toast.success(`Generated ${generatedPosts.length} posts with AI!`)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      toast.error('Failed to generate posts with AI')
      console.error('AI generation error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const scheduleBulkPosts = async () => {
    if (bulkPosts.length === 0) {
      toast.error('No posts to schedule')
      return
    }

    if (!validatePosts()) {
      return
    }

    if (platforms.length === 0) {
      toast.error('Please connect at least one platform in the Post tab')
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      const newScheduledPosts: ScheduledPost[] = []

      for (let i = 0; i < bulkPosts.length; i++) {
        const post = bulkPosts[i]
        setProcessingProgress((i / bulkPosts.length) * 100)

        const scheduledPost: ScheduledPost = {
          id: Date.now().toString() + '-' + i,
          content: post.content,
          platforms: platforms,
          scheduledTime: new Date(post.scheduledTime).getTime(),
          status: 'pending',
          createdAt: Date.now(),
          aiRecommended: uploadMethod === 'ai'
        }

        newScheduledPosts.push(scheduledPost)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setScheduledPosts((current = []) => [...current, ...newScheduledPosts])
      
      if (onScheduleBulk) {
        onScheduleBulk(newScheduledPosts)
      }

      toast.success(`Successfully scheduled ${newScheduledPosts.length} posts!`)
      setBulkPosts([])
      setCsvContent('')
      setGenerationPrompt('')
    } catch (error) {
      toast.error('Failed to schedule posts')
      console.error('Bulk schedule error:', error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadSimple size={28} weight="duotone" className="text-accent" />
          Bulk Content Upload
        </CardTitle>
        <CardDescription>
          Schedule multiple posts at once using manual entry, CSV import, or AI generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as typeof uploadMethod)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">
              <ListBullets size={18} className="mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="csv">
              <FileCsv size={18} className="mr-2" />
              CSV Import
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkle size={18} className="mr-2" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Posts to Schedule</Label>
              <Button onClick={addManualPost} size="sm" variant="outline">
                <Plus size={16} className="mr-2" />
                Add Post
              </Button>
            </div>

            {bulkPosts.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="py-12 text-center">
                  <ListBullets size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No posts added yet</p>
                  <Button onClick={addManualPost} className="mt-4" variant="outline">
                    <Plus size={16} className="mr-2" />
                    Add Your First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {bulkPosts.map((post, index) => (
                  <Card key={post.id} className={post.status === 'error' ? 'border-destructive' : ''}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary">Post {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePost(post.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`content-${post.id}`}>Content</Label>
                        <Textarea
                          id={`content-${post.id}`}
                          value={post.content}
                          onChange={(e) => updatePost(post.id, 'content', e.target.value)}
                          placeholder="Enter post content..."
                          className="min-h-[80px]"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.content.length} characters</span>
                          {post.content.length > 280 && (
                            <Badge variant="outline" className="text-xs">Over Twitter limit</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`time-${post.id}`}>Schedule Time</Label>
                        <Input
                          id={`time-${post.id}`}
                          type="datetime-local"
                          value={post.scheduledTime}
                          onChange={(e) => updatePost(post.id, 'scheduledTime', e.target.value)}
                        />
                      </div>

                      {post.status === 'error' && post.errorMessage && (
                        <Badge variant="destructive" className="w-full justify-center">
                          {post.errorMessage}
                        </Badge>
                      )}

                      {post.status === 'validated' && (
                        <Badge className="w-full justify-center bg-green-500">
                          <CheckCircle size={14} className="mr-1" />
                          Ready to schedule
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="csv" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="csv-content">CSV Content</Label>
              <Textarea
                id="csv-content"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="Paste your CSV content here...&#10;&#10;Format:&#10;content, datetime&#10;&quot;First post content&quot;, 2024-12-20T10:00&#10;&quot;Second post content&quot;, 2024-12-21T14:30"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText size={16} weight="duotone" />
                  CSV Format Guide
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Use format: <code className="bg-background px-1 py-0.5 rounded">content, datetime</code></p>
                  <p>• Datetime format: <code className="bg-background px-1 py-0.5 rounded">YYYY-MM-DDTHH:MM</code></p>
                  <p>• Example: <code className="bg-background px-1 py-0.5 rounded">"My post", 2024-12-20T10:00</code></p>
                  <p>• Optional header row will be automatically detected</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => parseCsvContent(csvContent)} 
              disabled={!csvContent.trim() || isProcessing}
              className="w-full"
            >
              <FileCsv size={20} className="mr-2" />
              Parse CSV & Import Posts
            </Button>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Topic or Theme</Label>
                <Textarea
                  id="ai-prompt"
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  placeholder="Enter a topic, theme, or detailed instructions for AI to generate posts about...&#10;&#10;Example: Create engaging posts about productivity tips for remote workers"
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-count">Number of Posts</Label>
                <div className="flex gap-2">
                  <Input
                    id="post-count"
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfPosts}
                    onChange={(e) => setNumberOfPosts(parseInt(e.target.value) || 5)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground flex items-center">
                    Posts will be automatically spaced throughout the week
                  </span>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-accent/10 to-secondary/10">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkle size={16} weight="duotone" />
                    AI Generation Features
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✨ Generates unique, engaging content for each post</p>
                    <p>📅 Automatically schedules posts evenly throughout the week</p>
                    <p>🎯 Optimized for social media best practices</p>
                    <p>📱 Twitter-compatible character limits</p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={generateWithAI}
                disabled={!generationPrompt.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-accent to-secondary"
              >
                <Sparkle size={20} weight="fill" className="mr-2" />
                Generate {numberOfPosts} Posts with AI
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={processingProgress} />
            <p className="text-sm text-center text-muted-foreground">
              {uploadMethod === 'csv' ? 'Processing CSV...' : 'Generating posts with AI...'}
            </p>
          </div>
        )}

        {bulkPosts.length > 0 && !isProcessing && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{bulkPosts.length} posts ready</p>
                <p className="text-xs text-muted-foreground">
                  Will post to {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={validatePosts}>
                  <CheckCircle size={16} className="mr-2" />
                  Validate All
                </Button>
                <Button onClick={scheduleBulkPosts} disabled={isProcessing}>
                  <Calendar size={16} className="mr-2" />
                  Schedule All
                </Button>
              </div>
            </div>
          </div>
        )}

        {platforms.length === 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <p className="text-sm text-center">
                ⚠️ Connect platforms in the <strong>Post</strong> tab before scheduling
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
