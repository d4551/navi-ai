
import { ref, computed, watchonUnmounted } from "vue";
import { useUnifiedProfile } from "@/composables/useUnifiedProfile";
import { canonicalJobService } from "@/services/jobs";
import type { Job, JobFilters } from "@/shared/types/jobs";
import { logger } from "@/shared/utils/logger";
import { unifiedStorage } from "@/utils/storage";

export interface JobBoardState {
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  lastUpdated: Date | null;
  totalJobs: number;
  sources: string[];
}

export interface JobSearchFilters extends JobFilters {
  gamingOnly?: boolean;
  savedJobsOnly?: boolean;
  matchingScore?: number;
  datePosted?: "today" | "week" | "month" | "all";
}

  // State
  const state = ref<JobBoardState>({
    isLoading: false,
    isSearching: false,
    error: null,
    lastUpdated: null,
    sources: [],
  });

  const jobs = ref<Job[]>([]);
  const filteredJobs = ref<Job[]>([]);
  const savedJobs = ref<Job[]>([]);
  const currentFilters = ref<JobSearchFilters>({});

  // Services
  const unifiedProfile = useUnifiedProfile();
  const refactoredJobService = canonicalJobService;

  // Profile-based suggestions
  const profileSuggestions = computed(() => {
    const profile = unifiedProfile.jobSearchProfile.value;
    if (!profile) return [];

    const suggestions = [];

    // Add preferred roles
    if (profile.preferredRoles?.length) {
    }

    // Add skill-based searches
    if (profile.skills?.technical?.length) {
      suggestions.push(`${topSkills.join(" ")} developer`);
    }

    // Add gaming-specific suggestions
    if (profile.skills?.gaming?.length) {
    }

  });

  // Computed properties
  const totalJobs = computed(() => filteredJobs.value.length);
  const gamingJobsCount = computed(
    () =>
      filteredJobs.value.filter((job) => job.categories?.includes('gaming'))
        .length,
  );
  const averageSalary = computed(() => {
    const jobsWithSalary = filteredJobs.value.filter((job) => job.salary);

    const salaries = jobsWithSalary
      .map((job) => extractSalaryNumber(job.salary))

  });

  const topMatches = computed(() => {
    const profile = unifiedProfile.jobSearchProfile.value;
    if (!profile) return [];

    return filteredJobs.value
      .map((job) => ({
        ...job,
        matchScore: calculateJobMatchScore(job, profile),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
  });

  const searchJobs = async (filters: JobSearchFilters = {}) => {
    try {
      state.value.isSearching = true;
      state.value.error = null;
      currentFilters.value = { ...filters };

      logger.info("Starting job search with filters:", filters);

      // Canonical path: provider registry only
      const refactoredResults = await searchRefactoredJobs(filters);
      let allJobs: Job[] = [];
        allJobs.push(...refactoredResults.jobs);
        state.value.sources.push(...refactoredResults.sources);
        logger.info(
          `Added ${refactoredResults.jobs.length} jobs from provider registry`,
        );
      }

      // Remove duplicates based on title and company
      allJobs = deduplicateJobs(allJobs);

      jobs.value = allJobs;
      state.value.totalJobs = allJobs.length;
      state.value.lastUpdated = new Date();

      // Apply additional filtering
      applyFilters(filters);

      logger.info(
        `Job search completed: ${allJobs.length} total jobs, ${filteredJobs.value.length} after filtering`,
      );
    } catch (_error) {
      logger.error("Job search failed:", error);
      state.value.error =
        error instanceof Error ? error.message : "Job search failed";
    } finally {
      state.value.isSearching = false;
    }
  };

  const searchRefactoredJobs = async (filters: JobSearchFilters) => {
    try {
      return await refactoredJobService.searchJobs(filters);
    } catch (_error) {
      logger.warn("Refactored service search failed:", error);
      return {
        jobs: [],
        sources: [],
        errors: [error.message],
      };
    }
  };

  const applyFilters = (filters: JobSearchFilters) => {
    let filtered = [...jobs.value];

    // Gaming filter
    if (filters.gamingOnly) {
    }

    // Saved jobs filter
    if (filters.savedJobsOnly) {
      const savedJobIds = savedJobs.value.map((job) => job.id);
      filtered = filtered.filter((job) => savedJobIds.includes(job.id));
    }

    // Date posted filter
    if (filters.datePosted && filters.datePosted !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.datePosted) {
        case "today":
          break;
        case "week":
          break;
        case "month":
          break;
      }

      filtered = filtered.filter(
        (job) => job.postedDate && new Date(job.postedDate) >= cutoffDate,
      );
    }

    // Matching score filter
    if (filters.matchingScore && unifiedProfile.jobSearchProfile.value) {
      filtered = filtered.filter((job) => {
        const score = calculateJobMatchScore(
          job,
          unifiedProfile.jobSearchProfile.value!,
        );
      });
    }

    // Sort by relevance (gaming relevance + match score + recency)
    filtered.sort((a, b) => {
      const profile = unifiedProfile.jobSearchProfile.value;


      if (profile) {
      }

      // Add recency bonus
      const daysSinceA = a.postedDate
        ? (Date.now() - new Date(a.postedDate).getTime()) /
      const daysSinceB = b.postedDate
        ? (Date.now() - new Date(b.postedDate).getTime()) /


      return scoreB - scoreA;
    });

    filteredJobs.value = filtered;
  };

  // Job management
  const saveJob = async (job: Job) => {
    if (savedJobs.value.find((saved) => saved.id === job.id)) return;

    savedJobs.value.push(job);
    await persistSavedJobs();
    logger.info(`Saved job: ${job.title} at ${job.company}`);
  };

  const unsaveJob = async (jobId: string) => {
    const index = savedJobs.value.findIndex((job) => job.id === jobId);
      const job = savedJobs.value[index];
      await persistSavedJobs();
      logger.info(`Unsaved job: ${job.title} at ${job.company}`);
    }
  };

  const isJobSaved = (jobId: string) => {
    return savedJobs.value.some((job) => job.id === jobId);
  };

  // Auto search based on profile
  const autoSearchFromProfile = async () => {
    const profile = unifiedProfile.jobSearchProfile.value;
    if (!profile) return;

    const filters: JobSearchFilters = {
      location: profile.location || undefined,
      remote: profile.remotePreference || undefined,
    };

    // Use preferred roles or skills for search query
    if (profile.preferredRoles?.length) {
    } else if (profile.skills?.technical?.length) {
    }

    await searchJobs(filters);
  };

  // Real-time updates
  let autoRefreshInterval: NodeJS.Timeout | null = null;

    // Clear any existing interval
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(
      async () => {
        if (
          currentFilters.value.query ||
        ) {
          logger.info("Auto-refreshing job search");
          await searchJobs(currentFilters.value);
        }
      },
    );
  };

  onUnmounted(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  });

  const deduplicateJobs = (jobs: Job[]): Job[] => {
    const seen = new Set<string>();
    return jobs.filter((job) => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const extractSalaryNumber = (salaryString?: string): number => {

    const numbers = salaryString.match(/[\d,]+/g);

  };

  const calculateJobMatchScore = (job: Job, profile: any): number => {

    // Skills match
    if (profile.skills?.technical?.length && job.tags?.length) {
      const skillMatches = profile.skills.technical.filter((skill: string) =>
        job.tags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())),
      ).length;
      score +=
    }

    // Location match
    if (profile.location && job.location) {
      if (job.remote && profile.remotePreference) {
      } else if (
        job.location.toLowerCase().includes(profile.location.toLowerCase())
      ) {
      }
    }

    // Experience level match (basic heuristic)
    if (profile.experience?.length) {
      const totalYears = profile.experience.reduce((sum: number, exp: any) => {
        const years = exp.endDate
          ? (new Date(exp.endDate) - new Date(exp.startDate)) /
          : (new Date() - new Date(exp.startDate)) /
        return sum + years;

      const jobTitle = job.title.toLowerCase();
      if (
        (jobTitle.includes("senior") || jobTitle.includes("lead"))
      ) {
      } else if (
        !jobTitle.includes("senior")
      ) {
      }
    }

    // Gaming relevance bonus
    }

  };

  // Persistence
  const loadSavedJobs = async () => {
    try {
      const saved = await unifiedStorage.getItem("saved-jobs");
      if (saved && Array.isArray(saved)) {
        savedJobs.value = saved;
      }
    } catch (_error) {
      logger.warn("Failed to load saved jobs:", error);
    }
  };

  const persistSavedJobs = async () => {
    try {
      await unifiedStorage.setItem("saved-jobs", savedJobs.value);
    } catch (_error) {
      logger.warn("Failed to persist saved jobs:", error);
    }
  };

  // Provider management
  const getProviderStatus = async () => {
    try {
      return refactoredJobService.getProviderStatus();
    } catch (_e) {
      logger.warn("Provider status unavailable:", e);
      return [];
    }
  };

  const refreshProviders = () => {
    try {
      refactoredJobService.clearCache();
    } catch (_e) {
      logger.warn("Provider cache clear failed (non-critical):", e);
    }
  };

  // Profile sync integration
  watch(
    () => unifiedProfile.jobSearchProfile.value,
    async (newProfile) => {
      if (newProfile && !jobs.value.length) {
        // Auto-search when profile is available and no jobs loaded
        await autoSearchFromProfile();
      } else if (newProfile && jobs.value.length) {
        // Re-apply filters with new profile data
        applyFilters(currentFilters.value);
      }
    },
    { deep: true },
  );

  // Initialization
  onMounted(async () => {
    await loadSavedJobs();
    // Start auto-refresh if enabled
    // Auto-search with profile when available
    if (unifiedProfile.jobSearchProfile.value) {
      await autoSearchFromProfile();
    }
    // Fallback: ensure we load live jobs even without a profile
    setTimeout(async () => {
      if (!jobs.value.length && !state.value.isSearching) {
        try {
          await searchJobs({ query: "game", remote: true });
        } catch {}
      }
  });

  return {
    // State
    state,
    jobs,
    filteredJobs,
    savedJobs,
    currentFilters,

    // Computed
    totalJobs,
    gamingJobsCount,
    averageSalary,
    topMatches,
    profileSuggestions,

    // Actions
    searchJobs,
    autoSearchFromProfile,
    saveJob,
    unsaveJob,
    isJobSaved,

    // Utilities
    getProviderStatus,
    refreshProviders,

    // Loading states
    isLoading: computed(() => state.value.isLoading),
    isSearching: computed(() => state.value.isSearching),
    error: computed(() => state.value.error),
    lastUpdated: computed(() => state.value.lastUpdated),
  };
}

export default useJobBoard;
