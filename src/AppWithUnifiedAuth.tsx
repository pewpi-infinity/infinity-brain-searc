/**
 * App Wrapper with Unified Auth
 * Wraps the main App with unified authentication system
 */

import { useState } from 'react';
import { UnifiedAuthProvider } from '@/lib/auth-unified-context';
import { UnifiedNav } from '@/components/UnifiedNav';
import { UnifiedLoginModal } from '@/components/UnifiedLoginModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { House, Robot, Coin, CurrencyDollar, Storefront, ChartLine, GitBranch, ShareNetwork, GameController, ShieldCheck, Sparkle } from '@phosphor-icons/react';
import { SearchBar } from '@/components/SearchBar';
import { SafeModeToggle } from '@/components/SafeModeToggle';
import { Navigation } from '@/components/Navigation';
import { ProfessionalDashboard } from '@/components/ProfessionalDashboard';
import { TokenMinter } from '@/components/TokenMinter';
import { ResearchTokenMinter } from '@/components/ResearchTokenMinter';
import { TokenMarketplace } from '@/components/TokenMarketplace';
import { TokenAuction } from '@/components/TokenAuction';
import { LiveAuctionViewer } from '@/components/LiveAuctionViewer';
import { ComprehensiveAuctionAnalytics } from '@/components/ComprehensiveAuctionAnalytics';
import { UserDashboard } from '@/components/UserDashboard';
import { PageHub } from '@/components/PageHub';
import { RepoHub } from '@/components/RepoHub';
import { DeploymentHub } from '@/components/DeploymentHub';
import { AIChat } from '@/components/AIChat';
import { SlotMachine } from '@/components/SlotMachine';
import { EmojiCatcherGame } from '@/components/EmojiCatcherGame';
import { MarioScene } from '@/components/MarioScene';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { AdminTools } from '@/components/AdminTools';
import { AuthProvider } from '@/lib/auth';
import { TokenRedistributionServiceProvider } from '@/lib/tokenRedistributionService.tsx';

export function AppWithUnifiedAuth() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleAuthSuccess = () => {
    // Auth success handled by context
  };

  const handleSearch = async (query: string, mode: 'web' | 'ai') => {
    setSearchQuery(query);
    setIsSearching(true);

    if (mode === 'ai') {
      setActiveTab('explore');
      setIsSearching(false);
      toast.info('AI search mode activated');
      return;
    }

    // Simple mock search for now
    setTimeout(() => {
      setIsSearching(false);
      setActiveTab('explore');
      toast.success(`Search results for "${query}"`);
    }, 1000);
  };

  return (
    <UnifiedAuthProvider>
      <AuthProvider>
        <TokenRedistributionServiceProvider>
          <div className="min-h-screen">
            <UnifiedNav onAuthClick={() => setShowLoginModal(true)} />
            
            <div className="min-h-screen mesh-background">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                <header className="mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Navigation onNavigate={setActiveTab} currentTab={activeTab} />
                    
                    <div className="flex items-center gap-3">
                      <Sparkle size={40} weight="duotone" className="text-accent animate-pulse" />
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Infinity Brain
                      </h1>
                    </div>
                    
                    <div className="w-10" />
                  </div>
                  
                  <div className="max-w-3xl mx-auto space-y-3">
                    <div className="bg-card/80 backdrop-blur border-2 border-accent/30 rounded-lg p-4 shadow-lg">
                      <h2 className="text-base font-semibold text-accent mb-2 flex items-center justify-center gap-2">
                        <ShieldCheck size={20} weight="duotone" />
                        Infinity Brain Promise
                      </h2>
                      <p className="text-sm text-foreground/90 text-center">
                        You will never be asked for secret keys, terminal commands, or code.
                        If something can be done safely for you, it will be.
                      </p>
                    </div>
                    
                    <div className="max-w-md mx-auto">
                      <SafeModeToggle />
                    </div>
                  </div>
                </header>

                <div className="mb-6">
                  <SearchBar onSearch={handleSearch} isLoading={isSearching} />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3 md:grid-cols-6 h-auto gap-2 bg-card/80 backdrop-blur p-2">
                    <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-2">
                      <House size={20} weight="duotone" />
                      <span className="text-xs">Home</span>
                    </TabsTrigger>
                    <TabsTrigger value="create" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-1 py-2">
                      <CurrencyDollar size={20} weight="duotone" />
                      <span className="text-xs">Create</span>
                    </TabsTrigger>
                    <TabsTrigger value="trade" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-2">
                      <Storefront size={20} weight="duotone" />
                      <span className="text-xs">Trade</span>
                    </TabsTrigger>
                    <TabsTrigger value="build" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-1 py-2">
                      <GitBranch size={20} weight="duotone" />
                      <span className="text-xs">Build</span>
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground flex flex-col items-center gap-1 py-2">
                      <Robot size={20} weight="duotone" />
                      <span className="text-xs">Explore</span>
                    </TabsTrigger>
                    <TabsTrigger value="play" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground flex flex-col items-center gap-1 py-2">
                      <GameController size={20} weight="duotone" />
                      <span className="text-xs">Play</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="home" className="space-y-8">
                    <ProfessionalDashboard onNavigate={setActiveTab} />
                  </TabsContent>

                  <TabsContent value="create" className="space-y-6">
                    <TokenMinter />
                    <ResearchTokenMinter />
                  </TabsContent>

                  <TabsContent value="trade" className="space-y-6">
                    <TokenMarketplace />
                    <TokenAuction />
                    <LiveAuctionViewer />
                    <ComprehensiveAuctionAnalytics />
                  </TabsContent>

                  <TabsContent value="build" className="space-y-6">
                    <RepoHub />
                    <PageHub />
                    <DeploymentHub />
                  </TabsContent>

                  <TabsContent value="explore" className="space-y-6">
                    <AIChat />
                  </TabsContent>

                  <TabsContent value="play" className="space-y-6">
                    <SlotMachine />
                    <EmojiCatcherGame />
                    <MarioScene />
                  </TabsContent>

                  <TabsContent value="user" className="space-y-6">
                    <UserDashboard />
                  </TabsContent>

                  <TabsContent value="theme" className="space-y-6">
                    <ThemeCustomizer />
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-6">
                    <AdminTools />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <UnifiedLoginModal
              open={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              onSuccess={handleAuthSuccess}
            />
          </div>
        </TokenRedistributionServiceProvider>
      </AuthProvider>
    </UnifiedAuthProvider>
  );
}
