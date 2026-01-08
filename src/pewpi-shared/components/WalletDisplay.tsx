/**
 * WalletDisplay Component
 * Opt-in wrapper around the existing Wallet component from src/shared/components/Wallet.tsx
 * 
 * This provides a unified, consistent wallet display that can be used across repos.
 */

import { Wallet } from '../../shared/components/Wallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WalletDisplayProps {
  className?: string;
  title?: string;
  showHeader?: boolean;
}

/**
 * Unified Wallet Display
 * 
 * Usage:
 * ```tsx
 * <WalletDisplay
 *   title="My Wallet"
 *   showHeader={true}
 *   className="max-w-4xl mx-auto"
 * />
 * ```
 */
export function WalletDisplay({
  className = '',
  title = 'Wallet',
  showHeader = true,
}: WalletDisplayProps) {
  if (showHeader) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Wallet />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Wallet />
    </div>
  );
}
