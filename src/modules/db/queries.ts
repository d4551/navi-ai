/**
 * Database Query Utilities
 * Basic query helper functions
 */

import type { DatabaseModel } from './models';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

// Generic query builder functions
export function buildSelectQuery(
  table: string,
  conditions?: Record<string, any>,
  options?: QueryOptions
): string {
  let query = `SELECT * FROM ${table}`;
  
  if (conditions && Object.keys(conditions).length > 0) {
    const whereClause = Object.entries(conditions)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');
    query += ` WHERE ${whereClause}`;
  }
  
  if (options?.orderBy) {
    query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'asc'}`;
  }
  
  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }
  
  if (options?.offset) {
    query += ` OFFSET ${options.offset}`;
  }
  
  return query;
}

export function buildInsertQuery<T extends DatabaseModel>(
  table: string, 
  data: Partial<T>
): string {
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data).map(v => `'${v}'`).join(', ');
  return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
}

export function buildUpdateQuery<T extends DatabaseModel>(
  table: string, 
  id: string, 
  data: Partial<T>
): string {
  const setClause = Object.entries(_data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(', ');
  return `UPDATE ${table} SET ${setClause} WHERE id = '${id}'`;
}

export function buildDeleteQuery(table: string, id: string): string {
  return `DELETE FROM ${table} WHERE id = '${id}'`;
}
