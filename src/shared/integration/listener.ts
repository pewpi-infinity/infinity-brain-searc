/**
 * Integration Listener - Example module for subscribing to token and login events
 * Demonstrates how other repositories can import and sync state
 */

import { TokenService, Token, TokenEvent } from '../token-service';
import { AuthService, User } from '../auth/auth-service';

export interface IntegrationConfig {
  repoName: string;
  onTokenCreated?: (token: Token) => void;
  onTokenUpdated?: (token: Token) => void;
  onTokenDeleted?: (tokenId: string) => void;
  onLoginChanged?: (user: User | null, loggedIn: boolean) => void;
  onTokensCleared?: () => void;
  autoInit?: boolean;
}

export class IntegrationListener {
  private config: IntegrationConfig;
  private unsubscribers: Array<() => void> = [];
  private initialized = false;

  constructor(config: IntegrationConfig) {
    this.config = {
      autoInit: true,
      ...config
    };

    if (this.config.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize event listeners
   */
  init(): void {
    if (this.initialized) {
      console.log('[IntegrationListener] Already initialized');
      return;
    }

    console.log(`[IntegrationListener] Initializing for ${this.config.repoName}`);

    // Subscribe to TokenService events
    if (this.config.onTokenCreated) {
      const unsubscribe = TokenService.on('created', (event: TokenEvent) => {
        this.config.onTokenCreated!(event.token);
      });
      this.unsubscribers.push(unsubscribe);
    }

    if (this.config.onTokenUpdated) {
      const unsubscribe = TokenService.on('updated', (event: TokenEvent) => {
        this.config.onTokenUpdated!(event.token);
      });
      this.unsubscribers.push(unsubscribe);
    }

    if (this.config.onTokenDeleted) {
      const unsubscribe = TokenService.on('deleted', (event: TokenEvent) => {
        this.config.onTokenDeleted!(event.token.id);
      });
      this.unsubscribers.push(unsubscribe);
    }

    // Listen for window events
    this.setupWindowListeners();

    // Initialize auto-tracking
    TokenService.initAutoTracking();

    this.initialized = true;
    console.log(`[IntegrationListener] Initialized successfully for ${this.config.repoName}`);
  }

  /**
   * Setup window event listeners
   */
  private setupWindowListeners(): void {
    // Token created event
    const handleTokenCreated = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Token created event in ${this.config.repoName}:`, e.detail);
      if (this.config.onTokenCreated && e.detail.token) {
        this.config.onTokenCreated(e.detail.token);
      }
    }) as EventListener;
    window.addEventListener('pewpi.token.created', handleTokenCreated);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.token.created', handleTokenCreated));

    // Token updated event
    const handleTokenUpdated = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Token updated event in ${this.config.repoName}:`, e.detail);
      if (this.config.onTokenUpdated && e.detail.token) {
        this.config.onTokenUpdated(e.detail.token);
      }
    }) as EventListener;
    window.addEventListener('pewpi.token.updated', handleTokenUpdated);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.token.updated', handleTokenUpdated));

    // Token deleted event
    const handleTokenDeleted = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Token deleted event in ${this.config.repoName}:`, e.detail);
      if (this.config.onTokenDeleted && e.detail.tokenId) {
        this.config.onTokenDeleted(e.detail.tokenId);
      }
    }) as EventListener;
    window.addEventListener('pewpi.token.deleted', handleTokenDeleted);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.token.deleted', handleTokenDeleted));

    // Tokens cleared event
    const handleTokensCleared = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Tokens cleared event in ${this.config.repoName}`);
      if (this.config.onTokensCleared) {
        this.config.onTokensCleared();
      }
    }) as EventListener;
    window.addEventListener('pewpi.tokens.cleared', handleTokensCleared);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.tokens.cleared', handleTokensCleared));

    // Login changed event
    const handleLoginChanged = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Login changed event in ${this.config.repoName}:`, e.detail);
      if (this.config.onLoginChanged) {
        this.config.onLoginChanged(e.detail.user, e.detail.loggedIn);
      }
    }) as EventListener;
    window.addEventListener('pewpi.login.changed', handleLoginChanged);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.login.changed', handleLoginChanged));
  }

  /**
   * Cleanup and remove all listeners
   */
  cleanup(): void {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
    this.initialized = false;
    console.log(`[IntegrationListener] Cleaned up for ${this.config.repoName}`);
  }

  /**
   * Get current authentication status
   */
  getAuthStatus(): { isAuthenticated: boolean; user: User | null } {
    return {
      isAuthenticated: AuthService.isAuthenticated(),
      user: AuthService.getCurrentUser()
    };
  }

  /**
   * Get all tokens
   */
  async getAllTokens(): Promise<Token[]> {
    return await TokenService.getAll();
  }

  /**
   * Get tokens by currency
   */
  async getTokensByCurrency(currency: Token['currency']): Promise<Token[]> {
    return await TokenService.getByCurrency(currency);
  }
}

/**
 * Create a new integration listener
 */
export function createIntegrationListener(config: IntegrationConfig): IntegrationListener {
  return new IntegrationListener(config);
}

/**
 * Example usage for different repositories
 */

// Example: Banksy integration
export function createBanskyIntegration() {
  return createIntegrationListener({
    repoName: 'banksy',
    onTokenCreated: (token) => {
      console.log('[Banksy] New token created:', token.name);
      // Update Banksy UI to reflect new token
    },
    onLoginChanged: (user, loggedIn) => {
      if (loggedIn) {
        console.log('[Banksy] User logged in:', user?.username);
        // Update Banksy navigation/UI
      } else {
        console.log('[Banksy] User logged out');
        // Clear Banksy user state
      }
    }
  });
}

// Example: V integration
export function createVIntegration() {
  return createIntegrationListener({
    repoName: 'v',
    onTokenCreated: (token) => {
      console.log('[V] New token created:', token.name);
    },
    onTokenUpdated: (token) => {
      console.log('[V] Token updated:', token.name);
    },
    onLoginChanged: (user, loggedIn) => {
      console.log('[V] Login status changed:', loggedIn);
    }
  });
}

// Example: Repo Dashboard Hub integration
export function createRepoDashboardIntegration() {
  return createIntegrationListener({
    repoName: 'repo-dashboard-hub',
    onTokenCreated: (token) => {
      console.log('[RepoDashboard] New token created:', token.name);
    },
    onTokensCleared: () => {
      console.log('[RepoDashboard] All tokens cleared');
    },
    onLoginChanged: (user, loggedIn) => {
      console.log('[RepoDashboard] Login status changed:', loggedIn);
    }
  });
}

// Example: Infinity Brain integration (this repo)
export function createInfinityBrainIntegration() {
  return createIntegrationListener({
    repoName: 'infinity-brain-searc',
    onTokenCreated: (token) => {
      console.log('[InfinityBrain] New token created:', token.name);
      // Update token balance display
    },
    onTokenUpdated: (token) => {
      console.log('[InfinityBrain] Token updated:', token.name);
    },
    onTokenDeleted: (tokenId) => {
      console.log('[InfinityBrain] Token deleted:', tokenId);
    },
    onLoginChanged: (user, loggedIn) => {
      if (loggedIn) {
        console.log('[InfinityBrain] User logged in:', user?.username);
      }
    }
  });
}
