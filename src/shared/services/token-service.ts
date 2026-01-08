/**
 * TokenService - Production-grade token management with IndexedDB persistence
 * Provides auto-tracking, event emission, and fallback to localStorage
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

  constructor() {
    this.db = new TokenDatabase();
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    try {
      await this.db.open();
      console.log('TokenService: IndexedDB initialized');
    } catch (error) {
      console.error('TokenService: Failed to initialize IndexedDB, falling back to localStorage', error);
      // Fallback will be handled at operation level
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
      await this.db.tokens.add(newToken);
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
      return await this.db.tokens.toArray();
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
      return await this.db.tokens.get(id);
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
      const existing = await this.db.tokens.get(id);
      if (!existing) return undefined;

      const updated: Token = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };

      await this.db.tokens.put(updated);
      this.emitEvent({ type: 'updated', token: updated, timestamp: Date.now() });
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
      const token = await this.db.tokens.get(id);
      if (!token) return false;

      await this.db.tokens.delete(id);
      this.emitEvent({ type: 'deleted', token, timestamp: Date.now() });
      return true;
    } catch (error) {
      console.error('TokenService: Failed to delete from IndexedDB, using localStorage', error);
      return this.deleteTokenLocalStorage(id);
    }
  }

  /**
   * Clear all tokens
   */
  async clearAll(): Promise<void> {
    try {
      await this.db.tokens.clear();
      localStorage.removeItem('pewpi_tokens');
    } catch (error) {
      console.error('TokenService: Failed to clear IndexedDB', error);
      localStorage.removeItem('pewpi_tokens');
    }
  }

  /**
   * Initialize auto-tracking for token changes
   */
  initAutoTracking(): void {
    if (this.autoTrackingEnabled) return;
    
    this.autoTrackingEnabled = true;
    
    // Set up periodic sync check
    setInterval(() => {
      this.checkForChanges();
    }, 5000); // Check every 5 seconds

    console.log('TokenService: Auto-tracking enabled');
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

  /**
   * Get token count by creator
   */
  async getTokensByCreator(creator: string): Promise<Token[]> {
    try {
      return await this.db.tokens.where('creator').equals(creator).toArray();
    } catch (error) {
      console.error('TokenService: Failed to query IndexedDB', error);
      return this.getTokensByCreatorLocalStorage(creator);
    }
  }

  /**
   * Export all tokens as JSON
   */
  async exportTokens(): Promise<string> {
    const tokens = await this.getAll();
    return JSON.stringify(tokens, null, 2);
  }

  /**
   * Import tokens from JSON
   */
  async importTokens(jsonData: string): Promise<number> {
    try {
      const tokens = JSON.parse(jsonData) as Token[];
      let imported = 0;
      
      try {
        for (const token of tokens) {
          await this.db.tokens.put(token);
          imported++;
        }
      } catch (dbError) {
        // Fallback to localStorage
        console.log('TokenService: Using localStorage for import');
        const existingTokens = this.getLocalStorageTokens();
        for (const token of tokens) {
          // Avoid duplicates
          const exists = existingTokens.find(t => t.id === token.id);
          if (!exists) {
            existingTokens.push(token);
            imported++;
          }
        }
        this.setLocalStorageTokens(existingTokens);
      }
      
      return imported;
    } catch (error) {
      console.error('TokenService: Failed to import tokens', error);
      throw error;
    }
  }

  // Private helper methods

  private generateId(): string {
    // Use crypto.getRandomValues for secure ID generation
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `token_${Date.now()}_${hex.substring(0, 16)}`;
  }

  private emitEvent(event: TokenEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
    
    // Also emit for 'all' listeners
    const allListeners = this.eventListeners.get('all');
    if (allListeners) {
      allListeners.forEach(callback => callback(event));
    }
  }

  private emitWindowEvent(eventName: string, data: any): void {
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(customEvent);
    }
  }

  private async checkForChanges(): Promise<void> {
    // Placeholder for future sync logic
    // Could check for remote changes, compare checksums, etc.
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
    
    return true;
  }

  private getTokensByCreatorLocalStorage(creator: string): Token[] {
    const tokens = this.getLocalStorageTokens();
    return tokens.filter(t => t.creator === creator);
  }
}

// Export singleton instance
export const tokenService = new TokenService();
