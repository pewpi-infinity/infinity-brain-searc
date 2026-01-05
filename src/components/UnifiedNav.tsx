/**
 * Unified Navigation Bar
 * Cross-repository navigation component
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  isAuthenticated,
  getCurrentUsername,
  signOut,
  getAllBalances,
  setupStorageListener
} from '@/lib/auth-unified';

interface UnifiedNavProps {
  onAuthClick: () => void;
}

export function UnifiedNav({ onAuthClick }: UnifiedNavProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [balances, setBalances] = useState({
    infinity_tokens: 0,
    research_tokens: 0,
    art_tokens: 0,
    music_tokens: 0
  });

  const updateAuthState = () => {
    setAuthenticated(isAuthenticated());
    setUsername(getCurrentUsername());
    setBalances(getAllBalances());
  };

  useEffect(() => {
    updateAuthState();

    // Setup cross-tab sync
    setupStorageListener(() => {
      updateAuthState();
    });

    // Heartbeat sync every 5 seconds
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        updateAuthState();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    signOut();
    updateAuthState();
  };

  const getCurrentRepoName = () => {
    const pathname = window.location.pathname;
    if (pathname.includes('infinity-brain-searc')) return 'infinity-brain-searc';
    if (pathname.includes('repo-dashboard-hub')) return 'repo-dashboard-hub';
    if (pathname.includes('banksy')) return 'banksy';
    if (pathname.includes('smug_look')) return 'smug_look';
    return 'infinity-brain-searc';
  };

  const currentRepo = getCurrentRepoName();

  const repos = [
    {
      name: 'Search',
      emoji: '🔍',
      url: 'https://pewpi-infinity.github.io/infinity-brain-searc/',
      key: 'infinity-brain-searc'
    },
    {
      name: 'Dashboard',
      emoji: '📊',
      url: 'https://pewpi-infinity.github.io/repo-dashboard-hub/',
      key: 'repo-dashboard-hub'
    },
    {
      name: 'Banksy',
      emoji: '🎨',
      url: 'https://pewpi-infinity.github.io/banksy/',
      key: 'banksy'
    },
    {
      name: 'Research',
      emoji: '🔬',
      url: 'https://pewpi-infinity.github.io/smug_look/',
      key: 'smug_look'
    }
  ];

  return (
    <nav className="unified-nav">
      <style>{`
        .unified-nav {
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
          border-bottom: 2px solid #2563eb;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          flex-wrap: wrap;
          gap: 12px;
        }

        .nav-brand {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e0e7ff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-repos {
          display: flex;
          gap: 16px;
          flex: 1;
          justify-content: center;
          flex-wrap: wrap;
        }

        .nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s;
          text-decoration: none;
          color: #e0e7ff;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: rgba(37, 99, 235, 0.2);
          transform: translateY(-2px);
          border-color: rgba(37, 99, 235, 0.3);
        }

        .nav-link.active {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .user-name {
          color: #e0e7ff;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .wallet-display {
          display: flex;
          gap: 12px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: #e0e7ff;
        }

        .wallet-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-auth-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          font-size: 0.9rem;
        }

        .nav-auth-btn.sign-in {
          background: #2563eb;
          color: white;
        }

        .nav-auth-btn.sign-in:hover {
          background: #1d4ed8;
        }

        .nav-auth-btn.sign-out {
          background: rgba(239, 68, 68, 0.8);
          color: white;
        }

        .nav-auth-btn.sign-out:hover {
          background: rgba(220, 38, 38, 0.9);
        }

        @media (max-width: 768px) {
          .unified-nav {
            padding: 8px 12px;
          }

          .nav-repos {
            order: 3;
            width: 100%;
            justify-content: center;
          }

          .wallet-display {
            font-size: 12px;
            gap: 8px;
            padding: 4px 8px;
          }
        }
      `}</style>

      <div className="nav-brand">
        <span>🧠</span>
        <span>Pewpi Infinity</span>
      </div>

      <div className="nav-repos">
        {repos.map((repo) => (
          <a
            key={repo.key}
            href={repo.url}
            className={`nav-link ${currentRepo === repo.key ? 'active' : ''}`}
          >
            <span>{repo.emoji} {repo.name}</span>
          </a>
        ))}
      </div>

      <div className="nav-user">
        {authenticated ? (
          <>
            <span className="user-name">{username}</span>
            <div className="wallet-display">
              <div className="wallet-item" title="Infinity Tokens">
                <span>💎</span>
                <span>{balances.infinity_tokens}</span>
              </div>
              <div className="wallet-item" title="Research Tokens">
                <span>📚</span>
                <span>{balances.research_tokens}</span>
              </div>
              <div className="wallet-item" title="Art Tokens">
                <span>🎨</span>
                <span>{balances.art_tokens}</span>
              </div>
              <div className="wallet-item" title="Music Tokens">
                <span>🎵</span>
                <span>{balances.music_tokens}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="nav-auth-btn sign-out"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <span className="user-name">Guest</span>
            <button
              onClick={onAuthClick}
              className="nav-auth-btn sign-in"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
