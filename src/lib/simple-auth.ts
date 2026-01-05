/**
 * Simple Authentication System
 * GitHub PAT / API Key Authentication
 * Compatible with infinity-brain-111 localStorage keys
 */

// localStorage keys for cross-repo compatibility
const STORAGE_KEYS = {
  API_KEY: 'infinity_brain_api_key',
  SESSION_ID: 'infinity_brain_session_id',
  USER_DATA: 'infinity_brain_user_data',
  SESSION_TIMESTAMP: 'infinity_brain_session_timestamp'
};

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface SimpleUserData {
  userId: string;
  username: string;
  tokenBalance: number;
  tokens: Token[];
  createdAt: string;
  lastLoginAt: string;
  apiKeyHash: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  createdAt: string;
}

/**
 * Generate a simple hash from a string (for userId generation)
 */
async function simpleHash(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const randomPart = Array.from(array, byte => byte.toString(36)).join('').substring(0, 16);
  return `session_${Date.now()}_${randomPart}`;
}

/**
 * Validate API key format
 * Basic validation: alphanumeric with dashes/underscores, minimum 8 characters
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Trim whitespace
  apiKey = apiKey.trim();

  // Minimum length check
  if (apiKey.length < 8) {
    return false;
  }

  // Allow alphanumeric characters, dashes, underscores, and dots
  const validPattern = /^[a-zA-Z0-9_\-\.]+$/;
  return validPattern.test(apiKey);
}

/**
 * Extract username from GitHub PAT or generate one
 * GitHub PATs start with "ghp_", "github_pat_", etc.
 */
async function extractUsername(apiKey: string): Promise<string> {
  // Check if it's a GitHub PAT format
  if (apiKey.startsWith('ghp_') || apiKey.startsWith('github_pat_')) {
    // For a real implementation, we would call GitHub API here
    // For now, generate a username based on the key
    const hash = await simpleHash(apiKey);
    return `github_user_${hash.substring(0, 8)}`;
  }

  // For generic API keys, generate a username
  const hash = await simpleHash(apiKey);
  return `user_${hash.substring(0, 8)}`;
}

/**
 * Create user data from API key
 */
export async function createUserData(apiKey: string): Promise<SimpleUserData> {
  const now = new Date().toISOString();
  const userId = await simpleHash(apiKey);
  const username = await extractUsername(apiKey);
  const apiKeyHash = await simpleHash(apiKey);

  return {
    userId: userId.substring(0, 16),
    username,
    tokenBalance: 1000, // Starting balance
    tokens: [],
    createdAt: now,
    lastLoginAt: now,
    apiKeyHash
  };
}

/**
 * Login with API key
 */
export async function login(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate API key format
    if (!validateApiKey(apiKey)) {
      return {
        success: false,
        error: 'Invalid API key format. Must be at least 8 characters and contain only alphanumeric characters, dashes, underscores, or dots.'
      };
    }

    // Create or retrieve user data
    const userData = await createUserData(apiKey);
    
    // Update last login time
    userData.lastLoginAt = new Date().toISOString();

    // Generate session ID
    const sessionId = generateSessionId();
    const timestamp = Date.now().toString();

    // Store in localStorage
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, timestamp);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    };
  }
}

/**
 * Logout and clear session
 */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.API_KEY);
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  const timestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);

  // All required data must be present
  if (!timestamp || !userData || !apiKey) {
    return false;
  }

  // Check if session has expired (24 hours)
  const sessionTime = parseInt(timestamp, 10);
  const now = Date.now();
  if (now - sessionTime > SESSION_TIMEOUT) {
    // Session expired, clear it
    logout();
    return false;
  }

  return true;
}

/**
 * Get current user data
 */
export function getUserData(): SimpleUserData | null {
  if (!isLoggedIn()) {
    return null;
  }

  const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  if (!userDataStr) {
    return null;
  }

  try {
    return JSON.parse(userDataStr) as SimpleUserData;
  } catch {
    return null;
  }
}

/**
 * Update user data
 */
export function updateUserData(updates: Partial<SimpleUserData>): boolean {
  const currentData = getUserData();
  if (!currentData) {
    return false;
  }

  const updatedData = {
    ...currentData,
    ...updates
  };

  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedData));
  return true;
}

/**
 * Get session ID
 */
export function getSessionId(): string | null {
  if (!isLoggedIn()) {
    return null;
  }
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
}

/**
 * Update token balance
 */
export function updateTokenBalance(amount: number): boolean {
  const userData = getUserData();
  if (!userData) {
    return false;
  }

  userData.tokenBalance += amount;
  
  // Prevent negative balance
  if (userData.tokenBalance < 0) {
    userData.tokenBalance = 0;
  }

  return updateUserData(userData);
}

/**
 * Add a token to user's collection
 */
export function addToken(token: Omit<Token, 'id' | 'createdAt'>): boolean {
  const userData = getUserData();
  if (!userData) {
    return false;
  }

  const newToken: Token = {
    ...token,
    id: `token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: new Date().toISOString()
  };

  userData.tokens.push(newToken);
  return updateUserData(userData);
}

/**
 * Get all tokens
 */
export function getTokens(): Token[] {
  const userData = getUserData();
  return userData?.tokens || [];
}

/**
 * Refresh session timestamp (extend session)
 */
export function refreshSession(): void {
  if (isLoggedIn()) {
    localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
  }
}
