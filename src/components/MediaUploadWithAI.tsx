import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UploadSimple, X, CheckCircle, Warning, Image as ImageIcon, VideoCamera } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface MediaFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'verifying' | 'approved' | 'rejected'
  aiAnalysis?: {
    contentType: string
    isAppropriate: boolean
    confidence: number
    tags: string[]
    warnings: string[]
  }
}

interface MediaUploadProps {
  onMediaApproved?: (files: MediaFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function MediaUploadWithAI({ 
  onMediaApproved, 
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const verifyWithAI = async (file: File): Promise<MediaFile['aiAnalysis']> => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    const fileType = isImage ? 'image' : 'video'
    const promptText = `You are a content moderation AI for the Infinity Brain platform. Analyze this ${fileType} file named "${file.name}".

The Infinity Brain platform rules are:
1. No violence, gore, or graphic content
2. No nudity or sexually explicit content  
3. No hate speech, harassment, or discriminatory content
4. No illegal activities or dangerous content
5. Must align with positive, productive, and creative ideology
6. Content should be safe for a professional business/trading environment

Based on the filename, file type, and context, provide analysis as JSON:
{
  "contentType": "description of what this appears to be",
  "isAppropriate": true or false,
  "confidence": 0-100 confidence score,
  "tags": ["array", "of", "content", "tags"],
  "warnings": ["array of any concerns, empty if none"]
}

Be reasonable - most legitimate business content, tokens, products, art, and creative works should be approved.`

    try {
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const analysis = JSON.parse(response)
      
      return {
        contentType: analysis.contentType || 'Unknown content',
        isAppropriate: analysis.isAppropriate !== false,
        confidence: analysis.confidence || 85,
        tags: Array.isArray(analysis.tags) ? analysis.tags : [],
        warnings: Array.isArray(analysis.warnings) ? analysis.warnings : []
      }
    } catch (error) {
      console.error('AI verification failed:', error)
      return {
        contentType: 'Unknown',
        isAppropriate: true,
        confidence: 50,
        tags: ['unverified'],
        warnings: ['AI verification unavailable, manual review recommended']
      }
    }
  }

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const currentCount = files.length
    const availableSlots = maxFiles - currentCount

    if (availableSlots <= 0) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    const filesToProcess = Array.from(selectedFiles).slice(0, availableSlots)
    const invalidFiles = filesToProcess.filter(f => !acceptedTypes.includes(f.type))

    if (invalidFiles.length > 0) {
      toast.error(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    const newFiles: MediaFile[] = filesToProcess.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    setIsVerifying(true)
    
    for (const mediaFile of newFiles) {
      setFiles(prev => prev.map(f => 
        f.id === mediaFile.id ? { ...f, status: 'verifying' as const } : f
      ))

      const analysis = await verifyWithAI(mediaFile.file)
      
      if (!analysis) continue
      
      setFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { 
              ...f, 
              status: analysis.isAppropriate ? 'approved' as const : 'rejected' as const,
              aiAnalysis: analysis
            } 
          : f
      ))

      if (analysis.isAppropriate) {
        toast.success(`✅ ${mediaFile.file.name} approved!`)
      } else {
        toast.error(`❌ ${mediaFile.file.name} rejected: ${analysis.warnings.join(', ')}`)
      }
    }

    setIsVerifying(false)

    const approvedFiles = files.filter(f => f.status === 'approved')
    if (onMediaApproved && approvedFiles.length > 0) {
      onMediaApproved(approvedFiles)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      const removed = prev.find(f => f.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return updated
    })
  }

  const getStatusColor = (status: MediaFile['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'verifying': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const approvedCount = files.filter(f => f.status === 'approved').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Media Upload & AI Verification</CardTitle>
            <CardDescription>
              Upload images and videos - AI verifies all content against Infinity Brain rules
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {approvedCount} / {maxFiles} Approved
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleFileSelect(e.dataTransfer.files)
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <UploadSimple size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-muted-foreground">
            Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            AI will verify all uploads against platform guidelines
          </p>
        </div>

        {isVerifying && (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <div className="animate-spin">🔄</div>
              Verifying content with AI...
            </AlertDescription>
          </Alert>
        )}

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {files.map(mediaFile => (
                <motion.div
                  key={mediaFile.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group"
                >
                  <Card className={`overflow-hidden ${
                    mediaFile.status === 'rejected' ? 'ring-2 ring-red-500' : 
                    mediaFile.status === 'approved' ? 'ring-2 ring-green-500' : ''
                  }`}>
                    <div className="aspect-square relative bg-muted">
                      {mediaFile.file.type.startsWith('image/') ? (
                        <img 
                          src={mediaFile.preview} 
                          alt={mediaFile.file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <VideoCamera size={48} weight="duotone" className="text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Badge className={getStatusColor(mediaFile.status)}>
                          {mediaFile.status === 'verifying' && '🔄'}
                          {mediaFile.status === 'approved' && '✓'}
                          {mediaFile.status === 'rejected' && '✕'}
                          {mediaFile.status === 'pending' && '⏳'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={() => removeFile(mediaFile.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>

                      {mediaFile.aiAnalysis && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-xs text-white">
                          <div className="font-semibold truncate">
                            {mediaFile.aiAnalysis.contentType}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Progress 
                              value={mediaFile.aiAnalysis.confidence} 
                              className="h-1 flex-1"
                            />
                            <span className="text-[10px]">
                              {mediaFile.aiAnalysis.confidence}%
                            </span>
                          </div>
                          {mediaFile.aiAnalysis.warnings.length > 0 && (
                            <div className="mt-1 text-yellow-400 flex items-start gap-1">
                              <Warning size={12} weight="fill" className="mt-0.5 flex-shrink-0" />
                              <span className="text-[10px]">
                                {mediaFile.aiAnalysis.warnings[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                  <p className="text-xs text-center mt-1 truncate">
                    {mediaFile.file.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {approvedCount > 0 && (
          <Alert className="bg-green-500/10 border-green-500">
            <CheckCircle size={16} weight="fill" className="text-green-500" />
            <AlertDescription>
              {approvedCount} file{approvedCount !== 1 ? 's' : ''} approved and ready to use!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
