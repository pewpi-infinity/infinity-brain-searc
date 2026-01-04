import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Palette, Check } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BackgroundPreset {
  id: string
  name: string
  emoji: string
  gradient: string
}

const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'default',
    name: 'Mesh Gradient',
    emoji: '🌈',
    gradient: 'radial-gradient(circle at 20% 50%, oklch(0.75 0.08 290 / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.70 0.18 200 / 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 90%, oklch(0.55 0.20 250 / 0.15) 0%, transparent 50%), linear-gradient(135deg, oklch(0.98 0.01 250) 0%, oklch(0.96 0.01 270) 100%)'
  },
  {
    id: 'mushroom',
    name: 'Mushroom Power 🍄',
    emoji: '🍄',
    gradient: 'radial-gradient(circle at 30% 40%, oklch(0.65 0.25 10 / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, oklch(0.95 0.01 50 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.92 0.08 40) 0%, oklch(0.85 0.12 20) 100%)'
  },
  {
    id: 'crown',
    name: 'Royal Gold 👑',
    emoji: '👑',
    gradient: 'radial-gradient(circle at 25% 30%, oklch(0.85 0.15 85 / 0.4) 0%, transparent 50%), radial-gradient(circle at 75% 80%, oklch(0.75 0.18 70 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.95 0.08 90) 0%, oklch(0.88 0.12 75) 100%)'
  },
  {
    id: 'star',
    name: 'Star Power ⭐',
    emoji: '⭐',
    gradient: 'radial-gradient(circle at 50% 20%, oklch(0.88 0.15 65 / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 60%, oklch(0.92 0.08 85 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.96 0.05 80) 0%, oklch(0.92 0.10 95) 100%)'
  },
  {
    id: 'coin',
    name: 'Coin Collector 💰',
    emoji: '💰',
    gradient: 'radial-gradient(circle at 40% 30%, oklch(0.80 0.18 75 / 0.4) 0%, transparent 50%), radial-gradient(circle at 60% 70%, oklch(0.75 0.20 85 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.90 0.12 80) 0%, oklch(0.85 0.15 70) 100%)'
  },
  {
    id: 'fireflower',
    name: 'Fire Flower 🌸',
    emoji: '🌸',
    gradient: 'radial-gradient(circle at 30% 50%, oklch(0.70 0.25 25 / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, oklch(0.75 0.22 35 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.88 0.18 30) 0%, oklch(0.80 0.20 20) 100%)'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue 🌊',
    emoji: '🌊',
    gradient: 'radial-gradient(circle at 25% 40%, oklch(0.65 0.15 230 / 0.4) 0%, transparent 50%), radial-gradient(circle at 75% 70%, oklch(0.70 0.18 220 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.85 0.12 235) 0%, oklch(0.75 0.15 215) 100%)'
  },
  {
    id: 'rainbow',
    name: 'Rainbow Road 🌈',
    emoji: '🌈',
    gradient: 'linear-gradient(135deg, oklch(0.85 0.20 10) 0%, oklch(0.80 0.22 35) 14%, oklch(0.85 0.18 65) 28%, oklch(0.80 0.20 140) 42%, oklch(0.75 0.18 220) 57%, oklch(0.70 0.22 270) 71%, oklch(0.75 0.20 320) 85%, oklch(0.80 0.18 350) 100%)'
  },
  {
    id: 'galaxy',
    name: 'Galaxy Space 🪐',
    emoji: '🪐',
    gradient: 'radial-gradient(circle at 20% 30%, oklch(0.45 0.20 270 / 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.55 0.25 310 / 0.4) 0%, transparent 50%), radial-gradient(circle at 50% 50%, oklch(0.40 0.15 250 / 0.3) 0%, transparent 70%), linear-gradient(135deg, oklch(0.25 0.10 280) 0%, oklch(0.15 0.08 260) 100%)'
  },
  {
    id: 'emerald',
    name: 'Emerald Green 💚',
    emoji: '💚',
    gradient: 'radial-gradient(circle at 30% 40%, oklch(0.65 0.20 155 / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 65%, oklch(0.70 0.18 145 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.82 0.15 150) 0%, oklch(0.75 0.18 140) 100%)'
  },
  {
    id: 'diamond',
    name: 'Diamond Sparkle 💎',
    emoji: '💎',
    gradient: 'radial-gradient(circle at 50% 30%, oklch(0.90 0.08 220 / 0.5) 0%, transparent 50%), radial-gradient(circle at 30% 70%, oklch(0.85 0.12 240 / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, oklch(0.88 0.10 200 / 0.3) 0%, transparent 50%), linear-gradient(135deg, oklch(0.95 0.05 230) 0%, oklch(0.90 0.08 210) 100%)'
  }
]

export function BackgroundChanger() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBg, setSelectedBg] = useLocalStorage<string>('selected-background', 'default')

  const applyBackground = (preset: BackgroundPreset) => {
    setSelectedBg(preset.id)
    const root = document.documentElement
    root.style.setProperty('--custom-bg', preset.gradient)
    toast.success(`${preset.emoji} ${preset.name} applied!`)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-accent to-secondary hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette size={28} weight="duotone" />
      </Button>

      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 max-h-96 overflow-y-auto shadow-2xl">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Palette size={24} weight="duotone" />
              Background Themes
            </h3>
            {backgroundPresets.map((preset) => (
              <Button
                key={preset.id}
                variant={selectedBg === preset.id ? 'default' : 'outline'}
                className="w-full justify-between h-auto py-3 px-4"
                onClick={() => applyBackground(preset)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <span className="font-medium">{preset.name}</span>
                </span>
                {selectedBg === preset.id && (
                  <Check size={20} weight="bold" className="text-accent" />
                )}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
