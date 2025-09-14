
import { ref, computed } from "vue";
import { aiJobMatchingService } from "@/services/AIJobMatchingService";
import { useToast } from "@/composables/useToast";
import { logger } from "@/shared/utils/logger";

export function useAIJobSearch() {
  // Reactive state
  const isSearching = ref(false);
  const searchResults = ref([]);
  const enrichedJobs = ref([]); // Jobs enriched with studio data
  const searchInsights = ref([]);
  const searchAnalysis = ref(null);
  const lastSearchQuery = ref("");
  const searchError = ref(null);
  const marketSummary = ref(null);
  const personalizedTips = ref([]);

  // Search history
  const searchHistory = ref([]);
  const savedSearches = ref([]);

  // Real-time suggestions
  const searchSuggestions = ref([]);
  const quickSuggestions = ref([
    "Remote Unity developer",
    "Senior game designer AAA",
    "Community manager esports",
    "Mobile game producer",
    "VR/AR technical artist",
    "Gameplay programmer",
    "UX designer gaming",
    "DevOps engineer games",
  ]);

  const toast = useToast();

  // Computed properties


  const searchProgress = computed(() => {
    // Simulate progress based on search duration
    return searchResults.value.length > 0 ? 100 : (isSearching.value ? 50 : 0);
  });

  const topMatches = computed(() =>
    searchResults.value.filter(job => (job.score || 0) > 0.7).slice(0, 5)
  );

  const searchStats = computed(() => {
    if (!searchResults.value.length) return null;


    return {
      total: searchResults.value.length,
    };
  });

  // Methods
    if (isSearching.value || !searchForm.query?.trim()) {
      return { success: false, error: "Invalid search or search in progress" };
    }

    try {
      isSearching.value = true;
      searchError.value = null;
      lastSearchQuery.value = searchForm.query;

      logger.info("Starting AI-powered job search:", searchForm.query);

      const analysisResult = await aiJobMatchingService.performSemanticSearch(
        searchForm.query,
        userProfile,
        {
          location: searchForm.location,
          experience: searchForm.experience,
          type: searchForm.type,
          remote: searchForm.remote,
          salaryMin: searchForm.salaryMin,
          salaryMax: searchForm.salaryMax,
          ...options,
        },
      );

      if (analysisResult.success) {
        searchAnalysis.value = analysisResult.analysis;
        searchSuggestions.value = analysisResult.suggestions || [];
        updateSearchInsights(analysisResult.insights || []);

        logger.info("Search analysis completed successfully");
      } else {
        logger.warn(
          "Search analysis failed, using fallback:",
          analysisResult.error,
        );
        searchAnalysis.value = analysisResult.fallback;
      }

      const insightsResult =
        await aiJobMatchingService.generateJobSearchInsights(
          searchForm.query,
          userProfile,
          marketSummary.value || {},
        );

      if (insightsResult.success) {
        searchInsights.value = insightsResult.insights;
        marketSummary.value = insightsResult.marketSummary;
        personalizedTips.value =
          insightsResult.recommendations?.immediate || [];

        logger.info("Job search insights generated successfully");
      }


      const matchingResult = await aiJobMatchingService.matchJobsToProfile(
        mockJobs,
        userProfile,
        { query: searchForm.query, analysis: searchAnalysis.value },
      );

      if (matchingResult.success) {
        // Process job matching results
        searchResults.value = matchingResult.matches.map((match, index) => ({
          ...mockJobs.find((job) => job.id === match.jobId),
          ...match,
        }));

        // Store enriched jobs with studio data
        if (matchingResult.enrichedJobs) {
          enrichedJobs.value = matchingResult.enrichedJobs;
          logger.info(
            `Jobs enriched with studio data: ${enrichedJobs.value.filter((j) => j.studioData).length}/${enrichedJobs.value.length}`,
          );
        }

        logger.info(
          `AI job matching completed: ${matchingResult.matches.length} jobs ranked`,
        );
      } else {
        searchResults.value = mockJobs;
        logger.warn("Job matching failed, using unranked results");
      }

      // Add to search history
      addToSearchHistory(searchForm);

      toast.success(`Found ${searchResults.value.length} AI-matched positions`);

      return {
        success: true,
        results: searchResults.value,
        insights: searchInsights.value,
        analysis: searchAnalysis.value,
      };
    } catch (_error) {
      searchError.value = error.message;
      logger.error("AI job search failed:", error);
      toast.error("Search failed. Please try again.");

      return { success: false, error: error.message };
    } finally {
      isSearching.value = false;
    }
  }

      return quickSuggestions.value;
    }

    try {
      // Simple suggestion generation based on gaming keywords
      const gamingTerms = [
        "game designer",
        "unity developer",
        "unreal engineer",
        "community manager",
        "esports coordinator",
        "mobile producer",
        "technical artist",
        "qa lead",
        "gameplay programmer",
        "ui/ux designer",
        "devops engineer",
        "data analyst",
      ];

      const filtered = gamingTerms
        .filter((term) =>
          term.toLowerCase().includes(partialQuery.toLowerCase()),
        )

      return [
        ...filtered,
      ];
    } catch (_error) {
      logger.error("Failed to get search suggestions:", error);
      return quickSuggestions.value;
    }
  }

    try {
      const result = await aiJobMatchingService.analyzeSalaryCompetitiveness(
        jobTitle,
        location,
        salaryRange,
        userProfile,
      );

      if (result.success) {
        return {
          success: true,
          competitiveness: result.analysis.competitiveness,
          percentile: result.analysis.marketPercentile,
          insights: result.insights,
          tips: result.negotiationTips,
        };
      }

      return result;
    } catch (_error) {
      logger.error("Salary analysis failed:", error);
      return { success: false, error: error.message };
    }
  }

    try {
      const result = await aiJobMatchingService.getPersonalizedRecommendations(
        userProfile,
        searchHistory.value,
        { query: lastSearchQuery.value },
      );

      if (result.success) {
        personalizedTips.value = result.recommendations;
        return {
          success: true,
          tips: result.recommendations,
          strengths: result.strengths,
          improvements: result.improvements,
          skillGaps: result.skillGaps,
        };
      }

      return result;
    } catch (_error) {
      logger.error("Failed to get personalized recommendations:", error);
      return { success: false, error: error.message };
    }
  }

    // Merge new insights with existing ones, avoiding duplicates
    const existingIds = new Set(
      searchInsights.value.map((insight) => insight.id),
    );
    const uniqueNewInsights = newInsights.filter(
      (insight) => !existingIds.has(insight.id),
    );

    searchInsights.value = [
      ...searchInsights.value,
      ...uniqueNewInsights,
  }

    logger.info("Handling insight action:", insight.action?.type);

    switch (insight.action?.type) {
      case "update_search":
        // Trigger search form update
        return { action: "updateSearch", data: insight.action.data };

      case "expand_skills":
        // Suggest skills to add to profile
        return { action: "expandSkills", data: insight.action.data };

      case "adjust_salary":
        // Suggest salary range adjustment
        return { action: "adjustSalary", data: insight.action.data };

      case "change_location":
        // Suggest location changes
        return { action: "changeLocation", data: insight.action.data };

      default:
        return { action: "info", message: insight.description };
    }
  }

    const searchToSave = {
      id: Date.now().toString(),
      query: searchForm.query,
      filters: {
        location: searchForm.location,
        experience: searchForm.experience,
        type: searchForm.type,
        remote: searchForm.remote,
        salaryMin: searchForm.salaryMin,
        salaryMax: searchForm.salaryMax,
      },
      createdAt: new Date().toISOString(),
      resultsCount: searchResults.value.length,
    };

    savedSearches.value.push(searchToSave);

    // Store in localStorage for persistence
    try {
      localStorage.setItem(
        "aiJobSearches",
        JSON.stringify(savedSearches.value),
      );
      toast.success("Search saved successfully");
    } catch (_error) {
      logger.error("Failed to save search:", error);
      toast.error("Failed to save search");
    }

    return searchToSave;
  }

    const saved = savedSearches.value.find((search) => search.id === searchId);
    if (saved) {
      return {
        query: saved.query,
        ...saved.filters,
      };
    }
    return null;
  }

    const index = savedSearches.value.findIndex(
      (search) => search.id === searchId,
    );

      try {
        localStorage.setItem(
          "aiJobSearches",
          JSON.stringify(savedSearches.value),
        );
        toast.success("Search deleted");
      } catch (_error) {
        logger.error("Failed to delete search:", error);
      }
    }
  }

    const historyItem = {
      id: Date.now().toString(),
      query: searchForm.query,
      timestamp: new Date().toISOString(),
      resultsCount: searchResults.value.length,
    };

    searchHistory.value.unshift(historyItem);
  }

    searchResults.value = [];
    searchInsights.value = [];
    searchAnalysis.value = null;
    searchError.value = null;
  }

    // This would be replaced with actual job API integration
    const mockJobs = [];
    const companies = [
      "Epic Games",
      "Riot Games",
      "Blizzard",
      "Valve",
      "CD Projekt",
      "Ubisoft",
      "EA",
      "Unity Technologies",
    ];
    const roles = analysis?.searchAnalysis?.extractedRoles || [
      "Game Developer",
      "Game Designer",
      "Producer",
    ];

      mockJobs.push({
        title:
          roles[i % roles.length] +
        company: companies[i % companies.length],
        location: [
          "San Francisco, CA",
          "Los Angeles, CA",
          "Remote",
          "Austin, TX",
          "Seattle, WA",
        salary: {
        },
        description: `Join our team as a ${roles[i % roles.length]} and help create amazing gaming experiences. Work with cutting-edge technology and passionate developers.`,
          "Gaming passion",
          "Team collaboration",
        ],
      });
    }

    return mockJobs;
  }

    try {
      const saved = localStorage.getItem("aiJobSearches");
      if (saved) {
        savedSearches.value = JSON.parse(saved);
      }
    } catch (_error) {
      logger.error("Failed to load saved searches:", error);
    }
  }

  // Initialize
  onMounted(() => {
    loadSavedSearches();
  });

  return {
    // State
    isSearching: computed(() => isSearching.value),
    searchResults: computed(() => searchResults.value),
    enrichedJobs: computed(() => enrichedJobs.value), // Jobs with studio data
    searchInsights: computed(() => searchInsights.value),
    searchAnalysis: computed(() => searchAnalysis.value),
    searchError: computed(() => searchError.value),
    marketSummary: computed(() => marketSummary.value),
    personalizedTips: computed(() => personalizedTips.value),

    // History and saved searches
    searchHistory: computed(() => searchHistory.value),
    savedSearches: computed(() => savedSearches.value),

    // Suggestions
    searchSuggestions: computed(() => searchSuggestions.value),
    quickSuggestions: computed(() => quickSuggestions.value),

    // Computed
    hasSearchResults,
    hasInsights,
    searchProgress,
    topMatches,
    searchStats,

    // Methods
    performAISearch,
    getSearchSuggestions,
    analyzeSalaryRange,
    getPersonalizedRecommendations,
    handleInsightAction,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    clearSearchResults,
  };
}
