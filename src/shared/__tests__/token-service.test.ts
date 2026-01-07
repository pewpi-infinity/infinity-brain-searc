/**
 * TokenService Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { tokenService } from '../services/token-service';

describe('TokenService', () => {
  beforeEach(async () => {
    // Clear all tokens before each test
    await tokenService.clearAll();
  });

  describe('createToken', () => {
    it('should create a new token', async () => {
      const token = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      expect(token).toBeDefined();
      expect(token.id).toBeDefined();
      expect(token.name).toBe('Test Token');
      expect(token.symbol).toBe('TEST');
      expect(token.amount).toBe(1000);
      expect(token.creator).toBe('test@example.com');
      expect(token.createdAt).toBeDefined();
      expect(token.updatedAt).toBeDefined();
    });

    it('should generate unique IDs for tokens', async () => {
      const token1 = await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        creator: 'test@example.com',
      });

      const token2 = await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 200,
        creator: 'test@example.com',
      });

      expect(token1.id).not.toBe(token2.id);
    });

    it('should store metadata', async () => {
      const token = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
        metadata: {
          type: 'custom',
          description: 'A test token',
        },
      });

      expect(token.metadata).toBeDefined();
      expect(token.metadata?.type).toBe('custom');
      expect(token.metadata?.description).toBe('A test token');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no tokens exist', async () => {
      const tokens = await tokenService.getAll();
      expect(tokens).toEqual([]);
    });

    it('should return all created tokens', async () => {
      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        creator: 'test@example.com',
      });

      await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 200,
        creator: 'test@example.com',
      });

      const tokens = await tokenService.getAll();
      expect(tokens).toHaveLength(2);
      expect(tokens[0].name).toBe('Token 1');
      expect(tokens[1].name).toBe('Token 2');
    });
  });

  describe('getById', () => {
    it('should return undefined for non-existent token', async () => {
      const token = await tokenService.getById('non-existent-id');
      expect(token).toBeUndefined();
    });

    it('should return token by ID', async () => {
      const created = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      const retrieved = await tokenService.getById(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Token');
    });
  });

  describe('updateToken', () => {
    it('should update token properties', async () => {
      const token = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      const updated = await tokenService.updateToken(token.id, {
        name: 'Updated Token',
        amount: 2000,
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Token');
      expect(updated?.amount).toBe(2000);
      expect(updated?.symbol).toBe('TEST'); // Unchanged
      expect(updated?.updatedAt).not.toBe(token.updatedAt);
    });

    it('should return undefined for non-existent token', async () => {
      const updated = await tokenService.updateToken('non-existent-id', {
        name: 'Updated',
      });
      expect(updated).toBeUndefined();
    });
  });

  describe('deleteToken', () => {
    it('should delete a token', async () => {
      const token = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      const deleted = await tokenService.deleteToken(token.id);
      expect(deleted).toBe(true);

      const retrieved = await tokenService.getById(token.id);
      expect(retrieved).toBeUndefined();
    });

    it('should return false for non-existent token', async () => {
      const deleted = await tokenService.deleteToken('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all tokens', async () => {
      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        creator: 'test@example.com',
      });

      await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 200,
        creator: 'test@example.com',
      });

      await tokenService.clearAll();

      const tokens = await tokenService.getAll();
      expect(tokens).toHaveLength(0);
    });
  });

  describe('getTokensByCreator', () => {
    it('should return tokens by creator', async () => {
      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        creator: 'alice@example.com',
      });

      await tokenService.createToken({
        name: 'Token 2',
        symbol: 'TK2',
        amount: 200,
        creator: 'bob@example.com',
      });

      await tokenService.createToken({
        name: 'Token 3',
        symbol: 'TK3',
        amount: 300,
        creator: 'alice@example.com',
      });

      const aliceTokens = await tokenService.getTokensByCreator('alice@example.com');
      expect(aliceTokens).toHaveLength(2);
      expect(aliceTokens[0].creator).toBe('alice@example.com');
      expect(aliceTokens[1].creator).toBe('alice@example.com');

      const bobTokens = await tokenService.getTokensByCreator('bob@example.com');
      expect(bobTokens).toHaveLength(1);
      expect(bobTokens[0].creator).toBe('bob@example.com');
    });
  });

  describe('exportTokens', () => {
    it('should export tokens as JSON', async () => {
      await tokenService.createToken({
        name: 'Token 1',
        symbol: 'TK1',
        amount: 100,
        creator: 'test@example.com',
      });

      const exported = await tokenService.exportTokens();
      expect(exported).toBeDefined();
      
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Token 1');
    });
  });

  describe('importTokens', () => {
    it('should import tokens from JSON', async () => {
      const tokensToImport = [
        {
          id: 'test_1',
          name: 'Token 1',
          symbol: 'TK1',
          amount: 100,
          creator: 'test@example.com',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'test_2',
          name: 'Token 2',
          symbol: 'TK2',
          amount: 200,
          creator: 'test@example.com',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const imported = await tokenService.importTokens(JSON.stringify(tokensToImport));
      expect(imported).toBe(2);

      const tokens = await tokenService.getAll();
      expect(tokens).toHaveLength(2);
    });
  });

  describe('event system', () => {
    it('should emit created event when token is created', async () => {
      let eventReceived = false;
      let eventToken = null;

      const unsubscribe = tokenService.on('created', (event) => {
        eventReceived = true;
        eventToken = event.token;
      });

      await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      expect(eventReceived).toBe(true);
      expect(eventToken).toBeDefined();
      
      unsubscribe();
    });

    it('should emit updated event when token is updated', async () => {
      const token = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      let eventReceived = false;

      const unsubscribe = tokenService.on('updated', (event) => {
        eventReceived = true;
      });

      await tokenService.updateToken(token.id, { name: 'Updated' });

      expect(eventReceived).toBe(true);
      
      unsubscribe();
    });

    it('should emit deleted event when token is deleted', async () => {
      const token = await tokenService.createToken({
        name: 'Test Token',
        symbol: 'TEST',
        amount: 1000,
        creator: 'test@example.com',
      });

      let eventReceived = false;

      const unsubscribe = tokenService.on('deleted', (event) => {
        eventReceived = true;
      });

      await tokenService.deleteToken(token.id);

      expect(eventReceived).toBe(true);
      
      unsubscribe();
    });
  });
});
