import { ref, computed } from "vue";
import type { Job, JobFilters } from "@/shared/types/jobs";
import { canonicalJobService as jobAPI } from "@/services/jobs";
import { jobSourceManager } from "@/services/JobSourceManager";
import { logger } from "@/shared/utils/logger";

export function useJobs(initial: Partial<JobFilters> = {}) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const jobs = ref<Job[]>([]);
  const sources = ref<string[]>([]);
  const total = ref(0);
  const processingTime = ref(0);
  const filters = ref<JobFilters>({
    title: initial.title || "",
    location: initial.location || "",
    jobType: initial.jobType,
    remote: initial.remote,
    experienceLevel: initial.experienceLevel,
    query: initial.query,
    limit: initial.limit || 50,
  });

  const sourceStats = computed(() => jobSourceManager.getSourceStats());
  const sourcesList = computed(() => jobSourceManager.getAllSources());

  async function search(overrides: Partial<JobFilters> = {}) {
    loading.value = true;
    error.value = null;
    try {
      const f: JobFilters = { ...filters.value, ...overrides };
      const result = await jobAPI.searchJobs(f);
      jobs.value = result.jobs;
      sources.value = result.sources;
      total.value = result.totalFound;
      processingTime.value = result.processingTime;
      filters.value = f;
      return true;
    } catch (e: any) {
      const msg = e?.message || "Job search failed";
      logger.error("Unified job search failed", e, "useJobs");
      error.value = msg;
      jobs.value = [];
      total.value = 0;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    jobs,
    sources,
    total,
    processingTime,
    filters,
    search,
    sourceStats,
    sourcesList,
  };
}

export default useJobs;
