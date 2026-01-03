import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useKV } from '@github/spark/hooks'
import { 
  TwitterLogo, 
  FacebookLogo, 
  LinkedinLogo, 
  InstagramLogo,
  MusicNote,
  Check,
  PaperPlaneTilt,
  ChatCircleText,
  Clock,
  Image,
  Calendar,
  ChartLine,
  Sparkle,
  UploadSimple,
  FloppyDisk
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ContentCalendar, type ScheduledPost } from './ContentCalendar'
import { BestTimeRecommender } from './BestTimeRecommender'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { BulkUploader } from './BulkUploader'
import { TemplateLibrary } from './TemplateLibrary'
import { BulkScheduleImporter } from './BulkScheduleImporter'
import { AutoBackupScheduler } from './AutoBackupScheduler'

interface PlatformConnection {
  id: string
  name: string
  icon: typeof TwitterLogo
  connected: boolean
  username?: string
  color: string
}

interface PostHistory {
  id: string
  content: string
  platforms: string[]
  timestamp: number
  includeContext: boolean
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function SocialPoster() {
  const [postContent, setPostContent] = useState('')
  const [platforms, setPlatforms] = useKV<PlatformConnection[]>('social-platforms', [])
  const [postHistory, setPostHistory] = useKV<PostHistory[]>('post-history', [])
  const [scheduledPosts, setScheduledPosts] = useKV<ScheduledPost[]>('scheduled-posts', [])
  const [conversationHistory, setConversationHistory] = useKV<ConversationMessage[]>('conversation-history', [])
  const [includeContext, setIncludeContext] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postingProgress, setPostingProgress] = useState(0)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')
  const [activeTab, setActiveTab] = useState('post')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized && (!platforms || platforms.length === 0)) {
      const defaultPlatforms: PlatformConnection[] = [
        { id: 'twitter', name: 'Twitter/X', icon: TwitterLogo, connected: false, color: 'oklch(0.55 0.15 220)' },
        { id: 'facebook', name: 'Facebook', icon: FacebookLogo, connected: false, color: 'oklch(0.50 0.20 250)' },
        { id: 'linkedin', name: 'LinkedIn', icon: LinkedinLogo, connected: false, color: 'oklch(0.45 0.15 240)' },
        { id: 'instagram', name: 'Instagram', icon: InstagramLogo, connected: false, color: 'oklch(0.60 0.25 320)' },
        { id: 'tiktok', name: 'TikTok', icon: MusicNote, connected: false, color: 'oklch(0.40 0.10 280)' }
      ]
      setPlatforms(defaultPlatforms)
      setInitialized(true)
    }
  }, [platforms, initialized, setPlatforms])

  const detectPostEmoji = (text: string) => {
    const postEmojis = ['🤑', '📤', '🚀', '📢', '💬']
    return postEmojis.some(emoji => text.includes(emoji))
  }

  const detectContextEmoji = (text: string) => {
    return text.includes('🧲') || text.includes('🪐')
  }

  useEffect(() => {
    if (!postContent) return
    
    if (detectPostEmoji(postContent)) {
      const cleanContent = postContent.replace(/[🤑📤🚀📢💬]/g, '').trim()
      if (cleanContent) {
        handlePost(cleanContent)
        setPostContent('')
      }
    }
    if (detectContextEmoji(postContent)) {
      setIncludeContext(true)
    }
  }, [postContent])

  const togglePlatform = (platformId: string) => {
    if (!Array.isArray(platforms)) return
    setPlatforms((currentPlatforms = []) =>
      currentPlatforms.map(p =>
        p.id === platformId ? { ...p, connected: !p.connected } : p
      )
    )
  }

  const getRecentContext = () => {
    if (!Array.isArray(conversationHistory)) return ''
    const recent = conversationHistory.slice(-3)
    return recent.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
  }

  const enhanceWithAI = async (content: string) => {
    const context = includeContext ? getRecentContext() : ''
    const contextSection = context ? `Recent conversation context:\n${context}\n\n` : ''
    
    try {
      const promptText = `You are a social media expert. Enhance this post for maximum engagement while keeping it authentic and concise (max 280 chars for Twitter compatibility).

${contextSection}Original post: ${content}

Return ONLY the enhanced post text, no explanations.`
      const enhanced = await window.spark.llm(promptText, 'gpt-4o-mini', false)
      return enhanced.trim()
    } catch {
      return content
    }
  }

  const handlePost = async (content?: string) => {
    const textToPost = content || postContent
    if (!textToPost.trim()) {
      toast.error('Please enter some content to post')
      return
    }

    if (!Array.isArray(platforms)) {
      toast.error('Platform configuration error. Please refresh the page.')
      return
    }

    const connectedPlatforms = platforms.filter(p => p.connected)
    if (connectedPlatforms.length === 0) {
      toast.error('Please connect at least one platform')
      return
    }

    setIsPosting(true)
    setPostingProgress(0)

    try {
      const enhancedContent = await enhanceWithAI(textToPost)
      setPostingProgress(30)

      await new Promise(resolve => setTimeout(resolve, 500))

      for (let i = 0; i < connectedPlatforms.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setPostingProgress(30 + ((i + 1) / connectedPlatforms.length) * 70)
        
        const PlatformIcon = connectedPlatforms[i].icon
        toast.success(`Posted to ${connectedPlatforms[i].name}`, {
          icon: <PlatformIcon size={20} weight="fill" />
        })
      }

      const newPost: PostHistory = {
        id: Date.now().toString(),
        content: enhancedContent,
        platforms: connectedPlatforms.map(p => p.name),
        timestamp: Date.now(),
        includeContext
      }

      setPostHistory((current = []) => [newPost, ...current].slice(0, 50))

      setConversationHistory((current = []) => [
        ...current,
        {
          role: 'user' as const,
          content: textToPost,
          timestamp: Date.now()
        }
      ].slice(-20))

      toast.success(`Successfully posted to ${connectedPlatforms.length} platform${connectedPlatforms.length > 1 ? 's' : ''}!`)
      setPostContent('')
      setIncludeContext(false)
    } catch (error) {
      toast.error('Failed to post. Please try again.')
      console.error('Post error:', error)
    } finally {
      setIsPosting(false)
      setPostingProgress(0)
    }
  }

  const handleSchedulePost = () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content to schedule')
      return
    }

    if (!scheduleTime) {
      toast.error('Please select a time to schedule')
      return
    }

    if (!Array.isArray(platforms)) {
      toast.error('Platform configuration error. Please refresh the page.')
      return
    }

    const connectedPlatforms = platforms.filter(p => p.connected)
    if (connectedPlatforms.length === 0) {
      toast.error('Please connect at least one platform')
      return
    }

    const scheduledTime = new Date(scheduleTime).getTime()
    if (scheduledTime <= Date.now()) {
      toast.error('Please select a future time')
      return
    }

    const newScheduledPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      platforms: connectedPlatforms.map(p => p.name),
      scheduledTime,
      status: 'pending',
      createdAt: Date.now(),
      aiRecommended: false
    }

    setScheduledPosts((current = []) => [...current, newScheduledPost])
    toast.success('Post scheduled successfully!')
    setPostContent('')
    setScheduleTime('')
    setShowScheduler(false)
  }

  const handleScheduleWithAI = (time: Date, content?: string) => {
    if (!Array.isArray(platforms)) {
      toast.error('Platform configuration error. Please refresh the page.')
      return
    }
    
    const connectedPlatforms = platforms.filter(p => p.connected)
    if (connectedPlatforms.length === 0) {
      toast.error('Please connect at least one platform first')
      return
    }

    const postText = content || postContent || 'AI-optimized post content'

    const newScheduledPost: ScheduledPost = {
      id: Date.now().toString(),
      content: postText,
      platforms: connectedPlatforms.map(p => p.name),
      scheduledTime: time.getTime(),
      status: 'pending',
      createdAt: Date.now(),
      aiRecommended: true
    }

    setScheduledPosts((current = []) => [...current, newScheduledPost])
    toast.success('Post scheduled at AI-recommended time!')
    setActiveTab('calendar')
  }

  const connectedCount = Array.isArray(platforms) ? platforms.filter(p => p.connected).length : 0
  const connectedPlatformNames = Array.isArray(platforms) ? platforms.filter(p => p.connected).map(p => p.name) : []

  const handleUseTemplate = (content: string, hashtags: string[]) => {
    setPostContent(content)
    setActiveTab('post')
  }

  return (
    <div className="space-y-6">
      <div className="grid w-full max-w-6xl mx-auto grid-cols-4 md:grid-cols-8 gap-2">
        <Button
          variant={activeTab === 'post' ? 'default' : 'outline'}
          onClick={() => setActiveTab('post')}
          className={activeTab === 'post' ? 'bg-gradient-to-r from-accent to-secondary text-accent-foreground' : ''}
        >
          <PaperPlaneTilt size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Post</span>
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('templates')}
          className={activeTab === 'templates' ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : ''}
        >
          <Sparkle size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Templates</span>
        </Button>
        <Button
          variant={activeTab === 'bulk' ? 'default' : 'outline'}
          onClick={() => setActiveTab('bulk')}
          className={activeTab === 'bulk' ? 'bg-gradient-to-r from-secondary to-accent text-secondary-foreground' : ''}
        >
          <UploadSimple size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Bulk</span>
        </Button>
        <Button
          variant={activeTab === 'csv-import' ? 'default' : 'outline'}
          onClick={() => setActiveTab('csv-import')}
          className={activeTab === 'csv-import' ? 'bg-gradient-to-r from-accent to-primary text-accent-foreground' : ''}
        >
          <UploadSimple size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Import</span>
        </Button>
        <Button
          variant={activeTab === 'calendar' ? 'default' : 'outline'}
          onClick={() => setActiveTab('calendar')}
          className={activeTab === 'calendar' ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : ''}
        >
          <Calendar size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Calendar</span>
        </Button>
        <Button
          variant={activeTab === 'ai' ? 'default' : 'outline'}
          onClick={() => setActiveTab('ai')}
          className={activeTab === 'ai' ? 'bg-gradient-to-r from-secondary to-primary text-primary-foreground' : ''}
        >
          <Sparkle size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">AI Timing</span>
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'outline'}
          onClick={() => setActiveTab('analytics')}
          className={activeTab === 'analytics' ? 'bg-gradient-to-r from-accent to-primary text-accent-foreground' : ''}
        >
          <ChartLine size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Analytics</span>
        </Button>
        <Button
          variant={activeTab === 'backup' ? 'default' : 'outline'}
          onClick={() => setActiveTab('backup')}
          className={activeTab === 'backup' ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground' : ''}
        >
          <FloppyDisk size={20} weight="duotone" className="mr-1" />
          <span className="text-xs md:text-sm">Backup</span>
        </Button>
      </div>

      {activeTab === 'post' && (
        <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PaperPlaneTilt size={28} weight="duotone" className="text-accent" />
                Multi-Platform Social Poster
              </CardTitle>
              <CardDescription>
                Post to all your connected platforms at once - use emoji shortcuts like 🤑 to auto-post
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {connectedCount} Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.isArray(platforms) && platforms.map((platform) => {
              const PlatformIcon = platform.icon
              return (
                <Card
                  key={platform.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    platform.connected ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <PlatformIcon
                      size={32}
                      weight={platform.connected ? 'fill' : 'regular'}
                      style={{ color: platform.connected ? platform.color : 'currentColor' }}
                    />
                    <span className="text-sm font-medium text-center">{platform.name}</span>
                    {platform.connected && (
                      <Check size={16} weight="bold" className="text-accent" />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="post-content" className="text-base font-semibold">
                What's on your mind?
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="include-context"
                  checked={includeContext}
                  onCheckedChange={setIncludeContext}
                />
                <Label htmlFor="include-context" className="text-sm">
                  Include conversation context 🧲🪐
                </Label>
              </div>
            </div>

            <Textarea
              id="post-content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Type your post here... Use 🤑 to auto-post or 🧲🪐 to include recent conversation context"
              className="min-h-[120px] text-base"
              disabled={isPosting}
            />

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{postContent.length} characters</span>
                {postContent.length > 280 && (
                  <Badge variant="destructive">Over Twitter limit</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Image size={16} className="mr-2" />
                  Add Media
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduler(!showScheduler)}
                >
                  <Clock size={16} className="mr-2" />
                  Schedule
                </Button>
              </div>
            </div>

            {showScheduler && (
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border bg-background"
                />
                <Button variant="secondary" onClick={handleSchedulePost}>
                  Schedule Post
                </Button>
              </div>
            )}

            {isPosting && (
              <div className="space-y-2">
                <Progress value={postingProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Posting to your platforms...
                </p>
              </div>
            )}

            <Button
              onClick={() => handlePost()}
              disabled={!postContent.trim() || connectedCount === 0 || isPosting}
              className="w-full text-lg py-6 bg-gradient-to-r from-accent to-secondary hover:opacity-90"
              size="lg"
            >
              <PaperPlaneTilt size={24} weight="fill" className="mr-2" />
              Post to {connectedCount} Platform{connectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChatCircleText size={24} weight="duotone" className="text-secondary" />
            Post History
          </CardTitle>
          <CardDescription>Your recent posts across all platforms</CardDescription>
        </CardHeader>
        <CardContent>
          {!Array.isArray(postHistory) || postHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ChatCircleText size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
              <p>No posts yet. Start sharing your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postHistory.slice(0, 10).map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{post.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          {post.includeContext && (
                            <Badge variant="outline" className="text-xs">
                              With Context 🧲
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(post.timestamp).toLocaleDateString()} {new Date(post.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-lg">Emoji Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-2xl mr-2">🤑</span>
              <span className="font-medium">Auto-post</span>
            </div>
            <div>
              <span className="text-2xl mr-2">🧲🪐</span>
              <span className="font-medium">Add context</span>
            </div>
            <div>
              <span className="text-2xl mr-2">📤</span>
              <span className="font-medium">Quick send</span>
            </div>
            <div>
              <span className="text-2xl mr-2">🚀</span>
              <span className="font-medium">Boost post</span>
            </div>
            <div>
              <span className="text-2xl mr-2">📢</span>
              <span className="font-medium">Announce</span>
            </div>
            <div>
              <span className="text-2xl mr-2">💬</span>
              <span className="font-medium">Chat mode</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
      )}

      {activeTab === 'templates' && (
        <TemplateLibrary onUseTemplate={handleUseTemplate} />
      )}

      {activeTab === 'bulk' && (
        <BulkUploader 
          platforms={connectedPlatformNames}
          onScheduleBulk={(posts) => {
            toast.success(`Scheduled ${posts.length} posts! Check the Calendar tab.`)
            setActiveTab('calendar')
          }}
        />
      )}

      {activeTab === 'csv-import' && (
        <BulkScheduleImporter />
      )}

      {activeTab === 'calendar' && (
        <ContentCalendar />
      )}

      {activeTab === 'ai' && (
        <BestTimeRecommender onScheduleWithAI={handleScheduleWithAI} />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {activeTab === 'backup' && (
        <AutoBackupScheduler />
      )}
    </div>
  )
}
