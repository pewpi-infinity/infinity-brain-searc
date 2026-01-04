import { useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Sparkle, Hammer, Book, Compass } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface WelcomeFlowProps {
  onNavigate: (destination: string) => void
}

const INTENT_OPTIONS = [
  {
    intent: 'build',
    icon: Hammer,
    title: 'Build',
    description: 'Create tokens, auctions, or applications',
    color: 'from-blue-500 to-purple-600',
    destinations: ['tokens', 'auction', 'file-builder']
  },
  {
    intent: 'learn',
    icon: Book,
    title: 'Learn',
    description: 'Understand how everything works',
    color: 'from-green-500 to-teal-600',
    destinations: ['home', 'analytics', 'metrics']
  },
  {
    intent: 'explore',
    icon: Compass,
    title: 'Explore',
    description: 'Browse markets and discover opportunities',
    color: 'from-orange-500 to-pink-600',
    destinations: ['markets', 'marketplace', 'auction']
  }
]

export function WelcomeFlow({ onNavigate }: WelcomeFlowProps) {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage<boolean>('has-seen-welcome', false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [hasSeenWelcome])

  const handleSelect = (intent: string, destinations: string[]) => {
    setHasSeenWelcome(true)
    setOpen(false)
    setTimeout(() => {
      onNavigate(destinations[0])
    }, 300)
  }

  if (hasSeenWelcome) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) setHasSeenWelcome(true)
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl">
            <Sparkle size={32} weight="duotone" className="text-accent animate-pulse" />
            Welcome to Infinity Brain
          </DialogTitle>
          <DialogDescription className="text-base">
            Let's personalize your experience. What brings you here today?
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {INTENT_OPTIONS.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={option.intent}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                  onClick={() => handleSelect(option.intent, option.destinations)}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                    <Icon size={28} weight="duotone" className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <Card className="p-4 bg-blue-50 border-blue-200 mt-4">
          <p className="text-sm text-blue-900 text-center">
            💡 Don't worry - you can access everything regardless of your choice. This just helps us show you the most relevant features first.
          </p>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
