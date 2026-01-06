import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { AlertTriangle, RefreshCw } from "@phosphor-icons/react";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive" className="bg-card/80 backdrop-blur">
          <AlertTriangle size={20} />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p>
              The application encountered an unexpected error. This is usually temporary.
            </p>
            <p className="text-sm">
              Try refreshing the page to continue.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full"
            size="lg"
          >
            <RefreshCw className="mr-2" size={16} />
            Try Again
          </Button>
        </div>
        
        <details className="bg-card/80 backdrop-blur border rounded-lg p-4">
          <summary className="font-semibold text-sm cursor-pointer">
            Technical Details
          </summary>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32 mt-3">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}
