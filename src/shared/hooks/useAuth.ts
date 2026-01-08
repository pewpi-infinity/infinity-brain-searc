/**
 * useAuth Hook - React hook for authentication state
 */

import { useState, useEffect } from 'react';
import { authService, type User } from '../services/auth-service';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: 'magic-link' | 'github' | null;
  login: {
    withMagicLink: (email: string) => Promise<{ token: string; devLink: string }>;
    verifyMagicLink: (token: string) => Promise<User>;
    withGitHub: (githubUser: any) => Promise<User>;
  };
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth service
    const init = async () => {
      try {
        const currentUser = await authService.initialize();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Check for magic link token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('magic_token');
    if (magicToken) {
      authService.loginWithMagicLink(magicToken)
        .then(user => {
          setUser(user);
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch(error => {
          console.error('Failed to verify magic link', error);
        });
    }

    // Listen for login/logout events
    const handleLoginChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUser(customEvent.detail.user);
    };

    window.addEventListener('pewpi.login.changed', handleLoginChange);

    return () => {
      window.removeEventListener('pewpi.login.changed', handleLoginChange);
    };
  }, []);

  const login = {
    withMagicLink: async (email: string) => {
      return await authService.requestMagicLink(email);
    },
    verifyMagicLink: async (token: string) => {
      const user = await authService.loginWithMagicLink(token);
      setUser(user);
      return user;
    },
    withGitHub: async (githubUser: any) => {
      const user = await authService.loginWithGitHubUser(githubUser);
      setUser(user);
      return user;
    },
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    authMethod: authService.getAuthMethod(),
    login,
    logout,
  };
}
