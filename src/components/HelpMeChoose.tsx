import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface HelpMeChooseProps {
  category: 'tokens' | 'marketplace' | 'auction' | 'general'
  onNavigate: (destination: string) => void
}

const QUESTIONS = {
  tokens: {
    title: 'Token Actions',
    description: 'Let me help you find the right action',
    options: [
      { question: 'Create new tokens', answer: 'You want to mint tokens', destination: 'tokens' },
      { question: 'Trade existing tokens', answer: 'You want the marketplace', destination: 'marketplace' },
      { question: 'Auction my tokens', answer: 'You want to create an auction', destination: 'auction' },
      { question: 'See market overview', answer: 'You want market analytics', destination: 'markets' }
    ]
  },
  marketplace: {
    title: 'Trading Actions',
    description: 'What would you like to do?',
    options: [
      { question: 'Buy tokens from others', answer: 'Browse the marketplace', destination: 'marketplace' },
      { question: 'Sell my tokens', answer: 'List in marketplace', destination: 'marketplace' },
      { question: 'Bid in auctions', answer: 'View active auctions', destination: 'auction' },
      { question: 'Track my portfolio', answer: 'Your dashboard', destination: 'user' }
    ]
  },
  auction: {
    title: 'Auction Actions',
    description: 'What brings you here?',
    options: [
      { question: 'Create new auction', answer: 'Start an auction', destination: 'auction' },
      { question: 'Bid on auctions', answer: 'View live auctions', destination: 'auction' },
      { question: 'Use auction templates', answer: 'Quick auction setup', destination: 'templates' },
      { question: 'Watch auctions', answer: 'Your watchlist', destination: 'watchlist' }
    ]
  },
  general: {
    title: 'Where should you go?',
    description: 'Pick what you want to accomplish',
    options: [
      { question: 'Build or create', answer: 'Go to creation tools', destination: 'file-builder' },
      { question: 'Learn and explore', answer: 'Start with the home tour', destination: 'home' },
      { question: 'Earn money', answer: 'Check token minting', destination: 'tokens' },
      { question: 'Just browsing', answer: 'Explore the markets', destination: 'markets' }
    ]
  }
}

export function HelpMeChoose({ category, onNavigate }: HelpMeChooseProps) {
  const [open, setOpen] = useState(false)
  const config = QUESTIONS[category]

  const handleSelect = (destination: string) => {
    setOpen(false)
    setTimeout(() => onNavigate(destination), 200)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-accent/30 hover:border-accent hover:bg-accent/5"
      >
        <Sparkle size={16} weight="duotone" />
        Help me choose
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkle size={24} weight="duotone" className="text-accent" />
              {config.title}
            </DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            {config.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:bg-accent/10 hover:border-accent/50 transition-all"
                  onClick={() => handleSelect(option.destination)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">{option.question}</div>
                      <div className="text-sm text-muted-foreground">{option.answer}</div>
                    </div>
                    <ArrowRight size={20} weight="bold" className="text-accent" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200 mt-2">
            <p className="text-sm text-blue-900">
              💡 <strong>Still not sure?</strong> You can always come back and explore other sections anytime.
            </p>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
