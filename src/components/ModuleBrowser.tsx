import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MagnifyingGlass, 
  HardDrives, 
  Robot, 
  Gear,
  Broadcast,
  Brain,
  MapPin,
  Users,
  CalendarCheck,
  CurrencyDollar,
  Scales,
  PaintBrush,
  Image,
  GameController,
  Lock,
  PlugsConnected,
  Recycle,
  Package,
  CheckCircle,
  Clock,
  Lightbulb,
  Graph
} from '@phosphor-icons/react'
import { MODULE_CATEGORIES, MODULE_REGISTRY, ModuleMetadata, getModulesByCategory } from '@/lib/registry'
import { EcosystemGraph } from './EcosystemGraph'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, any> = {
  HardDrives,
  Robot,
  Gear,
  Broadcast,
  Brain,
  MapPin,
  Users,
  CalendarCheck,
  CurrencyDollar,
  Scales,
  PaintBrush,
  Image,
  GameController,
  Lock,
  PlugsConnected,
  Recycle
}

export function ModuleBrowser() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedModule, setSelectedModule] = useState<ModuleMetadata | null>(null)

  const filteredModules = useMemo(() => {
    let modules = Object.values(MODULE_REGISTRY)

    if (selectedCategory !== 'all') {
      modules = getModulesByCategory(selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      modules = modules.filter(
        module =>
          module.name.toLowerCase().includes(query) ||
          module.description.toLowerCase().includes(query) ||
          module.capabilities.some(cap => cap.toLowerCase().includes(query))
      )
    }

    return modules
  }, [searchQuery, selectedCategory])

  const statusCounts = useMemo(() => {
    const all = Object.values(MODULE_REGISTRY)
    return {
      active: all.filter(m => m.status === 'active').length,
      development: all.filter(m => m.status === 'development').length,
      planned: all.filter(m => m.status === 'planned').length,
      total: all.length
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Infinity Ecosystem Registry
          </h2>
          <p className="text-muted-foreground">
            Comprehensive module system powering the tokenized business ecosystem
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Package size={24} weight="duotone" className="text-primary" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
                <p className="text-xs text-muted-foreground">Total Modules</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} weight="duotone" className="text-green-500" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock size={24} weight="duotone" className="text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.development}</p>
                <p className="text-xs text-muted-foreground">In Development</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Lightbulb size={24} weight="duotone" className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.planned}</p>
                <p className="text-xs text-muted-foreground">Planned</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search modules, capabilities, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 h-auto gap-1 bg-muted/50 p-2">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="graph" className="text-xs flex flex-col items-center gap-1 py-2">
            <Graph size={16} weight="duotone" />
            <span className="hidden md:inline">Graph</span>
          </TabsTrigger>
          {MODULE_CATEGORIES.map(category => {
            const Icon = ICON_MAP[category.icon]
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs flex flex-col items-center gap-1 py-2"
              >
                {Icon && <Icon size={16} weight="duotone" />}
                <span className="hidden md:inline">{category.name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ModuleGrid
            modules={filteredModules}
            onSelectModule={setSelectedModule}
            selectedModule={selectedModule}
          />
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <EcosystemGraph />
        </TabsContent>

        {MODULE_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-3">
                {ICON_MAP[category.icon] && (
                  <div className="p-3 rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = ICON_MAP[category.icon]
                      return <Icon size={32} weight="duotone" className="text-primary" />
                    })()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </Card>
            <ModuleGrid
              modules={filteredModules}
              onSelectModule={setSelectedModule}
              selectedModule={selectedModule}
            />
          </TabsContent>
        ))}
      </Tabs>

      {selectedModule && (
        <ModuleDetailPanel
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </div>
  )
}

interface ModuleGridProps {
  modules: ModuleMetadata[]
  onSelectModule: (module: ModuleMetadata) => void
  selectedModule: ModuleMetadata | null
}

function ModuleGrid({ modules, onSelectModule, selectedModule }: ModuleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map(module => (
        <Card
          key={module.id}
          className={cn(
            'p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105',
            selectedModule?.id === module.id && 'ring-2 ring-accent shadow-xl'
          )}
          onClick={() => onSelectModule(module)}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{module.name}</h3>
                <p className="text-xs text-muted-foreground">{module.id}</p>
              </div>
              <Badge
                variant={
                  module.status === 'active'
                    ? 'default'
                    : module.status === 'development'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {module.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {module.description}
            </p>

            <div className="flex flex-wrap gap-1">
              {module.capabilities.slice(0, 3).map(capability => (
                <Badge key={capability} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {module.capabilities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{module.capabilities.length - 3}
                </Badge>
              )}
            </div>

            {module.tokenSymbol && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <CurrencyDollar size={16} weight="duotone" className="text-accent" />
                  <span className="font-mono font-bold">{module.tokenSymbol}</span>
                  {module.tokenSupply && (
                    <span className="text-muted-foreground">
                      • Supply: {module.tokenSupply.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

interface ModuleDetailPanelProps {
  module: ModuleMetadata
  onClose: () => void
}

function ModuleDetailPanel({ module, onClose }: ModuleDetailPanelProps) {
  const dependencies = module.dependencies
    .map(depId => MODULE_REGISTRY[depId])
    .filter(Boolean)

  const dependents = Object.values(MODULE_REGISTRY).filter(m =>
    m.dependencies.includes(module.id)
  )

  return (
    <Card className="p-6 gradient-border bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">{module.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{module.id}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
            {module.status}
          </Badge>
          <Badge variant="outline">v{module.version}</Badge>
          <Badge variant="outline">{module.category}</Badge>
        </div>

        <p className="text-muted-foreground">{module.description}</p>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {module.capabilities.map(capability => (
              <Badge key={capability} variant="secondary">
                {capability}
              </Badge>
            ))}
          </div>
        </div>

        {dependencies.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Dependencies</h4>
            <div className="flex flex-wrap gap-2">
              {dependencies.map(dep => (
                <Badge key={dep.id} variant="outline">
                  {dep.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {dependents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Used By</h4>
            <div className="flex flex-wrap gap-2">
              {dependents.map(dep => (
                <Badge key={dep.id} variant="outline">
                  {dep.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {module.repository && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Repository</h4>
            <a
              href={`https://github.com/pewpi-infinity/${module.repository}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline text-sm font-mono"
            >
              {module.repository}
            </a>
          </div>
        )}

        {module.tokenSymbol && (
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10">
            <h4 className="font-semibold text-sm mb-2">Business Token</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Symbol</span>
                <span className="font-mono font-bold">{module.tokenSymbol}</span>
              </div>
              {module.tokenSupply && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-mono">{module.tokenSupply.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
}
