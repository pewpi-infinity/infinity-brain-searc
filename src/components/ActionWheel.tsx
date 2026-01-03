import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  FileArrowUp, 
  FileArrowDown, 
  Wrench, 
  MagnetStraight 
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface ActionWheelProps {
  onImport?: () => void
  onExport?: () => void
  onEngineering?: () => void
  onPullMemory?: () => void
}

export function ActionWheel({ 
  onImport,
  onExport,
  onEngineering,
  onPullMemory 
}: ActionWheelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    {
      icon: FileArrowUp,
      label: 'Import',
      color: 'bg-blue-500 hover:bg-blue-600',
      angle: 225,
      onClick: () => {
        onImport?.()
        toast.success('Import data tool', { icon: '🟦' })
        setIsOpen(false)
      }
    },
    {
      icon: FileArrowDown,
      label: 'Export Data',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      angle: 270,
      onClick: () => {
        onExport?.()
        toast.success('Extract/read data', { icon: '🟨' })
        setIsOpen(false)
      }
    },
    {
      icon: Wrench,
      label: 'System Tools',
      color: 'bg-green-500 hover:bg-green-600',
      angle: 315,
      onClick: () => {
        onEngineering?.()
        toast.success('System engineering tools', { icon: '🟩' })
        setIsOpen(false)
      }
    },
    {
      icon: MagnetStraight,
      label: 'Pull Memory',
      color: 'bg-purple-500 hover:bg-purple-600',
      angle: 180,
      onClick: () => {
        onPullMemory?.()
        toast.success('Pull local memory to conversation', { icon: '🧲🪐' })
        setIsOpen(false)
      }
    }
  ]

  const calculatePosition = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {actions.map((action, index) => {
              const pos = calculatePosition(action.angle, 100)
              const Icon = action.icon
              
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, x: pos.x, y: pos.y }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20
                  }}
                  className="absolute bottom-0 right-0"
                  style={{ transformOrigin: 'bottom right' }}
                >
                  <Button
                    size="lg"
                    className={`${action.color} text-white shadow-lg rounded-full w-14 h-14 p-0 group relative`}
                    onClick={action.onClick}
                    title={action.label}
                  >
                    <Icon size={24} weight="bold" />
                    <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-card text-foreground px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border">
                      {action.label}
                    </span>
                  </Button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className={`rounded-full w-16 h-16 p-0 shadow-2xl transition-transform ${
          isOpen 
            ? 'bg-destructive hover:bg-destructive rotate-45' 
            : 'bg-gradient-to-r from-primary via-secondary to-accent hover:scale-110'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {isOpen ? (
            <span className="text-3xl font-bold">×</span>
          ) : (
            <span className="text-2xl">✨</span>
          )}
        </motion.div>
      </Button>
    </div>
  )
}
