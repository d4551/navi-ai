
import { logger } from "@/shared/utils/logger";

// A mock API client for demonstration purposes.
// In a real application, this would be replaced with a proper HTTP client like Axios.
const apiClient = {
  get: async (endpoint, params = {}) => {
    logger.info(`[API] Fetching data from ${endpoint}`, params, "ApiService");
    // Simulate network delay

    if (endpoint === "/dashboard/main") {
      return {
        data: {
          userProfile: {
            name: "Detective Navi",
          },
          achievements: {
          },
          applications: [
            {
              title: "Lead Gameplay Engineer",
              company: "Riot Games",
              status: "applied",
            },
            {
              title: "Senior Animator",
              company: "Naughty Dog",
              status: "interview",
            },
          ],
        },
      };
    }

    if (endpoint === "/gaming/studios") {
      return {
        data: [
          { id: "riot-games", name: "Riot Games", logoPath: "riot-games.svg" },
          { id: "epic-games", name: "Epic Games", logoPath: "epic-games.svg" },
          {
            id: "naughty-dog",
            name: "Naughty Dog",
            logoPath: "naughty-dog.svg",
          },
          {
            id: "cd-projekt-red",
            name: "CD Projekt Red",
            logoPath: "cd-projekt-red.svg",
          },
          {
            id: "valve-corporation",
            name: "Valve Corporation",
            logoPath: "valve.svg",
          },
          { id: "ubisoft", name: "Ubisoft", logoPath: "ubisoft.svg" },
        ],
      };
    }

    if (endpoint === "/challenges/daily") {
      return {
        data: [
          {
            id: "job-search",
            name: "Search for Jobs",
            completed: true,
          },
        ],
      };
    }

    // Studios search (local DB-backed)
    if (endpoint === "/studios/search") {
      try {
        const { studioService } = await import(
          "@/modules/studios/StudioService"
        );
        const result = await studioService.searchStudios(params || {});
        return { data: result };
      } catch (e) {
        logger.warn(
          "[API] /studios/search failed, returning empty result",
          e,
          "ApiService",
        );
        return {
          data: {
            studios: [],
            facets: { types: {}, locations: {}, sizes: {}, genres: {} },
          },
        };
      }
    }

    return { data: null };
  },
  post: async (endpoint, payload) => {
    logger.info(`[API] Posting data to ${endpoint}`, payload, "ApiService");
    return {
      data: { success: true, message: "Action completed successfully." },
    };
  },
};

export const getDashboardData = async () => {
  try {
    const response = await apiClient.get("/dashboard/main");
    return response.data;
  } catch (error) {
    logger.error("Error fetching dashboard data:", error, "ApiService");
    throw error;
  }
};

export const getFeaturedStudios = async () => {
  try {
    const response = await apiClient.get("/gaming/studios");
    return response.data;
  } catch (error) {
    logger.error("Error fetching featured studios:", error, "ApiService");
    throw error;
  }
};

export const getDailyChallenges = async () => {
  try {
    const response = await apiClient.get("/challenges/daily");
    return response.data;
  } catch (error) {
    logger.error("Error fetching daily challenges:", error, "ApiService");
    throw error;
  }
};

export const performAIAnalysis = async () => {
  try {
    const response = await apiClient.post("/ai/analyze-profile");
    return response.data;
  } catch (error) {
    logger.error("Error performing AI analysis:", error, "ApiService");
    throw error;
  }
};
