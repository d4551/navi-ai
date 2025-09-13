// Database Schema Definitions
// Centralized type definitions for database operations

// Re-export all repository types for centralized access
export type { Job, SalaryRange } from "../api/schemas";
export type { Resume } from "./repositories/resume";
export type { Portfolio, PortfolioProject } from "./repositories/portfolio";
export type { UserProfile, UserSettings } from "./repositories/user";
export type { StudioData } from "./repositories/studios";

// Common database interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VersionedEntity extends BaseEntity {
  version: number;
}

// Database operation result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchCriteria {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// Common validation schemas
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "date" | "array" | "object";
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// Database configuration
export interface DatabaseConfig {
  name: string;
  version: number;
  stores: Array<{
    name: string;
    keyPath: string;
    indexes?: Array<{
      name: string;
      keyPath: string | string[];
      unique?: boolean;
    }>;
  }>;
}

// Migration types
export interface MigrationScript {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Backup and restore types
export interface DatabaseBackup {
  version: string;
  timestamp: Date;
  data: Record<string, any[]>;
  checksum: string;
}

export interface RestoreOptions {
  clearExisting?: boolean;
  validateChecksum?: boolean;
  skipVersionCheck?: boolean;
}
