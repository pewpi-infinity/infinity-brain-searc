/**
 * Wallet Component
 * 
 * Displays user's token balance, token list, and live feed
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet as WalletIcon, Plus, TrendingUp, Activity } from 'lucide-react';
import { tokenService, Token } from '@/shared/wallet/token-service';
import { toast } from 'sonner';

interface WalletProps {
  userId?: string;
}

export function Wallet({ userId }: WalletProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
    
    // Initialize auto-tracking
    tokenService.initAutoTracking();
    
    // Listen for token events
    const unsubscribeCreated = tokenService.on('pewpi.token.created', handleTokenCreated);
    const unsubscribeUpdated = tokenService.on('pewpi.token.updated', handleTokenUpdated);
    const unsubscribeSynced = tokenService.on('pewpi.tokens.synced', handleTokensSynced);
    
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeSynced();
    };
  }, []);

  const loadWalletData = async () => {
    try {
      const [allTokens, balance, value] = await Promise.all([
        tokenService.getAll(),
        tokenService.getTotalBalance(),
        tokenService.getTotalValue()
      ]);
      
      setTokens(allTokens);
      setTotalBalance(balance);
      setTotalValue(value);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast.error('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenCreated = (token: Token) => {
    setTokens(prev => [...prev, token]);
    loadWalletData();
    toast.success('Token created!', {
      description: `${token.name} (${token.symbol}) added to wallet`
    });
  };

  const handleTokenUpdated = (token: Token) => {
    setTokens(prev => prev.map(t => t.id === token.id ? token : t));
    loadWalletData();
  };

  const handleTokensSynced = () => {
    loadWalletData();
    toast.info('Wallet synced', {
      description: 'Tokens updated from another tab'
    });
  };

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-primary" />
              <CardTitle>My Wallet</CardTitle>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
          </div>
          <CardDescription>
            Your tokens and balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">{totalBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatValue(totalValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Token List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tokens...
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No tokens yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Token
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {tokens.map((token, index) => (
                  <div key={token.id}>
                    {index > 0 && <Separator className="my-2" />}
                    <button
                      onClick={() => setSelectedToken(token)}
                      className="w-full text-left hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {token.metadata.icon && (
                            <span className="text-2xl">{token.metadata.icon}</span>
                          )}
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-sm text-muted-foreground">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{token.balance.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatValue(token.balance * token.value)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Token Detail Dialog */}
      <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedToken?.metadata.icon && (
                <span className="text-2xl">{selectedToken.metadata.icon}</span>
              )}
              {selectedToken?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedToken?.metadata.description || 'Token details'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedToken && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Symbol</p>
                  <p className="font-medium">{selectedToken.symbol}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-medium">{selectedToken.balance.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unit Value</p>
                  <p className="font-medium">{formatValue(selectedToken.value)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-medium">
                    {formatValue(selectedToken.balance * selectedToken.value)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Source</p>
                <Badge>{selectedToken.metadata.source}</Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(selectedToken.metadata.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">
                  {new Date(selectedToken.metadata.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Token Dialog - Will be implemented in CreateTokenForm */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Token</DialogTitle>
            <DialogDescription>
              Add a new token to your wallet
            </DialogDescription>
          </DialogHeader>
          <CreateTokenForm onSuccess={() => {
            setIsCreateDialogOpen(false);
            loadWalletData();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple create token form
function CreateTokenForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState('100');
  const [value, setValue] = useState('1.0');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💎');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await tokenService.createToken({
        name,
        symbol: symbol.toUpperCase(),
        balance: parseFloat(balance),
        value: parseFloat(value),
        metadata: {
          description,
          icon,
          source: 'infinity-brain-searc'
        }
      });

      toast.success('Token created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create token:', error);
      toast.error('Failed to create token');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Token Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Infinity Token"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="INF"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="💎"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Initial Balance</label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="100"
            className="w-full px-3 py-2 border rounded-md"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Unit Value ($)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="1.0"
            className="w-full px-3 py-2 border rounded-md"
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this token for?"
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Token'}
      </Button>
    </form>
  );
}
