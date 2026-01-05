/**
 * App Wrapper with Unified Auth
 * Wraps the main App with unified authentication system
 */

import { useState } from 'react';
import App from './App';
import { UnifiedAuthProvider } from '@/lib/auth-unified-context';
import { UnifiedNav } from '@/components/UnifiedNav';
import { UnifiedLoginModal } from '@/components/UnifiedLoginModal';

export function AppWithUnifiedAuth() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleAuthSuccess = () => {
    // Auth success handled by context
  };

  return (
    <UnifiedAuthProvider>
      <div className="min-h-screen">
        <UnifiedNav onAuthClick={() => setShowLoginModal(true)} />
        <App />
        <UnifiedLoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </UnifiedAuthProvider>
  );
}
