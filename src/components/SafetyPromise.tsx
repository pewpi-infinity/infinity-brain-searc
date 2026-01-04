import { Shield, Info } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

export function SafetyPromise() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 p-4">
        <div className="flex items-start gap-3">
          <Shield size={32} weight="duotone" className="text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-lg text-green-900 mb-1">Infinity Brain Promise</h3>
            <p className="text-sm text-green-800 leading-relaxed">
              You will never be asked for secret keys, terminal commands, or code.
              If something can be done safely for you, it will be.
            </p>
          </div>
          <Info size={20} weight="duotone" className="text-green-600 flex-shrink-0 mt-1 opacity-60" />
        </div>
      </Card>
    </motion.div>
  )
}
