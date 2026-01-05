# GitHub OAuth Authentication Setup

## Overview

Infinity Brain uses **dual authentication**:
- **Spark Environment**: Uses `window.spark.user()` for authentication
- **GitHub Pages**: Uses GitHub Device Flow for OAuth authentication

## For GitHub Pages Deployment

### Prerequisites

1. **GitHub OAuth App** - Required for authentication on GitHub Pages
2. **Environment Variables** - Set in GitHub repository secrets

### OAuth App Configuration

#### Creating the OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Infinity Brain`
   - **Homepage URL**: `https://pewpi-infinity.github.io/infinity-brain-searc/`
   - **Application description**: `AI-powered productivity hub for tokens, trading, and building`
   - **Authorization callback URL**: `https://pewpi-infinity.github.io/infinity-brain-searc/` (Device flow doesn't use callback)
   
4. Click **"Register application"**
5. Copy the **Client ID** (you'll need this for the environment variable)
6. **Note**: Device flow doesn't require Client Secret

#### Setting Environment Variables

The GitHub Client ID must be set as a repository secret:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secret:
   - Name: `VITE_GITHUB_CLIENT_ID`
   - Value: Your OAuth App Client ID

### How It Works

#### Device Flow Authentication

Instead of traditional OAuth redirect flow (which has CORS issues), we use GitHub's Device Flow:

1. **User clicks "Sign in with GitHub"**
2. **App initiates device flow** - Gets a user code and device code
3. **User sees code** - Displayed on screen with copy button
4. **User authorizes on GitHub** - Opens GitHub in new tab, enters code
5. **App polls for completion** - Checks if user has authorized
6. **Token received** - Stores access token in localStorage
7. **User authenticated** - App reloads with authenticated session

#### Authentication Components

**Files Involved:**
- `src/lib/githubAuth.ts` - Device flow implementation
- `src/lib/auth.tsx` - Dual auth provider (Spark + GitHub)
- `src/components/DeviceFlowAuth.tsx` - User code display and polling
- `src/components/LandingPage.tsx` - Sign in button
- `src/App.tsx` - Route handling

**Key Features:**
- ✅ No backend required
- ✅ No CORS issues
- ✅ Secure token storage in localStorage
- ✅ Automatic token refresh on page load
- ✅ Seamless user experience

### Data Storage

On GitHub Pages (non-Spark environment):
- **Access Token**: Stored in `localStorage` as `github_oauth_token`
- **User Profile**: Stored in `localStorage` as `github_user_profile_{userId}`
- **Device Flow State**: Temporarily in `sessionStorage`

## For Spark Environment

No additional setup needed! The app automatically detects Spark and uses `window.spark.user()` for authentication.

## Testing Authentication

### Test on Localhost

1. Set environment variable:
   ```bash
   # Create .env.local
   echo "VITE_GITHUB_CLIENT_ID=your_client_id_here" > .env.local
   ```

2. Run dev server:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:5173/infinity-brain-searc/`
4. You should see the landing page with "Sign in with GitHub" button
5. Click the button and follow device flow

### Test on GitHub Pages

1. Ensure `VITE_GITHUB_CLIENT_ID` secret is set in repository
2. Push to main branch (triggers deployment)
3. Visit `https://pewpi-infinity.github.io/infinity-brain-searc/`
4. Click "Sign in with GitHub"
5. Complete device flow authorization

## Security Considerations

### Token Storage
- Tokens stored in `localStorage` (persistent across sessions)
- Cleared on logout
- Validated on every page load

### Scope Limitations
- Only requests `user:email` and `read:user` scopes
- No write permissions
- Minimal access to user data

### CORS Handling
- Device flow avoids CORS completely
- No token exchange on client side
- GitHub handles all sensitive operations

## Troubleshooting

### "GitHub Client ID is not configured"
- Check that `VITE_GITHUB_CLIENT_ID` is set in repository secrets
- Rebuild and redeploy after adding secret

### "Device code expired"
- Device codes expire after 15 minutes
- Click "Try Again" to get a new code

### "Authentication failed"
- Clear browser cache and localStorage
- Try again with new device flow
- Check browser console for detailed errors

### "Failed to fetch user data"
- Token may be expired or invalid
- Logout and sign in again
- Check network connectivity

## Architecture Decisions

### Why Device Flow?

Traditional OAuth redirect flow has CORS limitations:
- ❌ Token exchange endpoint doesn't support CORS
- ❌ Would require backend proxy server
- ❌ Complex deployment requirements

Device Flow advantages:
- ✅ No CORS issues (uses GitHub's endpoints directly)
- ✅ Works without backend
- ✅ Perfect for static site deployment
- ✅ Secure and recommended by GitHub

### Why Dual Auth Provider?

Maintains compatibility with both environments:
- **Spark**: Full KV storage, Spark user system, admin features
- **GitHub Pages**: localStorage, GitHub OAuth, read-only for certain features

The app automatically detects the environment and uses appropriate auth method.

## Future Enhancements

Possible improvements:
- [ ] Add Personal Access Token option for advanced users
- [ ] Implement token refresh flow
- [ ] Add "Remember me" option for device flow
- [ ] Support for multiple GitHub accounts
- [ ] Enhanced profile sync between environments

## References

- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub Device Flow](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
- [OAuth 2.0 Device Flow](https://oauth.net/2/device-flow/)
