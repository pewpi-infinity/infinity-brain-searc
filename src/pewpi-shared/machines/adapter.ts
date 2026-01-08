/**
 * State Machine Adapter
 * Provides state machine patterns for auth and wallet operations
 * 
 * This adapter wraps existing services with state machine concepts
 * for predictable state transitions and side effect management.
 */

import { authService } from '../auth-service';
import { tokenService } from '../token-service';
import { walletUnified } from '../wallet-unified';
import type { User } from '../auth-service';
import type { Token } from '../token-service';

/**
 * Auth state machine states
 */
export type AuthState = 
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

/**
 * Auth state machine context
 */
export interface AuthContext {
  state: AuthState;
  user: User | null;
  error: string | null;
}

/**
 * Wallet state machine states
 */
export type WalletState = 
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

/**
 * Wallet state machine context
 */
export interface WalletContext {
  state: WalletState;
  tokens: Token[];
  balance: number;
  error: string | null;
}

/**
 * Auth State Machine Adapter
 * Manages authentication state transitions
 */
export class AuthStateMachine {
  private context: AuthContext = {
    state: 'idle',
    user: null,
    error: null,
  };

  private listeners: Set<(context: AuthContext) => void> = new Set();

  /**
   * Initialize and restore session
   */
  async initialize(): Promise<void> {
    this.transition('loading');

    try {
      const user = await authService.restoreSession();
      
      if (user) {
        this.transition('authenticated', { user });
      } else {
        this.transition('unauthenticated');
      }
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Login with magic link
   */
  async loginWithMagicLink(token: string): Promise<void> {
    this.transition('loading');

    try {
      const user = await authService.loginWithMagicLink(token);
      this.transition('authenticated', { user });
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Login with GitHub user
   */
  async loginWithGitHub(githubUser: any): Promise<void> {
    this.transition('loading');

    try {
      const user = await authService.loginWithGitHubUser(githubUser);
      this.transition('authenticated', { user });
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    this.transition('loading');

    try {
      await authService.logout();
      this.transition('unauthenticated');
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Get current context
   */
  getContext(): AuthContext {
    return { ...this.context };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (context: AuthContext) => void): () => void {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.getContext());

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Internal state transition
   */
  private transition(state: AuthState, updates: Partial<AuthContext> = {}): void {
    this.context = {
      ...this.context,
      state,
      ...updates,
    };

    // Reset error on successful transitions
    if (state !== 'error') {
      this.context.error = null;
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(this.getContext()));
  }
}

/**
 * Wallet State Machine Adapter
 * Manages wallet state transitions
 */
export class WalletStateMachine {
  private context: WalletContext = {
    state: 'idle',
    tokens: [],
    balance: 0,
    error: null,
  };

  private listeners: Set<(context: WalletContext) => void> = new Set();

  /**
   * Initialize and load wallet
   */
  async initialize(): Promise<void> {
    this.transition('loading');

    try {
      const balance = await walletUnified.getBalance();
      
      this.transition('ready', {
        tokens: balance.tokens,
        balance: balance.total,
      });

      // Subscribe to changes
      walletUnified.onBalanceChange((newBalance) => {
        this.context.tokens = newBalance.tokens;
        this.context.balance = newBalance.total;
        this.notify();
      });
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Create a token
   */
  async createToken(params: {
    name: string;
    symbol: string;
    amount: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await walletUnified.createToken(params);
      // Balance change handler will update state automatically
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Delete a token
   */
  async deleteToken(tokenId: string): Promise<void> {
    try {
      await walletUnified.deleteToken(tokenId);
      // Balance change handler will update state automatically
    } catch (error: any) {
      this.transition('error', { error: error.message });
    }
  }

  /**
   * Get current context
   */
  getContext(): WalletContext {
    return { ...this.context };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (context: WalletContext) => void): () => void {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.getContext());

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Internal state transition
   */
  private transition(state: WalletState, updates: Partial<WalletContext> = {}): void {
    this.context = {
      ...this.context,
      state,
      ...updates,
    };

    // Reset error on successful transitions
    if (state !== 'error') {
      this.context.error = null;
    }

    this.notify();
  }

  /**
   * Notify listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener(this.getContext()));
  }
}

// Export singleton instances
export const authStateMachine = new AuthStateMachine();
export const walletStateMachine = new WalletStateMachine();
