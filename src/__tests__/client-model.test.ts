/**
 * ClientModel Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClientModel, createModel } from '../shared/models/client-model';

interface TestUser {
  username: string;
  email: string;
  age: number;
  role: string;
}

describe('ClientModel', () => {
  let UserModel: ClientModel<TestUser>;

  beforeEach(() => {
    UserModel = createModel<TestUser>('test_users', {
      username: String,
      email: String,
      age: Number,
      role: String
    });
  });

  describe('Document Creation', () => {
    it('should create a new document', async () => {
      const user = await UserModel.create({
        username: 'john_doe',
        email: 'john@example.com',
        age: 30,
        role: 'user'
      });

      expect(user._id).toBeDefined();
      expect(user.username).toBe('john_doe');
      expect(user.email).toBe('john@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-generate _id, createdAt, and updatedAt', async () => {
      const user = await UserModel.create({
        username: 'jane_doe',
        email: 'jane@example.com',
        age: 25,
        role: 'admin'
      });

      expect(user._id).toMatch(/^test_users_/);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('Document Retrieval', () => {
    it('should find documents by query', async () => {
      await UserModel.create({
        username: 'user1',
        email: 'user1@example.com',
        age: 20,
        role: 'user'
      });

      await UserModel.create({
        username: 'user2',
        email: 'user2@example.com',
        age: 30,
        role: 'admin'
      });

      const users = await UserModel.find({ role: 'user' });
      expect(users.length).toBeGreaterThanOrEqual(1);
      expect(users[0].role).toBe('user');
    });

    it('should find one document', async () => {
      await UserModel.create({
        username: 'unique_user',
        email: 'unique@example.com',
        age: 35,
        role: 'moderator'
      });

      const user = await UserModel.findOne({ username: 'unique_user' });
      expect(user).not.toBeNull();
      expect(user?.username).toBe('unique_user');
    });

    it('should find by ID', async () => {
      const created = await UserModel.create({
        username: 'id_user',
        email: 'id@example.com',
        age: 28,
        role: 'user'
      });

      const found = await UserModel.findById(created._id);
      expect(found).not.toBeNull();
      expect(found?._id).toBe(created._id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await UserModel.findById('non_existent_id');
      expect(found).toBeNull();
    });
  });

  describe('Document Update', () => {
    it('should update by ID', async () => {
      const created = await UserModel.create({
        username: 'update_user',
        email: 'update@example.com',
        age: 25,
        role: 'user'
      });

      const updated = await UserModel.findByIdAndUpdate(
        created._id,
        { age: 26 },
        { new: true }
      );

      expect(updated).not.toBeNull();
      expect(updated?.age).toBe(26);
      expect(updated?.username).toBe('update_user');
    });

    it('should update multiple documents', async () => {
      await UserModel.create({
        username: 'batch1',
        email: 'batch1@example.com',
        age: 20,
        role: 'user'
      });

      await UserModel.create({
        username: 'batch2',
        email: 'batch2@example.com',
        age: 21,
        role: 'user'
      });

      const count = await UserModel.updateMany(
        { role: 'user' },
        { role: 'verified_user' }
      );

      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Document Deletion', () => {
    it('should delete by ID', async () => {
      const created = await UserModel.create({
        username: 'delete_user',
        email: 'delete@example.com',
        age: 30,
        role: 'user'
      });

      const deleted = await UserModel.findByIdAndDelete(created._id);
      expect(deleted).not.toBeNull();
      expect(deleted?._id).toBe(created._id);

      const found = await UserModel.findById(created._id);
      expect(found).toBeNull();
    });

    it('should delete multiple documents', async () => {
      await UserModel.create({
        username: 'temp1',
        email: 'temp1@example.com',
        age: 20,
        role: 'temp'
      });

      await UserModel.create({
        username: 'temp2',
        email: 'temp2@example.com',
        age: 21,
        role: 'temp'
      });

      const count = await UserModel.deleteMany({ role: 'temp' });
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Document Count', () => {
    it('should count all documents', async () => {
      await UserModel.deleteAll();

      await UserModel.create({
        username: 'count1',
        email: 'count1@example.com',
        age: 25,
        role: 'user'
      });

      await UserModel.create({
        username: 'count2',
        email: 'count2@example.com',
        age: 26,
        role: 'user'
      });

      const count = await UserModel.countDocuments();
      expect(count).toBe(2);
    });

    it('should count documents with query', async () => {
      await UserModel.deleteAll();

      await UserModel.create({
        username: 'admin1',
        email: 'admin1@example.com',
        age: 30,
        role: 'admin'
      });

      await UserModel.create({
        username: 'user1',
        email: 'user1@example.com',
        age: 25,
        role: 'user'
      });

      const adminCount = await UserModel.countDocuments({ role: 'admin' });
      expect(adminCount).toBe(1);
    });
  });

  describe('Query Options', () => {
    beforeEach(async () => {
      await UserModel.deleteAll();
    });

    it('should limit results', async () => {
      await UserModel.create({ username: 'u1', email: 'u1@test.com', age: 20, role: 'user' });
      await UserModel.create({ username: 'u2', email: 'u2@test.com', age: 21, role: 'user' });
      await UserModel.create({ username: 'u3', email: 'u3@test.com', age: 22, role: 'user' });

      const users = await UserModel.find({}, { limit: 2 });
      expect(users.length).toBe(2);
    });

    it('should skip results', async () => {
      await UserModel.create({ username: 'u1', email: 'u1@test.com', age: 20, role: 'user' });
      await UserModel.create({ username: 'u2', email: 'u2@test.com', age: 21, role: 'user' });
      await UserModel.create({ username: 'u3', email: 'u3@test.com', age: 22, role: 'user' });

      const users = await UserModel.find({}, { skip: 1, limit: 2 });
      expect(users.length).toBe(2);
    });
  });
});
