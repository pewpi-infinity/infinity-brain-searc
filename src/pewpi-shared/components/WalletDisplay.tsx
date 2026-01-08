/**
 * Wallet Display - Lightweight wallet UI component
 * 
 * Features:
 * - Display total balance
 * - List all tokens
 * - Real-time updates via event listeners
 * - Minimal, opt-in design
 */

import React, { useState, useEffect } from 'react';
import { tokenService, Token } from '../token-service';
import { walletService } from '../wallet-unified';

export interface WalletDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDisplay({ isOpen, onClose }: WalletDisplayProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadWalletData();

      // Subscribe to token events for real-time updates
      const unsubscribeCreated = tokenService.on('created', () => {
        loadWalletData();
      });

      const unsubscribeUpdated = tokenService.on('updated', () => {
        loadWalletData();
      });

      const unsubscribeDeleted = tokenService.on('deleted', () => {
        loadWalletData();
      });

      return () => {
        unsubscribeCreated();
        unsubscribeUpdated();
        unsubscribeDeleted();
      };
    }
  }, [isOpen]);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const [allTokens, balance] = await Promise.all([
        tokenService.getAll(),
        walletService.getTotalBalance(),
      ]);
      setTokens(allTokens);
      setTotalBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            My Wallet
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6B7280',
            }}
          >
            ×
          </button>
        </div>

        {/* Total Balance */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#F3F4F6',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6B7280' }}>
            Total Balance
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>
            {totalBalance.toLocaleString()}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'}
          </p>
        </div>

        {/* Token List */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
            Your Tokens
          </h3>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
              Loading...
            </div>
          ) : tokens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>No tokens yet</p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Create your first token to get started
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tokens.map((token) => (
                <div
                  key={token.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', fontSize: '0.875rem' }}>
                      {token.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>
                      {token.symbol} • {token.creator}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>
                      {token.amount.toLocaleString()}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>
                      {new Date(token.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
