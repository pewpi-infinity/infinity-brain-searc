/**
 * ClientModel - Mongoose-like model emulator for front-end use
 * 
 * Provides a familiar API for data management without a backend.
 * Uses IndexedDB via Dexie for persistence.
 */

import Dexie, { Table } from 'dexie';

export interface ModelSchema {
  [key: string]: any;
}

export interface ModelDocument extends ModelSchema {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
 * ClientModel - Mongoose-style model emulator for frontend operations
 * Provides a familiar API for CRUD operations without a backend
 */

export interface ModelSchema {
  [key: string]: {
    type: string;
    required?: boolean;
    default?: any;
    unique?: boolean;
  };
}

export interface Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: { [key: string]: 1 | -1 };
}

class ClientDatabase extends Dexie {
  private collections: Map<string, Table<any, string>>;

  constructor() {
    super('PewpiClientDatabase');
    this.collections = new Map();
  }

  registerCollection(name: string, schema: string): void {
    if (!this.collections.has(name)) {
      const version = this.verno + 1;
      this.version(version).stores({
        [name]: schema
      });
      this.collections.set(name, this.table(name));
    }
  }

  getCollection(name: string): Table<any, string> | undefined {
    return this.collections.get(name);
  }
}

const clientDb = new ClientDatabase();

export class ClientModel<T extends ModelSchema> {
  private collectionName: string;
  private schema: ModelSchema;
  private collection: Table<ModelDocument, string> | undefined;

  constructor(collectionName: string, schema: ModelSchema) {
    this.collectionName = collectionName;
    this.schema = schema;
    
    // Register collection with Dexie
    const indexFields = ['_id', 'createdAt', 'updatedAt', ...Object.keys(schema)];
    const schemaString = indexFields.join(', ');
    clientDb.registerCollection(collectionName, schemaString);
    
    this.collection = clientDb.getCollection(collectionName);
  sort?: Record<string, 1 | -1>;
}

export class ClientModel<T extends Document = Document> {
  private modelName: string;
  private schema: ModelSchema;
  private storageKey: string;

  constructor(modelName: string, schema: ModelSchema) {
    this.modelName = modelName;
    this.schema = schema;
    this.storageKey = `pewpi_model_${modelName}`;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<ModelDocument & T> {
    const now = new Date();
    const doc: ModelDocument & T = {
      _id: `${this.collectionName}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: now,
      updatedAt: now,
      ...data as T
    };

    if (this.collection) {
      try {
        await this.collection.add(doc);
      } catch (error) {
        console.error(`Failed to create document in ${this.collectionName}:`, error);
        throw error;
      }
    }

    return doc;
  }

  /**
   * Find documents matching a query
   */
  async find(query: Partial<T> = {}, options: QueryOptions = {}): Promise<(ModelDocument & T)[]> {
    if (!this.collection) return [];

    try {
      let collection = this.collection.toCollection();

      // Apply filters
      const queryKeys = Object.keys(query);
      if (queryKeys.length > 0) {
        collection = collection.filter(doc => {
          return queryKeys.every(key => {
            const queryValue = query[key as keyof T];
            const docValue = doc[key];
            
            // Handle different query types
            if (typeof queryValue === 'object' && queryValue !== null) {
              // Support MongoDB-like operators
              if ('$eq' in queryValue) return docValue === queryValue.$eq;
              if ('$ne' in queryValue) return docValue !== queryValue.$ne;
              if ('$gt' in queryValue) return docValue > queryValue.$gt;
              if ('$gte' in queryValue) return docValue >= queryValue.$gte;
              if ('$lt' in queryValue) return docValue < queryValue.$lt;
              if ('$lte' in queryValue) return docValue <= queryValue.$lte;
              if ('$in' in queryValue) return queryValue.$in.includes(docValue);
            }
            
            return docValue === queryValue;
          });
        });
      }

      // Apply sorting
      if (options.sort) {
        const sortKey = Object.keys(options.sort)[0];
        const sortOrder = options.sort[sortKey];
        collection = collection.sortBy(sortKey);
        if (sortOrder === -1) {
          collection = collection.reverse();
        }
      }

      // Apply pagination
      if (options.skip) {
        collection = collection.offset(options.skip);
      }
      if (options.limit) {
        collection = collection.limit(options.limit);
      }

      return await collection.toArray();
    } catch (error) {
      console.error(`Failed to find documents in ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Find a single document matching a query
   */
  async findOne(query: Partial<T> = {}): Promise<(ModelDocument & T) | null> {
    const results = await this.find(query, { limit: 1 });
    return results[0] || null;
  }

  /**
   * Find a document by ID
   */
  async findById(id: string): Promise<(ModelDocument & T) | null> {
    if (!this.collection) return null;

    try {
      const doc = await this.collection.get(id);
      return doc || null;
    } catch (error) {
      console.error(`Failed to find document by ID in ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Update a document by ID
   */
  async findByIdAndUpdate(
    id: string,
    update: Partial<T>,
    options: { new?: boolean } = {}
  ): Promise<(ModelDocument & T) | null> {
    if (!this.collection) return null;

    try {
      const doc = await this.collection.get(id);
      if (!doc) return null;

      const updatedDoc = {
        ...doc,
        ...update,
        _id: id, // Preserve ID
        createdAt: doc.createdAt, // Preserve creation date
        updatedAt: new Date()
      };

      await this.collection.put(updatedDoc);

      return options.new ? updatedDoc : doc;
    } catch (error) {
      console.error(`Failed to update document in ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Update multiple documents matching a query
   */
  async updateMany(query: Partial<T>, update: Partial<T>): Promise<number> {
    const docs = await this.find(query);
    let count = 0;

    for (const doc of docs) {
      const result = await this.findByIdAndUpdate(doc._id, update);
      if (result) count++;
    }

    return count;
  }

  /**
   * Delete a document by ID
   */
  async findByIdAndDelete(id: string): Promise<(ModelDocument & T) | null> {
    if (!this.collection) return null;

    try {
      const doc = await this.collection.get(id);
      if (!doc) return null;

      await this.collection.delete(id);
      return doc;
    } catch (error) {
      console.error(`Failed to delete document in ${this.collectionName}:`, error);
      return null;
    }
  }

  /**
   * Delete multiple documents matching a query
   */
  async deleteMany(query: Partial<T>): Promise<number> {
    const docs = await this.find(query);
    let count = 0;

    for (const doc of docs) {
      const result = await this.findByIdAndDelete(doc._id);
      if (result) count++;
    }

    return count;
  }

  /**
   * Count documents matching a query
  async create(data: Partial<T>): Promise<T> {
    const doc = this.validateAndTransform(data);
    doc._id = this.generateId();
    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    const docs = await this.getAll();
    docs.push(doc as T);
    await this.saveAll(docs);

    return doc as T;
  }

  /**
   * Find documents matching query
   */
  async find(query: Partial<T> = {}, options: QueryOptions = {}): Promise<T[]> {
    let docs = await this.getAll();

    // Filter by query
    docs = docs.filter(doc => this.matchesQuery(doc, query));

    // Sort
    if (options.sort) {
      docs = this.applySorting(docs, options.sort);
    }

    // Skip
    if (options.skip) {
      docs = docs.slice(options.skip);
    }

    // Limit
    if (options.limit) {
      docs = docs.slice(0, options.limit);
    }

    return docs;
  }

  /**
   * Find a single document
   */
  async findOne(query: Partial<T> = {}): Promise<T | null> {
    const docs = await this.find(query, { limit: 1 });
    return docs[0] || null;
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<T | null> {
    const docs = await this.getAll();
    return docs.find(doc => doc._id === id) || null;
  }

  /**
   * Update document(s)
   */
  async updateMany(query: Partial<T>, update: Partial<T>): Promise<{ matchedCount: number; modifiedCount: number }> {
    const docs = await this.getAll();
    let matchedCount = 0;
    let modifiedCount = 0;

    const updatedDocs = docs.map(doc => {
      if (this.matchesQuery(doc, query)) {
        matchedCount++;
        modifiedCount++;
        return {
          ...doc,
          ...update,
          updatedAt: new Date(),
        };
      }
      return doc;
    });

    await this.saveAll(updatedDocs);
    return { matchedCount, modifiedCount };
  }

  /**
   * Update a single document
   */
  async updateOne(query: Partial<T>, update: Partial<T>): Promise<{ matchedCount: number; modifiedCount: number }> {
    const docs = await this.getAll();
    let matchedCount = 0;
    let modifiedCount = 0;

    const updatedDocs = docs.map(doc => {
      if (matchedCount === 0 && this.matchesQuery(doc, query)) {
        matchedCount++;
        modifiedCount++;
        return {
          ...doc,
          ...update,
          updatedAt: new Date(),
        };
      }
      return doc;
    });

    await this.saveAll(updatedDocs);
    return { matchedCount, modifiedCount };
  }

  /**
   * Find by ID and update
   */
  async findByIdAndUpdate(id: string, update: Partial<T>, options: { new?: boolean } = {}): Promise<T | null> {
    const docs = await this.getAll();
    const index = docs.findIndex(doc => doc._id === id);

    if (index === -1) return null;

    const oldDoc = docs[index];
    const updatedDoc = {
      ...oldDoc,
      ...update,
      updatedAt: new Date(),
    };

    docs[index] = updatedDoc;
    await this.saveAll(docs);

    return options.new ? updatedDoc : oldDoc;
  }

  /**
   * Delete document(s)
   */
  async deleteMany(query: Partial<T> = {}): Promise<{ deletedCount: number }> {
    const docs = await this.getAll();
    const filteredDocs = docs.filter(doc => !this.matchesQuery(doc, query));
    const deletedCount = docs.length - filteredDocs.length;

    await this.saveAll(filteredDocs);
    return { deletedCount };
  }

  /**
   * Delete a single document
   */
  async deleteOne(query: Partial<T> = {}): Promise<{ deletedCount: number }> {
    const docs = await this.getAll();
    let deleted = false;

    const filteredDocs = docs.filter(doc => {
      if (!deleted && this.matchesQuery(doc, query)) {
        deleted = true;
        return false;
      }
      return true;
    });

    await this.saveAll(filteredDocs);
    return { deletedCount: deleted ? 1 : 0 };
  }

  /**
   * Find by ID and delete
   */
  async findByIdAndDelete(id: string): Promise<T | null> {
    const docs = await this.getAll();
    const index = docs.findIndex(doc => doc._id === id);

    if (index === -1) return null;

    const deletedDoc = docs[index];
    docs.splice(index, 1);
    await this.saveAll(docs);

    return deletedDoc;
  }

  /**
   * Count documents
   */
  async countDocuments(query: Partial<T> = {}): Promise<number> {
    const docs = await this.find(query);
    return docs.length;
  }

  /**
   * Clear all documents in the collection
   */
  async deleteAll(): Promise<void> {
    if (!this.collection) return;

    try {
      await this.collection.clear();
    } catch (error) {
      console.error(`Failed to clear collection ${this.collectionName}:`, error);
    }
   * Drop the entire collection
   */
  async drop(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  // Private helper methods

  private generateId(): string {
    // Use crypto.getRandomValues for secure ID generation
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${this.modelName}_${Date.now()}_${hex.substring(0, 16)}`;
  }

  private async getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`ClientModel: Failed to read ${this.modelName}`, error);
      return [];
    }
  }

  private async saveAll(docs: T[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(docs));
    } catch (error) {
      console.error(`ClientModel: Failed to save ${this.modelName}`, error);
      throw error;
    }
  }

  private validateAndTransform(data: Partial<T>): Partial<T> {
    const result: any = {};

    // Apply schema validation and defaults
    for (const [key, fieldSchema] of Object.entries(this.schema)) {
      const value = (data as any)[key];

      if (value === undefined && fieldSchema.default !== undefined) {
        result[key] = typeof fieldSchema.default === 'function' 
          ? fieldSchema.default() 
          : fieldSchema.default;
      } else if (value !== undefined) {
        result[key] = value;
      } else if (fieldSchema.required) {
        throw new Error(`Field '${key}' is required`);
      }
    }

    // Include any additional fields not in schema
    for (const [key, value] of Object.entries(data)) {
      if (!(key in result)) {
        result[key] = value;
      }
    }

    return result;
  }

  private matchesQuery(doc: T, query: Partial<T>): boolean {
    for (const [key, value] of Object.entries(query)) {
      if ((doc as any)[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private applySorting(docs: T[], sort: Record<string, 1 | -1>): T[] {
    const sortEntries = Object.entries(sort);
    
    return docs.sort((a, b) => {
      for (const [key, direction] of sortEntries) {
        const aVal = (a as any)[key];
        const bVal = (b as any)[key];

        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }
}

/**
 * Create a new model
 */
export function createModel<T extends ModelSchema>(
export function createModel<T extends Document = Document>(
  name: string,
  schema: ModelSchema
): ClientModel<T> {
  return new ClientModel<T>(name, schema);
}

// Example usage:
// const UserModel = createModel('users', {
//   username: String,
//   email: String,
//   role: String
// });
//
// const user = await UserModel.create({
//   username: 'john',
//   email: 'john@example.com',
//   role: 'admin'
// });
