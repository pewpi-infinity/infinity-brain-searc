import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface IntentBasedHelperProps {
  onNavigate: (tab: string) => void
}

export function IntentBasedHelper({ onNavigate }: IntentBasedHelperProps) {
  const [open, setOpen] = useState(false)
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null)

  const intents = [
    {
      id: 'build',
      title: 'Build Something',
      description: 'Create tokens, auctions, or content',
      destinations: [
        { tab: 'tokens', label: 'Create Tokens' },
        { tab: 'auction', label: 'Start an Auction' },
        { tab: 'file-builder', label: 'Build Programs' }
      ]
    },
    {
      id: 'learn',
      title: 'Learn & Explore',
      description: 'Understand how the system works',
      destinations: [
        { tab: 'home', label: 'View Overview' },
        { tab: 'metrics', label: 'See Token Metrics' },
        { tab: 'analytics', label: 'Auction Analytics' }
      ]
    },
    {
      id: 'trade',
      title: 'Trade & Earn',
      description: 'Buy, sell, or earn tokens',
      destinations: [
        { tab: 'marketplace', label: 'Token Marketplace' },
        { tab: 'auction', label: 'Live Auctions' },
        { tab: 'buy-inf', label: 'Buy INF Tokens' }
      ]
    },
    {
      id: 'automate',
      title: 'Automate Tasks',
      description: 'Let AI handle complex operations',
      destinations: [
        { tab: 'autopilot', label: 'Auto-Pilot Control' },
        { tab: 'auto-auction', label: 'Auto Auctions' },
        { tab: 'auto-pricing', label: 'Auto Pricing' }
      ]
    }
  ]

  const handleSelectIntent = (intentId: string) => {
    setSelectedIntent(intentId)
  }

  const handleNavigate = (tab: string) => {
    onNavigate(tab)
    setOpen(false)
    setSelectedIntent(null)
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-50 rounded-full shadow-lg"
        size="lg"
      >
        <Sparkle size={20} weight="duotone" className="mr-2" />
        Help me choose
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkle size={24} weight="duotone" className="text-accent" />
              What brings you here today?
            </DialogTitle>
          </DialogHeader>

          {!selectedIntent ? (
            <div className="grid md:grid-cols-2 gap-4 py-4">
              {intents.map((intent, index) => (
                <motion.div
                  key={intent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent"
                    onClick={() => handleSelectIntent(intent.id)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{intent.title}</h3>
                    <p className="text-sm text-muted-foreground">{intent.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIntent(null)}
                className="mb-4"
              >
                ← Back
              </Button>
              
              <h3 className="text-lg font-semibold mb-4">
                Choose where to go:
              </h3>
              
              <div className="space-y-2">
                {intents
                  .find(i => i.id === selectedIntent)
                  ?.destinations.map((dest, index) => (
                    <motion.div
                      key={dest.tab}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handleNavigate(dest.tab)}
                      >
                        {dest.label}
                        <ArrowRight size={16} />
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
