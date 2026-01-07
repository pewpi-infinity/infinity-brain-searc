# Infinity Brain - Clean Rebuild

A comprehensive AI-powered productivity hub for creating tokens, trading, building websites, and managing your digital economy.

## 🚀 What's New

### Production Login, Wallet & Token Sync System

This repository now includes a production-grade authentication, wallet, and token synchronization system that works across all Pewpi repositories. Key features:

#### 🔐 Authentication
- **Passwordless Magic-Link** - No passwords needed, just email
- **Dev-Mode Testing** - Local magic-links without SMTP
- **Optional GitHub OAuth** - Opt-in social authentication
- **Cross-Repo Sessions** - Login once, authenticated everywhere

#### 💰 Wallet System
- **4 Currency Types**: Infinity 💎, Research 📚, Art 🎨, Music 🎵
- **IndexedDB Storage** - Fast, persistent, and reliable (with localStorage fallback)
- **Live Token Feed** - Real-time updates when tokens are created
- **Token Management** - Create, update, delete, and track tokens
- **Cross-Tab Sync** - Changes reflect instantly across browser tabs

#### 🔄 Token Synchronization
- **Event System** - Subscribe to token and login events
- **Cross-Repo Updates** - Tokens created in one repo appear in others
- **Integration Hooks** - Easy integration with any repository
- **P2P Sync (Optional)** - WebRTC-based peer-to-peer synchronization

#### 🔒 Security & Privacy
- **AES-GCM Encryption** - Optional encryption for sensitive data
- **ECDH Key Exchange** - Secure peer-to-peer communication
- **Session Management** - 30-day sessions with automatic expiration
- **No Backend Required** - Fully client-side with IndexedDB

## What This Is

This is a clean rebuild of Infinity Brain minus any unauthorized guest mode or authentication modifications. This version contains only the core features you requested built with Spark.

## Features

- Token Creation & Management
- Trading & Marketplace
- Repository Management & Deployment
- AI Chat Assistant
- Quantum Audio System (Bismuth frequencies)
- Quantum Encryption Vault (SHA-256 + Bismuth)
- Gaming & Rewards
- **NEW: Production Login & Wallet System**
- **NEW: Cross-Repository Token Sync**
- **NEW: Passwordless Authentication**

## Tech Stack

- React + TypeScript
- Tailwind CSS + shadcn/ui components
- Vite build system
- Spark Runtime SDK for LLM & persistence
- **Dexie (IndexedDB wrapper) for data persistence**
- **Vitest for testing**

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Quick Start with New Features

```typescript
import { TokenService } from '@/shared/token-service';
import { AuthService } from '@/shared/auth/auth-service';
import { LoginComponent } from '@/shared/auth/login-component';
import { WalletUI } from '@/shared/wallet/wallet-ui';

// Initialize token tracking
TokenService.initAutoTracking();

// Request passwordless login
const result = await AuthService.requestMagicLink('user@example.com');
console.log('Magic link:', result.devLink);

// Create a token
const token = await TokenService.createToken({
  name: 'My First Token',
  symbol: 'MFT',
  amount: 100,
  value: 1000,
  currency: 'infinity_tokens',
  source: 'infinity-brain-searc'
});
```

## Documentation

- **[Integration Guide](./docs/INTEGRATION.md)** - How to integrate with other repositories
- **[Migration Guide](./docs/MIGRATION.md)** - Migration steps and rollback instructions
- **[UNIFIED_AUTH_README.md](./UNIFIED_AUTH_README.md)** - Original auth system documentation

## Testing

This repository includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

Test coverage includes:
- ✅ TokenService (create, read, update, delete, events)
- ✅ ClientModel (mongoose-like operations)
- ✅ IndexedDB integration with fallback
- ✅ Event system and cross-tab sync

## Architecture

### Shared Libraries

The `src/shared/` directory contains production-ready libraries that can be copied to other repositories:

```
src/shared/
├── token-service.ts          # Token management with IndexedDB
├── client-model.ts            # Mongoose-like front-end models
├── auth/
│   ├── auth-service.ts        # Authentication service
│   └── login-component.tsx    # Login UI component
├── wallet/
│   └── wallet-ui.tsx          # Wallet UI component
├── crypto/
│   └── aes-gcm.ts             # Encryption helpers
├── p2p/
│   └── peer-sync.ts           # P2P synchronization
├── integration/
│   └── listener.ts            # Integration examples
└── theme.css                  # Shared styling
```

### Event System

The system uses a dual-event architecture:

1. **In-Process Events** - Direct callbacks via TokenService.on()
2. **Window Events** - Cross-tab/cross-repo via window.dispatchEvent()

#### Available Events

- `pewpi.token.created` - New token created
- `pewpi.token.updated` - Token updated
- `pewpi.token.deleted` - Token deleted
- `pewpi.tokens.cleared` - All tokens cleared
- `pewpi.login.changed` - Login status changed

## Integration with Other Repositories

This system is designed to work seamlessly with other Pewpi repositories:

### Banksy Integration

```typescript
import { createBanskyIntegration } from '@/shared/integration/listener';

const integration = createBanskyIntegration();
// Automatically syncs art tokens from Banksy
```

### V Integration

```typescript
import { createVIntegration } from '@/shared/integration/listener';

const integration = createVIntegration();
// Syncs repository tokens from V
```

### Repo Dashboard Hub Integration

```typescript
import { createRepoDashboardIntegration } from '@/shared/integration/listener';

const integration = createRepoDashboardIntegration();
// Syncs music and dashboard tokens
```

See [INTEGRATION.md](./docs/INTEGRATION.md) for complete integration examples.

## Optional Features

### Enable Encryption

```typescript
import { encryptToString, decryptFromString, generateKey } from '@/shared/crypto/aes-gcm';

const key = await generateKey();
const encrypted = await encryptToString('sensitive data', key);
```

### Enable P2P Sync

```typescript
import { p2pSync } from '@/shared/p2p/peer-sync';

await p2pSync.enable({
  signalingUrl: 'wss://your-signal-server.com',
  turnServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  autoSync: true
});
```

## Security

- **No secrets in code** - All authentication uses secure tokens
- **Client-side first** - No backend required for basic functionality
- **Optional encryption** - AES-GCM for sensitive data
- **Session management** - 30-day expiration with secure tokens
- **ECDH key exchange** - For peer-to-peer encryption

## Contributing

This is a Spark application that runs in the Spark runtime environment. All features use the Spark SDK for AI capabilities and data persistence.

No unauthorized authentication code or guest mode functionality is included in this version.

## API Reference

### TokenService API

```typescript
// Create token
await TokenService.createToken({
  name: string,
  symbol: string,
  amount: number,
  value: number,
  currency: 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens',
  source?: string,
  metadata?: Record<string, any>
});

// Get tokens
await TokenService.getAll();
await TokenService.getByCurrency('infinity_tokens');
await TokenService.getStats();

// Update/Delete
await TokenService.updateToken(id, updates);
await TokenService.deleteToken(id);
await TokenService.clearAll();

// Events
TokenService.on('created', (event) => {});
TokenService.on('updated', (event) => {});
TokenService.on('deleted', (event) => {});
```

### AuthService API

```typescript
// Magic-link authentication
await AuthService.requestMagicLink('user@example.com');
await AuthService.verifyMagicLink(token);

// GitHub OAuth
await AuthService.loginWithGitHub();

// Session management
AuthService.getCurrentUser();
AuthService.isAuthenticated();
await AuthService.logout();
```

### ClientModel API

```typescript
import { createModel } from '@/shared/client-model';

const Model = createModel('collection', {
  name: { type: 'string', required: true },
  age: { type: 'number', required: false }
});

// CRUD operations
await Model.create({ name: 'John' });
await Model.find({ age: 30 });
await Model.findById(id);
await Model.findByIdAndUpdate(id, { name: 'Jane' });
await Model.findByIdAndDelete(id);
```

## Troubleshooting

### Common Issues

**Q: Tests are failing**
A: Run `npm install` to ensure all dependencies are installed, including dev dependencies.

**Q: IndexedDB not working**
A: The system automatically falls back to localStorage. Check browser console for details.

**Q: Tokens not syncing across tabs**
A: Ensure `TokenService.initAutoTracking()` is called in your app initialization.

**Q: Magic-link not working**
A: In dev-mode, the link is displayed directly. Check the browser console for the URL.

See [MIGRATION.md](./docs/MIGRATION.md) for more troubleshooting tips.

## License

Part of the Pewpi Infinity ecosystem.

---

**Built with ❤️ for seamless cross-repo authentication and token management**

