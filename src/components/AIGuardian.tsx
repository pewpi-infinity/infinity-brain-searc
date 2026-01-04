import { useState, useEffect } from 'react'
import { Robot, X } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export function AIGuardian() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useLocalStorage<boolean>('ai-guardian-dismissed', false)
  const [alert, setAlert] = useState<string | null>(null)

  useEffect(() => {
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => {
          setIsVisible(false)
        }, 5000)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isDismissed])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  const showAlert = (message: string) => {
    setAlert(message)
    setIsVisible(true)
  }

  if (isDismissed && !alert) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-xs"
        >
          <Card className="p-3 bg-gradient-to-r from-blue-50/95 to-purple-50/95 border-blue-200 shadow-lg backdrop-blur">
            <div className="flex items-start gap-2">
              <Robot size={20} weight="duotone" className="text-blue-600 flex-shrink-0 mt-0.5 opacity-70" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-800 leading-relaxed">
                  {alert || 'Infinity AI is watching for mistakes.'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-blue-100"
                onClick={handleDismiss}
              >
                <X size={14} className="text-blue-600" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
