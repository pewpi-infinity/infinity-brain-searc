/**
 * Auth Service Adapter
 * Re-exports the existing AuthService from src/shared/services/auth-service.ts
 * Ensures pewpi.login.changed CustomEvent emission and localStorage broadcast
 * 
 * This is a non-destructive adapter that wraps the existing implementation.
 */

import { authService as originalAuthService } from '../shared/services/auth-service';
import type { User, AuthSession, MagicLinkRequest } from '../shared/services/auth-service';

// Re-export types
export type { User, AuthSession, MagicLinkRequest };

/**
 * Enhanced AuthService wrapper that ensures CustomEvents and localStorage broadcast
 */
class AuthServiceAdapter {
  private originalService = originalAuthService;
  private storageKey = 'pewpi_auth_broadcast';

  /**
   * Initialize authentication service and restore session
   * Call this on app startup to restore user session
   */
  async restoreSession(): Promise<User | null> {
    const user = await this.originalService.initialize();
    
    if (user) {
      console.log('pewpi-shared: Session restored for user:', user.email || user.githubLogin);
      this.broadcastToLocalStorage({ type: 'login', user });
    }
    
    return user;
  }

  /**
   * Initialize (alias for restoreSession)
   */
  async initialize(): Promise<User | null> {
    return this.restoreSession();
  }

  /**
   * Request a magic link for email authentication
   */
  async requestMagicLink(email: string): Promise<{ token: string; devLink: string }> {
    return this.originalService.requestMagicLink(email);
  }

  /**
   * Login with magic link token
   */
  async loginWithMagicLink(token: string): Promise<User> {
    const user = await this.originalService.loginWithMagicLink(token);
    
    // Ensure CustomEvent is emitted (original service already does this)
    // This is defensive to guarantee the event is fired
    this.emitLoginEvent(user, true);
    this.broadcastToLocalStorage({ type: 'login', user });
    
    return user;
  }

  /**
   * Login with GitHub OAuth code
   */
  async loginWithGitHub(githubCode: string): Promise<User> {
    return this.originalService.loginWithGitHub(githubCode);
  }

  /**
   * Login with GitHub user data (for Spark environment)
   */
  async loginWithGitHubUser(githubUser: {
    id: string;
    login: string;
    email?: string;
    avatarUrl?: string;
    name?: string;
  }): Promise<User> {
    const user = await this.originalService.loginWithGitHubUser(githubUser);
    
    // Ensure CustomEvent is emitted
    this.emitLoginEvent(user, true);
    this.broadcastToLocalStorage({ type: 'login', user });
    
    return user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await this.originalService.logout();
    
    // Ensure logout event is emitted
    this.emitLoginEvent(null, false);
    this.broadcastToLocalStorage({ type: 'logout', user: null });
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.originalService.getCurrentUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.originalService.isAuthenticated();
  }

  /**
   * Get authentication method
   */
  getAuthMethod(): 'magic-link' | 'github' | null {
    return this.originalService.getAuthMethod();
  }

  /**
   * Emit pewpi.login.changed CustomEvent
   */
  private emitLoginEvent(user: User | null, isAuthenticated: boolean): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('pewpi.login.changed', {
        detail: { user, isAuthenticated },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Broadcast auth state changes to localStorage for cross-tab/cross-repo communication
   */
  private broadcastToLocalStorage(data: { type: 'login' | 'logout'; user: User | null }): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const broadcast = {
          ...data,
          timestamp: Date.now(),
          source: 'pewpi-shared',
        };
        localStorage.setItem(this.storageKey, JSON.stringify(broadcast));
        
        // Also emit a storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: this.storageKey,
          newValue: JSON.stringify(broadcast),
          url: window.location.href,
        }));
      } catch (error) {
        console.error('pewpi-shared: Failed to broadcast to localStorage', error);
      }
    }
  }

  /**
   * Listen for localStorage broadcasts from other tabs/repos
   */
  listenForBroadcasts(callback: (event: { type: 'login' | 'logout'; user: User | null }) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handler = (event: StorageEvent) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          callback({ type: data.type, user: data.user });
        } catch (error) {
          console.error('pewpi-shared: Failed to parse broadcast', error);
        }
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }
}

// Export singleton instance
export const authService = new AuthServiceAdapter();

// Also export the original service for backwards compatibility
export { originalAuthService };
