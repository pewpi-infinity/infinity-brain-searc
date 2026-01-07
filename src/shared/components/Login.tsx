/**
 * Login Component - Production login with magic-link and GitHub OAuth
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { EnvelopeSimple, GithubLogo, Check, Warning } from '@phosphor-icons/react';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { token, devLink } = await login.withMagicLink(email);
      setMagicLinkSent(true);
      setDevLink(devLink);
      
      toast.success('Magic link generated!', {
        description: 'Check the console for your dev-mode login link',
      });
    } catch (error: any) {
      toast.error('Failed to generate magic link', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      // Check if running in Spark environment
      if (typeof window !== 'undefined' && (window as any).spark) {
        const sparkUser = await (window as any).spark.user();
        if (sparkUser && sparkUser.login) {
          await login.withGitHub({
            id: sparkUser.id,
            login: sparkUser.login,
            email: sparkUser.email,
            avatarUrl: sparkUser.avatarUrl,
            name: sparkUser.login,
          });
          toast.success('Logged in with GitHub!');
          return;
        }
      }

      toast.error('GitHub login not available', {
        description: 'Use magic-link authentication or run in Spark environment',
      });
    } catch (error: any) {
      toast.error('GitHub login failed', {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 cosmic-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <EnvelopeSimple size={32} className="text-primary" weight="duotone" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome to Infinity Brain</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your wallet and tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!magicLinkSent ? (
            <>
              {/* Magic Link Login */}
              <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    No password required. We'll send you a magic link.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  <EnvelopeSimple size={18} className="mr-2" weight="duotone" />
                  {isLoading ? 'Generating Link...' : 'Send Magic Link'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* GitHub OAuth (Optional) */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGitHubLogin}
              >
                <GithubLogo size={18} className="mr-2" weight="fill" />
                GitHub (Optional)
              </Button>

              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Check size={14} className="mr-1" weight="bold" />
                  No GitHub account required
                </Badge>
                <p className="text-xs text-center text-muted-foreground">
                  Default authentication works for everyone
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <Check size={24} className="text-green-500 mr-2" weight="bold" />
                <span className="text-green-500 font-medium">Magic link generated!</span>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Dev Mode: Click to Login</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => window.location.href = devLink}
                >
                  <div className="flex-1 break-all text-xs font-mono">
                    {devLink}
                  </div>
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Warning size={20} className="text-amber-500 flex-shrink-0 mt-0.5" weight="fill" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Dev Mode:</strong> In production, this link would be sent to your email.
                  For local development, click the button above or check the console.
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMagicLinkSent(false);
                  setDevLink('');
                  setEmail('');
                }}
              >
                Try different email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
