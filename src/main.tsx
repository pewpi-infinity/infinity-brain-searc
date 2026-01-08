import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { ErrorFallback } from './ErrorFallback'

import App from './App.tsx'

import "./main.css"

// Defensive initialization of pewpi-shared services
// This is opt-in and non-destructive to existing code
;(async () => {
  try {
    const { tokenService } = await import('./pewpi-shared/token-service');
    const { authService } = await import('./pewpi-shared/auth-service');
    
    // Initialize auth service and restore session if available
    await authService.init().catch((error) => {
      console.warn('pewpi-shared: Auth initialization failed (non-critical)', error);
    });
    
    // Initialize token auto-tracking for cross-tab sync
    tokenService.initAutoTracking();
    
    console.log('pewpi-shared: Services initialized successfully');
  } catch (error) {
    // Silently fail if pewpi-shared is not available
    console.warn('pewpi-shared: Initialization skipped', error);
  }
})();

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
