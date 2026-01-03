# Infinity Brain Deployment Guide

## Overview

Infinity Brain provides multiple deployment options to publish your tokenized business ecosystem sites to production-grade hosting platforms. This guide covers automated deployment to Netlify, Vercel, and GitHub Pages.

---

## Deployment Platforms

### 🌊 Netlify
**Best for:** Continuous deployment, automatic builds, and team collaboration

**Features:**
- Free tier with generous limits
- Instant rollbacks to previous deployments
- Custom domains with free HTTPS
- Automatic SSL certificates
- Form handling and serverless functions
- Split testing and branch previews

**Deployment Methods:**
1. **Quick Deploy (No API Token Required)**
   - Export your pages from Infinity Brain
   - Visit [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag and drop your HTML files
   - Site goes live instantly with a netlify.app subdomain

2. **API Deployment (Automated)**
   - Get API token from [Netlify User Settings](https://app.netlify.com/user/applications#personal-access-tokens)
   - Enter token in Infinity Brain Deployment Hub
   - Configure site name and settings
   - Deploy with one click

3. **GitHub Integration**
   - Connect your GitHub repository to Netlify
   - Automatic deployments on every push
   - Preview deployments for pull requests

---

### ⚡ Vercel
**Best for:** Edge network deployment, serverless functions, and zero configuration

**Features:**
- Global CDN with edge caching
- Serverless function support
- Analytics and performance insights
- Preview deployments for every commit
- Automatic HTTPS and custom domains
- Framework-specific optimizations

**Deployment Methods:**
1. **Quick Deploy (CLI Method)**
   - Install Vercel CLI: `npm i -g vercel`
   - Export your pages from Infinity Brain
   - Run `vercel --prod` in your project directory
   - Follow CLI prompts to deploy

2. **API Deployment (Automated)**
   - Get API token from [Vercel Account Settings](https://vercel.com/account/tokens)
   - Enter token in Infinity Brain Deployment Hub
   - Configure project name and framework
   - Deploy with one click

3. **GitHub Import**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Connect your GitHub repository
   - Automatic deployments on every push
   - Zero configuration for most frameworks

---

### 🐙 GitHub Pages
**Best for:** Simple static sites, documentation, and open-source projects

**Features:**
- Free hosting for public repositories
- Custom domain support
- HTTPS included
- Jekyll static site generator support
- Version control integration
- Perfect for project documentation

**Deployment Methods:**
1. **Manual Upload**
   - Export your pages from Infinity Brain
   - Clone your GitHub repository
   - Copy HTML files to repository
   - Commit and push to main/master branch
   - Enable GitHub Pages in repository settings

2. **Automated Script**
   - Use the GitHub Deployer in Infinity Brain
   - Generate deployment bash script
   - Download and run script
   - Automatic git operations and deployment

3. **GitHub Actions (CI/CD)**
   - Set up GitHub Actions workflow
   - Automatic deployment on push
   - Custom build steps and validation

---

## Getting Started

### Step 1: Export Your Site

1. Navigate to the **Export** tab in Infinity Brain
2. Configure export options:
   - ✅ Include embedded styles (recommended)
   - ⬜ Include scripts (for interactive features)
   - ✅ Make standalone (for static hosting)
3. Choose what to export:
   - **Current View**: Export the active page
   - **Specific Page**: Select from available pages
   - **All Pages + Index**: Export entire site with navigation

### Step 2: Choose Your Platform

Navigate to the **Deployment Hub** and select your preferred platform:

| Platform | Best For | Setup Time | Free Tier |
|----------|----------|------------|-----------|
| **Netlify** | Teams & CI/CD | 5 minutes | ✅ Generous |
| **Vercel** | Edge performance | 3 minutes | ✅ Excellent |
| **GitHub Pages** | Open source | 10 minutes | ✅ Free |

### Step 3: Deploy

#### Option A: Quick Deploy (No API Token)
1. Export your site files
2. Use platform's drag-and-drop interface:
   - Netlify: [app.netlify.com/drop](https://app.netlify.com/drop)
   - Vercel: Install CLI and run `vercel`
   - GitHub: Manual git push

#### Option B: API Deploy (Automated)
1. Get API token from platform:
   - [Netlify Tokens](https://app.netlify.com/user/applications#personal-access-tokens)
   - [Vercel Tokens](https://vercel.com/account/tokens)
   - GitHub: Use personal access token
2. Enter token in Deployment Hub
3. Configure site/project name
4. Click deploy button
5. Site goes live in seconds!

---

## Configuration Options

### Netlify Configuration

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

### Vercel Configuration

```json
{
  "version": 2,
  "name": "infinity-brain-site",
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### GitHub Pages Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## Custom Domains

### Netlify Custom Domain
1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Enter your domain (e.g., `mysite.com`)
4. Update DNS records at your domain registrar:
   ```
   A Record: @ → 75.2.60.5
   CNAME: www → your-site.netlify.app
   ```

### Vercel Custom Domain
1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain
4. Update DNS records:
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```

### GitHub Pages Custom Domain
1. Go to Repository Settings → Pages
2. Enter custom domain
3. Create CNAME file in repository root with your domain
4. Update DNS records:
   ```
   A Records:
   @ → 185.199.108.153
   @ → 185.199.109.153
   @ → 185.199.110.153
   @ → 185.199.111.153
   ```

---

## Troubleshooting

### Common Issues

**Problem:** Deployment fails with "API token invalid"
- **Solution:** Regenerate token from platform settings
- Ensure token has correct permissions (write access)

**Problem:** Site shows 404 error
- **Solution:** Check that index.html is in root directory
- Verify build output directory is correct
- For GitHub Pages, enable Pages in settings

**Problem:** Styles not loading
- **Solution:** Use relative paths in HTML
- Enable "Include embedded styles" in export options
- Check browser console for errors

**Problem:** Custom domain not working
- **Solution:** Wait 24-48 hours for DNS propagation
- Verify DNS records with `dig` or `nslookup`
- Check SSL certificate status

**Problem:** Deployment succeeds but site is blank
- **Solution:** Check browser console for JavaScript errors
- Ensure all assets use relative paths
- Verify HTML structure is valid

---

## Best Practices

### 1. Version Control
- Keep deployment history in Infinity Brain
- Tag releases in Git for easy rollback
- Use semantic versioning for major updates

### 2. Performance
- Enable "standalone" mode for static sites
- Minimize embedded scripts
- Use CDN for large assets
- Enable platform caching

### 3. Security
- Never commit API tokens to Git
- Use environment variables for secrets
- Enable HTTPS (automatic on all platforms)
- Set security headers in platform config

### 4. Monitoring
- Check deployment history regularly
- Monitor site uptime and performance
- Set up error alerting if available
- Review analytics data

### 5. Content Updates
- Use continuous deployment for frequent updates
- Test changes locally before deploying
- Keep backup of previous deployments
- Document major changes

---

## Advanced Features

### Environment Variables
All platforms support environment variables for dynamic configuration:

**Netlify:**
```bash
# Set via UI or CLI
netlify env:set API_KEY "your-key-here"
```

**Vercel:**
```bash
# Set via UI or CLI
vercel env add API_KEY
```

### Serverless Functions
Both Netlify and Vercel support serverless functions:

**Netlify Functions:**
```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Infinity Brain!" })
  }
}
```

**Vercel Functions:**
```javascript
// api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: "Hello from Infinity Brain!" })
}
```

### Redirects and Rewrites
Configure URL redirects and rewrites:

**Netlify:**
```
# _redirects file
/old-page /new-page 301
/api/* https://api.example.com/:splat 200
```

**Vercel:**
```json
{
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ]
}
```

---

## Cost Comparison

| Feature | Netlify Free | Vercel Hobby | GitHub Pages |
|---------|--------------|--------------|--------------|
| Bandwidth | 100GB/month | 100GB/month | 100GB/month |
| Build minutes | 300/month | 100 hours/month | 2,000 minutes/month |
| Sites | Unlimited | Unlimited | Unlimited |
| Team members | 1 | 1 | Unlimited |
| Custom domains | ✅ | ✅ | ✅ |
| HTTPS | ✅ | ✅ | ✅ |
| Functions | 125k/month | Unlimited | ❌ |

---

## Support and Resources

### Official Documentation
- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Docs](https://docs.github.com/pages)

### Community
- [Netlify Community](https://community.netlify.com)
- [Vercel Discussions](https://github.com/vercel/vercel/discussions)
- [GitHub Community](https://github.community)

### Infinity Brain Support
- Check deployment history in Export tab
- Review error messages in browser console
- Contact support via repository issues

---

## Conclusion

With Infinity Brain's integrated deployment hub, publishing your tokenized business ecosystem to world-class hosting platforms is just a few clicks away. Whether you choose Netlify's powerful CI/CD, Vercel's edge network, or GitHub Pages' simplicity, you'll have your site live with HTTPS and global CDN in minutes.

Start deploying today and bring your Infinity Brain vision to the world! 🚀
