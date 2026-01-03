# Real Social Media API Integrations

## ✨ What's New

Infinity Brain now features **real social media API integrations** for Twitter/X, Facebook, and LinkedIn! Post directly to your social media accounts using official platform APIs.

## 🚀 Key Features

### 1. **Twitter/X Integration**
- OAuth 2.0 authentication
- Direct posting via Twitter API v2
- Character count validation (280 chars)
- Real-time posting with post URLs
- Rate limit awareness

### 2. **Facebook Integration**
- Page posting capabilities
- Facebook Graph API v18.0
- Multiple page support
- Long-lived access tokens
- Media attachment support (coming soon)

### 3. **LinkedIn Integration**
- Professional network posting
- LinkedIn UGC Posts API
- Public and connections visibility options
- 3000 character limit
- Career-focused content optimization

## 📋 Setup Guide

### Quick Start

1. **Navigate to Social Tab** → Click "API Setup"
2. **Choose Your Platform** (Twitter, Facebook, or LinkedIn)
3. **Click "Setup"** on the platform card
4. **Enter API Credentials** (see detailed instructions below)
5. **Test Connection** to verify
6. **Start Posting!**

### Detailed Instructions

#### Twitter/X Setup

1. Create a Twitter Developer account at [developer.twitter.com](https://developer.twitter.com)
2. Create a new Project and App
3. Enable OAuth 2.0 with Read/Write permissions
4. Get your credentials:
   - Client ID (OAuth 2.0)
   - Client Secret (OAuth 2.0)
   - Bearer Token
5. Enter credentials in Infinity Brain
6. Test the connection

#### Facebook Setup

1. Create a Facebook Developer account at [developers.facebook.com](https://developers.facebook.com)
2. Create a new App (Business type)
3. Add "Facebook Login" product
4. Get your credentials:
   - App ID
   - App Secret
   - Page Access Token (from Access Token Tool)
   - Page ID (from your Facebook Page)
5. Enter credentials in Infinity Brain
6. Test the connection

#### LinkedIn Setup

1. Create a LinkedIn Developer account at [linkedin.com/developers](https://linkedin.com/developers)
2. Create a new App
3. Request access to "Share on LinkedIn" and "Sign In with LinkedIn"
4. Get your credentials:
   - Client ID
   - Client Secret
   - Access Token (via OAuth flow)
5. Enter credentials in Infinity Brain
6. Test the connection

## 💡 How to Use

### Basic Posting

1. Go to **Social** tab → **Post** sub-tab
2. Click platform cards to select where to post
3. Type your content
4. Click "Post to X Platform(s)"
5. See real-time results with post URLs!

### Multi-Platform Posting

- Toggle multiple platforms on
- Write your content once
- Post to all selected platforms simultaneously
- Get individual success/error feedback for each platform

### Emoji Shortcuts

Use these emojis in your text for quick actions:
- 🤑 → Auto-post to all connected platforms
- 🧲🪐 → Include recent conversation context
- 📤 → Quick send
- 🚀 → Boost post
- 📢 → Announce
- 💬 → Chat mode

## 🔒 Security

- All API credentials stored securely in browser localStorage
- Credentials are encrypted and never sent to external servers
- OAuth flow uses industry-standard security practices
- You control all access tokens
- Revoke access anytime from platform developer consoles

## ⚙️ Technical Details

### API Libraries Used

- **Twitter**: REST API v2 with OAuth 2.0
- **Facebook**: Graph API v18.0
- **LinkedIn**: REST API v2 with UGC Posts

### Architecture

```
src/
├── lib/
│   └── socialApis.ts          # Core API integration logic
├── components/
│   ├── SocialOAuthManager.tsx # Credential management UI
│   ├── SocialAPIGuide.tsx     # Step-by-step setup guide
│   └── SocialPoster.tsx       # Main posting interface
```

### Key Classes

#### `SocialMediaAPI`

Main class handling all social media interactions:

```typescript
class SocialMediaAPI {
  // Set credentials for a platform
  setCredentials(platform, creds)
  
  // Post to individual platforms
  postToTwitter(content, mediaUrls?)
  postToFacebook(content, pageId?, mediaUrl?)
  postToLinkedIn(content, visibility?)
  
  // Post to all connected platforms
  postToAll(content)
  
  // Verify connections
  verifyConnection(platform)
  
  // OAuth flows
  initiateOAuth(config)
  exchangeCodeForToken(platform, code, config)
}
```

## 📊 Response Format

Each post returns a detailed result:

```typescript
// Success
{
  success: true,
  platform: 'twitter',
  postId: '1234567890',
  url: 'https://twitter.com/user/status/1234567890'
}

// Error
{
  success: false,
  platform: 'facebook',
  error: 'Invalid access token. Please re-authenticate.'
}
```

## 🚨 Error Handling

The system provides detailed error messages:

- **Authentication errors**: "Not authenticated. Please connect your account."
- **Rate limit errors**: "Rate limit exceeded. Try again later."
- **Permission errors**: "Missing required permissions. Update app settings."
- **Content errors**: "Content violates platform policies."

## 📈 Rate Limits

### Twitter/X
- **Free**: 50 tweets/24 hours
- **Basic**: 2,400 tweets/24 hours ($100/mo)
- **Pro**: 10,000 tweets/24 hours ($5,000/mo)

### Facebook
- Varies by app review status
- Higher limits after app review approval
- Page-specific limits apply

### LinkedIn
- **Posts**: 100 posts/day per member
- **API calls**: 500 calls/day per app
- Professional content guidelines apply

## 🔧 Troubleshooting

### Connection Issues

**Problem**: "Connection failed" error  
**Solution**: 
- Verify credentials are correct
- Check redirect URLs match exactly
- Ensure app is in production mode

**Problem**: "Not authenticated" error  
**Solution**:
- Re-run OAuth flow
- Generate new access token
- Check token hasn't expired

**Problem**: Post fails silently  
**Solution**:
- Check character limits
- Verify content policies
- Test connection first

### Token Expiration

- **Twitter**: Bearer tokens don't expire (revoke manually if needed)
- **Facebook**: Page tokens expire (60 days default) - regenerate regularly
- **LinkedIn**: Access tokens expire (60 days) - use refresh flow

## 🎯 Best Practices

1. **Test First**: Always test connection before posting
2. **Character Limits**: Twitter 280, LinkedIn 3000
3. **Content Quality**: Professional, valuable content performs better
4. **Rate Limits**: Monitor usage to avoid hitting limits
5. **Token Security**: Never commit tokens to version control
6. **Regular Updates**: Regenerate Facebook tokens every 60 days

## 🌟 Advanced Features

### OAuth Flow vs Direct Token

**OAuth Flow** (Recommended):
- More secure
- User-controlled permissions
- Automatic token management
- Better for production

**Direct Token** (Quick Setup):
- Faster for testing
- Manual token management
- Good for development
- Easier debugging

### Connection Testing

Use the "Test" button to verify:
- ✅ Credentials are valid
- ✅ Permissions are correct
- ✅ API endpoints reachable
- ✅ Token hasn't expired

## 📚 Additional Resources

- [Twitter API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## 🛣️ Roadmap

Coming soon:
- [ ] Instagram integration
- [ ] TikTok integration
- [ ] Media upload (images/videos)
- [ ] Automatic token refresh
- [ ] Post scheduling via platform APIs
- [ ] Engagement metrics retrieval
- [ ] Thread/carousel support
- [ ] Hashtag suggestions
- [ ] Link shortening
- [ ] Post preview

## 💬 Support

Need help? Check:
1. The in-app **Setup Guide** (click "Show Setup Guide")
2. Platform-specific error messages
3. This README
4. Platform developer documentation

## 📝 License

This integration respects all platform Terms of Service and API usage policies.

---

**Happy Posting!** 🚀
