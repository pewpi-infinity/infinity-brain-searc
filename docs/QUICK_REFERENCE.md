# Quick Reference Guide

## For Developers: Using Pewpi Shared Token System

### Installation (30 seconds)

```bash
# Copy shared folder to your repo
cp -r src/shared /your/repo/src/

# Install dependency
npm install dexie
```

### Basic Usage (2 minutes)

```typescript
// 1. Initialize (in your main.tsx or App.tsx)
import { initializePewpiShared } from '@/shared';
await initializePewpiShared();

// 2. Add Login
import { Login, useAuth } from '@/shared';

function App() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Login />;
  return <YourApp />;
}

// 3. Add Wallet
import { Wallet } from '@/shared';

function WalletPage() {
  return <Wallet />;
}

// 4. Create Tokens
import { tokenService } from '@/shared';

await tokenService.createToken({
  name: 'My Token',
  symbol: 'MTK',
  amount: 1000,
  creator: 'user@example.com',
});
```

## Common Tasks

### Listen for token changes

```typescript
import { tokenService } from '@/shared';

tokenService.on('created', (event) => {
  console.log('New token:', event.token);
});
```

### Listen for login changes

```typescript
window.addEventListener('pewpi.login.changed', (event) => {
  const { user, isAuthenticated } = event.detail;
  console.log('Auth changed:', user, isAuthenticated);
});
```

### Get current user

```typescript
import { useAuth } from '@/shared';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  return <div>{user?.email}</div>;
}
```

### Check if user is logged in

```typescript
import { authService } from '@/shared';

const isLoggedIn = authService.isAuthenticated();
```

### Get all tokens

```typescript
import { tokenService } from '@/shared';

const tokens = await tokenService.getAll();
console.log(`You have ${tokens.length} tokens`);
```

### Create custom model

```typescript
import { createModel } from '@/shared';

const TaskModel = createModel('tasks', {
  title: { type: 'string', required: true },
  done: { type: 'boolean', default: false },
});

const task = await TaskModel.create({ title: 'My task' });
```

## API Cheatsheet

### TokenService

| Method | Description |
|--------|-------------|
| `createToken(data)` | Create new token |
| `getAll()` | Get all tokens |
| `getById(id)` | Get token by ID |
| `updateToken(id, updates)` | Update token |
| `deleteToken(id)` | Delete token |
| `clearAll()` | Delete all tokens |
| `on(event, callback)` | Subscribe to events |
| `exportTokens()` | Export as JSON |
| `importTokens(json)` | Import from JSON |

### AuthService

| Method | Description |
|--------|-------------|
| `requestMagicLink(email)` | Send magic link |
| `loginWithMagicLink(token)` | Login with token |
| `loginWithGitHubUser(user)` | Login with GitHub |
| `logout()` | Logout user |
| `getCurrentUser()` | Get current user |
| `isAuthenticated()` | Check auth status |

### ClientModel

| Method | Description |
|--------|-------------|
| `create(data)` | Create document |
| `find(query)` | Find documents |
| `findOne(query)` | Find one document |
| `findById(id)` | Find by ID |
| `updateOne(query, update)` | Update one |
| `updateMany(query, update)` | Update many |
| `deleteOne(query)` | Delete one |
| `deleteMany(query)` | Delete many |
| `countDocuments(query)` | Count documents |

## Events

| Event | Description |
|-------|-------------|
| `pewpi.token.created` | Token created (window event) |
| `pewpi.login.changed` | Login/logout (window event) |
| `created` | Token created (service event) |
| `updated` | Token updated (service event) |
| `deleted` | Token deleted (service event) |
| `all` | Any token event (service event) |

## Component Props

### Login

No props required. Just use `<Login />`.

### Wallet

No props required. Just use `<Wallet />`.

## TypeScript Types

```typescript
import type { 
  Token, 
  User, 
  TokenEvent,
  Document,
  ModelSchema 
} from '@/shared';
```

## Troubleshooting

**Token not persisting?**
→ Check browser devtools → Application → IndexedDB → PewpiTokenDB

**Login not working?**
→ Check console for magic link in dev mode

**Events not firing?**
→ Make sure you called `initializePewpiShared()`

**Build errors?**
→ Install dexie: `npm install dexie`

## Full Documentation

See [docs/INTEGRATION.md](./INTEGRATION.md) for complete documentation.

## Support

- Check inline code comments in `src/shared/`
- See examples in `src/shared/integration-listener.ts`
- Open GitHub issue

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-07
