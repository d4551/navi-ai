/**
 * Configuration for Live Data Sources
 * Controls which external APIs are enabled and how they're used
 */

export interface DataSourceConfig {
  id: string
  name: string
  enabled: boolean
  priority: number // Higher = more trusted (1-10)
  rateLimit: {
    requests: number
    windowMs: number
  }
  options: {
    maxStudios?: number
    timeout?: number
    requiresApiKey?: boolean
    apiKey?: string
  }
}

export const DATA_SOURCE_CONFIGS: Record<string, DataSourceConfig> = {
  steam: {
    id: 'steam',
    name: 'Steam API',
    enabled: true,
    priority: 7,
    rateLimit: {
      requests: 1,
      windowMs: 1000, // 1 request per second
    },
    options: {
      maxStudios: 100,
      timeout: 30000,
      requiresApiKey: false,
    },
  },

  'public-apis': {
    id: 'public-apis',
    name: 'Public API Sources',
    enabled: true,
    priority: 8,
    rateLimit: {
      requests: 1,
      windowMs: 2000, // 0.5 requests per second (conservative across all APIs)
    },
    options: {
      maxStudios: 50, // 50 per source = ~250 total studios
      timeout: 60000,
      requiresApiKey: false,
    },
  },

  igdb: {
    id: 'igdb',
    name: 'Internet Game Database',
    enabled: false, // Requires API key
    priority: 9,
    rateLimit: {
      requests: 4,
      windowMs: 1000, // 4 requests per second
    },
    options: {
      maxStudios: 500,
      timeout: 30000,
      requiresApiKey: true,
      apiKey: process.env.IGDB_API_KEY,
    },
  },

  mobygames: {
    id: 'mobygames',
    name: 'MobyGames API',
    enabled: false, // Requires API key
    priority: 6,
    rateLimit: {
      requests: 1,
      windowMs: 2000, // 0.5 requests per second
    },
    options: {
      maxStudios: 200,
      timeout: 45000,
      requiresApiKey: true,
      apiKey: process.env.MOBYGAMES_API_KEY,
    },
  },

  manual: {
    id: 'manual',
    name: 'Manual Import',
    enabled: true,
    priority: 10, // Highest trust
    rateLimit: {
      requests: 100,
      windowMs: 1000,
    },
    options: {
      maxStudios: 1000,
      timeout: 10000,
      requiresApiKey: false,
    },
  },
}

/**
 * Get configuration for a data source
 */
export function getDataSourceConfig(sourceId: string): DataSourceConfig | null {
  return DATA_SOURCE_CONFIGS[sourceId] || null
}

/**
 * Get all enabled data sources, sorted by priority (highest first)
 */
export function getEnabledDataSources(): DataSourceConfig[] {
  return Object.values(DATA_SOURCE_CONFIGS)
    .filter(config => config.enabled)
    .sort((a, b) => b.priority - a.priority)
}

/**
 * Check if a data source is available and properly configured
 */
export function isDataSourceAvailable(sourceId: string): boolean {
  const config = getDataSourceConfig(sourceId)

  if (!config || !config.enabled) {
    return false
  }

  // Check if API key is required but not provided
  if (config.options.requiresApiKey && !config.options.apiKey) {
    return false
  }

  return true
}

/**
 * Get data source statistics and health
 */
export function getDataSourceStats(): {
  total: number
  enabled: number
  available: number
  sources: Array<{
    id: string
    name: string
    enabled: boolean
    available: boolean
    priority: number
    requiresApiKey: boolean
  }>
} {
  const sources = Object.values(DATA_SOURCE_CONFIGS)
  const enabled = sources.filter(s => s.enabled)
  const available = sources.filter(s => isDataSourceAvailable(s.id))

  return {
    total: sources.length,
    enabled: enabled.length,
    available: available.length,
    sources: sources.map(s => ({
      id: s.id,
      name: s.name,
      enabled: s.enabled,
      available: isDataSourceAvailable(s.id),
      priority: s.priority,
      requiresApiKey: s.options.requiresApiKey || false,
    })),
  }
}

/**
 * Update data source configuration at runtime
 */
export function updateDataSourceConfig(
  sourceId: string,
  updates: Partial<DataSourceConfig>
): boolean {
  if (!DATA_SOURCE_CONFIGS[sourceId]) {
    return false
  }

  DATA_SOURCE_CONFIGS[sourceId] = {
    ...DATA_SOURCE_CONFIGS[sourceId],
    ...updates,
  }

  return true
}

/**
 * Environment-based configuration overrides
 */
export function initializeFromEnvironment(): void {
  // Steam configuration
  if (process.env.STEAM_ENABLED === 'false') {
    updateDataSourceConfig('steam', { enabled: false })
  }

  // IGDB configuration
  if (process.env.IGDB_API_KEY) {
    updateDataSourceConfig('igdb', {
      enabled: true,
      options: {
        ...DATA_SOURCE_CONFIGS.igdb.options,
        apiKey: process.env.IGDB_API_KEY,
      },
    })
  }

  // MobyGames configuration
  if (process.env.MOBYGAMES_API_KEY) {
    updateDataSourceConfig('mobygames', {
      enabled: true,
      options: {
        ...DATA_SOURCE_CONFIGS.mobygames.options,
        apiKey: process.env.MOBYGAMES_API_KEY,
      },
    })
  }
}

// Initialize from environment on module load
initializeFromEnvironment()
