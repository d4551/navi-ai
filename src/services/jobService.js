// Legacy jobService.js shim
// Bridges existing imports to the refactored provider-based Job API

// Canonical job service re-export
import { canonicalJobService as refactoredJobAPIService } from "@/services/jobs";

export async function searchJobs(params = {}) {
  // Map legacy params to JobFilters minimally
  const filters = {
    query: params.query || params.q || "",
    location: params.location || "",
    remote: params.remote ?? undefined,
    experience: params.experience || undefined,
    sources: params.sources || undefined,
    regions: params.regions || undefined,
    categories: params.categories || undefined,
  };

  const res = await refactoredJobAPIService.searchJobs(filters);
  return {
    jobs: res.jobs || [],
    totalResults:
      typeof res.totalFound === "number"
        ? res.totalFound
        : res.jobs?.length || 0,
    sources: res.sources || [],
    errors: res.errors || [],
    fetchedAt: new Date().toISOString(),
  };
}

export function getJobSources() {
  try {
    const providers = refactoredJobAPIService.getAllProviders();
    return providers.map((p) => ({
      id: p.name,
      name: p.name,
      description: p.description || "",
      enabled: true,
    }));
  } catch {
    return [];
  }
}

export async function testJobSource(sourceId) {
  try {
    const provider = refactoredJobAPIService.getProvider(sourceId);
    if (!provider) {
      return { success: false, error: "Unknown provider" };
    }
    await provider.fetchJobs({ query: "game", location: "", remote: true });
    return { success: true, jobCount: 1, message: "OK" };
  } catch (_e) {
    return { success: false, error: e?.message || "Failed" };
  }
}

export function getAllRegions() {
  // Minimal static set; extend as needed
  return ["US", "EU", "UK", "CA", "Remote"];
}

export function getAllCategories() {
  return ["Engineering", "Design", "Art", "Production", "Audio", "QA"];
}

// Update or toggle a job source/provider configuration (shim over provider registry)
export function updateJobSourceConfig(sourceId, config = {}) {
  try {
    return refactoredJobAPIService.updateProviderConfig(sourceId, config);
  } catch (_e) {
    console.warn("Failed to update job source config:", e?.message || e);
    return false;
  }
}
