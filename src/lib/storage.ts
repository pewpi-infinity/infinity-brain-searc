/**
 * Storage abstraction layer
 * Provides a consistent API for data persistence using localStorage
 * This replaces the Spark KV storage system
 */

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
}

class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return null
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to delete item from localStorage: ${key}`, error)
      throw error
    }
  }
}

// Export a singleton instance
export const storage = new LocalStorageAdapter()
