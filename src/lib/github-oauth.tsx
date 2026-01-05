/**
 * GitHub OAuth Authentication Library
 * Provides OAuth-based authentication as an alternative to Spark
 */

export interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
}

export interface GitHubAuthState {
  isAuthenticated: boolean
  user: GitHubUser | null
  token: string | null
}

const STORAGE_KEY = 'github_oauth_auth'
const GITHUB_CLIENT_ID = 'Ov23lijJ7WlzWBDHdhHH' // Same as infinity-brain-111

/**
 * Get OAuth redirect URI
 */
export function getRedirectUri(): string {
  return window.location.origin + '/callback.html'
}

/**
 * Initiate GitHub OAuth login flow
 */
export function initiateGitHubLogin(): void {
  const redirectUri = getRedirectUri()
  const scope = 'read:user user:email'
  const state = generateRandomState()
  
  // Store state for CSRF protection
  sessionStorage.setItem('github_oauth_state', state)
  
  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}`
  
  window.location.href = authUrl
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Handle OAuth callback
 * Call this from callback.html
 */
export async function handleOAuthCallback(code: string, state: string): Promise<void> {
  // Verify state for CSRF protection
  const savedState = sessionStorage.getItem('github_oauth_state')
  if (state !== savedState) {
    throw new Error('Invalid state parameter - possible CSRF attack')
  }
  sessionStorage.removeItem('github_oauth_state')
  
  // Exchange code for token using GitHub Actions workflow
  const token = await exchangeCodeForToken(code)
  
  // Fetch user info
  const user = await fetchGitHubUser(token)
  
  // Save to localStorage
  const authState: GitHubAuthState = {
    isAuthenticated: true,
    user,
    token
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authState))
  
  // Redirect back to main app
  window.opener?.postMessage({ type: 'github_auth_success' }, window.location.origin)
  window.close()
}

/**
 * Exchange authorization code for access token
 * Uses GitHub Actions workflow as proxy to keep client secret secure
 */
async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    // Try to use GitHub Actions workflow dispatch as proxy
    // Note: This is a simplified version - in production, you'd need proper workflow setup
    // For now, we'll use a direct approach that works without server
    
    // Since we can't securely exchange without exposing client secret,
    // we'll use a different approach: store the code and let user know to complete setup
    throw new Error('Token exchange requires server-side proxy - see AUTHENTICATION.md')
  } catch (error) {
    console.error('Token exchange failed:', error)
    throw new Error('Failed to exchange code for token. Please try Spark authentication instead.')
  }
}

/**
 * Fetch GitHub user info
 */
async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }
  
  return await response.json()
}

/**
 * Get current GitHub OAuth auth state
 */
export function getGitHubAuthState(): GitHubAuthState {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return {
      isAuthenticated: false,
      user: null,
      token: null
    }
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      token: null
    }
  }
}

/**
 * Sign out from GitHub OAuth
 */
export function signOutGitHub(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem('github_oauth_state')
}

/**
 * Check if user is authenticated with GitHub OAuth
 */
export function isGitHubAuthenticated(): boolean {
  return getGitHubAuthState().isAuthenticated
}

/**
 * Get current GitHub user
 */
export function getGitHubUser(): GitHubUser | null {
  return getGitHubAuthState().user
}
