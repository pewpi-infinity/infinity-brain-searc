import { useEffect } from 'react'

export function ContinuousPageMonitor() {
  useEffect(() => {
    const fixTextOverflow = () => {
      const elements = document.querySelectorAll('*')
      elements.forEach((el) => {
        const element = el as HTMLElement
        if (element.scrollWidth > element.clientWidth) {
          element.style.overflow = 'hidden'
          element.style.textOverflow = 'ellipsis'
          element.style.whiteSpace = 'nowrap'
        }
      })
    }

    const fixAlignment = () => {
      const flexContainers = document.querySelectorAll('[class*="flex"]')
      flexContainers.forEach((container) => {
        const el = container as HTMLElement
        const children = Array.from(el.children) as HTMLElement[]
        
        children.forEach((child) => {
          if (child.offsetTop === children[0]?.offsetTop) {
            child.style.alignSelf = 'center'
          }
        })
      })
    }

    const fixOverlappingText = () => {
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
      textElements.forEach((el) => {
        const element = el as HTMLElement
        const rect = element.getBoundingClientRect()
        
        textElements.forEach((other) => {
          if (el === other) return
          const otherEl = other as HTMLElement
          const otherRect = otherEl.getBoundingClientRect()
          
          if (
            rect.left < otherRect.right &&
            rect.right > otherRect.left &&
            rect.top < otherRect.bottom &&
            rect.bottom > otherRect.top
          ) {
            element.style.position = 'relative'
            element.style.zIndex = '1'
          }
        })
      })
    }

    const fixBrokenButtons = () => {
      const buttons = document.querySelectorAll('button, a[role="button"]')
      buttons.forEach((button) => {
        const el = button as HTMLElement
        if (el.offsetWidth === 0 || el.offsetHeight === 0) {
          el.style.display = 'inline-flex'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          el.style.minWidth = '2rem'
          el.style.minHeight = '2rem'
        }
      })
    }

    const fixSpacing = () => {
      const sections = document.querySelectorAll('section, [class*="space-y"]')
      sections.forEach((section) => {
        const el = section as HTMLElement
        const children = Array.from(el.children) as HTMLElement[]
        
        children.forEach((child, index) => {
          if (index > 0) {
            const previousChild = children[index - 1]
            const gap = child.offsetTop - (previousChild.offsetTop + previousChild.offsetHeight)
            
            if (gap < 8) {
              child.style.marginTop = '1rem'
            }
          }
        })
      })
    }

    const runFullScan = () => {
      fixTextOverflow()
      fixAlignment()
      fixOverlappingText()
      fixBrokenButtons()
      fixSpacing()
    }

    runFullScan()

    const intervalId = setInterval(runFullScan, 5000)

    return () => clearInterval(intervalId)
  }, [])

  return null
}
