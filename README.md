# Infinity Brain

A comprehensive AI-powered productivity hub for creating tokens, trading, building websites, and managing your digital economy.

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

---

**Built with ❤️ for seamless cross-repo token & wallet management**
