/**
 * Wallet Unified Adapter
 * Provides unified wrapper functions for wallet operations
 * Re-exports and wraps existing wallet functionality from src/shared
 * 
 * This is a non-destructive adapter that provides a unified interface.
 */

import { tokenService } from './token-service';
import type { Token } from './token-service';
import { authService } from './auth-service';
import type { User } from './auth-service';

/**
 * Wallet balance information
 */
export interface WalletBalance {
  total: number;
  tokenCount: number;
  tokens: Token[];
}

/**
 * Wallet operations unified interface
 */
export class WalletUnified {
  /**
   * Get current wallet balance and token summary
   */
  async getBalance(userId?: string): Promise<WalletBalance> {
    const tokens = userId
      ? await tokenService.getTokensByCreator(userId)
      : await tokenService.getAll();

    const total = tokens.reduce((sum, token) => sum + token.amount, 0);

    return {
      total,
      tokenCount: tokens.length,
      tokens,
    };
  }

  /**
   * Get all tokens for the current user
   */
  async getTokens(): Promise<Token[]> {
    const user = authService.getCurrentUser();
    if (!user) {
      return [];
    }

    const userId = user.email || user.githubLogin || '';
    return tokenService.getTokensByCreator(userId);
  }

  /**
   * Create a new token for the current user
   */
  async createToken(params: {
    name: string;
    symbol: string;
    amount: number;
    metadata?: Record<string, any>;
  }): Promise<Token> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to create tokens');
    }

    const creator = user.email || user.githubLogin || 'anonymous';

    return tokenService.createToken({
      name: params.name,
      symbol: params.symbol,
      amount: params.amount,
      creator,
      metadata: params.metadata,
    });
  }

  /**
   * Update an existing token
   */
  async updateToken(
    tokenId: string,
    updates: Partial<Omit<Token, 'id' | 'createdAt' | 'creator'>>
  ): Promise<Token | undefined> {
    return tokenService.updateToken(tokenId, updates);
  }

  /**
   * Delete a token
   */
  async deleteToken(tokenId: string): Promise<boolean> {
    return tokenService.deleteToken(tokenId);
  }

  /**
   * Export wallet data as JSON
   */
  async exportWallet(): Promise<string> {
    return tokenService.exportTokens();
  }

  /**
   * Import wallet data from JSON
   */
  async importWallet(jsonData: string): Promise<number> {
    return tokenService.importTokens(jsonData);
  }

  /**
   * Subscribe to wallet balance changes
   */
  onBalanceChange(callback: (balance: WalletBalance) => void): () => void {
    const updateBalance = async () => {
      const balance = await this.getBalance();
      callback(balance);
    };

    // Subscribe to all token events
    const unsubscribe = tokenService.on('all', () => {
      updateBalance();
    });

    // Initial call
    updateBalance();

    return unsubscribe;
  }

  /**
   * Subscribe to token changes
   */
  onTokenChange(callback: (tokens: Token[]) => void): () => void {
    const updateTokens = async () => {
      const tokens = await this.getTokens();
      callback(tokens);
    };

    // Subscribe to all token events
    const unsubscribe = tokenService.on('all', () => {
      updateTokens();
    });

    // Initial call
    updateTokens();

    return unsubscribe;
  }
}

// Export singleton instance
export const walletUnified = new WalletUnified();

// Re-export token service and auth service for convenience
export { tokenService, authService };
export type { Token, User };
