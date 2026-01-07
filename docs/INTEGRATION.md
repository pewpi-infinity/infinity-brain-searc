# Integration Guide

## Cross-Repository Integration for Pewpi Token & Wallet System

This guide explains how to integrate the Pewpi shared token/wallet system into other repositories (banksy, v, infinity-brain-searc, repo-dashboard-hub, etc.) to enable seamless login and wallet state synchronization.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Integration Examples](#integration-examples)
- [API Reference](#api-reference)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Overview

The Pewpi integration system provides:

- **TokenService**: IndexedDB-backed token management with localStorage fallback
- **Magic Link Auth**: Passwordless authentication (no GitHub required)
- **Optional GitHub OAuth**: Social login as an opt-in feature
- **Event-based Sync**: Real-time wallet/login state updates across repositories
- **Cross-tab Sync**: Automatic synchronization across browser tabs
- **Optional P2P Sync**: WebRTC DataChannel support (configurable)

## Quick Start

### 1. Copy Shared Libraries

Copy these files from `infinity-brain-searc` to your repository:

```bash
# Core services
src/shared/wallet/token-service.ts
src/shared/auth/magic-link-auth.ts
src/shared/models/client-model.ts
src/shared/crypto/aes-gcm.ts
src/shared/hooks/integration-hooks.ts

# Optional
src/shared/p2p/peer-sync.ts
src/shared/theme/pewpi-theme.css
```

### 2. Install Dependencies

```bash
npm install dexie
```

### 3. Initialize Integration

```typescript
import { initializeAutoSync, subscribeToIntegrationEvents } from '@/shared/hooks/integration-hooks';

// Initialize on app startup
initializeAutoSync();

// Subscribe to events
const unsubscribe = subscribeToIntegrationEvents({
  onTokenCreated: (token) => {
    console.log('Token created:', token);
    // Update your app state
  },
  onLoginChanged: ({ user, action }) => {
    console.log('Login changed:', action, user);
    // Update auth state
  }
});
```

## Installation

### For Banksy Repository

```typescript
// src/main.tsx or App.tsx
import { initializeAutoSync, subscribeToIntegrationEvents } from '@/shared/hooks/integration-hooks';
import { magicLinkAuth } from '@/shared/auth/magic-link-auth';
import { tokenService } from '@/shared/wallet/token-service';

function App() {
  useEffect(() => {
    // Initialize auto-sync
    initializeAutoSync();

    // Subscribe to token events
    const unsubscribe = subscribeToIntegrationEvents({
      onTokenCreated: (token) => {
        // Show notification
        toast.success(`Token created: ${token.name}`);
        // Refresh art gallery or token display
        refreshArtGallery();
      },
      onLoginChanged: ({ user, action }) => {
        if (action === 'login') {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {/* Your app */}
    </div>
  );
}
```

### For V Repository

```typescript
// Similar setup, but with v-specific actions
const unsubscribe = subscribeToIntegrationEvents({
  onTokenCreated: (token) => {
    // Update video token display
    updateVideoTokenBalance(token.balance);
  },
  onLoginChanged: ({ user, action }) => {
    if (action === 'login') {
      loadUserVideos(user.id);
    }
  }
});
```

### For Repo-Dashboard-Hub

```typescript
// Dashboard-specific integration
const unsubscribe = subscribeToIntegrationEvents({
  onTokenCreated: (token) => {
    // Update dashboard metrics
    updateMetrics({
      totalTokens: await tokenService.getTotalBalance(),
      totalValue: await tokenService.getTotalValue()
    });
  },
  onTokensSynced: ({ tokens }) => {
    // Refresh dashboard
    refreshDashboard();
  }
});
```

## Integration Examples

### Example 1: Listen for Token Creation

```typescript
import { tokenService } from '@/shared/wallet/token-service';

// Method 1: Using integration hooks
import { subscribeToIntegrationEvents } from '@/shared/hooks/integration-hooks';

const unsubscribe = subscribeToIntegrationEvents({
  onTokenCreated: (token) => {
    console.log('New token:', token);
    // Your logic here
  }
});

// Method 2: Direct event listener
tokenService.on('pewpi.token.created', (token) => {
  console.log('New token:', token);
});

// Method 3: Window event listener
window.addEventListener('pewpi.token.created', (event) => {
  const token = event.detail;
  console.log('New token:', token);
});
```

### Example 2: Check Login State

```typescript
import { magicLinkAuth } from '@/shared/auth/magic-link-auth';

// Check if user is authenticated
if (magicLinkAuth.isAuthenticated()) {
  const user = magicLinkAuth.getCurrentUser();
  console.log('Logged in as:', user.email);
} else {
  console.log('Not logged in');
}
```

### Example 3: Create a Token from Another Repo

```typescript
import { tokenService } from '@/shared/wallet/token-service';

// Create a token (this will emit events to all listening repos)
const token = await tokenService.createToken({
  name: 'Art Token',
  symbol: 'ART',
  balance: 100,
  value: 5.0,
  metadata: {
    source: 'banksy',
    description: 'Token for art creation'
  }
});

// All repositories listening will receive the 'pewpi.token.created' event
```

### Example 4: Get Current Integration State

```typescript
import { getIntegrationState } from '@/shared/hooks/integration-hooks';

const state = await getIntegrationState();

console.log('Is authenticated:', state.isAuthenticated);
console.log('Current user:', state.user);
console.log('Wallet:', state.wallet);
console.log('Total tokens:', state.wallet.tokens.length);
console.log('Total balance:', state.wallet.totalBalance);
console.log('Total value:', state.wallet.totalValue);
```

## API Reference

### TokenService

```typescript
// Create token
await tokenService.createToken({
  name: string,
  symbol: string,
  balance: number,
  value: number,
  metadata?: {
    source?: string,
    description?: string,
    icon?: string
  }
});

// Get all tokens
const tokens = await tokenService.getAll();

// Get token by ID
const token = await tokenService.getById(id);

// Update token
await tokenService.updateToken(id, { balance: 200 });

// Delete token
await tokenService.deleteToken(id);

// Get totals
const totalBalance = await tokenService.getTotalBalance();
const totalValue = await tokenService.getTotalValue();

// Listen for events
const unsubscribe = tokenService.on('pewpi.token.created', (token) => {
  // Handle token creation
});
```

### MagicLinkAuth

```typescript
// Request magic link
await magicLinkAuth.requestMagicLink('user@example.com');

// Verify magic link (called automatically on page load)
await magicLinkAuth.verifyMagicLink(token);

// Check authentication
const isAuth = magicLinkAuth.isAuthenticated();

// Get current user
const user = magicLinkAuth.getCurrentUser();

// Sign out
await magicLinkAuth.signOut();

// GitHub OAuth (optional)
await magicLinkAuth.signInWithGitHub();
```

### Integration Hooks

```typescript
// Subscribe to all events
const unsubscribe = subscribeToIntegrationEvents({
  onTokenCreated: (token) => { /* ... */ },
  onTokenUpdated: (token) => { /* ... */ },
  onTokenDeleted: ({ id }) => { /* ... */ },
  onTokensSynced: ({ tokens }) => { /* ... */ },
  onLoginChanged: ({ user, action }) => { /* ... */ }
});

// Get current state
const state = await getIntegrationState();

// Emit custom event
emitIntegrationEvent('custom.event', { data: 'value' });

// Initialize auto-sync
initializeAutoSync();
```

## Migration Guide

### Migrating from Existing Auth System

If you have an existing authentication system:

1. **Phase 1: Parallel Run**
   - Install pewpi integration
   - Run both systems in parallel
   - Map existing users to pewpi auth

2. **Phase 2: Data Migration**
   ```typescript
   // Migrate existing tokens to TokenService
   for (const oldToken of existingTokens) {
     await tokenService.createToken({
       name: oldToken.name,
       symbol: oldToken.symbol,
       balance: oldToken.balance,
       value: oldToken.value,
       metadata: {
         source: 'migration',
         description: oldToken.description
       }
     });
   }
   ```

3. **Phase 3: Switch Over**
   - Disable old auth system
   - Use pewpi auth as primary
   - Monitor for issues

### Rollback Instructions

If you need to rollback:

1. **Backup Data**
   ```typescript
   // Export all tokens
   const tokens = await tokenService.getAll();
   localStorage.setItem('pewpi_backup', JSON.stringify(tokens));
   ```

2. **Disable Integration**
   ```typescript
   // Comment out or remove initialization
   // initializeAutoSync();
   // subscribeToIntegrationEvents(...);
   ```

3. **Restore Old System**
   - Re-enable previous auth
   - Restore from backup if needed

4. **Clean Up**
   ```typescript
   // Clear pewpi data (optional)
   await tokenService.clearAll();
   localStorage.removeItem('pewpi_auth_session');
   ```

## Optional Features

### Enable P2P Sync

```typescript
import { createP2PSync } from '@/shared/p2p/peer-sync';

const p2pSync = createP2PSync({
  signalingUrl: 'wss://your-signaling-server.com',
  iceServers: [
    { urls: 'stun:stun.example.com:3478' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  autoConnect: true
});
```

**Note**: P2P sync is currently a stub and requires full implementation.

### Enable Encryption

```typescript
import { generateKey, encryptObject, decryptObject } from '@/shared/crypto/aes-gcm';

// Generate encryption key
const key = await generateKey();

// Encrypt data
const encrypted = await encryptObject({ sensitive: 'data' }, key);

// Decrypt data
const decrypted = await decryptObject(encrypted, key);
```

## Troubleshooting

### Issue: Events not received in other repo

**Solution**: Ensure both repos are on the same domain or use PostMessage for cross-origin communication.

### Issue: IndexedDB not working

**Solution**: Check browser support and ensure proper permissions. The system will automatically fall back to localStorage.

```typescript
// Check if using fallback
const status = tokenService.useIndexedDB ? 'IndexedDB' : 'localStorage';
console.log('Using:', status);
```

### Issue: Magic link not working in production

**Solution**: Configure SMTP settings for production email delivery. In development, magic links are logged to console.

### Issue: Login state not syncing

**Solution**: Ensure `initializeAutoSync()` is called on app startup.

## Support

For issues or questions:

1. Check this documentation
2. Review example code in `src/shared/hooks/integration-hooks.ts`
3. Open an issue in the repository

## Next Steps

- Implement full P2P sync with signaling server
- Add OAuth providers (Google, Microsoft)
- Implement 2FA
- Add rate limiting
- Implement token exchange rates

---

**Version**: 1.0.0  
**Last Updated**: January 2026
