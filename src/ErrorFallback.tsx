import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";

import { AlertTriangleIcon, RefreshCwIcon, UserIcon } from "lucide-react";

// Helper function to check if error is authentication-related
const isAuthError = (error: Error): boolean => {
  const authKeywords = [
    'auth', 'authentication', 'login', 'token', 'oauth',
    'device flow', 'github', 'session', 'credential',
    'unauthorized', 'forbidden', 'access denied'
  ];
  
  const errorText = (error.message || '').toLowerCase() + 
                    (error.stack || '').toLowerCase();
  
  return authKeywords.some(keyword => errorText.includes(keyword));
};

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const isAuth = isAuthError(error);
  
  // For guest mode, we'll reset the error boundary and let the app handle the state
  // The auth context should already be in guest/error state from the failed login
  const handleContinueAsGuest = () => {
    // Clear any auth errors from localStorage that might cause issues
    try {
      localStorage.removeItem('github_device_flow_auth');
    } catch (e) {
      console.error('Failed to clear auth state:', e);
    }
    resetErrorBoundary();
  };

  // Handle authentication errors with user-friendly messaging
  if (isAuth) {
    return (
      <div className="min-h-screen mesh-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Alert className="bg-card/80 backdrop-blur border-2 border-accent/30">
            <UserIcon className="h-5 w-5" />
            <AlertTitle className="text-lg">Authentication Issue</AlertTitle>
            <AlertDescription className="space-y-3 mt-2">
              <p>
                We encountered a problem while trying to sign you in. This can happen when:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>The authentication service is temporarily unavailable</li>
                <li>Your session has expired</li>
                <li>There's a network connectivity issue</li>
              </ul>
              <p className="text-sm font-semibold">
                Don't worry - you can continue browsing as a guest!
              </p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              onClick={handleContinueAsGuest} 
              className="w-full"
              size="lg"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Continue as Guest
            </Button>
            
            <Button 
              onClick={resetErrorBoundary} 
              className="w-full"
              variant="outline"
              size="lg"
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Try Signing In Again
            </Button>
          </div>

          <div className="bg-card/80 backdrop-blur border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">What you can do as a guest:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✅ Browse all content</li>
              <li>✅ View tokens and marketplace</li>
              <li>✅ Explore features and UI</li>
              <li>✅ View analytics and dashboards</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Handle non-authentication errors with generic user-friendly messaging
  return (
    <div className="min-h-screen mesh-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Alert variant="destructive" className="bg-card/80 backdrop-blur">
          <AlertTriangleIcon />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            <p>
              The application encountered an unexpected error. This is usually temporary.
            </p>
            <p className="text-sm">
              Try refreshing the page or continue as a guest to browse the app.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full"
            size="lg"
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button 
            onClick={handleContinueAsGuest} 
            className="w-full"
            variant="outline"
            size="lg"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Continue as Guest
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
