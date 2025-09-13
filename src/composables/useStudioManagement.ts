
import { ref, computed, onMounted, readonly } from "vue";
import { logger } from "@/shared/utils/logger";
import { GameStudioRepository } from "@/modules/db/repositories/gaming-studios";
import { studioDatabaseInitializer } from "@/modules/studio/StudioDatabaseInitializer";

// Use a unified studio interface that works with the existing data
export interface Studio {
  id: string;
  name: string;
  description?: string;
  location?: string;
  size?: string;
  games?: string[];
  [key: string]: any; // Allow additional properties
}

export interface StudioSearchFilters {
  query?: string;
  size?: string;
  location?: string;
  genre?: string;
  hasOpenings?: boolean;
}

export interface StudioStats {
  total: number;
  bySize: Record<string, number>;
  byLocation: Record<string, number>;
  topGenres: Array<{ genre: string; count: number }>;
}

  // Reactive state
  const studios = ref<Record<string, Studio>>({});
  const filteredStudios = ref<Studio[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);
  const searchQuery = ref("");
  const activeFilters = ref<StudioSearchFilters>({});

  // Computed properties
  const studioCount = computed(() => Object.keys(studios.value).length);
  const studioList = computed(() => Object.values(studios.value));

  const studiosBySize = computed(() => {
    const bySize: Record<string, Studio[]> = {};
    studioList.value.forEach((studio) => {
      const size = studio.size || "unknown";
      if (!bySize[size]) bySize[size] = [];
      bySize[size].push(studio);
    });
    return bySize;
  });

  const studiosByLocation = computed(() => {
    const byLocation: Record<string, Studio[]> = {};
    studioList.value.forEach((studio) => {
      const location = extractRegion(studio.location || "");
      if (!byLocation[location]) byLocation[location] = [];
      byLocation[location].push(studio);
    });
    return byLocation;
  });

  const popularStudios = computed(() => {
    return studioList.value
  });

  const initializeStudios = async (): Promise<boolean> => {
    if (initialized.value) return true;

    try {
      loading.value = true;
      error.value = null;

      logger.info("[GAME] Initializing studio management...");

      // Ensure database is ready
      const dbReady = await studioDatabaseInitializer.ensureStudioDatabase();
      if (!dbReady) {
        throw new Error("Failed to initialize studio database");
      }

      // Load studios
      await loadStudios();

      initialized.value = true;
      logger.info(
      );

      return true;
    } catch (err) {
      const errorMsg = `Failed to initialize studios: ${err}`;
      error.value = errorMsg;
      logger.error(errorMsg, err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const loadStudios = async (): Promise<void> => {
    try {
      const studioData = await GameStudioRepository.getAll();
      studios.value = studioData;

      // Apply any active filters
      applyFilters();
    } catch (err) {
      const errorMsg = `Failed to load studios: ${err}`;
      error.value = errorMsg;
      logger.error(errorMsg, err);
      throw err;
    }
  };

  const searchStudios = async (query: string): Promise<Studio[]> => {
      return [];
    }

    try {
      searchQuery.value = query;

      const results = await GameStudioRepository.search({
        name: query,
      });

      // Convert to our Studio interface
      return results.map((studio) => ({
        ...studio, // Spread studio properties first
        id: studio.id,
        name: studio.name,
        description: studio.description,
        location: studio.location,
        size: studio.size,
        games: studio.games,
      }));
    } catch (err) {
      logger.error("Studio search failed:", err);
      return [];
    }
  };

  const getStudioById = async (id: string): Promise<Studio | null> => {
    try {
      const studio = await GameStudioRepository.getById(id);
      if (!studio) return null;

      // Convert to our Studio interface
      return {
        ...studio, // Spread studio properties first
        id: studio.id,
        name: studio.name,
        description: studio.description,
        location: studio.location,
        size: studio.size,
        games: studio.games,
      };
    } catch (err) {
      logger.error(`Failed to get studio ${id}:`, err);
      return null;
    }
  };

  const getStudioSuggestions = async (
    query: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      location: string;
      matchType: string;
    }>
  > => {
    try {
      return await studioDatabaseInitializer.getStudioSuggestions(query, limit);
    } catch (err) {
      logger.error("Failed to get studio suggestions:", err);
      return [];
    }
  };

  const applyFilters = (filters?: StudioSearchFilters): void => {
    const currentFilters = filters || activeFilters.value;
    activeFilters.value = currentFilters;

    let filtered = studioList.value;

    // Apply search query
    if (currentFilters.query) {
      const query = currentFilters.query.toLowerCase();
      filtered = filtered.filter(
        (studio) =>
          studio.name.toLowerCase().includes(query) ||
          studio.description?.toLowerCase().includes(query) ||
          studio.games?.some((game) => game.toLowerCase().includes(query)) ||
          studio.location?.toLowerCase().includes(query),
      );
    }

    // Apply size filter
    if (currentFilters.size && currentFilters.size !== "all") {
      filtered = filtered.filter(
        (studio) => studio.size === currentFilters.size,
      );
    }

    // Apply location filter
    if (currentFilters.location && currentFilters.location !== "all") {
      filtered = filtered.filter((studio) => {
        const region = extractRegion(studio.location || "");
        return region === currentFilters.location;
      });
    }

    // Apply genre filter (simplified)
    if (currentFilters.genre && currentFilters.genre !== "all") {
      filtered = filtered.filter((studio) => {
        const content = [
          studio.description || "",
          studio.games?.join(" ") || "",
        ]
          .join(" ")
          .toLowerCase();
        return content.includes(currentFilters.genre!.toLowerCase());
      });
    }

    filteredStudios.value = filtered;
  };

  const clearFilters = (): void => {
    activeFilters.value = {};
    searchQuery.value = "";
    filteredStudios.value = studioList.value;
  };

  const getStudioStatistics = async (): Promise<StudioStats> => {
    try {
      return await studioDatabaseInitializer.getStudioStatistics();
    } catch (err) {
      logger.error("Failed to get studio statistics:", err);
      return {
        bySize: {},
        byLocation: {},
        topGenres: [],
      };
    }
  };

  const validateDatabase = async (): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> => {
    try {
      const validation = await studioDatabaseInitializer.validateStudioData();
      return {
        valid: validation.valid,
        issues: validation.issues,
        recommendations: validation.recommendations,
      };
    } catch (err) {
      logger.error("Database validation failed:", err);
      return {
        valid: false,
        issues: [`Validation error: ${err}`],
        recommendations: ["Check database connection and data integrity"],
      };
    }
  };

  const extractRegion = (location: string): string => {
    if (!location) return "Unknown";

    const loc = location.toLowerCase();

    if (
      loc.includes("usa") ||
      loc.includes("united states") ||
      loc.includes(", ca") ||
      loc.includes("california") ||
      loc.includes("texas") ||
      loc.includes("new york")
    ) {
      return "North America";
    }
    if (loc.includes("canada")) return "North America";
    if (
      loc.includes("uk") ||
      loc.includes("london") ||
      loc.includes("france") ||
      loc.includes("germany") ||
      loc.includes("sweden") ||
      loc.includes("finland")
    ) {
      return "Europe";
    }
    if (
      loc.includes("japan") ||
      loc.includes("china") ||
      loc.includes("korea")
    ) {
      return "Asia";
    }
    if (loc.includes("australia")) return "Oceania";

    return "Other";
  };

  const formatStudioSize = (size: string): string => {
    const sizeMap: Record<string, string> = {
      unknown: "Unknown",
    };
    return sizeMap[size] || size;
  };

  const getStudioTypeIcon = (studio: Studio): string => {
    const size = studio.size || "unknown";
    const iconMap: Record<string, string> = {
      indie: "mdi-gamepad-variant",
      small: "mdi-gamepad-variant-outline",
      medium: "mdi-controller-classic",
      large: "mdi-domain",
      enterprise: "mdi-office-building",
      unknown: "mdi-help-circle",
    };
    return iconMap[size] || "mdi-domain";
  };

  const isStudioFavorite = async (studioId: string): Promise<boolean> => {
    try {
      return await GameStudioRepository.isFavorite(studioId);
    } catch {
      return false;
    }
  };

  const toggleStudioFavorite = async (studioId: string): Promise<boolean> => {
    try {
      const isFav = await isStudioFavorite(studioId);
      if (isFav) {
        await GameStudioRepository.removeFavorite(studioId);
        return false;
      } else {
        await GameStudioRepository.addFavorite(studioId);
        return true;
      }
    } catch (err) {
      logger.error("Failed to toggle studio favorite:", err);
      return false;
    }
  };

  const getFavoriteStudios = async (): Promise<Studio[]> => {
    try {
      const favoriteIds = await GameStudioRepository.getFavorites();
      const favorites: Studio[] = [];

      for (const id of favoriteIds) {
        const studio = await getStudioById(id);
        if (studio) {
          favorites.push(studio);
        }
      }

      return favorites;
    } catch (err) {
      logger.error("Failed to get favorite studios:", err);
      return [];
    }
  };

  // Auto-initialize on mount
  onMounted(() => {
    initializeStudios().catch((err) => {
      logger.error("Auto-initialization failed:", err);
    });
  });

  return {
    // State
    studios: readonly(studios),
    filteredStudios: readonly(filteredStudios),
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),
    searchQuery: readonly(searchQuery),
    activeFilters: readonly(activeFilters),

    // Computed
    studioCount,
    studioList,
    studiosBySize,
    studiosByLocation,
    popularStudios,

    initializeStudios,
    loadStudios,
    searchStudios,
    getStudioById,
    getStudioSuggestions,
    applyFilters,
    clearFilters,
    getStudioStatistics,
    validateDatabase,

    // Utilities
    extractRegion,
    formatStudioSize,
    getStudioTypeIcon,

    // Favorites
    isStudioFavorite,
    toggleStudioFavorite,
    getFavoriteStudios,
  };
}

// Export type for external use
export type StudioManagement = ReturnType<typeof useStudioManagement>;
