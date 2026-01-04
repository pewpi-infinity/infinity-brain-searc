import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowUp, ArrowDown, ArrowsLeftRight, Clock, CheckCircle, XCircle } from '@phosphor-icons/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useAuth } from '@/lib/auth'

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'mint'
  tokenSymbol: string
  amount: number
  from: string
  fromUsername: string
  to: string
  toUsername: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
  note?: string
}

export function TransactionHistory() {
  const { userProfile } = useAuth()
  const [allTransactions] = useLocalStorage<Transaction[]>('all-transactions', [])

  if (!userProfile) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          Please log in to view transaction history
        </p>
      </Card>
    )
  }

  const userTransactions = (allTransactions || []).filter(
    tx => tx.from === userProfile.userId || tx.to === userProfile.userId
  ).sort((a, b) => b.timestamp - a.timestamp)

  const getTransactionIcon = (tx: Transaction) => {
    if (tx.type === 'mint') {
      return <CheckCircle size={20} weight="duotone" className="text-accent" />
    }
    if (tx.from === userProfile.userId) {
      return <ArrowUp size={20} weight="duotone" className="text-destructive" />
    }
    return <ArrowDown size={20} weight="duotone" className="text-accent" />
  }

  const getTransactionLabel = (tx: Transaction) => {
    if (tx.type === 'mint') {
      return 'Minted'
    }
    if (tx.from === userProfile.userId) {
      return 'Sent'
    }
    return 'Received'
  }

  const getTransactionColor = (tx: Transaction) => {
    if (tx.type === 'mint') {
      return 'text-accent'
    }
    if (tx.from === userProfile.userId) {
      return 'text-destructive'
    }
    return 'text-accent'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ArrowsLeftRight size={24} weight="duotone" className="text-primary" />
          <h3 className="text-xl font-bold">Transaction History</h3>
        </div>
        <Badge variant="secondary">{userTransactions.length} total</Badge>
      </div>

      {userTransactions.length === 0 ? (
        <div className="text-center py-8">
          <ArrowsLeftRight size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No transactions yet. Start by transferring tokens!
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {userTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getTransactionIcon(tx)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {getTransactionLabel(tx)}
                    </span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {tx.tokenSymbol}
                    </Badge>
                    {tx.status === 'completed' ? (
                      <CheckCircle size={14} weight="fill" className="text-accent" />
                    ) : tx.status === 'failed' ? (
                      <XCircle size={14} weight="fill" className="text-destructive" />
                    ) : (
                      <Clock size={14} weight="duotone" className="text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {tx.type !== 'mint' && (
                      <>
                        <span className="truncate">
                          {tx.from === userProfile.userId
                            ? `To: ${tx.toUsername}`
                            : `From: ${tx.fromUsername}`}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>

                  {tx.note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{tx.note}"
                    </p>
                  )}
                </div>

                <div className={`font-mono font-bold text-right ${getTransactionColor(tx)}`}>
                  {tx.from === userProfile.userId && tx.type !== 'mint' && '-'}
                  {tx.to === userProfile.userId && tx.type !== 'mint' && '+'}
                  {tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  )
}
