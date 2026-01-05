/**
 * Unified Login Modal
 * Consistent login interface across all repositories
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { signIn, register } from '@/lib/auth-unified';
import { login as simpleLogin, validateApiKey } from '@/lib/simple-auth';

interface UnifiedLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnifiedLoginModal({ open, onClose, onSuccess }: UnifiedLoginModalProps) {
  const [authMethod, setAuthMethod] = useState<'unified' | 'pat'>('unified');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMethod === 'pat') {
        // PAT/API Key authentication
        const result = await simpleLogin(apiKey);
        if (result.success) {
          toast.success('Welcome!', {
            description: 'You are now signed in with your API key'
          });
          onSuccess();
          onClose();
          resetForm();
        } else {
          throw new Error(result.error || 'Invalid API key');
        }
      } else {
        // Unified authentication
        if (mode === 'login') {
          await signIn(username, password);
          toast.success('Welcome back!', {
            description: 'You are now signed in across all Pewpi repositories'
          });
        } else {
          await register(username, password, email);
          await signIn(username, password);
          toast.success('Account created successfully!', {
            description: 'You received 100 Infinity Tokens as a welcome bonus! 🎉'
          });
        }
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      const errorTitle = authMethod === 'pat' ? 'API Key Login Failed' : 
                         mode === 'login' ? 'Login failed' : 'Registration failed';
      toast.error(errorTitle, {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setApiKey('');
    setMode('login');
    setAuthMethod('unified');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="unified-login-modal sm:max-w-[500px]">
        <style>{`
          .unified-login-modal {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 2px solid #2563eb;
            color: #e0e7ff;
          }

          .modal-header-content {
            text-align: center;
            margin-bottom: 24px;
          }

          .modal-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #e0e7ff;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .modal-subtitle {
            color: #94a3b8;
            font-size: 0.95rem;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            margin-bottom: 8px;
            color: #cbd5e1;
            font-weight: 500;
            font-size: 0.9rem;
          }

          .form-input {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #334155;
            background: rgba(15, 23, 42, 0.6);
            color: #e0e7ff;
            font-size: 1rem;
            transition: all 0.3s;
          }

          .form-input:focus {
            outline: none;
            border-color: #2563eb;
            background: rgba(15, 23, 42, 0.8);
          }

          .form-input::placeholder {
            color: #64748b;
          }

          .wallet-preview {
            background: rgba(37, 99, 235, 0.1);
            border: 1px solid rgba(37, 99, 235, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }

          .wallet-preview-title {
            font-weight: 600;
            color: #60a5fa;
            margin-bottom: 8px;
            font-size: 0.95rem;
          }

          .wallet-preview-text {
            color: #94a3b8;
            font-size: 0.85rem;
            line-height: 1.5;
          }

          .modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }

          .btn-primary, .btn-secondary {
            flex: 1;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            font-size: 1rem;
          }

          .btn-primary {
            background: #2563eb;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #1d4ed8;
            transform: translateY(-2px);
          }

          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: rgba(71, 85, 105, 0.4);
            color: #cbd5e1;
            border: 1px solid #475569;
          }

          .btn-secondary:hover {
            background: rgba(71, 85, 105, 0.6);
          }

          .mode-toggle {
            text-align: center;
            margin-top: 16px;
            color: #94a3b8;
            font-size: 0.9rem;
          }

          .mode-toggle-link {
            color: #60a5fa;
            text-decoration: underline;
            cursor: pointer;
          }

          .mode-toggle-link:hover {
            color: #93c5fd;
          }

          .auth-method-toggle {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.6);
            padding: 4px;
          }

          .auth-method-btn {
            flex: 1;
            padding: 10px;
            border-radius: 6px;
            background: transparent;
            color: #94a3b8;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s;
          }

          .auth-method-btn.active {
            background: #2563eb;
            color: white;
          }

          .auth-method-btn:hover:not(.active) {
            background: rgba(37, 99, 235, 0.2);
            color: #cbd5e1;
          }

          .api-key-info {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 0.85rem;
            color: #93c5fd;
            line-height: 1.5;
          }
        `}</style>

        <DialogHeader className="modal-header-content">
          <DialogTitle className="modal-title">
            <span>🧠</span>
            <span>Pewpi Infinity {authMethod === 'pat' ? 'Quick Login' : mode === 'login' ? 'Login' : 'Register'}</span>
          </DialogTitle>
          <DialogDescription className="modal-subtitle">
            {authMethod === 'pat' ? 'Sign in with API Key or GitHub PAT' : 'One account, all repositories'}
          </DialogDescription>
        </DialogHeader>

        {/* Auth Method Toggle */}
        <div className="auth-method-toggle">
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'unified' ? 'active' : ''}`}
            onClick={() => setAuthMethod('unified')}
          >
            Username & Password
          </button>
          <button
            type="button"
            className={`auth-method-btn ${authMethod === 'pat' ? 'active' : ''}`}
            onClick={() => setAuthMethod('pat')}
          >
            API Key / PAT
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {authMethod === 'pat' ? (
            // PAT/API Key Login Form
            <>
              <div className="api-key-info">
                💡 <strong>Quick Login:</strong> Enter any API key (min 8 characters) or your GitHub Personal Access Token.
                Your session will last 24 hours.
              </div>
              <div className="form-group">
                <Label htmlFor="apiKey" className="form-label">
                  API Key / GitHub PAT
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key or GitHub PAT"
                  className="form-input"
                  required
                  minLength={8}
                  autoComplete="off"
                />
              </div>
              <div className="wallet-preview">
                <div className="wallet-preview-title">
                  🎁 Welcome Bonus
                </div>
                <div className="wallet-preview-text">
                  New users start with 1,000 tokens! Your session is compatible with infinity-brain-111.
                </div>
              </div>
            </>
          ) : (
            // Traditional Username/Password Form
            <>
              <div className="form-group">
                <Label htmlFor="username" className="form-label">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="form-input"
                  required
                  minLength={3}
                  autoComplete="username"
                />
              </div>

              {mode === 'register' && (
                <div className="form-group">
                  <Label htmlFor="email" className="form-label">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="form-input"
                    autoComplete="email"
                  />
                </div>
              )}

              <div className="form-group">
                <Label htmlFor="password" className="form-label">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              <div className="wallet-preview">
                <div className="wallet-preview-title">
                  🌟 Unified Wallet System
                </div>
                <div className="wallet-preview-text">
                  Your wallet works across all Pewpi repos: Search, Dashboard, Banksy, and Research.
                  {mode === 'register' && ' Get 100 free Infinity Tokens when you register!'}
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                authMethod === 'pat' ? 'Signing in...' :
                mode === 'login' ? 'Signing in...' : 'Creating account...'
              ) : (
                authMethod === 'pat' ? 'Sign In with API Key' :
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          {authMethod === 'unified' && (
            <div className="mode-toggle">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <span
                    className="mode-toggle-link"
                    onClick={() => setMode('register')}
                  >
                    Register here
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span
                    className="mode-toggle-link"
                    onClick={() => setMode('login')}
                  >
                    Sign in here
                  </span>
                </>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
