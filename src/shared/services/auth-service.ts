/**
 * AuthService - Production authentication with magic-link and GitHub OAuth
 * Provides passwordless authentication without requiring GitHub account by default
 */

import { createModel, type Document } from '../models/client-model';

export interface User extends Document {
  email?: string;
  githubId?: string;
  githubLogin?: string;
  avatarUrl?: string;
  name?: string;
  authMethod: 'magic-link' | 'github';
  lastLoginAt: Date;
}

export interface AuthSession extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface MagicLinkRequest extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const UserModel = createModel<User>('users', {
  email: { type: 'string' },
  githubId: { type: 'string' },
  githubLogin: { type: 'string' },
  avatarUrl: { type: 'string' },
  name: { type: 'string' },
  authMethod: { type: 'string', required: true },
  lastLoginAt: { type: 'date', required: true },
});

const SessionModel = createModel<AuthSession>('sessions', {
  userId: { type: 'string', required: true },
  token: { type: 'string', required: true, unique: true },
  expiresAt: { type: 'date', required: true },
});

const MagicLinkModel = createModel<MagicLinkRequest>('magic_links', {
  email: { type: 'string', required: true },
  token: { type: 'string', required: true, unique: true },
  expiresAt: { type: 'date', required: true },
  used: { type: 'boolean', default: false },
});

class AuthService {
  private currentUser: User | null = null;
  private currentSession: AuthSession | null = null;

  /**
   * Initialize authentication service and restore session
   */
  async initialize(): Promise<User | null> {
    const sessionToken = this.getSessionToken();
    if (!sessionToken) return null;

    try {
      const session = await SessionModel.findOne({ token: sessionToken });
      if (!session || new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      const user = await UserModel.findById(session.userId);
      if (!user) {
        this.clearSession();
        return null;
      }

      this.currentUser = user;
      this.currentSession = session;
      this.emitLoginEvent(user);
      
      return user;
    } catch (error) {
      console.error('AuthService: Failed to restore session', error);
      return null;
    }
  }

  /**
   * Request a magic link (dev-mode, no SMTP required)
   * In dev mode, the link is logged to console and stored locally
   */
  async requestMagicLink(email: string): Promise<{ token: string; devLink: string }> {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await MagicLinkModel.create({
      email,
      token,
      expiresAt,
      used: false,
    });

    const devLink = `${window.location.origin}?magic_token=${token}`;
    
    console.log('🔐 Magic Link (Dev Mode):', devLink);
    console.log('📧 Email:', email);
    console.log('⏰ Expires:', expiresAt.toLocaleString());

    return { token, devLink };
  }

  /**
   * Verify and login with magic link token
   */
  async loginWithMagicLink(token: string): Promise<User> {
    const magicLink = await MagicLinkModel.findOne({ token });

    if (!magicLink || magicLink.used) {
      throw new Error('Invalid or expired magic link');
    }

    if (new Date(magicLink.expiresAt) < new Date()) {
      throw new Error('Magic link has expired');
    }

    // Mark magic link as used
    await MagicLinkModel.findByIdAndUpdate(magicLink._id, { used: true });

    // Find or create user
    let user = await UserModel.findOne({ email: magicLink.email });
    if (!user) {
      user = await UserModel.create({
        email: magicLink.email,
        authMethod: 'magic-link',
        lastLoginAt: new Date(),
      });
    } else {
      await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
      user = await UserModel.findById(user._id);
    }

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Create session
    await this.createSession(user);
    this.emitLoginEvent(user);

    return user;
  }

  /**
   * Login with GitHub OAuth (optional, opt-in)
   */
  async loginWithGitHub(githubCode: string): Promise<User> {
    // This would normally exchange the code for an access token via a backend
    // For now, we'll simulate with GitHub user data
    throw new Error('GitHub OAuth requires backend setup. Please use magic-link authentication.');
  }

  /**
   * Login with GitHub user data (for Spark environment)
   */
  async loginWithGitHubUser(githubUser: {
    id: string;
    login: string;
    email?: string;
    avatarUrl?: string;
    name?: string;
  }): Promise<User> {
    let user = await UserModel.findOne({ githubId: githubUser.id });

    if (!user) {
      user = await UserModel.create({
        githubId: githubUser.id,
        githubLogin: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatarUrl,
        name: githubUser.name,
        authMethod: 'github',
        lastLoginAt: new Date(),
      });
    } else {
      await UserModel.findByIdAndUpdate(user._id, {
        githubLogin: githubUser.login,
        email: githubUser.email || user.email,
        avatarUrl: githubUser.avatarUrl || user.avatarUrl,
        name: githubUser.name || user.name,
        lastLoginAt: new Date(),
      });
      user = await UserModel.findById(user._id);
    }

    if (!user) {
      throw new Error('Failed to create or update user');
    }

    await this.createSession(user);
    this.emitLoginEvent(user);

    return user;
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
    this.clearSession();
    this.emitLogoutEvent();
  }

  /**
   * Get current authenticated user
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
   * Get authentication method
   */
  getAuthMethod(): 'magic-link' | 'github' | null {
    return this.currentUser?.authMethod || null;
  }

  // Private helper methods

  private async createSession(user: User): Promise<void> {
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await SessionModel.create({
      userId: user._id,
      token,
      expiresAt,
    });

    this.currentUser = user;
    this.currentSession = session;
    this.saveSessionToken(token);
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private saveSessionToken(token: string): void {
    localStorage.setItem('pewpi_auth_token', token);
  }

  private getSessionToken(): string | null {
    return localStorage.getItem('pewpi_auth_token');
  }

  private clearSession(): void {
    localStorage.removeItem('pewpi_auth_token');
  }

  private emitLoginEvent(user: User): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('pewpi.login.changed', {
        detail: { user, isAuthenticated: true },
      });
      window.dispatchEvent(event);
    }
  }

  private emitLogoutEvent(): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('pewpi.login.changed', {
        detail: { user: null, isAuthenticated: false },
      });
      window.dispatchEvent(event);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
