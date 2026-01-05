/**
 * Unified Auth Context Provider
 * React context for unified authentication system
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isAuthenticated,
  getCurrentUser,
  getCurrentUsername,
  signIn,
  signOut,
  register,
  getAllBalances,
  getWalletBalance,
  updateWallet,
  getTransactionHistory,
  setupStorageListener,
  syncSession,
  type UnifiedUser,
  type Transaction
} from '@/lib/auth-unified';
import { earnTokens, spendTokens, getWalletStatus, type CurrencyType } from '@/lib/wallet-unified';
import * as SimpleAuth from '@/lib/simple-auth';

/**
 * Convert simple auth user data to unified user format
 */
function convertSimpleUserToUnified(simpleUserData: SimpleAuth.SimpleUserData): UnifiedUser {
  return {
    passwordHash: simpleUserData.apiKeyHash,
    createdAt: simpleUserData.createdAt,
    lastLogin: simpleUserData.lastLoginAt,
    ipFingerprint: '',
    wallet: {
      infinity_tokens: simpleUserData.tokenBalance,
      research_tokens: 0,
      art_tokens: 0,
      music_tokens: 0
    },
    profile: {
      displayName: simpleUserData.username,
      avatar: '🔑',
      preferences: {}
    },
    transactions: [],
    achievements: ['api-key-login'],
    sessions: []
  };
}

interface UnifiedAuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  user: UnifiedUser | null;
  balances: Record<string, number>;
  authMethod: 'unified' | 'simple' | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  register: (username: string, password: string, email?: string) => Promise<void>;
  earnTokens: (currency: CurrencyType, amount: number, source: string, description: string) => void;
  spendTokens: (currency: CurrencyType, amount: number, target: string, description: string) => boolean;
  getBalance: (currency: CurrencyType) => number;
  getTransactions: (limit?: number) => Transaction[];
  refreshAuth: () => void;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | null>(null);

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [authMethod, setAuthMethod] = useState<'unified' | 'simple' | null>(null);

  const refreshAuth = () => {
    // Check both authentication systems
    const unifiedAuth = isAuthenticated();
    const simpleAuth = SimpleAuth.isLoggedIn();

    if (unifiedAuth) {
      setAuthenticated(true);
      setUsername(getCurrentUsername());
      setUser(getCurrentUser());
      setBalances(getAllBalances());
      setAuthMethod('unified');
      syncSession();
    } else if (simpleAuth) {
      const simpleUserData = SimpleAuth.getUserData();
      if (simpleUserData) {
        setAuthenticated(true);
        setUsername(simpleUserData.username);
        // Convert simple user data to unified user format
        const unifiedUser = convertSimpleUserToUnified(simpleUserData);
        setUser(unifiedUser);
        setBalances(unifiedUser.wallet);
        setAuthMethod('simple');
        SimpleAuth.refreshSession();
      }
    } else {
      setAuthenticated(false);
      setUsername(null);
      setUser(null);
      setBalances({});
      setAuthMethod(null);
    }
  };

  useEffect(() => {
    // Initial auth check
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setUsername(getCurrentUsername());
      setUser(getCurrentUser());
      setBalances(getAllBalances());
      syncSession();
    };

    checkAuth();

    // Setup cross-tab sync
    const cleanupListener = setupStorageListener(() => {
      checkAuth();
    });

    // Heartbeat sync every 30 seconds (reduced for efficiency)
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        checkAuth();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      cleanupListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    await signIn(username, password);
    refreshAuth();
  };

  const handleSignOut = () => {
    // Sign out from both systems
    signOut();
    SimpleAuth.logout();
    refreshAuth();
  };

  const handleRegister = async (username: string, password: string, email?: string) => {
    await register(username, password, email);
    refreshAuth();
  };

  const handleEarnTokens = (
    currency: CurrencyType,
    amount: number,
    source: string,
    description: string
  ) => {
    if (authMethod === 'simple') {
      // Update simple auth token balance
      if (currency === 'infinity_tokens') {
        SimpleAuth.updateTokenBalance(amount);
      }
    } else {
      earnTokens(currency, amount, source, description);
    }
    refreshAuth();
  };

  const handleSpendTokens = (
    currency: CurrencyType,
    amount: number,
    target: string,
    description: string
  ): boolean => {
    if (authMethod === 'simple') {
      // Handle simple auth token spending
      if (currency === 'infinity_tokens') {
        const userData = SimpleAuth.getUserData();
        if (userData && userData.tokenBalance >= amount) {
          SimpleAuth.updateTokenBalance(-amount);
          refreshAuth();
          return true;
        }
        return false;
      }
      return false;
    } else {
      const success = spendTokens(currency, amount, target, description);
      if (success) {
        refreshAuth();
      }
      return success;
    }
  };

  const getBalance = (currency: CurrencyType): number => {
    return getWalletBalance(currency);
  };

  const getTransactions = (limit?: number): Transaction[] => {
    return getTransactionHistory(limit);
  };

  return (
    <UnifiedAuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        username,
        user,
        balances,
        authMethod,
        signIn: handleSignIn,
        signOut: handleSignOut,
        register: handleRegister,
        earnTokens: handleEarnTokens,
        spendTokens: handleSpendTokens,
        getBalance,
        getTransactions,
        refreshAuth
      }}
    >
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
}
