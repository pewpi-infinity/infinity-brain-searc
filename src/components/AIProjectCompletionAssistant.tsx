import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKV } from '@github/spark/hooks'
import { Robot, Lightbulb, CheckCircle, Target, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Project {
  id: string
  name: string
  description: string
  progress: number
  category: string
  nextSteps: string[]
  blockers: string[]
  status: 'not-started' | 'in-progress' | 'blocked' | 'completed'
}

export function AIProjectCompletionAssistant() {
  const [projects, setProjects] = useKV<Project[]>('ai-projects', [])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!projects || projects.length === 0) {
      generateSampleProjects()
    }
  }, [])

  const generateSampleProjects = async () => {
    const sampleProjects: Project[] = [
      {
        id: 'proj-1',
        name: 'Token Marketplace Redesign',
        description: 'Update marketplace UI with new blue/white theme',
        progress: 60,
        category: 'UI/UX',
        nextSteps: ['Update color scheme', 'Test responsive layout', 'Deploy to staging'],
        blockers: ['Need design approval'],
        status: 'in-progress'
      },
      {
        id: 'proj-2',
        name: 'Mongoose.os Cart Integration',
        description: 'Connect all repos to read each other\'s data',
        progress: 30,
        category: 'Backend',
        nextSteps: ['Create shared API', 'Test data sync', 'Document API endpoints'],
        blockers: ['API authentication needs setup'],
        status: 'blocked'
      },
      {
        id: 'proj-3',
        name: 'Neural Slot Chat Enhancement',
        description: 'Add voice commands and emoji reactions',
        progress: 75,
        category: 'AI',
        nextSteps: ['Test voice recognition', 'Polish UI animations'],
        blockers: [],
        status: 'in-progress'
      },
      {
        id: 'proj-4',
        name: 'Infinity Token Charts',
        description: 'Implement plateau growth algorithm',
        progress: 0,
        category: 'Analytics',
        nextSteps: ['Design chart component', 'Create growth algorithm', 'Connect to token data'],
        blockers: [],
        status: 'not-started'
      },
    ]

    await setProjects(sampleProjects)
    toast.success('📋 Sample projects loaded')
  }

  const analyzeProject = async (project: Project) => {
    setSelectedProject(project)
    setIsAnalyzing(true)
    setSuggestions([])

    try {
      const prompt = window.spark.llmPrompt`You are an AI Project Completion Assistant. Analyze this project:

Project: ${project.name}
Description: ${project.description}
Progress: ${project.progress}%
Category: ${project.category}
Status: ${project.status}
Current Next Steps: ${project.nextSteps.join(', ')}
Blockers: ${project.blockers.join(', ') || 'None'}

Generate 5 intelligent, actionable suggestions to help complete this project. Focus on:
1. Overcoming blockers
2. Breaking down large tasks
3. Prioritizing next steps
4. Identifying dependencies
5. Suggesting tools or resources

Return a JSON object with a "suggestions" property containing an array of short, actionable strings (max 100 chars each).`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      
      setSuggestions(data.suggestions || [])
      toast.success('✨ AI analysis complete!')

    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze project')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateProgress = async (projectId: string, delta: number) => {
    await setProjects((prev) =>
      (prev || []).map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: Math.min(100, Math.max(0, p.progress + delta)),
              status: p.progress + delta >= 100 ? 'completed' : p.status
            }
          : p
      )
    )
    toast.success(`Progress updated +${delta}%`)
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      case 'not-started': return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: Project['status']) => {
    switch (status) {
      case 'completed': return '✓ Completed'
      case 'in-progress': return '⚡ In Progress'
      case 'blocked': return '⚠ Blocked'
      case 'not-started': return '○ Not Started'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
              <Robot size={32} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                AI Project Completion Assistant
                <Badge variant="secondary" className="bg-white/30 text-white border-0">
                  AI
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Intelligent task prioritization • Blocker resolution • Next step suggestions
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Active Projects</h3>
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                {projects?.length || 0} projects
              </Badge>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {(projects || []).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedProject?.id === project.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-blue-200 hover:border-blue-300'
                      }`}
                      onClick={() => analyzeProject(project)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{project.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <Badge className={getStatusColor(project.status)} variant="default">
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {project.category}
                          </Badge>
                          {project.blockers.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {project.blockers.length} blocker{project.blockers.length !== 1 && 's'}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateProgress(project.id, 10)
                            }}
                          >
                            +10%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              analyzeProject(project)
                            }}
                          >
                            <Robot size={16} weight="fill" className="mr-1" />
                            Analyze
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            {selectedProject ? (
              <>
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500 text-white">
                        <Target size={24} weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{selectedProject.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedProject.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedProject.progress}%
                        </div>
                        <div className="text-xs text-muted-foreground">Complete</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedProject.nextSteps.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Next Steps</div>
                      </div>
                    </div>

                    {selectedProject.nextSteps.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <CheckCircle size={16} weight="fill" className="text-blue-500" />
                          Next Steps
                        </h4>
                        <div className="space-y-1">
                          {selectedProject.nextSteps.map((step, i) => (
                            <div key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedProject.blockers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-red-600">
                          <Lightning size={16} weight="fill" />
                          Blockers
                        </h4>
                        <div className="space-y-1">
                          {selectedProject.blockers.map((blocker, i) => (
                            <div key={i} className="text-sm text-red-600 flex items-start gap-2">
                              <span>⚠</span>
                              <span>{blocker}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Lightbulb size={20} weight="fill" className="text-yellow-500" />
                        AI Suggestions
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => analyzeProject(selectedProject)}
                        disabled={isAnalyzing}
                        className="border-blue-200"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                      </Button>
                    </div>

                    {isAnalyzing ? (
                      <div className="text-center py-12">
                        <Robot size={48} weight="duotone" className="mx-auto mb-4 text-blue-500 animate-pulse" />
                        <p className="text-muted-foreground">AI is analyzing your project...</p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-3">
                          {suggestions.map((suggestion, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="text-sm leading-relaxed flex-1">{suggestion}</p>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <Lightbulb size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click "Analyze" to get AI-powered suggestions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-blue-200 h-full">
                <CardContent className="p-12 flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Robot size={64} weight="duotone" className="mx-auto text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Select a Project</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Choose a project from the list to get AI-powered completion assistance and intelligent suggestions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
