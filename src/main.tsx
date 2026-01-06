import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { ErrorFallback } from './ErrorFallback'

import App from './App.tsx'

import "./main.css"

// 🔐 SPARK ANCHOR — runs immediately on load
function assertSparkBound() {
  if (typeof window !== 'undefined') {
    // Force Guest Mode - Spark will work without authentication
    window.__C13B0_GUEST_MODE__ = true;
    
    // Spark identity binding - allow app to run without waiting for auth
    if (!window.spark) {
      console.log('⚡ Spark environment not detected - running in guest mode')
    } else {
      console.log('✅ Spark environment detected')
    }
  }
}

// Execute Spark binding BEFORE React renders
assertSparkBound();

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
