/**
 * Integration Listener - Utility to subscribe to cross-repo events
 * 
 * Synthesized from best practices across pewpi-infinity organization repositories
 * Features:
 * - Subscribe to cross-repo events and forward them
 * - Listen for pewpi.token.created, pewpi.token.updated, pewpi.token.deleted
 * - Listen for pewpi.login.changed
 * - Cross-tab synchronization support
 */

import { Token, tokenService } from './token-service';
import { User, authService } from './auth-service';

export interface IntegrationConfig {
  repoName: string;
  onTokenCreated?: (token: Token) => void;
  onTokenUpdated?: (token: Token) => void;
  onTokenDeleted?: (token: Token) => void;
  onLoginChanged?: (user: User | null, isAuthenticated: boolean) => void;
  autoInit?: boolean;
}

export class IntegrationListener {
  private config: IntegrationConfig;
  private unsubscribers: Array<() => void> = [];
  private initialized = false;

  constructor(config: IntegrationConfig) {
    this.config = {
      autoInit: true,
      ...config,
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
      console.log(`[IntegrationListener] Already initialized for ${this.config.repoName}`);
      return;
    }

    console.log(`[IntegrationListener] Initializing for ${this.config.repoName}`);

    // Subscribe to TokenService events
    if (this.config.onTokenCreated) {
      const unsubscribe = tokenService.on('created', (event) => {
        this.config.onTokenCreated!(event.token);
      });
      this.unsubscribers.push(unsubscribe);
    }

    if (this.config.onTokenUpdated) {
      const unsubscribe = tokenService.on('updated', (event) => {
        this.config.onTokenUpdated!(event.token);
      });
      this.unsubscribers.push(unsubscribe);
    }

    if (this.config.onTokenDeleted) {
      const unsubscribe = tokenService.on('deleted', (event) => {
        this.config.onTokenDeleted!(event.token);
      });
      this.unsubscribers.push(unsubscribe);
    }

    // Listen for window events (from other repos or tabs)
    this.setupWindowListeners();

    // Initialize auto-tracking
    tokenService.initAutoTracking();

    this.initialized = true;
    console.log(`[IntegrationListener] Initialized successfully for ${this.config.repoName}`);
  }

  /**
   * Setup window event listeners for cross-repo integration
   */
  private setupWindowListeners(): void {
    // Token created event
    const handleTokenCreated = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Token created event in ${this.config.repoName}:`, e.detail);
      if (this.config.onTokenCreated && e.detail) {
        this.config.onTokenCreated(e.detail);
      }
    }) as EventListener;
    window.addEventListener('pewpi.token.created', handleTokenCreated);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.token.created', handleTokenCreated));

    // Token updated event
    const handleTokenUpdated = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Token updated event in ${this.config.repoName}:`, e.detail);
      if (this.config.onTokenUpdated && e.detail) {
        this.config.onTokenUpdated(e.detail);
      }
    }) as EventListener;
    window.addEventListener('pewpi.token.updated', handleTokenUpdated);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.token.updated', handleTokenUpdated));

    // Token deleted event
    const handleTokenDeleted = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Token deleted event in ${this.config.repoName}:`, e.detail);
      if (this.config.onTokenDeleted && e.detail) {
        this.config.onTokenDeleted(e.detail);
      }
    }) as EventListener;
    window.addEventListener('pewpi.token.deleted', handleTokenDeleted);
    this.unsubscribers.push(() => window.removeEventListener('pewpi.token.deleted', handleTokenDeleted));

    // Login changed event
    const handleLoginChanged = ((e: CustomEvent) => {
      console.log(`[IntegrationListener] Login changed event in ${this.config.repoName}:`, e.detail);
      if (this.config.onLoginChanged) {
        this.config.onLoginChanged(e.detail.user, e.detail.isAuthenticated);
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
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
    };
  }

  /**
   * Get all tokens
   */
  async getAllTokens(): Promise<Token[]> {
    return await tokenService.getAll();
  }
}

/**
 * Create a new integration listener
 */
export function createIntegrationListener(config: IntegrationConfig): IntegrationListener {
  return new IntegrationListener(config);
}

/**
 * Example: Create integration for infinity-brain-searc
 */
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
    onTokenDeleted: (token) => {
      console.log('[InfinityBrain] Token deleted:', token.id);
    },
    onLoginChanged: (user, isAuthenticated) => {
      if (isAuthenticated) {
        console.log('[InfinityBrain] User logged in:', user?.name || user?.email);
      } else {
        console.log('[InfinityBrain] User logged out');
      }
    },
  });
}
