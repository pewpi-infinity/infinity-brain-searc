import { toast } from 'sonner'
// Note: storage abstraction is kept for non-auth data
import { storage } from './storage'

export interface SlideCoin {
  id: string
  type: 'tap' | 'slide' | 'scroll' | 'click'
  timestamp: number
  duration: number
  snapshot: {
    url: string
    screenshot?: string
    domState?: string
    coordinates: { x: number; y: number }
  }
  token: {
    symbol: string
    value: number
    mintedAt: number
  }
  research: {
    context: string
    relatedTokens: string[]
    tags: string[]
  }
  quantum: {
    vectorEmbedding: number[]
    semanticMeaning: string
    userIntent: string
    matchingScore: number
  }
  owner: string
  walletBackup: string
  videoClipUrl?: string
}

let isRecording = false
let interactionCount = 0

export const initializeSlideCoinSystem = () => {
  if (isRecording) return
  
  isRecording = true
  
  window.addEventListener('click', handleInteraction)
  window.addEventListener('touchstart', handleInteraction)
  
  const throttledScroll = throttle(() => {
    handleInteraction(new Event('scroll'))
  }, 3000)
  
  window.addEventListener('scroll', throttledScroll)
  
  console.log('💫 Slide Coin system initialized - every tap creates value!')
}

const handleInteraction = async (event: Event) => {
  interactionCount++
  
  if (interactionCount % 5 !== 0) return
  
  try {
    const slideCoin = await createSlideCoin(event)
    if (slideCoin) {
      await saveToWallet(slideCoin)
    }
  } catch (error) {
    console.error('Failed to create slide coin:', error)
  }
}

export const createSlideCoin = async (event: Event): Promise<SlideCoin | null> => {
  try {
    // Get user from Spark API
    if (!window.spark) return null
    
    const user = await window.spark.user()
    if (!user) return null
    
    const timestamp = Date.now()
    const mouseEvent = event as MouseEvent
    
    const context = extractPageContext()
    const tokenValue = calculateContextValue()
    
    const slideCoin: SlideCoin = {
      id: `SLIDE-${timestamp}-${generateHash()}`,
      type: getEventType(event.type),
      timestamp,
      duration: 30,
      snapshot: {
        url: window.location.href,
        screenshot: await captureScreenshot(),
        coordinates: {
          x: mouseEvent.clientX || 0,
          y: mouseEvent.clientY || 0
        }
      },
      token: {
        symbol: `SLIDE-${timestamp}`,
        value: tokenValue,
        mintedAt: timestamp
      },
      research: {
        context,
        relatedTokens: [],
        tags: generateTags(context)
      },
      quantum: {
        vectorEmbedding: generateSimpleEmbedding(context),
        semanticMeaning: `User interacted with ${context}`,
        userIntent: predictIntent(context),
        matchingScore: Math.random() * 0.8 + 0.2
      },
      owner: user.login,
      walletBackup: `backup-${timestamp}`
    }
    
    return slideCoin
  } catch (error) {
    console.error('Error creating slide coin:', error)
    return null
  }
}

const saveToWallet = async (slideCoin: SlideCoin) => {
  try {
    await storage.set(`slide-${slideCoin.id}`, slideCoin)
    
    const walletKey = `wallet-${slideCoin.owner}`
    const wallet = await storage.get<any>(walletKey) || { balance: 0, slideCoins: [] }
    
    wallet.balance = (wallet.balance || 0) + slideCoin.token.value
    wallet.slideCoins = wallet.slideCoins || []
    wallet.slideCoins.push(slideCoin.id)
    
    await storage.set(walletKey, wallet)
    
    const allSlides = await storage.get<string[]>('all-slide-coins') || []
    allSlides.push(slideCoin.id)
    await storage.set('all-slide-coins', allSlides)
    
    if (Math.random() > 0.7) {
      toast.success(`💫 Slide Coin Created!`, {
        description: `+${slideCoin.token.value} INF - Memory saved forever`
      })
    }
  } catch (error) {
    console.error('Failed to save slide coin:', error)
  }
}

const extractPageContext = (): string => {
  const title = document.title
  const url = window.location.href
  const activeElement = document.activeElement?.tagName || 'BODY'
  
  return `${title} at ${url} (${activeElement})`
}

const calculateContextValue = (): number => {
  const baseValue = 10
  const timeBonus = Math.min(getTimeOnPage() / 1000, 50)
  const engagementBonus = Math.random() * 40
  
  return Math.floor(baseValue + timeBonus + engagementBonus)
}

let pageLoadTime = Date.now()
const getTimeOnPage = (): number => {
  return Date.now() - pageLoadTime
}

const captureScreenshot = async (): Promise<string> => {
  return 'data:image/png;base64,placeholder'
}

const generateTags = (context: string): string[] => {
  const words = context.toLowerCase().split(/\W+/)
  return words.filter(w => w.length > 4).slice(0, 5)
}

const generateSimpleEmbedding = (text: string): number[] => {
  const embedding: number[] = []
  for (let i = 0; i < 128; i++) {
    embedding.push(Math.random() * 2 - 1)
  }
  return embedding
}

const predictIntent = (context: string): string => {
  if (context.includes('token') || context.includes('mint')) return 'creating-value'
  if (context.includes('wallet') || context.includes('balance')) return 'checking-balance'
  if (context.includes('social') || context.includes('security')) return 'seeking-benefits'
  return 'exploring'
}

const getEventType = (type: string): 'tap' | 'slide' | 'scroll' | 'click' => {
  if (type === 'touchstart') return 'tap'
  if (type === 'scroll') return 'scroll'
  if (type === 'mousemove') return 'slide'
  return 'click'
}

const generateHash = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

function throttle(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  return (...args: any[]) => {
    if (!timeout) {
      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    }
  }
}

export const getUserSlideCoins = async (username: string): Promise<SlideCoin[]> => {
  try {
    const wallet = await storage.get<any>(`wallet-${username}`)
    if (!wallet || !wallet.slideCoins) return []
    
    const slideCoins: SlideCoin[] = []
    for (const id of wallet.slideCoins) {
      const coin = await storage.get<SlideCoin>(`slide-${id}`)
      if (coin) slideCoins.push(coin)
    }
    
    return slideCoins.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to get slide coins:', error)
    return []
  }
}

export const getTotalSlideValue = async (username: string): Promise<number> => {
  const coins = await getUserSlideCoins(username)
  return coins.reduce((sum, coin) => sum + coin.token.value, 0)
}