import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkle,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
  ArrowClockwise,
  Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { parseCommand, type ParsedCommand } from '@/lib/commandParser'
import {
  applyStyles,
  moveElement,
  resizeElement,
  recolorElement,
  removeElement,
  addElement,
  undo,
  redo,
  highlightElement,
  exportChangesAsCSS,
  getEditorState
} from '@/lib/visualEditor'

interface AICommandBarProps {
  onCommandExecute?: (command: ParsedCommand) => void
}

export function AICommandBar({ onCommandExecute }: AICommandBarProps) {
  const [command, setCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastCommand, setLastCommand] = useState<ParsedCommand | null>(null)
  const [processingSteps, setProcessingSteps] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const addProcessingStep = (step: string) => {
    setProcessingSteps(prev => [...prev, step])
  }

  const handleExecute = async () => {
    if (!command.trim()) {
      toast.error('Please enter a command')
      return
    }

    setIsProcessing(true)
    setProcessingSteps([])
    setShowPreview(false)

    try {
      // Step 1: Analyzing
      addProcessingStep('🔍 Analyzing request...')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Parse command
      const result = await parseCommand(command)

      if (!result.success || !result.command) {
        throw new Error(result.error || 'Failed to parse command')
      }

      const parsedCommand = result.command
      setLastCommand(parsedCommand)

      // Step 3: Targeting
      addProcessingStep(`🎯 Targeting: ${parsedCommand.target}`)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 4: Preview changes
      addProcessingStep(
        `✨ Applying: ${Object.entries(parsedCommand.changes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')}`
      )
      setShowPreview(true)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 5: Execute
      let success = false

      switch (parsedCommand.type) {
        case 'move':
          success = moveElement(parsedCommand.target, parsedCommand.changes)
          break
        case 'resize':
          success = resizeElement(parsedCommand.target, parsedCommand.changes)
          break
        case 'recolor':
          success = recolorElement(parsedCommand.target, parsedCommand.changes)
          break
        case 'style':
          success = applyStyles(parsedCommand.target, parsedCommand.changes)
          break
        case 'remove':
          success = removeElement(parsedCommand.target)
          break
        case 'add':
          // For add, we need parent selector and HTML
          // This is simplified - in real implementation, AI would generate HTML
          success = addElement(
            parsedCommand.target,
            `<div>${parsedCommand.changes.content || 'New element'}</div>`
          )
          break
        default:
          throw new Error(`Unsupported command type: ${parsedCommand.type}`)
      }

      if (success) {
        // Highlight the affected elements
        highlightElement(parsedCommand.target)

        addProcessingStep('✅ Complete! (click undo to revert)')
        toast.success(`✓ ${parsedCommand.description}`)
        onCommandExecute?.(parsedCommand)

        // Clear command after success
        setCommand('')
      } else {
        throw new Error('Failed to apply changes')
      }
    } catch (error) {
      addProcessingStep('❌ Failed')
      toast.error(error instanceof Error ? error.message : 'Command failed')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUndo = () => {
    if (undo()) {
      toast.success('Undone')
      addProcessingStep('↶ Undone last change')
    } else {
      toast.error('Nothing to undo')
    }
  }

  const handleRedo = () => {
    if (redo()) {
      toast.success('Redone')
      addProcessingStep('↷ Redone change')
    } else {
      toast.error('Nothing to redo')
    }
  }

  const handleExportCSS = () => {
    const css = exportChangesAsCSS()
    
    // Create download
    const blob = new Blob([css], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'visual-edits.css'
    a.click()
    URL.revokeObjectURL(url)

    toast.success('CSS exported successfully')
  }

  const editorState = getEditorState()

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40">
      <Card className="bg-card/98 backdrop-blur-lg border-2 border-accent/40 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkle size={24} weight="duotone" className="text-accent animate-pulse" />
            AI Command Bar
          </CardTitle>
          <CardDescription className="text-xs">
            Type natural language commands to edit the page in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Command Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isProcessing) {
                    handleExecute()
                  }
                }}
                placeholder='Try: "move login button to top right" or "make background darker"'
                className="pl-10"
                disabled={isProcessing}
              />
            </div>
            <Button
              onClick={handleExecute}
              disabled={isProcessing || !command.trim()}
            >
              {isProcessing ? 'Processing...' : 'Execute'}
            </Button>
          </div>

          {/* Processing Steps */}
          {processingSteps.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              {processingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="text-sm font-mono animate-in fade-in slide-in-from-bottom-2"
                >
                  {step}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={editorState.currentIndex < 0}
              >
                <ArrowCounterClockwise size={16} className="mr-2" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={editorState.currentIndex >= editorState.history.length - 1}
              >
                <ArrowClockwise size={16} className="mr-2" />
                Redo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSS}
                disabled={editorState.history.length === 0}
              >
                <Download size={16} className="mr-2" />
                Export CSS
              </Button>
            </div>

            <Badge variant="secondary">
              {editorState.history.length} change{editorState.history.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Examples */}
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Move button to top right',
                'Make text bigger',
                'Change background to dark',
                'Center all headings'
              ].map(example => (
                <Button
                  key={example}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setCommand(example)}
                  disabled={isProcessing}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
