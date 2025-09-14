
  export interface Statement {
    get(..._params: any[]): any | null;
    all(..._params: any[]): any[];
    run(..._params: any[]): { lastInsertRowid: number; changes: number };
    iterate(..._params: any[]): IterableIterator<any>;
  }

  export interface Database {
    prepare(_sql: string): Statement;
    exec(_sql: string): Database;
    close(): Database;
    backup(_destination: string, _options?: any): any;
    pragma(_sql: string): any[];
    aggregate(_name: string, _options: any): Database;
    readonly open: boolean;
    readonly inTransaction: boolean;
    readonly readonly: boolean;
    readonly name: string;
    readonly memory: boolean;
  }

  export interface DatabaseConstructor {
    new (_path?: string): Database;
    (_path?: string): Database;
  }

  export const Database: DatabaseConstructor;
  export const MockDatabase: DatabaseConstructor;
  export const constants: {
    OPEN_READONLY: number;
    OPEN_READWRITE: number;
    OPEN_CREATE: number;
    OPEN_FULLMUTEX: number;
    OPEN_SHAREDCACHE: number;
    OPEN_PRIVATECACHE: number;
  };

  export class SQLiteError extends Error {
    code?: string;
    constructor(_message: string, _code?: string);
  }

  const defaultExport: DatabaseConstructor;
  export default defaultExport;
}
