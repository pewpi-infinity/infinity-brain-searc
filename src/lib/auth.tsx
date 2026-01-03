import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'

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
  login: () => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  addTokens: (tokenSymbol: string, amount: number) => Promise<void>
  getTokenBalance: (tokenSymbol: string) => number
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [userProfile, setUserProfile] = useKV<UserProfile | null>('user-profile', null)
  const [allSessions, setAllSessions] = useKV<UserSession[]>('user-sessions', [])

  const isAuthenticated = currentUser !== null

  const login = async () => {
    try {
      const user = await window.spark.user()
      
      if (!user) {
        throw new Error('User authentication failed')
      }
      
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const session: UserSession = {
        userId: String(user.id),
        username: user.login,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isOwner: user.isOwner,
        loginTime: Date.now(),
        lastActive: Date.now(),
        sessionId
      }

      setCurrentUser(session)

      setAllSessions((currentSessions) => [...(currentSessions || []), session])

      if (!userProfile) {
        const newProfile: UserProfile = {
          userId: String(user.id),
          username: user.login,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: Date.now(),
          businessTokens: {
            'INF': 1000
          },
          preferences: {}
        }
        setUserProfile(newProfile)
      } else {
        const updatedProfile = {
          ...userProfile,
          username: user.login,
          email: user.email,
          avatarUrl: user.avatarUrl
        }
        setUserProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
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
    if (!userProfile) return

    const currentBalance = userProfile.businessTokens[tokenSymbol] || 0
    const updatedProfile = {
      ...userProfile,
      businessTokens: {
        ...userProfile.businessTokens,
        [tokenSymbol]: currentBalance + amount
      }
    }
    setUserProfile(updatedProfile)
  }

  const getTokenBalance = (tokenSymbol: string): number => {
    if (!userProfile) return 0
    return userProfile.businessTokens[tokenSymbol] || 0
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
        login,
        logout,
        updateProfile,
        addTokens,
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
