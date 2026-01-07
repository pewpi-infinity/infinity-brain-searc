/**
 * Demo Integration Component
 * 
 * Demonstrates the full integration of login, wallet, and token sync
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Wallet as WalletIcon, Activity, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

// Import shared libraries
import { magicLinkAuth } from '@/shared/auth/magic-link-auth';
import { tokenService } from '@/shared/wallet/token-service';
import { initializeAutoSync, subscribeToIntegrationEvents } from '@/shared/hooks/integration-hooks';

// Import components
import { LoginModal } from '@/components/LoginModal';
import { Wallet } from '@/components/WalletComponent';
import { LiveTokenFeed } from '@/components/LiveTokenFeed';

export function DemoIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalBalance: 0,
    totalValue: 0
  });

  useEffect(() => {
    // Initialize auto-sync on mount
    initializeAutoSync();

    // Check if already authenticated
    const currentUser = magicLinkAuth.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }

    // Subscribe to integration events
    const unsubscribe = subscribeToIntegrationEvents({
      onTokenCreated: (token) => {
        toast.success('Token created!', {
          description: `${token.name} (${token.symbol})`
        });
        loadStats();
      },
      onTokenUpdated: (token) => {
        toast.info('Token updated', {
          description: token.name
        });
        loadStats();
      },
      onTokensSynced: () => {
        toast.info('Wallet synced from another tab');
        loadStats();
      },
      onLoginChanged: ({ user: newUser, action }) => {
        if (action === 'login' && newUser) {
          setIsAuthenticated(true);
          setUser(newUser);
          toast.success('Welcome!', {
            description: `Signed in as ${newUser.email}`
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
          toast.info('Signed out');
        }
      }
    });

    // Load initial stats
    loadStats();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadStats = async () => {
    const tokens = await tokenService.getAll();
    const balance = await tokenService.getTotalBalance();
    const value = await tokenService.getTotalValue();

    setStats({
      totalTokens: tokens.length,
      totalBalance: balance,
      totalValue: value
    });
  };

  const handleSignOut = async () => {
    await magicLinkAuth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLoginSuccess = () => {
    const currentUser = magicLinkAuth.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
    setShowLoginModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Pewpi Integration Demo</CardTitle>
              <CardDescription>
                Production login, wallet, and token sync system
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <Badge variant="secondary" className="text-xs">
                      {user?.authMethod === 'magic-link' ? '🔗 Magic Link' : '🔐 GitHub'}
                    </Badge>
                  </div>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowLoginModal(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.totalTokens}</p>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.totalBalance.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Balance</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">
                ${stats.totalValue.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <User className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium mb-2">Sign in to access your wallet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Use magic link (no password) or GitHub OAuth
                </p>
                <Button onClick={() => setShowLoginModal(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && (
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <Wallet userId={user?.id} />
          </TabsContent>

          <TabsContent value="feed" className="space-y-4">
            <LiveTokenFeed />
          </TabsContent>
        </Tabs>
      )}

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integration Status</CardTitle>
          <CardDescription>
            System status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage Backend</span>
            <Badge variant="outline">
              {typeof indexedDB !== 'undefined' ? 'IndexedDB' : 'localStorage'}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Auto-Sync</span>
            <Badge variant="outline">Enabled</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cross-Tab Sync</span>
            <Badge variant="outline">Active</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P2P Sync</span>
            <Badge variant="secondary">Optional (Stub)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
