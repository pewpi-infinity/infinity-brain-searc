import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Image as ImageIcon, 
  FileText, 
  Link as LinkIcon, 
  Trash,
  Plus,
  DownloadSimple
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export interface MediaAttachment {
  id: string
  type: 'image' | 'file' | 'link' | 'text'
  name: string
  content: string
  description?: string
  timestamp: number
}

interface TokenMediaAttachmentProps {
  attachments: MediaAttachment[]
  onAttachmentsChange: (attachments: MediaAttachment[]) => void
  readonly?: boolean
}

export function TokenMediaAttachment({ attachments, onAttachmentsChange, readonly = false }: TokenMediaAttachmentProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAttachment, setNewAttachment] = useState<Partial<MediaAttachment>>({
    type: 'text',
    name: '',
    content: '',
    description: ''
  })

  const handleAddAttachment = () => {
    if (!newAttachment.name || !newAttachment.content) {
      toast.error('Please provide a name and content')
      return
    }

    const attachment: MediaAttachment = {
      id: `attach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: newAttachment.type as 'image' | 'file' | 'link' | 'text',
      name: newAttachment.name,
      content: newAttachment.content,
      description: newAttachment.description,
      timestamp: Date.now()
    }

    onAttachmentsChange([...attachments, attachment])
    setNewAttachment({ type: 'text', name: '', content: '', description: '' })
    setShowAddForm(false)
    toast.success('Attachment added successfully')
  }

  const handleRemoveAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id))
    toast.success('Attachment removed')
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} weight="duotone" />
      case 'file':
        return <FileText size={20} weight="duotone" />
      case 'link':
        return <LinkIcon size={20} weight="duotone" />
      default:
        return <FileText size={20} weight="duotone" />
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Media & Attachments</h3>
        {!readonly && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} weight="bold" className="mr-1" />
            Add
          </Button>
        )}
      </div>

      {showAddForm && !readonly && (
        <Card className="p-4 mb-4 bg-muted/50">
          <div className="space-y-3">
            <div>
              <Label htmlFor="attachment-type">Type</Label>
              <select
                id="attachment-type"
                className="w-full p-2 rounded-md border bg-background"
                value={newAttachment.type}
                onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value as any })}
              >
                <option value="text">Text/Research</option>
                <option value="image">Image URL</option>
                <option value="file">File URL</option>
                <option value="link">External Link</option>
              </select>
            </div>

            <div>
              <Label htmlFor="attachment-name">Name/Title</Label>
              <Input
                id="attachment-name"
                placeholder="e.g., Silver Coin Photo, Research Paper, Certificate"
                value={newAttachment.name}
                onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="attachment-content">
                {newAttachment.type === 'text' ? 'Content' : 'URL'}
              </Label>
              {newAttachment.type === 'text' ? (
                <Textarea
                  id="attachment-content"
                  placeholder="Enter your research, notes, or description..."
                  value={newAttachment.content}
                  onChange={(e) => setNewAttachment({ ...newAttachment, content: e.target.value })}
                  rows={4}
                />
              ) : (
                <Input
                  id="attachment-content"
                  placeholder="https://..."
                  value={newAttachment.content}
                  onChange={(e) => setNewAttachment({ ...newAttachment, content: e.target.value })}
                />
              )}
            </div>

            <div>
              <Label htmlFor="attachment-description">Description (Optional)</Label>
              <Textarea
                id="attachment-description"
                placeholder="Additional details..."
                value={newAttachment.description}
                onChange={(e) => setNewAttachment({ ...newAttachment, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddAttachment} className="flex-1">
                Add Attachment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewAttachment({ type: 'text', name: '', content: '', description: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {attachments.length > 0 ? (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getIconForType(attachment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{attachment.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {attachment.type}
                      </Badge>
                    </div>
                    
                    {attachment.type === 'text' ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {attachment.content}
                      </p>
                    ) : (
                      <a 
                        href={attachment.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline truncate block"
                      >
                        {attachment.content}
                      </a>
                    )}
                    
                    {attachment.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {attachment.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(attachment.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    {attachment.type !== 'text' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(attachment.content, '_blank')}
                      >
                        <DownloadSimple size={16} />
                      </Button>
                    )}
                    {!readonly && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <FileText size={32} weight="duotone" className="mx-auto mb-2 opacity-50" />
          <p>No attachments yet</p>
          <p className="text-xs mt-1">Add images, files, research, or links to this token</p>
        </div>
      )}
    </Card>
  )
}
