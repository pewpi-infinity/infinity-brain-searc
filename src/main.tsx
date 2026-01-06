import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { ErrorFallback } from './ErrorFallback'

import App from './App.tsx'

import "./main.css"

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
