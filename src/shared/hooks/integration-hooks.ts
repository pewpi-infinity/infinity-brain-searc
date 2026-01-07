/**
 * Integration Hooks Module
 * 
 * Provides event listeners for cross-repo integration
 * Other repositories can import this to sync wallet/login state
 */

import { tokenService, Token } from '../wallet/token-service';
import { magicLinkAuth, AuthUser } from '../auth/magic-link-auth';

export interface IntegrationEventHandlers {
  onTokenCreated?: (token: Token) => void;
  onTokenUpdated?: (token: Token) => void;
  onTokenDeleted?: (data: { id: string }) => void;
  onTokensSynced?: (data: { tokens: Token[] }) => void;
  onLoginChanged?: (data: { user: AuthUser | null; action: 'login' | 'logout' }) => void;
}

/**
 * Subscribe to pewpi integration events
 * 
 * Example usage:
 * ```typescript
 * import { subscribeToIntegrationEvents } from '@/shared/hooks/integration-hooks';
 * 
 * const unsubscribe = subscribeToIntegrationEvents({
 *   onTokenCreated: (token) => {
 *     console.log('Token created:', token);
 *     // Update UI or sync to your app state
 *   },
 *   onLoginChanged: ({ user, action }) => {
 *     if (action === 'login') {
 *       console.log('User logged in:', user);
 *     } else {
 *       console.log('User logged out');
 *     }
 *   }
 * });
 * 
 * // Later, to cleanup:
 * unsubscribe();
 * ```
 */
export function subscribeToIntegrationEvents(handlers: IntegrationEventHandlers): () => void {
  const unsubscribers: Array<() => void> = [];

  // Token events
  if (handlers.onTokenCreated) {
    const unsub = tokenService.on('pewpi.token.created', handlers.onTokenCreated);
    unsubscribers.push(unsub);
  }

  if (handlers.onTokenUpdated) {
    const unsub = tokenService.on('pewpi.token.updated', handlers.onTokenUpdated);
    unsubscribers.push(unsub);
  }

  if (handlers.onTokenDeleted) {
    const unsub = tokenService.on('pewpi.token.deleted', handlers.onTokenDeleted);
    unsubscribers.push(unsub);
  }

  if (handlers.onTokensSynced) {
    const unsub = tokenService.on('pewpi.tokens.synced', handlers.onTokensSynced);
    unsubscribers.push(unsub);
  }

  // Login events via window events
  if (handlers.onLoginChanged) {
    const loginHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      handlers.onLoginChanged?.(customEvent.detail);
    };
    window.addEventListener('pewpi.login.changed', loginHandler);
    unsubscribers.push(() => {
      window.removeEventListener('pewpi.login.changed', loginHandler);
    });
  }

  // Return cleanup function
  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}

/**
 * Get current integration state
 */
export async function getIntegrationState() {
  const user = magicLinkAuth.getCurrentUser();
  const tokens = await tokenService.getAll();
  const totalBalance = await tokenService.getTotalBalance();
  const totalValue = await tokenService.getTotalValue();

  return {
    isAuthenticated: magicLinkAuth.isAuthenticated(),
    user,
    wallet: {
      tokens,
      totalBalance,
      totalValue
    }
  };
}

/**
 * Emit custom integration event
 * 
 * Use this to notify other repos of state changes
 */
export function emitIntegrationEvent(eventName: string, data: any) {
  window.dispatchEvent(new CustomEvent(`pewpi.${eventName}`, { detail: data }));
}

/**
 * React hook for integration events
 */
export function useIntegrationEvents(handlers: IntegrationEventHandlers) {
  if (typeof window === 'undefined') return;

  // Subscribe on mount
  const unsubscribe = subscribeToIntegrationEvents(handlers);

  // Cleanup on unmount
  return unsubscribe;
}

/**
 * Example listener module for other repositories
 * 
 * Copy this pattern to banksy, v, infinity-brain-searc, repo-dashboard-hub, etc.
 */
export const exampleIntegrationListener = {
  init: () => {
    console.log('🔗 Initializing pewpi integration...');

    const unsubscribe = subscribeToIntegrationEvents({
      onTokenCreated: (token) => {
        console.log('✨ Token created:', {
          name: token.name,
          symbol: token.symbol,
          balance: token.balance,
          source: token.metadata.source
        });
        
        // Example: Update local state
        // updateLocalWalletBalance(token.balance);
      },

      onTokenUpdated: (token) => {
        console.log('🔄 Token updated:', {
          name: token.name,
          balance: token.balance
        });
        
        // Example: Sync to local storage
        // syncTokenToLocalStorage(token);
      },

      onTokensSynced: ({ tokens }) => {
        console.log('🔄 Wallet synced:', {
          tokenCount: tokens.length,
          totalBalance: tokens.reduce((sum, t) => sum + t.balance, 0)
        });
        
        // Example: Refresh UI
        // refreshWalletUI();
      },

      onLoginChanged: ({ user, action }) => {
        console.log(`🔐 Login ${action}:`, user ? {
          email: user.email,
          id: user.id,
          method: user.authMethod
        } : 'logged out');
        
        // Example: Update auth state
        if (action === 'login' && user) {
          // setCurrentUser(user);
          // loadUserData();
        } else {
          // clearUserData();
          // redirectToLogin();
        }
      }
    });

    console.log('✅ Pewpi integration initialized');
    
    // Return cleanup function
    return unsubscribe;
  }
};

/**
 * Initialize auto-sync across tabs
 */
export function initializeAutoSync() {
  // Initialize token service auto-tracking
  tokenService.initAutoTracking();

  // Check for magic link on page load
  magicLinkAuth.checkUrlForMagicLink();

  // Listen for storage events from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'pewpi_auth_session') {
      // Auth state changed in another tab
      const user = magicLinkAuth.getCurrentUser();
      emitIntegrationEvent('login.changed', {
        user,
        action: user ? 'login' : 'logout'
      });
    }
  });

  console.log('🔄 Auto-sync initialized');
}
