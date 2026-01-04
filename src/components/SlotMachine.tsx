import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Sparkle, Plus, ArrowsClockwise } from '@phosphor-icons/react'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { toast } from 'sonner'

interface GeneratedPage {
  id: string
  title: string
  description: string
  content: string
  sections: string[]
  timestamp: number
}

const PAGE_ICONS = ['🌐', '📱', '🎨', '🚀', '💡', '🎯', '⚡', '🔮']

export function SlotMachine() {
  const [savedPages, setSavedPages] = useLocalStorage<GeneratedPage[]>('neural-cart-pages', [])
  const [thoughtPrompt, setThoughtPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reels, setReels] = useState(['🌐', '📱', '🎨'])
  const [currentPage, setCurrentPage] = useState<GeneratedPage | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const getRandomIcon = () => PAGE_ICONS[Math.floor(Math.random() * PAGE_ICONS.length)]

  const generatePage = async () => {
    if (!thoughtPrompt.trim() || isGenerating) return

    setIsGenerating(true)
    setCurrentPage(null)

    const spinDuration = 1200
    const spinInterval = setInterval(() => {
      setReels([getRandomIcon(), getRandomIcon(), getRandomIcon()])
    }, 100)

    try {
      const prompt = `Based on this thought/idea: "${thoughtPrompt}"

Generate a complete web page concept with:
1. A catchy title for the page
2. A one-sentence description
3. 5 main section names that would be on this page
4. A brief overview paragraph of what the page does

Return as JSON with this exact structure:
{
  "title": "Page Title",
  "description": "One sentence description",
  "sections": ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"],
  "overview": "Brief paragraph about the page"
}`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)

      setTimeout(() => {
        clearInterval(spinInterval)
        const finalReels = [getRandomIcon(), getRandomIcon(), getRandomIcon()]
        setReels(finalReels)

        const newPage: GeneratedPage = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          content: data.overview,
          sections: data.sections,
          timestamp: Date.now()
        }

        setCurrentPage(newPage)
        setIsGenerating(false)
        toast.success(`Generated: ${newPage.title}`)
      }, spinDuration)
    } catch (error) {
      clearInterval(spinInterval)
      setIsGenerating(false)
      toast.error('Failed to generate page. Try again!')
      console.error('Generation error:', error)
    }
  }

  const growSection = async (sectionName: string) => {
    if (!currentPage) return

    setExpandedSections(prev => ({ ...prev, [sectionName]: true }))

    try {
      const prompt = `For a web page titled "${currentPage.title}", generate detailed content for the section "${sectionName}".

The page is about: ${currentPage.description}

Generate 2-3 paragraphs of engaging, useful content for this section. Make it practical and actionable.`

      const content = await window.spark.llm(prompt, 'gpt-4o-mini', false)

      setCurrentPage(prev => {
        if (!prev) return prev
        return {
          ...prev,
          content: prev.content + `\n\n## ${sectionName}\n\n${content}`
        }
      })

      toast.success(`Grew section: ${sectionName}`)
    } catch (error) {
      toast.error('Failed to grow section')
      console.error('Section growth error:', error)
    }
  }

  const saveToCart = () => {
    if (!currentPage) return

    setSavedPages(prev => {
      const pages = prev || []
      const exists = pages.some(p => p.id === currentPage.id)
      if (exists) {
        return pages.map(p => p.id === currentPage.id ? currentPage : p)
      }
      return [...pages, currentPage]
    })

    toast.success('Page saved to Neural Cart!')
  }

  const loadPage = (page: GeneratedPage) => {
    setCurrentPage(page)
    setThoughtPrompt(page.title)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 gradient-border">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain size={28} weight="duotone" className="text-accent" />
            <h3 className="font-semibold text-xl">Neural Page Generator</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">What's on your mind?</label>
              <Textarea
                placeholder="Describe the web page you're imagining... (e.g., 'A dashboard for tracking personal fitness goals' or 'An interactive learning platform for kids')"
                value={thoughtPrompt}
                onChange={(e) => setThoughtPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isGenerating}
              />
            </div>

            <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-xl">
              <div className="flex justify-center gap-4 mb-4">
                {reels.map((icon, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-lg transition-all ${
                      isGenerating ? 'slot-reel' : ''
                    }`}
                  >
                    {icon}
                  </div>
                ))}
              </div>

              <Button
                onClick={generatePage}
                disabled={isGenerating || !thoughtPrompt.trim()}
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg"
              >
                {isGenerating ? (
                  <>
                    <ArrowsClockwise size={20} className="animate-spin mr-2" />
                    Generating Page...
                  </>
                ) : (
                  <>
                    <Sparkle size={20} weight="fill" className="mr-2" />
                    Generate Page from Thought
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {currentPage && (
        <Card className="p-6 gradient-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {currentPage.title}
                </h3>
                <p className="text-muted-foreground mt-1">{currentPage.description}</p>
              </div>
              <Button onClick={saveToCart} className="bg-primary hover:bg-primary/90">
                Save to Cart
              </Button>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Page Overview</h4>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {currentPage.content}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Plus size={20} weight="bold" className="text-accent" />
                Click to Grow Sections
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {currentPage.sections.map((section, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-auto py-4 flex items-center justify-between hover:bg-accent/10 hover:border-accent transition-all"
                    onClick={() => growSection(section)}
                  >
                    <span className="font-medium">{section}</span>
                    <Plus size={18} weight="bold" className="text-accent" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {(savedPages || []).length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Brain size={20} weight="duotone" className="text-accent" />
            Neural Cart ({(savedPages || []).length} pages)
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {(savedPages || []).map((page) => (
              <Card
                key={page.id}
                className="p-4 cursor-pointer hover:bg-accent/5 transition-colors border-2 hover:border-accent"
                onClick={() => loadPage(page)}
              >
                <h5 className="font-semibold mb-1">{page.title}</h5>
                <p className="text-sm text-muted-foreground line-clamp-2">{page.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(page.timestamp).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}