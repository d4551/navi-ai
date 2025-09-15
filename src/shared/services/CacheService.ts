/**
 * UNIFIED CACHE SERVICE
 * ====================
 *
 * High-performance caching layer with multiple storage strategies
 * - Memory cache for frequently accessed data
 * - IndexedDB cache for persistent data
 * - LRU eviction for memory management
 * - TTL support for data expiration
 * - Cache warming and preloading
 */

import { logger } from '@/shared/utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxMemoryItems?: number; // Max items in memory cache
  persistent?: boolean; // Use IndexedDB for persistence
  tags?: string[]; // Cache tags for bulk invalidation
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  tags?: string[];
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  memoryHits: number;
  memoryMisses: number;
  persistentHits: number;
  persistentMisses: number;
  evictions: number;
  totalSize: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheItem>();
  private maxMemoryItems: number = 1000;
  private stats: CacheStats = {
    memoryHits: 0,
    memoryMisses: 0,
    persistentHits: 0,
    persistentMisses: 0,
    evictions: 0,
    totalSize: 0
  };

  // IndexedDB cache
  private dbName = 'NAVI_Cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
  }

  private async initIndexedDB(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      logger.warn('IndexedDB not available, using memory-only cache');
      return;
    }

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        logger.error('Failed to open cache database');
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('Cache database initialized');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create cache store
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
    } catch (error) {
      logger.error('IndexedDB initialization failed:', error);
    }
  }

  /**
   * Get item from cache with fallback to IndexedDB
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      if (this.isExpired(memoryItem)) {
        this.memoryCache.delete(key);
        this.stats.memoryMisses++;
      } else {
        memoryItem.accessCount++;
        memoryItem.lastAccessed = Date.now();
        this.stats.memoryHits++;
        return memoryItem.data;
      }
    } else {
      this.stats.memoryMisses++;
    }

    // Check IndexedDB cache
    if (this.db) {
      try {
        const persistentItem = await this.getFromIndexedDB(key);
        if (persistentItem && !this.isExpired(persistentItem)) {
          // Promote to memory cache
          this.setMemoryCache(key, persistentItem);
          this.stats.persistentHits++;
          return persistentItem.data;
        }
        this.stats.persistentMisses++;
      } catch (error) {
        logger.error('Failed to read from IndexedDB cache:', error);
      }
    }

    return null;
  }

  /**
   * Set item in cache
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl,
      tags: options.tags,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Set in memory cache
    this.setMemoryCache(key, item);

    // Set in IndexedDB if persistent
    if (options.persistent !== false && this.db) {
      try {
        await this.setIndexedDB(key, item);
      } catch (error) {
        logger.error('Failed to write to IndexedDB cache:', error);
      }
    }
  }

  /**
   * Remove item from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.delete(key);
      } catch (error) {
        logger.error('Failed to delete from IndexedDB cache:', error);
      }
    }
  }

  /**
   * Clear cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    // Clear memory cache by tags
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key);
      }
    }

    // Clear IndexedDB cache by tags
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const index = store.index('tags');

        for (const tag of tags) {
          const request = index.openCursor(IDBKeyRange.only(tag));
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              store.delete(cursor.primaryKey);
              cursor.continue();
            }
          };
        }
      } catch (error) {
        logger.error('Failed to invalidate IndexedDB cache by tags:', error);
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();

    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.clear();
      } catch (error) {
        logger.error('Failed to clear IndexedDB cache:', error);
      }
    }

    this.stats = {
      memoryHits: 0,
      memoryMisses: 0,
      persistentHits: 0,
      persistentMisses: 0,
      evictions: 0,
      totalSize: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      totalSize: this.memoryCache.size
    };
  }

  /**
   * Preload data into cache
   */
  async warmCache<T>(
    key: string,
    loader: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await loader();
    await this.set(key, data, options);
    return data;
  }

  private setMemoryCache<T>(key: string, item: CacheItem<T>): void {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.maxMemoryItems) {
      this.evictLRU();
    }

    this.memoryCache.set(key, item);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private isExpired(item: CacheItem): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  private async getFromIndexedDB(key: string): Promise<CacheItem | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result : null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  private async setIndexedDB(key: string, item: CacheItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, ...item });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<void> {
    const now = Date.now();

    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean IndexedDB cache
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const index = store.index('timestamp');

        const request = index.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const item = cursor.value;
            if (item.ttl && now - item.timestamp > item.ttl) {
              store.delete(cursor.primaryKey);
            }
            cursor.continue();
          }
        };
      } catch (error) {
        logger.error('Failed to cleanup IndexedDB cache:', error);
      }
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Auto cleanup every 5 minutes
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);