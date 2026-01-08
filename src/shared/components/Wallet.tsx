/**
 * Wallet Component - Production wallet with balance, token list, and live feed
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { tokenService, type Token } from '../services/token-service';
import { useAuth } from '../hooks/useAuth';
import { Wallet as WalletIcon, Plus, Coins, Activity, TrendUp } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function Wallet() {
  const { user, isAuthenticated } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTokens();
    
    // Subscribe to token events for live updates
    const unsubscribe = tokenService.on('all', (event) => {
      console.log('Token event:', event);
      loadTokens();
      
      if (event.type === 'created') {
        toast.success('New token created!', {
          description: `${event.token.name} (${event.token.symbol})`,
        });
      }
    });

    // Listen for window events
    const handleTokenCreated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Window event: token created', customEvent.detail);
      loadTokens();
    };

    window.addEventListener('pewpi.token.created', handleTokenCreated);

    return () => {
      unsubscribe();
      window.removeEventListener('pewpi.token.created', handleTokenCreated);
    };
  }, []);

  const loadTokens = async () => {
    try {
      const allTokens = await tokenService.getAll();
      setTokens(allTokens);
      
      // Calculate total balance
      const total = allTokens.reduce((sum, token) => sum + token.amount, 0);
      setBalance(total);
    } catch (error) {
      console.error('Failed to load tokens', error);
      toast.error('Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateToken = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to create tokens');
      return;
    }

    try {
      const newToken = await tokenService.createToken({
        name: `Token ${Date.now()}`,
        symbol: `TKN${Math.floor(Math.random() * 1000)}`,
        amount: Math.floor(Math.random() * 1000) + 100,
        creator: user.email || user.githubLogin || 'anonymous',
        metadata: {
          createdVia: 'wallet-ui',
        },
      });

      toast.success('Token created successfully!');
    } catch (error: any) {
      toast.error('Failed to create token', {
        description: error.message,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Locked</CardTitle>
          <CardDescription>Please log in to access your wallet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <WalletIcon size={24} className="text-primary" weight="duotone" />
              </div>
              <div>
                <CardTitle>Total Balance</CardTitle>
                <CardDescription>
                  {tokens.length} token{tokens.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleCreateToken} size="sm">
              <Plus size={16} className="mr-2" weight="bold" />
              Create Token
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-4xl font-bold flex items-baseline gap-2">
              <Coins size={32} className="text-primary" weight="duotone" />
              {balance.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendUp size={16} weight="bold" className="text-green-500" />
              <span>All time holdings</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token List and Details */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">
            <Coins size={16} className="mr-2" weight="duotone" />
            Token List
          </TabsTrigger>
          <TabsTrigger value="feed">
            <Activity size={16} className="mr-2" weight="duotone" />
            Live Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Tokens</CardTitle>
              <CardDescription>
                Click on a token to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading tokens...
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
                  <p>No tokens yet</p>
                  <Button onClick={handleCreateToken} className="mt-4" variant="outline">
                    <Plus size={16} className="mr-2" weight="bold" />
                    Create your first token
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {tokens.map((token) => (
                      <TokenListItem
                        key={token.id}
                        token={token}
                        isSelected={selectedToken?.id === token.id}
                        onClick={() => setSelectedToken(token)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {selectedToken && (
            <Card>
              <CardHeader>
                <CardTitle>Token Details</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenDetails token={selectedToken} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Token Feed</CardTitle>
              <CardDescription>
                Real-time updates as tokens are created or modified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveTokenFeed />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TokenListItem({ token, isSelected, onClick }: {
  token: Token;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-medium">{token.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {token.symbol}
            </Badge>
            <span>by {token.creator}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{token.amount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(token.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </button>
  );
}

function TokenDetails({ token }: { token: Token }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Name</div>
          <div className="text-lg font-medium">{token.name}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Symbol</div>
          <div className="text-lg font-medium">{token.symbol}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Amount</div>
          <div className="text-lg font-medium">{token.amount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Creator</div>
          <div className="text-lg font-medium">{token.creator}</div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="text-sm font-medium text-muted-foreground mb-2">Metadata</div>
        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
          {JSON.stringify(token.metadata, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div>
          <div className="font-medium">Created</div>
          <div>{new Date(token.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <div className="font-medium">Updated</div>
          <div>{new Date(token.updatedAt).toLocaleString()}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <div className="font-medium">ID</div>
        <div className="font-mono break-all">{token.id}</div>
      </div>
    </div>
  );
}

function LiveTokenFeed() {
  const [events, setEvents] = useState<Array<{ timestamp: number; message: string; type: string }>>([]);

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const token = customEvent.detail;
      
      setEvents(prev => [
        {
          timestamp: Date.now(),
          message: `Token "${token.name}" (${token.symbol}) created by ${token.creator}`,
          type: 'created',
        },
        ...prev,
      ].slice(0, 50)); // Keep last 50 events
    };

    window.addEventListener('pewpi.token.created', handleEvent);

    return () => {
      window.removeEventListener('pewpi.token.created', handleEvent);
    };
  }, []);

  return (
    <ScrollArea className="h-[400px]">
      {events.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity size={48} className="mx-auto mb-4 opacity-50" weight="duotone" />
          <p>No activity yet</p>
          <p className="text-sm mt-2">Create a token to see live updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Activity size={20} className="text-primary flex-shrink-0 mt-0.5" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">{event.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
