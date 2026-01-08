/**
 * UnifiedLoginModal Component
 * Opt-in wrapper around the existing Login component from src/shared/components/Login.tsx
 * 
 * This provides a unified, consistent login experience that can be used across repos.
 */

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Login } from '../../shared/components/Login';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

/**
 * Unified Login Modal
 * 
 * Usage:
 * ```tsx
 * const [showLogin, setShowLogin] = useState(false);
 * 
 * <UnifiedLoginModal
 *   isOpen={showLogin}
 *   onClose={() => setShowLogin(false)}
 *   onLoginSuccess={() => {
 *     console.log('User logged in!');
 *     setShowLogin(false);
 *   }}
 * />
 * ```
 */
export function UnifiedLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: UnifiedLoginModalProps) {
  // Listen for successful login
  if (typeof window !== 'undefined') {
    const handleLoginChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        user: any;
        isAuthenticated: boolean;
      }>;

      if (customEvent.detail.isAuthenticated && onLoginSuccess) {
        onLoginSuccess();
      }
    };

    // Set up listener when modal opens
    if (isOpen) {
      window.addEventListener('pewpi.login.changed', handleLoginChange);
      
      return () => {
        window.removeEventListener('pewpi.login.changed', handleLoginChange);
      };
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">Login</DialogTitle>
        <Login />
      </DialogContent>
    </Dialog>
  );
}
