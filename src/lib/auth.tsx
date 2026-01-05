import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { 
  initiateDeviceFlow, 
  completeDeviceFlow, 
  getGitHubAuthState, 
  signOutGitHub,
  type GitHubUser,
  type DeviceCodeResponse 
} from './github-oauth'

export interface UserSession {
  userId: string
  username: string
  email: string
  avatarUrl: string
  loginTime: number
  lastActive: number
  sessionId: string
}

export interface UserProfile {
  userId: string
  username: string
  email: string
  avatarUrl: string
  createdAt: number
  businessTokens: Record<string, number>
  preferences: Record<string, any>
}

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error' | 'guest'
export type AuthMethod = 'github' | 'guest'

interface AuthContextType {
  currentUser: UserSession | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  isGuest: boolean
  authMethod: AuthMethod
  connectionState: ConnectionState
  deviceCode: DeviceCodeResponse | null
  login: () => Promise<void>
  continueAsGuest: () => void
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  addTokens: (tokenSymbol: string, amount: number) => Promise<void>
  deductTokens: (tokenSymbol: string, amount: number) => Promise<void>
  getTokenBalance: (tokenSymbol: string) => number
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('guest')
  const [isGuest, setIsGuest] = useState(true)
  const [deviceCode, setDeviceCode] = useState<DeviceCodeResponse | null>(null)

  const isAuthenticated = currentUser !== null

  // Check for existing authentication on mount
  useEffect(() => {
    const authState = getGitHubAuthState()
    if (authState.isAuthenticated && authState.user) {
      const user = authState.user
      const session: UserSession = {
        userId: String(user.id),
        username: user.login,
        email: user.email || '',
        avatarUrl: user.avatar_url,
        loginTime: Date.now(),
        lastActive: Date.now(),
        sessionId: `session-${Date.now()}`
      }
      
      setCurrentUser(session)
      setConnectionState('connected')
      setAuthMethod('github')
      setIsGuest(false)
      
      // Load or create user profile
      const storedProfiles = localStorage.getItem('user-profiles')
      let profiles: Record<string, UserProfile> = {}
      
      if (storedProfiles) {
        try {
          profiles = JSON.parse(storedProfiles)
        } catch {
          profiles = {}
        }
      }
      
      const userId = String(user.id)
      if (profiles[userId]) {
        setUserProfile(profiles[userId])
      } else {
        const newProfile: UserProfile = {
          userId,
          username: user.login,
          email: user.email || '',
          avatarUrl: user.avatar_url,
          createdAt: Date.now(),
          businessTokens: { 'INF': 10 },
          preferences: {}
        }
        profiles[userId] = newProfile
        localStorage.setItem('user-profiles', JSON.stringify(profiles))
        setUserProfile(newProfile)
      }
    }
  }, [])

  const login = async () => {
    try {
      setConnectionState('connecting')
      
      toast.info('Starting GitHub authentication...', {
        description: 'Requesting device code from GitHub'
      })
      
      // Step 1: Get device code
      const deviceFlowData = await initiateDeviceFlow()
      setDeviceCode(deviceFlowData)
      
      toast.success('Device code received!', {
        description: `Please visit ${deviceFlowData.verification_uri} and enter code: ${deviceFlowData.user_code}`,
        duration: 10000
      })
      
      // Step 2: Poll for authorization
      const user = await completeDeviceFlow(
        deviceFlowData.device_code,
        deviceFlowData.interval,
        (message) => {
          console.log('Auth progress:', message)
        }
      )
      
      setDeviceCode(null)
      
      // Step 3: Create session
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const session: UserSession = {
        userId: String(user.id),
        username: user.login,
        email: user.email || '',
        avatarUrl: user.avatar_url,
        loginTime: Date.now(),
        lastActive: Date.now(),
        sessionId
      }

      setCurrentUser(session)
      setConnectionState('connected')
      setAuthMethod('github')
      setIsGuest(false)

      // Load or create profile
      const storedProfiles = localStorage.getItem('user-profiles')
      let profiles: Record<string, UserProfile> = {}
      
      if (storedProfiles) {
        try {
          profiles = JSON.parse(storedProfiles)
        } catch {
          profiles = {}
        }
      }
      
      const userId = String(user.id)
      if (profiles[userId]) {
        const updatedProfile = {
          ...profiles[userId],
          username: user.login,
          email: user.email || '',
          avatarUrl: user.avatar_url
        }
        profiles[userId] = updatedProfile
        localStorage.setItem('user-profiles', JSON.stringify(profiles))
        setUserProfile(updatedProfile)
        toast.success(`Welcome back, ${user.login}! 👋`)
      } else {
        const newProfile: UserProfile = {
          userId,
          username: user.login,
          email: user.email || '',
          avatarUrl: user.avatar_url,
          createdAt: Date.now(),
          businessTokens: { 'INF': 10 },
          preferences: {}
        }
        profiles[userId] = newProfile
        localStorage.setItem('user-profiles', JSON.stringify(profiles))
        setUserProfile(newProfile)
        toast.success('Welcome! You received 10 free INF tokens! 🎉')
      }
    } catch (error) {
      setConnectionState('error')
      setDeviceCode(null)
      console.error('Login failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      toast.error('Authentication failed', {
        description: errorMessage,
        duration: 5000
      })
      
      throw error
    }
  }

  const continueAsGuest = () => {
    setConnectionState('guest')
    setAuthMethod('guest')
    setIsGuest(true)
    setCurrentUser(null)
    toast.success('Browsing as guest', {
      description: 'Sign in to access all features'
    })
  }

  const logout = () => {
    signOutGitHub()
    setCurrentUser(null)
    setUserProfile(null)
    setConnectionState('guest')
    setAuthMethod('guest')
    setIsGuest(true)
    toast.info('Signed out successfully')
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return

    const updatedProfile = { ...userProfile, ...updates }
    setUserProfile(updatedProfile)
    
    // Save to localStorage
    const storedProfiles = localStorage.getItem('user-profiles')
    let profiles: Record<string, UserProfile> = {}
    
    if (storedProfiles) {
      try {
        profiles = JSON.parse(storedProfiles)
      } catch {
        profiles = {}
      }
    }
    
    profiles[userProfile.userId] = updatedProfile
    localStorage.setItem('user-profiles', JSON.stringify(profiles))
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
    
    await updateProfile(updatedProfile)
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
    
    await updateProfile(updatedProfile)
  }

  const getTokenBalance = (tokenSymbol: string): number => {
    if (!userProfile) return 0
    return userProfile.businessTokens[tokenSymbol] || 0
  }

  // Update last active time
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        setCurrentUser(prev => {
          if (!prev) return null
          return { ...prev, lastActive: Date.now() }
        })
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [currentUser])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthenticated,
        isGuest,
        authMethod,
        connectionState,
        deviceCode,
        login,
        continueAsGuest,
        logout,
        updateProfile,
        addTokens,
        deductTokens,
        getTokenBalance
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
