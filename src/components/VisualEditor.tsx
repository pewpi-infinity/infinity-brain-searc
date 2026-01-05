import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaintBrush, Eye, Code, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { AICommandBar } from './AICommandBar'
import { WebsitePreview } from './WebsitePreview'
import { type Repository } from '@/lib/githubRepos'
import { type ParsedCommand } from '@/lib/commandParser'

interface VisualEditorProps {
  repository?: Repository | null
  mode?: 'standalone' | 'integrated'
}

export function VisualEditor({ repository, mode = 'standalone' }: VisualEditorProps) {
  const [activeView, setActiveView] = useState<'edit' | 'preview' | 'code'>('edit')
  const [commandHistory, setCommandHistory] = useState<ParsedCommand[]>([])

  const handleCommandExecute = (command: ParsedCommand) => {
    setCommandHistory(prev => [...prev, command])
    toast.success('Command executed successfully')
  }

  if (mode === 'integrated') {
    return (
      <div className="space-y-6">
        <AICommandBar onCommandExecute={handleCommandExecute} />
        {repository && <WebsitePreview repository={repository} />}
      </div>
    )
  }

  return (
    <Card className="gradient-border bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2">
          <PaintBrush size={32} weight="duotone" className="text-accent" />
          Visual Editor
        </CardTitle>
        <CardDescription>
          AI-powered visual website editor with real-time updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={val => setActiveView(val as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">
              <Sparkle size={16} className="mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye size={16} className="mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code size={16} className="mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-6">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-6 border-2 border-accent/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkle size={24} weight="duotone" className="text-accent" />
                AI Command Interface
              </h3>
              <p className="text-muted-foreground mb-4">
                Use natural language to edit your website. The AI will understand your intent
                and apply changes in real-time.
              </p>
              <AICommandBar onCommandExecute={handleCommandExecute} />
            </div>

            {/* Command History */}
            {commandHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Recent Commands</h4>
                <div className="space-y-2">
                  {commandHistory.slice(-5).reverse().map((cmd, idx) => (
                    <div
                      key={idx}
                      className="bg-muted/50 rounded-lg p-3 text-sm"
                    >
                      <div className="font-medium">{cmd.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Target: {cmd.target} • Type: {cmd.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {repository ? (
              <WebsitePreview repository={repository} />
            ) : (
              <div className="text-center py-16 bg-muted/50 rounded-lg">
                <Eye size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a repository to preview
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="mt-6">
            <div className="bg-black/90 rounded-lg p-6 font-mono text-sm text-green-400 overflow-x-auto">
              <pre>
                {commandHistory.length > 0
                  ? commandHistory
                      .map(
                        cmd =>
                          `${cmd.target} {\n${Object.entries(cmd.changes)
                            .map(([k, v]) => `  ${k}: ${v};`)
                            .join('\n')}\n}`
                      )
                      .join('\n\n')
                  : '/* No changes yet */'}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-4 pt-6 border-t">
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <Sparkle size={32} className="mx-auto mb-2 text-primary" />
            <h4 className="font-semibold mb-1">AI-Powered</h4>
            <p className="text-xs text-muted-foreground">
              Natural language commands
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
            <Eye size={32} className="mx-auto mb-2 text-secondary" />
            <h4 className="font-semibold mb-1">Real-Time</h4>
            <p className="text-xs text-muted-foreground">
              Instant visual feedback
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg">
            <Code size={32} className="mx-auto mb-2 text-accent" />
            <h4 className="font-semibold mb-1">Export Code</h4>
            <p className="text-xs text-muted-foreground">
              Download CSS changes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
