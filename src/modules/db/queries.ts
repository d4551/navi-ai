
import type { DatabaseModel } from "./models";

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

  table: string,
  conditions?: Record<string, any>,
  options?: QueryOptions,
): string {

    const whereClause = Object.entries(conditions)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(" AND ");
    query += ` WHERE ${whereClause}`;
  }

  if (options?.orderBy) {
    query += ` ORDER BY ${options.orderBy} ${options.orderDirection || "asc"}`;
  }

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  if (options?.offset) {
    query += ` OFFSET ${options.offset}`;
  }

  return query;
}

  table: string,
  data: Partial<T>,
): string {
  const columns = Object.keys(_data).join(", ");
  const values = Object.values(_data)
    .map((v) => `'${v}'`)
    .join(", ");
  return `INSERT INTO ${table} (${columns}) VALUES (${values})`;
}

  table: string,
  id: string,
  data: Partial<T>,
): string {
  const setClause = Object.entries(_data)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ");
  return `UPDATE ${table} SET ${setClause} WHERE id = '${id}'`;
}

  return `DELETE FROM ${table} WHERE id = '${id}'`;
}
