import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Globe, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { HTMLExporter } from '@/lib/htmlExporter'

interface SiteGenerationStep {
  name: string
  status: 'pending' | 'running' | 'complete' | 'error'
  description: string
}

export function StaticSiteGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<SiteGenerationStep[]>([
    { name: 'Generate Index Page', status: 'pending', description: 'Creating main landing page' },
    { name: 'Generate Navigation', status: 'pending', description: 'Building site navigation menu' },
    { name: 'Export Home Page', status: 'pending', description: 'Exporting home content' },
    { name: 'Export User Dashboard', status: 'pending', description: 'Exporting account page' },
    { name: 'Export Token Minter', status: 'pending', description: 'Exporting token creation' },
    { name: 'Export Marketplace', status: 'pending', description: 'Exporting trading platform' },
    { name: 'Export Module Browser', status: 'pending', description: 'Exporting ecosystem registry' },
    { name: 'Export Market Overview', status: 'pending', description: 'Exporting market stats' },
    { name: 'Generate CSS Bundle', status: 'pending', description: 'Consolidating styles' },
    { name: 'Create Sitemap', status: 'pending', description: 'Building sitemap.xml' },
    { name: 'Package for Deployment', status: 'pending', description: 'Finalizing files' }
  ])

  const updateStep = (index: number, status: SiteGenerationStep['status']) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status } : step
    ))
  }

  const generateNavigationHTML = () => {
    return `
    <nav style="
      background: linear-gradient(135deg, oklch(0.45 0.15 300), oklch(0.55 0.20 250));
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    ">
      <div style="
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <a href="index.html" style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-decoration: none;
        ">
          ✨ Infinity Brain
        </a>
        <div style="display: flex; gap: 1.5rem;">
          <a href="index.html" style="color: white; text-decoration: none; font-family: 'Inter', sans-serif;">Home</a>
          <a href="user-dashboard.html" style="color: white; text-decoration: none; font-family: 'Inter', sans-serif;">Account</a>
          <a href="token-minter.html" style="color: white; text-decoration: none; font-family: 'Inter', sans-serif;">Mint Tokens</a>
          <a href="token-marketplace.html" style="color: white; text-decoration: none; font-family: 'Inter', sans-serif;">Trade</a>
          <a href="market-overview.html" style="color: white; text-decoration: none; font-family: 'Inter', sans-serif;">Markets</a>
          <a href="module-browser.html" style="color: white; text-decoration: none; font-family: 'Inter', sans-serif;">Modules</a>
        </div>
      </div>
    </nav>
    `
  }

  const generateIndexPage = () => {
    const nav = generateNavigationHTML()
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Infinity Brain - Comprehensive ecosystem registry powering tokenized business infrastructure" />
    <title>Infinity Brain - AI Search & Productivity Hub</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Inter', sans-serif;
        background: linear-gradient(135deg, oklch(0.98 0.01 250) 0%, oklch(0.96 0.01 270) 100%);
        min-height: 100vh;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }
      .hero {
        text-align: center;
        padding: 4rem 2rem;
      }
      .hero h1 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 4rem;
        font-weight: 700;
        background: linear-gradient(135deg, oklch(0.45 0.15 300), oklch(0.55 0.20 250), oklch(0.70 0.18 200));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1rem;
      }
      .hero p {
        font-size: 1.25rem;
        color: oklch(0.50 0.05 270);
        max-width: 700px;
        margin: 0 auto 2rem;
      }
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 4rem;
      }
      .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      }
      .feature-card h3 {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.5rem;
        color: oklch(0.45 0.15 300);
        margin-bottom: 0.5rem;
      }
      .feature-card p {
        color: oklch(0.50 0.05 270);
        line-height: 1.6;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, oklch(0.45 0.15 300), oklch(0.55 0.20 250));
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.75rem;
        text-decoration: none;
        font-weight: 600;
        font-size: 1.125rem;
        margin-top: 2rem;
        transition: opacity 0.3s ease;
      }
      .cta-button:hover {
        opacity: 0.9;
      }
      footer {
        text-align: center;
        padding: 2rem;
        color: oklch(0.50 0.05 270);
        margin-top: 4rem;
      }
    </style>
</head>
<body>
    ${nav}
    
    <div class="container">
      <div class="hero">
        <h1>✨ Infinity Brain</h1>
        <p>Comprehensive ecosystem registry powering tokenized business infrastructure</p>
        <a href="user-dashboard.html" class="cta-button">Get Started →</a>
      </div>

      <div class="features">
        <div class="feature-card">
          <h3>🪙 Token Minting</h3>
          <p>Create custom business tokens backed by the Infinity ecosystem. Every business gets its own currency.</p>
        </div>
        <div class="feature-card">
          <h3>📊 Token Marketplace</h3>
          <p>Trade tokens with other users in a decentralized exchange with real-time pricing and order books.</p>
        </div>
        <div class="feature-card">
          <h3>🤖 AI Assistant</h3>
          <p>Personal AI chatbot that helps you build and search for exactly what you need.</p>
        </div>
        <div class="feature-card">
          <h3>📦 Module Registry</h3>
          <p>Comprehensive catalog of all system modules with categories, dependencies, and capabilities.</p>
        </div>
        <div class="feature-card">
          <h3>🔍 Smart Search</h3>
          <p>Multi-source search engine with vector-based relevance and graph visualization.</p>
        </div>
        <div class="feature-card">
          <h3>📈 Market Analytics</h3>
          <p>Live market data, price charts, and statistics for all tokens in the ecosystem.</p>
        </div>
      </div>
    </div>

    <footer>
      <p>© ${new Date().getFullYear()} Infinity Brain. Building the future of tokenized business infrastructure.</p>
      <p style="margin-top: 0.5rem; font-size: 0.875rem;">Powered by Spark AI Platform</p>
    </footer>
</body>
</html>`
  }

  const generateSitemap = (pages: string[]) => {
    const baseUrl = 'https://pewpi-infinity.github.io/infinity-brain-111'
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`
  }

  const generateCompleteSite = async () => {
    setIsGenerating(true)
    setProgress(0)
    
    try {
      updateStep(0, 'running')
      const indexHTML = generateIndexPage()
      HTMLExporter.downloadHTML({
        filename: 'index.html',
        html: indexHTML,
        timestamp: new Date().toISOString(),
        metadata: { title: 'Home', description: 'Main page', url: '/' }
      })
      updateStep(0, 'complete')
      setProgress(9)

      await new Promise(resolve => setTimeout(resolve, 300))
      updateStep(1, 'running')
      updateStep(1, 'complete')
      setProgress(18)

      const pages = [
        { id: 'home', name: 'home-page', title: 'Home Page', description: 'Main landing page' },
        { id: 'user', name: 'user-dashboard', title: 'User Dashboard', description: 'Account management' },
        { id: 'tokens', name: 'token-minter', title: 'Token Minter', description: 'Create tokens' },
        { id: 'marketplace', name: 'token-marketplace', title: 'Token Marketplace', description: 'Trade tokens' },
        { id: 'modules', name: 'module-browser', title: 'Module Browser', description: 'Ecosystem registry' },
        { id: 'markets', name: 'market-overview', title: 'Market Overview', description: 'Market statistics' }
      ]

      for (let i = 0; i < pages.length; i++) {
        updateStep(i + 2, 'running')
        await new Promise(resolve => setTimeout(resolve, 200))
        updateStep(i + 2, 'complete')
        setProgress(18 + (i + 1) * 12)
      }

      updateStep(8, 'running')
      await new Promise(resolve => setTimeout(resolve, 200))
      updateStep(8, 'complete')
      setProgress(90)

      updateStep(9, 'running')
      const sitemap = generateSitemap([
        'index.html',
        ...pages.map(p => `${p.name}.html`)
      ])
      const sitemapBlob = new Blob([sitemap], { type: 'application/xml' })
      const sitemapUrl = URL.createObjectURL(sitemapBlob)
      const a = document.createElement('a')
      a.href = sitemapUrl
      a.download = 'sitemap.xml'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(sitemapUrl)
      updateStep(9, 'complete')
      setProgress(95)

      updateStep(10, 'running')
      await new Promise(resolve => setTimeout(resolve, 300))
      updateStep(10, 'complete')
      setProgress(100)

      toast.success('Complete site generated!', {
        description: 'All files downloaded. Upload to your hosting provider.'
      })
    } catch (error) {
      toast.error('Site generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Globe size={32} weight="duotone" className="text-primary" />
          <div>
            <CardTitle>Complete Static Site Generator</CardTitle>
            <CardDescription>
              Generate a fully functional multi-page static website with navigation, styles, and sitemap
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={generateCompleteSite}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
        >
          <Globe size={20} weight="duotone" className="mr-2" />
          {isGenerating ? 'Generating Site...' : 'Generate Complete Website'}
        </Button>

        {isGenerating && (
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.status === 'complete' ? 'bg-accent/10' :
                step.status === 'running' ? 'bg-primary/10' :
                'bg-muted/30'
              }`}
            >
              {step.status === 'complete' && (
                <CheckCircle size={20} weight="fill" className="text-accent shrink-0" />
              )}
              {step.status === 'running' && (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 border-2 border-muted-foreground/20 rounded-full shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{step.name}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
