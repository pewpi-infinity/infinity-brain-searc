/**
 * GitHub Device Flow Authentication Library
 * Provides Device Flow OAuth authentication for static sites (GitHub Pages)
 * No server or client secret required!
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

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

export interface DeviceTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

const STORAGE_KEY = 'github_device_flow_auth'
const GITHUB_CLIENT_ID = 'Ov23lijJ7WlzWBDHdhHH' // Device Flow OAuth App

/**
 * Initiate GitHub Device Flow login
 * Step 1: Request device and user codes from GitHub
 */
export async function initiateDeviceFlow(): Promise<DeviceCodeResponse> {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      scope: 'read:user user:email'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to initiate device flow')
  }

  const data = await response.json()
  return {
    device_code: data.device_code,
    user_code: data.user_code,
    verification_uri: data.verification_uri,
    expires_in: data.expires_in,
    interval: data.interval
  }
}

/**
 * Poll for access token
 * Step 2: Poll GitHub to check if user has authorized the device
 */
export async function pollForToken(
  deviceCode: string,
  interval: number,
  onProgress?: (message: string) => void
): Promise<string> {
  const startTime = Date.now()
  const maxDuration = 15 * 60 * 1000 // 15 minutes

  while (Date.now() - startTime < maxDuration) {
    await new Promise(resolve => setTimeout(resolve, interval * 1000))

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

      const data = await response.json()

      if (data.access_token) {
        return data.access_token
      }

      if (data.error === 'authorization_pending') {
        onProgress?.('Waiting for authorization...')
        continue
      }

      if (data.error === 'slow_down') {
        // Increase interval as requested by GitHub
        interval += 5
        onProgress?.('Slowing down polling...')
        continue
      }

      if (data.error === 'expired_token') {
        throw new Error('Device code expired. Please try again.')
      }

      if (data.error === 'access_denied') {
        throw new Error('Authorization denied by user.')
      }

      throw new Error(data.error_description || data.error || 'Unknown error')
    } catch (error) {
      if (error instanceof Error && error.message.includes('Device code expired')) {
        throw error
      }
      // Continue polling on network errors
      onProgress?.('Connection error, retrying...')
    }
  }

  throw new Error('Authorization timed out. Please try again.')
}

/**
 * Fetch GitHub user info using access token
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
 * Complete authentication flow
 * Combines token polling and user fetch, then saves to localStorage
 */
export async function completeDeviceFlow(
  deviceCode: string,
  interval: number,
  onProgress?: (message: string) => void
): Promise<GitHubUser> {
  // Get access token
  const token = await pollForToken(deviceCode, interval, onProgress)
  
  // Fetch user info
  const user = await fetchGitHubUser(token)
  
  // Save to localStorage
  const authState: GitHubAuthState = {
    isAuthenticated: true,
    user,
    token
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authState))
  
  return user
}

/**
 * Get current GitHub auth state
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
 * Sign out from GitHub
 */
export function signOutGitHub(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Check if user is authenticated
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
