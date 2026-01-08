import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { ErrorFallback } from './ErrorFallback'

import App from './App.tsx'

import "./main.css"

// Initialize pewpi-shared services (optional, backward-compatible)
try {
  // Dynamic import to avoid breaking builds if pewpi-shared is not yet fully integrated
  import('./pewpi-shared/token-service.js').then((tokenServiceModule) => {
    const tokenService = tokenServiceModule.tokenService || tokenServiceModule.default;
    if (tokenService && typeof tokenService.initAutoTracking === 'function') {
      tokenService.initAutoTracking();
      console.log('[pewpi-shared] Token service auto-tracking initialized');
    }
  }).catch(err => {
    console.warn('[pewpi-shared] Token service not available:', err.message);
  });

  import('./pewpi-shared/auth/login-component.js').then((loginModule) => {
    const LoginComponent = loginModule.default || loginModule.LoginComponent;
    if (LoginComponent) {
      // Login component automatically loads user from storage in constructor
      const authService = new LoginComponent();
      if (authService.isLoggedIn && authService.isLoggedIn()) {
        console.log('[pewpi-shared] Session restored for user:', authService.getCurrentUser());
      }
    }
  }).catch(err => {
    console.warn('[pewpi-shared] Login component not available:', err.message);
  });

  // Setup integration event listeners
  import('./pewpi-shared/integration-listener.js').then((listenerModule) => {
    const { setupIntegration } = listenerModule;
    if (setupIntegration && typeof setupIntegration === 'function') {
      setupIntegration({
        onTokenCreated: (token: any) => {
          console.log('[pewpi-shared] Token created:', token);
        },
        onTokenUpdated: (token: any) => {
          console.log('[pewpi-shared] Token updated:', token);
        },
        onLoginChanged: (data: any) => {
          console.log('[pewpi-shared] Login changed:', data);
        },
        debug: false
      });
      console.log('[pewpi-shared] Integration listener initialized');
    }
  }).catch(err => {
    console.warn('[pewpi-shared] Integration listener not available:', err.message);
  });
} catch (error) {
  console.warn('[pewpi-shared] Failed to initialize shared services:', error);
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
      <Toaster position="top-right" />
    </ErrorBoundary>
  </StrictMode>
)
