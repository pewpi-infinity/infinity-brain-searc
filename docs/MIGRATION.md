# Migration Guide

## Overview

This guide provides instructions for migrating to the production-grade login, wallet, and token sync system, including rollback procedures and optional features.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Steps](#migration-steps)
3. [Data Migration](#data-migration)
4. [Rollback Instructions](#rollback-instructions)
5. [Optional Features](#optional-features)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the migration:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Modern browser with IndexedDB support
- [ ] Backup existing localStorage data
- [ ] Review the INTEGRATION.md guide

## Migration Steps

### Step 1: Install Dependencies

```bash
# Required dependencies
npm install dexie

# Optional for testing
npm install --save-dev vitest fake-indexeddb @testing-library/react
```

### Step 2: Copy Shared Libraries

Copy the following files from this repository to your project:

```
src/shared/
├── token-service.ts          # Core token management
├── client-model.ts            # Front-end data models
├── auth/
│   ├── auth-service.ts        # Authentication service
│   └── login-component.tsx    # Login UI component
├── wallet/
│   └── wallet-ui.tsx          # Wallet UI component
├── crypto/
│   └── aes-gcm.ts             # Encryption helpers (optional)
├── p2p/
│   └── peer-sync.ts           # P2P sync (optional)
├── integration/
│   └── listener.ts            # Integration examples
└── theme.css                  # Shared styling
```

### Step 3: Import Theme CSS

Add to your main CSS file or import in your main component:

```typescript
// In main.tsx or App.tsx
import '@/shared/theme.css';
```

Or in your main CSS file:

```css
/* In index.css or main.css */
@import './shared/theme.css';
```

### Step 4: Initialize Services

In your main application file (App.tsx or main.tsx):

```typescript
import { useEffect } from 'react';
import { TokenService } from '@/shared/token-service';
import { createIntegrationListener } from '@/shared/integration/listener';

export function App() {
  useEffect(() => {
    // Initialize token service auto-tracking
    TokenService.initAutoTracking();

    // Initialize integration listener
    const integration = createIntegrationListener({
      repoName: 'your-repo-name',
      onTokenCreated: (token) => {
        console.log('Token created:', token.name);
      },
      onLoginChanged: (user, loggedIn) => {
        console.log('Login status:', loggedIn);
      }
    });

    return () => {
      integration.cleanup();
    };
  }, []);

  // Rest of your app...
}
```

### Step 5: Add UI Components

Add login and wallet components to your navigation:

```typescript
import { useState } from 'react';
import { LoginComponent } from '@/shared/auth/login-component';
import { WalletUI } from '@/shared/wallet/wallet-ui';

function Navigation() {
  const [showLogin, setShowLogin] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  return (
    <>
      <nav>
        <button onClick={() => setShowLogin(true)}>Login</button>
        <button onClick={() => setShowWallet(true)}>Wallet</button>
      </nav>

      <LoginComponent
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />

      <WalletUI
        open={showWallet}
        onClose={() => setShowWallet(false)}
      />
    </>
  );
}
```

### Step 6: Test the Integration

```bash
# Run tests (if you installed testing dependencies)
npm test

# Run development server
npm run dev
```

## Data Migration

### Migrating Existing Tokens

If you have existing token data in localStorage, migrate it to the new system:

```typescript
import { TokenService } from '@/shared/token-service';

async function migrateExistingTokens() {
  // Get old tokens from localStorage
  const oldTokensJson = localStorage.getItem('old_tokens_key');
  if (!oldTokensJson) return;

  const oldTokens = JSON.parse(oldTokensJson);

  // Migrate to new system
  for (const oldToken of oldTokens) {
    await TokenService.createToken({
      name: oldToken.name,
      symbol: oldToken.symbol,
      amount: oldToken.amount,
      value: oldToken.value,
      currency: oldToken.type || 'infinity_tokens',
      source: 'migration',
      metadata: {
        migrated: true,
        originalId: oldToken.id
      }
    });
  }

  console.log(`Migrated ${oldTokens.length} tokens`);
  
  // Optional: Remove old data after successful migration
  // localStorage.removeItem('old_tokens_key');
}
```

### Migrating User Data

If you have existing user/auth data:

```typescript
import { createModel } from '@/shared/client-model';

const UserModel = createModel('users', {
  email: { type: 'string', required: true },
  username: { type: 'string', required: true },
  authMethod: { type: 'string', default: 'magic-link' }
});

async function migrateUserData() {
  const oldUserJson = localStorage.getItem('old_user_key');
  if (!oldUserJson) return;

  const oldUser = JSON.parse(oldUserJson);

  // Create user in new system
  await UserModel.create({
    email: oldUser.email,
    username: oldUser.username || oldUser.login,
    displayName: oldUser.name,
    avatar: oldUser.avatar,
    authMethod: 'migration',
    verified: true,
    lastLogin: new Date().toISOString()
  });

  console.log('User data migrated');
}
```

## Rollback Instructions

### Quick Rollback

If you need to quickly rollback the changes:

1. **Remove the shared folder:**
   ```bash
   rm -rf src/shared
   ```

2. **Uninstall dependencies:**
   ```bash
   npm uninstall dexie
   ```

3. **Remove theme import:**
   Remove `@import './shared/theme.css';` from your CSS files.

4. **Remove service initialization:**
   Remove TokenService and IntegrationListener initialization from your main app file.

5. **Remove UI components:**
   Remove LoginComponent and WalletUI from your navigation.

6. **Revert package.json:**
   ```bash
   git checkout package.json package-lock.json
   npm install
   ```

### Detailed Rollback with Data Preservation

If you want to preserve data during rollback:

1. **Export data before rollback:**
   ```typescript
   import { TokenService } from '@/shared/token-service';
   import { ClientModel, createModel } from '@/shared/client-model';

   async function backupData() {
     // Export tokens
     const tokens = await TokenService.getAll();
     localStorage.setItem('tokens_backup', JSON.stringify(tokens));

     // Export user data
     const UserModel = createModel('users', {
       email: { type: 'string', required: true }
     });
     const userData = await UserModel.export();
     localStorage.setItem('users_backup', userData);

     console.log('Data backed up to localStorage');
   }
   ```

2. **Perform rollback** (follow Quick Rollback steps)

3. **Restore data** to your old system format (if needed)

### Database Cleanup

To completely remove all data created by the new system:

```typescript
// Clear IndexedDB databases
async function cleanupDatabases() {
  // Delete token database
  await window.indexedDB.deleteDatabase('PewpiTokenDB');
  
  // Delete client model databases
  await window.indexedDB.deleteDatabase('PewpiClientModel_users');
  await window.indexedDB.deleteDatabase('PewpiClientModel_sessions');
  await window.indexedDB.deleteDatabase('PewpiClientModel_magic_links');
  
  // Clear localStorage items
  localStorage.removeItem('pewpi_tokens');
  localStorage.removeItem('pewpi_session_token');
  localStorage.removeItem('pewpi_user');
  
  console.log('All databases cleaned up');
}
```

## Optional Features

### Enabling Encryption

To enable AES-GCM encryption for token data:

```typescript
import { encryptToString, decryptFromString, generateKey } from '@/shared/crypto/aes-gcm';

// Generate encryption key
const encryptionKey = await generateKey();

// Encrypt token data before storage
const token = await TokenService.createToken({
  name: 'Encrypted Token',
  symbol: 'ENC',
  amount: 100,
  value: 1000,
  currency: 'infinity_tokens'
});

// Add encrypted metadata
if (token.metadata) {
  const encryptedMetadata = await encryptToString(
    JSON.stringify(token.metadata),
    encryptionKey
  );
  
  await TokenService.updateToken(token.id, {
    metadata: {
      ...token.metadata,
      encrypted: encryptedMetadata
    }
  });
}
```

### Enabling P2P Sync

To enable peer-to-peer synchronization:

```typescript
import { p2pSync } from '@/shared/p2p/peer-sync';

// Initialize P2P sync with custom config
const success = await p2pSync.enable({
  signalingUrl: 'wss://your-signaling-server.com',
  turnServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ],
  autoSync: true
});

if (success) {
  console.log('P2P sync enabled');
  console.log('Local peer ID:', p2pSync.getLocalId());
}

// Connect to specific peer
await p2pSync.connectToPeer('peer_id_here');

// Get connected peers
const peers = p2pSync.getConnectedPeers();
console.log('Connected peers:', peers);
```

### Enabling SMTP for Production Magic-Links

For production environments, configure SMTP:

```typescript
import { AuthService } from '@/shared/auth/auth-service';

// Disable dev-mode
AuthService.setDevMode(false);

// Configure your backend to send emails
// When AuthService.requestMagicLink is called,
// instead of returning devLink, send actual email via SMTP
```

## Troubleshooting

### Issue: "Dexie is not defined"

**Solution:** Install Dexie dependency:
```bash
npm install dexie
```

### Issue: IndexedDB not working

**Possible causes:**
- Private/Incognito mode (IndexedDB disabled)
- Browser storage quota exceeded
- Browser doesn't support IndexedDB

**Solution:** System automatically falls back to localStorage

### Issue: Tests failing after migration

**Solution:** Install test dependencies:
```bash
npm install --save-dev vitest fake-indexeddb @testing-library/react
```

### Issue: TypeScript errors

**Solution:** Ensure path alias is configured in tsconfig.json:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Tokens not syncing across tabs

**Solutions:**
1. Check that `TokenService.initAutoTracking()` is called
2. Verify localStorage is enabled
3. Check browser console for errors
4. Try clearing browser cache and reloading

### Issue: Magic-link not working

**Solutions:**
1. Verify dev-mode is enabled: `AuthService.setDevMode(true)`
2. Check URL for magic_token parameter
3. Check browser console for errors
4. Try with a different email address

### Issue: Performance degradation with many tokens

**Solutions:**
1. Implement pagination in wallet UI
2. Use `getByCurrency()` instead of `getAll()`
3. Add virtual scrolling to token lists
4. Consider periodic cleanup of old tokens

## Post-Migration Checklist

After completing migration:

- [ ] Test login flow (magic-link and GitHub OAuth)
- [ ] Test token creation and retrieval
- [ ] Test wallet UI display
- [ ] Verify cross-tab synchronization
- [ ] Check browser console for errors
- [ ] Test on multiple browsers
- [ ] Verify data persistence after browser restart
- [ ] Run test suite (if applicable)
- [ ] Update documentation
- [ ] Train team members on new system

## Getting Help

If you encounter issues during migration:

1. Review the INTEGRATION.md guide
2. Check the test files for usage examples
3. Review error messages in browser console
4. Check IndexedDB status in DevTools
5. Open an issue on GitHub with:
   - Error messages
   - Browser version
   - Steps to reproduce
   - Migration step where issue occurred

## Version Compatibility

This migration guide is for:
- **System Version:** 1.0.0
- **Minimum Node.js:** 18.0.0
- **Dexie Version:** 4.x
- **React Version:** 18.x+
- **TypeScript Version:** 5.x

## Next Steps

After successful migration:

1. Monitor performance and error logs
2. Gather user feedback
3. Consider enabling optional features (encryption, P2P)
4. Plan backend integration for cross-device sync
5. Implement analytics for token usage
6. Add more currency types as needed
7. Enhance wallet UI with charts and analytics

---

**Need Help?** Open an issue or check the integration examples in the test files.
