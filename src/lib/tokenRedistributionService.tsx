import { useEffect } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'
import { storage } from './storage'
import { useAuth } from './auth'

interface TokenRedistributionService {
  checkInactiveTokens: () => Promise<void>
  redistributeToken: (tokenSymbol: string, fromOwner: string) => Promise<void>
  notifyOwner: (tokenSymbol: string, owner: string, daysRemaining: number) => Promise<void>
}

const INACTIVITY_THRESHOLD_DAYS = 30
const WARNING_THRESHOLDS = [7, 3, 1]

export function useTokenRedistributionService() {
  const { currentUser } = useAuth()

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      await checkInactiveTokens()
    }, 3600000)

    checkInactiveTokens()

    return () => clearInterval(checkInterval)
  }, [])

  const checkInactiveTokens = async () => {
    try {
      const tokens = await storage.get<any[]>('minted-tokens') || []
      const now = Date.now()

      for (const token of tokens) {
        const lastActivity = token.lastActivity || token.createdAt
        const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24)
        const daysRemaining = INACTIVITY_THRESHOLD_DAYS - daysSinceActivity

        if (daysRemaining <= 0) {
          await redistributeToken(token.symbol, token.owner)
        } else if (WARNING_THRESHOLDS.includes(Math.floor(daysRemaining))) {
          await notifyOwner(token.symbol, token.owner, daysRemaining)
        }
      }
    } catch (error) {
      console.error('Token redistribution check failed:', error)
    }
  }

  const redistributeToken = async (tokenSymbol: string, fromOwner: string) => {
    try {
      const tokens = await storage.get<any[]>('minted-tokens') || []
      const tokenIndex = tokens.findIndex(t => t.symbol === tokenSymbol)

      if (tokenIndex === -1) return

      const token = tokens[tokenIndex]
      
      const activeTraders = await findActiveTraders()
      
      if (activeTraders.length === 0) {
        console.log(`No active traders found for ${tokenSymbol}`)
        return
      }

      const randomTrader = activeTraders[Math.floor(Math.random() * activeTraders.length)]

      const redistributionRecord = {
        tokenSymbol,
        fromOwner,
        toOwner: randomTrader,
        amount: token.supply,
        timestamp: Date.now(),
        reason: 'inactivity'
      }

      const redistributions = await storage.get<any[]>('token-redistributions') || []
      redistributions.push(redistributionRecord)
      await storage.set('token-redistributions', redistributions)

      tokens[tokenIndex].owner = randomTrader
      tokens[tokenIndex].lastActivity = Date.now()
      tokens[tokenIndex].previousOwners = [...(token.previousOwners || []), fromOwner]
      await storage.set('minted-tokens', tokens)

      if (currentUser && currentUser.username === fromOwner) {
        toast.error(`Token ${tokenSymbol} Redistributed`, {
          description: `Due to inactivity, your tokens have been redistributed to active traders`,
          duration: 10000
        })
      }

      if (currentUser && currentUser.username === randomTrader) {
        toast.success(`New Tokens Received!`, {
          description: `You received ${token.supply} ${tokenSymbol} tokens from an inactive holder`,
          duration: 10000
        })
      }

      console.log(`Redistributed ${tokenSymbol} from ${fromOwner} to ${randomTrader}`)
    } catch (error) {
      console.error(`Failed to redistribute ${tokenSymbol}:`, error)
    }
  }

  const notifyOwner = async (tokenSymbol: string, owner: string, daysRemaining: number) => {
    try {
      if (!currentUser || currentUser.username !== owner) return

      const notificationKey = `notified-${tokenSymbol}-${Math.floor(daysRemaining)}`
      const alreadyNotified = await storage.get<boolean>(notificationKey)

      if (alreadyNotified) return

      let message = ''
      let urgency: 'info' | 'warning' | 'error' = 'info'

      if (daysRemaining <= 1) {
        message = `⚠️ URGENT: ${tokenSymbol} will be redistributed in less than 24 hours!`
        urgency = 'error'
      } else if (daysRemaining <= 3) {
        message = `⚠️ Warning: ${tokenSymbol} will be redistributed in ${Math.floor(daysRemaining)} days`
        urgency = 'error'
      } else if (daysRemaining <= 7) {
        message = `Reminder: ${tokenSymbol} approaching inactivity threshold (${Math.floor(daysRemaining)} days remaining)`
        urgency = 'warning'
      }

      if (urgency === 'error') {
        toast.error(message, {
          description: 'Take action now to keep your tokens',
          duration: 15000
        })
      } else if (urgency === 'warning') {
        toast.warning(message, {
          description: 'Record activity to reset the timer',
          duration: 10000
        })
      }

      await storage.set(notificationKey, true)
      
      setTimeout(async () => {
        await storage.delete(notificationKey)
      }, 86400000)

    } catch (error) {
      console.error(`Failed to notify owner for ${tokenSymbol}:`, error)
    }
  }

  const findActiveTraders = async (): Promise<string[]> => {
    try {
      const transactions = await storage.get<any[]>('token-transactions') || []
      const now = Date.now()
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

      const recentTransactions = transactions.filter(t => t.timestamp > thirtyDaysAgo)

      const traderActivity = new Map<string, number>()

      recentTransactions.forEach(tx => {
        traderActivity.set(tx.buyer, (traderActivity.get(tx.buyer) || 0) + 1)
        if (tx.seller) {
          traderActivity.set(tx.seller, (traderActivity.get(tx.seller) || 0) + 1)
        }
      })

      const activeTraders = Array.from(traderActivity.entries())
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .map(([trader]) => trader)

      return activeTraders.length > 0 ? activeTraders : ['community-pool']
    } catch (error) {
      console.error('Failed to find active traders:', error)
      return ['community-pool']
    }
  }

  return { checkInactiveTokens, redistributeToken, notifyOwner }
}

export function TokenRedistributionServiceProvider({ children }: { children: ReactNode }) {
  useTokenRedistributionService()
  return <>{children}</>
}
