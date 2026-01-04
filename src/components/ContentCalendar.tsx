import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { useKV } from '@github/spark/hooks'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Trash,
  CheckCircle,
  CalendarBlank,
  Sparkle,
  DownloadSimple,
  FileArrowDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledTime: number
  status: 'pending' | 'posted' | 'failed'
  createdAt: number
  postedAt?: number
  aiRecommended?: boolean
}

interface ContentCalendarProps {
  onSchedulePost?: (post: ScheduledPost) => void
}

export function ContentCalendar({ onSchedulePost }: ContentCalendarProps) {
  const [scheduledPosts, setScheduledPosts] = useKV<ScheduledPost[]>('scheduled-posts', [])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const deleteScheduledPost = (postId: string) => {
    setScheduledPosts((current = []) => current.filter(p => p.id !== postId))
    toast.success('Scheduled post deleted')
  }

  const getPostsForDate = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    return (scheduledPosts || []).filter(post => {
      const postDate = new Date(post.scheduledTime)
      return postDate >= dayStart && postDate <= dayEnd
    }).sort((a, b) => a.scheduledTime - b.scheduledTime)
  }

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : []

  const getDatesWithPosts = () => {
    return (scheduledPosts || []).map(post => new Date(post.scheduledTime))
  }

  const upcomingPosts = (scheduledPosts || [])
    .filter(post => post.status === 'pending' && post.scheduledTime > Date.now())
    .sort((a, b) => a.scheduledTime - b.scheduledTime)
    .slice(0, 5)

  const exportToCSV = () => {
    const posts = scheduledPosts || []
    
    if (posts.length === 0) {
      toast.error('No scheduled posts to export')
      return
    }

    const headers = ['ID', 'Content', 'Platforms', 'Scheduled Date', 'Scheduled Time', 'Status', 'Created Date', 'Posted Date', 'AI Recommended']
    
    const csvRows = posts.map(post => {
      const scheduledDate = new Date(post.scheduledTime)
      const createdDate = new Date(post.createdAt)
      const postedDate = post.postedAt ? new Date(post.postedAt) : null
      
      return [
        post.id,
        `"${post.content.replace(/"/g, '""')}"`,
        `"${post.platforms.join(', ')}"`,
        scheduledDate.toLocaleDateString(),
        scheduledDate.toLocaleTimeString(),
        post.status,
        createdDate.toISOString(),
        postedDate ? postedDate.toISOString() : '',
        post.aiRecommended ? 'Yes' : 'No'
      ].join(',')
    })

    const csvContent = [headers.join(','), ...csvRows].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `scheduled-posts-backup-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${posts.length} scheduled posts to CSV`)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon size={24} weight="duotone" className="text-accent" />
                Content Calendar
              </CardTitle>
              <CardDescription>
                View and manage your scheduled posts
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={(scheduledPosts || []).length === 0}
              className="gap-2"
            >
              <DownloadSimple size={18} weight="bold" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
          />

          {selectedDate && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <CalendarBlank size={20} weight="duotone" />
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <Badge variant="secondary">
                  {selectedDatePosts.length} {selectedDatePosts.length === 1 ? 'post' : 'posts'}
                </Badge>
              </div>

              {selectedDatePosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No posts scheduled for this day
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedDatePosts.map(post => (
                    <Card key={post.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock size={14} weight="bold" className="text-accent" />
                            <span className="text-sm font-medium">
                              {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {post.aiRecommended && (
                              <Badge variant="outline" className="text-xs">
                                <Sparkle size={12} weight="fill" className="mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {post.platforms.map(platform => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScheduledPost(post.id)}
                          disabled={post.status === 'posted'}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={24} weight="duotone" className="text-secondary" />
              Upcoming Posts
            </CardTitle>
            <CardDescription>
              Next {upcomingPosts.length} scheduled posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarBlank size={48} weight="duotone" className="mx-auto mb-2 opacity-50" />
                <p>No upcoming posts scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPosts.map(post => (
                  <Card key={post.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon size={16} weight="bold" className="text-accent" />
                            <span className="text-sm font-semibold">
                              {new Date(post.scheduledTime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-sm text-muted-foreground">at</span>
                            <Clock size={16} weight="bold" className="text-accent" />
                            <span className="text-sm font-semibold">
                              {new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {post.aiRecommended && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                <Sparkle size={12} weight="fill" className="mr-1" />
                                AI Optimized
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{post.content}</p>
                          <div className="flex flex-wrap gap-1">
                            {post.platforms.map(platform => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => deleteScheduledPost(post.id)}
                        >
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          disabled
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Post Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="text-lg">Calendar Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-accent">
                  {(scheduledPosts || []).filter(p => p.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Posts</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-secondary">
                  {(scheduledPosts || []).filter(p => p.status === 'posted').length}
                </p>
                <p className="text-xs text-muted-foreground">Posted</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {(scheduledPosts || []).filter(p => p.aiRecommended).length}
                </p>
                <p className="text-xs text-muted-foreground">AI Optimized</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-accent">
                  {upcomingPosts.length}
                </p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-accent to-secondary hover:opacity-90"
                onClick={exportToCSV}
                disabled={(scheduledPosts || []).length === 0}
              >
                <FileArrowDown size={20} weight="bold" className="mr-2" />
                Download Full Backup (CSV)
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Export all {(scheduledPosts || []).length} scheduled posts for safekeeping
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
