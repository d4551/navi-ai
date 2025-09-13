import { canonicalJobService } from "@/services/jobs";
import { logger } from "@/shared/utils/logger";

export interface ProviderVerification {
  provider: string;
  ok: boolean;
  count: number;
  sample?: string;
  error?: string;
}

export interface AggregationVerification {
  ok: boolean;
  total: number;
  sources: string[];
  bySource: Record<string, number>;
}

// Verifies the canonical provider registry by performing one aggregated search.
export async function verifyAggregation(
  query = "game",
): Promise<AggregationVerification> {
  try {
    const res = await canonicalJobService.searchJobs({ query, remote: true });
    const bySource: Record<string, number> = {};
    for (const job of res.jobs) {
      const key = (job as any).source || "unknown";
      bySource[key] = (bySource[key] || 0) + 1;
    }
    return {
      ok: res.jobs.length > 0,
      total: res.jobs.length,
      sources: Array.from(new Set(res.sources || Object.keys(bySource))),
      bySource,
    };
  } catch (e: any) {
    logger.error("Aggregation verification failed:", e);
    return { ok: false, total: 0, sources: [], bySource: {} };
  }
}

// Directly hits open endpoints to validate CORS/network and ingestion mapping.
export async function verifyDirectOpenEndpoints(
  query = "game",
): Promise<ProviderVerification[]> {
  const results: ProviderVerification[] = [];

  // RemoteOK (no search param; client-side filter)
  try {
    const r = await fetch("https://remoteok.io/api");
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const arr = Array.isArray(data) ? data.slice(1) : [];
    const filtered = arr.filter((j: any) =>
      `${j.position} ${j.description}`.toLowerCase().includes(query),
    );
    results.push({
      provider: "RemoteOK",
      ok: filtered.length > 0,
      count: filtered.length,
      sample: filtered[0]?.position,
    });
  } catch (e: any) {
    results.push({
      provider: "RemoteOK",
      ok: false,
      count: 0,
      error: e?.message || "network",
    });
  }

  // Remotive
  try {
    const u = new URL("https://remotive.com/api/remote-jobs");
    u.searchParams.set("category", "software-dev");
    u.searchParams.set("search", query);
    const r = await fetch(u.toString());
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
    results.push({
      provider: "Remotive",
      ok: jobs.length > 0,
      count: jobs.length,
      sample: jobs[0]?.title,
    });
  } catch (e: any) {
    results.push({
      provider: "Remotive",
      ok: false,
      count: 0,
      error: e?.message || "network",
    });
  }

  // ArbeitsNow
  try {
    const u = new URL("https://www.arbeitnow.com/api/job-board-api");
    u.searchParams.set("search", query);
    const r = await fetch(u.toString());
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const jobs = Array.isArray(data?.data) ? data.data : [];
    results.push({
      provider: "ArbeitsNow",
      ok: jobs.length > 0,
      count: jobs.length,
      sample: jobs[0]?.title,
    });
  } catch (e: any) {
    results.push({
      provider: "ArbeitsNow",
      ok: false,
      count: 0,
      error: e?.message || "network",
    });
  }

  // WeWorkRemotely RSS (programming)
  try {
    const r = await fetch(
      "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const xml = await r.text();
    const matches = (xml.match(/<item>/g) || []).length;
    results.push({
      provider: "WeWorkRemotely",
      ok: matches > 0,
      count: matches,
      sample: "RSS feed items: " + matches,
    });
  } catch (e: any) {
    results.push({
      provider: "WeWorkRemotely",
      ok: false,
      count: 0,
      error: e?.message || "network",
    });
  }

  return results;
}
