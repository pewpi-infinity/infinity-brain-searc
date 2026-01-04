import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  Palette,
  Sparkle,
  Check,
  X
} from '@phosphor-icons/react'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { toast } from 'sonner'

interface ThemeConfig {
  id: string
  name: string
  description: string
  background: string
  primary: string
  secondary: string
  accent: string
  foreground: string
}

const THEMES: ThemeConfig[] = [
  {
    id: 'infinity-original',
    name: 'Infinity Purple',
    description: 'Original purple & blue gradient',
    background: 'oklch(0.98 0.01 250)',
    primary: 'oklch(0.45 0.15 300)',
    secondary: 'oklch(0.55 0.20 250)',
    accent: 'oklch(0.70 0.18 200)',
    foreground: 'oklch(0.20 0.05 270)'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Cool blue & teal vibes',
    background: 'oklch(0.97 0.01 220)',
    primary: 'oklch(0.50 0.18 240)',
    secondary: 'oklch(0.55 0.20 200)',
    accent: 'oklch(0.65 0.15 180)',
    foreground: 'oklch(0.20 0.05 240)'
  },
  {
    id: 'sunset-fire',
    name: 'Sunset Fire',
    description: 'Warm orange & pink energy',
    background: 'oklch(0.98 0.01 50)',
    primary: 'oklch(0.55 0.22 35)',
    secondary: 'oklch(0.60 0.20 15)',
    accent: 'oklch(0.70 0.18 350)',
    foreground: 'oklch(0.20 0.05 30)'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural green & earthy tones',
    background: 'oklch(0.97 0.01 160)',
    primary: 'oklch(0.45 0.15 150)',
    secondary: 'oklch(0.50 0.18 130)',
    accent: 'oklch(0.65 0.15 110)',
    foreground: 'oklch(0.20 0.05 150)'
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Bright cyan & magenta tech',
    background: 'oklch(0.15 0.02 280)',
    primary: 'oklch(0.70 0.25 195)',
    secondary: 'oklch(0.65 0.28 320)',
    accent: 'oklch(0.75 0.22 150)',
    foreground: 'oklch(0.95 0.02 280)'
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    description: 'Luxurious gold & deep purple',
    background: 'oklch(0.98 0.01 80)',
    primary: 'oklch(0.40 0.12 290)',
    secondary: 'oklch(0.65 0.18 80)',
    accent: 'oklch(0.75 0.20 70)',
    foreground: 'oklch(0.20 0.05 290)'
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Soft pink & lavender',
    background: 'oklch(0.98 0.02 350)',
    primary: 'oklch(0.60 0.18 340)',
    secondary: 'oklch(0.65 0.15 320)',
    accent: 'oklch(0.70 0.20 280)',
    foreground: 'oklch(0.25 0.05 340)'
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep navy & silver',
    background: 'oklch(0.20 0.03 250)',
    primary: 'oklch(0.50 0.15 250)',
    secondary: 'oklch(0.60 0.10 240)',
    accent: 'oklch(0.75 0.08 0)',
    foreground: 'oklch(0.95 0.01 250)'
  }
]

const BACKGROUND_PATTERNS = [
  {
    id: 'mesh',
    name: 'Mesh Gradient',
    class: 'mesh-background'
  },
  {
    id: 'dots',
    name: 'Dotted Pattern',
    class: 'dots-background'
  },
  {
    id: 'waves',
    name: 'Wave Pattern',
    class: 'waves-background'
  },
  {
    id: 'grid',
    name: 'Grid Pattern',
    class: 'grid-background'
  },
  {
    id: 'solid',
    name: 'Solid Color',
    class: 'solid-background'
  }
]

export function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useLocalStorage<string>('selected-theme', 'infinity-original')
  const [backgroundPattern, setBackgroundPattern] = useLocalStorage<string>('background-pattern', 'mesh')
  const [showCustomizer, setShowCustomizer] = useState(false)

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    root.style.setProperty('--background', theme.background)
    root.style.setProperty('--foreground', theme.foreground)
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--secondary', theme.secondary)
    root.style.setProperty('--accent', theme.accent)
    
    root.style.setProperty('--card', 'oklch(1 0 0)')
    root.style.setProperty('--card-foreground', theme.foreground)
    root.style.setProperty('--popover', 'oklch(1 0 0)')
    root.style.setProperty('--popover-foreground', theme.foreground)
    root.style.setProperty('--primary-foreground', 'oklch(0.98 0 0)')
    root.style.setProperty('--secondary-foreground', 'oklch(0.98 0 0)')
    root.style.setProperty('--muted', 'oklch(0.94 0.02 280)')
    root.style.setProperty('--muted-foreground', 'oklch(0.50 0.05 270)')
    root.style.setProperty('--accent-foreground', theme.foreground)
    root.style.setProperty('--destructive', 'oklch(0.577 0.245 27.325)')
    root.style.setProperty('--destructive-foreground', 'oklch(0.98 0 0)')
    root.style.setProperty('--border', 'oklch(0.88 0.03 280)')
    root.style.setProperty('--input', 'oklch(0.88 0.03 280)')
    root.style.setProperty('--ring', theme.accent)

    setSelectedTheme(theme.id)
    toast.success(`Theme changed to ${theme.name}!`)
  }

  const applyBackground = (patternId: string) => {
    const body = document.body
    const container = body.querySelector('.min-h-screen') as HTMLElement
    
    if (container) {
      BACKGROUND_PATTERNS.forEach(p => {
        container.classList.remove(p.class)
      })
      
      const pattern = BACKGROUND_PATTERNS.find(p => p.id === patternId)
      if (pattern) {
        container.classList.add(pattern.class)
      }
    }

    setBackgroundPattern(patternId)
    toast.success('Background pattern updated!')
  }

  return (
    <>
      <Button
        onClick={() => setShowCustomizer(!showCustomizer)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 p-0 shadow-lg bg-gradient-to-r from-primary to-accent"
        title="Customize Theme"
      >
        {showCustomizer ? (
          <X size={24} weight="bold" />
        ) : (
          <Palette size={24} weight="duotone" />
        )}
      </Button>

      {showCustomizer && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] overflow-hidden shadow-2xl gradient-border">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <div className="flex items-center gap-2">
              <Sparkle size={24} weight="duotone" className="text-accent" />
              <h3 className="font-bold text-lg">Theme Customizer</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Customize colors and backgrounds
            </p>
          </div>

          <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Color Themes</Label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedTheme === theme.id
                        ? 'border-accent shadow-lg'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">{theme.name}</span>
                      {selectedTheme === theme.id && (
                        <Check size={16} weight="bold" className="text-accent" />
                      )}
                    </div>
                    <div className="flex gap-1 h-6 rounded overflow-hidden">
                      <div
                        className="flex-1"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: theme.secondary }}
                      />
                      <div
                        className="flex-1"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-3 block">Background Pattern</Label>
              <div className="space-y-2">
                {BACKGROUND_PATTERNS.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => applyBackground(pattern.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-102 flex items-center justify-between ${
                      backgroundPattern === pattern.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{pattern.name}</span>
                    {backgroundPattern === pattern.id && (
                      <Check size={18} weight="bold" className="text-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
