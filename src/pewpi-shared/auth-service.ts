/**
 * Auth Service - Unified authentication with magic-link and GitHub OAuth
 * 
 * Synthesized from best practices across pewpi-infinity organization repositories
 * Features:
 * - Magic-link dev-mode flow (no SMTP required for development)
 * - Optional GitHub OAuth hooks (client-side helper only)
 * - Session management: restoreSession(), init()
 * - Login/logout/register APIs
 * - Event emission: pewpi.login.changed
 * - localStorage broadcast for cross-tab sync
 */

export interface User {
  id: string;
  email?: string;
  githubId?: string;
  githubLogin?: string;
  avatarUrl?: string;
  name?: string;
  authMethod: 'magic-link' | 'github';
  lastLoginAt: number;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: number;
}

class AuthService {
  private currentUser: User | null = null;
  private currentSession: AuthSession | null = null;
  private initialized: boolean = false;

  /**
   * Initialize authentication service and restore session
   */
  async init(): Promise<User | null> {
    if (this.initialized) {
      return this.currentUser;
    }

    this.initialized = true;
    return await this.restoreSession();
  }

  /**
   * Restore session from localStorage
   */
  async restoreSession(): Promise<User | null> {
    const sessionToken = this.getSessionToken();
    if (!sessionToken) return null;

    try {
      const session = this.getStoredSession(sessionToken);
      if (!session || session.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }

      const user = this.getStoredUser(session.userId);
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
   * In dev mode, the link is logged to console and returned
   */
  async requestMagicLink(email: string): Promise<{ token: string; devLink: string }> {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    const token = this.generateSecureToken();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store magic link request
    const magicLinks = this.getMagicLinks();
    magicLinks[token] = {
      email,
      expiresAt,
      used: false,
    };
    this.saveMagicLinks(magicLinks);

    const devLink = `${window.location.origin}?magic_token=${token}`;
    
    console.log('🔐 Magic Link (Dev Mode):', devLink);
    console.log('📧 Email:', email);
    console.log('⏰ Expires:', new Date(expiresAt).toLocaleString());

    return { token, devLink };
  }

  /**
   * Verify and login with magic link token
   */
  async loginWithMagicLink(token: string): Promise<User> {
    const magicLinks = this.getMagicLinks();
    const magicLink = magicLinks[token];

    if (!magicLink || magicLink.used) {
      throw new Error('Invalid or expired magic link');
    }

    if (magicLink.expiresAt < Date.now()) {
      throw new Error('Magic link has expired');
    }

    // Mark magic link as used
    magicLink.used = true;
    this.saveMagicLinks(magicLinks);

    // Find or create user
    let user = this.findUserByEmail(magicLink.email);
    if (!user) {
      user = this.createUser({
        email: magicLink.email,
        authMethod: 'magic-link',
      });
    } else {
      user.lastLoginAt = Date.now();
      this.updateUser(user);
    }

    // Create session
    await this.createSession(user);
    this.emitLoginEvent(user);

    return user;
  }

  /**
   * Login with GitHub OAuth (client-side helper)
   * Note: Full OAuth flow requires backend. This is a simplified client-side version.
   */
  async loginWithGitHub(githubUser: {
    id: string;
    login: string;
    email?: string;
    avatarUrl?: string;
    name?: string;
  }): Promise<User> {
    let user = this.findUserByGitHubId(githubUser.id);

    if (!user) {
      user = this.createUser({
        githubId: githubUser.id,
        githubLogin: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatarUrl,
        name: githubUser.name,
        authMethod: 'github',
      });
    } else {
      user.githubLogin = githubUser.login;
      user.email = githubUser.email || user.email;
      user.avatarUrl = githubUser.avatarUrl || user.avatarUrl;
      user.name = githubUser.name || user.name;
      user.lastLoginAt = Date.now();
      this.updateUser(user);
    }

    await this.createSession(user);
    this.emitLoginEvent(user);

    return user;
  }

  /**
   * Register a new user (magic-link method)
   */
  async register(email: string): Promise<{ token: string; devLink: string }> {
    // Registration uses the same magic-link flow
    return await this.requestMagicLink(email);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (this.currentSession) {
      this.removeSession(this.currentSession.token);
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

  // Private helper methods

  private async createSession(user: User): Promise<void> {
    const token = this.generateSecureToken();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    const session: AuthSession = {
      userId: user.id,
      token,
      expiresAt,
    };

    this.currentUser = user;
    this.currentSession = session;
    this.saveSessionToken(token);
    this.storeSession(session);
  }

  private createUser(userData: {
    email?: string;
    githubId?: string;
    githubLogin?: string;
    avatarUrl?: string;
    name?: string;
    authMethod: 'magic-link' | 'github';
  }): User {
    const user: User = {
      id: this.generateId(),
      ...userData,
      lastLoginAt: Date.now(),
    };

    const users = this.getUsers();
    users[user.id] = user;
    this.saveUsers(users);

    return user;
  }

  private updateUser(user: User): void {
    const users = this.getUsers();
    users[user.id] = user;
    this.saveUsers(users);
  }

  private findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return Object.values(users).find(u => u.email === email) || null;
  }

  private findUserByGitHubId(githubId: string): User | null {
    const users = this.getUsers();
    return Object.values(users).find(u => u.githubId === githubId) || null;
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `user_${Date.now()}_${hex.substring(0, 16)}`;
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

  private getUsers(): Record<string, User> {
    try {
      const data = localStorage.getItem('pewpi_users');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveUsers(users: Record<string, User>): void {
    try {
      localStorage.setItem('pewpi_users', JSON.stringify(users));
    } catch (error) {
      console.error('Failed to save users', error);
    }
  }

  private getStoredUser(userId: string): User | null {
    const users = this.getUsers();
    return users[userId] || null;
  }

  private getStoredSession(token: string): AuthSession | null {
    const sessions = this.getSessions();
    return sessions[token] || null;
  }

  private getSessions(): Record<string, AuthSession> {
    try {
      const data = localStorage.getItem('pewpi_sessions');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private storeSession(session: AuthSession): void {
    const sessions = this.getSessions();
    sessions[session.token] = session;
    try {
      localStorage.setItem('pewpi_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to store session', error);
    }
  }

  private removeSession(token: string): void {
    const sessions = this.getSessions();
    delete sessions[token];
    try {
      localStorage.setItem('pewpi_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to remove session', error);
    }
  }

  private getMagicLinks(): Record<string, { email: string; expiresAt: number; used: boolean }> {
    try {
      const data = localStorage.getItem('pewpi_magic_links');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private saveMagicLinks(magicLinks: Record<string, { email: string; expiresAt: number; used: boolean }>): void {
    try {
      localStorage.setItem('pewpi_magic_links', JSON.stringify(magicLinks));
    } catch (error) {
      console.error('Failed to save magic links', error);
    }
  }

  private emitLoginEvent(user: User): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('pewpi.login.changed', {
        detail: { user, isAuthenticated: true },
      });
      window.dispatchEvent(event);

      // Broadcast via localStorage for cross-tab sync
      try {
        const syncKey = `pewpi.login.changed_${Date.now()}`;
        localStorage.setItem(syncKey, JSON.stringify({ user, isAuthenticated: true }));
        setTimeout(() => localStorage.removeItem(syncKey), 1000);
      } catch (error) {
        console.error('AuthService: Failed to broadcast login event', error);
      }
    }
  }

  private emitLogoutEvent(): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('pewpi.login.changed', {
        detail: { user: null, isAuthenticated: false },
      });
      window.dispatchEvent(event);

      // Broadcast via localStorage for cross-tab sync
      try {
        const syncKey = `pewpi.login.changed_${Date.now()}`;
        localStorage.setItem(syncKey, JSON.stringify({ user: null, isAuthenticated: false }));
        setTimeout(() => localStorage.removeItem(syncKey), 1000);
      } catch (error) {
        console.error('AuthService: Failed to broadcast logout event', error);
      }
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
