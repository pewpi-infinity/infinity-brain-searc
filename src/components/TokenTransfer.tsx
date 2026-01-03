import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PaperPlaneTilt, User, Coins } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth'
import { Transaction } from './TransactionHistory'

interface UserProfile {
  userId: string
  username: string
  email: string
  avatarUrl: string
  createdAt: number
  businessTokens: Record<string, number>
}

export function TokenTransfer() {
  const { userProfile, isAuthenticated } = useAuth()
  const [allProfiles] = useKV<Record<string, UserProfile>>('all-user-profiles', {})
  const [allTransactions, setAllTransactions] = useKV<Transaction[]>('all-transactions', [])
  const [userProfiles, setUserProfiles] = useKV<Record<string, UserProfile>>('all-user-profiles', {})
  
  const [recipientId, setRecipientId] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  if (!isAuthenticated || !userProfile) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <User size={48} weight="duotone" className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Please log in to transfer tokens
          </p>
        </div>
      </Card>
    )
  }

  const availableTokens = Object.keys(userProfile.businessTokens).filter(
    symbol => userProfile.businessTokens[symbol] > 0
  )

  const otherUsers = Object.values(allProfiles || {}).filter(
    profile => profile.userId !== userProfile.userId
  )

  const handleTransfer = async () => {
    if (!recipientId || !tokenSymbol || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Invalid transfer amount')
      return
    }

    const currentBalance = userProfile.businessTokens[tokenSymbol] || 0
    if (transferAmount > currentBalance) {
      toast.error(`Insufficient ${tokenSymbol} balance. You have ${currentBalance.toLocaleString()}`)
      return
    }

    const recipient = allProfiles?.[recipientId]
    if (!recipient) {
      toast.error('Recipient not found')
      return
    }

    setIsTransferring(true)

    try {
      const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const transaction: Transaction = {
        id: transactionId,
        type: 'send',
        tokenSymbol,
        amount: transferAmount,
        from: userProfile.userId,
        fromUsername: userProfile.username,
        to: recipientId,
        toUsername: recipient.username,
        timestamp: Date.now(),
        status: 'completed',
        note: note || undefined
      }

      setAllTransactions((currentTransactions) => [
        ...(currentTransactions || []),
        transaction
      ])

      const updatedSenderTokens = {
        ...userProfile.businessTokens,
        [tokenSymbol]: currentBalance - transferAmount
      }

      const recipientBalance = recipient.businessTokens[tokenSymbol] || 0
      const updatedRecipientTokens = {
        ...recipient.businessTokens,
        [tokenSymbol]: recipientBalance + transferAmount
      }

      setUserProfiles((currentProfiles) => ({
        ...(currentProfiles || {}),
        [userProfile.userId]: {
          ...userProfile,
          businessTokens: updatedSenderTokens
        },
        [recipientId]: {
          ...recipient,
          businessTokens: updatedRecipientTokens
        }
      }))

      toast.success(
        `Successfully sent ${transferAmount.toLocaleString()} ${tokenSymbol} to ${recipient.username}!`
      )

      setRecipientId('')
      setTokenSymbol('')
      setAmount('')
      setNote('')
    } catch (error) {
      toast.error('Transfer failed. Please try again.')
      console.error('Transfer error:', error)
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <Card className="p-6 gradient-border">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <PaperPlaneTilt size={32} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Transfer Tokens</h3>
            <p className="text-sm text-muted-foreground">Send tokens to other users</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Select value={recipientId} onValueChange={setRecipientId}>
            <SelectTrigger id="recipient">
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {otherUsers.length > 0 ? (
                otherUsers.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    <div className="flex items-center gap-2">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground">({user.email})</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No other users available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Select value={tokenSymbol} onValueChange={setTokenSymbol}>
            <SelectTrigger id="token">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {availableTokens.length > 0 ? (
                availableTokens.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-mono font-bold">{symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        Balance: {userProfile.businessTokens[symbol].toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No tokens available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
            />
            {tokenSymbol && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Coins size={16} weight="duotone" className="text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">{tokenSymbol}</span>
              </div>
            )}
          </div>
          {tokenSymbol && (
            <p className="text-xs text-muted-foreground">
              Available: {userProfile.businessTokens[tokenSymbol].toLocaleString()} {tokenSymbol}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            placeholder="Add a message..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleTransfer}
          className="w-full bg-gradient-to-r from-primary to-accent"
          disabled={isTransferring || otherUsers.length === 0 || availableTokens.length === 0}
        >
          <PaperPlaneTilt size={20} weight="bold" className="mr-2" />
          {isTransferring ? 'Transferring...' : 'Send Transfer'}
        </Button>

        {otherUsers.length === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            No other users available for transfer
          </p>
        )}
        
        {availableTokens.length === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            No tokens available. Mint tokens first!
          </p>
        )}
      </div>
    </Card>
  )
}
