import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLocalStorage, localStorageUtils } from '@/hooks/useLocalStorage'
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

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(userId ? `user-profile-${userId}` : 'user-profile-temp', null)
  const [allSessions, setAllSessions] = useLocalStorage<UserSession[]>('user-sessions', [])
  const [allProfiles, setAllProfiles] = useLocalStorage<Record<string, UserProfile>>('all-user-profiles', {})
  const [cachedAuth, setCachedAuth] = useLocalStorage<CachedAuthData | null>('cached-auth-data', null)
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

  const login = async () => {
    try {
      setConnectionState('connecting')
      
      // Check network connectivity
      const isNetworkAvailable = await checkNetworkConnectivity()
      if (!isNetworkAvailable) {
        setConnectionState('error')
        toast.error('No network connection', {
          description: 'Please check your internet connection and try again.'
        })
        throw new Error('NETWORK_ERROR: No network connectivity')
      }

      // Simple localStorage-based authentication
      // In a real app, this would use GitHub OAuth or similar
      toast.info('Starting authentication...', {
        description: 'Using local authentication'
      })

      // Check if we have cached auth data
      let user = cachedAuth
      
      if (!user) {
        // Create a demo user for first-time users
        // In production, this would redirect to GitHub OAuth
        const demoUserId = `user-${Date.now()}`
        const demoUsername = 'demo-user'
        
        user = {
          userId: demoUserId,
          username: demoUsername,
          email: `${demoUsername}@example.com`,
          avatarUrl: `https://avatars.githubusercontent.com/u/${Date.now() % 1000000}`,
          isOwner: false,
          cachedAt: Date.now()
        }
        
        // Cache the demo user
        setCachedAuth(user)
      }
      
      toast.success('Authentication successful!', {
        description: 'Loading your profile...'
      })
      
      const userIdString = user.userId
      setUserId(userIdString)
      
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const session: UserSession = {
        userId: userIdString,
        username: user.username,
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

      const existingProfileData = localStorageUtils.get<UserProfile>(`user-profile-${userIdString}`, null)
      const allTransactions = localStorageUtils.get<any[]>('all-transactions', [])
      
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
          username: user.username,
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
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          businessTokens: calculatedBalances
        }
        setUserProfile(updatedProfile)
        
        setAllProfiles((currentProfiles) => ({
          ...(currentProfiles || {}),
          [userIdString]: updatedProfile
        }))
        
        toast.success(`Welcome back, ${user.username}! 👋`)
      }
    } catch (error) {
      setConnectionState('error')
      console.error('Login failed:', error)
      
      // Provide detailed error information
      let errorMessage = 'Login failed. Please try again.'
      let errorDescription = ''
      
      if (error instanceof Error) {
        if (error.message.includes('NETWORK_ERROR')) {
          errorMessage = 'Network error'
          errorDescription = 'Unable to connect to the authentication service. Please check your internet connection.'
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
          const tokens = localStorageUtils.get<Record<string, number>>(repoKey, {})
          
          if (tokens && Object.keys(tokens).length > 0) {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // No need to wait for Spark anymore - we use localStorage
  return <AuthProviderInner>{children}</AuthProviderInner>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
