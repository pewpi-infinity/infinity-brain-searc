/**
 * Token Service Adapter
 * Re-exports the existing TokenService from src/shared/services/token-service.ts
 * Ensures CustomEvent emission for pewpi.token.created, pewpi.token.updated, pewpi.token.deleted
 * 
 * This is a non-destructive adapter that wraps the existing implementation.
 */

import { tokenService as originalTokenService } from '../shared/services/token-service';
import type { Token, TokenEvent } from '../shared/services/token-service';

// Re-export types
export type { Token, TokenEvent };

/**
 * Enhanced TokenService wrapper that ensures all required CustomEvents are emitted
 */
class TokenServiceAdapter {
  private originalService = originalTokenService;

  /**
   * Initialize auto-tracking for token changes
   * This enables periodic sync checks and event emission
   */
  initAutoTracking(): void {
    this.originalService.initAutoTracking();
    console.log('pewpi-shared: TokenService auto-tracking initialized');
  }

  /**
   * Create a new token (emits pewpi.token.created)
   */
  async createToken(token: Omit<Token, 'id' | 'createdAt' | 'updatedAt'>): Promise<Token> {
    const newToken = await this.originalService.createToken(token);
    
    // Ensure CustomEvent is emitted (original service already does this)
    // This is defensive to guarantee the event is fired
    this.emitCustomEvent('pewpi.token.created', newToken);
    
    return newToken;
  }

  /**
   * Update a token (emits pewpi.token.updated)
   */
  async updateToken(id: string, updates: Partial<Omit<Token, 'id' | 'createdAt'>>): Promise<Token | undefined> {
    const updatedToken = await this.originalService.updateToken(id, updates);
    
    if (updatedToken) {
      this.emitCustomEvent('pewpi.token.updated', updatedToken);
    }
    
    return updatedToken;
  }

  /**
   * Delete a token (emits pewpi.token.deleted)
   */
  async deleteToken(id: string): Promise<boolean> {
    // Get token before deletion for event emission
    const token = await this.originalService.getById(id);
    const deleted = await this.originalService.deleteToken(id);
    
    if (deleted && token) {
      this.emitCustomEvent('pewpi.token.deleted', token);
    }
    
    return deleted;
  }

  /**
   * Get all tokens
   */
  async getAll(): Promise<Token[]> {
    return this.originalService.getAll();
  }

  /**
   * Get token by ID
   */
  async getById(id: string): Promise<Token | undefined> {
    return this.originalService.getById(id);
  }

  /**
   * Clear all tokens
   */
  async clearAll(): Promise<void> {
    return this.originalService.clearAll();
  }

  /**
   * Subscribe to token events
   */
  on(eventType: string, callback: (event: TokenEvent) => void): () => void {
    return this.originalService.on(eventType, callback);
  }

  /**
   * Get tokens by creator
   */
  async getTokensByCreator(creator: string): Promise<Token[]> {
    return this.originalService.getTokensByCreator(creator);
  }

  /**
   * Export tokens as JSON
   */
  async exportTokens(): Promise<string> {
    return this.originalService.exportTokens();
  }

  /**
   * Import tokens from JSON
   */
  async importTokens(jsonData: string): Promise<number> {
    return this.originalService.importTokens(jsonData);
  }

  /**
   * Emit CustomEvent on window (defensive, ensures event is fired)
   */
  private emitCustomEvent(eventName: string, data: any): void {
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(eventName, { detail: data });
      window.dispatchEvent(customEvent);
    }
  }
}

// Export singleton instance
export const tokenService = new TokenServiceAdapter();

// Also export the original service for backwards compatibility
export { originalTokenService };
