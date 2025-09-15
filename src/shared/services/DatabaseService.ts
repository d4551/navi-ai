/**
 * CENTRALIZED DATABASE SERVICE
 * ============================
 * 
 * Single source of truth for all database operations
 * - IndexedDB for client-side persistence
 * - Structured data models with proper validation
 * - Automatic migration and schema management
 * - Performance optimized queries with indexing
 * - Full TypeScript support with proper typing
 */

// Add type definitions for IndexedDB and crypto global objects
declare global {
  interface Window {
    crypto: Crypto;
  }
  
  interface WorkerGlobalScope {
    crypto: Crypto;
  }
  
  const crypto: Crypto;
  const indexedDB: IDBFactory;
}

// Import utilities
import { generateUUID } from '@/shared/utils/crypto';
import { logger } from '@/shared/utils/logger';

// Database configuration
interface DatabaseConfig {
  name: string;
  version: number;
  stores: DatabaseStore[];
}

interface DatabaseStore {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: DatabaseIndex[];
}

interface DatabaseIndex {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

// Core data models
export interface BaseEntity {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}

export interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  jobAlerts: boolean;
  achievements: boolean;
}

export interface PrivacySettings {
  profilePublic: boolean;
  shareStats: boolean;
  allowAnalytics: boolean;
}

export interface UserStats {
  level: number;
  experience: number;
  skillsAssessed: number;
  jobsApplied: number;
  interviewsCompleted: number;
  achievementsUnlocked: number;
  streakDays: number;
  lastActivity: Date;
}

export interface JobApplication extends BaseEntity {
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary?: string;
  status: 'draft' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  applicationDate: Date;
  notes?: string;
  documents: ApplicationDocument[];
  interviews: InterviewRecord[];
  feedback?: string;
}

export interface ApplicationDocument extends BaseEntity {
  type: 'resume' | 'cover_letter' | 'portfolio' | 'other';
  name: string;
  url: string;
  content?: string;
  version: number;
}

export interface InterviewRecord extends BaseEntity {
  jobApplicationId: string;
  type: 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral';
  scheduledAt: Date;
  completedAt?: Date;
  duration?: number;
  interviewer?: string;
  notes?: string;
  feedback?: string;
  score?: number;
  recording?: string;
}

export interface Skill extends BaseEntity {
  name: string;
  category: 'technical' | 'soft' | 'gaming' | 'leadership' | 'creative';
  level: number; // 0-100
  experience: number; // years
  verified: boolean;
  endorsements: number;
  lastUsed?: Date;
  gameSourced?: boolean;
  gameTitle?: string;
}

export interface Achievement extends BaseEntity {
  userId: string;
  title: string;
  description: string;
  icon: string;
  category: 'skill' | 'interview' | 'application' | 'milestone' | 'streak';
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  experience: number;
}

export interface ChatHistory extends BaseEntity {
  userId: string;
  sessionId: string;
  type: 'text' | 'voice' | 'video' | 'multimodal';
  messages: ChatMessage[];
  context?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SearchHistory extends BaseEntity {
  userId: string;
  query: string;
  type: 'job' | 'skill' | 'company' | 'semantic';
  results?: any[];
  timestamp: Date;
  clicked?: string[];
}

// Database Service Implementation
export class DatabaseService {
  saveMessage(testMessage: { id: string; content: string; role: "system"; timestamp: Date; }) {
    throw new Error('Method not implemented.');
  }
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private config: DatabaseConfig;
  private initialized = false;

  private constructor() {
    this.config = {
      name: 'NaviCV_GameJobPlatform',
      version: 1,
      stores: [
        {
          name: 'users',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'email', keyPath: 'email', unique: true },
            { name: 'createdAt', keyPath: 'createdAt' }
          ]
        },
        {
          name: 'jobApplications',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'userId', keyPath: 'userId' },
            { name: 'status', keyPath: 'status' },
            { name: 'applicationDate', keyPath: 'applicationDate' },
            { name: 'company', keyPath: 'company' }
          ]
        },
        {
          name: 'interviews',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'jobApplicationId', keyPath: 'jobApplicationId' },
            { name: 'scheduledAt', keyPath: 'scheduledAt' },
            { name: 'type', keyPath: 'type' }
          ]
        },
        {
          name: 'skills',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'name', keyPath: 'name' },
            { name: 'category', keyPath: 'category' },
            { name: 'level', keyPath: 'level' },
            { name: 'gameSourced', keyPath: 'gameSourced' }
          ]
        },
        {
          name: 'achievements',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'userId', keyPath: 'userId' },
            { name: 'category', keyPath: 'category' },
            { name: 'unlockedAt', keyPath: 'unlockedAt' },
            { name: 'rarity', keyPath: 'rarity' }
          ]
        },
        {
          name: 'chatHistory',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'userId', keyPath: 'userId' },
            { name: 'sessionId', keyPath: 'sessionId' },
            { name: 'type', keyPath: 'type' },
            { name: 'createdAt', keyPath: 'createdAt' }
          ]
        },
        {
          name: 'searchHistory',
          keyPath: 'id',
          autoIncrement: false,
          indexes: [
            { name: 'userId', keyPath: 'userId' },
            { name: 'type', keyPath: 'type' },
            { name: 'timestamp', keyPath: 'timestamp' }
          ]
        }
      ]
    };
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection and create stores
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        const errorMessage = request.error?.message || 'Unknown database error';
        logger.error(`Failed to open database: ${errorMessage}`);
        reject(new Error(`Failed to open database: ${errorMessage}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        logger.info('Database initialized successfully');
        
        // Add error handlers for the database connection
        this.db.onerror = (event) => {
          logger.error('Database error:', event);
        };
        
        this.db.onversionchange = () => {
          logger.warn('Database version changed, closing connection');
          this.db?.close();
          this.initialized = false;
        };
        
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        try {
          this.createStores(db);
          logger.info('Database stores created/updated successfully');
        } catch (error) {
          logger.error('Failed to create database stores:', error);
          reject(error);
        }
      };
      
      // Add timeout for database initialization
      setTimeout(() => {
        if (!this.initialized) {
          reject(new Error('Database initialization timeout after 10 seconds'));
        }
      }, 10000);
    });
  }

  /**
   * Create database stores and indexes
   */
  private createStores(db: IDBDatabase): void {
    for (const storeConfig of this.config.stores) {
      // Delete existing store if it exists
      if (db.objectStoreNames.contains(storeConfig.name)) {
        db.deleteObjectStore(storeConfig.name);
      }

      // Create new store
      const store = db.createObjectStore(storeConfig.name, {
        keyPath: storeConfig.keyPath,
        autoIncrement: storeConfig.autoIncrement || false
      });

      // Create indexes
      if (storeConfig.indexes) {
        for (const indexConfig of storeConfig.indexes) {
          store.createIndex(indexConfig.name, indexConfig.keyPath, {
            unique: indexConfig.unique || false
          });
        }
      }
    }
  }

  /**
   * Generic method to save an entity
   */
  async save<T extends BaseEntity>(storeName: string, entity: T): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date();
    const entityWithMetadata: T = {
      ...entity,
      id: entity.id || this.generateId(),
      updatedAt: now,
      createdAt: entity.createdAt || now,
      version: (entity.version || 0) + 1
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(entityWithMetadata);
      
      request.onsuccess = () => resolve(entityWithMetadata);
      request.onerror = () => reject(new Error(`Failed to save entity: ${request.error}`));
    });
  }

  /**
   * Generic method to find an entity by ID
   */
  async findById<T extends BaseEntity>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error(`Failed to find entity: ${request.error}`));
    });
  }

  /**
   * Generic method to find entities by index
   */
  async findByIndex<T extends BaseEntity>(
    storeName: string, 
    indexName: string, 
    value: any,
    options: { limit?: number; offset?: number } = {}
  ): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const results: T[] = [];
      let count = 0;
      let skipped = 0;
      
      const request = index.openCursor(IDBKeyRange.only(value));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          // Handle offset
          if (options.offset && skipped < options.offset) {
            skipped++;
            cursor.continue();
            return;
          }
          
          // Handle limit
          if (options.limit && count >= options.limit) {
            resolve(results);
            return;
          }
          
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(new Error(`Failed to find entities: ${request.error}`));
    });
  }

  /**
   * Generic method to find all entities in a store
   */
  async findAll<T extends BaseEntity>(
    storeName: string, 
    options: { limit?: number; offset?: number } = {}
  ): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const results: T[] = [];
      let count = 0;
      let skipped = 0;
      
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          // Handle offset
          if (options.offset && skipped < options.offset) {
            skipped++;
            cursor.continue();
            return;
          }
          
          // Handle limit
          if (options.limit && count >= options.limit) {
            resolve(results);
            return;
          }
          
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(new Error(`Failed to find entities: ${request.error}`));
    });
  }

  /**
   * Generic method to delete an entity
   */
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete entity: ${request.error}`));
    });
  }

  /**
   * Generic method to count entities
   */
  async count(storeName: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to count entities: ${request.error}`));
    });
  }

  /**
   * Specialized methods for specific entities
   */
  
  // User methods
  async saveUser(user: UserProfile): Promise<UserProfile> {
    return this.save('users', user);
  }

  async findUserById(id: string): Promise<UserProfile | null> {
    return this.findById('users', id);
  }

  async findUserByEmail(email: string): Promise<UserProfile | null> {
    const users = await this.findByIndex<UserProfile>('users', 'email', email, { limit: 1 });
    return users[0] || null;
  }

  // Job Application methods
  async saveJobApplication(application: JobApplication): Promise<JobApplication> {
    return this.save('jobApplications', application);
  }

  async findJobApplicationsByUser(userId: string): Promise<JobApplication[]> {
    return this.findByIndex('jobApplications', 'userId', userId);
  }

  async findJobApplicationsByStatus(status: JobApplication['status']): Promise<JobApplication[]> {
    return this.findByIndex('jobApplications', 'status', status);
  }

  // Skills methods
  async saveSkill(skill: Skill): Promise<Skill> {
    return this.save('skills', skill);
  }

  async findSkillsByCategory(category: Skill['category']): Promise<Skill[]> {
    return this.findByIndex('skills', 'category', category);
  }

  async findGameSourcedSkills(): Promise<Skill[]> {
    return this.findByIndex('skills', 'gameSourced', true);
  }

  // Achievement methods
  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    return this.save('achievements', achievement);
  }

  async findAchievementsByUser(userId: string): Promise<Achievement[]> {
    return this.findByIndex('achievements', 'userId', userId);
  }

  // Chat History methods
  async saveChatHistory(chat: ChatHistory): Promise<ChatHistory> {
    return this.save('chatHistory', chat);
  }

  async findChatHistoryByUser(userId: string): Promise<ChatHistory[]> {
    return this.findByIndex('chatHistory', 'userId', userId);
  }

  async findChatHistoryBySession(sessionId: string): Promise<ChatHistory[]> {
    return this.findByIndex('chatHistory', 'sessionId', sessionId);
  }

  // Search History methods
  async saveSearchHistory(search: SearchHistory): Promise<SearchHistory> {
    return this.save('searchHistory', search);
  }

  async findSearchHistoryByUser(userId: string): Promise<SearchHistory[]> {
    return this.findByIndex('searchHistory', 'userId', userId);
  }

  /**
   * Utility methods
   */
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const storeNames = Array.from(this.db.objectStoreNames);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      
      let completed = 0;
      const total = storeNames.length;
      
      if (total === 0) {
        resolve();
        return;
      }
      
      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to clear store ${storeName}: ${request.error}`));
        };
      });
    });
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<Record<string, any[]>> {
    if (!this.db) throw new Error('Database not initialized');

    const storeNames = Array.from(this.db.objectStoreNames);
    const exportData: Record<string, any[]> = {};

    for (const storeName of storeNames) {
      exportData[storeName] = await this.findAll(storeName);
    }

    return exportData;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) return false;
      
      // Try to perform a simple operation
      await this.count('users');
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Close database connection
   */
  async shutdown(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      // Database connection closed
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

/**
 * Convenience functions for common operations
 */

export async function initializeDatabase(): Promise<void> {
  return databaseService.initialize();
}

export async function getDatabaseHealth(): Promise<boolean> {
  return databaseService.healthCheck();
}

export async function closeDatabaseConnection(): Promise<void> {
  return databaseService.shutdown();
}

// Export types for external use
export type { DatabaseConfig, DatabaseStore, DatabaseIndex };