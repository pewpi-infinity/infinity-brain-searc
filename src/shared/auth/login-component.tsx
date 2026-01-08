/**
 * Login Component - Passwordless magic-link authentication with optional GitHub OAuth
 */

import { useState, useEffect } from 'react';
import { AuthService } from './auth-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, Github, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LoginComponentProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginComponent({ open, onClose, onSuccess }: LoginComponentProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Check for magic token in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('magic_token');
    
    if (magicToken) {
      handleMagicLinkVerification(magicToken);
    }
  }, []);

  const handleMagicLinkVerification = async (token: string) => {
    setIsLoading(true);
    try {
      const result = await AuthService.verifyMagicLink(token);
      
      if (result.success && result.user) {
        setStatus({
          type: 'success',
          message: result.message
        });
        toast.success(`Welcome, ${result.user.displayName || result.user.username}!`);
        
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('magic_token');
        window.history.replaceState({}, '', url.toString());
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        }
      } else {
        setStatus({
          type: 'error',
          message: result.message
        });
        toast.error(result.message);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to verify magic link'
      });
      toast.error('Failed to verify magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus({
        type: 'error',
        message: 'Please enter your email address'
      });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: '' });
    setMagicLink(null);

    try {
      const result = await AuthService.requestMagicLink(email);
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: result.message
        });
        
        if (result.devLink) {
          setMagicLink(result.devLink);
          toast.success('Magic link generated! Click the link below to login.');
        } else {
          toast.success('Check your email for the magic link!');
        }
      } else {
        setStatus({
          type: 'error',
          message: result.message
        });
        toast.error(result.message);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send magic link. Please try again.'
      });
      toast.error('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await AuthService.loginWithGitHub();
      
      if (result.success && result.user) {
        setStatus({
          type: 'success',
          message: result.message
        });
        toast.success(`Welcome, ${result.user.displayName || result.user.username}!`);
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        }
      } else {
        setStatus({
          type: 'info',
          message: result.message
        });
        toast.info(result.message);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'GitHub login failed. Please try magic-link instead.'
      });
      toast.error('GitHub login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkClick = () => {
    if (magicLink) {
      window.location.href = magicLink;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
          <DialogDescription>
            Sign in to access your wallet and tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Alert */}
          {status.type && (
            <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
              {status.type === 'success' && <Check className="h-4 w-4" />}
              {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
              {status.type === 'info' && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {/* Magic Link Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Passwordless Login
              </CardTitle>
              <CardDescription>
                Enter your email to receive a magic link
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>

              {/* Dev Mode Magic Link Display */}
              {magicLink && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">Dev-mode Magic Link:</p>
                  <Button
                    variant="outline"
                    className="w-full text-left justify-start font-mono text-xs"
                    onClick={handleMagicLinkClick}
                  >
                    {magicLink}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click the link above to login (dev-mode only)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* GitHub OAuth (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub (Optional)
              </CardTitle>
              <CardDescription>
                Sign in with your GitHub account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGitHubLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Continue with GitHub
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                GitHub login is optional. Magic-link is the default.
              </p>
            </CardContent>
          </Card>

          {/* Info Box */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>
              🔒 Your account works across all Pewpi repositories
            </p>
            <p>
              💎 New users receive welcome bonuses
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
