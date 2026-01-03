# Infinity Brain - Deployment Guide

## HTML Export System

Infinity Brain now includes a powerful HTML export system that allows you to export any page or all pages as static HTML files ready for deployment to any hosting platform.

### Features

- **Single Page Export**: Export the current view as a standalone HTML file
- **Selective Export**: Choose specific pages to export from the available pages list
- **Batch Export**: Export all pages at once with an automatically generated index.html
- **Export Options**:
  - Include embedded styles (recommended)
  - Include scripts (for interactive elements)
  - Standalone mode (disables interactive elements for pure static deployment)
- **Export History**: Track all exports with timestamps and re-download any previous export

### How to Use

1. Navigate to the **Export** tab in the main navigation
2. Configure your export options:
   - Enter a name for your export
   - Check/uncheck options based on your needs
   - Most users should keep "Include embedded styles" and "Standalone" checked
3. Choose your export method:
   - **Export Current View**: Captures whatever is currently displayed
   - **Export Specific Page**: Select from available pages (Home, Modules, Tokens, etc.)
   - **Export All Pages + Index**: Generates HTML files for all pages plus an index.html

### Deployment Platforms

#### GitHub Pages

1. Create a new repository or use an existing one
2. Upload your exported HTML files to the repository
3. Go to repository Settings → Pages
4. Select your branch and root folder
5. Click Save - your site will be live at `https://username.github.io/repository-name`

**Example for your use case:**
```bash
# Clone your repository
git clone https://github.com/pewpi-infinity/infinity-brain-111.git
cd infinity-brain-111

# Add your exported files
cp ~/Downloads/*.html .

# Commit and push
git add .
git commit -m "Add exported pages"
git push origin main
```

#### Netlify Drop

1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your exported HTML files (including index.html)
3. Your site will be instantly deployed with a unique URL
4. Optionally, claim the site and add a custom domain

#### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the folder containing your exported files
3. Run `vercel` and follow the prompts
4. Your site will be deployed with a unique URL

#### Traditional Web Hosting (cPanel, FTP)

1. Connect to your web host via FTP or file manager
2. Navigate to your public_html or www directory
3. Upload all exported HTML files
4. Access your site at your domain name

### File Structure

When you export all pages, you'll get:

```
index.html                  (Main index page with links to all pages)
home-page.html             (Home page with search and AI)
user-dashboard.html        (Account management)
module-browser.html        (Ecosystem registry)
token-minter.html          (Token creation)
market-overview.html       (Market statistics)
token-exchange.html        (Trading marketplace)
search-results.html        (Web search interface)
ai-chat.html              (AI assistant)
```

### Export Options Explained

**Include embedded styles**: Captures all CSS styles and embeds them in the HTML file. Recommended for standalone deployment where you want the page to look exactly as it does in the app.

**Include scripts**: Includes JavaScript functionality. Note that React-based interactivity won't work in static exports, but this preserves any inline scripts.

**Standalone mode**: Disables all interactive elements (buttons, inputs, forms) making the export purely static. Perfect for GitHub Pages or static hosting where you just want to display content.

### Integration with Mongoose/MongoDB

The current export system creates static HTML snapshots. If you need your deployed pages to connect to a Mongoose/MongoDB backend:

1. Set up a MongoDB Atlas account (free tier available)
2. Create an API endpoint using Vercel Serverless Functions or Netlify Functions
3. Modify the exported HTML to include fetch calls to your API
4. Store user data, sessions, and token information in MongoDB

### World Currency Launch Considerations

For using this as the foundation of a world currency system:

1. **Persistent State**: All user logins, token balances, and transactions are stored using the Spark KV system
2. **Export for Redundancy**: Export pages regularly as backup static snapshots
3. **Deployment Strategy**: 
   - Keep the main app running on the Spark platform for full interactivity
   - Deploy static exports as informational mirrors on GitHub Pages
   - Use the exports for marketing, documentation, and public-facing content

### Best Practices

- Export regularly to maintain backups
- Use descriptive names for exports (include dates)
- Keep "Include embedded styles" enabled for visual consistency
- Test exported files locally before deploying (just open in a browser)
- For dynamic features (AI, token trading), direct users to the main Spark app
- Use the static exports for showcasing, documentation, and SEO

### Troubleshooting

**Styles look different**: Make sure "Include embedded styles" is checked

**Page is blank**: Check browser console for errors; some dynamic content may not export well

**Links don't work**: Internal navigation won't work in static exports; consider creating a proper menu in each exported file

**Can't see my data**: Static exports don't include dynamic data; they're snapshots of the current view

### Advanced: Custom Deployment Scripts

You can automate deployment using the export system's API:

```javascript
// Example: Auto-export and commit to Git
import { HTMLExporter } from '@/lib/htmlExporter'

async function deployToGitHub() {
  const pages = await HTMLExporter.exportMultiplePages([...])
  // Use GitHub API to commit files
  // See: https://docs.github.com/en/rest/repos/contents
}
```

---

**Questions?** Open an issue or contact the development team.
