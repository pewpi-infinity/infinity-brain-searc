/**
 * Unified Login Modal - Lightweight, opt-in authentication UI
 * 
 * Features:
 * - Magic-link authentication (dev-mode)
 * - Optional GitHub OAuth (client-side helper)
 * - Minimal, accessible design
 */

import React, { useState } from 'react';
import { authService } from '../auth-service';

export interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export function UnifiedLoginModal({ isOpen, onClose, onLoginSuccess }: UnifiedLoginModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [devLink, setDevLink] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { token, devLink } = await authService.requestMagicLink(email);
      setMagicLinkSent(true);
      setDevLink(devLink);
    } catch (error: any) {
      setError(error.message || 'Failed to generate magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkClick = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('magic_token');
      if (token) {
        await authService.loginWithMagicLink(token);
        onLoginSuccess?.();
        onClose();
      } else {
        // Navigate to devLink
        window.location.href = devLink;
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  const handleGitHubLogin = async () => {
    try {
      // Check if running in Spark environment
      if (typeof window !== 'undefined' && (window as any).spark) {
        const sparkUser = await (window as any).spark.user();
        if (sparkUser && sparkUser.login) {
          await authService.loginWithGitHub({
            id: sparkUser.id,
            login: sparkUser.login,
            email: sparkUser.email,
            avatarUrl: sparkUser.avatarUrl,
            name: sparkUser.login,
          });
          onLoginSuccess?.();
          onClose();
          return;
        }
      }

      setError('GitHub login requires Spark environment');
    } catch (error: any) {
      setError(error.message || 'GitHub login failed');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Sign In
        </h2>

        {error && (
          <div 
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              borderRadius: '4px',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {!magicLinkSent ? (
          <form onSubmit={handleMagicLinkRequest}>
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="email" 
                style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
                required
              />
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                No password required. We'll send you a magic link.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Generating Link...' : 'Send Magic Link'}
            </button>

            <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#6B7280', fontSize: '0.75rem' }}>
              OR
            </div>

            <button
              type="button"
              onClick={handleGitHubLogin}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#24292E',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              GitHub (Optional)
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
              ✓ No GitHub account required
            </p>
          </form>
        ) : (
          <div>
            <div 
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                borderRadius: '4px',
                fontSize: '0.875rem',
              }}
            >
              ✓ Magic link generated!
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Dev Mode: Click to Login
              </label>
              <button
                onClick={handleMagicLinkClick}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  wordBreak: 'break-all',
                  cursor: 'pointer',
                }}
              >
                {devLink}
              </button>
            </div>

            <div 
              style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                borderRadius: '4px',
                fontSize: '0.75rem',
              }}
            >
              <strong>Dev Mode:</strong> In production, this link would be sent to your email.
              For development, click the button above or check the console.
            </div>

            <button
              onClick={() => {
                setMagicLinkSent(false);
                setDevLink('');
                setEmail('');
                setError('');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'transparent',
                color: '#6B7280',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Try different email
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.5rem',
            backgroundColor: 'transparent',
            color: '#6B7280',
            border: 'none',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
