# Integration Guide

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
