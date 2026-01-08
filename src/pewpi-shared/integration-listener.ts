/**
 * Integration Listener
 * Cross-repository event listener utilities for wallet and auth state changes
 * 
 * Use these utilities to integrate pewpi-shared events into any repository
 */

import { tokenService } from './token-service';
import { authService } from './auth-service';
import type { Token, TokenEvent } from './token-service';
import type { User } from './auth-service';

/**
 * Subscribe to token creation events
 * Returns an unsubscribe function
 */
export function onTokenCreated(callback: (token: Token) => void): () => void {
  // Method 1: Use TokenService event system
  const unsubscribeService = tokenService.on('created', (event: TokenEvent) => {
    callback(event.token);
  });

  // Method 2: Use window CustomEvents (cross-repo)
  const handleWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<Token>;
    callback(customEvent.detail);
  };

  window.addEventListener('pewpi.token.created', handleWindowEvent);

  // Return cleanup function
  return () => {
    unsubscribeService();
    window.removeEventListener('pewpi.token.created', handleWindowEvent);
  };
}

/**
 * Subscribe to token update events
 * Returns an unsubscribe function
 */
export function onTokenUpdated(callback: (token: Token) => void): () => void {
  const unsubscribeService = tokenService.on('updated', (event: TokenEvent) => {
    callback(event.token);
  });

  const handleWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<Token>;
    callback(customEvent.detail);
  };

  window.addEventListener('pewpi.token.updated', handleWindowEvent);

  return () => {
    unsubscribeService();
    window.removeEventListener('pewpi.token.updated', handleWindowEvent);
  };
}

/**
 * Subscribe to token deletion events
 * Returns an unsubscribe function
 */
export function onTokenDeleted(callback: (token: Token) => void): () => void {
  const unsubscribeService = tokenService.on('deleted', (event: TokenEvent) => {
    callback(event.token);
  });

  const handleWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<Token>;
    callback(customEvent.detail);
  };

  window.addEventListener('pewpi.token.deleted', handleWindowEvent);

  return () => {
    unsubscribeService();
    window.removeEventListener('pewpi.token.deleted', handleWindowEvent);
  };
}

/**
 * Subscribe to all token events (created, updated, deleted)
 * Returns an unsubscribe function
 */
export function onTokenChange(callback: (event: TokenEvent) => void): () => void {
  return tokenService.on('all', callback);
}

/**
 * Subscribe to login state changes
 * Returns an unsubscribe function
 */
export function onLoginChanged(
  callback: (user: User | null, isAuthenticated: boolean) => void
): () => void {
  const handleLoginChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ user: User | null; isAuthenticated: boolean }>;
    callback(customEvent.detail.user, customEvent.detail.isAuthenticated);
  };

  window.addEventListener('pewpi.login.changed', handleLoginChange);

  return () => {
    window.removeEventListener('pewpi.login.changed', handleLoginChange);
  };
}

/**
 * Subscribe to cross-tab/cross-repo localStorage broadcasts
 * Returns an unsubscribe function
 */
export function onAuthBroadcast(
  callback: (event: { type: 'login' | 'logout'; user: User | null }) => void
): () => void {
  return authService.listenForBroadcasts(callback);
}

/**
 * Initialize all integration listeners with logging
 * Useful for debugging and testing
 */
export function initializeIntegrationListeners(): () => void {
  console.log('pewpi-shared: Initializing integration listeners');

  const unsubscribers: Array<() => void> = [];

  // Listen for token events
  unsubscribers.push(
    onTokenCreated((token) => {
      console.log('pewpi-shared: Token created', token);
    })
  );

  unsubscribers.push(
    onTokenUpdated((token) => {
      console.log('pewpi-shared: Token updated', token);
    })
  );

  unsubscribers.push(
    onTokenDeleted((token) => {
      console.log('pewpi-shared: Token deleted', token);
    })
  );

  // Listen for login changes
  unsubscribers.push(
    onLoginChanged((user, isAuthenticated) => {
      console.log('pewpi-shared: Login state changed', { user, isAuthenticated });
    })
  );

  // Listen for cross-tab broadcasts
  unsubscribers.push(
    onAuthBroadcast((event) => {
      console.log('pewpi-shared: Auth broadcast received', event);
    })
  );

  // Return cleanup function
  return () => {
    console.log('pewpi-shared: Cleaning up integration listeners');
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Simple integration helper - call this on app startup
 */
export async function initializePewpiShared(): Promise<void> {
  console.log('pewpi-shared: Initializing...');

  // Restore auth session
  await authService.restoreSession();

  // Enable auto-tracking for tokens
  tokenService.initAutoTracking();

  console.log('pewpi-shared: Initialization complete');
}

// Re-export services for convenience
export { tokenService, authService };
export type { Token, TokenEvent, User };
