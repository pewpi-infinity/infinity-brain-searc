import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  List,
  Brain,
  Globe,
  Wrench,
  Coin,
  Robot,
  Gear,
  Sparkle,
  PaintBrush,
  Eye,
  GitBranch,
  Rocket
} from '@phosphor-icons/react'
import { fetchPewpiInfinityRepos, categorizeRepos, type Repository } from '@/lib/githubRepos'

interface NavigationProps {
  onNavigate: (tab: string) => void
  currentTab?: string
}

interface MenuItem {
  name: string
  icon: React.ReactNode
  action: string
  badge?: string
  description?: string
}

interface MenuSection {
  title: string
  icon: React.ReactNode
  items: MenuItem[]
}

export function Navigation({ onNavigate, currentTab }: NavigationProps) {
  const [brainRepos, setBrainRepos] = useState<Repository[]>([])
  const [websiteRepos, setWebsiteRepos] = useState<Repository[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadRepos()
  }, [])

  const loadRepos = async () => {
    const repos = await fetchPewpiInfinityRepos()
    const categorized = categorizeRepos(repos)
    setBrainRepos(categorized.brain)
    setWebsiteRepos(categorized.websites)
  }

  const handleItemClick = (action: string) => {
    onNavigate(action)
    setIsOpen(false)
  }

  const menuStructure: MenuSection[] = [
    {
      title: '🧠 Brain Repos',
      icon: <Brain size={20} weight="duotone" />,
      items: brainRepos.slice(0, 5).map(repo => ({
        name: repo.name,
        icon: <GitBranch size={18} weight="duotone" />,
        action: 'repo-hub',
        description: repo.description || undefined
      }))
    },
    {
      title: '🌐 My Websites',
      icon: <Globe size={20} weight="duotone" />,
      items: [
        ...websiteRepos.slice(0, 3).map(repo => ({
          name: repo.name,
          icon: <Globe size={18} weight="duotone" />,
          action: 'repo-hub',
          badge: 'Live'
        })),
        {
          name: 'View All Repos',
          icon: <Eye size={18} weight="duotone" />,
          action: 'repo-hub'
        }
      ]
    },
    {
      title: '🛠️ Tools',
      icon: <Wrench size={20} weight="duotone" />,
      items: [
        {
          name: 'Visual Editor',
          icon: <PaintBrush size={18} weight="duotone" />,
          action: 'visual-editor',
          description: 'AI-powered website editor'
        },
        {
          name: 'Repo Preview',
          icon: <Eye size={18} weight="duotone" />,
          action: 'repo-hub',
          description: 'Browse and preview repos'
        },
        {
          name: 'Token Minter',
          icon: <Coin size={18} weight="duotone" />,
          action: 'create',
          description: 'Create new tokens'
        },
        {
          name: 'Deploy Hub',
          icon: <Rocket size={18} weight="duotone" />,
          action: 'build',
          description: 'Deploy your sites'
        }
      ]
    },
    {
      title: '💰 Token Economy',
      icon: <Coin size={20} weight="duotone" />,
      items: [
        {
          name: 'Create Tokens',
          icon: <Coin size={18} weight="duotone" />,
          action: 'create'
        },
        {
          name: 'Marketplace',
          icon: <Sparkle size={18} weight="duotone" />,
          action: 'trade'
        },
        {
          name: 'Auctions',
          icon: <Coin size={18} weight="duotone" />,
          action: 'trade'
        },
        {
          name: 'Analytics',
          icon: <Sparkle size={18} weight="duotone" />,
          action: 'auction-analytics'
        }
      ]
    },
    {
      title: '🤖 AI Features',
      icon: <Robot size={20} weight="duotone" />,
      items: [
        {
          name: 'GPT Chat',
          icon: <Robot size={18} weight="duotone" />,
          action: 'explore',
          badge: 'GPT-4'
        },
        {
          name: 'Claude',
          icon: <Robot size={18} weight="duotone" />,
          action: 'explore',
          badge: 'Claude'
        },
        {
          name: 'Gemini',
          icon: <Robot size={18} weight="duotone" />,
          action: 'explore',
          badge: 'Gemini'
        },
        {
          name: 'Visual Editor',
          icon: <PaintBrush size={18} weight="duotone" />,
          action: 'visual-editor'
        }
      ]
    },
    {
      title: '⚙️ Settings',
      icon: <Gear size={20} weight="duotone" />,
      items: [
        {
          name: 'Theme Customizer',
          icon: <Sparkle size={18} weight="duotone" />,
          action: 'theme'
        },
        {
          name: 'My Dashboard',
          icon: <Sparkle size={18} weight="duotone" />,
          action: 'user'
        },
        {
          name: 'Admin Tools',
          icon: <Gear size={18} weight="duotone" />,
          action: 'admin'
        }
      ]
    }
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card/90 backdrop-blur-md hover:bg-accent/20 border-2 shadow-lg transition-all hover:scale-105"
        >
          <List size={24} weight="bold" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-card/98 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Sparkle size={28} weight="duotone" className="text-accent animate-pulse" />
            Infinity Brain
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          <div className="space-y-6">
            {menuStructure.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.length > 0 ? (
                    section.items.map((item, itemIdx) => (
                      <Button
                        key={itemIdx}
                        variant={currentTab === item.action ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2 h-auto py-2 px-3"
                        onClick={() => handleItemClick(item.action)}
                      >
                        <div className="flex-shrink-0">{item.icon}</div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground px-3 py-2">
                      No items available
                    </div>
                  )}
                </div>
                {sectionIdx < menuStructure.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card/95 backdrop-blur">
          <div className="text-xs text-center text-muted-foreground">
            <div className="font-semibold mb-1">Infinity Brain v2.0</div>
            <div>Professional AI Ecosystem</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
