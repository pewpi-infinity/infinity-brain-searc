/**
 * TokenService Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenService, Token } from '../shared/wallet/token-service';

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
};

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    tokenService = new TokenService();
  });

  describe('Token Creation', () => {
    it('should create a new token', async () => {
      const tokenData = {
        name: 'Test Token',
        symbol: 'TEST',
        balance: 100,
        value: 1.5,
        metadata: {
          source: 'test',
          description: 'A test token'
        }
      };

      const token = await tokenService.createToken(tokenData);

      expect(token.id).toBeDefined();
      expect(token.name).toBe('Test Token');
      expect(token.symbol).toBe('TEST');
      expect(token.balance).toBe(100);
      expect(token.value).toBe(1.5);
      expect(token.metadata.createdAt).toBeDefined();
      expect(token.metadata.updatedAt).toBeDefined();
    });

    it('should emit token created event', async () => {
      const listener = vi.fn();
      tokenService.on('pewpi.token.created', listener);

      const token = await tokenService.createToken({
        name: 'Event Token',
        symbol: 'EVT',
        balance: 50,
        value: 1.0
      });

      expect(listener).toHaveBeenCalledWith(token);
    });
  });

  describe('Token Retrieval', () => {
    it('should get all tokens', async () => {
      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        balance: 100,
        value: 1.0
      });

      await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        balance: 200,
        value: 2.0
      });

      const tokens = await tokenService.getAll();
      expect(tokens.length).toBeGreaterThanOrEqual(2);
    });

    it('should get token by ID', async () => {
      const created = await tokenService.createToken({
        name: 'Fetch Token',
        symbol: 'FETCH',
        balance: 75,
        value: 1.25
      });

      const fetched = await tokenService.getById(created.id);
      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(created.id);
      expect(fetched?.name).toBe('Fetch Token');
    });
  });

  describe('Token Update', () => {
    it('should update a token', async () => {
      const created = await tokenService.createToken({
        name: 'Update Token',
        symbol: 'UPD',
        balance: 100,
        value: 1.0
      });

      const updated = await tokenService.updateToken(created.id, {
        balance: 150
      });

      expect(updated).toBeDefined();
      expect(updated?.balance).toBe(150);
      expect(updated?.name).toBe('Update Token');
    });

    it('should emit token updated event', async () => {
      const created = await tokenService.createToken({
        name: 'Event Update Token',
        symbol: 'EVUP',
        balance: 100,
        value: 1.0
      });

      const listener = vi.fn();
      tokenService.on('pewpi.token.updated', listener);

      await tokenService.updateToken(created.id, { balance: 200 });

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Token Deletion', () => {
    it('should delete a token', async () => {
      const created = await tokenService.createToken({
        name: 'Delete Token',
        symbol: 'DEL',
        balance: 100,
        value: 1.0
      });

      const deleted = await tokenService.deleteToken(created.id);
      expect(deleted).toBe(true);

      const fetched = await tokenService.getById(created.id);
      expect(fetched).toBeUndefined();
    });
  });

  describe('Token Totals', () => {
    it('should calculate total balance', async () => {
      await tokenService.clearAll();

      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        balance: 100,
        value: 1.0
      });

      await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        balance: 200,
        value: 1.0
      });

      const totalBalance = await tokenService.getTotalBalance();
      expect(totalBalance).toBeGreaterThanOrEqual(300);
    });

    it('should calculate total value', async () => {
      await tokenService.clearAll();

      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        balance: 100,
        value: 2.0
      });

      await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        balance: 50,
        value: 3.0
      });

      const totalValue = await tokenService.getTotalValue();
      expect(totalValue).toBeGreaterThanOrEqual(350); // (100 * 2.0) + (50 * 3.0) = 350
    });
  });

  describe('Event Listeners', () => {
    it('should allow subscribing to events', () => {
      const listener = vi.fn();
      const unsubscribe = tokenService.on('pewpi.token.created', listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing from events', async () => {
      const listener = vi.fn();
      const unsubscribe = tokenService.on('pewpi.token.created', listener);

      await tokenService.createToken({
        name: 'Test',
        symbol: 'TST',
        balance: 100,
        value: 1.0
      });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      await tokenService.createToken({
        name: 'Test 2',
        symbol: 'TS2',
        balance: 100,
        value: 1.0
      });

      expect(listener).toHaveBeenCalledTimes(1); // Should not increase
    });
  });
});
