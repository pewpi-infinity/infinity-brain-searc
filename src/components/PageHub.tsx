import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowSquareOut } from '@phosphor-icons/react'

interface Page {
  title: string
  description: string
  url: string
  status: 'active' | 'beta' | 'new'
  color: string
}

const PAGES: Page[] = [
  {
    title: 'Infinity Brain 111',
    description: 'Personal website builder with mongoose integration and AI features',
    url: 'https://pewpi-infinity.github.io/infinity-brain-111/',
    status: 'active',
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Osprey Terminal',
    description: 'Enhanced terminal interface with improved visuals and user experience',
    url: 'https://pewpi-infinity.github.io/Osprey-Terminal/',
    status: 'beta',
    color: 'from-blue-500 to-cyan-500'
  }
]

export function PageHub() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Connected Pages</h2>
        <p className="text-muted-foreground">
          Explore all your integrated projects and tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PAGES.map((page, index) => (
          <a
            key={index}
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:scale-105 gradient-border relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold group-hover:text-accent transition-colors">
                    {page.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={page.status === 'active' ? 'default' : 'secondary'}
                      className="uppercase text-xs"
                    >
                      {page.status}
                    </Badge>
                    <ArrowSquareOut
                      size={20}
                      className="text-muted-foreground group-hover:text-accent transition-colors"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {page.description}
                </p>
                
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {page.url}
                  </p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}