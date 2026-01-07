/**
 * LiveTokenFeed Component
 * 
 * Displays real-time token creation and update events
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Plus, Edit } from 'lucide-react';
import { tokenService, Token } from '@/shared/wallet/token-service';

interface FeedItem {
  id: string;
  type: 'created' | 'updated' | 'synced';
  token?: Token;
  timestamp: Date;
  message: string;
}

export function LiveTokenFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Listen for token events
    const unsubscribeCreated = tokenService.on('pewpi.token.created', (token: Token) => {
      addFeedItem({
        id: `feed_${Date.now()}_${Math.random()}`,
        type: 'created',
        token,
        timestamp: new Date(),
        message: `New token created: ${token.name}`
      });
    });

    const unsubscribeUpdated = tokenService.on('pewpi.token.updated', (token: Token) => {
      addFeedItem({
        id: `feed_${Date.now()}_${Math.random()}`,
        type: 'updated',
        token,
        timestamp: new Date(),
        message: `Token updated: ${token.name}`
      });
    });

    const unsubscribeSynced = tokenService.on('pewpi.tokens.synced', () => {
      addFeedItem({
        id: `feed_${Date.now()}_${Math.random()}`,
        type: 'synced',
        timestamp: new Date(),
        message: 'Wallet synced from another tab'
      });
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeSynced();
    };
  }, []);

  const addFeedItem = (item: FeedItem) => {
    if (!isLive) return;
    
    setFeedItems(prev => [item, ...prev].slice(0, 50)); // Keep last 50 items
  };

  const getFeedIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'synced':
        return <Activity className="w-4 h-4 text-purple-500" />;
    }
  };

  const getFeedBadgeVariant = (type: FeedItem['type']): 'default' | 'secondary' | 'outline' => {
    switch (type) {
      case 'created':
        return 'default';
      case 'updated':
        return 'secondary';
      case 'synced':
        return 'outline';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Live Token Feed
            {isLive && (
              <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            )}
          </CardTitle>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {feedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Create a token to see live updates</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {feedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">{getFeedIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getFeedBadgeVariant(item.type)} className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{item.message}</p>
                    {item.token && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        {item.token.metadata.icon && (
                          <span>{item.token.metadata.icon}</span>
                        )}
                        <span>{item.token.symbol}</span>
                        <span>•</span>
                        <span>{item.token.balance.toLocaleString()} tokens</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
