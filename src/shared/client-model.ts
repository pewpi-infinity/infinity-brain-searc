/**
 * ClientModel - Mongoose-like emulator for front-end operations
 * Provides familiar MongoDB-style API without requiring a backend
 */

import Dexie, { Table } from 'dexie';

export interface SchemaDefinition {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required?: boolean;
    default?: any;
    validate?: (value: any) => boolean;
  };
}

export interface ModelDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

// Database for ClientModel
class ClientModelDatabase extends Dexie {
  collections!: Table<ModelDocument, string>;

  constructor(collectionName: string) {
    super(`PewpiClientModel_${collectionName}`);
    this.version(1).stores({
      collections: '_id, createdAt, updatedAt'
    });
  }
}

export class ClientModel<T extends Record<string, any> = any> {
  private collectionName: string;
  private schema: SchemaDefinition;
  private db: ClientModelDatabase;
  private isInitialized = false;

  constructor(collectionName: string, schema: SchemaDefinition) {
    this.collectionName = collectionName;
    this.schema = schema;
    this.db = new ClientModelDatabase(collectionName);
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.db.open();
      this.isInitialized = true;
      console.log(`[ClientModel] ${this.collectionName} initialized`);
    } catch (error) {
      console.error(`[ClientModel] Failed to initialize ${this.collectionName}:`, error);
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  /**
   * Validate document against schema
   */
  private validate(doc: Partial<T>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, definition] of Object.entries(this.schema)) {
      const value = doc[field];

      // Check required fields
      if (definition.required && (value === undefined || value === null)) {
        errors.push(`Field '${field}' is required`);
        continue;
      }

      // Check type
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (definition.type === 'date' && !(value instanceof Date) && typeof value !== 'string') {
          errors.push(`Field '${field}' must be a Date or date string`);
        } else if (definition.type !== 'object' && definition.type !== 'array' && actualType !== definition.type) {
          errors.push(`Field '${field}' must be of type ${definition.type}`);
        }

        // Custom validation
        if (definition.validate && !definition.validate(value)) {
          errors.push(`Field '${field}' failed validation`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Apply default values to document
   */
  private applyDefaults(doc: Partial<T>): T {
    const result = { ...doc } as any;

    for (const [field, definition] of Object.entries(this.schema)) {
      if (result[field] === undefined && definition.default !== undefined) {
        result[field] = typeof definition.default === 'function' 
          ? definition.default() 
          : definition.default;
      }
    }

    return result;
  }

  /**
   * Create a new document
   */
  async create(doc: Partial<T>): Promise<ModelDocument & T> {
    await this.ensureInitialized();
    const withDefaults = this.applyDefaults(doc);
    const validation = this.validate(withDefaults);

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const document: ModelDocument & T = {
      ...withDefaults,
      _id: `${this.collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isInitialized) {
      await this.db.collections.add(document);
    } else {
      // localStorage fallback
      this.saveToLocalStorage(document);
    }

    console.log(`[ClientModel] Created document in ${this.collectionName}:`, document._id);
    return document;
  }

  /**
   * Find documents matching query
   */
  async find(query: Partial<T> = {}, options: QueryOptions = {}): Promise<(ModelDocument & T)[]> {
    await this.ensureInitialized();
    let results: (ModelDocument & T)[] = [];

    if (this.isInitialized) {
      results = await this.db.collections.toArray() as (ModelDocument & T)[];
    } else {
      results = this.getFromLocalStorage();
    }

    // Filter by query
    results = results.filter(doc => {
      return Object.entries(query).every(([key, value]) => {
        return doc[key] === value;
      });
    });

    // Apply sort
    if (options.sort) {
      const sortFields = Object.entries(options.sort);
      results.sort((a, b) => {
        for (const [field, order] of sortFields) {
          const aVal = a[field];
          const bVal = b[field];
          if (aVal < bVal) return order === 1 ? -1 : 1;
          if (aVal > bVal) return order === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply skip and limit
    if (options.skip) {
      results = results.slice(options.skip);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Find one document matching query
   */
  async findOne(query: Partial<T> = {}): Promise<(ModelDocument & T) | null> {
    const results = await this.find(query, { limit: 1 });
    return results[0] || null;
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<(ModelDocument & T) | null> {
    await this.ensureInitialized();
    if (this.isInitialized) {
      const doc = await this.db.collections.get(id);
      return (doc as (ModelDocument & T)) || null;
    } else {
      const all = this.getFromLocalStorage();
      return all.find(d => d._id === id) || null;
    }
  }

  /**
   * Update document by ID
   */
  async findByIdAndUpdate(
    id: string,
    update: Partial<T>,
    options: { new?: boolean } = {}
  ): Promise<(ModelDocument & T) | null> {
    await this.ensureInitialized();
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...update,
      _id: existing._id, // Preserve ID
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    const validation = this.validate(updated);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    if (this.isInitialized) {
      await this.db.collections.put(updated);
    } else {
      this.updateInLocalStorage(id, updated);
    }

    return options.new ? updated : existing;
  }

  /**
   * Delete document by ID
   */
  async findByIdAndDelete(id: string): Promise<(ModelDocument & T) | null> {
    await this.ensureInitialized();
    const existing = await this.findById(id);
    if (!existing) return null;

    if (this.isInitialized) {
      await this.db.collections.delete(id);
    } else {
      this.deleteFromLocalStorage(id);
    }

    return existing;
  }

  /**
   * Delete multiple documents matching query
   */
  async deleteMany(query: Partial<T> = {}): Promise<number> {
    const matches = await this.find(query);
    let deleted = 0;

    for (const doc of matches) {
      const result = await this.findByIdAndDelete(doc._id);
      if (result) deleted++;
    }

    return deleted;
  }

  /**
   * Count documents matching query
   */
  async countDocuments(query: Partial<T> = {}): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }

  /**
   * Clear all documents in collection
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    if (this.isInitialized) {
      await this.db.collections.clear();
    } else {
      localStorage.removeItem(`pewpi_model_${this.collectionName}`);
    }
    console.log(`[ClientModel] Cleared ${this.collectionName}`);
  }

  /**
   * LocalStorage fallback methods
   */
  private saveToLocalStorage(doc: ModelDocument & T): void {
    const all = this.getFromLocalStorage();
    all.push(doc);
    localStorage.setItem(`pewpi_model_${this.collectionName}`, JSON.stringify(all));
  }

  private getFromLocalStorage(): (ModelDocument & T)[] {
    const data = localStorage.getItem(`pewpi_model_${this.collectionName}`);
    return data ? JSON.parse(data) : [];
  }

  private updateInLocalStorage(id: string, doc: ModelDocument & T): void {
    const all = this.getFromLocalStorage();
    const index = all.findIndex(d => d._id === id);
    if (index !== -1) {
      all[index] = doc;
      localStorage.setItem(`pewpi_model_${this.collectionName}`, JSON.stringify(all));
    }
  }

  private deleteFromLocalStorage(id: string): void {
    const all = this.getFromLocalStorage();
    const filtered = all.filter(d => d._id !== id);
    localStorage.setItem(`pewpi_model_${this.collectionName}`, JSON.stringify(filtered));
  }

  /**
   * Export collection data
   */
  async export(): Promise<string> {
    await this.ensureInitialized();
    const data = await this.find();
    return JSON.stringify({
      collection: this.collectionName,
      count: data.length,
      data,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import collection data
   */
  async import(jsonData: string): Promise<number> {
    await this.ensureInitialized();
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.data || !Array.isArray(parsed.data)) {
        throw new Error('Invalid import data format');
      }

      let imported = 0;
      for (const doc of parsed.data) {
        try {
          await this.create(doc);
          imported++;
        } catch (error) {
          console.error(`[ClientModel] Failed to import document:`, error);
        }
      }

      console.log(`[ClientModel] Imported ${imported} documents to ${this.collectionName}`);
      return imported;
    } catch (error) {
      console.error(`[ClientModel] Import failed:`, error);
      throw error;
    }
  }
}

/**
 * Create a new model with schema
 */
export function createModel<T extends Record<string, any> = any>(
  collectionName: string,
  schema: SchemaDefinition
): ClientModel<T> {
  return new ClientModel<T>(collectionName, schema);
}
