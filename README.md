# Infinity Brain - Tokenized Business Ecosystem Platform

A comprehensive platform for creating, managing, and trading business tokens with integrated AI capabilities, multi-source search, and **automated deployment to world-class hosting platforms**.

## 🚀 **New: Automated Deployment**

Deploy your Infinity Brain sites to production with one click!

### Supported Platforms
- **🌊 Netlify** - Continuous deployment with instant rollbacks
- **⚡ Vercel** - Edge network deployment with zero configuration
- **🐙 GitHub Pages** - Simple static hosting with Git integration

### Deployment Features
✅ **Quick Deploy** - No API tokens needed, drag-and-drop deployment  
✅ **API Deploy** - One-click automated deployment from the app  
✅ **Deployment History** - Track all deployments with live URLs  
✅ **Platform Comparison** - Choose the best platform for your needs  
✅ **Deployment Stats** - Monitor deployment distribution and success rates  
✅ **Interactive Guide** - Built-in deployment guide with pro tips  

### How to Deploy
1. Navigate to the **Export** tab in Infinity Brain
2. Choose **Deployment Hub** for platform comparison
3. Select your platform (Netlify, Vercel, or GitHub)
4. Use **Quick Deploy** (no token) or **API Deploy** (automated)
5. Your site goes live in seconds with HTTPS and global CDN!

📖 **[Full Deployment Guide](./DEPLOYMENT-GUIDE.md)**

---

## ✨ Core Features

### 🪙 Token Economy
- Mint custom business tokens backed by Infinity
- Trade tokens in decentralized marketplace
- Track transactions and balances
- Interactive price charts and market data

### 🤖 AI & Search
- Conversational AI assistant
- Multi-source web search
- D3 graph visualization of search results
- Neural page generation from thoughts

### 📊 Module Registry
- Comprehensive ecosystem catalog
- Dependency tracking
- Capability search and filtering

### 👤 User Management
- GitHub authentication
- Persistent sessions
- Transaction history
- Token balances and transfers

### 🎰 Interactive Features
- Working slot machine game
- Neural cart for page generation
- Static site generator
- **One-click deployment to hosting platforms**

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Icons**: Phosphor Icons
- **Charts**: D3.js + Recharts
- **Animations**: Framer Motion
- **State**: React hooks + Spark KV storage
- **AI**: Spark LLM API (GPT-4o)
- **Deployment**: Netlify, Vercel, GitHub Pages APIs

---

## 📦 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (40+ pre-installed)
│   ├── AIChat.tsx       # Conversational AI interface
│   ├── TokenMinter.tsx  # Business token creation
│   ├── TokenMarketplace.tsx  # Trading platform
│   ├── MarketOverview.tsx    # Market statistics
│   ├── UserDashboard.tsx     # User account management
│   ├── SearchBar.tsx    # Multi-mode search
│   ├── SearchResults.tsx     # Search result display
│   ├── SearchGraph.tsx  # D3 visualization
│   ├── ModuleBrowser.tsx     # Registry browser
│   ├── SlotMachine.tsx  # Interactive game
│   ├── PageHub.tsx      # Navigation hub
│   ├── PageExporter.tsx # HTML export
│   ├── DeploymentHub.tsx     # ⭐ Platform deployment hub
│   ├── NetlifyDeployer.tsx   # ⭐ Netlify integration
│   ├── VercelDeployer.tsx    # ⭐ Vercel integration
│   ├── GitHubDeployer.tsx    # ⭐ GitHub Pages helper
│   ├── DeploymentGuide.tsx   # ⭐ Interactive guide
│   └── DeploymentStats.tsx   # ⭐ Deployment analytics
├── lib/
│   ├── auth.tsx         # Authentication context
│   ├── registry.ts      # Module definitions
│   └── htmlExporter.ts  # Export utilities
├── hooks/
│   └── use-mobile.ts    # Mobile detection
├── App.tsx              # Main application
├── index.css            # Custom styles & theme
└── main.tsx             # Application entry
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Deep Purple `oklch(0.45 0.15 300)`
- **Secondary**: Electric Blue `oklch(0.55 0.20 250)`
- **Accent**: Vibrant Cyan `oklch(0.70 0.18 200)`
- **Background**: Soft gradient with mesh pattern

### Typography
- **Headlines**: Space Grotesk (Bold, 48px)
- **Body**: Inter (Regular, 16px)
- **Code**: JetBrains Mono (14px)

### Components
- Gradient borders and mesh backgrounds
- Spring physics animations
- Comprehensive shadcn/ui integration
- Phosphor icon system

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Export & Deploy
1. Open Infinity Brain in your browser
2. Navigate to **Export** tab
3. Configure export options
4. Choose deployment platform
5. Deploy with one click!

### Manual Deployment
```bash
# Export pages
# Navigate to Export tab and download HTML files

# Deploy to Netlify
# Drag files to app.netlify.com/drop

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Deploy to GitHub Pages
# Upload to repository and enable Pages in settings
```

---

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT-GUIDE.md)** - Complete deployment documentation
- **[PRD](./PRD.md)** - Product requirements and design system
- **[Security](./SECURITY.md)** - Security policies and best practices

---

## 🌟 Key Highlights

### Automated Deployment ⭐
- **Three deployment platforms** integrated
- **Two deployment methods** per platform (Quick & API)
- **Real-time deployment history** with live URLs
- **Platform comparison** to choose the best fit
- **Deployment statistics** tracking success rates
- **Interactive guide** with pro tips

### Token Economy
- Mint unlimited business tokens
- Decentralized trading marketplace
- Interactive price charts
- Transaction history and audit trails

### AI Integration
- GPT-4o powered chat assistant
- Neural page generation
- Intelligent search with graph visualization

### User Experience
- Beautiful gradient-rich design
- Smooth animations and transitions
- Mobile-responsive interface
- Persistent state across sessions

---

## 🤝 Contributing

This is a personal project for the Infinity Brain tokenized ecosystem. For issues or suggestions, please open an issue in the repository.

---

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

## 🔗 Deployment Links

After deploying via the Deployment Hub, your sites will be available at:
- **Netlify**: `https://your-site.netlify.app`
- **Vercel**: `https://your-project.vercel.app`
- **GitHub Pages**: `https://username.github.io/repo`

**Start deploying today and bring your Infinity Brain vision to the world!** 🚀
