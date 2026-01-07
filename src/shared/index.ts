/**
 * Shared library exports for pewpi integration
 * 
 * Import these in other repositories for cross-repo integration
 */

// Wallet & Tokens
export { tokenService, TokenService } from './wallet/token-service';
export type { Token, TokenTransaction } from './wallet/token-service';

// Authentication
export { magicLinkAuth, MagicLinkAuthService } from './auth/magic-link-auth';
export type { AuthUser, MagicLinkSession } from './auth/magic-link-auth';

// Data Models
export { createModel, ClientModel } from './models/client-model';
export type { ModelSchema, ModelDocument, QueryOptions } from './models/client-model';

// Crypto
export * from './crypto/aes-gcm';

// Integration Hooks
export {
  subscribeToIntegrationEvents,
  getIntegrationState,
  emitIntegrationEvent,
  initializeAutoSync,
  exampleIntegrationListener
} from './hooks/integration-hooks';
export type { IntegrationEventHandlers } from './hooks/integration-hooks';

// P2P Sync (optional)
export { createP2PSync, p2pSync, P2PSyncService } from './p2p/peer-sync';
export type { P2PConfig, P2PMessage } from './p2p/peer-sync';
