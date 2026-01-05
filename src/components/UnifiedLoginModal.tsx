/**
 * Unified Login Modal
 * Consistent login interface across all repositories
 * Now supports GitHub PAT authentication
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { signIn, register, signInWithPAT, isValidGitHubPAT } from '@/lib/auth-unified';
import { RegisterModal } from './RegisterModal';

interface UnifiedLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnifiedLoginModal({ open, onClose, onSuccess }: UnifiedLoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        // Check if password is a GitHub PAT
        if (isValidGitHubPAT(password)) {
          await signInWithPAT(password);
          toast.success('Welcome back!', {
            description: 'Signed in with GitHub PAT across all Pewpi repositories'
          });
        } else {
          await signIn(username, password);
          toast.success('Welcome back!', {
            description: 'You are now signed in across all Pewpi repositories'
          });
        }
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
    } catch (error) {
      toast.error(mode === 'login' ? 'Login failed' : 'Registration failed', {
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
    setMode('login');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const openGitHubPATPage = () => {
    window.open('https://github.com/settings/tokens/new', '_blank', 'noopener,noreferrer');
    toast.info('GitHub PAT creation page opened', {
      description: 'Follow the steps to create your token, then paste it here'
    });
  };

  const handleRegisterWithGitHub = () => {
    setShowRegisterModal(true);
    onClose();
  };

  const handleRegisterSuccess = () => {
    onSuccess();
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

          .github-pat-helper {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 6px;
            padding: 10px;
            margin-top: 8px;
            font-size: 0.85rem;
            color: #94a3b8;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .github-pat-link {
            color: #10b981;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: color 0.3s;
          }

          .github-pat-link:hover {
            color: #34d399;
          }

          .github-register-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 16px;
            width: 100%;
          }

          .github-register-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .divider {
            display: flex;
            align-items: center;
            text-align: center;
            margin: 20px 0;
            color: #64748b;
            font-size: 0.85rem;
          }

          .divider::before,
          .divider::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #334155;
          }

          .divider:not(:empty)::before {
            margin-right: 12px;
          }

          .divider:not(:empty)::after {
            margin-left: 12px;
          }

          .info-text {
            font-size: 0.85rem;
            color: #94a3b8;
            text-align: center;
            margin-top: 12px;
          }
        `}</style>

        <DialogHeader className="modal-header-content">
          <DialogTitle className="modal-title">
            <span>🧠</span>
            <span>Pewpi Infinity {mode === 'login' ? 'Login' : 'Register'}</span>
          </DialogTitle>
          <DialogDescription className="modal-subtitle">
            One account, all repositories
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <Label htmlFor="username" className="form-label">
              Username {mode === 'login' && '(or use GitHub PAT below)'}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="form-input"
              required={mode === 'register'}
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
              Password {mode === 'login' && 'or GitHub PAT'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'login' ? 'Password or ghp_...' : 'Enter your password'}
              className="form-input"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'login' && (
              <div className="github-pat-helper">
                <span>Don't have a GitHub PAT?</span>
                <a
                  onClick={openGitHubPATPage}
                  className="github-pat-link"
                >
                  🔗 Create one here →
                </a>
              </div>
            )}
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
                mode === 'login' ? 'Signing in...' : 'Creating account...'
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          {mode === 'login' && (
            <>
              <div className="divider">OR</div>
              <button
                type="button"
                onClick={handleRegisterWithGitHub}
                className="github-register-btn"
                disabled={loading}
              >
                <span>🐙</span>
                <span>Register with GitHub PAT</span>
              </button>
              <div className="info-text">
                ⚡ Get 1000 tokens instantly with GitHub PAT!
              </div>
            </>
          )}

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
        </form>
      </DialogContent>

      <RegisterModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />
    </Dialog>
  );
}
