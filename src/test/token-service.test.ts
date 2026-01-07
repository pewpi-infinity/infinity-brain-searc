/**
 * Unit tests for TokenService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenService, Token } from '../shared/token-service';

describe('TokenService', () => {
  beforeEach(async () => {
    // Clear tokens before each test
    await TokenService.clearAll();
  });

  describe('createToken', () => {
    it('should create a new token', async () => {
      const token = await TokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens',
        source: 'test'
      });

      expect(token).toBeDefined();
      expect(token.name).toBe('Test Token');
      expect(token.symbol).toBe('TEST');
      expect(token.amount).toBe(100);
      expect(token.value).toBe(1000);
      expect(token.currency).toBe('infinity_tokens');
      expect(token.id).toBeDefined();
      expect(token.createdAt).toBeDefined();
      expect(token.updatedAt).toBeDefined();
    });

    it('should emit created event', async () => {
      const callback = vi.fn();
      const unsubscribe = TokenService.on('created', callback);

      await TokenService.createToken({
        name: 'Event Test',
        symbol: 'EVT',
        amount: 50,
        value: 500,
        currency: 'research_tokens'
      });

      expect(callback).toHaveBeenCalledOnce();
      expect(callback.mock.calls[0][0].type).toBe('created');
      expect(callback.mock.calls[0][0].token.name).toBe('Event Test');

      unsubscribe();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no tokens', async () => {
      const tokens = await TokenService.getAll();
      expect(tokens).toEqual([]);
    });

    it('should return all tokens', async () => {
      await TokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      await TokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 200,
        value: 2000,
        currency: 'art_tokens'
      });

      const tokens = await TokenService.getAll();
      expect(tokens).toHaveLength(2);
      expect(tokens[0].name).toBe('Token 1');
      expect(tokens[1].name).toBe('Token 2');
    });
  });

  describe('getByCurrency', () => {
    it('should return tokens of specific currency', async () => {
      await TokenService.createToken({
        name: 'Infinity Token',
        symbol: 'INF',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      await TokenService.createToken({
        name: 'Research Token',
        symbol: 'RES',
        amount: 50,
        value: 500,
        currency: 'research_tokens'
      });

      const infinityTokens = await TokenService.getByCurrency('infinity_tokens');
      expect(infinityTokens).toHaveLength(1);
      expect(infinityTokens[0].currency).toBe('infinity_tokens');

      const researchTokens = await TokenService.getByCurrency('research_tokens');
      expect(researchTokens).toHaveLength(1);
      expect(researchTokens[0].currency).toBe('research_tokens');
    });
  });

  describe('updateToken', () => {
    it('should update existing token', async () => {
      const token = await TokenService.createToken({
        name: 'Original',
        symbol: 'ORG',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      const updated = await TokenService.updateToken(token.id, {
        name: 'Updated',
        amount: 200
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated');
      expect(updated!.amount).toBe(200);
      expect(updated!.symbol).toBe('ORG'); // Unchanged
      expect(updated!.id).toBe(token.id); // ID preserved
      expect(updated!.createdAt).toBe(token.createdAt); // CreatedAt preserved
    });

    it('should return null for non-existent token', async () => {
      const updated = await TokenService.updateToken('nonexistent', {
        name: 'Updated'
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('should delete existing token', async () => {
      const token = await TokenService.createToken({
        name: 'To Delete',
        symbol: 'DEL',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      const result = await TokenService.deleteToken(token.id);
      expect(result).toBe(true);

      const tokens = await TokenService.getAll();
      expect(tokens).toHaveLength(0);
    });

    it('should return false for non-existent token', async () => {
      const result = await TokenService.deleteToken('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      await TokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      await TokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 50,
        value: 500,
        currency: 'infinity_tokens'
      });

      await TokenService.createToken({
        name: 'Token 3',
        symbol: 'TK3',
        amount: 75,
        value: 750,
        currency: 'research_tokens'
      });

      const stats = await TokenService.getStats();
      expect(stats.total).toBe(3);
      expect(stats.byType.infinity_tokens).toBe(2);
      expect(stats.byType.research_tokens).toBe(1);
      expect(stats.byType.art_tokens).toBe(0);
      expect(stats.totalValue).toBe(2250);
    });
  });

  describe('clearAll', () => {
    it('should clear all tokens', async () => {
      await TokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      await TokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 200,
        value: 2000,
        currency: 'art_tokens'
      });

      await TokenService.clearAll();

      const tokens = await TokenService.getAll();
      expect(tokens).toHaveLength(0);
    });
  });

  describe('event listeners', () => {
    it('should support multiple listeners', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = TokenService.on('created', callback1);
      const unsub2 = TokenService.on('created', callback2);

      await TokenService.createToken({
        name: 'Multi Event',
        symbol: 'MLT',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();

      unsub1();
      unsub2();
    });

    it('should unsubscribe correctly', async () => {
      const callback = vi.fn();
      const unsubscribe = TokenService.on('created', callback);

      await TokenService.createToken({
        name: 'First',
        symbol: 'FST',
        amount: 100,
        value: 1000,
        currency: 'infinity_tokens'
      });

      expect(callback).toHaveBeenCalledOnce();

      unsubscribe();

      await TokenService.createToken({
        name: 'Second',
        symbol: 'SND',
        amount: 200,
        value: 2000,
        currency: 'art_tokens'
      });

      // Should still be 1, not 2
      expect(callback).toHaveBeenCalledOnce();
    });
  });
});
