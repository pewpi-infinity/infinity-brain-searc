/**
 * Unified Authentication System
 * Cross-repository authentication using localStorage
 * Works identically across all Pewpi Infinity repositories
 */

const STORAGE_KEY = 'pewpi_unified_auth';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface UnifiedUser {
  passwordHash: string;
  createdAt: string;
  lastLogin: string;
  ipFingerprint: string;
  wallet: {
    infinity_tokens: number;
    research_tokens: number;
    art_tokens: number;
    music_tokens: number;
  };
  profile: {
    displayName: string;
    avatar: string;
    preferences: Record<string, any>;
  };
  transactions: Transaction[];
  achievements: string[];
  sessions: SessionInfo[];
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer';
  amount: number;
  currency: 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens';
  source: string;
  description: string;
  timestamp: string;
}

export interface SessionInfo {
  token: string;
  loginTime: string;
  lastActive: string;
  ipFingerprint: string;
}

export interface CurrentSession {
  username: string;
  token: string;
  loginTime: string;
  activeRepo: string;
}

export interface UnifiedAuthData {
  version: string;
  users: Record<string, UnifiedUser>;
  currentSession: CurrentSession | null;
}

// Simple hash function for password (SHA-256 via Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get IP fingerprint (simplified - uses screen resolution + timezone + language)
function getIPFingerprint(): string {
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  return `${screen}-${timezone}-${language}`;
}

// Generate unique session token with crypto API
function generateToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const randomPart = Array.from(array, byte => byte.toString(36)).join('').substring(0, 9);
  return `token_${Date.now()}_${randomPart}`;
}

// Generate transaction ID with crypto API
function generateTransactionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const randomPart = Array.from(array, byte => byte.toString(36)).join('').substring(0, 9);
  return `tx_${Date.now()}_${randomPart}`;
}

// Get auth data from localStorage
function getAuthData(): UnifiedAuthData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      version: '1.0.0',
      users: {},
      currentSession: null
    };
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {
      version: '1.0.0',
      users: {},
      currentSession: null
    };
  }
}

// Save auth data to localStorage
function saveAuthData(data: UnifiedAuthData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Note: Storage events are automatically fired for other tabs/windows
  // We don't manually dispatch to avoid infinite loops
}

// Repository configuration
export const REPO_CONFIG = {
  REPOS: [
    { key: 'infinity-brain-searc', name: 'Search', emoji: '🔍', url: 'https://pewpi-infinity.github.io/infinity-brain-searc/' },
    { key: 'repo-dashboard-hub', name: 'Dashboard', emoji: '📊', url: 'https://pewpi-infinity.github.io/repo-dashboard-hub/' },
    { key: 'banksy', name: 'Banksy', emoji: '🎨', url: 'https://pewpi-infinity.github.io/banksy/' },
    { key: 'smug_look', name: 'Research', emoji: '🔬', url: 'https://pewpi-infinity.github.io/smug_look/' }
  ],
  DEFAULT: 'infinity-brain-searc'
};

// Get current repository name from URL
export function getCurrentRepo(): string {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  for (const repo of REPO_CONFIG.REPOS) {
    if (hostname.includes(repo.key) || pathname.includes(repo.key)) {
      return repo.key;
    }
  }
  
  return REPO_CONFIG.DEFAULT;
}

/**
 * Register a new user
 */
export async function register(username: string, password: string, email?: string): Promise<boolean> {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const data = getAuthData();

  if (data.users[username]) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const newUser: UnifiedUser = {
    passwordHash,
    createdAt: now,
    lastLogin: now,
    ipFingerprint: getIPFingerprint(),
    wallet: {
      infinity_tokens: 100, // Welcome bonus!
      research_tokens: 0,
      art_tokens: 0,
      music_tokens: 0
    },
    profile: {
      displayName: username,
      avatar: '🧠',
      preferences: {}
    },
    transactions: [
      {
        id: generateTransactionId(),
        type: 'earn',
        amount: 100,
        currency: 'infinity_tokens',
        source: 'registration',
        description: 'Welcome bonus',
        timestamp: now
      }
    ],
    achievements: ['registered'],
    sessions: []
  };

  data.users[username] = newUser;
  saveAuthData(data);

  return true;
}

/**
 * Sign in a user
 */
export async function signIn(username: string, password: string): Promise<boolean> {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const data = getAuthData();
  const user = data.users[username];

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error('Invalid username or password');
  }

  // Create session
  const now = new Date().toISOString();
  const token = generateToken();
  const ipFingerprint = getIPFingerprint();

  const session: SessionInfo = {
    token,
    loginTime: now,
    lastActive: now,
    ipFingerprint
  };

  user.sessions.push(session);
  user.lastLogin = now;

  data.currentSession = {
    username,
    token,
    loginTime: now,
    activeRepo: getCurrentRepo()
  };

  saveAuthData(data);

  return true;
}

/**
 * Sign out current user
 */
export function signOut(): void {
  const data = getAuthData();
  data.currentSession = null;
  saveAuthData(data);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): UnifiedUser | null {
  const data = getAuthData();
  if (!data.currentSession) {
    return null;
  }

  const user = data.users[data.currentSession.username];
  if (!user) {
    return null;
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const data = getAuthData();
  if (!data.currentSession) {
    return false;
  }

  const session = data.currentSession;
  const user = data.users[session.username];

  if (!user) {
    return false;
  }

  // Check if session is expired (30 days)
  const loginTime = new Date(session.loginTime).getTime();
  const now = Date.now();
  if (now - loginTime > SESSION_DURATION) {
    signOut();
    return false;
  }

  return true;
}

/**
 * Get current username
 */
export function getCurrentUsername(): string | null {
  const data = getAuthData();
  return data.currentSession?.username || null;
}

/**
 * Sync session across tabs/repos
 */
export function syncSession(): void {
  const data = getAuthData();
  if (data.currentSession) {
    data.currentSession.activeRepo = getCurrentRepo();
    saveAuthData(data);
  }
}

/**
 * Update user wallet
 */
export function updateWallet(
  currency: 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens',
  amount: number,
  source: string,
  description: string
): void {
  const data = getAuthData();
  if (!data.currentSession) {
    throw new Error('User not authenticated');
  }

  const user = data.users[data.currentSession.username];
  if (!user) {
    throw new Error('User not found');
  }

  // Validate amount is integer and within bounds
  if (!Number.isInteger(amount) || Math.abs(amount) > Number.MAX_SAFE_INTEGER) {
    throw new Error('Invalid token amount');
  }

  const newBalance = (user.wallet[currency] || 0) + amount;
  
  // Prevent negative balances
  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }

  user.wallet[currency] = newBalance;

  // Record transaction
  const transaction: Transaction = {
    id: generateTransactionId(),
    type: amount > 0 ? 'earn' : 'spend',
    amount: Math.abs(amount),
    currency,
    source,
    description,
    timestamp: new Date().toISOString()
  };

  user.transactions.push(transaction);

  saveAuthData(data);
}

/**
 * Get wallet balance for a specific currency
 */
export function getWalletBalance(
  currency: 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens'
): number {
  const user = getCurrentUser();
  if (!user) {
    return 0;
  }
  return user.wallet[currency] || 0;
}

/**
 * Get all wallet balances
 */
export function getAllBalances(): Record<string, number> {
  const user = getCurrentUser();
  if (!user) {
    return {
      infinity_tokens: 0,
      research_tokens: 0,
      art_tokens: 0,
      music_tokens: 0
    };
  }
  return user.wallet;
}

/**
 * Record a transaction
 */
export function recordTransaction(
  type: 'earn' | 'spend' | 'transfer',
  amount: number,
  currency: 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens',
  source: string,
  description: string
): void {
  const data = getAuthData();
  if (!data.currentSession) {
    throw new Error('User not authenticated');
  }

  const user = data.users[data.currentSession.username];
  if (!user) {
    throw new Error('User not found');
  }

  const transaction: Transaction = {
    id: generateTransactionId(),
    type,
    amount,
    currency,
    source,
    description,
    timestamp: new Date().toISOString()
  };

  user.transactions.push(transaction);
  saveAuthData(data);
}

/**
 * Get transaction history
 */
export function getTransactionHistory(limit: number = 50): Transaction[] {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }

  return user.transactions.slice(-limit).reverse();
}

/**
 * Setup storage event listener for cross-tab sync
 */
export function setupStorageListener(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  
  window.addEventListener('storage', handler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handler);
  };
}

/**
 * Update user profile
 */
export function updateProfile(updates: Partial<UnifiedUser['profile']>): void {
  const data = getAuthData();
  if (!data.currentSession) {
    throw new Error('User not authenticated');
  }

  const user = data.users[data.currentSession.username];
  if (!user) {
    throw new Error('User not found');
  }

  user.profile = {
    ...user.profile,
    ...updates
  };

  saveAuthData(data);
}

/**
 * Get user profile
 */
export function getUserProfile(): UnifiedUser['profile'] | null {
  const user = getCurrentUser();
  if (!user) {
    return null;
  }
  return user.profile;
}
