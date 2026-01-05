/**
 * GitHub PAT Registration Modal
 * Guides new users through creating a GitHub PAT and registering
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerWithPAT } from '@/lib/auth-unified';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterModal({ open, onClose, onSuccess }: RegisterModalProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState<boolean | null>(null);

  const validateTokenFormat = (value: string) => {
    // GitHub PAT formats: ghp_ (classic) or github_pat_ (fine-grained)
    const isValid = value.startsWith('ghp_') || value.startsWith('github_pat_');
    setIsValidFormat(isValid);
    return isValid;
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setToken(value);
    if (value.length > 0) {
      validateTokenFormat(value);
    } else {
      setIsValidFormat(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateTokenFormat(token)) {
        throw new Error('Invalid GitHub PAT format. Token must start with "ghp_" or "github_pat_"');
      }

      await registerWithPAT(token);
      toast.success('Registration successful!', {
        description: 'Welcome! You received 1000 Infinity Tokens! 🎉'
      });
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Registration failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setToken('');
    setIsValidFormat(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const openGitHubPATPage = () => {
    window.open('https://github.com/settings/tokens/new', '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="register-modal sm:max-w-[550px]">
        <style>{`
          .register-modal {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border: 2px solid #10b981;
            color: #e0e7ff;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header-content {
            text-align: center;
            margin-bottom: 20px;
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

          .instructions-box {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }

          .instructions-title {
            font-weight: 600;
            color: #10b981;
            margin-bottom: 12px;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .instructions-list {
            color: #cbd5e1;
            font-size: 0.9rem;
            line-height: 1.8;
            list-style: none;
            padding: 0;
          }

          .instructions-list li {
            margin-bottom: 12px;
            padding-left: 24px;
            position: relative;
          }

          .instructions-list li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }

          .github-link-button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s;
            margin: 8px 0;
          }

          .github-link-button:hover {
            background: #1d4ed8;
            transform: translateY(-2px);
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
            font-size: 0.95rem;
            font-family: 'Courier New', monospace;
            transition: all 0.3s;
          }

          .form-input:focus {
            outline: none;
            border-color: #10b981;
            background: rgba(15, 23, 42, 0.8);
          }

          .form-input.valid {
            border-color: #10b981;
          }

          .form-input.invalid {
            border-color: #ef4444;
          }

          .form-input::placeholder {
            color: #64748b;
            font-family: system-ui, -apple-system, sans-serif;
          }

          .validation-feedback {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 6px;
            font-size: 0.85rem;
          }

          .validation-feedback.valid {
            color: #10b981;
          }

          .validation-feedback.invalid {
            color: #ef4444;
          }

          .token-format-hint {
            background: rgba(37, 99, 235, 0.1);
            border: 1px solid rgba(37, 99, 235, 0.3);
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
            font-size: 0.85rem;
            color: #94a3b8;
          }

          .token-format-hint code {
            background: rgba(15, 23, 42, 0.8);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #60a5fa;
          }

          .bonus-preview {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            text-align: center;
          }

          .bonus-preview-title {
            font-weight: 600;
            color: #f59e0b;
            margin-bottom: 4px;
            font-size: 1.1rem;
          }

          .bonus-preview-text {
            color: #94a3b8;
            font-size: 0.9rem;
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
            background: #10b981;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #059669;
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

          .help-links {
            margin-top: 16px;
            text-align: center;
            font-size: 0.85rem;
            color: #94a3b8;
          }

          .help-link {
            color: #60a5fa;
            text-decoration: underline;
            cursor: pointer;
            margin: 0 8px;
          }

          .help-link:hover {
            color: #93c5fd;
          }
        `}</style>

        <DialogHeader className="modal-header-content">
          <DialogTitle className="modal-title">
            <span>🚀</span>
            <span>Welcome! Register with GitHub PAT</span>
          </DialogTitle>
          <DialogDescription className="modal-subtitle">
            Create a GitHub Personal Access Token to get started
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="instructions-box">
            <div className="instructions-title">
              📝 Quick Steps
            </div>
            <ol className="instructions-list">
              <li>
                Click the button below to create a new GitHub PAT:
                <button
                  type="button"
                  onClick={openGitHubPATPage}
                  className="github-link-button"
                  style={{ display: 'block', marginTop: '8px' }}
                >
                  <span>🔗</span>
                  <span>Create GitHub PAT →</span>
                </button>
              </li>
              <li>
                <strong>Name:</strong> "Infinity Brain Access"
              </li>
              <li>
                <strong>Expiration:</strong> 90 days (or no expiration)
              </li>
              <li>
                <strong>Scopes:</strong> None needed for basic access
              </li>
              <li>
                Copy your token and paste it below
              </li>
            </ol>
          </div>

          <div className="form-group">
            <Label htmlFor="token" className="form-label">
              GitHub Personal Access Token
            </Label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={handleTokenChange}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={`form-input ${
                isValidFormat === true ? 'valid' : isValidFormat === false ? 'invalid' : ''
              }`}
              required
              autoComplete="off"
            />
            {isValidFormat === true && (
              <div className="validation-feedback valid">
                <span>✓</span>
                <span>Valid GitHub PAT format</span>
              </div>
            )}
            {isValidFormat === false && (
              <div className="validation-feedback invalid">
                <span>✗</span>
                <span>Token must start with "ghp_" or "github_pat_"</span>
              </div>
            )}
          </div>

          <div className="token-format-hint">
            <strong>Token format:</strong> GitHub PATs start with <code>ghp_</code> (classic) or <code>github_pat_</code> (fine-grained).
            They are typically 40+ characters long.
          </div>

          <div className="bonus-preview">
            <div className="bonus-preview-title">
              ⚡ Welcome Bonus
            </div>
            <div className="bonus-preview-text">
              You'll receive 1000 free Infinity Tokens to explore the platform!
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
              disabled={loading || !isValidFormat}
            >
              {loading ? 'Creating account...' : 'Complete Registration'}
            </button>
          </div>

          <div className="help-links">
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="help-link"
            >
              What's a GitHub PAT?
            </a>
            <span>•</span>
            <span className="help-link" onClick={() => toast.info('Your token is stored locally in your browser. We never send it to our servers.')}>
              Is my token safe?
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
