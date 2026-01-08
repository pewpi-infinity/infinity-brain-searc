# Pewpi-Shared Library

Unified authentication, wallet, and token management library for the pewpi-infinity organization.

## 🎯 Purpose

This library provides a standardized way to handle:
- **Authentication**: Magic-link and GitHub OAuth flows
- **Token Management**: Create, read, update, delete tokens with IndexedDB
- **Wallet Operations**: Earn, spend, track balances
- **Cross-Repo Sync**: Event-based communication across repositories and browser tabs

## 📦 What's Included

### Core Services

- **`token-service.ts`** - Token CRUD with Dexie IndexedDB and localStorage fallback
- **`auth-service.ts`** - Authentication with magic-link and GitHub OAuth helpers
- **`wallet-unified.ts`** - Wallet helper functions for earning/spending tokens
- **`integration-listener.ts`** - Cross-repo event subscription utility

### UI Components

- **`UnifiedLoginModal.tsx`** - Lightweight login modal (opt-in)
- **`WalletDisplay.tsx`** - Token balance display component (opt-in)

### Documentation

- **`docs/INTEGRATION.md`** - Complete integration guide with examples

## 🚀 Quick Start

```typescript
import { tokenService } from '@/pewpi-shared/token-service';
import { authService } from '@/pewpi-shared/auth-service';

// Initialize services
await authService.init();
tokenService.initAutoTracking();

// Create a token
const token = await tokenService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  amount: 100,
  creator: 'user123'
});

// Login with magic link
const { devLink } = await authService.requestMagicLink('user@example.com');
```

See [INTEGRATION.md](./docs/INTEGRATION.md) for complete documentation.

## 🎨 Design Principles

1. **Non-Destructive**: Works alongside existing code
2. **Opt-In**: Use what you need, ignore the rest
3. **Defensive**: Try/catch wrappers prevent breaking builds
4. **Event-Driven**: CustomEvents for loose coupling
5. **Fallback-Ready**: localStorage when IndexedDB fails
6. **Cross-Tab**: Automatic synchronization across browser tabs

## 🔧 Architecture

```
pewpi-shared/
├── token-service.ts          # Token CRUD + IndexedDB
├── auth-service.ts            # Magic-link + GitHub auth
├── wallet-unified.ts          # Wallet helpers
├── integration-listener.ts    # Event subscription
├── components/
│   ├── UnifiedLoginModal.tsx  # Login UI
│   └── WalletDisplay.tsx      # Wallet UI
├── docs/
│   └── INTEGRATION.md         # Integration guide
└── README.md                  # This file
```

## 📊 Event System

The library emits CustomEvents for cross-component communication:

- `pewpi.token.created` - New token created
- `pewpi.token.updated` - Token updated
- `pewpi.token.deleted` - Token deleted
- `pewpi.login.changed` - Login status changed
- `pewpi.wallet.transaction` - Wallet transaction recorded

## 🔐 Security

- Uses Web Crypto API for secure token generation
- Magic links expire after 15 minutes
- Sessions expire after 30 days
- Client-side only (no backend required for dev mode)
- GitHub OAuth requires Spark environment or backend setup

## 🧪 Testing

```typescript
// Test token creation
const token = await tokenService.createToken({
  name: 'Test',
  symbol: 'TST',
  amount: 100,
  creator: 'test'
});

// Test event emission
window.addEventListener('pewpi.token.created', (e) => {
  console.log('Token created:', e.detail);
});

// Test authentication
const { devLink } = await authService.requestMagicLink('test@example.com');
console.log('Login link:', devLink);
```

## 📝 Examples

### Listen to Token Events

```typescript
import { createIntegrationListener } from '@/pewpi-shared/integration-listener';

createIntegrationListener({
  repoName: 'my-app',
  onTokenCreated: (token) => {
    console.log('New token:', token.name);
  }
});
```

### Earn Tokens

```typescript
import { earnTokens } from '@/pewpi-shared/wallet-unified';

await earnTokens({
  name: 'Reward',
  symbol: 'RWD',
  amount: 50,
  creator: 'system'
});
```

### Show Login Modal

```typescript
import { UnifiedLoginModal } from '@/pewpi-shared/components/UnifiedLoginModal';

<UnifiedLoginModal 
  isOpen={true}
  onClose={() => {}}
  onLoginSuccess={() => console.log('Logged in!')}
/>
```

## 🔄 Synchronization

**Same Tab**: CustomEvent dispatching  
**Cross Tab**: localStorage events with auto-cleanup  
**Cross Repo**: Shared event names and data formats

## 📚 Resources

- [Integration Guide](./docs/INTEGRATION.md) - Complete setup instructions
- [Token Service](./token-service.ts) - Token management API
- [Auth Service](./auth-service.ts) - Authentication API
- [Wallet Helpers](./wallet-unified.ts) - Wallet operations

## 🤝 Contributing

This library is synthesized from best practices across pewpi-infinity repositories:
- infinity-brain-111
- repo-dashboard-hub
- banksy
- v
- z

To contribute improvements, test changes across multiple repos before committing.

## 📄 License

Same as parent repository.

## 🆘 Support

See [INTEGRATION.md](./docs/INTEGRATION.md) troubleshooting section or open an issue.
