/**
 * GitHub OAuth Authentication Service
 * 
 * Provides OAuth authentication for GitHub Pages deployment
 * Uses GitHub Device Flow which works without a backend server
 */

export interface GitHubUser {
  id: number
  login: string
  email: string
  avatar_url: string
  name: string | null
}

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface AccessTokenResponse {
  access_token?: string
  token_type?: string
  scope?: string
  error?: string
  error_description?: string
  error_uri?: string
}

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const STORAGE_KEY = 'github_oauth_token'

/**
 * Initiate GitHub Device Flow authentication
 * Returns device code and user code that user needs to enter on GitHub
 */
export async function initiateDeviceFlow(): Promise<DeviceCodeResponse> {
  if (!GITHUB_CLIENT_ID) {
    throw new Error('GitHub Client ID is not configured')
  }

  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'user:email read:user'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to initiate device flow')
  }

  return await response.json()
}

/**
 * Poll for access token after user has authorized the device
 */
export async function pollForAccessToken(deviceCode: string, interval: number): Promise<string> {
  if (!GITHUB_CLIENT_ID) {
    throw new Error('GitHub Client ID is not configured')
  }

  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to poll for access token')
        }

        const data: AccessTokenResponse = await response.json()

        if (data.access_token) {
          clearInterval(pollInterval)
          localStorage.setItem(STORAGE_KEY, data.access_token)
          resolve(data.access_token)
        } else if (data.error === 'authorization_pending') {
          // Continue polling
          return
        } else if (data.error === 'slow_down') {
          // GitHub wants us to slow down, but we'll keep the same interval
          return
        } else if (data.error === 'expired_token') {
          clearInterval(pollInterval)
          reject(new Error('Device code expired. Please try again.'))
        } else if (data.error === 'access_denied') {
          clearInterval(pollInterval)
          reject(new Error('Authorization was denied'))
        } else if (data.error) {
          clearInterval(pollInterval)
          reject(new Error(data.error_description || data.error))
        }
      } catch (error) {
        clearInterval(pollInterval)
        reject(error)
      }
    }, interval * 1000)

    // Set timeout after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      reject(new Error('Device flow timed out'))
    }, 600000)
  })
}

/**
 * Start the device flow authentication process
 * This will open the GitHub authorization page and poll for completion
 */
export async function loginWithGitHub(): Promise<void> {
  // Initiate device flow
  const deviceFlow = await initiateDeviceFlow()
  
  // Open GitHub authorization page in a new window
  window.open(deviceFlow.verification_uri, '_blank', 'width=500,height=700')
  
  // Store device code info for polling component
  sessionStorage.setItem('github_device_flow', JSON.stringify({
    device_code: deviceFlow.device_code,
    user_code: deviceFlow.user_code,
    verification_uri: deviceFlow.verification_uri,
    interval: deviceFlow.interval,
    expires_in: deviceFlow.expires_in,
    started_at: Date.now()
  }))
}

/**
 * Check if there's an active device flow waiting for authorization
 */
export function getActiveDeviceFlow(): DeviceCodeResponse & { started_at: number } | null {
  const stored = sessionStorage.getItem('github_device_flow')
  if (!stored) {
    return null
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Clear device flow data
 */
export function clearDeviceFlow(): void {
  sessionStorage.removeItem('github_device_flow')
}

/**
 * Handle OAuth callback - not used in device flow but kept for compatibility
 */
export async function handleOAuthCallback(code: string, state: string): Promise<GitHubUser> {
  throw new Error('OAuth callback is not supported in device flow. Please use device flow authentication.')
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
  clearDeviceFlow()
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
 * Get redirect path - not used in device flow but kept for compatibility
 */
export function getRedirectPath(): string | undefined {
  return undefined
}
