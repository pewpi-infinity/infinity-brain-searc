import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitBranch, Star, GitFork, Clock, Globe, Brain, Wrench, Folder } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  fetchPewpiInfinityRepos,
  categorizeRepos,
  getGitHubPagesUrl,
  type Repository,
  type RepoCategory
} from '@/lib/githubRepos'

interface RepoHubProps {
  onRepoSelect?: (repo: Repository) => void
  onCategoryChange?: (category: string) => void
}

export function RepoHub({ onRepoSelect, onCategoryChange }: RepoHubProps) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [categories, setCategories] = useState<RepoCategory>({
    brain: [],
    websites: [],
    tools: [],
    other: []
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      const fetchedRepos = await fetchPewpiInfinityRepos()
      setRepos(fetchedRepos)
      
      const categorized = categorizeRepos(fetchedRepos)
      setCategories(categorized)
      
      toast.success(`Loaded ${fetchedRepos.length} repositories`)
    } catch (error) {
      toast.error('Failed to load repositories')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRepoClick = (repo: Repository) => {
    onRepoSelect?.(repo)
    toast.info(`Selected: ${repo.name}`)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'brain':
        return <Brain size={20} weight="duotone" />
      case 'websites':
        return <Globe size={20} weight="duotone" />
      case 'tools':
        return <Wrench size={20} weight="duotone" />
      default:
        return <Folder size={20} weight="duotone" />
    }
  }

  const getFilteredRepos = () => {
    let filtered = repos

    if (selectedCategory !== 'all') {
      filtered = categories[selectedCategory as keyof RepoCategory] || []
    }

    if (searchQuery) {
      filtered = filtered.filter(
        repo =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredRepos = getFilteredRepos()

  return (
    <Card className="gradient-border bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2">
          <GitBranch size={32} weight="duotone" className="text-accent" />
          Repository Hub
        </CardTitle>
        <CardDescription>
          Browse and manage all your pewpi-infinity repositories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={loadRepositories} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={cat => {
            setSelectedCategory(cat)
            onCategoryChange?.(cat)
          }}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({repos.length})
            </TabsTrigger>
            <TabsTrigger value="brain">
              🧠 Brain ({categories.brain.length})
            </TabsTrigger>
            <TabsTrigger value="websites">
              🌐 Sites ({categories.websites.length})
            </TabsTrigger>
            <TabsTrigger value="tools">
              🛠️ Tools ({categories.tools.length})
            </TabsTrigger>
            <TabsTrigger value="other">
              📁 Other ({categories.other.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading repositories...</p>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No repositories found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRepos.map(repo => (
                    <Card
                      key={repo.id}
                      className="cursor-pointer hover:border-accent/50 transition-all hover:shadow-lg"
                      onClick={() => handleRepoClick(repo)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {getCategoryIcon(repo.category || 'other')}
                              {repo.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {repo.description || 'No description'}
                            </CardDescription>
                          </div>
                          {repo.has_pages && (
                            <Badge variant="secondary" className="ml-2">
                              <Globe size={14} className="mr-1" />
                              Live
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star size={16} weight="fill" className="text-yellow-500" />
                            {repo.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork size={16} />
                            {repo.forks_count}
                          </div>
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock size={16} />
                            {new Date(repo.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {repo.topics.slice(0, 5).map(topic => (
                              <Badge
                                key={topic}
                                variant="secondary"
                                className="text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {categories.brain.length}
            </div>
            <div className="text-xs text-muted-foreground">Brain Repos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {categories.websites.length}
            </div>
            <div className="text-xs text-muted-foreground">Websites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {categories.tools.length}
            </div>
            <div className="text-xs text-muted-foreground">Tools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {repos.reduce((sum, r) => sum + r.stargazers_count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Stars</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
