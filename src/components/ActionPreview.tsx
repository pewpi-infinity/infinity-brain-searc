import { Info, ArrowRight } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface ActionPreviewProps {
  action: string
  description: string
  visible?: boolean
}

export function ActionPreview({ action, description, visible = true }: ActionPreviewProps) {
  if (!visible) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
        <div className="flex items-start gap-3">
          <Info size={24} weight="duotone" className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-blue-900 mb-1">
              What happens next:
            </h4>
            <p className="text-sm text-blue-800">
              {description}
            </p>
          </div>
          <ArrowRight size={20} weight="bold" className="text-blue-600 flex-shrink-0 mt-0.5" />
        </div>
      </Card>
    </motion.div>
  )
}

export const ACTION_PREVIEWS = {
  deploy: "We will publish your page to your GitHub account using your existing login. No code or terminal commands required.",
  buyInf: "You'll be taken to a secure payment form to purchase INF tokens with USD. Payment processes through PayPal or your chosen method.",
  mint: "We'll create a new token with your chosen name and symbol. This will add it to your token portfolio.",
  auction: "We'll list your token for auction where others can bid. You set the starting price and duration.",
  export: "We'll package your pages and data into downloadable files you can save or use elsewhere.",
  automate: "AI will handle this task automatically on a schedule. You can take manual control anytime.",
  transfer: "Your tokens will be sent to the recipient's account. This action cannot be undone.",
  delete: "This will permanently remove the item. Make sure you want to do this before confirming.",
}
