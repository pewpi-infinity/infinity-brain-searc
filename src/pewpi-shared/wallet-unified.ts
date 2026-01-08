/**
 * Wallet Unified - Wallet helper functions
 * 
 * Synthesized from best practices across pewpi-infinity organization repositories
 * Features:
 * - earnTokens() - Add tokens to wallet
 * - spendTokens() - Deduct tokens from wallet
 * - getAllBalances() - Get balances grouped by creator
 * - Transaction history via localStorage
 * - Cross-tab storage event broadcasting
 */

import { tokenService, Token } from './token-service';

export interface WalletBalance {
  creator: string;
  totalAmount: number;
  tokens: Token[];
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  creator: string;
  description: string;
  timestamp: number;
}

class WalletService {
  /**
   * Earn tokens - create a new token or update existing
   */
  async earnTokens(params: {
    name: string;
    symbol: string;
    amount: number;
    creator: string;
    metadata?: Record<string, any>;
  }): Promise<Token> {
    const token = await tokenService.createToken({
      name: params.name,
      symbol: params.symbol,
      amount: params.amount,
      creator: params.creator,
      metadata: params.metadata,
    });

    // Record transaction
    await this.recordTransaction({
      type: 'earn',
      amount: params.amount,
      creator: params.creator,
      description: `Earned ${params.amount} ${params.symbol}`,
    });

    console.log(`Wallet: Earned ${params.amount} ${params.symbol}`);
    return token;
  }

  /**
   * Spend tokens - reduce amount or delete if insufficient
   */
  async spendTokens(params: {
    tokenId: string;
    amount: number;
    description?: string;
  }): Promise<boolean> {
    const token = await tokenService.getById(params.tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    if (token.amount < params.amount) {
      throw new Error('Insufficient token balance');
    }

    const newAmount = token.amount - params.amount;

    if (newAmount === 0) {
      // Delete token if balance reaches zero
      await tokenService.deleteToken(params.tokenId);
    } else {
      // Update token with new amount
      await tokenService.updateToken(params.tokenId, { amount: newAmount });
    }

    // Record transaction
    await this.recordTransaction({
      type: 'spend',
      amount: params.amount,
      creator: token.creator,
      description: params.description || `Spent ${params.amount} ${token.symbol}`,
    });

    console.log(`Wallet: Spent ${params.amount} ${token.symbol}`);
    return true;
  }

  /**
   * Get all balances grouped by creator
   */
  async getAllBalances(): Promise<WalletBalance[]> {
    const tokens = await tokenService.getAll();
    const balanceMap = new Map<string, WalletBalance>();

    for (const token of tokens) {
      const existing = balanceMap.get(token.creator);
      if (existing) {
        existing.totalAmount += token.amount;
        existing.tokens.push(token);
      } else {
        balanceMap.set(token.creator, {
          creator: token.creator,
          totalAmount: token.amount,
          tokens: [token],
        });
      }
    }

    return Array.from(balanceMap.values());
  }

  /**
   * Get balance for a specific creator
   */
  async getBalanceForCreator(creator: string): Promise<number> {
    return await tokenService.getBalance(creator);
  }

  /**
   * Get total balance across all tokens
   */
  async getTotalBalance(): Promise<number> {
    return await tokenService.getTotalBalance();
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 50): Promise<Transaction[]> {
    try {
      const data = localStorage.getItem('pewpi_transactions');
      const transactions: Transaction[] = data ? JSON.parse(data) : [];
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Wallet: Failed to get transaction history', error);
      return [];
    }
  }

  /**
   * Record a transaction
   */
  private async recordTransaction(params: {
    type: 'earn' | 'spend';
    amount: number;
    creator: string;
    description: string;
  }): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.generateId(),
      ...params,
      timestamp: Date.now(),
    };

    try {
      const data = localStorage.getItem('pewpi_transactions');
      const transactions: Transaction[] = data ? JSON.parse(data) : [];
      
      // Add new transaction at the beginning
      transactions.unshift(transaction);
      
      // Keep only last 100 transactions
      const limited = transactions.slice(0, 100);
      
      localStorage.setItem('pewpi_transactions', JSON.stringify(limited));

      // Broadcast transaction event
      this.broadcastTransactionEvent(transaction);
    } catch (error) {
      console.error('Wallet: Failed to record transaction', error);
    }

    return transaction;
  }

  /**
   * Clear transaction history
   */
  async clearTransactionHistory(): Promise<void> {
    try {
      localStorage.removeItem('pewpi_transactions');
      console.log('Wallet: Transaction history cleared');
    } catch (error) {
      console.error('Wallet: Failed to clear transaction history', error);
    }
  }

  /**
   * Broadcast transaction event for cross-tab sync
   */
  private broadcastTransactionEvent(transaction: Transaction): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('pewpi.wallet.transaction', {
        detail: transaction,
      });
      window.dispatchEvent(event);

      // Also broadcast via localStorage
      try {
        const syncKey = `pewpi.wallet.transaction_${Date.now()}`;
        localStorage.setItem(syncKey, JSON.stringify(transaction));
        setTimeout(() => localStorage.removeItem(syncKey), 1000);
      } catch (error) {
        console.error('Wallet: Failed to broadcast transaction event', error);
      }
    }
  }

  private generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `tx_${Date.now()}_${hex.substring(0, 16)}`;
  }
}

// Export singleton instance
export const walletService = new WalletService();

// Export helper functions for convenience
export const earnTokens = walletService.earnTokens.bind(walletService);
export const spendTokens = walletService.spendTokens.bind(walletService);
export const getAllBalances = walletService.getAllBalances.bind(walletService);
export const getBalanceForCreator = walletService.getBalanceForCreator.bind(walletService);
export const getTotalBalance = walletService.getTotalBalance.bind(walletService);
export const getTransactionHistory = walletService.getTransactionHistory.bind(walletService);
