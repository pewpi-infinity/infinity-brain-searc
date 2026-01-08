# Pewpi-Shared Integration Guide

This document explains how to integrate and use the unified `pewpi-shared` library in your repository.

## Overview

The `pewpi-shared` library provides:
- **Token Service**: Dexie-backed IndexedDB token management with localStorage fallback
- **Auth Service**: Magic-link and GitHub OAuth authentication
- **Wallet Helpers**: Token earning, spending, and balance tracking
- **Integration Listener**: Cross-repo event synchronization
- **UI Components**: Login modal and wallet display

## Quick Start

### 1. Initialize Services

Add this code to your app's entry point (e.g., `src/main.tsx`):

```typescript
import { tokenService } from '@/pewpi-shared/token-service';
import { authService } from '@/pewpi-shared/auth-service';

// Initialize authentication and restore session
try {
  await authService.init();
  console.log('Auth initialized');
} catch (error) {
  console.error('Auth initialization failed:', error);
}

// Initialize token auto-tracking
try {
  tokenService.initAutoTracking();
  console.log('Token auto-tracking enabled');
} catch (error) {
  console.error('Token auto-tracking failed:', error);
}
```

### 2. Using Token Service

```typescript
import { tokenService } from '@/pewpi-shared/token-service';

// Create a token
const token = await tokenService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  amount: 100,
  creator: 'user123',
  metadata: { source: 'reward' }
});

// Get all tokens
const tokens = await tokenService.getAll();

// Update a token
await tokenService.updateToken(token.id, { amount: 150 });

// Delete a token
await tokenService.deleteToken(token.id);

// Get total balance
const totalBalance = await tokenService.getTotalBalance();

// Subscribe to events
const unsubscribe = tokenService.on('created', (event) => {
  console.log('Token created:', event.token);
});
```

### 3. Using Auth Service

```typescript
import { authService } from '@/pewpi-shared/auth-service';

// Request magic link (dev mode)
const { token, devLink } = await authService.requestMagicLink('user@example.com');
console.log('Magic link:', devLink);

// Login with magic link token
const user = await authService.loginWithMagicLink(token);

// Login with GitHub (Spark environment)
const githubUser = await authService.loginWithGitHub({
  id: '123',
  login: 'username',
  email: 'user@example.com'
});

// Check authentication
const isLoggedIn = authService.isAuthenticated();
const currentUser = authService.getCurrentUser();

// Logout
await authService.logout();
```

### 4. Using Wallet Helpers

```typescript
import { earnTokens, spendTokens, getAllBalances } from '@/pewpi-shared/wallet-unified';

// Earn tokens
const token = await earnTokens({
  name: 'Reward Token',
  symbol: 'RWD',
  amount: 50,
  creator: 'system',
  metadata: { reason: 'completed task' }
});

// Spend tokens
await spendTokens({
  tokenId: token.id,
  amount: 25,
  description: 'Purchased item'
});

// Get all balances
const balances = await getAllBalances();
console.log('Balances by creator:', balances);
```

### 5. Using Integration Listener

```typescript
import { createIntegrationListener } from '@/pewpi-shared/integration-listener';

const listener = createIntegrationListener({
  repoName: 'my-repo',
  onTokenCreated: (token) => {
    console.log('Token created:', token.name);
    // Update UI
  },
  onTokenUpdated: (token) => {
    console.log('Token updated:', token.name);
  },
  onLoginChanged: (user, isAuthenticated) => {
    console.log('Login status:', isAuthenticated);
    // Update navigation
  }
});

// Cleanup when done
listener.cleanup();
```

### 6. Using UI Components

```typescript
import { UnifiedLoginModal } from '@/pewpi-shared/components/UnifiedLoginModal';
import { WalletDisplay } from '@/pewpi-shared/components/WalletDisplay';

function MyApp() {
  const [showLogin, setShowLogin] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  return (
    <>
      <button onClick={() => setShowLogin(true)}>Login</button>
      <button onClick={() => setShowWallet(true)}>Wallet</button>

      <UnifiedLoginModal 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => {
          console.log('Login successful');
          setShowLogin(false);
        }}
      />

      <WalletDisplay 
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
      />
    </>
  );
}
```

## Event Reference

The library emits the following CustomEvents:

### Token Events
- `pewpi.token.created` - Emitted when a token is created
- `pewpi.token.updated` - Emitted when a token is updated
- `pewpi.token.deleted` - Emitted when a token is deleted

### Auth Events
- `pewpi.login.changed` - Emitted when login status changes

### Wallet Events
- `pewpi.wallet.transaction` - Emitted when a transaction is recorded

## Cross-Tab Synchronization

The library automatically synchronizes state across tabs using:
1. CustomEvent dispatching for same-tab communication
2. localStorage events for cross-tab communication

Events are broadcast via temporary localStorage keys that auto-cleanup after 1 second.

## Testing

### Test Magic Link Flow

1. Open the app
2. Click "Login"
3. Enter an email address
4. Check the console for the dev-mode magic link
5. Click the link button or paste the URL
6. Verify you're logged in

### Test Token Creation

```typescript
// In browser console
import { tokenService } from './src/pewpi-shared/token-service';

// Create a token
const token = await tokenService.createToken({
  name: 'Test Token',
  symbol: 'TEST',
  amount: 100,
  creator: 'tester'
});

// Verify it was created
const tokens = await tokenService.getAll();
console.log(tokens);

// Listen for token created event
window.addEventListener('pewpi.token.created', (e) => {
  console.log('Token created event:', e.detail);
});
```

### Test Cross-Tab Sync

1. Open the app in two browser tabs
2. Create a token in one tab
3. Observe the event in the second tab's console

## Feature Flags

To enable pewpi-shared features in your app, you can use environment variables:

```typescript
// Check if pewpi-shared is enabled
const ENABLE_PEWPI_SHARED = import.meta.env.VITE_ENABLE_PEWPI_SHARED === 'true';

if (ENABLE_PEWPI_SHARED) {
  // Initialize pewpi-shared services
  await authService.init();
  tokenService.initAutoTracking();
}
```

Add to `.env`:
```
VITE_ENABLE_PEWPI_SHARED=true
```

## Troubleshooting

### IndexedDB not available
- The library automatically falls back to localStorage
- Check browser console for warnings
- Verify IndexedDB is enabled in browser settings

### Magic link not working
- Check browser console for the dev-mode link
- Verify the token hasn't expired (15 minutes)
- Try requesting a new magic link

### Events not firing
- Verify `tokenService.initAutoTracking()` was called
- Check that event listeners are registered before actions occur
- Use browser DevTools to monitor CustomEvents

## Migration from Existing Systems

If your repo already has auth/wallet/token code:

1. **Don't remove existing code** - This PR is additive
2. Test pewpi-shared in parallel with existing systems
3. Gradually migrate by:
   - Replacing imports with pewpi-shared versions
   - Testing each component individually
   - Removing legacy code only after thorough testing

## Support

For issues or questions:
1. Check this documentation
2. Review the source code in `src/pewpi-shared/`
3. Open an issue in the repository
4. Contact the pewpi-infinity team
