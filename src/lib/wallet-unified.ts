/**
 * Unified Wallet System
 * Universal wallet management across all Pewpi Infinity repositories
 */

import {
  updateWallet,
  getWalletBalance,
  getAllBalances,
  recordTransaction,
  getCurrentUser,
  type Transaction
} from './auth-unified';

export type CurrencyType = 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens';

export interface WalletStatus {
  balances: Record<CurrencyType, number>;
  totalValue: number;
  lastTransaction: Transaction | null;
  transactionCount: number;
}

/**
 * Earn tokens - adds tokens to user's wallet
 */
export function earnTokens(
  currency: CurrencyType,
  amount: number,
  source: string,
  description: string
): void {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  updateWallet(currency, amount, source, description);
}

/**
 * Spend tokens - deducts tokens from user's wallet
 */
export function spendTokens(
  currency: CurrencyType,
  amount: number,
  target: string,
  description: string
): boolean {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  const currentBalance = getWalletBalance(currency);
  
  if (currentBalance < amount) {
    return false; // Insufficient balance
  }

  updateWallet(currency, -amount, target, description);
  return true;
}

/**
 * Transfer tokens between currencies (exchange)
 */
export function transferTokens(
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType,
  amount: number,
  exchangeRate: number = 1.0
): boolean {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  if (fromCurrency === toCurrency) {
    throw new Error('Cannot transfer to same currency');
  }

  const currentBalance = getWalletBalance(fromCurrency);
  
  if (currentBalance < amount) {
    return false; // Insufficient balance
  }

  const convertedAmount = Math.floor(amount * exchangeRate);

  // Deduct from source currency
  updateWallet(fromCurrency, -amount, 'exchange', `Exchange to ${toCurrency}`);
  
  // Add to target currency
  updateWallet(toCurrency, convertedAmount, 'exchange', `Exchange from ${fromCurrency}`);
  
  // Record transfer transaction
  recordTransaction(
    'transfer',
    amount,
    fromCurrency,
    'exchange',
    `Transferred ${amount} ${fromCurrency} → ${convertedAmount} ${toCurrency}`
  );

  return true;
}

/**
 * Calculate total wallet value
 * Uses approximate exchange rates to infinity_tokens as base
 */
export function getTotalValue(): number {
  const balances = getAllBalances();
  
  // Exchange rates relative to infinity_tokens
  const rates: Record<CurrencyType, number> = {
    infinity_tokens: 1.0,
    research_tokens: 2.0,  // Research tokens worth 2x
    art_tokens: 1.5,       // Art tokens worth 1.5x
    music_tokens: 0.8      // Music tokens worth 0.8x
  };

  let total = 0;
  for (const [currency, amount] of Object.entries(balances)) {
    total += amount * rates[currency as CurrencyType];
  }

  return Math.floor(total);
}

/**
 * Get comprehensive wallet status
 */
export function getWalletStatus(): WalletStatus {
  const user = getCurrentUser();
  const balances = getAllBalances();
  const totalValue = getTotalValue();

  let lastTransaction: Transaction | null = null;
  let transactionCount = 0;

  if (user && user.transactions.length > 0) {
    lastTransaction = user.transactions[user.transactions.length - 1];
    transactionCount = user.transactions.length;
  }

  return {
    balances: balances as Record<CurrencyType, number>,
    totalValue,
    lastTransaction,
    transactionCount
  };
}

/**
 * Export wallet data
 */
export function exportWallet(): string {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const walletData = {
    wallet: user.wallet,
    transactions: user.transactions,
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(walletData, null, 2);
}

/**
 * Import wallet data (merge with existing)
 */
export function importWallet(data: string): boolean {
  try {
    const walletData = JSON.parse(data);
    
    if (!walletData.wallet || !walletData.transactions) {
      throw new Error('Invalid wallet data format');
    }

    // This would need to be implemented with proper merge logic
    // For now, we'll just validate the format
    return true;
  } catch (error) {
    console.error('Failed to import wallet:', error);
    return false;
  }
}

/**
 * Get currency emoji
 */
export function getCurrencyEmoji(currency: CurrencyType): string {
  const emojis: Record<CurrencyType, string> = {
    infinity_tokens: '💎',
    research_tokens: '📚',
    art_tokens: '🎨',
    music_tokens: '🎵'
  };
  return emojis[currency];
}

/**
 * Format currency display
 */
export function formatCurrency(amount: number, currency: CurrencyType): string {
  const emoji = getCurrencyEmoji(currency);
  return `${emoji} ${amount.toLocaleString()}`;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: CurrencyType): string {
  const names: Record<CurrencyType, string> = {
    infinity_tokens: 'Infinity Tokens',
    research_tokens: 'Research Tokens',
    art_tokens: 'Art Tokens',
    music_tokens: 'Music Tokens'
  };
  return names[currency];
}
