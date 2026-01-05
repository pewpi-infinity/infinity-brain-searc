# Authentication Guide

## Overview

Infinity Brain supports **three authentication modes** to provide maximum flexibility and accessibility:

1. **Spark Authentication** (Recommended) - Full GitHub integration with Spark
2. **GitHub OAuth** (Backup) - Direct GitHub OAuth when Spark is unavailable  
3. **Guest Mode** (Browse-only) - No authentication required

## Authentication Modes

### 1. Spark Authentication (Default & Recommended)

**How it works:**
- Uses GitHub Spark environment for authentication
- Provides full access to all features
- Automatically stores data in Spark's key-value store
- Seamless integration with GitHub identity

**Requirements:**
- Running in GitHub Spark environment
- GitHub account

**Features Available:**
- ✅ Full wallet with INF tokens
- ✅ Create and mint tokens
- ✅ Place bids on auctions
- ✅ Create auctions
- ✅ AI chat features
- ✅ Cross-repository token sync
- ✅ Persistent storage

**When to use:**
- When running in GitHub Spark workspace
- For full platform features
- For persistent token storage

### 2. GitHub OAuth (Backup)

**How it works:**
- Direct OAuth flow with GitHub
- Falls back when Spark is unavailable
- Requires backend proxy for secure token exchange

**Requirements:**
- GitHub account
- OAuth proxy workflow setup (see below)

**Current Status:**
- ⚠️ **Partially Implemented** - OAuth flow is ready but requires backend setup
- The callback page is created but token exchange needs server-side proxy
- See "Setting Up GitHub OAuth" section below for full setup

**Features Available:**
- ✅ Browse all content
- ⚠️ Limited write operations (requires Spark KV for storage)

**When to use:**
- When Spark is unavailable
- When deploying to GitHub Pages or other static hosts
- As a fallback authentication method

### 3. Guest Mode (No Authentication)

**How it works:**
- No login required
- Read-only access to public features
- No data persistence

**Features Available:**
- ✅ Browse the UI
- ✅ View tokens and marketplace
- ✅ View auctions
- ✅ See analytics dashboards
- ❌ Cannot create tokens
- ❌ Cannot place bids
- ❌ Cannot use AI features
- ❌ No wallet or token storage

**When to use:**
- Quick browsing
- Exploring features before signing up
- Testing the UI
- When authentication fails

## Feature Access Matrix

| Feature | Guest Mode | Spark Auth | GitHub OAuth |
|---------|-----------|-----------|--------------|
| Browse UI | ✅ | ✅ | ✅ |
| View Tokens | ✅ | ✅ | ✅ |
| View Auctions | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| AI Chat | ❌ | ✅ | ⚠️* |
| Mint Tokens | ❌ | ✅ | ⚠️* |
| Place Bids | ❌ | ✅ | ⚠️* |
| Create Auctions | ❌ | ✅ | ⚠️* |
| Wallet & Storage | ❌ | ✅ | ⚠️* |

*⚠️ = Requires Spark KV for storage, currently limited

## User Experience

### First-Time Visitor Flow

1. **App loads** → Immediately shows content in Guest Mode
2. **Browse freely** → Explore all public features
3. **Attempt protected action** → Prompted to sign in
4. **Choose auth method:**
   - Sign in with Spark (if available)
   - Sign in with GitHub OAuth (backup)
   - Continue as Guest

### Authenticated User Flow

1. **Sign in** → Choose Spark or GitHub OAuth
2. **Full access** → All features unlocked
3. **Auth indicator** → Badge shows current auth method
4. **Persistent session** → Stays logged in across visits

### Error Handling

When authentication fails:
- ❌ **Old behavior**: App crashed or showed error screen
- ✅ **New behavior**: Falls back to Guest Mode with clear messaging

When Spark is unavailable:
- ❌ **Old behavior**: Infinite loading or blank screen
- ✅ **New behavior**: Immediately starts in Guest Mode

## Setting Up GitHub OAuth (Optional)

### Prerequisites

- GitHub OAuth App registered
- Backend service for secure token exchange
- GitHub repository with Actions enabled

### Step 1: Register OAuth App

1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Infinity Brain
   - **Homepage URL**: Your deployment URL
   - **Authorization callback URL**: `https://your-domain.com/callback.html`
4. Save and note the **Client ID** and **Client Secret**

### Step 2: Configure Secrets

Add to your repository secrets (Settings → Secrets and variables → Actions):

```
GITHUB_OAUTH_CLIENT_ID=your_client_id_here
GITHUB_OAUTH_CLIENT_SECRET=your_client_secret_here
```

### Step 3: Create OAuth Proxy Workflow

Create `.github/workflows/oauth-proxy.yml`:

```yaml
name: GitHub OAuth Token Exchange Proxy
on:
  workflow_dispatch:
    inputs:
      code:
        description: 'OAuth authorization code'
        required: true
        type: string
      callback_url:
        description: 'Callback URL to send token'
        required: true
        type: string

jobs:
  exchange:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Exchange code for token
        run: |
          RESPONSE=$(curl -X POST https://github.com/login/oauth/access_token \
            -H "Accept: application/json" \
            -d "client_id=${{ secrets.GITHUB_OAUTH_CLIENT_ID }}" \
            -d "client_secret=${{ secrets.GITHUB_OAUTH_CLIENT_SECRET }}" \
            -d "code=${{ github.event.inputs.code }}")
          
          echo "Token exchange complete"
          # In production, send token back to callback_url securely
          # For now, this is a placeholder for proper implementation
```

### Step 4: Update Client ID (Optional)

If using your own OAuth app, update `src/lib/github-oauth.tsx`:

```typescript
const GITHUB_CLIENT_ID = 'your_client_id_here'
```

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────┐
│                   App Starts                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Check Spark?  │
         └───┬───────┬───┘
             │       │
         Yes │       │ No (3s timeout)
             │       │
             ▼       ▼
      ┌──────────┐  ┌──────────────┐
      │  Spark   │  │ Guest Mode   │
      │  Auth    │  │ (Immediate)  │
      └──────────┘  └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Show Login   │
                    │   Options    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         ┌────────┐  ┌─────────┐  ┌────────┐
         │ Spark  │  │ GitHub  │  │ Guest  │
         │  Auth  │  │  OAuth  │  │  Mode  │
         └────────┘  └─────────┘  └────────┘
```

### State Management

**Guest Mode:**
- `isAuthenticated = false`
- `isGuest = true`
- `authMethod = 'guest'`
- `connectionState = 'guest'`

**Spark Auth:**
- `isAuthenticated = true`
- `isGuest = false`
- `authMethod = 'spark'`
- `connectionState = 'connected'`

**GitHub OAuth:**
- `isAuthenticated = true`
- `isGuest = false`
- `authMethod = 'github'`
- `connectionState = 'connected'`

## Troubleshooting

### App won't load / stuck on loading screen

**Before (Old behavior):**
- App waited indefinitely for Spark
- Users saw loading screen forever

**After (New behavior):**
- App times out after 3 seconds
- Automatically starts in Guest Mode
- Users can browse immediately

### "Please log in" errors for basic browsing

**Solution:**
- This should not happen anymore
- Guest Mode allows all read operations
- Only write operations require authentication

### GitHub OAuth button doesn't work

**Cause:**
- OAuth proxy not set up
- Missing secrets

**Solution:**
1. Check if running in Spark environment (use Spark auth instead)
2. Follow "Setting Up GitHub OAuth" section above
3. Or continue in Guest Mode

### Features locked as guest

**Expected behavior:**
- Guest Mode is read-only
- Sign in with Spark or GitHub OAuth for full features
- Clear prompts explain what's needed

## Code Examples

### Check Authentication Before Action

```typescript
import { useAuth } from '@/lib/auth'

function MyComponent() {
  const { isAuthenticated, isGuest, continueAsGuest } = useAuth()
  
  const handleAction = () => {
    if (!isAuthenticated) {
      toast.error('Sign in required', {
        description: 'Please sign in to use this feature'
      })
      // Show login modal or redirect
      return
    }
    
    // Proceed with action
    performProtectedAction()
  }
  
  return (
    <button onClick={handleAction}>
      Protected Action
    </button>
  )
}
```

### Show Different UI Based on Auth

```typescript
function Header() {
  const { isAuthenticated, isGuest, authMethod } = useAuth()
  
  return (
    <div>
      {isGuest && (
        <Badge>Guest - Sign in for full features</Badge>
      )}
      
      {isAuthenticated && (
        <Badge>
          {authMethod === 'spark' ? '✓ Spark' : '✓ GitHub'}
        </Badge>
      )}
    </div>
  )
}
```

## Migration Guide

### For Users

**No action needed!** The app now:
- Works immediately without authentication
- Allows browsing all content as guest
- Prompts for login only when needed

### For Developers

**Breaking Changes:**
- `useAuth()` now includes `isGuest`, `authMethod`, `continueAsGuest()`, `loginWithGitHub()`
- Auth context no longer blocks app rendering
- Components should check `isAuthenticated` before write operations

**Upgrade Steps:**
1. Update `useAuth()` calls to use new fields if needed
2. Add auth checks to any custom write operations
3. Test Guest Mode experience
4. Set up OAuth proxy if deploying outside Spark

## Security Considerations

### Guest Mode
- ✅ No sensitive data exposed
- ✅ Read-only access prevents abuse
- ✅ No storage without authentication

### Spark Authentication
- ✅ Managed by GitHub Spark
- ✅ Secure token storage
- ✅ GitHub identity verified

### GitHub OAuth
- ⚠️ Requires secure token exchange
- ⚠️ Client secret must stay server-side
- ⚠️ Current implementation is incomplete

## Best Practices

### For Feature Development

1. **Default to guest-accessible**: Make features viewable by default
2. **Gate write operations**: Check `isAuthenticated` before modifications
3. **Clear messaging**: Tell users why they need to sign in
4. **Graceful degradation**: Show what's possible in guest mode

### For UI/UX

1. **Show auth status**: Display current mode clearly
2. **Easy sign-in**: Make login accessible but not blocking
3. **Explain benefits**: Tell users what they get by signing in
4. **No surprises**: Never crash or block due to auth issues

## Future Enhancements

- [ ] Complete GitHub OAuth token exchange
- [ ] Server-side session management
- [ ] Remember auth preference
- [ ] Social login options (Google, Microsoft)
- [ ] Two-factor authentication
- [ ] Guest session persistence (localStorage)
- [ ] Offline mode support

## Support

Having issues? Check:
1. Browser console for errors
2. Connection to GitHub
3. Popup blockers (for Spark auth)
4. This documentation

Still stuck? File an issue on GitHub with:
- Browser and version
- Auth mode attempting
- Error messages
- Steps to reproduce

---

**Last updated**: 2026-01-05  
**Version**: 1.0.0
