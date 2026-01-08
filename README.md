# Infinity Brain
# Infinity Brain - Production Edition

A comprehensive AI-powered productivity hub with **production-grade login, wallet, and cross-repository token synchronization**.

## 🌟 What's New: Production Login & Wallet System
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

## 📦 Pewpi-Shared Library

This repository now includes the **unified pewpi-shared library** - a standardized authentication, wallet, and token management system synthesized from best practices across the pewpi-infinity organization.

### What's in pewpi-shared?

Located in `src/pewpi-shared/`, this library provides:
- **Token Service**: Dexie-backed IndexedDB with localStorage fallback
- **Auth Service**: Magic-link and GitHub OAuth authentication
- **Wallet Helpers**: Token earning, spending, and balance tracking
- **Integration Listener**: Cross-repo event synchronization
- **UI Components**: Login modal and wallet display (opt-in)

### How to Enable

The library is **additive and non-destructive** - it works alongside existing code. To use it:

1. Import services in your components:
   ```typescript
   import { tokenService } from '@/pewpi-shared/token-service';
   import { authService } from '@/pewpi-shared/auth-service';
   ```

2. Services are automatically initialized in `src/main.tsx` (defensive, won't break builds)

3. See `src/pewpi-shared/docs/INTEGRATION.md` for complete documentation

### Feature Flag

To enable/disable pewpi-shared features, set environment variable:
```bash
VITE_ENABLE_PEWPI_SHARED=true
```

## Features

- **Token Creation & Management** - Create and manage tokens with real-time synchronization
- **Production Login System** - Passwordless magic-link authentication (no GitHub required)
- **Wallet UI** - View balance, token list, and live token feed
- **Trading & Marketplace** - Trade tokens and explore marketplace
- **Repository Management & Deployment** - Manage repos and deployments
- **AI Chat Assistant** - Powered by Spark SDK
- **Quantum Audio System** - Bismuth frequencies
- **Quantum Encryption Vault** - SHA-256 + Bismuth encryption
- **Gaming & Rewards** - Earn rewards through engagement
- **Cross-Repository Sync** - Shared token/wallet system across pewpi repos

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Open test UI
```

## 🔐 Authentication

This application supports **passwordless authentication** using magic links:

1. Enter your email address
2. Receive a magic link (dev mode: logged to console)
3. Click the link to sign in
4. Optional: Use GitHub OAuth as an alternative

**No GitHub account required for the default experience.**

In development mode, magic links are automatically verified for easy testing.

## 💰 Wallet System

The wallet system provides:

- **Token Management**: Create, view, and manage tokens
- **Live Feed**: Real-time updates when tokens are created/modified
- **IndexedDB Storage**: Persistent storage with localStorage fallback
- **Cross-Tab Sync**: Automatic synchronization across browser tabs
- **Event Integration**: Subscribe to token events for cross-repo integration

### Creating a Token

```typescript
import { tokenService } from '@/shared/wallet/token-service';

const token = await tokenService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  balance: 100,
  value: 1.0,
  metadata: {
    source: 'infinity-brain-searc',
    description: 'My first token'
  }
});
```

## 🔗 Integration with Other Repositories

This repository includes a shared token/wallet system that can be integrated into other pewpi repositories (banksy, v, repo-dashboard-hub, etc.).

See **[docs/INTEGRATION.md](docs/INTEGRATION.md)** for complete integration instructions.

### Quick Integration Example

```typescript
import { initializeAutoSync, subscribeToIntegrationEvents } from '@/shared/hooks/integration-hooks';

// Initialize auto-sync
initializeAutoSync();

// Subscribe to events
const unsubscribe = subscribeToIntegrationEvents({
  onTokenCreated: (token) => {
    console.log('Token created:', token);
  },
  onLoginChanged: ({ user, action }) => {
    console.log('Login changed:', action, user);
  }
});
```

## 📚 Documentation

- **[Integration Guide](docs/INTEGRATION.md)** - Cross-repo integration instructions
- **[Authentication Guide](AUTHENTICATION.md)** - Auth system details
- **[Unified Auth README](UNIFIED_AUTH_README.md)** - Alternative auth system

## 🧪 Testing

Unit tests are provided for core services:

- `TokenService` - Token management and persistence
- `ClientModel` - Mongoose-like model emulator
- Magic Link Auth - Authentication flows

Run tests with:

```bash
npm test
```

## 🔧 Tech Stack

- **React 19** + TypeScript
- **Vite** - Build system
- **Tailwind CSS** + shadcn/ui - Styling
- **Dexie** - IndexedDB wrapper
- **Spark Runtime SDK** - LLM & persistence
- **Vitest** - Testing framework

## 🔒 Security

- AES-GCM encryption for sensitive data
- SHA-256 password hashing
- ECDH key exchange stubs for P2P
- Secure session management
- No secrets in commits

## 🌐 Cross-Repository Features

### Shared Libraries

The following shared libraries are available for integration:

- `src/shared/wallet/token-service.ts` - Token management
- `src/shared/auth/magic-link-auth.ts` - Authentication
- `src/shared/models/client-model.ts` - Data modeling
- `src/shared/crypto/aes-gcm.ts` - Encryption helpers
- `src/shared/hooks/integration-hooks.ts` - Event integration
- `src/shared/p2p/peer-sync.ts` - P2P sync (stub)
- `src/shared/theme/pewpi-theme.css` - Shared theme

### Event System

The system emits the following events for cross-repo integration:

- `pewpi.token.created` - When a token is created
- `pewpi.token.updated` - When a token is updated
- `pewpi.token.deleted` - When a token is deleted
- `pewpi.tokens.synced` - When tokens are synced from another tab
- `pewpi.login.changed` - When login state changes

## 🚧 Optional Features

### P2P Sync (Configurable)

WebRTC DataChannel support is available as a stub. To enable:

```typescript
import { createP2PSync } from '@/shared/p2p/peer-sync';

const p2pSync = createP2PSync({
  signalingUrl: 'wss://your-signaling-server.com',
  iceServers: [/* your TURN/STUN servers */],
  autoConnect: true
});
```

**Note**: Full P2P implementation requires a signaling server and TURN servers.

## 📝 Migration & Rollback

See [docs/INTEGRATION.md](docs/INTEGRATION.md#migration-guide) for:

- Migration from existing auth systems
- Data migration procedures
- Rollback instructions
- Backup strategies

## 🤝 Contributing

This is part of the pewpi ecosystem. When making changes:

1. Run tests: `npm test`
2. Run linter: `npm run lint`
3. Build: `npm run build`
4. Update documentation as needed

## 📄 License

Part of the Pewpi Infinity ecosystem.
This repository now includes a complete, production-ready token/wallet system that works across multiple repositories:

### ✨ Key Features

- **🔐 Passwordless Authentication**: Email magic-link login (no SMTP required in dev mode)
- **🪪 GitHub OAuth**: Optional GitHub login for users with GitHub accounts
- **💰 Production Wallet**: Full-featured wallet with balance, token list, and live feed
- **🔄 Cross-Repository Sync**: Tokens automatically sync across banksy, v, infinity-brain-searc, repo-dashboard-hub
- **📡 Real-Time Events**: Live updates when tokens are created or modified
- **🗄️ IndexedDB + localStorage**: Persistent storage with automatic fallback
- **🔒 Optional Encryption**: AES-GCM encryption with ECDH key exchange
- **🌐 P2P Sync**: WebRTC DataChannel support for peer-to-peer synchronization

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### 📱 Login Flow

1. Enter your email address (no GitHub account required!)
2. Receive magic link (dev mode: check console)
3. Click link to authenticate
4. Access full wallet and token features

**Optional**: GitHub users can sign in with GitHub OAuth

## 🏗️ Core Features

### Authentication System

- **Magic-Link Authentication**: Passwordless email-based login
- **GitHub OAuth**: Optional social login
- **Session Management**: 30-day persistent sessions
- **Dev Mode**: Local testing without email server

### Wallet System

- **Token Balance**: Real-time balance tracking
- **Token List**: Browse all your tokens
- **Token Details**: View full token information
- **Live Feed**: Real-time updates as tokens are created
- **Token Creation**: Create new tokens instantly

### Token Service

- **IndexedDB Storage**: Fast, persistent token storage (with localStorage fallback)
- **CRUD Operations**: Full create, read, update, delete support
- **Event System**: Subscribe to token changes
- **Auto-Tracking**: Automatic synchronization across tabs
- **Import/Export**: Backup and restore tokens

### Integration System

- **Cross-Repository Sync**: Share tokens across multiple apps
- **Window Events**: `pewpi.token.created`, `pewpi.login.changed`
- **Integration Examples**: Ready-to-use code samples
- **Simple API**: Easy integration in minutes

## 📚 Documentation

- **[Integration Guide](docs/INTEGRATION.md)**: Complete integration documentation
- **[Authentication Guide](AUTHENTICATION.md)**: Auth system details
- **[API Reference](#api-reference)**: Service and component APIs

## 🎯 Architecture

```
src/shared/
├── services/
│   ├── token-service.ts      # Token management with IndexedDB
│   ├── auth-service.ts        # Authentication service
│   └── peer-sync.ts           # P2P synchronization
├── models/
│   └── client-model.ts        # Mongoose-style model emulator
├── utils/
│   └── encryption.ts          # AES-GCM and ECDH utilities
├── components/
│   ├── Login.tsx              # Login component
│   └── Wallet.tsx             # Wallet component
├── hooks/
│   └── useAuth.ts             # React authentication hook
└── index.ts                   # Main export
```

## 🔧 API Reference

### TokenService

```typescript
import { tokenService } from '@/shared';

// Create a token
const token = await tokenService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  amount: 1000,
  creator: 'user@example.com',
});

// Get all tokens
const tokens = await tokenService.getAll();

// Subscribe to events
const unsubscribe = tokenService.on('created', (event) => {
  console.log('New token:', event.token);
});
```

### AuthService

```typescript
import { authService, useAuth } from '@/shared';

// Request magic link
const { devLink } = await authService.requestMagicLink('user@example.com');

// React hook
function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <div>Welcome {user.email}</div>;
}
```

### ClientModel

```typescript
import { createModel } from '@/shared';

const UserModel = createModel('users', {
  email: { type: 'string', required: true },
  name: { type: 'string' },
});

// Create
const user = await UserModel.create({ email: 'test@example.com' });

// Find
const users = await UserModel.find({ email: 'test@example.com' });

// Update
await UserModel.updateOne({ _id: user._id }, { name: 'John' });
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

**Test Coverage**:
- ✅ TokenService: 18 tests
- ✅ ClientModel: 27 tests
- ✅ Total: 45 tests passing

## 🔒 Security

- **No passwords stored**: Passwordless authentication only
- **Secure sessions**: Token-based with expiration
- **Optional encryption**: AES-GCM for sensitive data
- **ECDH key exchange**: Secure P2P connections
- **localStorage fallback**: Works even if IndexedDB fails

## 🌐 Cross-Repository Integration

### Supported Repositories

- **banksy**: Art and NFT marketplace
- **v**: Video platform
- **infinity-brain-searc**: This repository
- **repo-dashboard-hub**: Central dashboard

### Integration Example

```typescript
// In any repository
import { tokenService } from '@/shared';

// Listen for tokens from other repos
window.addEventListener('pewpi.token.created', (event) => {
  console.log('Token from another repo:', event.detail);
});

// Create a token (visible in all repos)
await tokenService.createToken({
  name: 'Cross-Repo Token',
  symbol: 'CRT',
  amount: 500,
  creator: 'user@example.com',
});
```

## 📦 What's Included

### Original Features

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

### New Production Features

- ✨ Production login system
- ✨ Full wallet UI
- ✨ Token synchronization
- ✨ Cross-repository events
- ✨ P2P sync capabilities
- ✨ Comprehensive tests
- ✨ Integration documentation

## 🔄 Migration

See [Integration Guide](docs/INTEGRATION.md) for:
- Migration from existing systems
- Rollback procedures
- Backup/restore instructions

## 🛠️ Tech Stack

- React + TypeScript
- Tailwind CSS + shadcn/ui components
- Vite build system
- Dexie (IndexedDB wrapper)
- Vitest (testing)
- WebRTC (P2P sync)
- Spark Runtime SDK for LLM & persistence
- **Dexie (IndexedDB wrapper) for data persistence**
- **Vitest for testing**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with Spark runtime and the Pewpi ecosystem.

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-07  
**Maintained by**: pewpi-infinity

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

---

**Built with ❤️ for seamless cross-repo token & wallet management**
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

