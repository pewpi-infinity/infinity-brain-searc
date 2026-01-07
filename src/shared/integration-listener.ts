/**
 * Integration Listener Example
 * Demonstrates how to subscribe to wallet/login state changes
 * Use this in other repositories (banksy, v, infinity-brain-searc, repo-dashboard-hub, etc.)
 */

import { tokenService, type Token, type TokenEvent } from './services/token-service';
import { authService, type User } from './services/auth-service';

/**
 * Example 1: Listen for token creation events
 */
export function subscribeToTokenCreation(callback: (token: Token) => void): () => void {
  // Method 1: Use TokenService event system
  const unsubscribeService = tokenService.on('created', (event: TokenEvent) => {
    callback(event.token);
  });

  // Method 2: Use window events (cross-repo)
  const handleWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<Token>;
    callback(customEvent.detail);
  };

  window.addEventListener('pewpi.token.created', handleWindowEvent);

  // Return cleanup function
  return () => {
    unsubscribeService();
    window.removeEventListener('pewpi.token.created', handleWindowEvent);
  };
}

/**
 * Example 2: Listen for login state changes
 */
export function subscribeToLoginChanges(
  callback: (user: User | null, isAuthenticated: boolean) => void
): () => void {
  const handleLoginChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ user: User | null; isAuthenticated: boolean }>;
    callback(customEvent.detail.user, customEvent.detail.isAuthenticated);
  };

  window.addEventListener('pewpi.login.changed', handleLoginChange);

  return () => {
    window.removeEventListener('pewpi.login.changed', handleLoginChange);
  };
}

/**
 * Example 3: Sync token state across repositories
 */
export class CrossRepoTokenSync {
  private tokens: Token[] = [];
  private listeners: Set<(tokens: Token[]) => void> = new Set();

  async initialize(): Promise<void> {
    // Load initial tokens
    this.tokens = await tokenService.getAll();
    this.notifyListeners();

    // Subscribe to all token changes
    tokenService.on('all', async () => {
      this.tokens = await tokenService.getAll();
      this.notifyListeners();
    });

    // Listen for window events from other repos
    window.addEventListener('pewpi.token.created', async () => {
      this.tokens = await tokenService.getAll();
      this.notifyListeners();
    });
  }

  getTokens(): Token[] {
    return this.tokens;
  }

  onChange(callback: (tokens: Token[]) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.tokens));
  }
}

/**
 * Example 4: React Hook for token synchronization
 */
export function useTokenSync() {
  // Implementation would use React hooks
  // This is a TypeScript example showing the interface
  
  type UseTokenSyncReturn = {
    tokens: Token[];
    balance: number;
    isLoading: boolean;
    refresh: () => Promise<void>;
  };

  // Pseudo-code:
  // const [tokens, setTokens] = useState<Token[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  //
  // useEffect(() => {
  //   const unsubscribe = subscribeToTokenCreation((token) => {
  //     setTokens(prev => [...prev, token]);
  //   });
  //   return unsubscribe;
  // }, []);

  return {} as UseTokenSyncReturn;
}

/**
 * Example 5: Wallet balance watcher
 */
export class WalletBalanceWatcher {
  private balance: number = 0;
  private callbacks: Set<(balance: number) => void> = new Set();

  async start(): Promise<void> {
    // Initial balance
    await this.updateBalance();

    // Watch for changes
    tokenService.on('all', () => {
      this.updateBalance();
    });
  }

  private async updateBalance(): Promise<void> {
    const tokens = await tokenService.getAll();
    this.balance = tokens.reduce((sum, token) => sum + token.amount, 0);
    this.notify();
  }

  getBalance(): number {
    return this.balance;
  }

  onChange(callback: (balance: number) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notify(): void {
    this.callbacks.forEach(cb => cb(this.balance));
  }
}

/**
 * Example 6: Auto-track tokens and emit analytics
 */
export function initializeTokenAnalytics(): void {
  tokenService.initAutoTracking();

  tokenService.on('created', (event) => {
    console.log('📊 Analytics: Token created', {
      tokenId: event.token.id,
      creator: event.token.creator,
      amount: event.token.amount,
      timestamp: event.timestamp,
    });

    // Send to analytics service
    // analytics.track('token_created', { ... });
  });

  tokenService.on('updated', (event) => {
    console.log('📊 Analytics: Token updated', {
      tokenId: event.token.id,
      timestamp: event.timestamp,
    });
  });
}

/**
 * Example 7: Simple integration for any repo
 */
export async function simpleIntegration() {
  // 1. Import the services
  // import { tokenService, authService } from 'pewpi-shared-token';

  // 2. Get current state
  const currentUser = authService.getCurrentUser();
  const tokens = await tokenService.getAll();
  
  console.log('Current user:', currentUser);
  console.log('Total tokens:', tokens.length);

  // 3. Listen for changes
  subscribeToLoginChanges((user, isAuthenticated) => {
    console.log('Login state changed:', { user, isAuthenticated });
  });

  subscribeToTokenCreation((token) => {
    console.log('New token created:', token);
  });

  // 4. Create a token
  if (currentUser) {
    const newToken = await tokenService.createToken({
      name: 'My Token',
      symbol: 'MTK',
      amount: 1000,
      creator: currentUser.email || 'anonymous',
    });
    console.log('Created token:', newToken);
  }
}

// Export all for convenience
export {
  tokenService,
} from './services/token-service';

export {
  authService,
} from './services/auth-service';
