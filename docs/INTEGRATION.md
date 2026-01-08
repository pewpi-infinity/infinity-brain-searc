# Integration Guide

## Overview

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
