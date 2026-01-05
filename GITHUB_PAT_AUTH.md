# GitHub PAT / API Key Authentication System

## Overview

This implementation adds a simplified API key / GitHub Personal Access Token (PAT) authentication system to the Infinity Brain repository, compatible with the `infinity-brain-111` repository's authentication approach.

## Features

### ✅ Dual Authentication Methods
- **Username & Password**: Traditional unified authentication system (existing)
- **API Key / PAT**: New quick login method using API keys or GitHub PATs

### ✅ Simple Auth Library (`src/lib/simple-auth.ts`)
- `login(apiKey: string)` - Validates and creates session
- `logout()` - Clears session data
- `isLoggedIn()` - Checks session validity with 24-hour timeout
- `getUserData()` - Returns current user data
- `validateApiKey(apiKey: string)` - Basic format validation
- `createUserData(apiKey: string)` - Generates user object from API key
- Session timeout: 24 hours

### ✅ API Key Validation
- Minimum 8 characters
- Alphanumeric characters, dashes, underscores, and dots allowed
- Pattern: `/^[a-zA-Z0-9_\-\.]+$/`

### ✅ localStorage Keys (infinity-brain-111 compatible)
- `infinity_brain_api_key` - The API key/PAT
- `infinity_brain_session_id` - Generated session ID
- `infinity_brain_user_data` - User data object
- `infinity_brain_session_timestamp` - Session timestamp

### ✅ User Data Structure
```typescript
interface SimpleUserData {
  userId: string;           // Hashed from API key (16 chars)
  username: string;         // Generated or from GitHub API
  tokenBalance: number;     // Starting with 1000 tokens
  tokens: Token[];          // Array of user tokens
  createdAt: string;        // ISO timestamp
  lastLoginAt: string;      // ISO timestamp
  apiKeyHash: string;       // Full hash of API key
}
```

### ✅ Updated UnifiedLoginModal
- Toggle between "Username & Password" and "API Key / PAT" methods
- Clear instructions for API key login
- Beautiful UI with gradient backgrounds and animations
- Success/error toast notifications
- Maintains existing unified auth features

### ✅ Integration with Unified Auth Context
- Both authentication methods work seamlessly
- `authMethod` property indicates which method was used ('unified' or 'simple')
- Token balance management works for both methods
- Session checking supports both systems
- Logout clears both authentication systems

## Usage

### For Users

1. Click the login button to open the Unified Login Modal
2. Toggle to "API Key / PAT" tab
3. Enter any API key (minimum 8 characters) or GitHub Personal Access Token
4. Click "Sign In with API Key"
5. Your session will last 24 hours
6. You start with 1,000 tokens

### For Developers

```typescript
import { login, logout, isLoggedIn, getUserData } from '@/lib/simple-auth';

// Login with API key
const result = await login('my_api_key_123');
if (result.success) {
  console.log('Logged in!');
} else {
  console.error(result.error);
}

// Check if logged in
if (isLoggedIn()) {
  const userData = getUserData();
  console.log(`Welcome ${userData.username}`);
}

// Logout
logout();
```

### Using with Unified Auth Context

```typescript
import { useUnifiedAuth } from '@/lib/auth-unified-context';

function MyComponent() {
  const { isAuthenticated, username, authMethod, balances } = useUnifiedAuth();
  
  return (
    <div>
      {isAuthenticated && (
        <div>
          <p>Username: {username}</p>
          <p>Auth Method: {authMethod}</p>
          <p>Tokens: {balances.infinity_tokens}</p>
        </div>
      )}
    </div>
  );
}
```

## Security Considerations

1. **API keys are stored in localStorage** - This is by design for client-side compatibility
2. **24-hour session timeout** - Sessions automatically expire after 24 hours
3. **Basic validation only** - The system validates format, not authenticity
4. **No GitHub API calls** - This is a simplified system; real GitHub PAT validation would require API calls
5. **Hash-based user IDs** - User IDs are generated from API key hashes for consistency

## Cross-Repository Compatibility

The localStorage keys match the `infinity-brain-111` format, enabling:
- Shared sessions across repositories
- Consistent user experience
- Token balance synchronization (when implemented)

## Future Enhancements

1. **GitHub API Integration**: Validate real GitHub PATs and fetch user data
2. **Rate Limiting**: Add rate limiting for login attempts
3. **Session Refresh**: Auto-refresh sessions before expiry
4. **Multi-factor Authentication**: Add optional 2FA support
5. **Token Management**: Enhanced token creation and management for API key users

## Testing

Test files were created to validate the implementation:
- Basic auth library test page (test-auth.html)
- Modal integration test page (test-modal.html)
- React component test (test-modal.tsx)

All tests passed successfully, demonstrating:
- ✅ API key validation
- ✅ Session creation and management
- ✅ localStorage persistence
- ✅ User data generation
- ✅ Modal UI and UX
- ✅ Integration with existing systems

## Screenshots

### Simple Auth Library Test
![Simple Auth Test](https://github.com/user-attachments/assets/580cd2c4-2527-4fbd-a7d8-1a886af1ad27)

### Unified Login Modal - Username & Password
![Modal Unified Auth](https://github.com/user-attachments/assets/4970db58-f1ac-45e3-8003-a49851f0e44f)

### Unified Login Modal - API Key / PAT
![Modal API Key Auth](https://github.com/user-attachments/assets/07db1f7e-e7c6-489d-b072-558e25c6d2ce)

### Successful Login
![Login Success](https://github.com/user-attachments/assets/8d3cc39a-4795-417c-8b70-7ba6ad4b4382)

## Files Changed

- ✅ `src/lib/simple-auth.ts` - New authentication library
- ✅ `src/components/UnifiedLoginModal.tsx` - Updated with dual auth methods
- ✅ `src/lib/auth-unified-context.tsx` - Integrated both auth systems

## Success Criteria Met

- ✅ User can sign in with any API key (min 8 characters)
- ✅ Session persists in localStorage
- ✅ Session expires after 24 hours
- ✅ User data includes token balance and history structure
- ✅ Existing features (wallet, tokens) continue to work
- ✅ Clear UI for entering API key/PAT
- ✅ Proper TypeScript types throughout
- ✅ Compatible with existing auth-unified system
- ✅ localStorage keys match infinity-brain-111 format
