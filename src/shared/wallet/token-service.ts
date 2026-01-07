/**
 * TokenService - Production-grade token management with IndexedDB persistence
 * 
 * Features:
 * - IndexedDB storage via Dexie with localStorage fallback
 * - Auto-tracking and real-time sync
 * - Event emission for cross-repo integration
 * - CRUD operations for tokens
 */

import Dexie, { Table } from 'dexie';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    source: string;
    description?: string;
    icon?: string;
  };
}

export interface TokenTransaction {
  id: string;
  tokenId: string;
  type: 'earn' | 'spend' | 'transfer';
  amount: number;
  timestamp: string;
  source: string;
  description: string;
}

class TokenDatabase extends Dexie {
  tokens!: Table<Token, string>;
  transactions!: Table<TokenTransaction, string>;

  constructor() {
    super('PewpiTokenDatabase');
    
    this.version(1).stores({
      tokens: 'id, name, symbol, balance',
      transactions: 'id, tokenId, timestamp, type'
    });
  }
}

class TokenService {
  private db: TokenDatabase;
  private fallbackStorage: Map<string, Token>;
  private useIndexedDB: boolean;
  private autoTrackingEnabled: boolean;
  private eventListeners: Map<string, Set<(data: any) => void>>;

  constructor() {
    this.db = new TokenDatabase();
    this.fallbackStorage = new Map();
    this.useIndexedDB = true;
    this.autoTrackingEnabled = false;
    this.eventListeners = new Map();
    
    // Test IndexedDB availability
    this.testIndexedDB();
    
    // Load from localStorage if IndexedDB fails
    this.loadFromLocalStorage();
  }

  private async testIndexedDB(): Promise<void> {
    try {
      await this.db.tokens.count();
    } catch (error) {
      console.warn('IndexedDB not available, falling back to localStorage:', error);
      this.useIndexedDB = false;
    }
  }

  private loadFromLocalStorage(): void {
    if (this.useIndexedDB) return;
    
    try {
      const stored = localStorage.getItem('pewpi_tokens');
      if (stored) {
        const tokens = JSON.parse(stored) as Token[];
        tokens.forEach(token => this.fallbackStorage.set(token.id, token));
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    if (this.useIndexedDB) return;
    
    try {
      const tokens = Array.from(this.fallbackStorage.values());
      localStorage.setItem('pewpi_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private emit(eventName: string, data: Token | TokenTransaction | { tokens?: Token[]; id?: string }): void {
    // Emit custom window event for cross-repo integration
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    
    // Call registered listeners
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  public on(eventName: string, listener: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName)!.add(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Create a new token
   */
  async createToken(token: Omit<Token, 'id' | 'metadata'> & { metadata?: Partial<Token['metadata']> }): Promise<Token> {
    const now = new Date().toISOString();
    const newToken: Token = {
      id: `token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: token.name,
      symbol: token.symbol,
      balance: token.balance,
      value: token.value,
      metadata: {
        createdAt: now,
        updatedAt: now,
        source: token.metadata?.source || 'infinity-brain-searc',
        description: token.metadata?.description,
        icon: token.metadata?.icon,
      }
    };

    if (this.useIndexedDB) {
      try {
        await this.db.tokens.add(newToken);
      } catch (error) {
        console.error('Failed to add token to IndexedDB:', error);
        this.fallbackStorage.set(newToken.id, newToken);
        this.saveToLocalStorage();
      }
    } else {
      this.fallbackStorage.set(newToken.id, newToken);
      this.saveToLocalStorage();
    }

    // Emit token created event
    this.emit('pewpi.token.created', newToken);

    return newToken;
  }

  /**
   * Get all tokens
   */
  async getAll(): Promise<Token[]> {
    if (this.useIndexedDB) {
      try {
        return await this.db.tokens.toArray();
      } catch (error) {
        console.error('Failed to get tokens from IndexedDB:', error);
        return Array.from(this.fallbackStorage.values());
      }
    } else {
      return Array.from(this.fallbackStorage.values());
    }
  }

  /**
   * Get a single token by ID
   */
  async getById(id: string): Promise<Token | undefined> {
    if (this.useIndexedDB) {
      try {
        return await this.db.tokens.get(id);
      } catch (error) {
        console.error('Failed to get token from IndexedDB:', error);
        return this.fallbackStorage.get(id);
      }
    } else {
      return this.fallbackStorage.get(id);
    }
  }

  /**
   * Update a token
   */
  async updateToken(id: string, updates: Partial<Token>): Promise<Token | undefined> {
    const token = await this.getById(id);
    if (!token) return undefined;

    const updatedToken: Token = {
      ...token,
      ...updates,
      id: token.id, // Preserve ID
      metadata: {
        ...token.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
      }
    };

    if (this.useIndexedDB) {
      try {
        await this.db.tokens.put(updatedToken);
      } catch (error) {
        console.error('Failed to update token in IndexedDB:', error);
        this.fallbackStorage.set(id, updatedToken);
        this.saveToLocalStorage();
      }
    } else {
      this.fallbackStorage.set(id, updatedToken);
      this.saveToLocalStorage();
    }

    // Emit token updated event
    this.emit('pewpi.token.updated', updatedToken);

    return updatedToken;
  }

  /**
   * Delete a token
   */
  async deleteToken(id: string): Promise<boolean> {
    if (this.useIndexedDB) {
      try {
        await this.db.tokens.delete(id);
      } catch (error) {
        console.error('Failed to delete token from IndexedDB:', error);
        this.fallbackStorage.delete(id);
        this.saveToLocalStorage();
      }
    } else {
      this.fallbackStorage.delete(id);
      this.saveToLocalStorage();
    }

    // Emit token deleted event
    this.emit('pewpi.token.deleted', { id });

    return true;
  }

  /**
   * Clear all tokens
   */
  async clearAll(): Promise<void> {
    if (this.useIndexedDB) {
      try {
        await this.db.tokens.clear();
      } catch (error) {
        console.error('Failed to clear tokens from IndexedDB:', error);
        this.fallbackStorage.clear();
        localStorage.removeItem('pewpi_tokens');
      }
    } else {
      this.fallbackStorage.clear();
      localStorage.removeItem('pewpi_tokens');
    }

    // Emit tokens cleared event
    this.emit('pewpi.tokens.cleared', {});
  }

  /**
   * Initialize auto-tracking for token changes
   */
  initAutoTracking(): void {
    if (this.autoTrackingEnabled) return;
    
    this.autoTrackingEnabled = true;

    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'pewpi_tokens' && event.newValue) {
        try {
          const tokens = JSON.parse(event.newValue) as Token[];
          // Update fallback storage
          this.fallbackStorage.clear();
          tokens.forEach(token => this.fallbackStorage.set(token.id, token));
          
          // Emit sync event
          this.emit('pewpi.tokens.synced', { tokens });
        } catch (error) {
          console.error('Failed to sync tokens from storage event:', error);
        }
      }
    });

    console.log('Token auto-tracking initialized');
  }

  /**
   * Record a transaction
   */
  async recordTransaction(transaction: Omit<TokenTransaction, 'id' | 'timestamp'>): Promise<TokenTransaction> {
    const newTransaction: TokenTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date().toISOString(),
      ...transaction
    };

    if (this.useIndexedDB) {
      try {
        await this.db.transactions.add(newTransaction);
      } catch (error) {
        console.error('Failed to record transaction in IndexedDB:', error);
      }
    }

    // Emit transaction event
    this.emit('pewpi.transaction.recorded', newTransaction);

    return newTransaction;
  }

  /**
   * Get transactions for a token
   */
  async getTransactions(tokenId: string): Promise<TokenTransaction[]> {
    if (this.useIndexedDB) {
      try {
        return await this.db.transactions
          .where('tokenId')
          .equals(tokenId)
          .toArray();
      } catch (error) {
        console.error('Failed to get transactions from IndexedDB:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Get total balance across all tokens
   */
  async getTotalBalance(): Promise<number> {
    const tokens = await this.getAll();
    return tokens.reduce((sum, token) => sum + token.balance, 0);
  }

  /**
   * Get total value across all tokens
   */
  async getTotalValue(): Promise<number> {
    const tokens = await this.getAll();
    return tokens.reduce((sum, token) => sum + (token.balance * token.value), 0);
  }
}

// Export singleton instance
export const tokenService = new TokenService();

// Export class for testing
export { TokenService };
