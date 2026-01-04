import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle, Warning, Wrench, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface HealthIssue {
  id: string
  type: 'text-overflow' | 'broken-button' | 'layout-shift' | 'script-error' | 'performance'
  severity: 'low' | 'medium' | 'high'
  element: string
  description: string
  fixable: boolean
  timestamp: number
}

export function PageHealthMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [issues, setIssues] = useState<HealthIssue[]>([])
  const [fixedCount, setFixedCount] = useState(0)

  useEffect(() => {
    if (!isMonitoring) return

    const checkInterval = setInterval(() => {
      performHealthCheck()
    }, 5000)

    const performHealthCheck = () => {
      const foundIssues: HealthIssue[] = []

      document.querySelectorAll('button, a, input, select, textarea').forEach((el, idx) => {
        const element = el as HTMLElement
        
        if (element.offsetWidth === 0 || element.offsetHeight === 0) {
          foundIssues.push({
            id: `broken-${idx}-${Date.now()}`,
            type: 'broken-button',
            severity: 'high',
            element: element.tagName + (element.id ? `#${element.id}` : ''),
            description: `Interactive element is not visible or has zero dimensions`,
            fixable: true,
            timestamp: Date.now()
          })
        }

        const rect = element.getBoundingClientRect()
        const parent = element.parentElement
        if (parent) {
          const parentRect = parent.getBoundingClientRect()
          if (rect.right > parentRect.right + 10 || rect.bottom > parentRect.bottom + 10) {
            foundIssues.push({
              id: `overflow-${idx}-${Date.now()}`,
              type: 'text-overflow',
              severity: 'medium',
              element: element.tagName + (element.id ? `#${element.id}` : ''),
              description: `Element overflows its container`,
              fixable: true,
              timestamp: Date.now()
            })
          }
        }
      })

      document.querySelectorAll('[class*="text-"], [class*="font-"]').forEach((el, idx) => {
        const element = el as HTMLElement
        if (element.scrollWidth > element.clientWidth + 5) {
          foundIssues.push({
            id: `text-${idx}-${Date.now()}`,
            type: 'text-overflow',
            severity: 'low',
            element: element.tagName,
            description: `Text is being cut off or overflowing`,
            fixable: true,
            timestamp: Date.now()
          })
        }
      })

      if (foundIssues.length > 0 && foundIssues.length !== issues.length) {
        setIssues(foundIssues.slice(0, 10))
      } else if (foundIssues.length === 0 && issues.length > 0) {
        setIssues([])
      }
    }

    performHealthCheck()

    return () => clearInterval(checkInterval)
  }, [isMonitoring, issues.length])

  const autoFixIssue = (issue: HealthIssue) => {
    try {
      const elements = document.querySelectorAll(issue.element)
      elements.forEach(el => {
        const element = el as HTMLElement
        
        switch (issue.type) {
          case 'text-overflow':
            element.style.overflow = 'hidden'
            element.style.textOverflow = 'ellipsis'
            element.style.whiteSpace = 'nowrap'
            break
          case 'broken-button':
            element.style.display = 'inline-flex'
            element.style.minWidth = '40px'
            element.style.minHeight = '40px'
            break
          case 'layout-shift':
            element.style.maxWidth = '100%'
            element.style.boxSizing = 'border-box'
            break
        }
      })

      setIssues(prev => prev.filter(i => i.id !== issue.id))
      setFixedCount(prev => prev + 1)
      toast.success('Issue fixed automatically', {
        description: issue.description
      })
    } catch (error) {
      toast.error('Could not auto-fix issue')
    }
  }

  const fixAllIssues = () => {
    issues.filter(i => i.fixable).forEach(issue => {
      autoFixIssue(issue)
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={24} weight="duotone" className="text-primary" />
            <div>
              <CardTitle>Page Health Monitor</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Continuously scanning for design issues and auto-fixing problems
              </p>
            </div>
          </div>
          <Button
            variant={isMonitoring ? 'default' : 'outline'}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} weight="fill" className="text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{fixedCount}</p>
                <p className="text-xs text-green-600">Issues Fixed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2">
              <Warning size={20} weight="fill" className="text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-700">{issues.length}</p>
                <p className="text-xs text-yellow-600">Active Issues</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2">
              <Eye size={20} weight="fill" className="text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{isMonitoring ? 'Active' : 'Paused'}</p>
                <p className="text-xs text-blue-600">Monitor Status</p>
              </div>
            </div>
          </Card>
        </div>

        {issues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Detected Issues</h3>
              <Button size="sm" onClick={fixAllIssues}>
                <Wrench size={16} className="mr-2" />
                Fix All
              </Button>
            </div>

            <ScrollArea className="h-[300px] rounded-md border p-4">
              <AnimatePresence>
                {issues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="mb-3 p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {issue.element}
                          </span>
                        </div>
                        <p className="text-sm">{issue.description}</p>
                      </div>
                      {issue.fixable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => autoFixIssue(issue)}
                        >
                          <Wrench size={16} />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </div>
        )}

        {issues.length === 0 && (
          <Card className="p-8 bg-green-50 border-green-200">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <CheckCircle size={48} weight="duotone" className="text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">All Systems Healthy</h3>
                <p className="text-sm text-green-700">
                  No design or layout issues detected
                </p>
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
