
console.warn('Using better-sqlite3 browser stub - SQLite operations will be mocked');

// Environment detection and helpful guidance
const isBrowser = typeof window !== "undefined";
const isElectron =
  typeof window !== "undefined" && window.process && window.process.type;

if (isBrowser && !isElectron) {
  console.info('   • IndexedDB via the "idb" package for structured data');
  console.info("   • localStorage/sessionStorage for simple key-value data");
  console.info("   • WebSQL (deprecated) or SQL.js for SQL-like operations");
}

class MockDatabase {
  constructor(path) {
    this.mockData = new Map();
    this.isOpen = false;

    console.warn(
      `MockDatabase: SQLite operations are not available in browser. Path attempted: ${path || "memory"}`,
    );
    this.isOpen = true;

    // Provide helpful guidance for developers
    if (typeof window !== "undefined") {
      console.info("Consider using IndexedDB or localStorage for browser data persistence");
    }
  }

  prepare(sql) {
    console.debug(`MockDatabase.prepare(): ${sql}`);

    return {
      get: (params) => {
        console.debug("MockDatabase.get() called with params:", params);
        return null;
      },
      all: (params) => {
        console.debug("MockDatabase.all() called with params:", params);
        return [];
      },
      run: (params) => {
        console.debug("MockDatabase.run() called with params:", params);
        return {
          changes: 0,
          lastInsertRowid: 0
        };
      },
      iterate: (params) => {
        console.debug("MockDatabase.iterate() called with params:", params);
        return [];
      },
    };
  }

  exec(sql) {
    console.debug(`MockDatabase.exec(): ${sql}`);
    return this;
  }

  close() {
    console.debug("MockDatabase.close() called");
    this.isOpen = false;
    return this;
  }

  backup(destination, options) {
    console.debug(
      `MockDatabase.backup() to ${destination} with options:`,
      options,
    );

    return {
      finalize: () => {
        console.debug("MockDatabase backup finalized");
      },
    };
  }

  // Additional helpful methods for development
  pragma(sql) {
    console.debug(`MockDatabase.pragma(): ${sql}`);
    return [];
  }

    return this;
  }

  aggregate(_name, _options) {
    console.debug(`MockDatabase.aggregate(): Registered aggregate ${_name}`);
    return this;
  }

  // Property getters for compatibility
  get open() {
    return this.isOpen;
  }

  get inTransaction() {
    return false;
  }

  get readonly() {
    return false;
  }

  get name() {
    return ":memory:";
  }

  get memory() {
    return true;
  }
}

// Enhanced export with development hints
const DatabaseConstructor = MockDatabase;

// Add helpful static methods
  return "[MockDatabase - Browser Stub]";
};

// Default export (ES modules)
export default DatabaseConstructor;

// CommonJS export for compatibility
export { MockDatabase };

export const Database = DatabaseConstructor;

export const constants = {
};

// Helpful error class for better debugging
export class SQLiteError extends Error {
  constructor(message, code) {
    super(`[MockSQLite] ${message}`);
    this.name = "SQLiteError";
    if (code) {
      this.code = code;
    }
  }
}
