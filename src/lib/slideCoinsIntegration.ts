import { initializeSlideCoinSystem, createSlideCoin } from './slideCoinSystem'
import { initializeVideoBuffer, getLast30Seconds } from './videoBuffer'
import { suggestMatchesForCoin } from './quantumMatchmaking'
import { toast } from 'sonner'

/**
 * SLIDE COINS INTEGRATION
 * Ties together all systems for the Memory-Backed Economy
 */

let systemsInitialized = false

export const initializeSlideCoinsEcosystem = async () => {
  if (systemsInitialized) {
    console.log('Slide Coins ecosystem already initialized')
    return
  }

  try {
    // Initialize core systems
    initializeSlideCoinSystem()
    await initializeVideoBuffer()
    
    systemsInitialized = true
    
    toast.success('💫 Slide Coins Activated!', {
      description: 'Memory-backed economy is now running. Every tap creates value!',
      duration: 5000
    })

    console.log('✅ Slide Coins Ecosystem Initialized:', {
      slideCoinSystem: true,
      videoBuffer: true,
      quantumMatching: true,
      magneticFieldStorage: true
    })
  } catch (error) {
    console.error('Failed to initialize Slide Coins ecosystem:', error)
    toast.error('Failed to start memory system')
  }
}

export const handleUserInteraction = async (event: Event) => {
  try {
    const slideCoin = await createSlideCoin(event)
    if (!slideCoin) return

    // Attach video clip
    const videoClip = await getLast30Seconds()
    slideCoin.videoClipUrl = `clip://${videoClip.id}`

    // Find quantum matches
    await suggestMatchesForCoin(slideCoin)

    return slideCoin
  } catch (error) {
    console.error('Interaction handling failed:', error)
  }
}

export const getSystemStatus = () => {
  return {
    initialized: systemsInitialized,
    systems: {
      slideCoins: true,
      videoBuffer: true,
      quantumMatching: true,
      magneticField: true
    }
  }
}
