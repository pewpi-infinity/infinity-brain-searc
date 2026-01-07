/**
 * Wallet UI - Balance display, token list, token detail, and live feed
 */

import { useState, useEffect } from 'react';
import { TokenService, Token } from '../token-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/react-scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, TrendingUp, Activity, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

interface WalletUIProps {
  open: boolean;
  onClose: () => void;
}

export function WalletUI({ open, onClose }: WalletUIProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    byType: {
      infinity_tokens: 0,
      research_tokens: 0,
      art_tokens: 0,
      music_tokens: 0
    },
    totalValue: 0
  });
  const [feedEvents, setFeedEvents] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    if (open) {
      loadTokens();
      loadStats();
      
      // Subscribe to token events
      const unsubscribeCreated = TokenService.on('created', (event) => {
        addFeedEvent('created', `New token created: ${event.token.name}`);
        loadTokens();
        loadStats();
        toast.success(`Token created: ${event.token.name}`, {
          description: `${event.token.amount} ${event.token.symbol}`
        });
      });

      const unsubscribeUpdated = TokenService.on('updated', (event) => {
        addFeedEvent('updated', `Token updated: ${event.token.name}`);
        loadTokens();
        loadStats();
      });

      const unsubscribeDeleted = TokenService.on('deleted', (event) => {
        addFeedEvent('deleted', `Token deleted: ${event.token.name}`);
        loadTokens();
        loadStats();
      });

      // Initialize auto-tracking
      TokenService.initAutoTracking();

      return () => {
        unsubscribeCreated();
        unsubscribeUpdated();
        unsubscribeDeleted();
      };
    }
  }, [open]);

  const loadTokens = async () => {
    const allTokens = await TokenService.getAll();
    setTokens(allTokens);
  };

  const loadStats = async () => {
    const newStats = await TokenService.getStats();
    setStats(newStats);
  };

  const addFeedEvent = (type: string, message: string) => {
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setFeedEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
  };

  const getCurrencyColor = (currency: Token['currency']) => {
    const colors = {
      infinity_tokens: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      research_tokens: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      art_tokens: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
      music_tokens: 'bg-green-500/20 text-green-700 dark:text-green-300'
    };
    return colors[currency];
  };

  const getCurrencyEmoji = (currency: Token['currency']) => {
    const emojis = {
      infinity_tokens: '💎',
      research_tokens: '📚',
      art_tokens: '🎨',
      music_tokens: '🎵'
    };
    return emojis[currency];
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            My Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="feed">Live Feed</TabsTrigger>
          </TabsList>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Total Balance
                </CardTitle>
                <CardDescription>
                  Your total token value across all currencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  ${formatCurrency(stats.totalValue)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(stats.byType).map(([currency, count]) => (
                    <Card key={currency} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{getCurrencyEmoji(currency as Token['currency'])}</span>
                        <Badge className={getCurrencyColor(currency as Token['currency'])}>
                          {count}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium capitalize">
                        {currency.replace('_', ' ')}
                      </p>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Tokens</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {tokens.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tokens yet</p>
                    <p className="text-sm mt-2">Create your first token to get started</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-2">
                  {tokens.map((token) => (
                    <Card
                      key={token.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedToken(token)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getCurrencyEmoji(token.currency)}
                          </div>
                          <div>
                            <p className="font-semibold">{token.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {token.symbol} • {formatCurrency(token.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${formatCurrency(token.value)}</p>
                          <Badge className={getCurrencyColor(token.currency)}>
                            {token.currency.replace('_tokens', '')}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Live Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Token Feed
                </CardTitle>
                <CardDescription>
                  Real-time updates on token events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {feedEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                      <p className="text-sm mt-2">Token events will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {feedEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="mt-1">
                            {event.type === 'created' && (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            )}
                            {event.type === 'updated' && (
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                            )}
                            {event.type === 'deleted' && (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{event.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Token Detail Dialog */}
        {selectedToken && (
          <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getCurrencyEmoji(selectedToken.currency)}</span>
                  {selectedToken.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Symbol</p>
                    <p className="font-bold">{selectedToken.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-bold">{formatCurrency(selectedToken.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-bold">${formatCurrency(selectedToken.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge className={getCurrencyColor(selectedToken.currency)}>
                      {selectedToken.currency.replace('_tokens', '')}
                    </Badge>
                  </div>
                </div>
                
                {selectedToken.source && (
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium">{selectedToken.source}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(selectedToken.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedToken.metadata && Object.keys(selectedToken.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(selectedToken.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
