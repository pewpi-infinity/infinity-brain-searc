export interface ModuleMetadata {
  id: string
  name: string
  category: string
  description: string
  version: string
  status: 'active' | 'development' | 'planned'
  repository?: string
  dependencies: string[]
  capabilities: string[]
  tokenSymbol?: string
  tokenSupply?: number
}

export interface ModuleCategory {
  id: string
  name: string
  icon: string
  description: string
  modules: string[]
}

export const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: 'HardDrives',
    description: 'Core system components and data management',
    modules: ['socket', 'chain', 'frame', 'data-collection', 'data-disseminate', 'assimilation']
  },
  {
    id: 'automation',
    name: 'Automation',
    icon: 'Robot',
    description: 'Automated systems and watchers',
    modules: ['watcher', 'viewer', 'listener', 'audit', 'sweeper', 'bot-spawn']
  },
  {
    id: 'mechanical',
    name: 'Mechanical',
    icon: 'Gear',
    description: 'Physical and mechanical components',
    modules: ['tire', 'belt', 'cylinder', 'printer', 'reader', 'components', 'layers', 'robots']
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: 'Broadcast',
    description: 'Voice, commands, and language processing',
    modules: ['voice', 'commands', 'directions', 'language-interpreter', 'semantics-builder', 'threader']
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    icon: 'Brain',
    description: 'Logic, reasoning, and learning systems',
    modules: ['logic', 'reasoning', 'literature', 'math', 'dictionary', 'research-writer']
  },
  {
    id: 'navigation',
    name: 'Navigation',
    icon: 'MapPin',
    description: 'Maps, routes, and tracking',
    modules: ['maps', 'legends', 'routes', 'trackers', 'tangibles']
  },
  {
    id: 'society',
    name: 'Society',
    icon: 'Users',
    description: 'Social and organizational systems',
    modules: ['society', 'commerce', 'travel', 'housing', 'transport', 'networking', 'religion', 'history']
  },
  {
    id: 'planning',
    name: 'Planning',
    icon: 'CalendarCheck',
    description: 'Scheduling and project management',
    modules: ['plans', 'schedules', 'events', 'project-managers', 'dream-scapes']
  },
  {
    id: 'economy',
    name: 'Economy',
    icon: 'CurrencyDollar',
    description: 'Financial and tokenization systems',
    modules: ['money', 'currency', 'banking', 'merchants', 'royalties', 'token-minter']
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: 'Scales',
    description: 'Regulations and governmental systems',
    modules: ['government-gear', 'regulations', 'nobility', 'builders', 'power', 'energy']
  },
  {
    id: 'design',
    name: 'Design',
    icon: 'PaintBrush',
    description: 'Visual design and architecture',
    modules: ['architecture', 'web-architecture', 'web-design', 'layout', 'fonts', 'displays', 'nuanced']
  },
  {
    id: 'media',
    name: 'Media',
    icon: 'Image',
    description: 'Image, video, and sound processing',
    modules: ['img-video', 'sound', 'quantum-lighting', 'memory', 'modulators']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'GameController',
    description: 'Games and recreational systems',
    modules: ['toys', 'suited-life', 'enjoyable', 'topics', 'plateau-plus']
  },
  {
    id: 'security',
    name: 'Security',
    icon: 'Lock',
    description: 'Protection and encryption',
    modules: ['lock', 'protect', 'hash-generator', 'hash-reader', 'synch']
  },
  {
    id: 'integration',
    name: 'Integration',
    icon: 'PlugsConnected',
    description: 'External platform integrations',
    modules: ['infinity-ebay', 'infinity-twitter', 'infinity-facebook', 'import', 'export', 'unifying', 'developers']
  },
  {
    id: 'sustainability',
    name: 'Sustainability',
    icon: 'Recycle',
    description: 'Energy and resource management',
    modules: ['energy-cycling', 'conservation', 'dynamics', 'labeling']
  }
]

export const MODULE_REGISTRY: Record<string, ModuleMetadata> = {
  'socket': {
    id: 'socket',
    name: 'Socket',
    category: 'infrastructure',
    description: 'Real-time communication and connection management',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['websocket', 'real-time', 'bidirectional-communication']
  },
  'chain': {
    id: 'chain',
    name: 'Chain',
    category: 'infrastructure',
    description: 'Blockchain-inspired data chain for transaction tracking',
    version: '1.0.0',
    status: 'active',
    dependencies: ['hash-generator'],
    capabilities: ['immutable-ledger', 'transaction-history', 'verification']
  },
  'frame': {
    id: 'frame',
    name: 'Frame',
    category: 'infrastructure',
    description: 'Component framing and layout management',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['layout', 'structure', 'rendering']
  },
  'data-collection': {
    id: 'data-collection',
    name: 'Data Collection',
    category: 'infrastructure',
    description: 'Gather and aggregate data from multiple sources',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['aggregation', 'ingestion', 'transformation']
  },
  'data-disseminate': {
    id: 'data-disseminate',
    name: 'Data Disseminate',
    category: 'infrastructure',
    description: 'Distribute and broadcast data to subscribers',
    version: '1.0.0',
    status: 'active',
    dependencies: ['socket'],
    capabilities: ['distribution', 'broadcasting', 'pub-sub']
  },
  'assimilation': {
    id: 'assimilation',
    name: 'Assimilation',
    category: 'infrastructure',
    description: 'Integrate and normalize disparate data sources',
    version: '1.0.0',
    status: 'active',
    dependencies: ['data-collection'],
    capabilities: ['normalization', 'integration', 'schema-mapping']
  },
  'watcher': {
    id: 'watcher',
    name: 'Watcher',
    category: 'automation',
    description: 'Monitor system events and file changes',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['monitoring', 'event-detection', 'alerting']
  },
  'viewer': {
    id: 'viewer',
    name: 'Viewer',
    category: 'automation',
    description: 'Display and visualize data in real-time',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['visualization', 'rendering', 'real-time-display']
  },
  'listener': {
    id: 'listener',
    name: 'Listener',
    category: 'automation',
    description: 'Event listener for system-wide broadcasts',
    version: '1.0.0',
    status: 'active',
    dependencies: ['socket'],
    capabilities: ['event-handling', 'subscription', 'reactive']
  },
  'audit': {
    id: 'audit',
    name: 'Audit',
    category: 'automation',
    description: 'Track and log all system activities',
    version: '1.0.0',
    status: 'active',
    dependencies: ['chain'],
    capabilities: ['logging', 'compliance', 'history-tracking']
  },
  'voice': {
    id: 'voice',
    name: 'Voice',
    category: 'communication',
    description: 'Voice recognition and text-to-speech',
    version: '1.0.0',
    status: 'development',
    dependencies: [],
    capabilities: ['speech-to-text', 'text-to-speech', 'voice-commands']
  },
  'commands': {
    id: 'commands',
    name: 'Commands',
    category: 'communication',
    description: 'Command parser and executor',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['parsing', 'execution', 'validation']
  },
  'directions': {
    id: 'directions',
    name: 'Directions',
    category: 'communication',
    description: 'Provide step-by-step guidance and instructions',
    version: '1.0.0',
    status: 'active',
    dependencies: ['maps'],
    capabilities: ['routing', 'guidance', 'step-by-step']
  },
  'language-interpreter': {
    id: 'language-interpreter',
    name: 'Language Interpreter',
    category: 'communication',
    description: 'Multi-language translation and interpretation',
    version: '1.0.0',
    status: 'development',
    dependencies: [],
    capabilities: ['translation', 'localization', 'multi-language']
  },
  'semantics-builder': {
    id: 'semantics-builder',
    name: 'Semantics Builder',
    category: 'communication',
    description: 'Build semantic understanding from natural language',
    version: '1.0.0',
    status: 'development',
    dependencies: ['language-interpreter'],
    capabilities: ['nlp', 'semantic-analysis', 'intent-detection']
  },
  'logic': {
    id: 'logic',
    name: 'Logic',
    category: 'intelligence',
    description: 'Logical reasoning and inference engine',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['reasoning', 'inference', 'decision-making']
  },
  'reasoning': {
    id: 'reasoning',
    name: 'Reasoning',
    category: 'intelligence',
    description: 'Advanced reasoning and problem-solving',
    version: '1.0.0',
    status: 'active',
    dependencies: ['logic'],
    capabilities: ['problem-solving', 'deduction', 'analysis']
  },
  'money': {
    id: 'money',
    name: 'Money',
    category: 'economy',
    description: 'Core financial transaction system',
    version: '1.0.0',
    status: 'active',
    dependencies: ['chain', 'audit'],
    capabilities: ['transactions', 'balances', 'transfers']
  },
  'currency': {
    id: 'currency',
    name: 'Currency',
    category: 'economy',
    description: 'Multi-currency support and conversion',
    version: '1.0.0',
    status: 'active',
    dependencies: ['money'],
    capabilities: ['currency-conversion', 'exchange-rates', 'multi-currency']
  },
  'token-minter': {
    id: 'token-minter',
    name: 'Token Minter',
    category: 'economy',
    description: 'Create and manage business tokens for ecosystem',
    version: '1.0.0',
    status: 'active',
    dependencies: ['chain', 'money'],
    capabilities: ['token-creation', 'supply-management', 'distribution'],
    tokenSymbol: 'INF',
    tokenSupply: 1000000000
  },
  'banking': {
    id: 'banking',
    name: 'Banking',
    category: 'economy',
    description: 'Banking operations and account management',
    version: '1.0.0',
    status: 'active',
    dependencies: ['money', 'currency'],
    capabilities: ['accounts', 'deposits', 'withdrawals', 'loans']
  },
  'hash-generator': {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: 'security',
    description: 'Generate cryptographic hashes',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['hashing', 'encryption', 'signatures']
  },
  'hash-reader': {
    id: 'hash-reader',
    name: 'Hash Reader',
    category: 'security',
    description: 'Verify and decode cryptographic hashes',
    version: '1.0.0',
    status: 'active',
    dependencies: ['hash-generator'],
    capabilities: ['verification', 'validation', 'decoding']
  },
  'lock': {
    id: 'lock',
    name: 'Lock',
    category: 'security',
    description: 'Resource locking and synchronization',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['locking', 'mutex', 'synchronization']
  },
  'protect': {
    id: 'protect',
    name: 'Protect',
    category: 'security',
    description: 'Data encryption and protection',
    version: '1.0.0',
    status: 'active',
    dependencies: ['hash-generator'],
    capabilities: ['encryption', 'access-control', 'permissions']
  },
  'infinity-ebay': {
    id: 'infinity-ebay',
    name: 'Infinity eBay',
    category: 'integration',
    description: 'eBay-style marketplace with categories and listings',
    version: '1.0.0',
    status: 'planned',
    repository: 'infinity-ebay',
    dependencies: ['commerce', 'money'],
    capabilities: ['marketplace', 'listings', 'categories', 'bidding']
  },
  'infinity-twitter': {
    id: 'infinity-twitter',
    name: 'Infinity Twitter',
    category: 'integration',
    description: 'Twitter-style social feed and interactions',
    version: '1.0.0',
    status: 'planned',
    repository: 'infinity-twitter',
    dependencies: ['threader', 'society'],
    capabilities: ['posts', 'feed', 'following', 'trending']
  },
  'infinity-facebook': {
    id: 'infinity-facebook',
    name: 'Infinity Facebook',
    category: 'integration',
    description: 'Facebook-style social network',
    version: '1.0.0',
    status: 'planned',
    repository: 'infinity-facebook',
    dependencies: ['society', 'networking'],
    capabilities: ['profiles', 'friends', 'groups', 'timeline']
  },
  'bot-spawn': {
    id: 'bot-spawn',
    name: 'Bot Spawn',
    category: 'automation',
    description: 'Spawn bots that mimic major website functionalities',
    version: '1.0.0',
    status: 'development',
    dependencies: ['infinity-ebay', 'infinity-twitter', 'infinity-facebook'],
    capabilities: ['bot-creation', 'automation', 'mimicry']
  },
  'maps': {
    id: 'maps',
    name: 'Maps',
    category: 'navigation',
    description: 'Interactive mapping and geolocation',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['mapping', 'geolocation', 'visualization']
  },
  'architecture': {
    id: 'architecture',
    name: 'Architecture',
    category: 'design',
    description: 'System architecture planning and visualization',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['design', 'planning', 'structure']
  },
  'web-architecture': {
    id: 'web-architecture',
    name: 'Web Architecture',
    category: 'design',
    description: 'Web application architecture patterns',
    version: '1.0.0',
    status: 'active',
    dependencies: ['architecture'],
    capabilities: ['web-design', 'patterns', 'best-practices']
  },
  'commerce': {
    id: 'commerce',
    name: 'Commerce',
    category: 'society',
    description: 'E-commerce and business transactions',
    version: '1.0.0',
    status: 'active',
    dependencies: ['money'],
    capabilities: ['shopping', 'checkout', 'orders']
  },
  'society': {
    id: 'society',
    name: 'Society',
    category: 'society',
    description: 'Social structures and community management',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['community', 'social-graph', 'interactions']
  },
  'import': {
    id: 'import',
    name: 'Import',
    category: 'integration',
    description: 'Import data and modules from external sources',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['data-import', 'module-loading', 'integration']
  },
  'export': {
    id: 'export',
    name: 'Export',
    category: 'integration',
    description: 'Export data and functionality to external systems',
    version: '1.0.0',
    status: 'active',
    dependencies: [],
    capabilities: ['data-export', 'api-exposure', 'sharing']
  },
  'unifying': {
    id: 'unifying',
    name: 'Unifying',
    category: 'integration',
    description: 'Unify disparate systems into cohesive whole',
    version: '1.0.0',
    status: 'active',
    dependencies: ['import', 'export'],
    capabilities: ['integration', 'harmonization', 'bridging']
  }
}

export function getModulesByCategory(categoryId: string): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY).filter(
    module => module.category === categoryId
  )
}

export function getModuleDependencies(moduleId: string): ModuleMetadata[] {
  const module = MODULE_REGISTRY[moduleId]
  if (!module) return []
  
  return module.dependencies
    .map(depId => MODULE_REGISTRY[depId])
    .filter(Boolean)
}

export function getAllModules(): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY)
}

export function getModuleById(id: string): ModuleMetadata | undefined {
  return MODULE_REGISTRY[id]
}
