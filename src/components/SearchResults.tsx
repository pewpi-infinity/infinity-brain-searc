import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link, Globe, Graph } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export interface SearchResult {
  id: string
  title: string
  snippet: string
  url: string
  source: string
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  onVisualize?: () => void
}

export function SearchResults({ results, query, onVisualize }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Globe size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try different keywords or check your spelling
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search Results</h2>
          <p className="text-muted-foreground">
            Found {results.length} results for "{query}"
          </p>
        </div>
        {onVisualize && (
          <Button
            onClick={onVisualize}
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Graph size={20} weight="duotone" className="mr-2" />
            Visualize Connections
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card
            key={result.id}
            className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] gradient-border"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards',
              opacity: 0,
            }}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors flex items-center gap-2">
                      {result.title}
                      <Link size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">{result.url}</p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  {result.source}
                </Badge>
              </div>
              <p className="text-foreground/90">{result.snippet}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)