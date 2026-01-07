/**
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
   * Drop the entire collection
   */
  async drop(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  // Private helper methods

  private generateId(): string {
    return `${this.modelName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
export function createModel<T extends Document = Document>(
  name: string,
  schema: ModelSchema
): ClientModel<T> {
  return new ClientModel<T>(name, schema);
}
