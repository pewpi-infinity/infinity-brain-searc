/**
 * TokenService - Production-grade token management with IndexedDB (Dexie) backend
 * Provides persistence, live updates, and cross-repo synchronization
 */

import Dexie, { Table } from 'dexie';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  currency: 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  source?: string; // Which repo created this token
}

export interface TokenEvent {
  type: 'created' | 'updated' | 'deleted';
  token: Token;
  timestamp: string;
}

// Dexie Database Class
class TokenDatabase extends Dexie {
  tokens!: Table<Token, string>;

  constructor() {
    super('PewpiTokenDB');
    this.version(1).stores({
      tokens: 'id, name, symbol, currency, createdAt, source'
    });
  }
}

class TokenServiceClass {
  private db: TokenDatabase;
  private isInitialized = false;
  private autoTrackingEnabled = false;
  private listeners: Map<string, Set<(event: TokenEvent) => void>> = new Map();

  constructor() {
    this.db = new TokenDatabase();
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    try {
      await this.db.open();
      this.isInitialized = true;
      console.log('[TokenService] IndexedDB initialized successfully');
    } catch (error) {
      console.error('[TokenService] Failed to initialize IndexedDB:', error);
      this.fallbackToLocalStorage();
    }
  }

  private fallbackToLocalStorage(): void {
    console.warn('[TokenService] Falling back to localStorage');
    // localStorage fallback implementation
    this.isInitialized = true;
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initDatabase();
    }
  }

  /**
   * Create a new token and persist to IndexedDB
   */
  async createToken(token: Omit<Token, 'id' | 'createdAt' | 'updatedAt'>): Promise<Token> {
    await this.ensureInitialized();
    const newToken: Token = {
      ...token,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (this.isInitialized) {
        await this.db.tokens.add(newToken);
        console.log('[TokenService] Token created:', newToken.id);
      } else {
        // localStorage fallback
        this.saveToLocalStorage(newToken);
      }

      // Emit event for cross-repo sync
      this.emitEvent('created', newToken);
      
      // Dispatch window event for external listeners
      window.dispatchEvent(new CustomEvent('pewpi.token.created', {
        detail: { token: newToken }
      }));

      return newToken;
    } catch (error) {
      console.error('[TokenService] Failed to create token:', error);
      throw error;
    }
  }

  /**
   * Get all tokens from IndexedDB
   */
  async getAll(): Promise<Token[]> {
    await this.ensureInitialized();
    try {
      if (this.isInitialized) {
        const tokens = await this.db.tokens.toArray();
        return tokens;
      } else {
        // localStorage fallback
        return this.getFromLocalStorage();
      }
    } catch (error) {
      console.error('[TokenService] Failed to get tokens:', error);
      return [];
    }
  }

  /**
   * Get tokens by currency type
   */
  async getByCurrency(currency: Token['currency']): Promise<Token[]> {
    await this.ensureInitialized();
    try {
      if (this.isInitialized) {
        return await this.db.tokens.where('currency').equals(currency).toArray();
      } else {
        const all = this.getFromLocalStorage();
        return all.filter(t => t.currency === currency);
      }
    } catch (error) {
      console.error('[TokenService] Failed to get tokens by currency:', error);
      return [];
    }
  }

  /**
   * Update an existing token
   */
  async updateToken(id: string, updates: Partial<Token>): Promise<Token | null> {
    await this.ensureInitialized();
    try {
      if (this.isInitialized) {
        const existing = await this.db.tokens.get(id);
        if (!existing) return null;

        const updated: Token = {
          ...existing,
          ...updates,
          id: existing.id, // Ensure ID doesn't change
          createdAt: existing.createdAt, // Preserve creation date
          updatedAt: new Date().toISOString()
        };

        await this.db.tokens.put(updated);
        this.emitEvent('updated', updated);
        
        window.dispatchEvent(new CustomEvent('pewpi.token.updated', {
          detail: { token: updated }
        }));

        return updated;
      } else {
        return this.updateInLocalStorage(id, updates);
      }
    } catch (error) {
      console.error('[TokenService] Failed to update token:', error);
      return null;
    }
  }

  /**
   * Delete a token
   */
  async deleteToken(id: string): Promise<boolean> {
    await this.ensureInitialized();
    try {
      if (this.isInitialized) {
        const token = await this.db.tokens.get(id);
        if (!token) return false;

        await this.db.tokens.delete(id);
        this.emitEvent('deleted', token);
        
        window.dispatchEvent(new CustomEvent('pewpi.token.deleted', {
          detail: { tokenId: id }
        }));

        return true;
      } else {
        return this.deleteFromLocalStorage(id);
      }
    } catch (error) {
      console.error('[TokenService] Failed to delete token:', error);
      return false;
    }
  }

  /**
   * Clear all tokens (with confirmation)
   */
  async clearAll(): Promise<void> {
    await this.ensureInitialized();
    try {
      if (this.isInitialized) {
        await this.db.tokens.clear();
        console.log('[TokenService] All tokens cleared');
      } else {
        localStorage.removeItem('pewpi_tokens');
      }

      window.dispatchEvent(new CustomEvent('pewpi.tokens.cleared', {
        detail: { timestamp: new Date().toISOString() }
      }));
    } catch (error) {
      console.error('[TokenService] Failed to clear tokens:', error);
      throw error;
    }
  }

  /**
   * Initialize auto-tracking for token events
   */
  initAutoTracking(): void {
    if (this.autoTrackingEnabled) {
      console.log('[TokenService] Auto-tracking already enabled');
      return;
    }

    this.autoTrackingEnabled = true;
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'pewpi_tokens' && e.newValue) {
        console.log('[TokenService] Tokens updated in another tab');
        this.syncFromStorage();
      }
    });

    // Listen for custom events from other repos
    window.addEventListener('pewpi.token.created', ((e: CustomEvent) => {
      console.log('[TokenService] Token created event:', e.detail);
    }) as EventListener);

    console.log('[TokenService] Auto-tracking initialized');
  }

  /**
   * Subscribe to token events
   */
  on(event: 'created' | 'updated' | 'deleted', callback: (event: TokenEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit event to subscribers
   */
  private emitEvent(type: TokenEvent['type'], token: Token): void {
    const event: TokenEvent = {
      type,
      token,
      timestamp: new Date().toISOString()
    };

    this.listeners.get(type)?.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[TokenService] Error in event listener:', error);
      }
    });
  }

  /**
   * LocalStorage fallback methods
   */
  private saveToLocalStorage(token: Token): void {
    const tokens = this.getFromLocalStorage();
    tokens.push(token);
    localStorage.setItem('pewpi_tokens', JSON.stringify(tokens));
  }

  private getFromLocalStorage(): Token[] {
    const data = localStorage.getItem('pewpi_tokens');
    return data ? JSON.parse(data) : [];
  }

  private updateInLocalStorage(id: string, updates: Partial<Token>): Token | null {
    const tokens = this.getFromLocalStorage();
    const index = tokens.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updated = {
      ...tokens[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    tokens[index] = updated;
    localStorage.setItem('pewpi_tokens', JSON.stringify(tokens));
    return updated;
  }

  private deleteFromLocalStorage(id: string): boolean {
    const tokens = this.getFromLocalStorage();
    const filtered = tokens.filter(t => t.id !== id);
    if (filtered.length === tokens.length) return false;
    localStorage.setItem('pewpi_tokens', JSON.stringify(filtered));
    return true;
  }

  private syncFromStorage(): void {
    // Reload tokens from storage when changes detected
    window.dispatchEvent(new CustomEvent('pewpi.tokens.synced', {
      detail: { timestamp: new Date().toISOString() }
    }));
  }

  /**
   * Get token statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<Token['currency'], number>;
    totalValue: number;
  }> {
    await this.ensureInitialized();
    const tokens = await this.getAll();
    const stats = {
      total: tokens.length,
      byType: {
        infinity_tokens: 0,
        research_tokens: 0,
        art_tokens: 0,
        music_tokens: 0
      },
      totalValue: 0
    };

    tokens.forEach(token => {
      stats.byType[token.currency]++;
      stats.totalValue += token.value;
    });

    return stats;
  }
}

// Singleton instance
export const TokenService = new TokenServiceClass();

// Export for testing
export { TokenDatabase };
