import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"
import { Toaster } from '@/components/ui/sonner'

import { AppWithUnifiedAuth } from './AppWithUnifiedAuth.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { SparkLoader } from './SparkLoader.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <SparkLoader>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AppWithUnifiedAuth />
      <Toaster position="top-right" />
    </ErrorBoundary>
  </SparkLoader>
)
