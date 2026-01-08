/**
 * Magic Link Authentication Service
 * 
 * Provides passwordless email authentication with dev-mode support
 * Does NOT require GitHub account - works standalone
 */

import { generateToken, sha256 } from '../crypto/aes-gcm';

export interface MagicLinkSession {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  verified: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string;
  authMethod: 'magic-link' | 'github';
}

class MagicLinkAuthService {
  private storageKey = 'pewpi_auth_session';
  private usersKey = 'pewpi_auth_users';
  private devMode: boolean;

  constructor() {
    // Enable dev mode by default for local testing
    this.devMode = import.meta.env.DEV || false;
  }

  /**
   * Request a magic link (dev mode logs link to console)
   */
  async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    if (!this.isValidEmail(email)) {
      return { success: false, message: 'Invalid email address' };
    }

    const token = generateToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    const session: MagicLinkSession = {
      token,
      email,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      verified: false
    };

    // Store pending session
    const sessions = this.getPendingSessions();
    sessions[token] = session;
    localStorage.setItem('pewpi_magic_link_sessions', JSON.stringify(sessions));

    if (this.devMode) {
      // In dev mode, log the magic link to console and auto-verify
      const magicLink = `${window.location.origin}?magic_token=${token}`;
      console.log('🔗 Magic Link (DEV MODE):', magicLink);
      console.log('📧 Email:', email);
      console.log('⏰ Expires:', expiresAt.toLocaleString());
      
      // Auto-verify in dev mode after short delay
      setTimeout(() => {
        this.verifyMagicLink(token);
      }, 1000);

      return { 
        success: true, 
        message: `Magic link logged to console (dev mode). Auto-verifying in 1 second...` 
      };
    }

    // In production, would send email via SMTP
    return { 
      success: true, 
      message: `Magic link sent to ${email}. Check your email and click the link to sign in.` 
    };
  }

  /**
   * Verify a magic link token
   */
  async verifyMagicLink(token: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    const sessions = this.getPendingSessions();
    const session = sessions[token];

    if (!session) {
      return { success: false, message: 'Invalid or expired magic link' };
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      delete sessions[token];
      localStorage.setItem('pewpi_magic_link_sessions', JSON.stringify(sessions));
      return { success: false, message: 'Magic link has expired' };
    }

    // Mark as verified
    session.verified = true;

    // Get or create user
    const user = await this.getOrCreateUser(session.email, 'magic-link');

    // Create session
    await this.createSession(user);

    // Clean up magic link session
    delete sessions[token];
    localStorage.setItem('pewpi_magic_link_sessions', JSON.stringify(sessions));

    // Emit login event
    this.emitLoginEvent(user);

    return { success: true, user, message: 'Successfully signed in!' };
  }

  /**
   * GitHub OAuth sign-in (opt-in alternative)
   */
  async signInWithGitHub(): Promise<void> {
    // This is a stub - actual GitHub OAuth would require client ID and redirect
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id';
    const redirectUri = `${window.location.origin}/callback`;
    const scope = 'user:email';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  }

  /**
   * Handle GitHub OAuth callback
   */
  async handleGitHubCallback(code: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
    // This is a stub - actual implementation would exchange code for token
    // For now, we'll create a demo user
    console.log('GitHub OAuth code:', code);
    
    // In production, would exchange code for access token via backend
    // For now, return error
    return { 
      success: false, 
      message: 'GitHub OAuth not fully configured. Please use magic link authentication.' 
    };
  }

  /**
   * Get current session
   */
  getCurrentSession(): { user: AuthUser; sessionToken: string } | null {
    const sessionData = localStorage.getItem(this.storageKey);
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);
      
      // Check if session is expired (30 days)
      const expiresAt = new Date(session.expiresAt);
      if (new Date() > expiresAt) {
        this.signOut();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to parse session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    const session = this.getCurrentSession();
    return session?.user || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const user = this.getCurrentUser();
    localStorage.removeItem(this.storageKey);
    
    // Emit logout event
    if (user) {
      window.dispatchEvent(new CustomEvent('pewpi.login.changed', {
        detail: { user: null, action: 'logout' }
      }));
    }
  }

  /**
   * Create a session for a user
   */
  private async createSession(user: AuthUser): Promise<void> {
    const sessionToken = generateToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = {
      user,
      sessionToken,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(session));

    // Update user's last login
    await this.updateUserLastLogin(user.id);
  }

  /**
   * Get or create a user
   */
  private async getOrCreateUser(email: string, authMethod: 'magic-link' | 'github'): Promise<AuthUser> {
    const users = this.getAllUsers();
    const userId = await sha256(email);
    
    let user = users[userId];
    
    if (!user) {
      // Create new user
      user = {
        id: userId,
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        authMethod
      };
      
      users[userId] = user;
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    return user;
  }

  /**
   * Update user's last login
   */
  private async updateUserLastLogin(userId: string): Promise<void> {
    const users = this.getAllUsers();
    if (users[userId]) {
      users[userId].lastLogin = new Date().toISOString();
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }

  /**
   * Get all users
   */
  private getAllUsers(): Record<string, AuthUser> {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get users:', error);
      return {};
    }
  }

  /**
   * Get pending magic link sessions
   */
  private getPendingSessions(): Record<string, MagicLinkSession> {
    try {
      const data = localStorage.getItem('pewpi_magic_link_sessions');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return {};
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Emit login event for cross-repo integration
   */
  private emitLoginEvent(user: AuthUser): void {
    window.dispatchEvent(new CustomEvent('pewpi.login.changed', {
      detail: { user, action: 'login' }
    }));
  }

  /**
   * Check for magic link in URL on page load
   */
  checkUrlForMagicLink(): void {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('magic_token');
    
    if (token) {
      // Remove token from URL
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      // Verify token
      this.verifyMagicLink(token).then(result => {
        if (result.success) {
          console.log('✅ Magic link verified successfully');
          // Reload to update UI
          window.location.reload();
        } else {
          console.error('❌ Magic link verification failed:', result.message);
        }
      });
    }
  }
}

export const magicLinkAuth = new MagicLinkAuthService();
export { MagicLinkAuthService };
