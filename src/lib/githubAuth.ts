/**
 * GitHub OAuth Authentication Service
 * 
 * Provides OAuth authentication for GitHub Pages deployment
 * Uses GitHub OAuth App with PKCE for secure authentication
 */

export interface GitHubUser {
  id: number
  login: string
  email: string
  avatar_url: string
  name: string | null
}

interface OAuthState {
  codeVerifier: string
  state: string
  redirectTo?: string
}

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const REDIRECT_URI = `${window.location.origin}/infinity-brain-searc/callback`
const STORAGE_KEY = 'github_oauth_token'
const STATE_KEY = 'github_oauth_state'

/**
 * Generate a random string for PKCE code verifier
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

/**
 * Generate SHA-256 hash and encode as base64url
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Initiate GitHub OAuth flow
 */
export async function loginWithGitHub(redirectTo?: string): Promise<void> {
  if (!GITHUB_CLIENT_ID) {
    throw new Error('GitHub Client ID is not configured')
  }

  // Generate PKCE parameters
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  // Store state for validation
  const oauthState: OAuthState = {
    codeVerifier,
    state,
    redirectTo
  }
  localStorage.setItem(STATE_KEY, JSON.stringify(oauthState))

  // Build OAuth URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'user:email read:user',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  })

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
  
  // Redirect to GitHub
  window.location.href = authUrl
}

/**
 * Handle OAuth callback and exchange code for token
 */
export async function handleOAuthCallback(code: string, state: string): Promise<GitHubUser> {
  // Validate state
  const storedStateStr = localStorage.getItem(STATE_KEY)
  if (!storedStateStr) {
    throw new Error('No OAuth state found')
  }

  const storedState: OAuthState = JSON.parse(storedStateStr)
  if (storedState.state !== state) {
    throw new Error('Invalid OAuth state')
  }

  // Exchange code for token
  // Note: This requires a proxy server because GitHub's token endpoint doesn't support CORS
  // For now, we'll use the GitHub Device Flow as a fallback, or a serverless function
  
  try {
    // Try to exchange code for token using GitHub's web flow
    // This will fail due to CORS unless we have a proxy
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: storedState.codeVerifier
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token
    
    // Store token
    localStorage.setItem(STORAGE_KEY, accessToken)
    
    // Fetch user data
    const user = await fetchGitHubUser(accessToken)
    
    // Clean up OAuth state
    localStorage.removeItem(STATE_KEY)
    
    return user
  } catch (error) {
    // Clean up on error
    localStorage.removeItem(STATE_KEY)
    throw error
  }
}

/**
 * Fetch GitHub user data using access token
 */
async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user data')
  }

  const userData = await response.json()
  
  // Fetch email if not included
  let email = userData.email
  if (!email) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json()
      const primaryEmail = emails.find((e: any) => e.primary)
      email = primaryEmail?.email || emails[0]?.email || ''
    }
  }

  return {
    id: userData.id,
    login: userData.login,
    email: email || '',
    avatar_url: userData.avatar_url,
    name: userData.name
  }
}

/**
 * Get current user if token exists
 */
export async function getUser(): Promise<GitHubUser | null> {
  const token = localStorage.getItem(STORAGE_KEY)
  if (!token) {
    return null
  }

  try {
    return await fetchGitHubUser(token)
  } catch (error) {
    // Token might be expired or invalid
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

/**
 * Logout and clear stored token
 */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STATE_KEY)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Get redirect path from OAuth state
 */
export function getRedirectPath(): string | undefined {
  const storedStateStr = localStorage.getItem(STATE_KEY)
  if (!storedStateStr) {
    return undefined
  }
  
  try {
    const storedState: OAuthState = JSON.parse(storedStateStr)
    return storedState.redirectTo
  } catch {
    return undefined
  }
}
