/**
 * Command Parser - Parses natural language commands for visual editing
 */

export interface ParsedCommand {
  type: 'move' | 'style' | 'resize' | 'recolor' | 'remove' | 'add'
  target: string // CSS selector
  changes: Record<string, any>
  description: string
  confidence: number
}

export interface CommandParseResult {
  success: boolean
  command?: ParsedCommand
  error?: string
}

/**
 * Parse natural language command into structured action
 */
export async function parseCommand(input: string): Promise<CommandParseResult> {
  try {
    if (!window.spark) {
      throw new Error('AI not available')
    }

    const prompt = `Parse this visual editing command into a structured action:
"${input}"

Analyze the intent and return JSON with this structure:
{
  "type": "move" | "style" | "resize" | "recolor" | "remove" | "add",
  "target": "CSS selector for the target element",
  "changes": { "css-property": "value", ... },
  "description": "Human-readable description of what will happen",
  "confidence": 0-1 confidence score
}

Examples:
Input: "move login button to top right"
Output: {"type":"move","target":".login-button","changes":{"position":"absolute","top":"20px","right":"20px"},"description":"Move login button to top-right corner","confidence":0.95}

Input: "make background darker"
Output: {"type":"style","target":"body","changes":{"background":"#1a1a1a"},"description":"Darken the background color","confidence":0.9}

Now parse: "${input}"`

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const parsed = JSON.parse(response)

    // Validate parsed command
    if (!isValidParsedCommand(parsed)) {
      throw new Error('Invalid command structure')
    }

    return {
      success: true,
      command: parsed
    }
  } catch (error) {
    console.error('Command parse error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse command'
    }
  }
}

/**
 * Validate parsed command structure
 */
function isValidParsedCommand(obj: any): obj is ParsedCommand {
  return (
    obj &&
    typeof obj === 'object' &&
    ['move', 'style', 'resize', 'recolor', 'remove', 'add'].includes(obj.type) &&
    typeof obj.target === 'string' &&
    typeof obj.changes === 'object' &&
    typeof obj.description === 'string' &&
    typeof obj.confidence === 'number'
  )
}

/**
 * Get command suggestions based on context
 */
export async function getCommandSuggestions(context: string): Promise<string[]> {
  try {
    if (!window.spark) {
      return getDefaultSuggestions()
    }

    const prompt = `Given this context: "${context}"
    
Suggest 5 natural language commands for visual editing that would make sense.
Return as JSON array of strings.

Example suggestions:
- "Move the header to the top"
- "Make the buttons bigger"
- "Change background to blue"
- "Center all headings"
- "Add padding to the sidebar"`

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
    const suggestions = JSON.parse(response)

    if (Array.isArray(suggestions)) {
      return suggestions
    }

    return getDefaultSuggestions()
  } catch (error) {
    console.error('Failed to get suggestions:', error)
    return getDefaultSuggestions()
  }
}

/**
 * Get default command suggestions
 */
function getDefaultSuggestions(): string[] {
  return [
    'Move the login button to the top right',
    'Make the background darker',
    'Center all headings',
    'Add a contact form below the hero',
    'Increase font size of paragraphs',
    'Change primary color to blue',
    'Add rounded corners to all cards',
    'Make the navbar sticky'
  ]
}

/**
 * Generate CSS selector for natural language target
 */
export async function generateSelector(naturalTarget: string): Promise<string> {
  try {
    if (!window.spark) {
      throw new Error('AI not available')
    }

    const prompt = `Convert this natural language target to a CSS selector:
"${naturalTarget}"

Examples:
"login button" -> ".login-button" or "button.login" or "#login"
"main heading" -> "h1" or ".main-heading"
"navigation bar" -> "nav" or ".navbar"
"all cards" -> ".card"

Return only the CSS selector, nothing else.`

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', false)
    return response.trim()
  } catch (error) {
    console.error('Selector generation failed:', error)
    // Fallback to simple class name
    return `.${naturalTarget.toLowerCase().replace(/\s+/g, '-')}`
  }
}

/**
 * Validate if a command is safe to execute
 */
export function isSafeCommand(command: ParsedCommand): boolean {
  // Check for potentially dangerous operations
  const dangerousProps = ['display: none', 'visibility: hidden', 'opacity: 0']
  const changeString = JSON.stringify(command.changes).toLowerCase()

  // Don't allow hiding critical elements
  if (command.type === 'remove') {
    const criticalSelectors = ['body', 'html', 'head']
    if (criticalSelectors.some(sel => command.target.includes(sel))) {
      return false
    }
  }

  // Check confidence threshold
  if (command.confidence < 0.5) {
    return false
  }

  return true
}

/**
 * Preview command without executing
 */
export function previewCommand(command: ParsedCommand): string {
  let preview = `🎯 Target: ${command.target}\n`
  preview += `✨ Action: ${command.description}\n`
  preview += `📝 Changes:\n`

  Object.entries(command.changes).forEach(([prop, value]) => {
    preview += `  - ${prop}: ${value}\n`
  })

  preview += `\n✓ Confidence: ${(command.confidence * 100).toFixed(0)}%`

  return preview
}
