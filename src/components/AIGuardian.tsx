import { Robot } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

export function AIGuardian() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-20 right-6 z-40 max-w-xs"
    >
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
        <div className="flex items-start gap-3">
          <Robot size={28} weight="duotone" className="text-blue-600 flex-shrink-0 animate-pulse" />
          <div>
            <h4 className="font-semibold text-sm text-blue-900 mb-1">
              🤖 Infinity AI is watching
            </h4>
            <p className="text-xs text-blue-800">
              If something looks unsafe or confusing, I'll stop and explain first.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
