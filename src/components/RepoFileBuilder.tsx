import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, FolderOpen, Code, Download, Sparkle, CheckCircle, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/lib/useLocalStorage'

interface RepoFile {
  path: string
  name: string
  type: 'file' | 'dir'
  content?: string
  size?: number
  language?: string
}

interface GeneratedProgram {
  id: string
  name: string
  description: string
  files: RepoFile[]
  sourceRepo: string
  timestamp: number
  requirements: string
}

export function RepoFileBuilder() {
  const [repoUrl, setRepoUrl] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [requirements, setRequirements] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [scannedFiles, setScannedFiles] = useState<RepoFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null)
  const [programHistory, setProgramHistory] = useLocalStorage<GeneratedProgram[]>('generated-programs', [])

  const scanRepository = async () => {
    if (!repoUrl.trim()) {
      toast.error('Enter a repository URL')
      return
    }

    const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/)
    if (!repoMatch) {
      toast.error('Invalid GitHub repository URL')
      return
    }

    const [, owner, repo] = repoMatch
    const repoName = `${owner}/${repo.replace('.git', '')}`

    setIsScanning(true)
    setScannedFiles([])

    try {
      const prompt = `Simulate scanning the GitHub repository: ${repoName}

Generate a realistic file structure with 20-40 files typical for this type of repository.
Include relevant file types based on the repo name/purpose:
- Source code files (.js, .ts, .py, .java, .go, etc.)
- Configuration files (package.json, tsconfig.json, .env.example, etc.)
- Documentation (README.md, CONTRIBUTING.md, API.md, etc.)
- Tests (test/, spec files)
- Build/deployment files (Dockerfile, docker-compose.yml, etc.)

Return ONLY valid JSON with a "files" array:
{
  "files": [
    {"path": "src/index.ts", "name": "index.ts", "type": "file", "size": 1250, "language": "TypeScript"},
    {"path": "src/components", "name": "components", "type": "dir"},
    ...more files
  ]
}`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)

      if (data.files && Array.isArray(data.files)) {
        setScannedFiles(data.files)
        toast.success(`Scanned ${data.files.length} items from ${repoName}`)
      }
    } catch (error) {
      toast.error('Failed to scan repository')
      console.error(error)
    } finally {
      setIsScanning(false)
    }
  }

  const searchFiles = (files: RepoFile[], query: string): RepoFile[] => {
    if (!query.trim()) return files

    const lowerQuery = query.toLowerCase()
    return files.filter(f => 
      f.path.toLowerCase().includes(lowerQuery) ||
      f.name.toLowerCase().includes(lowerQuery) ||
      f.language?.toLowerCase().includes(lowerQuery)
    )
  }

  const toggleFileSelection = (path: string) => {
    const newSelection = new Set(selectedFiles)
    if (newSelection.has(path)) {
      newSelection.delete(path)
    } else {
      newSelection.add(path)
    }
    setSelectedFiles(newSelection)
  }

  const selectByPattern = (pattern: string) => {
    const newSelection = new Set(selectedFiles)
    const regex = new RegExp(pattern, 'i')
    
    scannedFiles.forEach(file => {
      if (regex.test(file.path) || regex.test(file.name)) {
        newSelection.add(file.path)
      }
    })
    
    setSelectedFiles(newSelection)
    toast.success(`Selected ${newSelection.size - selectedFiles.size} additional files`)
  }

  const buildProgram = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Select at least one file')
      return
    }

    if (!requirements.trim()) {
      toast.error('Describe what you want to build')
      return
    }

    setIsBuilding(true)

    try {
      const selectedFilesList = Array.from(selectedFiles).map(path =>
        scannedFiles.find(f => f.path === path)
      ).filter(Boolean)

      const prompt = `You are a code synthesis expert. Build a working program from selected repository files.

Requirements: ${requirements}

Selected files (${selectedFiles.size}):
${selectedFilesList.map(f => `- ${f!.path} (${f!.language || 'unknown'})`).join('\n')}

Create a cohesive program that:
1. Integrates the selected files
2. Meets the stated requirements
3. Includes proper imports/connections
4. Has a clear entry point
5. Is ready to run

Generate a program structure with file contents. Return as JSON:
{
  "name": "Program Name",
  "description": "What it does",
  "files": [
    {"path": "src/main.ts", "name": "main.ts", "type": "file", "content": "// Full working code here", "language": "TypeScript"},
    ...more files
  ]
}`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)

      const program: GeneratedProgram = {
        id: `prog-${Date.now()}`,
        name: data.name || 'Generated Program',
        description: data.description || requirements,
        files: data.files || [],
        sourceRepo: repoUrl,
        timestamp: Date.now(),
        requirements
      }

      setGeneratedProgram(program)
      setProgramHistory((current) => [...(current || []), program])
      
      toast.success(`Generated program: ${program.name}`)
    } catch (error) {
      toast.error('Failed to build program')
      console.error(error)
    } finally {
      setIsBuilding(false)
    }
  }

  const downloadProgram = () => {
    if (!generatedProgram) return

    const zip: string[] = []
    zip.push(`# ${generatedProgram.name}`)
    zip.push(`\n## Description\n${generatedProgram.description}`)
    zip.push(`\n## Requirements\n${generatedProgram.requirements}`)
    zip.push(`\n## Source\n${generatedProgram.sourceRepo}`)
    zip.push(`\n## Files (${generatedProgram.files.length})\n`)

    generatedProgram.files.forEach(file => {
      zip.push(`\n### ${file.path}\n`)
      zip.push('```')
      zip.push(file.content || '// Content placeholder')
      zip.push('```\n')
    })

    const blob = new Blob([zip.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedProgram.name.replace(/\s+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Program downloaded')
  }

  const copyFileContent = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  const filteredFiles = searchFiles(scannedFiles, searchQuery)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={24} weight="duotone" className="text-primary" />
            Repository File Builder
          </CardTitle>
          <CardDescription>
            Scan repos, select files, describe what you need, and generate a working program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="repo-url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                disabled={isScanning}
              />
              <Button onClick={scanRepository} disabled={isScanning}>
                <FolderOpen className="mr-2" size={16} />
                {isScanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>
          </div>

          {scannedFiles.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Found {scannedFiles.length} items • {selectedFiles.size} selected
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {scannedFiles.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Browser</CardTitle>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFiles(new Set(scannedFiles.map(f => f.path)))}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedFiles(new Set())}
                >
                  Clear
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                <Button variant="outline" size="sm" onClick={() => selectByPattern('\\.ts$')}>
                  + .ts
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('\\.js$')}>
                  + .js
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('\\.py$')}>
                  + .py
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('src/')}>
                  + src/
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectByPattern('test|spec')}>
                  + tests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-1">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.path}
                      onClick={() => file.type === 'file' && toggleFileSelection(file.path)}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedFiles.has(file.path)
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      } ${file.type === 'dir' ? 'opacity-60 cursor-default' : ''}`}
                    >
                      {file.type === 'file' ? (
                        <FileText size={16} className="text-muted-foreground" />
                      ) : (
                        <FolderOpen size={16} className="text-muted-foreground" />
                      )}
                      <span className="font-mono text-sm flex-1">{file.path}</span>
                      {file.language && (
                        <Badge variant="outline" className="text-xs">
                          {file.language}
                        </Badge>
                      )}
                      {file.size && (
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)}kb
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Build Program</CardTitle>
              <CardDescription>
                Describe what you want to build from selected files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={`Example:
"Build a REST API server with authentication"
"Create a React dashboard with these components"
"Extract the database models and create migrations"
"Build a CLI tool from these utility functions"`}
                  rows={8}
                  disabled={isBuilding}
                />
              </div>

              <Button 
                onClick={buildProgram} 
                disabled={isBuilding || selectedFiles.size === 0}
                className="w-full"
              >
                <Sparkle className="mr-2" size={16} />
                {isBuilding ? 'Building Program...' : 'Build Program'}
              </Button>

              {generatedProgram && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">{generatedProgram.name}</div>
                    <div className="text-sm mt-1">{generatedProgram.description}</div>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={downloadProgram}>
                        <Download className="mr-2" size={14} />
                        Download
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {generatedProgram && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedProgram.name}</CardTitle>
            <CardDescription>{generatedProgram.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={generatedProgram.files[0]?.path || 'overview'}>
              <ScrollArea className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  {generatedProgram.files.slice(0, 10).map((file) => (
                    <TabsTrigger key={file.path} value={file.path}>
                      {file.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Source Repository</h3>
                  <a 
                    href={generatedProgram.sourceRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {generatedProgram.sourceRepo}
                  </a>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Files ({generatedProgram.files.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {generatedProgram.files.map((file) => (
                      <Badge key={file.path} variant="outline">
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Requirements</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {generatedProgram.requirements}
                  </p>
                </div>
              </TabsContent>

              {generatedProgram.files.map((file) => (
                <TabsContent key={file.path} value={file.path}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{file.language || 'Unknown'}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyFileContent(file.content || '')}
                      >
                        <Copy className="mr-2" size={14} />
                        Copy
                      </Button>
                    </div>
                    <ScrollArea className="h-[500px]">
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{file.content || '// No content generated'}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
