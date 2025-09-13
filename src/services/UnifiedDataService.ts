/// <reference types="vite/client" />
import { logger } from "@/shared/utils/logger";


export type StorageType = "localStorage" | "indexedDB" | "sessionStorage";

export interface DataServiceConfig {
  defaultStorage: StorageType;
  encryptSensitiveData: boolean;
  compressionThreshold: number; // bytes
  maxRetries: number;
  retryDelay: number; // ms
}

export interface StorageOptions {
  storageType?: StorageType;
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // time to live in ms
  version?: number;
}

export interface StoredData<T = any> {
  data: T;
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
    encrypted: boolean;
    compressed: boolean;
    ttl?: number;
    checksum?: string;
  };
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: (_item: any) => boolean;
}

export interface DataStats {
  storageType: StorageType;
  totalKeys: number;
  totalSize: number;
  oldestEntry: number;
  newestEntry: number;
  expiredEntries: number;
  encryptedEntries: number;
  compressedEntries: number;
}

export class UnifiedDataService {
  private static instance: UnifiedDataService;
  private config: DataServiceConfig;
  private indexedDBCache = new Map<string, IDBDatabase>();
  private encryptionKey?: any;

  // Storage namespaces for different data types
  public readonly NAMESPACES = {
    user: "gd_user_",
    jobs: "gd_jobs_",
    applications: "gd_apps_",
    interviews: "gd_interviews_",
    portfolio: "gd_portfolio_",
    resume: "gd_resume_",
    ai: "gd_ai_",
    settings: "gd_settings_",
    cache: "gd_cache_",
    analytics: "gd_analytics_",
  };

  static getInstance(config?: Partial<DataServiceConfig>): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService(config);
    }
    return UnifiedDataService.instance;
  }

  private constructor(config?: Partial<DataServiceConfig>) {
    this.config = {
      defaultStorage: "indexedDB",
      encryptSensitiveData: true,
      ...config,
    };

    this.initializeEncryption();
    this.setupCompressionWorker();
    this.scheduleCleanup();
  }

  // === CORE CRUD OPERATIONS ===

  async set<T>(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
    value: T,
    options: StorageOptions = {},
  ): Promise<void> {
    const fullKey = this.NAMESPACES[namespace] + key;
    const storageType = options.storageType || this.config.defaultStorage;
    const shouldEncrypt =
      options.encrypt ??
      (this.config.encryptSensitiveData &&
        this.isSensitiveNamespace(namespace));
    const shouldCompress = options.compress ?? this.shouldCompress(value);

    const existing = await this.getStoredData<any>(
      namespace,
      key,
      { storageType },
      false,
    );

    const storedData: StoredData<T> = {
      data: value,
      metadata: {
        createdAt: existing?.metadata.createdAt || Date.now(),
        updatedAt: Date.now(),
        version:
        encrypted: shouldEncrypt,
        compressed: shouldCompress,
        ttl: options.ttl,
      },
    };

    // Process data
    let processedData: string = JSON.stringify(storedData);

    if (shouldCompress) {
      processedData = await this.compress(processedData);
    }

    if (shouldEncrypt) {
      processedData = await this.encrypt(processedData);
      storedData.metadata.checksum = await this.generateChecksum(
        JSON.stringify(value),
      );
    }

    // Store based on storage type
    switch (storageType) {
      case "localStorage":
        await this.setLocalStorage(fullKey, processedData);
        break;
      case "sessionStorage":
        await this.setSessionStorage(fullKey, processedData);
        break;
      case "indexedDB":
        await this.setIndexedDB(
          namespace,
          key,
          processedData,
          storedData.metadata,
        );
        break;
    }
  }

  async get<T>(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
    options: StorageOptions = {},
  ): Promise<T | null> {
    const fullKey = this.NAMESPACES[namespace] + key;
    const storedData = await this.getStoredData<T>(namespace, key, options);
    if (!storedData) return null;

    if (storedData.metadata.ttl) {
      const expirationTime =
        storedData.metadata.createdAt + storedData.metadata.ttl;
      if (Date.now() > expirationTime) {
        await this.delete(namespace, key, options);
        return null;
      }
    }

    if (storedData.metadata.checksum) {
      const currentChecksum = await this.generateChecksum(
        JSON.stringify(storedData.data),
      );
      if (currentChecksum !== storedData.metadata.checksum) {
        logger.warn(
          `Data integrity check failed for ${fullKey}`,
          undefined,
          "UnifiedDataService",
        );
      }
    }

    return storedData.data;
  }

  async delete(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
    options: StorageOptions = {},
  ): Promise<void> {
    const fullKey = this.NAMESPACES[namespace] + key;
    const storageType = options.storageType || this.config.defaultStorage;

    switch (storageType) {
      case "localStorage":
        localStorage.removeItem(fullKey);
        break;
      case "sessionStorage": {
        const s = (typeof globalThis !== "undefined" &&
          (globalThis as any).sessionStorage) as any;
        if (s) s.removeItem(fullKey);
        break;
      }
      case "indexedDB":
        await this.deleteIndexedDB(namespace, key);
        break;
    }
  }

  async exists(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
    options: StorageOptions = {},
  ): Promise<boolean> {
    const data = await this.get(namespace, key, options);
    return data !== null;
  }

  // === BULK OPERATIONS ===

  async setMultiple<T>(
    namespace: keyof typeof this.NAMESPACES,
    entries: Array<{ key: string; value: T; options?: StorageOptions }>,
    globalOptions: StorageOptions = {},
  ): Promise<void> {
    const promises = entries.map((entry) =>
      this.set(namespace, entry.key, entry.value, {
        ...globalOptions,
        ...entry.options,
      }),
    );
    await Promise.all(promises);
  }

  async getMultiple<T>(
    namespace: keyof typeof this.NAMESPACES,
    keys: string[],
    options: StorageOptions = {},
  ): Promise<Array<{ key: string; value: T | null }>> {
    const promises = keys.map(async (key) => ({
      key,
      value: await this.get<T>(namespace, key, options),
    }));
    return Promise.all(promises);
  }

  async query<T>(
    namespace: keyof typeof this.NAMESPACES,
    queryOptions: QueryOptions & StorageOptions = {},
  ): Promise<Array<{ key: string; value: T }>> {
    const storageType = queryOptions.storageType || this.config.defaultStorage;
    const prefix = this.NAMESPACES[namespace];

    let allKeys: string[] = [];

    switch (storageType) {
      case "localStorage": {
        const l = (typeof globalThis !== "undefined" &&
          (globalThis as any).localStorage) as any;
        allKeys = l
          ? Object.keys(l).filter((key: string) => key.startsWith(prefix))
          : [];
        break;
      }
      case "sessionStorage": {
        const s = (typeof globalThis !== "undefined" &&
          (globalThis as any).sessionStorage) as any;
        allKeys = s
          ? Object.keys(s).filter((key: string) => key.startsWith(prefix))
          : [];
        break;
      }
      case "indexedDB":
        allKeys = await this.getAllKeysIndexedDB(namespace);
        break;
    }

    // Get all values
    type Entry<V> = { key: string; value: V };
    const results = await Promise.all(
      allKeys.map(async (fullKey) => {
        const key = fullKey.replace(prefix, "");
        const value = await this.get<T>(namespace, key, queryOptions);
        return value !== null ? ({ key, value } as Entry<T>) : null;
      }),
    );

    let filteredResults: Entry<T>[] = results.filter(
      (result): result is Entry<T> => result !== null,
    );

    // Apply filter
    if (queryOptions.filter) {
      filteredResults = filteredResults.filter((item) =>
        queryOptions.filter!(item.value),
      );
    }

    // Apply sorting
    if (queryOptions.sortBy) {
      filteredResults.sort((a, b) => {
        const aVal = this.getNestedProperty(a.value, queryOptions.sortBy!);
        const bVal = this.getNestedProperty(b.value, queryOptions.sortBy!);

      });
    }

    // Apply pagination
    if (queryOptions.offset || queryOptions.limit) {
      const end = queryOptions.limit ? start + queryOptions.limit : undefined;
      filteredResults = filteredResults.slice(start, end);
    }

    return filteredResults;
  }

  async clear(
    namespace: keyof typeof this.NAMESPACES,
    options: StorageOptions = {},
  ): Promise<void> {
    const storageType = options.storageType || this.config.defaultStorage;
    const prefix = this.NAMESPACES[namespace];

    switch (storageType) {
      case "localStorage": {
        const l = (typeof globalThis !== "undefined" &&
          (globalThis as any).localStorage) as any;
        if (l) {
          const localKeys = Object.keys(l).filter((key: string) =>
            key.startsWith(prefix),
          );
          localKeys.forEach((key: string) => l.removeItem(key));
        }
        break;
      }
      case "sessionStorage": {
        const s = (typeof globalThis !== "undefined" &&
          (globalThis as any).sessionStorage) as any;
        if (s) {
          const sessionKeys: string[] = [];
            const k = s.key(i);
            if (k && k.startsWith(prefix)) sessionKeys.push(k);
          }
          sessionKeys.forEach((key) => s.removeItem(key));
        }
        break;
      }
      case "indexedDB": {
        await this.clearIndexedDB(namespace);
        break;
      }
    }
  }

  // === UTILITY METHODS ===

  async getStorageStats(
    namespace?: keyof typeof this.NAMESPACES,
  ): Promise<DataStats[]> {
    const stats: DataStats[] = [];
    const namespacesToCheck = namespace
      ? [namespace]
      : (Object.keys(this.NAMESPACES) as (keyof typeof this.NAMESPACES)[]);

    for (const ns of namespacesToCheck) {
      for (const storageType of [
        "localStorage",
        "sessionStorage",
        "indexedDB",
      ] as StorageType[]) {
        const nsStats = await this.getNamespaceStats(ns, storageType);
          stats.push(nsStats);
        }
      }
    }

    return stats;
  }

  async cleanupExpired(): Promise<number> {

    for (const namespace of Object.keys(
      this.NAMESPACES,
    ) as (keyof typeof this.NAMESPACES)[]) {
      for (const storageType of [
        "localStorage",
        "sessionStorage",
        "indexedDB",
      ] as StorageType[]) {
        const items = await this.query(namespace, { storageType });

        for (const item of items) {
          const data = await this.get(namespace, item.key, { storageType });
          if (!data) {
            cleanedCount++;
          }
        }
      }
    }

    return cleanedCount;
  }

  private async getStoredData<T>(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
    options: StorageOptions = {},
    migrate = true,
  ): Promise<StoredData<T> | null> {
    const fullKey = this.NAMESPACES[namespace] + key;
    const storageType = options.storageType || this.config.defaultStorage;

    let rawData: string | null = null;
    let separateMetadata: any = null;

    switch (storageType) {
      case "localStorage":
        rawData = await this.getLocalStorage(fullKey);
        break;
      case "sessionStorage":
        rawData = await this.getSessionStorage(fullKey);
        break;
      case "indexedDB": {
        const entry = await this.getIndexedDBEntry(namespace, key);
        if (entry) {
          rawData = entry.data;
          separateMetadata = entry.metadata;
        }
        break;
      }
    }

    if (!rawData) return null;

    try {
      let storedData: StoredData<T>;

      if (separateMetadata) {
        let processedData = rawData;
        if (separateMetadata.encrypted) {
          processedData = await this.decrypt(processedData);
        }
        if (separateMetadata.compressed) {
          processedData = await this.decompress(processedData);
        }
        storedData = JSON.parse(processedData);
        storedData.metadata = { ...separateMetadata };
      } else if (rawData.startsWith("{") && !rawData.includes('"metadata"')) {
        storedData = {
          data: JSON.parse(rawData),
          metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            encrypted: false,
            compressed: false,
          },
        };
        if (migrate) {
          const processedData = JSON.stringify(storedData);
          switch (storageType) {
            case "localStorage":
              await this.setLocalStorage(fullKey, processedData);
              break;
            case "sessionStorage":
              await this.setSessionStorage(fullKey, processedData);
              break;
            case "indexedDB":
              await this.setIndexedDB(
                namespace,
                key,
                processedData,
                storedData.metadata,
              );
              break;
          }
        }
      } else {
        let processedData = rawData;
        if (this.isEncrypted(rawData)) {
          processedData = await this.decrypt(rawData);
        }
        if (this.isCompressed(processedData)) {
          processedData = await this.decompress(processedData);
        }
        storedData = JSON.parse(processedData);
      }

      return storedData;
    } catch (error) {
      logger.error(
        `Failed to parse stored data for ${fullKey}:`,
        error,
        "UnifiedDataService",
      );
      return null;
    }
  }

  async migrate(
    fromStorage: StorageType,
    toStorage: StorageType,
    namespace?: keyof typeof this.NAMESPACES,
  ): Promise<void> {
    const namespacesToMigrate = namespace
      ? [namespace]
      : (Object.keys(this.NAMESPACES) as (keyof typeof this.NAMESPACES)[]);

    for (const ns of namespacesToMigrate) {
      const items = await this.query(ns, { storageType: fromStorage });

      for (const item of items) {
        await this.set(ns, item.key, item.value, { storageType: toStorage });
        await this.delete(ns, item.key, { storageType: fromStorage });
      }
    }
  }

  async backup(namespace?: keyof typeof this.NAMESPACES): Promise<string> {
    const namespacesToBackup = namespace
      ? [namespace]
      : (Object.keys(this.NAMESPACES) as (keyof typeof this.NAMESPACES)[]);
    const backup: Record<string, any> = {};

    for (const ns of namespacesToBackup) {
      const items = await this.query(ns);
      backup[ns] = Object.fromEntries(
        items.map((item) => [item.key, item.value]),
      );
    }

    return JSON.stringify({
      timestamp: Date.now(),
      data: backup,
    });
  }

  async restore(backupData: string): Promise<void> {
    const backup = JSON.parse(backupData);

    if (!backup.version || !backup.data) {
      throw new Error("Invalid backup format");
    }

    for (const [namespace, items] of Object.entries(backup.data)) {
      if (!this.NAMESPACES[namespace as keyof typeof this.NAMESPACES]) {
        logger.warn(
          `Unknown namespace in backup: ${namespace}`,
          undefined,
          "UnifiedDataService",
        );
        continue;
      }

      for (const [key, value] of Object.entries(items as Record<string, any>)) {
        await this.set(namespace as keyof typeof this.NAMESPACES, key, value);
      }
    }
  }

  // === PRIVATE METHODS ===

  private async initializeEncryption(): Promise<void> {
    if (this.config.encryptSensitiveData && "crypto" in window) {
      try {
        this.encryptionKey = await crypto.subtle.generateKey(
          true,
          ["encrypt", "decrypt"],
        );
      } catch (error) {
        logger.warn(
          "Failed to initialize encryption:",
          error,
          "UnifiedDataService",
        );
        this.config.encryptSensitiveData = false;
      }
    }
  }

  private setupCompressionWorker(): void {
    try {
      this.compressionEnabled = typeof CompressionStream !== "undefined";

      if (!this.compressionEnabled) {
        // Fallback to manual compression using LZ-string style algorithm
        this.compressionEnabled = true;
        console.log("Using fallback compression algorithm");
      }
    } catch (error) {
      console.warn(
        "Compression setup failed, data will be stored uncompressed:",
        error,
      );
      this.compressionEnabled = false;
    }
  }

  private compressionEnabled: boolean = false;

  private async compressData(data: string): Promise<string> {
    if (!this.compressionEnabled) return data;

    try {
      // Use modern browser compression if available
      if (typeof CompressionStream !== "undefined") {
        const stream = new (globalThis as any).CompressionStream("gzip");
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(new (globalThis as any).TextEncoder().encode(data));
        writer.close();

        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) chunks.push(value);
        }

        );
        chunks.forEach((chunk) => {
          compressed.set(chunk, offset);
          offset += chunk.length;
        });

        return btoa(String.fromCharCode(...compressed));
      } else {
        // Fallback simple compression
        return this.simpleCompress(data);
      }
    } catch (error) {
      console.warn("Compression failed, storing uncompressed:", error);
      return data;
    }
  }

  private async decompressData(compressedData: string): Promise<string> {
    if (!this.compressionEnabled) return compressedData;

    try {
      if (typeof DecompressionStream !== "undefined") {
        );
        const stream = new (globalThis as any).DecompressionStream("gzip");
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(compressed);
        writer.close();

        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) chunks.push(value);
        }

        );
        chunks.forEach((chunk) => {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        });

        return new TextDecoder().decode(decompressed);
      } else {
        return this.simpleDecompress(compressedData);
      }
    } catch (error) {
      console.warn("Decompression failed, returning as-is:", error);
      return compressedData;
    }
  }

  private simpleCompress(data: string): string {
    // Simple dictionary-based compression
    const dict: Record<string, string> = {};
    let compressed = "";

      dict[String.fromCharCode(i)] = String.fromCharCode(i);
    }

    let w = "";
    for (const c of data) {
      const wc = w + c;
      if (dict[wc]) {
        w = wc;
      } else {
        compressed += dict[w];
        dict[wc] = String.fromCharCode(dictSize++);
        w = c;
      }
    }

    if (w) compressed += dict[w];
    return btoa(compressed);
  }

  private simpleDecompress(compressed: string): string {
    try {
      return atob(compressed);
    } catch {
      return compressed;
    }
  }

  private scheduleCleanup(): void {
    // Run cleanup every hour
    setInterval(
      () => {
        this.cleanupExpired().catch((error) =>
          logger.error("Cleanup failed:", error, "UnifiedDataService"),
        );
      },
    );
  }

  private isSensitiveNamespace(
    namespace: keyof typeof this.NAMESPACES,
  ): boolean {
    return ["user", "applications", "ai", "settings"].includes(namespace);
  }

  private shouldCompress(value: any): boolean {
    const size = JSON.stringify(value).length;
    return size > this.config.compressionThreshold;
  }

  private async compress(data: string): Promise<string> {
    // Simple compression using browser's built-in compression
    if ("CompressionStream" in window) {
      const stream = new (globalThis as any).CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new (globalThis as any).TextEncoder().encode(data));
      writer.close();

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) chunks.push(value);
        done = readerDone;
      }

      );
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      return "compressed:" + btoa(String.fromCharCode(...compressed));
    }

    return data; // Fallback: no compression
  }

  private async decompress(data: string): Promise<string> {
    if (!data.startsWith("compressed:")) return data;


    if ("DecompressionStream" in window) {
      );
      const stream = new (globalThis as any).DecompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(compressed);
      writer.close();

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) chunks.push(value);
        done = readerDone;
      }

      );
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }

      return new TextDecoder().decode(decompressed);
    }

    return compressedData; // Fallback: return as-is
  }

  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) return data;

    const encodedData = new (globalThis as any).TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      this.encryptionKey,
      encodedData,
    );

    combined.set(iv);

    return "encrypted:" + btoa(String.fromCharCode(...combined));
  }

  private async decrypt(data: string): Promise<string> {
    if (!data.startsWith("encrypted:") || !this.encryptionKey) return data;

    );


    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      this.encryptionKey,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  }

  private async generateChecksum(data: string): Promise<string> {
    const encoder = new (globalThis as any).TextEncoder();
  }

  private isEncrypted(data: string): boolean {
    return data.startsWith("encrypted:");
  }

  private isCompressed(data: string): boolean {
    return data.startsWith("compressed:");
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // Storage-specific implementations
  private async setLocalStorage(key: string, value: string): Promise<void> {
    const l = (typeof globalThis !== "undefined" &&
      (globalThis as any).localStorage) as any;
    if (!l) return;
    try {
      l.setItem(key, value);
    } catch (error) {
      if (
        (error as any) instanceof (globalThis as any).DOMException &&
        (error as any).code === (globalThis as any).DOMException.QUOTA_EXCEEDED_ERR
      ) {
        // Try to free up space
        await this.cleanupExpired();
        l.setItem(key, value);
      } else {
        throw error;
      }
    }
  }

  private async getLocalStorage(key: string): Promise<string | null> {
    const l = (typeof globalThis !== "undefined" &&
      (globalThis as any).localStorage) as any;
    return l ? l.getItem(key) : null;
  }

  private async setSessionStorage(key: string, value: string): Promise<void> {
    const s = (typeof globalThis !== "undefined" &&
      (globalThis as any).sessionStorage) as any;
    if (s) s.setItem(key, value);
  }

  private async getSessionStorage(key: string): Promise<string | null> {
    const s = (typeof globalThis !== "undefined" &&
      (globalThis as any).sessionStorage) as any;
    return s ? s.getItem(key) : null;
  }

  private async setIndexedDB(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
    value: string,
    metadata: any,
  ): Promise<void> {
    const db = await this.getIndexedDBDatabase(namespace);
    const transaction = db.transaction([namespace], "readwrite");
    const store = transaction.objectStore(namespace);

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: key, data: value, metadata });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getIndexedDBEntry(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
  ): Promise<{ data: string; metadata: any } | null> {
    const db = await this.getIndexedDBDatabase(namespace);
    const transaction = db.transaction([namespace], "readonly");
    const store = transaction.objectStore(namespace);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(
          result ? { data: result.data, metadata: result.metadata } : null,
        );
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async getIndexedDB(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
  ): Promise<string | null> {
    const entry = await this.getIndexedDBEntry(namespace, key);
    return entry ? entry.data : null;
  }

  private async deleteIndexedDB(
    namespace: keyof typeof this.NAMESPACES,
    key: string,
  ): Promise<void> {
    const db = await this.getIndexedDBDatabase(namespace);
    const transaction = db.transaction([namespace], "readwrite");
    const store = transaction.objectStore(namespace);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllKeysIndexedDB(
    namespace: keyof typeof this.NAMESPACES,
  ): Promise<string[]> {
    const db = await this.getIndexedDBDatabase(namespace);
    const transaction = db.transaction([namespace], "readonly");
    const store = transaction.objectStore(namespace);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(
    namespace: keyof typeof this.NAMESPACES,
  ): Promise<void> {
    const db = await this.getIndexedDBDatabase(namespace);
    const transaction = db.transaction([namespace], "readwrite");
    const store = transaction.objectStore(namespace);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getIndexedDBDatabase(
    namespace: keyof typeof this.NAMESPACES,
  ): Promise<IDBDatabase> {
    const dbName = `GameDev_${namespace}`;

    if (this.indexedDBCache.has(dbName)) {
      return this.indexedDBCache.get(dbName)!;
    }

    return new Promise((resolve, reject) => {

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        this.indexedDBCache.set(dbName, db);
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(namespace)) {
          db.createObjectStore(namespace, { keyPath: "id" });
        }
      };
    });
  }

  private async getNamespaceStats(
    namespace: keyof typeof this.NAMESPACES,
    storageType: StorageType,
  ): Promise<DataStats> {
    const prefix = this.NAMESPACES[namespace];
    let allKeys: string[] = [];

    switch (storageType) {
      case "localStorage": {
        const l = (typeof globalThis !== "undefined" &&
          (globalThis as any).localStorage) as any;
        allKeys = l
          ? Object.keys(l)
              .filter((key: string) => key.startsWith(prefix))
              .map((k: string) => k.replace(prefix, ""))
          : [];
        break;
      }
      case "sessionStorage": {
        const s = (typeof globalThis !== "undefined" &&
          (globalThis as any).sessionStorage) as any;
        allKeys = s
          ? Object.keys(s)
              .filter((key: string) => key.startsWith(prefix))
              .map((k: string) => k.replace(prefix, ""))
          : [];
        break;
      }
      case "indexedDB":
        allKeys = await this.getAllKeysIndexedDB(namespace);
        break;
    }

    let oldestEntry = Date.now();

    for (const key of allKeys) {
      const stored = await this.getStoredData<any>(namespace, key, {
        storageType,
      });
      if (!stored) continue;

      const rawValue = JSON.stringify(stored.data);
      totalSize += rawValue.length;

      const createdAt = stored.metadata.createdAt;
      oldestEntry = Math.min(oldestEntry, createdAt);
      newestEntry = Math.max(newestEntry, createdAt);

      if (stored.metadata.ttl && Date.now() > createdAt + stored.metadata.ttl)
        expiredEntries++;
      if (stored.metadata.encrypted) encryptedEntries++;
      if (stored.metadata.compressed) compressedEntries++;
    }

    return {
      storageType,
      totalKeys: allKeys.length,
      totalSize,
      newestEntry,
      expiredEntries,
      encryptedEntries,
      compressedEntries,
    };
  }
}

// Export singleton instance
export const unifiedDataService = UnifiedDataService.getInstance();

// Export type-safe convenience methods for each namespace
export const userData = {
  set: <T>(key: string, value: T, options?: StorageOptions) =>
    unifiedDataService.set("user", key, value, options),
  get: <T>(key: string, options?: StorageOptions) =>
    unifiedDataService.get<T>("user", key, options),
  delete: (key: string, options?: StorageOptions) =>
    unifiedDataService.delete("user", key, options),
  exists: (key: string, options?: StorageOptions) =>
    unifiedDataService.exists("user", key, options),
  query: <T>(options?: QueryOptions & StorageOptions) =>
    unifiedDataService.query<T>("user", options),
};

export const jobsData = {
  set: <T>(key: string, value: T, options?: StorageOptions) =>
    unifiedDataService.set("jobs", key, value, options),
  get: <T>(key: string, options?: StorageOptions) =>
    unifiedDataService.get<T>("jobs", key, options),
  delete: (key: string, options?: StorageOptions) =>
    unifiedDataService.delete("jobs", key, options),
  exists: (key: string, options?: StorageOptions) =>
    unifiedDataService.exists("jobs", key, options),
  query: <T>(options?: QueryOptions & StorageOptions) =>
    unifiedDataService.query<T>("jobs", options),
};

export const applicationsData = {
  set: <T>(key: string, value: T, options?: StorageOptions) =>
    unifiedDataService.set("applications", key, value, options),
  get: <T>(key: string, options?: StorageOptions) =>
    unifiedDataService.get<T>("applications", key, options),
  delete: (key: string, options?: StorageOptions) =>
    unifiedDataService.delete("applications", key, options),
  exists: (key: string, options?: StorageOptions) =>
    unifiedDataService.exists("applications", key, options),
  query: <T>(options?: QueryOptions & StorageOptions) =>
    unifiedDataService.query<T>("applications", options),
};

export const settingsData = {
  set: <T>(key: string, value: T, options?: StorageOptions) =>
    unifiedDataService.set("settings", key, value, {
      encrypt: true,
      ...options,
    }),
  get: <T>(key: string, options?: StorageOptions) =>
    unifiedDataService.get<T>("settings", key, options),
  delete: (key: string, options?: StorageOptions) =>
    unifiedDataService.delete("settings", key, options),
  exists: (key: string, options?: StorageOptions) =>
    unifiedDataService.exists("settings", key, options),
  query: <T>(options?: QueryOptions & StorageOptions) =>
    unifiedDataService.query<T>("settings", options),
};

export const cacheData = {
  set: <T>(
    key: string,
    value: T,
    options?: StorageOptions,
  ) =>
    unifiedDataService.set("cache", key, value, {
      ttl,
      storageType: "sessionStorage",
      ...options,
    }),
  get: <T>(key: string, options?: StorageOptions) =>
    unifiedDataService.get<T>("cache", key, {
      storageType: "sessionStorage",
      ...options,
    }),
  delete: (key: string, options?: StorageOptions) =>
    unifiedDataService.delete("cache", key, {
      storageType: "sessionStorage",
      ...options,
    }),
  exists: (key: string, options?: StorageOptions) =>
    unifiedDataService.exists("cache", key, {
      storageType: "sessionStorage",
      ...options,
    }),
  clear: () =>
    unifiedDataService.clear("cache", { storageType: "sessionStorage" }),
};
