import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TwitterLogo, 
  FacebookLogo, 
  LinkedinLogo,
  Info,
  CheckCircle,
  Warning,
  Link as LinkIcon
} from '@phosphor-icons/react'

export function SocialAPIGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info size={28} weight="duotone" className="text-accent" />
          Social Media API Setup Guide
        </CardTitle>
        <CardDescription>
          Step-by-step instructions to connect your social media accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="twitter" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="twitter" className="flex items-center gap-2">
              <TwitterLogo size={20} weight="duotone" />
              Twitter/X
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <FacebookLogo size={20} weight="duotone" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-2">
              <LinkedinLogo size={20} weight="duotone" />
              LinkedIn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twitter" className="space-y-4">
            <Alert>
              <TwitterLogo size={20} weight="duotone" />
              <AlertTitle>Twitter/X API Setup</AlertTitle>
              <AlertDescription>
                Follow these steps to get your Twitter API credentials
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Create a Twitter Developer Account</p>
                  <a 
                    href="https://developer.twitter.com/en/portal/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={14} />
                    Visit Twitter Developer Portal
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Create a New Project & App</p>
                  <p className="text-sm text-muted-foreground">
                    Give your app a name and description related to Infinity Brain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Enable OAuth 2.0</p>
                  <p className="text-sm text-muted-foreground">
                    In Settings → User authentication settings → Enable OAuth 2.0
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set Type: "Web App" with Read and Write permissions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Configure Callback URL</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {window.location.origin}/oauth/callback
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">5</Badge>
                <div>
                  <p className="font-medium">Get Your Credentials</p>
                  <p className="text-sm text-muted-foreground">
                    Go to "Keys and Tokens" tab to find:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Client ID (OAuth 2.0)</li>
                    <li>Client Secret (OAuth 2.0)</li>
                    <li>Bearer Token</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle size={24} weight="fill" className="text-accent mt-1" />
                <div>
                  <p className="font-medium">Enter Credentials in Setup Tab</p>
                  <p className="text-sm text-muted-foreground">
                    Use either OAuth flow or paste Bearer Token directly
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-accent/10 border-accent">
              <Info size={20} weight="duotone" />
              <AlertTitle>Rate Limits</AlertTitle>
              <AlertDescription>
                Free tier: 50 tweets per 24 hours | Premium tiers available for higher limits
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="facebook" className="space-y-4">
            <Alert>
              <FacebookLogo size={20} weight="duotone" />
              <AlertTitle>Facebook API Setup</AlertTitle>
              <AlertDescription>
                Follow these steps to get your Facebook API credentials
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Create a Facebook Developer Account</p>
                  <a 
                    href="https://developers.facebook.com/apps/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={14} />
                    Visit Facebook Developers
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Create a New App</p>
                  <p className="text-sm text-muted-foreground">
                    Choose "Business" type for posting capabilities
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Add Facebook Login Product</p>
                  <p className="text-sm text-muted-foreground">
                    From the dashboard, add "Facebook Login" product
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Configure OAuth Redirect</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {window.location.origin}/oauth/callback
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">5</Badge>
                <div>
                  <p className="font-medium">Get App Credentials</p>
                  <p className="text-sm text-muted-foreground">
                    Settings → Basic:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>App ID</li>
                    <li>App Secret</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">6</Badge>
                <div>
                  <p className="font-medium">Generate Page Access Token</p>
                  <p className="text-sm text-muted-foreground">
                    Tools → Access Token Tool → Select your page → Generate long-lived token
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">7</Badge>
                <div>
                  <p className="font-medium">Get Your Page ID</p>
                  <p className="text-sm text-muted-foreground">
                    Go to your Facebook Page → About → Page ID
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle size={24} weight="fill" className="text-accent mt-1" />
                <div>
                  <p className="font-medium">Enter All Credentials in Setup Tab</p>
                  <p className="text-sm text-muted-foreground">
                    App ID, App Secret, Page Access Token, and Page ID
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-accent/10 border-accent">
              <Info size={20} weight="duotone" />
              <AlertTitle>Important Notes</AlertTitle>
              <AlertDescription>
                Page Access Tokens expire - regenerate as needed. Posts must comply with Facebook's content policies.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-4">
            <Alert>
              <LinkedinLogo size={20} weight="duotone" />
              <AlertTitle>LinkedIn API Setup</AlertTitle>
              <AlertDescription>
                Follow these steps to get your LinkedIn API credentials
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Create a LinkedIn Developer Account</p>
                  <a 
                    href="https://www.linkedin.com/developers/apps" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={14} />
                    Visit LinkedIn Developers
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Create a New App</p>
                  <p className="text-sm text-muted-foreground">
                    Associate it with a LinkedIn Page you manage
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Request API Access</p>
                  <p className="text-sm text-muted-foreground">
                    Products tab → Request access to:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Share on LinkedIn</li>
                    <li>Sign In with LinkedIn</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Configure OAuth Settings</p>
                  <p className="text-sm text-muted-foreground">Auth tab → Add redirect URL:</p>
                  <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                    {window.location.origin}/oauth/callback
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">5</Badge>
                <div>
                  <p className="font-medium">Get Your Credentials</p>
                  <p className="text-sm text-muted-foreground">
                    Auth tab to find:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                    <li>Client ID</li>
                    <li>Client Secret</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="mt-1">6</Badge>
                <div>
                  <p className="font-medium">Generate Access Token</p>
                  <p className="text-sm text-muted-foreground">
                    Use OAuth flow to get your access token with required scopes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle size={24} weight="fill" className="text-accent mt-1" />
                <div>
                  <p className="font-medium">Enter Credentials in Setup Tab</p>
                  <p className="text-sm text-muted-foreground">
                    Client ID, Client Secret, and Access Token
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-accent/10 border-accent">
              <Info size={20} weight="duotone" />
              <AlertTitle>Rate Limits</AlertTitle>
              <AlertDescription>
                100 posts per day per member | 3000 character limit | Professional content recommended
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <Alert className="mt-6">
          <Warning size={20} weight="duotone" />
          <AlertTitle>Security Note</AlertTitle>
          <AlertDescription>
            Never share your API keys, secrets, or access tokens. Credentials are stored securely in your browser.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
