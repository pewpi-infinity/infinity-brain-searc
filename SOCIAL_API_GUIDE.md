# Social Media API Integration Guide

## Overview

Infinity Brain now includes real social media API integrations for Twitter/X, Facebook, and LinkedIn. This allows you to post directly to these platforms using official APIs rather than simulations.

## Features

- **Real API Integration**: Post directly to Twitter, Facebook, and LinkedIn
- **OAuth 2.0 Support**: Full OAuth flow for secure authentication
- **Connection Testing**: Verify your API credentials before posting
- **Multi-Platform Posting**: Post to all connected platforms simultaneously
- **Error Handling**: Detailed error messages for troubleshooting
- **Credential Management**: Securely store and manage API credentials

## Getting Started

### 1. Navigate to API Setup

In the Social tab, click the **"API Setup"** button to configure your social media accounts.

### 2. Twitter/X Setup

#### Getting Twitter API Credentials

1. Visit the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new Project and App
3. Navigate to your App Settings
4. Enable OAuth 2.0 with Read and Write permissions
5. Set the Callback URL to: `https://your-domain.com/oauth/callback`
6. Note down your:
   - **Client ID**
   - **Client Secret**
   - **Bearer Token** (from the Keys and Tokens tab)

#### Configuring Twitter in Infinity Brain

1. Click "Setup" on the Twitter card
2. Enter your Client ID and Client Secret
3. Choose one of two options:
   - **Option A**: Click "OAuth Flow" to authorize via Twitter (opens popup)
   - **Option B**: Paste your Bearer Token directly and click "Save Token"
4. Click "Test" to verify the connection

### 3. Facebook Setup

#### Getting Facebook API Credentials

1. Visit [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new App
3. Add "Facebook Login" product
4. Configure OAuth redirect URIs: `https://your-domain.com/oauth/callback`
5. Go to Settings > Basic to find:
   - **App ID**
   - **App Secret**
6. Generate a Page Access Token:
   - Go to Tools > Access Token Tool
   - Select your page
   - Generate a long-lived token
7. Get your Page ID from your Facebook Page settings

#### Configuring Facebook in Infinity Brain

1. Click "Setup" on the Facebook card
2. Enter your App ID and App Secret
3. Paste your Page Access Token
4. (Optional) Enter your Page ID
5. Choose one of two options:
   - **Option A**: Click "OAuth Flow" to authorize via Facebook
   - **Option B**: Click "Save Token" to save the token directly
6. Click "Test" to verify the connection

### 4. LinkedIn Setup

#### Getting LinkedIn API Credentials

1. Visit [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new App
3. Request API Access for "Share on LinkedIn" and "Sign In with LinkedIn"
4. In Auth settings, add redirect URL: `https://your-domain.com/oauth/callback`
5. Note down:
   - **Client ID**
   - **Client Secret**
6. Generate an Access Token through OAuth flow

#### Configuring LinkedIn in Infinity Brain

1. Click "Setup" on the LinkedIn card
2. Enter your Client ID and Client Secret
3. Choose one of two options:
   - **Option A**: Click "OAuth Flow" to authorize via LinkedIn
   - **Option B**: Paste your Access Token and click "Save Token"
4. Click "Test" to verify the connection

## Using the Social Poster

### Posting to Social Media

1. Navigate to the **"Post"** tab in the Social section
2. Click on platform cards to toggle which platforms you want to post to
   - Connected platforms show a checkmark and colored icon
3. Type your content in the text area
4. Use the toggle to include recent conversation context if needed
5. Click **"Post to X Platform(s)"** to publish

### Emoji Shortcuts

- 🤑 - Auto-post when included in text
- 🧲🪐 - Include recent conversation context
- 📤 - Quick send shortcut
- 🚀 - Boost post
- 📢 - Announce
- 💬 - Chat mode

### Post Results

After posting, you'll see:
- ✅ Success notifications for each platform with post URLs
- ❌ Error notifications with detailed error messages
- Post history showing which platforms received the post

## API Limits and Best Practices

### Twitter/X
- Rate limit: 50 tweets per 24 hours (free tier)
- Character limit: 280 characters
- Premium tiers available for higher limits

### Facebook
- Rate limits vary by app review status
- Posts must comply with Facebook's content policies
- Page access tokens expire - regenerate as needed

### LinkedIn
- Rate limit: 100 posts per day per member
- Character limit: 3000 characters for posts
- Posts must add value to professional community

## Troubleshooting

### "Not authenticated" errors
- Verify your access tokens haven't expired
- Re-run the OAuth flow to get fresh tokens
- Check that your app has the correct permissions

### "Connection failed" errors
- Ensure your API credentials are correct
- Verify your redirect URLs match exactly
- Check that your app is in production mode (not development)

### "Post failed" errors
- Check character limits for the platform
- Ensure content complies with platform policies
- Verify the access token has write permissions

### Testing Connections
- Use the "Test" button to verify each platform
- Green checkmark = connection successful
- Red warning = connection failed or not configured

## Security Notes

- API credentials are stored securely in your browser's localStorage
- Never share your API keys, secrets, or access tokens
- Regenerate tokens if you suspect they've been compromised
- Use environment variables for production deployments

## Advanced Features

### OAuth Flow
The OAuth flow opens a popup window to the platform's authorization page. After you authorize:
1. The platform redirects to your callback URL
2. You receive an authorization code
3. Exchange the code for an access token (manual step currently)
4. Enter the access token in the setup dialog

### Direct Token Entry
For faster setup, you can:
1. Generate tokens directly in the platform's developer console
2. Paste them into the "Access Token" field
3. Save without going through OAuth flow

### Connection Status
- 🟢 Green checkmark = Connected and verified
- ⚠️ Yellow warning = Configured but not verified
- ⚪ Gray = Not configured

## API Response Handling

The system provides detailed feedback for each post:

```typescript
{
  success: true,
  platform: 'twitter',
  postId: '1234567890',
  url: 'https://twitter.com/user/status/1234567890'
}
```

or on error:

```typescript
{
  success: false,
  platform: 'facebook',
  error: 'Invalid access token'
}
```

## Next Steps

1. Configure all three platforms for maximum reach
2. Test each connection individually
3. Try posting to one platform first
4. Enable multi-platform posting for wider distribution
5. Monitor post history for analytics

## Support

If you encounter issues:
1. Check the platform's developer documentation
2. Verify your app permissions and review status
3. Test connections using the "Test" button
4. Review error messages for specific guidance
5. Regenerate access tokens if needed

## Future Enhancements

Planned features:
- Automatic token refresh
- Media upload support (images, videos)
- Post scheduling with platform APIs
- Engagement metrics retrieval
- Instagram and TikTok integration
- Thread/carousel support
