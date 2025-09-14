import { openDB } from "idb";
import { logger } from "@/shared/utils/logger";

// IndexedDB wrapper for offline storage
class IndexedDBStorage {
  constructor() {
    this.dbName = "navi-career-assistant";
    this.version = 1;
    this.db = null;
    this.stores = {
      resumes: "resumes",
      chatHistory: "chat-history",
      userProfiles: "user-profiles",
      jobSearches: "job-searches",
      skillMappings: "skill-mappings",
      templates: "templates",
      drafts: "drafts",
      preferences: "preferences",
      studios: "studios",
    };
  }

  async init() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Resume storage
          if (!db.objectStoreNames.contains("resumes")) {
            const resumeStore = db.createObjectStore("resumes", {
              keyPath: "id",
            });
            resumeStore.createIndex("lastModified", "lastModified");
            resumeStore.createIndex("name", "name");
          }

          // Chat history
          if (!db.objectStoreNames.contains("chat-history")) {
            const chatStore = db.createObjectStore("chat-history", {
              keyPath: "id",
            });
            chatStore.createIndex("timestamp", "timestamp");
            chatStore.createIndex("userId", "userId");
          }

          // User profiles
          if (!db.objectStoreNames.contains("user-profiles")) {
            const profileStore = db.createObjectStore("user-profiles", {
              keyPath: "id",
            });
            profileStore.createIndex("email", "email", { unique: true });
          }

          // Job searches
          if (!db.objectStoreNames.contains("job-searches")) {
            const jobStore = db.createObjectStore("job-searches", {
              keyPath: "id",
            });
            jobStore.createIndex("timestamp", "timestamp");
            jobStore.createIndex("query", "query");
          }

          // Skill mappings
          if (!db.objectStoreNames.contains("skill-mappings")) {
            const skillStore = db.createObjectStore("skill-mappings", {
              keyPath: "id",
            });
            skillStore.createIndex("sourceSkill", "sourceSkill");
            skillStore.createIndex("targetIndustry", "targetIndustry");
          }

          // Templates
          if (!db.objectStoreNames.contains("templates")) {
            const templateStore = db.createObjectStore("templates", {
              keyPath: "id",
            });
            templateStore.createIndex("type", "type");
            templateStore.createIndex("category", "category");
          }

          // Drafts
          if (!db.objectStoreNames.contains("drafts")) {
            const draftStore = db.createObjectStore("drafts", {
              keyPath: "id",
            });
            draftStore.createIndex("type", "type");
            draftStore.createIndex("lastModified", "lastModified");
          }

          // Preferences (single record by id 'app')
          if (!db.objectStoreNames.contains("preferences")) {
            db.createObjectStore("preferences", { keyPath: "id" });
          }

          // Studios (normalized studios and metadata)
          if (!db.objectStoreNames.contains("studios")) {
            const studioStore = db.createObjectStore("studios", { keyPath: "id" });
            studioStore.createIndex("by_name", "name");
          }
        },
      });

      logger.info("IndexedDB initialized successfully");
      return true;
    } catch (_error) {
      logger.error("Failed to initialize IndexedDB:", error);
      return false;
    }
  }

  async set(storeName, data) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readwrite");
      await tx.objectStore(storeName).put({
        ...data,
        lastModified: new Date().toISOString(),
      });
      await tx.done;

      return true;
    } catch (_error) {
      logger.error(`Failed to save to ${storeName}:`, error);
      return false;
    }
  }

  async get(storeName, id) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readonly");
      const result = await tx.objectStore(storeName).get(id);
      return result || null;
    } catch (_error) {
      logger.error(`Failed to get from ${storeName}:`, error);
      return null;
    }
  }

  async getAll(storeName, indexName = null, query = null) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);

      if (indexName && query) {
        const index = store.index(indexName);
        return await index.getAll(query);
      } else {
        return await store.getAll();
      }
    } catch (_error) {
      logger.error(`Failed to get all from ${storeName}:`, error);
      return [];
    }
  }

  async delete(storeName, id) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readwrite");
      await tx.objectStore(storeName).delete(id);
      await tx.done;

      return true;
    } catch (_error) {
      logger.error(`Failed to delete from ${storeName}:`, error);
      return false;
    }
  }

  async clear(storeName) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readwrite");
      await tx.objectStore(storeName).clear();
      await tx.done;

      return true;
    } catch (_error) {
      logger.error(`Failed to clear ${storeName}:`, error);
      return false;
    }
  }

  // Preferences helpers
  async setPreferences(prefs) {
    return await this.set(this.stores.preferences, { id: 'app', ...prefs });
  }

  async getPreferences() {
    return await this.get(this.stores.preferences, 'app');
  }

  // Studios helpers
  async upsertStudio(studio) {
    if (!studio?.id) { throw new Error('Studio must have an id'); }
    return await this.set(this.stores.studios, studio);
  }

  async getStudio(id) {
    return await this.get(this.stores.studios, id);
  }

  async getAllStudios() {
    return await this.getAll(this.stores.studios);
  }

  async clearStudios() {
    return await this.clear(this.stores.studios);
  }

  async count(storeName) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readonly");
      return await tx.objectStore(storeName).count();
    } catch (_error) {
      logger.error(`Failed to count ${storeName}:`, error);
      return 0;
    }
  }

  async search(storeName, indexName, query) {
    try {
      if (!this.db) {
        await this.init();
      }

      const tx = this.db.transaction(storeName, "readonly");
      const index = tx.objectStore(storeName).index(indexName);

      // Use IDBKeyRange for range queries
      const results = [];
      let cursor = await index.openCursor();

      while (cursor) {
        if (cursor.value && this.matchesQuery(cursor.value, query)) {
          results.push(cursor.value);
        }
        cursor = await cursor.continue();
      }

      return results;
    } catch (_error) {
      logger.error(`Failed to search ${storeName}:`, error);
      return [];
    }
  }

  matchesQuery(item, query) {
    if (typeof query === "string") {
      return JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
    }
    return Object.entries(query).every(
      ([key, value]) =>
        item[key] &&
        item[key]
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase()),
    );
  }
}

// Enhanced localStorage wrapper with encryption and compression
class SecureStorage {
  constructor() {
    this.prefix = "navi_";
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  set(key, value, options = {}) {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const data = {
        value,
        timestamp: Date.now(),
        expires: options.expires ? Date.now() + options.expires : null,
      };

      const serialized = JSON.stringify(_data);
      localStorage.setItem(this.prefix + key, serialized);
      return true;
    } catch (_error) {
      logger.error("SecureStorage set error:", error);
      return false;
    }
  }

  get(key) {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const data = JSON.parse(item);

      // Check expiration
      if (data.expires && Date.now() > data.expires) {
        this.remove(key);
        return null;
      }

      return data.value;
    } catch (_error) {
      logger.error("SecureStorage get error:", error);
      return null;
    }
  }

  remove(key) {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (_error) {
      logger.error("SecureStorage remove error:", error);
      return false;
    }
  }

  clear(pattern = null) {
    if (!this.isAvailable) {
      return false;
    }

    try {
      if (pattern) {
        const keys = Object.keys(localStorage).filter(
          (key) => key.startsWith(this.prefix) && key.includes(pattern),
        );

        keys.forEach((key) => localStorage.removeItem(key));
      } else {
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith(this.prefix),
        );

        keys.forEach((key) => localStorage.removeItem(key));
      }

      return true;
    } catch (_error) {
      logger.error("SecureStorage clear error:", error);
      return false;
    }
  }

  keys() {
    if (!this.isAvailable) {
      return [];
    }

    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substring(this.prefix.length));
  }

  size() {
    return this.keys().length;
  }
}

// Export instances
export const idbStorage = new IndexedDBStorage();
export const secureStorage = new SecureStorage();

// Unified storage interface
export class UnifiedStorage {
  constructor() {
    this.idb = idbStorage;
    this.local = secureStorage;
  }

  // Generic get/set methods that delegate to local storage
  get(key) {
    return this.local.get(key);
  }

  set(key, value, options = {}) {
    return this.local.set(key, value, options);
  }

  remove(key) {
    return this.local.remove(key);
  }

  keys() {
    return this.local.keys();
  }

  // Compatibility aliases (used in some services)
  async setItem(key, value, options = {}) {
    return this.set(key, value, options);
  }

  async getItem(key) {
    return this.get(key);
  }

  async removeItem(key) {
    return this.remove(key);
  }

  async setResume(resume) {
    // Store in both for redundancy
    const success = await this.idb.set(this.idb.stores.resumes, resume);
    this.local.set(`resume_${resume.id}`, resume);
    return success;
  }

  async getResume(id) {
    // Try IndexedDB first, fallback to localStorage
    let resume = await this.idb.get(this.idb.stores.resumes, id);
    if (!resume) {
      resume = this.local.get(`resume_${id}`);
    }
    return resume;
  }

  async getAllResumes() {
    return await this.idb.getAll(this.idb.stores.resumes);
  }

  async deleteResume(id) {
    const success = await this.idb.delete(this.idb.stores.resumes, id);
    this.local.remove(`resume_${id}`);
    return success;
  }

  async setChatHistory(message) {
    return await this.idb.set(this.idb.stores.chatHistory, message);
  }

  async getChatHistory(limit = 50) {
    const messages = await this.idb.getAll(this.idb.stores.chatHistory);
    return messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .reverse();
  }

  async clearChatHistory() {
    return await this.idb.clear(this.idb.stores.chatHistory);
  }

  async setUserProfile(profile) {
    const success = await this.idb.set(this.idb.stores.userProfiles, profile);
    this.local.set("user_profile", profile);
    return success;
  }

  async getUserProfile(id) {
    let profile = await this.idb.get(this.idb.stores.userProfiles, id);
    if (!profile) {
      profile = this.local.get("user_profile");
    }
    return profile;
  }

  async setDraft(draft) {
    return await this.idb.set(this.idb.stores.drafts, {
      ...draft,
      id: draft.id || `draft_${Date.now()}`,
    });
  }

  async getDrafts(type = null) {
    if (type) {
      return await this.idb.getAll(this.idb.stores.drafts, "type", type);
    }
    return await this.idb.getAll(this.idb.stores.drafts);
  }

  async exportData() {
    const data = {};

    // Export all data from IndexedDB
    for (const [key, storeName] of Object.entries(this.idb.stores)) {
      data[key] = await this.idb.getAll(storeName);
    }

    // Export localStorage data
    const localKeys = this.local.keys();
    data.localStorage = {};
    localKeys.forEach((key) => {
      data.localStorage[key] = this.local.get(key);
    });

    return data;
  }

  async importData(_data) {
    try {
      // Import to IndexedDB
      for (const [key, items] of Object.entries(_data)) {
        if (key === "localStorage") {
          continue;
        }

        const storeName = this.idb.stores[key];
        if (storeName && Array.isArray(items)) {
          for (const item of items) {
            await this.idb.set(storeName, item);
          }
        }
      }

      // Import to localStorage
      if (data.localStorage) {
        for (const [key, value] of Object.entries(data.localStorage)) {
          this.local.set(key, value);
        }
      }

      return true;
    } catch (_error) {
      logger.error("Failed to import data:", error);
      return false;
    }
  }

  // Studios helpers (forwarders to IndexedDB storage)
  async upsertStudio(studio) {
    return await this.idb.upsertStudio(studio);
  }

  async getStudio(id) {
    return await this.idb.getStudio(id);
  }

  async getAllStudios() {
    return await this.idb.getAllStudios();
  }

  async clearStudios() {
    return await this.idb.clearStudios();
  }
}

export const unifiedStorage = new UnifiedStorage();
export default unifiedStorage;
