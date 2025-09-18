/**
 * Configuration for AI, Jobs, and Studio Functionality
 * Centralized configuration management for all services
 */

export interface DatabaseConfig {
  type: 'sqlite' | 'indexeddb'
  path?: string
  version: number
  maxSize?: number
}

export interface AIConfig {
  provider: 'google' | 'openai' | 'anthropic' | 'auto'
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
  fallbackProvider?: string
}

export interface JobConfig {
  sources: string[]
  searchLimit: number
  cacheTimeout: number
  enableAIScoring: boolean
  enableBackgroundSync: boolean
}

export interface StudioConfig {
  sources: string[]
  searchLimit: number
  cacheTimeout: number
  enableAIInsights: boolean
  enableBackgroundSync: boolean
}

export interface ServiceConfig {
  database: DatabaseConfig
  ai: AIConfig
  jobs: JobConfig
  studios: StudioConfig
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableConsole: boolean
    enableFile: boolean
  }
}

// Default configuration
export const defaultConfig: ServiceConfig = {
  database: {
    type: 'sqlite',
    path: './data/navi.db',
    version: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  ai: {
    provider: 'auto',
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxTokens: 1000,
    fallbackProvider: 'google',
  },
  jobs: {
    sources: ['greenhouse', 'lever', 'workday', 'smartrecruiters'],
    searchLimit: 50,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    enableAIScoring: true,
    enableBackgroundSync: true,
  },
  studios: {
    sources: ['manual', 'api', 'scraped'],
    searchLimit: 30,
    cacheTimeout: 60 * 60 * 1000, // 1 hour
    enableAIInsights: true,
    enableBackgroundSync: true,
  },
  logging: {
    level: 'info',
    enableConsole: true,
    enableFile: false,
  },
}

// Environment-specific configurations
export const environmentConfigs = {
  development: {
    ...defaultConfig,
    database: {
      ...defaultConfig.database,
      path: './dev-data/navi.db',
    },
    logging: {
      ...defaultConfig.logging,
      level: 'debug' as const,
    },
  },

  test: {
    ...defaultConfig,
    database: {
      ...defaultConfig.database,
      type: 'sqlite' as const,
      path: ':memory:',
    },
    ai: {
      ...defaultConfig.ai,
      provider: 'auto' as const,
    },
    jobs: {
      ...defaultConfig.jobs,
      enableBackgroundSync: false,
    },
    studios: {
      ...defaultConfig.studios,
      enableBackgroundSync: false,
    },
    logging: {
      ...defaultConfig.logging,
      level: 'warn' as const,
    },
  },

  production: {
    ...defaultConfig,
    database: {
      ...defaultConfig.database,
      path: './data/navi.db',
    },
    logging: {
      ...defaultConfig.logging,
      level: 'info' as const,
      enableFile: true,
    },
  },
}

// Configuration manager
class ConfigManager {
  private config: ServiceConfig
  private environment: string

  constructor() {
    this.environment = this.detectEnvironment()
    this.config = this.loadConfiguration()
  }

  private detectEnvironment(): string {
    // Browser environment
    if (typeof window !== 'undefined') {
      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      ) {
        return 'development'
      }
      return 'production'
    }

    // Node.js environment
    if (typeof process !== 'undefined') {
      if (process.env.NODE_ENV === 'test') return 'test'
      if (process.env.NODE_ENV === 'development') return 'development'
      if (process.env.NODE_ENV === 'production') return 'production'
    }

    // Default to development
    return 'development'
  }

  private loadConfiguration(): ServiceConfig {
    const envConfig =
      environmentConfigs[this.environment] || environmentConfigs.development

    // Override with environment variables if available
    if (typeof process !== 'undefined' && process.env) {
      return this.applyEnvironmentOverrides(envConfig)
    }

    return envConfig
  }

  private applyEnvironmentOverrides(config: ServiceConfig): ServiceConfig {
    const env = process.env

    return {
      ...config,
      database: {
        ...config.database,
        path: env.DB_PATH || config.database.path,
        type: (env.DB_TYPE as any) || config.database.type,
      },
      ai: {
        ...config.ai,
        provider: (env.AI_PROVIDER as any) || config.ai.provider,
        apiKey: env.AI_API_KEY || config.ai.apiKey,
        model: env.AI_MODEL || config.ai.model,
      },
      jobs: {
        ...config.jobs,
        enableAIScoring:
          env.ENABLE_AI_SCORING === 'true' || config.jobs.enableAIScoring,
        enableBackgroundSync:
          env.ENABLE_JOB_SYNC === 'true' || config.jobs.enableBackgroundSync,
      },
      studios: {
        ...config.studios,
        enableAIInsights:
          env.ENABLE_AI_INSIGHTS === 'true' || config.studios.enableAIInsights,
        enableBackgroundSync:
          env.ENABLE_STUDIO_SYNC === 'true' ||
          config.studios.enableBackgroundSync,
      },
      logging: {
        ...config.logging,
        level: (env.LOG_LEVEL as any) || config.logging.level,
      },
    }
  }

  getConfig(): ServiceConfig {
    return this.config
  }

  getDatabaseConfig(): DatabaseConfig {
    return this.config.database
  }

  getAIConfig(): AIConfig {
    return this.config.ai
  }

  getJobConfig(): JobConfig {
    return this.config.jobs
  }

  getStudioConfig(): StudioConfig {
    return this.config.studios
  }

  getEnvironment(): string {
    return this.environment
  }

  updateConfig(updates: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  isDevelopment(): boolean {
    return this.environment === 'development'
  }

  isProduction(): boolean {
    return this.environment === 'production'
  }

  isTest(): boolean {
    return this.environment === 'test'
  }
}

// Export singleton instance
export const configManager = new ConfigManager()
export default configManager

// Export individual configurations for convenience
export const databaseConfig = configManager.getDatabaseConfig()
export const aiConfig = configManager.getAIConfig()
export const jobConfig = configManager.getJobConfig()
export const studioConfig = configManager.getStudioConfig()
