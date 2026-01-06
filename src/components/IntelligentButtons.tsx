import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface UserAction {
  timestamp: number
  action: string
  tab: string
  context: string
}

interface ButtonSuggestion {
  id: string
  label: string
  action: () => void
  priority: number
  reason: string
}

export function useIntelligentButtons(currentTab: string) {
  const [userActions, setUserActions] = useKV<UserAction[]>('user-action-history', [])
  const [suggestions, setSuggestions] = useState<ButtonSuggestion[]>([])

  const trackAction = async (action: string, context: string) => {
    const newAction: UserAction = {
      timestamp: Date.now(),
      action,
      tab: currentTab,
      context
    }
    
    await setUserActions((prev) => [...(prev || []), newAction].slice(-100))
  }

  useEffect(() => {
    const analyzeBehavior = async () => {
      if (!userActions || userActions.length < 3) return

      const recentActions = userActions.slice(-10)
      const tabCounts: Record<string, number> = {}
      const actionCounts: Record<string, number> = {}
      
      recentActions.forEach(action => {
        tabCounts[action.tab] = (tabCounts[action.tab] || 0) + 1
        actionCounts[action.action] = (actionCounts[action.action] || 0) + 1
      })

      const mostUsedTab = Object.entries(tabCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      const mostUsedAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

      const newSuggestions: ButtonSuggestion[] = []

      if (mostUsedTab && mostUsedTab !== currentTab) {
        newSuggestions.push({
          id: 'goto-favorite',
          label: `Go to ${mostUsedTab}`,
          action: () => {},
          priority: 10,
          reason: `You use ${mostUsedTab} frequently`
        })
      }

      if (actionCounts['incomplete_project'] && actionCounts['incomplete_project'] > 2) {
        newSuggestions.push({
          id: 'complete-projects',
          label: 'Review Incomplete Projects',
          action: () => {},
          priority: 9,
          reason: 'Multiple incomplete projects detected'
        })
      }

      if (currentTab === 'quantum' && actionCounts['pause'] && actionCounts['pause'] > actionCounts['play']) {
        newSuggestions.push({
          id: 'music-break',
          label: 'Take a Music Break',
          action: () => {},
          priority: 7,
          reason: 'You pause music frequently - maybe change tracks?'
        })
      }

      setSuggestions(newSuggestions.sort((a, b) => b.priority - a.priority).slice(0, 3))
    }

    analyzeBehavior()
  }, [userActions, currentTab])

  return { trackAction, suggestions }
}

interface SmartButtonBarProps {
  currentTab: string
  onTabChange: (tab: string) => void
}

export function SmartButtonBar({ currentTab, onTabChange }: SmartButtonBarProps) {
  const { suggestions, trackAction } = useIntelligentButtons(currentTab)

  if (suggestions.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="bg-gradient-to-r from-primary to-accent text-white p-4 rounded-2xl shadow-2xl backdrop-blur border border-white/20"
        >
          <p className="text-xs opacity-90 mb-2">💡 Smart Suggestion</p>
          <p className="text-sm font-medium mb-3">{suggestion.reason}</p>
          <Button
            onClick={() => {
              trackAction(`smart-suggestion-${suggestion.id}`, suggestion.reason)
              suggestion.action()
              toast.success('Smart suggestion applied!')
            }}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            {suggestion.label}
          </Button>
        </div>
      ))}
    </div>
  )
}
