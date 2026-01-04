# Infinity Brain - Deployment Guide

## 📦 Automated GitHub Pages Deployment

Infinity Brain now features **automated deployment to GitHub Pages**! Every push to the main branch automatically builds and deploys your site.

### Setup (One-Time)

1. **Enable GitHub Pages**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"
   - Save the changes

2. **That's it!** 
   - The workflow is already configured in `.github/workflows/deploy.yml`
   - Every push to `main` will automatically trigger a build and deployment
   - Your site will be live at: `https://pewpi-infinity.github.io/infinity-brain-searc/`

### Features

✨ **Automatic Deployment**: Push to main, and your site goes live  
🔄 **CI/CD Integration**: Built-in GitHub Actions workflow  
🌐 **Global CDN**: Served via GitHub's CDN  
🔐 **Free HTTPS**: Automatic SSL certificates  
⚡ **Fast Builds**: Optimized Vite build process  
📊 **Build Status**: View deployment status in GitHub Actions tab  

### Manual Deployment

You can also trigger a deployment manually:
1. Go to the "Actions" tab in your GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Deployment Process

When code is pushed to main:
1. **Checkout**: Code is checked out from repository
2. **Setup**: Node.js 20 is installed with npm caching
3. **Install**: Dependencies are installed via `npm ci`
4. **Build**: Vite builds the production bundle
5. **Upload**: Build artifacts are uploaded
6. **Deploy**: Site is deployed to GitHub Pages

### Configuration

The deployment is configured in:
- **Workflow**: `.github/workflows/deploy.yml`
- **Base Path**: `/infinity-brain-searc/` (set in `vite.config.ts`)
- **Build Output**: `dist/` directory

---

## 🚀 One-Click Netlify Deployment

Infinity Brain now features **true one-click automated deployment** to Netlify! After a simple one-time setup, you can deploy your entire site with a single button click.

### Quick Start (5 Minutes)

1. **Get Your Netlify API Token**
   - Sign up for a free account at [netlify.com](https://netlify.com)
   - Go to [User Settings → Applications](https://app.netlify.com/user/applications#personal-access-tokens)
   - Click "New Access Token"
   - Give it a name (e.g., "Infinity Brain")
   - Copy the token (save it somewhere safe!)

2. **Configure Infinity Brain**
   - Navigate to the **Deploy** tab
   - Select **Netlify**
   - Paste your API token
   - (Optional) Enter a custom site name
   - Click **"Save Configuration"**

3. **Deploy!**
   - Click the big **"One-Click Deploy 🚀"** button
   - Watch the progress bar
   - Your site will be live in ~20 seconds!
   - Click "Visit" to see your live site

### Features

✨ **True One-Click Deployment**: After initial setup, deploy anytime with one button
🔒 **Secure Storage**: API tokens saved securely in persistent storage
📊 **Progress Tracking**: Real-time feedback during deployment
📜 **Deployment History**: Track all your deployments with live links
🌐 **Global CDN**: Sites deployed to Netlify's worldwide edge network
🔐 **Free HTTPS**: Automatic SSL certificates for all sites
⚡ **Instant Updates**: Re-deploy updated content anytime

### Deployment Process

When you click "One-Click Deploy", here's what happens:

1. **Export** (0-20%): Current page exported as standalone HTML
2. **Prepare** (20-40%): Files prepared with all styles embedded
3. **Create Site** (40-60%): New Netlify site created via API
4. **Deploy** (60-80%): Files uploaded to Netlify
5. **Complete** (80-100%): Site goes live with HTTPS URL

### Managing Deployments

- **View History**: See all past deployments with timestamps
- **Visit Sites**: Click "Visit" to open any deployment
- **Delete History**: Remove individual deployments or clear all
- **Re-Deploy**: Deploy again with the same config anytime

### Manual Deployment Option

Don't want to use API tokens? No problem!

1. Click **"Download for Manual Deploy"**
2. Get the HTML file downloaded to your device
3. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
4. Drag and drop your file
5. Your site is live!

---

## 🌍 Other Deployment Platforms

### GitHub Pages

Deploy to your existing GitHub repositories:

**For your infinity-brain-111 repository:**
```bash
# Clone your repository
git clone https://github.com/pewpi-infinity/infinity-brain-111.git
cd infinity-brain-111

# Export from Infinity Brain (Download for Manual Deploy)
# Then add the files:
cp ~/Downloads/*.html .

# Commit and push
git add .
git commit -m "Deploy Infinity Brain site"
git push origin main

# Enable GitHub Pages in repo Settings → Pages
```

Your site will be live at: `https://pewpi-infinity.github.io/infinity-brain-111/`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Export your site using "Download for Manual Deploy"
3. Navigate to the folder with your HTML files
4. Run `vercel` and follow prompts
5. Site deployed!

### Traditional Hosting (cPanel, FTP)

1. Export your site
2. Connect via FTP to your web host
3. Upload files to `public_html` or `www`
4. Access at your domain

---

## HTML Export System

### Features

- **Single Page Export**: Export the current view
- **Batch Export**: Export all pages with auto-generated index
- **Export History**: Re-download any previous export
- **Full Style Embedding**: Pages look exactly as designed

### Export Options

**Include embedded styles**: ✅ Recommended - preserves all visual design

**Standalone mode**: ✅ Recommended - creates static pages without interactive elements

### Best for Export

Static exports work great for:
- Marketing pages
- Documentation
- Showcasing features
- Public-facing content
- SEO and discoverability

Keep the main Infinity Brain app for:
- Token minting and trading
- AI chat interactions
- Live search
- User accounts and sessions

---

## 💰 World Currency Deployment Strategy

For launching Infinity as a world currency platform:

### Architecture

1. **Primary Platform**: Run Infinity Brain on Spark for full functionality
   - Token minting and management
   - User authentication and sessions
   - Real-time trading and transactions
   - AI-powered features

2. **Public Mirror**: Deploy static exports to Netlify/GitHub Pages
   - Marketing and information pages
   - Documentation and guides
   - Public token information
   - SEO-optimized landing pages

3. **Data Layer**: All critical data persists in Spark KV storage
   - User accounts and sessions
   - Token balances and ownership
   - Transaction history
   - Market data

### Deployment Workflow

```
Development (Spark) → Export → Deploy to Netlify → Public Access
         ↓
    KV Storage (persistent data, sessions, tokens)
         ↓
    MongoDB/Backend API (optional, for advanced features)
```

### Security Considerations

- **API Tokens**: Stored only in your browser, never exposed
- **User Data**: Protected by Spark's secure KV system
- **Transactions**: Validated before execution
- **Sessions**: Persistent and authenticated

### Scaling Strategy

1. Start: Use Spark + Netlify static mirrors
2. Grow: Add MongoDB for advanced querying
3. Scale: Implement backend APIs for cross-platform access
4. Global: Deploy to multiple edge locations

---

## 🔧 Advanced Topics

### Custom Domains

After deploying to Netlify:
1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS records as instructed
4. HTTPS automatically configured

### Continuous Deployment

For automated deployments on every update:
1. Connect your GitHub repository to Netlify
2. Configure build settings
3. Every push automatically deploys

### API Integration

To connect deployed sites to backends:
```javascript
// In your deployed HTML
fetch('https://api.yourdomain.com/tokens')
  .then(res => res.json())
  .then(data => displayTokens(data))
```

### Multi-Site Strategy

Deploy different aspects to different platforms:
- Main app: Spark platform
- Marketing: Netlify
- Documentation: GitHub Pages  
- API: Vercel Serverless Functions

---

## ❓ Troubleshooting

**"Deployment failed"**: Check API token is valid and has proper permissions

**"Site not found"**: Wait a few minutes for DNS propagation

**"Styles look different"**: Ensure "Include embedded styles" is checked

**"Can't see my data"**: Static exports are snapshots; dynamic data lives in the main app

**"One-click not working"**: Re-save your configuration and try again

---

## 📚 Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages Guide](https://pages.github.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Infinity Brain Issues](https://github.com/pewpi-infinity/infinity-brain-111/issues)

---

**Ready to launch your world currency? Click Deploy and go live in seconds! 🚀**
