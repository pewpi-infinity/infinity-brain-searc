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

interface UnifiedAuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  user: UnifiedUser | null;
  balances: Record<string, number>;
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

  const refreshAuth = () => {
    setAuthenticated(isAuthenticated());
    setUsername(getCurrentUsername());
    setUser(getCurrentUser());
    setBalances(getAllBalances());
    syncSession();
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
    signOut();
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
    earnTokens(currency, amount, source, description);
    refreshAuth();
  };

  const handleSpendTokens = (
    currency: CurrencyType,
    amount: number,
    target: string,
    description: string
  ): boolean => {
    const success = spendTokens(currency, amount, target, description);
    if (success) {
      refreshAuth();
    }
    return success;
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
