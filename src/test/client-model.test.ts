/**
 * Unit tests for ClientModel
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ClientModel, createModel } from '../shared/client-model';

interface TestDocument {
  name: string;
  age: number;
  email: string;
  active?: boolean;
}

describe('ClientModel', () => {
  let model: ClientModel<TestDocument>;

  beforeEach(async () => {
    model = createModel<TestDocument>('test_collection', {
      name: { type: 'string', required: true },
      age: { type: 'number', required: true },
      email: { type: 'string', required: true },
      active: { type: 'boolean', default: true }
    });
    await model.clear();
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const doc = await model.create({
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      });

      expect(doc).toBeDefined();
      expect(doc._id).toBeDefined();
      expect(doc.name).toBe('John Doe');
      expect(doc.age).toBe(30);
      expect(doc.email).toBe('john@example.com');
      expect(doc.active).toBe(true); // Default value
      expect(doc.createdAt).toBeDefined();
      expect(doc.updatedAt).toBeDefined();
    });

    it('should apply default values', async () => {
      const doc = await model.create({
        name: 'Jane',
        age: 25,
        email: 'jane@example.com'
      });

      expect(doc.active).toBe(true);
    });

    it('should throw error if required field is missing', async () => {
      await expect(
        model.create({
          name: 'Incomplete',
          age: 20
          // email is missing
        } as any)
      ).rejects.toThrow('Validation failed');
    });

    it('should throw error if type is wrong', async () => {
      await expect(
        model.create({
          name: 'Wrong Type',
          age: '30', // Should be number
          email: 'test@example.com'
        } as any)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      await model.create({
        name: 'Alice',
        age: 25,
        email: 'alice@example.com'
      });
      await model.create({
        name: 'Bob',
        age: 30,
        email: 'bob@example.com'
      });
      await model.create({
        name: 'Charlie',
        age: 25,
        email: 'charlie@example.com'
      });
    });

    it('should find all documents', async () => {
      const docs = await model.find();
      expect(docs).toHaveLength(3);
    });

    it('should find documents matching query', async () => {
      const docs = await model.find({ age: 25 });
      expect(docs).toHaveLength(2);
      expect(docs[0].name).toBe('Alice');
      expect(docs[1].name).toBe('Charlie');
    });

    it('should support limit', async () => {
      const docs = await model.find({}, { limit: 2 });
      expect(docs).toHaveLength(2);
    });

    it('should support skip', async () => {
      const docs = await model.find({}, { skip: 1 });
      expect(docs).toHaveLength(2);
    });

    it('should support sort', async () => {
      const docs = await model.find({}, {
        sort: { age: -1 } // Descending
      });
      expect(docs[0].age).toBe(30);
      expect(docs[1].age).toBe(25);
    });
  });

  describe('findOne', () => {
    it('should find first matching document', async () => {
      await model.create({
        name: 'First',
        age: 20,
        email: 'first@example.com'
      });
      await model.create({
        name: 'Second',
        age: 20,
        email: 'second@example.com'
      });

      const doc = await model.findOne({ age: 20 });
      expect(doc).toBeDefined();
      expect(doc!.name).toBe('First');
    });

    it('should return null if no match', async () => {
      const doc = await model.findOne({ age: 99 });
      expect(doc).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find document by ID', async () => {
      const created = await model.create({
        name: 'Find Me',
        age: 35,
        email: 'findme@example.com'
      });

      const found = await model.findById(created._id);
      expect(found).toBeDefined();
      expect(found!._id).toBe(created._id);
      expect(found!.name).toBe('Find Me');
    });

    it('should return null for non-existent ID', async () => {
      const found = await model.findById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should update document by ID', async () => {
      const created = await model.create({
        name: 'Original',
        age: 25,
        email: 'original@example.com'
      });

      const updated = await model.findByIdAndUpdate(
        created._id,
        { name: 'Updated', age: 26 },
        { new: true }
      );

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated');
      expect(updated!.age).toBe(26);
      expect(updated!.email).toBe('original@example.com'); // Unchanged
      expect(updated!._id).toBe(created._id); // ID preserved
      expect(updated!.createdAt).toBe(created.createdAt); // CreatedAt preserved
    });

    it('should return old document if new: false', async () => {
      const created = await model.create({
        name: 'Old',
        age: 20,
        email: 'old@example.com'
      });

      const result = await model.findByIdAndUpdate(
        created._id,
        { name: 'New' },
        { new: false }
      );

      expect(result!.name).toBe('Old'); // Returns old version
    });

    it('should return null for non-existent ID', async () => {
      const result = await model.findByIdAndUpdate(
        'nonexistent',
        { name: 'Updated' }
      );
      expect(result).toBeNull();
    });
  });

  describe('findByIdAndDelete', () => {
    it('should delete document by ID', async () => {
      const created = await model.create({
        name: 'Delete Me',
        age: 40,
        email: 'deleteme@example.com'
      });

      const deleted = await model.findByIdAndDelete(created._id);
      expect(deleted).toBeDefined();
      expect(deleted!._id).toBe(created._id);

      const found = await model.findById(created._id);
      expect(found).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const result = await model.findByIdAndDelete('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple matching documents', async () => {
      await model.create({
        name: 'Delete 1',
        age: 25,
        email: 'del1@example.com'
      });
      await model.create({
        name: 'Delete 2',
        age: 25,
        email: 'del2@example.com'
      });
      await model.create({
        name: 'Keep',
        age: 30,
        email: 'keep@example.com'
      });

      const deleted = await model.deleteMany({ age: 25 });
      expect(deleted).toBe(2);

      const remaining = await model.find();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe('Keep');
    });
  });

  describe('countDocuments', () => {
    it('should count all documents', async () => {
      await model.create({ name: 'A', age: 20, email: 'a@example.com' });
      await model.create({ name: 'B', age: 25, email: 'b@example.com' });
      await model.create({ name: 'C', age: 30, email: 'c@example.com' });

      const count = await model.countDocuments();
      expect(count).toBe(3);
    });

    it('should count matching documents', async () => {
      await model.create({ name: 'A', age: 25, email: 'a@example.com' });
      await model.create({ name: 'B', age: 25, email: 'b@example.com' });
      await model.create({ name: 'C', age: 30, email: 'c@example.com' });

      const count = await model.countDocuments({ age: 25 });
      expect(count).toBe(2);
    });
  });

  describe('export/import', () => {
    it('should export collection data', async () => {
      await model.create({
        name: 'Export Test',
        age: 25,
        email: 'export@example.com'
      });

      const exported = await model.export();
      const data = JSON.parse(exported);

      expect(data.collection).toBe('test_collection');
      expect(data.count).toBe(1);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Export Test');
    });

    it('should import collection data', async () => {
      const exportData = JSON.stringify({
        collection: 'test_collection',
        count: 2,
        data: [
          { name: 'Import 1', age: 20, email: 'import1@example.com' },
          { name: 'Import 2', age: 25, email: 'import2@example.com' }
        ]
      });

      const imported = await model.import(exportData);
      expect(imported).toBe(2);

      const docs = await model.find();
      expect(docs).toHaveLength(2);
    });
  });
});
