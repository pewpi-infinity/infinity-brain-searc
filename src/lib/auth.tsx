import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

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
  deductTokens: (tokenSymbol: string, amount: number) => Promise<void>
  getTokenBalance: (tokenSymbol: string) => number
  syncWallet: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useKV<UserProfile | null>(userId ? `user-profile-${userId}` : 'user-profile-temp', null)
  const [allSessions, setAllSessions] = useKV<UserSession[]>('user-sessions', [])
  const [allProfiles, setAllProfiles] = useKV<Record<string, UserProfile>>('all-user-profiles', {})

  const isAuthenticated = currentUser !== null

  const login = async () => {
    try {
      const user = await window.spark.user()
      
      if (!user) {
        throw new Error('User authentication failed')
      }
      
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

      setAllSessions((currentSessions) => [...(currentSessions || []), session])

      const existingProfileData = await window.spark.kv.get<UserProfile>(`user-profile-${userIdString}`)
      const allTransactions = await window.spark.kv.get<any[]>('all-transactions') || []
      
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

    try {
      const allTransactions = await window.spark.kv.get<any[]>('all-transactions') || []
      
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
      
      const calculatedBalances = recalculateTokenBalances(currentUser.userId)
      
      const updatedProfile = {
        ...userProfile,
        businessTokens: calculatedBalances
      }
      
      setUserProfile(updatedProfile)
      
      setAllProfiles((currentProfiles) => ({
        ...(currentProfiles || {}),
        [currentUser.userId]: updatedProfile
      }))
      
      toast.success('Wallet synced successfully! All tokens restored from transaction history. ✨')
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
        login,
        logout,
        updateProfile,
        addTokens,
        deductTokens,
        getTokenBalance,
        syncWallet
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
