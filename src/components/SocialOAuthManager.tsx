import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { socialAPI, type AuthConfig } from '@/lib/socialApis'
import { 
  TwitterLogo, 
  FacebookLogo, 
  LinkedinLogo,
  Check,
  X,
  Key,
  LinkSimple,
  Warning,
  CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PlatformCredentials {
  twitter?: {
    clientId: string
    clientSecret: string
    accessToken?: string
    connected: boolean
    username?: string
  }
  facebook?: {
    appId: string
    appSecret: string
    accessToken?: string
    pageId?: string
    connected: boolean
    username?: string
  }
  linkedin?: {
    clientId: string
    clientSecret: string
    accessToken?: string
    connected: boolean
    username?: string
  }
}

export function SocialOAuthManager() {
  const [credentials, setCredentials] = useLocalStorage<PlatformCredentials>('social-api-credentials', {})
  const [showDialog, setShowDialog] = useState(false)
  const [activePlatform, setActivePlatform] = useState<'twitter' | 'facebook' | 'linkedin'>('twitter')
  const [verifying, setVerifying] = useState<string | null>(null)
  
  const [twitterClientId, setTwitterClientId] = useState('')
  const [twitterClientSecret, setTwitterClientSecret] = useState('')
  const [twitterAccessToken, setTwitterAccessToken] = useState('')
  
  const [facebookAppId, setFacebookAppId] = useState('')
  const [facebookAppSecret, setFacebookAppSecret] = useState('')
  const [facebookAccessToken, setFacebookAccessToken] = useState('')
  const [facebookPageId, setFacebookPageId] = useState('')
  
  const [linkedinClientId, setLinkedinClientId] = useState('')
  const [linkedinClientSecret, setLinkedinClientSecret] = useState('')
  const [linkedinAccessToken, setLinkedinAccessToken] = useState('')

  useEffect(() => {
    if (credentials?.twitter) {
      setTwitterClientId(credentials.twitter.clientId || '')
      setTwitterClientSecret(credentials.twitter.clientSecret || '')
      setTwitterAccessToken(credentials.twitter.accessToken || '')
    }
    if (credentials?.facebook) {
      setFacebookAppId(credentials.facebook.appId || '')
      setFacebookAppSecret(credentials.facebook.appSecret || '')
      setFacebookAccessToken(credentials.facebook.accessToken || '')
      setFacebookPageId(credentials.facebook.pageId || '')
    }
    if (credentials?.linkedin) {
      setLinkedinClientId(credentials.linkedin.clientId || '')
      setLinkedinClientSecret(credentials.linkedin.clientSecret || '')
      setLinkedinAccessToken(credentials.linkedin.accessToken || '')
    }
  }, [credentials])

  const handleTwitterOAuth = () => {
    if (!twitterClientId || !twitterClientSecret) {
      toast.error('Please enter Twitter API credentials')
      return
    }

    const config: AuthConfig = {
      platform: 'twitter',
      clientId: twitterClientId,
      clientSecret: twitterClientSecret,
      redirectUri: `${window.location.origin}/oauth/callback`,
      scope: ['tweet.read', 'tweet.write', 'users.read']
    }

    const authUrl = socialAPI.initiateOAuth(config)
    
    toast.info('Opening Twitter authorization...', {
      description: 'You will be redirected to Twitter to authorize the app'
    })

    window.open(authUrl, '_blank', 'width=600,height=700')
  }

  const handleFacebookOAuth = () => {
    if (!facebookAppId || !facebookAppSecret) {
      toast.error('Please enter Facebook API credentials')
      return
    }

    const config: AuthConfig = {
      platform: 'facebook',
      clientId: facebookAppId,
      clientSecret: facebookAppSecret,
      redirectUri: `${window.location.origin}/oauth/callback`,
      scope: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list']
    }

    const authUrl = socialAPI.initiateOAuth(config)
    
    toast.info('Opening Facebook authorization...', {
      description: 'You will be redirected to Facebook to authorize the app'
    })

    window.open(authUrl, '_blank', 'width=600,height=700')
  }

  const handleLinkedInOAuth = () => {
    if (!linkedinClientId || !linkedinClientSecret) {
      toast.error('Please enter LinkedIn API credentials')
      return
    }

    const config: AuthConfig = {
      platform: 'linkedin',
      clientId: linkedinClientId,
      clientSecret: linkedinClientSecret,
      redirectUri: `${window.location.origin}/oauth/callback`,
      scope: ['w_member_social', 'r_liteprofile']
    }

    const authUrl = socialAPI.initiateOAuth(config)
    
    toast.info('Opening LinkedIn authorization...', {
      description: 'You will be redirected to LinkedIn to authorize the app'
    })

    window.open(authUrl, '_blank', 'width=600,height=700')
  }

  const handleSaveTwitter = async () => {
    if (!twitterAccessToken) {
      toast.error('Please enter an access token')
      return
    }

    socialAPI.setCredentials('twitter', {
      accessToken: twitterAccessToken,
      apiKey: twitterClientId,
      apiSecret: twitterClientSecret,
      accessTokenSecret: ''
    })

    setCredentials((current = {}) => ({
      ...current,
      twitter: {
        clientId: twitterClientId,
        clientSecret: twitterClientSecret,
        accessToken: twitterAccessToken,
        connected: true
      }
    }))

    toast.success('Twitter credentials saved!')
    setShowDialog(false)
  }

  const handleSaveFacebook = async () => {
    if (!facebookAccessToken) {
      toast.error('Please enter an access token')
      return
    }

    socialAPI.setCredentials('facebook', {
      appId: facebookAppId,
      appSecret: facebookAppSecret,
      accessToken: facebookAccessToken,
      pageId: facebookPageId
    })

    setCredentials((current = {}) => ({
      ...current,
      facebook: {
        appId: facebookAppId,
        appSecret: facebookAppSecret,
        accessToken: facebookAccessToken,
        pageId: facebookPageId,
        connected: true
      }
    }))

    toast.success('Facebook credentials saved!')
    setShowDialog(false)
  }

  const handleSaveLinkedIn = async () => {
    if (!linkedinAccessToken) {
      toast.error('Please enter an access token')
      return
    }

    socialAPI.setCredentials('linkedin', {
      clientId: linkedinClientId,
      clientSecret: linkedinClientSecret,
      accessToken: linkedinAccessToken
    })

    setCredentials((current = {}) => ({
      ...current,
      linkedin: {
        clientId: linkedinClientId,
        clientSecret: linkedinClientSecret,
        accessToken: linkedinAccessToken,
        connected: true
      }
    }))

    toast.success('LinkedIn credentials saved!')
    setShowDialog(false)
  }

  const verifyConnection = async (platform: 'twitter' | 'facebook' | 'linkedin') => {
    setVerifying(platform)
    
    try {
      const isConnected = await socialAPI.verifyConnection(platform)
      
      if (isConnected) {
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection verified!`)
        setCredentials((current = {}) => ({
          ...current,
          [platform]: {
            ...current[platform],
            connected: true
          }
        }))
      } else {
        toast.error(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection failed`)
        setCredentials((current = {}) => ({
          ...current,
          [platform]: {
            ...current[platform],
            connected: false
          }
        }))
      }
    } catch (error) {
      toast.error('Connection verification failed')
    } finally {
      setVerifying(null)
    }
  }

  const disconnectPlatform = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    setCredentials((current = {}) => ({
      ...current,
      [platform]: undefined
    }))
    toast.info(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`)
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={28} weight="duotone" className="text-accent" />
          Social Media API Connections
        </CardTitle>
        <CardDescription>
          Connect your social media accounts using official API credentials for real posting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className={credentials?.twitter?.connected ? 'ring-2 ring-accent' : ''}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TwitterLogo size={32} weight="fill" className="text-[oklch(0.55_0.15_220)]" />
                  <div>
                    <h3 className="font-semibold">Twitter/X</h3>
                    <p className="text-xs text-muted-foreground">
                      {credentials?.twitter?.username || 'Not connected'}
                    </p>
                  </div>
                </div>
                {credentials?.twitter?.connected ? (
                  <CheckCircle size={24} weight="fill" className="text-accent" />
                ) : (
                  <Warning size={24} weight="fill" className="text-muted-foreground" />
                )}
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showDialog && activePlatform === 'twitter'} onOpenChange={(open) => {
                  setShowDialog(open)
                  if (open) setActivePlatform('twitter')
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Key size={16} className="mr-2" />
                      {credentials?.twitter?.connected ? 'Update' : 'Setup'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <TwitterLogo size={24} weight="fill" />
                        Twitter/X API Setup
                      </DialogTitle>
                      <DialogDescription>
                        Enter your Twitter API v2 credentials. Get them from <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent underline">Twitter Developer Portal</a>
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="twitter-client-id">Client ID</Label>
                        <Input
                          id="twitter-client-id"
                          value={twitterClientId}
                          onChange={(e) => setTwitterClientId(e.target.value)}
                          placeholder="Your Twitter OAuth 2.0 Client ID"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twitter-client-secret">Client Secret</Label>
                        <Input
                          id="twitter-client-secret"
                          type="password"
                          value={twitterClientSecret}
                          onChange={(e) => setTwitterClientSecret(e.target.value)}
                          placeholder="Your Twitter OAuth 2.0 Client Secret"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter-access-token">Access Token (Bearer Token)</Label>
                        <Input
                          id="twitter-access-token"
                          type="password"
                          value={twitterAccessToken}
                          onChange={(e) => setTwitterAccessToken(e.target.value)}
                          placeholder="Your Twitter Bearer Token"
                        />
                        <p className="text-xs text-muted-foreground">
                          You can use OAuth flow or paste a Bearer Token directly
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleTwitterOAuth} variant="outline" className="flex-1">
                          <LinkSimple size={16} className="mr-2" />
                          OAuth Flow
                        </Button>
                        <Button onClick={handleSaveTwitter} className="flex-1">
                          <Check size={16} className="mr-2" />
                          Save Token
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {credentials?.twitter?.connected && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyConnection('twitter')}
                      disabled={verifying === 'twitter'}
                    >
                      {verifying === 'twitter' ? 'Verifying...' : 'Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => disconnectPlatform('twitter')}
                    >
                      <X size={16} />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={credentials?.facebook?.connected ? 'ring-2 ring-accent' : ''}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FacebookLogo size={32} weight="fill" className="text-[oklch(0.50_0.20_250)]" />
                  <div>
                    <h3 className="font-semibold">Facebook</h3>
                    <p className="text-xs text-muted-foreground">
                      {credentials?.facebook?.username || 'Not connected'}
                    </p>
                  </div>
                </div>
                {credentials?.facebook?.connected ? (
                  <CheckCircle size={24} weight="fill" className="text-accent" />
                ) : (
                  <Warning size={24} weight="fill" className="text-muted-foreground" />
                )}
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showDialog && activePlatform === 'facebook'} onOpenChange={(open) => {
                  setShowDialog(open)
                  if (open) setActivePlatform('facebook')
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Key size={16} className="mr-2" />
                      {credentials?.facebook?.connected ? 'Update' : 'Setup'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FacebookLogo size={24} weight="fill" />
                        Facebook API Setup
                      </DialogTitle>
                      <DialogDescription>
                        Enter your Facebook App credentials. Get them from <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-accent underline">Facebook Developers</a>
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook-app-id">App ID</Label>
                        <Input
                          id="facebook-app-id"
                          value={facebookAppId}
                          onChange={(e) => setFacebookAppId(e.target.value)}
                          placeholder="Your Facebook App ID"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="facebook-app-secret">App Secret</Label>
                        <Input
                          id="facebook-app-secret"
                          type="password"
                          value={facebookAppSecret}
                          onChange={(e) => setFacebookAppSecret(e.target.value)}
                          placeholder="Your Facebook App Secret"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook-access-token">Page Access Token</Label>
                        <Input
                          id="facebook-access-token"
                          type="password"
                          value={facebookAccessToken}
                          onChange={(e) => setFacebookAccessToken(e.target.value)}
                          placeholder="Your Facebook Page Access Token"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook-page-id">Page ID (Optional)</Label>
                        <Input
                          id="facebook-page-id"
                          value={facebookPageId}
                          onChange={(e) => setFacebookPageId(e.target.value)}
                          placeholder="Your Facebook Page ID"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleFacebookOAuth} variant="outline" className="flex-1">
                          <LinkSimple size={16} className="mr-2" />
                          OAuth Flow
                        </Button>
                        <Button onClick={handleSaveFacebook} className="flex-1">
                          <Check size={16} className="mr-2" />
                          Save Token
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {credentials?.facebook?.connected && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyConnection('facebook')}
                      disabled={verifying === 'facebook'}
                    >
                      {verifying === 'facebook' ? 'Verifying...' : 'Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => disconnectPlatform('facebook')}
                    >
                      <X size={16} />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={credentials?.linkedin?.connected ? 'ring-2 ring-accent' : ''}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkedinLogo size={32} weight="fill" className="text-[oklch(0.45_0.15_240)]" />
                  <div>
                    <h3 className="font-semibold">LinkedIn</h3>
                    <p className="text-xs text-muted-foreground">
                      {credentials?.linkedin?.username || 'Not connected'}
                    </p>
                  </div>
                </div>
                {credentials?.linkedin?.connected ? (
                  <CheckCircle size={24} weight="fill" className="text-accent" />
                ) : (
                  <Warning size={24} weight="fill" className="text-muted-foreground" />
                )}
              </div>
              
              <div className="flex gap-2">
                <Dialog open={showDialog && activePlatform === 'linkedin'} onOpenChange={(open) => {
                  setShowDialog(open)
                  if (open) setActivePlatform('linkedin')
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Key size={16} className="mr-2" />
                      {credentials?.linkedin?.connected ? 'Update' : 'Setup'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <LinkedinLogo size={24} weight="fill" />
                        LinkedIn API Setup
                      </DialogTitle>
                      <DialogDescription>
                        Enter your LinkedIn App credentials. Get them from <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-accent underline">LinkedIn Developers</a>
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin-client-id">Client ID</Label>
                        <Input
                          id="linkedin-client-id"
                          value={linkedinClientId}
                          onChange={(e) => setLinkedinClientId(e.target.value)}
                          placeholder="Your LinkedIn Client ID"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="linkedin-client-secret">Client Secret</Label>
                        <Input
                          id="linkedin-client-secret"
                          type="password"
                          value={linkedinClientSecret}
                          onChange={(e) => setLinkedinClientSecret(e.target.value)}
                          placeholder="Your LinkedIn Client Secret"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin-access-token">Access Token</Label>
                        <Input
                          id="linkedin-access-token"
                          type="password"
                          value={linkedinAccessToken}
                          onChange={(e) => setLinkedinAccessToken(e.target.value)}
                          placeholder="Your LinkedIn Access Token"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleLinkedInOAuth} variant="outline" className="flex-1">
                          <LinkSimple size={16} className="mr-2" />
                          OAuth Flow
                        </Button>
                        <Button onClick={handleSaveLinkedIn} className="flex-1">
                          <Check size={16} className="mr-2" />
                          Save Token
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {credentials?.linkedin?.connected && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyConnection('linkedin')}
                      disabled={verifying === 'linkedin'}
                    >
                      {verifying === 'linkedin' ? 'Verifying...' : 'Test'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => disconnectPlatform('linkedin')}
                    >
                      <X size={16} />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-accent/10">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Key size={20} weight="duotone" />
              How to Get API Credentials
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Twitter:</strong> Visit <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent underline">developer.twitter.com</a> → Create a Project → Enable OAuth 2.0 → Get Bearer Token
              </div>
              <div>
                <strong>Facebook:</strong> Visit <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-accent underline">developers.facebook.com</a> → Create App → Get App ID/Secret → Generate Page Access Token
              </div>
              <div>
                <strong>LinkedIn:</strong> Visit <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-accent underline">linkedin.com/developers</a> → Create App → Request API Access → Get Client ID/Secret
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
