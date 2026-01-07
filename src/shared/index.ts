/**
 * Pewpi Shared Token - Main Export
 * Import this module in other repositories to use the shared token/wallet system
 * 
 * Example usage:
 * import { tokenService, authService, useAuth, Login, Wallet } from '@/shared';
 */

// Services
export { tokenService } from './services/token-service';
export type { Token, TokenEvent } from './services/token-service';

export { authService } from './services/auth-service';
export type { User, AuthSession, MagicLinkRequest } from './services/auth-service';

export { createPeerSync, PeerSync } from './services/peer-sync';
export type { PeerSyncConfig, PeerConnection } from './services/peer-sync';

// Models
export { ClientModel, createModel } from './models/client-model';
export type { ModelSchema, Document, QueryOptions } from './models/client-model';

// Utilities
export * from './utils/encryption';

// Hooks
export { useAuth } from './hooks/useAuth';
export type { UseAuthReturn } from './hooks/useAuth';

// Components
export { Login } from './components/Login';
export { Wallet } from './components/Wallet';

// Integration helpers
export {
  subscribeToTokenCreation,
  subscribeToLoginChanges,
  CrossRepoTokenSync,
  WalletBalanceWatcher,
  initializeTokenAnalytics,
  simpleIntegration,
} from './integration-listener';

// Version
export const VERSION = '1.0.0';

/**
 * Initialize the shared token system
 * Call this once at app startup
 */
export async function initializePewpiShared(): Promise<void> {
  console.log('Pewpi Shared Token System v' + VERSION);
  
  // Initialize auth service
  await authService.initialize();
  
  // Initialize auto-tracking for tokens
  tokenService.initAutoTracking();
  
  console.log('✓ Pewpi Shared Token System initialized');
}
