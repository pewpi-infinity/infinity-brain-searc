import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CurrencyDollar, Coins, TrendUp, Wallet } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/lib/auth'
import { Transaction } from './TransactionHistory'
import { TokenPriceChart } from './TokenPriceChart'

interface BusinessToken {
  symbol: string
  name: string
  totalSupply: number
  circulatingSupply: number
  businessName: string
  createdAt: number
  backedBy: 'infinity'
  mintedBy: string
}

export function TokenMinter() {
  const { userProfile, isAuthenticated, addTokens } = useAuth()
  const [allTokens, setAllTokens] = useKV<Record<string, BusinessToken>>('business-tokens', {})
  const [allTransactions, setAllTransactions] = useKV<Transaction[]>('all-transactions', [])
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [initialSupply, setInitialSupply] = useState('')
  const [businessName, setBusinessName] = useState('')

  const handleMintToken = async () => {
    if (!isAuthenticated || !userProfile) {
      toast.error('Please log in to mint tokens')
      return
    }

    if (!tokenName || !tokenSymbol || !initialSupply || !businessName) {
      toast.error('Please fill in all fields')
      return
    }

    const supply = parseInt(initialSupply)
    if (isNaN(supply) || supply <= 0) {
      toast.error('Invalid token supply')
      return
    }

    const symbolUpper = tokenSymbol.toUpperCase()

    if (allTokens && allTokens[symbolUpper]) {
      toast.error('Token symbol already exists')
      return
    }

    const newToken: BusinessToken = {
      symbol: symbolUpper,
      name: tokenName,
      totalSupply: supply,
      circulatingSupply: supply,
      businessName,
      createdAt: Date.now(),
      backedBy: 'infinity',
      mintedBy: userProfile.userId
    }

    const updatedTokens = { ...(allTokens || {}), [symbolUpper]: newToken }
    setAllTokens(updatedTokens)

    await addTokens(symbolUpper, supply)

    const mintTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'mint',
      tokenSymbol: symbolUpper,
      amount: supply,
      from: userProfile.userId,
      fromUsername: userProfile.username,
      to: userProfile.userId,
      toUsername: userProfile.username,
      timestamp: Date.now(),
      status: 'completed',
      note: `Minted ${tokenName} for ${businessName}`
    }

    setAllTransactions((currentTransactions) => [
      ...(currentTransactions || []),
      mintTransaction
    ])

    toast.success(`Successfully minted ${supply.toLocaleString()} ${symbolUpper} tokens!`)

    setTokenName('')
    setTokenSymbol('')
    setInitialSupply('')
    setBusinessName('')
  }

  const userTokens = userProfile?.businessTokens || {}
  const allTokensList = allTokens ? Object.values(allTokens) : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Business Token Minter
        </h2>
        <p className="text-muted-foreground">
          Create your own business token backed by Infinity ecosystem
        </p>
      </div>

      {allTokensList.length > 0 && (
        <TokenPriceChart tokenSymbol={allTokensList[0]?.symbol} />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 gradient-border">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Coins size={32} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Mint New Token</h3>
                <p className="text-sm text-muted-foreground">Launch your business currency</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="e.g., Infinity Marketplace"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                placeholder="e.g., Infinity Market Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-symbol">Token Symbol</Label>
              <Input
                id="token-symbol"
                placeholder="e.g., IMT"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-supply">Initial Supply</Label>
              <Input
                id="initial-supply"
                type="number"
                placeholder="e.g., 1000000"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
              />
            </div>

            <Button
              onClick={handleMintToken}
              className="w-full bg-gradient-to-r from-primary to-accent"
              disabled={!isAuthenticated}
            >
              <Coins size={20} weight="bold" className="mr-2" />
              Mint Token
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-muted-foreground">
                Please log in to mint tokens
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold">Your Token Balances</h3>
            </div>
            <div className="space-y-3">
              {Object.keys(userTokens).length > 0 ? (
                Object.entries(userTokens).map(([symbol, balance]) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <CurrencyDollar size={20} weight="duotone" className="text-accent" />
                      <span className="font-mono font-bold">{symbol}</span>
                    </div>
                    <span className="font-mono">{balance.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tokens yet. Mint your first token!
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <TrendUp size={24} weight="duotone" className="text-accent" />
              <h3 className="text-xl font-bold">Ecosystem Stats</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Tokens Created</span>
                <span className="font-bold">{allTokensList.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Your Holdings</span>
                <span className="font-bold">{Object.keys(userTokens).length} types</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Backed By</span>
                <Badge variant="default">Infinity</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {allTokensList.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">All Business Tokens</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTokensList.map((token) => (
              <Card key={token.symbol} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold">{token.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{token.symbol}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {token.backedBy}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">{token.businessName}</p>
                  <div className="text-xs text-muted-foreground">
                    Supply: {token.totalSupply.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(token.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
