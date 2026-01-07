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
  }
}

/**
 * Create a new model
 */
export function createModel<T extends ModelSchema>(
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
