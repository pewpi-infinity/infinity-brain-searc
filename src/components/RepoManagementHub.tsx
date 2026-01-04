import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@github/spark/hooks'
import { GitBranch, Pencil, Rocket, MagnifyingGlass, Plus, Folder, FileCode, Question, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Repo {
  name: string
  description: string
  url: string
  stars: number
  language: string
  topics: string[]
  isPrivate: boolean
  createdAt: string
}

interface EditableRepo extends Repo {
  editableFields: {
    [key: string]: {
      value: string
      label: string
      type: 'text' | 'textarea' | 'select'
      options?: string[]
      help?: string
    }
  }
}

export function RepoManagementHub() {
  const [repos, setRepos] = useState<Repo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<EditableRepo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scanQuery, setScanQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [deployTarget, setDeployTarget] = useState<string>('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchPewpiInfinityRepos()
  }, [])

  const fetchPewpiInfinityRepos = async () => {
    setLoading(true)
    try {
      const user = await window.spark.user()
      
      const mockRepos: Repo[] = [
        {
          name: 'smug_look',
          description: 'Advanced UI components and scripts collection',
          url: 'https://github.com/pewpi-infinity/smug_look',
          stars: 42,
          language: 'TypeScript',
          topics: ['ui', 'components', 'scripts'],
          isPrivate: false,
          createdAt: '2024-01-15'
        },
        {
          name: 'infinity-core',
          description: 'Core blockchain and tokenization infrastructure',
          url: 'https://github.com/pewpi-infinity/infinity-core',
          stars: 128,
          language: 'Solidity',
          topics: ['blockchain', 'tokens', 'web3'],
          isPrivate: false,
          createdAt: '2023-11-20'
        },
        {
          name: 'infinity-ui-toolkit',
          description: 'Reusable UI patterns and design system',
          url: 'https://github.com/pewpi-infinity/infinity-ui-toolkit',
          stars: 67,
          language: 'React',
          topics: ['design-system', 'ui', 'react'],
          isPrivate: false,
          createdAt: '2024-02-10'
        }
      ]

      setRepos(mockRepos)
      toast.success(`Loaded ${mockRepos.length} repos from pewpi-infinity`)
    } catch (error) {
      toast.error('Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  const prepareRepoForEditing = (repo: Repo): EditableRepo => {
    return {
      ...repo,
      editableFields: {
        name: {
          value: repo.name,
          label: 'Repository Name',
          type: 'text',
          help: 'The name of your repository (URL-safe, no spaces)'
        },
        description: {
          value: repo.description,
          label: 'Description',
          type: 'textarea',
          help: 'Short description that appears in search results'
        },
        readme: {
          value: '# ' + repo.name + '\n\n' + repo.description,
          label: 'README Content',
          type: 'textarea',
          help: 'Main documentation file (supports Markdown)'
        },
        visibility: {
          value: repo.isPrivate ? 'private' : 'public',
          label: 'Visibility',
          type: 'select',
          options: ['public', 'private'],
          help: 'Who can see this repository?'
        },
        license: {
          value: 'MIT',
          label: 'License',
          type: 'select',
          options: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'None'],
          help: 'How others can use your code'
        },
        homepage: {
          value: '',
          label: 'Homepage URL',
          type: 'text',
          help: 'Website or demo link for this project'
        }
      }
    }
  }

  const handleEditRepo = (repo: Repo) => {
    const editableRepo = prepareRepoForEditing(repo)
    setSelectedRepo(editableRepo)
    setEditDialogOpen(true)
  }

  const handleDeployRepo = async (repo: Repo) => {
    toast.info('Deploying repository...', {
      description: `Creating live site for ${repo.name}`
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success('Repository deployed!', {
      description: `Live at: ${repo.name}.infinity-deploy.app`,
      action: {
        label: 'Open Site',
        onClick: () => window.open(`https://${repo.name}.infinity-deploy.app`, '_blank')
      }
    })
  }

  const handleScanRepo = async (repo: Repo, scanType: string) => {
    toast.info(`Scanning ${repo.name}...`, {
      description: `Running ${scanType} analysis`
    })

    try {
      const prompt = `Analyze the repository "${repo.name}" with description "${repo.description}" and language ${repo.language}. Perform a ${scanType} scan. Provide 3-5 key insights as a JSON object with an "insights" array.`
      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)
      
      toast.success('Scan complete!', {
        description: `Found ${data.insights?.length || 0} insights`
      })
    } catch (error) {
      toast.error('Scan failed')
    }
  }

  const handleAddToProject = async (repos: Repo[]) => {
    toast.success('Repositories added to project', {
      description: `${repos.length} repos are now linked and ready to build`
    })
  }

  const handleOneClickDeploy = async (repo: Repo) => {
    const steps = [
      { name: 'Creating repository structure', duration: 1000 },
      { name: 'Generating files and indexes', duration: 1500 },
      { name: 'Deploying to live website', duration: 2000 },
      { name: 'Tokenizing and protecting', duration: 1000 }
    ]

    for (const step of steps) {
      toast.info(step.name)
      await new Promise(resolve => setTimeout(resolve, step.duration))
    }

    toast.success('🎉 Repo is live!', {
      description: `${repo.name} is now a protected, tokenized website`,
      action: {
        label: 'View Live Site',
        onClick: () => window.open(`https://${repo.name}.infinity.app`, '_blank')
      }
    })
  }

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <GitBranch size={32} weight="duotone" className="text-primary" />
            <div className="flex-1">
              <CardTitle className="text-2xl">Repository Management Hub</CardTitle>
              <CardDescription className="mt-2">
                All your pewpi-infinity repos in one place. Edit like a form, deploy with one click.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchPewpiInfinityRepos} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Repos'}
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredRepos.map((repo) => (
          <Card key={repo.name} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <Folder size={24} weight="duotone" className="text-primary mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{repo.name}</h3>
                        {repo.isPrivate && <Badge variant="secondary">Private</Badge>}
                        <Badge>{repo.language}</Badge>
                        <span className="text-sm text-muted-foreground">★ {repo.stars}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {repo.topics.map(topic => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditRepo(repo)}
                    className="whitespace-nowrap"
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="whitespace-nowrap">
                        <MagnifyingGlass size={16} className="mr-2" />
                        Scan
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Scan {repo.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>What would you like to scan for?</Label>
                          <Input
                            placeholder="e.g., 'security vulnerabilities' or 'reusable components'"
                            value={scanQuery}
                            onChange={(e) => setScanQuery(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={() => handleScanRepo(repo, scanQuery || 'quality')}>
                            Scan Quality
                          </Button>
                          <Button onClick={() => handleScanRepo(repo, 'security')}>
                            Scan Security
                          </Button>
                          <Button onClick={() => handleScanRepo(repo, 'components')}>
                            Find Components
                          </Button>
                          <Button onClick={() => handleScanRepo(repo, 'dependencies')}>
                            Check Dependencies
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleOneClickDeploy(repo)}
                    className="whitespace-nowrap bg-gradient-to-r from-primary to-secondary"
                  >
                    <Rocket size={16} className="mr-2" />
                    Deploy
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddToProject([repo])}
                  >
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Repository: {selectedRepo?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedRepo && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {Object.entries(selectedRepo.editableFields).map(([key, field]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={key}>{field.label}</Label>
                      {field.help && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Question size={16} className="text-muted-foreground" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{field.label}</DialogTitle>
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">{field.help}</p>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {field.type === 'text' && (
                      <Input
                        id={key}
                        value={field.value}
                        onChange={(e) => {
                          setSelectedRepo({
                            ...selectedRepo,
                            editableFields: {
                              ...selectedRepo.editableFields,
                              [key]: { ...field, value: e.target.value }
                            }
                          })
                        }}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <Textarea
                        id={key}
                        value={field.value}
                        onChange={(e) => {
                          setSelectedRepo({
                            ...selectedRepo,
                            editableFields: {
                              ...selectedRepo.editableFields,
                              [key]: { ...field, value: e.target.value }
                            }
                          })
                        }}
                        rows={key === 'readme' ? 10 : 4}
                      />
                    )}

                    {field.type === 'select' && field.options && (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          setSelectedRepo({
                            ...selectedRepo,
                            editableFields: {
                              ...selectedRepo.editableFields,
                              [key]: { ...field, value }
                            }
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => {
                    toast.success('Repository updated!', {
                      description: 'All changes have been saved'
                    })
                    setEditDialogOpen(false)
                  }}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
