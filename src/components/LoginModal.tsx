/**
 * Login Component
 * 
 * Provides two authentication methods:
 * 1. Magic Link (passwordless) - Default, no GitHub required
 * 2. GitHub OAuth - Optional social login
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Github, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { magicLinkAuth } from '@/shared/auth/magic-link-auth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await magicLinkAuth.requestMagicLink(email);
      
      if (result.success) {
        toast.success('Magic link sent!', {
          description: result.message,
          duration: 10000
        });
        
        // In dev mode, auto-verify happens quickly
        setTimeout(() => {
          if (magicLinkAuth.isAuthenticated()) {
            onSuccess();
            onClose();
          }
        }, 2000);
      } else {
        toast.error('Failed to send magic link', {
          description: result.message
        });
      }
    } catch (error) {
      console.error('Magic link error:', error);
      toast.error('An error occurred', {
        description: 'Please try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await magicLinkAuth.signInWithGitHub();
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error('GitHub OAuth not configured', {
        description: 'Please use magic link authentication instead'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Sign In to Infinity Brain
          </DialogTitle>
          <DialogDescription>
            Choose your preferred authentication method
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="magic-link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="magic-link" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Magic Link
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              GitHub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="magic-link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No password needed! We'll send you a magic link to sign in securely.
              </p>
              {import.meta.env.DEV && (
                <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2 rounded">
                  🔧 Dev Mode: Magic link will be logged to console and auto-verified
                </p>
              )}
            </div>

            <form onSubmit={handleMagicLinkRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="github" className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Sign in with your GitHub account (optional alternative)
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                ⚠️ GitHub OAuth requires additional configuration. Use Magic Link for instant access.
              </p>
            </div>

            <Button
              onClick={handleGitHubLogin}
              variant="outline"
              className="w-full"
            >
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs text-muted-foreground mt-4">
          By signing in, you agree to our terms and privacy policy
        </div>
      </DialogContent>
    </Dialog>
  );
}
