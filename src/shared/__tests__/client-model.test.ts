/**
 * ClientModel Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createModel } from '../models/client-model';

interface TestDocument {
  _id: string;
  name: string;
  email: string;
  age?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

describe('ClientModel', () => {
  const TestModel = createModel<TestDocument>('test_model', {
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    age: { type: 'number' },
    active: { type: 'boolean', default: true },
  });

  beforeEach(async () => {
    // Clear the model data before each test
    await TestModel.drop();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const doc = await TestModel.create({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(doc._id).toBeDefined();
      expect(doc.name).toBe('John Doe');
      expect(doc.email).toBe('john@example.com');
      expect(doc.active).toBe(true); // default value
      expect(doc.createdAt).toBeInstanceOf(Date);
      expect(doc.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error if required field is missing', async () => {
      await expect(
        TestModel.create({
          name: 'John Doe',
        } as any)
      ).rejects.toThrow();
    });

    it('should apply default values', async () => {
      const doc = await TestModel.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(doc.active).toBe(true);
    });
  });

  describe('find', () => {
    it('should return empty array when no documents exist', async () => {
      const docs = await TestModel.find();
      expect(docs).toEqual([]);
    });

    it('should find all documents', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });

      const docs = await TestModel.find();
      expect(docs).toHaveLength(2);
    });

    it('should filter documents by query', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });

      const docs = await TestModel.find({ name: 'John' });
      expect(docs).toHaveLength(2);
      expect(docs[0].name).toBe('John');
      expect(docs[1].name).toBe('John');
    });

    it('should apply limit', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });
      await TestModel.create({ name: 'Bob', email: 'bob@example.com' });

      const docs = await TestModel.find({}, { limit: 2 });
      expect(docs).toHaveLength(2);
    });

    it('should apply skip', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });
      await TestModel.create({ name: 'Bob', email: 'bob@example.com' });

      const docs = await TestModel.find({}, { skip: 1 });
      expect(docs).toHaveLength(2);
      expect(docs[0].name).toBe('Jane');
    });

    it('should apply sorting', async () => {
      await TestModel.create({ name: 'Charlie', email: 'charlie@example.com' });
      await TestModel.create({ name: 'Alice', email: 'alice@example.com' });
      await TestModel.create({ name: 'Bob', email: 'bob@example.com' });

      const docs = await TestModel.find({}, { sort: { name: 1 } });
      expect(docs[0].name).toBe('Alice');
      expect(docs[1].name).toBe('Bob');
      expect(docs[2].name).toBe('Charlie');
    });
  });

  describe('findOne', () => {
    it('should return null when no document matches', async () => {
      const doc = await TestModel.findOne({ name: 'NonExistent' });
      expect(doc).toBeNull();
    });

    it('should return first matching document', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });

      const doc = await TestModel.findOne({ name: 'John' });
      expect(doc).not.toBeNull();
      expect(doc?.name).toBe('John');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent ID', async () => {
      const doc = await TestModel.findById('non-existent-id');
      expect(doc).toBeNull();
    });

    it('should return document by ID', async () => {
      const created = await TestModel.create({
        name: 'John',
        email: 'john@example.com',
      });

      const found = await TestModel.findById(created._id);
      expect(found).not.toBeNull();
      expect(found?._id).toBe(created._id);
      expect(found?.name).toBe('John');
    });
  });

  describe('updateOne', () => {
    it('should update a single document', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });

      const result = await TestModel.updateOne(
        { name: 'John' },
        { email: 'updated@example.com' }
      );

      expect(result.matchedCount).toBe(1);
      expect(result.modifiedCount).toBe(1);

      const docs = await TestModel.find({ email: 'updated@example.com' });
      expect(docs).toHaveLength(1);
    });

    it('should return 0 counts when no match', async () => {
      const result = await TestModel.updateOne(
        { name: 'NonExistent' },
        { email: 'updated@example.com' }
      );

      expect(result.matchedCount).toBe(0);
      expect(result.modifiedCount).toBe(0);
    });
  });

  describe('updateMany', () => {
    it('should update multiple documents', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });

      const result = await TestModel.updateMany(
        { name: 'John' },
        { active: false }
      );

      expect(result.matchedCount).toBe(2);
      expect(result.modifiedCount).toBe(2);

      const updated = await TestModel.find({ active: false });
      expect(updated).toHaveLength(2);
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should update and return document', async () => {
      const doc = await TestModel.create({
        name: 'John',
        email: 'john@example.com',
      });

      const updated = await TestModel.findByIdAndUpdate(
        doc._id,
        { name: 'John Updated' },
        { new: true }
      );

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('John Updated');
    });

    it('should return null for non-existent ID', async () => {
      const updated = await TestModel.findByIdAndUpdate(
        'non-existent-id',
        { name: 'Updated' }
      );

      expect(updated).toBeNull();
    });
  });

  describe('deleteOne', () => {
    it('should delete a single document', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });

      const result = await TestModel.deleteOne({ name: 'John' });
      expect(result.deletedCount).toBe(1);

      const remaining = await TestModel.find({ name: 'John' });
      expect(remaining).toHaveLength(1);
    });

    it('should return 0 when no match', async () => {
      const result = await TestModel.deleteOne({ name: 'NonExistent' });
      expect(result.deletedCount).toBe(0);
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple documents', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });

      const result = await TestModel.deleteMany({ name: 'John' });
      expect(result.deletedCount).toBe(2);

      const remaining = await TestModel.find();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('Jane');
    });
  });

  describe('findByIdAndDelete', () => {
    it('should delete and return document', async () => {
      const doc = await TestModel.create({
        name: 'John',
        email: 'john@example.com',
      });

      const deleted = await TestModel.findByIdAndDelete(doc._id);
      expect(deleted).not.toBeNull();
      expect(deleted?._id).toBe(doc._id);

      const found = await TestModel.findById(doc._id);
      expect(found).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const deleted = await TestModel.findByIdAndDelete('non-existent-id');
      expect(deleted).toBeNull();
    });
  });

  describe('countDocuments', () => {
    it('should return 0 for empty collection', async () => {
      const count = await TestModel.countDocuments();
      expect(count).toBe(0);
    });

    it('should count all documents', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });

      const count = await TestModel.countDocuments();
      expect(count).toBe(2);
    });

    it('should count documents matching query', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'John', email: 'john2@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });

      const count = await TestModel.countDocuments({ name: 'John' });
      expect(count).toBe(2);
    });
  });

  describe('drop', () => {
    it('should clear all documents', async () => {
      await TestModel.create({ name: 'John', email: 'john@example.com' });
      await TestModel.create({ name: 'Jane', email: 'jane@example.com' });

      await TestModel.drop();

      const docs = await TestModel.find();
      expect(docs).toHaveLength(0);
    });
  });
});
