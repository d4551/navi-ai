
export interface DataSourceConfig {
  id: string;
  name: string;
  enabled: boolean;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  options: {
    maxStudios?: number;
    timeout?: number;
    requiresApiKey?: boolean;
    apiKey?: string;
  };
}

export const DATA_SOURCE_CONFIGS: Record<string, DataSourceConfig> = {
  steam: {
    id: "steam",
    name: "Steam API",
    enabled: true,
    rateLimit: {
    },
    options: {
      requiresApiKey: false,
    },
  },

  "public-apis": {
    id: "public-apis",
    name: "Public API Sources",
    enabled: true,
    rateLimit: {
    },
    options: {
      requiresApiKey: false,
    },
  },

  igdb: {
    id: "igdb",
    name: "Internet Game Database",
    enabled: false, // Requires API key
    rateLimit: {
    },
    options: {
      requiresApiKey: true,
      apiKey: process.env.IGDB_API_KEY,
    },
  },

  mobygames: {
    id: "mobygames",
    name: "MobyGames API",
    enabled: false, // Requires API key
    rateLimit: {
    },
    options: {
      requiresApiKey: true,
      apiKey: process.env.MOBYGAMES_API_KEY,
    },
  },

  manual: {
    id: "manual",
    name: "Manual Import",
    enabled: true,
    rateLimit: {
    },
    options: {
      requiresApiKey: false,
    },
  },
};

  return DATA_SOURCE_CONFIGS[sourceId] || null;
}

  return Object.values(DATA_SOURCE_CONFIGS)
    .filter((_config) => config.enabled)
    .sort((a, b) => b.priority - a.priority);
}

  const config = getDataSourceConfig(sourceId);

  if (!config || !config.enabled) {
    return false;
  }

  // Check if API key is required but not provided
  if (config.options.requiresApiKey && !config.options.apiKey) {
    return false;
  }

  return true;
}

  total: number;
  enabled: number;
  available: number;
  sources: Array<{
    id: string;
    name: string;
    enabled: boolean;
    available: boolean;
    priority: number;
    requiresApiKey: boolean;
  }>;
} {
  const sources = Object.values(DATA_SOURCE_CONFIGS);
  const enabled = sources.filter((s) => s.enabled);
  const available = sources.filter((s) => isDataSourceAvailable(s.id));

  return {
    total: sources.length,
    enabled: enabled.length,
    available: available.length,
    sources: sources.map((s) => ({
      id: s.id,
      name: s.name,
      enabled: s.enabled,
      available: isDataSourceAvailable(s.id),
      priority: s.priority,
      requiresApiKey: s.options.requiresApiKey || false,
    })),
  };
}

  sourceId: string,
  updates: Partial<DataSourceConfig>,
): boolean {
  if (!DATA_SOURCE_CONFIGS[sourceId]) {
    return false;
  }

  DATA_SOURCE_CONFIGS[sourceId] = {
    ...DATA_SOURCE_CONFIGS[sourceId],
    ...updates,
  };

  return true;
}

  // Steam configuration
  if (process.env.STEAM_ENABLED === "false") {
    updateDataSourceConfig("steam", { enabled: false });
  }

  // IGDB configuration
  if (process.env.IGDB_API_KEY) {
    updateDataSourceConfig("igdb", {
      enabled: true,
      options: {
        ...DATA_SOURCE_CONFIGS.igdb.options,
        apiKey: process.env.IGDB_API_KEY,
      },
    });
  }

  // MobyGames configuration
  if (process.env.MOBYGAMES_API_KEY) {
    updateDataSourceConfig("mobygames", {
      enabled: true,
      options: {
        ...DATA_SOURCE_CONFIGS.mobygames.options,
        apiKey: process.env.MOBYGAMES_API_KEY,
      },
    });
  }
}

// Initialize from environment on module load
initializeFromEnvironment();
