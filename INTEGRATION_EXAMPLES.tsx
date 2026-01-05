/**
 * Integration Examples for Unified Wallet System
 * 
 * This file demonstrates how to integrate token earning/spending
 * into existing components across different repositories.
 */

import { useUnifiedAuth } from '@/lib/auth-unified-context';
import { toast } from 'sonner';

// ============================================================================
// EXAMPLE 1: Search Component Integration (infinity-brain-searc)
// ============================================================================

export function SearchWithTokens() {
  const { isAuthenticated, earnTokens } = useUnifiedAuth();

  const handleSearch = async (query: string) => {
    // Perform search
    const results = await performSearch(query);

    // Award tokens for search
    if (isAuthenticated) {
      earnTokens(
        'infinity_tokens',
        5,
        'infinity-brain-searc',
        `Search: ${query.substring(0, 30)}`
      );
      toast.success('Earned 5 💎 for searching!');
    }

    return results;
  };

  return (
    <div>
      {/* Your search UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: AI Chat Integration (infinity-brain-searc)
// ============================================================================

export function AIChatWithTokens() {
  const { isAuthenticated, earnTokens, getBalance } = useUnifiedAuth();

  const handleAIQuery = async (prompt: string) => {
    // Check balance for premium features
    const balance = getBalance('infinity_tokens');
    
    if (prompt.length > 500 && balance < 10) {
      toast.error('Need 10 💎 for long prompts');
      return;
    }

    // Perform AI query
    const response = await queryAI(prompt);

    // Award tokens for using AI
    if (isAuthenticated) {
      earnTokens(
        'infinity_tokens',
        3,
        'infinity-brain-searc',
        'AI Chat interaction'
      );
    }

    return response;
  };

  return (
    <div>
      {/* Your AI chat UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Token Minter Integration (infinity-brain-searc)
// ============================================================================

export function TokenMinterIntegration() {
  const { isAuthenticated, earnTokens, user } = useUnifiedAuth();

  const handleMintToken = async (tokenData: any) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to mint tokens');
      return;
    }

    // Mint token logic
    const token = await mintToken(tokenData);

    // Calculate rewards based on token value
    const reward = Math.floor(token.value / 100);
    
    earnTokens(
      'infinity_tokens',
      reward,
      'infinity-brain-searc',
      `Minted ${token.symbol}`
    );

    toast.success(`Token minted! Earned ${reward} 💎`);

    return token;
  };

  return (
    <div>
      {/* Your token minting UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Marketplace Integration (infinity-brain-searc)
// ============================================================================

export function MarketplaceWithTokens() {
  const { spendTokens, getBalance } = useUnifiedAuth();

  const handlePurchase = (item: any) => {
    const price = item.price;
    const balance = getBalance('infinity_tokens');

    if (balance < price) {
      toast.error(`Insufficient tokens! Need ${price} 💎`);
      return false;
    }

    const success = spendTokens(
      'infinity_tokens',
      price,
      'marketplace',
      `Purchased ${item.name}`
    );

    if (success) {
      toast.success(`Purchased ${item.name} for ${price} 💎`);
      return true;
    }

    return false;
  };

  return (
    <div>
      {/* Your marketplace UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Auction Integration (infinity-brain-searc)
// ============================================================================

export function AuctionWithTokens() {
  const { spendTokens, earnTokens, getBalance } = useUnifiedAuth();

  const handlePlaceBid = (auction: any, bidAmount: number) => {
    const balance = getBalance('infinity_tokens');

    if (balance < bidAmount) {
      toast.error('Insufficient tokens for bid');
      return false;
    }

    // Place bid (tokens held in escrow)
    const success = spendTokens(
      'infinity_tokens',
      bidAmount,
      `auction-${auction.id}`,
      `Bid on ${auction.title}`
    );

    return success;
  };

  const handleWinAuction = (auction: any, winAmount: number) => {
    // Award tokens to seller
    earnTokens(
      'infinity_tokens',
      winAmount,
      'auction-sale',
      `Sold ${auction.title}`
    );

    toast.success(`Auction won! Earned ${winAmount} 💎`);
  };

  return (
    <div>
      {/* Your auction UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Music Player Integration (repo-dashboard-hub)
// ============================================================================

export function MusicPlayerWithTokens() {
  const { earnTokens } = useUnifiedAuth();

  const handleTrackComplete = (track: any) => {
    // Award music tokens for listening
    earnTokens(
      'music_tokens',
      1,
      'repo-dashboard-hub',
      `Listened: ${track.name}`
    );

    // Bonus for completing albums
    if (track.isLastInAlbum) {
      earnTokens(
        'music_tokens',
        5,
        'repo-dashboard-hub',
        `Completed album: ${track.album}`
      );
    }
  };

  const handleCreatePlaylist = (playlist: any) => {
    earnTokens(
      'infinity_tokens',
      10,
      'repo-dashboard-hub',
      `Created playlist: ${playlist.name}`
    );
  };

  return (
    <div>
      {/* Your music player UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Art Creation Integration (banksy)
// ============================================================================

export function ArtCreatorWithTokens() {
  const { earnTokens } = useUnifiedAuth();

  const handleCreateArt = async (artData: any) => {
    // Create art
    const artwork = await createArtwork(artData);

    // Award art tokens
    earnTokens(
      'art_tokens',
      15,
      'banksy',
      `Created: ${artData.title}`
    );

    // Bonus for high-quality art
    if (artwork.score > 90) {
      earnTokens(
        'art_tokens',
        10,
        'banksy',
        'Bonus: High quality artwork'
      );
    }

    toast.success('Art created! Earned 15 🎨');

    return artwork;
  };

  const handleTokenBuilder = (score: number) => {
    const value = calculateValue(score);
    const reward = Math.floor(value / 1000);

    earnTokens(
      'infinity_tokens',
      reward,
      'banksy',
      'Built token via art'
    );

    return reward;
  };

  return (
    <div>
      {/* Your art creation UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Research Publication Integration (smug_look)
// ============================================================================

export function ResearchPlatformWithTokens() {
  const { earnTokens } = useUnifiedAuth();

  const handlePublishPaper = (paper: any) => {
    // Calculate research token reward
    const baseReward = 20;
    const citationBonus = paper.citations * 2;
    const lengthBonus = Math.floor(paper.wordCount / 1000);

    const totalReward = baseReward + citationBonus + lengthBonus;

    earnTokens(
      'research_tokens',
      totalReward,
      'smug_look',
      `Published: ${paper.title}`
    );

    // Also award infinity tokens
    earnTokens(
      'infinity_tokens',
      10,
      'smug_look',
      'Research publication'
    );

    toast.success(`Published! Earned ${totalReward} 📚 + 10 💎`);
  };

  const handleTerminalCommand = () => {
    earnTokens(
      'infinity_tokens',
      2,
      'smug_look',
      'MRW Terminal usage'
    );
  };

  return (
    <div>
      {/* Your research UI */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 9: Protected Action Pattern
// ============================================================================

export function ProtectedActionExample() {
  const { isAuthenticated, earnTokens } = useUnifiedAuth();

  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to perform this action');
      return;
    }

    // Perform action
    performAction();

    // Award tokens
    earnTokens(
      'infinity_tokens',
      5,
      'infinity-brain-searc',
      'Protected action completed'
    );
  };

  return (
    <button onClick={handleProtectedAction}>
      Protected Action {!isAuthenticated && '(Sign in required)'}
    </button>
  );
}

// ============================================================================
// EXAMPLE 10: Daily Login Bonus
// ============================================================================

export function DailyLoginBonus() {
  const { earnTokens, user } = useUnifiedAuth();
  
  useEffect(() => {
    if (!user) return;

    const lastLogin = localStorage.getItem('lastDailyBonus');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
      // Award daily bonus
      earnTokens(
        'infinity_tokens',
        10,
        'daily-bonus',
        'Daily login bonus'
      );

      localStorage.setItem('lastDailyBonus', today);
      toast.success('Daily bonus: 10 💎');
    }
  }, [user, earnTokens]);

  return null;
}

// ============================================================================
// EXAMPLE 11: Achievement System
// ============================================================================

export function AchievementChecker() {
  const { user, earnTokens } = useUnifiedAuth();

  const checkAchievements = () => {
    if (!user) return;

    const totalTokens = Object.values(user.wallet).reduce((a, b) => a + b, 0);

    // First 100 tokens achievement
    if (totalTokens >= 100 && !user.achievements.includes('collector_100')) {
      earnTokens(
        'infinity_tokens',
        50,
        'achievement',
        'Achievement: First 100 tokens'
      );
      user.achievements.push('collector_100');
      toast.success('🏆 Achievement unlocked! +50 💎');
    }

    // 50 transactions achievement
    if (
      user.transactions.length >= 50 &&
      !user.achievements.includes('trader_50')
    ) {
      earnTokens(
        'infinity_tokens',
        100,
        'achievement',
        'Achievement: 50 transactions'
      );
      user.achievements.push('trader_50');
      toast.success('🏆 Achievement unlocked! +100 💎');
    }
  };

  useEffect(() => {
    checkAchievements();
  }, [user]);

  return null;
}

// ============================================================================
// Helper Functions
// ============================================================================

// Placeholder functions - replace with actual implementations
function performSearch(query: string): Promise<any> {
  return Promise.resolve([]);
}

function queryAI(prompt: string): Promise<any> {
  return Promise.resolve('AI response');
}

function mintToken(data: any): Promise<any> {
  return Promise.resolve({ symbol: 'TOKEN', value: 1000 });
}

function createArtwork(data: any): Promise<any> {
  return Promise.resolve({ id: '1', score: 95 });
}

function calculateValue(score: number): number {
  return score * 10;
}

function performAction(): void {
  console.log('Action performed');
}
