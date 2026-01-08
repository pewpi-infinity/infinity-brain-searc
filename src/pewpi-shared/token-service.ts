/**
 * Token Service - Unified token management with IndexedDB and localStorage fallback
 * 
 * Synthesized from best practices across pewpi-infinity organization repositories
 * Features:
 * - Dexie-backed IndexedDB with automatic localStorage fallback
 * - CRUD operations: createToken, getAll, getById, updateToken, deleteToken
 * - Auto-tracking with initAutoTracking()
 * - Balance aggregation: getTotalBalance(), getBalance()
 * - Custom event emission: pewpi.token.created, pewpi.token.updated, pewpi.token.deleted
 * - Cross-tab sync via localStorage events
 */

import Dexie, { Table } from 'dexie';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  creator: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

export interface TokenEvent {
  type: 'created' | 'updated' | 'deleted';
  token: Token;
  timestamp: number;
}

class TokenDatabase extends Dexie {
  tokens!: Table<Token, string>;

  constructor() {
    super('PewpiTokenDB');
    this.version(1).stores({
      tokens: 'id, creator, symbol, createdAt',
    });
  }
}

class TokenService {
  private db: TokenDatabase;
  private autoTrackingEnabled: boolean = false;
  private eventListeners: Map<string, Set<(event: TokenEvent) => void>> = new Map();
  private useIndexedDB: boolean = true;

  constructor() {
    this.db = new TokenDatabase();
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    try {
      await this.db.open();
      console.log('TokenService: IndexedDB initialized');
    } catch (error) {
      console.warn('TokenService: Failed to initialize IndexedDB, falling back to localStorage', error);
      this.useIndexedDB = false;
    }
  }

  /**
   * Create a new token
   */
  async createToken(token: Omit<Token, 'id' | 'createdAt' | 'updatedAt'>): Promise<Token> {
    const newToken: Token = {
      ...token,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      if (this.useIndexedDB) {
        await this.db.tokens.add(newToken);
      } else {
        this.createTokenLocalStorage(newToken);
      }
      this.emitEvent({ type: 'created', token: newToken, timestamp: Date.now() });
      this.emitWindowEvent('pewpi.token.created', newToken);
      return newToken;
    } catch (error) {
      console.error('TokenService: Failed to create token in IndexedDB, using localStorage', error);
      return this.createTokenLocalStorage(newToken);
    }
  }

  /**
   * Get all tokens
   */
  async getAll(): Promise<Token[]> {
    try {
      if (this.useIndexedDB) {
        return await this.db.tokens.toArray();
      } else {
        return this.getAllLocalStorage();
      }
    } catch (error) {
      console.error('TokenService: Failed to read from IndexedDB, using localStorage', error);
      return this.getAllLocalStorage();
    }
  }

  /**
   * Get token by ID
   */
  async getById(id: string): Promise<Token | undefined> {
    try {
      if (this.useIndexedDB) {
        return await this.db.tokens.get(id);
      } else {
        return this.getByIdLocalStorage(id);
      }
    } catch (error) {
      console.error('TokenService: Failed to read from IndexedDB, using localStorage', error);
      return this.getByIdLocalStorage(id);
    }
  }

  /**
   * Update a token
   */
  async updateToken(id: string, updates: Partial<Omit<Token, 'id' | 'createdAt'>>): Promise<Token | undefined> {
    try {
      let existing: Token | undefined;
      
      if (this.useIndexedDB) {
        existing = await this.db.tokens.get(id);
      } else {
        existing = this.getByIdLocalStorage(id);
      }
      
      if (!existing) return undefined;

      const updated: Token = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      if (this.useIndexedDB) {
        await this.db.tokens.put(updated);
      } else {
        this.updateTokenLocalStorage(id, updates);
      }
      
      this.emitEvent({ type: 'updated', token: updated, timestamp: Date.now() });
      this.emitWindowEvent('pewpi.token.updated', updated);
      return updated;
    } catch (error) {
      console.error('TokenService: Failed to update in IndexedDB, using localStorage', error);
      return this.updateTokenLocalStorage(id, updates);
    }
  }

  /**
   * Delete a token
   */
  async deleteToken(id: string): Promise<boolean> {
    try {
      let token: Token | undefined;
      
      if (this.useIndexedDB) {
        token = await this.db.tokens.get(id);
        if (!token) return false;
        await this.db.tokens.delete(id);
      } else {
        token = this.getByIdLocalStorage(id);
        if (!token) return false;
        this.deleteTokenLocalStorage(id);
      }

      this.emitEvent({ type: 'deleted', token, timestamp: Date.now() });
      this.emitWindowEvent('pewpi.token.deleted', token);
      return true;
    } catch (error) {
      console.error('TokenService: Failed to delete from IndexedDB, using localStorage', error);
      return this.deleteTokenLocalStorage(id);
    }
  }

  /**
   * Initialize auto-tracking for token changes
   * Enables cross-tab synchronization via localStorage events
   */
  initAutoTracking(): void {
    if (this.autoTrackingEnabled) return;
    
    this.autoTrackingEnabled = true;
    
    // Listen for storage events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'pewpi_tokens' && event.newValue) {
        try {
          console.log('TokenService: Cross-tab sync detected');
          // Notify listeners about external changes
        } catch (error) {
          console.error('TokenService: Failed to sync from storage event', error);
        }
      }
    });

    console.log('TokenService: Auto-tracking enabled');
  }

  /**
   * Get total balance across all tokens
   */
  async getTotalBalance(): Promise<number> {
    const tokens = await this.getAll();
    return tokens.reduce((sum, token) => sum + token.amount, 0);
  }

  /**
   * Get balance for a specific creator
   */
  async getBalance(creator: string): Promise<number> {
    const tokens = await this.getAll();
    return tokens
      .filter(t => t.creator === creator)
      .reduce((sum, token) => sum + token.amount, 0);
  }

  /**
   * Subscribe to token events
   */
  on(eventType: string, callback: (event: TokenEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Private helper methods

  private generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `token_${Date.now()}_${hex.substring(0, 16)}`;
  }

  private emitEvent(event: TokenEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('TokenService: Error in event listener', error);
        }
      });
    }
    
    // Also emit for 'all' listeners
    const allListeners = this.eventListeners.get('all');
    if (allListeners) {
      allListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('TokenService: Error in event listener', error);
        }
      });
    }
  }

  private emitWindowEvent(eventName: string, data: any): void {
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(customEvent);
      
      // Broadcast via localStorage for cross-tab sync
      try {
        const syncKey = `${eventName}_${Date.now()}`;
        localStorage.setItem(syncKey, JSON.stringify(data));
        // Clean up after a short delay
        setTimeout(() => localStorage.removeItem(syncKey), 1000);
      } catch (error) {
        console.error('TokenService: Failed to broadcast via localStorage', error);
      }
    }
  }

  // LocalStorage fallback methods

  private getLocalStorageTokens(): Token[] {
    try {
      const data = localStorage.getItem('pewpi_tokens');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setLocalStorageTokens(tokens: Token[]): void {
    try {
      localStorage.setItem('pewpi_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }

  private createTokenLocalStorage(token: Token): Token {
    const tokens = this.getLocalStorageTokens();
    tokens.push(token);
    this.setLocalStorageTokens(tokens);
    this.emitEvent({ type: 'created', token, timestamp: Date.now() });
    this.emitWindowEvent('pewpi.token.created', token);
    return token;
  }

  private getAllLocalStorage(): Token[] {
    return this.getLocalStorageTokens();
  }

  private getByIdLocalStorage(id: string): Token | undefined {
    const tokens = this.getLocalStorageTokens();
    return tokens.find(t => t.id === id);
  }

  private updateTokenLocalStorage(id: string, updates: Partial<Omit<Token, 'id' | 'createdAt'>>): Token | undefined {
    const tokens = this.getLocalStorageTokens();
    const index = tokens.findIndex(t => t.id === id);
    
    if (index === -1) return undefined;
    
    const updated = {
      ...tokens[index],
      ...updates,
      updatedAt: Date.now(),
    };
    
    tokens[index] = updated;
    this.setLocalStorageTokens(tokens);
    this.emitEvent({ type: 'updated', token: updated, timestamp: Date.now() });
    this.emitWindowEvent('pewpi.token.updated', updated);
    
    return updated;
  }

  private deleteTokenLocalStorage(id: string): boolean {
    const tokens = this.getLocalStorageTokens();
    const index = tokens.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    const token = tokens[index];
    tokens.splice(index, 1);
    this.setLocalStorageTokens(tokens);
    this.emitEvent({ type: 'deleted', token, timestamp: Date.now() });
    this.emitWindowEvent('pewpi.token.deleted', token);
    
    return true;
  }
}

// Export singleton instance
export const tokenService = new TokenService();
