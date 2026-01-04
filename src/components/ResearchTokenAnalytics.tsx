import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartLine, TrendUp, Flask, Users, Hash } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

interface ResearchToken {
  id: string
  title: string
  abstract: string
  content: string
  hash: string
  verificationHash: string
  author: string
  authorGitHub: string
  timestamp: number
  links: string[]
  citations: string[]
  category: string
  value: number
  verified: boolean
  repository?: string
}

export function ResearchTokenAnalytics() {
  const [tokens] = useLocalStorage<ResearchToken[]>('research-tokens', [])

  const totalTokens = tokens?.length || 0
  const totalValue = tokens?.reduce((sum, token) => sum + token.value, 0) || 0
  const avgValue = totalTokens > 0 ? Math.floor(totalValue / totalTokens) : 0
  const uniqueAuthors = new Set(tokens?.map(t => t.author) || []).size

  const categoryBreakdown = tokens?.reduce((acc, token) => {
    acc[token.category] = (acc[token.category] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const categoryValues = tokens?.reduce((acc, token) => {
    acc[token.category] = (acc[token.category] || 0) + token.value
    return acc
  }, {} as Record<string, number>) || {}

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topAuthors = tokens
    ? Object.entries(
        tokens.reduce((acc, token) => {
          acc[token.author] = (acc[token.author] || 0) + token.value
          return acc
        }, {} as Record<string, number>)
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : []

  const recentTokens = tokens
    ? [...tokens].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
    : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Research Tokens</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              <Flask size={32} weight="duotone" className="text-primary" />
              {totalTokens.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Research Value</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              <TrendUp size={32} weight="duotone" className="text-accent" />
              {totalValue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">INF tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Token Value</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              <ChartLine size={32} weight="duotone" className="text-secondary" />
              {avgValue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">INF per token</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Research Contributors</CardDescription>
            <CardTitle className="text-4xl flex items-center gap-2">
              <Users size={32} weight="duotone" className="text-primary" />
              {uniqueAuthors}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Unique authors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash size={24} weight="duotone" />
              Research by Category
            </CardTitle>
            <CardDescription>Distribution of research tokens by field</CardDescription>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {topCategories.map(([category, count]) => {
                  const value = categoryValues[category] || 0
                  const percentage = totalTokens > 0 ? (count / totalTokens) * 100 : 0
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} token{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {value.toLocaleString()} INF
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={24} weight="duotone" />
              Top Contributors
            </CardTitle>
            <CardDescription>Researchers with highest token value</CardDescription>
          </CardHeader>
          <CardContent>
            {topAuthors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {topAuthors.map(([author, value], idx) => (
                  <div key={author} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">@{author}</p>
                      <p className="text-sm text-muted-foreground">
                        {value.toLocaleString()} INF
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flask size={24} weight="duotone" />
            Recent Research Tokens
          </CardTitle>
          <CardDescription>Latest verified research contributions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTokens.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No research tokens yet</p>
          ) : (
            <div className="space-y-3">
              {recentTokens.map((token) => (
                <div key={token.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{token.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{token.category}</Badge>
                        <Badge variant="outline" className="font-mono text-xs">{token.id}</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {token.value.toLocaleString()} INF
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By @{token.author} • {new Date(token.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
