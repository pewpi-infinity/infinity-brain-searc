export interface SocialCredentials {
  twitter?: {
    apiKey: string
    apiSecret: string
    accessToken: string
    accessTokenSecret: string
    bearerToken?: string
  }
  facebook?: {
    appId: string
    appSecret: string
    accessToken: string
    pageId?: string
  }
  linkedin?: {
    clientId: string
    clientSecret: string
    accessToken: string
    organizationId?: string
  }
}

export interface PostResult {
  success: boolean
  platform: string
  postId?: string
  url?: string
  error?: string
}

export interface AuthConfig {
  platform: 'twitter' | 'facebook' | 'linkedin'
  clientId: string
  clientSecret: string
  redirectUri: string
  scope?: string[]
}

export class SocialMediaAPI {
  private credentials: SocialCredentials = {}

  setCredentials(platform: keyof SocialCredentials, creds: any) {
    this.credentials[platform] = creds
  }

  getCredentials(platform: keyof SocialCredentials) {
    return this.credentials[platform]
  }

  initiateOAuth(config: AuthConfig): string {
    switch (config.platform) {
      case 'twitter':
        return this.getTwitterAuthUrl(config)
      case 'facebook':
        return this.getFacebookAuthUrl(config)
      case 'linkedin':
        return this.getLinkedInAuthUrl(config)
      default:
        throw new Error(`Unsupported platform: ${config.platform}`)
    }
  }

  private getTwitterAuthUrl(config: AuthConfig): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: (config.scope || ['tweet.read', 'tweet.write', 'users.read']).join(' '),
      state: this.generateState(),
      code_challenge: 'challenge',
      code_challenge_method: 'plain'
    })
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
  }

  private getFacebookAuthUrl(config: AuthConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: (config.scope || ['pages_manage_posts', 'pages_read_engagement']).join(','),
      response_type: 'code',
      state: this.generateState()
    })
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  }

  private getLinkedInAuthUrl(config: AuthConfig): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: (config.scope || ['w_member_social', 'r_liteprofile']).join(' '),
      state: this.generateState()
    })
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  }

  async exchangeCodeForToken(
    platform: 'twitter' | 'facebook' | 'linkedin',
    code: string,
    config: AuthConfig
  ): Promise<any> {
    switch (platform) {
      case 'twitter':
        return this.exchangeTwitterCode(code, config)
      case 'facebook':
        return this.exchangeFacebookCode(code, config)
      case 'linkedin':
        return this.exchangeLinkedInCode(code, config)
    }
  }

  private async exchangeTwitterCode(code: string, config: AuthConfig): Promise<any> {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
        code_verifier: 'challenge'
      })
    })

    if (!response.ok) {
      throw new Error(`Twitter token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  private async exchangeFacebookCode(code: string, config: AuthConfig): Promise<any> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code
    })

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(`Facebook token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  private async exchangeLinkedInCode(code: string, config: AuthConfig): Promise<any> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error(`LinkedIn token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  async postToTwitter(content: string, mediaUrls?: string[]): Promise<PostResult> {
    try {
      const creds = this.credentials.twitter
      if (!creds || !creds.accessToken) {
        return {
          success: false,
          platform: 'twitter',
          error: 'Twitter not authenticated. Please connect your account.'
        }
      }

      const payload: any = {
        text: content
      }

      if (mediaUrls && mediaUrls.length > 0) {
        payload.media = {
          media_ids: mediaUrls
        }
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          platform: 'twitter',
          error: `Twitter API error: ${error}`
        }
      }

      const data = await response.json()
      return {
        success: true,
        platform: 'twitter',
        postId: data.data.id,
        url: `https://twitter.com/user/status/${data.data.id}`
      }
    } catch (error) {
      return {
        success: false,
        platform: 'twitter',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async postToFacebook(content: string, pageId?: string, mediaUrl?: string): Promise<PostResult> {
    try {
      const creds = this.credentials.facebook
      if (!creds || !creds.accessToken) {
        return {
          success: false,
          platform: 'facebook',
          error: 'Facebook not authenticated. Please connect your account.'
        }
      }

      const targetPageId = pageId || creds.pageId
      if (!targetPageId) {
        return {
          success: false,
          platform: 'facebook',
          error: 'No Facebook page selected'
        }
      }

      const endpoint = `https://graph.facebook.com/v18.0/${targetPageId}/feed`
      const payload: any = {
        message: content,
        access_token: creds.accessToken
      }

      if (mediaUrl) {
        payload.link = mediaUrl
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          platform: 'facebook',
          error: `Facebook API error: ${error}`
        }
      }

      const data = await response.json()
      return {
        success: true,
        platform: 'facebook',
        postId: data.id,
        url: `https://facebook.com/${data.id}`
      }
    } catch (error) {
      return {
        success: false,
        platform: 'facebook',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async postToLinkedIn(content: string, visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC'): Promise<PostResult> {
    try {
      const creds = this.credentials.linkedin
      if (!creds || !creds.accessToken) {
        return {
          success: false,
          platform: 'linkedin',
          error: 'LinkedIn not authenticated. Please connect your account.'
        }
      }

      const userInfo = await this.getLinkedInUserInfo()
      if (!userInfo) {
        return {
          success: false,
          platform: 'linkedin',
          error: 'Could not retrieve LinkedIn user info'
        }
      }

      const payload = {
        author: `urn:li:person:${userInfo.id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility
        }
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          platform: 'linkedin',
          error: `LinkedIn API error: ${error}`
        }
      }

      const data = await response.json()
      return {
        success: true,
        platform: 'linkedin',
        postId: data.id,
        url: `https://www.linkedin.com/feed/update/${data.id}`
      }
    } catch (error) {
      return {
        success: false,
        platform: 'linkedin',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async getLinkedInUserInfo(): Promise<any> {
    const creds = this.credentials.linkedin
    if (!creds || !creds.accessToken) return null

    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${creds.accessToken}`
        }
      })

      if (!response.ok) return null
      return response.json()
    } catch {
      return null
    }
  }

  async postToAll(content: string): Promise<PostResult[]> {
    const results: PostResult[] = []

    if (this.credentials.twitter) {
      results.push(await this.postToTwitter(content))
    }

    if (this.credentials.facebook) {
      results.push(await this.postToFacebook(content))
    }

    if (this.credentials.linkedin) {
      results.push(await this.postToLinkedIn(content))
    }

    return results
  }

  async verifyConnection(platform: 'twitter' | 'facebook' | 'linkedin'): Promise<boolean> {
    try {
      switch (platform) {
        case 'twitter':
          return await this.verifyTwitterConnection()
        case 'facebook':
          return await this.verifyFacebookConnection()
        case 'linkedin':
          return await this.verifyLinkedInConnection()
      }
    } catch {
      return false
    }
  }

  private async verifyTwitterConnection(): Promise<boolean> {
    const creds = this.credentials.twitter
    if (!creds || !creds.accessToken) return false

    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${creds.accessToken}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async verifyFacebookConnection(): Promise<boolean> {
    const creds = this.credentials.facebook
    if (!creds || !creds.accessToken) return false

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${creds.accessToken}`
      )
      return response.ok
    } catch {
      return false
    }
  }

  private async verifyLinkedInConnection(): Promise<boolean> {
    const creds = this.credentials.linkedin
    if (!creds || !creds.accessToken) return false

    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${creds.accessToken}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
}

export const socialAPI = new SocialMediaAPI()
