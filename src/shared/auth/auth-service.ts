/**
 * AuthService - Production authentication with passwordless magic-link and optional GitHub OAuth
 * Dev-mode magic-link works without SMTP for local testing
 */

import { ClientModel, createModel } from '../client-model';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  authMethod: 'magic-link' | 'github';
  verified: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  lastActive: string;
  fingerprint?: string;
}

export interface MagicLinkToken {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// Models
const UserModel = createModel<User>('users', {
  email: { type: 'string', required: true },
  username: { type: 'string', required: true },
  displayName: { type: 'string', required: false },
  avatar: { type: 'string', required: false },
  authMethod: { type: 'string', required: true },
  verified: { type: 'boolean', default: false },
  lastLogin: { type: 'string', default: () => new Date().toISOString() }
});

const SessionModel = createModel<Session>('sessions', {
  userId: { type: 'string', required: true },
  token: { type: 'string', required: true },
  expiresAt: { type: 'string', required: true },
  lastActive: { type: 'string', default: () => new Date().toISOString() },
  fingerprint: { type: 'string', required: false }
});

const MagicLinkModel = createModel<MagicLinkToken>('magic_links', {
  email: { type: 'string', required: true },
  token: { type: 'string', required: true },
  expiresAt: { type: 'string', required: true },
  used: { type: 'boolean', default: false }
});

class AuthServiceClass {
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private devMode = true; // Enable dev-mode by default for local testing

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Try to restore session from storage
    const sessionToken = localStorage.getItem('pewpi_session_token');
    if (sessionToken) {
      await this.restoreSession(sessionToken);
    }

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'pewpi_session_token') {
        if (e.newValue) {
          this.restoreSession(e.newValue);
        } else {
          this.logout();
        }
      }
    });
  }

  /**
   * Generate browser fingerprint for security
   */
  private generateFingerprint(): string {
    const screen = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    return `${screen}-${timezone}-${language}`;
  }

  /**
   * Generate random token
   */
  private generateToken(): string {
    return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Request magic-link for passwordless login (Dev-mode)
   */
  async requestMagicLink(email: string): Promise<{ success: boolean; devLink?: string; message: string }> {
    if (!this.isValidEmail(email)) {
      return {
        success: false,
        message: 'Invalid email address'
      };
    }

    try {
      // Check if user exists, create if not
      let user = await UserModel.findOne({ email });
      
      if (!user) {
        // Auto-register user
        const username = email.split('@')[0];
        user = await UserModel.create({
          email,
          username,
          displayName: username,
          authMethod: 'magic-link',
          verified: false,
          lastLogin: new Date().toISOString()
        });
        console.log('[AuthService] Auto-registered user:', user.id);
      }

      // Generate magic link token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

      await MagicLinkModel.create({
        email,
        token,
        expiresAt,
        used: false
      });

      if (this.devMode) {
        // In dev-mode, return the magic link directly
        const magicLink = `${window.location.origin}${window.location.pathname}?magic_token=${token}`;
        console.log('[AuthService] Dev-mode magic link:', magicLink);
        
        return {
          success: true,
          devLink: magicLink,
          message: 'Magic link generated (dev-mode). Click the link to login.'
        };
      } else {
        // In production, this would send an email via SMTP
        // For now, just log it
        console.log('[AuthService] Would send email to:', email);
        
        return {
          success: true,
          message: 'Magic link sent to your email. Check your inbox.'
        };
      }
    } catch (error) {
      console.error('[AuthService] Failed to request magic link:', error);
      return {
        success: false,
        message: 'Failed to send magic link. Please try again.'
      };
    }
  }

  /**
   * Verify magic-link token and login
   */
  async verifyMagicLink(token: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // Find the magic link token
      const magicLink = await MagicLinkModel.findOne({ token, used: false });
      
      if (!magicLink) {
        return {
          success: false,
          message: 'Invalid or expired magic link'
        };
      }

      // Check if expired
      if (new Date(magicLink.expiresAt) < new Date()) {
        return {
          success: false,
          message: 'Magic link has expired'
        };
      }

      // Mark as used
      await MagicLinkModel.findByIdAndUpdate(magicLink._id, { used: true }, { new: true });

      // Find user
      const user = await UserModel.findOne({ email: magicLink.email });
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user as verified
      const updatedUser = await UserModel.findByIdAndUpdate(
        user._id,
        { verified: true, lastLogin: new Date().toISOString() },
        { new: true }
      );

      if (!updatedUser) {
        return {
          success: false,
          message: 'Failed to update user'
        };
      }

      // Create session
      const session = await this.createSession(updatedUser);

      // Set current user and session
      this.currentUser = updatedUser;
      this.currentSession = session;

      // Save session to localStorage
      localStorage.setItem('pewpi_session_token', session.token);
      localStorage.setItem('pewpi_user', JSON.stringify(updatedUser));

      // Emit login event
      window.dispatchEvent(new CustomEvent('pewpi.login.changed', {
        detail: { user: updatedUser, loggedIn: true }
      }));

      console.log('[AuthService] User logged in via magic link:', updatedUser.email);

      return {
        success: true,
        user: updatedUser,
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('[AuthService] Failed to verify magic link:', error);
      return {
        success: false,
        message: 'Failed to verify magic link. Please try again.'
      };
    }
  }

  /**
   * GitHub OAuth login (opt-in)
   */
  async loginWithGitHub(): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      // This would integrate with GitHub OAuth in production
      // For now, we'll use the Spark user if available
      const sparkUser = await (window as any).spark?.user();
      
      if (!sparkUser || !sparkUser.login) {
        return {
          success: false,
          message: 'GitHub login not available. Please use magic-link instead.'
        };
      }

      // Check if user exists
      let user = await UserModel.findOne({ username: sparkUser.login });
      
      if (!user) {
        // Register new user from GitHub
        user = await UserModel.create({
          email: sparkUser.email || `${sparkUser.login}@github.local`,
          username: sparkUser.login,
          displayName: sparkUser.login,
          avatar: sparkUser.avatarUrl,
          authMethod: 'github',
          verified: true,
          lastLogin: new Date().toISOString()
        });
      } else {
        // Update last login
        user = await UserModel.findByIdAndUpdate(
          user._id,
          { lastLogin: new Date().toISOString() },
          { new: true }
        );
      }

      if (!user) {
        return {
          success: false,
          message: 'Failed to create user'
        };
      }

      // Create session
      const session = await this.createSession(user);

      this.currentUser = user;
      this.currentSession = session;

      localStorage.setItem('pewpi_session_token', session.token);
      localStorage.setItem('pewpi_user', JSON.stringify(user));

      window.dispatchEvent(new CustomEvent('pewpi.login.changed', {
        detail: { user, loggedIn: true }
      }));

      console.log('[AuthService] User logged in via GitHub:', user.username);

      return {
        success: true,
        user,
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('[AuthService] GitHub login failed:', error);
      return {
        success: false,
        message: 'GitHub login failed. Please try again.'
      };
    }
  }

  /**
   * Create a new session
   */
  private async createSession(user: User): Promise<Session> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const session = await SessionModel.create({
      userId: user.id,
      token,
      expiresAt,
      lastActive: new Date().toISOString(),
      fingerprint: this.generateFingerprint()
    });

    return session;
  }

  /**
   * Restore session from token
   */
  private async restoreSession(token: string): Promise<boolean> {
    try {
      const session = await SessionModel.findOne({ token });
      
      if (!session) {
        return false;
      }

      // Check if expired
      if (new Date(session.expiresAt) < new Date()) {
        await SessionModel.findByIdAndDelete(session._id);
        return false;
      }

      // Find user
      const user = await UserModel.findById(session.userId);
      if (!user) {
        return false;
      }

      // Update last active
      await SessionModel.findByIdAndUpdate(
        session._id,
        { lastActive: new Date().toISOString() },
        { new: true }
      );

      this.currentUser = user;
      this.currentSession = session;

      console.log('[AuthService] Session restored:', user.email);
      return true;
    } catch (error) {
      console.error('[AuthService] Failed to restore session:', error);
      return false;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (this.currentSession) {
      await SessionModel.findByIdAndDelete(this.currentSession._id);
    }

    this.currentUser = null;
    this.currentSession = null;

    localStorage.removeItem('pewpi_session_token');
    localStorage.removeItem('pewpi_user');

    window.dispatchEvent(new CustomEvent('pewpi.login.changed', {
      detail: { user: null, loggedIn: false }
    }));

    console.log('[AuthService] User logged out');
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Enable/disable dev-mode
   */
  setDevMode(enabled: boolean): void {
    this.devMode = enabled;
    console.log(`[AuthService] Dev-mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Singleton instance
export const AuthService = new AuthServiceClass();
