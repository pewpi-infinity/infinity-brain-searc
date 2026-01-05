/**
 * Visual Editor - Core logic for manipulating page elements
 */

export interface ElementChange {
  selector: string
  property: string
  oldValue: string
  newValue: string
  timestamp: number
}

export interface EditorState {
  history: ElementChange[]
  currentIndex: number
  maxHistory: number
}

// Global editor state
let editorState: EditorState = {
  history: [],
  currentIndex: -1,
  maxHistory: 50
}

/**
 * Apply CSS changes to elements
 */
export function applyStyles(
  selector: string,
  styles: Record<string, string>
): boolean {
  try {
    const elements = document.querySelectorAll(selector)

    if (elements.length === 0) {
      console.warn(`No elements found for selector: ${selector}`)
      return false
    }

    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        Object.entries(styles).forEach(([property, value]) => {
          // Store old value for undo
          const oldValue = element.style.getPropertyValue(property)

          // Apply new value
          element.style.setProperty(property, value)

          // Record change in history
          recordChange({
            selector,
            property,
            oldValue,
            newValue: value,
            timestamp: Date.now()
          })
        })
      }
    })

    return true
  } catch (error) {
    console.error('Failed to apply styles:', error)
    return false
  }
}

/**
 * Move element to specific position
 */
export function moveElement(
  selector: string,
  position: { top?: string; left?: string; right?: string; bottom?: string }
): boolean {
  const styles: Record<string, string> = {
    position: 'absolute',
    ...position
  }

  return applyStyles(selector, styles)
}

/**
 * Resize element
 */
export function resizeElement(
  selector: string,
  size: { width?: string; height?: string }
): boolean {
  return applyStyles(selector, size)
}

/**
 * Change element color
 */
export function recolorElement(
  selector: string,
  colors: { color?: string; background?: string; borderColor?: string }
): boolean {
  const styles: Record<string, string> = {}

  if (colors.color) styles.color = colors.color
  if (colors.background) styles.background = colors.background
  if (colors.borderColor) styles.borderColor = colors.borderColor

  return applyStyles(selector, styles)
}

/**
 * Remove element
 */
export function removeElement(selector: string): boolean {
  try {
    const elements = document.querySelectorAll(selector)

    if (elements.length === 0) {
      return false
    }

    elements.forEach(element => {
      // Store reference for undo
      const parent = element.parentNode
      const nextSibling = element.nextSibling

      if (parent) {
        const nextSiblingSelector = 
          nextSibling instanceof Element
            ? getUniqueSelector(nextSibling)
            : null

        recordChange({
          selector,
          property: '__removed__',
          oldValue: JSON.stringify({
            html: element.outerHTML,
            parentSelector: getUniqueSelector(parent as Element),
            nextSiblingSelector
          }),
          newValue: '',
          timestamp: Date.now()
        })

        parent.removeChild(element)
      }
    })

    return true
  } catch (error) {
    console.error('Failed to remove element:', error)
    return false
  }
}

/**
 * Add new element
 */
export function addElement(
  parentSelector: string,
  html: string,
  position: 'append' | 'prepend' | 'before' | 'after' = 'append'
): boolean {
  try {
    const parent = document.querySelector(parentSelector)

    if (!parent) {
      return false
    }

    const temp = document.createElement('div')
    temp.innerHTML = html
    const newElement = temp.firstElementChild

    if (!newElement) {
      return false
    }

    switch (position) {
      case 'append':
        parent.appendChild(newElement)
        break
      case 'prepend':
        parent.insertBefore(newElement, parent.firstChild)
        break
      case 'before':
        parent.parentNode?.insertBefore(newElement, parent)
        break
      case 'after':
        parent.parentNode?.insertBefore(newElement, parent.nextSibling)
        break
    }

    recordChange({
      selector: getUniqueSelector(newElement),
      property: '__added__',
      oldValue: '',
      newValue: html,
      timestamp: Date.now()
    })

    return true
  } catch (error) {
    console.error('Failed to add element:', error)
    return false
  }
}

/**
 * Record change in history
 */
function recordChange(change: ElementChange): void {
  // Remove any changes after current index (for redo)
  editorState.history = editorState.history.slice(
    0,
    editorState.currentIndex + 1
  )

  // Add new change
  editorState.history.push(change)

  // Maintain max history
  if (editorState.history.length > editorState.maxHistory) {
    editorState.history.shift()
  } else {
    editorState.currentIndex++
  }
}

/**
 * Undo last change
 */
export function undo(): boolean {
  if (editorState.currentIndex < 0) {
    return false
  }

  const change = editorState.history[editorState.currentIndex]

  try {
    if (change.property === '__removed__') {
      // Restore removed element
      const data = JSON.parse(change.oldValue)
      const parent = document.querySelector(data.parentSelector)

      if (parent) {
        const temp = document.createElement('div')
        temp.innerHTML = data.html
        const element = temp.firstElementChild

        if (element) {
          if (data.nextSiblingSelector) {
            const nextSibling = document.querySelector(data.nextSiblingSelector)
            parent.insertBefore(element, nextSibling)
          } else {
            parent.appendChild(element)
          }
        }
      }
    } else if (change.property === '__added__') {
      // Remove added element
      const element = document.querySelector(change.selector)
      element?.parentNode?.removeChild(element)
    } else {
      // Revert style change
      const elements = document.querySelectorAll(change.selector)
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty(change.property, change.oldValue)
        }
      })
    }

    editorState.currentIndex--
    return true
  } catch (error) {
    console.error('Undo failed:', error)
    return false
  }
}

/**
 * Redo last undone change
 */
export function redo(): boolean {
  if (editorState.currentIndex >= editorState.history.length - 1) {
    return false
  }

  editorState.currentIndex++
  const change = editorState.history[editorState.currentIndex]

  try {
    if (change.property === '__added__') {
      // Re-add element - simplified to avoid complex selector parsing
      console.warn('Redo for added elements not fully implemented')
      return false
    } else if (change.property === '__removed__') {
      // Re-remove element
      const element = document.querySelector(change.selector)
      element?.parentNode?.removeChild(element)
    } else {
      // Re-apply style change
      const elements = document.querySelectorAll(change.selector)
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.setProperty(change.property, change.newValue)
        }
      })
    }

    return true
  } catch (error) {
    console.error('Redo failed:', error)
    return false
  }
}

/**
 * Get unique CSS selector for element
 */
function getUniqueSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`
  }

  if (element.className) {
    const classes = Array.from(element.classList).join('.')
    return `.${classes}`
  }

  // Use tag name and nth-child
  const parent = element.parentElement
  if (parent) {
    const index = Array.from(parent.children).indexOf(element) + 1
    return `${getUniqueSelector(parent)} > ${element.tagName.toLowerCase()}:nth-child(${index})`
  }

  return element.tagName.toLowerCase()
}

/**
 * Highlight element for visual feedback
 */
export function highlightElement(selector: string, duration: number = 2000): void {
  const elements = document.querySelectorAll(selector)

  elements.forEach(element => {
    if (element instanceof HTMLElement) {
      const originalOutline = element.style.outline
      const originalTransition = element.style.transition

      element.style.transition = 'outline 0.3s ease'
      element.style.outline = '3px solid #3b82f6'

      setTimeout(() => {
        element.style.outline = originalOutline
        setTimeout(() => {
          element.style.transition = originalTransition
        }, 300)
      }, duration)
    }
  })
}

/**
 * Get editor state for debugging
 */
export function getEditorState(): EditorState {
  return { ...editorState }
}

/**
 * Reset editor state
 */
export function resetEditorState(): void {
  editorState = {
    history: [],
    currentIndex: -1,
    maxHistory: 50
  }
}

/**
 * Export changes as CSS
 */
export function exportChangesAsCSS(): string {
  const cssMap = new Map<string, Record<string, string>>()

  editorState.history.forEach(change => {
    if (!change.property.startsWith('__')) {
      if (!cssMap.has(change.selector)) {
        cssMap.set(change.selector, {})
      }
      cssMap.get(change.selector)![change.property] = change.newValue
    }
  })

  let css = '/* Generated by Infinity Brain Visual Editor */\n\n'

  cssMap.forEach((styles, selector) => {
    css += `${selector} {\n`
    Object.entries(styles).forEach(([prop, value]) => {
      css += `  ${prop}: ${value};\n`
    })
    css += '}\n\n'
  })

  return css
}
