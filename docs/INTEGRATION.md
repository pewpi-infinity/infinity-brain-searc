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
## Overview

This guide explains how to integrate the Pewpi Shared Token/Wallet system into other repositories (banksy, v, infinity-brain-searc, repo-dashboard-hub, etc.) to enable cross-repository token synchronization and shared authentication.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Installation](#installation)
- [Basic Integration](#basic-integration)
- [Advanced Integration](#advanced-integration)
- [Event System](#event-system)
- [Cross-Repository Sync](#cross-repository-sync)
- [P2P Synchronization](#p2p-synchronization)
- [Security](#security)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 5-Minute Integration

1. **Copy the shared folder** from this repository to your project:
   ```bash
   cp -r src/shared /path/to/your/repo/src/
   ```

2. **Install dependencies**:
   ```bash
   npm install dexie
   ```

3. **Initialize in your app**:
   ```typescript
   import { initializePewpiShared, tokenService, authService } from '@/shared';
   
   // In your app initialization
   await initializePewpiShared();
   ```

4. **Use the components**:
   ```typescript
   import { Login, Wallet } from '@/shared';
   
   function App() {
     return (
       <div>
         <Login />
         <Wallet />
       </div>
     );
   }
   ```

That's it! Your app now has production-grade login and wallet functionality.

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Login      │  │   Wallet     │  │  Custom UI   │     │
│  │  Component   │  │  Component   │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐             │
│         │      useAuth Hook / AuthService      │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
├────────────────────────────┼─────────────────────────────────┤
│      Pewpi Shared Layer    │                                 │
├────────────────────────────┼─────────────────────────────────┤
│                            │                                 │
│  ┌─────────────────────────┴───────────────────────┐        │
│  │            TokenService (Singleton)             │        │
│  │  ┌─────────────────────────────────────────┐   │        │
│  │  │  IndexedDB (Dexie) + localStorage       │   │        │
│  │  └─────────────────────────────────────────┘   │        │
│  └─────────────────────────────────────────────────┘        │
│                            │                                 │
│  ┌─────────────────────────┴───────────────────────┐        │
│  │              Event System                       │        │
│  │  - Internal events (on/emit)                    │        │
│  │  - Window events (pewpi.token.created, etc.)    │        │
│  └─────────────────────────────────────────────────┘        │
│                            │                                 │
│  ┌─────────────────────────┴───────────────────────┐        │
│  │            PeerSync (Optional)                  │        │
│  │  - WebRTC DataChannel                           │        │
│  │  - P2P token synchronization                    │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User logs in** → AuthService → Emits `pewpi.login.changed` event
2. **Token created** → TokenService → IndexedDB → Emits `pewpi.token.created` event
3. **Other repos listening** → Receive event → Update their state automatically

## Installation

### Option 1: Copy Files (Recommended)

Copy the `src/shared` folder to your repository:

```bash
# From infinity-brain-searc repo
cp -r src/shared /path/to/your/repo/src/

# Install dependencies
cd /path/to/your/repo
npm install dexie
```

### Option 2: Git Submodule

```bash
# Add as submodule
git submodule add https://github.com/pewpi-infinity/infinity-brain-searc.git libs/infinity-brain-searc

# Link the shared folder
ln -s libs/infinity-brain-searc/src/shared src/shared

# Install dependencies
npm install dexie
```

### Option 3: npm Package (Future)

```bash
# When published to npm
npm install pewpi-shared-token
```

## Basic Integration

### Step 1: Initialize Services

```typescript
// src/index.tsx or src/main.tsx
import { initializePewpiShared } from '@/shared';

async function bootstrap() {
  await initializePewpiShared();
  // ... rest of your app initialization
}

bootstrap();
```

### Step 2: Add Authentication

```typescript
// src/App.tsx
import { useAuth, Login } from '@/shared';

function App() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div>
      <h1>Welcome {user?.email || user?.githubLogin}</h1>
      {/* Your app content */}
    </div>
  );
}
```

### Step 3: Use Wallet Component

```typescript
import { Wallet } from '@/shared';

function WalletPage() {
  return (
    <div>
      <h1>My Wallet</h1>
      <Wallet />
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
### Step 4: Create Tokens Programmatically

```typescript
import { tokenService } from '@/shared';

async function createMyToken() {
  const token = await tokenService.createToken({
    name: 'My Custom Token',
    symbol: 'MCT',
    amount: 1000,
    creator: 'user@example.com',
    metadata: {
      category: 'custom',
      description: 'Created from my app',
    },
  });
  
  console.log('Token created:', token);
}
```

## Advanced Integration

### Custom Authentication UI

Instead of using the provided Login component, create your own:

```typescript
import { authService } from '@/shared';
import { useState } from 'react';

function CustomLogin() {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    try {
      const { devLink } = await authService.requestMagicLink(email);
      console.log('Magic link:', devLink);
      alert('Check console for your login link');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleLogin}>Send Magic Link</button>
    </div>
  );
}
```

### Custom Wallet Display

Create a minimal wallet display without the full UI:

```typescript
import { tokenService } from '@/shared';
import { useState, useEffect } from 'react';

function MiniWallet() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadBalance = async () => {
      const tokens = await tokenService.getAll();
      const total = tokens.reduce((sum, t) => sum + t.amount, 0);
      setBalance(total);
    };

    loadBalance();

    // Listen for token changes
    const unsubscribe = tokenService.on('all', loadBalance);
    return unsubscribe;
  }, []);

  return <div>Balance: {balance} tokens</div>;
}
```

### Subscribe to Specific Events

```typescript
import { tokenService } from '@/shared';

// Listen only for new tokens
const unsubscribe = tokenService.on('created', (event) => {
  console.log('New token:', event.token);
  // Update your UI
  showNotification(`${event.token.name} created!`);
});

// Clean up when component unmounts
return () => unsubscribe();
```

## Event System

### Available Events

#### Token Events

```typescript
import { tokenService } from '@/shared';

// Token created
tokenService.on('created', (event) => {
  console.log('Token created:', event.token);
});

// Token updated
tokenService.on('updated', (event) => {
  console.log('Token updated:', event.token);
});

// Token deleted
tokenService.on('deleted', (event) => {
  console.log('Token deleted:', event.token);
});

// All token events
tokenService.on('all', (event) => {
  console.log('Token event:', event.type, event.token);
});
```

#### Login Events

```typescript
// Login/logout changes
window.addEventListener('pewpi.login.changed', (event) => {
  const { user, isAuthenticated } = event.detail;
  console.log('Auth changed:', { user, isAuthenticated });
});
```

#### Window Events (Cross-Repository)

```typescript
// Token created (cross-repo sync)
window.addEventListener('pewpi.token.created', (event) => {
  const token = event.detail;
  console.log('Token created (from any repo):', token);
});
```

### Creating Custom Events

You can emit your own events to maintain the pattern:

```typescript
// Emit a custom event
function emitCustomEvent(data: any) {
  const event = new CustomEvent('pewpi.custom.event', {
    detail: data,
  });
  window.dispatchEvent(event);
}

// Listen for custom event
window.addEventListener('pewpi.custom.event', (event) => {
  console.log('Custom event:', event.detail);
});
```

## Cross-Repository Sync

### How It Works

All repositories sharing the Pewpi system automatically sync through:
1. **Shared IndexedDB** - Same origin = same database
2. **Window Events** - Cross-tab/window communication
3. **Event Listeners** - Real-time updates

### Setting Up Sync

```typescript
import { CrossRepoTokenSync } from '@/shared';

// In your app initialization
const sync = new CrossRepoTokenSync();
await sync.initialize();

// Listen for changes
sync.onChange((tokens) => {
  console.log('Tokens updated from another repo:', tokens);
  updateYourUI(tokens);
});

// Get current tokens
const tokens = sync.getTokens();
```

### Example: Banksy ↔ Infinity Brain Sync

**In Banksy repository:**
```typescript
import { tokenService } from '@/shared';

// Create a token in Banksy
await tokenService.createToken({
  name: 'Banksy Art Token',
  symbol: 'BART',
  amount: 500,
  creator: 'artist@banksy.com',
  metadata: { artType: 'digital' },
});

// This token automatically appears in Infinity Brain!
```

**In Infinity Brain repository:**
```typescript
import { tokenService } from '@/shared';

// Listen for tokens from Banksy
window.addEventListener('pewpi.token.created', (event) => {
  console.log('New token from Banksy:', event.detail);
  
  if (event.detail.metadata?.artType === 'digital') {
    showArtGallery(event.detail);
  }
});
```

### Multi-Repository Dashboard Example

```typescript
// In repo-dashboard-hub
import { tokenService, authService } from '@/shared';

function MultiRepoDashboard() {
  const [repoTokens, setRepoTokens] = useState<Map<string, Token[]>>(new Map());

  useEffect(() => {
    const updateTokens = async () => {
      const allTokens = await tokenService.getAll();
      
      // Group by source repository
      const grouped = new Map<string, Token[]>();
      allTokens.forEach(token => {
        const repo = token.metadata?.sourceRepo || 'unknown';
        if (!grouped.has(repo)) {
          grouped.set(repo, []);
        }
        grouped.get(repo)!.push(token);
      });
      
      setRepoTokens(grouped);
    };

    updateTokens();
    
    const unsubscribe = tokenService.on('all', updateTokens);
    return unsubscribe;
  }, []);

  return (
    <div>
      {Array.from(repoTokens.entries()).map(([repo, tokens]) => (
        <div key={repo}>
          <h2>{repo}</h2>
          <p>{tokens.length} tokens</p>
          <p>Total: {tokens.reduce((sum, t) => sum + t.amount, 0)}</p>
        </div>
      ))}
    </div>
  );
}
```

## P2P Synchronization

### Enable P2P Sync (Optional)

For peer-to-peer synchronization across different devices or networks:

```typescript
import { createPeerSync } from '@/shared';

// Create P2P sync instance
const peerSync = createPeerSync({
  signalingUrl: 'wss://your-signaling-server.com',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass',
    },
  ],
  autoSync: true,
  encryptionEnabled: true,
});

// Initialize
await peerSync.initialize();

// Connect to a peer
await peerSync.connectToPeer('peer-id-123');

// Sync will happen automatically
```

### Configure Signaling Server

The P2P system requires a signaling server for initial connection. You can:

1. **Use a public service** like PeerJS Cloud
2. **Run your own** using Socket.io:

```javascript
// Simple signaling server (Node.js + Socket.io)
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  socket.on('signal', (data) => {
    socket.broadcast.emit('signal', data);
  });
});
```

3. **Disable P2P** and use only local/cross-origin sync

## Security

### Authentication Security

1. **Magic Links** are single-use and expire after 15 minutes
2. **Tokens** are stored securely in IndexedDB
3. **Sessions** expire after 30 days
4. **No passwords** are stored anywhere

### Token Security

```typescript
import { encrypt, decrypt, generateKey } from '@/shared';

// Encrypt sensitive token data
const key = await generateKey();
const encrypted = await encryptToBase64('sensitive data', key);

// Store encrypted data
await tokenService.createToken({
  name: 'Secure Token',
  symbol: 'SEC',
  amount: 1000,
  creator: 'user@example.com',
  metadata: {
    encryptedData: encrypted,
  },
});

// Decrypt when needed
const decrypted = await decryptFromBase64(encrypted, key);
```

### P2P Encryption

When P2P sync is enabled with encryption:

```typescript
import { ECDHKeyExchange } from '@/shared';

// Each peer generates key pair
const keyExchange = new ECDHKeyExchange();
const publicKey = await keyExchange.initialize();

// Exchange public keys (via signaling)
// ...

// Derive shared secret
await keyExchange.deriveSharedSecret(peerPublicKey);

// Now all messages are encrypted
const encrypted = await keyExchange.encryptMessage('secret');
const decrypted = await keyExchange.decryptMessage(encrypted);
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
### Migrating Existing Token System

If you have an existing token system:

```typescript
import { tokenService } from '@/shared';

// Export your old tokens
const oldTokens = await getOldTokens();

// Convert to new format
const converted = oldTokens.map(old => ({
  name: old.tokenName,
  symbol: old.ticker,
  amount: old.balance,
  creator: old.owner,
  metadata: {
    ...old.extraData,
    migratedFrom: 'old-system',
    originalId: old.id,
  },
}));

// Import to new system
for (const token of converted) {
  await tokenService.createToken(token);
}

// Cleanup old system
await cleanupOldTokenSystem();
```

### Migrating Authentication

```typescript
import { authService } from '@/shared';

// If you have existing user sessions
const existingUser = await getExistingUser();

if (existingUser) {
  // Create session in new system
  if (existingUser.githubId) {
    await authService.loginWithGitHubUser({
      id: existingUser.githubId,
      login: existingUser.username,
      email: existingUser.email,
      avatarUrl: existingUser.avatar,
      name: existingUser.name,
    });
  } else {
    // For email users, they'll need to use magic link
    console.log('User will need to re-authenticate with magic link');
  }
}
```

### Rollback Plan

If you need to rollback:

1. **Keep old system running** in parallel initially
2. **Sync both ways** during transition period
3. **Data is in IndexedDB** - easy to export/backup

```typescript
// Backup before migration
const backup = await tokenService.exportTokens();
localStorage.setItem('token_backup', backup);

// If rollback needed
const backup = localStorage.getItem('token_backup');
// Import to old system
```

## Troubleshooting

### Common Issues

#### "IndexedDB not available"

**Cause**: Running in environment without IndexedDB support

**Solution**: The system automatically falls back to localStorage

```typescript
// Works automatically - no action needed
// localStorage is used transparently
```

#### "Magic link not working"

**Cause**: URL parameter not being processed

**Solution**: Ensure magic link is opened in same origin

```typescript
// Check for magic link in URL
const urlParams = new URLSearchParams(window.location.search);
const magicToken = urlParams.get('magic_token');

if (magicToken) {
  await authService.loginWithMagicLink(magicToken);
}
```

#### "Tokens not syncing across repos"

**Cause**: Different origins or IndexedDB not shared

**Solution**: Ensure repos are on same origin, or use window events

```typescript
// Force sync via window events
window.addEventListener('pewpi.token.created', async () => {
  const tokens = await tokenService.getAll();
  updateYourState(tokens);
});
```

#### "P2P connection failing"

**Cause**: Signaling server unreachable or TURN server needed

**Solution**: Check server status and configure TURN

```typescript
const peerSync = createPeerSync({
  signalingUrl: 'wss://working-server.com',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn.com:3478',
      username: 'user',
      credential: 'pass',
    },
  ],
});
```

### Debug Mode

Enable verbose logging:

```typescript
// In your app initialization
localStorage.setItem('pewpi_debug', 'true');

// Now all services log verbosely
// Check browser console for detailed logs
```

### Health Check

```typescript
import { tokenService, authService } from '@/shared';

async function healthCheck() {
  try {
    // Check auth
    const user = authService.getCurrentUser();
    console.log('Auth OK:', user !== null);

    // Check token service
    const tokens = await tokenService.getAll();
    console.log('TokenService OK:', tokens.length, 'tokens');

    // Check events
    let eventOk = false;
    const unsubscribe = tokenService.on('created', () => {
      eventOk = true;
    });
    await tokenService.createToken({
      name: 'Test',
      symbol: 'TEST',
      amount: 1,
      creator: 'test',
    });
    console.log('Events OK:', eventOk);
    unsubscribe();

    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
```

## Support

### Getting Help

1. Check this documentation
2. Check the inline code comments in `src/shared/`
3. Look at the integration examples in `src/shared/integration-listener.ts`
4. Open an issue on GitHub

### Contributing

To contribute improvements:

1. Fork the infinity-brain-searc repository
2. Make changes in `src/shared/`
3. Add tests in `src/shared/__tests__/`
4. Submit PR with examples

## Version History

- **v1.0.0** (2026-01-07): Initial production release
  - TokenService with IndexedDB + localStorage fallback
  - AuthService with magic-link and GitHub OAuth
  - ClientModel (mongoose-emulator)
  - Login and Wallet components
  - Event system for cross-repo sync
  - P2P sync hooks
  - Encryption utilities

---

**Maintained by**: pewpi-infinity
**License**: MIT
**Repository**: https://github.com/pewpi-infinity/infinity-brain-searc
This guide explains how to integrate the Pewpi shared token/wallet system with other repositories (banksy, v, infinity-brain-searc, repo-dashboard-hub, etc.) to enable seamless wallet and login state synchronization across the ecosystem.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Components](#core-components)
3. [Repository-Specific Integration](#repository-specific-integration)
4. [Event System](#event-system)
5. [API Reference](#api-reference)
6. [Examples](#examples)

## Quick Start

### 1. Copy Shared Libraries

Copy the following files from `infinity-brain-searc` to your repository:

```bash
# From infinity-brain-searc/src/shared/
- token-service.ts
- client-model.ts
- auth/auth-service.ts
- auth/login-component.tsx
- wallet/wallet-ui.tsx
- crypto/aes-gcm.ts (optional for encryption)
- p2p/peer-sync.ts (optional for P2P sync)
- integration/listener.ts
- theme.css
```

### 2. Install Dependencies

```bash
npm install dexie
```

Optional for testing:
```bash
npm install --save-dev vitest fake-indexeddb @testing-library/react
```

### 3. Initialize Integration Listener

In your main app file:

```typescript
import { createIntegrationListener } from '@/shared/integration/listener';
import { TokenService } from '@/shared/token-service';

// Initialize the integration listener
const integration = createIntegrationListener({
  repoName: 'your-repo-name',
  onTokenCreated: (token) => {
    console.log('Token created:', token.name);
    // Update your UI
  },
  onLoginChanged: (user, loggedIn) => {
    console.log('Login status changed:', loggedIn);
    // Update your navigation/user state
  }
});

// Initialize auto-tracking for token events
TokenService.initAutoTracking();
```

## Core Components

### TokenService

Manages token creation, storage, and synchronization using IndexedDB (Dexie).

```typescript
import { TokenService } from '@/shared/token-service';

// Create a token
const token = await TokenService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  amount: 100,
  value: 1000,
  currency: 'infinity_tokens',
  source: 'your-repo-name'
});

// Get all tokens
const tokens = await TokenService.getAll();

// Get tokens by currency
const infinityTokens = await TokenService.getByCurrency('infinity_tokens');

// Subscribe to events
const unsubscribe = TokenService.on('created', (event) => {
  console.log('Token created:', event.token);
});
```

### AuthService

Handles passwordless magic-link authentication and optional GitHub OAuth.

```typescript
import { AuthService } from '@/shared/auth/auth-service';

// Request magic-link (dev-mode)
const result = await AuthService.requestMagicLink('user@example.com');
if (result.success && result.devLink) {
  console.log('Magic link:', result.devLink);
}

// Verify magic-link token
const verification = await AuthService.verifyMagicLink(token);
if (verification.success) {
  console.log('User logged in:', verification.user);
}

// Check auth status
const isAuthenticated = AuthService.isAuthenticated();
const currentUser = AuthService.getCurrentUser();

// Logout
await AuthService.logout();
```

### ClientModel

Mongoose-like model for front-end data operations.

```typescript
import { createModel } from '@/shared/client-model';

const UserModel = createModel('users', {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true },
  age: { type: 'number', required: false }
});

// Create document
const user = await UserModel.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Find documents
const users = await UserModel.find({ age: 30 });

// Update document
const updated = await UserModel.findByIdAndUpdate(
  user._id,
  { age: 31 },
  { new: true }
);
```

## Repository-Specific Integration

### Banksy (Art & Launcher)

```typescript
import { TokenService } from '@/shared/token-service';
import { createIntegrationListener } from '@/shared/integration/listener';

// Initialize integration
const integration = createIntegrationListener({
  repoName: 'banksy',
  onTokenCreated: (token) => {
    // Update art token display in Banksy UI
    updateArtTokenCount(token);
  },
  onLoginChanged: (user, loggedIn) => {
    // Update Banksy navigation
    updateNavigation(user, loggedIn);
  }
});

// Award art tokens when user creates art
async function onArtCreated(artData) {
  const token = await TokenService.createToken({
    name: `${artData.theme} Art`,
    symbol: 'ART',
    amount: 1,
    value: Math.floor(artData.value / 1000),
    currency: 'art_tokens',
    source: 'banksy',
    metadata: {
      theme: artData.theme,
      timestamp: Date.now()
    }
  });
  
  console.log('Art token created:', token.name);
}
```

### V (Repository Manager)

```typescript
import { TokenService } from '@/shared/token-service';
import { createIntegrationListener } from '@/shared/integration/listener';

// Initialize integration
const integration = createIntegrationListener({
  repoName: 'v',
  onTokenCreated: (token) => {
    // Update token counter in V UI
    refreshTokenDisplay();
  },
  onTokenUpdated: (token) => {
    // Refresh specific token in UI
    refreshTokenItem(token.id);
  },
  onLoginChanged: (user, loggedIn) => {
    // Update V user state
    setUserState(user, loggedIn);
  }
});

// Award tokens for repository actions
async function onRepoAction(action) {
  await TokenService.createToken({
    name: `${action} Action`,
    symbol: 'INF',
    amount: 5,
    value: 50,
    currency: 'infinity_tokens',
    source: 'v',
    metadata: { action }
  });
}
```

### Repo Dashboard Hub (Dashboard & Music)

```typescript
import { TokenService } from '@/shared/token-service';
import { createIntegrationListener } from '@/shared/integration/listener';

// Initialize integration
const integration = createIntegrationListener({
  repoName: 'repo-dashboard-hub',
  onTokenCreated: (token) => {
    // Update dashboard metrics
    updateMetrics();
  },
  onTokensCleared: () => {
    // Handle token clear event
    resetMetrics();
  },
  onLoginChanged: (user, loggedIn) => {
    // Update dashboard user state
    updateDashboardUser(user, loggedIn);
  }
});

// Award music tokens for listening
async function onTrackPlayed(trackName) {
  await TokenService.createToken({
    name: `${trackName} Listen`,
    symbol: 'MSC',
    amount: 1,
    value: 10,
    currency: 'music_tokens',
    source: 'repo-dashboard-hub',
    metadata: { trackName }
  });
}
```

### Infinity Brain (This Repository)

```typescript
import { TokenService } from '@/shared/token-service';
import { createInfinityBrainIntegration } from '@/shared/integration/listener';

// Initialize integration
const integration = createInfinityBrainIntegration();

// Award tokens for AI actions
async function onAIQuery() {
  await TokenService.createToken({
    name: 'AI Query',
    symbol: 'INF',
    amount: 5,
    value: 50,
    currency: 'infinity_tokens',
    source: 'infinity-brain-searc'
  });
}
```

## Event System

The integration uses a dual event system:

### 1. TokenService Events (In-Process)

```typescript
// Subscribe to events
const unsubscribe = TokenService.on('created', (event) => {
  console.log('Token:', event.token);
  console.log('Timestamp:', event.timestamp);
});

// Unsubscribe
unsubscribe();
```

### 2. Window Events (Cross-Tab/Cross-Repo)

```typescript
// Listen for window events
window.addEventListener('pewpi.token.created', (e) => {
  console.log('Token created:', e.detail.token);
});

window.addEventListener('pewpi.login.changed', (e) => {
  console.log('Login changed:', e.detail.user, e.detail.loggedIn);
});

window.addEventListener('pewpi.tokens.cleared', (e) => {
  console.log('Tokens cleared at:', e.detail.timestamp);
});
```

### Event Types

- `pewpi.token.created` - New token created
- `pewpi.token.updated` - Token updated
- `pewpi.token.deleted` - Token deleted
- `pewpi.tokens.cleared` - All tokens cleared
- `pewpi.login.changed` - Login status changed
- `pewpi.p2p.token` - P2P token sync event (optional)

## API Reference

### TokenService

#### Methods

- `createToken(token)` - Create new token
- `getAll()` - Get all tokens
- `getByCurrency(currency)` - Get tokens by type
- `updateToken(id, updates)` - Update token
- `deleteToken(id)` - Delete token
- `clearAll()` - Clear all tokens
- `getStats()` - Get token statistics
- `on(event, callback)` - Subscribe to events
- `initAutoTracking()` - Enable cross-tab sync

### AuthService

#### Methods

- `requestMagicLink(email)` - Request magic-link
- `verifyMagicLink(token)` - Verify and login
- `loginWithGitHub()` - GitHub OAuth login
- `logout()` - Logout current user
- `getCurrentUser()` - Get current user
- `isAuthenticated()` - Check auth status
- `setDevMode(enabled)` - Toggle dev-mode

### IntegrationListener

#### Methods

- `init()` - Initialize listeners
- `cleanup()` - Remove all listeners
- `getAuthStatus()` - Get auth status
- `getAllTokens()` - Get all tokens
- `getTokensByCurrency(currency)` - Get tokens by type

## Examples

### Complete Integration Example

```typescript
// main.tsx or App.tsx
import { useEffect, useState } from 'react';
import { createIntegrationListener } from '@/shared/integration/listener';
import { TokenService } from '@/shared/token-service';
import { AuthService } from '@/shared/auth/auth-service';
import { LoginComponent } from '@/shared/auth/login-component';
import { WalletUI } from '@/shared/wallet/wallet-ui';

export function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [user, setUser] = useState(null);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    // Initialize integration
    const integration = createIntegrationListener({
      repoName: 'my-repo',
      onTokenCreated: (token) => {
        console.log('New token:', token.name);
        updateTokenCount();
      },
      onLoginChanged: (user, loggedIn) => {
        setUser(loggedIn ? user : null);
      }
    });

    // Initialize auto-tracking
    TokenService.initAutoTracking();

    // Check initial auth state
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Load initial token count
    updateTokenCount();

    return () => {
      integration.cleanup();
    };
  }, []);

  const updateTokenCount = async () => {
    const tokens = await TokenService.getAll();
    setTokenCount(tokens.length);
  };

  const handleCreateToken = async () => {
    await TokenService.createToken({
      name: 'Test Token',
      symbol: 'TEST',
      amount: 10,
      value: 100,
      currency: 'infinity_tokens',
      source: 'my-repo'
    });
  };

  return (
    <div>
      <nav>
        <button onClick={() => setShowLogin(true)}>
          {user ? user.username : 'Login'}
        </button>
        <button onClick={() => setShowWallet(true)}>
          Wallet ({tokenCount})
        </button>
      </nav>

      <button onClick={handleCreateToken}>
        Create Token
      </button>

      <LoginComponent
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />

      <WalletUI
        open={showWallet}
        onClose={() => setShowWallet(false)}
      />
    </div>
  );
}
```

## Troubleshooting

### Tokens Not Syncing

1. Check that `TokenService.initAutoTracking()` is called
2. Verify IndexedDB is working (check browser console)
3. Ensure localStorage is not disabled
4. Check for CORS issues if cross-origin

### Authentication Issues

1. Check dev-mode is enabled: `AuthService.setDevMode(true)`
2. Verify magic-link token is in URL
3. Check localStorage for session token
4. Clear browser data and try again

### Performance Issues

1. Use pagination for large token lists
2. Implement virtual scrolling for wallet UI
3. Debounce event handlers
4. Consider P2P sync only for active users

## Next Steps

1. Implement optional P2P sync for real-time updates
2. Add encryption for sensitive token data
3. Integrate with backend API for persistence
4. Add conflict resolution for concurrent updates
5. Implement token exchange/trading between currencies

## Support

For issues and questions:
- Check the main README.md
- Review the MIGRATION.md guide
- See test files for usage examples
- Open an issue on GitHub
