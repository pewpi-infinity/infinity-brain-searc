import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MagnifyingGlass, Sparkle } from '@phosphor-icons/react'

interface SearchBarProps {
  onSearch: (query: string, mode: 'web' | 'ai') => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent, mode: 'web' | 'ai' = 'web') => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query, mode)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" 
            size={20} 
          />
          <Input
            id="main-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web or ask AI anything..."
            className="pl-12 h-14 text-lg bg-card border-2 focus:border-accent transition-all"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all hover:scale-105"
          disabled={isLoading}
        >
          <MagnifyingGlass size={20} weight="bold" />
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e as any, 'ai')}
          size="lg"
          className="h-14 px-8 bg-gradient-to-r from-accent to-secondary hover:opacity-90 transition-all hover:scale-105"
          disabled={isLoading}
        >
          <Sparkle size={20} weight="fill" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Press Enter or click 🔍 for web search • Click ✨ for AI assistance
      </p>
    </form>
  )
}