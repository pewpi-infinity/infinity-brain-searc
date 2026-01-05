/**
 * Brain Connector - Connects to mongoose.os brain backend
 * Coordinates AI features across the ecosystem
 */

export interface BrainConfig {
  mongooseUrl?: string
  isConnected: boolean
  capabilities: string[]
  lastSync: string | null
}

export interface BrainCommand {
  type: 'llm' | 'visual-edit' | 'sync' | 'analyze'
  payload: any
  timestamp: number
}

export interface BrainResponse {
  success: boolean
  data?: any
  error?: string
}

/**
 * Initialize connection to mongoose.os brain
 */
export async function initializeBrain(): Promise<BrainConfig> {
  try {
    // In a real implementation, this would connect to the mongoose.os backend
    // For now, we'll use Spark's LLM capabilities as the brain
    
    const config: BrainConfig = {
      mongooseUrl: undefined, // Would be configured by user
      isConnected: typeof window !== 'undefined' && window.spark !== undefined,
      capabilities: [
        'gpt-4o',
        'gpt-4o-mini',
        'claude-3-5-sonnet-20241022',
        'gemini-2.0-flash-exp'
      ],
      lastSync: new Date().toISOString()
    }

    return config
  } catch (error) {
    console.error('Failed to initialize brain:', error)
    return {
      isConnected: false,
      capabilities: [],
      lastSync: null
    }
  }
}

/**
 * Send command to brain for processing
 */
export async function sendBrainCommand(command: BrainCommand): Promise<BrainResponse> {
  try {
    if (!window.spark) {
      throw new Error('Spark/Brain not available')
    }

    // Route to appropriate brain function
    switch (command.type) {
      case 'llm':
        return await processLLMCommand(command)
      case 'visual-edit':
        return await processVisualEditCommand(command)
      case 'sync':
        return await processSyncCommand(command)
      case 'analyze':
        return await processAnalyzeCommand(command)
      default:
        throw new Error(`Unknown command type: ${command.type}`)
    }
  } catch (error) {
    console.error('Brain command failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Process LLM command through brain
 */
async function processLLMCommand(command: BrainCommand): Promise<BrainResponse> {
  const { prompt, model = 'gpt-4o-mini', json = false } = command.payload
  
  try {
    const response = await window.spark.llm(prompt, model, json)
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'LLM request failed'
    }
  }
}

/**
 * Process visual edit command
 */
async function processVisualEditCommand(command: BrainCommand): Promise<BrainResponse> {
  const { action, target, changes } = command.payload
  
  // Use AI to generate CSS changes
  const prompt = `Generate CSS changes for the following action:
Action: ${action}
Target: ${target}
Desired changes: ${JSON.stringify(changes)}

Return a JSON object with the CSS properties to apply.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const cssChanges = JSON.parse(response)
    
    return {
      success: true,
      data: cssChanges
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to generate visual changes'
    }
  }
}

/**
 * Sync data across brain-connected repos
 */
async function processSyncCommand(command: BrainCommand): Promise<BrainResponse> {
  // In a real implementation, this would sync with mongoose.os
  return {
    success: true,
    data: {
      synced: true,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Analyze command with brain
 */
async function processAnalyzeCommand(command: BrainCommand): Promise<BrainResponse> {
  const { content, type } = command.payload
  
  const prompt = `Analyze the following ${type}:
${content}

Provide insights and recommendations.`

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', false)
    
    return {
      success: true,
      data: response
    }
  } catch (error) {
    return {
      success: false,
      error: 'Analysis failed'
    }
  }
}

/**
 * Check brain connection status
 */
export function getBrainStatus(): { connected: boolean; message: string } {
  const isConnected = typeof window !== 'undefined' && window.spark !== undefined
  
  return {
    connected: isConnected,
    message: isConnected
      ? '🧠 Brain connected and ready'
      : '⚠️ Brain not available - some features may be limited'
  }
}

/**
 * Get available LLM models from brain
 */
export function getAvailableModels(): string[] {
  return [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-5-sonnet-20241022',
    'gemini-2.0-flash-exp'
  ]
}

/**
 * Route to specific LLM endpoint
 */
export async function routeToLLM(
  endpoint: 'gpt' | 'claude' | 'gemini',
  prompt: string
): Promise<string> {
  const modelMap = {
    gpt: 'gpt-4o-mini',
    claude: 'claude-3-5-sonnet-20241022',
    gemini: 'gemini-2.0-flash-exp'
  }

  const model = modelMap[endpoint]
  
  try {
    return await window.spark.llm(prompt, model, false)
  } catch (error) {
    throw new Error(`Failed to route to ${endpoint}: ${error}`)
  }
}
