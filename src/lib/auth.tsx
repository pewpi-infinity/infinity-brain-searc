import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark'
import { toast } from 'sonner'
import { adminProtection, restoreAdminAuctions } from './adminProtection'

export interface UserSession {
  userId: string
  username: string
  email: string
  avatarUrl: string
  isOwner: boolean
  loginTime: number
  lastActive: number
  sessionId: string
}

export interface CachedAuthData {
  userId: string
  username: string
  email: string
  avatarUrl: string
  isOwner: boolean
  cachedAt: number
}

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error'

// Authentication configuration constants
const AUTH_TIMEOUT_MS = 5000 // 5 seconds timeout for authentication requests

// Troubleshooting tips for different error scenarios
const TROUBLESHOOTING_TIPS = {
  timeout: '• Check your internet speed\n• Try again in a few moments\n• Consider using a different network',
  network: '• Verify your internet connection\n• Check if GitHub is accessible\n• Try disabling VPN or proxy',
  auth: '• Ensure popups are not blocked\n• Try clearing browser cache\n• Make sure you have a GitHub account',
  general: '• Check your internet connection\n• Ensure popups are enabled\n• Try refreshing the page'
} as const

export interface UserProfile {
  userId: string
  username: string
  email: string
  avatarUrl: string
  createdAt: number
  businessTokens: Record<string, number>
  preferences: Record<string, any>
}

interface AuthContextType {
  currentUser: UserSession | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  connectionState: ConnectionState
  login: () => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  addTokens: (tokenSymbol: string, amount: number) => Promise<void>
  deductTokens: (tokenSymbol: string, amount: number) => Promise<void>
  getTokenBalance: (tokenSymbol: string) => number
  syncWallet: () => Promise<void>
  retryConnection: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useKV<UserProfile | null>(userId ? `user-profile-${userId}` : 'user-profile-temp', null)
  const [allSessions, setAllSessions] = useKV<UserSession[]>('user-sessions', [])
  const [allProfiles, setAllProfiles] = useKV<Record<string, UserProfile>>('all-user-profiles', {})
  const [cachedAuth, setCachedAuth] = useKV<CachedAuthData | null>('cached-auth-data', null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')

  const isAuthenticated = currentUser !== null

  // Network connectivity check
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false
    }
    
    try {
      // Try to fetch GitHub API to verify actual connectivity
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      await fetch('https://api.github.com', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return true
    } catch {
      return false
    }
  }

  // Check Spark API availability
  const checkSparkAvailability = async (): Promise<boolean> => {
    if (!window.spark) {
      return false
    }

    // Pre-flight check to ensure Spark API is responsive
    // Just check if the API object exists and has the expected methods
    return typeof window.spark.user === 'function' && 
           typeof window.spark.kv === 'object'
  }

  // Timeout wrapper for Spark user call
  const callSparkUserWithTimeout = async (timeoutMs: number = AUTH_TIMEOUT_MS): Promise<SparkUser> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`TIMEOUT: Authentication request timed out after ${timeoutMs / 1000} seconds`))
      }, timeoutMs)

      window.spark.user()
        .then((user) => {
          clearTimeout(timeoutId)
          resolve(user)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  const login = async () => {
    try {
      setConnectionState('connecting')
      
      // Check if Spark is loaded
      if (!window.spark) {
        setConnectionState('error')
        toast.error('Spark is not loaded yet. Please wait a moment and try again.')
        throw new Error('Spark not initialized')
      }

      // Pre-flight checks
      const isNetworkAvailable = await checkNetworkConnectivity()
      if (!isNetworkAvailable) {
        setConnectionState('error')
        toast.error('No network connection', {
          description: 'Please check your internet connection and try again.'
        })
        throw new Error('NETWORK_ERROR: No network connectivity')
      }

      const isSparkAvailable = await checkSparkAvailability()
      if (!isSparkAvailable) {
        setConnectionState('error')
        toast.error('Spark API unavailable', {
          description: 'The authentication service is not responding. Please try again later.'
        })
        throw new Error('SPARK_UNAVAILABLE: Spark API not available')
      }

      // Show loading state
      toast.info('Starting authentication...', {
        description: 'Opening GitHub OAuth window'
      })

      // Call Spark user method with improved retry logic
      let user = null
      let retryCount = 0
      const maxRetries = 5
      const baseDelay = 1000 // 1 second base delay

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      while (!user && retryCount < maxRetries) {
        try {
          const attemptedUser = await callSparkUserWithTimeout(AUTH_TIMEOUT_MS)
          
          if (attemptedUser && attemptedUser.id) {
            user = attemptedUser // Success - user is valid
          } else {
            // Invalid user data returned - this is not a retry-worthy error
            throw new Error('INVALID_RESPONSE: Invalid user data returned from authentication')
          }
        } catch (error) {
          retryCount++
          
          const errorMessage = error instanceof Error ? error.message : String(error)
          const isTimeout = errorMessage.includes('TIMEOUT')
          const isNetworkError = errorMessage.includes('NETWORK') || errorMessage.includes('fetch')
          const isAuthFailure = errorMessage.includes('INVALID_RESPONSE')
          
          // Log detailed error for debugging
          console.error(`Authentication attempt ${retryCount}/${maxRetries} failed:`, {
            error: errorMessage,
            type: isTimeout ? 'timeout' : isNetworkError ? 'network' : isAuthFailure ? 'auth' : 'unknown',
            retryCount,
            timestamp: new Date().toISOString()
          })
          
          if (retryCount < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s, 8s
            const delayMs = baseDelay * Math.pow(2, retryCount - 1)
            
            // Calculate estimated time remaining based on exponential backoff
            let estimatedTimeRemaining = 0
            for (let i = retryCount; i < maxRetries; i++) {
              estimatedTimeRemaining += baseDelay * Math.pow(2, i - 1)
            }
            const estimatedSeconds = Math.ceil(estimatedTimeRemaining / 1000)
            
            // Show specific error type in notification
            let retryMessage = 'Connection error, retrying...'
            if (isTimeout) {
              retryMessage = 'Request timed out, retrying...'
            } else if (isNetworkError) {
              retryMessage = 'Network error, retrying...'
            }
            
            toast.info(retryMessage, {
              description: `Attempt ${retryCount}/${maxRetries} - Next retry in ${delayMs / 1000}s (~${estimatedSeconds}s remaining)`
            })
            
            await delay(delayMs)
            
            // Re-check network before retrying
            if (!await checkNetworkConnectivity()) {
              throw new Error('NETWORK_ERROR: Lost network connectivity during retry')
            }
          } else {
            // All retries exhausted - provide troubleshooting tips
            let troubleshootingTips = TROUBLESHOOTING_TIPS.general
            if (isTimeout) {
              troubleshootingTips = TROUBLESHOOTING_TIPS.timeout
            } else if (isNetworkError) {
              troubleshootingTips = TROUBLESHOOTING_TIPS.network
            } else if (isAuthFailure) {
              troubleshootingTips = TROUBLESHOOTING_TIPS.auth
            }
            
            toast.error(`Authentication failed after ${maxRetries} attempts`, {
              description: troubleshootingTips,
              duration: 10000
            })
            
            throw error
          }
        }
      }
      
      if (!user || !user.id) {
        setConnectionState('error')
        toast.error('Authentication failed', {
          description: 'Could not authenticate with GitHub. Please check if popups are blocked and try again.'
        })
        throw new Error('User authentication failed after retries')
      }
      
      // Cache successful authentication data
      const authCache: CachedAuthData = {
        userId: String(user.id),
        username: user.login,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isOwner: user.isOwner,
        cachedAt: Date.now()
      }
      setCachedAuth(authCache)
      
      toast.success('Authentication successful!', {
        description: 'Loading your profile...'
      })
      
      const userIdString = String(user.id)
      setUserId(userIdString)
      
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const session: UserSession = {
        userId: userIdString,
        username: user.login,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isOwner: user.isOwner,
        loginTime: Date.now(),
        lastActive: Date.now(),
        sessionId
      }

      setCurrentUser(session)
      setConnectionState('connected')

      setAllSessions((currentSessions) => [...(currentSessions || []), session])

      let existingProfileData: UserProfile | null = null
      let allTransactions: any[] = []
      
      try {
        existingProfileData = await window.spark.kv.get<UserProfile>(`user-profile-${userIdString}`)
        allTransactions = await window.spark.kv.get<any[]>('all-transactions') || []
      } catch (error) {
        console.error('Failed to load user profile or transactions:', error)
        // Continue with defaults if KV operations fail
        allTransactions = []
      }
      
      const recalculateTokenBalances = (userId: string) => {
        const balances: Record<string, number> = { 'INF': 10 }
        
        for (const tx of allTransactions) {
          if (tx.status !== 'completed') continue
          
          if (tx.type === 'mint' && tx.from === userId && tx.to === userId) {
            balances[tx.tokenSymbol] = (balances[tx.tokenSymbol] || 0) + tx.amount
          } else if (tx.to === userId) {
            balances[tx.tokenSymbol] = (balances[tx.tokenSymbol] || 0) + tx.amount
          } else if (tx.from === userId) {
            balances[tx.tokenSymbol] = (balances[tx.tokenSymbol] || 0) - tx.amount
          }
        }
        
        return balances
      }
      
      if (!existingProfileData) {
        const calculatedBalances = recalculateTokenBalances(userIdString)
        
        const newProfile: UserProfile = {
          userId: userIdString,
          username: user.login,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: Date.now(),
          businessTokens: calculatedBalances,
          preferences: {}
        }
        setUserProfile(newProfile)
        
        setAllProfiles((currentProfiles) => ({
          ...(currentProfiles || {}),
          [userIdString]: newProfile
        }))
        
        const hasTokens = Object.keys(calculatedBalances).length > 1 || calculatedBalances['INF'] > 10
        if (hasTokens) {
          toast.success('Welcome back! Your tokens have been restored from transaction history! 🎉')
        } else {
          toast.success('Welcome! You received 10 free INF tokens to get started! 🎉')
        }
      } else {
        const calculatedBalances = recalculateTokenBalances(userIdString)
        
        const updatedProfile = {
          ...existingProfileData,
          username: user.login,
          email: user.email,
          avatarUrl: user.avatarUrl,
          businessTokens: calculatedBalances
        }
        setUserProfile(updatedProfile)
        
        setAllProfiles((currentProfiles) => ({
          ...(currentProfiles || {}),
          [userIdString]: updatedProfile
        }))
        
        toast.success(`Welcome back, ${user.login}! 👋`)
      }
    } catch (error) {
      setConnectionState('error')
      console.error('Login failed:', error)
      
      // Provide detailed error information
      let errorMessage = 'Login failed. Please try again.'
      let errorDescription = ''
      
      if (error instanceof Error) {
        if (error.message.includes('Spark not initialized')) {
          errorMessage = 'System not ready'
          errorDescription = 'Please wait a moment for the app to fully load and try again.'
        } else if (error.message.includes('TIMEOUT')) {
          errorMessage = 'Authentication timed out'
          errorDescription = 'The authentication service took too long to respond. Please check your connection and try again.'
        } else if (error.message.includes('NETWORK_ERROR')) {
          errorMessage = 'Network error'
          errorDescription = 'Unable to connect to the authentication service. Please check your internet connection.'
        } else if (error.message.includes('SPARK_UNAVAILABLE')) {
          errorMessage = 'Service unavailable'
          errorDescription = 'The authentication service is currently unavailable. Please try again later.'
        } else if (error.message.includes('authentication failed')) {
          errorMessage = 'GitHub authentication failed'
          errorDescription = 'Make sure popups are enabled and you have a GitHub account.'
        } else if (error.message.includes('popup')) {
          errorMessage = 'Popup blocked'
          errorDescription = 'Please allow popups for this site and try again.'
        } else {
          errorMessage = 'Login error'
          errorDescription = error.message
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000
      })
      
      throw error
    }
  }

  // Manual retry function for connection issues
  const retryConnection = async () => {
    toast.info('Retrying connection...', {
      description: 'Checking network and authentication service'
    })
    await login()
  }

  const logout = () => {
    if (currentUser) {
      setAllSessions((currentSessions) => 
        (currentSessions || []).filter(s => s.sessionId !== currentUser.sessionId)
      )
    }
    setCurrentUser(null)
    setConnectionState('disconnected')
    
    toast.success('Logged out successfully')
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return

    const updatedProfile = { ...userProfile, ...updates }
    setUserProfile(updatedProfile)
  }

  const addTokens = async (tokenSymbol: string, amount: number) => {
    if (!userProfile) {
      throw new Error('No user profile')
    }

    const currentBalance = userProfile.businessTokens[tokenSymbol] || 0
    const updatedProfile = {
      ...userProfile,
      businessTokens: {
        ...userProfile.businessTokens,
        [tokenSymbol]: currentBalance + amount
      }
    }
    setUserProfile(updatedProfile)
    
    setAllProfiles((currentProfiles) => ({
      ...(currentProfiles || {}),
      [userProfile.userId]: updatedProfile
    }))
  }

  const deductTokens = async (tokenSymbol: string, amount: number) => {
    if (!userProfile) {
      throw new Error('No user profile')
    }

    const currentBalance = userProfile.businessTokens[tokenSymbol] || 0
    const updatedProfile = {
      ...userProfile,
      businessTokens: {
        ...userProfile.businessTokens,
        [tokenSymbol]: Math.max(0, currentBalance - amount)
      }
    }
    setUserProfile(updatedProfile)
    
    setAllProfiles((currentProfiles) => ({
      ...(currentProfiles || {}),
      [userProfile.userId]: updatedProfile
    }))
  }

  const getTokenBalance = (tokenSymbol: string): number => {
    if (!userProfile) return 0
    return userProfile.businessTokens[tokenSymbol] || 0
  }

  const syncWallet = async () => {
    if (!currentUser || !userProfile) {
      throw new Error('User must be logged in to sync wallet')
    }

    if (!adminProtection.canSyncWallet(currentUser.userId, currentUser.username)) {
      toast.error('Wallet sync is restricted to admin only. Your tokens are protected! 🔒')
      return
    }

    try {
      toast.info('Syncing wallet from Infinity repos...', {
        description: 'Checking all Infinity ecosystem repos for your tokens'
      })

      const currentBalances = { ...userProfile.businessTokens }
      
      const repoTokens: Record<string, number> = {}
      const reposToCheck = [
        'infinity-brain-111',
        'pewpi-infinity',
        'buotuner',
        'Osprey-Terminal'
      ]

      for (const repo of reposToCheck) {
        try {
          const repoKey = `repo-${repo}-tokens-${currentUser.username}`
          const tokens = await window.spark.kv.get<Record<string, number>>(repoKey)
          
          if (tokens) {
            for (const [symbol, amount] of Object.entries(tokens)) {
              repoTokens[symbol] = (repoTokens[symbol] || 0) + amount
            }
          }
        } catch (error) {
          console.log(`No tokens found in ${repo}`)
        }
      }

      for (const [symbol, amount] of Object.entries(repoTokens)) {
        const currentAmount = currentBalances[symbol] || 0
        if (amount > currentAmount) {
          currentBalances[symbol] = amount
        }
      }
      
      const updatedProfile = {
        ...userProfile,
        businessTokens: currentBalances
      }
      
      setUserProfile(updatedProfile)
      
      setAllProfiles((currentProfiles) => ({
        ...(currentProfiles || {}),
        [currentUser.userId]: updatedProfile
      }))

      await restoreAdminAuctions()
      
      const addedTokens = Object.entries(repoTokens)
        .filter(([symbol, amount]) => amount > (userProfile.businessTokens[symbol] || 0))
        .map(([symbol, amount]) => `+${amount - (userProfile.businessTokens[symbol] || 0)} ${symbol}`)
        .join(', ')
      
      if (addedTokens) {
        toast.success('Wallet synced from repos! ✨', {
          description: `Added: ${addedTokens}`
        })
      } else {
        toast.success('Wallet synced! All tokens up to date. ✨', {
          description: 'No new tokens found in Infinity repos'
        })
      }
    } catch (error) {
      console.error('Wallet sync failed:', error)
      toast.error('Failed to sync wallet. Please try again.')
      throw error
    }
  }

  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        setCurrentUser(prev => {
          if (!prev) return null
          return { ...prev, lastActive: Date.now() }
        })

        setAllSessions((currentSessions) =>
          (currentSessions || []).map(s =>
            s.sessionId === currentUser.sessionId
              ? { ...s, lastActive: Date.now() }
              : s
          )
        )
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [currentUser, setAllSessions])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile: userProfile ?? null,
        isAuthenticated,
        connectionState,
        login,
        logout,
        updateProfile,
        addTokens,
        deductTokens,
        getTokenBalance,
        syncWallet,
        retryConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
