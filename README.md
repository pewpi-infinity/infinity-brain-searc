# Infinity Brain - Production Edition

A comprehensive AI-powered productivity hub with **production-grade login, wallet, and cross-repository token synchronization**.

## 🌟 What's New: Production Login & Wallet System

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

