# Unified Authentication & Wallet System

## 🎯 Overview

The Unified Authentication & Wallet System provides a single sign-on experience and shared wallet across all Pewpi Infinity repositories. Users register once and can access all repositories with the same credentials, with their wallet balance synchronized in real-time.

## ✨ Features

### 🔐 Authentication
- **Single Sign-On (SSO)**: Login once, authenticated everywhere
- **Username/Password Auth**: Simple, secure authentication
- **SHA-256 Password Hashing**: Secure password storage
- **30-Day Sessions**: Persistent sessions with automatic expiration
- **Cross-Tab Sync**: Sessions sync across browser tabs
- **IP Fingerprinting**: Basic security fingerprinting

### 💰 Universal Wallet
- **4 Currency Types**:
  - 💎 **Infinity Tokens**: Main currency, earned across all repos
  - 📚 **Research Tokens**: Earned from research activities (smug_look)
  - 🎨 **Art Tokens**: Earned from art creation (banksy)
  - 🎵 **Music Tokens**: Earned from music activities (repo-dashboard-hub)
- **Welcome Bonus**: 100 Infinity Tokens on registration
- **Transaction History**: Complete audit trail with timestamps
- **Real-Time Sync**: Balance updates instantly across repos
- **Cross-Repo Transactions**: Transfer tokens between currencies

### 🧭 Cross-Repo Navigation
- **Unified Nav Bar**: Links to all 4 repositories
- **Active Repo Indicator**: Shows current repository
- **Wallet Display**: Live balance display in navbar
- **Responsive Design**: Works on all screen sizes

## 📦 Installation

### For This Repository (Already Installed)

The system is already integrated. See the implementation in:
- `src/lib/auth-unified.ts` - Core authentication
- `src/lib/wallet-unified.ts` - Wallet system
- `src/lib/auth-unified-context.tsx` - React context
- `src/components/UnifiedNav.tsx` - Navigation component
- `src/components/UnifiedLoginModal.tsx` - Login/Register UI

### For Other Repositories

1. **Copy Core Files** to your repository:
   ```bash
   # Copy these files from infinity-brain-searc:
   src/lib/auth-unified.ts
   src/lib/wallet-unified.ts
   src/lib/auth-unified-context.tsx
   src/components/UnifiedNav.tsx
   src/components/UnifiedLoginModal.tsx
   ```

2. **Install Dependencies** (if not already installed):
   ```bash
   npm install sonner  # For notifications
   ```

3. **Wrap Your App** with the provider:
   ```tsx
   import { UnifiedAuthProvider } from '@/lib/auth-unified-context';
   import { UnifiedNav } from '@/components/UnifiedNav';
   import { UnifiedLoginModal } from '@/components/UnifiedLoginModal';

   function App() {
     const [showLoginModal, setShowLoginModal] = useState(false);

     return (
       <UnifiedAuthProvider>
         <UnifiedNav onAuthClick={() => setShowLoginModal(true)} />
         {/* Your app content */}
         <UnifiedLoginModal
           open={showLoginModal}
           onClose={() => setShowLoginModal(false)}
           onSuccess={() => {}}
         />
       </UnifiedAuthProvider>
     );
   }
   ```

## 🔨 Usage

### Basic Authentication

```tsx
import { useUnifiedAuth } from '@/lib/auth-unified-context';

function MyComponent() {
  const { 
    isAuthenticated, 
    username, 
    signIn, 
    signOut 
  } = useUnifiedAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {username}!</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => signIn('user', 'pass')}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

### Earning Tokens

```tsx
import { useUnifiedAuth } from '@/lib/auth-unified-context';

function TokenMinter() {
  const { earnTokens, balances } = useUnifiedAuth();

  const handleMintToken = () => {
    // Award Infinity Tokens when user creates a token
    earnTokens(
      'infinity_tokens',
      10,
      'infinity-brain-searc',
      'Created new token'
    );
  };

  return (
    <div>
      <p>Balance: {balances.infinity_tokens} 💎</p>
      <button onClick={handleMintToken}>
        Mint Token (earn 10 💎)
      </button>
    </div>
  );
}
```

### Spending Tokens

```tsx
import { useUnifiedAuth } from '@/lib/auth-unified-context';

function Marketplace() {
  const { spendTokens, getBalance } = useUnifiedAuth();

  const handlePurchase = () => {
    const balance = getBalance('infinity_tokens');
    
    if (balance >= 50) {
      const success = spendTokens(
        'infinity_tokens',
        50,
        'marketplace',
        'Purchased premium item'
      );
      
      if (success) {
        alert('Purchase successful!');
      }
    } else {
      alert('Insufficient tokens!');
    }
  };

  return (
    <button onClick={handlePurchase}>
      Buy Item (50 💎)
    </button>
  );
}
```

### Checking Authentication Status

```tsx
import { isAuthenticated } from '@/lib/auth-unified';

function ProtectedAction() {
  const handleAction = () => {
    if (!isAuthenticated()) {
      alert('Please sign in to continue');
      return;
    }
    
    // Perform protected action
    performAction();
  };

  return (
    <button onClick={handleAction}>
      Protected Action
    </button>
  );
}
```

### Transaction History

```tsx
import { useUnifiedAuth } from '@/lib/auth-unified-context';

function TransactionHistory() {
  const { getTransactions } = useUnifiedAuth();
  const transactions = getTransactions(10); // Last 10 transactions

  return (
    <div>
      <h2>Recent Transactions</h2>
      {transactions.map((tx) => (
        <div key={tx.id}>
          <span>{tx.type === 'earn' ? '+' : '-'}{tx.amount}</span>
          <span>{tx.currency}</span>
          <span>{tx.description}</span>
          <span>{new Date(tx.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
```

## 💡 Integration Examples by Repository

### infinity-brain-searc (Search & AI)
```tsx
// Earn Infinity Tokens for various actions
earnTokens('infinity_tokens', 10, 'infinity-brain-searc', 'Completed search query');
earnTokens('infinity_tokens', 5, 'infinity-brain-searc', 'Used AI chat');
earnTokens('infinity_tokens', 20, 'infinity-brain-searc', 'Created token');
```

### repo-dashboard-hub (Dashboard & Music)
```tsx
// Earn Music Tokens for listening
earnTokens('music_tokens', 1, 'repo-dashboard-hub', `Listened to ${trackName}`);
earnTokens('infinity_tokens', 15, 'repo-dashboard-hub', 'Created playlist');
earnTokens('infinity_tokens', 10, 'repo-dashboard-hub', 'Repository health check');
```

### banksy (Art & Launcher)
```tsx
// Earn Art Tokens for creating art
earnTokens('art_tokens', 15, 'banksy', `Created ${theme} art`);
earnTokens('infinity_tokens', Math.floor(value / 1000), 'banksy', 'Built token');
```

### smug_look (Research & Terminal)
```tsx
// Earn Research Tokens for publishing
const rt = calculateResearchTokens(paper);
earnTokens('research_tokens', rt, 'smug_look', `Published: ${paper.title}`);
earnTokens('infinity_tokens', 5, 'smug_look', 'Used MRW Terminal');
```

## 📊 Data Structure

### localStorage Key: `pewpi_unified_auth`

```javascript
{
  "version": "1.0.0",
  "users": {
    "username": {
      "passwordHash": "sha256_hash_here",
      "createdAt": "2026-01-05T03:45:00.000Z",
      "lastLogin": "2026-01-05T04:30:00.000Z",
      "ipFingerprint": "1920x1080-America/New_York-en-US",
      "wallet": {
        "infinity_tokens": 100,
        "research_tokens": 0,
        "art_tokens": 0,
        "music_tokens": 0
      },
      "profile": {
        "displayName": "Username",
        "avatar": "🧠",
        "preferences": {}
      },
      "transactions": [
        {
          "id": "tx_1234567890_abc123",
          "type": "earn",
          "amount": 10,
          "currency": "infinity_tokens",
          "source": "infinity-brain-searc",
          "description": "Completed search query",
          "timestamp": "2026-01-05T03:45:00.000Z"
        }
      ],
      "achievements": ["registered"],
      "sessions": [
        {
          "token": "token_1234567890_abc123",
          "loginTime": "2026-01-05T03:45:00.000Z",
          "lastActive": "2026-01-05T04:30:00.000Z",
          "ipFingerprint": "1920x1080-America/New_York-en-US"
        }
      ]
    }
  },
  "currentSession": {
    "username": "username",
    "token": "token_1234567890_abc123",
    "loginTime": "2026-01-05T03:45:00.000Z",
    "activeRepo": "infinity-brain-searc"
  }
}
```

## 🔒 Security Features

1. **Password Hashing**: SHA-256 hashing of passwords
2. **Session Tokens**: Unique tokens for each session
3. **Session Expiration**: 30-day automatic expiration
4. **IP Fingerprinting**: Basic fingerprinting for security
5. **Client-Side Only**: No server-side dependencies (GitHub Pages compatible)

## 🌐 Cross-Domain Synchronization

The system uses the browser's `localStorage` API which is origin-scoped. For true cross-domain sync:

1. **Same Domain**: Automatic sync via storage events
2. **Different Domains**: Manual sync via URL parameters or shared iframe

### For GitHub Pages Subdomains:
Each repo (`username.github.io/repo-name/`) is a different origin, so:
- Users need to login in each repo initially
- Future enhancement: Use service worker or shared iframe for true SSO

## 🎨 Customization

### Customize Navigation Bar

Edit `src/components/UnifiedNav.tsx`:

```tsx
const repos = [
  {
    name: 'Your Repo',
    emoji: '🚀',
    url: 'https://your-url.github.io/your-repo/',
    key: 'your-repo'
  }
];
```

### Customize Welcome Bonus

Edit `src/lib/auth-unified.ts`:

```tsx
wallet: {
  infinity_tokens: 200, // Change welcome bonus
  research_tokens: 10,  // Give bonus research tokens
  art_tokens: 0,
  music_tokens: 0
}
```

### Add New Currency Type

1. Update type in `auth-unified.ts`:
```tsx
export type CurrencyType = 
  | 'infinity_tokens' 
  | 'research_tokens' 
  | 'art_tokens' 
  | 'music_tokens'
  | 'your_new_token'; // Add here
```

2. Add to wallet structure
3. Update UI components

## 🧪 Testing

```tsx
// Test registration
import { register, signIn, getCurrentUser } from '@/lib/auth-unified';

// Register new user
await register('testuser', 'password123', 'test@example.com');

// Sign in
await signIn('testuser', 'password123');

// Check user
const user = getCurrentUser();
console.log(user?.wallet); // Should show 100 infinity_tokens
```

## 🐛 Troubleshooting

### "User not authenticated" errors
- Check if session has expired (30 days)
- Verify localStorage is not disabled
- Check browser console for errors

### Wallet not syncing across tabs
- Ensure localStorage is working
- Check that storage event listeners are set up
- Verify no console errors

### Login modal not appearing
- Check that UnifiedLoginModal is rendered
- Verify showLoginModal state is working
- Check for z-index CSS conflicts

## 📝 API Reference

See inline documentation in:
- `src/lib/auth-unified.ts` - Core functions
- `src/lib/wallet-unified.ts` - Wallet functions
- `src/lib/auth-unified-context.tsx` - React hooks

## 🚀 Future Enhancements

- [ ] OAuth integration (GitHub, Google)
- [ ] Two-factor authentication
- [ ] Password reset functionality
- [ ] Email verification
- [ ] User profiles with avatars
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Token exchange rates
- [ ] Wallet export/import
- [ ] Server-side sync option

## 📄 License

Part of the Pewpi Infinity ecosystem.

---

**Built with ❤️ for seamless cross-repo authentication**
