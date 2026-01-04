export interface ExportOptions {
  title: string
  description: string
  includeStyles?: boolean
  includeScripts?: boolean
  standalone?: boolean
}

export interface PageExport {
  filename: string
  html: string
  timestamp: string
  metadata: {
    title: string
    description: string
    url: string
  }
}

export class HTMLExporter {
  private static captureStyles(): string {
    if (typeof document === 'undefined') return ''
    
    const styles: string[] = []
    
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i]
      try {
        if (sheet.cssRules) {
          const rules: string[] = []
          for (let j = 0; j < sheet.cssRules.length; j++) {
            rules.push(sheet.cssRules[j].cssText)
          }
          styles.push(rules.join('\n'))
        }
      } catch (e) {
        console.warn('Could not access stylesheet:', sheet.href)
      }
    }
    
    return styles.join('\n')
  }

  private static generateHTMLDocument(
    content: string,
    options: ExportOptions
  ): string {
    const styles = options.includeStyles ? this.captureStyles() : ''
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${options.description}" />
    <title>${options.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    ${options.includeStyles ? `<style>${styles}</style>` : ''}
</head>
<body>
    ${content}
    ${options.standalone ? `
    <script>
      // Remove interactive React elements for static export
      document.querySelectorAll('button, input, select, textarea').forEach(el => {
        el.setAttribute('disabled', 'true');
      });
    </script>
    ` : ''}
</body>
</html>`
  }

  static exportElement(
    element: HTMLElement,
    options: ExportOptions
  ): string {
    const clone = element.cloneNode(true) as HTMLElement
    
    clone.querySelectorAll('button, input, select, textarea').forEach(el => {
      el.setAttribute('data-interactive', 'true')
    })
    
    const content = clone.innerHTML
    return this.generateHTMLDocument(content, options)
  }

  static exportCurrentPage(options: ExportOptions): PageExport {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      throw new Error('Export requires browser environment')
    }
    
    const root = document.getElementById('root')
    if (!root) {
      throw new Error('Root element not found')
    }
    
    const html = this.exportElement(root, options)
    const filename = `${options.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`
    
    return {
      filename,
      html,
      timestamp: new Date().toISOString(),
      metadata: {
        title: options.title,
        description: options.description,
        url: window.location.href
      }
    }
  }

  static downloadHTML(pageExport: PageExport): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      console.error('Download requires browser environment')
      return
    }
    
    const blob = new Blob([pageExport.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = pageExport.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static async exportMultiplePages(
    pages: Array<{ elementId: string; options: ExportOptions }>
  ): Promise<PageExport[]> {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return []
    }
    
    const exports: PageExport[] = []
    
    for (const page of pages) {
      const element = document.getElementById(page.elementId)
      if (element) {
        const html = this.exportElement(element, page.options)
        exports.push({
          filename: `${page.options.title.toLowerCase().replace(/\s+/g, '-')}.html`,
          html,
          timestamp: new Date().toISOString(),
          metadata: {
            title: page.options.title,
            description: page.options.description,
            url: `${window.location.origin}/${page.elementId}`
          }
        })
      }
    }
    
    return exports
  }

  static downloadMultipleAsZip(exports: PageExport[]): void {
    console.log('ZIP export would contain:', exports.map(e => e.filename))
  }

  static generateIndexPage(exports: PageExport[]): string {
    const links = exports
      .map(exp => `<li><a href="${exp.filename}">${exp.metadata.title}</a> - ${exp.metadata.description}</li>`)
      .join('\n')
    
    return this.generateHTMLDocument(
      `
      <div style="max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: 'Inter', sans-serif;">
        <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 3rem; margin-bottom: 1rem;">
          Infinity Brain - Exported Pages
        </h1>
        <p style="color: #666; margin-bottom: 2rem;">
          Generated on ${new Date().toLocaleString()}
        </p>
        <ul style="list-style: none; padding: 0;">
          ${links}
        </ul>
      </div>
      `,
      {
        title: 'Infinity Brain - Index',
        description: 'Index of all exported pages',
        includeStyles: true,
        standalone: true
      }
    )
  }
}
