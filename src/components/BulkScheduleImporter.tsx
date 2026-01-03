import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, FileText, CheckCircle, XCircle, Calendar, Hash, Clock, MapPin, Download } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledDate: string
  scheduledTime: string
  hashtags: string[]
  location?: string
  status: 'pending' | 'scheduled' | 'failed'
  error?: string
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  posts: ScheduledPost[]
}

export function BulkScheduleImporter() {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [scheduledPosts, setScheduledPosts] = useKV<ScheduledPost[]>('bulk-scheduled-posts', [])

  const downloadTemplate = () => {
    const template = `content,platforms,date,time,hashtags,location
"Check out our new product launch!","twitter,facebook,linkedin","2024-12-25","10:00","#product #launch #tech",""
"Happy holidays from our team!","twitter,facebook,instagram","2024-12-25","14:30","#holidays #team #celebration","New York, NY"
"Join our webinar next week","linkedin,twitter","2024-12-30","09:00","#webinar #learning #tech",""
"Weekend vibes 🌟","instagram,facebook","2024-12-28","12:00","#weekend #vibes",""
"New blog post is live!","twitter,linkedin,facebook","2024-12-26","08:00","#blog #content #writing",""`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-schedule-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Template downloaded successfully')
  }

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentField.trim())
        if (currentRow.some(field => field !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
      } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
        currentRow.push(currentField.trim())
        if (currentRow.some(field => field !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
        i++
      } else {
        currentField += char
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim())
      if (currentRow.some(field => field !== '')) {
        rows.push(currentRow)
      }
    }

    return rows
  }

  const processCSV = async (file: File) => {
    setIsImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length === 0) {
        throw new Error('CSV file is empty')
      }

      const headers = rows[0].map(h => h.toLowerCase().trim())
      const requiredHeaders = ['content', 'platforms', 'date', 'time']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      const contentIdx = headers.indexOf('content')
      const platformsIdx = headers.indexOf('platforms')
      const dateIdx = headers.indexOf('date')
      const timeIdx = headers.indexOf('time')
      const hashtagsIdx = headers.indexOf('hashtags')
      const locationIdx = headers.indexOf('location')

      const posts: ScheduledPost[] = []
      let successful = 0
      let failed = 0

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        
        if (row.length < requiredHeaders.length) {
          continue
        }

        try {
          const content = row[contentIdx]?.trim()
          if (!content) {
            throw new Error('Content is required')
          }

          const platformsStr = row[platformsIdx]?.trim()
          if (!platformsStr) {
            throw new Error('Platforms are required')
          }
          const platforms = platformsStr.split(/[,|;]/).map(p => p.trim()).filter(p => p)

          const date = row[dateIdx]?.trim()
          if (!date) {
            throw new Error('Date is required')
          }

          const time = row[timeIdx]?.trim()
          if (!time) {
            throw new Error('Time is required')
          }

          const hashtagsStr = row[hashtagsIdx]?.trim() || ''
          const hashtags = hashtagsStr
            .split(/[\s,]/)
            .map(h => h.trim())
            .filter(h => h && h.startsWith('#'))

          const location = locationIdx >= 0 ? row[locationIdx]?.trim() : undefined

          const post: ScheduledPost = {
            id: `post-${Date.now()}-${i}`,
            content,
            platforms,
            scheduledDate: date,
            scheduledTime: time,
            hashtags,
            location,
            status: 'scheduled'
          }

          posts.push(post)
          successful++
        } catch (error) {
          failed++
          const errorPost: ScheduledPost = {
            id: `post-${Date.now()}-${i}-failed`,
            content: row[contentIdx] || `Row ${i + 1}`,
            platforms: [],
            scheduledDate: '',
            scheduledTime: '',
            hashtags: [],
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          posts.push(errorPost)
        }
      }

      const result: ImportResult = {
        total: rows.length - 1,
        successful,
        failed,
        posts
      }

      setImportResult(result)
      
      const validPosts = posts.filter(p => p.status === 'scheduled')
      setScheduledPosts(current => [...(current || []), ...validPosts])

      if (successful > 0) {
        toast.success(`Successfully imported ${successful} post${successful !== 1 ? 's' : ''}`)
      }
      if (failed > 0) {
        toast.error(`Failed to import ${failed} post${failed !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process CSV file')
      console.error('CSV processing error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(f => f.name.endsWith('.csv') || f.type === 'text/csv')

    if (csvFile) {
      processCSV(csvFile)
    } else {
      toast.error('Please upload a CSV file')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      processCSV(files[0])
    }
  }

  const clearResults = () => {
    setImportResult(null)
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload size={24} weight="duotone" className="text-accent" />
                Bulk Schedule Import
              </CardTitle>
              <CardDescription>
                Upload CSV files to schedule multiple posts at once
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download size={20} weight="duotone" />
              Download Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive
                ? 'border-accent bg-accent/10 scale-105'
                : 'border-border hover:border-accent/50 hover:bg-accent/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="csv-upload"
              accept=".csv,text/csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={isImporting}
            />
            
            {isImporting ? (
              <div className="space-y-4">
                <FileText size={64} weight="duotone" className="mx-auto text-accent animate-pulse" />
                <div>
                  <p className="text-lg font-semibold mb-2">Processing CSV file...</p>
                  <Progress value={undefined} className="w-64 mx-auto" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText size={64} weight="duotone" className="mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold mb-2">
                    Drop your CSV file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse your files
                  </p>
                </div>
                <label htmlFor="csv-upload">
                  <Button asChild variant="default" className="cursor-pointer">
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          <Alert>
            <AlertDescription>
              <strong>CSV Format:</strong> Your file should include columns for content, platforms (comma-separated), date (YYYY-MM-DD), time (HH:MM), hashtags (space or comma-separated), and optionally location.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {importResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Import Results</CardTitle>
              <Button variant="ghost" onClick={clearResults}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{importResult.total}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
              <Card className="bg-green-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{importResult.successful}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-red-600">{importResult.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Progress 
                value={(importResult.successful / importResult.total) * 100} 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground text-center mt-2">
                {Math.round((importResult.successful / importResult.total) * 100)}% success rate
              </p>
            </div>

            <Separator />

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {importResult.posts.map((post, idx) => (
                  <Card 
                    key={post.id}
                    className={post.status === 'failed' ? 'border-destructive' : ''}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {post.status === 'scheduled' ? (
                          <CheckCircle size={24} weight="duotone" className="text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle size={24} weight="duotone" className="text-red-600 flex-shrink-0 mt-1" />
                        )}
                        
                        <div className="flex-1 space-y-2">
                          <p className="font-medium line-clamp-2">{post.content}</p>
                          
                          {post.status === 'scheduled' && (
                            <div className="flex flex-wrap gap-2 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar size={16} />
                                {post.scheduledDate}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock size={16} />
                                {post.scheduledTime}
                              </div>
                              {post.location && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin size={16} />
                                  {post.location}
                                </div>
                              )}
                            </div>
                          )}

                          {post.platforms.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.platforms.map(platform => (
                                <Badge key={platform} variant="secondary">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-accent">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {post.error && (
                            <Alert variant="destructive">
                              <AlertDescription className="text-sm">
                                {post.error}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {scheduledPosts && scheduledPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Scheduled Posts ({scheduledPosts.length})</span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setScheduledPosts([])}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {scheduledPosts.map(post => (
                  <div 
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{post.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {post.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.scheduledTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash size={14} />
                          {post.platforms.length} platform{post.platforms.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{post.status}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
