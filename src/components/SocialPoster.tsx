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
  TiktokLogo,
  Check,
  PaperPlaneTilt,
  ChatCircleText,
  Clock,
  Image as ImageIcon
} from '@phosphor-icons/react'
import { toast } from 'sonner'

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
  const [platforms, setPlatforms] = useKV<PlatformConnection[]>('social-platforms', [
    { id: 'twitter', name: 'Twitter/X', icon: TwitterLogo, connected: false, color: 'oklch(0.55 0.15 220)' },
    { id: 'facebook', name: 'Facebook', icon: FacebookLogo, connected: false, color: 'oklch(0.50 0.20 250)' },
    { id: 'linkedin', name: 'LinkedIn', icon: LinkedinLogo, connected: false, color: 'oklch(0.45 0.15 240)' },
    { id: 'instagram', name: 'Instagram', icon: InstagramLogo, connected: false, color: 'oklch(0.60 0.25 320)' },
    { id: 'tiktok', name: 'TikTok', icon: TiktokLogo, connected: false, color: 'oklch(0.40 0.10 280)' }
  ])
  const [postHistory, setPostHistory] = useKV<PostHistory[]>('post-history', [])
  const [conversationHistory, setConversationHistory] = useKV<ConversationMessage[]>('conversation-history', [])
  const [includeContext, setIncludeContext] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postingProgress, setPostingProgress] = useState(0)
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')

  const detectPostEmoji = (text: string) => {
    const postEmojis = ['🤑', '📤', '🚀', '📢', '💬']
    return postEmojis.some(emoji => text.includes(emoji))
  }

  const detectContextEmoji = (text: string) => {
    return text.includes('🧲') || text.includes('🪐')
  }

  useEffect(() => {
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
    setPlatforms((currentPlatforms = []) =>
      currentPlatforms.map(p =>
        p.id === platformId ? { ...p, connected: !p.connected } : p
      )
    )
  }

  const getRecentContext = () => {
    const recent = (conversationHistory || []).slice(-3)
    return recent.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
  }

  const enhanceWithAI = async (content: string) => {
    const context = includeContext ? getRecentContext() : ''
    const contextSection = context ? `Recent conversation context:\n${context}\n\n` : ''
    const promptText = `You are a social media expert. Enhance this post for maximum engagement while keeping it authentic and concise (max 280 chars for Twitter compatibility).

${contextSection}Original post: ${content}

Return ONLY the enhanced post text, no explanations.`
    const prompt = window.spark.llmPrompt([promptText], '')
    
    try {
      const enhanced = await window.spark.llm(prompt, 'gpt-4o-mini', false)
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

    const connectedPlatforms = (platforms || []).filter(p => p.connected)
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

  const connectedCount = (platforms || []).filter(p => p.connected).length

  return (
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
            {(platforms || []).map((platform) => (
              <Card
                key={platform.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  platform.connected ? 'ring-2 ring-accent' : ''
                }`}
                onClick={() => togglePlatform(platform.id)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <platform.icon
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
            ))}
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
                  <ImageIcon size={16} className="mr-2" />
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
                <Button variant="secondary">Schedule Post</Button>
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
          {(postHistory || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ChatCircleText size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
              <p>No posts yet. Start sharing your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(postHistory || []).slice(0, 10).map((post) => (
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
  )
}
