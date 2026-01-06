export type CurrencyType = 'infinity_tokens' | 'research_tokens' | 'art_tokens' | 'music_tokens';

export interface WalletStatus {
  balances: Record<CurrencyType, number>;
  totalValue: number;
  transactionCount: number;
}

export function earnTokens(
  currency: CurrencyType,
  amount: number,
  source: string,
  description: string
): void {
  console.log(`Earned ${amount} ${currency} from ${source}: ${description}`)
}

export function spendTokens(
  currency: CurrencyType,
  amount: number,
  target: string,
  description: string
): boolean {
  console.log(`Spent ${amount} ${currency} on ${target}: ${description}`)
  return true
}

export function transferTokens(
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType,
  amount: number,
  exchangeRate: number = 1.0
): boolean {
  console.log(`Transferred ${amount} ${fromCurrency} to ${toCurrency}`)
  return true
}

const EXCHANGE_RATES: Record<CurrencyType, number> = {
  infinity_tokens: 1.0,
  research_tokens: 2.0,
  art_tokens: 1.5,
  music_tokens: 0.8
};

export function getTotalValue(): number {
  return 0
}

export function getWalletStatus(): WalletStatus {
  return {
    balances: {
      infinity_tokens: 0,
      research_tokens: 0,
      art_tokens: 0,
      music_tokens: 0
    },
    totalValue: 0,
    transactionCount: 0
  }
}

export function exportWallet(): string {
  return JSON.stringify({
    wallet: {},
    transactions: [],
    exportedAt: new Date().toISOString()
  }, null, 2)
}

export function importWallet(data: string): boolean {
  throw new Error('Wallet import not yet implemented.')
}

export function getCurrencyEmoji(currency: CurrencyType): string {
  const emojis: Record<CurrencyType, string> = {
    infinity_tokens: '💎',
    research_tokens: '📚',
    art_tokens: '🎨',
    music_tokens: '🎵'
  };
  return emojis[currency];
}

export function formatCurrency(amount: number, currency: CurrencyType): string {
  const emoji = getCurrencyEmoji(currency);
  return `${emoji} ${amount.toLocaleString()}`;
}

export function getCurrencyName(currency: CurrencyType): string {
  const names: Record<CurrencyType, string> = {
    infinity_tokens: 'Infinity Tokens',
    research_tokens: 'Research Tokens',
    art_tokens: 'Art Tokens',
    music_tokens: 'Music Tokens'
  };
  return names[currency];
}
